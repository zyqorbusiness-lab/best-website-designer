#!/usr/bin/env python3
"""build_ref3.py — Zyqor Motion Kit v4, recipe for Sujon's REF 3 (@sanidhyadecodes "Grab my most used SFX" style talking head).
Input: a jump-cut talking-head clip (cut.mp4 from cut_pauses.py, already cleaned voice) + its word timings (cut.words.json).
Output: comp_ref3.jsx (EffectCraft: full-screen face hook with a real-3D Blender icon + glowing word -> face shrinks into a framed
rounded card over a blurred blue duotone copy, handle on top, PERMANENT 'Comment KEYWORD' line, then an effect + sfx every ~0.5 s:
punch-ins, emoji stickers, purple colour flashes, glowing scribble ring, B&W + grain + distressed word, stacked kinetic words,
green number pops, captions) + sfx_ref3.json. Everything is derived from the transcript, so a new clip needs no editing.
  python3 build_ref3.py --cut work/cut.mp4 --words work/cut.words.json --map work/cut.map.json --out work --keyword SITE
"""
import os, sys, json, math, re, glob, shutil, argparse, subprocess
from PIL import Image, ImageDraw, ImageFont, ImageFilter
HERE = os.path.dirname(os.path.abspath(__file__)); KIT = os.path.abspath(os.path.join(HERE, "..", ".."))
sys.path.insert(0, os.path.join(KIT, "templates", "explainer_soft3d_v4"))
import build_ref1 as R1
F = KIT + "/blender/fonts/"; EMOJI = os.environ.get("EMOJI_FONT", "/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf")   # Windows: C:/Windows/Fonts/seguiemj.ttf
ap = argparse.ArgumentParser()
ap.add_argument("--cut", required=True); ap.add_argument("--words", required=True); ap.add_argument("--map")
ap.add_argument("--out", required=True); ap.add_argument("--keyword", default="SITE")
ap.add_argument("--cta", default='Comment \u201c{kw}\u201d to get a FREE website (first 5 only)')
ap.add_argument("--handle", default="@zyqor.studio"); ap.add_argument("--hook", default=""); ap.add_argument("--icon", default="")
ap.add_argument("--face", default=""); ap.add_argument("--tail", type=float, default=2.4)
a = ap.parse_args()
OUT = os.path.abspath(a.out); G = os.path.join(OUT, "gen"); os.makedirs(G, exist_ok=True)
W, H, FPS = 1080, 1920, 30
words = json.load(open(a.words))
vdur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", a.cut], capture_output=True, text=True).stdout)
DUR = round(vdur + a.tail, 2)
CARD_W, CARD_H, CARD_Y = 900, 1240, 880
CYAN, GREEN = (124, 220, 255), (74, 222, 128)
def font(n, s): return ImageFont.truetype(n if n.startswith("/") else F + n, s)
def save(im, n): p = os.path.join(G, n); im.save(p); return p
def r(v): return round(v, 3)

# ---------- face position (for punch-ins / scribble ring): OpenCV Haar on a middle frame, else --face, else upper-centre
fx_, fy_ = 540, 640
if a.face: fx_, fy_ = [int(v) for v in a.face.split(",")]
else:
    HAAR = os.path.join(HERE, "assets", "haarcascade_frontalface_default.xml")
    DET = (f"import cv2,json;cap=cv2.VideoCapture({a.cut!r});cap.set(cv2.CAP_PROP_POS_MSEC,{vdur * 500});ok,fr=cap.read();"
           f"g=cv2.cvtColor(fr,cv2.COLOR_BGR2GRAY);cc=cv2.CascadeClassifier({HAAR!r});"
           "fs=cc.detectMultiScale(g,1.1,6,minSize=(120,120));f=max(fs,key=lambda f:f[2]*f[3]) if len(fs) else None;"
           "print(json.dumps(None if f is None else [int(f[0]+f[2]/2),int(f[1]+f[3]/2)]))")
    for py in (os.environ.get("PYTHON", "python3"), sys.executable):      # Haar cascades: the system cv2 build lacks them, the kernel venv has them
        try:
            res = json.loads(subprocess.run([py, "-c", DET], capture_output=True, text=True, timeout=60).stdout.strip().splitlines()[-1])
            if res: fx_, fy_ = res; break
        except Exception: pass
