#!/usr/bin/env python3
"""make_video.py — Zyqor Motion Kit v4: the TOPIC-DRIVEN workflow. Any topic, any reference (Pinterest pin, Instagram reel, local file).
  python3 make_video.py "<topic>" [--ref URL_or_file] [--template auto|soft3d_explainer|tilted_device_saas|framed_talking_head|before_after_showcase|saas_card_grid|timeline_reveal_showcase]
                        [--clip his_talking_clip.mp4] [--raw raw.mp4 --edited edited.mp4] [--keyword SITE] [--render]
What it does:
 1. REFERENCE: --ref URL -> yt-dlp download (Instagram/TikTok/YouTube/Pinterest video pins); --ref file -> used as is;
    no --ref -> pinterest_refs.mjs "<topic>" on Sujon's signed-in Pinterest (READ ONLY), picks the first downloaded video pin.
 2. BREAKDOWN: analyze_ref.py -> projects_v4/<slug>/style.json (cuts/s, motion, palette hexes, faces, cards, loudness, sfx density)
    + strip.jpg. LOOK at strip.jpg yourself before building (numbers miss style).
 3. TEMPLATE: style.json's "template" (or --template) -> the closest v4 recipe:
      soft3d_explainer       templates/explainer_soft3d_v4/   (ref 1)  Blender sprites + build_ref1.py + EffectCraft
      tilted_device_saas     templates/saas_blender_hero_v4/  (ref 2)  hero_v4.py (Blender scene) + comp_v4.jsx
      framed_talking_head    templates/talking_head_v4/       (ref 3)  run_ref3.sh <clip>
      before_after_showcase  templates/before_after_v4/       (ref 4)  run_ref4.sh <raw> <edited>
      saas_card_grid         templates/saas_cards_v4/         (ref 5)  build_ref5.py + comp_ref5.jsx (build_all_v4.sh ref5)
      timeline_reveal_showcase templates/before_after_v4/      (ref 6)  3-panel gaming edit + timeline proof (recipe in references/ref6_*/README.md)
 4. PARAMETERS: palette hexes, beat length and sfx density from style.json are written to projects_v4/<slug>/params.json and a
    plan.md (beats, captions to write, assets to gather) is generated for the topic; --render runs the template end to end when its
    inputs exist (talking head: --clip; before/after: --raw/--edited; soft3d/saas: after you edit plan/captions in the template).
"""
import sys, os, json, re, glob, subprocess, argparse, shutil
KIT = os.path.dirname(os.path.abspath(__file__))
ap = argparse.ArgumentParser(); ap.add_argument("topic"); ap.add_argument("--ref"); ap.add_argument("--template", default="auto")
ap.add_argument("--clip"); ap.add_argument("--raw"); ap.add_argument("--edited"); ap.add_argument("--keyword", default="SITE"); ap.add_argument("--render", action="store_true")
a = ap.parse_args()
slug = re.sub(r"[^a-z0-9]+", "_", a.topic.lower()).strip("_")[:40] or "video"
P = os.path.join(KIT, "projects_v4", slug); os.makedirs(P, exist_ok=True)
def sh(cmd, t=1800): print("$", cmd); return subprocess.run(cmd, shell=True, timeout=t)
# 1. reference
ref = None
if a.ref and os.path.exists(a.ref): ref = os.path.abspath(a.ref)
elif a.ref:
    sh(f'nice -n 10 timeout -k 10 600 yt-dlp -f "mp4/best" --write-info-json -o "{P}/ref.%(ext)s" "{a.ref}"'); ref = (glob.glob(f"{P}/ref.mp4") or glob.glob(f"{P}/ref.*"))[0]
else:
    ctx = os.environ.get("PINTEREST_CONTEXT", "")
    if not os.path.exists(os.path.join(KIT, "pinterest_refs.mjs")): sys.exit("no --ref given: send the topic to Tab on WhatsApp for Pinterest pins (or pass --ref <pin link | video file>)")
    sh(f'cd {KIT} && PINTEREST_CONTEXT={ctx} nice -n 10 timeout -k 10 900 node pinterest_refs.mjs "{a.topic}" 12 --scope=videos --videos=3')
    vids = sorted(glob.glob(os.path.join(KIT, "references", slug, "vids", "*.mp4")) + glob.glob(os.path.join(KIT, "references", "*" + slug + "*", "**", "*.mp4"), recursive=True))
    if not vids: sys.exit(f"no video pins downloaded for '{a.topic}' - pass --ref <url|file> or try --scope=pins in pinterest_refs.mjs")
    ref = vids[0]
