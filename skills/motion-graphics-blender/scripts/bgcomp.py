#!/usr/bin/env python3
"""bgcomp.py — make a gradient(+blobs) background PNG and/or comp an RGBA Blender render over it (quick previews / ffmpeg pipeline).
  python3 bgcomp.py bg OUT.png --top "#ffe3d3" --bottom "#ff8f73" [--blobs "#ffd1e8,#c9dcff"] [--w 1080 --h 1920]
  python3 bgcomp.py over RENDER.png BG.png OUT.jpg
"""
import sys, argparse
from PIL import Image, ImageDraw, ImageFilter
import numpy as np
def h2(c): c=c.lstrip('#'); return tuple(int(c[i:i+2],16) for i in (0,2,4))
def bg(out, top, bottom, blobs, w, h, grain=True):
    t=np.array(h2(top),float); b=np.array(h2(bottom),float)
    y=np.linspace(0,1,h)[:,None,None]; y=y*y*(3-2*y)
    img=(t*(1-y)+b*y)*np.ones((h,w,3)); im=Image.fromarray(img.astype('uint8'))
    if blobs:
        lay=Image.new('RGBA',(w,h),(0,0,0,0)); d=ImageDraw.Draw(lay)
        spots=[(0.15,0.18,0.42),(0.85,0.32,0.36),(0.25,0.78,0.40),(0.8,0.9,0.3)]
        for i,c in enumerate(blobs.split(',')):
            x,yy,r=spots[i%len(spots)]; R=int(r*w)
            d.ellipse([x*w-R,yy*h-R,x*w+R,yy*h+R],fill=h2(c)+(150,))
        lay=lay.filter(ImageFilter.GaussianBlur(w*0.12)); im=Image.alpha_composite(im.convert('RGBA'),lay).convert('RGB')
    if grain:
        a=np.array(im).astype(float); a+=np.random.normal(0,3.0,a.shape); im=Image.fromarray(np.clip(a,0,255).astype('uint8'))
    im.save(out)
if __name__=='__main__':
    if sys.argv[1]=='bg':
        p=argparse.ArgumentParser(); p.add_argument('cmd'); p.add_argument('out'); p.add_argument('--top',default='#ffe3d3'); p.add_argument('--bottom',default='#ff8f73')
        p.add_argument('--blobs',default=''); p.add_argument('--w',type=int,default=1080); p.add_argument('--h',type=int,default=1920)
        a=p.parse_args(); bg(a.out,a.top,a.bottom,a.blobs,a.w,a.h)
    else:
        r=Image.open(sys.argv[2]).convert('RGBA'); b=Image.open(sys.argv[3]).convert('RGBA').resize(r.size)
        Image.alpha_composite(b,r).convert('RGB').save(sys.argv[4],quality=92)
