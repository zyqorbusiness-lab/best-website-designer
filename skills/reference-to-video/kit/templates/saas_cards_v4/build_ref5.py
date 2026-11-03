#!/usr/bin/env python3
"""build_ref5.py — Zyqor Motion Kit v4, recipe for REF 5 (Jekay Valiente's After-Effects SaaS card promo): template "saas_card_grid".
Real 3D icons from Blender (sprites_v4.py tiles) on glossy UI cards that are AE-style 3D LAYERS in EffectCraft (threeDLayer + camera),
pastel mesh gradients, light-streak transitions on black, a tilted infinite grid of service cards drifting diagonally, a selection-box
headline, radial rays + 3D toggle finale, black end card. Zyqor Studio's real services; no numbers.
  python3 build_ref5.py  -> comp_ref5.jsx + sfx_ref5.json   (sprites in ../explainer_soft3d_v4/renders/sp_*)
"""
import os, sys, json, math, glob, shutil
from PIL import Image, ImageDraw, ImageFont, ImageFilter
HERE = os.path.dirname(os.path.abspath(__file__)); KIT = os.path.abspath(os.path.join(HERE, "..", ".."))
sys.path.insert(0, os.path.join(KIT, "templates", "explainer_soft3d_v4")); import build_ref1 as R1
F = KIT + "/blender/fonts/"; EMOJI = os.environ.get("EMOJI_FONT", "/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf")   # Windows: C:/Windows/Fonts/seguiemj.ttf; DJ = F + "DejaVuSans-Bold.ttf"
W, H, FPS, DUR = 1080, 1920, 30, 18.0; NF = int(DUR * FPS)
G = os.path.join(HERE, "gen"); os.makedirs(G, exist_ok=True); SPR = os.path.join(KIT, "templates", "explainer_soft3d_v4", "renders")
INK = (24, 22, 40)
def font(n, s): return ImageFont.truetype(n if n.startswith("/") else F + n, s)
def save(im, n): p = os.path.join(G, n); im.save(p); return p
def r(v): return round(v, 3)
SERVICES = [("Website design", "Custom, fast, mobile-first", "#c8f0ff", "tile_globe"), ("Landing pages", "One page that sells", "#ffe0f0", "tile_check"),
            ("SaaS & app UI", "Dashboards people enjoy", "#e6e0ff", "tile_code"), ("Reels & motion", "3D promos like this one", "#fff1c9", "tile_play"),
            ("3D websites", "Scroll-driven 3D scenes", "#d9f7e6", "star"), ("Free for 5", "First 5 clients: free site", "#ffd9cc", "coin")]
def card(title, sub, tint, w=560, h=640, icon_space=True):
    pad = 50; im = Image.new("RGBA", (w + 2 * pad, h + 2 * pad), (0, 0, 0, 0)); sh = im.copy()
    ImageDraw.Draw(sh).rounded_rectangle((pad + 10, pad + 30, pad + w - 10, pad + h + 10), 56, fill=(60, 40, 110, 70)); im = Image.alpha_composite(im, sh.filter(ImageFilter.GaussianBlur(26)))
    body = Image.new("RGBA", (w, h), (0, 0, 0, 0)); bd = ImageDraw.Draw(body); bd.rounded_rectangle((0, 0, w - 1, h - 1), 56, fill=(255, 255, 255, 236))
    grad = Image.new("RGBA", (w, h), (0, 0, 0, 0)); gd = ImageDraw.Draw(grad)
    for y in range(int(h * 0.45)): gd.line((0, y, w, y), fill=(255, 255, 255, int(120 * (1 - y / (h * 0.45)))))
    body = Image.alpha_composite(body, Image.composite(grad, Image.new("RGBA", (w, h)), body.getchannel("A").point(lambda v: 255 if v else 0)))
    bd = ImageDraw.Draw(body)
    if icon_space: bd.rounded_rectangle((40, 40, 40 + int(w * 0.42), 40 + int(w * 0.42)), 44, fill=tuple(int(tint[i:i + 2], 16) for i in (1, 3, 5)) + (255,))
    ty = 40 + int(w * 0.42) + 46 if icon_space else 60
    bd.text((44, ty), title, font=font("Inter-700.ttf", int(w * 0.085)), fill=INK + (255,))
    bd.text((44, ty + int(w * 0.11)), sub, font=font("Inter-700.ttf", int(w * 0.05)), fill=(120, 118, 140, 255))
    py = h - 40 - int(w * 0.13); bd.rounded_rectangle((44, py, 44 + int(w * 0.5), py + int(w * 0.12)), int(w * 0.06), fill=(30, 28, 52, 255))
    bd.text((44 + int(w * 0.05), py + int(w * 0.022)), "Learn more \u2192", font=font(DJ, int(w * 0.05)), fill=(255, 255, 255, 255))
    bd.rounded_rectangle((1, 1, w - 2, h - 2), 56, outline=(255, 255, 255, 255), width=3)
    im.alpha_composite(body, (pad, pad)); return im
