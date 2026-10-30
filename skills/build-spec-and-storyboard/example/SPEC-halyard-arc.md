# Halyard Arc: site build spec (worked example)

> Fictional product, written for the `build-spec-and-storyboard` skill. Every name, number and line of copy here is
> invented for teaching; the asset URLs are real and their licences were checked on 30 Oct 2026.
> Status: **approved for build** (see "Review gate" at the end).

## 1. Goal and story

**One sentence:** a scroll-driven product page for the Halyard Arc, a brass-and-pine desk lamp whose single folding arm
leans its light exactly where you work.

**The idea:** the lamp is the narrator. It starts folded flat like a closed tool, opens as the visitor arrives, then each
scroll chapter is one thing the arm can do: reach, warm, hold. The light pool on the desk is the "camera": whatever it
lights is what the section is about.

**Beat by beat (what the visitor sees and feels):**

| # | Beat | Visitor sees | Visitor feels |
|---|---|---|---|
| 1 | Arrive | oat-paper page, the lamp lying folded on an oak desk edge, unlit | quiet, expensive, "what is that" |
| 2 | Wake | the arm lifts and unfolds in 1.6 s, the bulb warms on, a soft pool of light opens on the desk; headline sets in word by word | the object is alive |
| 3 | Reach | on scroll the arm swings across three working positions; a thin brass dimension line measures 610 mm reach | "it goes where I need it" |
| 4 | Warm | the visitor drags a dial from 2700 K to 4000 K and the pool's colour and the page's light change with it | control in my hand |
| 5 | Hold | camera pushes into the elbow knuckle; it separates into three parts (two brass cheeks, one friction washer) and closes again | "it is built properly" |
| 6 | Decide | the lamp settles into its reading pose beside a short spec ledger, the price, and one button | calm, no hard sell |

**Copy (draft, real words, not placeholders):**
- Hero title: "Light that leans in." Sub: "One arm. One knuckle. Every angle your desk needs."
- Reach: "610 mm of reach, folded flat to 48 mm." Body: "Swing it over the keyboard, across the sketchbook, back against the wall. The arm stays where you leave it."
- Warm: "From candle to daylight." Body: "Turn the dial from 2700 K to 4000 K. Warm for evenings, cooler for close work."
- Hold: "A knuckle you can rebuild." Body: "Two brass cheeks and a friction washer. If it ever loosens, a coin tightens it."
- Decide: "Halyard Arc, $289." Button: "Order the Arc". Note under it: "Concept site. Nothing is sent."

## 2. Stack and setup

- Static site, no build step: `index.html` (desktop) and `m.html` (phone), ES modules from `/vendor`.
- `three` r170 (vendored `three.module.min.js` + `GLTFLoader` not needed: the lamp is built in code), `gsap` 3.12 with
  `ScrollTrigger` (vendored). Nothing else.
- Fonts self-hosted as subset WOFF2 (Latin only).
- Folder layout:

```
site/library/p/P0xx/
  index.html            desktop page (tokens inline in <style> for first paint)
  m.html                phone page, same sections, recomposed
  style.css             shared styles; tokens as CSS variables
  m.css                 phone-only overrides
  app.js                scroll timelines, dial, reveals
  lamp.js               the 3D lamp (geometry, materials, light, render-on-demand loop)
  img/poster-d.webp     LCP poster (lamp in hero pose, rendered from lamp.js), 1440 px
  img/poster-m.webp     phone poster, 780 px
  tex/oak_veneer_01_1k.webp, tex/studio_small_09_1k.hdr ...  (each with .credit.json)
  fonts/fraunces-var.woff2, fonts/intertight-var.woff2      (each with .credit.json)
  credits.json          every asset, for the on-page credits panel
  qa.json               written by the QA run
```

## 3. Design tokens

**Scale unit.** Desktop is designed at 1440 x 900 and every section is one screen tall:
`--u: min(100vw / 1440, 100svh / 900)`. Phone (< 1024 px) is designed at 390 x 844: `--u: min(100vw / 390, 100svh / 844)`.
Every size is written `calc(N * var(--u))`. The 3D canvas reads the same fit in JS: `fit = min(W / 1440, H / 900)`
(phone `min(W / 390, H / 844)`).

**Colours**

