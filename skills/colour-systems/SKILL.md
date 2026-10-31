---
name: colour-systems
description: Build a premium 3-colour palette (canvas, ink, accent) that never reads as "AI": one seed hue, OKLCH maths, fixed jobs for every colour, WCAG contrast checked by a script, warm paper instead of white, coloured deeps instead of black, no purple, no neon, no decorative gradients. Includes a palette generator/checker (scripts/palette.mjs), a live playground (examples/index.html), worked palettes, desktop wide-gamut rules and phone parity.
when_to_use: "pick colours for this site", "make it look premium", "the palette feels cheap / AI", "dark mode", before any design token is written, when reviewing someone's colours, when a client gives a brand colour
license: MIT (text and code). Sources credited in CREDITS.md.
version: 1.0.0
---

# Colour systems for premium websites

Colour is the first thing a visitor judges and the fastest way a site starts to look like every other
AI-made page. Purple-to-blue gradients on slate, neon lime on near-black, pure white with grey cards: those are
the defaults of tools, not choices. A premium palette is **small, deliberate and boring to describe**:
three colours, each with one job, checked for contrast, the same on a 27-inch monitor and a 360px phone.

This skill gives an agent a procedure, numbers and a script. Follow it in order.

```
brand / idea  ->  seed hue  ->  canvas + ink + accent (OKLCH)  ->  derived tints  ->  palette.mjs check  ->  tokens  ->  page QA
```

Quick start (Node 18+, no install):

```bash
node scripts/palette.mjs --seed 170 --mode light --css          # palette from one hue, printed as CSS tokens
node scripts/palette.mjs --seed 25 --mode deep                  # same method, coloured deep canvas
node scripts/palette.mjs --check "#F3EDE1,#17423C,#8F6420"      # check an existing palette (canvas, ink, accent); exit 1 on FAIL
```

Open `examples/index.html` through any static server to try hues live and see each check pass or fail.

---

## 0. Desktop first, no compromise (read this before anything else)

Zyqor Studio's rule (Sujon, 30 Oct 2026): *"PC me no compromise, ek dam best."* The desktop is the top bar.
For colour that means:

1. **Use the full gamut the screen has.** Most desktop monitors sold since 2020 and every Apple laptop show Display P3.
   Write the palette in `oklch()` (CSS Color 4, supported in every current engine) and let the browser map it. For the
   accent, you may push chroma a little higher inside `@media (color-gamut: p3)`; sRGB screens get the clipped value.
2. **Grain on, at full resolution.** The film-grain overlay (section 7) that removes gradient banding costs nothing and
   is never switched off on desktop.
3. **Theme inversions and colour floods animate.** A chapter that flips canvas and ink (section 8) or a variant switch
   that floods the page with a new colour animates on desktop (600 ms, `cubic-bezier(.65,0,.35,1)`).
4. **Never desaturate or flatten colour "for performance".** Colour costs no performance. If something is slow, it is
   not the palette.

### Phone parity (after desktop is right)

