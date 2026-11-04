#!/usr/bin/env python3
"""pick_asset.py - choose a music track or sfx from assets/ by MEASURED numbers (nobody can listen here; Sujon's ears decide).

  python3 tools/pick_asset.py music --beast            # loud, bass-heavy, fast tracks first
  python3 tools/pick_asset.py music --bed              # quiet-ish, low centroid beds that sit under a voice
  python3 tools/pick_asset.py sfx --hit                # impacts / braams: short, big sub-bass, no 2-5 kHz click
  python3 tools/pick_asset.py sfx --riser              # long swells (>= 2 s) with a late peak
  python3 tools/pick_asset.py sfx --whoosh             # 0.4-2 s, mid centroid, low tail
  python3 tools/pick_asset.py sfx --accent             # tiny glitch/zap/button/foley accents (use rarely)
  options: --assets DIR (default ./assets or ../assets)  --n 8  --folder NAME

Reads assets/MUSIC_SPECTRUM.csv and assets/sfx_sujon/INDEX.csv (measured with numpy on the original files).
Prints path, duration and the numbers the choice is based on. Pure csv, no dependencies."""
import argparse, csv, os, sys

def fnum(x, d=0.0):
    try: return float(x)
    except Exception: return d

def find_assets(a):
    for c in [a, "assets", os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets")]:
        if c and os.path.isdir(c): return os.path.abspath(c)
    sys.exit("assets/ folder not found (this is the private v5.6 build; the public kit has no assets). Use --assets DIR.")

def music(A, a):
    p = os.path.join(A, "MUSIC_SPECTRUM.csv"); rows = list(csv.DictReader(open(p)))
    out = []
    for r in rows:
        low, rms, bpm, dur = fnum(r["low150_share"]), fnum(r["mean_rms_db"]), fnum(r["bpm_guess"]), fnum(r["dur_s"])
        if dur < 20: continue                       # lists / snippets, not usable beds
        if a.beast: score = low * 2 + (rms + 20) / 10 + (1 if bpm >= 120 else 0) + (1 if fnum(r["loudness_range_db"]) >= 12 else 0) - (1 if fnum(r["centroid_hz"]) > 800 else 0)
        else: score = (-abs(rms + 14)) / 4 + (1 - abs(fnum(r["centroid_hz"]) - 350) / 600) - (1 if fnum(r["loudness_range_db"]) > 20 else 0)
        out.append((score, r))
    for s, r in sorted(out, key=lambda t: -t[0])[: a.n]:
        print(f"{r['file']:44s} {r['dur_s']:>6}s  rms {r['mean_rms_db']:>6} dB  low<150Hz {r['low150_share']}  centroid {r['centroid_hz']} Hz  bpm~{r['bpm_guess']}  range {r['loudness_range_db']} dB")

def sfx(A, a):
    rows = list(csv.DictReader(open(os.path.join(A, "sfx_sujon", "INDEX.csv"))))
    out = []
    for r in rows:
        if a.folder and a.folder.lower() not in r["folder"].lower(): continue
        d, pk, cen, low, sub, mid = fnum(r["dur_s"]), fnum(r["peak_db"]), fnum(r["centroid_hz"]), fnum(r["low200_share"]), fnum(r["sub100_share"]), fnum(r["mid2_5k_share"])
        t30 = fnum(r["len_to_m30dB_s"]); f = r["folder"].lower()
        if a.hit:
            if d > 15 or mid > 0.25: continue   # Impact files are 11-14 s: trim to the first ~2 s + 0.5 s fade
            score = low * 2 + sub - mid * 2 - t30 / 4 + (0.5 if 'impact' in f or 'braam' in f else 0)
        elif a.riser:
            if d < 2.0: continue
            score = (fnum(r["peak_at_s"]) / d) + low * 0.5 - mid
        elif a.whoosh:
            if not (0.4 <= d <= 3.0) or "whoosh" not in f and "transition" not in f: continue
            score = 1 - abs(cen - 1200) / 2000 - mid
        else:   # accent
            if d > 3 or not any(k in f for k in ("glitch", "zap", "button", "foley", "count")): continue
            score = -d - mid
        out.append((score, r))
    for s, r in sorted(out, key=lambda t: -t[0])[: a.n]:
        print(f"sfx_sujon/{r['folder']}/{r['name']:22s} {r['dur_s']:>5}s peak {r['peak_db']:>5} dB  centroid {r['centroid_hz']:>5} Hz  low<200 {r['low200_share']}  sub<100 {r['sub100_share']}  2-5k {r['mid2_5k_share']}")

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("kind", choices=["music", "sfx"]); ap.add_argument("--beast", action="store_true"); ap.add_argument("--bed", action="store_true")
    ap.add_argument("--hit", action="store_true"); ap.add_argument("--riser", action="store_true"); ap.add_argument("--whoosh", action="store_true"); ap.add_argument("--accent", action="store_true")
    ap.add_argument("--assets"); ap.add_argument("--n", type=int, default=8); ap.add_argument("--folder")
    a = ap.parse_args(); A = find_assets(a.assets)
    (music if a.kind == "music" else sfx)(A, a)

if __name__ == "__main__":
    main()
