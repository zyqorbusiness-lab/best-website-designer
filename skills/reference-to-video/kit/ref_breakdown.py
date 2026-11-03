#!/usr/bin/env python3
"""ref_breakdown.py — Zyqor Motion Kit v5.2: FRAME-BY-FRAME reference breakdown (Step 0 of every edit).

Sujon, Nov 3 2026: "har ek 1 seconds ka 60 frames karega fir har ek frame dekhega kya effects kaise
animation kab kya kaisa text text colour glow background subject b roll".

What it does (one reference video -> one folder you can read like a storyboard):
  1. takes a local video or a URL (Instagram / Pinterest / YouTube via yt-dlp)
  2. decodes the WHOLE video at 60 fps (every second -> 60 frames). If the source is 30 fps it says so:
     every 2nd frame is then a copy; copies are marked "=" on the sheet and only unique frames count.
  3. per second: one contact sheet (10 x 6 = 60 thumbnails, timestamp + frame number on each,
     unique frames labelled, cuts / flashes outlined)
  4. frame-difference (motion) graph for the whole video: cut points, flashes, where each animation
     starts and ends, an easing guess from the shape of the motion curve, and audio onsets (sfx/beat hits)
  5. dominant colours per second (hex) with a flag on any banned "AI" colour (purple / violet /
     blue neon / cyan) — the same rule as qc_v5.py (zq_config.json "banned")
  6. breakdown.json + breakdown.md: one row per second + one row per detected event, with the measured
     facts filled in and empty fields for what only your eyes can say: effect, animation, easing, text,
     font, text colour, glow, background, subject, b-roll, transition, camera, sfx.
  Raw frames are never written to disk (thumbnails are decoded straight into the sheets), so a 60 s
  reference costs ~25 MB of sheets, not GBs of PNGs. --frames-at 3.0-4.0 saves full-size frames for one
  short window when you need to zoom into a detail (delete them when done).

USAGE
  python3 ref_breakdown.py <video.mp4 | URL> [-o refs_breakdown/<name>] [--tile 180] [--start S] [--end S]
                           [--frames-at A-B] [--sheet-width 900] [--min-free-gb 1.5]
  python3 ref_breakdown.py md    <out_dir>    # re-write breakdown.md after you filled breakdown.json
  python3 ref_breakdown.py check <out_dir>    # how many rows are still empty (qc_v5.py uses this)

Every category comes from Pinterest first (music, sfx, b-roll, subject, effects, background):
pin_download.py saves the pin's media into your project and logs it into breakdown.json "pinterest_sources".
After the breakdown write "make_it_ours" (min 3 things you change so the edit is not a 1:1 copy).

THEN (the part that matters): open sheets/sec_000.jpg, sec_001.jpg ... one by one, look at every frame,
fill the empty fields in breakdown.json (effect, animation + easing, text, font, text colour, glow,
background, subject, b-roll, transition, camera, sfx), run "md", and only then start the edit.
Works on Windows/Mac/Linux: needs python3 + numpy + pillow + ffmpeg/ffprobe on PATH (yt-dlp for URLs).
"""
import sys, os, json, re, math, shutil, subprocess, tempfile, time, colorsys, argparse
import numpy as np
from PIL import Image, ImageDraw, ImageFont

KIT = os.path.dirname(os.path.abspath(__file__))
FIELDS = ["effect", "animation", "easing", "text", "font", "text_colour", "glow", "background",
          "subject", "broll", "transition", "camera", "sfx", "pin_ref", "notes"]
# Sujon Nov 3 9:14 PM: "Background music se b roll subject sound effects har ek chiz pinterest se le" ->
# every edit logs the Pinterest pin it took each category from (pin_download.py fills these for you)
PIN_CATEGORIES = ["music", "sfx", "broll", "subject", "effect", "background"]
BANNED = {"hue_ranges_deg": [[175, 320]], "min_saturation": 0.45, "min_value": 0.35}
try:
    BANNED.update(json.load(open(os.path.join(KIT, "zq_config.json")))["banned"])
except Exception:
    pass

def nice_self():
    try: os.nice(10)
    except Exception: pass