print("face at", fx_, fy_)
S_CARD = 83.0
def card_xy(x, y): return 540 + (x - 540) * S_CARD / 100, CARD_Y + (y - 960) * S_CARD / 100   # source px -> comp px (card mode)
FACE_C = card_xy(fx_, fy_)

# ---------- sentences from the transcript
def clean(w): return re.sub(r"[^\w'+\-]", "", w)
sents, cur = [], []
for w in words:
    cur.append(w)
    if re.search(r"[.!?]$", w["text"]): sents.append(cur); cur = []
if cur: sents.append(cur)
NUMW = {"one": "1", "two": "2", "three": "3", "four": "4", "five": "5", "ten": "10"}
hook = a.hook or " ".join(NUMW.get(clean(w["text"]).lower(), clean(w["text"])).upper() for w in sents[0][:2])
icon = a.icon or next((NUMW.get(clean(w["text"]).lower(), clean(w["text"])) for w in sents[0] if NUMW.get(clean(w["text"]).lower(), clean(w["text"])).isdigit()), "\u2605")

# ---------- 2D assets
def glow_text(txt, size, col, glow, fontn="ArchivoBlack-400.ttf", stroke=0, stroke_col=None, pad=60):
    f = font(fontn, size); d0 = ImageDraw.Draw(Image.new("RGBA", (8, 8))); x0, y0, x1, y1 = d0.textbbox((0, 0), txt, font=f, stroke_width=stroke)
    im = Image.new("RGBA", (x1 - x0 + 2 * pad, y1 - y0 + 2 * pad), (0, 0, 0, 0))
    if glow:
        g = Image.new("RGBA", im.size, (0, 0, 0, 0)); ImageDraw.Draw(g).text((pad - x0, pad - y0), txt, font=f, fill=glow, stroke_width=stroke + 2, stroke_fill=glow)
        im = Image.alpha_composite(im, g.filter(ImageFilter.GaussianBlur(18))); im = Image.alpha_composite(im, g.filter(ImageFilter.GaussianBlur(6)))
    ImageDraw.Draw(im).text((pad - x0, pad - y0), txt, font=f, fill=col, stroke_width=stroke, stroke_fill=stroke_col or col); return im
def outline_text(txt, size, col, fontn="BricolageGrotesque-800.ttf", pad=50):
    f = font(fontn, size); d0 = ImageDraw.Draw(Image.new("RGBA", (8, 8))); x0, y0, x1, y1 = d0.textbbox((0, 0), txt, font=f, stroke_width=4)
    im = Image.new("RGBA", (x1 - x0 + 2 * pad, y1 - y0 + 2 * pad), (0, 0, 0, 0)); g = im.copy()
    ImageDraw.Draw(g).text((pad - x0, pad - y0), txt, font=f, fill=(0, 0, 0, 0), stroke_width=4, stroke_fill=col + (255,))
    im = Image.alpha_composite(im, g.filter(ImageFilter.GaussianBlur(10))); return Image.alpha_composite(im, g)
def sticker(ch, size=250):
    try:
        e = Image.new("RGBA", (160, 160), (0, 0, 0, 0)); ImageDraw.Draw(e).text((8, 8), ch, font=ImageFont.truetype(EMOJI, 109), embedded_color=True)
        e = e.crop(e.getbbox()).resize((size, size), Image.LANCZOS)
    except Exception: e = glow_text(ch, 200, (255, 255, 255, 255), None)
    pad = 30; im = Image.new("RGBA", (e.width + 2 * pad, e.height + 2 * pad), (0, 0, 0, 0)); im.paste(e, (pad, pad), e)
    al = im.getchannel("A").filter(ImageFilter.MaxFilter(25)); white = Image.new("RGBA", im.size, (255, 255, 255, 255)); white.putalpha(al)
    sh = Image.new("RGBA", im.size, (0, 0, 0, 0)); sh.putalpha(al.filter(ImageFilter.GaussianBlur(10)).point(lambda v: v * 0.45))
    out = Image.new("RGBA", (im.width + 20, im.height + 20), (0, 0, 0, 0)); out.alpha_composite(sh, (10, 18)); out.alpha_composite(white, (10, 10)); out.alpha_composite(im, (10, 10)); return out
