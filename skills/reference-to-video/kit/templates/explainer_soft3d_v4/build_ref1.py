#!/usr/bin/env python3
"""build_ref1.py — Zyqor Motion Kit v4, recipe for Sujon's REF 1 (faceless soft-3D explainer, @d2epak_ style).
Pipeline: Blender sprites (sprites_v4.py: real 3D objects as transparent float loops) -> this script builds every 2D asset
(word-by-word captions, chapter pills, green count-ups, typed "Comment SITE" box, glass card, blobs, ripples) and WRITES the
EffectCraft comp (comp_ref1.jsx: 2.5D world precomp with DOF blur, drop shadows, camera push per beat; captions on top; FX layer)
+ the sfx event list (sfx_ref1.json). Edit BEATS / CAPTIONS below for a new topic and re-run.
  python3 build_ref1.py            -> assets/gen/*, seq/*, comp_ref1.jsx, sfx_ref1.json
"""
import os, json, math, glob, shutil
from PIL import Image, ImageDraw, ImageFont, ImageFilter
HERE = os.path.dirname(os.path.abspath(__file__))
F = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "blender", "fonts") + "/"; DJ = F + "DejaVuSans-Bold.ttf"
W, H, FPS, DUR = 1080, 1920, 30, 22.5
NF = int(round(DUR * FPS))
GEN = os.path.join(HERE, "assets", "gen"); SEQ = os.path.join(HERE, "seq"); REN = os.path.join(HERE, "renders")
os.makedirs(GEN, exist_ok=True); os.makedirs(SEQ, exist_ok=True)
INK, BLUE, CORAL, GREEN = (29, 29, 31), (47, 111, 214), (240, 100, 60), (34, 197, 94)
def font(n, s): return ImageFont.truetype(F + n if not n.startswith("/") else n, s)

# ------------------------------------------------------------------ the story (edit for a new topic)
# captions: (t_in, t_out, "line one|line two"); word markup: *blue*  _coral italic_
CAPTIONS = [
    (0.10, 1.12, "_No_ *website?*"),
    (1.22, 2.62, "Customers search|*Google* _first._"),
    (2.85, 5.00, "Here's how a *website*|gets you _clients._"),
    (5.25, 8.55, "They _find_ you|on *Google* *Maps.*"),
    (8.85, 10.35, "Photos. Menu. *Prices.*"),
    (10.45, 12.10, "They _trust_ you|in seconds."),
    (12.35, 15.30, "One tap to *call*|or *book* you."),
    (15.55, 17.60, "It works *24/7,*|even while you _sleep._"),
    (17.85, 19.70, "First 5 clients get|a _FREE_ *website.*"),
    (19.95, 22.50, "Comment *SITE*|and I'll _DM_ you."),
]
BEATS = [0.0, 2.7, 5.1, 8.7, 12.2, 15.4, 17.7, 19.8, DUR]       # camera push restarts at each beat (one continuous world, no cuts)
CAP_Y = (1430, 1528)

# ------------------------------------------------------------------ helpers: PNG assets
def save(im, name): p = os.path.join(GEN, name); im.save(p); return p
def word_png(word, kind):
    if kind == "coral": f, col = font("InstrumentSerif-400-italic.ttf", 92), CORAL
    elif kind == "blue": f, col = font("Inter-700.ttf", 70), BLUE
    else: f, col = font("Inter-700.ttf", 70), INK
    d0 = ImageDraw.Draw(Image.new("RGBA", (8, 8))); x0, y0, x1, y1 = d0.textbbox((0, 0), word, font=f)
    asc = f.getmetrics()[0]; pad = 24
    im = Image.new("RGBA", (x1 - x0 + 2 * pad, 130), (0, 0, 0, 0))
    base = 98 if kind != "coral" else 103                          # common baseline inside the 130 px box
    ImageDraw.Draw(im).text((pad - x0, base - asc), word, font=f, fill=col + (255,))
    return im
def parse_line(line):
    out = []
    for w in line.split(" "):
        if w.startswith("*") and w.endswith("*"): out.append((w.strip("*"), "blue"))
        elif w.startswith("_") and w.endswith("_"): out.append((w.strip("_"), "coral"))
        else: out.append((w, "ink"))
    return out
