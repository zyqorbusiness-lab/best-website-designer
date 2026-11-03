# STYLE — "kinetic typography reels" (Pinterest, signed in, 2026-11-03, v4 research)

16 video pins (pins.json): KITEREO, MotionDesigners.Pro ("2025", @lucas.edithh), EarnEdits (AE project), Roku Studio, lvlaaa, NEST COLLECTIVE, Alison Dyer, stacilicious.design, Jatin.in.motion, fogonglass, Zsófi Munkácsi (KINETISM templates), Marjeta Lloshi, Sarah Trummer, Artsiom Dashkevich, Paula Baines, Symbol (hand-drawn, flash warning).
Measured on 4 clips with `analyze_ref.py` (measure/NN/style.json). Mp4s deleted after measuring.
Maps to the caption/kinetic-word layers of **ref 1** (word-by-word, coloured keywords), **ref 3** (stacked kinetic words) and the 3D type of **ref 2**.

## Four reusable recipes seen
- **Type as a window (01 KITEREO)**: huge lowercase heavy sans words ("to end / oh no") on black, the *video plays inside the letters* (track matte), then the word expands to full-frame footage. Warm film grade (#b48c6a, #dab092). 2 cuts in 20.8 s — the matte reveal *is* the transition.
- **Talking head + collage inserts (02 MotionDesigners "2025")**: speaker shots with small white sans captions mid-frame ("tell you why", "and gives"), intercut every 1.5–3 s with cream #cabcad paper collage cards (chat bubbles in a black circle, red hand-drawn lines, condensed italic blue "ONE MORE"). 11 cuts / 30 s (~2.7 s average, bursts down to 0.1 s), 4 flashes.
- **3D-object metaphors + serif type (03 EarnEdits)**: glowing puzzle pieces, a retro OS progress window ("…doesn't happen overnight"), desk flat-lay ("WATCHING FEELS PRODUCTIVE" in orange serif), sparkle stars, field + old computer. Motion 26 (very high), 5 flashes, cuts at 3.0/5.0/15.8 s; type in tall condensed serif caps, cream on green #73805a.
- **Swiss red/white agency type (04 Roku Studio)**: red #bb0000 and white #f3f3f3 alternating full-screen, black bold sans + italic serif mix ("good taste", "An Agency Based in Jakarta"), words slide in on a grid with red construction lines and dots; paper plane + hand (Creation of Adam) cut-outs. 6 cuts / 16 s with doubled cuts (4.7/4.8, 7.3/7.3) = flash-cut accents. Mastered quiet (−23 LUFS) — bring to −14.

## Timing (measured)
- Cuts 2–11 per 30 s; the energetic pieces (02–04) cut every ~2–2.7 s with 0.1 s "double cut" accents; onsets 1.2–1.9 /s (beat 1.0–1.5 s).
- Each word/line lives 0.3–0.8 s; new word lands on an audio onset; emphasis words are 1.5–2.5× bigger and switch typeface (sans → italic serif).

## Do this (rules)
1. Mix two typefaces: heavy grotesk for the line, italic serif for the 1 emphasis word, 1.5–2.5× larger. — 04 https://www.pinterest.com/pin/1137721924626055700/ , 02 https://www.pinterest.com/pin/933230354045109691/
2. One colour system per piece: red/white/black (04), cream/blue/red (02), cream on green (03). Never more than 3 colours + footage. — 02–04
3. Word-in-word reveal: put the next shot inside the letters (track matte), then scale the word 100→800 % in 0.5 s (ease-in expo) so the footage fills the frame. — 01 https://www.pinterest.com/pin/671458625736063835/
4. Every 2–3 s change the "page" (colour flip red↔white, collage card, or 3D object scene); add a 2-frame double cut on strong beats. — 02, 04
5. Words land on onsets (±2 frames); each word slides 40–80 px with ease-out cubic over 6–8 frames, or pops 0→105→100 %. — 03 https://www.pinterest.com/pin/1086986060090383822/, 04
6. Cut-out props (paper plane, hand, puzzle) as moving decorations between words. — 03, 04

## Kit mapping
- EffectCraft text layers + track matte for the word-window reveal; word timings from `transcribe_words.py`; colour flips as solid layers on beat markers.
- Blender: `blender/text3d.py` for 3D/extruded words (ref 2), `blender/mk3d.py` for prop objects.
- Sound: `sfx_mix.py` — pop or tick per word, whoosh on page flips, hit on double cuts; `master_mix.sh` −14 LUFS.
