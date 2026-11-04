#!/usr/bin/env python3
"""fx_extrude_text.py - Zyqor Motion Kit v5.5: heavy extruded WARM text with glow, bevel highlight and human imperfection.
(Sujon, Nov 4 2026: glow is wanted on big words, fonts like the references: heavy bold display, red/gold/yellow extruded words.)
Pure Python (Pillow + numpy [+ fontTools/brotli only to open a .woff2]). NOT Blender. Output = transparent PNG you place in
EffectCraft / ffmpeg / Python (behind the head, on a card, in a UI scene).

  python3 fx_extrude_text.py "KAHANI" out.png --preset red
  python3 fx_extrude_text.py "DEAD" out.png --font ../fonts/ArchivoBlack-400.woff2 --size 300 --preset gold --rotate -3
  python3 fx_extrude_text.py "UP" out_dir/up --preset yellow --per-letter      # one PNG per letter (+ layout.json) for stagger pops

Options: --preset red|gold|yellow|cream|orange   --depth 18 (px)  --angle 40 (extrusion direction, deg, 0=right 90=down)
         --glow 0.55 (0 = off; warm glow only)  --rotate deg  --jitter SEED (random +-1.5 deg per letter, +-3 % size, 1-2 px offsets)
         --grain 0.05  --stroke 0 (px outline)  --pad 80  --list-presets
Banned (kit rule): purple/violet/blue/cyan hues 175-320 deg are refused for --face/--side/--glow-color.
"""
import argparse, json, os, sys, math, tempfile, random
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops

PRESETS = {  # face top, face bottom, side near, side far, glow, highlight
    "red":    ("#FF5A3C", "#C4161C", "#8E0F14", "#2A0507", "#FF7A2F", "#FFD9C9"),
    "gold":   ("#FFE27A", "#E0A12A", "#A8641A", "#3A1F06", "#FFB347", "#FFF6D6"),
    "yellow": ("#FFE45C", "#FFC21A", "#C48200", "#4A2D00", "#FFC94D", "#FFFBD1"),
    "orange": ("#FFB066", "#F26A1B", "#A2400C", "#3A1503", "#FF8A3D", "#FFE3CC"),
    "cream":  ("#FFF6E6", "#EAD7B5", "#B8956B", "#4D3A24", "#FFD9A0", "#FFFFFF"),
}
DEFAULT_FONTS = ["ArchivoBlack-400.woff2", "../fonts/ArchivoBlack-400.woff2", "fonts/ArchivoBlack-400.woff2",
                 "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"]

def hx(h):
    h = h.lstrip("#"); return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def hue_banned(rgb):
    r, g, b = [v/255 for v in rgb]; mx, mn = max(r, g, b), min(r, g, b); d = mx-mn
    if d == 0: return False
    h = (60*(((g-b)/d) % 6) if mx == r else 60*((b-r)/d+2) if mx == g else 60*((r-g)/d+4))
    s = d/mx
    return 175 <= h <= 320 and s >= 0.45 and mx >= 0.35

def load_font(path, size):
    cands = [path] if path else []
    here = os.path.dirname(os.path.abspath(__file__))
    cands += [os.path.join(here, p) if not p.startswith("/") else p for p in DEFAULT_FONTS]
    for p in cands:
        if not p or not os.path.exists(p): continue
        if p.lower().endswith(".woff2") or p.lower().endswith(".woff"):
            try:
                from fontTools.ttLib import TTFont
                f = TTFont(p); f.flavor = None
                tmp = os.path.join(tempfile.gettempdir(), "zq_" + os.path.basename(p) + ".ttf"); f.save(tmp)
                return ImageFont.truetype(tmp, size), p
            except Exception as e:
                print("note: cannot open", p, "(pip install fonttools brotli):", e, file=sys.stderr); continue
        return ImageFont.truetype(p, size), p
    return ImageFont.load_default(), "PIL default (no TrueType font found)"

def vgrad(h, w, top, bot):
    t = np.linspace(0, 1, h)[:, None, None]
    a = np.array(top, float)[None, None, :]; b = np.array(bot, float)[None, None, :]
    return np.repeat(a*(1-t)+b*t, w, axis=1)

