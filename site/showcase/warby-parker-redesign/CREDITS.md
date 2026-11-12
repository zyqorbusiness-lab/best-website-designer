# Warby Parker redesign concept: credits

Unofficial redesign concept by Zyqor Studio (Sujon Hoque), built Nov 2 2026. Not affiliated with, endorsed by or sponsored by Warby Parker. "Warby Parker" is a trademark of its owner; the page sets the name in Fraunces as plain text and uses no Warby Parker logo file. Copy is ours.

| File | What | Author | Licence | Source | Changes |
|---|---|---|---|---|---|
| 3d/frame.glb | "Sunglasses Khronos" 3D model | Eric Chadwick, Darmstadt Graphics Group GmbH | CC BY 4.0 | https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/SunglassesKhronos | geometry only at runtime; all materials rebuilt in code; the earhook logo texture (Khronos marks) is never shown |
| img/street.webp, img/street-m.webp | Venetian Crossroads backplate DSC07336 (the view through the lenses) | Rico Cilliers, Poly Haven | CC0 1.0 | https://polyhaven.com/a/venetian_crossroads | resized, WebP |
| fonts/fraunces.woff2 | Fraunces (variable) | Undercase Type, Phaedra Charles, Flavia Zimbardi | SIL OFL 1.1 | https://fonts.google.com/specimen/Fraunces | none |
| fonts/jakarta-*.woff2 | Plus Jakarta Sans | Tokotype | SIL OFL 1.1 | https://fonts.google.com/specimen/Plus+Jakarta+Sans | latin subset |
| og.jpg | share image | Zyqor Studio (screenshot) | CC BY 4.0 | this page | crop |
| ../../vendor/three | three.js r170 | three.js authors | MIT | https://threejs.org | none |

The tortoiseshell is a procedural shader (no texture). Lens tints are real transmission in three.js: only opaque objects reach the transmission pass, which is why the street plane is opaque and faded with a veil.