- **Same palette, same tokens, same grain.** The phone is not a second brand. One `:root` block serves both.
- `<meta name="theme-color" content="(your canvas)">` so the browser bar matches the canvas on Android and iOS Safari.
- Re-check contrast **outdoors**: phones are read in daylight. Body text below 7:1 on a phone is the first thing that
  fails in the sun; aim for 7:1 (the script's "goal" column) wherever the design allows.
- Colour floods and inversions still animate on phone; under `prefers-reduced-motion` they switch instantly.

---

## 1. The rules (each with its reason)

| # | Rule | Why |
|---|---|---|
| R1 | **Three colours per site.** Canvas, ink, accent. Everything else is a tint or alpha of those three. | Sujon, 27 Oct 2026: *"Ek website par 3 colour sabse best lagta hai."* Award palettes are smaller than client palettes, not bigger (measured on 20 Awwwards winners, see `docs/how-top-designers-build-unique-sites.md`). |
| R2 | **Every colour has a fixed job.** Canvas = background (about 60%), ink = text, rules and dark surfaces (about 30%), accent = primary CTA, active state, focus ring, live dot, `::selection` (small). | His checklist: *"Har color ka purpose fixed ho."* When a colour has two jobs the eye cannot learn what it means. |
| R3 | **The accent is rare.** Aim for 1-5% of any screen, never more than 10%. | Master Award System §2: 60 / 30 / 9 / 1. Rarity is what makes it read as "the thing to press". |
| R4 | **No black.** A dark canvas must read as a colour: deep pine, oxblood, ink blue, olive, at OKLCH lightness 0.26-0.34 with chroma 0.04 or more. | Sujon, 27 Oct 2026: *"no black and purple, ye sab AI-feel colour hai."* `#070709`-style "obsidian" is the default dark of every generator. |
| R5 | **No purple or violet** (OKLCH hue roughly 275-335 with visible chroma). | Same rule. Indigo `#6366F1` to violet `#A855F7` on slate `#0F172A` is the single most recognisable AI palette (Master Award System §1 bans it by hex). |
| R6 | **No neon.** Nothing with very high chroma at high lightness (lime `#E2FF32`, cyan `#00F0FF`, volt `#CCFF00`). | His 30-item avoid list: "neon colors". Neon on dark is a template look and vibrates on phones. |
| R7 | **No decorative gradients.** No rainbow, no two-hue blobs, no gradient text, no radial "orb" glows. A gradient is allowed only as **light** (a scrim behind copy, a lighting falloff inside a photo or 3D scene) in one hue. | Avoid list: "harsh gradients", "rainbow coloring", "radial orbs". |
| R8 | **No pure white canvas.** Use warm paper: `#F5F2EB`, `#F4F0EA`, `#F6F3EC`, `#F3EDE1`. Pure `#FFFFFF` is allowed only for small highlights. | Avoid list: "pure white background". Paper reads as printed and expensive; white reads as an empty document. |
| R9 | **Never pure white text on a dark canvas.** Use about 96% (e.g. `#F4F1EA` or a tint of the canvas hue). | Master Award System §2: off-white prevents halation (glow) around letters on dark screens. |
| R10 | **No drop shadows for depth.** Separate surfaces with a 1px hairline in ink at 7-12% alpha, plus an inset top highlight. | Avoid list: "drop shadows". Shadows are what a UI kit adds by default; hairlines are what print designers use. |
| R11 | **No colour-only meaning.** Every state shown by colour is also shown by text, an icon or a shape. | WCAG 1.4.1; 8% of men have a colour-vision deficiency. |
| R12 | **Contrast is measured, not eyeballed.** Body text 4.5:1 minimum, 7:1 goal; large text (24px, or 18.66px bold) and UI shapes 3:1 minimum. | WCAG 2.2 SC 1.4.3, 1.4.6, 1.4.11. The script measures it. |
| R13 | **A style the client chose wins.** If a project's named style needs something on this list (a client's own purple logo), keep it to the logo and build the three colours around it. | His Drive rule: *"Agar maine kisi project ke liye aisa style khud chuna jo list se takrata hai... wahi chalega."* |

---

## 2. Decision rules: choosing the three colours

### 2.1 Light canvas or deep canvas?

| Choose LIGHT (warm paper) when... | Choose DEEP (coloured dark) when... |
|---|---|
| The product is physical, crafted, food, beauty, real estate, education, services | The product is a performance, night, sound, cinema, a lit 3D object that needs a dark stage |
| Long reading (articles, menus, case studies) | Short, image-led pages, a single hero object |
| The photos are bright and airy | The 3D model or photo has strong highlights that glow on dark |
| You need maximum trust from older users | The brand already lives at night (bar, club, observatory) |

Default when unsure: **light**. It is easier to make premium, and harder to make look AI.

### 2.2 Where the seed hue comes from (in this order)

1. **The client's real brand colour**, if one exists. Never dump it raw onto large backgrounds (Master Award System §2):
   use its hue for the ink or the deep canvas, and let the generator set lightness and chroma.
