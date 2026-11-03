#!/usr/bin/env python3
"""pin_download.py — Zyqor Motion Kit v5.2: take an asset straight from a Pinterest pin into YOUR project.

Sujon, Nov 3 2026: "Background music se b roll subject sound effects har ek chiz pinterest se le" /
"Sab use kar pinterest se". So at edit time every category comes from Pinterest first:
music, sfx, b-roll, subject, effects (overlays, light leaks, transitions), background.

  python3 pin_download.py <pin_url> [<pin_url> ...] --cat broll --project projects/my_reel
         [--audio-only] [--original] [--breakdown refs_breakdown/ref8/breakdown.json] [--note "warm light leak"]

  --cat         music | sfx | broll | subject | effect | background
  --audio-only  keep only the sound (default for music and sfx) -> .m4a
  --original    also fetch the pin's original link (Instagram/YouTube post the pin points to) when it is better quality
  --breakdown   also log the pin into that breakdown.json "pinterest_sources" (what qc_v5.py checks)
  --name whoosh save as whoosh.m4a (sfx_mix.py finds sounds by name; run ec_reel.py with
                ZQ_SFX_DIR=<project>/assets/pinterest/sfx so your Pinterest sounds are used first)
  --clip 3.2-4.1 keep only that part of the pin (one sound out of an sfx-pack video)

Saves to <project>/assets/pinterest/<cat>/<pin id>.<ext> and logs every file in
<project>/assets/pinterest/assets_log.json + SOURCES.txt (pin URL, creator, title, original link, file).
Best quality first: the pin's MP4/HLS video or the original-size image. Pins are often reposts -
the "original" link in the log is where the first upload lives.
The files stay in YOUR project folder - they are not put back into the kit zip or the public repo.
Search ideas per category: music "lofi beat reel", "cinematic background music"; sfx "whoosh sound effect",
"ui click sound", "riser transition sound"; broll "laptop desk aesthetic video", "city night b roll";
subject "person typing cutout", "phone mockup hand video"; effect "light leak overlay", "film grain overlay",
"paper tear transition"; background "paper texture background", "studio backdrop video".
Needs python3, ffmpeg, yt-dlp (pip install yt-dlp) and requests.
"""
import sys, os, re, json, time, shutil, subprocess, tempfile, argparse
try:
    import requests
except ImportError:
    requests = None
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"}
CATS = ["music", "sfx", "broll", "subject", "effect", "background"]

def sh(cmd, timeout=600):
    with tempfile.TemporaryFile() as log:
        p = subprocess.Popen(cmd, stdout=log, stderr=subprocess.STDOUT)
        try: p.wait(timeout=timeout)
        except subprocess.TimeoutExpired: p.kill(); p.wait(); return 124, "timeout"
        log.seek(0); return p.returncode, log.read().decode(errors="ignore")

def pin_id(url):
    m = re.search(r"/pin/(\d+)", url); return m.group(1) if m else re.sub(r"\W+", "_", url)[-24:]

def page_info(url):
    """read the public pin page: title, creator, video (mp4/HLS), original image, outbound link."""
    info = {"pin_url": url}
    if not requests: return info
    try: h = requests.get(url, headers=UA, timeout=20).text
    except Exception as e: info["page_error"] = str(e)[:120]; return info
    def og(p):
        m = re.search(r'<meta[^>]+property="og:%s"[^>]+content="([^"]*)"' % p, h); return m.group(1) if m else ""
    info["title"] = og("title") or og("description")
    mp4 = re.findall(r'https://v1\.pinimg\.com/videos/[^"\\ ]+?\.mp4', h)
    hls = re.findall(r'https://v1\.pinimg\.com/videos/[^"\\ ]+?\.m3u8', h)
    img = re.findall(r'https://i\.pinimg\.com/originals/[^"\\ ]+?\.(?:jpg|png|gif|webp)', h)
    info["video_mp4"] = sorted(set(mp4), key=lambda u: ("720" not in u, "V_EXP" in u))[:1]
    info["video_hls"] = list(dict.fromkeys(hls))[:1]
    info["image"] = list(dict.fromkeys(img))[:1] or ([og("image")] if og("image") else [])
    m = re.search(r'"link":"(https?:[^"]+)"', h); info["outbound"] = m.group(1).encode().decode("unicode_escape") if m and "pinterest" not in m.group(1) else ""
    m = re.search(r'"username":"([^"]+)"', h); info["creator"] = m.group(1) if m else ""
    return info

