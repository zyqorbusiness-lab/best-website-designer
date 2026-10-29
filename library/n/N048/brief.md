# brief.md: N048 Ironbark Barbers (Concept)

## Pitch
- One sentence: a barber shop where you swing the real chair and the service it faces is what you book.
- Matrix card: material tufted leather + brass / motion swing a heavy chair / story the menu as a compass.
- Constraint cards: "One verb" (swing), "No cards" (the menu is a ring and a ruled list).
- Category inversion: barber sites show beards and a price grid; here the chair is the menu.
- Distinct from the library: N002 spins a vase for speed; here the heading is the selection (a dial), with detents and a hydraulic lift.

## Real assets
| asset | author | licence | source | used as |
|---|---|---|---|---|
| Barber Shop Chair 01 | Fernando Quinn | CC0 1.0 | https://polyhaven.com/a/BarberShopChair_01 | hero, same GLB on phone and desktop |
| Studio Small 09 HDRI | Sergej Majboroda | CC0 1.0 | https://polyhaven.com/a/studio_small_09 | kit lighting |
Code-made: none in 3D (kit contact shadow only).

## Palette
--c1 #EFE7DA bone, --c2 #17303A slate teal, --c3 #C8402F barber red. palette-check PASS.

## Frames
- Phone: chair top half, the ring becomes a snap rail that follows the chair, then title and ticket with two 52 px buttons.
- Desktop: title left, the chair inside a ring of six services, ticket right.

## States
Drag/swipe/arrow keys swing (inertia, detent on the nearest service); tap a service: the chair swings to it; pump raises in 2.5 cm steps; reduced motion: jumps instead of swinging; no WebGL: poster.

## Three hand-made details
1. Detent: the chair settles on the nearest service like a heavy chair.
2. Hydraulic steps of 2.5 cm, 48 to 58 cm, shown on the ticket.
3. On the phone the service rail scrolls to follow the chair.

## Production shell
Nav: The chair, Menu, A visit, Book. No prices (fictional shop). Form: name, email, service, time of day; "Concept: not sent".
