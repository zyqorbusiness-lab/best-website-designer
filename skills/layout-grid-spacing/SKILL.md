---
name: layout-grid-spacing
description: Layout for premium websites - choosing one of 14 named page structures instead of "hero + 3 cards", the spatial tokens (1440 container, fluid gutters, 12-column grid, section rhythm), an 8-point spacing scale, editorial and asymmetric grids, hairline ledgers instead of cards, sticky split narratives, pinned horizontal tracks, stacked sticky cards, the smart nav pill and the finale footer, whitespace by brand type, breakpoints and phone re-composition. Includes a layout audit script (overflow culprits, tap targets, line length, distinct spacing values) and a tested demo.
when_to_use: "lay out this page", "it looks like a template", "too cramped / too empty", "grid for a portfolio / product / editorial site", "spacing is inconsistent", "how should this look on phone", before building any section
license: MIT (text and code). Sources in CREDITS.md.
version: 1.0.0
---

# Layout, grid and spacing

Templates look like templates because of their **layout**, not their colours: a centred hero, three feature cards
in a row, an about block, a contact form. Award sites start from a structure that serves one idea, put one thing
in focus per screen, and leave the rest empty on purpose.

```
idea + story (chapters) -> pick a named structure (section 2) -> spatial tokens + spacing scale (3-4)
   -> compose each chapter: one focal point, grid, whitespace (5-6) -> phone re-composition (8) -> layout-audit.js + screenshots (10)
```

`scripts/layout-audit.js` runs in any page (DevTools console or a test runner) and reports horizontal-overflow
culprits, tap targets under 44 px, over-long text lines and how many distinct spacing values the page uses.
`examples/index.html` shows the main structures working at 1440 / 390 / 360 (press **G** for the grid overlay).

---

## 0. Desktop first, no compromise

*"PC me no compromise, ek dam best"* (Sujon, 30 Oct 2026). For layout:

1. **Design the 1440 x 900 frame first and make it the best version.** Full-bleed stages at 100vw, the 1440 container
   for content, real asymmetry, overlaps, pinned chapters. Do not design a phone column and stretch it.
2. **Use the width.** Two and three column editorial compositions, a sticky stage beside scrolling copy, a horizontal
   exhibition track. A desktop that shows one centred column of text is a downgrade.
3. **Wide screens (1920+) still look designed**: the container stays 1440 (or 1600 for galleries), full-bleed media
   grows, and the type scale has a higher ceiling (typography skill).
4. **Pinned and sticky sections stay on desktop.** They are the cheapest premium effect there is.

### Phone parity

- **Same story, same chapters, same assets**, re-composed for a 390px column (section 8). Not a different site,
  not fewer sections.
- Sticky stage stacks above its chapter; horizontal tracks become native horizontal swipe with snap; ledgers stay
  ledgers (they already are one column).
- Primary CTA visible without scrolling at 360px (his Drive P5) and reachable with a thumb.
- Every tap target at least 44 x 44 px.

---

## 1. Rules with reasons

| # | Rule | Why |
|---|---|---|
| L-R1 | **Never "hero, 3 feature cards, about, contact".** Pick a named structure (section 2). | Master Award System §5: *"Never fall back to a generic... wireframe."* It is the first thing a judge or client recognises as template. |
| L-R2 | **One focal point per section.** Ask: where does the eye land first? If the answer is two places, remove one. | His checklist "Composition"; the 3-second test (section 9). |
| L-R3 | **A story, not a pile of sections**: Problem, Product, How it works, Proof, Details, CTA; each section continues the last. | His checklist "Visual storytelling". "Proof" means real specs, a working demo or the product itself, never invented testimonials. |
| L-R4 | **One spacing scale**: 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128 px. Nothing in between. | His checklist: *"Random margin-padding nahi."* Rhythm is what makes a page feel designed. |
| L-R5 | **Whitespace is intentional**: 40%+ open canvas for luxury and craft, 50%+ for quiet luxury. | Master Award System §2 Step 1, Structure 12. Empty space is what expensive looks like. |
| L-R6 | **No card grids of three; no bento by default.** Use hairline ledgers, editorial offsets, varied counts. | His avoid list: "3 feature cards in a row", "bento grids". Allowed only when a project's chosen style is bento. |
| L-R7 | **Break the grid once per page, on purpose** (an overlap, a rotated card, a scattered collage). | Award winners do this (study doc §3); breaking it everywhere is chaos, never is a template. |
| L-R8 | **One oversized element per screen.** A word, a product or a photo; everything else small. | Study doc §3: FORMAT, Lando Norris, ESR Bespoke. Contrast of scale is the strongest layout tool. |
| L-R9 | **The phone is not a shrunken desktop.** Re-check navigation, type, image crop, card stacking, CTA placement, touch targets, section order. | His checklist "Responsive design". |
| L-R10 | **No horizontal scroll by accident.** Zero overflow at 360px. | The most common phone bug; `layout-audit.js` names the culprit element. |
| L-R11 | **Layout only animates with transform and opacity** (and `clip-path` for wipes). | Drive M15; animating width/top/margin janks on phones. |

