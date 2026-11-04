#!/usr/bin/env python3
"""ec_reel.py — Zyqor Motion Kit v5 DEFAULT pipeline: shots.json -> EffectCraft comp (text, effects, cards, transitions, grade)
-> render -> premium sfx cues -> mix -> QC.  Blender is NOT used here (text/effects are EffectCraft's job).

  python3 ec_reel.py shots.json [--out out.mp4] [--frames-only 0.8,2.5,6.0] [--no-render]

shots.json (see templates/ec_kinetic_v5/demo_shots.json for a full example):
  {"duration": 8.0, "caption": {...caption style...}, "palette": "warm_paper", "grade": {...},
   "voice": [{"file": "vo.mp3", "from": 0.0, "to": 3.15, "at": 0.25}], "music": {"file": "...", "db": -24},
   "shots": [{"a": 0, "b": 3.5, "bg": "paper" | "studio" | {"plate": "photo.jpg"},
              "cards": [{"file": "card.png", "x": 330, "y": 760, "t": 0.3, "rot": -6, "scale": 100, "tilt": [-12, 4]}],
              "cursor": {"path": [[2.4, [900, 1500]], [2.85, [760, 860]]], "taps": [2.9]},
              "captions": [{"y": 1390, "end": 1.4, "tokens": [{"w": "AI", "t": 0.25, "s": "b"}, ...]}],
              "titles": [{"text": "SAVE", "x": 540, "y": 980, "t": 6.1, "style": {"font": "Inter-Bold", "size": 300, "grad": "ember"}}],
              "out": {"type": "zoom" | "whip" | "glitch" | "cut", "t": 3.5}}]}
Token styles: b bold (base), r regular, i serif-italic accent, g GRADIENT keyword (preset from zq_config.json), m marker-bar keyword.
"""
import sys, os, json, argparse, subprocess, shutil
KIT = os.path.dirname(os.path.abspath(__file__))
EC = os.environ.get("EFFECTCRAFT_CLI", "effectcraft-cli")   # Windows: %LOCALAPPDATA%\\Programs\\ArtCraft\\EffectCraft\\effectcraft-cli.exe
RUN = ["nice", "-n", "10", "timeout", "-k", "10"]
ap = argparse.ArgumentParser(); ap.add_argument("spec"); ap.add_argument("--out"); ap.add_argument("--frames-only"); ap.add_argument("--no-render", action="store_true"); ap.add_argument("--dry-run", action="store_true", help="write build/reel.jsx and stop (no EffectCraft needed) - then run qc_v5.py --spec <spec> --jsx build/reel.jsx")
a = ap.parse_args()
spec_path = os.path.abspath(a.spec); SD = os.path.dirname(spec_path); S = json.load(open(spec_path))
CFG = json.load(open(os.path.join(KIT, "zq_config.json")))
LIB = open(os.path.join(KIT, "templates", "ec_kinetic_v5", "zq_lib.jsx")).read()
WORK = os.path.join(SD, "build"); os.makedirs(WORK, exist_ok=True)
def P(f): return f if os.path.isabs(f) else os.path.join(SD, f)
def J(v): return json.dumps(v, ensure_ascii=False)
def grad(name): return CFG["gradients"][name]["stops"] if isinstance(name, str) else name
dur = S["duration"]; C = dict(CFG["caption_default"]); C.update(S.get("caption", {}))
if isinstance(C.get("grad"), str): C["grad"] = grad(C["grad"])
body = [f'ZQ.ASSETS={J(os.path.join(KIT,"templates","ec_kinetic_v5","assets"))};', f'var comp=app.project.items.addComp("Reel",1080,1920,1,{dur},30); comp.motionBlur=true; ZQ.cues=[];']
trans = []
for i, sh in enumerate(S["shots"]):
    A, B = sh["a"], sh["b"]; bg = sh.get("bg", "paper")
    if isinstance(bg, dict): body.append(f'var bgL=background(comp,"plate",{A},{B},{{file:{J(P(bg["plate"]))}}});')
    else: body.append(f'var bgL=background(comp,{J(bg)},{A},{B},{J(sh.get("bg_opts", {}))});')
    body.append(f'for(var q=0;q<bgL.length;q++){{ setv(tr(bgL[q],"ADBE Scale"),[[{A},[100,100]],[{B},[{100+sh.get("push",4)},{100+sh.get("push",4)}]]],"linear"); }}')
    for c in sh.get("cards", []):
        o = {k: c[k] for k in ("rot", "scale", "tilt", "float", "shadow", "sfx", "name") if k in c}
        if c.get("stay"): o["out"] = False
        body.append(f'card(comp,{J(P(c["file"]))},{c["x"]},{c["y"]},{c["t"]},{c.get("end", B)},{J(o)});')
    for t in sh.get("titles", []):
        st = dict(t.get("style", {})); 
        if "grad" in st: st["grad"] = grad(st["grad"])
        body.append(f'title(comp,{J(t["text"])},{t["x"]},{t["y"]},{t["t"]},{t.get("end", B)},{J(st)},{J(t.get("opts", {}))});')
    for cl in sh.get("captions", []):
        CC = dict(C); CC.update(cl.get("style", {}))
        if isinstance(CC.get("grad"), str): CC["grad"] = grad(CC["grad"])
        body.append(f'captionLine(comp,{J(cl["tokens"])},{cl["y"]},{cl["end"]},{J(CC)});')
    cu = sh.get("cursor")
    if cu: body.append(f'cursor(comp,{J(os.path.join(KIT,"templates","ec_kinetic_v5","assets","cursor.png"))},{J(os.path.join(KIT,"templates","ec_kinetic_v5","assets","ring.png"))},{J(cu["path"])},{J(cu["taps"])},{cu.get("end", B)});')
    if sh.get("out") and sh["out"]["type"] != "cut": trans.append(sh["out"])
    for ex in sh.get("extra_jsx", []): body.append(ex)