2. **The hero object or photo.** Sample the material that carries the idea (the brass of a deck, the pine of a cabin,
   the terracotta of a pot). The palette then belongs to the product, which is the point.
3. **The industry row** in section 5, as a starting point only.

### 2.3 Where the accent hue goes

| `--accent` mode | Hue offset | Feels | Use for |
|---|---|---|---|
| `complement` | +180 | confident, high energy | sport, food, events, one loud CTA |
| `split` | +150 | lively but softer | services, education, hospitality |
| `analogous` | +35 | calm, luxury, quiet | spa, jewellery, architecture, law |
| a number | that hue | brand-driven | when the client's colour is the accent |

The script refuses purple hues: an offset that lands in 275-335 is moved to the nearest blue (262) or rose (345).

### 2.4 What to do with a fourth colour someone asks for

Say no, then offer one of these instead: a tint of the ink (secondary text, `--c-muted`), a lighter or darker step of
the canvas (`--c-surface`), or the accent at reduced alpha for a background wash behind one element. Semantic colours
(error, success) are allowed only as text and a small icon, desaturated (OKLCH chroma 0.10 or less), never as panels.

---

## 3. Procedure (step by step)

1. **Write the palette sentence** before any hex: *"Warm paper, deep pine ink, one ochre accent for the call to action."*
   If you cannot say it in one sentence, you have more than three colours.
2. **Pick the seed** (section 2.2) and the mode (2.1).
3. **Generate**: `node scripts/palette.mjs --seed <hue> --mode light|deep --accent <mode> --css`.
4. **Read the report.** Every row must say PASS or OK; any FAIL or banned flag means change the input, not the rule.
   Re-run with a different accent mode or seed until the verdict is PASS.
5. **Hand-tune at most two values** by eye (for example a warmer paper), then run `--check "canvas,ink,accent"` again.
6. **Paste the CSS tokens** into the site's single `:root` block. Name them by job, never by hue
   (`--c-accent`, not `--orange`), so a re-brand is a three-line change.
7. **Apply by role** (section 4). Search the code for any raw hex outside `:root`; there should be none.
8. **Add grain** (section 7) and `::selection`.
9. **Check the page, not the swatches**: screenshot at 1440 and 390, look at the hero, a text section and the footer.
   Count accent pixels: if the accent is the first thing you see in a non-CTA area, it is overused.
10. **Run the pre-ship checklist** (section 11).

---

## 4. Tokens and how each role is applied

```css
/* Paste the block printed by: node scripts/palette.mjs --seed 170 --mode light --css */
:root{
  --c-canvas:#F7EFE5;      /* page background */
  --c-ink:#093F31;         /* text, rules, deep sections */
  --c-accent:#A4517B;      /* primary CTA, focus ring, active state, ::selection */
  --c-muted:#496F62;       /* secondary text, >= 4.5:1 on canvas */
  --c-surface:#EFE9DF;     /* raised panel */
  --c-hairline:#093F3117;  /* 1px borders */
  --c-on-accent:#F7EFE5;   /* label colour on the accent */
}
html{background:var(--c-canvas);color:var(--c-ink);color-scheme:light}
::selection{background:var(--c-accent);color:var(--c-on-accent)}
:focus-visible{outline:2px solid var(--c-accent);outline-offset:3px}
.btn-primary{background:var(--c-accent);color:var(--c-on-accent)}
.btn-secondary{background:transparent;color:var(--c-ink);box-shadow:inset 0 0 0 1px var(--c-ink)}
.panel{background:var(--c-surface);border:1px solid var(--c-hairline);
       box-shadow:inset 0 1px 0 rgba(255,255,255,.65)} /* top highlight, not a drop shadow */
.section--deep{background:var(--c-ink);color:var(--c-canvas)} /* inversion: the deep colour is the ink, never black */
```

Role map, so nobody has to guess:

