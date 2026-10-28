---
name: liquid-glass-ui
description: A drop-in liquid-glass UI kit for the web (nav pill, cards, buttons, segmented control, switch, slider, sheet, phone tab bar, tooltip) with real edge refraction, a specular rim, hairline, depth, adaptive tint for floating bars, and fallbacks that still look made. Plain CSS + one small JS file, no build step.
when_to_use: You want Apple-style liquid glass on a website or web app — floating navigation, controls and small cards over photography, video or a 3D scene — and it has to stay readable, fast on phones and correct in every browser.
when_not_to_use: Long reading text, data tables, forms with many fields, or a flat single-colour page (glass over flat colour has nothing to bend, so it reads as a grey box).
version: 2.0.0
license: MIT (code and text). Example photos CC0, fonts SIL OFL 1.1 — see README credits.
author: Zyqor Studio (Sujon Hoque)
---

# Liquid Glass UI

One material, nine controls. Copy `kit/` into a project, add two tags, put classes on your markup.

```html
<link rel="stylesheet" href="kit/liquid-glass.css">
<script src="kit/liquid-glass.js" defer></script>
<nav class="lg lg-nav">…</nav>
```

The CSS alone gives the full frosted material (blur, saturation, specular rim, hairline, inner glow, depth).
The JS adds what CSS cannot: edge refraction, the pointer light, the sliding lens in segmented controls and tab bars,
switch / slider / sheet / tooltip behaviour, and adaptive tint for floating bars.

---

## 1. The material: five layers

Every `.lg` element is built from the same five layers. Learn these and you can build any glass control.

| # | Layer | How | Values that read right |
|---|---|---|---|
| 1 | **Refraction** | `backdrop-filter: url(#svg-filter)`. An SVG `feDisplacementMap` driven by a map drawn from the shape's signed distance. The rim bends the backdrop inward like a convex bevel; the middle magnifies very slightly. | bevel = 36% of the short side (8–30 px), displacement scale ≈ 2.1 × bevel (max 64 px) |
| 2 | **Colour split** | Three displacement passes, red at 100%, green 93%, blue 86%, recombined with `feBlend screen`. A faint prism fringe on the rim, the thing that makes it read as glass and not plastic. | off on phones and low-power machines |
| 3 | **Frost** | `blur()` + `saturate()` + `brightness(1.04)` behind a thin tint of your light colour. | regular: 12 px, sat 1.8, tint 16%. clear: 2 px, tint 4%. cards that carry text: 20–26 px, tint 50–80% |
| 4 | **Specular edge** | inset box-shadows: a 1.5 px glint top-left, a weaker counter-glint bottom-right, a 0.5 px hairline, plus a 1 px conic rim (`::before`, masked to a ring) that follows the pointer. | glint white 78%, counter 34%, hairline 26% |
| 5 | **Depth** | an inner glow (thickness) and a soft shadow tinted with your dark colour. Never a hard black drop shadow. | `inset 0 0 22px -8px #fff8`, `0 14px 34px -14px <c2 38%>` |

Press state: `scale(.965)` and the sheen brightens at the touch point. Expo-out, 460 ms. No bounce, no overshoot, no blur-in.

## 2. Step by step

1. **Pick the backdrop first.** Glass needs something to bend: a photograph, video, a 3D scene, a rich gradient mesh. Real assets only (CC0 / CC-BY, credited). The example uses two CC0 photos from Wikimedia Commons.
2. **Set your 3 colours** on `:root` (or any ancestor): `--c1` light (warm paper, not pure white), `--c2` dark (a coloured dark, not black), `--c3` accent (one job: the main action). The glass tints, text and shadows all derive from these.
3. **Mark up** with the parts below. Use real `<button>`, `<a>`, `<dialog>`, `<input type="range">` so keyboard and screen readers work without extra code.
4. **Choose a variant per backdrop**: `.lg` regular for most chrome, `.lg--clear` over very busy imagery with large type, `.lg--dark` over bright areas, `.lg--accent` for the one main action.
5. **Check contrast** (section 4). Raise `--lg-alpha` or switch variant until every label is 4.5:1.
6. **Mark floating bars** with `data-lg-adapt` and flat sections with `data-lg-backdrop="paper"` (or `"ink"`), so bars frost up when they pass over flat colour.
7. **Run the checklist** (`checklist.md`) at 1440×900, 390×844 and 360×740, with reduced motion on and off.

