# Recipe 17 - sunburst, whip blur, B/W + white flash cuts, punch-ins (refs 1, 2, 4, 6, 7, 10, 11)

Punctuation measured/seen: hard cut + 1-3 frame white flash (ref 1 29.43 s single white frame; ref 1 has 17 flash events in 39 s), B/W desaturated shot for 0.3-1 s (refs 1, 2, 4, 9), whip blur 4-6 frames (refs 1, 2, 7, 8, 12), punch-in cut to a 1.15-1.7x crop (ref 6 17.43 s, ref 7, ref 10), cream radial sunburst rays behind the head (ref 1 35.33 s), warm light-leak wash (ref 11 2.13 s, ref 5 12.82 s).

## Build (all tested on a synthetic clip)
`python3 tools/fx_cut_fx.py in.mp4 out.mp4 flash --at 2.0 --color '#FFE9C9' [--jitter 3]`  (2 frames 95 % then 1 frame 45 %)
`... bw    --at 3.0 --len 0.4`   (desaturate + contrast 1.25)
`... punch --at 3.2 --len 0.8 --amount 0.15`   (scale 1 -> 1.15 in 0.25 s then hold, crop to frame)
`... whip  --at 5.0 --len 0.17`  (horizontal box blur 70 px + slight lift)
`... leak  --at 7.0`  (warm radial leak, screen blend, in 20 % / out 65 % of 0.28 s)
Chain by feeding one output into the next. Sunburst = kit `background()` ray layer in zq_lib.jsx / `word_behind_head/composite.py` (rays fade in with each word).
## Rhythm
Cut every 1.2-2.3 s in fast refs (median of all 12: 2.3 s, 24.7 cuts/min); flash only on the strongest cuts (about one in three), not every cut.
## Gotchas
fx_cut_fx.py re-encodes (crf 18); do all effects in one pass in EffectCraft if you render a long reel. No cyan/magenta RGB split - warm offsets only.