def word(txt, size, col=INK, fontn="Inter-700.ttf"):
    f = font(fontn, size); x0, y0, x1, y1 = ImageDraw.Draw(Image.new("RGBA", (8, 8))).textbbox((0, 0), txt, font=f)
    im = Image.new("RGBA", (x1 - x0 + 40, y1 - y0 + 40), (0, 0, 0, 0)); ImageDraw.Draw(im).text((20 - x0, 20 - y0), txt, font=f, fill=col + (255,)); return im
def select_box(w, h):
    im = Image.new("RGBA", (w + 40, h + 40), (0, 0, 0, 0)); d = ImageDraw.Draw(im); c = (60, 120, 255, 255)
    d.rectangle((20, 20, 20 + w, 20 + h), outline=c, width=5)
    for x, y in ((20, 20), (20 + w, 20), (20, 20 + h), (20 + w, 20 + h)): d.rectangle((x - 11, y - 11, x + 11, y + 11), fill=(255, 255, 255, 255), outline=c, width=4)
    return im
def cursor():
    im = Image.new("RGBA", (110, 130), (0, 0, 0, 0)); d = ImageDraw.Draw(im); pts = [(10, 6), (10, 100), (34, 78), (52, 118), (68, 110), (50, 72), (84, 72)]
    sh = im.copy(); ImageDraw.Draw(sh).polygon([(x + 5, y + 7) for x, y in pts], fill=(0, 0, 0, 90)); im = Image.alpha_composite(im, sh.filter(ImageFilter.GaussianBlur(4)))
    ImageDraw.Draw(im).polygon(pts, fill=(255, 255, 255, 255), outline=(20, 20, 30, 255), width=4); return im
def emoji(ch, size=210):
    e = Image.new("RGBA", (160, 160), (0, 0, 0, 0)); ImageDraw.Draw(e).text((8, 8), ch, font=ImageFont.truetype(EMOJI, 109), embedded_color=True)
    return e.crop(e.getbbox()).resize((size, size), Image.LANCZOS)