## 3. The parts

```html
<!-- nav pill -->
<nav class="lg lg-nav" data-lg-adapt><a href="#">Today</a><a href="#">Tides</a><button class="lg lg-btn lg--accent">Join</button></nav>

<!-- buttons -->
<button class="lg lg-btn lg--accent">Primary</button>
<button class="lg lg-btn">Regular</button>
<button class="lg lg-btn lg--clear">Clear</button>
<button class="lg lg-btn lg--dark">Dark</button>
<button class="lg lg-btn lg-btn--icon" aria-label="Add"><svg>…</svg></button>

<!-- card (no refraction by default: big blurred areas are expensive) -->
<article class="lg lg-card">…</article>

<!-- segmented control: aria-pressed on the active button; JS adds the sliding lens -->
<div class="lg lg-seg" aria-label="Range"><button aria-pressed="true">Day</button><button>Week</button><button>Month</button></div>

<!-- switch -->
<button class="lg-switch" aria-checked="true" aria-label="Swell alerts"></button>

<!-- slider: a native range on top (accessible), glass thumb drawn under it -->
<div class="lg-slider"><input type="range" min="0" max="100" value="40" aria-label="Volume"></div>

<!-- sheet: any element with data-lg-open="id" opens it; Esc, tap outside or [data-lg-close] closes -->
<button class="lg lg-btn" data-lg-open="add">Add</button>
<dialog class="lg lg-sheet" id="add">… <button data-lg-close>Done</button></dialog>
<!-- phones: add lg-sheet--bottom for a bottom sheet, and a <div class="lg-grabber"></div> -->

<!-- phone tab bar: role=tablist, aria-selected on the active tab -->
<nav class="lg lg-tabbar" role="tablist" data-lg-adapt><button aria-selected="true"><svg>…</svg>Today</button>…</nav>

<!-- tooltip: hover, keyboard focus AND tap -->
<button class="lg lg-btn lg-btn--icon" data-lg-tip="Wind 14 kn" aria-label="Wind 14 knots"><svg>…</svg></button>
```

Events: every segmented control, tab bar and switch fires `lg:change` (`detail.index` / `detail.value` / `detail.checked`).
JS API: `LiquidGlass.refresh()` after you add glass to the page, `LiquidGlass.openSheet(el)`, `LiquidGlass.closeSheet(el)`,
`LiquidGlass.supportsRefraction`.

Tokens (all optional): `--lg-alpha` tint strength, `--lg-blur`, `--lg-sat`, `--lg-radius`, `--lg-tint`, `--lg-ink`, `--lg-blur-lite` (phones), `--lg-alpha-paper` (adaptive frost).
Per element: `data-lg-refract="off|on"`, `data-lg-strength="0..1.6"`, `data-lg-chroma="off"`, `data-lg-tip-pos="below"`.

## 4. Contrast: text on glass

Glass changes with whatever is behind it, so contrast is checked against the worst backdrop the element can sit on, not the nicest.

