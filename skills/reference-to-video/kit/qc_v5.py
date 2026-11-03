#!/usr/bin/env python3
"""qc_v5.py — Zyqor Motion Kit v5.2 QUALITY GATE. A render that fails here is NOT sent to anyone. (Sujon, Nov 3 2026: "strictly")
  python3 qc_v5.py --video out.mp4 --spec shots.json [--jsx build/reel.jsx]
  python3 qc_v5.py --jsx some_comp.jsx            (audit an old/hand-made comp for glow + banned colours only)
HARD FAILS (exit code 1):
  F1 no Pinterest references pulled first (spec "refs" must name a references/<topic>/ folder that has pins.json, or a ref you analysed)
  F2 glow: any Glow on text, more than ONE Glow per shot, or a Glow on an adjustment/full-frame layer (blanket glow)
  F3 caption colour system missing: no gradient-keyword token ("s":"g") in the captions, or two highlight systems mixed (g + m)
  F4 a gradient preset that is not in zq_config.json, or one whose colours fall in the banned purple/blue/cyan range
  F5 banned "AI" palette on screen: purple/blue/cyan neon covers more than 6 % of any sampled frame
  F6 Blender used for text/titles/captions/effects (Blender = real 3D objects only)
  F7 an sfx/music file whose source is not logged (Pinterest pin in assets/pinterest/SOURCES.txt via pin_download.py, or a LICENSES.txt line)
  F8 loudness outside -14 +/-1 LUFS or true peak above -1 dBTP;  F9 not 1080x1920 / 30 fps
  F10 captions outside the 90 % safe area, or caption size under 40 px
  F11 (v5.2) no 60 fps frame breakdown of the reference: spec "breakdowns" must list ref_breakdown.py folders whose
      breakdown.json exists and has >= 80 % of its seconds filled in (effect/animation/text/colour/glow/bg/subject/...)
  F12 (v5.2) a category with no Pinterest pin logged: music, sfx, broll, subject, effect, background each need >= 1 pin URL
      (spec "pinterest_sources", the breakdown.json files, or assets/pinterest/assets_log.json written by pin_download.py)
  F13 (v5.2) fewer than 3 "make_it_ours" changes written (never copy a reference 1:1)
WARNINGS: a dead-still second (no motion), more than 4 sfx per second, captions longer than 4 words per line.
"""
import sys, os, json, re, argparse, subprocess, colorsys, glob
import numpy as np
KIT = os.path.dirname(os.path.abspath(__file__)); CFG = json.load(open(os.path.join(KIT, "zq_config.json")))
ap = argparse.ArgumentParser(); ap.add_argument("--video"); ap.add_argument("--spec"); ap.add_argument("--jsx"); a = ap.parse_args()
fails, warns, passes = [], [], []
def F(code, msg): fails.append(f"{code} {msg}")
def ok(code, msg): passes.append(f"{code} {msg}")
B = CFG["banned"]
def banned_hex(h):
    h = h.lstrip("#"); r, g, b = (int(h[i:i+2], 16) / 255 for i in (0, 2, 4)); H, S, V = colorsys.rgb_to_hsv(r, g, b)
    return any(lo <= H * 360 <= hi for lo, hi in B["hue_ranges_deg"]) and S >= B["min_saturation"] and V >= B["min_value"]
S = json.load(open(a.spec)) if a.spec else None; SD = os.path.dirname(os.path.abspath(a.spec)) if a.spec else KIT
# F1 Pinterest first
if S is not None:
    refs = S.get("refs") or []; found = []
    for r in refs:
        for base in (SD, KIT, os.path.join(KIT, ".."), os.path.join(KIT, "..", "..")):
            p = os.path.join(base, r.split(" ")[0])
            if os.path.exists(os.path.join(p, "pins.json")) or os.path.exists(os.path.join(p, "breakdown.json")) or os.path.exists(os.path.join(p, "style.json")) or glob.glob(os.path.join(p, "*.info.json")): found.append(r); break
    (ok if found else F)("F1", f"Pinterest/reference research pulled first: {len(found)} of {len(refs)} ref folders found" if found else "no Pinterest references pulled - run pinterest_refs.mjs \"<topic>\" first and list the folder in spec.refs")
# F2 glow
if a.jsx and os.path.exists(a.jsx):
    js = open(a.jsx).read(); body = js.split("// ---- generated from")[-1] if "// ---- generated from" in js else js
    n_glow = len(re.findall(r'["\']Glow["\']', body)); n_shots = len(S["shots"]) if S else 1
    if re.search(r'txt[^\n]*Glow|Glow[^\n]*txt|text[^\n]*["\']Glow', body, re.I): F("F2", "Glow applied to text")
    elif re.search(r'adjustmentLayer\s*=\s*true[^\n]*\n?[^\n]*["\']Glow', body): F("F2", "blanket Glow on an adjustment layer (glow on everything)")
    elif n_glow > n_shots: F("F2", f"{n_glow} Glow effects for {n_shots} shots (max one subtle accent glow per shot)")
    else: ok("F2", f"glow: {n_glow} (allowed <= {n_shots}, never on text/captions/cards/backgrounds)")
    for h in re.findall(r'#[0-9A-Fa-f]{6}', body):
        if banned_hex(h): F("F4", f"banned AI colour {h} in the comp"); break
