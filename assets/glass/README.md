# Zyqor liquid glass v1

One shared glass material for every Zyqor Studio screen. Frosted, refractive, light-catching surfaces in the spirit of
2025-era "liquid glass" UI, tuned to the Ivory #F3EDE1 / Pine #17423C / Ochre #B5832F shell and tinting itself per Lab demo.

## Files
| file | what | size |
|---|---|---|
| `liquid-glass.css` | the material + variants + fallbacks (required) | ~8 KB (~2.3 KB gz) |
| `liquid-glass.js` | optional enhancer: edge refraction, pointer/scroll specular, selector map | ~9 KB (~3.4 KB gz) |
| `glass-home.css` | layout bindings for `index.html` and `m/index.html` only | ~3 KB |
| `glass-lab.css` | bindings for the Lab chrome (`_kit/chrome.js` v2) | ~1.3 KB |

## Use on any page
```html
<link rel="stylesheet" href="/assets/glass/liquid-glass.css">   <!-- adjust the relative path -->
<script src="/assets/glass/liquid-glass.js" defer></script>
<a class="lg lg-btn lg--accent" href="#contact">Start a project</a>
```

| class | for |
|---|---|
| `lg` | the material itself (always add it) |
| `lg-pill` / `lg-round` | capsules (nav, chips) / circular buttons |
| `lg-btn` | pressable: spring lift on hover, liquid squash on press |
| `lg-card` | tiles and panels (bigger blur, no refraction unless `lg-refract`) |
| `lg-menu` | menus, sheets, modals (strongest frost) |
| `lg-seg` | mode switches; its child with `aria-pressed="true"`, `aria-selected="true"`, `.is-active` or `.on` gets a brighter inner lens |
| `lg-dock` | phone bottom bars |
| `lg-rim` | adds a conic gradient rim that turns with the light (uses `::after`; skip on elements whose `::after` is taken) |
| `lg--dark` | ink glass for dark sections and night modes |
| `lg--accent` | tinted CTA glass (accent darkened so ivory text stays at least 4.5:1) |
| `lg--ink` | near-solid Pine CTA glass |
| `lg--clear` | thin, more transparent |
| `lg-refract` | force edge refraction on an element that would not get it by default |
| `data-lg-flat` (attribute, on any ancestor) | turn refraction off inside it |

### Tokens (set on any ancestor; all optional)
`--lg-tint` (surface colour, default `var(--c1)` then Ivory), `--lg-ink` (depth/shadow, default `var(--c2)` then Pine),
`--lg-accent` (default `var(--c3)` then Ochre), `--lg-alpha`, `--lg-blur`, `--lg-sat`, `--lg-radius`, `--lg-alpha-dark`,
`--lg-alpha-accent`, `--lg-blur-lite` (phone blur). Lab demos already define `--c1/--c2/--c3`, so the glass picks up each
demo's own palette with no extra work.

### Pages whose markup you do not own: the selector map
```html
<script type="application/json" id="lg-map">{".site-nav":"lg lg-pill", ".buy":"lg lg-btn lg--accent"}</script>
<script src=".../liquid-glass.js" defer></script>
```
or `ZyqorGlass.map({...})` at runtime. The map is re-applied on each scan, so nodes built later by JS are picked up.
`ZyqorGlass.refresh()` re-scans after you add glass elements yourself.

## How it behaves
* Desktop (fine pointer, wide screen): `backdrop-filter: blur + saturate + brightness`, rim light (inset highlights), bottom
  depth, soft two-layer shadow, a specular highlight that follows the cursor (`--lg-x/--lg-y/--lg-hl`, rAF-throttled, only for
  glass in view) and a rim angle that swings with scroll (`--lg-a`).
* Edge refraction (Chromium desktop only): the JS draws a per-size displacement map (a rounded-rect lens profile) on a
  canvas, wraps it in an SVG `feDisplacementMap` filter and feeds it to `backdrop-filter: url(#…)`. The flat centre stays
  clear; only the rim bends what is behind it. Filters are cached by size; a ResizeObserver keeps them in step.
  Safari/Firefox simply get the frosted material.
* Phone (`html.lg-lite`: coarse pointer, width <= 860, `data-build="m"` or `body.is-mobile`): 10 px blur, no refraction, no
  pointer work, no scroll listener. Only the static rim and specular.
* No `backdrop-filter`: a near-opaque tinted surface with the same rim.
* `prefers-reduced-transparency: reduce`: opaque surface (also `html.lg-solid`).
* `prefers-reduced-motion: reduce`: no transitions, no pointer/scroll light, no press squash, no refraction.
* `forced-colors`: system colours with a 1 px border.
* The material owns `background`, `backdrop-filter` and `box-shadow` (with `!important`, so it wins over older page rules);
  layout, padding, colour and type stay the page's own.

## Contrast (WCAG AA)
Text-bearing glass defaults to 60-64 % tint, accent glass to 93 % of a darkened accent (ivory text ≈ 5:1),
dark/ink glass carries ivory text. Over busy imagery prefer `lg-pill`/`lg-menu` (higher alpha) to `lg--clear`.
