# Teardown: Lusion (lusion.co)

Worked example of the card in `SKILL.md` §3. Measured with `scripts/teardown.mjs` on 30 Oct 2026 (headless Chrome,
software WebGL); judgment written after looking at the screenshots. Lusion v3 was Awwwards Site of the Year 2023
(see `docs/how-top-designers-build-unique-sites.md`). Inspiration only: nothing from the site is in this repo.

## Measured

| | Desktop 1440 | Phone 390 |
|---|---|---|
| Libraries | three.js | three.js |
| Canvases | WebGL2 full viewport (1440x900) + small 2D canvases | WebGL2 full viewport (390x844) |
| Fonts loaded | Aeonik, IBM Plex Mono, LusionMono | same three |
| Largest text | 144 px Aeonik | 105 px Aeonik |
| Page height | 1 screen: the page is an app with its own scroll scene | 1 screen |
| Animates at rest | yes | yes |
| `prefers-reduced-motion` CSS | not found | |
| Requests / weight received | 137 / 20.4 MB | 113 / 16.6 MB |
| Largest files | a showreel MP4 (4.8 MB; listed twice, likely two range requests), a matcap `.exr` (589 KB), an end-sound `.ogg` (465 KB), normal maps as `.webp` (~430-450 KB each) | |
| Third parties | Google Tag Manager / Analytics, Vimeo player, Cloudflare challenge | |

## Judgment

- **Idea**: the studio as a box of glossy toy parts you can push around: the 3D field *is* the portfolio's promise ("we make 3D you can touch").
- **Structure**: one framed stage (rounded dark viewport inside a pale page frame) with a short statement above it; scroll moves the scene, not the page.
- **Palette**: pale canvas `#F0F1FA` frame, black ink, one saturated blue `#0016EC` used on a minority of the 3D parts (measured ~4% of DOM area on desktop; the blue share inside the WebGL scene is larger and not measured). Three colours, one loud: the award pattern.
- **Type**: one grotesk (Aeonik) at 144 px for the display, a mono for labels ("Scroll to explore", "+" markers). Two families plus a custom mono, nothing else.
- **Motion**: parts drift and react to the pointer (*inference from stills plus the "animates at rest" measurement*; the study doc records pointer physics). Easing feels soft and damped.
- **3D / media**: matcap and normal-mapped materials (the `.exr` matcap and `.webp` normal maps in the file list): high shine without heavy real-time lighting.
- **Phone**: same scene, same fonts, recomposed into the tall frame; display drops to 105 px. Weight drops only 19% (20.4 to 16.6 MB).
- **Sound**: an `.ogg` end sound is loaded; check the door for opt-in before borrowing.
- **Signature details**: the rounded viewport frame, mono "+" corner marks, the single blue.
- **Take**: one framed stage per hero; matcap materials for gloss at low cost; one loud colour on a few objects; a mono label system.
- **Never take**: the shapes, the models, the fonts (Aeonik is commercial), the copy, the reel.
- **Where it goes**: `threejs-3d-premium` (matcap option), `colour-systems` R1 (small palette, one loud accent), `typography-premium` (grotesk + mono).
- **Against Zyqor's rules**: 20.4 MB is far over the PREMIUM 8 MB own-file budget and no reduced-motion rule was found; the technique is the lesson, the weight is not (`performance-desktop-max-and-mobile`).
