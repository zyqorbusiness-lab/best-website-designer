# Hotcoal Kitchen (P041): BEST 4 build spec + storyboard

Best-4 pick #1 of 4 for Sujon Hoque (Zyqor Studio). Category: Wood-fired pizzeria (restaurant). Fictional brand, labelled "Concept" everywhere.
Written Oct 30 2026, BEFORE any code (Sujon's spec-first rule, 2:31 PM IST). Status: **approved by Sujon ("Ok", 9:05 PM IST Oct 30 2026); built Oct 30 2026 (best-4 build #1), see section 10 for what changed in the build**. The build must match this file; any change is written back here first.

**Why this one:** Restaurants are the biggest group in our US lead lists, and "build your pizza, then fire it" is the most hands-on, most shareable demo in the portfolio. Today it is one clever builder; flawless turns it into a full restaurant site an owner would pay for.

**What exists today:** v3.1: a three-column pizza builder (tray, board, ticket) with photo-cut ingredients that bake on "Fire it". No story before or after it; no menu, hours or visit section.

**Idea in one line:** A wood-fired pizzeria whose website IS the order: watch the dough stretch, drop real ingredients on the base, scroll to fire it in 90 seconds, then pick it up.

**Three hand-made signature details:**
1. The pizza you bake is made of the exact pieces you dropped, where you dropped them.
2. Scroll is the oven clock: 00 to 90 seconds, raw to leopard-spotted.
3. Menu rows load their toppings straight onto the board, so the menu and the builder are one thing.

---

## 1. Goal and story, beat by beat

Same beats on desktop and phone (phone = PC quality: same models, same textures, same effects).

| # | Section | Scroll (desktop / phone) | What the visitor feels | What happens |
|---|---|---|---|---|
| 0 | `#intro (first paint)` | 0 / 0 | "Something warm is coming" | Poster still of a finished pizza on the peel paints instantly (LCP). The live canvas fades in over it; 14 ember sparks drift up from the bottom edge for 1.2 s, then stop. |
| 1 | `#hero` | 100vh / 100svh | Hungry, welcome | The finished pizza turns slowly on the peel (4 deg/s). Headline "Fired hot. Ready in 90 seconds." Buttons: Build yours / See the menu. Hours chip: "Open today 11 to 10" (sample). |
| 2 | `#dough` | 200vh pinned / 160svh pinned | "They actually make it here" | Scrub: a dough-ball photo scales and stretches into the raw base through a growing radial mask; three labels draw in: "Flour, water, salt, yeast", "48-hour rise", "Stretched by hand". |
| 3 | `#build` | auto (about 120vh) / auto | Playful, in control | The builder: tray of 8 ingredients in wooden bowls, drag (desktop) or tap (phone) onto the base; snap ring shows where it lands; ticket updates line by line with price. |
| 4 | `#fire` | 180vh pinned / 150svh pinned | "Watch it cook" | Scrub: your pizza slides on the peel into the oven mouth; a mono clock counts 00 to 90 s; each piece crossfades raw to baked (cheese melts, pepperoni cups, crust gets leopard spots); the board edge warms from flour to tomato tint in 4 flat steps; steam wisps at 70 s. |
| 5 | `#menu` | auto / auto | "What else is good?" | Six house pizzas as a ruled list (name, toppings, sample price). "Load it" on any row flies those toppings onto the board in #build and scrolls back up. |
| 6 | `#visit` | auto / auto | "I'll go tonight" | Pickup form (name, phone, time chips) ending in "Concept: not sent"; hours table; sample address; a hand-drawn SVG street map with one pin. Footer: credits, Concept label, studio contact. |

---

## 2. Stack, setup, folder layout

- Plain static HTML/CSS/ES modules, no build step, same as every Library concept. three.js from the repo's `vendor/three/` (MIT) via an import map; `GLTFLoader` + `MeshoptDecoder` for the CC0 models; `RGBELoader` for the HDRI.
- One scroll engine: a single `requestAnimationFrame` loop reads each pinned section's progress from `getBoundingClientRect()` (CSS `position: sticky` sections, no scroll library, no scroll-jacking). Progress is lerped 0.12 per frame. 3D renders only while its section is on screen (IntersectionObserver), and pauses off-screen.
- Shared kit: `library/_kit/concept.css`, `landing.css`, `landing.js`, `fx/index.js` (nav, reveals, press feedback, "Concept" badge, credits sheet).
- Desktop `index.html` and phone `m.html` are separate pages that load the SAME models, textures and HDRI (phone = PC quality). `index.html` sends coarse-pointer phones to `m.html`; `?desktop=1` keeps desktop.
- Reduced motion (`prefers-reduced-motion: reduce`): no scrubbing, no idle float, no particles; each pinned section shows its end state as a still and the copy reads top to bottom. No WebGL: the poster still plus the full copy, nothing blank.
- Contact for the studio (footer strip "Want a site like this?"): Gmail compose to zyqorbusiness@gmail.com on desktop, mailto on phone, WhatsApp +91 95479 08593. External links open in a new tab.

```
site/library/p/P041/
  index.html        desktop page
  m.html            phone page (same beats, phone layout)
  style.css         desktop layout
  m.css             phone layout
  app.js            scroll engine, UI states, form
  pizza.js          canvas renderer, pieces, bake crossfade (from v3.1)
  img/              cut-out pieces raw + baked, bowls, board (WebP 1x/2x)
  poster.webp       first-paint still rendered from our own scene (+ .credit.json)
  thumb.webp        Library card (+ .credit.json)
  credits.json, brief.md, qa.json
```

---

## 3. Design tokens

### 3.1 Scale units
- Desktop: `--u: clamp(8px, 0.55vw, 11px)`; 12-column grid, 24px gutters, max width 1440px (full-bleed canvases allowed).
- Phone: `--u: 8px` fixed; 4-column grid, 20px gutters, 20px side margins; reference 390x844, checked at 360x740.

### 3.2 Colour (exactly three colours plus their tints; no black, no purple, no gradients)

| Token | Hex | Role | Contrast |
|---|---|---|---|
| --flour | #F4EDE1 | page background (flour paper) | base |
| --basil | #283A2D | headings, body, footer ground (coloured dark, never black) | 10.4:1 on flour (AAA) |
| --tomato | #A93A23 | about 1%: CTA fill, active chip, snap ring, clock digits | 5.4:1 on flour; flour text on it 5.4:1 |
| --basil-2 (tint) | #515E51 | secondary text = basil 80% / flour 20% | 5.9:1 on flour (AA) |
| --ember (tint) | #EEDFD2 | warm band behind #fire = flour 92% / tomato 8% | flat colour, steps, no gradient |
| --line (tint) | #D9CFBF | hairlines, table rules | decorative |

### 3.3 Type (SIL OFL fonts already in the repo; `font-display: swap`, display face preloaded, fallbacks sized with `size-adjust`)

| Style | Font | Size desktop / phone | Weight | Tracking | Line-height |
|---|---|---|---|---|---|
| Display XL (hero) | Fraunces (opsz 144, SOFT 50) | clamp(4.5rem, 9vw, 9.5rem) / 3.4rem | 700 | -0.03em | 0.9 |
| Display L (sections) | Fraunces (opsz 72, SOFT 50) | clamp(2.6rem, 4.4vw, 4.6rem) / 2.3rem | 650 | -0.02em | 0.98 |
| Menu item name | Fraunces italic (opsz 36) | 1.75rem / 1.4rem | 500 | -0.01em | 1.15 |
| Lead | Inter Tight | 1.375rem / 1.125rem | 450 | -0.01em | 1.4 |
| Body | Inter Tight | 1.0625rem / 1rem | 400 | 0 | 1.55 |
| Ticket / clock / labels | JetBrains Mono | 0.8125rem / 0.75rem (clock clamp(5rem,10vw,10rem) / 4.5rem) | 400 | 0.08em caps (clock -0.04em) | 1.3 |
| Button | Inter Tight | 1.0625rem | 700 | 0 | 1 |

### 3.4 Spacing
4-pt base. Steps: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192 px. Section rhythm `clamp(6rem, 12vw, 11rem)` desktop / 64px phone.
Container 1440px, 12 columns, 24px gutters (desktop); 4 columns, 20px gutters, 20px side margins (phone). Lead copy max 34ch, body max 62ch. Tap targets >= 48px. Corners: 2px on cards, 999px on chips and buttons. Hairline borders (1px, the line token) and a top specular edge instead of drop shadows.

### 3.5 Motion

| Token | Value | Use |
|---|---|---|
| --ease-out | cubic-bezier(.16,1,.3,1) (expo-out) | reveals, UI, settles (Sujon's taste: fast, smooth, no bounce, no blur) |
| --ease-io | cubic-bezier(.76,0,.24,1) (in-out-quart) | camera moves between keyframes |
| --spring | small spring, stiffness 170, damping 26, no overshoot past 2% | detents and snaps |
| reveal | opacity 0 -> 1 + 20px rise, 460ms, --ease-out, 60ms stagger | every text block entering |
| --dur-fast / --dur / --dur-slow | 180 / 420 / 900 ms | hover and press / reveal / intro settle |
| press | scale .97 for 90ms, back in 160ms | every button and chip |
| scroll smoothing | progress lerp 0.12 per frame | all scrubbed timelines |
| ingredient drop | 180ms fall + 2px settle, --spring; contact shadow tightens as it lands | #build |
| bake crossfade | per-piece raw->baked opacity, piece i starts at clock 10+6i s, lasts 30 s of clock | #fire |
| menu load | pieces fly on a 520ms arc (--ease-io), 40ms stagger, then scroll to #build | #menu |

---

## 4. Assets (real, credited; no AI imagery, no stock with unclear licence)

| Asset | Source URL | Use | Licence |
|---|---|---|---|
| Crust, melted mozzarella, basil (cut-outs) | https://commons.wikimedia.org/wiki/File:Neapolitan_pizza_at_Trappica_(48701940197).jpg | base ring + baked cheese + basil | CC BY 2.0, Bex Walton (credit) |
| Sauce | https://commons.wikimedia.org/wiki/File:Pizza_marinara_(Napoli).jpg | sauce inside the crust | CC0 1.0 |
| Raw mozzarella | https://commons.wikimedia.org/wiki/File:Mozzarella.jpeg | raw cheese chunks | CC BY 3.0, Dezidor (credit) |
| Pepperoni | https://commons.wikimedia.org/wiki/File:Luigis_Pizza_%26_Pasta_-_Pepperoni_pizza.jpg | pepperoni slices | CC0 1.0 |
| Other v3.1 ingredient photos | as listed in P041/credits.json today | olives, peppers, mushrooms, tomatoes | CC0 / CC BY as listed, kept |
| Wooden Bowl 01 / 02 | https://polyhaven.com/a/wooden_bowl_01 , https://polyhaven.com/a/wooden_bowl_02 | ingredient bowls on the tray, rendered top-down once from the model to WebP | CC0 1.0, Poly Haven |
| Wooden Cutting Board | https://polyhaven.com/a/wooden_cutting_board | the board under the pizza, rendered top-down | CC0 1.0, Poly Haven |
| Dough ball photo | to source on Wikimedia Commons (CC0 or CC BY only); if none fits, shoot-free fallback: the raw base scaled from 30% with a soft dome | #dough | verify before use |
| Marble texture | Poly Haven marble_01 (already in repo as Marble0xx) | counter behind the board | CC0 1.0 |
| Fraunces / Inter Tight / JetBrains Mono | repo assets/font + library/_kit/font | type | SIL OFL 1.1 |

Every asset gets a `.credit.json` beside it and a row in `credits.json` + the repo `CREDITS.md`. Licences re-checked on the source page on the day of download.

---

## 5. Layout, section by section (desktop 1440x900 reference / phone 390x844)

| Section | Desktop | Phone |
|---|---|---|
| Nav | logo "HOTCOAL" left x=40, links centre (Dough, Build, Fire, Menu, Visit), "Order pickup" CTA right, Concept badge after the logo. Height 72px, flour ground, 1px line under. | logo + Order button + Menu sheet; height 60px. |
| #hero | pizza on the peel centred at x=62%, y=52%, diameter 58vh; copy block left from x=7%, top 30%: tag (mono), Display XL two lines, lead 34ch, two buttons; hours chip under the buttons. | pizza top 52% of screen (diameter 86vw), copy below, buttons full width stacked. |
| #dough | sticky stage 100vh: dough centred x=60%; three labels on leader lines to the left at y=30/50/70%; section title top-left. | dough centred top 55%; labels become a 3-step row under it. |
| #build | three columns: tray 24% (2x4 bowls), board 46% (74vh square), ticket 24% (lines, total, Fire button). 64px gutters. | board top (92vw), tray as a horizontal snap rail of bowls under it (tap to add), sticky total bar at the bottom (56px). |
| #fire | sticky stage: oven mouth arch (SVG, basil ink line 3px) centred; board slides from x=20% into the arch at x=55%; clock right at x=82%, y=40%. | arch top half, clock under it, pizza fills arch width. |
| #menu | ruled list max 900px centred: name (italic display) left, toppings (body) middle, sample price + Load it right; 6 rows, 96px each. | rows stack: name, toppings, price + Load it on one line; 2px rules. |
| #visit | two columns: pickup form left 5/12, hours + address + SVG map right 6/12. | form first, then hours, then map (full width, 240px). |
| Footer | basil ground, flour text: credits link, Concept label, "Want a site like this?" Gmail + WhatsApp buttons. | same, stacked. |

---

## 6. The hero / 3D part in detail

The hero is a 2D canvas scene built to look photographic, not a 3D model (pizza photos carry the realism better than any free pizza model). One light logic for every piece: a key light from top-left at 35 deg, so every cut-out gets the same multiplied soft shadow (blur 18px, 22% basil) and a tight contact shadow (blur 3px, 40%). The board is a top-down render of the CC0 cutting board; the pizza sits on it; the peel handle runs off-frame bottom-right. Idle: the pizza turns 4 deg/s; the pointer tilts the light direction by up to 6 deg (desktop only) so shadows move a little. Phone: same canvas, same pieces, DPR capped at 2, no pointer light, a slow 2 deg/s turn. The #fire oven is drawn, not modelled: an SVG arch line, a flat ember-tint fill inside, and your pizza from #build rendered into the same canvas.

---

## 7. Motion timelines per scroll section

Progress 0.00 to 1.00 is the pinned section's own scroll progress. Reduced motion shows each section's 1.00 state as a still.

### #dough (200vh)

| Progress | What moves |
|---|---|
| 0.00-0.15 | title reveals; dough ball at 30% scale |
| 0.15-0.70 | dough scales 30%->100% while the radial mask opens; crossfade to raw base |
| 0.30 / 0.48 / 0.66 | labels 1/2/3 draw their leader lines (240ms each) and fade in |
| 0.70-1.00 | hold; the base slides down into #build |

### #fire (180vh)

| Progress | What moves |
|---|---|
| 0.00-0.20 | board slides into the arch (--ease-io); clock 00 |
| 0.20-0.90 | clock 00->90 s; pieces bake one by one; band steps flour -> 3% -> 5% -> 8% tomato tint |
| 0.78 | steam wisps (3 SVG paths, dash animation 900ms) |
| 0.90-1.00 | pizza slides back out, clock holds at 90, "Order this one" button appears |

Non-pinned sections use the shared reveal (opacity + 20px rise, 460ms, expo-out, 60ms stagger) when they enter.

---

## 8. QA checklist (all PASS before any push)

- [ ] 0 console errors and 0 failed requests at 1440x900, 390x844 and 360x740 (tools/qa-library.mjs, one headless Chrome at a time under /tmp/beast-chrome.lock).
- [ ] No horizontal overflow at any width from 320 to 1920.
- [ ] Phone = PC: the same GLB, textures and HDRI load on m.html; side-by-side plus a 200% close-up crop shows no visible loss.
- [ ] prefers-reduced-motion: every pinned section shows its end-state still; nothing moves on its own; the page still tells the whole story.
- [ ] WebGL off: poster + full copy, no blank canvas, no thrown error (makeRenderer wrapped in try/catch).
- [ ] LCP < 2.5 s on a throttled 4G phone profile (poster is the LCP element), CLS < 0.1, 3D waits until its section is near.
- [ ] Weight budget: first screen <= 600 KB; whole page <= 6 MB desktop and phone (models meshopt, textures WebP/KTX2).
- [ ] Contrast >= 4.5:1 for all text (computed and written in qa.json); visible focus ring; every hover effect has a tap/press twin; keyboard works for every interaction.
- [ ] Honesty: "Concept" badge in the nav and the footer; every form ends in a "Concept: not sent" state; sample prices, hours and address are marked as sample; no reviews, ratings, client logos or invented numbers.
- [ ] Credits sheet lists every asset with author, source URL and exact licence; CREDITS.md updated; no AI-generated image anywhere; no emoji on the page; no em dashes in page copy.
- [ ] Palette check: only the three colours plus their tints; no black, no purple, no gradient fills.
- [ ] Design every state: loading (real progress), empty, invalid, sending, success, disabled, WebGL-off, offline image fallback.
- [ ] Security: no inline secrets, CSP meta in place, form does not post anywhere, secret scan clean before any push.
- [ ] A separate reviewer (not the builder) signs off against this spec; any change is written back into this file first.
- [ ] Your pizza in #fire is pixel-identical (same pieces, same positions) to the one built in #build; an empty board shows a plain margherita instead, labelled so.
- [ ] Drag works with mouse, touch and keyboard (arrow keys move the snap ring, Enter drops).
- [ ] Every ingredient photo on the page appears in the credits sheet with its CC BY author line.

---

## 9. Storyboard

The storyboard frames are wireframes drawn by hand in code (no generated art). They are in Sujon's PDF summary `/home/user/tab/files/zyqor_best4_specs.pdf` and as images next to this file: `hotcoal-kitchen_frame_<n>.png` (one per beat).


---

## 10. Build notes (Oct 30 2026): what changed from this spec, written back

1. **No three.js / GLB / HDRI on this page.** Section 6 already makes the hero a 2D canvas; the build loads no 3D at all, so the import map, GLTFLoader, MeshoptDecoder and RGBELoader in section 2 are not used (lighter page, nothing to fall back from). The QA "phone loads the same GLB/HDRI" line is met as "phone loads the same photos and the same renderer (pizza.js)".
2. **Bowls and board** are not top-down renders of Poly Haven wooden_bowl_01/02 and wooden_cutting_board. They use the already-credited Poly Haven "Kitchen Wood" texture (Rob Tuytel, CC0): the round board is the existing board.webp (plus a 900 px copy), the bowls are discs of the same wood with a CSS rim and three real ingredient cut-outs in each. Reason: same CC0 family, no render pipeline needed inside the time box.
3. **Peel** = the round board with a wood handle running off bottom-right (same texture). The hero pizza is shown cut in eight (v3.1's cut, approved Oct 30 2:31 PM).
4. **Dough ball**: no CC0/CC BY dough-ball photo was used; the spec's fallback applies, drawn in code (shaded dome in the crust's colour, flour specks). Credited as Zyqor Studio own work.
5. **8 ingredients**: fior di latte, cherry tomato, pepperoni, mushroom, black olive, roast pepper, red onion, basil (v3.1's artichoke left out of the tray; its files stay credited).
6. **Nav** sits under the Zyqor Library bar (kit chrome.js pills at the top), so it starts at y=60 instead of 0. Phone CTA reads "Order".
7. **#dough labels** sit at y=48/62/76 % (under the section title) instead of 30/50/70 %.
8. **#fire** clock at x=87 %, oven centred at x=53 % (the 82 % clock touched the arch at 1440). Phone: clock bottom-left, "Order this one" bottom-right, under the arch.
9. **First screen**: the live hero canvas starts after the page has loaded (poster.webp, rendered from our own hero canvas, is the first paint); ingredient photos load when #dough comes near.
10. **Reduced motion**: the oven's still is progress 0.90 (finished pizza inside the oven, clock 90, "Order this one" shown), not 1.00 (pizza slid out).
11. **Separate reviewer sign-off** (QA list): not done inside this build; the builder's own checks are in work/beast/specs/best4/hotcoal_build/.
