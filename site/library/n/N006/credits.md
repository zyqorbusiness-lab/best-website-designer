# Quarry Type Foundry (Concept N006): credits

Fictional brand, designed and coded by Sujon Hoque at Zyqor Studio. Code: MIT.

| What | Title | Author | Source | Licence | Note | Files |
|---|---|---|---|---|---|---|
| Typeface | Roboto Flex | The Roboto Flex Project Authors | [Google Fonts / GitHub](https://github.com/googlefonts/roboto-flex) | SIL OFL 1.1 | Variable font; subset to Latin with fontTools, the wght, wdth, GRAD and opsz axes kept and the parametric axes pinned at their defaults (139 KB woff2). Quarry is fictional and did not draw it. Self-hosted woff2; OFL text in OFL-RobotoFlex.txt. | `robotoflex.woff2` |
| 3D glyph | Q extruded from Roboto Flex outlines at 100/300/400/700/1000 | Zyqor Studio |  | MIT | Outlines read from the font file with fontTools, extruded and bevelled in three.js (code-made geometry). |  |
| Texture | Marble Rock 02 | Amal Kumar | [Poly Haven](https://polyhaven.com/a/marble_rock_02) | CC0 1.0 | 1K diffuse, normal and roughness as WebP. Same files on phone and desktop. | `stone_nor_1k.webp`, `stone_rough_1k.webp`, `stone_diff_1k.webp` |
| HDRI | Studio Small 09 | Sergej Majboroda | [Poly Haven](https://polyhaven.com/a/studio_small_09) | CC0 1.0 | Shared kit lighting (site/assets/hdri). | `../../../assets/hdri/studio_1k.hdr`, `../../../assets/hdri/studio_512.hdr` |
| Type | JetBrains Mono | The JetBrains Mono Project Authors | [GitHub](https://github.com/JetBrains/JetBrainsMono) | SIL OFL 1.1 |  |  |
| Engine | three.js r170, GSAP, Lenis | their authors | [threejs.org](https://threejs.org) | MIT / GSAP Standard Licence |  |  |
| Images (code-made) | Poster and library thumbnail | Zyqor Studio | frames of this page | MIT | WebGL-fallback poster and index thumbnail, rendered from this page by tools/qa-library.mjs. No AI imagery. | `poster.webp`, `thumb.webp` |

Every asset file also has its own credit file next to it (`<file>.credit.json`) with the exact licence, licence URL, required attribution, source page, changes and download date. `node tools/credits-check.mjs` checks them.
