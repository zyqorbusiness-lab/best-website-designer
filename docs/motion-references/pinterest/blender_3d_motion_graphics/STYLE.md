# STYLE — "blender 3d motion graphics" (Pinterest, signed in, 2026-11-03)

16 video pins (pins.json). 9 of 16 come from the **motiondesigners.pro** curation boards ("Motion inspiration – …").
Measured on 9 downloaded clips (cuts = ffmpeg scene>0.3; camera = ORB affine between frames @10 fps on 360 px; colours = PIL median-cut of a frame at 3 s; audio = spectral-flux onsets). Numbers in measure.json.

## Shared look
- **Hero product alone on a seamless, single-colour cyclorama** (no horizon line, no props). Backdrop is a light/mid neutral or one pastel:
  AirPods #c4c3c6/#d0cfd2 (02), keyboard lilac #a29ab5 + #d3c8c6 (09), coffee beige #aaa095/#c1b8b0 (10), gummies cream #f0d5ce (14), green-on-white #266022/#c8cdcc (08), dark grey #7c7d80/#282728 (04).
- Palette per shot = **1 backdrop tone + 1 product hue + white highlights**. Never more than ~3 hues on screen.
- Materials: soft glossy plastic (AirPods 02, keyboard keycaps 09), translucent jelly/gummy with subsurface (14, 15), matte clay/foam spheres (11), brushed/clean metal (12 suitcase). Reflections are soft studio-box reflections, not HDRI landscapes.
- Lighting: big soft area key from top-front-left, gentle rim, contact shadows / AO under the object; shadows are soft (large light size), floor and wall the same colour.
- Grade: low contrast, lifted blacks (darkest product colour ~#282728, not #000) except the dark-studio pins (12, 11 with #000 bg).

## Camera + timing (measured)
- **Pull-back + roll, then settle** (02 AirPods): scale 100→71 % over 1.5 s while rolling +15° then swinging to −43° by 2.6 s, then holds 0.9 s, then next move. 11 s, **0 cuts** — one continuous camera.
- **Fast push-in at open** (14 Particles): scale 100→~250 % over 2.4 s (velocity ~30 %/s first 0.4 s, ~130 %/s peak at 0.8–1.0 s, ~60 %/s after) = ease-in-out, then three cuts at 2.16 / 3.40 / 4.76 s (shots 1.2–1.4 s), then a locked hold.
- **Locked-off camera, object does the work** (09 Keyboard, 08 Joe): camera drift ≤1 %/s and ≤0.5°/s for 20 s; keys press/objects assemble.
- **Product-film cutting** (04 Fluid): 11 cuts / 30 s; first 13 s one slow shot, then shots of 1.4–3.0 s (median ~1.9 s). Each new shot carries an orbit of 7–14°/s and ±5–20 %/s zoom.
- Audio onsets 2.4–2.9 per second on the music-driven pins (01, 02, 04, 14); median onset gap 0.25–0.33 s (≈ 1/8 notes at 90–120 BPM). Cuts land on an onset: measured onset−cut offsets −0.17…+0.11 s (04), i.e. **cut on the beat ±3 frames**.

## Do this (rules)
1. One hero object on a seamless colour cyc, floor=wall colour, 1 backdrop + 1 product hue + white. — 02 https://www.pinterest.com/pin/3940718419920753/ , 09 https://www.pinterest.com/pin/127578601939340367/ , 10 https://www.pinterest.com/pin/3025924744030594/
2. Open with motion inside the first 0.3 s: either a push-in 100→160 % in 1.0 s (ease-in-out cubic) or a pull-back 100→70 % in 1.5 s with a 15–40° roll that overshoots and settles (ease-out back). — 14 https://www.pinterest.com/pin/127578601938401996/ , 02
3. Hold after every move: 0.5–1.0 s of near-stillness (≤1 %/s) before the next move or cut; the stillness is what makes it read "premium". — 02, 14
4. Cut only on music onsets (±3 frames) and only once the shot is ~1.2–2 s old; for a 15 s promo that is 6–9 shots. — 04 https://www.pinterest.com/pin/127578601938525446/
5. Let the object animate when the camera is locked: keys press, parts assemble, caps pop (≈ 0.25–0.33 s per action, matching onset spacing). — 09, 06 https://www.pinterest.com/pin/127578601938739672/ , 16 https://www.pinterest.com/pin/5207355813965039/
6. Materials: glossy plastic (rough 0.15–0.25), jelly/SSS for candy-like objects, matte clay for abstract spheres; no texture noise. — 02, 14, 11 https://www.pinterest.com/pin/984177324840512259/
7. Soft studio light: 1 large area key (size ≥2 m), 1 rim from behind, AO/contact shadow; no hard shadows. — 08 https://www.pinterest.com/pin/127578601938165446/ , 03 https://www.pinterest.com/pin/127578601937749602/
8. Low-contrast grade, blacks lifted to ~#282728 unless the scene is a deliberate black studio (12 https://www.pinterest.com/pin/127578601938644350/).
