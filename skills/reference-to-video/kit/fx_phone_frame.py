#!/usr/bin/env python3
"""fx_phone_frame.py - Zyqor Motion Kit v5.5: 'raw vs edit' phone-frame layout using the EDIT SIDE ONLY (refs 5 and 6).
Sujon's strict rule: in before/after or raw-vs-edit references take ONLY the edited/after part, never the raw/before part.
This tool does that for YOUR OWN footage: crop the edited region of a video, round the corners like a phone panel, drop it on a warm
gradient with a soft shadow (optional slight tilt). It never shows a raw/before panel.

  python3 fx_phone_frame.py edit.mp4 out.mp4                         # whole frame becomes the phone panel
  python3 fx_phone_frame.py both_sides.mp4 out.mp4 --crop 443:485:573:1016    # x:y:w:h of the EDIT panel inside a side-by-side file
  python3 fx_phone_frame.py edit.mp4 out.mp4 --bg peach --panel-h 0.62 --radius 64 --tilt -2

Backgrounds (warm only): peach (#FFD7BE>#FF7A3D), gold (#F6D36B>#C98A1A), cream (#FFF3E0>#E8CFA4), ember (#3A1A0C>#8C3B12). Banned hues are refused.
Output 1080x1920 (--size), 30 fps, H.264, audio copied. Needs ffmpeg + Pillow.
"""
import argparse, subprocess, os, sys, tempfile, numpy as np
from PIL import Image, ImageDraw, ImageFilter

BG = {"peach": ("#FFD7BE", "#FF7A3D"), "gold": ("#F6D36B", "#C98A1A"), "cream": ("#FFF3E0", "#E8CFA4"), "ember": ("#3A1A0C", "#8C3B12")}
def hx(h): h = h.lstrip("#"); return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))
def banned(rgb):
    r, g, b = [v/255 for v in rgb]; mx, mn = max(r, g, b), min(r, g, b); d = mx-mn
    if d == 0: return False
    hh = 60*(((g-b)/d) % 6) if mx == r else 60*((b-r)/d+2) if mx == g else 60*((r-g)/d+4)
    return 175 <= hh <= 320 and d/mx >= .45 and mx >= .35

def probe(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", path], capture_output=True, text=True).stdout.strip().split(",")
    return int(r[0]), int(r[1])

def main():
    ap = argparse.ArgumentParser(description="Edit-side-only rounded phone panel on a warm gradient (Zyqor Motion Kit v5.5)")
    ap.add_argument("src"); ap.add_argument("out")
    ap.add_argument("--crop", help="x:y:w:h of the EDIT region inside the source (default whole frame)")
    ap.add_argument("--bg", default="peach"); ap.add_argument("--bg-colors", help="two hex colours top,bottom (warm only)")
    ap.add_argument("--size", default="1080x1920"); ap.add_argument("--panel-h", type=float, default=0.66, help="panel height as share of the canvas")
    ap.add_argument("--radius", type=int, default=64); ap.add_argument("--tilt", type=float, default=0.0)
    ap.add_argument("--fps", type=int, default=30)
    a = ap.parse_args()
    W, H = map(int, a.size.lower().split("x"))
    cols = tuple(hx(c) for c in a.bg_colors.split(",")) if a.bg_colors else tuple(hx(c) for c in BG[a.bg])
    if any(banned(c) for c in cols): raise SystemExit("refused: background colour is purple/violet/blue/cyan (banned 175-320 deg)")
    sw, sh = probe(a.src)
    cx, cy, cw, ch = (map(int, a.crop.split(":")) if a.crop else (0, 0, sw, sh))
    cx, cy, cw, ch = int(cx), int(cy), int(cw), int(ch)
    ph = int(H*a.panel_h)//2*2; pw = int(ph*cw/ch)//2*2
    if pw > W*0.9: pw = int(W*0.9)//2*2; ph = int(pw*ch/cw)//2*2
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", a.src], capture_output=True, text=True).stdout.strip() or 0)
    tmp = tempfile.mkdtemp(prefix="zq_phone_")
    # background gradient
    t = np.linspace(0, 1, H)[:, None, None]; bg = (np.array(cols[0])[None, None, :]*(1-t)+np.array(cols[1])[None, None, :]*t)
    bg = np.repeat(bg, W, axis=1).astype(np.uint8); Image.fromarray(bg).save(f"{tmp}/bg.png")
    # rounded mask + shadow (panel-sized canvas with margin)
    mg = 90; m = Image.new("L", (pw+2*mg, ph+2*mg), 0); ImageDraw.Draw(m).rounded_rectangle([mg, mg, mg+pw-1, mg+ph-1], a.radius, fill=255)
    sh_ = Image.new("RGBA", m.size, (0, 0, 0, 0)); blur = m.filter(ImageFilter.GaussianBlur(34)).point(lambda v: int(v*0.42))
    sh_.putalpha(blur); sh_ = sh_.transform(sh_.size, Image.AFFINE, (1, 0, 0, 0, 1, -26))   # shadow offset down
    m.save(f"{tmp}/mask.png"); sh_.save(f"{tmp}/shadow.png")
    ox = (W-(pw+2*mg))//2; oy = (H-(ph+2*mg))//2
    fc = (f"[1:v]fps={a.fps},crop={cw}:{ch}:{cx}:{cy},scale={pw}:{ph}:flags=lanczos,pad={pw+2*mg}:{ph+2*mg}:{mg}:{mg}:black,format=rgba[c];"
          f"[2:v]format=gray[mk];[c][mk]alphamerge[p];[0:v][3:v]overlay={ox}:{oy}[bs];")
    if a.tilt:
        fc += f"[p]rotate={a.tilt}*PI/180:c=none:ow=rotw({a.tilt}*PI/180):oh=roth({a.tilt}*PI/180)[pr];[bs][pr]overlay=(W-w)/2:(H-h)/2:shortest=1[v]"
    else:
        fc += f"[bs][p]overlay={ox}:{oy}:shortest=1[v]"
    cmd = ["ffmpeg", "-v", "error", "-y", "-loop", "1", "-framerate", str(a.fps), "-i", f"{tmp}/bg.png", "-i", a.src, "-loop", "1", "-framerate", str(a.fps), "-i", f"{tmp}/mask.png",
           "-loop", "1", "-framerate", str(a.fps), "-i", f"{tmp}/shadow.png", "-filter_complex", fc, "-map", "[v]", "-map", "1:a?", "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p",
           "-c:a", "aac", "-b:a", "192k", "-t", f"{dur:.3f}", "-movflags", "+faststart", a.out]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode: print(r.stderr[-1500:]); sys.exit(1)
    print("wrote", a.out, f"{W}x{H} panel {pw}x{ph} from crop {cx}:{cy}:{cw}:{ch}")

if __name__ == "__main__":
    main()