---

## 2. The 14 named structures (pick one per page)

From Sujon's *Master Award Web Design System* §5. Each line: what it is, when to use it, how the phone version works.

| # | Structure | What it is | Use for | Phone |
|---|---|---|---|---|
| 01 | Precision bento | modular tiles of varied sizes | dashboards, SaaS **only if bento is the chosen style** (L-R6) | tiles stack, 1 column |
| 02 | Swiss exposed-hairline grid | visible 1px grid lines, + marks at intersections, numbered ledger rows | studios, architecture, consultancies | ledger rows full width |
| 03 | Scroll-driven 3D showcase | fixed canvas, one product through 5 chapters (silhouette, orbit, exploded, finish studio, specs) | physical products, $1k/$10k tiers | same model, portrait camera |
| 04 | Editorial maison | inset frame that opens to full bleed, serif manifesto with inline image pills, staggered lookbook | fashion, perfume, hotels | lookbook becomes alternating single column |
| 05 | Horizontal exhibition | vertical scroll drives a sideways track of frames with a counter | portfolios, collections | native swipe with scroll-snap |
| 06 | Live sandbox hero | the product works in the hero (a configurator, a tool) | software, tools | the sandbox stays, controls go below |
| 07 | Split-screen sticky narrative | pinned visual on one side, chapters scroll on the other | processes, products with steps | visual stacks above each chapter |
| 08 | Neo-brutalist grid | heavy rules, raw type, deliberate clash | music, streetwear, events | same rules, one column |
| 09 | Spatial glass | liquid-glass panels floating over a scene | Zyqor sites (his "glass on every screen" rule), tech | same glass, blur budget on phone |
| 10 | Kinetic typography manifesto | type is the hero; words light up with scroll; stacked sticky cases | agencies, manifestos | same, smaller scale |
| 11 | Draggable infinite canvas | 2D surface you drag, with a grid-view toggle | archives, moodboards | grid view by default, drag optional |
| 12 | Whisper-quiet zen | 50%+ empty, paper or stone canvas, tiny type | quiet luxury, spa, architecture | same emptiness, fewer columns |
| 13 | Conversion funnel | one goal, one path, minimal exits | landing pages for ads | CTA sticky at the bottom |
| 14 | Multi-scene WebGL portal | several worlds joined by shader transitions | flagship, premium tier only | same scenes, compressed |

Decision: pick by **what the visitor must do** (read, compare, buy, explore) and **what the idea needs on screen
the whole time** (the product = 03/07, the type = 10, the collection = 05/11). Record the number in the project
notes, so reviews can check the page is that structure and not a template wearing its name.

---

## 3. Spatial tokens

```css
:root{
  /* container and gutters (Master Award System §2 Step 3) */
  --container:1440px;
  --gutter:clamp(1.5rem, 5vw, 5rem);           /* 24px at 360 -> 72px at 1440 -> 80px cap */
  --grid-gap:clamp(1rem, 2vw, 1.5rem);         /* 16 -> 24px */
  --section-y:clamp(6rem, 12vw, 11rem);        /* 96 -> 176px between chapters */
  /* 8-point scale (his checklist) */
  --s-1:8px; --s-2:12px; --s-3:16px; --s-4:24px; --s-5:32px; --s-6:48px; --s-7:64px; --s-8:96px; --s-9:128px;
}
.wrap{width:100%;max-width:var(--container);margin-inline:auto;padding-inline:var(--gutter)}
.full-bleed{width:100vw;margin-inline:calc(50% - 50vw)}      /* escapes .wrap without breaking the grid */
section{padding-block:var(--section-y)}
```

Spacing rules of thumb:

| Relationship | Space |
|---|---|
| Label to its value, icon to its text | 8px |
| Lines inside a component (title to text) | 12-16px |
| Between components in a group | 24-32px |
| Between groups inside a section | 48-64px |
| Between sections (chapters) | `--section-y` (96-176px) |
| Hero top padding under the nav | 128px+ on desktop |