| Element | Colour | Notes |
|---|---|---|
| Page background | canvas | 60% of the screen |
| Headlines, body text | ink | body 16-18px needs 4.5:1, aim for 7:1 |
| Captions, meta, labels | muted | must still clear 4.5:1 (the script guarantees it) |
| Hairlines, dividers, table rules | hairline (ink at 9-12% alpha) | replaces drop shadows |
| Raised panels, inputs | surface | one step away from canvas, never white |
| Primary button | accent fill, on-accent label | the only filled button on a screen |
| Secondary button | ink outline, transparent fill | never a second accent |
| Links in body text | ink with underline, accent on hover | underline is the non-colour cue (R11) |
| Focus ring | accent, 2px, offset 3px | 3:1 against what is behind it |
| Active tab / toggle / live dot | accent | small areas only |
| Deep chapter / footer | ink as background, canvas as text | the deep colour comes from the palette |
| Error | text + icon, desaturated red-brown (chroma 0.10 or less) | never a red panel |
| Success | ink text + a check-free shape or word ("Sent") | his avoid list bans checkmark bullets |

### Wide gamut on desktop (optional, section 0 rule 1)

```css
:root{ --c-accent: #A4517B; }
@supports (color: oklch(0 0 0)){
  :root{ --c-accent: oklch(0.55 0.12 352); }          /* same colour, exact */
}
@media (color-gamut: p3){
  :root{ --c-accent: oklch(0.55 0.15 352); }          /* a little more chroma where the screen can show it */
}
```

Re-run the contrast check with the P3 value converted to its sRGB fallback; lightness is unchanged, so contrast is too.

---

## 5. Worked palettes (all pass `palette.mjs --check`, verified Oct 30 2026)

These are starting points. Each project still gets its own three.

| Name | Canvas | Ink | Accent | Feels | From |
|---|---|---|---|---|---|
| Zyqor portfolio | `#F3EDE1` ivory | `#17423C` pine | `#8C611C` ochre | crafted, calm | the live portfolio; its accent `#8F6420` measured **4.49:1** as a label colour (fails 4.5 by 0.01), the script's FIX is `#8C611C` |
| Travertine (real estate, interiors) | `#F4F0EA` | `#2A2622` | `#866740` bronze | quiet luxury | Master Award System §4 row (`#8C6D46`), darkened by the script's FIX to pass 4.5:1 |
| Cashmere (skincare, spa) | `#F8F4F0` | `#2E3A31` | `#4A5D4E` sage, or `#9E5E54` clay | soft, natural | §4 (rose clay `#C88D83`), clay darkened to pass 4.5:1 |
| Porcelain (health) | `#F6F9F8` | `#123532` | `#0B7D73` teal | clean, clinical without blue-white | §4 |
| Silk (jewellery, luxury) | `#F6F3EC` | `#2B2620` | `#886816` old gold | warm, expensive | §4 "champagne" `#D4AF37` measured 1.90:1 on this paper (fails even as a shape), so the hue was kept and darkened |
| Terracotta (dining) | `#F5EEE4` | `#3A2418` | `#B14D1A` | appetite | §4 dining accent on paper, not on "smoked truffle" black |
| Oxblood night (bar, music) | `#462220` | `#FAEBE6` | `#5ED1DE` | night, sound | `palette.mjs --seed 25 --mode deep` |
| Deep ocean (studio, tech) | `#043440` | `#E3F1F8` | `#FD9FAD` | cool, confident | `--seed 220 --mode deep --accent split` |

Rows from the Drive that were **not** adopted, because they break the rules above: "Tinted Obsidian" canvases
(`#070709`, `#06080E`...), Acid Lime `#E2FF32`, Safety Volt `#CCFF00`, Cyber Cyan `#00F0FF` + Plasma `#7000FF`,
Electric Indigo `#6366F1`.

Run them yourself to see why:

```bash
node scripts/palette.mjs --check "#070709,#F4F4F6,#E2FF32"   # FAIL: canvas reads as black, accent is neon
node scripts/palette.mjs --check "#0F172A,#FFFFFF,#6366F1"   # FAIL: purple accent, label below 4.5:1
```

---

## 6. Deep (dark) palettes done properly

