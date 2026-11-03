---
name: effectcraft-compositing
description: After-Effects-style compositing and effects with EffectCraft — the free, open-source AE alternative from ArtCraft — driven by JSX scripts from the command line. Gradient worlds, glow, light sweeps, zoom-through and whip blur transitions, RGB split hits, flash cuts, light leaks, impact shake, grain/vignette and animated 2D captions on top of Blender renders. Includes ffmpeg fallbacks for every effect.
when_to_use: "After Effects free alternative", "add effects/transitions like AE", "glow, glitch, RGB split, light leak, zoom transition", "composite the Blender render", "EffectCraft", scripting an edit end to end without opening a GUI
license: MIT (code and text)
version: 2.0.0
---

## v5: EffectCraft is the TEXT + EFFECTS engine (Nov 3 2026)
`skills/reference-to-video/kit/templates/ec_kinetic_v5/zq_lib.jsx` (ES5, AE object model) — captionLine (each word its own text layer, centred, voice-timed pop, gradient keyword via Gradient Ramp, serif-italic accent, marker bar), title (per-letter layers cascade), card (pop + overshoot + soft Drop Shadow + 7 px float), cursor (glide, tap squash, ripple ring), zoomBlur (CC Radial Fast Blur), whip (Directional Blur), glitch (VR Digital Glitch + VR Chromatic Aberrations), flash (Exposure), background (paper: Gradient Ramp radial + Fractal Noise soft-light fibre + multiply tone; studio: radial sweep + floor shadow; plate), grade (Lumetri temp +6, contrast +14, sat 94, faded film 4 · CC Vignette 8 · Add Grain 0.28 mono). Driven by `kit/ec_reel.py shots.json`.
Measured gotchas in EffectCraft 0.19 (Nov 3 2026):
- Scripts cannot write files unless Preferences ▸ Scripting ▸ Allow Scripts to Write Files is on → print JSON with writeLn and parse stdout.
- **Add Grain "Viewing Mode": 3 = Final Output; 2 renders a white matte over the whole frame** (this blanked a whole render).
- Text Range Selector offsets misbehave (text visible → hidden → reveal); for per-letter animation use one text layer per letter (title()).
- Effect points on text/shape layers live in comp-size space centred on the layer origin: point = [W/2 + x − pos.x, H/2 + y − pos.y].
- A Gaussian Blur on a small solid is clipped by the solid's bounds; use a soft PNG (floor shadow) instead.
- CC Vignette amount 16 already reads heavy on paper; 8 is enough.
- Glow: off by default; one focal layer max; never on an adjustment layer (qc_v5.py F2).



# Compositing with EffectCraft (free After Effects alternative)

Sujon picked the ArtCraft suite as his free Adobe replacement (Nov 3 2026) and EffectCraft as the After Effects one. It is free and open source,
runs on Windows, macOS and Linux (+ a web build), and — the important part for us — ships **`effectcraft-cli`**, which runs headless and executes
**After Effects-style JSX scripts** (`app.project`, `items.addComp`, `layers.add`, `property("Effects").addProperty("Glow")`, keyframes, `KeyframeEase`,
expressions with `time`/`wiggle`). So an AI agent can build and render a full comp from code, and you can open the same project in the GUI to tweak by hand.
Its own site says "young, moving fast, already usable" — in our test it rendered every effect below; a few grouped parameters need index access (§5).

## 1. Install
- Download: https://getartcraft.com/apps/effectcraft (launcher, or standalone: Windows .msi / portable .zip, macOS .dmg + **CLI .zip**, Linux AppImage / .deb / .rpm / tarball, ~75 MB). The Linux tarball has both `bin/effectcraft` (GUI) and `bin/effectcraft-cli`.
- Windows CLI path after install: `%LOCALAPPDATA%\Programs\ArtCraft\EffectCraft\effectcraft-cli.exe`.
- Source: https://github.com/storytold/effectcraft (MIT / Apache-2.0).

## 2. CLI you will use
```
effectcraft-cli script comp.jsx                                  # build the comp from a script (saves .ecproj)
effectcraft-cli render-frame --project p.ecproj --comp Hero --time 4.6 --out check.png
effectcraft-cli render --project p.ecproj --comp Hero --out silent.mp4 --format h264 --bitrate 24000 --progress
effectcraft-cli exec effect.list --json                          # all 308 effect names
effectcraft-cli mcp                                              # MCP server so an AI agent can drive it live
```
Speed on a CPU: a 1080×1920 frame with 5 effect layers ≈ 1.5–2.7 s (its GPU compositor is faster on a real GPU: add `--gpu`).

## 3. The layer stack that copies AE promos
bottom → top: **world** (4-colour gradient, slowly drifting) → **light leak** (Add blend, only on transitions) → **3D render** (Blender RGBA frames, Glow on speculars, CC Light Sweep, impact-shake expression) → **FX adjustment layers** (zoom blur, whip blur, RGB split, flash, grain + vignette) → **2D overlays** (captions, labels, CTA pills).
Full working script: `scripts/comp.jsx` (the 16 s SaaS hero from [motion-graphics-blender](../motion-graphics-blender/)).

