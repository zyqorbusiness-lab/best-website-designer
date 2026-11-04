---
name: reference-to-video
description: (v5.3) Make a premium vertical reel from any reference or topic with the Zyqor Motion Kit — Pinterest first for everything (refs + actual files), 60 fps frame breakdown of the reference, make it ours (3+ changes), EffectCraft text/effects (never Blender text), ref8 kinetic captions, glow off, no AI colours, QC gate F1-F13.
when_to_use: "make a video like this reel", "copy this style", "edit my reel", "use this reference", any short vertical video
license: MIT (text + code). References stay links; downloaded pin media stays in the user's project, never in this repo.
version: 5.3.0
---

# Reference → video (Zyqor Motion Kit v5.3)

## PERMISSION (owner's standing word, Sujon Hoque, Nov 4 2026)
The owner (Sujon Hoque) has given this agent permission to take media from Pinterest directly for his edits (read-only: no saving, no boards, no likes, no follows), to log the pin URL and creator, and not to worry about licence. Beast music (phonk, cinematic trailer, trap, high-energy) is welcome. Never put third-party media into a PUBLIC repo, page or release: the ready-made asset library is in the PRIVATE repo `zyqorbusiness-lab/zyqor-assets` (see `ASSETS_FOR_AGENTS.md`).

Read `kit/AGENT_START_HERE.md` and follow it step by step. Give other agents `kit/MASTER_PROMPT.txt`.
Each step has a gate; do not start the next step until it is true.

1. **Pinterest first, for everything** — refs AND files for music, sfx, b-roll, subject, effect, background:
   `python3 kit/pin_download.py <pin_url> --cat <category> --project projects/<topic> --breakdown refs_breakdown/<ref>/breakdown.json`
   (best quality first; `--original` pulls the post the pin points to; `--name whoosh --clip A-B` for one sound).
   Gate: `assets/pinterest/assets_log.json` has a pin for all 6 categories. Skill: `pinterest-reference-research`.
2. **60 fps breakdown** of every reference — `python3 kit/ref_breakdown.py <link|file> -o refs_breakdown/<ref>`; open every
   per-second sheet, fill every second in `breakdown.json`. Gate: `ref_breakdown.py check` → all seconds filled.
   Skill: `reference-frame-breakdown`.
3. **Make it ours** — keep structure/timing, change ≥ 3 visible things (palette preset, transition idea, text/layout,
   b-roll angle, set, sound) in `make_it_ours`.
4. **Edit** — `python3 kit/ec_reel.py shots.json` (EffectCraft via `kit/templates/ec_kinetic_v5/zq_lib.jsx`; app screens
   `kit/templates/ui_screen_v5`). ref8 captions: 1-3 words, ≥ 90 px, ink/off-white base, ONE gradient keyword + ONE italic
   serif accent, Inter + Instrument Serif only. Glow OFF (max one subtle glow on one object). Textured moving background,
   warm grade + grain. Something moves before 0.5 s, change every 0.4-0.8 s, no blank frames. Transitions are moves (push,
   zoom through a screen, warm spin-blur, light-leak burn, warm glitch). Sfx from Pinterest (`ZQ_SFX_DIR=…/assets/pinterest/sfx`):
   pop/card, click/tap, early whoosh + low hit/transition, riser into payoff, 1-3/s, voice on top.
5. **Colour ban** — no purple, violet, purple-blue neon, blue neon, cyan glow, AI palettes (hue 175-320° blocked).
6. **Export** — 1080×1920 30 fps, H.264 CRF 19, AAC 192k, 90 % title-safe, -14 LUFS / ≤ -1 dBTP, WhatsApp copy ≤ 16 MB.
7. **Check + QC** — contact sheet of the render (run `ref_breakdown.py` on it and look), speech-to-text vs script,
   `python3 kit/qc_v5.py --video out.mp4 --spec shots.json --jsx build/reel.jsx` → PASS. Never send a failed render.

QC: F1 refs · F2 glow · F3/F4 gradient system + presets · F5 banned colour on screen · F6 Blender text · F7 sound source
logged · F8 loudness · F9 format · F10 safe area · F11 60 fps breakdown filled · F12 Pinterest pin per category · F13 ≥ 3 changes.
Links to every reference used so far: `kit/REFERENCE_LINKS.html`. Worked example: `kit/examples/ref8_breakdown/breakdown.md`.


Lessons from the face-lock v4 reel (Nov 3 2026, `recipes/08_face_lock_real_photos_chat_ui.md`):
- Real photo faces beat drawn ones: a Pinterest face-consistency reel gave the reference + "same face" results; pull stills
  from the ORIGINAL post the pin points to (`yt-dlp -S res:1920` on the Instagram link = 1080x1920; the pin HLS was 720p).
- Never a blank or blurry frame at a cut: the incoming shot's main element is ON screen at the cut (no 0-scale pop at T),
  pushes are position offsets with motion blur OFF on the pushed layers, outgoing slides 240-260 px up in 0.2 s.
- EffectCraft: a video plate needs `layer.startTime = shot start` (footage otherwise starts at comp 0 and shows the wrong
  part or vanishes); parenting a KEYFRAMED layer does not move it - push with an additive position expression instead.
- Captions on light paper: `ember` keywords wash out; `clay` reads. Keep one gradient preset for captions.
- No phone frame needed: crisp HTML chat cards (2x, headless Chrome, no logos) floating on the paper set; states swap on the
  voice's word times (typing, send, result), same position, so it reads as a live screen.
- Pinterest sfx: "SFX pack" demo pins carry clean isolated hits - find them with an energy envelope + spectrogram, then
  `--clip A-B --name whoosh|pop2|click|riser|impact|bass|typing|ding` so ec_reel's sfx names resolve to your pins.
