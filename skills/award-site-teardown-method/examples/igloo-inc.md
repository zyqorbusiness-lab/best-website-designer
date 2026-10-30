# Teardown: Igloo Inc (igloo.inc)

Worked example of the card in `SKILL.md` §3. Measured with `scripts/teardown.mjs` on 30 Oct 2026; judgment written
after looking at the screenshots. Igloo Inc by abeto was Awwwards Site of the Year 2024 (see
`docs/how-top-designers-build-unique-sites.md`). Inspiration only.

## Measured

| | Desktop 1440 | Phone 390 |
|---|---|---|
| Libraries | three.js | three.js |
| Fonts loaded | none reported (text drawn as bitmap/SVG or inside the scene: *inference*) | none |
| Page height | 1 screen (an app; the scene scrolls) | 1 screen |
| Animates at rest | yes | yes |
| `prefers-reduced-motion` CSS | not found | |
| Requests / weight received | 101 / 14.0 MB, 92 of them `fetch` requests (assets streamed by the app) | |
| Largest files | `music-highq.ogg` 1.5 MB; textures as `.ktx2` (scroll data texture 1.3 MB, cube normal maps ~1.1 MB each, exploded igloo colour 0.8 MB); a 64-step volume texture (0.8 MB) | |
| LCP (headless, indicative) | 480 ms | |

## Judgment

- **Idea**: a company as an igloo you build block by block on a mountain: the product (an incubator) as a shelter being assembled.
- **Structure**: one continuous scene; blocks lift and settle as you scroll (seen across the 0% and 100% screenshots); chapters are camera positions, not sections.
- **Palette**: snow greys and a cold white glow from inside the blocks; effectively monochrome, the light is the accent.
- **Type**: tiny pixel-like HUD text blocks pinned to the four corners; a pixel wordmark top left. The type is interface, the scene is the hero.
- **Motion**: blocks animate at rest; camera and block assembly tied to scroll (*inference from stills + measured idle animation*).
- **3D / media**: GPU-compressed `.ktx2` textures everywhere (normal maps, colour, a data texture), a volume texture for fog or glow: this is how a 14 MB scene stays loadable.
- **Phone**: same scene and HUD, recomposed for the tall frame (igloo smaller, HUD kept in the corners); not a different site.
- **Sound**: a 1.5 MB music file is fetched; check that it waits for an opt-in.
- **Signature details**: HUD corners, glowing seams between blocks, the exploded-igloo build.
- **Take**: one object assembled by scroll as the story; KTX2 for heavy textures (see `model-optimisation-phone` §5); a HUD layer of small type over a full-bleed scene.
- **Never take**: the igloo, the terrain, the music, the HUD text.
- **Where it goes**: `motion-and-scroll-storytelling` (scroll-assembled object), `threejs-3d-premium` and `model-optimisation-phone` (KTX2), `layout-grid-spacing` (corner HUD as a named structure).
- **Against Zyqor's rules**: 14 MB is over the PREMIUM budget; no reduced-motion CSS found; for client sites keep the long readable page and borrow the assembly as one chapter.
