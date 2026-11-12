# N003 · Tidewell Salt (Concept) · brief before code

Written before any code (Sujon's Master Award system, Drive points Q1/W5), 28 Oct 2026.

- Tier: normal · Category: food
- Idea (one sentence): a glass jar of flaky sea salt turns in front of a giant outline wordmark that only moves when you scroll, at the speed you scroll, and bends through the glass as it passes behind the jar.
- Signature technique: scroll-velocity marquee + a code-made transmission glass jar. The wordmark band and the salt photo live INSIDE the 3D scene (behind the jar), so the glass really refracts the moving type and the photo; the speed of the band follows scroll velocity (and a sideways drag), then settles. It never loops on its own (Sujon's no-endless-loop rule).
- 3D element (code-made three.js): LatheGeometry glass jar (MeshPhysicalMaterial transmission, IOR 1.5, thickness), a coral-glazed stoneware lid that lifts as you scroll, a wrap-around paper label, ~420 instanced hollow-pyramid salt flakes (the real shape of a pyramid sea-salt crystal), a bottle-green plinth with a contact shadow.
- Real asset + licence: photo "Salt-crystals.jpg" by Nate Steiner, CC0 1.0 (Wikimedia Commons, https://commons.wikimedia.org/wiki/File:Salt-crystals.jpg), cropped to 3:4 and colour-graded toward the palette (shadows to bottle green, highlights to warm peach). Lighting: shared Studio Small 09 HDRI (CC0).
- Change from the catalogue row: the catalogue named an Unsplash photo "to be picked"; Unsplash search was not reachable from the build box, so a CC0 macro from Wikimedia Commons was picked instead (same subject, safer licence). The type is outline in the 3D band rather than a DOM mix-blend layer, so the glass can refract it.

## Palette roles (one job per colour)
- --c1 #F9DDC7 peach: canvas, the scene background, the label paper.
- --c2 #1B3A2F bottle green: type, the outline wordmark, the plinth, the dark harvest band, the footer.
- --c3 #E48B62 coral: about 1%: the lid glaze, the Order CTA fill, focus ring, the active size chip.
- Contrast (computed): c2 on c1 9.57:1; c2 text on c3 fill 4.83:1 (so the CTA is coral with bottle-green text); c1 on c3 is 1.98:1, never used for text.

## Type
- Oct 31 refresh: Fraunces (display, italic accents) + Inter Tight body (both SIL OFL, self-hosted in site/assets/font); JetBrains Mono tags. Palette moved to sea-foam #E6F1EC / deep sea #1D4E5F / coral #E8735A (CTA text #10303B) / sand #F3E3C8 panels. The arch card and the salt inside the jar are a real photo (Salt Crystals, Donald Olszewski, CC BY 4.0); the outline TIDEWELL band moved out of the hero into section 2; the harvest band carries a real salt-pans photo (Marakkanam Salt Pans, Dey.sandip, CC BY 3.0).

## Structure: 10 Kinetic typography manifesto
Header nav (wordmark, The salt, The jar, Harvest, Order) -> pinned hero (240svh scroll: jar turns, lid lifts, band moves with your scroll) -> The flake (macro photo + three short notes) -> The jar (hairline spec sheet) -> Harvest (dark bottle-green band, three steps) -> Order (size chips, quantity stepper, email; validation; honest "Concept: not sent" success) -> chrome footer.

## Spacing + states
- Kit scale only. States: size chip default / hover / pressed / selected (aria-pressed); stepper min 1 max 6 (disabled at the ends); field focus / invalid / valid; submit loading 650 ms; success panel; WebGL-off poster; reduced motion (band static, lid shown open, no inertia).

## Three hand-made signature details
1. The outline wordmark bends and magnifies through the glass when it passes behind the jar (real refraction, not a fake blur).
2. Each salt flake is a hollow stepped pyramid, the actual shape of pyramid sea-salt crystals, scattered with random tilt and scale.
3. The lid lifts and tilts open exactly in the middle of the pinned scroll, so the flakes are revealed at the moment the copy talks about them.

## Phone build (m.html)
- Same photo, HDRI and code. Pinned stage shorter (200svh), copy over the top third, jar lower; menu button opens a sheet with the anchors; order form stacks.
- Touch equivalents: swipe sideways on the jar turns it (kit spin, pan-y kept for scrolling); the band follows the native scroll velocity; every hover state has a pressed state.

## Motion
- Reveals: kit default. Band: velocity * gain, damped (no constant drift). Lid: smoothstep over 35%-60% of the pin. Jar: scroll adds a half turn on top of drag inertia.

## QA
node tools/qa-library.mjs N003: 0 errors/warnings/failed requests, 0 overflow at 1440x900 / 390x844 / 360x740, reduced-motion pass, weight under 1.5 MB per build excluding the shared HDRI.


## nb1b fix (2026-10-29)
- The hero jar is now a real model: "Glass Jar with Marble Lid 2.0" by InGameStudio (Sketchfab, CC BY 4.0, uid f5383b6b32eb4439b874473b6d52df0c), the middle jar of the set, re-materialed in the palette (transmission glass, coral-tinted marble lid). Lid-lift scroll, salt flakes, label and refracted wordmark band kept. Phone now draws the same 420 flakes as desktop. Attribution visible on both pages and in the credits sheet.