# F3/F4/F10 captions
if S is not None:
    toks = [t for sh in S["shots"] for c in sh.get("captions", []) for t in c["tokens"]]
    kinds = {t.get("s", "b") for t in toks}
    if "g" not in kinds: F("F3", "no gradient keyword in the captions (mark the key word with \"s\":\"g\")")
    elif "m" in kinds: F("F3", "two highlight systems mixed (gradient + marker) - one highlight style per video")
    else: ok("F3", f"caption colour system: gradient keywords x{sum(1 for t in toks if t.get('s') == 'g')}, one style")
    cap = dict(CFG["caption_default"]); cap.update(S.get("caption", {})); gnames = [cap.get("grad")] + [c.get("style", {}).get("grad") for sh in S["shots"] for c in sh.get("captions", [])] + [t.get("style", {}).get("grad") for sh in S["shots"] for t in sh.get("titles", [])]
    for g in [g for g in gnames if g]:
        if isinstance(g, str) and g not in CFG["gradients"]: F("F4", f"gradient '{g}' is not a kit preset")
        stops = CFG["gradients"][g]["stops"] if isinstance(g, str) and g in CFG["gradients"] else (g if isinstance(g, list) else [])
        if any(banned_hex(h) for h in stops): F("F4", f"gradient {g} uses banned purple/blue/cyan")
    if not any(x.startswith("F4") for x in fails): ok("F4", "gradients are curated presets, none in the banned range")
    sa = CFG["safe_area"]; bad = []
    for sh in S["shots"]:
        for c in sh.get("captions", []):
            sz = c.get("style", {}).get("size", cap["size"])
            if not (sa["y"][0] <= c["y"] <= sa["y"][1]): bad.append(f"y={c['y']}")
            if sz < 40: bad.append(f"size {sz}")
            if len(c["tokens"]) > 4: warns.append(f"W caption line with {len(c['tokens'])} words (1-4 reads best)")
    (F if bad else ok)("F10", ("captions outside safe area / too small: " + ", ".join(bad)) if bad else "captions inside the 90% safe area, >= 40 px")
    # F6 Blender for text/effects
    blob = json.dumps(S).lower()
    if re.search(r'blender[^"]*(text|title|caption|save|glow|effect)', blob) or S.get("blender_text"): F("F6", "Blender used for text/effects")
    else: ok("F6", "no Blender text/effects (EffectCraft does text + effects)")
# F11-F13 (v5.2): 60 fps breakdown, Pinterest for every category, make it ours
CATS = ["music", "sfx", "broll", "subject", "effect", "background"]
if S is not None:
    import importlib.util
    spec_rb = importlib.util.spec_from_file_location("ref_breakdown", os.path.join(KIT, "ref_breakdown.py")); RB = importlib.util.module_from_spec(spec_rb); spec_rb.loader.exec_module(RB)
    bds = S.get("breakdowns") or []; bad = []; bjs = []
    for b in bds:
        d = None
        for base in (SD, KIT, os.path.join(KIT, "..")):
            p = os.path.join(base, b); p = os.path.dirname(p) if p.endswith(".json") else p
            if os.path.exists(os.path.join(p, "breakdown.json")): d = p; break
        if not d: bad.append(f"{b}: no breakdown.json"); continue
        r = RB.check(d); bjs.append(json.load(open(os.path.join(d, "breakdown.json"))))
        if r["filled_seconds"] < max(1, 0.8 * r["seconds"]): bad.append(f"{b}: only {r['filled_seconds']}/{r['seconds']} seconds filled")
    if not bds: F("F11", "no frame breakdown - run ref_breakdown.py on the main reference, fill breakdown.json, list the folder in spec.breakdowns")
    elif bad: F("F11", "; ".join(bad))
    else: ok("F11", f"{len(bds)} reference(s) broken down at 60 fps and filled in")
    pins = {k: [] for k in CATS}
    def addp(src):
        for k in CATS:
            for it in (src or {}).get(k, []) or []:
                u = it.get("pin_url", "") if isinstance(it, dict) else str(it)
                if "pinterest." in u or "pin.it" in u: pins[k].append(u)
    addp(S.get("pinterest_sources"))
    for bj in bjs: addp(bj.get("pinterest_sources"))
    lg = os.path.join(SD, "assets", "pinterest", "assets_log.json")
    if os.path.exists(lg):
        for row in json.load(open(lg)):
            if row.get("category") in pins and "pinterest" in row.get("pin_url", ""): pins[row["category"]].append(row["pin_url"])
    miss = [k for k in CATS if not pins[k]]
    (F if miss else ok)("F12", ("no Pinterest pin logged for: " + ", ".join(miss) + " (pin_download.py --cat <category> --breakdown ...)") if miss else "Pinterest pin logged for music, sfx, b-roll, subject, effect, background")
    mio = [x for x in (S.get("make_it_ours") or []) if str(x).strip()]
    for bj in bjs: mio += [x for x in (bj.get("make_it_ours") or []) if str(x).strip()]
    (ok if len(mio) >= 3 else F)("F13", f"{len(mio)} make-it-ours changes written" if len(mio) >= 3 else f"only {len(mio)} make-it-ours changes - write at least 3 (colour, transition, text/layout, b-roll angle ...)")
