# brief.md: P017 Tapehead Hi-Fi (Concept)

## Pitch
- One sentence: a hi-fi shop built around one real cassette deck; press play and a VU meter reads the live sound, scroll and the tape flies out, turns over to side B and goes back in.
- Matrix card: material brushed metal + glass UI / motion eject and flip / story side A to side B.
- Constraint cards: "Sound off" (the page makes the sound it measures, and still reads without it), "Data as decoration" (the Inside numbers are read from the scan).
- Category inversion: audio shops show spec tables; this one lets you watch a meter read real audio.
- Distinct from the library: first premium concept with its own HDRI, a liquid-glass control deck and Web Audio analysis driving UI.

## Real assets
| asset | author | licence | source | used as |
|---|---|---|---|---|
| Cassette Player | Oday Abuzaeed | CC0 1.0 | https://polyhaven.com/a/cassette_player | hero; the tape part flies on scroll and Eject |
| Music Hall 01 HDRI | Sergej Majboroda | CC0 1.0 | https://polyhaven.com/a/music_hall_01 | only environment light |
Code-made: nothing in 3D. The chord loop and tape hiss are synthesised in the browser (no audio files).

## Palette
--c1 #F2EBDD cream, --c2 #3A1F1A oxblood (page), --c3 #E5C61A signal yellow (needle, red zone, rim light, pressed keys). palette-check PASS.

## Frames
- Phone: title top, deck model in the middle of a fixed scene, glass deck controls in the thumb zone; same tape flight on scroll.
- Desktop: copy top left, deck right of centre, glass controls bottom right; pointer lean.

## States
Play / Stop / Eject (aria-pressed), status line aria-live; reduced motion: no lean, no vibration, flight jumps to scroll; no WebGL: poster, the meter and sound still work; no Web Audio: the status line says so.

## Three hand-made details
1. VU needle driven by RMS of the actual signal with ~300 ms ballistics.
2. Inside numbers (deck size, cassette width, triangles) measured from the scan at load.
3. Deck leans toward the pointer and trembles faintly while playing.

## Production shell
Nav: The deck, Side B, Inside, Order. Form: name, email, finish, extras; "Concept: not sent".
