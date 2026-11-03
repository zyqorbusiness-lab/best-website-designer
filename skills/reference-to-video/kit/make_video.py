#!/usr/bin/env python3
"""make_video.py — Zyqor Motion Kit v5: ANY topic -> Pinterest first -> analysis -> shots.json -> EffectCraft (ec_reel.py) -> QC.
  python3 make_video.py "<topic>" [--voice vo.mp3 [--lang en|hi] | --words words.json] [--ref URL_or_file] [--grad ember] [--render]
  (v4 Blender/3D templates: python3 make_video_v4.py ... — use them only for real 3D objects; text/effects stay in EffectCraft)

1. PINTEREST FIRST (hard rule): 4 read-only searches on your signed-in Pinterest -> references/<slug>/... :
     "<topic> reel edit" (3 videos), "<topic> caption style", "warm aesthetic gradient background reels", "light leak overlay grain texture"
   Look at every sheet.jpg, mark TAKE/SKIP, skip purple/blue pins, fetch only free/licensed assets the pins link to (LICENSES.txt).
2. ANALYSIS: analyze_ref.py on --ref (or the first Pinterest video) -> style.json (cuts/s, motion, palette, loudness, sfx/s).
3. SHOTS: from the voice's word timings (transcribe_words.py, or --words) -> captions of 1-3 words, one gradient keyword every
   other line, a new shot (paper / studio) every ~3 s with zoom / whip / glitch between, kicker label on top -> projects_v5/<slug>/shots.json.
   Then YOU add cards (screenshots, photos, phone screen) and cursor taps where the voice talks about them.
4. --render: ec_reel.py shots.json -> mp4 + qc_v5.py (fails the render on any hard-rule break).
"""
import sys, os, json, re, glob, subprocess, argparse
KIT = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(KIT)
ap = argparse.ArgumentParser(); ap.add_argument("topic"); ap.add_argument("--voice"); ap.add_argument("--lang", default="en"); ap.add_argument("--words")
ap.add_argument("--ref"); ap.add_argument("--grad", default="ember"); ap.add_argument("--render", action="store_true"); ap.add_argument("--no-pinterest", action="store_true")
a = ap.parse_args()
slug = re.sub(r"[^a-z0-9]+", "_", a.topic.lower()).strip("_")[:40] or "video"
P = os.path.join(KIT, "projects_v5", slug); os.makedirs(P, exist_ok=True)
REFS = os.path.join(ROOT, "references")
def sh(cmd, t=1800): print("$", cmd); return subprocess.run(cmd, shell=True, timeout=t)
CFG = json.load(open(os.path.join(KIT, "zq_config.json")))
if a.grad not in CFG["gradients"]: sys.exit(f"--grad must be one of {list(CFG['gradients'])}")
# 1. Pinterest first
ref_dirs = []
if not a.no_pinterest:
    ctx = os.environ.get("PINTEREST_CONTEXT", "")   # your signed-in Pinterest browser context (optional; logged-out search works with fewer details)
    tool = next((p for p in [os.path.join(ROOT, "..", "pinterest_refs.mjs"), os.path.join(KIT, "pinterest_refs.mjs"), os.environ.get("PINTEREST_REFS", "")] if p and os.path.exists(p)), None)
    searches = [(f"{a.topic} reel edit", "--scope=videos --videos=3"), (f"{a.topic} caption style", "--scope=pins --no-video"),
                ("warm aesthetic gradient background reels", "--scope=pins --no-video"), ("light leak overlay grain texture", "--scope=pins --no-video")]
    for q, opt in searches:
        if tool: sh(f'cd "{os.path.dirname(tool)}" && PINTEREST_CONTEXT={ctx} nice -n 10 timeout -k 10 900 node pinterest_refs.mjs "{q}" 16 {opt}', 960)
        d = os.path.join(os.path.dirname(tool) if tool else REFS, "references", re.sub(r"[^a-z0-9]+", "_", q.lower()).strip("_"))
        if os.path.exists(os.path.join(d, "pins.json")): ref_dirs.append(d)
    if not tool: print("!! pinterest_refs.mjs not found - search Pinterest by hand and save what you take into references/<topic>/ (QC F1 needs it)")
# 2. analysis
ref = None
if a.ref and os.path.exists(a.ref): ref = os.path.abspath(a.ref)
elif a.ref:
    sh(f'nice -n 10 timeout -k 10 600 yt-dlp -f "mp4/best" --write-info-json -o "{P}/ref.%(ext)s" "{a.ref}"'); ref = (glob.glob(f"{P}/ref.mp4") or glob.glob(f"{P}/ref.*"))[0]
else:
    vids = sorted(v for d in ref_dirs for v in glob.glob(os.path.join(d, "vids", "*.mp4")))
    ref = vids[0] if vids else None