# F7 sources
if a.spec:
    ev = os.path.join(SD, "build", "sfx_events.json"); used = []
    if os.path.exists(ev): used = sorted({e["sfx"] for e in json.load(open(ev))})
    if S and S.get("music"): used.append(S["music"]["file"])
    lic_text = ""
    sfxd = os.environ.get("ZQ_SFX_DIR", "/nonexistent")
    for p in glob.glob(os.path.join(KIT, "**", "LICENSES.txt"), recursive=True) + glob.glob(os.path.join(KIT, "..", "*", "LICENSES.txt")) + \
             [os.path.join(sfxd, "LICENSES.txt"), os.path.join(sfxd, "..", "SOURCES.txt"), os.path.join(SD, "assets", "pinterest", "SOURCES.txt")]:
        if os.path.exists(p): lic_text += open(p, errors="ignore").read()
    missing = [u for u in used if os.path.basename(u).split(".")[0] not in lic_text]
    (F if missing else ok)("F7", ("source not logged for: " + ", ".join(missing) + " (pin_download.py logs it)") if missing else f"{len(used)} sound files, source logged (Pinterest pin / sources list)")
# video checks
if a.video:
    pr = json.loads(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height,r_frame_rate:format=duration", "-of", "json", a.video], capture_output=True, text=True).stdout)
    st = pr["streams"][0]; dur = float(pr["format"]["duration"])
    (ok if (st["width"], st["height"]) == (1080, 1920) and st["r_frame_rate"] in ("30/1", "30000/1001") else F)("F9", f"{st['width']}x{st['height']} @ {st['r_frame_rate']}")
    L = subprocess.run(["ffmpeg", "-nostats", "-i", a.video, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    I = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", L)[-1]); TP = float(re.findall(r"Peak:\s+(-?[\d.]+) dBFS", L)[-1])
    (ok if abs(I - CFG["loudness"]["lufs"]) <= 1 and TP <= CFG["loudness"]["true_peak_max"] + 0.05 else F)("F8", f"loudness {I} LUFS, true peak {TP} dBTP")
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", a.video, "-vf", "fps=4,scale=108:192", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True).stdout
    fr = np.frombuffer(raw, np.uint8).reshape(-1, 192, 108, 3).astype(np.float32) / 255
    mx = fr.max(3); mn = fr.min(3); sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    r, g, b = fr[..., 0], fr[..., 1], fr[..., 2]; d = np.maximum(mx - mn, 1e-6)
    h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    inb = np.zeros_like(h, bool)
    for lo, hi in B["hue_ranges_deg"]: inb |= (h >= lo) & (h <= hi)
    share = (inb & (sat >= B["min_saturation"]) & (mx >= B["min_value"])).mean((1, 2)); worst = float(share.max())
    (F if worst > B["max_frame_share"] else ok)("F5", f"banned purple/blue/cyan share: worst frame {worst*100:.1f}% (limit {B['max_frame_share']*100:.0f}%)")
    diff = np.abs(np.diff(fr, axis=0)).mean((1, 2, 3)); still = 0; longest = 0
    for x in diff: still = still + 1 if x < 0.0015 else 0; longest = max(longest, still)
    if longest >= 4: warns.append(f"W {longest/4:.1f} s with no motion (dead-still)")
    if a.spec and os.path.exists(os.path.join(SD, "build", "sfx_events.json")):
        n = len(json.load(open(os.path.join(SD, "build", "sfx_events.json"))))
        if n / max(dur, 1) > 4: warns.append(f"W {n/dur:.1f} sfx per second (busy; 1-3 reads premium)")
rep = {"pass": not fails, "fails": fails, "warnings": warns, "passed": passes}
out = os.path.join(SD, "build", "qc_report.json") if a.spec else None
if out: os.makedirs(os.path.dirname(out), exist_ok=True); json.dump(rep, open(out, "w"), indent=1)
for p in passes: print("  ok  ", p)
for w in warns: print("  warn", w)
for f in fails: print("  FAIL", f)
print("QC:", "PASS" if not fails else f"FAIL ({len(fails)}) - fix before sending")
sys.exit(0 if not fails else 1)
