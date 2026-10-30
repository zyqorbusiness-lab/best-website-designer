#!/usr/bin/env python3
"""contact-sheet.py - build storyboard.jpg (the one picture the client looks at) from storyboard frames.

Usage:
  python3 contact-sheet.py FRAMES_DIR [--out storyboard.jpg] [--cols 3] [--labels labels.json] [--bg F2ECE1] [--ink 1E3530]

FRAMES_DIR holds sb_01.png, sb_02.png ... (4-8 frames, png/jpg/webp). labels.json (optional) maps a file name to the
caption under it: {"sb_01.png": "Arrive · 0.0 s", "sb_02.png": "Wake · 1.6 s"}. Without it, the caption is the frame
number. Needs Pillow (pip install pillow). Fonts: DejaVu Sans if present, else Pillow's default.
Exit 1 if there are fewer than 4 or more than 8 frames (the storyboard rule).
"""
import json, os, re, sys
from PIL import Image, ImageDraw, ImageFont

def arg(name, default=None):
    return sys.argv[sys.argv.index(name) + 1] if name in sys.argv else default

if len(sys.argv) < 2 or sys.argv[1].startswith('--'):
    print(__doc__); sys.exit(1)
src = sys.argv[1]
out = arg('--out', os.path.join(src, 'storyboard.jpg'))
cols = int(arg('--cols', '3'))
bg = '#' + arg('--bg', 'F2ECE1').lstrip('#')
ink = '#' + arg('--ink', '1E3530').lstrip('#')
labels = json.load(open(arg('--labels'))) if arg('--labels') else {}

frames = sorted(f for f in os.listdir(src) if re.match(r'sb_?\d{2}\.(png|jpe?g|webp)$', f, re.I))
if not 4 <= len(frames) <= 8:
    print(f'need 4-8 frames named sb_01.png ... in {src}, found {len(frames)}'); sys.exit(1)

ims = [Image.open(os.path.join(src, f)).convert('RGB') for f in frames]
# one cell size for all frames: the median aspect, 600 px on the long side (sharp on a phone, light to send)
ar = sorted(i.width / i.height for i in ims)[len(ims) // 2]
cw, ch = (600, round(600 / ar)) if ar >= 1 else (round(600 * ar), 600)
pad, cap = 28, 56
rows = -(-len(ims) // cols)
W, H = pad + cols * (cw + pad), pad + rows * (ch + cap + pad)

def font(size):
    for p in ('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', '/Library/Fonts/Arial.ttf'):
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

f_num, f_cap = font(22), font(18)
sheet = Image.new('RGB', (W, H), bg)
d = ImageDraw.Draw(sheet)
for k, (name, im) in enumerate(zip(frames, ims)):
    r, c = divmod(k, cols)
    x, y = pad + c * (cw + pad), pad + r * (ch + cap + pad)
    fit = im.copy(); fit.thumbnail((cw, ch), Image.LANCZOS)
    sheet.paste(fit, (x + (cw - fit.width) // 2, y + (ch - fit.height) // 2))
    d.rectangle([x, y, x + cw - 1, y + ch - 1], outline=ink, width=1)
    d.text((x, y + ch + 12), f'{k + 1:02d}', fill=ink, font=f_num)
    d.text((x + 44, y + ch + 15), labels.get(name, name), fill=ink, font=f_cap)
sheet.save(out, quality=86, optimize=True)
print(f'{out}: {len(frames)} frames, {W}x{H}, {os.path.getsize(out) // 1024} KB')