| Name | Hex | Role | Contrast on oat |
|---|---|---|---|
| oat | `#F2ECE1` | page background | - |
| pine | `#1E3530` | all text, lamp shade, primary button | 11.1 : 1 |
| fog | `#5F6B64` | secondary text, captions | 4.7 : 1 (AA body) |
| stone | `#D8CFC0` | hairlines, ledger rules, dial track | decorative |
| brass | `#A87A33` | dimension lines, dial thumb, focus ring, lamp metal base colour | 3.25 : 1 (large/graphic only, never body text) |
| glow | `#FFD49A` | the light pool and bulb (3D light colour at 2700 K); never a UI fill | decorative |
| daylight | `#F4F1EA` | the light colour at 4000 K | decorative |

No black, no purple, no gradients in the UI. The only soft falloff is the real light pool rendered in 3D.

**Typography** (both SIL OFL 1.1)

| Style | Font | Size desktop / phone | Weight | Tracking | Line height |
|---|---|---|---|---|---|
| Display (hero title) | Fraunces, opsz 144, SOFT 50 | 112 / 48 | 380 | -0.035em | 0.95 |
| Title (section titles) | Fraunces, opsz 72 | 64 / 34 | 400 | -0.025em | 1.0 |
| Lead | Inter Tight | 22 / 18 | 400 | -0.01em | 1.35 |
| Body | Inter Tight | 17 / 16 | 400 | 0 | 1.5 |
| Label (eyebrows, ledger keys) | Inter Tight | 13 / 12 | 560 | +0.08em, uppercase | 1.0 |
| Number (dimensions, kelvin) | Inter Tight, `tnum` | 15 / 14 | 500 | +0.02em | 1.0 |
| Button | Inter Tight | 16 / 16 | 560 | 0 | 1.0 |

Why these: Fraunces has a soft, warm serif at large optical sizes that matches brass and oak; Inter Tight is quiet and
narrow so labels sit tight against dimension lines. Tested at 48 px on a 390 px screen: the title fits in two lines.

**Spacing** (desktop / phone, in `--u`): page edge 40 / 20; header height 64 / 56; section title to body 24 / 16;
body width 380 / 330; ledger row height 48 / 44; button height 52 / 48, padding 0 24, radius 26 (pill).

**Motion**

| Token | Value | Use |
|---|---|---|
| `--ease-settle` | `cubic-bezier(0.22, 1, 0.36, 1)` | anything arriving and stopping (text, the arm settling) |
| `--ease-lift` | `cubic-bezier(0.65, 0, 0.35, 1)` | the arm moving between poses (scrubbed) |
| `--ease-press` | `cubic-bezier(0.3, 0, 0.5, 1)` | button press, dial snap |
| `--dur-fast` | 180ms | hover, focus, press |
| `--dur-reveal` | 700ms | text reveal per line, 60 ms stagger between words |
| `--dur-wake` | 1600ms | the intro unfold |

Reduced motion: no unfold (lamp starts in hero pose, lit), no scrubbing (each section shows its end pose), text appears
without movement, the dial still works.

## 4. Assets

| Asset | URL | Use | Licence | Status |
|---|---|---|---|---|
| Studio Small 09 HDRI, 1k | https://polyhaven.com/a/studio_small_09 | reflections on brass and shade | CC0 1.0 (Poly Haven, Sergej Majboroda) | verified 2026-10-30 |
| Oak Veneer 01 texture, 1k | https://polyhaven.com/a/oak_veneer_01 | the desk edge and lamp base cap | CC0 1.0 (Poly Haven) | verified 2026-10-30 |
| Metal 034 texture, 1k (roughness map only) | https://ambientcg.com/view?id=Metal034 | brushed variation in the brass roughness | CC0 1.0 (ambientCG) | verified 2026-10-30 |
| Fraunces variable font | https://fonts.google.com/specimen/Fraunces | display and titles | SIL OFL 1.1 | verified 2026-10-30 |
| Inter Tight variable font | https://fonts.google.com/specimen/Inter+Tight | text, labels, numbers | SIL OFL 1.1 | verified 2026-10-30 |
| The lamp | built in code (`lamp.js`), Zyqor Studio | hero and every section | MIT (own work) | - |
| Posters | rendered from `lamp.js`, Zyqor Studio | LCP image, no-WebGL fallback | MIT (own work) | - |

No photos of people, no stock lifestyle shots, no AI images. Every file gets a `.credit.json`
(`asset-sources-and-licence-check`).

## 5. Layout, section by section

