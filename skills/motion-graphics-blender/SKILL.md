---
name: motion-graphics-blender
description: (v5: real 3D OBJECTS only — text, titles, glow and effects go to EffectCraft) Real 3D motion graphics for reels and SaaS promos, built from Python in Blender (headless, CPU is fine). Glossy extruded 3D type, a tilted floating device/screen with a screen recording on it and a camera that zooms to every click, and a soft-3D floating-objects world. Renders transparent frames with real soft shadows for compositing in EffectCraft (or After Effects).
when_to_use: "make it look like real 3D / After Effects", "3D text", "SaaS promo with the screen in 3D", "camera zooms into the button", "soft 3D world", "Blender motion graphics", any reel where CSS/HTML fake 3D looks cheap
license: MIT (code and text). Fonts are not included (SIL OFL, download them). Example stills are Zyqor Studio's own concept renders.
version: 2.0.0
---

## v5 scope (Sujon, Nov 3 2026: "text and effects EffectCraft par… blender kiu use karunga")
**Blender is for real 3D OBJECTS only** — a product turntable, a device the camera flies around, a 3D logo object — rendered as a transparent PNG/WebP plate and composited in EffectCraft. **Never** use Blender for words/titles/captions (no 3D "SAVE"), glow, light sweeps, flat icons, simple tiles or UI cards: EffectCraft (`skills/reference-to-video/kit/templates/ec_kinetic_v5/zq_lib.jsx`) does those, and qc_v5.py fails a spec that uses Blender for text/effects. `text3d.py` is retired for reels. The face-lock v2 reel (Blender 3D SAVE + grey tiles + glow-on-dark) is the example of what not to ship.



# Motion graphics with Blender (from code)

Why this skill exists: Sujon's reference reels (Nov 3 2026) are made with real 3D. Our first kit faked 3D with HTML/CSS transforms and he said
"mujhe thora vi accha nahi laga". The fix is real geometry, real materials, real light, real depth of field and motion blur — Blender does all of it,
and every part of it can be scripted, so an AI agent can build a whole promo from a text brief.

Pipeline: **references → beat plan → Blender (this skill) → compositor ([effectcraft-compositing](../effectcraft-compositing/)) → [sound-design](../sound-design/) → QA ([video-editing-reels](../video-editing-reels/))**.

## 1. Setup
- Blender 4.2 LTS (free, blender.org). Python 3 + Pillow + numpy for the helper scripts. ffmpeg.
- Fonts (TTF, SIL OFL): Archivo Black, Bricolage Grotesque ExtraBold, Inter Bold, Instrument Serif Italic → put them in `scripts/fonts/`.
- Every script runs headless: `blender -b --factory-startup -P scripts/<name>.py -- --key value ...`

| flag (every template) | does |
|---|---|
| `--out DIR` | render the animation as a frame sequence into DIR |
| `--stills 20,75,150 --still_dir DIR` | render preview frames only (fast check before a long render) |
| `--start N --end M` | render part of the range (split a long render over machines) |
| `--w 810 --h 1440 --samples 12` | resolution and Cycles samples |
| `--save_blend F.blend` | save the built scene — open it in Blender to tweak by hand |

## 2. Render settings that matter (measured on a 16-thread CPU, no GPU)
- **Cycles on CPU**, 12–16 samples, adaptive threshold 0.04, OpenImageDenoise on. ~4 s/frame at 810×1440 (75 %), ~7–10 s at 1080×1920. Render at 75 % and scale ×1.333 in the compositor: you can't see it after Instagram's compression, and it halves the render time.
- EEVEE without a real GPU (software GL) was **slower** (17 s/frame) — on a GPU machine EEVEE Next is the fast option.
- Two Blender processes in parallel don't help on one machine: Cycles already uses every core.
- **Transparent film + shadow catcher** (`is_shadow_catcher`): the render keeps the real soft shadows and the background is added later, so you can change the background without re-rendering.
- Output **RGBA WebP q92** (~0.1–0.3 MB/frame) instead of PNG (~3.5 MB/frame) when disk is tight; EffectCraft and ffmpeg read WebP sequences.
- Colour management **Standard** (hex colours come out exactly) — AgX/Filmic desaturates your brand colours.
- Motion blur on (shutter 0.5): whips and slams get real blur instead of fake crossfades.

## 3. The library — `scripts/mk3d.py`
| function | what it gives you |
|---|---|
| `reset_scene(w,h,fps,seconds,samples,motion_blur,transparent)` | clean Cycles scene with the settings above |
| `world_studio()` | reflection world: dark floor, warm horizon, white sky. Chrome and glossy type only read as 3D when they have contrast to reflect |
| `studio_lights()` | warm key (8 m² area → soft shadow), cool rim, fill, plus two emissive **softboxes** that appear as long highlight streaks on glossy surfaces |
| `candy_chrome(hex)` / `glossy_plastic(hex)` / `clay(hex)` / `frosted_glass()` | Principled BSDF presets: chrome = metallic 0.75, rough 0.12, coat 1.0 · plastic = rough 0.25, coat 1.0 · clay = rough 0.55 |
| `text_obj()` + `to_mesh_split(o, face, side)` | extruded, bevelled 3D type with one material on the front face and another on the sides (white face + blue chrome sides) |
| `device_card(media, is_movie)` | thick rounded slab + emissive screen (image or video texture) with rounded corners done in the shader and a thin glossy coat; returns `ui(x, y)`: a pixel of the screenshot → its 3D point |
| `camera(loc, lens, aim, fstop)` | camera that tracks an `Aim` empty; the same empty is the depth-of-field focus |
| `key(obj, "location", t, value, ease)` | After-Effects-style keyframe in seconds. Eases: `linear, ease, ease_out, expo, expo_out, quart, quart_out, back_out, elastic_out, bounce_out` |

