#!/usr/bin/env python3
"""screen_video.py — turn UI screenshots into a 'screen recording' (cursor moves, click rings, typing reveals, state swaps)
to use as the MOVIE texture on the Blender device (screen3d.py / hero). Zyqor Motion Kit v3.
  python3 screen_video.py timeline.json OUT.mp4
timeline.json:
{ "size": [2160,1350], "fps": 30, "seconds": 16,
  "states":  [{"t":0, "img":"s2.jpg"}, {"t":4.7, "img":"s3_blank.jpg"}],          # hard swaps (UI changed)
  "reveals": [{"t0":4.8, "t1":5.6, "img":"s3_typed.jpg", "box":[212,297,488,356], "steps":21}],  # typing: wipe a region in, stepped
  "cursor":  [{"t":4.0, "xy":[900,700], "show":true}, {"t":4.6, "xy":[450,330]}, {"t":9.9, "xy":[300,640], "show":false}],
  "clicks":  [{"t":4.7, "xy":[450,330]}],
  "cursor_scale": 1.0 }
Cursor moves ease in-out (cubic) between keys; a click = cursor press (scale 0.85) + expanding ring 0.35 s.
"""
import sys, json, math, os, subprocess
from PIL import Image, ImageDraw, ImageFilter
def ease(x): return 4*x*x*x if x<0.5 else 1-pow(-2*x+2,3)/2
def cursor_img(s=1.0):
    S=int(64*s); im=Image.new('RGBA',(S+8,S+8),(0,0,0,0)); d=ImageDraw.Draw(im)
    pts=[(0,0),(0,46),(12,35),(20,54),(28,50),(20,32),(36,32)]; pts=[(4+x*s*1.1,4+y*s*1.1) for x,y in pts]
    sh=Image.new('RGBA',im.size,(0,0,0,0)); ImageDraw.Draw(sh).polygon([(x+3,y+5) for x,y in pts],fill=(0,0,0,110))
    sh=sh.filter(ImageFilter.GaussianBlur(3)); im=Image.alpha_composite(im,sh); d=ImageDraw.Draw(im)
    d.polygon(pts,fill=(255,255,255,255),outline=(0,0,0,255)); d.line(pts+[pts[0]],fill=(0,0,0,255),width=max(2,int(3*s)))
    return im
def main():
    tl=json.load(open(sys.argv[1])); out=sys.argv[2]; base=os.path.dirname(os.path.abspath(sys.argv[1]))
    W,H=tl.get("size",[2160,1350]); fps=tl.get("fps",30); N=int(round(tl["seconds"]*fps))
    load=lambda p: Image.open(p if os.path.isabs(p) else os.path.join(base,p)).convert('RGB').resize((W,H))
    cache={}
    def img(p):
        if p not in cache: cache[p]=load(p)
        return cache[p]
    cur=cursor_img(tl.get("cursor_scale",1.0)*W/1440)
    tmp=out+".frames"; os.makedirs(tmp,exist_ok=True)
    states=sorted(tl["states"],key=lambda s:s["t"]); ck=tl.get("cursor",[]); clicks=tl.get("clicks",[])
    for f in range(N):
        t=f/fps
        st=[s for s in states if s["t"]<=t+1e-6][-1]; fr=img(st["img"]).copy()
        for r in tl.get("reveals",[]):
            if t>=r["t0"] and any(s["t"]<=r["t0"]+1e-6 for s in states) and not any(r["t0"]<s["t"]<=t for s in states):
                k=min(1,(t-r["t0"])/(r["t1"]-r["t0"])); n=r.get("steps",0)
                if n: k=math.floor(k*n)/n
                x0,y0,x1,y1=r["box"]; xe=int(x0+(x1-x0)*k)
                if xe>x0: fr.paste(img(r["img"]).crop((x0,y0,xe,y1)),(x0,y0))
        if ck:
            prev=[c for c in ck if c["t"]<=t]; nxt=[c for c in ck if c["t"]>t]
            vis=False; xy=None
            if prev:
                p=prev[-1]; vis=p.get("show",True) if "show" in p else ([c for c in prev if "show" in c][-1]["show"] if any("show" in c for c in prev) else True)
                if nxt:
                    q=nxt[0]; k=ease((t-p["t"])/(q["t"]-p["t"])); xy=(p["xy"][0]+(q["xy"][0]-p["xy"][0])*k, p["xy"][1]+(q["xy"][1]-p["xy"][1])*k)
                else: xy=tuple(p["xy"])
            if vis and xy:
                ov=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(ov); sc=1.0
                for c in clicks:
                    dt=t-c["t"]
                    if 0<=dt<0.35:
                        R=int((18+90*ease(dt/0.35))*W/1440); a=int(200*(1-dt/0.35)); cx,cy=c["xy"]
                        d.ellipse([cx-R,cy-R,cx+R,cy+R],outline=(36,83,255,a),width=int(7*W/1440))
                        d.ellipse([cx-R*0.45,cy-R*0.45,cx+R*0.45,cy+R*0.45],fill=(36,83,255,int(a*0.35)))
                    if -0.06<=dt<0.12: sc=0.86
                c2=cur if sc==1.0 else cur.resize((int(cur.width*sc),int(cur.height*sc)))
                ov.alpha_composite(c2,(int(xy[0]-4),int(xy[1]-4)))
                fr=Image.alpha_composite(fr.convert('RGBA'),ov).convert('RGB')
        fr.save(f"{tmp}/{f:05d}.jpg",quality=93)
    subprocess.run(["ffmpeg","-v","error","-y","-framerate",str(fps),"-i",f"{tmp}/%05d.jpg","-c:v","libx264","-crf","14","-preset","medium","-pix_fmt","yuv420p",out],check=True,timeout=900)
    subprocess.run(["rm","-rf",tmp]); print("screen_video:",out,N,"frames")
if __name__=="__main__": main()