### 0. Structure and layering

```
<header>        position: fixed; z-index 4         logo left, "Order the Arc" right
<canvas id=lamp> position: fixed; inset 0; z-index 1; pointer-events: none   (the 3D lamp + desk)
<main>
  #hero    100svh   copy z-index 2
  #reach   300svh   pinned 100svh stage inside (scrubbed)
  #warm    100svh   dial is z-index 3 and takes pointer events
  #hold    250svh   pinned stage (scrubbed)
  #decide  100svh   opaque oat background z-index 3 from 40 % of the section (covers the canvas edge)
<footer>   credits panel, z-index 3
```

Sections are `position: relative` with no z-index, so the fixed canvas sits between their backgrounds and their copy.

### 1. Hero

- Desktop: title block left, cap-top at y 300, left 120, width 620. Sub 28 below the title baseline. Lamp: base centre at
  (980, 760), arm lifts to the hero pose (lower arm 62 deg from the desk, upper arm 28 deg below horizontal, shade
  pointing at (760, 790)). Light pool: ellipse 520 x 150 centred (760, 800).
- Phone: title centred, cap-top y 120, width 330; lamp base centre (250, 700), shade toward (150, 740); pool 300 x 90.
- Header: logo "HALYARD" in Label style, 40 from the left/top; button right.

### 2. Reach

- Pinned stage. Desktop: copy column left (x 120, cap-top y 260); the lamp swings through three poses on the right
  half: A "keyboard" (shade over x 760), B "sketchbook" (x 1040), C "wall" (arm folded back, shade at x 1240).
- A brass dimension line (1 px, `brass`) runs from the base pivot to the shade rim with the live number in Number style
  ("610 mm" at full reach), placed 24 above the line.
- Phone: copy on top (cap-top y 96), lamp lower half; poses scaled so the shade stays inside x 40-350.

### 3. Warm

- Desktop: the dial sits under the copy at (120, 560), 280 wide: a stone track 2 px, brass thumb 20 px circle, ticks at
  2700 / 3000 / 3500 / 4000 K with Number labels below.
- Dragging the dial lerps the SpotLight colour from `glow` to `daylight` and sets `--page-warm` (0-1), which tints the
  oat background by at most 2 % toward glow (CSS `color-mix`, no gradient).
- Phone: dial full width (20 to 370) at y 560, thumb 28 px for touch; keyboard: arrow keys step 100 K.

### 4. Hold (the knuckle)

- Camera dolly from the full lamp to the elbow (screen-filling, knuckle centre at (900, 450) desktop / (195, 470) phone).
- At 40-70 % of the section the knuckle explodes along its pin axis: left cheek -18 mm, washer 0, right cheek +18 mm;
  three Label callouts with 1 px pine leader lines: "Brass cheek", "Friction washer", "Brass cheek". Closes at 70-90 %.
- Copy column right on desktop (x 1000) so it never sits over the knuckle; phone copy below.

### 5. Decide

- Lamp in reading pose at the left (base (360, 780)); right column at x 820: price in Title style, spec ledger (4 rows:
  Reach 610 mm, Folded 48 mm, Light 2700-4000 K, Weight 2.1 kg), button, the concept note in fog.
- Phone: lamp poster image (no canvas below this point to save battery), ledger and button full width.

## 6. The hero element: the lamp in detail

Units are millimetres; y up; the desk is y = 0.

| Part | Geometry | Size | Material |
|---|---|---|---|
| Base | `CylinderGeometry` 64 segments, bevelled with a second thin torus at the rim | r 70, h 16 | brass (`MeshPhysicalMaterial` metalness 1, roughness 0.34 x Metal034 roughness map, color `#A87A33`, clearcoat 0.2) |
| Base cap | `CylinderGeometry` | r 52, h 3, on top of the base | oak veneer, roughness 0.6 |
| Lower arm | `CylinderGeometry` | r 6, length 320 | brass |
| Knuckle | 2 cheeks: `CylinderGeometry` r 14 h 6, washer r 12 h 4 | pin axis along local x | brass cheeks, washer pine `#1E3530` roughness 0.5 |
| Upper arm | `CylinderGeometry` | r 5, length 290 | brass |
| Shade | `LatheGeometry` from 12 points (a soft cone), double-sided | rim r 62, depth 110 | outside pine, roughness 0.55; inside oat `#F2ECE1`, roughness 0.9 |
| Bulb | `CircleGeometry` r 30 inside the shade | - | `MeshBasicMaterial` colour = current light colour |
| Light | `SpotLight` at the bulb, angle 0.62 rad, penumbra 0.8, decay 2, intensity 9, castShadow 1024 map | - | colour lerps `#FFD49A` -> `#F4F1EA` |
| Desk | `PlaneGeometry` 1600 x 900 | - | oak veneer, roughness 0.55, receives shadow |