def font(sz):
    for f in ["DejaVuSans-Bold.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", "arialbd.ttf",
              "C:/Windows/Fonts/arialbd.ttf", "/System/Library/Fonts/Supplemental/Arial Bold.ttf"]:
        try: return ImageFont.truetype(f, sz)
        except Exception: continue
    return ImageFont.load_default()

def free_gb(path):
    try: return shutil.disk_usage(path).free / 1e9
    except Exception: return 99.0

def run(cmd, timeout):
    """subprocess with a hard deadline (SIGKILL), output to a temp file, not a pipe."""
    with tempfile.TemporaryFile() as log:
        p = subprocess.Popen(cmd, stdout=log, stderr=subprocess.STDOUT)
        try: p.wait(timeout=timeout)
        except subprocess.TimeoutExpired:
            p.kill(); p.wait(); raise RuntimeError(f"timed out after {timeout}s: {' '.join(cmd[:3])}")
        log.seek(0); out = log.read().decode(errors="ignore")
    if p.returncode != 0: raise RuntimeError(f"{cmd[0]} failed ({p.returncode}): {out[-600:]}")
    return out

def fetch(url, tmp, extra=None):
    out = os.path.join(tmp, "ref.%(ext)s")
    cmd = ["yt-dlp", "-q", "--no-playlist", "-f", "bv*[height<=1920]+ba/b", "--merge-output-format", "mp4",
           "--write-info-json", "-o", out] + (extra or []) + [url]
    run(cmd, 600)
    for f in os.listdir(tmp):
        if f.endswith(".mp4") or f.endswith(".webm") or f.endswith(".mkv"): return os.path.join(tmp, f)
    raise RuntimeError("yt-dlp produced no video")

def probe(path):
    o = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_entries",
        "stream=codec_type,width,height,r_frame_rate,avg_frame_rate:format=duration", "-of", "json", path],
        capture_output=True, text=True, timeout=60).stdout)
    v = next(s for s in o["streams"] if s["codec_type"] == "video")
    def fr(x):
        try: n, d = x.split("/"); return float(n) / float(d) if float(d) else 0.0
        except Exception: return 0.0
    fps = fr(v.get("avg_frame_rate", "0/0")) or fr(v.get("r_frame_rate", "0/0"))
    return {"width": v["width"], "height": v["height"], "fps": round(fps, 3), "duration": float(o["format"]["duration"]),
            "has_audio": any(s["codec_type"] == "audio" for s in o["streams"])}

def hsv_np(rgb):
    x = rgb.astype(np.float32) / 255; mx = x.max(-1); mn = x.min(-1); d = np.maximum(mx - mn, 1e-6)
    r, g, b = x[..., 0], x[..., 1], x[..., 2]
    h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    s = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    return h, s, mx

def banned_mask(rgb):
    h, s, v = hsv_np(rgb); m = np.zeros(h.shape, bool)
    for lo, hi in BANNED["hue_ranges_deg"]: m |= (h >= lo) & (h <= hi)
    return m & (s >= BANNED["min_saturation"]) & (v >= BANNED["min_value"])

def banned_hex(hx):
    r, g, b = (int(hx[i:i+2], 16) for i in (1, 3, 5)); return bool(banned_mask(np.array([[[r, g, b]]], np.uint8))[0, 0])

def colour_name(hx):
    r, g, b = (int(hx[i:i+2], 16) / 255 for i in (1, 3, 5)); H, S, V = colorsys.rgb_to_hsv(r, g, b); H *= 360
    if V < 0.18: return "near-black"
    if S < 0.12: return "white/off-white" if V > 0.85 else ("light grey" if V > 0.6 else "grey")
    names = [(15, "red"), (40, "orange"), (65, "yellow/gold"), (90, "lime"), (150, "green"), (175, "teal"),
             (200, "cyan"), (250, "blue"), (285, "violet"), (320, "purple/magenta"), (345, "pink"), (361, "red")]
    n = next(nm for lim, nm in names if H < lim)
    if n in ("orange", "red", "yellow/gold") and S < 0.45 and V < 0.75: n = "brown/skin/warm neutral"
    return n