def pill(num, label):
    f = font("Inter-700.ttf", 46); tw = ImageDraw.Draw(Image.new("RGB", (8, 8))).textlength(label, font=f)
    w, h = int(tw + 150), 104; im = Image.new("RGBA", (w + 60, h + 60), (0, 0, 0, 0))
    sh = Image.new("RGBA", im.size, (0, 0, 0, 0)); ImageDraw.Draw(sh).rounded_rectangle((30, 38, 30 + w, 38 + h), 52, fill=(80, 60, 40, 60))
    im = Image.alpha_composite(im, sh.filter(ImageFilter.GaussianBlur(12))); d = ImageDraw.Draw(im)
    d.rounded_rectangle((30, 30, 30 + w, 30 + h), 52, fill=(255, 255, 255, 255))
    d.rounded_rectangle((44, 44, 44 + 76, 44 + 76), 22, fill=BLUE + (255,))
    fn = font("Inter-700.ttf", 48); nw = d.textlength(str(num), font=fn); d.text((82 - nw / 2, 52), str(num), font=fn, fill=(255, 255, 255, 255))
    d.text((140, 56), label, font=f, fill=INK + (255,)); return im
def green_number(txt, size=300, label=None):
    f = font("BricolageGrotesque-800.ttf", size); d0 = ImageDraw.Draw(Image.new("RGB", (8, 8)))
    x0, y0, x1, y1 = d0.textbbox((0, 0), txt, font=f); w, h = x1 - x0 + 160, y1 - y0 + 200
    im = Image.new("RGBA", (max(w, 900), h + (90 if label else 0)), (0, 0, 0, 0)); ox = (im.width - (x1 - x0)) // 2 - x0; oy = 80 - y0
    mask = Image.new("L", im.size, 0); ImageDraw.Draw(mask).text((ox, oy), txt, font=f, fill=255)
    glow = Image.new("RGBA", im.size, (52, 211, 120, 0)); glow.putalpha(mask.filter(ImageFilter.GaussianBlur(28)).point(lambda v: int(v * 0.8)))
    out = Image.alpha_composite(Image.new("RGBA", im.size, (0, 0, 0, 0)), glow)
    for k in range(10, 0, -1):                                       # extruded depth (darker green), soft-3D look
        ex = Image.new("RGBA", im.size, (14, 122, 54, 255)); m2 = Image.new("L", im.size, 0); m2.paste(mask, (0, k)); out.paste(ex, (0, 0), m2)
    grad = Image.new("RGBA", im.size); gd = ImageDraw.Draw(grad)
    for y in range(im.height):
        t = min(1, max(0, (y - oy) / max(1, (y1 - y0)))); c = tuple(int(a + (b - a) * t) for a, b in zip((134, 239, 172), (22, 163, 74)))
        gd.line((0, y, im.width, y), fill=c + (255,))
    out.paste(grad, (0, 0), mask)
    hl = Image.new("RGBA", im.size, (255, 255, 255, 0)); hm = mask.filter(ImageFilter.GaussianBlur(2)).point(lambda v: 90 if v > 200 else 0)
    hm2 = Image.new("L", im.size, 0); hm2.paste(hm.crop((0, 0, im.width, oy + int((y1 - y0) * 0.38))), (0, 0)); hl.putalpha(hm2)
    out = Image.alpha_composite(out, hl)
    if label:
        fl = font("Inter-700.ttf", 52); lw = ImageDraw.Draw(out).textlength(label, font=fl)
        ImageDraw.Draw(out).text(((im.width - lw) / 2, 80 + (y1 - y0) + 44), label, font=fl, fill=INK + (255,))
    return out
