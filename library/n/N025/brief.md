# brief.md: N025 Bathtime Duck (Concept)

## Pitch
- One sentence: a calm field guide to exactly one rubber duck; tap the water and it bobs away from your ripple.
- Matrix card: material rubber + water / motion float, drift / story a field guide.
- Constraint cards: "Data as decoration" (the readout is the simulation's real state), "Thumb only" (one tap does everything).
- Category inversion: bath-toy sites are loud cartoons; this one is a quiet natural-history plate (Latin name, plate number, field notes).
- Distinct from the library: first concept with a live water simulation and tap-origin ripples.

## Real assets
| asset | author | licence | source | used as |
|---|---|---|---|---|
| Rubber Duck Toy | Plat251 | CC0 1.0 | https://polyhaven.com/a/rubber_duck_toy | hero, same GLB on phone and desktop |
| Studio Small 09 HDRI | Sergej Majboroda | CC0 1.0 | https://polyhaven.com/a/studio_small_09 | kit lighting |
Code-made: the water surface (a prop) and the SVG size drawings. The duck is the real scan.

## Palette
--c1 #FBE7DA peach paper, --c2 #164234 bath green (also the water's base colour), --c3 #C59B24 mustard (buttons, field-note numbers). palette-check PASS.

## Frames
- Phone: water + duck in the top 54%, plate title, then the readout and a full-width "Make a splash" button (thumb zone).
- Desktop: plate label left, water centre, readout column right.
- Same model, same 160x160 water mesh, shader and HDRI on both.

## States
Idle: gentle ambient waves and one demo ripple (both off with reduced motion); tap/click water: ripple at that point; Enter/Space on the canvas or the button: splash; reduced motion: no ambient waves, no demo ripple, ripples only when asked; no WebGL: poster.

## Three hand-made details
1. The readout (heel angle, drift in cm at the duck's 9 cm scale, ripples made) is the simulation's own state.
2. The duck rides the same wave formula the shader draws, so it never floats above a crest.
3. The water fades into the paper instead of ending in a square.

## Production shell
Nav: The duck, Field notes, Sizes, Care, Order. Form: name, email, size, wrapping; "Concept: not sent". Footer: credits + Hire Zyqor Studio.
