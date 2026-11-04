# Recipe 18 - extras: face-tracked bracket, word acts out its meaning, counters, crack/glitch (refs 10, 11, 2, 9, 12, 5)

- Face-tracked yellow bracket (ref 10 14.0-18.7 s, ref 11 1.3-1.7 s): per-frame face box (opencv/mediapipe, `analyze_ref.py` in legacy_v4 shows face detection), draw 4 corner brackets 6 px thick in #FFC21A, smooth the box (EMA 0.35), text block grows beside it. Python+ffmpeg overlay; ~25 lines.
- Word acts out its meaning (ref 10 11.3-12.1 s): the word 'ZOOM' flies in at 250 % with blur trail, the clip itself zooms 1.0 -> 1.4 -> 1.0 with radial blur 2-3 frames; 'SAVE' -> bookmark click (recipe 12); 'loss' -> grade flips warm lilac->red in ref 6 (use warm -> deep red only).
- Counters: ref 9 57-58 s views counter with an eye icon 10K -> 296K in ~1 s; ref 5 year ruler 2020 -> 2026 scrolling; python draws digits per frame, ease-out over 18 frames. Never show numbers that are not real claims about Zyqor (honesty rule).
- Crack / glitch accent (ref 2 27.33-27.77 s, 0.43 s): 2 frames blur-out, cracked-glass overlay with RGB fringe (3-6 px) and white scribble text for 8 frames, 1-2 frames black with horizontal stripes, hard cut. Use WARM channel offsets (R/G only) to stay inside the colour ban.
- Neon scribble / hand-drawn underline (refs 5, 8, 12): SVG path trimmed 0 -> 100 % over 12 frames in warm orange/red.
## Status
Recipe only; none of these were rendered in v5.5.