def comment_box(typed, caret=True, sent=False):
    im = Image.new("RGBA", (980, 220), (0, 0, 0, 0)); sh = Image.new("RGBA", im.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle((40, 52, 940, 192), 70, fill=(70, 50, 30, 70)); im = Image.alpha_composite(im, sh.filter(ImageFilter.GaussianBlur(16)))
    d = ImageDraw.Draw(im); d.rounded_rectangle((40, 40, 940, 180), 70, fill=(255, 255, 255, 255), outline=(228, 226, 222, 255), width=3)
    av = Image.open(os.path.join(HERE, "assets", "avatar.png")).convert("RGBA").resize((96, 96)); m = Image.new("L", (96, 96), 0); ImageDraw.Draw(m).ellipse((0, 0, 95, 95), fill=255)
    im.paste(av, (64, 62), m); d = ImageDraw.Draw(im)
    if typed:
        f = font("Inter-700.ttf", 64); d.text((190, 72), typed, font=f, fill=(232, 52, 52, 255))
        if caret: tw = d.textlength(typed, font=f); d.rectangle((196 + tw, 80, 202 + tw, 146), fill=(40, 40, 40, 255))
    else:
        d.text((190, 80), "Add a comment\u2026", font=font("Inter-700.ttf", 52), fill=(160, 160, 166, 255))
        if caret: d.rectangle((190, 80, 195, 140), fill=(40, 40, 40, 255))
    c = BLUE if typed else (200, 200, 206); d.ellipse((800, 58, 904, 162), fill=c + (255,))
    d.polygon([(828, 84), (884, 110), (828, 136), (838, 110)], fill=(255, 255, 255, 255))
    return im
def glass_card():
    im = Image.new("RGBA", (860, 250), (0, 0, 0, 0)); sh = Image.new("RGBA", im.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle((30, 46, 830, 226), 44, fill=(80, 60, 40, 70)); im = Image.alpha_composite(im, sh.filter(ImageFilter.GaussianBlur(16)))
    d = ImageDraw.Draw(im); d.rounded_rectangle((30, 30, 830, 210), 44, fill=(255, 255, 255, 240))
    d.ellipse((62, 70, 162, 170), fill=GREEN + (255,)); d.text((84, 80), "\u2713", font=font(DJ, 70), fill=(255, 255, 255, 255))
    d.text((192, 66), "New booking", font=font("Inter-700.ttf", 52), fill=INK + (255,))
    d.text((192, 132), "Sat \u00b7 10:30 AM \u00b7 table for 2", font=font("Inter-700.ttf", 36), fill=(130, 130, 138, 255))
    return im
def follow_pill():
    im = Image.new("RGBA", (420, 170), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    sh = Image.new("RGBA", im.size, (0, 0, 0, 0)); ImageDraw.Draw(sh).rounded_rectangle((30, 42, 390, 152), 55, fill=(20, 60, 140, 90)); im = Image.alpha_composite(im, sh.filter(ImageFilter.GaussianBlur(12)))
    d = ImageDraw.Draw(im); d.rounded_rectangle((30, 30, 390, 140), 55, fill=BLUE + (255,)); fw = d.textlength("Follow", font=font("Inter-700.ttf", 58))
    d.text((210 - fw / 2, 50), "Follow", font=font("Inter-700.ttf", 58), fill=(255, 255, 255, 255)); return im
def ripple():
    im = Image.new("RGBA", (400, 400), (0, 0, 0, 0)); d = ImageDraw.Draw(im); d.ellipse((20, 20, 380, 380), outline=BLUE + (200,), width=10); return im
def sparkle():
    im = Image.new("RGBA", (160, 160), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.polygon([(80, 0), (94, 66), (160, 80), (94, 94), (80, 160), (66, 94), (0, 80), (66, 66)], fill=(255, 205, 60, 255)); return im
def blob(col, r):
    im = Image.new("RGBA", (r * 2 + 200, r * 2 + 200), (0, 0, 0, 0)); ImageDraw.Draw(im).ellipse((100, 100, 100 + 2 * r, 100 + 2 * r), fill=col + (255,))
    return im.filter(ImageFilter.GaussianBlur(90))

# ------------------------------------------------------------------ sequences
def blank(): p = os.path.join(GEN, "blank.png"); Image.new("RGBA", (8, 8), (0, 0, 0, 0)).save(p) if not os.path.exists(p) else None; return p
def link_seq(name, frames, t_map):
    """Build seq/<name>/f_0001.png.. for the whole comp: t_map(comp_frame_index) -> source file (or None = blank)."""
    d = os.path.join(SEQ, name); shutil.rmtree(d, ignore_errors=True); os.makedirs(d)
    for i in range(NF):
        src = t_map(i) or blank(); os.symlink(src, os.path.join(d, f"f_{i + 1:04d}.png"))
    return os.path.join(d, "f_0001.png")
def loop_sprite(name):
    fr = sorted(glob.glob(os.path.join(REN, "sp_" + name, "*.png")))
    if not fr: raise SystemExit(f"missing Blender sprite renders/sp_{name}/ (run sprites_v4.py first)")
    return link_seq("sp_" + name, fr, lambda i: fr[i % len(fr)])
def oneshot_sprite(name, t0):
    fr = sorted(glob.glob(os.path.join(REN, "sp_" + name, "*.png")))
    return link_seq("sp_" + name, fr, lambda i: fr[min(len(fr) - 1, max(0, i - int(t0 * FPS)))])
def gen_seq(name, t0, t1, make):
    """Per-frame generated PNGs (count-ups, typing) between t0 and t1; identical frames are reused."""
    cache = {}; d = os.path.join(GEN, name); os.makedirs(d, exist_ok=True)
    def m(i):
        t = i / FPS
        if t < t0 or t > t1: return None
        k = make(t - t0)
        if k is None: return None
        key_, im = k
        if key_ not in cache: p = os.path.join(d, f"{len(cache):04d}.png"); im.save(p); cache[key_] = p
        return cache[key_]
    return link_seq(name, None, m)

# ------------------------------------------------------------------ build assets
def build():
    for f in glob.glob(os.path.join(GEN, "*.png")): os.remove(f)
    A = {}
    A["blob_peach"] = save(blob((246, 201, 168), 330), "blob_peach.png"); A["blob_blue"] = save(blob((188, 215, 245), 300), "blob_blue.png")
    A["blob_pink"] = save(blob((250, 214, 226), 240), "blob_pink.png")
    for i, (n, l) in enumerate([("1", "Found"), ("2", "Trust"), ("3", "Call / Book")]): A[f"pill{n}"] = save(pill(n, l), f"pill{n}.png")
    A["card"] = save(glass_card(), "card.png"); A["follow"] = save(follow_pill(), "follow.png")
    A["ripple"] = save(ripple(), "ripple.png"); A["sparkle"] = save(sparkle(), "sparkle.png")
    # count-ups (true or illustrative only: 24/7 = a website is always on; 5 = the real offer, first 5 clients)
    gcache = {}
    def gn(txt, label=None):
        k = (txt, label)
        if k not in gcache: gcache[k] = green_number(txt, 300, label)
        return gcache[k]
    def c247(dt):
        n = min(24, int(24 * (1 - (1 - min(1, dt / 0.8)) ** 3))); return (n, gn(f"{n}" if n < 24 else "24/7"))
    A["count247"] = gen_seq("count247", 15.55, 17.55, lambda dt: c247(dt))
    def c5(dt):
        n = min(5, int(5.999 * min(1, dt / 0.7))); return (n, gn(str(n), "FREE WEBSITES"))
    A["count5"] = gen_seq("count5", 17.95, 19.65, lambda dt: c5(dt))
    def typing(dt):
        word = "SITE"; k = min(len(word), int(max(0, dt - 0.35) / 0.16)); caret = (int(dt * 2.2) % 2 == 0) or k < len(word)
        return ((k, caret), comment_box(word[:k], caret))
    A["comment"] = gen_seq("comment", 20.0, 22.5, typing)
    # captions -> one PNG per word, positions computed per line (centered)
    words = []
    for ci, (t0, t1, text) in enumerate(CAPTIONS):
        lines = text.split("|"); n_all = sum(len(parse_line(l)) for l in lines); k = 0
        for li, line in enumerate(lines):
            ims = [(w, kind, word_png(w, kind)) for w, kind in parse_line(line)]
            gap = -22; total = sum(im.width for _, _, im in ims) + gap * (len(ims) - 1); x = (W - total) / 2
            for wi, (w, kind, im) in enumerate(ims):
                p = save(im, f"w{ci:02d}_{li}_{wi}.png"); spread = min(0.16, (t1 - t0) * 0.45 / max(1, n_all))
                words.append(dict(src=p, x=x + im.width / 2, y=CAP_Y[li] if len(lines) > 1 else CAP_Y[0] + 40, t_in=t0 + k * spread, t_out=t1, kind=kind))
                x += im.width + gap; k += 1
    return A, words

# ------------------------------------------------------------------ layout: the 2.5D world, beat by beat
def layout(A):
    L = []     # world layers: (name, src, x, y, scale%, t_in, t_out, blur, shadow, extra)
    def S(name, src, x, y, s, t0, t1, blur=0, shadow=True, drift=(0, -18), enter="pop"):
        L.append(dict(name=name, src=src, x=x, y=y, s=s, t_in=t0, t_out=t1, blur=blur, shadow=shadow, drift=drift, enter=enter))
    ps, av, avw, avk = loop_sprite("phone_search"), loop_sprite("avatar"), loop_sprite("avatar_wow"), loop_sprite("avatar_wink")
    star, pin, coin = loop_sprite("star"), loop_sprite("pin"), loop_sprite("coin")
    tcall, tcheck, tglobe = loop_sprite("tile_call"), loop_sprite("tile_check"), loop_sprite("tile_globe")
    site = oneshot_sprite("phone_site", 8.8)
    # A hook 0-2.7: the phone with the search IS the hook (ref 1 opens on the object, sharp, big)
    S("phone", ps, 540, 760, 100, 0.0, 2.72, enter="drop")
    S("pinA", pin, 880, 300, 62, 0.35, 2.72, blur=0, drift=(0, -26))
    S("starA", star, 170, 1180, 70, 0.55, 2.72, blur=9, drift=(10, -20))
    S("coinA", coin, 930, 1130, 55, 0.8, 2.72, blur=12, drift=(-8, -16))
    # B 2.7-5.1: mascot app-icon tile (expression swap on the key word)
    S("avatar", av, 540, 800, 100, 2.78, 3.75, drift=(0, -10))
    S("avatar_wow", avw, 540, 800, 100, 3.75, 5.12, enter="swap", drift=(0, -10))
    S("globeB", tglobe, 205, 430, 60, 3.0, 5.12, blur=8, drift=(0, -20))
    S("coinB", coin, 905, 1150, 60, 3.2, 5.12, blur=11, drift=(-6, -18))
    S("starB", star, 890, 380, 48, 3.45, 5.12, blur=14, drift=(0, -12))
    # C 5.1-8.7: 1 Found — pin + the search result
    S("pill1", A["pill1"], 540, 250, 100, 5.15, 8.7, shadow=False, drift=(0, 0))
    S("phoneC", ps, 700, 860, 72, 5.3, 8.72, blur=5, drift=(-14, -12))
    S("pinC", pin, 360, 760, 118, 5.55, 8.72, enter="drop", drift=(0, -16))
    S("starC", star, 905, 1260, 42, 6.0, 8.72, blur=12)
    # D 8.7-12.2: 2 Trust — the café site scrolls on a 3D phone, stars pop
    S("pill2", A["pill2"], 540, 250, 100, 8.75, 12.2, shadow=False, drift=(0, 0))
    S("site", site, 540, 830, 100, 8.8, 12.22, drift=(0, -12))
    for i, (x, y, s, t) in enumerate([(205, 560, 46, 9.3), (880, 700, 54, 9.5), (215, 1110, 40, 9.7), (870, 1180, 34, 9.9)]):
        S(f"starD{i}", star, x, y, s, t, 12.22, blur=0 if i < 2 else 7, drift=(0, -22))
    # E 12.2-15.4: 3 Call / Book
    S("pill3", A["pill3"], 540, 250, 100, 12.25, 15.4, shadow=False, drift=(0, 0))
    S("call", tcall, 360, 830, 100, 12.35, 15.42, drift=(0, -14))
    S("check", tcheck, 735, 960, 88, 12.7, 15.42, drift=(0, -18))
    S("card", A["card"], 540, 520, 100, 13.45, 15.42, drift=(0, -10))
    S("coinE", coin, 930, 1260, 42, 13.0, 15.42, blur=12)
    # F 15.4-17.7: 24/7 count-up (true: a site never closes)
    S("count247", A["count247"], 540, 790, 100, 15.5, 17.72, shadow=False, enter="swap", drift=(0, -8))
    S("starF", star, 180, 470, 44, 15.7, 17.72, blur=10); S("globeF", tglobe, 900, 1160, 52, 15.85, 17.72, blur=9)
    # G 17.7-19.8: the real offer: first 5 clients
    S("avatarG", avk, 540, 610, 82, 17.78, 19.82, drift=(0, -10))
    S("count5", A["count5"], 540, 1105, 72, 17.95, 19.82, shadow=False, enter="swap", drift=(0, 0))
    # H 19.8-22.5: CTA typed comment box + Follow
    S("avatarH", avk, 540, 560, 64, 19.88, DUR + 0.1, drift=(0, -10))
    S("comment", A["comment"], 540, 930, 100, 20.0, DUR + 0.1, shadow=False, drift=(0, 0))
    S("follow", A["follow"], 540, 1135, 90, 21.45, DUR + 0.1, shadow=False, drift=(0, 0))
    FX = []   # one-shot overlays (ripples, sparkles) in the world: (src, x, y, t, kind)
    # ripple on the "Website" button of the search phone (sprite px -> comp px)
    FX += [("ripple", 540 + (316 - 450) * 1.0, 760 + (783 - 750) * 1.0, 2.05), ("ripple", 360, 700, 5.95), ("ripple", 360, 830, 12.9), ("ripple", 540 + 360, 930, 21.25)]
    SP = [(270, 700, 15.9), (820, 640, 16.05), (760, 980, 16.2), (300, 980, 18.5), (790, 1000, 18.6)]
    return L, FX, SP

# ------------------------------------------------------------------ EffectCraft comp writer (After-Effects-style JSX)
JSX_HEAD = """// comp_ref1.jsx — GENERATED by build_ref1.py (Zyqor Motion Kit v4, ref 1 soft-3D explainer). Run: effectcraft-cli script comp_ref1.jsx
var W=%d,H=%d,FPS=%d,DUR=%s;
function hex(h){h=h.replace("#","");return [parseInt(h.substr(0,2),16)/255,parseInt(h.substr(2,2),16)/255,parseInt(h.substr(4,2),16)/255,1];}
function keys(p,pairs,infl){var last=-1;for(var i=0;i<pairs.length;i++){var f=Math.round(pairs[i][0]*FPS);if(f<=last)f=last+1;last=f;p.setValueAtTime(f/FPS,pairs[i][1]);}  // EffectCraft snaps keys to frames: two keys in one frame collapse, so push the later one a frame
 if(infl){for(var k=1;k<=p.numKeys;k++){try{var d=p.value instanceof Array?p.value.length:1;var e=[];for(var j=0;j<(p.isSpatial?1:d);j++)e.push(new KeyframeEase(0,infl));p.setTemporalEaseAtKey(k,e,e);}catch(err){}}}}
function fx(l,n){return l.property("Effects").addProperty(n);}
function imp(p,seq){var io=new ImportOptions(File(p));if(seq)io.sequence=true;var f=app.project.importFile(io);if(seq){try{f.mainSource.conformFrameRate=FPS;}catch(e){}}return f;}
var cache={}; function foot(p,seq){if(!cache[p])cache[p]=imp(p,seq);return cache[p];}
"""
def r(v): return round(v, 3)
def jsx_world_layer(o, out):
    seq = "/seq/" in o["src"]; v = "L_" + o["name"]
    s, x, y, t0, t1, b = o["s"], o["x"], o["y"], max(0.0, o["t_in"]), o["t_out"], o["blur"]
    dx, dy = o["drift"]
    out.append(f'var {v}=world.layers.add(foot("{o["src"]}",{str(seq).lower()}));')
    pos = [[0, [x, y]], [t0, [x, y]], [t1, [x + dx, y + dy]]]
    if o["enter"] == "drop": pos = [[0, [x, y - 260]], [t0, [x, y - 260]], [t0 + 0.26, [x, y + 16]], [t0 + 0.42, [x, y]], [t1, [x + dx, y + dy]]]
    out.append(f'keys({v}.property("Position"),{json.dumps([[r(a), [r(c) for c in p]] for a, p in pos])},55);')
    if o["enter"] == "swap": sc = [[0, s * .92], [t0, s * .92], [t0 + 0.12, s]]
    else: sc = [[0, s * .55], [t0, s * .55], [t0 + 0.18, s * 1.07], [t0 + 0.32, s]]
    cut = o["name"] in ("avatar",)
    if not cut: sc += [[t1 - 0.22, s], [t1, s * 1.3]]
    out.append(f'keys({v}.property("Scale"),{json.dumps([[r(a), [r(c), r(c)]] for a, c in sc])},60);')
    op = [[0, 0], [max(0, t0 - 0.001), 0], [t0 + (0.03 if o["enter"] == "swap" else 0.08), 100]]
    op += [[t1 - 0.001, 100], [t1, 0]] if cut else [[t1 - 0.2, 100], [t1, 0]]
    out.append(f'keys({v}.property("Opacity"),{json.dumps([[r(a), c] for a, c in op])});')
    if o["enter"] != "swap" or b:
        bl = [[0, 18], [t0, 18 if o["enter"] != "swap" else b], [t0 + 0.24, b]] + ([] if cut else [[t1 - 0.22, b], [t1, 22]])
        out.append(f'var gb_{v}=fx({v},"Gaussian Blur");keys(gb_{v}.property("Blurriness"),{json.dumps([[r(a), c] for a, c in bl])},50);')
    if o["shadow"]:
        out.append(f'var ds_{v}=fx({v},"Drop Shadow");try{{ds_{v}.property("Shadow Color").setValue(hex("#8a6448"));ds_{v}.property("Opacity").setValue(38);'
                   f'ds_{v}.property("Direction").setValue(170);ds_{v}.property("Distance").setValue(34);ds_{v}.property("Softness").setValue(70);}}catch(e){{}}')

def write_jsx(A, words, L, FX, SP):
    o = [JSX_HEAD % (W, H, FPS, DUR)]
    o.append('var world=app.project.items.addComp("World",W,H,1,DUR,FPS);')
    for lay in L: jsx_world_layer(lay, o)
    for i, (k, x, y, t) in enumerate(FX):                       # tap ripples
        o.append(f'var R{i}=world.layers.add(foot("{A[k]}",false));R{i}.property("Position").setValue([{r(x)},{r(y)}]);'
                 f'keys(R{i}.property("Scale"),[[0,[10,10]],[{r(t)},[10,10]],[{r(t + 0.5)},[95,95]]],40);keys(R{i}.property("Opacity"),[[0,0],[{r(t - 0.001)},0],[{r(t)},100],[{r(t + 0.5)},0]]);')
    for i, (x, y, t) in enumerate(SP):                          # sparkle bursts on count-ups
        o.append(f'var P{i}=world.layers.add(foot("{A["sparkle"]}",false));P{i}.property("Position").setValue([{x},{y}]);'
                 f'keys(P{i}.property("Scale"),[[0,[0,0]],[{r(t)},[0,0]],[{r(t + 0.15)},[70,70]],[{r(t + 0.45)},[0,0]]],50);keys(P{i}.property("Rotation"),[[{r(t)},0],[{r(t + 0.45)},90]]);')
    o.append('var comp=app.project.items.addComp("Ref1",W,H,1,DUR,FPS);')
    o.append('var bg=comp.layers.addSolid(hex("#f3f0ec"),"Paper",W,H,1);')
    for nm, x0, y0, x1, y1 in (("blob_peach", 160, 360, 330, 520), ("blob_blue", 950, 1500, 820, 1300), ("blob_pink", 980, 260, 860, 420)):
        o.append(f'var {nm}=comp.layers.add(foot("{A[nm]}",false));keys({nm}.property("Position"),[[0,[{x0},{y0}]],[DUR,[{x1},{y1}]]],30);{nm}.property("Opacity").setValue(85);')
    o.append('var W3=comp.layers.add(world);')
    cam = [[0, 100]]
    for b0, b1 in zip(BEATS[:-1], BEATS[1:]):
        if b1 >= DUR: cam += [[b0, 100], [b1, 106]]
        else: cam += [[b0, 100], [b1 - 0.24, 106], [b1 - 0.02, 117]]
    o.append(f'keys(W3.property("Scale"),{json.dumps([[r(a), [c, c]] for a, c in cam])},45);')
    zb = [[0, 0]]
    for b in BEATS[1:-1]: zb += [[r(b - 0.2), 0], [r(b - 0.03), 30], [r(b + 0.12), 12], [r(b + 0.25), 0]]
    o.append('var zl=comp.layers.addSolid([1,1,1],"FX zoom",W,H,1);zl.adjustmentLayer=true;var rb=fx(zl,"CC Radial Fast Blur");rb.property("Center").setValue([540,860]);'
             f'keys(rb.property("Amount"),{json.dumps(zb)});')
    for i, w in enumerate(words):
        t0, t1 = w["t_in"], w["t_out"]
        o.append(f'var c{i}=comp.layers.add(foot("{w["src"]}",false));keys(c{i}.property("Position"),[[0,[{r(w["x"])},{w["y"] + 24}]],[{r(t0)},[{r(w["x"])},{w["y"] + 24}]],[{r(t0 + 0.2)},[{r(w["x"])},{w["y"]}]]],70);'
                 f'keys(c{i}.property("Opacity"),[[0,0],[{r(t0 - 0.001)},0],[{r(t0 + 0.12)},100],[{r(t1 - 0.12)},100],[{r(t1)},0]]);'
                 f'var cb{i}=fx(c{i},"Gaussian Blur");keys(cb{i}.property("Blurriness"),[[0,14],[{r(t0)},14],[{r(t0 + 0.2)},0],[{r(t1 - 0.12)},0],[{r(t1)},10]]);')
    o.append('var fin=comp.layers.addSolid([1,1,1],"FX finish",W,H,1);fin.adjustmentLayer=true;var gr=fx(fin,"Add Grain");try{gr.property(1).setValue(3);gr.property(4).property("Intensity").setValue(0.12);}catch(e){}')
    o.append(f'app.project.save(File("{HERE}/ref1.ecproj"));"ref1.ecproj saved";')
    open(os.path.join(HERE, "comp_ref1.jsx"), "w").write("\n".join(o))

def write_sfx(L, FX):
    ev = [dict(t=0.0, sfx="impact", db=-4), dict(t=0.02, sfx="bass", db=-6)]
    pops = ["pop", "pop2"]
    for i, lay in enumerate(L):
        t = lay["t_in"]; n = lay["name"]
        if t < 0.05: continue
        if n.startswith("pill"): ev += [dict(t=t, sfx="click", db=-7), dict(t=t + 0.02, sfx="sweep_small", db=-13)]
        elif n.startswith("count"): ev += [dict(t=t, sfx="typing", db=-13, dur=0.75), dict(t=t + 0.8, sfx="ding", db=-8), dict(t=t + 0.82, sfx="cash" if "5" in n else "notif", db=-11)]
        elif n == "comment": ev += [dict(t=t + 0.35, sfx="typing", db=-9, dur=0.7), dict(t=21.25, sfx="click", db=-6), dict(t=21.27, sfx="notif", db=-9)]
        elif n == "follow": ev += [dict(t=t, sfx="pop", db=-7), dict(t=t + 0.1, sfx="ding", db=-10)]
        elif n == "card": ev += [dict(t=t, sfx="notif", db=-7)]
        elif lay["enter"] == "drop": ev += [dict(t=t + 0.24, sfx="bass", db=-8), dict(t=t + 0.26, sfx="pop", db=-9)]
        elif lay["enter"] == "swap": ev += [dict(t=t, sfx="pop2", db=-10)]
        else: ev.append(dict(t=t, sfx=pops[i % 2], db=-9 if lay["blur"] < 6 else -15))
    for b in BEATS[1:-1]: ev.append(dict(t=b, sfx="whoosh" if BEATS.index(b) % 2 else "whoosh2", db=-9, lead=0.18))
    for k, x, y, t in FX: ev.append(dict(t=t, sfx="click", db=-10))
    ev.sort(key=lambda e: e["t"]); json.dump(ev, open(os.path.join(HERE, "sfx_ref1.json"), "w"), indent=0)
    return ev

if __name__ == "__main__":
    A, words = build(); L, FX, SP = layout(A); write_jsx(A, words, L, FX, SP); ev = write_sfx(L, FX)
    print(f"comp_ref1.jsx: {len(L)} world layers, {len(words)} caption words; sfx events: {len(ev)} ({len(ev) / DUR:.2f}/s)")
