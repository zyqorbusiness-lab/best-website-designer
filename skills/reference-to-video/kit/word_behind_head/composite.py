
import os,sys,json,subprocess,numpy as np,cv2,time
cv2.setNumThreads(4)
B=os.environ.get('BH','.')+'/'   # project root; expects work/masks, ec/wseq, ec/cseq, work/assets/...
W_,H_=1080,1920; FPS=30; DUR=16.5; N=int(round(DUR*FPS))
PLATE=B+'work/assets/pinterest/subject/941885709591249527.mp4'; SS=10.0
out=sys.argv[1]; a0=int(sys.argv[2]) if len(sys.argv)>2 else 0; a1=int(sys.argv[3]) if len(sys.argv)>3 else N
bigs=json.load(open(B+'ec/bigs.json'))
rd=subprocess.Popen(['ffmpeg','-v','error','-ss',str(SS+a0/FPS),'-i',PLATE,'-vf','fps=30,scale=%d:%d:flags=lanczos:in_color_matrix=bt709:in_range=tv'%(W_,H_),'-frames:v',str(a1-a0),'-pix_fmt','rgb24','-f','rawvideo','-'],stdout=subprocess.PIPE)
wr=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s','%dx%d'%(W_,H_),'-r','30','-i','-','-vf','scale=out_color_matrix=bt709:out_range=tv,format=yuv420p','-c:v','libx264','-preset','medium','-crf','18','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-color_range','tv','-movflags','+faststart',out],stdin=subprocess.PIPE)
def ease(u): return u*u*(3-2*u)
def mask_for(k):
    if k>=300: idx=k-300+1
    elif 270<=k<300: idx=1001+(k-270)
    else: return None
    def ld(i):
        p=B+'work/masks/m%04d.png'%i
        return cv2.imread(p,cv2.IMREAD_GRAYSCALE) if os.path.exists(p) else None
    m=ld(idx)
    if m is not None: return m,True
    # interpolate between neighbours
    nb=[ld(idx-1),ld(idx+1)]
    nb=[x for x in nb if x is not None]
    if not nb: return None
    return np.mean(np.stack(nb).astype(np.float32),0).astype(np.uint8),False
yy,xx=np.mgrid[0:H_,0:W_].astype(np.float32)
vig=1-0.20*np.clip((((xx-W_/2)/(W_*0.62))**2+((yy-H_/2)/(H_*0.62))**2)-0.18,0,1)
vig=vig[...,None].astype(np.float32)
rng=np.random.default_rng(7)
TH=np.arctan2(yy-470,xx-540).astype(np.float32); RR=np.hypot(xx-540,yy-470); FALL=np.exp(-RR/760).astype(np.float32)
SCR=(1-0.40*np.exp(-((yy-1150)/210.0)**2))[...,None].astype(np.float32)
stats=[]
PX,PY=540,900
def scl(img,s,interp=cv2.INTER_LINEAR):
    M=np.float32([[s,0,PX*(1-s)],[0,s,PY*(1-s)]]); return cv2.warpAffine(img,M,(W_,H_),flags=interp,borderMode=cv2.BORDER_REPLICATE)
def rgba(p):
    im=cv2.imread(p,cv2.IMREAD_UNCHANGED)
    if im is None: return None
    return im
