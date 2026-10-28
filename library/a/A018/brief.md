# A018 · Tranquility Base (Concept) · brief before code

Write this BEFORE any code (Sujon's Master Award system, Drive point Q1/W5). Keep it under one screen.

- Tier: advanced · Category: travel
- Idea (one sentence): Scroll lands you on the lunar surface and lifts the camera to an earthrise
- Signature technique: scroll camera path + scanned moon rocks + starfield
- 3D element: real model + scene: Poly Haven model 'Moon Rock 01' (CC0); Poly Haven model 'Moon Rock 05' (CC0); Poly Haven model 'Moon Rock 07' (CC0)
- Real assets + licences: Poly Haven model 'Moon Rock 01' (CC0); Poly Haven model 'Moon Rock 05' (CC0); Poly Haven model 'Moon Rock 07' (CC0)

## Palette roles (one job per colour)
- --c1 #EEE0C4 light: canvas (warm paper family). Body text sits on it.
- --c2 #232F43 dark: type, the dark chapter, the footer. Never pure black.
- --c3 #D03037 accent: about 1% of the page. One CTA, one rule line, focus ring. Never body text.
- Contrast check: c2 on c1 >= 7:1 for body; c3 used for large type or fills only if under 4.5:1.

## Type
- Display: Cabinet Grotesk 800 + Instrument Serif italic accents at -0.04em tracking.
- Body: Satoshi or General Sans, 62ch max. Mono tags: JetBrains Mono, uppercase, +0.06em.
- Max 2 families on the page.

## Structure (pick ONE of the 14; never hero + 3 cards + about + contact)
01 Precision Bento (no 3-card rows) · 02 Swiss exposed-hairline grid · 03 Scroll-driven 3D showcase · 04 Editorial maison ·
05 Horizontal exhibition · 06 Live sandbox hero · 07 Split-screen sticky narrative · 08 Neo-brutalist grid · 09 Spatial glass ·
10 Kinetic typography manifesto · 11 Draggable infinite canvas · 12 Whisper-quiet zen · 13 Conversion funnel (no 3-tier cards) ·
14 Multi-scene WebGL portal
- Chosen: 03 Scroll-driven 3D showcase (one pinned WebGL scene, five chapters on one camera spline).

## Spacing + states
- Spacing from the kit scale only (8/12/16/24/32/48/64, section rhythm clamp(6rem,12vw,11rem)).
- States to design: default, hover (desktop), press (all), focus-visible, loading (poster), WebGL-off (poster), reduced motion, empty/end.

## Three hand-made signature details (the things a template would never have)
1. One continuous camera shot from orbit to eye level and back up, on two splines (eye + look-at), each chapter an equal share of scroll, damped by wall-clock time so slow phones keep up.
2. Haze and fog distance scale with the camera's altitude, so the ground goes from flat map to close rock without a cut.
3. The Earth uses NASA Blue Marble with a code-made terminator and atmosphere rim lit from the same sun as the rocks; on desktop it rises clear of the text column.

## Phone build (m.html)
- Same model/texture/HDRI files. What changes: layout order, touch gesture instead of hover, native scroll, type size.
- Touch equivalent of every hover: nothing is hover-only: the journey is scroll (native on phone), the progress rail becomes a top bar on phone, the CTA is a tap.

## Motion
- Reveals: opacity + 20px rise, 480 ms, expo-out, no bounce, no blur (kit default).
- Scene motion: what does each animation say changed? If nothing, remove it.

## QA (node tools/qa-library.mjs A018)
- 0 console errors/warnings, 0 failed requests, 0 overflow at 1440x900 / 390x844 / 360x740, reduced motion pass.
