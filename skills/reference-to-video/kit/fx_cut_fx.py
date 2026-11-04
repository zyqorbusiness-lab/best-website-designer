#!/usr/bin/env python3
"""fx_cut_fx.py - Zyqor Motion Kit v5.5: the small punctuation effects seen in 11 of 12 references, as one ffmpeg wrapper.
  flash  = 1-3 frame white (or warm) flash on a cut         (refs 1 29.43 s, 4, 7, 11)
  bw     = black&white insert for a few frames/seconds      (refs 1, 2, 4, 9)
  punch  = digital punch-in 1.0 -> 1.15 (hard cut to the crop) (refs 6 17.43 s, 7, 10)
  whip   = horizontal whip blur over 4-6 frames             (refs 1, 2, 7, 8, 12)
  leak   = warm light leak (radial orange/amber, screen blend, decays in ~0.25 s)  (refs 5 12.82 s, 11 2.13 s)

  python3 fx_cut_fx.py in.mp4 out.mp4 flash --at 2.0
  python3 fx_cut_fx.py in.mp4 out.mp4 punch --at 3.2 --len 0.8 --amount 0.15
  python3 fx_cut_fx.py in.mp4 out.mp4 whip  --at 5.0 --len 0.17
  python3 fx_cut_fx.py in.mp4 out.mp4 leak  --at 7.0
Apply several by chaining: out of one is the input of the next. Audio is copied. Human feel: --jitter SEED moves the start by up to +-1 frame
and varies strength +-10 %. Needs ffmpeg 5+ and Pillow (leak only).
"""
import argparse, subprocess, sys, random, tempfile, os

def info(p):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height,r_frame_rate", "-of", "csv=p=0", p], capture_output=True, text=True).stdout.strip().split(",")
    n, d = r[2].split("/"); return int(r[0]), int(r[1]), float(n)/float(d)

def main():
    ap = argparse.ArgumentParser(description="Flash / B&W / punch-in / whip blur / warm light leak on a cut (Zyqor Motion Kit v5.5)")
    ap.add_argument("src"); ap.add_argument("out"); ap.add_argument("type", choices=["flash", "bw", "punch", "whip", "leak"])
    ap.add_argument("--at", type=float, required=True, help="seconds")
    ap.add_argument("--len", type=float, default=None); ap.add_argument("--amount", type=float, default=None)
    ap.add_argument("--color", default="white", help="flash colour (use a warm one: white, #FFE9C9, #FFB347)")
    ap.add_argument("--jitter", type=int, default=None)
    a = ap.parse_args()
    w, h, fps = info(a.src); fr = 1/fps
    rnd = random.Random(a.jitter) if a.jitter is not None else None
    t = a.at + (rnd.choice([-fr, 0, fr]) if rnd else 0); k = (1 + rnd.uniform(-.1, .1)) if rnd else 1
    if a.type == "flash":
        L = a.len or 3*fr; col = a.color
        vf = (f"drawbox=x=0:y=0:w=iw:h=ih:color={col}@{min(1,0.95*k):.2f}:t=fill:enable='between(t,{t:.3f},{t+L*0.5:.3f})',"
              f"drawbox=x=0:y=0:w=iw:h=ih:color={col}@{0.45*k:.2f}:t=fill:enable='between(t,{t+L*0.5:.3f},{t+L:.3f})'")
    elif a.type == "bw":
        L = a.len or 0.4
        vf = f"hue=s=0:enable='between(t,{t:.3f},{t+L:.3f})',eq=contrast=1.25:enable='between(t,{t:.3f},{t+L:.3f})'"
    elif a.type == "punch":
        L = a.len or 0.8; amt = (a.amount or 0.15)*k
        z = f"(1+{amt:.3f}*min(1,max(0,(t-{t:.3f})/{min(0.25,L/2):.3f}))*if(between(t,{t:.3f},{t+L:.3f}),1,0))"
        vf = f"scale=w='trunc(iw*{z}/2)*2':h='trunc(ih*{z}/2)*2':eval=frame,crop={w}:{h}"
    elif a.type == "whip":
        L = a.len or 0.17; s = int(70*k)
        vf = f"avgblur=sizeX={s}:sizeY=1:enable='between(t,{t:.3f},{t+L:.3f})',eq=brightness=0.06:enable='between(t,{t:.3f},{t+L:.3f})'"
    else:
        L = a.len or 0.28
        from PIL import Image
        import numpy as np
        yy, xx = np.mgrid[0:h//4, 0:w//4]; cx, cy = w/8*(0.4 + (rnd.random()*0.6 if rnd else 0.6)), h/8*0.5
        d = np.sqrt(((xx-cx)/(w/4))**2 + ((yy-cy)/(h/4))**2); v = np.clip(1.15-d*1.5, 0, 1)**1.6
        img = np.stack([255*v, 150*v, 40*v], -1).astype(np.uint8)
        tmp = os.path.join(tempfile.mkdtemp(prefix="zq_leak_"), "leak.png"); Image.fromarray(img).resize((w, h), Image.BICUBIC).save(tmp)
        # both streams to planar RGB first: blending RGB leak planes against YUV video planes gives a pink/purple cast (found in the v5.5 test)
        fc = (f"[0:v]format=gbrp[bv];[1:v]format=gbrp,fade=t=in:st={t:.3f}:d={L*0.2:.3f}:alpha=0,fade=t=out:st={t+L*0.35:.3f}:d={L*0.65:.3f}:alpha=0,setpts=PTS[lk];"
              f"[bv][lk]blend=all_mode=screen:enable='between(t,{t:.3f},{t+L:.3f})':shortest=1,format=yuv420p[v]")
        cmd = ["ffmpeg", "-v", "error", "-y", "-i", a.src, "-loop", "1", "-framerate", f"{fps}", "-t", f"{t+L+0.1:.3f}", "-i", tmp, "-filter_complex", fc, "-map", "[v]", "-map", "0:a?",
               "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p", "-c:a", "copy", a.out]
        r = subprocess.run(cmd, capture_output=True, text=True)
        if r.returncode: print(r.stderr[-1200:]); sys.exit(1)
        print("wrote", a.out, a.type, "at", round(t, 3)); return
    cmd = ["ffmpeg", "-v", "error", "-y", "-i", a.src, "-vf", vf, "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p", "-c:a", "copy", a.out]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode: print(r.stderr[-1200:]); sys.exit(1)
    print("wrote", a.out, a.type, "at", round(t, 3))

if __name__ == "__main__":
    main()