- Renderer: `antialias: true`, `toneMapping: ACESFilmicToneMapping`, exposure 0.95, `outputColorSpace: SRGBColorSpace`,
  pixel ratio `min(devicePixelRatio, 2)` desktop and phone.
- Environment: studio_small_09 through `PMREMGenerator`, intensity 0.6, not shown as background (background transparent,
  the page colour shows).
- Render on demand: draw only when a timeline or the dial changes a value, then stop.
- Poses are stored as `{ base, lower, knuckle, upper, shade }` angles in degrees; timelines tween between named poses
  (`folded`, `hero`, `keyboard`, `sketchbook`, `wall`, `reading`).
- No WebGL or a lost context: show `poster-d.webp` / `poster-m.webp` in the same place; everything else still works.

## 7. Scroll timeline

| Section | Progress | What moves | Ease |
|---|---|---|---|
| Intro (time, not scroll) | 0-1.6 s | pose `folded` -> `hero`; bulb 0 -> 1 from 0.9 s; title words in, 60 ms stagger | settle |
| Hero | 0-100 % | lamp pose holds; title drifts up 40 px and fades 1 -> 0 from 60 % | linear (scrub) |
| Reach | 0-30 % | `hero` -> `keyboard`; dimension line draws 0 -> 100 % | lift |
| Reach | 30-65 % | `keyboard` -> `sketchbook`; number counts 430 -> 610 mm | lift |
| Reach | 65-100 % | `sketchbook` -> `wall`; number counts 610 -> 180 mm | lift |
| Warm | on enter | dial fades in, 700 ms; light stays at the last value | settle |
| Hold | 0-40 % | camera dolly to the knuckle | lift |
| Hold | 40-70 % | cheeks part 18 mm; callouts draw in | settle |
| Hold | 70-90 % | parts close; callouts out | settle |
| Hold | 90-100 % | camera pulls back to the full lamp | lift |
| Decide | 0-40 % | pose -> `reading`; ledger rows in, 80 ms stagger | settle |

## 8. Storyboard

Six stills, rendered from the real `lamp.js` scene and the real fonts before any page code (method in the skill).

| Frame | File | Shows |
|---|---|---|
| 1 | `sb_01.png` | arrival: folded lamp on the desk, unlit, title not yet in |
| 2 | `sb_02.png` | end of wake: hero pose, pool lit, title set |
| 3 | `sb_03.png` | reach at sketchbook pose with the dimension line reading 610 mm |
| 4 | `sb_04.png` | warm at 2700 K and at 4000 K, split down the middle |
| 5 | `sb_05.png` | the knuckle exploded with three callouts |
| 6 | `sb_06.png` | decide: reading pose, ledger, button; plus the phone version of the same frame |

Contact sheet: `storyboard.jpg` (3 x 2, frame number and section name under each).

## 9. QA checklist

- [ ] phone shows the same lamp, same poses, same copy as desktop (recomposed, not cut)
- [ ] 0 console errors at 1440 x 900, 390 x 844, 360 x 740; with reduced motion too
- [ ] CLS < 0.1, LCP < 2.5 s (poster is the LCP element), INP < 200 ms while dragging the dial
- [ ] initial weight: desktop < 6 MB, phone < 3 MB
- [ ] dial works with mouse, touch and arrow keys; visible brass focus ring
- [ ] no black, purple or gradient anywhere in the UI
- [ ] credits panel lists the HDRI, both textures and both fonts; `tools/credits-check.mjs` passes
- [ ] screenshots of all six storyboard moments from the live page, compared side by side with the storyboard

## 10. Review gate

- Sent to the owner on WhatsApp: the storyboard contact sheet, the palette + type card, and a 6-line summary of the beats.
- Owner's answer and date are written here before code starts: "ok, warm section dial bigger on phone" (fictional) ->
  dial thumb raised from 24 to 28 px in section 3 above.
- Any change after this point is written into this spec first, then built.