def scribble_frames(w, h, n=9):
    """Hand-drawn glowing white double ring around the head, written on over n frames."""
    pts = []
    import random; random.seed(3)
    for k in range(int(2.15 * 90)):
        t = k / 90 * 2 * math.pi; jit = 1 + 0.04 * math.sin(t * 3.0) + random.uniform(-0.01, 0.01)
        pts.append((w / 2 + (w / 2 - 30) * jit * math.cos(t - 1.9), h / 2 + (h / 2 - 30) * jit * 1.0 * math.sin(t - 1.9) + k * 0.12))
    fr = []
    for i in range(1, n + 1):
        m = max(2, int(len(pts) * i / n)); im = Image.new("RGBA", (w, h), (0, 0, 0, 0)); g = im.copy()
        ImageDraw.Draw(g).line(pts[:m], fill=(200, 240, 255, 255), width=10, joint="curve")
        im = Image.alpha_composite(im, g.filter(ImageFilter.GaussianBlur(12))); im = Image.alpha_composite(im, g.filter(ImageFilter.GaussianBlur(4)))
        ImageDraw.Draw(im).line(pts[:m], fill=(255, 255, 255, 255), width=6, joint="curve"); fr.append(im)
    return fr
def distressed(txt, size=150):
    im = glow_text(txt, size, (255, 255, 255, 255), None, fontn="ArchivoBlack-400.ttf"); import random; random.seed(9)
    px = im.load()
    for _ in range(int(im.width * im.height * 0.035)):
        x, y = random.randrange(im.width), random.randrange(im.height); rr = random.randint(1, 4)
        for dx in range(-rr, rr):
            for dy in range(-rr, rr):
                if 0 <= x + dx < im.width and 0 <= y + dy < im.height: px[x + dx, y + dy] = (0, 0, 0, 0)
    return im
def card_frame():
    im = Image.new("RGBA", (CARD_W + 120, CARD_H + 120), (0, 0, 0, 0)); g = im.copy()
    ImageDraw.Draw(g).rounded_rectangle((60, 60, 60 + CARD_W, 60 + CARD_H), 62, outline=(90, 190, 255, 255), width=16)
    im = Image.alpha_composite(im, g.filter(ImageFilter.GaussianBlur(22)))
    ImageDraw.Draw(im).rounded_rectangle((60, 60, 60 + CARD_W, 60 + CARD_H), 62, outline=(255, 255, 255, 255), width=6); return im
def matte():
    im = Image.new("RGBA", (CARD_W, CARD_H), (0, 0, 0, 0)); ImageDraw.Draw(im).rounded_rectangle((0, 0, CARD_W - 1, CARD_H - 1), 62, fill=(255, 255, 255, 255)); return im
