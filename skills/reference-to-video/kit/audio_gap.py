#!/usr/bin/env python3
"""audio_gap.py - Zyqor Motion Kit v5.5: MEASURE a mix's sound design (you cannot listen; numbers only) and compare with the 12 Nov-4 references.
  python3 audio_gap.py final.mp4
  python3 audio_gap.py final.mp4 --vo vo_clean.wav --sfx sfx.wav [--events sfx_events.json]   # + how loud the sfx really are in the mix
Prints: integrated LUFS, true peak, crest, band shares (sub 30-90 Hz, air 4-11 kHz vs mids), sfx contribution vs voice vs music (regression,
needs --vo and --sfx = the dry tracks that were mixed), per-event audibility margin (needs --events: [{"t":sec,"sfx":"name"}...]), and PASS/WARN
against the reference medians. Measured on the references (12 reels, Nov 4 2026): LUFS -14.2, true peak -0.7 dBTP, crest 15.8 dB,
sub share -7.3 dB, air vs mid -15.8 dB, 0.46 low-heavy hits/s. Our behind-head reel (before v5.5): sfx 27 dB under the voice, sub share -21 dB.
Needs: ffmpeg, numpy, scipy (librosa optional - not required).
"""
import argparse, json, re, subprocess, sys, os
import numpy as np

REF = {"lufs": -14.2, "tp": -0.7, "crest": 15.8, "sub": -7.3, "air_vs_mid": -15.8, "hits_per_s": 0.46}

def load(path, sr=22050):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-vn", "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64)

def ebur(path):
    r = subprocess.run(["ffmpeg", "-nostats", "-hide_banner", "-i", path, "-vn", "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    I = float(re.findall(r"I:\s+([-\d.]+) LUFS", r)[-1]); tp = re.findall(r"Peak:\s+([-\d.]+) dBFS", r)
    return I, (float(tp[-1]) if tp else float("nan"))

def stft_pow(y, sr=22050, n=2048, hop=441):
    w = np.hanning(n); k = 1 + (len(y)-n)//hop
    idx = np.arange(n)[None, :] + hop*np.arange(k)[:, None]
    S = np.abs(np.fft.rfft(y[idx]*w, axis=1))**2
    return S, np.fft.rfftfreq(n, 1/sr)

def rdb(x): return 10*np.log10(np.mean(x**2)+1e-12)

def main():
    ap = argparse.ArgumentParser(description="Measure sound design of a mix and compare with the 12 references (Zyqor Motion Kit v5.5)")
    ap.add_argument("mix"); ap.add_argument("--vo"); ap.add_argument("--sfx"); ap.add_argument("--events"); ap.add_argument("--json", action="store_true")
    a = ap.parse_args()
    y = load(a.mix); I, tp = ebur(a.mix)
    crest = 20*np.log10(np.abs(y).max()/np.sqrt(np.mean(y**2)+1e-12))
    S, f = stft_pow(y)
    b = lambda lo, hi: S[:, (f >= lo) & (f < hi)].sum(1)
    sub, low, mid, hi = b(30, 90), b(90, 250), b(250, 4000), b(4000, 11000)
    tot = (sub+low+mid+hi).sum()+1e-12
    out = {"lufs": I, "tp": tp, "crest": round(float(crest), 1), "sub": round(float(10*np.log10(sub.sum()/tot+1e-12)), 1),
           "air_vs_mid": round(float(10*np.log10(np.median(hi)+1e-12)-10*np.log10(np.median(mid)+1e-12)), 1)}
    if a.vo and a.sfx:
        n = len(y); vo = load(a.vo); sx = load(a.sfx)
        from scipy.signal import fftconvolve
        c = fftconvolve(y, vo[::-1], mode="full"); lag = int(np.argmax(np.abs(c))-(len(vo)-1))
        vv = np.zeros(n); s0 = max(lag, 0); seg = vo[max(-lag, 0):][:n-s0]; vv[s0:s0+len(seg)] = seg
        ss = np.zeros(n); m = min(n, len(sx)); ss[:m] = sx[:m]
        X = np.stack([vv, ss], 1); coef = np.linalg.lstsq(X, y, rcond=None)[0]
        rest = y - X @ coef
        out.update({"voice_gain": round(float(coef[0]), 2), "sfx_gain": round(float(coef[1]), 2), "voice_rms_db": round(rdb(coef[0]*vv), 1),
                    "sfx_rms_db": round(rdb(coef[1]*ss), 1), "music_rest_rms_db": round(rdb(rest), 1)})
        out["sfx_under_voice_db"] = round(out["voice_rms_db"]-out["sfx_rms_db"], 1)
        out["sfx_under_music_db"] = round(out["music_rest_rms_db"]-out["sfx_rms_db"], 1)
        if a.events:
            ev = json.load(open(a.events)); sxg = coef[1]*ss; rest2 = y - sxg; w = int(0.15*22050); marg = []
            for e in ev:
                i = int(e["t"]*22050); marg.append(rdb(sxg[i:i+w]) - rdb(rest2[i:i+w]))
            out["events"] = len(ev); out["event_margin_median_db"] = round(float(np.median(marg)), 1); out["events_within_12db"] = int(sum(1 for m_ in marg if m_ > -12))
            out["events_per_s"] = round(len(ev)/(len(y)/22050), 2)
    warn = []
    if out["tp"] > -0.3 or out["tp"] != out["tp"]: warn.append("true peak above -0.3 dBTP (limit to -1.0)")
    if out["tp"] < -2.0: warn.append("true peak %.1f dBTP: refs sit at ~-0.7 (more punch available)" % out["tp"])
    if abs(out["lufs"]+14) > 0.8: warn.append("loudness %.1f LUFS, target -14" % out["lufs"])
    if out["sub"] < REF["sub"]-6: warn.append("sub-bass share %.1f dB vs refs %.1f: add low end (bed EQ / impact sub tail)" % (out["sub"], REF["sub"]))
    if out["air_vs_mid"] < REF["air_vs_mid"]-6: warn.append("air (4-11k) vs mid %.1f dB vs refs %.1f: add noise-swell air on whooshes" % (out["air_vs_mid"], REF["air_vs_mid"]))
    if "sfx_under_voice_db" in out and out["sfx_under_voice_db"] > 18: warn.append("sfx are %.1f dB under the voice (limit 18): raise the sfx bus" % out["sfx_under_voice_db"])
    if "events_per_s" in out and out["events_per_s"] > 2.0: warn.append("%.1f sfx events/s: refs use ~0.5-1.5; sound only big words, cuts, transitions" % out["events_per_s"])
    if "events_within_12db" in out and out["events"] and out["events_within_12db"]/out["events"] < 0.7: warn.append("only %d/%d sfx events within 12 dB of voice+music (need >= 70 %%)" % (out["events_within_12db"], out["events"]))
    out["verdict"] = "PASS" if not warn else "WARN"; out["warnings"] = warn; out["refs_median"] = REF
    if a.json: print(json.dumps(out, indent=1)); return
    for k, v in out.items():
        if k not in ("warnings", "refs_median"): print(f"{k:24s} {v}")
    for w_ in warn: print("  ! " + w_)
    print("(measured numbers only - nobody listened; final judge = Sujon's ears)")

if __name__ == "__main__":
    main()