for t in trans:
    fn = {"zoom": "zoomBlur", "whip": "whip", "glitch": "glitch"}[t["type"]]
    body.append(f'{fn}(comp,{t["t"]});' if fn != "whip" else f'whip(comp,{t["t"]},{t.get("dir", 90)});')
    if t.get("flash"): body.append(f'flash(comp,{t["t"]});')
g = dict(CFG["grade_default"]); g.update(S.get("grade", {}))
body.append(f'grade(comp,{J(g)});')
proj = os.path.join(WORK, "reel.ecproj"); cues = os.path.join(WORK, "cues.json")
body.append('writeLn("ZQCUES "+JSON.stringify(ZQ.cues));')
body.append(f'app.project.save(new File({J(proj)})); writeLn("built "+comp.numLayers+" layers, "+ZQ.cues.length+" sfx cues");')
jsx = os.path.join(WORK, "reel.jsx"); open(jsx, "w").write(LIB + "\n// ---- generated from " + os.path.basename(spec_path) + " ----\n" + "\n".join(body) + "\n")
if a.dry_run: print("dry run: wrote", jsx); sys.exit(0)
r = subprocess.run(RUN + ["300", EC, "script", jsx], capture_output=True, text=True, cwd=WORK); print('\n'.join(l for l in r.stdout.splitlines() if not l.startswith('ZQCUES'))[-3000:], r.stderr[-2000:])
if r.returncode != 0: sys.exit("EffectCraft script failed")
# sfx cues come back on stdout (EffectCraft scripts may not write files unless that preference is on)
for line in r.stdout.splitlines():
    if line.startswith("ZQCUES "): open(cues, "w").write(line[7:])