1. The canvas is a **colour at low lightness**, OKLCH L 0.26-0.34, C 0.04-0.07. Test: describe it without the word
   "black". If you can only say "dark", raise the chroma.
2. Text is a **tint of the canvas hue** at L 0.93-0.96 (never `#FFFFFF`, R9).
3. Body text sits in muted ink at 4.5:1 or more; the script finds the exact mix.
4. Surfaces get **lighter**, not darker, as they come forward (mix 5% white into the canvas per step).
5. Hairlines are ink at about 12% alpha (`#FAEBE61F`), plus an inset top highlight at 6-12% white.
6. The accent goes **lighter and a little less saturated** than it would on paper (L 0.75-0.82, C 0.09-0.12), which
   keeps it from vibrating.
7. A lit 3D object is the best friend of a deep canvas: let the scene's own light do the glowing, never a CSS orb.

`color-scheme: dark` on `html` so form controls and scrollbars follow.

---

## 7. Film grain (kills banding, adds a printed finish)

Large flat areas and soft lighting falloffs band on 8-bit screens. A static noise overlay at 2-3% opacity hides the
steps and makes the surface feel physical. It is one fixed layer with no animation, so it costs nothing on a phone.

```html
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/></filter>
</svg>
<div class="grain" aria-hidden="true"></div>
```

```css
.grain{position:fixed;inset:-50%;width:200%;height:200%;pointer-events:none;z-index:100;opacity:.028}
.grain::before{content:"";position:absolute;inset:0;filter:url(#grain)}
/* Some engines render an empty element with a filter as nothing: give it paint */
.grain::before{background:#808080;mix-blend-mode:multiply}
```

Numbers from the Drive (Master Award System §2 Step 5): `baseFrequency 0.8`, 3 octaves, opacity 0.028. On a deep
canvas use `mix-blend-mode: screen` and 0.035. Never animate grain (it becomes a loop, and loops are off by default).

---

## 8. Theme inversion as a chapter break

Switching canvas and ink when the visitor scrolls into the flagship section is a strong, cheap chapter marker
(Master Award System Structure 07: 600 ms).

```css
body{background:var(--c-canvas);color:var(--c-ink);transition:background-color .6s cubic-bezier(.65,0,.35,1),color .6s cubic-bezier(.65,0,.35,1)}
body.is-inverted{background:var(--c-ink);color:var(--c-canvas)}
@media (prefers-reduced-motion: reduce){body{transition:none}}
```

```js
// Invert while the flagship section covers the middle of the viewport.
const flagship = document.querySelector('[data-invert]');
if (flagship) new IntersectionObserver(([e]) => document.body.classList.toggle('is-inverted', e.isIntersecting),
  { rootMargin: '-45% 0px -45% 0px' }).observe(flagship);
```

Rules: invert at most twice per page; the inverted side is the palette's ink (a colour), never black; check the
accent against both canvas and ink (`palette.mjs --check "ink,canvas,accent"`).

---

## 9. Colour flood on a variant switch (the ayzz "colourway morph")

The technique credited to @ayzz.thedesigner in the study doc (pattern A): switching a product variant changes the
product **and** floods background, headline and button with the variant's colour. Each variant is its own checked
3-colour palette; the switch interpolates the tokens.

```css
@property --c-canvas{syntax:'<color>';inherits:true;initial-value:#F7EFE5}
@property --c-ink{syntax:'<color>';inherits:true;initial-value:#093F31}
@property --c-accent{syntax:'<color>';inherits:true;initial-value:#A4517B}
:root{transition:--c-canvas .7s cubic-bezier(.16,1,.3,1),--c-ink .7s cubic-bezier(.16,1,.3,1),--c-accent .7s cubic-bezier(.16,1,.3,1)}
@media (prefers-reduced-motion: reduce){:root{transition:none}}
```

```js
const variants = { sage:['#F8F4F0','#2E3A31','#4A5D4E'], clay:['#F5EEE4','#3A2418','#B4501E'] };
function setVariant(name){ const [c,i,a] = variants[name]; const s = document.documentElement.style;
  s.setProperty('--c-canvas', c); s.setProperty('--c-ink', i); s.setProperty('--c-accent', a); }
```