The space **between** groups must be clearly bigger than the space **inside** a group (at least 2x), or the eye
cannot tell what belongs together (Gestalt proximity).

---

## 4. The grid

```css
.grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));column-gap:var(--grid-gap)}
.col-7{grid-column:span 7}.col-5{grid-column:span 5}.col-6{grid-column:span 6}.col-4{grid-column:span 4}
.start-2{grid-column-start:2}.start-8{grid-column-start:8}
@media (max-width:767px){ .grid{grid-template-columns:repeat(4,minmax(0,1fr))} .grid>*{grid-column:1/-1} }
/* children that must align to the parent's columns (card internals, ledger cells): */
.row{display:grid;grid-column:1/-1;grid-template-columns:subgrid}
```

Composition patterns that read as designed:

| Pattern | Columns (desktop) | Use |
|---|---|---|
| Asymmetric split | 7 + 5, or 5 + 6 offset by 1 | text beside image; never 6 + 6 for hero |
| Editorial offset | image in cols 1-6, second image in 8-12 pushed 160px lower | lookbooks, galleries |
| Indented text | body text in cols 5-11 under a heading in 1-12 | long-form, case studies |
| Hanging labels | small label in cols 1-2, content in 3-12 | specs, ledgers, FAQs |
| Full-bleed break | 100vw media between contained sections | chapter changes |

Use `minmax(0,1fr)` (not `1fr`) so long words or images cannot blow a column wider than the grid.
Use container queries (`container-type:inline-size` + `@container (min-width: 40rem)`) for components that
appear in different column widths, instead of more viewport breakpoints.

---

## 5. Signature layout patterns (all in the demo)

### 5.1 Hairline ledger instead of cards (Drive L7)

```html
<ol class="ledger">
  <li><span class="n">01</span><h3>Strategy</h3><p>One sentence on what this is.</p></li>
  <li><span class="n">02</span><h3>Systems</h3><p>...</p></li>
</ol>
```
```css
.ledger{list-style:none;padding:0;border-top:1px solid var(--c-hairline)}
.ledger li{display:grid;grid-template-columns:4rem minmax(0,1fr) minmax(0,1.2fr);gap:var(--s-4);align-items:baseline;
  padding-block:var(--s-5);border-bottom:1px solid var(--c-hairline);transition:background-color .4s cubic-bezier(.16,1,.3,1)}
.ledger .n{font-family:var(--font-mono);font-size:.75rem;letter-spacing:.14em}
@media (hover:hover){.ledger li:hover{background:var(--c-surface)}}
@media (max-width:767px){.ledger li{grid-template-columns:3rem minmax(0,1fr)}.ledger li p{grid-column:2}}
```
Hover previews (an image following the row) need a tap equivalent: on touch, the first tap opens the row.

### 5.2 Split-screen sticky narrative (Drive L8, Structure 07)

```css
.split{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);column-gap:var(--grid-gap)}
.split .stage{position:sticky;top:0;height:100vh;height:100svh;display:grid;place-items:center}
.split .chapters>article{min-height:100vh;display:grid;align-content:center}
@media (max-width:767px){.split{grid-template-columns:1fr}.split .stage{position:relative;height:60svh}}
```
The stage changes picture per chapter (IntersectionObserver on each `article`, `rootMargin:'-50% 0px -50% 0px'`)
with an opacity or `clip-path` crossfade. On phone, each chapter carries its own copy of the visual or the stage
sits sticky at the top at 45svh with the text scrolling under it.

### 5.3 Pinned horizontal exhibition (Drive L9, Structure 05)

```html
<section class="hx" style="--frames:6"><div class="hx-pin"><div class="hx-track">...frames...</div></div></section>
```
```css
.hx{height:calc(var(--frames) * 60vh)}                      /* scroll length = how long it feels */
.hx-pin{position:sticky;top:0;height:100svh;overflow:hidden;display:flex;align-items:center}
.hx-track{display:flex;gap:var(--grid-gap);padding-inline:var(--gutter);will-change:transform}
.hx-track>*{flex:0 0 min(70vw,640px)}
@media (max-width:767px),(prefers-reduced-motion:reduce){
  .hx{height:auto}.hx-pin{position:static;height:auto;overflow-x:auto;scroll-snap-type:x mandatory}
  .hx-track{transform:none!important}.hx-track>*{scroll-snap-align:start;flex-basis:82vw}}
```
```js
const hx = document.querySelector('.hx'), track = hx.querySelector('.hx-track');
const mq = matchMedia('(min-width:768px) and (prefers-reduced-motion:no-preference)');
let raf = 0;
function onScroll(){ if (raf) return; raf = requestAnimationFrame(() => { raf = 0; if (!mq.matches) return;
  const r = hx.getBoundingClientRect(); const t = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
  track.style.transform = `translate3d(${-t * (track.scrollWidth - innerWidth)}px,0,0)`; }); }
addEventListener('scroll', onScroll, { passive: true }); onScroll();
```
A frame counter ("03 / 06") and a 1px progress bar complete it. Skew by scroll velocity (Drive) is optional and
clamped to 3.5 degrees.