def streak():
    im = Image.new("RGBA", (2400, 260), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    for i, (a_, wd) in enumerate(((60, 120), (140, 50), (255, 14))):
        d.rounded_rectangle((200, 130 - wd // 2, 2200, 130 + wd // 2), wd // 2, fill=(170, 220, 255, a_) if i < 2 else (255, 255, 255, a_))
    return im.filter(ImageFilter.GaussianBlur(10))
def bokeh():
    import random; random.seed(5); im = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    for _ in range(26):
        x, y, rr = random.randint(0, W), random.randint(0, H), random.randint(30, 120); c = random.choice([(255, 150, 210), (150, 200, 255), (190, 160, 255), (255, 230, 150)])
        d.ellipse((x - rr, y - rr, x + rr, y + rr), fill=c + (random.randint(60, 140),))
    return im.filter(ImageFilter.GaussianBlur(14))
def rays():
    import numpy as np
    S = 2400; y, x = np.mgrid[0:S, 0:S] - S / 2; ang = np.arctan2(y, x); rad = np.hypot(x, y) / (S / 2)
    hue = (ang / (2 * np.pi) + 0.5); bands = (np.sin(ang * 18) * 0.5 + 0.5) ** 3
    from colorsys import hsv_to_rgb
    lut = np.array([hsv_to_rgb(h_, 0.45, 1.0) for h_ in np.linspace(0, 1, 256)])
    rgb = lut[(hue * 255).astype(int) % 256] * 255; a_ = np.clip(bands * (1 - rad) * 1.4, 0, 1) * 255
    return Image.fromarray(np.dstack([rgb, a_]).astype("uint8"), "RGBA").filter(ImageFilter.GaussianBlur(6))
def toggle(on):
    im = Image.new("RGBA", (420, 240), (0, 0, 0, 0)); sh = im.copy()
    ImageDraw.Draw(sh).rounded_rectangle((30, 50, 390, 210), 80, fill=(40, 20, 80, 90)); im = Image.alpha_composite(im, sh.filter(ImageFilter.GaussianBlur(14)))
    d = ImageDraw.Draw(im); d.rounded_rectangle((30, 30, 390, 190), 80, fill=(52, 199, 89, 255) if on > 0.5 else (200, 200, 210, 255))
    x = 110 + on * 200; d.ellipse((x - 66, 44, x + 66, 176), fill=(255, 255, 255, 255)); d.ellipse((x - 50, 52, x + 30, 100), fill=(255, 255, 255, 255)); return im
def glow_text(txt, size, col, glow):
    f = font("ArchivoBlack-400.ttf", size); x0, y0, x1, y1 = ImageDraw.Draw(Image.new("RGBA", (8, 8))).textbbox((0, 0), txt, font=f); pad = 70
    im = Image.new("RGBA", (x1 - x0 + 2 * pad, y1 - y0 + 2 * pad), (0, 0, 0, 0)); g = im.copy(); ImageDraw.Draw(g).text((pad - x0, pad - y0), txt, font=f, fill=glow)
    im = Image.alpha_composite(im, g.filter(ImageFilter.GaussianBlur(22))); im = Image.alpha_composite(im, g.filter(ImageFilter.GaussianBlur(7)))
    ImageDraw.Draw(im).text((pad - x0, pad - y0), txt, font=f, fill=col); return im
def seq_loop(name):
    fr = sorted(glob.glob(os.path.join(SPR, "sp_" + name, "*.png")))
    if not fr: return None
    d = os.path.join(G, "sp_" + name); shutil.rmtree(d, ignore_errors=True); os.makedirs(d)
    for i in range(NF + 1): os.symlink(fr[i % len(fr)], os.path.join(d, f"f_{i + 1:04d}.png"))
    return os.path.join(d, "f_0001.png")

A = {}
for i, (t, s_, c, ic) in enumerate(SERVICES): A[f"card{i}"] = save(card(t, s_, c), f"card{i}.png"); A[f"gcard{i}"] = save(card(t, s_, c, 420, 480), f"gcard{i}.png")
for k, (t, sz, col) in {"w1": ("Your business", 104, INK), "w2": ("deserves a", 104, INK), "w3": ("website.", 150, (60, 120, 255)),
                        "g1": ("Everything you need", 84, INK), "g2": ("online.", 120, (60, 120, 255))}.items(): A[k] = save(word(t, sz, col), k + ".png")
wb = Image.open(A["w3"]).size; A["sel"] = save(select_box(wb[0] - 10, wb[1] - 16), "sel.png"); A["cur"] = save(cursor(), "cursor.png")
pl = Image.new("RGBA", (980, 330), (0, 0, 0, 0)); ImageDraw.Draw(pl).rounded_rectangle((20, 20, 960, 310), 70, fill=(255, 255, 255, 215)); A["plate"] = save(pl.filter(ImageFilter.GaussianBlur(3)), "plate.png")
A["blackpng"] = save(Image.new("RGB", (W, H), (6, 4, 14)), "black.png")
A["rocket"] = save(emoji("\U0001F680"), "rocket.png"); A["streak"] = save(streak(), "streak.png"); A["bokeh"] = save(bokeh(), "bokeh.png"); A["rays"] = save(rays(), "rays.png")
A["free"] = save(glow_text("First 5 sites FREE", 96, (255, 236, 140, 255), (255, 196, 0, 230)), "free.png")
A["end1"] = save(glow_text("Comment \u201cSITE\u201d", 104, (255, 255, 255, 255), (90, 140, 255, 200)), "end1.png")
A["end2"] = save(word("@zyqor.studio \u00b7 Zyqor Studio", 44, (200, 200, 215)), "end2.png")
def track(on):
    im = Image.new("RGBA", (420, 240), (0, 0, 0, 0)); sh = im.copy()
    ImageDraw.Draw(sh).rounded_rectangle((30, 50, 390, 210), 80, fill=(40, 20, 80, 110)); im = Image.alpha_composite(im, sh.filter(ImageFilter.GaussianBlur(14)))
    d = ImageDraw.Draw(im); d.rounded_rectangle((30, 30, 390, 190), 80, fill=(52, 199, 89, 255) if on else (200, 200, 210, 255))
    d.rounded_rectangle((44, 38, 376, 90), 40, fill=(255, 255, 255, 60)); return im
def knob():
    im = Image.new("RGBA", (180, 180), (0, 0, 0, 0)); sh = im.copy(); ImageDraw.Draw(sh).ellipse((24, 32, 156, 164), fill=(0, 0, 0, 90)); im = Image.alpha_composite(im, sh.filter(ImageFilter.GaussianBlur(8)))
    d = ImageDraw.Draw(im); d.ellipse((24, 24, 156, 156), fill=(255, 255, 255, 255)); d.ellipse((44, 34, 120, 84), fill=(255, 255, 255, 255)); return im
A["trk0"] = save(track(False), "track_off.png"); A["trk1"] = save(track(True), "track_on.png"); A["knob"] = save(knob(), "knob.png")
SP = {n: seq_loop(n) for n in ("tile_globe", "tile_check", "tile_code", "tile_play", "star", "coin", "tile_z")}

o = [R1.JSX_HEAD % (W, H, FPS, DUR), 'var comp=app.project.items.addComp("Ref5",W,H,1,DUR,FPS);']
def mesh(cols, n):   # pastel mesh gradient: 4 soft colour blobs on the first colour (drifts in the comp)
    import numpy as np
    w_, h_ = 1400, 2400; y, x = np.mgrid[0:h_, 0:w_].astype(np.float32); acc = np.zeros((h_, w_, 3), np.float32); wsum = np.zeros((h_, w_, 1), np.float32)
    for (cx, cy), c in zip(((0.15, 0.12), (0.9, 0.3), (0.2, 0.75), (0.85, 0.92)), cols):
        wgt = np.exp(-(((x / w_ - cx) ** 2 + (y / h_ - cy) ** 2 * 0.35) / 0.09))[..., None] + 1e-4
        acc += wgt * np.array([int(c[i:i + 2], 16) for i in (1, 3, 5)], np.float32); wsum += wgt
    return save(Image.fromarray((acc / wsum).clip(0, 255).astype("uint8"), "RGB"), n)
def grad_layer(name, cols, t0, t1):
    p = mesh(cols, name + ".png")
    js = f'var {name}=comp.layers.add(foot("{p}",false));'
    if t0: js += f'{name}.startTime={t0};'
    js += f'keys({name}.property("Position"),[[{t0},[600,1000]],[{t1},[480,920]]]);keys({name}.property("Rotation"),[[{t0},-3],[{t1},3]]);'
    return js
o.append(grad_layer("bgA", ["#c8f5e6", "#a9d4ff", "#e8f4ff", "#9fe3d0"], 0, 6.5))
o.append(grad_layer("bgB", ["#ffe0ef", "#ddd0ff", "#fff0f7", "#cfc4ff"], 6.5, 15.4))
for i, (a0, a1) in enumerate(((2.3, 2.8), (6.3, 6.8), (12.0, DUR + 1))):   # black beds (in/out points: EffectCraft opacity keys auto-bezier)
    a1 = min(a1, DUR)
    o.append(f'var blk{i}=comp.layers.add(foot("{A["blackpng"]}",false));blk{i}.property("Position").setValue([540,960]);keys(blk{i}.property("Scale"),[[0,[0,0]],[{r(a0 - 0.001)},[0,0]],[{a0},[100,100]]' + (f',[{r(a1 - 0.001)},[100,100]],[{a1},[0,0]]' if a1 < DUR else '') + '],1);')
def pop2d(v, src, x, y, t0, t1, s=100, over=112, seq=False, rot=0):
    out = (f'var {v}=comp.layers.add(foot("{src}",{str(seq).lower()}));{v}.property("Position").setValue([{r(x)},{r(y)}]);'
           f'keys({v}.property("Scale"),[[0,[0,0]],[{r(t0)},[0,0]],[{r(t0 + 0.14)},[{over},{over}]],[{r(t0 + 0.28)},[{s},{s}]],[{r(t1 - 0.14)},[{s},{s}]],[{r(t1)},[0,0]]],60);')
    if rot: out += f'keys({v}.property("Rotation"),[[{r(t0)},{rot}],[{r(t0 + 0.3)},0]],50);'
    return out
# HOOK 0-2.3: selection-box headline (+ cursor drags the box, emoji sticker)
o.append(pop2d("w1", A["w1"], 540, 720, 0.05, 2.3)); o.append(pop2d("w2", A["w2"], 540, 850, 0.3, 2.3)); o.append(pop2d("w3", A["w3"], 540, 1010, 0.6, 2.3, 100, 118))
o.append(pop2d("sel", A["sel"], 540, 1010, 0.95, 2.3, 100, 104))
o.append(f'var cu=comp.layers.add(foot("{A["cur"]}",false));keys(cu.property("Position"),[[0,[1150,1500]],[0.7,[1150,1500]],[1.0,[{540 + wb[0] // 2},{1010 + wb[1] // 2}]],[2.3,[{540 + wb[0] // 2 + 20},{1010 + wb[1] // 2 + 10}]]],70);cu.outPoint=2.3;')
o.append(pop2d("rk", A["rocket"], 860, 560, 1.25, 2.3, 100, 125, rot=-20))
# STREAK transitions on black
for i, t in enumerate((2.3, 6.3)):
    o.append(f'var sk{i}=comp.layers.add(foot("{A["streak"]}",false));keys(sk{i}.property("Position"),[[0,[-1400,980]],[{t},[-1400,980]],[{r(t + 0.45)},[2500,940]]],40);'
             f'keys(sk{i}.property("Rotation"),[[0,-8],[{t},-8]]);keys(sk{i}.property("Opacity"),[[0,0],[{r(t - 0.01)},0],[{t},100],[{r(t + 0.45)},100],[{r(t + 0.5)},0]]);sk{i}.blendingMode=BlendingMode.ADD;')
    o.append(f'var bk{i}=comp.layers.add(foot("{A["bokeh"]}",false));bk{i}.blendingMode=BlendingMode.ADD;keys(bk{i}.property("Opacity"),[[0,0],[{r(t + 0.05)},0],[{r(t + 0.2)},100],[{r(t + 0.5)},0]]);keys(bk{i}.property("Scale"),[[{t},[100,100]],[{r(t + 0.5)},[118,118]]]);')
# SERVICE CARDS 2.8-6.3: four glossy cards as 3D layers, each with its Blender 3D icon, gently rotating in depth
slots = [(310, 600, -16), (775, 740, 14), (305, 1260, 12), (775, 1400, -12)]
for i in range(4):
    x, y, ry = slots[i]; t0 = 2.85 + i * 0.32
    o.append(f'var c{i}=comp.layers.add(foot("{A[f"card{i}"]}",false));c{i}.threeDLayer=true;c{i}.property("Position").setValue([{x},{y},0]);'
             f'keys(c{i}.property("Scale"),[[0,[0,0,0]],[{r(t0)},[0,0,0]],[{r(t0 + 0.2)},[90,90,90]],[{r(t0 + 0.34)},[84,84,84]],[6.15,[84,84,84]],[6.3,[95,95,95]]],60);'
             f'keys(c{i}.property("Y Rotation"),[[{r(t0)},{ry * 3}],[{r(t0 + 0.45)},{ry}],[6.3,{-ry * 0.6}]],55);keys(c{i}.property("X Rotation"),[[{r(t0)},18],[6.3,-8]],40);'
             f'keys(c{i}.property("Opacity"),[[0,0],[{r(t0)},0],[{r(t0 + 0.05)},100],[6.2,100],[6.3,0]]);')
    ic = SP.get(SERVICES[i][3])
    if ic: o.append(pop2d(f"ic{i}", ic, x - 72, y - 130, t0 + 0.12, 6.3, 46, 58, True, -15 if i % 2 else 15))
# GRID 6.8-12.0: tilted infinite grid of service cards drifting diagonally (precomp as one 3D layer)
o.append('var grid=app.project.items.addComp("Grid",2400,3600,1,DUR,FPS);')
k = 0
for row in range(6):
    for col in range(4):
        gi = (row * 4 + col + row) % len(SERVICES); x = 300 + col * 600 + (row % 2) * 120; y = 300 + row * 600
        o.append(f'var gc{k}=grid.layers.add(foot("{A[f"gcard{gi}"]}",false));gc{k}.property("Position").setValue([{x},{y}]);')
        ic = SP.get(SERVICES[gi][3])
        if ic: o.append(f'var gi{k}=grid.layers.add(foot("{ic}",true));gi{k}.property("Position").setValue([{x - 60},{y - 110}]);gi{k}.property("Scale").setValue([34,34]);')
        k += 1
o.append('var GL=comp.layers.add(grid);GL.threeDLayer=true;GL.property("X Rotation").setValue(48);GL.property("Z Rotation").setValue(-28);'
         'keys(GL.property("Position"),[[0,[700,700,300]],[6.8,[700,700,300]],[12.0,[300,1300,300]]],0);'
         'GL.inPoint=6.8;GL.outPoint=12.05;keys(GL.property("Scale"),[[6.8,[120,120,120]],[12.0,[100,100,100]]],30);')
o.append(pop2d("pl", A["plate"], 540, 365, 7.2, 11.95, 100, 104)); o.append(pop2d("g1", A["g1"], 540, 300, 7.3, 11.95, 100, 110)); o.append(pop2d("g2", A["g2"], 540, 420, 7.55, 11.95, 100, 116))
# FINALE 12.0-15.4: rays + Z logo tile + toggle flips on + yellow glow line
o.append(f'var ry=comp.layers.add(foot("{A["rays"]}",false));ry.property("Position").setValue([540,860]);keys(ry.property("Rotation"),[[12,0],[15.4,40]]);'
         'keys(ry.property("Opacity"),[[0,0],[12.0,0],[12.3,90],[15.3,90],[15.4,0]]);keys(ry.property("Scale"),[[12,[60,60]],[12.5,[100,100]],[15.4,[110,110]]],50);')
if SP.get("tile_z"): o.append(pop2d("zl", SP["tile_z"], 540, 820, 12.2, 15.4, 120, 140, True, -18))
o.append(pop2d("tg0", A["trk0"], 540, 1260, 12.9, 15.4, 100, 112)); o.append(pop2d("tg1", A["trk1"], 540, 1260, 12.9, 15.4, 100, 112))
o.append('keys(tg1.property("Opacity"),[[0,0],[13.7,0],[13.88,100]]);')
o.append(pop2d("kn", A["knob"], 440, 1250, 12.9, 15.4, 100, 112)); o.append('keys(kn.property("Position"),[[13.7,[440,1250]],[13.88,[640,1250]]],80);')
o.append(pop2d("fr", A["free"], 540, 1480, 13.85, 15.4, 100, 120))
o.append(pop2d("e1", A["end1"], 540, 900, 15.55, DUR + 1, 100, 115)); o.append(pop2d("e2", A["end2"], 540, 1060, 15.8, DUR + 1, 100, 108))
o.append('var fin=comp.layers.addSolid([1,1,1],"FX",W,H,1);fin.adjustmentLayer=true;var gr=fx(fin,"Add Grain");try{gr.property(1).setValue(3);gr.property(4).property("Intensity").setValue(0.18);}catch(e){}')
o.append(f'app.project.save(File("{HERE}/ref5.ecproj"));"ref5.ecproj saved";')
open(os.path.join(HERE, "comp_ref5.jsx"), "w").write("\n".join(o))
ev = [dict(t=0.05, sfx="pop", db=-8), dict(t=0.3, sfx="pop2", db=-8), dict(t=0.6, sfx="impact", db=-6), dict(t=0.62, sfx="bass", db=-8), dict(t=0.85, sfx="sweep_small", db=-12),
      dict(t=0.95, sfx="click", db=-6), dict(t=1.25, sfx="pop", db=-8)]
for t in (2.3, 6.3): ev += [dict(t=t, sfx="whoosh", db=-6, lead=0.15), dict(t=t + 0.1, sfx="tech_slide", db=-12), dict(t=t + 0.45, sfx="bass", db=-8)]
for i in range(4): t0 = 2.85 + i * 0.32; ev += [dict(t=t0, sfx="whoosh_fast", db=-11, lead=0.1), dict(t=t0 + 0.14, sfx="pop", db=-9)]
ev += [dict(t=6.8, sfx="impact", db=-7), dict(t=7.3, sfx="pop2", db=-9), dict(t=7.55, sfx="pop", db=-8), dict(t=8.6, sfx="sweep_small", db=-13), dict(t=10.2, sfx="sweep_small", db=-13),
       dict(t=11.9, sfx="riser", db=-12, dur=0.6), dict(t=12.2, sfx="impact", db=-5), dict(t=12.22, sfx="bass", db=-6), dict(t=12.9, sfx="pop2", db=-9),
       dict(t=13.7, sfx="click", db=-5), dict(t=13.72, sfx="ding", db=-8), dict(t=13.85, sfx="pop", db=-8), dict(t=15.4, sfx="whoosh2", db=-8, lead=0.1),
       dict(t=15.55, sfx="impact", db=-7), dict(t=15.8, sfx="notif", db=-10)]
json.dump(sorted(ev, key=lambda e: e["t"]), open(os.path.join(HERE, "sfx_ref5.json"), "w"), indent=0)
print("comp_ref5.jsx written;", len(ev), "sfx", {k: bool(v) for k, v in SP.items()})
