# Credits: Rootline Citrus (Concept N010)

Rootline Citrus is a fictional brand made by Zyqor Studio as a web concept. Not a real company, not a client, nothing for sale. Every third-party asset below is used under its licence; each asset file also has a `<file>.credit.json` next to it.

| asset | file | author | source | licence | changes |
|---|---|---|---|---|---|
| 3D model: Lemon | models/lemon.glb | Kuutti Siitonen | https://polyhaven.com/a/lemon | CC0 1.0 (https://creativecommons.org/publicdomain/zero/1.0/) | 2K glTF re-encoded: meshopt geometry, base colour 1024 px and normal/ARM 768 px WebP, no simplification. 225 KB |
| 3D model: Food Lime 01 | models/lime.glb | Oliver Harries | https://polyhaven.com/a/food_lime_01 | CC0 1.0 | 2K glTF re-encoded: meshopt geometry, base colour 1024 px and normal/roughness 768 px WebP, no simplification. 232 KB |
| 3D model: Mandarin (photogrammetry scan) | models/mandarin.glb | yaro.pro (https://sketchfab.com/yaro.pro) | https://sketchfab.com/3d-models/mandarin-a03df271d4ed445ca5e80e24ba72f6e7 | CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/) | full geometry kept (25,000 triangles); base colour 1024 px WebP, normal + metallic-roughness 768 px WebP, meshopt. 299 KB |
| HDRI: Studio Small 09 | site/assets/hdri (shared) | Sergej Majboroda | https://polyhaven.com/a/studio_small_09 | CC0 1.0 | shared kit lighting |
| Cross-section drawing | app.js (SVG in code) | Zyqor Studio | this repo | MIT | made in code |
| Type: Cabinet Grotesk, Satoshi | site/assets/font | Indian Type Foundry | https://www.fontshare.com | ITF Free Font License | none |
| Type: Instrument Serif | site/assets/font | Rodrigo Fuenzalida, Jordan Egstad | https://github.com/Instrument/instrument-serif | SIL OFL 1.1 | none |
| Type: JetBrains Mono | site/library/_kit/font | The JetBrains Mono Project Authors | https://github.com/JetBrains/JetBrainsMono | SIL OFL 1.1 | none |
| Engine: three.js r170, GSAP, Lenis | site/vendor | their authors | https://threejs.org | MIT / GSAP Standard Licence | none |

## Required attribution (CC BY 4.0), shown in the page footer and the Credits sheet

This work is based on "Mandarin" (https://sketchfab.com/3d-models/mandarin-a03df271d4ed445ca5e80e24ba72f6e7) by yaro.pro (https://sketchfab.com/yaro.pro) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Changes: textures resized and compressed for the web by Zyqor Studio.

Courtesy credits (CC0): Lemon by Kuutti Siitonen, Poly Haven. Food Lime 01 by Oliver Harries, Poly Haven. Studio Small 09 HDRI by Sergej Majboroda, Poly Haven.

Considered and dropped for the mandarin:
- Khronos glTF Sample Asset "MandarinOrange" (CC BY 4.0, the catalogue's pick): it depends on KHR_materials_diffuse_transmission, which three.js r170 does not render, and it read as a dull red shell.
- "Satsuma Mandarin, Citrus unshiu" by ffish.asia / floraZia.com (CC0, 952,808 faces): reducing it to a web budget broke its texture atlas seams (white specks).

Design and code: Sujon Hoque, Zyqor Studio (MIT).