print("reference:", ref)
# 2. breakdown
sh(f'nice -n 10 timeout -k 10 900 python3 {KIT}/analyze_ref.py "{ref}" "{P}"')
st = json.load(open(os.path.join(P, "style.json")))
tpl = st["template"] if a.template == "auto" else a.template
# 3-4. parameters + plan
params = dict(topic=a.topic, template=tpl, palette=st["palette"], beat_s=st["pace"]["beat_s"], sfx_per_s=st["pace"]["sfx_per_s"],
              target_len_s=min(25, max(12, round(st["duration_s"] * 0.6))), loudness_lufs=-14, true_peak_max=-1, keyword=a.keyword)
json.dump(params, open(os.path.join(P, "params.json"), "w"), indent=1)
recipes = {
 "soft3d_explainer": ["templates/explainer_soft3d_v4/build_ref1.py: edit CAPTIONS (word markup *blue* _coral italic_), BEATS and layout() for the topic",
                      "blender sprites_v4.py for each 3D object (phone_search / phone_site / avatar / star / pin / coin / tile --glyph)",
                      "python3 build_ref1.py && effectcraft-cli script comp_ref1.jsx && effectcraft-cli render ... && sfx_mix + master_mix (see build_all_v4.sh)"],
 "tilted_device_saas": ["capture the product's screens (templates/saas_blender_hero_v4/capture_dark.js), write screen_timeline.json (states, typing, cursor, clicks)",
                        "edit hero_v4.py: hook word, feature list, end bubble text; comp_v4.jsx: overlays; audio_sfx_events_v4.json",
                        "render Blender (2 processes x 8 threads), EffectCraft comp, mix (build_all_v4.sh ref2)"],
 "framed_talking_head": ["templates/talking_head_v4/run_ref3.sh <clip.mp4> --keyword KEYWORD  (everything automatic from the transcript)"],
 "before_after_showcase": ["templates/before_after_v4/run_ref4.sh <raw.mp4> <edited.mp4> --name ZYQOR --handle @zyqor.studio"],
 "saas_card_grid": ["edit SERVICES in templates/saas_cards_v4/build_ref5.py (real services, no fake numbers)",
                    "render the 3D icon tiles + build + EffectCraft comp + mix: ./build_all_v4.sh ref5"],
 "timeline_reveal_showcase": ["(ref 6, gaming 'Editing Timeline' reveal) record the edit's own NLE timeline as a screen recording while it plays (timeline.mp4)",
                    "start from templates/before_after_v4/build_ref4.py: 3 stacked panels instead of 2 - top banner 'EDITING / TIMELINE' (chunky game font, black stroke),",
                    "middle = the edited clip (run_ref3.sh output, or your own edit), bottom = timeline.mp4 in sync; blurred background image behind",
                    "word-by-word captions with lime/yellow fill + black stroke, confetti + 3D word sweep from Blender (text3d.py --anim slam), 'DM FOR PAID EDIT' strip",
                    "see references/ref6_gaming_timeline_reveal_DfRIa9ziZIy/README.md for the full recipe"]}
with open(os.path.join(P, "plan.md"), "w") as f:
    f.write(f"# {a.topic}\nreference: {ref}\ntemplate: {tpl}\n\n## measured style\n```\n{json.dumps(st, indent=1)[:1800]}\n```\n\n## steps\n")
    for i, s in enumerate(recipes[tpl], 1): f.write(f"{i}. {s}\n")
    f.write(f"\n## rules\n- palette: {', '.join(st['palette'])} (max 3 hues per frame)\n- a new visual beat every ~{params['beat_s']} s, sfx ~{params['sfx_per_s']}/s, master -14 LUFS / <= -1 dBTP\n"
            "- honest: concept work says concept; numbers on screen are true or clearly illustrative; licensed music only (music/LICENSES.txt)\n")
print(open(os.path.join(P, "plan.md")).read())
if a.render:
    if tpl == "framed_talking_head" and a.clip: sh(f'{KIT}/templates/talking_head_v4/run_ref3.sh "{a.clip}" "{P}/{slug}.mp4" --keyword {a.keyword}', 7200)
    elif tpl == "before_after_showcase" and a.raw and a.edited: sh(f'{KIT}/templates/before_after_v4/run_ref4.sh "{a.raw}" "{a.edited}" "{P}/{slug}.mp4"', 7200)
    else: print("--render: this template needs its content edited first (plan.md steps); nothing rendered.")