def dominant(pixels, k=5):
    img = Image.fromarray(pixels.reshape(1, -1, 3))
    q = img.quantize(colors=k, method=Image.Quantize.MEDIANCUT)
    pal = q.getpalette()[:k * 3]; counts = sorted(q.getcolors(), reverse=True); tot = sum(c for c, _ in counts)
    out = []
    for c, i in counts[:k]:
        hx = "#%02X%02X%02X" % tuple(pal[i * 3:i * 3 + 3])
        out.append({"hex": hx, "share": round(c / tot, 3), "name": colour_name(hx), "banned": banned_hex(hx)})
    return out

def ffmpeg_frames(src, tw, th, start, end):
    cmd = ["nice", "-n", "10", "ffmpeg", "-v", "error", "-threads", "2"]
    if start: cmd += ["-ss", str(start)]
    cmd += ["-i", src]
    if end: cmd += ["-t", str(end - (start or 0))]
    cmd += ["-vf", f"fps=60,scale={tw}:{th}:flags=area", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]
    if os.name == "nt": cmd = cmd[3:]
    return subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, bufsize=tw * th * 3 * 8)

def audio_onsets(src, start, end, dur):
    cmd = ["ffmpeg", "-v", "error"] + (["-ss", str(start)] if start else []) + ["-i", src] + \
          (["-t", str((end or dur) - (start or 0))] if end else []) + ["-vn", "-ac", "1", "-ar", "16000", "-f", "s16le", "-"]
    try: raw = subprocess.run(cmd, capture_output=True, timeout=300).stdout
    except Exception: return [], []
    a = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
    if a.size < 1600: return [], []
    hop = 160; n = a.size // hop; e = np.sqrt((a[:n * hop].reshape(n, hop) ** 2).mean(1) + 1e-10); db = 20 * np.log10(e)
    on, last = [], -1
    for i in range(5, n):
        prev = db[max(0, i - 8):i - 1].mean()
        if db[i] > -36 and db[i] - prev > 9 and (i - last) * 0.01 > 0.15:
            on.append(round((start or 0) + i * 0.01, 2)); last = i
    lufs_curve = [round(float(db[j:j + 100].max()), 1) for j in range(0, n, 100)]   # per-second peak dBFS
    return on, lufs_curve

def label_font_cache(): return font(13), font(11)