if a.frames_only:
    for t in a.frames_only.split(","):
        subprocess.run(RUN + ["120", EC, "render-frame", "--project", proj, "--comp", "Reel", "--time", t, "--max-side", "960", "--out", os.path.join(WORK, f"f_{t}.png")], capture_output=True)
    sys.exit(0)
if a.no_render: sys.exit(0)
out = os.path.abspath(a.out or os.path.join(SD, "reel_v5.mp4")); silent = os.path.join(WORK, "silent.mp4")
subprocess.run(RUN + ["5400", EC, "render", "--project", proj, "--comp", "Reel", "--out", silent, "--format", "h264", "--bitrate", "22000"], check=True)
# ---- sound: premium sfx at the cues (licensed library only, see audio/LICENSES), voice, music bed; -14 LUFS master
ev = []; lib = CFG["sfx_map"]
for c in json.load(open(cues)):
    if not c.get("sfx"): continue
    m = lib.get(c["sfx"]); 
    if not m: continue
    ev.append({"t": c["t"], "sfx": m["file"], "db": c.get("db", -10) + m.get("trim_db", 0), "lead": max(c.get("lead", 0), m.get("lead", 0)), "dur": m.get("dur", 1.2)})
# de-clutter (premium = fewer, cleaner hits): the same sound never twice within 0.12 s, and at most 2 layered sounds at one moment
ev.sort(key=lambda e: e["t"]); keep = []
for e in ev:
    near = [k for k in keep if e["t"] - k["t"] < 0.12]
    if any(k["sfx"] == e["sfx"] for k in near) or len(near) >= 2: continue
    keep.append(e)
json.dump(keep, open(os.path.join(WORK, "sfx_events.json"), "w"), indent=1)
sfxdir = os.environ.get("ZQ_SFX_DIR", os.path.join(KIT, "sfx_v2"))
subprocess.run(RUN + ["300", "python3", os.path.join(KIT, "sfx_mix.py"), os.path.join(WORK, "sfx_events.json"), os.path.join(WORK, "sfx.wav"), str(dur)], check=True, env=dict(os.environ, ZQ_SFX_DIR=sfxdir))
mix_args = [os.path.join(KIT, "master_mix.sh"), os.path.join(WORK, "mix.wav"), str(dur), "--sfx", os.path.join(WORK, "sfx.wav")]
if S.get("voice"):
    parts = []; fl = []
    for k, v in enumerate(S["voice"]):
        fl.append(f'[{k}:a]atrim={v["from"]}:{v["to"]},asetpts=PTS-STARTPTS,adelay={int(v["at"]*1000)}|{int(v["at"]*1000)}[v{k}]'); parts += ["-i", P(v["file"])]
    fl.append("".join(f"[v{k}]" for k in range(len(S["voice"]))) + f'amix=inputs={len(S["voice"])}:normalize=0,apad,atrim=0:{dur}[vo]')
    subprocess.run(RUN + ["300", "ffmpeg", "-v", "error", "-y"] + parts + ["-filter_complex", ";".join(fl), "-map", "[vo]", "-ar", "48000", "-ac", "1", os.path.join(WORK, "vo.wav")], check=True)
    mix_args += ["--voice", os.path.join(WORK, "vo.wav")]
else: mix_args += ["--duck-sfx"]
if S.get("music"): mix_args += ["--music", P(S["music"]["file"]), "--music-db", str(S["music"].get("db", -9))] + (["--music-start", str(S["music"]["start"])] if "start" in S["music"] else [])
subprocess.run(RUN + ["600"] + mix_args, check=True)
subprocess.run(RUN + ["900", "ffmpeg", "-v", "error", "-y", "-i", silent, "-i", os.path.join(WORK, "mix.wav"), "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-crf", "19", "-preset", "slow", "-maxrate", "9M", "-bufsize", "18M", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "-shortest", out], check=True)
print("wrote", out)
subprocess.run(["python3", os.path.join(KIT, "qc_v5.py"), "--video", out, "--spec", spec_path, "--jsx", jsx])
