---
name: reference-to-video
description: (v5.2) Make a premium vertical reel from any reference or topic with the Zyqor Motion Kit — Pinterest first for everything (refs + actual files), 60 fps frame breakdown of the reference, make it ours (3+ changes), EffectCraft text/effects (never Blender text), ref8 kinetic captions, glow off, no AI colours, QC gate F1-F13.
when_to_use: "make a video like this reel", "copy this style", "edit my reel", "use this reference", any short vertical video
license: MIT (text + code). References stay links; downloaded pin media stays in the user's project, never in this repo.
version: 5.2.0
---

# Reference → video (Zyqor Motion Kit v5.2)

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

Changelog: 5.2.0 (Nov 3 2026) face-lock v4 lessons + pin_download.py takes the pin's own original image. 5.1.0 (Nov 3 2026, kit v5.2) Step 0 = Pinterest for everything + 60 fps breakdown + make-it-ours; new
ref_breakdown.py, pin_download.py, QC F11-F13, F7 = source logged; banned hue 175-320°; skill made lean. 5.0.0 v5 rules.
