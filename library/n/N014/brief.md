# brief.md: N014 Glint Eyewear (Concept)

## Pitch
- One sentence: real round spectacles hover in front of an eye chart; slide them and the lenses bend the letters behind.
- Matrix card: material glass + wire / motion slide along / story the eye test.
- Constraint cards: "Wrong category" (an optician's chart wall as the hero layout), "Data as decoration" (the chart and the dioptre control are the decoration).
- Category inversion: eyewear sites show faces wearing frames; here there is no face at all, only the lens doing its job.
- Distinct from the library: first concept built on real-time refraction (transmission) through a real scanned lens.

## Real assets
| asset | author | licence | source | used as |
|---|---|---|---|---|
| Round Spectacles | Sean Buckley | CC0 1.0 | https://polyhaven.com/a/round_spectacles | hero, same GLB on phone and desktop |
| Studio Small 09 HDRI | Sergej Majboroda | CC0 1.0 | https://polyhaven.com/a/studio_small_09 | kit lighting |
Code-made: the eye chart (canvas texture on a plane) and the SVG fit drawing.

## Palette
--c1 #E2EAEE mist, --c2 #3B2A1E tortoise brown (chart letters, text), --c3 #2F58DE cobalt (lens value, CTA). palette-check PASS.

## Frames
- Phone: chart and frames in the top half, swipe to slide, then title and the full-width lens control.
- Desktop: title and lens control left, the chart wall right with the frames in front.

## States
Drag/swipe/arrow keys slide with inertia; +/- change lens strength (plus bends one way, minus the other, plain = no bend); reduced motion: no idle float; no WebGL: poster.

## Three hand-made details
1. Snellen-style ladder with each row about 0.8x the one above.
2. The frames tip into the direction you slide them.
3. The readout says what the lens does in words, never a made-up number.

## Production shell
Nav: Frames, Lenses, Fit, Book a fitting. Form: name, email, lenses, prescription/eye test; "Concept: not sent".
