> In this repo the kit folder is `skills/reference-to-video/kit/` (the zip calls it `tools/`). Run commands from `skills/reference-to-video/`.

# AGENT_START_HERE — Zyqor Motion Kit v5.2

Read this whole file before you touch anything. Do the steps in order. Each step has a GATE:
do not start the next step until the gate is true. The copy-paste version for any agent is MASTER_PROMPT.txt.

Setup (once): python3 + `pip install -r kit/requirements.txt` + ffmpeg/ffprobe on PATH + `pip install yt-dlp`
+ EffectCraft CLI (`EFFECTCRAFT_CLI` env var, see kit/ec_reel.py). Work in `projects/<topic>/`.

## Step 1 — Pinterest first, for EVERYTHING
- Find references for the topic AND, separately, one or more pins for each category:
  **music · sfx · broll · subject · effect · background**.
  Search ideas: music "lofi beat reel", "cinematic background music"; sfx "whoosh sound effect", "ui click sound",
  "riser transition sound"; broll "<topic> b roll", "laptop desk aesthetic video"; subject "phone mockup hand video",
  "talking head framed reel"; effect "light leak overlay", "film grain overlay", "paper tear transition";
  background "paper texture background", "beige gradient background video".
- Download what you use (best quality first; files land in your project, pin link logged):
  `python3 kit/pin_download.py <pin_url> --cat sfx --name whoosh --clip 3.2-4.1 --project projects/<topic> --breakdown refs_breakdown/<ref>/breakdown.json`
  `--original` also pulls the post the pin points to when it is sharper. Pins are often reposts; the original link is in the log.
- On Tab's box, Pinterest search + sheets: `cd tools && node pinterest_refs.mjs "<topic>" 16 --scope=videos` (read only).
- Old boards and every link we used: REFERENCE_LINKS.html (TAKE/SKIP per row).
- **GATE 1:** `projects/<topic>/assets/pinterest/assets_log.json` has >= 1 pin for each of the 6 categories.

## Step 2 — 60 fps breakdown of each reference
- `python3 kit/ref_breakdown.py <link or file> -o refs_breakdown/<ref>`
  (every second -> 60 frames -> `sheets/sec_NNN.jpg`, `motion_graph.png`, `breakdown.json`, `breakdown.md`.
  30/25 fps sources: repeated frames are marked "=" and are not new information. Red box = cut, yellow = flash.)
- Open EVERY sheet. For EVERY second fill: effect, animation, easing, text, font, text_colour, glow (yes/no/how much),
  background, subject, broll, transition, camera, sfx, pin_ref. Fill the main events too. Write `summary`.
- Anything the tool flags as banned colour (purple/blue/cyan) = learn the motion, SKIP the colour.
- `python3 kit/ref_breakdown.py md refs_breakdown/<ref>` rewrites breakdown.md.
- **GATE 2:** `python3 kit/ref_breakdown.py check refs_breakdown/<ref>` -> filled_seconds == seconds.

## Step 3 — Make it ours (never copy 1:1)
- Keep structure + timing. Change at least 3 visible things and write them in `breakdown.json -> make_it_ours`:
  palette preset · transition idea · text treatment / layout · b-roll angle · set · sound.
- **GATE 3:** make_it_ours has >= 3 entries. (Example: kit/examples/ref8_breakdown/breakdown.md.)

## Step 4 — Edit (ref8 standard) with `kit/ec_reel.py shots.json`
Start from `kit/templates/ec_kinetic_v5/demo_shots.json`. App/chat screens: `kit/templates/ui_screen_v5/` (crisp UI built in code, no brand logos).
- **Text + effects in EffectCraft (zq_lib.jsx). NEVER Blender for text/effects.** Blender only for a real 3D object, as a plate.
- Captions (ref8 kinetic): 1-3 words on screen (max 4 per line, line < 0.78 of frame width), >= 90 px, timed to the
  voice (word pop: rise 34 px, scale 86->104->100, blur 16->0 in 0.18 s). Base ink #141414 on light / off-white #FAF7F2
  + soft warm shadow on footage. ONE gradient keyword ("s":"g", preset from zq_config.json) + ONE italic serif accent ("s":"i").
  One highlight style per video. Fonts: Inter + Instrument Serif Italic only.
