#!/usr/bin/env python3
"""build_ref4.py — Zyqor Motion Kit v4, recipe for Sujon's REF 4 (@crafoo9 "ONE CLIP. TWO DIFFERENT EXPERIENCES" before/after showcase).
Layout measured from the ref: deep red radial vignette (#dd0002 centre -> #660000 edges), two stacked white rounded cards
labelled "Original" / "Edited" in a pixel font (white + black outline + shadow), faint pixel @handle watermark, the raw clip plays
in the top card first, then the edited version in the bottom card with sticker pops, end card "DM to / Edited by NAME / Hire me"
with a lime pixel "Hire". Our clips are vertical, so the cards are 858x640 (ref: 858x483 landscape) to keep the edit readable.
  python3 build_ref4.py --raw raw.mp4 --edited edited.mp4 --out work [--raw-in 0 --raw-len 8 --name ZYQOR --handle @zyqor.studio]
Writes work/comp_ref4.jsx (EffectCraft) + work/sfx_ref4.json + work/audio_plan.json; run_ref4.sh renders and mixes.
"""
import os, sys, json, glob, shutil, argparse, subprocess, math
from PIL import Image, ImageDraw, ImageFont, ImageFilter
HERE = os.path.dirname(os.path.abspath(__file__)); KIT = os.path.abspath(os.path.join(HERE, "..", ".."))
sys.path.insert(0, os.path.join(KIT, "templates", "explainer_soft3d_v4")); import build_ref1 as R1
F = KIT + "/blender/fonts/"; PIX = F + "PixelifySans-VF.ttf"            # OFL pixel font with lower case (ref: Minecraft-style "Original")
ap = argparse.ArgumentParser(); ap.add_argument("--raw", required=True); ap.add_argument("--edited", required=True); ap.add_argument("--out", required=True)
ap.add_argument("--raw-in", type=float, default=0.0); ap.add_argument("--raw-len", type=float, default=8.0)
ap.add_argument("--name", default="ZYQOR"); ap.add_argument("--handle", default="@zyqor.studio")
ap.add_argument("--sprites", default=os.path.join(KIT, "templates", "explainer_soft3d_v4", "renders"))
a = ap.parse_args(); OUT = os.path.abspath(a.out); G = os.path.join(OUT, "gen"); os.makedirs(G, exist_ok=True)
W, H, FPS = 1080, 1920, 30
CW, CH = 858, 640; TOP_Y, BOT_Y = 255 + CH // 2, 1005 + CH // 2          # card centres
def dur(p): return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p], capture_output=True, text=True).stdout)
ED = dur(a.edited)
T_POP, T_RAW = 0.0, 0.55; T_RAW_END = T_RAW + a.raw_len; T_ED = T_RAW_END + 0.35; T_ED_END = T_ED + ED; T_END = T_ED_END + 0.1; DUR = round(T_END + 3.0, 2)
def r(v): return round(v, 3)
def save(im, n): p = os.path.join(G, n); im.save(p); return p
def run(cmd): subprocess.run(["nice", "-n", "10", "timeout", "-k", "5", "600"] + cmd, check=True)

# ---------- pre-assemble the two card videos on the comp timeline (ffmpeg)
# raw: plain, untouched, height-fit with black bars (like a raw phone clip); edited: the edit, its main card area enlarged, blurred sides
run(["ffmpeg", "-v", "error", "-y", "-ss", str(a.raw_in), "-t", str(a.raw_len), "-i", a.raw, "-vf",
     f"fps={FPS},scale=-2:{CH},pad={CW}:{CH}:(ow-iw)/2:0:black,tpad=start_duration={T_RAW}:start_mode=clone:stop_duration={DUR}:stop_mode=clone,trim=duration={DUR}",
     "-an", "-c:v", "libx264", "-crf", "16", "-preset", "fast", "-pix_fmt", "yuv420p", os.path.join(OUT, "card_raw.mp4")])