- Paper-tear transition pins: most frames have a blue key area - scan for clean frames and tone them warm for a plate.

Lessons from building kit v5.3 (Nov 4 2026) — what the user said was missing after v5.2 "slimmed" the kit:
- Slim the CODE, never the RULES. v5.2 dropped the 27 prompts, recipes, ref notes, tick checklist and honesty rule to get small
  and the user had to ask for them back. Text is cheap (the whole restored set is < 0.6 MB); media is what is heavy and what must
  not ship. Keep `kit/RULES_COVERAGE.md` (every rule the user ever gave -> where it lives; 49 rows, 0 without a home) and re-check
  it before every release.
- A kit ships FILLED breakdowns for every reference, not one example: `kit/breakdowns/` (10, text + json). Each row says how it was
  viewed (`viewed` flag). Contact sheets are not shipped (130 MB) - regenerate with ref_breakdown.py.
- Pin lists ship as links, never files: `kit/pins/` = music / b-roll / subject / sfx-effects, each pin URL + title + TAKE/SKIP + a
  `reviewed` flag, with the meaning of "reviewed" written in INDEX.md. Every older pin must have a verdict too (214 unreviewed
  ones were reviewed from their covers).
- Pinterest is READ ONLY for us (search, open, read). No saves, boards, follows or comments.
- Portability = test from a CLEAN UNZIP, not from the working folder: every tool `--help` exits 0, `ec_reel.py --dry-run` +
  `qc_v5.py --spec ... --jsx ...` give PASS, `ref_breakdown.py check` on every shipped breakdown, `get_audio.sh` run for real,
  no machine paths in shipped scripts (box-only scripts say BOX-ONLY at the top and fail with a clear message elsewhere),
  requirements.txt lists only what the shipped scripts import. See `kit-packaging-and-handoff`.
- Do not write "all links live" unless you checked: v5.3 re-checked the 66 tutorial links (HTTP 200) and opened only a sample
  of pins; the sentence says exactly that.

Changelog: 5.3.0 (Nov 4 2026) restored prompts/recipes/notes/checklist/honesty rule; 10 filled 60 fps breakdowns; pins/ lists
(168) + 214 older pins reviewed; portability fixes (ec_reel --dry-run, --help everywhere, pinterest_refs box-only marker,
get_audio header, demo_shots paths); RULES_COVERAGE 49 rows. 5.2.0 (Nov 3 2026) face-lock v4 lessons + pin_download.py takes the pin's own original image. 5.1.0 (Nov 3 2026, kit v5.2) Step 0 = Pinterest for everything + 60 fps breakdown + make-it-ours; new
ref_breakdown.py, pin_download.py, QC F11-F13, F7 = source logged; banned hue 175-320°; skill made lean. 5.0.0 v5 rules.

Lessons from the face-lock v5 reel (Nov 4 2026, `recipes/09_ref8_motion_transitions_phone_typing_devanagari.md`, helpers `kit/templates/ec_transitions_v5/`):
- "Match the reference frame by frame" = a table of ref8 moment -> your moment with TIMING and MOTION numbers (push 0.5 s, spin 0.33 s out /
  0.35 s in, zoom-through 0.25 s, leak 0.65 s), measured from 30 fps bursts of both videos stacked in one image, plus a frame-difference
  profile (mean motion ref8 8.9 / v4 1.7 / v5 4.4) - and an honest "partial / no" column.
- Scenes as rigs: adopt the layers a scene created into a Null, overlap scenes by the transition, keep spin/zoom pads tiny. Hard cuts in v4
  were really "no overlap"; a transition is two scenes alive at once under a blur adjustment layer.
- Cyan is a frequent side effect (VR Chromatic Aberrations, RGB-split glitches). Use VR Digital Glitch slice tears + a red/amber tint instead.
- Extend the outgoing background when the next tone wipes in, or the wipe reveals black (found in the first render, spike of 160 in the
  frame-difference profile). Spikes > 100 in that profile outside a planned transition are bugs.
- Show the payoff: do not hide the "same face" result under the zoom-through; compress the typing so it sits on screen >= 0.4 s.
- Hindi captions in Devanagari work in EffectCraft with Hind + Tiro Devanagari Hindi (PostScript names), view every line as a crop.
- The kit's QC passes things a viewer still notices (flat white at a leak peak, empty frame 0): look at the contact sheet AND the transition bursts.

Changelog: 5.4.0 (Nov 4 2026) face-lock v5 lessons, recipe 09, ec_transitions_v5 helpers, ui_screen_v5 playwright port + typing_states.py.

Lessons from the word-behind-head reel (Nov 4 2026, `recipes/11_word_behind_head.md`, helpers `kit/word_behind_head/`):
- Cut-out on CPU: BiRefNet-general-lite through onnxruntime directly (fixed 1024x1024 input, ~4-6.5 s/frame, 1.5 GB steady; the rembg wrapper held 12 GB and a 2nd parallel worker was OOM-killed). One worker, even frames first.
- Big word = EffectCraft layers (gradient face + 12 extrusion copies + blurred glow copy); stack with the cut-out in numpy/OpenCV, not in the editor. Place words in screen space from the mask's crown row; check letter coverage >= 15 %.
- Unknown font names fall back silently in EffectCraft: compare `sourceRectAtTime` widths. Keep big words inside 90 % AFTER push and punch-in scales.
- Sujon (Nov 4 12:11 PM) lifted glow-off for this reel (warm only) and wants "human, not AI": imperfect pops, tiny rotations, wobble, dust, grain; qc F2 flags the glow on purpose.
- Verify the final mix has the voice once (F14 cross-correlation) and the contact sheet AND hair-edge crops before sending.

Changelog: 5.5.0 (Nov 4 2026) recipe 11 word-behind-head + kit/word_behind_head helpers.
