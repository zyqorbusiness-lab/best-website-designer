# STYLE — "soft 3d explainer animation" (Pinterest, signed in, 2026-11-03, v4 research)

16 video pins (pins.json). 8 of 16 come from the **MotionDesigners.Pro** curation board; the rest are studios (Anico, ARKI, WizArt, EarnEdits, Lazoh).
Measured on 4 downloaded clips with `analyze_ref.py` (numbers in measure/NN/style.json; cuts = ffmpeg scene>0.3, onsets = spectral flux). Mp4s deleted after measuring; frames_sheet.jpg + sheet.jpg kept.
Maps to **ref 1** (@d2epak_ soft-3D faceless explainer) — our `blender/` soft-3D floating world + EffectCraft captions.

## Shared look
- **One continuous world, almost no hard cuts**: 0–1 cuts in 30 s (01: 1 cut in 30.2 s; 02: 0 in 11 s; 03: 1 in 8 s; 04: 0 in 4 s). Scene changes happen *inside* the shot (objects fly in/out, camera glides), exactly like ref 1.
- **Pastel UI-in-3D** (01, Zsombor Nagy "3D Mograph"): floating rounded panels + 3D icons on a lilac→sky gradient. Palette #926bdf violet, #87abee sky, #2c40a6 deep blue accent, #efe2df blush-white, #f2aea0 peach. Brightness 0.64, saturation 0.51.
- **Neutral studio grey** (02 AirPods, Jungmi Kim): #c2c2c4 / #cacacb / #d2d2d4 with shadow #878889, saturation 0.01 — the "Apple" monochrome cyc, product is the only form.
- **Warm clay beige** (03 tubes, @piri3d; 12 IOPE cream): #ccbdb2, #a69e96, #e3d1c8 with deep #3b3835 — matte clay, soft contact shadows.
- **Flat-ish 2.5D balance toy** (04, Anico "balancing tower"): dark plum #1b052e bg with lilac #d5a1df shapes — calm, looping sway.
- Every pin: rounded everything (bevel radius ≈ 8–15 % of object size), no hard edges, no texture noise, soft area light from top-left, AO under objects.

## Motion + timing (measured)
- Motion energy is *low and constant*: mean 6–8 on the soft clips (02, 03, 04) vs 18 on the UI one (01); still_frac 0–15 % → the camera never fully stops, it drifts.
- Onsets 1.1–2.1 /s (beat 0.96–1.5 s): the sound bed is calmer than a talking-head reel; pops land on object appearances, not on every half-second.
- Loudness −14.9…−15.5 LUFS (one clip silent) → master at −14 LUFS like the kit default.
- Objects enter with **scale 0→110→100 % in ~8–10 frames** (overshoot) and then *float* (sine bob ±2–4 % of height, period 2–3 s, phase-offset per object).

## Do this (rules)
1. Build one off-white or pastel world and never cut: change "scenes" by gliding the camera 20–40 % of frame width with ease-in-out cubic over 0.8–1.2 s while new objects pop in. — 01 https://www.pinterest.com/pin/492649952344602/ , 03 https://www.pinterest.com/pin/127578601937749602/
2. 1 backdrop + 1–2 pastel hues + white; for ref 1 use off-white #f4f1ec with one accent (#2c40a6 blue for keywords, #f2aea0 coral for emphasis). — 01, 12 https://www.pinterest.com/pin/3025924743419579/
3. Pop-in = scale 0→110→100 % over 9 frames at 30 fps (ease-out back) + a light "pop" sfx on frame 1; float afterwards (sine ±3 %, 2.5 s period). — 01, 07 https://www.pinterest.com/pin/653584964689103750/
4. Materials: matte clay (Principled roughness 0.55–0.7, specular 0.3) for characters/shapes, soft glossy plastic (roughness 0.2) for app icons/phones. — 03, 02 https://www.pinterest.com/pin/3940718419920753/
5. Depth: f/1.8–2.8 Cycles DOF focused on the hero; background objects 2–3× farther so they blur into soft blobs (this is ref 1's "depth blur"). — 01, 07
6. Calm loop objects (balancing/swaying) are a good B-roll beat between caption lines: rotate ±6° with ease-in-out sine, 2 s period. — 04 https://www.pinterest.com/pin/937452478676022034/
7. Sound: soft bed + pops/whooshes on appearances, ~1–2 onsets per second, not every 0.5 s. — measured 01–04

## Kit mapping
- Blender: `blender/softworld.py` (soft-3D floating world: clay + glossy materials, DOF camera) and `templates/explainer_soft3d_v4/sprites_v4.py` (3D sprites + mascot); builder `templates/explainer_soft3d_v4/build_ref1.py`. Render 1080x1920, low samples + denoise.
- EffectCraft: word-by-word captions with coloured keywords, count-up numbers, typed "Comment X" box over the 3D plate.
- Audio: `sfx_mix.py` pops on each object pop-in frame, whoosh on camera glides; `master_mix.sh` to −14 LUFS.
