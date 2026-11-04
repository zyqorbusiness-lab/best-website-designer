---
name: reference-frame-breakdown
description: Break a reference video into 60 frames per second and write down, for every second, the effect, animation + easing, text, font, text colour, glow, background, subject, b-roll, transition, camera and sfx — before editing anything.
when_to_use: before any edit that follows a reference reel / Pinterest video; "analyse this reel frame by frame", "what effects are in this video"
license: MIT
version: 1.1.0
---

# Reference frame breakdown (60 fps)

Sujon, Nov 3 2026: "har ek 1 seconds ka 60 frames karega fir har ek frame dekhega kya effects kaise animation kab kya
kaisa text text colour glow background subject b roll".

```
python3 kit/ref_breakdown.py <instagram|pinterest|youtube link or file> -o refs_breakdown/<ref> [--title "..."]
python3 kit/ref_breakdown.py <file> -o refs_breakdown/<ref> --frames-at 5.0-5.6   # full-size frames of one moment
python3 kit/ref_breakdown.py md refs_breakdown/<ref>      # rewrite breakdown.md after filling the json
python3 kit/ref_breakdown.py check refs_breakdown/<ref>   # filled seconds, pins per category, make_it_ours count
```

Output: `sheets/sec_NNN.jpg` (60 thumbnails = 1 second, time + frame number on each; "=" = repeated frame of a 25/30 fps
source, not new information; red box = cut; yellow = flash), `motion_graph.png` (motion per frame, cuts, flashes,
animation start→end shaded, audio onsets, dominant colours per second), `breakdown.json` + `breakdown.md` (measured facts
filled: cuts, motion, easing guess, colours with a banned purple/blue/cyan flag, sfx hits; empty fields for your eyes).
Raw frames never touch the disk; it stops if less than 1.5 GB is free. Needs python3, numpy, pillow, ffmpeg (+ yt-dlp for links).

Do:
1. Open EVERY sheet. For every second fill effect, animation, easing, text, font, text_colour, glow (yes/no/how much),
   background, subject, broll, transition, camera, sfx, pin_ref. Fill the main events (cuts, transitions, pops).
2. Write `summary` (structure, rhythm, text system, colour, sound, b-roll tricks). Mark banned colours as SKIP.
3. Write `make_it_ours` (≥ 3 changes) and log Pinterest pins per category in `pinterest_sources` (pin_download.py does it).
4. List the folder in the project's shots.json `refs` and `breakdowns`; qc_v5.py F11-F13 check all of this.

Worked example (every second filled): `kit/examples/ref8_breakdown/` — ref8 is 30 fps, 1,968 frames sampled, 926 real,
7 cuts, 32 animation segments; scene changes are moves (push-down to a phone set 5.05 s, zoom into the phone 19.5 s,
spin-blur 23.7 s, light-leak burn 26.6 s).

## How much did you actually look? (v5.3, Nov 4 2026)
The tool measures every one of the 60 frames per second (motion, flashes, colours, audio hits); a person or model cannot
usefully view 60 sheets of 60 thumbnails per reel, and saying so is the honest part. What worked for 9 references in one pass:
1. Run the tool, then view a 2 fps contact sheet (one frame every 0.5 s, 30 frames per sheet) per reference and write the
   per-segment fields once (effect, animation, text, font, colour, glow, background, subject, b-roll, transition, camera, sfx).
2. Merge the segment text into every per-second row and every event row by script, so `ref_breakdown.py check` passes - and
   put a `viewed` flag on each row: "sampled every 0.5 s; 60 fps motion/colour/audio measured by the tool; frames between
   samples NOT individually viewed". Open any 0.5 s window at full size with `--frames-at A-B` when the detail matters.
3. The cut counter is thresholded and undercounts soft transitions (a reference of 12 blur-swaps read 0 cuts). Trust your eyes
   for transitions, the graph for timing.
4. A reference in a banned palette (cyan, blue neon, purple/violet) is still broken down - the motion is the lesson - but every
   take/skip says SKIP for the colour and the make_it_ours rows name the replacement palette.
5. A breakdown whose viewing density was not recorded (ref8 in v5.2) is shipped with that stated, never upgraded silently.
6. Ship breakdown.md + breakdown.json + motion_graph.png; do not ship the sheets (they are third-party frames and ~13 MB each).