- Body text and labels on glass: **4.5:1** minimum. Large text (24 px+, or 19 px bold): 3:1.
- Regular glass over a photo: start at `--lg-alpha: .5–.62` and `--lg-blur: 20–24px` for any card that carries text (the example's widgets). Nav pills with short labels can stay thinner (`.3`).
- Over bright areas switch to `.lg--dark` (light text). Over flat paper, floating bars use `data-lg-adapt` and frost up to 74%.
- `.lg--clear` is for large type or icons over busy imagery only; give it light text and a dim scrim behind if needed.
- Accent buttons: put the dark colour on the accent, not white, unless white passes (the example: `#0A2F3A` on `#EC7E46` = 5.16:1).
- Test it: screenshot each state, sample the text and the 10th/90th percentile of the box behind it, or use the QA harness skill.

## 5. Performance

Every blurred layer is an offscreen pass the GPU redraws whenever anything under it moves.

- **Budget** (a working rule from building the Zyqor sites, not a lab benchmark): about 6–8 blurred layers on screen at once on a laptop, 3–4 on a phone. Count the nav, the tab bar and each visible card.
- Refraction runs on small controls only on phones and machines with 4 cores / 4 GB or less (area under 90,000 px²), and without the colour split.
- Big surfaces (cards, sheets) do not refract unless you ask (`data-lg-refract="on"`). Their blur alone carries them.
- Never animate `backdrop-filter` values or blur radius. Animate `transform` and `opacity` only.
- Filters are cached per size and rebuilt by a `ResizeObserver`; avoid resizing glass every frame (animating `width` on a refracting element rebuilds its map; the segmented lens is small enough to be fine).
- Do not put glass on every row of a long scrolling list.

## 6. Fallbacks (built in)

| Situation | What happens |
|---|---|
| Chrome / Edge / Opera desktop | full material + refraction + colour split |
| Chrome on Android | full material, refraction on small controls, no colour split |
| Safari (macOS and iOS), every iPhone browser, Firefox | frosted material with rim, glints, hairline and depth; no refraction (WebKit and Gecko do not render SVG filters in `backdrop-filter`) |
| No `backdrop-filter` at all | tint raised to 88% so text still reads |
| `prefers-reduced-transparency` (or `?lg=solid`) | solid surfaces in your palette |
| `prefers-contrast: more` | stronger tint and a real outline |
| `forced-colors` | system colours and a border, decorations off |
| `prefers-reduced-motion` | no pointer light, no sliding, no rise; state changes are instant |
| `?lg=flat` in the URL | refraction off, for comparing |

## 7. Pitfalls we hit building portfolio v3

- **Bounce.** The v3 press curve overshot (`cubic-bezier(.3,1.5,.5,1)`). Sujon's rule is fast, smooth, no bounce: expo-out only.
- **Glass on reading text.** A glazed side rail over body copy turned into a blob. Glass is for chrome and controls.
- **Backdrop root.** An element with `backdrop-filter` becomes the backdrop for its children: a glass child inside a glass parent only sees the parent, not the photo. That is why the segmented lens and the switch thumb look right (they bend the control under them) and why a glass tooltip needs a higher tint.
- **Engine sniffing by `window.chrome`.** Headless and some embedded Chromium builds lack it. Detect Blink with `navigator.userAgentData` or the `Chrome/` token, and exclude every iOS browser.
- **Hover-only.** Tooltips also open on keyboard focus and tap; every hover effect has a visible non-hover state.
- **Glass over flat colour.** Nothing to refract, so it reads as a grey box; add the rim and depth, or give the section a real image.

## 7b. Pitfalls we hit building this kit

- **A closed tooltip still widens a phone page.** An absolutely positioned tip with `opacity:0` counts toward scroll width; on a phone the layout viewport grows to fit it and every centred fixed bar drifts right (found on the starter at 390 px: page 474 px wide). Closed tips are `display:none`; the fade survives through `transition-behavior: allow-discrete` and `@starting-style`.
- **A scrim with the same z-index as the photo paints under it.** `::before` comes first in tree order, so a `z-index:-1` scrim lies beneath a `z-index:-1` photo and does nothing. Photo at `-2`, scrim at `-1`. Check with a pixel probe, not by eye.
- **Measure contrast on pixels, not on paper.** The example's labels were checked by screenshotting the backdrop behind each label (text hidden) and taking the worst of its 10th/90th percentile luminance against the text colour. Computed colours in `color-mix()` come back as `oklab(...)`; convert them through a canvas before you compute a ratio.

## 8. Files

```
kit/liquid-glass.css      the material and all parts (15 KB, 4.4 KB gzip)
kit/liquid-glass.js       refraction, pointer light, parts behaviour (17 KB, 6.0 KB gzip)
example/index.html        desktop demo (Shoal, a concept app) over two CC0 photos
example/m.html            phone build: same photos, same kit, phone layout + tab bar + bottom sheet
example/scene.html        glass over a live three.js scene (CC0 glass vase + CC0 studio HDRI, transmission capsule)
example/scene-m.html      the same scene, phone build, same model and HDRI
screenshots/              our own screenshots of the examples (used in README)
starter/index.html        the smallest page that uses every part, to copy from
checklist.md              what "done" means
```
