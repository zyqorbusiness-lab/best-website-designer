---
name: responsive-phone-pc-parity
description: Desktop-first composition that recomposes (not shrinks) for phones with the same quality - the viewport matrix (1920/1440/1280/1024/768/430/390/375/360 + landscape), content breakpoints, fluid type and space, container queries, svh/dvh and the iOS URL bar, safe areas, art-directed crops for portrait, horizontal tracks and pins on phone, pointer vs touch, inputs that do not zoom, 3D and video framing per aspect, the CTA-above-the-fold rule at 360 and 1440, and an automated parity checker (overflow, small text, small targets, CTA position, screenshots) for every size.
when_to_use: "make it responsive", "mobile looks broken", "phone version", "360px overlap", "fix the layout on iPhone / Android", "100vh jumps on iOS", "same quality on phone", "tablet layout", before shipping any page
license: MIT (text and code). Sources in CREDITS.md.
version: 1.0.0
---

# Responsive: PC no compromise, phone the same quality

Two of Sujon's rules decide everything here:

1. *"PC me no compromise, ek dam best"* (30 Oct 2026): the desktop composition is designed first and designed fully.
2. *Phone: same models, same quality, compressed* (27 Oct 2026 8:23 PM): the phone gets a **recomposed** version of
   the same experience with the same assets, not a cut-down one.

And one measured fact: **360 px is a weak width for his audience** (his live site needed a 360 overlap fix on 23 Oct
2026). So 360 is a required test width, never an afterthought.

```
design desktop at 1440 (and check 1920) -> mark what each section must keep on phone -> recompose at 390
   -> stress at 360 and 1024 -> fix with content breakpoints, fluid values, container queries
   -> parity-check.mjs on the whole matrix -> real phone (always say whether one was used)
```

`scripts/parity-check.mjs` loads any URL at the whole viewport matrix and reports horizontal overflow (with the
culprit elements), text under 12 px, tap targets under 44 px, inputs under 16 px (iOS zoom), whether the primary CTA
is inside the first screen, console errors, and saves a screenshot per size. `examples/index.html` is a recomposition
demo (desktop split hero and horizontal track; phone stacked hero with the CTA above the fold and a vertical track).

---

## 0. Desktop first, no compromise

Design at **1440 x 900** first and verify at **1920 x 1080** (a large share of his clients review on big monitors):

1. **Use the width.** 12-column grid, real asymmetry, oversized type up to 9-12rem for a hero word, an image or
   3D stage that bleeds to the edge, a max content width of 1440-1600 px with full-bleed media outside it.
2. **Pointer-fine extras** (magnetic CTA, labelled cursor, hover previews, horizontal pinned tracks) run here.
3. **Large-screen polish**: at 1920 the layout must not look like a 1440 page floating in space; let media and
   display type grow with `clamp()` up to a ceiling, keep line length 45-75 characters.
4. **Highest asset tier**: 2x images at the size they display (srcset), 4K-ready hero crop, DPR 2 WebGL.

### Phone parity (the rest of this skill)

Same assets (compressed), same story, same signature moment. What changes is composition: stack, reorder, re-crop,
shorten pins, swap hover for tap. The 3D or video is reframed for portrait, never replaced by a still (except for
WebGL failure or reduced motion).

---

## 1. The viewport matrix

| Size | Device class | Must check |
|---|---|---|
| 1920 x 1080 | big desktop monitor | nothing floats; type ceilings; full-bleed media |
| **1440 x 900** | laptop (design size) | the reference composition |
| 1280 x 800 | small laptop | grids still breathe; nav fits |
| 1024 x 768 / 1180 x 820 | iPad landscape | pointer may be fine or coarse; no hover-only UI |
| 768 x 1024 | iPad portrait, big foldables | usually the phone composition widened, or a 2-column middle |
| 430 x 932 | iPhone Pro Max | phone composition with more air |
| **390 x 844** | iPhone 12-15 (phone design size) | the reference phone composition |
| 375 x 667 | iPhone SE / older | short height: hero and CTA fit |
| **360 x 740** | common Android (weak width for his audience) | no overlap, no overflow, CTA visible |
| 844 x 390 | phone landscape | pinned scenes and full-height heroes still usable |