`@property` makes custom properties animatable (supported in Chrome, Edge, Safari 16.4+, Firefox 128+); where it is
missing the colours switch instantly, which is an acceptable fallback.

---

## 10. Do and don't

| Do | Because |
|---|---|
| Name tokens by job (`--c-accent`) | a re-brand is three lines |
| Keep every hex inside `:root` | one source of truth; the check script can read it |
| Darken the accent until labels pass 4.5:1 | buttons are text; text needs 4.5:1 |
| Sample the hero material for the seed | the palette then belongs to the product |
| Use alpha of the ink for hairlines | borders stay in the family on any background |
| Put grain on every large flat area | banding is the cheapest tell of a digital page |

| Don't | Because |
|---|---|
| Add a fourth hue for "variety" | the eye stops knowing what the accent means |
| Use `#000`, `#111`, `#0F172A` as a canvas | reads as black / Tailwind default (R4, C10) |
| Put the accent on headlines and icons too | it stops meaning "press here" (R3) |
| Use a gradient to make a flat design "pop" | the flat design needs better type or a real image, not a gradient |
| Pick colours in HSL and trust the lightness | HSL lightness is not perceptual: yellow at 50% is far brighter than blue at 50%; OKLCH fixes that |
| Rely on a red border alone for errors | colour-only meaning fails WCAG 1.4.1 |
| Copy a reference site's exact palette | take the method, not the colours (his Drive: "take the grammar, never the content") |

---

## 11. Tiers: normal vs advanced vs premium

| | NORMAL ($300 tier) | ADVANCED ($1k tier) | PREMIUM ($10k tier) |
|---|---|---|---|
| Palette | 3 colours from the generator, light canvas | 3 colours, light or deep, hand-tuned | 3 colours per variant / chapter, hand-tuned, P3 accent on desktop |
| Contrast | all checks PASS or OK | body text at 7:1 goal | 7:1 body, every state checked on both canvas and ink |
| Grain | yes | yes | yes, tuned per canvas (multiply on paper, screen on deep) |
| Inversion | optional, once | one chapter inversion | inversions and a colour flood on variant switch |
| Colour in 3D | n/a or one model | model materials pick up the palette (accent in one part) | lighting, HDRI tint and materials graded to the palette; DOM and scene share one light direction |
| Proof | `palette.mjs` output pasted in NOTES | + screenshots at 1440 / 390 | + outdoor phone check, P3 vs sRGB screenshots |

---

## 12. Pre-ship checklist

- [ ] The palette sentence is written in the project notes.
- [ ] Exactly three hues; every other colour is a tint or alpha of them.
- [ ] `node scripts/palette.mjs --check "canvas,ink,accent"` prints VERDICT PASS (output saved in the notes).
- [ ] No banned colours: `grep -Eio "#(000|000000|0f172a|6366f1|a855f7|7000ff|e2ff32|ccff00|00f0ff|fff|ffffff)\b" -r css/` finds nothing outside an explicitly allowed highlight.
- [ ] No `linear-gradient`/`radial-gradient` except scrims and lighting in one hue (`grep -n gradient`).
- [ ] No `box-shadow` used for elevation (inset highlights and focus rings are fine).
- [ ] All raw hex values live in `:root`.
- [ ] `::selection`, `:focus-visible` and `theme-color` use the palette.
- [ ] Grain overlay present, static, `pointer-events:none`.
- [ ] Accent covers a small share of every screenshot (1440 and 390) and appears where the eye should go first.
- [ ] Every state shown by colour also has text or a shape.
- [ ] Desktop: P3 accent (if used) checked; phone: same tokens, read once in daylight.

---

## 13. Files in this skill

| File | What |
|---|---|
| `scripts/palette.mjs` | generator + checker (OKLCH, gamut mapping, WCAG contrast, banned-colour flags, CSS output, exit code for CI). Also importable as an ES module in the browser. |
| `examples/index.html` | live playground: hue slider, mode and accent switch, contrast table, a sample page section, grain, a chapter inversion. Runs the same module, plus self-tests (`window.__skillTest`). |
| `CREDITS.md` | sources |

