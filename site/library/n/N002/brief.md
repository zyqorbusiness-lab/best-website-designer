# N002 · Kiln & Quiet (Concept) · brief before code

Write this BEFORE any code (Sujon's Master Award system, Drive point Q1/W5). Keep it under one screen.

- Tier: normal · Category: home goods
- Idea (one sentence): A single glazed vase you spin like a potter's wheel; let go and it coasts to a stop
- Signature technique: three.js turntable with drag inertia + contact shadow
- 3D element: real model: Poly Haven model 'Ceramic Vase 01' (CC0) (swapped from the catalogue's Ceramic Vase 03 on review: its square body read as a slab)
- Real assets + licences: Poly Haven model 'Ceramic Vase 01' (CC0) (swapped from the catalogue's Ceramic Vase 03 on review: its square body read as a slab); Poly Haven HDRI 'Studio Small 08' (CC0)

## Palette roles (one job per colour)
- --c1 #F7EDD7 light: canvas (warm paper family). Body text sits on it.
- --c2 #1E264C dark: type, the dark chapter, the footer. Never pure black.
- --c3 #D74A4D accent: about 1% of the page. One CTA, one rule line, focus ring. Never body text.
- Contrast check: c2 on c1 >= 7:1 for body; c3 used for large type or fills only if under 4.5:1.

## Type
- Display: Cabinet Grotesk 800 + Instrument Serif italic for the second word at -0.04em tracking.
- Body: Satoshi or General Sans, 62ch max. Mono tags: JetBrains Mono, uppercase, +0.06em.
- Max 2 families on the page.

## Structure (pick ONE of the 14; never hero + 3 cards + about + contact)
01 Precision Bento (no 3-card rows) · 02 Swiss exposed-hairline grid · 03 Scroll-driven 3D showcase · 04 Editorial maison ·
05 Horizontal exhibition · 06 Live sandbox hero · 07 Split-screen sticky narrative · 08 Neo-brutalist grid · 09 Spatial glass ·
10 Kinetic typography manifesto · 11 Draggable infinite canvas · 12 Whisper-quiet zen · 13 Conversion funnel (no 3-tier cards) ·
14 Multi-scene WebGL portal
- Chosen: 06 Live sandbox hero inside 12 Whisper-quiet zen (one object, lots of paper, a quiet ledger under it).

## Spacing + states
- Spacing from the kit scale only (8/12/16/24/32/48/64, section rhythm clamp(6rem,12vw,11rem)).
- States to design: default, hover (desktop), press (all), focus-visible, loading (poster), WebGL-off (poster), reduced motion, empty/end.

## Three hand-made signature details (the things a template would never have)
1. The wheel is real physics, not a loop: drag sets the speed, release keeps 94% per frame, and the rpm readout and the dial ticks show that number live.
2. The word 'Still.' appears in Instrument Serif only when the wheel has fully stopped, the reward for waiting.
3. Turned-aluminium wheel head with canvas-drawn turning marks, so the specular highlight moves across the grooves as it spins.

## Phone build (m.html)
- Same model/texture/HDRI files. What changes: layout order, touch gesture instead of hover, native scroll, type size.
- Touch equivalent of every hover: swipe sideways on the stage turns the wheel (same inertia); the glaze swatches are tap radios; arrow keys turn it on keyboard.

## Motion
- Reveals: opacity + 20px rise, 480 ms, expo-out, no bounce, no blur (kit default).
- Scene motion: what does each animation say changed? If nothing, remove it.

## QA (node tools/qa-library.mjs N002)
- 0 console errors/warnings, 0 failed requests, 0 overflow at 1440x900 / 390x844 / 360x740, reduced motion pass.


## nb1b fix (2026-10-29)
- Production page: glass nav (The vase, Glazes, Studio, Reserve) + phone menu sheet, a Glazes section, a Studio process section and a 'Reserve a piece' form (name, email, glaze, collect/ship) with validation, loading and an honest 'Concept: not sent' success. Same sections on m.html. Footer carries Zyqor Studio's contact (kit).
