# Recipe 14 - torn-paper reveal / page transition (refs 1, 4, 9)

Seen: ref 4 5.67-6.67 s - red page, letters "ten / grand" wiggle in per letter (blur-in, bright white flash 5.90-6.00), a white torn edge draws across (about 7 frames) and reveals a $100 bill roll underneath, soft shadow under the paper edge. Ref 1 4.67 s and 21.67-22.67 s - white diagonal strips / red torn page. Ref 9 18.2-19.0 s - a cream page flips like a hinged card (3D, ~0.8 s) with the next shot on its back. [eyeballed from native-fps frames]

## Build
`python3 tools/fx_torn_reveal.py shotA.mp4 shotB.mp4 out.mp4 --dur 0.5 --direction up --seed 7` (A = what gets torn away, B = what is revealed; images or video; writes ONLY the transition clip, splice it with ffmpeg concat). Tear line = low-frequency wobble + per-frame jitter, white fibre strip 8-18 px, soft shadow on A, A lifts 4 %. Different --seed = different tear (never reuse the same tear twice).
Tested: 540x960, 15 frames, A=test pattern, B=red card; edge looks rough, not a straight wipe. Not tested at 1080x1920 on real footage (cost: ~1 s of numpy per frame).
Page-fold variant (ref 9): EffectCraft 3D layer rotating around Y 0 -> 180 deg over 0.8 s with the two shots as front/back faces (not built).

## Pair with
flash 1-3 frames at the tear start (fx_cut_fx.py flash) + whoosh_soft 120 ms early + low impact on the reveal.
## Gotchas
Torn edge must be cream/off-white (#FFF8EC), never pure white on a white page; keep it 0.3-0.6 s.