def cta_line(txt):
    f = font("Inter-700.ttf", 42); lines, curl = [], ""
    for wd in txt.split(" "):
        if ImageDraw.Draw(Image.new("RGB", (8, 8))).textlength((curl + " " + wd).strip(), font=f) > 900: lines.append(curl); curl = wd
        else: curl = (curl + " " + wd).strip()
    lines.append(curl); im = Image.new("RGBA", (980, 70 * len(lines) + 40), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    for i, l in enumerate(lines):
        lw = d.textlength(l, font=f); d.text(((980 - lw) / 2 + 2, 22 + i * 64), l, font=f, fill=(0, 0, 0, 140)); d.text(((980 - lw) / 2, 20 + i * 64), l, font=f, fill=(255, 255, 255, 255))
    return im
def caption_png(chunk):
    f = font("ArchivoBlack-400.ttf", 78); d0 = ImageDraw.Draw(Image.new("RGBA", (8, 8)))
    parts = [(w, CYAN if is_key(w) else (GREEN if re.search(r"\d", w) else (255, 255, 255))) for w in chunk]
    widths = [d0.textlength(w.upper(), font=f) for w, _ in parts]; sp = 22; tw = int(sum(widths) + sp * (len(parts) - 1))
    im = Image.new("RGBA", (tw + 80, 150), (0, 0, 0, 0)); sh = im.copy(); x = 40
    for (w, c), ww in zip(parts, widths):
        ImageDraw.Draw(sh).text((x + 3, 28 + 6), w.upper(), font=f, fill=(0, 0, 0, 200)); ImageDraw.Draw(im).text((x, 28), w.upper(), font=f, fill=c + (255,), stroke_width=3, stroke_fill=(0, 0, 0, 255)); x += ww + sp
    return Image.alpha_composite(sh.filter(ImageFilter.GaussianBlur(6)), im)
KEYS = {"photo": "\U0001F4F8", "picture": "\U0001F4F8", "repl": "\U0001F4AC", "message": "\U0001F4AC", "text": "\U0001F4AC", "review": "\u2B50", "star": "\u2B50",
        "sale": "\U0001F4B0", "money": "\U0001F4B0", "client": "\U0001F91D", "customer": "\U0001F91D", "website": "\U0001F4BB", "site": "\U0001F4BB",
        "double": "\U0001F4C8", "grow": "\U0001F4C8", "fast": "\u26A1", "google": "\U0001F50E", "free": "\U0001F381", "week": "\U0001F4C5"}
def is_key(w): return any(k in clean(w).lower() for k in KEYS)
def emoji_for(w):
    for k, e in KEYS.items():
        if k in clean(w).lower(): return e
    return None

# ---------- plan the edit from the transcript
first_end = sents[0][-1]["end"] if sents else 1.0
INTRO = max(0.9, min(1.3, first_end))           # full-screen hook until the first sentence ends (0.9-1.3 s)
SHRINK = 0.35
stacks, bws, nums, fills, caps = [], [], [], [], []
busy = [(0, INTRO + SHRINK)]
for s in sents[1:]:
    txt = " ".join(w["text"] for w in s); t0, t1 = s[0]["start"], s[-1]["end"]
    parts = [p.strip() for p in re.split(r",", txt) if p.strip()]
    if len(parts) >= 2 and all(len(p.split()) <= 3 for p in parts):
        lines = []; idx = 0
        for p in parts:
            pw = p.split(); pw = pw[1:] if pw[0].lower() == "and" else pw
            lines.append((" ".join(clean(x) for x in pw).upper(), s[idx + (1 if p.split()[0].lower() == "and" else 0)]["start"])); idx += len(p.split())
        stacks.append(dict(t0=t0, t1=t1 + 0.25, lines=lines)); busy.append((t0, t1 + 0.25))
    elif len(s) <= 2:
        bws.append(dict(t0=t0, t1=max(t1, t0 + 0.7), txt=re.sub(r"[^\w' .!?+]", "", txt).upper())); busy.append((t0, max(t1, t0 + 0.7)))
    for w in s:
        if re.fullmatch(r"\d+\+?", clean(w["text"])): nums.append(dict(t=w["start"], txt=clean(w["text"]) + ("+" if "over" in txt.lower() and w is s[-1] else "")))
def is_busy(t): return any(b0 - 0.05 <= t <= b1 for b0, b1 in busy)
cycle = ["punch", "sticker", "flash", "scribble", "sticker", "punch", "flash", "sticker"]
ci, last, scrib = 0, INTRO + SHRINK, 0
for w in words:
    t = w["start"]
    if t < INTRO + SHRINK + 0.1 or t - last < 0.48: continue
    kind = cycle[ci % len(cycle)]
    if kind == "scribble" and (scrib >= 1 or is_busy(t)): kind = "punch"
    e = emoji_for(w["text"])
    if kind == "sticker" and is_busy(t) and not e: kind = "flash"
    if e: kind = "sticker"                      # a keyword ("photos", "reviews", "sales") always gets its sticker
    fills.append(dict(t=t, kind=kind, emoji=e or ["\u2728", "\U0001F525", "\U0001F680", "\U0001F4AF"][ci % 4], word=w["text"]))
    if kind == "scribble": scrib += 1
    ci += 1; last = t
# captions: chunks of <=3 words, break on punctuation; hidden while a stack / B&W word is on screen
chunk = []
for w in words:
    if w["start"] < INTRO: continue
    chunk.append(w)
    if len(chunk) == 3 or re.search(r"[.,!?]$", w["text"]):
        t0, t1 = chunk[0]["start"], chunk[-1]["end"] + 0.06
        if not is_busy(t0): caps.append(dict(t0=t0, t1=t1, words=[clean(x["text"]) for x in chunk]))
        chunk = []
cuts = []
if a.map and os.path.exists(a.map):
    mp = json.load(open(a.map)); cuts = [seg[2] for seg in mp.get("segments", [])[1:]]

# ---------- per-frame transform of the face video (intro full-screen -> card, punch-ins, impact shake)
NFR = int(round(DUR * FPS))
def ease_out(x): x = min(1, max(0, x)); return 1 - (1 - x) ** 4
punches = [f["t"] for f in fills if f["kind"] in ("punch", "scribble")] + [s_["lines"][0][1] for s_ in stacks]
shakes = [l[1] for s_ in stacks for l in s_["lines"]] + [n["t"] for n in nums] + [b["t0"] for b in bws]
def fg_tf(t):
    k = ease_out((t - INTRO) / SHRINK); s = 100 + (S_CARD - 100) * k
    cy = 960 + (CARD_Y - 960) * k
    p = 1.0
    for tp in punches:
        d = t - tp
        if 0 <= d < 0.07: p = max(p, 1 + 0.13 * d / 0.07)
        elif 0.07 <= d < 0.5: p = max(p, 1 + 0.13 * (1 - ease_out((d - 0.07) / 0.43)))
    if t < INTRO: p *= 1 + 0.04 * t / INTRO           # slow push on the hook
    sx = sy = 0
    for ts in shakes:
        d = t - ts
        if 0 <= d < 0.3: amp = 14 * (1 - d / 0.3); sx += amp * math.sin(d * 95); sy += amp * math.cos(d * 83)
    # zoom around the face: keep the face where it was
    fxs, fys = (fx_ - 540) * s / 100, (fy_ - 960) * s / 100
    x = 540 + fxs - fxs * p; y = cy + fys - fys * p
    return s * p, x + sx, y + sy, k, sx, sy

# ---------- assets
A = {}
A["matte"] = save(matte(), "matte.png"); A["frame"] = save(card_frame(), "frame.png")
A["handle"] = save(glow_text(a.handle, 46, (255, 255, 255, 255), None, fontn="Inter-700.ttf", pad=20), "handle.png")
A["cta"] = save(cta_line(a.cta.format(kw=a.keyword)), "cta.png")
A["hook"] = save(glow_text(hook, 150, (170, 228, 255, 255), (30, 150, 255, 220), stroke=0), "hook.png")
for i, s_ in enumerate(stacks):
    for j, (ln, t) in enumerate(s_["lines"]):
        s_.setdefault("png", []).append(save(glow_text(ln, 124, (255, 255, 255, 255), None) if j % 2 == 0 else outline_text(ln, 124, CYAN), f"stack{i}_{j}.png"))
for i, b in enumerate(bws): b["png"] = save(distressed(b["txt"]), f"bw{i}.png")
for i, n in enumerate(nums): n["png"] = save(glow_text(n["txt"], 230, (190, 255, 210, 255), (34, 197, 94, 255), fontn="BricolageGrotesque-800.ttf"), f"num{i}.png")
for i, f_ in enumerate(fills):
    if f_["kind"] == "sticker": f_["png"] = save(sticker(f_["emoji"]), f"st{i}.png")
for i, c in enumerate(caps): c["png"] = save(caption_png(c["words"]), f"cap{i}.png")
SCR = os.path.join(G, "scribble"); shutil.rmtree(SCR, ignore_errors=True); os.makedirs(SCR)
blank = os.path.join(G, "blank.png"); Image.new("RGBA", (8, 8), (0, 0, 0, 0)).save(blank)
sfr = [save(im, f"scribble/src_{i}.png") for i, im in enumerate(scribble_frames(520, 600))]
scr_times = [f["t"] for f in fills if f["kind"] == "scribble"]
for i in range(NFR):
    t = i / FPS; src = blank
    for ts in scr_times:
        if ts <= t < ts + 1.1: src = sfr[min(len(sfr) - 1, int((t - ts) * FPS))]
    os.symlink(src, os.path.join(SCR, f"f_{i + 1:04d}.png"))
CB = os.path.join(G, "comment"); shutil.rmtree(CB, ignore_errors=True); os.makedirs(CB); cc = {}
for i in range(NFR):
    t = i / FPS - (vdur + 0.15); src = blank
    if t >= 0:
        k = min(len(a.keyword), int(max(0, t - 0.3) / 0.15)); caret = (int(t * 2.2) % 2 == 0) or k < len(a.keyword)
        if (k, caret) not in cc: cc[(k, caret)] = save(R1.comment_box(a.keyword[:k], caret), f"comment/src_{k}_{int(caret)}.png")
        src = cc[(k, caret)]
    os.symlink(src, os.path.join(CB, f"f_{i + 1:04d}.png"))
A["follow"] = save(R1.follow_pill(), "follow.png")
ICON = sorted(glob.glob(os.path.join(OUT, "sp_icon", "*.png")))
if ICON:
    ID = os.path.join(G, "icon"); shutil.rmtree(ID, ignore_errors=True); os.makedirs(ID)
    for i in range(NFR): os.symlink(ICON[i % len(ICON)], os.path.join(ID, f"f_{i + 1:04d}.png"))

# ---------- frozen tail for the end card (video only; audio comes from the mix)
FG = os.path.join(OUT, "fg.mp4")
subprocess.run(["nice", "-n", "10", "timeout", "-k", "5", "300", "ffmpeg", "-v", "error", "-y", "-i", a.cut, "-vf", f"fps={FPS},tpad=stop_mode=clone:stop_duration={a.tail + 0.2}",
                "-an", "-c:v", "libx264", "-crf", "14", "-preset", "fast", "-pix_fmt", "yuv420p", FG], check=True)

# ---------- EffectCraft JSX
o = [R1.JSX_HEAD % (W, H, FPS, DUR)]
o.append(f'var V=imp("{FG}",false);var comp=app.project.items.addComp("Ref3",W,H,1,DUR,FPS);')
# background: blurred, blue duotone copy of the same footage (ref 3)
o.append('var bg=comp.layers.add(V);bg.property("Scale").setValue([125,125]);var bgb=fx(bg,"Gaussian Blur");bgb.property("Blurriness").setValue(70);'
         'var bgt=fx(bg,"Tint");try{bgt.property("Map Black To").setValue(hex("#04102c"));bgt.property("Map White To").setValue(hex("#6fb0ff"));bgt.property("Amount to Tint").setValue(100);}catch(e){}')
fr = [fg_tf(i / FPS) for i in range(NFR + 1)]
sc = [[r(i / FPS), [r(f[0]), r(f[0])]] for i, f in enumerate(fr)]; ps = [[r(i / FPS), [r(f[1]), r(f[2])]] for i, f in enumerate(fr)]
# matte (card shape): covers the whole frame during the hook, then becomes the 900x1240 rounded card (moves with the shake)
msc, mps, fop = [], [], []
for i, f in enumerate(fr):
    k = f[3]; mx = 100 + (W / CARD_W * 100 * 1.02 - 100) * (1 - k); my = 100 + (H / CARD_H * 100 * 1.02 - 100) * (1 - k)
    msc.append([r(i / FPS), [r(mx), r(my)]]); mps.append([r(i / FPS), [r(540 + f[4]), r(960 + (CARD_Y - 960) * k + f[5])]])
o.append(f'var fg=comp.layers.add(V);keys(fg.property("Scale"),{json.dumps(sc)});keys(fg.property("Position"),{json.dumps(ps)});')
o.append(f'var mt=comp.layers.add(foot("{A["matte"]}",false));keys(mt.property("Scale"),{json.dumps(msc)});keys(mt.property("Position"),{json.dumps(mps)});fg.setTrackMatte(mt,TrackMatteType.ALPHA);')
o.append(f'var frm=comp.layers.add(foot("{A["frame"]}",false));keys(frm.property("Position"),{json.dumps(mps)});'
         f'keys(frm.property("Opacity"),[[0,0],[{r(INTRO + SHRINK * 0.6)},0],[{r(INTRO + SHRINK)},100]]);')
def pop(v, x, y, t0, t1, s=100, over=118, rot=0, ease=60):
    return (f'{v}.property("Position").setValue([{r(x)},{r(y)}]);keys({v}.property("Scale"),[[0,[0,0]],[{r(t0)},[0,0]],[{r(t0 + 0.12)},[{over},{over}]],[{r(t0 + 0.24)},[{s},{s}]],[{r(t1 - 0.1)},[{s},{s}]],[{r(t1)},[0,0]]],{ease});'
            + (f'keys({v}.property("Rotation"),[[{r(t0)},{rot}],[{r(t0 + 0.3)},0]],50);' if rot else ""))
o.append(f'var hd=comp.layers.add(foot("{A["handle"]}",false));{pop("hd", 540, 150, INTRO + 0.15, DUR + 1)}')
o.append(f'var ct=comp.layers.add(foot("{A["cta"]}",false));{pop("ct", 540, CARD_Y + CARD_H / 2 + 110, INTRO + 0.25, DUR + 1)}')
# hook: real 3D icon (Blender) + glowing word, over the full-screen face
if ICON: o.append(f'var ic=comp.layers.add(foot("{os.path.join(G, "icon", "f_0001.png")}",true));{pop("ic", 540, 1120, 0.0, INTRO + 0.12, 100, 125, -14)}')
o.append(f'var hk=comp.layers.add(foot("{A["hook"]}",false));{pop("hk", 540, 1430, 0.12, INTRO + 0.12, 100, 112)}var hkg=fx(hk,"Glow");try{{hkg.property("Glow Threshold").setValue(60);hkg.property("Glow Radius").setValue(30);}}catch(e){{}}')
o.append(f'var scr=comp.layers.add(foot("{os.path.join(SCR, "f_0001.png")}",true));scr.property("Position").setValue([{r(FACE_C[0])},{r(FACE_C[1] - 10)}]);scr.blendingMode=BlendingMode.ADD;')
for i, f_ in enumerate(fills):
    if f_["kind"] == "sticker":
        side = [(240, 1190), (850, 1160)][i % 2] if is_busy(f_["t"]) else [(250, 560), (840, 640), (230, 1180), (850, 1150)][i % 4]
        o.append(f'var st{i}=comp.layers.add(foot("{f_["png"]}",false));{pop(f"st{i}", side[0], side[1], f_["t"], min(DUR, f_["t"] + 0.95), 80, 105, -18 if i % 2 else 16)}')
for i, c in enumerate(caps):
    o.append(f'var cp{i}=comp.layers.add(foot("{c["png"]}",false));{pop(f"cp{i}", 540, CARD_Y + CARD_H / 2 - 160, c["t0"], c["t1"], 100, 108)}')
for i, s_ in enumerate(stacks):
    n = len(s_["lines"]); y0 = 800 - (n - 1) * 75
    for j, ((ln, t), png) in enumerate(zip(s_["lines"], s_["png"])):
        pw = Image.open(png).width - 100; k = min(100, 960 / pw * 100)          # every line fits 960 px (ref 3: big but inside the frame)
        o.append(f'var sk{i}_{j}=comp.layers.add(foot("{png}",false));{pop(f"sk{i}_{j}", 540, y0 + j * 150, t, s_["t1"], r(k), r(k * 1.3), 0, 80)}')
for i, b in enumerate(bws):
    o.append(f'var bw{i}=comp.layers.add(foot("{b["png"]}",false));{pop(f"bw{i}", 540, 1060, b["t0"], b["t1"], 100, 120, -6)}')
for i, n in enumerate(nums):
    o.append(f'var nm{i}=comp.layers.add(foot("{n["png"]}",false));{pop(f"nm{i}", 300 if i % 2 == 0 else 780, 470, n["t"], min(DUR, n["t"] + 1.0), 100, 125, -10 if i % 2 == 0 else 10)}')
o.append(f'var cbx=comp.layers.add(foot("{os.path.join(CB, "f_0001.png")}",true));cbx.property("Position").setValue([540,1230]);')
o.append(f'var fol=comp.layers.add(foot("{A["follow"]}",false));{pop("fol", 540, 1420, vdur + 1.25, DUR + 1, 90, 110)}')
# adjustment layers: purple colour flash, B&W + grain segments, RGB split hits, light grain
fl = [[0, 0]]
for f_ in fills:
    if f_["kind"] == "flash": t = f_["t"]; fl += [[r(t - 0.001), 0], [r(t + 0.01), 100], [r(t + 0.1), 100], [r(t + 0.14), 0]]
o.append(f'var fla=comp.layers.addSolid([1,1,1],"FX flash",W,H,1);fla.adjustmentLayer=true;var ft=fx(fla,"Tint");try{{ft.property("Map Black To").setValue(hex("#1b0838"));ft.property("Map White To").setValue(hex("#e7b8ff"));ft.property("Amount to Tint").setValue(100);}}catch(e){{}}keys(fla.property("Opacity"),{json.dumps(fl)});')
bwk = [[0, 0]]
for b in bws: bwk += [[r(b["t0"] - 0.001), 0], [r(b["t0"]), 100], [r(b["t1"]), 100], [r(b["t1"] + 0.001), 0]]
o.append(f'var bwa=comp.layers.addSolid([1,1,1],"FX bw",W,H,1);bwa.adjustmentLayer=true;fx(bwa,"Black & White");var bgr=fx(bwa,"Add Grain");try{{bgr.property(1).setValue(3);bgr.property(4).property("Intensity").setValue(1.2);}}catch(e){{}}keys(bwa.property("Opacity"),{json.dumps(bwk)});')
hits = sorted(set([r(t) for t in shakes + cuts + [INTRO]]))
kr, kb = [[0, 0]], [[0, 0]]
for t in hits: kr += [[r(t - 0.001), 0], [r(t + 0.02), 26], [r(t + 0.12), 0]]; kb += [[r(t - 0.001), 0], [r(t + 0.02), -26], [r(t + 0.12), 0]]
o.append(f'var rg=comp.layers.addSolid([1,1,1],"FX rgb",W,H,1);rg.adjustmentLayer=true;var ca=fx(rg,"VR Chromatic Aberrations");keys(ca.property("Aberration (Red)"),{json.dumps(kr)});keys(ca.property("Aberration (Blue)"),{json.dumps(kb)});')
o.append('var fin=comp.layers.addSolid([1,1,1],"FX finish",W,H,1);fin.adjustmentLayer=true;var vg=fx(fin,"CC Vignette");vg.property("Amount").setValue(18);')
o.append(f'app.project.save(File("{OUT}/ref3.ecproj"));"ref3.ecproj saved";')
open(os.path.join(OUT, "comp_ref3.jsx"), "w").write("\n".join(o))

# ---------- sfx: every visual event gets its own sound (ref 3: ~20 hits in 11 s)
ev = [dict(t=0.0, sfx="impact", db=-4), dict(t=0.03, sfx="pop", db=-8), dict(t=0.15, sfx="sweep_small", db=-11),
      dict(t=INTRO, sfx="whoosh_fast", db=-8, lead=0.12), dict(t=INTRO + 0.05, sfx="bass", db=-9)]
for f_ in fills:
    t = f_["t"]
    if f_["kind"] == "sticker": ev.append(dict(t=t, sfx="pop" if len(ev) % 2 else "pop2", db=-9))
    elif f_["kind"] == "flash": ev += [dict(t=t, sfx="glitch_text", db=-13), dict(t=t, sfx="bass", db=-12)]
    elif f_["kind"] == "punch": ev += [dict(t=t, sfx="whoosh_fast", db=-13, lead=0.08), dict(t=t + 0.02, sfx="bass", db=-11)]
    elif f_["kind"] == "scribble": ev += [dict(t=t, sfx="sweep_small", db=-9), dict(t=t + 0.05, sfx="riser", db=-18, dur=0.5)]
for s_ in stacks:
    for ln, t in s_["lines"]: ev += [dict(t=t, sfx="impact", db=-9), dict(t=t, sfx="whoosh2", db=-13, lead=0.1)]
for b in bws: ev += [dict(t=b["t0"], sfx="shutter", db=-8), dict(t=b["t0"] + 0.02, sfx="glitch_break", db=-14)]
for n in nums: ev += [dict(t=n["t"], sfx="ding", db=-10), dict(t=n["t"] + 0.03, sfx="cash" if "+" in n["txt"] else "pop", db=-12)]
for t in cuts: ev.append(dict(t=t, sfx="whoosh_fast", db=-16, lead=0.06))
ev += [dict(t=vdur + 0.15, sfx="pop", db=-8), dict(t=vdur + 0.45, sfx="typing", db=-10, dur=0.6), dict(t=vdur + 1.1, sfx="click", db=-8), dict(t=vdur + 1.25, sfx="notif", db=-9)]
ev.sort(key=lambda e: e["t"]); json.dump(ev, open(os.path.join(OUT, "sfx_ref3.json"), "w"), indent=0)
json.dump(dict(DUR=DUR, vdur=vdur, INTRO=INTRO, hook=hook, icon=icon, face=[fx_, fy_], stacks=[[l for l, _ in s_["lines"]] for s_ in stacks],
               bws=[b["txt"] for b in bws], nums=[n["txt"] for n in nums], fills=[(round(f_["t"], 2), f_["kind"]) for f_ in fills], caps=len(caps), sfx=len(ev)),
          open(os.path.join(OUT, "plan_ref3.json"), "w"), indent=1)
print(f"comp_ref3.jsx written: {DUR}s, {len(fills)} fill effects, {len(stacks)} stacks, {len(caps)} captions, {len(ev)} sfx ({len(ev) / DUR:.1f}/s)")
