# brief.md: A027 Cut & Grain Knives (Concept)

## Pitch
- One sentence: a knife maker told in one scroll; the camera runs along the real edge, the blade slides out of the handle, then it closes.
- Matrix card: material polished steel + oiled wood / motion exploded view on scroll / story how it is made, then together.
- Constraint cards: "One camera move" (one continuous path, no cuts), "Macro first" (open on the edge).
- Category inversion: knife shops show a grid of knives; this one shows one knife, taken apart and put back.
- Distinct from the library: first pinned exploded-view concept; A018 is a descent onto a landscape, this is an object.

## Real assets
| asset | author | licence | source | used as |
|---|---|---|---|---|
| Fish Knife | Mateusz Sadek | CC0 1.0 | https://polyhaven.com/a/fish_knife | hero (blade + handle parts), same GLB on phone and desktop |
| Studio Small 09 HDRI | Sergej Majboroda | CC0 1.0 | https://polyhaven.com/a/studio_small_09 | kit lighting |
Code-made: nothing in 3D.

## Palette
--c1 #EFEEDA linen, --c2 #353F21 olive (the pinned scene's ground), --c3 #EAA21C amber (edge rim light during chapter 01, progress line, CTA). palette-check PASS.

## Frames
- Phone: the same pinned scene on native scroll; in chapters 02-03 the camera rolls 90 degrees so the knife runs down the tall screen; captions in the thumb zone.
- Desktop: the same path with Lenis + ScrollTrigger; captions bottom left.

## States
Scroll drives everything; reduced motion: the camera jumps to the scroll position with no easing; no WebGL: poster + captions still follow the scroll.

## Three hand-made details
1. Blade and handle lengths in chapter 02 are measured live from the scan (real metres).
2. An amber rim light catches the edge only in chapter 01.
3. The progress hairline is the scroll.

## Production shell
Nav: The knife, Steel, Care, Order. Form: name, email, handle wood, engraving; "Concept: not sent".
