#!/usr/bin/env python3
"""fx_torn_reveal.py - Zyqor Motion Kit v5.5: torn-paper reveal transition (refs 1 and 4: the red page tears away and shows the next shot).
Pure Python (numpy + Pillow) + ffmpeg. A and B can be videos or still images. Output = the transition clip only (--dur s, default 0.5);
cut it into your edit with ffmpeg concat / EffectCraft. NOT generated media: it only recombines YOUR two inputs.

  python3 fx_torn_reveal.py shotA.mp4 shotB.mp4 out.mp4 --dur 0.5 --direction up
  python3 fx_torn_reveal.py a.png b.png out.mp4 --size 540x960 --seed 7 --paper "#FFF8EC"

How it looks: a rough tear line (low-frequency wobble + per-frame jitter) sweeps across (ease-out, 4-6 frames of fast travel), a white paper edge
(irregular 8-18 px fibre strip) rides on the tear, a soft shadow falls on B just under it, A is slightly lifted (scale 1.0 -> 1.04) as it peels.
Human, not AI: seed changes the tear shape; edge width and jitter are random per frame; nothing is a perfect straight wipe.
"""
import argparse, subprocess, sys, os, numpy as np
from PIL import Image, ImageFilter

def frames(path, w, h, fps, dur, start=0.0):
    is_img = path.lower().endswith((".png", ".jpg", ".jpeg", ".webp"))
    cmd = ["ffmpeg", "-v", "error"] + (["-loop", "1"] if is_img else ["-ss", str(start)]) + ["-i", path, "-t", str(dur), "-vf",
           f"fps={fps},scale={w}:{h}:force_original_aspect_ratio=increase,crop={w}:{h}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]
    raw = subprocess.run(cmd, capture_output=True).stdout
    n = len(raw)//(w*h*3)
    if n == 0: raise SystemExit("could not read frames from " + path)
    return np.frombuffer(raw[:n*w*h*3], np.uint8).reshape(n, h, w, 3)

def hx(h): h = h.lstrip("#"); return np.array([int(h[i:i+2], 16) for i in (0, 2, 4)], float)

def main():
    ap = argparse.ArgumentParser(description="Torn-paper reveal between two shots (Zyqor Motion Kit v5.5)")
    ap.add_argument("a"); ap.add_argument("b"); ap.add_argument("out")
    ap.add_argument("--dur", type=float, default=0.5); ap.add_argument("--fps", type=int, default=30)
    ap.add_argument("--size", default="1080x1920"); ap.add_argument("--direction", default="up", choices=["up", "down", "left", "right"])
    ap.add_argument("--seed", type=int, default=3); ap.add_argument("--paper", default="#FFF8EC")
    ap.add_argument("--a-start", type=float, default=0.0); ap.add_argument("--b-start", type=float, default=0.0)
    a = ap.parse_args()
    w, h = map(int, a.size.lower().split("x")); n = max(4, int(round(a.dur*a.fps)))
    A = frames(a.a, w, h, a.fps, a.dur, a.a_start); B = frames(a.b, w, h, a.fps, a.dur, a.b_start)
    A = A[np.minimum(np.arange(n), len(A)-1)]; B = B[np.minimum(np.arange(n), len(B)-1)]
    rng = np.random.default_rng(a.seed)
    horiz = a.direction in ("up", "down")           # tear line runs along x for up/down
    L = w if horiz else h; M = h if horiz else w    # L = length of the tear, M = travel distance
    base = np.cumsum(rng.normal(0, 1, L)); base = np.convolve(base, np.ones(41)/41, "same"); base = (base-base.mean())/(np.abs(base).max()+1e-9)*0.035*M
    paper = hx(a.paper)
    proc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{w}x{h}", "-r", str(a.fps), "-i", "-",
                             "-c:v", "libx264", "-crf", "17", "-pix_fmt", "yuv420p", a.out], stdin=subprocess.PIPE)
    yy, xx = np.mgrid[0:h, 0:w]
    for i in range(n):
        p = (i+1)/n; e = 1-(1-p)**2.2                       # ease-out travel
        jit = np.convolve(rng.normal(0, 1, L), np.ones(5)/5, "same")*2.2
        edge = base + jit + e*M*1.08 - 0.04*M                # tear position along travel axis
        coord = (yy if horiz else xx).astype(float)
        if a.direction in ("down", "right"): coord = (M-1) - coord
        e2 = edge[xx] if horiz else edge[yy]
        torn = coord < e2                                    # True = already torn away (shows B)
        width = rng.uniform(8, 18, L); w2 = (width[xx] if horiz else width[yy])
        paper_band = (coord >= e2) & (coord < e2 + w2)       # white fibre strip on top of A
        # A lifts a little while peeling: scale about the far side
        Af = A[i].astype(float)
        if p < 1:
            s = 1 + 0.04*e
            im = Image.fromarray(A[i]).resize((int(w*s), int(h*s)), Image.BILINEAR)
            ox = (im.width-w)//2; oy = (im.height-h)//2 if a.direction in ("up", "down") else (im.height-h)//2
            Af = np.asarray(im.crop((ox, oy, ox+w, oy+h)), float)
        shadow = np.clip(1 - (coord - e2 - w2)/ (0.03*M), 0, 1) * (coord >= e2) * 0.45     # soft shadow under the paper edge on A's side
        out = np.where(torn[..., None], B[i].astype(float), Af*(1-shadow[..., None]))
        fib = rng.uniform(0.9, 1.0, (h, w, 1))
        out = np.where(paper_band[..., None], paper*fib*0.97 + out*0.03, out)
        proc.stdin.write(np.clip(out, 0, 255).astype(np.uint8).tobytes())
    proc.stdin.close(); proc.wait()
    print("wrote", a.out, f"{w}x{h}", n, "frames")

if __name__ == "__main__":
    main()
