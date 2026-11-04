#!/usr/bin/env python3
"""get_references.py - Zyqor Motion Kit v5.5: the DOWNLOADER for the reference reels (links only live in the kit; no third-party video is shipped).
  python3 get_references.py --list                         # print the 12 Nov-4 reels with links
  python3 get_references.py --out ~/refs_nov4              # download all 12 (yt-dlp) + metadata json
  python3 get_references.py --out ~/refs_nov4 --only 5 6 --edit-only    # also write ref*_EDIT.mp4: ONLY the edited panel of before/after reels
  python3 get_references.py --out ~/refs --group "his reels"            # older v5.3 reels (ref1-ref8 of the first list)
Needs: yt-dlp (+ ffmpeg for --edit-only). Instagram sometimes asks for a login: add --cookies-from-browser chrome (your own browser session).
Files go to --out (default ./refs_download), never inside the kit/zip/repo. Use them only to STUDY (ref_breakdown.py); do not post them.
Sujon's strict rule (Nov 4 2026): in before/after or raw-vs-edit references take ONLY the edited/after part. --edit-only crops it with the boxes below.
"""
import argparse, csv, json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
# Edited panel boxes x:y:w:h inside the 1080x1920 frame, EYEBALLED on one frame each (Nov 4 2026) - check with ref_breakdown.py before trusting.
EDIT_BOX = {"5": "443:485:573:1016", "6": "354:168:646:981"}

def rows(group_filter):
    for p in (os.path.join(HERE, "..", "REFERENCE_LINKS.csv"), os.path.join(HERE, "REFERENCE_LINKS.csv")):
        if os.path.exists(p):
            return [r for r in csv.DictReader(open(p, encoding="utf-8")) if r["kind"] == "instagram_reference_reel" and group_filter.lower() in r["group"].lower()]
    sys.exit("REFERENCE_LINKS.csv not found next to the kit")

def main():
    ap = argparse.ArgumentParser(description="Download the kit's reference reels with yt-dlp (links only live in the kit)")
    ap.add_argument("--out", default="refs_download"); ap.add_argument("--group", default="Nov 4 2026")
    ap.add_argument("--only", nargs="*", help="numbers, e.g. 1 5 12"); ap.add_argument("--list", action="store_true")
    ap.add_argument("--edit-only", action="store_true", help="also crop before/after refs to the EDIT panel (refs 5, 6)")
    ap.add_argument("--cookies-from-browser"); a = ap.parse_args()
    rs = rows(a.group)
    if a.only: rs = [r for r in rs if r["n"].split("_")[-1] in set(a.only) or r["n"] in set(a.only)]
    if a.list:
        for r in rs: print(r["n"], r["url"], "-", r["creator"])
        return
    os.makedirs(a.out, exist_ok=True)
    for r in rs:
        num = r["n"].split("_")[-1]; base = os.path.join(a.out, f"ref9_{num}" if "ref9_" in r["n"] else r["n"])
        cmd = ["yt-dlp", "-q", "--no-warnings", "--write-info-json", "-f", "bv*+ba/b", "--merge-output-format", "mp4", "-o", base + ".%(ext)s", r["url"]]
        if a.cookies_from_browser: cmd[1:1] = ["--cookies-from-browser", a.cookies_from_browser]
        print("downloading", r["n"], r["url"], flush=True)
        p = subprocess.run(cmd, capture_output=True, text=True)
        if p.returncode: print("  FAILED:", p.stderr.strip()[-300:]); continue
        if a.edit_only and num in EDIT_BOX:
            x, y, w, h = EDIT_BOX[num].split(":")
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", base + ".mp4", "-vf", f"crop={w}:{h}:{x}:{y}", "-c:a", "copy", base + "_EDIT.mp4"])
            print("  wrote", base + "_EDIT.mp4", "(edit panel only)")

if __name__ == "__main__":
    main()
