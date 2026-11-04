
import sys, json, re, subprocess, os, numpy as np, librosa, scipy.signal as ss, scipy.ndimage as sn
def ebur(path):
    r=subprocess.run(["ffmpeg","-nostats","-hide_banner","-i",path,"-vn","-af","ebur128=peak=true:metadata=1,ametadata=mode=print:key=lavfi.r128.M:file=-","-f","null","-"],capture_output=True,text=True)
    rows=[]
    ts=re.findall(r"pts_time:([\d.]+)\s*\nlavfi.r128.M=([-\d.]+)",r.stdout)
    for a,b in ts: rows.append((float(a),max(float(b),-120.0),0))
    I=float(re.findall(r"I:\s+([-\d.]+) LUFS",r.stderr)[-1]); LRA=float(re.findall(r"LRA:\s+([\d.]+) LU",r.stderr)[-1])
    tp=re.findall(r"Peak:\s+([-\d.]+) dBFS",r.stderr)
    return I,LRA,(float(tp[-1]) if tp else None),rows
def run(path, vis=None, speech=None, sr=22050):
    y,_=librosa.load(path,sr=sr,mono=True)
    dur=len(y)/sr
    I,LRA,TP,rows=ebur(path)
    hop=int(sr*0.010)
    S=np.abs(librosa.stft(y,n_fft=1024,hop_length=hop))**2
    freqs=librosa.fft_frequencies(sr=sr,n_fft=1024)
    # percussive via HPSS
    H,P=librosa.decompose.hpss(S**0.5,kernel_size=(17,9)); P=P**2; 
    def band(M,lo,hi): return M[(freqs>=lo)&(freqs<hi)].sum(0)
    def db(x): return 10*np.log10(x+1e-12)
    tot=db(S.sum(0)); perc=db(P.sum(0))
    lowP=band(P,20,200); midP=band(P,200,3000); hiP=band(P,3000,11000)
    n=S.shape[1]; times=np.arange(n)*0.010
    # hit detector on percussive broadband+hi envelope
    env=db(P.sum(0)); envs=ss.medfilt(env,3)
    hits=[]; last=-1
    floor=np.array([np.percentile(envs[max(0,i-50):i+1],30) for i in range(n)])
    for i in range(6,n-30):
        rise=envs[i]-envs[i-6:i-1].min()
        if rise>=8 and envs[i]>=envs[i-1] and (i-last)>=12 and envs[i]-floor[i]>=8:
            # find local peak within 120 ms
            j=i+int(np.argmax(envs[i:i+12])); 
            # tail time: fall by 12 dB from peak
            pk=envs[j]; k=j
            while k<n-1 and envs[k]>pk-12 and k-j<150: k+=1
            tail=(k-j)*0.01
            seg=slice(i,min(n,i+30))
            lo=lowP[seg].sum();mi=midP[seg].sum();hi=hiP[seg].sum();tt=lo+mi+hi+1e-12
            cen=float((freqs[:,None]*P[:,seg]).sum()/(P[:,seg].sum()+1e-12))
            flat=float(np.mean(librosa.feature.spectral_flatness(S=P[:,seg]+1e-12)))
            hits.append(dict(t=round(times[i],3),rise=round(float(rise),1),tail=round(tail,2),low=round(float(lo/tt),2),mid=round(float(mi/tt),2),hi=round(float(hi/tt),2),cen=round(cen),flat=round(flat,3)))
            last=i
    # classify
    for h in hits:
        if h['low']>0.45 and h['tail']>=0.12: h['type']='impact/boom'
        elif h['tail']<0.12 and h['hi']>0.3: h['type']='click/tick/pop'
        elif h['hi']>0.4 and h['tail']>=0.12: h['type']='whoosh/swish'
        elif h['low']>0.3: h['type']='thud/low-pop'
        else: h['type']='other/mid (voice consonant or music)'
    # risers: hi-band smoothed envelope slope
    hb=db(sn.uniform_filter1d(hiP,20)); risers=[]
    i=0
    while i<n-80:
        w=hb[i:i+80]  # 0.8s
        if w[-1]-w[0]>=12 and np.all(np.diff(sn.uniform_filter1d(w,8))>-0.6) :
            risers.append(round(float(times[i]),2)); i+=100
        else: i+=5
    # speech mask from whisper segments
    sp=np.zeros(n,bool)
    for a,b in (speech or []): sp[int(a*100):int(b*100)]=True
    # level of hits vs bed (full mix 50 ms rms)
    rms=librosa.feature.rms(y=y,frame_length=int(sr*0.05),hop_length=hop)[0]; rdb=db(rms**2)
    for h in hits:
        i=int(h['t']*100); a=max(0,i-150); b=min(n,i+150)
        mask=np.ones(b-a,bool); mask[max(0,i-a-5):i-a+40]=False
        bed=np.median(rdb[a:b][mask]) if mask.any() else rdb[a]
        pkv=rdb[i:i+30].max()
        h['lift_db']=round(float(pkv-bed),1); h['peak_dbfs']=round(float(pkv),1); h['in_speech']=bool(sp[min(i,n-1)])

    sub=db(band(P,30,90)); sub_s=ss.medfilt(sub,3); subhits=[]; ls=-1
    for i in range(6,n-10):
        if sub_s[i]-sub_s[i-6:i-1].min()>=10 and sub_s[i]>=sub_s[i-1] and (i-ls)>=20 and sub_s[i]>np.percentile(sub_s,60):
            subhits.append(round(times[i],2)); ls=i
    air=db(band(P,5000,11000)); air_s=ss.medfilt(air,3); airhits=[]; la=-1
    for i in range(6,n-10):
        if air_s[i]-air_s[i-6:i-1].min()>=12 and air_s[i]>=air_s[i-1] and (i-la)>=15 and air_s[i]>np.percentile(air_s,60):
            airhits.append(round(times[i],2)); la=i
    # pauses between words (>=0.3 s) and voice-over-bed estimate
    words=[]
    if speech: words=[tuple(x) for x in speech]
    pm=np.zeros(n,bool)
    for a,b in zip([w[1] for w in words[:-1]],[w[0] for w in words[1:]]):
        if b-a>=0.3: pm[int((a+0.08)*100):int((b-0.05)*100)]=True
    wm=np.zeros(n,bool)
    for a,b in words: wm[int(a*100):int(b*100)]=True
    rms2=librosa.feature.rms(y=y,frame_length=int(sr*0.05),hop_length=hop)[0]**2
    pw=10*np.log10(np.mean(rms2[pm])+1e-12) if pm.sum()>20 else None
    ww=10*np.log10(np.mean(rms2[wm])+1e-12) if wm.sum()>20 else None
    vb=None
    if pw is not None and ww is not None and ww>pw+0.5: vb=round(10*np.log10((10**(ww/10)-10**(pw/10)))-pw,1)
    # density
    win=5.0; dens=[]
    for s in np.arange(0,dur,win):
        k=[h for h in hits if s<=h['t']<s+win]; dens.append(round(len(k)/min(win,dur-s),2))
    # LUFS speech vs nonspeech from momentary M
    Mt=np.array([(a,b) for a,b,c in rows]) if rows else np.zeros((0,2))
    msp=[b for a,b in Mt if sp[min(int(a*100),n-1)]] ; mnsp=[b for a,b in Mt if not sp[min(int(a*100),n-1)]]
    out=dict(file=os.path.basename(path),dur=round(dur,2),I=I,LRA=LRA,TP=TP,
        M_speech_median=(round(float(np.median(msp)),1) if msp else None),M_nonspeech_median=(round(float(np.median(mnsp)),1) if mnsp else None),
        speech_frac=round(float(sp.mean()),2),
        n_hits=len(hits),hits_per_s=round(len(hits)/dur,2),n_hits_nonspeech=sum(1 for h in hits if not h['in_speech']),
        hits=hits,risers=risers,density_5s=dens,
        lift_median=round(float(np.median([h['lift_db'] for h in hits])),1) if hits else None,
        types={t:sum(1 for h in hits if h['type']==t) for t in set(h['type'] for h in hits)},
        M_series=[(round(a,1),b) for a,b,c in rows[::10]],
        silence_gaps=None,sub_hits=subhits,air_hits=airhits,n_pause_frames=int(pm.sum()),pause_bed_db=(round(float(pw),1) if pw is not None else None),word_level_db=(round(float(ww),1) if ww is not None else None),voice_over_bed_db=vb)
    # silence gaps (<-55 dBFS frame rms for >0.3 s)
    quiet=rdb<-55; gaps=[];st=None
    for i,q in enumerate(quiet):
        if q and st is None: st=i
        if (not q) and st is not None:
            if (i-st)>=30: gaps.append((round(st/100,2),round((i-st)/100,2)))
            st=None
    if st is not None and (n-st)>=30: gaps.append((round(st/100,2),round((n-st)/100,2)))
    out['silence_gaps']=gaps
    # cross-check with visual events
    if vis:
        res=[]
        ht=np.array([h['t'] for h in hits]) if hits else np.array([])
        for c in vis:
            if len(ht)==0: break
            d=ht-c; k=int(np.argmin(np.abs(d))); res.append(round(float(d[k])*1000))
        out['cut_to_nearest_hit_ms']=res
        out['cuts_with_hit_within_100ms']=sum(1 for r in res if abs(r)<=100)
        out['n_vis_events']=len(vis)
    return out
if __name__=="__main__":
    path=sys.argv[1]; outp=sys.argv[2]
    vis=json.load(open(sys.argv[3])) if len(sys.argv)>3 and os.path.exists(sys.argv[3]) else None
    speech=json.load(open(sys.argv[4])) if len(sys.argv)>4 and os.path.exists(sys.argv[4]) else None
    json.dump(run(path,vis,speech),open(outp,"w"),default=float)