- Titles: per-letter cascade 45 ms, heavy caps + small light line under (~4:1).
- **Glow OFF.** Max one subtle glow on one object per scene (threshold 90+, radius 20-30, intensity 0.3). Never on captions, cards, backgrounds, adjustment layers.
- Background: paper / studio sweep / photo or Pinterest plate, pushing 4-5 % per shot. Never flat black or an "AI" gradient.
- Grade: temp +6, contrast +14, saturation 94, faded 4, vignette 8, grain 0.28.
- Pacing: something moves before 0.5 s, first word by 0.3 s, a change every 0.4-0.8 s, nothing still > ~1 s, no blank frames.
  Layout: subject at 40-60 % of height, captions in the lower third (y 1380-1690) or behind the subject.
- Motion: soft-settle ease + motion blur; overshoot only on pops (4-7 %); cards float (7 px sine); cursor taps.
- Transitions: moves, not just cuts — push, zoom through a screen, warm spin-blur, light-leak burn, glitch with WARM offsets.
  One transition per idea change; mix them.
- Sound: Pinterest sfx first (`ZQ_SFX_DIR=projects/<topic>/assets/pinterest/sfx`): pop per card, click per tap, whoosh
  (starts 3-5 frames early) + low hit per transition, glitch burst, riser into the payoff. 1-3 per second, max 2 layered.
  Voice on top, music ducked ~10 dB.
- Look at stills first: `python3 kit/ec_reel.py shots.json --frames-only 1,3,5`, then the full render.

## Step 5 — Colour ban (everywhere: reels, cards, sites, thumbnails)
NO purple, violet, purple-blue neon gradients, blue neon, cyan glow, glow-on-black, stock "AI" palettes.
QC blocks hue 175-320 deg at saturation >= 45 % and brightness >= 35 % (zq_config.json "banned").

## Step 6 — Export
1080x1920, 30 fps, H.264 CRF 19 (max 9 Mb/s), AAC 192k, +faststart. Captions inside the 90 % title-safe area.
-14 LUFS integrated, true peak <= -1 dBTP. WhatsApp copy <= 16 MB.

## Step 7 — Check, then QC
- Contact sheet of your render (`python3 kit/ref_breakdown.py out.mp4 -o build/self_check`) and LOOK at every second:
  AI colour? glow? blank/dead frame? text outside safe area? cheap figure? Fix and re-render.
- Speech-to-text of the render matches the script (`kit/transcribe_words.py`); sfx audible under the voice.
- `python3 kit/qc_v5.py --video out.mp4 --spec projects/<topic>/shots.json --jsx projects/<topic>/build/reel.jsx`
  shots.json must have `"refs"` and `"breakdowns"` (the refs_breakdown folders) and `make_it_ours` (here or in breakdown.json).
- **GATE 7:** QC PASS (F1-F13). A failed render is never sent.

## QC codes
F1 Pinterest refs/breakdown listed · F2 glow · F3 one gradient-keyword system · F4 preset + not banned · F5 banned colour
on screen (> 6 % of a frame) · F6 Blender text/effects · F7 sound source (pin) logged · F8 loudness · F9 1080x1920 30 fps ·
F10 safe area + size · F11 60 fps breakdown filled · F12 Pinterest pin per category · F13 >= 3 make-it-ours changes.

## Output to report
out.mp4 (+ _wa.mp4), its contact sheet, refs_breakdown/<ref>/, assets_log.json, make_it_ours, build/qc_report.json,
loudness + file size, and anything you could not do — said plainly.

## Map
- `Zyqor_Motion_Kit_v5.2.pdf` the guide (page 1 cheat sheet, page 2 master prompt)
- `MASTER_PROMPT.txt` copy-paste prompt · `RULES_COVERAGE.md` every rule -> where it lives
- `REFERENCE_LINKS.html/.csv/.txt` every reference link, grouped, TAKE/SKIP
- `kit/` ref_breakdown.py · pin_download.py · pinterest_refs.mjs (+pinterest_sheet.py) · ec_reel.py · zq_config.json ·
  qc_v5.py · sfx_mix.py · master_mix.sh · transcribe_words.py · clean_voice.sh · cut_pauses.py · get_audio.sh (fallback sfx) ·
  templates/ec_kinetic_v5 (zq_lib.jsx) · templates/ui_screen_v5
- `kit/examples/` ref8 (33 sheets, every second filled) + 2 Pinterest refs
- `fonts/` OFL fonts