Bold sizes are required in every QA run. `parity-check.mjs` runs all of them by default.

---

## 2. Breakpoints come from the content

- Start with **fluid values** (section 3) so most things need no breakpoint at all.
- Add a breakpoint **where the design breaks** (a line wraps badly, a card gets too narrow), not at device widths.
- The common set that results for a portfolio-style site: `48em` (768) for the phone/desktop composition switch,
  `64em` (1024) for the full desktop grid, `90em` (1440) for large-screen ceilings.
- Use `em` in media queries (they follow the user's font size).
- **Container queries** for components that live in different widths (a card in a 3-column grid and in a sidebar):

```css
.card-wrap{container-type:inline-size}
@container (min-width: 28rem){ .card{grid-template-columns:1fr 1fr} }
```

---

## 3. Fluid type and space

Type scale and spacing from the typography and layout skills, all with `clamp(min, preferred, max)`:

```css
:root{
  --step-0: clamp(1rem, .96rem + .19vw, 1.125rem);        /* body: 16 -> 18 px */
  --step-5: clamp(2.75rem, 1.6rem + 5.7vw, 7rem);          /* hero: 44 -> 112 px */
  --space-section: clamp(4rem, 2rem + 8vw, 10rem);
  --gutter: clamp(1.25rem, 5vw, 5rem);
}
```
Rules: body text never below 16 px on phone; display type sized so the longest word fits 360 with the gutter
(test the real words, `overflow-wrap:anywhere` is a last resort, `hyphens:auto` with `lang` set for long words);
`text-wrap: balance` on headings, `pretty` on paragraphs.

---

## 4. Viewport height: svh, dvh, lvh and the iOS URL bar

| Unit | Meaning | Use |
|---|---|---|
| `100svh` | small viewport (URL bar shown) | heroes: never hidden behind the bar |
| `100lvh` | large viewport (bar hidden) | fixed backgrounds that must cover |
| `100dvh` | follows the bar live | avoid for layout (jumps while scrolling) |

```css
.hero{min-height:100vh;min-height:100svh}          /* fallback first */
.stage{position:fixed;inset:0;height:100lvh}         /* full-bleed canvas never shows a gap */
```
Scroll-driven video and pinned scenes: measure once with `visualViewport` and only re-measure on real resizes
(width change or orientation), not on every URL-bar height change (motion skill §7; scroll-world T13).

---

## 5. Safe areas and fixed bars

```html
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
```
```css
.sticky-cta{position:fixed;left:0;right:0;bottom:0;padding:.75rem var(--gutter) max(.75rem, env(safe-area-inset-bottom))}
header{padding-top:max(1rem, env(safe-area-inset-top))}
```
Never block zoom (`maximum-scale=1` / `user-scalable=no` are accessibility failures).

---

## 6. Recompose, don't shrink (section by section)

| Desktop pattern | Phone recomposition |
|---|---|
| Split hero (copy left, media right) | media first or behind, copy after; **CTA inside the first 740 px** (Drive P5) |
| 12-column asymmetric grid | single column with deliberate offsets (indent some blocks, full-bleed some images) so it is not a plain stack |
| Horizontal pinned track | vertical sequence or a native swipe row (`scroll-snap-type:x mandatory`) without pinning |
| Long pinned scroll story (500vh) | the same chapters, pins shortened to ~60-70% of the length; captions in a bottom sheet over the media |
| Hover image previews on a list | tap opens the item; thumbnails shown inline |
| Mega menu | full-screen sheet with large targets, the same links |
| Oversized display word bleeding off-screen | the same word, sized to fit or deliberately cropped with intent |
| Side-by-side comparison | stacked with a toggle, or a drag divider |
| Data table | cards per row, or a horizontally scrollable table with a sticky first column |

Keep **the same signature moment** on both (unique-idea skill): if desktop's signature is the disc that turns while
you scroll, the phone has it too.

---

## 7. Images and art direction

```html
<picture>
  <source media="(max-width: 47.99em)" srcset="hero-portrait-800.webp 800w, hero-portrait-1200.webp 1200w" sizes="100vw">
  <img src="hero-2400.webp" srcset="hero-1600.webp 1600w, hero-2400.webp 2400w, hero-3200.webp 3200w" sizes="(min-width: 90em) 1600px, 100vw"
       width="2400" height="1350" alt="..." fetchpriority="high" decoding="async">
</picture>
```
- Portrait crops for phone are **re-composed** (subject placed for the 9:16 frame), not centre-cropped automatically.
- Below-the-fold images `loading="lazy"`; the hero image `fetchpriority="high"`, never lazy.
- `width`/`height` attributes always (no layout shift); `object-fit:cover` with `object-position` set per crop.
- Same image quality on phone: WebP/AVIF at q 75-82, sized to the displayed width x DPR (2x), not lower quality.

---

## 8. Video and 3D per aspect

- **Video**: encode a 16:9 desktop file and a 9:16 (or 4:5) phone file of the **same shot**, composed for the centre
  (scroll-world T18); swap with `matchMedia('(orientation: portrait)')` and reload only when the orientation changes.
  The phone file is the same quality at its own resolution (1080 x 1920), compressed (crf 23-26).
- **3D**: frame from the bounding sphere using the narrower FOV (threejs skill §8), so the object fills the portrait
  frame; move the model into the upper half when copy sits below; DPR 1.75-2; same GLB.

---

## 9. Pointer vs touch

```css
@media (hover: hover) and (pointer: fine){ /* hover effects, custom cursor, magnetic */ }
@media (pointer: coarse){ .tap-target{min-height:48px} }
```
- Every hover effect has a tap/press version; nothing only on hover (micro-interactions skill MI-R7).
- Tablets with a trackpad report `pointer: fine`: hover works there; still never rely on it for information.
- Touch targets 44 x 44 px minimum, 8 px apart.

---

## 10. Forms and inputs on phones

- Input `font-size` at least **16 px** (iOS Safari zooms the page when a focused input is smaller).
- Right keyboards: `type="email"`, `type="tel"`, `inputmode="numeric"`, `autocomplete` values.
- Labels above fields, full-width fields, the submit button reachable without closing the keyboard.

---

## 11. Common bugs and their fixes

| Bug | Cause | Fix |
|---|---|---|
| Sideways scroll on phone | `100vw` (includes scrollbar on desktop), fixed widths, long words, negative margins, rotated elements | `width:100%`, `max-width:100%`, `overflow-wrap`, `overflow-x:clip` on the section (not on `body`, which breaks `position:sticky`) |
| Overlap at 360 (his live bug) | absolute positioning tuned at 390 | grid/flex layout, clamp sizes; test 360 every time |
| Hero jumps while scrolling on iOS | `100vh` or `100dvh` | `100svh` |
| Sticky stops working | an ancestor with `overflow:hidden` | use `overflow:clip` or remove it |
| Pinned scene broken after rotate | stale measurements | re-measure on width/orientation change; ScrollTrigger.refresh() |
| Text too small on phone | px sizes from desktop | clamp(); 16 px body minimum |
| Blurry canvas | DPR 1 | `setPixelRatio(Math.min(devicePixelRatio, 2))` |
| CTA below the fold at 360 x 740 | hero padding and image height in fixed units | svh-based hero, CTA earlier in the source order on phone |

---

## 12. Testing

1. `node scripts/parity-check.mjs <url>` (all sizes) and read the report.
2. Chrome DevTools device mode at 360 / 390 / 1440, with CPU 4x throttle for the phone runs.
3. Reduced motion run (`prefers-reduced-motion: reduce`) on desktop and phone.
4. **A real phone** (Drive P4): *"Tests pass hona akela real-phone quality ka proof nahi."* Every report says
   plainly whether a real phone was used ("checked in a desktop browser at 390/360 only" otherwise).
5. Landscape phone once.

What the checker caught while this skill's own demo was built (30 Oct 2026): the page passed at 1440, 390 and 360,
but at **375 x 667** (iPhone SE) the CTA sat below the first screen, and in **844 x 390** landscape the CTA fell below
the fold and a nav link was 41 px wide. Fixes: the phone hero art capped at `min(26svh, 68vw)`, a landscape
media query for short screens, `min-width:44px` on nav links. The three required sizes alone would have missed both.

---

## 13. Tiers

| | NORMAL ($300) | ADVANCED ($1k) | PREMIUM ($10k) |
|---|---|---|---|
| Desktop | 1440 composition, checked at 1920 | + pointer-fine extras, large-screen ceilings | + every section composed for 1440 and 1920 separately where it matters |
| Phone | stacked, clean, CTA above the fold at 360 | recomposed sections (table in section 6), portrait crops | full recomposition, portrait video/3D framing, phone proof screenshots side by side |
| Tablet | works | checked at 1024 and 768 | composed for 1024 landscape |
| QA | 1440 / 390 / 360 | + 1920, 1024, landscape | + real phone (iPhone and an Android at 360) |

---

## 14. Do and don't

| Do | Because |
|---|---|
| Design desktop fully, then recompose for 390 | his "PC no compromise" + phone parity |
| Test 360 x 740 every time | his audience; his live overlap bug |
| Use svh for heroes | no URL-bar jump |
| Re-crop images and re-encode video for portrait | the phone frame deserves its own composition |
| Keep the signature moment on phone | same experience, not a lite version |

| Don't | Because |
|---|---|
| Serve a "mobile lite" with fewer assets or a still instead of 3D | breaks his phone-parity rule |
| Use device-width breakpoints for everything | breaks between devices |
| Disable zoom | accessibility failure |
| Put `overflow-x:hidden` on body | kills sticky; hides the bug instead of fixing it |
| Hide information behind hover | invisible on phones |

---

## 15. Pre-ship checklist

- [ ] `parity-check.mjs`: 0 overflow, 0 console errors, no text < 12 px, no targets < 44 px, inputs >= 16 px at every size.
- [ ] Primary CTA inside the first screen at 360 x 740 and 1440 x 900 (landing pages).
- [ ] Hero uses svh; fixed bars respect safe areas; zoom allowed.
- [ ] Phone sections recomposed (no plain shrunk desktop), signature moment kept.
- [ ] Portrait crops and portrait video encodes exist where media is full-bleed.
- [ ] 3D framed for portrait; same GLB.
- [ ] 1920 checked: nothing floats; type ceilings hold.
- [ ] Landscape phone usable.
- [ ] Report says whether a real phone was used.

## 16. Files

| File | What |
|---|---|
| `scripts/parity-check.mjs` | viewport-matrix checker: overflow culprits, small text, small targets, input font size, CTA above fold, console errors, screenshots, JSON report; exits 1 on failures |
| `examples/index.html` | recomposition demo: desktop split hero + horizontal track; phone stacked hero with CTA above the fold, vertical track, safe-area sticky bar, container-query cards |

## Sources

- Sujon Hoque (Zyqor Studio): WhatsApp 30 Oct 2026 ("PC me no compromise, ek dam best"; phone parity after), 27 Oct 2026 8:23 PM (phone same models, same quality, compressed), 23 Oct 2026 (360 px overlap fix on his live site).
- Sujon's Drive: *Master-Award-Website-Guide-Improved-v4.2* Part A (main button visible at 360 and 1440), Part E §2 Step 6 (phone guardrails), §8.3, §13 gate 14, Part G §8 (real phone); *Website-Building-Guide-New-Site.md* §3, §7 (real phone, Lighthouse mobile); BoloFlow "PERFORMANCE".
- Drive points P1-P8, X8, C1 (`docs/beast/SKILLS_SOURCE_MAP.md`).
- scroll-world by cyw (MIT), https://github.com/oso95/scroll-world: phone portrait chain (T12), mobile URL-bar measurement (T13), compose for the centre (T18).
- MDN: viewport units (svh/lvh/dvh), `env(safe-area-inset-*)`, container queries, `<picture>` and responsive images, `(hover)` and `(pointer)` media features.
- W3C WCAG 2.2: 1.4.4 Resize Text, 1.4.10 Reflow (320 CSS px), 2.5.8 Target Size; WebKit notes on input zoom below 16 px.