## 4. Template A — glossy 3D text (`text3d.py`)
```
blender -b --factory-startup -P scripts/text3d.py -- --text "SHIP\nFASTER" --style chrome --side "#2453ff" \
   --anim slam --cam push --seconds 2.5 --out renders/title
```
`--style chrome|plastic|split|clay`, `--anim slam|rise|flip|none` (each line separately, `--stagger 0.12`), `--extrude 0.32 --bevel 0.055`.
Slam = flies in from depth with a 25° spin and a back-out overshoot (0 → 115 → 100 %), then keeps a slow idle tilt so it is never static.
Keep every word inside the 90 % title-safe area: lines wider than the safe width are scaled down automatically (`maxw`).

## 5. Template B — tilted device + camera zooms (`screen3d.py`, `screen_video.py`)
1. Screenshots of the product in each UI state (1440×900 @1.5×).
2. `python3 scripts/screen_video.py timeline.json screen.mp4` turns them into a screen recording: hard state swaps, an eased cursor path, click rings, stepped typing reveal.
3. `blender -b --factory-startup -P scripts/screen3d.py -- --media screen.mp4 --shots shots.json --seconds 8 --out renders/screen`
   `shots.json`: `[{"t":2.2,"focus":[450,330],"dist":1.8,"ease":"expo","fstop":2.4}, {"t":3.6,"focus":null}]` — `focus` is a pixel of the screenshot (the button that gets clicked); the camera flies to that exact point on the tilted screen, slightly from the side, focus pulled onto it.
Numbers that look like the references: device tilt 8–16° pitch, 10–15° yaw; zoom-ins to 150–250 % in 0.6 s with expo ease, 0.5–1 s hold, f/2–2.4 when close, f/5.6 wide.

## 6. Template C — soft-3D world (`softworld.py`)
```
blender -b --factory-startup -P scripts/softworld.py -- --palette "#ff8fb1,#7fa8ff,#ffd23f,#5fd39a,#ff9a5c" --count 14 \
   --seconds 6 --hero_text "SOFT 3D" --out renders/world
```
Spheres, pills, rounded cubes and tori in clay or glossy plastic, slow bob and spin, f/1.8 depth of field, pastel backdrop (or transparent). A clear lane is kept for the hero word.

## 7. The full SaaS promo — `examples/saas_hero/`
`hero.py` builds a 16 s promo in the style of the reference (@raieum.edit plugin promo) as **one scene**:
| time | beat |
|---|---|
| 0.0–1.7 | chrome type "YOUR WEEK / IS A MESS." slams in line by line, 3D sticky notes tumble around it |
| 1.7–2.1 | zoom-through: the type flies at the camera (EffectCraft adds radial zoom blur + light leak) |
| 2.1–3.1 | the device flies up from below, rotating 65° → 13°, lands on the music drop |
| 3.9–9.2 | camera zooms to the input (cursor click + typing), whips to "Add task", zooms to the new task, pulls back as the device swings to the other side, zooms to the checkbox (done) |
| 9.2–12.4 | device rises, feature list "1. PLAN / 2. ADD / 3. DONE" slams in, 0.45 s apart |
| 12.4–16 | CTA: "WANT A SITE / LIKE THIS?" + DM pill, offer, "concept design" label |
Focus points are computed from the screenshot pixels (`focus_world(x, y, t, dist)`), so a new product only needs new screenshots, new pixel targets and new words.

## 8. Mistakes we made (so you don't)
- Text 100 % wide at a side-on camera angle → clipped letters. Keep 54 px margins at 1080 wide; check the first and last frames of each shot.
- Glow with a low threshold (78 %) on a white UI washed the whole screen out → threshold 96 %, glow only the speculars.
- A flat grey world makes chrome look like plastic → use `world_studio()`.
- PNG frames filled the disk → WebP RGBA.
- Text objects face −Y after `rotation_x = 90°`; turn them 180° on Z to face a camera on +Y — and remember camera-left is then world +X when you left-align.

## 9. QA
Contact sheet (2 fps) of every render, title-safe check, compare beat-by-beat with the reference frames, then audio and size checks ([video-editing-reels](../video-editing-reels/) §QA).

## v4 (Nov 3 2026) — Blender parts of the 6 reference recipes
- `kit/templates/explainer_soft3d_v4/sprites_v4.py` — real 3D objects as transparent seamless 2-s float loops for 2.5D layout in EffectCraft (how soft-3D explainers are really made): `tile` (any glossy icon, `--color --glyph`), `phone_search`, `phone_site` (`--media`), `avatar` (`--tex`), `star`, `pin`, `coin`, `tile_call`, `tile_check`, `tile_globe`. Used by refs 1, 3 (hook icon), 5.
- `kit/templates/saas_blender_hero_v4/hero_v4.py` — ref 2 v4 fixes: glowing chrome hook text, dark UI on peach, small italic feature words seen straight on, single 3D chat-bubble end card; shadow catcher farther (−3.2) to avoid a muddy blob; RGBA WebP frames (≈0.3–0.6 MB vs 3.5 MB PNG).
- Ref 6 big bubble words: `blender/text3d.py --text "CRAZYYY" --style plastic --anim slam` → transparent frames, motion blur in EffectCraft.
- Measured: 1080×1920 Cycles CPU ~10 s/frame at 12 samples → 30 fps full res, not 60, on a CPU box. Test one still (`--still x.png --frame N`) before every long render.
- Recipes + tool table: [reference-to-video](../reference-to-video/SKILL.md) · breakdowns: [`docs/motion-references/`](../../docs/motion-references/README.md).