def render(text, font_path, size, preset, depth, angle, glow, rotate, seed, grain, stroke, pad, face=None, side=None, glow_color=None):
    P = list(PRESETS[preset])
    if face: P[0] = P[1] = face
    if side: P[2] = side
    if glow_color: P[4] = glow_color
    for c in (P[0], P[1], P[2], P[4]):
        if hue_banned(hx(c)): raise SystemExit("refused: %s is purple/violet/blue/cyan (banned hue 175-320 deg)" % c)
    rnd = random.Random(seed) if seed is not None else None
    font, used = load_font(font_path, size)
    tmp = Image.new("L", (10, 10)); d = ImageDraw.Draw(tmp)
    bb = d.textbbox((0, 0), text, font=font, stroke_width=stroke)
    tw, th = bb[2]-bb[0], bb[3]-bb[1]
    W, H = tw + 2*pad + depth*2, th + 2*pad + depth*2
    mask = Image.new("L", (W, H), 0)
    ImageDraw.Draw(mask).text((pad - bb[0], pad - bb[1]), text, font=font, fill=255, stroke_width=stroke, stroke_fill=255)
    if rnd:  # human imperfection: roughen the edge slightly
        mask = mask.filter(ImageFilter.GaussianBlur(0.8)).point(lambda v: 255 if v > 118 else (0 if v < 90 else v))
    m = np.asarray(mask, float)/255
    dx, dy = math.cos(math.radians(angle)), math.sin(math.radians(angle))
    out = np.zeros((H, W, 4), float)
    # glow behind everything (warm only)
    if glow > 0:
        g = np.asarray(mask.filter(ImageFilter.GaussianBlur(max(6, size*0.09))), float)/255
        gc = np.array(hx(P[4]), float)
        out[..., :3] = gc; out[..., 3] = np.clip(g*glow*1.15, 0, 1)
    # extrusion: far -> near, colour from far (dark) to near
    sn, sf = np.array(hx(P[2]), float), np.array(hx(P[3]), float)
    for i in range(depth, 0, -1):
        sh = ImageChops.offset(mask, int(round(dx*i)), int(round(dy*i)))
        sa = np.asarray(sh, float)/255
        t = i/depth; col = sn*(1-t)+sf*t
        a = sa[..., None]; out[..., :3] = out[..., :3]*(1-a)+col*a; out[..., 3:] = np.maximum(out[..., 3:], a)
    # face: vertical gradient + bevel highlight along the lit edge + tiny texture
    face_rgb = vgrad(H, W, hx(P[0]), hx(P[1]))
    er = mask.filter(ImageFilter.MinFilter(max(3, (size//60)*2+1)))
    edge = np.clip(m - np.asarray(er, float)/255, 0, 1)
    # lit edge = top/left side only
    lit = np.asarray(ImageChops.offset(mask, int(round(dx*2)), int(round(dy*2))), float)/255
    rim = np.clip(m - lit, 0, 1)
    hi = np.array(hx(P[5]), float)
    face_rgb = face_rgb*(1-rim[..., None]*0.85) + hi*rim[..., None]*0.85
    face_rgb *= (1 - 0.18*(edge[..., None]*(1-rim[..., None])))   # darker inner edge opposite side
    if grain > 0:
        n = np.random.default_rng(seed or 1).normal(0, grain*255, (H, W, 1)); face_rgb = np.clip(face_rgb+n, 0, 255)
    a = m[..., None]; out[..., :3] = out[..., :3]*(1-a)+face_rgb*a; out[..., 3:] = np.maximum(out[..., 3:], a)
    out[..., 3] *= 255
    img = Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), "RGBA")
    if rotate: img = img.rotate(rotate, resample=Image.BICUBIC, expand=True)
    return img, used

def main():
    ap = argparse.ArgumentParser(description="Heavy extruded warm text PNG with glow (Zyqor Motion Kit v5.5)")
    ap.add_argument("text", nargs="?"); ap.add_argument("out", nargs="?")
    ap.add_argument("--font"); ap.add_argument("--size", type=int, default=220)
    ap.add_argument("--preset", default="red", choices=sorted(PRESETS)); ap.add_argument("--depth", type=int, default=18)
    ap.add_argument("--angle", type=float, default=40); ap.add_argument("--glow", type=float, default=0.55)
    ap.add_argument("--rotate", type=float, default=0); ap.add_argument("--jitter", type=int, default=None, help="seed for human imperfection")
    ap.add_argument("--grain", type=float, default=0.03); ap.add_argument("--stroke", type=int, default=0); ap.add_argument("--pad", type=int, default=80)
    ap.add_argument("--face"); ap.add_argument("--side"); ap.add_argument("--glow-color")
    ap.add_argument("--per-letter", action="store_true"); ap.add_argument("--list-presets", action="store_true")
    a = ap.parse_args()
    if a.list_presets:
        for k, v in PRESETS.items(): print(k, v)
        return
    if not a.text or not a.out: ap.error("text and out are required")
    rnd = random.Random(a.jitter) if a.jitter is not None else None
    if not a.per_letter:
        img, used = render(a.text, a.font, a.size, a.preset, a.depth, a.angle, a.glow, a.rotate + (rnd.uniform(-1.5, 1.5) if rnd else 0), a.jitter, a.grain, a.stroke, a.pad, a.face, a.side, a.glow_color)
        os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True); img.save(a.out); print("wrote", a.out, img.size, "font:", used); return
    os.makedirs(a.out, exist_ok=True); lay = []
    x = 0
    for i, ch in enumerate(a.text):
        if ch == " ": x += a.size*0.3; continue
        rot = a.rotate + (rnd.uniform(-2.2, 2.2) if rnd else 0); sc = 1 + (rnd.uniform(-0.03, 0.03) if rnd else 0)
        img, used = render(ch, a.font, int(a.size*sc), a.preset, a.depth, a.angle, a.glow, rot, (a.jitter or 0)+i, a.grain, a.stroke, a.pad, a.face, a.side, a.glow_color)
        fn = os.path.join(a.out, "l%02d_%s.png" % (i, ch if ch.isalnum() else "x")); img.save(fn)
        lay.append({"file": os.path.basename(fn), "char": ch, "x": round(x), "dy": round(rnd.uniform(-3, 3)) if rnd else 0, "rotate": round(rot, 2), "stagger_frames": i*3, "w": img.size[0], "h": img.size[1]})
        x += img.size[0] - 2*a.pad
    json.dump({"font": used, "letters": lay}, open(os.path.join(a.out, "layout.json"), "w"), indent=1); print("wrote", len(lay), "letters ->", a.out)

if __name__ == "__main__":
    main()
