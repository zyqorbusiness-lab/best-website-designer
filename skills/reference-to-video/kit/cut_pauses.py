#!/usr/bin/env python3
"""cut_pauses.py — jump-cut a talking-head clip like the references (motion-kit v2, Nov 3 2026).
Removes every pause longer than --min-gap, alternates the framing 1.00x / --punch x on each new segment (the
classic punch-in that hides jump cuts), adds a 3-frame RGB-split + flash on each cut (ref 3's glitch cut), and
writes a time map so word timings (transcribe_words.py JSON) can be moved onto the new timeline.

Usage: python3 cut_pauses.py IN.mp4 OUT.mp4 [--audio CLEAN.wav] [--words words.json] [--min-gap 0.30]
                               [--pad-in 0.06] [--pad-out 0.10] [--punch 1.14] [--face 545,560] [--fps 30] [--no-flash]
  --audio : use this (cleaned) audio instead of IN's audio (same timeline as IN, e.g. clean_voice.sh output)
  --face  : x,y of the face in IN's pixels; punch-ins zoom around it so the face stays put
Outputs: OUT.mp4 (video + cut audio), OUT.map.json {segments:[[s,e,new_s]], duration}, OUT.words.json (if --words)
"""
import sys, json, subprocess, argparse, re
ap = argparse.ArgumentParser()
ap.add_argument("inp"); ap.add_argument("out")
ap.add_argument("--audio"); ap.add_argument("--words")
ap.add_argument("--min-gap", type=float, default=0.30); ap.add_argument("--db", default="-35dB")
ap.add_argument("--pad-in", type=float, default=0.06); ap.add_argument("--pad-out", type=float, default=0.10)
ap.add_argument("--punch", type=float, default=1.14); ap.add_argument("--face", default="540,700")
ap.add_argument("--fps", type=int, default=30); ap.add_argument("--no-flash", action="store_true")
a = ap.parse_args()
src_a = a.audio or a.inp
dur = float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",a.inp],capture_output=True,text=True).stdout)
log = subprocess.run(["ffmpeg","-hide_banner","-i",src_a,"-af",f"silencedetect=n={a.db}:d={a.min_gap}","-f","null","-"],capture_output=True,text=True,timeout=120).stderr
ss = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]; se = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
sil = list(zip(ss, se + [dur] * (len(ss) - len(se))))
speech, t = [], 0.0
for s, e in sil:
    if s - t > 0.05: speech.append((t, s))
    t = e
if dur - t > 0.05: speech.append((t, dur))
speech = [(max(0, s - a.pad_in), min(dur, e + a.pad_out)) for s, e in speech if e - s > 0.12]
merged = []
for s, e in speech:
    if merged and s <= merged[-1][1]: merged[-1] = (merged[-1][0], e)
    else: merged.append((s, e))
fx, fy = [float(v) for v in a.face.split(",")]
vparts, aparts, segs, nt = [], [], [], 0.0
for i, (s, e) in enumerate(merged):
    z = 1.0 if i % 2 == 0 else a.punch
    W, H = int(round(1080 * z / 2) * 2), int(round(1920 * z / 2) * 2)
    cx, cy = int(fx * (z - 1)), int(fy * (z - 1))
    flash = "" if (a.no_flash or i == 0) else ",rgbashift=rh=-16:bh=16:enable='lt(t,0.1)',eq=brightness=0.12:saturation=1.4:enable='lt(t,0.067)'"
    vparts.append(f"[0:v]trim={s:.3f}:{e:.3f},setpts=PTS-STARTPTS,fps={a.fps},scale={W}:{H}:flags=lanczos,crop=1080:1920:{cx}:{cy}{flash},setsar=1[v{i}]")
    aparts.append(f"[1:a]atrim={s:.3f}:{e:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.01,afade=t=out:st={max(0,e-s-0.012):.3f}:d=0.012[a{i}]")
    segs.append([round(s, 3), round(e, 3), round(nt, 3)]); nt += e - s
n = len(merged)
fc = ";".join(vparts + aparts) + ";" + "".join(f"[v{i}][a{i}]" for i in range(n)) + f"concat=n={n}:v=1:a=1[v][a]"
cmd = ["nice","-n","10","timeout","-k","10","600","ffmpeg","-v","error","-y","-i",a.inp,"-i",src_a,"-filter_complex",fc,"-map","[v]","-map","[a]",
       "-c:v","libx264","-preset","medium","-crf","16","-pix_fmt","yuv420p","-c:a","pcm_s16le" if a.out.endswith(".mov") else "aac","-b:a","256k",a.out]
subprocess.run(cmd, check=True)
json.dump({"segments": segs, "duration": round(nt, 3)}, open(a.out.rsplit(".",1)[0] + ".map.json", "w"), indent=1)
def remap(t):
    for s, e, ns in segs:
        if s - 0.001 <= t <= e + 0.001: return round(ns + min(max(t, s), e) - s, 3)
    return None
if a.words:
    w = json.load(open(a.words)); out = []
    for x in w:
        ns, ne = remap(x["start"]), remap(x["end"])
        if ns is None:  # word starts inside a removed gap: snap to next segment start
            ns = next((sg[2] for sg in segs if sg[0] > x["start"]), None)
        if ne is None: ne = (ns or 0) + (x["end"] - x["start"])
        if ns is not None: out.append({"text": x["text"], "start": ns, "end": round(max(ne, ns + 0.05), 3)})
    json.dump(out, open(a.out.rsplit(".",1)[0] + ".words.json", "w"), indent=1)
print(f"cut_pauses: {len(merged)} segments, {dur:.2f}s -> {nt:.2f}s ({dur-nt:.2f}s of pauses removed)")
for s, e, ns in segs: print(f"  {s:6.2f}-{e:6.2f} -> {ns:6.2f}")