st = {}
if ref:
    sh(f'nice -n 10 timeout -k 10 900 python3 {KIT}/analyze_ref.py "{ref}" "{P}"'); st = json.load(open(os.path.join(P, "style.json")))
    ref_dirs.append(P)
# 3. words -> shots.json
words = []
if a.words: words = json.load(open(a.words))
elif a.voice:
    model = "tiny.en" if a.lang == "en" else "small"
    sh(f'nice -n 10 timeout -k 10 900 python3 {KIT}/transcribe_words.py "{a.voice}" "{P}/words.json" {model} {a.lang}'); words = json.load(open(f"{P}/words.json"))
lines, cur = [], []
for i, w in enumerate(words):
    cur.append(w); gap = (words[i + 1]["start"] - w["end"]) if i + 1 < len(words) else 9
    if len(cur) >= 3 or gap > 0.28 or re.search(r"[.,!?:;]$", w["text"]): lines.append(cur); cur = []
if cur: lines.append(cur)
dur = round((words[-1]["end"] + 0.6) if words else 8.0, 2)
shots, a0, k = [], 0.0, 0
bgs = ["paper", "studio"]; trans = ["zoom", "whip", "glitch"]
for li, ln in enumerate(lines):
    if not shots or ln[0]["start"] - shots[-1]["a"] > 3.0:
        if shots: shots[-1]["b"] = round(ln[0]["start"] - 0.05, 2); shots[-1]["out"] = {"type": trans[(len(shots) - 1) % 3], "t": shots[-1]["b"]}
        shots.append({"a": shots[-1]["b"] if shots else 0.0, "b": dur, "bg": bgs[len(shots) % 2], "push": 4, "cards": [], "captions": []})
    toks = []; key = max(range(len(ln)), key=lambda j: len(ln[j]["text"])) if li % 2 == 0 else -1
    for j, w in enumerate(ln): toks.append({"w": w["text"], "t": round(w["start"], 3), "s": "g" if j == key else ("b" if j == 0 else "r")})
    end = round(lines[li + 1][0]["start"] - 0.02, 3) if li + 1 < len(lines) else dur
    shots[-1]["captions"].append({"y": 1420, "end": end, "tokens": toks})
if shots: shots[0]["captions"].insert(0, {"y": 330, "end": shots[0]["b"], "style": {"size": 40, "font": "Inter-Medium", "tracking": 220, "fill": "#6E675E", "shadow": False},
                                          "tokens": [{"w": a.topic.upper()[:28], "t": 0.05, "s": "r"}]})
spec = {"duration": dur, "title": a.topic, "refs": [os.path.relpath(d, P) for d in ref_dirs], "caption": {"grad": a.grad, "size": 104},
        "voice": [{"file": os.path.abspath(a.voice), "from": 0, "to": dur, "at": 0}] if a.voice else [],
        "music": None, "shots": shots or [{"a": 0, "b": 8, "bg": "paper", "captions": []}], "_todo": "add cards (screenshots/photos/phone) + cursor taps; pick music from music/ (get_audio.sh)"}
if not spec["music"]: spec.pop("music")
json.dump(spec, open(os.path.join(P, "shots.json"), "w"), indent=1, ensure_ascii=False)
with open(os.path.join(P, "plan.md"), "w") as f:
    f.write(f"# {a.topic} (Zyqor Motion Kit v5)\n\nPinterest folders pulled: {len(ref_dirs)}\nreference analysed: {ref}\n\n")
    if st: f.write(f"measured: cuts/s {st.get('cuts_per_s')}, motion {st.get('motion_mean')}, sfx/s {st.get('onsets_per_s')}, palette {st.get('palette')}\n\n")
    f.write("## before you render\n- [ ] look at every Pinterest sheet.jpg, write TAKE/SKIP into references/<topic>/STYLE.md, skip purple/blue pins\n"
            "- [ ] fetch the overlays/textures/sfx you TAKE (free/licensed only, note the licence in LICENSES.txt)\n"
            "- [ ] Hinglish: whisper writes Hindi in Devanagari - replace caption words with the script's Roman spelling\n"
            "- [ ] add cards + cursor taps where the voice mentions them; pick ONE gradient (--grad)\n"
            "- [ ] python3 ec_reel.py shots.json --frames-only 1,3,5  (look), then full render; QC must PASS\n")
print(open(os.path.join(P, "plan.md")).read()); print("shots.json:", os.path.join(P, "shots.json"))
if a.render: sh(f'python3 {KIT}/ec_reel.py "{os.path.join(P, "shots.json")}" --out "{os.path.join(P, slug + ".mp4")}"', 7200)
