#!/usr/bin/env python3
"""knockout.py: remove a flat background connected to the image border, keep same-coloured areas inside the object
and (optionally) the soft contact shadow, soften the edge. Pure Pillow.
Usage: python3 knockout.py in.jpg out.png [--tolerance 18] [--keep-shadow] [--feather 1.4]
Approach after scroll-world's knockout.py by cyw (MIT, https://github.com/oso95/scroll-world); this is a fresh implementation. MIT, Zyqor Studio."""
import argparse
from collections import deque
from PIL import Image, ImageFilter

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('src'); ap.add_argument('dst')
    ap.add_argument('--tolerance', type=float, default=18, help='max colour distance from the sampled background (0-441)')
    ap.add_argument('--keep-shadow', action='store_true', help='keep darker background pixels as a semi-transparent shadow')
    ap.add_argument('--feather', type=float, default=1.4, help='edge blur radius in px')
    a = ap.parse_args()
    im = Image.open(a.src).convert('RGB'); w, h = im.size; px = im.load()
    # background colour: median of the border pixels
    border = [px[x, 0] for x in range(w)] + [px[x, h - 1] for x in range(w)] + [px[0, y] for y in range(h)] + [px[w - 1, y] for y in range(h)]
    bg = tuple(sorted(c[i] for c in border)[len(border) // 2] for i in range(3))
    lum = lambda c: 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
    bl = lum(bg); tol2 = a.tolerance ** 2
    def is_bg(c):
        d2 = sum((c[i] - bg[i]) ** 2 for i in range(3))
        if d2 <= tol2: return True
        # shadow: same hue family, only darker (all channels scaled down together)
        if a.keep_shadow and lum(c) < bl:
            k = lum(c) / max(bl, 1); d2s = sum((c[i] - bg[i] * k) ** 2 for i in range(3))
            return d2s <= tol2 * 1.5
        return False
    alpha = Image.new('L', (w, h), 255); al = alpha.load(); seen = bytearray(w * h); q = deque()
    for x in range(w): q.extend([(x, 0), (x, h - 1)])
    for y in range(h): q.extend([(0, y), (w - 1, y)])
    while q:   # flood from the border only: inner areas of the same colour are never reached
        x, y = q.popleft(); i = y * w + x
        if seen[i]: continue
        seen[i] = 1; c = px[x, y]
        if not is_bg(c): continue
        if a.keep_shadow and lum(c) < bl - 2:
            al[x, y] = int(min(255, (bl - lum(c)) / max(bl, 1) * 255 * 2.2))      # darker = more opaque shadow
        else:
            al[x, y] = 0
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h and not seen[ny * w + nx]: q.append((nx, ny))
    if a.feather > 0: alpha = alpha.filter(ImageFilter.GaussianBlur(a.feather))
    out = im.copy(); out.putalpha(alpha)
    if a.keep_shadow:   # shadow pixels take a neutral dark colour so they sit on any page colour
        o = out.load(); sh = tuple(int(v * 0.25) for v in bg)
        for (x, y) in ((x, y) for y in range(h) for x in range(w) if seen[y * w + x] and 0 < al[x, y] < 255): o[x, y] = sh + (o[x, y][3],)
    out.save(a.dst); kept = sum(alpha.histogram()[1:])
    print(f'{a.dst}: background {bg}, kept {kept / (w * h):.1%} of pixels')

if __name__ == '__main__':
    main()