### 5.4 Stacked sticky case cards (Drive L11)

```css
.stack>article{position:sticky;top:calc(80px + var(--i) * 24px);transform-origin:top center}
```
Set `--i` per card (0, 1, 2...). Receding cards can scale to 0.94 and dim (Drive values) with a small scroll
handler, transform/filter only.

### 5.5 Smart navigation (Drive L13)

Full-width transparent header that becomes a floating glass pill after 80px of scroll (top 20px, max-width 760px,
`backdrop-filter: blur(16px)`). The pill is the `liquid-glass-ui` skill's nav; under `prefers-reduced-transparency`
use a solid surface. On phone: the pill holds the logo, one CTA and a menu button (44px).

### 5.6 Finale footer (Drive L14)

A pre-footer CTA stage, then an edge-to-edge wordmark at `clamp(4rem, 15vw, 16rem)` (the brand name, real),
then Privacy, Terms and Contact links (his avoid list demands real legal pages). No decorative arrows.

### 5.7 Editorial maison moves (Drive L10)

24px inset frame that opens to full bleed on first scroll (`clip-path: inset(24px round 12px)` to `inset(0)`),
inline image pills between words of a serif line, staggered lookbook (a 3:4 image in 6 columns beside a 4:5 image
in 4 columns pushed 160px down; parallax 0.85 vs 1.15), chapters wiping up with `clip-path: inset(100% 0 0 0)`.

---

## 6. Whitespace by brand type

| Brand | Open canvas | Density cue |
|---|---|---|
| Quiet luxury, spa, architecture | 50%+ of the viewport | one image, one line, tiny labels |
| Luxury, craft, hospitality | 40%+ | large serif, full-bleed photography |
| Studio / portfolio | 30-40% | ledger lists, big index numbers |
| Product / ecommerce | 25-35% | product large, specs tight in a ledger |
| Events, music, streetwear | 15-25% | dense, loud, grid breaks |

Measure it on a 1440 screenshot: everything that is canvas with no text or image is open space.

---

## 7. Breakpoints

Design and test at these widths; set breakpoints where the **content** breaks, not at device names.

| Width | Why |
|---|---|
| 360 | small Android, the weakest width for his audience (Drive P6) |
| 390 / 393 | current iPhone / Pixel portrait |
| 430 | large phones |
| 768 | tablet portrait: switch 4 to 8/12 columns here |
| 1024 | small laptop / tablet landscape |
| 1280 | common laptop |
| 1440 | **the design frame** |
| 1920 | desktop monitor: container stays, bleed grows |

---

## 8. Phone re-composition (not shrinking)

For every section, decide on purpose:

| Desktop | Phone |
|---|---|
| 7 + 5 split | image first if it carries the idea, text first if it carries the offer |
| sticky split narrative | stage above each chapter, or sticky top 45svh |
| horizontal pinned track | native swipe, scroll-snap, visible next frame (82vw cards) |
| hairline ledger, 3 columns | 2 columns: number + content |
| editorial offset lookbook | single column, alternating left/right indent of 24px |
| nav links | pill with menu button, full-screen menu sheet |
| hero headline over image | headline below or over a darker scrim at the bottom third |

Phone details: use `svh`/`dvh` units for full-height stages (URL bar), `env(safe-area-inset-*)` for anything at the
screen edges, and keep the primary CTA in the bottom half where the thumb is.

---

## 9. The 3-second test and the composition review

Take a 1440 screenshot and a 390 screenshot of every screen. For each, answer in writing:
1. What do I see first? (It must be the focal point you chose.)
2. What is the one thing to do here?
3. Is any element competing with the focal point? Remove it.
4. Is the empty space intentional or left over?
5. Is spacing between groups at least 2x the spacing inside groups?
6. Does it survive at 360px?