## 4. Recipes (JSX)
```js
// import a Blender frame sequence (RGBA WebP/PNG). Comp frame N = file N+1.
var io = new ImportOptions(File("renders/f/f_0001.webp")); io.sequence = true;
var r3d = comp.layers.add(app.project.importFile(io)); r3d.property("Scale").setValue([133.33,133.33]);  // rendered at 75 %
// keyframes with ease (AE "easy ease" = influence 33; expo-like = 70-85)
function keys(prop, pairs, infl){ for (var i=0;i<pairs.length;i++) prop.setValueAtTime(pairs[i][0], pairs[i][1]);
  if (infl) for (var k=1;k<=prop.numKeys;k++){ var e=new KeyframeEase(0,infl); try{ prop.setTemporalEaseAtKey(k,[e,e,e],[e,e,e]); }catch(x){ prop.setTemporalEaseAtKey(k,[e],[e]); } } }
```
| effect | how | values that worked |
|---|---|---|
| gradient world | solid + `4-Color Gradient`; colours in group 1 (`g.property(1).property("Color 1")`) | peach/pink/coral #ffe2cf #ffc6da #ff9877 #ffb48f, points drift over the whole video, Blend 180 |
| glow (speculars only) | `Glow` on the 3D layer | threshold **96**, radius 18, intensity 0.25 (threshold 78 washed a white UI out) |
| light sweep | `CC Light Sweep`, animate `Center` across in 0.7 s when something lands | direction −28, width 45, intensity 28, edge 0 |
| zoom-through transition | adjustment layer + `CC Radial Fast Blur` Amount | 0 → 90 → 0 over 0.6 s, peak on the cut |
| whip | adjustment layer + `Directional Blur` (direction = pan) | length 0 → 55 → 0 over 0.4 s |
| RGB split / glitch hit | `VR Chromatic Aberrations` Aberration (Red)/(Blue) | +28 / −28 for 3–4 frames on clicks and slams |
| flash cut | `Exposure` → `.property(2).property("Exposure")` | 0 → 0.55 → 0 over 3 frames |
| light leak | warm blurred-blob image, `layer.blendingMode = BlendingMode.ADD` | opacity 0 → 85 → 0 over 0.8 s, drifting |
| impact shake | expression on Position: decaying sine, 12 px, 0.3 s after each hit | see comp.jsx |
| caption pop | Scale 0 → 112 → 100 in 0.28 s, Rotation −8 → 0, ease 70 | |
| finish | adjustment: `CC Vignette` 22 + `Add Grain` (Viewing Mode 3 = Final Output, intensity 0.35) | |
Other AE-style effects available by the same name: Lens Flare, CC Light Rays, Gradient Wipe, Linear Wipe, Radial Wipe, Card Wipe, Venetian Blinds, Pixel Motion Blur, CC Force Motion Blur, Timewarp, Echo, Turbulent Displace, Wave Warp, Fractal Noise, Particle Playground, CC Particle World, Shatter, Drop Shadow, Bevel Alpha, Lumetri Color, Curves, Hue/Saturation, Key Light, Roto Brush, 3D Camera Tracker (exports the camera to Blender).

## 5. Gotchas (found Nov 3 2026, v0.19)
- `$.fileName` can be empty when a script runs from the CLI — put the project folder path at the top of the script.
- Grouped parameters (4-Color Gradient, Exposure, Add Grain "Tweaking") are reached with `.property(groupIndex).property(name)`.
- Missing frames in a sequence render as colour bars — render all frames before the comp render.
- `ImportOptions.sequence = true` takes the whole numbered run from the first file.

## 6. Same effects in ffmpeg (fallback / quick edits)
glow `split[a][b];[b]gblur=sigma=25[g];[a][g]blend=all_mode=screen:all_opacity=0.45` · RGB split `rgbashift=rh=-8:bh=8` · grain `noise=alls=6:allf=t` · vignette `vignette=PI/5` · whip `dblur=angle=0:radius=40` on 2–4 frames each side of a cut · flash `eq=brightness=0.6` on 2–4 frames · speed ramp `setpts` piecewise · transitions `xfade=transition=zoomin|slideleft|circleopen|pixelize:duration=0.3`.

## v4 (Nov 3 2026) — EffectCraft parts of the 6 reference recipes
- Generated comps (Python writes the JSX, then `effectcraft-cli script comp.jsx` + `render`): `build_ref1.py` (2.5D world, DOF blur, camera push per beat), `build_ref3.py` (framed card over a blurred blue duotone copy, permanent CTA line, flashes, scribble ring, B&W + grain, stacked kinetic words), `build_ref4.py` (red radial bg, 2 cards, pixel labels, sticker pops, end card), `build_ref5.py` (cards as `threeDLayer` + camera, tilted grid drift, light streaks, rays, toggle). Ref 2: `comp_v4.jsx`.
- **Gotcha found in v4:** keyframes snap to whole frames — two keys inside one frame collapse into one and a fade "leaks" over seconds. Keep keys ≥ 1 frame (1/30 s) apart.
- JSX can't find its own path (`$.fileName` is empty): hardcode `var HERE` or let the runner rewrite it (`build_all_v4.sh` does this with sed).
- Glow threshold 96 (78 washes white UI out). Motion Blur on every 3D word sweep; Zoom Blur for whips.
- Recipes + tool table: [reference-to-video](../reference-to-video/SKILL.md) · breakdowns: [`docs/motion-references/`](../../docs/motion-references/README.md).
