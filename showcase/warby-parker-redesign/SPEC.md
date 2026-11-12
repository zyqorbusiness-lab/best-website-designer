# Warby Parker, unofficial redesign concept (Zyqor Studio), build spec

Built Nov 2 2026 for the day07 single-brand reel. Unofficial concept, not affiliated with Warby Parker.

## Idea
"See it all, clearly." One real 3D frame (glTF, three.js r170) is the whole site: it unfolds on load, turns as you scroll,
changes finish in the Finish studio, then the camera moves in until the lenses fill the screen in front of a real sunlit
street photo. The lens slider (Clear, Blue-light, Light-responsive, Sun) tints what you see THROUGH the lenses (real
transmission, the street outside the lenses stays bright), which is the reel's beat. It ends with five frames lining up
for Home Try-On.

## Palette (repo colour-systems, worked palette "Porcelain (health)": optical = health)
canvas #F6F9F8 porcelain, ink #123532 deep pine-teal, accent #0B7D73 teal. palette.mjs --check: VERDICT PASS (12.54:1, 4.61:1, 4.73:1).
Frame finishes are product materials, not palette: Whiskey Tortoise (shader), Jet Black, Crystal, Sea Glass (accent tint).

## Type (typography-premium 2.2 "Healthcare" pair)
Fraunces (opsz/wght/SOFT axes, soft optical size) display, Plus Jakarta Sans body. Both SIL OFL 1.1, self-hosted.

## Chapters and camera keys (key = section top; values interpolate with smoothstep)
1 Hero: frame 3/4 view right of the headline (desktop) / above it (phone), temples unfold 0 to 1 in 1.6 s on load.
2 Finish studio: frame turns to the other 3/4 side, four finish swatches; drag to turn.
3 Lens: camera straight on, lenses fill the width, street plane behind; slider 0..3 tints lenses (colour + iridescence).
4 Home Try-On: the frame slides into slot 3 of five clones in five finishes, camera pulls back.
5 Footer: disclosure + credits.
Camera distance is solved from a world width to fit, so desktop and portrait phone use the same keys.

## Assets
3d/frame.glb Khronos "Sunglasses Khronos" (Eric Chadwick, Darmstadt Graphics Group, CC BY 4.0): geometry only; the earhook
texture that carries the Khronos logos is not used, every material is replaced in code.
Light: three.js RoomEnvironment (code-built), plus a key light. (A CC0 studio HDRI was tried first; dropped to keep the page light.)
img/street.webp Poly Haven backplate venetian_crossroads DSC07336 (Rico Cilliers, CC0), resized.

## QA
1440x900 and 390x844 screenshots, 0 console errors, no-WebGL poster, prefers-reduced-motion (no auto-turn, no unfold).