for n in range(a0,a1):
    raw=rd.stdout.read(W_*H_*3)
    if len(raw)<W_*H_*3: break
    t=n/FPS; u=ease(min(1,t/DUR))
    plate=np.frombuffer(raw,np.uint8).reshape(H_,W_,3).astype(np.float32)
    # grade: light warm lift, gentle contrast, vignette (done before the push so the grade moves with the plate)
    g=plate*np.array([1.025,1.0,0.965],np.float32)
    g=(g-128)*1.07+128+3
    g=g*vig
    k=int(round((SS+t)*25))
    zs=[(0.99,1.04),(2.30,1.0),(4.79,1.06),(7.27,1.0),(10.71,1.08),(12.97,1.03),(15.35,1.0)]
    z=1.0
    for (ts_,zv) in zs:
        if t>=ts_-0.02:
            e_=ease(min(1,(t-(ts_-0.02))/0.13)); z=zprev*(1-e_)+zv*e_ if False else None
    z=1.0; zp=1.0
    for (ts_,zv) in zs:
        if t>=ts_-0.02:
            e_=ease(min(1,(t-(ts_-0.02))/0.13)); z=zp*(1-e_)+zv*e_
        zp=zv if t>=ts_+0.11 else zp
    s_p=(1+0.075*u)*z; s_w=(1+0.040*u)*z; s_c=(1+0.105*u)*z
    base=scl(g,s_p)
    amt=0.0
    for b in bigs: amt=max(amt,min(1,max(0,(t-(b['a']-0.05))/0.12))*min(1,max(0,(b['b']+0.05-t)/0.12)))
    if amt>0:
        ray=0.5+0.5*np.sin(16*TH+0.5*t); ray=np.clip((ray-0.45)*2.2,0,1)**1.4
        base=base+(ray*FALL*amt*46)[...,None]*np.array([1.0,0.52,0.18],np.float32)
    wi=rgba(B+'ec/wseq/w_%05d.png'%n)
    wa=None
    if wi is not None and wi[...,3].max()>0:
        wa=wi[...,3:4].astype(np.float32)/255
        wrgb=wi[...,2::-1].astype(np.float32)  # BGR->RGB
        wsc=scl(np.concatenate([wrgb,wa*255],2),s_w)
        wa=wsc[...,3:4]/255; wrgb=wsc[...,:3]
        base=base*(1-wa)+wrgb*wa
        # tiny exposure tick at each pop
        for b in bigs:
            d=t-b['a']
            if 0<=d<0.17: base=base*(1+0.035*(1-d/0.17))
    mk=mask_for(k)
    if wa is not None and mk is not None:
        m,true_=mk
        m=cv2.resize(m,(W_,H_),interpolation=cv2.INTER_CUBIC).astype(np.float32)/255
        m=np.clip((m-0.12)/0.76,0,1); m=m*m*(3-2*m)
        m=scl(m,s_p)[...,None]
        sub=scl(g,s_p)
        # restore the subject over the word
        base=base*(1-m)+sub*m
        sel=wa[...,0]>0.5
        cov=float((m[...,0][sel]>0.5).mean()) if sel.any() else 0
        stats.append(dict(n=n,t=round(t,3),cover=round(cov,4),true=bool(true_),area=float((m>0.5).sum())))
    elif wa is not None and mk is None:
        stats.append(dict(n=n,t=round(t,3),cover=None,true=False,area=0))
    base=base*SCR
    ci=rgba(B+'ec/cseq/c_%05d.png'%n)
    if ci is not None and ci[...,3].max()>0:
        ca=np.concatenate([ci[...,2::-1].astype(np.float32),ci[...,3:4].astype(np.float32)],2)
        csc=scl(ca,s_c); a=csc[...,3:4]/255
        base=base*(1-a)+csc[...,:3]*a
    # human feel: handheld wobble + gate weave + exposure flicker + dust
    dx=2.6*np.sin(2*np.pi*0.37*t+0.7)+1.6*np.sin(2*np.pi*0.91*t+2.1)+rng.normal(0,0.45)
    dy=2.2*np.sin(2*np.pi*0.29*t+1.9)+1.4*np.sin(2*np.pi*1.13*t+0.4)+rng.normal(0,0.45)
    th=0.10*np.sin(2*np.pi*0.23*t+0.3)
    Mw=cv2.getRotationMatrix2D((W_/2,H_/2),th,1.0); Mw[0,2]+=dx; Mw[1,2]+=dy
    base=cv2.warpAffine(base,Mw,(W_,H_),flags=cv2.INTER_LINEAR,borderMode=cv2.BORDER_REPLICATE)
    base=base*(1+rng.normal(0,0.008))
    dr=np.random.default_rng(1000+n//2); cv_=np.zeros((H_,W_),np.float32)
    for _ in range(int(dr.integers(5,13))):
        x_,y_=int(dr.integers(0,W_)),int(dr.integers(0,H_)); cv2.circle(cv_,(x_,y_),int(dr.integers(1,4)),float(dr.uniform(0.25,0.6)),-1,cv2.LINE_AA)
    if dr.random()<0.05:
        x_=int(dr.integers(0,W_)); y_=int(dr.integers(0,H_-400)); cv2.line(cv_,(x_,y_),(x_+int(dr.integers(-3,4)),y_+int(dr.integers(120,400))),0.3,1,cv2.LINE_AA)
    cv_=cv2.GaussianBlur(cv_,(0,0),0.7)
    base=base+cv_[...,None]*np.array([255,238,205],np.float32)*0.55
    # grain
    gr=rng.normal(0,2.4,(H_,W_,1)).astype(np.float32)
    base=base+gr
    fade=min(1,max(0,(DUR-t)/0.25)); base=base*fade
    wr.stdin.write(np.clip(base,0,255).astype(np.uint8).tobytes())
wr.stdin.close(); wr.wait()
json.dump(stats,open(out+'.stats.json','w'))
print('done',out,len(stats))