def fetch(url, cat, project, audio_only, original, name=None, clip=None):
    dest = os.path.join(project, "assets", "pinterest", cat); os.makedirs(dest, exist_ok=True)
    pid = pin_id(url); base = os.path.join(dest, name or pid); info = page_info(url); got = None
    tmp = tempfile.mkdtemp(prefix="pin_")
    try:
        rc, out = sh(["yt-dlp", "-q", "--no-playlist", "-f", "bv*+ba/b", "--merge-output-format", "mp4", "-o", os.path.join(tmp, "v.%(ext)s"), url], 600)
        vids = [os.path.join(tmp, f) for f in os.listdir(tmp)]
        if vids: got = vids[0]
        elif info.get("video_mp4") or info.get("video_hls"):
            src = (info.get("video_mp4") or info.get("video_hls"))[0]
            rc, out = sh(["ffmpeg", "-v", "error", "-y", "-i", src, "-c", "copy", os.path.join(tmp, "v.mp4")], 600)
            if rc == 0: got = os.path.join(tmp, "v.mp4")
        if not got and info.get("image") and requests:
            ext = os.path.splitext(info["image"][0])[1] or ".jpg"; p = os.path.join(tmp, "img" + ext)
            open(p, "wb").write(requests.get(info["image"][0], headers=UA, timeout=30).content); got = p
        if original and info.get("outbound") and re.search(r"instagram|youtu|tiktok|vimeo", info["outbound"]):
            rc, out = sh(["yt-dlp", "-q", "--no-playlist", "-f", "bv*+ba/b", "--merge-output-format", "mp4", "-o", os.path.join(tmp, "orig.%(ext)s"), info["outbound"]], 600)
            o = [os.path.join(tmp, f) for f in os.listdir(tmp) if f.startswith("orig.")]
            if o: got = o[0]; info["took_original"] = True
        if not got: raise RuntimeError("no media found on the pin (try --original, or open the pin and use its link)")
        cut = []
        if clip:
            a_, b_ = [float(x) for x in clip.split("-")]; cut = ["-ss", str(a_), "-t", str(b_ - a_)]
        if audio_only and not got.lower().endswith((".jpg", ".png", ".gif", ".webp")):
            final = base + ".m4a"; rc, out = sh(["ffmpeg", "-v", "error", "-y"] + cut + ["-i", got, "-vn", "-c:a", "aac", "-b:a", "192k", final], 600)
            if rc != 0: raise RuntimeError("no audio track on this pin: " + out[-200:])
        elif cut and not got.lower().endswith((".jpg", ".png", ".gif", ".webp")):
            final = base + ".mp4"; rc, out = sh(["ffmpeg", "-v", "error", "-y"] + cut + ["-i", got, "-c:v", "libx264", "-crf", "16", "-c:a", "aac", final], 900)
            if rc != 0: raise RuntimeError(out[-200:])
        else:
            final = base + os.path.splitext(got)[1]; shutil.move(got, final)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    return final, info

def log(project, cat, final, info, note, breakdown):
    d = os.path.join(project, "assets", "pinterest"); lp = os.path.join(d, "assets_log.json")
    L = json.load(open(lp)) if os.path.exists(lp) else []
    row = {"file": os.path.relpath(final, project), "category": cat, "pin_url": info["pin_url"], "creator": info.get("creator", ""),
           "title": (info.get("title") or "")[:140], "original": info.get("outbound", ""), "note": note or "",
           "downloaded_at": time.strftime("%Y-%m-%d %H:%M"), "source": "Pinterest pin"}
    L = [r for r in L if r["file"] != row["file"]] + [row]; json.dump(L, open(lp, "w"), indent=1, ensure_ascii=False)
    with open(os.path.join(d, "SOURCES.txt"), "w") as f:
        for r in L: f.write(f"{os.path.basename(r['file'])}\t{r['category']}\t{r['pin_url']}\t{r['creator']}\t{r['original']}\n")
    if breakdown and os.path.exists(breakdown):
        B = json.load(open(breakdown)); ps = B.setdefault("pinterest_sources", {k: [] for k in CATS})
        lst = ps.setdefault(cat, []); lst[:] = [x for x in lst if x.get("pin_url") != row["pin_url"]] + [{"pin_url": row["pin_url"], "file": row["file"], "note": note or row["title"][:60], "creator": row["creator"]}]
        json.dump(B, open(breakdown, "w"), indent=1, ensure_ascii=False)
    return row

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("pins", nargs="+"); ap.add_argument("--cat", required=True, choices=CATS); ap.add_argument("--project", default=".")
    ap.add_argument("--audio-only", action="store_true"); ap.add_argument("--original", action="store_true")
    ap.add_argument("--breakdown"); ap.add_argument("--note")
    ap.add_argument("--name", help="save under this name, e.g. whoosh / pop2 / riser (sfx_mix.py finds sfx by name)")
    ap.add_argument("--clip", help="keep only A-B seconds of the pin's video/sound, e.g. 3.2-4.1")
    a = ap.parse_args(); audio = a.audio_only or a.cat in ("music", "sfx"); bad = 0
    for u in a.pins:
        try:
            final, info = fetch(u, a.cat, a.project, audio, a.original, a.name if len(a.pins) == 1 else None, a.clip); row = log(a.project, a.cat, final, info, a.note, a.breakdown)
            print(f"ok  {a.cat:10s} {row['file']}  <- {u}" + (f"  (original: {row['original']})" if row["original"] else ""))
        except Exception as e:
            bad += 1; print(f"FAIL {u}: {e}")
    sys.exit(1 if bad else 0)

if __name__ == "__main__":
    main()
