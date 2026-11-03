#!/usr/bin/env python3
"""analyze_ref.py — Zyqor Motion Kit v4: break ANY reference reel down into numbers (style.json) and pick the closest template.
  python3 analyze_ref.py ref.mp4 [OUT_DIR]      -> OUT_DIR/style.json + OUT_DIR/strip.jpg (2 fps contact sheet)
Measures: duration, fps, hard cuts (ffmpeg scene > 0.3) and cuts/s, motion energy, flash frames, brightness/saturation, 5-colour palette
(hexes), face presence (OpenCV Haar, % of sampled frames, face size), white/rounded "card" layout (before/after), loudness (audio-proof),
sfx/beat density (spectral-flux onsets per second), then maps it to a template:
  framed_talking_head (ref 3) · before_after_showcase (ref 4) · tilted_device_saas (ref 2) · soft3d_explainer (ref 1) · saas_card_grid (ref 5)
The mapping rules are plain if/else below — read them, they are the decision table in TAB_NOTES v4 §make_video.
"""
import sys, os, json, subprocess, re, math
import numpy as np
from PIL import Image
KIT = os.path.dirname(os.path.abspath(__file__))
src = sys.argv[1]; out = sys.argv[2] if len(sys.argv) > 2 else os.path.dirname(os.path.abspath(src)); os.makedirs(out, exist_ok=True)
def sh(cmd, t=300): return subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=t)
pr = json.loads(sh(f'ffprobe -v error -show_entries stream=codec_type,width,height,r_frame_rate:format=duration -of json "{src}"').stdout)
dur = float(pr["format"]["duration"]); vs = [s for s in pr["streams"] if s["codec_type"] == "video"][0]
fps = eval(vs["r_frame_rate"]); W, H = vs["width"], vs["height"]
cuts = [float(x) for x in re.findall(r"pts_time:([\d.]+)", sh(f'ffmpeg -hide_banner -i "{src}" -vf "select=\'gt(scene,0.3)\',showinfo" -an -f null - ', 600).stderr)]
# 6 fps grey frames for motion / flashes; 2 fps colour frames for palette / faces / strip
g = np.frombuffer(subprocess.run(f'ffmpeg -v error -i "{src}" -vf "fps=6,scale=90:160,format=gray" -f rawvideo -', shell=True, capture_output=True, timeout=600).stdout, np.uint8)
g = g[: len(g) // (90 * 160) * 90 * 160].reshape(-1, 160, 90).astype(np.float32)
diff = np.abs(np.diff(g, axis=0)).mean(axis=(1, 2)) if len(g) > 1 else np.array([0.0])
lum = g.mean(axis=(1, 2)); flashes = int(((lum[1:] - lum[:-1]) > 35).sum()) if len(lum) > 1 else 0
c = np.frombuffer(subprocess.run(f'ffmpeg -v error -i "{src}" -vf "fps=2,scale=270:480" -f rawvideo -pix_fmt rgb24 -', shell=True, capture_output=True, timeout=600).stdout, np.uint8)
c = c[: len(c) // (270 * 480 * 3) * 270 * 480 * 3].reshape(-1, 480, 270, 3)
allpx = c[:, ::6, ::6].reshape(-1, 3)
pal = Image.fromarray(allpx.reshape(1, -1, 3)).quantize(5, method=Image.Quantize.MEDIANCUT)
cols = pal.getpalette()[:15]; counts = sorted(pal.getcolors(), reverse=True)
palette = ["#%02x%02x%02x" % tuple(cols[i * 3: i * 3 + 3]) for _, i in counts]
hsv = np.array(Image.fromarray(allpx.reshape(1, -1, 3)).convert("HSV")).reshape(-1, 3)
bright, sat = float(allpx.mean() / 255), float(hsv[:, 1].mean() / 255)
# faces (kernel venv has the Haar module; cascade file shipped with the kit)
haar = os.path.join(KIT, "templates", "talking_head_v4", "assets", "haarcascade_frontalface_default.xml")
fpy = os.environ.get("PYTHON", sys.executable)
np.save("/tmp/_ar_frames.npy", c[:: max(1, len(c) // 12)])
fr = sh(f'{fpy} -c "import cv2,numpy as np,json;f=np.load(\'/tmp/_ar_frames.npy\');cc=cv2.CascadeClassifier(\'{haar}\');'
        f'r=[ [list(map(int,x)) for x in cc.detectMultiScale(cv2.cvtColor(im,cv2.COLOR_RGB2GRAY),1.1,5,minSize=(20,20))] for im in f];print(json.dumps(r))"')
try: faces = json.loads(fr.stdout.strip().splitlines()[-1])
except Exception: faces = []
face_frac = sum(1 for f in faces if f) / max(1, len(faces)); face_size = float(np.median([max(w for x, y, w, h in f) / 270 for f in faces if f])) if any(faces) else 0.0
two_faces = sum(1 for f in faces if len(f) >= 2) / max(1, len(faces))
# white/light rounded cards: rows that are >50 % near-white across the middle band (before/after layout, UI cards)
mid = c[len(c) // 2]; white_rows = float(((mid.min(axis=2) > 230).mean(axis=1) > 0.5).mean())
# audio
_e = sh(f'ffmpeg -hide_banner -nostats -i "{src}" -af ebur128=peak=true -f null -').stderr
_I = re.findall(r'I:\s+(-?[\d.]+) LUFS', _e); _P = re.findall(r'Peak:\s+(-?[\d.]+) dBFS', _e)
ap = {"loudness": {"integrated_lufs": float(_I[-1]) if _I else None, "true_peak_dbtp": float(_P[-1]) if _P else None}}
a = np.frombuffer(subprocess.run(f'ffmpeg -v error -i "{src}" -ac 1 -ar 16000 -f f32le -', shell=True, capture_output=True, timeout=600).stdout, np.float32)
onsets = 0
if len(a) > 16000:
    n = 512; frames = a[: len(a) // n * n].reshape(-1, n); spec = np.abs(np.fft.rfft(frames * np.hanning(n), axis=1))
    flux = np.maximum(0, np.diff(spec, axis=0)).sum(axis=1); thr = np.median(flux) + 2.0 * flux.std()
    peaks = [i for i in range(1, len(flux) - 1) if flux[i] > thr and flux[i] >= flux[i - 1] and flux[i] >= flux[i + 1]]
    last = -99; 
    for p in peaks:
        if p - last > 3: onsets += 1; last = p
style = dict(source=os.path.abspath(src), duration_s=round(dur, 2), fps=round(fps, 2), size=[W, H], hard_cuts=len(cuts), cuts=[round(x, 2) for x in cuts],
             cuts_per_s=round(len(cuts) / dur, 3), motion_mean=round(float(diff.mean()), 2), motion_p90=round(float(np.percentile(diff, 90)), 2),
             still_frac=round(float((diff < 0.6).mean()), 3), flash_frames=flashes, brightness=round(bright, 3), saturation=round(sat, 3), palette=palette,
             face_frac=round(face_frac, 2), face_size=round(face_size, 2), two_faces_frac=round(two_faces, 2), white_card_rows=round(white_rows, 3),
             lufs=(ap.get("loudness") or {}).get("integrated_lufs"), true_peak=(ap.get("loudness") or {}).get("true_peak_dbtp"),
             onsets=onsets, onsets_per_s=round(onsets / dur, 2))
# ---- template decision table
if white_rows > 0.15 and sat > 0.45: tpl = "before_after_showcase"                    # strong colour field + big white cards (ref 4: red + 2 cards)
elif face_frac >= 0.75 and bright < 0.5 and sat > 0.35: tpl = "timeline_reveal_showcase"  # face on screen almost always, dark + saturated gaming look, stacked panels (ref 6: face 0.86, bright 0.38, sat 0.45)
elif face_frac >= 0.4 and face_size >= 0.24: tpl = "framed_talking_head"            # a real face, big in frame (ref 3: 0.28); cartoon mascots are ~0.2
elif bright > 0.8 and sat < 0.15: tpl = "soft3d_explainer"                         # airy off-white world (ref 1: brightness 0.87, saturation 0.08)
elif style["motion_mean"] > 12 and face_frac < 0.3: tpl = "saas_card_grid"           # fast multi-card pastel promo, constant motion (ref 5: motion 19)
elif style["cuts_per_s"] < 0.3 and sat >= 0.15: tpl = "tilted_device_saas"         # pastel/peach, few cuts, camera does the pacing (ref 2)
else: tpl = "saas_card_grid"                                                         # fast multi-card pastel promos (ref 5)
style["template"] = tpl
style["pace"] = dict(beat_s=round(min(1.5, max(0.4, dur / max(1, onsets) * 2)), 2), sfx_per_s=round(min(4.0, max(1.5, style["onsets_per_s"])), 2))
json.dump(style, open(os.path.join(out, "style.json"), "w"), indent=1)
n = len(c); cols_ = 10; rows = math.ceil(n / cols_); strip = Image.new("RGB", (cols_ * 108, rows * 192))
for i in range(n): strip.paste(Image.fromarray(c[i]).resize((108, 192)), ((i % cols_) * 108, (i // cols_) * 192))
strip.save(os.path.join(out, "strip.jpg"), quality=78)
print(json.dumps({k: style[k] for k in ("duration_s", "cuts_per_s", "motion_mean", "brightness", "saturation", "face_frac", "white_card_rows", "onsets_per_s", "template")}))
