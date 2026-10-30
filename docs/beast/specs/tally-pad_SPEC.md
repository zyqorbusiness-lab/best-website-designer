# P042 TALLY PAD: build spec + storyboard

Concept P042 for the Zyqor Concept Library. Fictional brand: **Tally Works**. Product: **Tally Pad**, a three-key creator
macro pad with a knurled aluminium dial and a light bar that glows through its frosted front edge.
Written Oct 30 2026 for Sujon Hoque (Zyqor Studio). Inspired by the *genre* of scroll-driven hardware launch pages (he shared
uberdesigner's "Detent" page as the spark). Nothing of that page is used: not its name, copy, code, model, prompt or palette.
Everything below is our own.

Status of this file: written BEFORE any code (Sujon's rule, 2:31 PM IST Oct 30). The build must match it; any change is
written back here first.

---

## 1. Goal and story, beat by beat

**What the site is.** A one-product launch page that sells one feeling: *a small, heavy, precise object that makes editing
feel physical.* The visitor never sees a stock photo. The product is a real-time three.js model on every screen; scroll is the
remote control.

**The story in seven beats (desktop and phone, same beats):**

| # | Section id | Scroll length (desktop / phone) | What the visitor feels | What the 3D model does |
|---|---|---|---|---|
| 0 | `#intro` (first paint) | 0 | "Something heavy is about to land" | Poster still of the pad shows instantly (LCP). The live model fades in over it when ready, settles 6 mm down with a soft bounce, light bar fades up amber. |
| 1 | `#hero` | 100vh / 100svh | Calm, premium, tactile | Pad at 3/4 view, idle float +-1.5 mm at 0.25 Hz, follows the pointer by +-6 deg (desktop) / device tilt off (phone). Light bar breathes 0.6 to 1.0 over 3.2 s. |
| 2 | `#explode` | 220vh pinned / 180svh pinned | "Look how it's built" | Scrub: keycaps lift 26 mm, switches 16 mm, plate 9 mm, PCB 4 mm, case stays. Camera eases from 3/4 to a lower side angle. Five leader-line labels draw in one by one. |
| 3 | `#keys` | 200vh pinned / 160svh pinned | "Every press counts" | Camera dollies to the keys. Keys reassemble, then key 1, 2, 3 press down 3.6 mm in sequence as scroll passes three thresholds; each press flashes the light bar and ticks a counter in the copy. |
| 4 | `#dial` | 200vh pinned / 160svh pinned | "Feel the detents" | Camera orbits to face the dial. Scroll turns the dial 360 deg in 24 detents (snap easing between detents). A big mono readout counts 00 to 24; a timeline strip in the copy scrubs in sync. |
| 5 | `#light` | 160vh pinned / 140svh pinned | "Make it yours" | Camera pulls back to top-down. The light bar walks through four colours: Ember (amber), Tide (sea green), Coral, Frost (ice white); the page background tints toward each in flat steps (no gradients). Buttons let the visitor pick one directly. |
| 6 | `#order` | auto | "I want one" | Static: small rotating model in a card, case finish picker (Raw aluminium / Sand / Sage), price, and a form labelled "Concept: not sent". |

Footer: credits line, Concept label, back to Library.

**No-compromise desktop:** antialias on, DPR up to 2, 1k studio HDRI, physical materials with clearcoat, real-time contact
shadow, 60 fps target. **Phone parity:** the same model, same materials and HDRI; DPR capped at 2; touch scroll drives the
same timelines; no pointer-follow (replaced by a slow auto-turn of +-4 deg).

---

## 2. Stack, setup, folder layout

- Plain static HTML/CSS/ES modules. No build step. three.js r16x from the repo's `vendor/three/` (MIT) via import map.
- Scroll: one `requestAnimationFrame` loop that reads each pinned section's progress from `getBoundingClientRect()`
  (sticky sections, no scroll library, no layout shift). Reduced motion: no scrubbing; each section shows its end state
  as a still and the copy reads top to bottom.
- Shared Library kit: `library/_kit/concept.css`, `landing.css`, `landing.js`, `fx/index.js` (nav, reveals, press).
- Phone: `m.html` + `m.css` share `app.js` and `pad.js`; `index.html` redirects coarse-pointer phones to `m.html` like every
  Library concept (`?desktop=1` keeps desktop).

```
site/library/p/P042/
  index.html        desktop page
  m.html            phone page (same sections, phone layout)
  style.css         desktop layout
  m.css             phone layout
  app.js            scroll engine, UI, form
  pad.js            the procedural Tally Pad model (three.js), exports buildPad(), materials, light colours
  poster.webp       first-paint still (rendered from pad.js), + .credit.json (own work)
  thumb.webp        Library card, + .credit.json
  credits.json, brief.md, qa.json
```

---

## 3. Design tokens

### 3.1 Scale units
- Desktop: `--u: clamp(8px, 0.55vw, 11px)`; layout grid 12 columns, gutter `calc(var(--u)*3)`, max width 1560px.
- Phone: `--u: 8px` fixed; 4-column grid, gutter 20px; tap targets >= 48px.

### 3.2 Colour (no black, no purple, no gradients)

| Token | Hex | Role | Contrast note |
|---|---|---|---|
| `--paper` | `#ECE7DE` | page background (warm bone) | base |
| `--paper-2` | `#E2DBCF` | cards, section bands | |
| `--ink` | `#1F3A33` | headings + body text (deep pine) | 10.6:1 on paper (AAA) |
| `--ink-2` | `#4D6159` | secondary text | 5.6:1 on paper (AA) |
| `--line` | `#C9C1B3` | hairlines, leader lines | decorative |
| `--alu` | `#C8C6C1` | aluminium case colour (3D + swatch) | |
| `--cap` | `#F3EFE7` | key caps (PBT bone) | |
| `--accent` | `#E2572B` | one accent key, CTA button, active states | button text `#FFF8F0` on it = 3.6:1 (large/bold text only, button label 17px/700) |
| `--ember` | `#FFAA3B` | light bar colour 1 (default) | glow only |
| `--tide` | `#3FC2A4` | light bar colour 2 | glow only |
| `--coral` | `#FF7A66` | light bar colour 3 | glow only |
| `--frost` | `#DCEFF5` | light bar colour 4 | glow only |
| `--sand` | `#D8C3A0` | case finish option 2 | |
| `--sage` | `#9DAF9B` | case finish option 3 | |

Section tint in `#light`: `--paper` mixes 10% toward the current light colour with `color-mix(in oklab, ...)`: a flat colour
that steps, never a gradient.

### 3.3 Type (OFL fonts only, all already in the repo)

| Style | Font | Size desktop / phone | Weight | Tracking | Line-height |
|---|---|---|---|---|---|
| Display XL (hero word) | Archivo variable, `wdth` 125 | `clamp(5rem, 11vw, 11.5rem)` / 3.6rem | 800 | -0.035em | 0.86 |
| Display L (section titles) | Archivo, `wdth` 112 | `clamp(2.8rem, 4.6vw, 5rem)` / 2.4rem | 760 | -0.025em | 0.95 |
| Lead | Inter Tight | 1.375rem / 1.125rem | 450 | -0.01em | 1.4 |
| Body | Inter Tight | 1.0625rem / 1rem | 400 | 0 | 1.55 |
| Label / spec | JetBrains Mono | 0.8125rem / 0.75rem | 400 | 0.08em, uppercase | 1.3 |
| Readout (dial counter) | JetBrains Mono | `clamp(6rem, 12vw, 12rem)` / 5rem | 400 | -0.04em | 0.9 |
| Button | Inter Tight | 1.0625rem | 700 | 0 | 1 |

Font loading: `font-display: swap`, display font preloaded; fallbacks sized with `size-adjust` so swap does not shift layout.

### 3.4 Spacing
4-pt base. Steps: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192 px. Section padding: 128px desktop / 64px phone.
Copy column max 34ch (lead) / 62ch (body).

### 3.5 Motion
| Token | Value | Use |
|---|---|---|
| `--ease-out` | `cubic-bezier(.16,1,.3,1)` | reveals, UI |
| `--ease-io` | `cubic-bezier(.65,0,.35,1)` | camera moves between keyframes |
| detent snap | `t => t*t*(3-2t)` applied inside each 15 deg step | dial |
| key press | 90 ms down, 160 ms up, `--ease-out` | keys |
| `--dur-fast` / `--dur` / `--dur-slow` | 180 / 420 / 900 ms | hover / reveal / intro settle |
| scroll smoothing | progress lerp 0.12 per frame | all scrubbed timelines |

---

## 4. Assets

| Asset | Source / URL | Use | Licence |
|---|---|---|---|
| Tally Pad model | built in code, `pad.js` (this repo) | every 3D scene | own work (Zyqor Studio) |
| Knurl normal map | drawn on a canvas at runtime in `pad.js` | dial grip | own work |
| Studio HDRI | `assets/hdri/studio_1k.hdr` (Poly Haven, already credited in repo) | reflections | CC0 1.0 |
| three.js | `vendor/three/` | renderer, RoomEnvironment, RoundedBoxGeometry, RGBELoader | MIT |
| Archivo | `assets/font/archivo-var.woff2` | display | SIL OFL 1.1 |
| Inter Tight | `assets/font/intertight-normal.woff2` | body | SIL OFL 1.1 |
| JetBrains Mono | `library/_kit/font/jetbrainsmono-400.woff2` | labels, readout | SIL OFL 1.1 |
| Poster / thumb | rendered from `pad.js` | first paint, Library card | own work |

No photos, no stock, no generated imagery.

---

## 5. Layout, section by section (desktop 1440x900 reference; phone 390x844)

- **Nav** (kit `bnav`): logo left at x=40, links centre (The pad, Inside, Keys, Dial, Light, Order), CTA "Reserve" right.
  Phone: logo + Menu sheet.
- **#hero**: canvas fills the viewport behind everything (fixed layer, z 0). Copy block bottom-left: tag "Macro pad
  · Concept P042" (mono label) at y=62%, word "TALLY" Display XL below it, lead at max 34ch, two buttons. Spec chips
  bottom-right (3 keys · 24 detents · 4 lights). Model centred at x=60%, y=45%, 46% of viewport width.
  Phone: model top 55% of screen, copy below, chips as a row.
- **#explode**: sticky 100vh stage. Model at x=58%; labels on the right with leader lines to each layer
  (Keycaps PBT 1.5 mm · Switches linear 45 gf · Plate 1.5 mm aluminium · PCB hot-swap · Case CNC 6063). Title top-left.
  Phone: model top half, labels as a numbered list below, each highlighting as its layer separates.
- **#keys**: sticky. Title left column (cols 1-5), counter "Presses 0/3" mono, three key descriptions (Cut · Mark · Undo)
  that light up in turn. Model right (cols 6-12), close-up.
- **#dial**: sticky. Giant mono readout centred-left ("07"), a 24-tick strip under it, copy right. Model faces the dial.
- **#light**: sticky. Four swatch buttons in a row under the title; model top-down centre; background tints.
- **#order**: two columns: left card with the small model + finish picker (3 round swatches) + price; right the form
  (name, email, finish select, note) and "Reserve (concept)". Success state: "Concept: not sent. Nothing was sent."
- **Credits** strip + Concept label in the footer.

---

## 6. The 3D model (`pad.js`)

Units: 1 three.js unit = 10 mm.

| Part | Geometry | Size (mm) | Material |
|---|---|---|---|
| Case | RoundedBoxGeometry, radius 6, 4 segments | 124 x 22 x 72 (w x h x d) | MeshPhysicalMaterial, colour `--alu`, metalness 1, roughness 0.34, clearcoat 0.25 |
| Top plate inset | RoundedBox | 112 x 1.5 x 60, sunk 0.8 mm | same aluminium, roughness 0.42 |
| Light bar | Box on the front face, frosted | 96 x 3 x 2 | MeshPhysicalMaterial transmission 0.6, emissive = light colour, emissiveIntensity 0 to 2.4 |
| Switch housings (3) | Box + cylinder stem | 14 x 11 x 14 | warm grey plastic, roughness 0.6 |
| Keycaps (3, 19.05 mm pitch) | RoundedBox 18 x 9 x 18, radius 2.2, top dished by vertex displacement 0.6 mm | | PBT: colour `--cap` (keys 1, 2) and `--accent` (key 3), roughness 0.72, sheen 0.2 |
| Dial | Cylinder r 15, h 18, 96 radial segments, 0.8 mm chamfer ring | | aluminium, roughness 0.28, knurl normal map (canvas, 512x128, diamond 1.2 mm), normalScale 0.6 |
| Dial indicator | small Box 1 x 0.4 x 5 | | `--accent` |
| PCB | Box 112 x 1.6 x 60 | | sage solder-mask green `#4F7A5A`, roughness 0.5, tiny copper pads |
| Feet (4) | Cylinder r 4 h 1.5 | | cork-brown `#9C7A55`, roughness 0.9 |

Lighting: scene.environment = studio HDRI (PMREM); key DirectionalLight 1.1 warm `#FFF3E6` from top-left-front, rim light 0.7
cool `#E3EEF6` from back-right, a PointLight at the light bar in the light colour (intensity follows the bar) so the glow
spills onto the "desk". Tone mapping ACES, exposure 1.0. Contact shadow: two-layer soft ellipse texture under the case
(no shadow maps). Desk: none (transparent canvas over the flat paper colour).

---

## 7. Scroll timelines

Progress `p` of each sticky section goes 0 to 1. Camera keyframes are (position, target) pairs eased with `--ease-io`.

- **#hero**: camera (5.2, 3.4, 6.4) -> target (0, 0, 0). Intro settle: y +0.6 -> 0 over 900 ms, bounce 0.08.
- **#explode** p: 0-0.15 camera to (6.4, 1.8, 5.2); 0.15-0.8 layers lift with stagger 0.08 (caps first); labels draw at
  p = 0.25, 0.37, 0.49, 0.61, 0.73; 0.8-1 hold.
- **#keys** p: 0-0.15 reassemble + camera to (2.0, 3.0, 3.4) target (-0.6, 0.2, 0); key n presses at p = 0.3, 0.5, 0.7
  (press + light flash 1.0 -> 2.4 -> 1.0 over 400 ms); counter ticks.
- **#dial** p: 0-0.1 camera to (3.6, 1.6, 2.4) target (1.2, 0.2, 0); dial angle = 24 detents mapped across 0.1-0.95 with snap
  easing per detent; readout = detent index.
- **#light** p: 0-0.15 camera to (0, 7.4, 0.01) target (0, 0, 0) (top-down); light colour steps Ember -> Tide -> Coral ->
  Frost at p = 0.2, 0.45, 0.7; background tint follows. Buttons override and lock.
- **#order**: small second view: same model in a 1:1 card renderer, slow 12 s turn; finish swatches recolour the case.

Reduced motion: no intro bounce, no idle float, sections render their end state; buttons still recolour.

---

## 8. QA checklist (before push)

- [ ] 0 console errors, 0 failed requests at 1440x900, 390x844, 360x780 and with reduced motion (live URL).
- [ ] LCP < 1.5 s desktop / < 2.5 s phone (poster is the LCP element); CLS < 0.05.
- [ ] Concept's own files < 1.5 MB (no model download: the pad is code).
- [ ] No WebGL -> poster stays, copy readable, buttons work.
- [ ] Every beat visible: explode labels, 3 key presses + counter, 24-detent dial + readout, 4 light colours, finish picker.
- [ ] Phone matches desktop: same beats, same materials, no horizontal overflow.
- [ ] Palette check: no black (#000 / near-black), no purple, no gradients; contrast table above holds.
- [ ] Form says "Concept: not sent"; Concept label visible; credits strip present; credit gate passes.
- [ ] Library card added (desktop + phone home) with thumb; sitemap entry.
- [ ] Screenshots: `/home/user/tab/files/p042_desktop.jpg`, `p042_phone.jpg`.
