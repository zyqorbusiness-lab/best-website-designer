# Recipe 16 - heavy extruded warm text with glow (refs 1, 2, 4, 7, 9, 10, 11, 12) - 'beast edit' type

Seen in 8 of 12 refs: a HEAVY display word (red #C4161C-ish, gold #E6B800-ish or yellow #FFD21F-ish) with a visible side extrusion, a glossy top highlight, and a soft warm bloom; arrives per letter with blur and overshoot (ref 1 29.8-29.97 s 'UP': one letter per ~0.1 s; ref 10 11.47-11.8 s 'ZOOM' flies in huge then settles). Small white connector words (sans / tiny serif / script) sit around it. Glow is warm orange/red/yellow only: the cyan/magenta glows in refs 6 and 8 are SKIPPED.

## Fast path (code, tested)
`python3 tools/fx_extrude_text.py "KAHANI" out.png --preset red --jitter 3 --rotate -2 --size 220 --font fonts/ArchivoBlack-400.woff2`
presets red/gold/yellow/orange/cream; `--depth 18 --angle 40 --glow 0.55 --grain 0.03`; `--per-letter` writes one PNG per letter + `layout.json` (x, dy, rotate, stagger_frames) for the pop-in; `--jitter SEED` = hand-made imperfection (rough edge, +-1.5 deg per letter, +-3 % size, 1-2 px offsets). Purple/blue/cyan colours are refused.
## EffectCraft path (already in the kit)
`tools/word_behind_head/bigword_lib.jsx` `bigWord()`: gradient face (Gradient Ramp), 12 extrusion copies, blurred glow copy, pop 80 -> 103 -> 100 % with a rotation kick, depth blur; fonts: Archivo SemiBold/Anton. Behind the head: recipe 11.
## Parameters to copy
letter stagger 3 frames; pop 80 -> 92 -> 100 -> 103..108 -> 100 over 7 frames; blur 14 -> 0 over 0.17 s; rotation kick 2.6-4 deg that settles with a wobble; glow radius ~9 % of letter height, opacity 0.35-0.6; extrusion 10-16 px at 220 px type.
## Gotchas
Stacked 2.5D extrusion, NOT a real 3D bevel (say so). Keep glow off the captions; one accent colour family per reel.
