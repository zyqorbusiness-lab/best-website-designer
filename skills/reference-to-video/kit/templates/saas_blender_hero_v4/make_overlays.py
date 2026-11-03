"""make_overlays.py — 2D overlay PNGs for the v4 hero (PIL). Edit the words, re-run, re-run comp_v4.jsx."""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os
F = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "blender", "fonts") + "/"
def txt(path, text, font, size, fill, glow=None, pad=40, shadow=False):
    f = ImageFont.truetype(F + font, size); d0 = ImageDraw.Draw(Image.new("RGBA", (10, 10)))
    x0, y0, x1, y1 = d0.textbbox((0, 0), text, font=f); w, h = x1 - x0 + 2 * pad, y1 - y0 + 2 * pad
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    if glow:
        g = Image.new("RGBA", (w, h), (0, 0, 0, 0)); ImageDraw.Draw(g).text((pad - x0, pad - y0), text, font=f, fill=glow)
        im = Image.alpha_composite(im, g.filter(ImageFilter.GaussianBlur(14))); im = Image.alpha_composite(im, g.filter(ImageFilter.GaussianBlur(5)))
    if shadow:
        s = Image.new("RGBA", (w, h), (0, 0, 0, 0)); ImageDraw.Draw(s).text((pad - x0 + 2, pad - y0 + 4), text, font=f, fill=(0, 0, 0, 120))
        im = Image.alpha_composite(im, s.filter(ImageFilter.GaussianBlur(4)))
    ImageDraw.Draw(im).text((pad - x0, pad - y0), text, font=f, fill=fill); im.save(path); print(path, im.size)
txt("assets/ov/hook_sub.png", "plan your whole week in 3 clicks", "InstrumentSerif-400-italic.ttf", 84, (255, 255, 255, 255), glow=(70, 200, 255, 230))
txt("assets/ov/end_line.png", "Concept app by Zyqor Studio \u00b7 not a real product", "Inter-700.ttf", 30, (90, 40, 30, 235))
txt("assets/ov/end_offer.png", "First 5 clients get a FREE website", "Inter-700.ttf", 40, (255, 255, 255, 255), shadow=True)
