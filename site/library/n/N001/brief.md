# N001 · Loomhouse Tailors (Concept) · brief before code

Written before any code (Sujon's Master Award system, Drive points Q1/W5), 28 Oct 2026.

- Tier: normal · Category: fashion
- Idea (one sentence): a tailor's cloth room where pointing at a swatch floods the hanging cloth length with that fabric, starting from the exact spot you pointed at, while the page itself takes on that cloth's colourway from your cursor.
- Signature technique: shader reveal on a three.js cloth (two cloth layers, a growing circle in cloth-UV space from the pointer's position inside the swatch, a tailor's-chalk seam on the edge) + a cursor-origin `clip-path: circle()` colour flood across the page that swaps the CSS custom-property theme.
- 3D element (code-made three.js): a length of cloth hung from a lacquered rod, 120x160-segment plane displaced in the vertex shader (drape folds, sway, a ripple that runs out from the reveal point), normals rebuilt per vertex. Real Poly Haven PBR scans on it.
- Real assets + licences (all CC0 1.0, Poly Haven, scans by colormass / Rico Cilliers): Denim Fabric 04 (diffuse + normal), Wool Boucle (a glen-check wool: diffuse + normal), Crepe Satin (normal + roughness; its diffuse is one flat colour so the colourway is ours), Quatrefoil Jacquard Fabric (normal + roughness, roughness also drives the two-tone weave; its diffuse is one flat red so the colourway is ours). Lighting: shared Studio Small 09 HDRI (CC0).
- Change from the catalogue row: the swatch is not only hovered. Click/tap/Enter does the same thing (nothing hover-only), and the reveal origin maps the pointer's spot inside the swatch onto the cloth, so the small swatch works like a map of the big cloth.

## Palette roles (one job per colour)
- --c1 #F6E2E5 rose paper: canvas; also the blush satin colourway; type on the dark theme.
- --c2 #293E20 moss: type, the satin theme ground, the footer. Never pure black.
- --c3 #3B8C5F fern: about 1%: the Book CTA, the active swatch ring, focus ring, the chalk seam, and the jacquard colourway.
- Four themes, each made only of tints of the three: Denim = c1 ground; Glen check = c1 mixed 10% toward c2; Satin = c2 ground with c1 type (the dark chapter); Jacquard = c1 mixed 14% toward c3.
- Contrast (computed): c2 on c1 9.38:1 both ways. c1 on raw c3 is 3.32:1 (fails), so the CTA fill is c3 mixed 35% toward c2 (#3A7148-ish), c1 text on it 4.69:1. c3 itself is used only for rings, the seam and the jacquard cloth.

## Type
- Display: Instrument Serif (italic for cloth names) + Cabinet Grotesk 800 for the wordmark/headline. Body: Satoshi. Mono tags: JetBrains Mono. (Serif + grotesk = the kit's 2 families + mono for tags.)

## Structure: 04 Editorial maison
Header nav (wordmark, The cloths, Fittings, Visit, Book) -> hero (copy + pinked swatch rail left, the hanging cloth right) -> The four cloths (editorial rows, each can hang its cloth) -> How a fitting goes (four hairline steps) -> Book a fitting (form + visit details) -> chrome footer.

## Spacing + states
- Kit scale only. States: swatch default / hover (lift 2px, desktop) / pressed (scale .97) / selected (fern ring + aria-pressed) / focus-visible; cloth loading (poster + "Loading 3D"), WebGL-off poster, reduced motion (instant swap, no ripple, no flood animation); form: empty, invalid (inline messages, aria-invalid), sending (button spinner 600 ms), success ("Concept: not sent" panel), disabled submit while sending.

## Three hand-made signature details
1. Pinked swatch edges: each swatch is cut with a zigzag mask like a real cloth sample cut with pinking shears.
2. A tailor's-chalk dashed seam rides the edge of the reveal circle on the cloth and fades as the flood completes.
3. The page colourway floods from the exact cursor point (or tap point) in sync with the cloth, so the room changes with the cloth.

## Phone build (m.html)
- Same four texture sets and HDRI, same app.js. Cloth stage first (64svh), swatch rail as 4 equal pinked chips under it, menu button opens a sheet with the anchors.
- Touch equivalents: tap a swatch = hover+click; the flood starts at the tap point; tap the cloth = ripple from the finger; drag across the cloth = tug.

## Motion
- Reveals: kit default (opacity + 20px rise, 480 ms, expo-out). Cloth flood 900 ms in-out-quart (a scene change), page flood 720 ms same curve. Ripple decays in about 1.6 s. Idle sway is tiny and stops off screen. Each motion says what changed: which cloth is hanging now.

## QA
node tools/qa-library.mjs N001: 0 errors/warnings/failed requests, 0 overflow at 1440x900 / 390x844 / 360x740, reduced-motion pass, weight under 1.5 MB per build excluding the shared HDRI.