run(["ffmpeg", "-v", "error", "-y", "-i", a.edited, "-filter_complex",
     f"[0:v]fps={FPS},crop=1000:1460:40:150,split[a][b];[b]scale={CW}:{CH}:force_original_aspect_ratio=increase,crop={CW}:{CH},gblur=sigma=30,eq=brightness=-0.12[bg];"
     f"[a]scale=-2:{CH}[fg];[bg][fg]overlay=(W-w)/2:0,tpad=start_duration={T_ED}:start_mode=clone:stop_duration={DUR}:stop_mode=clone,trim=duration={DUR}[v]",
     "-map", "[v]", "-an", "-c:v", "libx264", "-crf", "16", "-preset", "fast", "-pix_fmt", "yuv420p", os.path.join(OUT, "card_edited.mp4")])

# ---------- 2D assets
def radial_bg():
    import numpy as np
    y, x = np.mgrid[0:H, 0:W]; d = np.sqrt(((x - W / 2) / (W * 0.62)) ** 2 + ((y - H * 0.46) / (H * 0.55)) ** 2); d = np.clip(d, 0, 1) ** 1.4
    c0, c1 = np.array([221, 0, 2]), np.array([96, 0, 0]); im = c0 * (1 - d[..., None]) + c1 * d[..., None]
    return Image.fromarray(im.astype("uint8"), "RGB")
def card_png(fill=(255, 255, 255, 255)):
    pad = 60; im = Image.new("RGBA", (CW + 2 * pad, CH + 2 * pad), (0, 0, 0, 0)); sh = im.copy()
    ImageDraw.Draw(sh).rounded_rectangle((pad, pad + 16, pad + CW, pad + CH + 16), 44, fill=(40, 0, 0, 150)); im = Image.alpha_composite(im, sh.filter(ImageFilter.GaussianBlur(18)))
    ImageDraw.Draw(im).rounded_rectangle((pad, pad, pad + CW, pad + CH), 44, fill=fill); return im
def matte():
    im = Image.new("RGBA", (CW, CH), (0, 0, 0, 0)); ImageDraw.Draw(im).rounded_rectangle((0, 0, CW - 1, CH - 1), 44, fill=(255, 255, 255, 255)); return im