## Dark page → cream page with coloured panels (P017 Tapehead, Oct 31 2026)

The audit asked for "cream page, walnut only for panels" on a page whose tokens were inverted (`--c1` cream used as type, `--c2` walnut as the page). Changing the page from dark to light by recolouring every rule takes hours. What worked in minutes was one appended block at the end of the page CSS (both `style.css` and `m.css`):
- `body` → cream gradient #FAF5EC → #F2EBDD → #EADFCB, type → walnut-ink #3E2A20 (dark text is fine, dark backgrounds are not);
- every heading or label that used `--c1` gets the ink colour, and secondary text gets `color-mix(in oklab, ink 76%, cream)`;
- the accent that was mustard on dark moves to tape red on cream (mustard #E5C61A on cream fails contrast), and mustard stays inside the walnut panels;
- the panels (deck controls, the stats card) get the old dark: walnut #6B3E2E with cream type, `border-radius 28px` and a soft walnut shadow. Over a 3D scene on phone, use 0.72–0.8 alpha + `backdrop-filter` so the model still shows through;
- `theme-color` meta → cream.
Then re-shoot the no-WebGL poster, because it still shows the old dark stage. Hide everything but the canvas: `*{visibility:hidden!important} canvas{visibility:visible!important}` (the body background still paints), then clip to the stage rect. An element screenshot of a hidden element times out, so use `page.screenshot({clip})`.

## Sources

- Sujon Hoque (Zyqor Studio), WhatsApp, 27 Oct 2026 12:15 IST: three colours, no black, no purple, premium colour; 30 Oct 2026: "PC me no compromise".
- Sujon's Drive, *Master-Award-Website-Guide-Improved-v4.2* Part E (his Master Award Web Design System v2.0): §1 banned aesthetics table, §2 Step 2 (5-layer colour formula, 96% off-white), §2 Step 5 (grain), §3 tokens (light theme, hairline + top highlight), §4 industry rows, §12 colour architecture; Structure 07 (inversion).
- Sujon's Drive, *web-design-promo-checklist.txt* ("Color system": every colour has a purpose), and the 30-item avoid list (2 Oct 2026) in the same Drive.
- Sujon's Drive, *Website-Building-Guide-New-Site.md* §4e (palette rows), and *DESIGN-LIBRARY-INDEX.md* (latest instruction wins).
- Points C1-C10, X1, X2, X10-X12, X17 in `docs/beast/DRIVE_POINTS.md` and the mapping in `docs/beast/SKILLS_SOURCE_MAP.md`.
- scroll-world by cyw (MIT), https://github.com/oso95/scroll-world: theming through a cascade layer with `--sw-*` tokens (engine CSS); its default purple accent `#8a7bb5` is the example of what not to ship.
- Björn Ottosson, "A perceptual color space for image processing" (OKLab), https://bottosson.github.io/posts/oklab/ (conversion matrices used in `palette.mjs`).
- W3C, CSS Color Module Level 4 (`oklch()`, `color(display-p3)`), https://www.w3.org/TR/css-color-4/ ; Media Queries Level 4 `color-gamut`.
- W3C, WCAG 2.2: 1.4.1 Use of Color, 1.4.3 Contrast (Minimum), 1.4.6 Contrast (Enhanced), 1.4.11 Non-text Contrast, https://www.w3.org/TR/WCAG22/ ; relative luminance definition.
- Awwwards Sites of the Year palettes as read on Oct 30 2026 (Lusion, Messenger, Lando Norris), summarised in `docs/how-top-designers-build-unique-sites.md`. Lando Norris's `#D2FF00` is shown there as an award palette; under this skill's rules it is the neon case and is not used.
- @ayzz.thedesigner (Abdul Mutakabar Ayaz), public Instagram posts studied Oct 27 2026: the colourway-morph technique (pattern A), described, nothing copied.