From Sujon's checklist "Composition" and the Master Award System's 3-second test ("1 unmistakable focal
centerpiece").

---

## 10. Do and don't

| Do | Because |
|---|---|
| Name the structure (01-14) before drawing | reviews can then check it |
| Use `minmax(0,1fr)` columns and `min()` widths | nothing can overflow the grid |
| Put spacing in tokens only | one scale, no random margins |
| Use subgrid for rows that must align | baselines line up across columns |
| Let one element break the grid | controlled tension reads as designed |

| Don't | Because |
|---|---|
| Three cards in a row with icon + title + text | the most recognisable template block |
| `width:100vw` inside a padded container without the bleed trick | horizontal scroll on phones (scrollbar width) |
| Fixed pixel heights on text containers | text overflows at 360px or in another language |
| Centre everything | no tension, no reading direction |
| Use breakpoints to hide sections on phone | phone parity: same story |
| Animate layout properties | jank; transform and opacity only |

---

## 11. Tiers: normal vs advanced vs premium

| | NORMAL ($300) | ADVANCED ($1k) | PREMIUM ($10k) |
|---|---|---|---|
| Structure | one named structure (02, 07, 10, 12, 13 are cheapest) | a named structure with pinned/sticky chapters | 03 or 14, or a custom structure built around the idea |
| Grid | 12-col, asymmetric splits, ledgers | + subgrid, container queries, editorial offsets | + art-directed per breakpoint, overlaps with 3D |
| Motion in layout | reveals | sticky split, stacked cards, horizontal track | full-page choreography, page transitions, scene-led layout |
| Phone | re-composed per section 8 | + native swipe tracks, sticky stage | + portrait camera framing for the 3D stage |
| Proof | audit PASS at 1440/390/360 | + 3-second test notes | + side-by-side desktop/phone review per chapter |

---

## 12. Pre-ship checklist

- [ ] Structure number (01-14) written in the notes; the page is not hero + 3 cards.
- [ ] Every section has one focal point (3-second test written down for 1440 and 390).
- [ ] Story order: problem, product, how, proof (real), details, CTA (or a stated reason it differs).
- [ ] All spacing from tokens; `layoutAudit()` distinct spacing count is low (under about 24) and none look random.
- [ ] `layoutAudit()` at 1440, 390 and 360: no overflow, no small tap targets, no paragraph over 75-80 characters a line.
- [ ] Container 1440, gutters fluid, sections on `--section-y`.
- [ ] No 3-up card grid, no bento (unless chosen), no decorative arrows.
- [ ] One deliberate grid break.
- [ ] Primary CTA visible without scrolling at 360 and 1440.
- [ ] Sticky/pinned sections work on desktop and have the phone version in section 8.
- [ ] Footer has the finale wordmark (or a reason not to) and real Privacy, Terms, Contact.
- [ ] Reduced motion: pinned tracks become normal scroll, nothing is hidden.

## 13. Files

| File | What |
|---|---|
| `scripts/layout-audit.js` | `layoutAudit()` for any page: overflow culprits, tap targets, line length, distinct spacing values |
| `examples/index.html` | ledger, sticky split narrative, pinned horizontal track, stacked sticky cards, finale footer, grid overlay (G), self-tests |

## Sources

- Sujon Hoque (Zyqor Studio): WhatsApp 27 Oct 2026 (phone = PC quality, 8:23 PM; glass on every screen, 7:30 PM), 30 Oct 2026 ("PC me no compromise"); 30-item avoid list (2 Oct 2026).
- Sujon's Drive: *Master-Award-Website-Guide-Improved-v4.2* Part E §2 Steps 1 and 3 (whitespace, spatial tokens), §5 (14 structures), Structures 02, 04, 05, 07, 10, 11, 12, §8.2 (smart nav), §8.3 (3-second test), §8.10 (footer); *web-design-promo-checklist.txt* (Spacing system, Composition, Visual storytelling, Responsive design); *Website-Building-Guide-New-Site.md* §4a-4c, §5, §6 rule 4.
- Drive points L1-L15, P5, P6, M15, X5 (mapping in `docs/beast/SKILLS_SOURCE_MAP.md`).
- scroll-world by cyw (MIT), https://github.com/oso95/scroll-world: compose for the centre (`object-position: center 42%`), `dvh` + safe-area insets, ignore height-only resizes on touch.
- Award examples: FORMAT by Obys, landonorris.com by OFF+BRAND, ESR Bespoke by NIGHTJAR, Pangram Pangram by Locomotive (Awwwards pages read 30 Oct 2026; `docs/how-top-designers-build-unique-sites.md` §3).
- W3C: CSS Grid Level 2 (subgrid), CSS Containment Level 3 (container queries), CSS Values 4 (`svh`/`dvh`), WCAG 2.2 SC 2.5.8 Target Size (Minimum) and 2.5.5 (Enhanced, 44 px).
