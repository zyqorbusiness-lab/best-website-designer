#!/usr/bin/env python3
"""Contact sheets for a pinterest_refs.mjs output folder: sheet.jpg (all thumbnails, numbered) and frames_sheet.jpg (6 frames per video, one row each)."""
import sys as _s
if any(a in ('-h','--help') for a in _s.argv[1:]): print(__doc__); raise SystemExit(0)
import json, sys, os
from PIL import Image, ImageDraw, ImageFont
out = sys.argv[1]; meta = json.load(open(os.path.join(out, "pins.json"))); pins = meta["pins"]
try: font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 22)
except Exception: font = ImageFont.load_default()
def tile(im, w, h):
    im = im.convert("RGB"); r = min(w / im.width, h / im.height); im = im.resize((max(1, int(im.width * r)), max(1, int(im.height * r))))
    c = Image.new("RGB", (w, h), (20, 20, 20)); c.paste(im, ((w - im.width) // 2, (h - im.height) // 2)); return c
def label(c, x, y, t):
    d = ImageDraw.Draw(c); b = d.textbbox((0, 0), t, font=font); d.rectangle([x, y, x + b[2] + 10, y + b[3] + 8], fill=(255, 210, 0)); d.text((x + 5, y + 3), t, fill=(0, 0, 0), font=font)
W, H, cols = 240, 427, 6
th = [p for p in pins if p.get("thumb")]
if th:
    rows = (len(th) + cols - 1) // cols; S = Image.new("RGB", (cols * W, rows * H), (0, 0, 0))
    for i, p in enumerate(th):
        x, y = (i % cols) * W, (i // cols) * H; S.paste(tile(Image.open(os.path.join(out, p["thumb"])), W - 4, H - 4), (x + 2, y + 2))
        label(S, x + 6, y + 6, p["n"] + (" ▶" if p.get("is_video") else ""))
    S.save(os.path.join(out, "sheet.jpg"), quality=82); print("sheet.jpg", S.size)
fr = [p for p in pins if p.get("frames")]
if fr:
    fw, fh = 200, 356; S = Image.new("RGB", (6 * fw + 70, len(fr) * fh), (0, 0, 0))
    for r, p in enumerate(fr):
        label(S, 4, r * fh + 6, p["n"])
        for k, f in enumerate(p["frames"][:6]): S.paste(tile(Image.open(os.path.join(out, f["file"])), fw - 4, fh - 4), (70 + k * fw + 2, r * fh + 2))
    S.save(os.path.join(out, "frames_sheet.jpg"), quality=80); print("frames_sheet.jpg", S.size)