def pixel_text(txt, size, col=(255, 255, 255, 255), outline=8, shadow=True, alpha=255):
    f = ImageFont.truetype(PIX, size)
    try: f.set_variation_by_name("Bold")
    except Exception: pass
    d0 = ImageDraw.Draw(Image.new("RGBA", (8, 8))); x0, y0, x1, y1 = d0.textbbox((0, 0), txt, font=f, stroke_width=outline)
    pad = 30; im = Image.new("RGBA", (x1 - x0 + 2 * pad + 12, y1 - y0 + 2 * pad + 12), (0, 0, 0, 0))
    if shadow: ImageDraw.Draw(im).text((pad - x0 + 10, pad - y0 + 10), txt, font=f, fill=(0, 0, 0, 160), stroke_width=outline, stroke_fill=(0, 0, 0, 160))
    ImageDraw.Draw(im).text((pad - x0, pad - y0), txt, font=f, fill=col, stroke_width=outline, stroke_fill=(0, 0, 0, alpha) if outline else None)
    if alpha < 255: im.putalpha(im.getchannel("A").point(lambda v: v * alpha // 255))
    return im
A = dict(bg=save(radial_bg(), "bg.png"), card=save(card_png(), "card.png"), black=save(card_png((0, 0, 0, 255)), "card_black.png"), matte=save(matte(), "matte.png"),
         orig=save(pixel_text("Original", 74), "lab_orig.png"), edit=save(pixel_text("Edited", 74), "lab_edit.png"),
         wm=save(pixel_text(a.handle, 46, (120, 0, 0, 255), outline=0, shadow=False, alpha=150), "wm.png"),
         dm=save(pixel_text("DM to", 124), "end_dm.png"), by=save(pixel_text(f"Edited by {a.name}", 96), "end_by.png"),
         hire=save(pixel_text("Hire", 230, (190, 255, 60, 255), outline=12), "end_hire.png"), me=save(pixel_text("me", 140), "end_me.png"),
         sfxn=save(pixel_text("+SFX", 88, (190, 255, 60, 255)), "st_sfx.png"), fx3d=save(pixel_text("3D", 96, (190, 255, 60, 255)), "st_3d.png"),
         site=save(R1.follow_pill(), "st_follow.png"))
def sprite_seq(name, t0, t1):
    fr = sorted(glob.glob(os.path.join(a.sprites, "sp_" + name, "*.png")))
    if not fr: return None
    d = os.path.join(G, "sp_" + name); shutil.rmtree(d, ignore_errors=True); os.makedirs(d); blank = os.path.join(G, "blank.png")
    Image.new("RGBA", (8, 8), (0, 0, 0, 0)).save(blank)
    for i in range(int(DUR * FPS) + 1): os.symlink(fr[i % len(fr)], os.path.join(d, f"f_{i + 1:04d}.png"))
    return os.path.join(d, "f_0001.png")

# ---------- comp
o = [R1.JSX_HEAD % (W, H, FPS, DUR), 'var comp=app.project.items.addComp("Ref4",W,H,1,DUR,FPS);']
o.append(f'var bg=comp.layers.add(foot("{A["bg"]}",false));')
o.append(f'var wm=comp.layers.add(foot("{A["wm"]}",false));wm.property("Position").setValue([540,1780]);')
def pop(v, x, y, t0, t1, s=100, over=112, rot=0):
    out = (f'{v}.property("Position").setValue([{r(x)},{r(y)}]);keys({v}.property("Scale"),[[0,[0,0]],[{r(t0)},[0,0]],[{r(t0 + 0.14)},[{over},{over}]],[{r(t0 + 0.28)},[{s},{s}]]'
           + (f',[{r(t1 - 0.16)},[{s},{s}]],[{r(t1)},[0,0]]' if t1 < DUR else "") + '],60);')
    if rot: out += f'keys({v}.property("Rotation"),[[{r(t0)},{rot}],[{r(t0 + 0.3)},0]],50);'
    return out
OUTC = T_END                                    # cards leave when the end card comes
for nm, y, vid, under in (("top", TOP_Y, "card_raw.mp4", "black"), ("bot", BOT_Y, "card_edited.mp4", "card")):
    o.append(f'var c_{nm}=comp.layers.add(foot("{A["card"]}",false));{pop("c_" + nm, 540, y, 0.05 if nm == "top" else 0.15, OUTC, 100, 106)}')
    o.append(f'var u_{nm}=comp.layers.add(foot("{A[under]}",false));{pop("u_" + nm, 540, y, 0.05 if nm == "top" else 0.15, OUTC, 100, 106)}')
    t_on, t_off = (T_RAW, T_RAW_END + 0.05) if nm == "top" else (T_ED, T_ED_END + 0.05)
    o.append(f'var v_{nm}=comp.layers.add(foot("{os.path.join(OUT, vid)}",false));v_{nm}.property("Position").setValue([540,{y}]);'
             f'keys(v_{nm}.property("Opacity"),[[0,0],[{r(t_on - 0.12)},0],[{r(t_on)},100],[{r(t_off)},100],[{r(t_off + 0.18)},0]]);'
             f'var m_{nm}=comp.layers.add(foot("{A["matte"]}",false));m_{nm}.property("Position").setValue([540,{y}]);v_{nm}.setTrackMatte(m_{nm},TrackMatteType.ALPHA);')
    if nm == "top":   # the raw card turns white while the edit plays (as in the ref)
        o.append(f'keys(u_top.property("Opacity"),[[0,100],[{r(T_RAW_END + 0.05)},100],[{r(T_RAW_END + 0.25)},0]]);')
o.append(f'var lo=comp.layers.add(foot("{A["orig"]}",false));{pop("lo", 540, TOP_Y - CH / 2 - 52, 0.2, OUTC, 100, 118, -6)}')
o.append(f'var le=comp.layers.add(foot("{A["edit"]}",false));{pop("le", 540, BOT_Y - CH / 2 - 44, 0.32, OUTC, 100, 118, 6)}')
# sticker pops on the edited card (our own Blender 3D sprites + pixel words), ~every 1.8 s while the edit plays
pops = [("star", 0.5, 905, BOT_Y - 300, 46), ("pixel:sfxn", 2.2, 205, BOT_Y + 300, 100), ("tile_check", 4.0, 175, BOT_Y - 270, 44),
        ("coin", 5.8, 915, BOT_Y + 280, 44), ("pixel:fx3d", 7.6, 900, BOT_Y - 300, 100), ("tile_globe", 9.4, 170, BOT_Y + 270, 46)]
stick_t = []
for i, (nm, dt, x, y, s) in enumerate(pops):
    t0 = T_ED + dt; t1 = min(T_ED_END, t0 + 1.6)
    if t0 > T_ED_END - 0.3: continue
    src = A[nm.split(":")[1]] if nm.startswith("pixel:") else sprite_seq(nm, t0, t1)
    if not src: continue
    o.append(f'var sp{i}=comp.layers.add(foot("{src}",{str(not nm.startswith("pixel:")).lower()}));{pop(f"sp{i}", x, y, t0, t1, s, s * 1.25, -14 if i % 2 else 14)}'); stick_t.append(t0)
# end card
X0 = 110                                         # end card: left-aligned pixel lines like the ref ("DM to / Edited by CRAFOO / Hire me")
wh = {k: Image.open(A[k]).size for k in ("dm", "by", "hire", "me")}
place = [("dm", X0 + wh["dm"][0] / 2, 660, 0.1), ("by", X0 + wh["by"][0] / 2, 860, 0.45),
         ("hire", X0 + wh["hire"][0] / 2, 1110, 0.85), ("me", X0 + wh["hire"][0] - 40 + wh["me"][0] / 2, 1150, 1.0)]
for i, (k, x, y, dt) in enumerate(place):
    o.append(f'var e{i}=comp.layers.add(foot("{A[k]}",false));{pop(f"e{i}", x, y, T_END + dt, DUR + 1, 100, 125, -8 if i % 2 else 8)}')
o.append('var fin=comp.layers.addSolid([1,1,1],"FX",W,H,1);fin.adjustmentLayer=true;var ca=fx(fin,"VR Chromatic Aberrations");')
hits = [T_RAW_END + 0.2, T_END + 0.1, T_END + 0.85]
kr, kb = [[0, 0]], [[0, 0]]
for t in hits: kr += [[r(t - 0.001), 0], [r(t + 0.02), 24], [r(t + 0.12), 0]]; kb += [[r(t - 0.001), 0], [r(t + 0.02), -24], [r(t + 0.12), 0]]
o.append(f'keys(ca.property("Aberration (Red)"),{json.dumps(kr)});keys(ca.property("Aberration (Blue)"),{json.dumps(kb)});')
o.append(f'app.project.save(File("{OUT}/ref4.ecproj"));"ref4.ecproj saved";')
open(os.path.join(OUT, "comp_ref4.jsx"), "w").write("\n".join(o))
ev = [dict(t=0.05, sfx="pop", db=-8), dict(t=0.15, sfx="pop2", db=-8), dict(t=0.22, sfx="click", db=-10), dict(t=0.34, sfx="click", db=-10),
      dict(t=T_RAW_END + 0.2, sfx="whoosh", db=-8, lead=0.15), dict(t=T_ED, sfx="impact", db=-9)]
ev += [dict(t=t, sfx="pop" if i % 2 else "pop2", db=-11) for i, t in enumerate(stick_t)]
ev += [dict(t=T_END, sfx="whoosh2", db=-8, lead=0.15), dict(t=T_END + 0.1, sfx="pop", db=-7), dict(t=T_END + 0.45, sfx="pop2", db=-7),
       dict(t=T_END + 0.85, sfx="impact", db=-6), dict(t=T_END + 0.87, sfx="bass", db=-7), dict(t=T_END + 1.0, sfx="ding", db=-9)]
json.dump(sorted(ev, key=lambda e: e["t"]), open(os.path.join(OUT, "sfx_ref4.json"), "w"), indent=0)
json.dump(dict(DUR=DUR, T_RAW=T_RAW, T_RAW_END=T_RAW_END, T_ED=T_ED, T_ED_END=T_ED_END, T_END=T_END, raw_in=a.raw_in, raw_len=a.raw_len), open(os.path.join(OUT, "audio_plan.json"), "w"), indent=1)
print(f"comp_ref4.jsx: {DUR}s (raw {T_RAW}-{T_RAW_END}, edited {T_ED}-{r(T_ED_END)}, end card {r(T_END)})")