def analyse(src, out, tile=180, start=0.0, end=None, frames_at=None, sheet_width=None, min_free=1.5, title=None, url=None):
    nice_self()
    if free_gb(out if os.path.exists(out) else os.path.dirname(os.path.abspath(out)) or ".") < min_free:
        raise SystemExit(f"disk: less than {min_free} GB free - free space first")
    info = probe(src); dur = info["duration"]; end = min(end or dur, dur); start = start or 0.0
    W, H = info["width"], info["height"]; tw = tile; th = int(round(tile * H / W / 2) * 2)
    os.makedirs(os.path.join(out, "sheets"), exist_ok=True)
    note = []
    if info["fps"] and info["fps"] < 59:
        note.append(f"source is {info['fps']:g} fps: sampling at 60 fps repeats frames - each real frame appears "
                    f"~{60/info['fps']:.1f}x. Repeats are marked '=' on the sheets and are NOT new information.")
    f13, f11 = label_font_cache(); lab = 18
    p = ffmpeg_frames(src, tw, th, start, end); fsz = tw * th * 3
    prev_small = None; prev_hist = None; prev_luma = None
    diffs, hist_d, lumas, uniq = [], [], [], []
    sec_frames, sec_idx = [], int(start)
    small_w, small_h = 64, max(8, int(64 * th / tw))
    fi = 0; t0 = time.time()

    def flush_second(sec, frames):
        if not frames: return
        sec = int(math.floor(frames[0][1]["t"] + 1e-6))
        cols, rows = 10, 6
        sheet = Image.new("RGB", (cols * tw, rows * (th + lab) + 34), (24, 23, 22))
        d = ImageDraw.Draw(sheet)
        d.text((8, 8), f"{title or os.path.basename(src)}   second {sec}  ({sec}.000-{sec}.983 s)   60 fps grid, '=' = repeated frame, red = cut, yellow = flash",
               fill=(240, 236, 228), font=f13)
        for k, (img, meta) in enumerate(frames[:60]):
            x = (k % cols) * tw; y = 34 + (k // cols) * (th + lab)
            sheet.paste(img, (x, y + lab))
            col = (240, 236, 228) if meta["u"] else (120, 116, 110)
            d.text((x + 3, y + 2), f"{meta['t']:.3f}s f{meta['f']}{'' if meta['u'] else ' ='}", fill=col, font=f11)
        if sheet_width and sheet.width > sheet_width:
            sheet = sheet.resize((sheet_width, int(sheet.height * sheet_width / sheet.width)), Image.LANCZOS)
        sheet.save(os.path.join(out, "sheets", f"sec_{sec:03d}.jpg"), quality=78, optimize=True)

    frames_meta = []; colour_pool = {}
    while True:
        buf = p.stdout.read(fsz)
        if not buf or len(buf) < fsz: break
        t = start + fi / 60.0
        arr = np.frombuffer(buf, np.uint8).reshape(th, tw, 3)
        img = Image.fromarray(arr)
        small = np.asarray(img.resize((small_w, small_h), Image.BILINEAR), np.float32)
        gray = small.mean(2); luma = float(gray.mean())
        hist = np.concatenate([np.histogram(small[..., c], bins=16, range=(0, 255))[0] for c in range(3)]).astype(np.float32)
        hist /= hist.sum()
        if prev_small is None: dd, hd = 0.0, 0.0
        else: dd = float(np.abs(gray - prev_small).mean()); hd = float(np.abs(hist - prev_hist).sum() / 2)
        u = prev_small is None or dd > 0.35
        diffs.append(dd); hist_d.append(hd); lumas.append(luma); uniq.append(u)
        meta = {"t": t, "f": fi, "u": u}
        sec = int(math.floor(t + 1e-6))
        if sec != sec_idx:            # a second is complete -> its sheet goes to disk, thumbnails leave memory
            flush_second(sec_idx, sec_frames); sec_frames = []; sec_idx = sec
        sec_frames.append((img, meta)); frames_meta.append(meta)
        if u: colour_pool.setdefault(sec, []).append(arr[::4, ::4].reshape(-1, 3).copy())
        prev_small, prev_hist = gray, hist; fi += 1
    p.stdout.close(); p.wait(timeout=30)
    flush_second(sec_idx, sec_frames); sec_frames = None
    n = len(diffs)
    if n == 0: raise SystemExit("no frames decoded")
    D = np.array(diffs); HD = np.array(hist_d); L = np.array(lumas); U = np.array(uniq)
    mot = D.copy()                     # a repeated frame keeps the motion of the real frame it repeats
    for i in range(1, n):
        if not U[i]: mot[i] = mot[i - 1]
    k = 5; sm = np.convolve(mot, np.ones(k) / k, mode="same")
    nz = D[U & (D > 0)]; med = float(np.median(nz)) if nz.size else 1.0
    cut_thr = max(18.0, 6 * med)
    cuts = [i for i in range(1, n) if U[i] and D[i] > cut_thr and HD[i] > 0.28]
    flashes = []
    for i in range(1, n - 1):
        if L[i] - L[i - 1] > 35 and any(L[j] < L[i] - 25 for j in range(i + 1, min(n, i + 10))): flashes.append(i)
    cut_set = set(cuts)
    mark_sheets(out, tw, th, lab, sheet_width, start, cuts, flashes)
    # animation segments (moving vs still), split at cuts
    move_thr = max(0.6, 1.5 * float(np.percentile(sm, 20)))
    moving = sm > move_thr; segs = []; i = 0
    while i < n:
        if moving[i]:
            j = i
            while j + 1 < n and moving[j + 1] and (j + 1) not in cut_set: j += 1
            if (j - i + 1) >= 6: segs.append((i, j))
            i = j + 1
        else: i += 1
    def easing(a, b):
        seg = sm[a:b + 1]
        if seg.size < 8: return "snap (<0.15 s)"
        pk = int(np.argmax(seg)) / max(1, seg.size - 1); flat = seg.std() / max(seg.mean(), 1e-6) < 0.25
        if flat: return "linear / constant (steady drift or continuous motion)"
        if pk < 0.3: return "ease-out (fast start, slow settle) - typical pop/slide-in"
        if pk > 0.7: return "ease-in (slow start, fast end) - typical exit/whip into cut"
        return "ease-in-out (smooth S-curve)"
    events = []
    for c in cuts: events.append({"t": round(start + c / 60, 3), "frame": c, "type": "cut", "measured": f"hard cut (frame diff {D[c]:.0f}, colour change {HD[c]:.2f})"})
    for fl in flashes: events.append({"t": round(start + fl / 60, 3), "frame": fl, "type": "flash", "measured": f"brightness jump +{L[fl]-L[fl-1]:.0f}"})
    for a, b in segs:
        events.append({"t": round(start + a / 60, 3), "frame": a, "type": "animation",
                       "end_t": round(start + b / 60, 3), "dur_s": round((b - a + 1) / 60, 2),
                       "measured": f"motion {start + a/60:.2f}-{start + b/60:.2f} s ({(b-a+1)/60:.2f} s), peak at {start + (a + int(np.argmax(sm[a:b+1])))/60:.2f} s",
                       "easing_guess": easing(a, b)})
    onsets, sec_peak = audio_onsets(src, start, end, dur) if info["has_audio"] else ([], [])
    for e in events:
        e["sfx_candidates"] = [o for o in onsets if abs(o - e["t"]) <= 0.1]
    events.sort(key=lambda e: e["t"])
    for e in events:
        for f in FIELDS: e.setdefault(f, "")
    # per second rows
    secs = []; nsec = int(math.ceil(end - start - 1e-6))
    for s in range(int(start), int(start) + nsec):
        a, b = int((s - start) * 60), min(n, int((s - start + 1) * 60))
        if a >= n: break
        pool = colour_pool.get(s)
        cols = dominant(np.concatenate(pool)[: 200000]) if pool else []
        bshare = float(banned_mask(np.concatenate(pool)).mean()) if pool else 0.0
        row = {"sec": s, "time": f"{s//60:02d}:{s%60:02d}", "sheet": f"sheets/sec_{s:03d}.jpg",
               "measured": {"unique_frames": int(U[a:b].sum()), "frames": b - a,
                            "motion_mean": round(float(mot[a:b].mean()), 2), "motion_peak": round(float(mot[a:b].max()), 2),
                            "still": bool(float(sm[a:b].max()) <= move_thr),
                            "cuts_at": [round(start + c / 60, 3) for c in cuts if a <= c < b],
                            "flashes_at": [round(start + c / 60, 3) for c in flashes if a <= c < b],
                            "audio_onsets": [o for o in onsets if s <= o < s + 1],
                            "audio_peak_dbfs": sec_peak[s - int(start)] if s - int(start) < len(sec_peak) else None,
                            "colours": cols, "banned_colour_share": round(bshare, 3),
                            "banned_flag": bshare > 0.06 or any(c["banned"] and c["share"] > 0.05 for c in cols)}}
        for f in FIELDS: row[f] = ""
        secs.append(row)
    # motion graph + colour strip
    draw_graph(out, sm, D, cuts, flashes, onsets, segs, secs, start, cut_thr, move_thr, title or os.path.basename(src))
    meta = {"tool": "ref_breakdown.py (Zyqor Motion Kit v5.2)", "made": time.strftime("%Y-%m-%d %H:%M"),
            "source": url or os.path.basename(src), "title": title or "", "width": W, "height": H,
            "source_fps": info["fps"], "duration_s": round(dur, 3), "analysed": [round(start, 3), round(end, 3)],
            "sampled_fps": 60, "frames_sampled": n, "unique_frames": int(U.sum()),
            "fps_note": " ".join(note) or "source is ~60 fps: every sampled frame is a real frame",
            "thresholds": {"cut_frame_diff": round(cut_thr, 1), "moving": round(move_thr, 2)},
            "counts": {"cuts": len(cuts), "flashes": len(flashes), "animations": len(segs), "audio_onsets": len(onsets)},
            "banned_rule": BANNED, "fields_to_fill": FIELDS,
            "how_to_fill": "Open each sheet, look at every frame, fill the empty fields in seconds[] and events[]. Then run: python3 ref_breakdown.py md <this folder>"}
    tpl = {"meta": meta, "summary": [],
           "pinterest_sources": {k: [] for k in PIN_CATEGORIES},
           "make_it_ours": [],
           "seconds": secs, "events": events}
    old = os.path.join(out, "breakdown.json")
    if os.path.exists(old):           # re-running keeps what you already wrote
        try:
            prev = json.load(open(old))
            for k, v in prev.items():          # summary, pinterest_sources, make_it_ours, your own notes
                if k not in ("meta", "seconds", "events") and v: tpl[k] = v
            pv = {r["sec"]: r for r in prev.get("seconds", [])}
            for r in tpl["seconds"]:
                for f in FIELDS:
                    if pv.get(r["sec"], {}).get(f): r[f] = pv[r["sec"]][f]
            for e in tpl["events"]:
                for pe in prev.get("events", []):
                    if pe.get("type") == e["type"] and abs(pe.get("t", -9) - e["t"]) < 0.05:
                        for f in FIELDS:
                            if pe.get(f): e[f] = pe[f]
            for k in ("title", "source"):
                if prev.get("meta", {}).get(k) and not (title if k == "title" else url): tpl["meta"][k] = prev["meta"][k]
        except Exception: pass
    json.dump(tpl, open(old, "w"), indent=1, ensure_ascii=False)
    json.dump({"meta": meta, "frame_diff": [round(x, 2) for x in D.tolist()], "motion": [round(x, 2) for x in sm.tolist()],
               "unique": [int(x) for x in U.tolist()], "luma": [round(x, 1) for x in L.tolist()], "audio_onsets": onsets},
              open(os.path.join(out, "analysis.json"), "w"))
    if frames_at:
        a, b = [float(x) for x in frames_at.split("-")]; zd = os.path.join(out, f"frames_{a:g}-{b:g}s"); os.makedirs(zd, exist_ok=True)
        run(["ffmpeg", "-v", "error", "-ss", str(a), "-i", src, "-t", str(b - a), "-vf", "fps=60", "-q:v", "3", os.path.join(zd, "f_%04d.jpg")], 600)
    write_md(out)
    return meta

def draw_graph(out, sm, D, cuts, flashes, onsets, segs, secs, start, cut_thr, move_thr, title):
    n = len(sm); Wg, Hg, pad = 1800, 520, 50
    img = Image.new("RGB", (Wg, Hg), (247, 244, 238)); d = ImageDraw.Draw(img); f = font(14); fs = font(11)
    d.text((pad, 10), f"{title} - motion per frame (60 fps). red = cut, yellow = flash, green ticks = audio onsets, shaded = animation", fill=(30, 28, 26), font=f)
    gx0, gx1, gy0, gy1 = pad, Wg - 20, 40, 380
    top = max(float(np.percentile(sm, 99)) * 1.2, move_thr * 3, 1)
    X = lambda i: gx0 + (gx1 - gx0) * i / max(1, n - 1)
    Y = lambda v: gy1 - (gy1 - gy0) * min(v, top) / top
    for a, b in segs: d.rectangle([X(a), gy0, X(b), gy1], fill=(226, 232, 214))
    for s in range(0, int(n / 60) + 1):
        x = X(s * 60); d.line([x, gy0, x, gy1], fill=(214, 208, 198)); d.text((x + 2, gy1 + 4), f"{start + s:g}s", fill=(90, 86, 80), font=fs)
    pts = [(X(i), Y(v)) for i, v in enumerate(sm)]; d.line(pts, fill=(40, 38, 36), width=2)
    d.line([gx0, Y(move_thr), gx1, Y(move_thr)], fill=(160, 150, 140))
    for c in cuts: d.line([X(c), gy0, X(c), gy1], fill=(220, 50, 40), width=3)
    for c in flashes: d.line([X(c), gy0, X(c), gy1], fill=(240, 190, 30), width=3)
    for o in onsets: x = gx0 + (gx1 - gx0) * ((o - start) * 60) / max(1, n - 1); d.line([x, gy1 - 18, x, gy1], fill=(40, 140, 70), width=2)
    # colour strip: dominant colours per second
    y0 = 410; d.text((pad, y0 - 18), "dominant colours per second (box outlined red = banned purple/blue/cyan share > 6 %)", fill=(30, 28, 26), font=fs)
    for r in secs:
        s = r["sec"] - int(start); x0 = X(s * 60); x1 = X(min(n - 1, (s + 1) * 60)); y = y0
        for c in r["measured"]["colours"]:
            h = max(2, int(90 * c["share"])); col = tuple(int(c["hex"][i:i+2], 16) for i in (1, 3, 5))
            d.rectangle([x0, y, x1 - 1, y + h], fill=col); y += h
        if r["measured"]["banned_flag"]: d.rectangle([x0, y0, x1 - 1, y0 + 92], outline=(220, 40, 30), width=3)
    img.save(os.path.join(out, "motion_graph.png"), optimize=True)

def mark_sheets(out, tw, th, lab, sheet_width, start, cuts, flashes):
    """outline cut frames red and flash frames yellow on the sheets already written."""
    marks = {}
    for i in cuts: marks.setdefault(int(math.floor(start + i / 60 + 1e-6)), []).append((i, (235, 64, 52)))
    for i in flashes: marks.setdefault(int(math.floor(start + i / 60 + 1e-6)), []).append((i, (245, 200, 40)))
    first = int(math.floor(start + 1e-6))
    for sec, lst in marks.items():
        p = os.path.join(out, "sheets", f"sec_{sec:03d}.jpg")
        if not os.path.exists(p): continue
        im = Image.open(p).convert("RGB"); full_w = 10 * tw; sc = im.width / full_w; d = ImageDraw.Draw(im)
        i0 = 0 if sec == first else int(math.ceil((sec - start) * 60 - 1e-6))
        for i, col in lst:
            k = i - i0
            x = (k % 10) * tw; y = 34 + (k // 10) * (th + lab) + lab
            d.rectangle([x * sc + 1, y * sc + 1, (x + tw) * sc - 2, (y + th) * sc - 2], outline=col, width=max(2, int(4 * sc)))
        im.save(p, quality=78, optimize=True)

def write_md(out):
    B = json.load(open(os.path.join(out, "breakdown.json"))); m = B["meta"]
    L = [f"# Reference breakdown — {m.get('title') or m['source']}", "",
         f"Source: {m['source']}  ·  {m['width']}x{m['height']}  ·  {m['source_fps']:g} fps  ·  {m['duration_s']} s  ·  sampled at 60 fps ({m['frames_sampled']} frames, {m['unique_frames']} unique)",
         f"FPS note: {m['fps_note']}",
         f"Measured: {m['counts']['cuts']} cuts · {m['counts']['flashes']} flashes · {m['counts']['animations']} animation segments · {m['counts']['audio_onsets']} audio onsets (sfx/beat candidates)",
         "Graph: motion_graph.png · Sheets: sheets/sec_NNN.jpg (60 frames each)", ""]
    if B.get("summary"): L += ["## What to copy (summary)", ""] + [f"- {x}" for x in B["summary"]] + [""]
    ps = B.get("pinterest_sources") or {}
    L += ["## Pinterest sources used (every category comes from Pinterest first)", ""]
    for k in PIN_CATEGORIES:
        items = ps.get(k) or []
        L.append(f"- **{k}:** " + ("; ".join(f"[{i.get('note') or i.get('title') or i.get('pin_url')}]({i.get('pin_url')})" + (f" -> {i['file']}" if i.get('file') else '') for i in items) if items else "_(not logged yet)_"))
    L += ["", "## What we change to make it OURS (min 3 - never copy a reference 1:1)", ""]
    L += [f"{n}. {x}" for n, x in enumerate(B.get("make_it_ours") or [], 1)] or ["_(not written yet)_"]
    L.append("")
    L += ["## Second by second", ""]
    for r in B["seconds"]:
        me = r["measured"]; cols = " ".join(f"{c['hex']}({int(c['share']*100)}%{' BANNED' if c['banned'] else ''})" for c in me["colours"][:4])
        L.append(f"### {r['time']}  — [sheet]({r['sheet']})")
        L.append(f"measured: {me['unique_frames']} unique frames · motion {me['motion_mean']} (peak {me['motion_peak']}){' · STILL' if me['still'] else ''}"
                 + (f" · cut at {me['cuts_at']}" if me['cuts_at'] else "") + (f" · flash at {me['flashes_at']}" if me['flashes_at'] else "")
                 + (f" · audio hits {me['audio_onsets']}" if me['audio_onsets'] else "") + f" · colours {cols}" + (" · **BANNED COLOUR**" if me["banned_flag"] else ""))
        for f in FIELDS:
            if r.get(f): L.append(f"- **{f.replace('_', ' ')}:** {r[f]}")
        if not any(r.get(f) for f in FIELDS): L.append("- _(not filled yet — open the sheet and write what you see)_")
        L.append("")
    L += ["## Events (cuts, flashes, animations)", "", "| time | type | measured | easing guess | sfx hits | what it is |", "|---|---|---|---|---|---|"]
    for e in B["events"]:
        what = "; ".join(f"{f.replace('_',' ')}: {e[f]}" for f in FIELDS if e.get(f)) or "—"
        L.append(f"| {e['t']:.2f}{('-'+format(e['end_t'],'.2f')) if e.get('end_t') else ''} | {e['type']} | {e['measured']} | {e.get('easing_guess','')} | {e.get('sfx_candidates') or ''} | {what} |")
    open(os.path.join(out, "breakdown.md"), "w").write("\n".join(L) + "\n")

def check(out):
    p = os.path.join(out, "breakdown.json")
    if not os.path.exists(p): return {"exists": False, "filled_seconds": 0, "seconds": 0}
    B = json.load(open(p)); s = B.get("seconds", [])
    filled = sum(1 for r in s if sum(1 for f in FIELDS if str(r.get(f, "")).strip()) >= 4)
    ps = B.get("pinterest_sources") or {}
    return {"exists": True, "seconds": len(s), "filled_seconds": filled, "events": len(B.get("events", [])),
            "filled_events": sum(1 for e in B.get("events", []) if any(str(e.get(f, "")).strip() for f in FIELDS)),
            "pin_categories_logged": [k for k in PIN_CATEGORIES if any("pinterest." in str(i.get("pin_url", "")) or "pin.it" in str(i.get("pin_url", "")) for i in (ps.get(k) or []))],
            "make_it_ours": len([x for x in (B.get("make_it_ours") or []) if str(x).strip()])}

def main():
    if len(sys.argv) > 2 and sys.argv[1] in ("md", "check"):
        if sys.argv[1] == "md": write_md(sys.argv[2]); print("wrote", os.path.join(sys.argv[2], "breakdown.md"))
        else:
            r = check(sys.argv[2]); print(json.dumps(r)); sys.exit(0 if r["exists"] and r["filled_seconds"] >= max(1, r["seconds"] * 0.8) else 1)
        return
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("src"); ap.add_argument("-o", "--out"); ap.add_argument("--tile", type=int, default=180)
    ap.add_argument("--start", type=float, default=0.0); ap.add_argument("--end", type=float)
    ap.add_argument("--frames-at"); ap.add_argument("--sheet-width", type=int); ap.add_argument("--min-free-gb", type=float, default=1.5)
    ap.add_argument("--title"); ap.add_argument("--keep-video", action="store_true"); ap.add_argument("--ytdlp-arg", action="append", default=[])
    a = ap.parse_args()
    is_url = re.match(r"https?://", a.src) is not None
    name = re.sub(r"[^A-Za-z0-9_-]+", "_", (a.title or os.path.splitext(os.path.basename(a.src.rstrip('/')))[0]))[:40] or "ref"
    out = a.out or os.path.join("refs_breakdown", name); os.makedirs(out, exist_ok=True)
    tmp = tempfile.mkdtemp(prefix="refbd_") if is_url else None
    try:
        src = fetch(a.src, tmp, a.ytdlp_arg) if is_url else a.src
        if is_url and a.keep_video: shutil.copy(src, os.path.join(out, "source.mp4"))
        m = analyse(src, out, a.tile, a.start, a.end, a.frames_at, a.sheet_width, a.min_free_gb, a.title, a.src if is_url else None)
    finally:
        if tmp: shutil.rmtree(tmp, ignore_errors=True)
    print(json.dumps({k: m[k] for k in ("source", "source_fps", "duration_s", "frames_sampled", "unique_frames", "fps_note", "counts")}, indent=1))
    print(f"-> {out}/sheets/ (one 60-frame sheet per second), motion_graph.png, breakdown.json, breakdown.md")
    print("NEXT: open every sheet, fill breakdown.json (effect/animation/easing/text/font/text colour/glow/background/subject/b-roll/transition/camera/sfx), then: python3 ref_breakdown.py md", out)

if __name__ == "__main__":
    main()
