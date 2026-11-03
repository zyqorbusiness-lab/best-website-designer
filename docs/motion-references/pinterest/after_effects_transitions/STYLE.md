# STYLE — "after effects transitions" (Pinterest, signed in, 2026-11-03)

16 video pins. Mix of: tutorials (themotionpulse whip 09, flicker 14; Aress_ae echo text 02), project-file/promo edits (EarnEdits 01/03/06/08, toromotion_ 04), transition packs (shape 05, paint brush 13, backward slideshow 12), curated motion (motiondesigners2d 11/16).
Measured on 9 clips @30 fps: cuts (scene>0.3), blur runs (frames whose Laplacian sharpness < 35 % of the clip median = motion-blurred transition frames), luminance flashes (frame-to-frame mean luma jump > 35/255), onsets. measure.json has everything.

## What the numbers say
- Transition **blur runs are short**: whip/blur transitions measure 2–4 frames (09 whip tutorial: 2 and 3 frames; 14 flicker: 4/3/2/2 frames; 16: 4–9 frames). Long blur runs (15–60 frames) are deliberate defocus/zoom-blur passages (01, 04, 05).
- **Flash frames** sit exactly on cuts: 02 echo-text uses a 4-frame (0.13 s) full-white/black flash every 1.00 s (0.96→1.08, 2.00→2.12, 3.00→3.12); 14 flicker uses 1–2 frame luma spikes clustered around cuts (17.73/17.77/17.80).
- Edit density: EarnEdits 03 = 21 cuts / 30 s (avg 1.4 s; shortest 0.1–0.2 s micro-cuts at 5.67→5.77, 15.07→15.27→15.47); 01 = 10 cuts / 30 s; 14 = 11 cuts / 20 s.
- Audio onsets 2.7–3.9 /s (median gap 0.21–0.28 s). Cuts sit on an onset: offsets mostly −0.10…+0.16 s, i.e. **the sound hit lands 0–5 frames after the cut** (01: +0.13…+0.19 s typical; 16: −0.06…−0.14 s = whoosh lead before the cut).
- Colours: dark cinematic teal-black for promo edits (#0c151a, #001013, 01); white/neutral UI (04 #fbfbfb); acid lime for text promos (02 #cdfe74/#e6f69c); pure black + white type for flicker/whip tutorials (09, 14).

## Do this (rules)
1. Whip pan = 2–4 frames of directional blur (12–20 % frame-width offset per frame) on each side of a cut, no more. — 09 https://www.pinterest.com/pin/877005727506486694/
2. Flash-on-beat: a 2–4 frame white (or black) flash exactly on the cut, 1 per beat at 60 BPM for text promos. — 02 https://www.pinterest.com/pin/931471135423209073/
3. Flicker: 1–2 frame luma spikes (+40…+90/255) in clusters of 2–3 frames around a cut, black-and-white type. — 14 https://www.pinterest.com/pin/877005727502986001/
4. Shape/liquid wipe: an organic shape (circle/blob/brush stroke) grows to full frame in ~12–20 frames, ease-in-out, revealing the next shot inside it. — 05 https://www.pinterest.com/pin/756604806201382827/ , 13 https://www.pinterest.com/pin/1055953443851629771/
5. Micro-cut bursts: 3–4 cuts 3–6 frames apart to punctuate a beat drop, then back to 1–2 s shots. — 03 https://www.pinterest.com/pin/1086986060089969292/
6. Zoom-blur passage for a scene change on a premium promo: 0.5–2 s of radial blur + scale 100→130 % into the next scene. — 01 https://www.pinterest.com/pin/1086986060079822211/ , 04 https://www.pinterest.com/pin/1032168808367375931/
7. Cut within ±3 frames of the music onset; put the whoosh 2–4 frames BEFORE the cut and the hit 0–5 frames after. — 01, 16 https://www.pinterest.com/pin/933230354045109691/
8. Keep transitions as punctuation: in a 30 s edit 6–11 transitions, the rest plain cuts or continuous camera. — 01, 04, 14
