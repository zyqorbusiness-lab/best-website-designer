#!/usr/bin/env python3
"""join_parts.py - glue NAME.part000, NAME.part001 ... back into NAME (files over 2.4 MB are stored in parts in this repo).
  python3 tools/join_parts.py assets [--keep]     joins everything under assets/, deletes the parts unless --keep
  python3 tools/join_parts.py --verify assets      checks every file in assets/MANIFEST.csv exists with the listed size (+-1%)"""
import os, sys, re, csv, glob
def join(root, keep):
    n = 0
    for p in sorted(glob.glob(os.path.join(root, "**", "*.part000"), recursive=True)):
        base = p[:-8]; parts = sorted(glob.glob(base + ".part[0-9][0-9][0-9]"))
        with open(base, "wb") as out:
            for q in parts: out.write(open(q, "rb").read())
        if not keep:
            for q in parts: os.remove(q)
        n += 1; print("joined", os.path.relpath(base, root), len(parts), "parts")
    print(n, "files joined")
def verify(root):
    bad = 0
    for r in csv.DictReader(open(os.path.join(root, "MANIFEST.csv"), encoding="utf8")):
        p = os.path.join(root, r["local_filename"])
        if not os.path.exists(p): print("MISSING", r["local_filename"]); bad += 1; continue
        want = float(r["size_mb"]) * 1e6
        if abs(os.path.getsize(p) - want) > max(0.01 * want, 20000): print("SIZE?", r["local_filename"], os.path.getsize(p), want); bad += 1
    print("manifest ok" if not bad else f"{bad} problems"); return bad
if __name__ == "__main__":
    a = [x for x in sys.argv[1:] if not x.startswith("--")]
    if "-h" in sys.argv or "--help" in sys.argv or not a: print(__doc__); sys.exit(0)
    (verify if "--verify" in sys.argv else (lambda r: join(r, "--keep" in sys.argv)))(a[0] if "--verify" not in sys.argv else a[0])
