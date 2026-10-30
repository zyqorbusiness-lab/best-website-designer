# Ironbark Barbers (N048): BEST 4 build spec + storyboard

Best-4 pick #2 of 4 for Sujon Hoque (Zyqor Studio). Category: Barbershop (walk-ins + booking). Fictional brand, labelled "Concept" everywhere.
Written Oct 30 2026, BEFORE any code (Sujon's spec-first rule, 2:31 PM IST). Status: **approved (Sujon, 9:05 PM IST Oct 30 2026), built Oct 31 2026**. The build must match this file; any change is written back here first.

**Why this one:** Barbershops are on every US Main Street and in our call lists. Swinging a real scanned barber chair to pick your cut is instantly understood, works great with a thumb, and ends in a booking, which is exactly what an owner wants from a site.

**What exists today:** One screen: the CC0 barber chair inside a ring of six services, drag to swing, a ticket on the right. No shop, no story, no booking flow beyond the ticket.

**Idea in one line:** Walk into the shop: the lights come on, the chair swings to face the service you want, and the chalkboard writes your price. Then you book the chair.

**Three hand-made signature details:**
1. The chair is the menu: swing it and it settles on a service with a heavy detent and a small hydraulic dip.
2. The chalkboard writes each price in chalk as the chair lands (stroke animation of a hand-traced chalk path).
3. The mirror shows the shop's name painted in reverse, so it reads correctly only in the reflection.

---

## 1. Goal and story, beat by beat

Same beats on desktop and phone (phone = PC quality: same models, same textures, same effects).

| # | Section | Scroll (desktop / phone) | What the visitor feels | What happens |
|---|---|---|---|---|
| 0 | `#intro (first paint)` | 0 / 0 | "Door's open" | Poster of the chair paints first (LCP). Live scene fades in; the chair turns 180 deg into view and settles with a 2 cm hydraulic dip. |
| 1 | `#hero` | 100vh / 100svh | Relaxed, confident | Chair centred inside a ring of six services. Drag/swipe/arrow keys swing it; it snaps to the nearest service. Headline "Sit down. Pick your cut." Ticket: service, time, sample price, Book this chair. |
| 2 | `#shop` | 200vh pinned / 170svh pinned | "This is a real place" | Camera pulls back from the chair to reveal the shop built from CC0 models: ornate mirror, two hanging lamps, a stool, a shelf, the standing chalkboard, checker floor. Scroll switches the lamps on one by one (light intensity scrub). |
| 3 | `#services` | 260vh pinned / 220svh pinned | "I know what I'm getting" | Scroll swings the chair through all six services in order. Each stop: big index number, name, what's included, time, sample price; the chalkboard writes the price; the mirror text swaps. |
| 4 | `#visit-steps` | 140vh pinned / 120svh pinned | "Easy" | How a visit goes in 4 steps on a barber pole: the pole's stripes travel with scroll and each step lights up as a stripe passes (Walk in or book / Pick your cut / Hot towel finish / Pay at the chair). |
| 5 | `#book` | auto / auto | "Book it" | Service (synced with the chair), day chips, time chips, name, phone. Submit -> "Concept: not sent" panel: "Your chair is held" in the demo. |
| 6 | `#hours` | auto / auto | "When can I come?" | Hours table, sample address, "Walk-ins welcome" line, SVG map pin. Footer: credits, Concept label, studio contact. |

---

## 2. Stack, setup, folder layout

- Plain static HTML/CSS/ES modules, no build step, same as every Library concept. three.js from the repo's `vendor/three/` (MIT) via an import map; `GLTFLoader` + `MeshoptDecoder` for the CC0 models; `RGBELoader` for the HDRI.
- One scroll engine: a single `requestAnimationFrame` loop reads each pinned section's progress from `getBoundingClientRect()` (CSS `position: sticky` sections, no scroll library, no scroll-jacking). Progress is lerped 0.12 per frame. 3D renders only while its section is on screen (IntersectionObserver), and pauses off-screen.
- Shared kit: `library/_kit/concept.css`, `landing.css`, `landing.js`, `fx/index.js` (nav, reveals, press feedback, "Concept" badge, credits sheet).
- Desktop `index.html` and phone `m.html` are separate pages that load the SAME models, textures and HDRI (phone = PC quality). `index.html` sends coarse-pointer phones to `m.html`; `?desktop=1` keeps desktop.
- Reduced motion (`prefers-reduced-motion: reduce`): no scrubbing, no idle float, no particles; each pinned section shows its end state as a still and the copy reads top to bottom. No WebGL: the poster still plus the full copy, nothing blank.
- Contact for the studio (footer strip "Want a site like this?"): Gmail compose to zyqorbusiness@gmail.com on desktop, mailto on phone, WhatsApp +91 95479 08593. External links open in a new tab.

```
site/library/n/N048/
  index.html        desktop page
  m.html            phone page (same beats, phone layout)
  style.css         desktop layout
  m.css             phone layout
  app.js            scroll engine, UI states, form
  shop.js           three.js scene: chair, shop props, lamps, detents
  chalk.js          chalk path writer for the board
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
| --bone | #EFE7DA | page background (bone) | base |
| --slate | #17303A | headings, body, footer and chalkboard ground (slate teal, never black) | 11.3:1 on bone (AAA) |
| --red | #C8402F | about 1%: pole stripes, active service ring, focus ring | 4.05:1 on bone: graphics and 24px+ bold only |
| --red-ink (tint) | #A53D31 | CTA fill and small red text = red 80% / slate 20% | bone text on it 5.2:1 |
| --slate-2 (tint) | #42555A | secondary text = slate 80% / bone 20% | 6.4:1 on bone (AA) |
| --chalk (tint) | #E2DCD0 | chalk writing on the slate board, panel bands | 13.9:1 on slate |

### 3.3 Type (SIL OFL fonts already in the repo; `font-display: swap`, display face preloaded, fallbacks sized with `size-adjust`)

| Style | Font | Size desktop / phone | Weight | Tracking | Line-height |
|---|---|---|---|---|---|
| Display XL (hero) | Anton | clamp(5rem, 10vw, 10.5rem) / 3.8rem | 400 | 0.01em, caps | 0.9 |
| Display L (sections) | Anton | clamp(2.8rem, 4.8vw, 5rem) / 2.4rem | 400 | 0.01em, caps | 0.95 |
| Service name | Inter Tight | 2rem / 1.5rem | 700 | -0.015em | 1.1 |
| Lead | Inter Tight | 1.375rem / 1.125rem | 450 | -0.01em | 1.4 |
| Body | Inter Tight | 1.0625rem / 1rem | 400 | 0 | 1.55 |
| Price / time / index | JetBrains Mono | 1rem / 0.9375rem (index clamp(5rem,9vw,9rem)) | 400 | 0.06em | 1.2 |
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
| chair swing | angular inertia, friction 0.92/frame, detent pull 0.18 to nearest 60 deg slot | #hero, #services |
| hydraulic dip | seat drops 2 cm in 160ms and returns in 420ms (--ease-out) on each detent | chair |
| chalk write | stroke-dashoffset over 520ms per price, linear, 1 path per glyph | chalkboard |
| lamp on | intensity 0->1 over 300ms with one 40ms flicker at 20% | #shop |

---

## 4. Assets (real, credited; no AI imagery, no stock with unclear licence)

| Asset | Source URL | Use | Licence |
|---|---|---|---|
| Barber Shop Chair 01 | https://polyhaven.com/a/BarberShopChair_01 | hero chair (already in repo, meshopt GLB 428 KB) | CC0 1.0, Fernando Quinn |
| Ornate Mirror 01 | https://polyhaven.com/a/ornate_mirror_01 | wall mirror with reversed shop name | CC0 1.0, Poly Haven |
| Hanging Industrial Lamp | https://polyhaven.com/a/hanging_industrial_lamp | two lamps over the chair | CC0 1.0, Poly Haven |
| Metal Stool 01 | https://polyhaven.com/a/metal_stool_01 | waiting stool | CC0 1.0, Poly Haven |
| Standing Chalkboard 01 | https://polyhaven.com/a/standing_chalkboard_01 | price board (its slate face gets our canvas texture) | CC0 1.0, Poly Haven |
| Shelf 01 | https://polyhaven.com/a/Shelf_01 | product shelf on the back wall | CC0 1.0, Poly Haven |
| Studio Small 09 HDRI | https://polyhaven.com/a/studio_small_09 | lighting/reflections (kit) | CC0 1.0, Sergej Majboroda |
| Checker floor | code-made canvas texture (bone/slate tint tiles) + Poly Haven marble_tiles roughness map | floor | own work + CC0 |
| Anton / Inter Tight / JetBrains Mono | repo fonts | type | SIL OFL 1.1 |

Every asset gets a `.credit.json` beside it and a row in `credits.json` + the repo `CREDITS.md`. Licences re-checked on the source page on the day of download.

---

## 5. Layout, section by section (desktop 1440x900 reference / phone 390x844)

| Section | Desktop | Phone |
|---|---|---|
| Nav | wordmark "IRONBARK" (Anton) left x=40, links (Shop, Services, Visit, Hours), "Book a chair" right; Concept badge. | wordmark + Book + Menu sheet. |
| #hero | title block left from x=6%, top 28% (tag, Display XL 2 lines, lead); chair centred x=55%, y=55%, 62vh tall, inside a 70vh service ring (6 labels on the ring); ticket card right x=78-95%, y=35%. | chair top 50%; the ring becomes a snap rail of 6 chips under it that follows the chair; title, then ticket with two 52px buttons. |
| #shop | full-bleed sticky canvas; camera dolly from 1.6 m to 4.2 m; section title bottom-left over a bone panel (flat, 92% opacity). | same camera path, framed 9:16; title under the canvas. |
| #services | canvas left 58% (chair + chalkboard + mirror), copy right 42%: index number, name, includes list, time + price row. | canvas top 55%, copy below; a 6-dot progress rail on the right edge. |
| #visit-steps | vertical barber pole (SVG, 120px wide) at x=50%; steps alternate left/right of it. | pole at the left edge (56px), steps to its right. |
| #book | form card centred max 720px: service select (mirrors the chair), day chips row, time chips grid 4x3, name, phone, submit. | full width, chips 2 rows scroll horizontally, sticky submit. |
| #hours | hours table left, address + map right. | stacked. |
| Footer | slate ground, bone text, credits, Concept, studio contact. | stacked. |

---

## 6. The hero / 3D part in detail

Real-time three.js scene, the same on desktop and phone. The chair GLB is the hero at full detail (4,280 triangles, 1K WebP PBR maps). ACES filmic tone mapping, exposure 1.0, the Studio Small 09 HDRI for reflections (environment only, background is the bone colour), one warm key spot light from the hanging lamp position (casts the only real-time shadow, 1024 map, PCF soft), and a contact shadow plane under the chair base. Interaction: horizontal drag maps to chair yaw (1 px = 0.35 deg), released with inertia; six detents every 60 deg, one per service; on each detent the seat dips 2 cm and returns. Arrow keys step one service. The shop models load only when #shop is 1 screen away. Phone: same GLBs and HDRI, DPR max 2, shadow map 1024, swipe instead of drag; if the frame time stays above 24 ms for 2 s, the lamp shadow switches to the baked contact shadow only (stated in qa.json).

---

## 7. Motion timelines per scroll section

Progress 0.00 to 1.00 is the pinned section's own scroll progress. Reduced motion shows each section's 1.00 state as a still.

### #shop (200vh)

| Progress | What moves |
|---|---|
| 0.00-0.40 | camera dollies back 1.6 m -> 4.2 m and rises 0.3 m (--ease-io) |
| 0.25 / 0.45 | lamp 1 / lamp 2 switch on |
| 0.40-0.70 | mirror, shelf, stool, chalkboard fade from bone silhouettes to full material (300ms each, triggered) |
| 0.70-1.00 | hold; title reveals |

### #services (260vh)

| Progress | What moves |
|---|---|
| 6 equal slots | chair swings 60 deg per slot (--ease-io, 600ms when triggered, scrubbed in between) |
| each slot start | index number counts up, copy block reveals, chalk writes the price, mirror name swaps |

### #visit-steps (140vh)

| Progress | What moves |
|---|---|
| 0.00-1.00 | pole stripes translate 0 -> 400px |
| 0.15 / 0.38 / 0.61 / 0.84 | steps 1-4 light up (red index, slate text) |

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
- [ ] Chair detents land exactly on each service at 60 fps on desktop and on a mid Android (or the fallback is stated).
- [ ] The service picked on the chair is the one pre-filled in the booking form, and changing the form swings the chair.
- [ ] Mirror text reads correctly in the reflection and is aria-hidden; the real shop name is in the HTML.

---

## 9. Storyboard

The storyboard frames are wireframes drawn by hand in code (no generated art). They are in Sujon's PDF summary `/home/user/tab/files/zyqor_best4_specs.pdf` and as images next to this file: `ironbark-barbers_frame_<n>.png` (one per beat).


## 10. Build notes (Oct 31 2026): what changed from this spec, written back

1. **Status:** approved by Sujon ("Ok", 9:05 PM IST Oct 30 2026) and built in place at site/library/n/N048/ (same URL, the Library cards on / and /m/ already point there; sitemap unchanged).
2. **No shared kit concept.css / landing.css / landing.js / fx** (section 2): those load Fontshare fonts. The page carries its own reveal (opacity + 20px rise, 460 ms, 60 ms stagger), press feedback and nav, plus the Library chrome (chrome.js: top bar, credits sheet, honest footer). Fonts are Anton, Inter Tight, JetBrains Mono only (self-hosted, OFL).
3. **One sticky canvas for #shop and #services** instead of two canvases: the two pinned sections share one shop scene (shop.js), so the scene loads once. Desktop #services frames the scene in the left 58% with a camera view offset and the copy panel sits on the right 42%; phone frames it in the top 55% with the copy panel below. #shop keeps 200vh / 170svh and #services 260vh / 220svh.
4. **The hero chair and the shop chair are one download**: the shop clones the hero's parsed chair. Shop props (lamp, stool, chalkboard, shelf) use 512 px WebP textures, the chair and the mirror 1024 px, so the page fits the Library's normal-tier weight budget (qa-library: own 1296 KB desktop / 1286 KB phone, budget 1536). Phone and desktop load exactly the same files.
5. **Chalkboard**: the price is written on a canvas plane laid on the board's front face (not on the scan's own board texture), with hand-traced single-stroke digits sampled into points and drawn in three thin jittered passes for chalk grain, 520 ms per glyph. The board also carries the shop name, service name and time, and "sample price".
6. **Mirror**: the shop name and the current service are painted on the mirror glass (canvas, aria-hidden; the real name is in the HTML) and read correctly there, as the reflection of reversed window lettering. The window itself is not modelled.
7. **Scale**: the mirror scan is scaled 2.15x to wall-mirror size; every other scan is at its real size.
8. **Lamps**: lamp 1 at x = 0.95 and lamp 2 at x = -0.95 (spec: "over the chair") so they do not cover the mirror lettering from the camera. Lights-off state is dim, not dark (no black frames).
9. **Phone shadow fallback**: when the shop's frame time stays above 24 ms for 2 s on the phone, the lamp shadow switches off and the contact shadow under the chair stays (window.__ironbark.shadowFallback). Desktop keeps the real-time shadow.
10. **Phone #book submit is not sticky** (section 5 says sticky submit): the hard rule "sticky bottom bars must never cover labels or text" wins; the submit is the full-width last button of the form.
11. **Hero ring labels** show time and sample price ("35 min · $35"); the phone rail chips show name and price. Arrow keys on the focused chair step one service.
12. **Separate reviewer sign-off** (QA list): not done inside this build; the builder's own checks are in work/beast/specs/best4/ironbark_build/.
