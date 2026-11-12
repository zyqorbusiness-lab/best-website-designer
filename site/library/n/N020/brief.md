# brief.md: N020 Chordline Music School (Concept)

## Pitch
- One sentence: a ukulele school whose four strings are the menu; pluck one to hear it and open that level.
- Matrix card: material spruce/mahogany wood + nylon string / motion pluck / story four levels low to high.
- Constraint cards: "One verb" (pluck), "Sound off" (works with no sound: the string and card still change).
- Category inversion: music-school sites show student photos and a timetable; here the instrument itself is the navigation and the timetable is named after strings.
- Distinct from the library: first concept driven by sound and an instrument; no other concept uses strings or synthesis.

## Real assets
| asset | author | licence | source | used as |
|---|---|---|---|---|
| Ukulele 01 | Joseph Burgan | CC0 1.0 | https://polyhaven.com/a/Ukulele_01 | hero, same GLB on phone and desktop |
| Studio Small 09 HDRI | Sergej Majboroda | CC0 1.0 | https://polyhaven.com/a/studio_small_09 | kit lighting |
Code-made: the SVG strings, chord diagrams and the synthesised pluck (no audio files). No code-made 3D geometry.

## Palette
--c1 #F3E6CF spruce cream, --c2 #2B2118 rosewood espresso, --c3 #2E9E5E string green (~1%: active string, CTA, dots). palette-check: PASS.

## Frames
- Phone: ukulele in the top half, four full-width 56 px string bars under the title (thumb zone), level card under them.
- Desktop: title left, ukulele right on a diagonal, strings across the bottom-left, level card bottom-right.
- Same model, HDRI and effects on both; only pixel ratio and layout differ.

## States
Idle slow turn (off with reduced motion); drag/swipe/arrow keys turn the ukulele; tap/click/Enter on a string plucks it; reduced motion: no string vibration or shiver, sound and card still change; no WebGL: poster.

## Three hand-made details
1. String drawing thickness follows the real gauge order (C thickest, A thinnest).
2. The chord diagrams strum exactly the frets they show, low to high, 45 ms apart.
3. The last plucked string stays green; its frequency label is the real pitch in Hz.

## Production shell
Nav: Strings, Levels, Chords, A lesson, Enrol. Form: name, email, level, room/online; answers "Concept: not sent". Footer: kit credits + Hire Zyqor Studio.
