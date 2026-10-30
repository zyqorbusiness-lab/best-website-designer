# Glint Eyewear (N014): BEST 4 build spec + storyboard

Best-4 pick #4 of 4 for Sujon Hoque (Zyqor Studio). Category: Independent optician + eyewear shop. Fictional brand, labelled "Concept" everywhere.
Written Oct 30 2026, BEFORE any code (Sujon's spec-first rule, 2:31 PM IST). Status: **approved by Sujon (Oct 30 2026, 9:05 PM IST) and built Oct 31 2026; see section 10**. The build must match this file; any change is written back here first.

**Why this one:** Independent opticians are a well-paying US small business with very few good websites. Real-time refraction through a real scanned lens, bending the eye chart behind it, is the strongest "how did they do that" moment in our library, and it leads straight to booking an eye exam.

**What exists today:** One screen: the CC0 round spectacles float in front of a canvas eye chart; slide them and the lenses bend the letters; a +/- lens control. No frames, exam or booking story.

**Idea in one line:** An optician's chart wall: slide real glasses across it and watch the lenses bend the letters, see how the frame is built, choose a finish, then book an eye exam.

**Three hand-made signature details:**
1. Real refraction: the chart behind the lens bends through the scanned lens shape; plus lenses magnify, minus lenses shrink.
2. "Which is clearer, 1 or 2?": two lens previews side by side, like the real exam, just for fun (clearly labelled not a test).
3. The fit drawing measures the real model: lens width, bridge and temple lengths come from the GLB's own geometry.

---

## 1. Goal and story, beat by beat

Same beats on desktop and phone (phone = PC quality: same models, same textures, same effects).

| # | Section | Scroll (desktop / phone) | What the visitor feels | What happens |
|---|---|---|---|---|
| 0 | `#intro (first paint)` | 0 / 0 | "Clean, clinical, friendly" | Poster paints first (LCP). Live: the chart rows type in top to bottom (40ms per row, no blur), then the spectacles drop 12 mm into place and settle. |
| 1 | `#hero` | 100vh / 100svh | "Oh, the letters bend!" | Glasses float in front of the chart; drag/swipe slides them sideways with inertia; the lenses bend the letters behind. Lens control -3 to +3. Headline "See the difference." |
| 2 | `#frames` | 220vh pinned / 180svh pinned | "Well made" | Scrub: the glasses turn to a 3/4 view; lenses, rims, bridge and temples separate along their axes; four leader-line labels draw in. (If the GLB is one mesh, this beat becomes an orbit + material macro, decided at build time and written back here.) |
| 3 | `#finishes` | 160vh pinned / 140svh pinned | "I want that one" | Scroll steps through 4 rim finishes: Tortoise, Cobalt, Clear mist, Gold wire. The page tints toward each in flat steps. Chips let you pick one directly. |
| 4 | `#exam` | auto (interactive) / auto | "Fun, then serious" | "Which is clearer, 1 or 2?" Two lens previews over the same chart row; tap one, the next pair loads; after 3 picks: "Real answers come from a real exam. Book one." |
| 5 | `#fit` | auto / auto | "It'll fit me" | SVG fit drawing of the frame front and side with dimension lines that draw in: lens width, bridge, temple (mm, measured from the model). |
| 6 | `#book` | auto / auto | "Book my exam" | Exam booking form (exam type, day, time, name, contact) -> "Concept: not sent". Hours, sample address, "Bring your current glasses". Footer. |

---

## 2. Stack, setup, folder layout

- Plain static HTML/CSS/ES modules, no build step, same as every Library concept. three.js from the repo's `vendor/three/` (MIT) via an import map; `GLTFLoader` + `MeshoptDecoder` for the CC0 models; `RGBELoader` for the HDRI.
- One scroll engine: a single `requestAnimationFrame` loop reads each pinned section's progress from `getBoundingClientRect()` (CSS `position: sticky` sections, no scroll library, no scroll-jacking). Progress is lerped 0.12 per frame. 3D renders only while its section is on screen (IntersectionObserver), and pauses off-screen.
- Shared kit: `library/_kit/concept.css`, `landing.css`, `landing.js`, `fx/index.js` (nav, reveals, press feedback, "Concept" badge, credits sheet).
- Desktop `index.html` and phone `m.html` are separate pages that load the SAME models, textures and HDRI (phone = PC quality). `index.html` sends coarse-pointer phones to `m.html`; `?desktop=1` keeps desktop.
- Reduced motion (`prefers-reduced-motion: reduce`): no scrubbing, no idle float, no particles; each pinned section shows its end state as a still and the copy reads top to bottom. No WebGL: the poster still plus the full copy, nothing blank.
- Contact for the studio (footer strip "Want a site like this?"): Gmail compose to zyqorbusiness@gmail.com on desktop, mailto on phone, WhatsApp +91 95479 08593. External links open in a new tab.

```
site/library/n/N014/
  index.html        desktop page
  m.html            phone page (same beats, phone layout)
  style.css         desktop layout
  m.css             phone layout
  app.js            scroll engine, UI states, form
  lens.js           refraction shader + render target
  chart.js          eye chart canvas texture
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
| --mist | #E2EAEE | page background (clinic mist) | base |
| --tortoise | #3B2A1E | chart letters, headings, body, footer (warm brown, never black) | 11.2:1 on mist (AAA) |
| --cobalt | #2F58DE | about 1%: CTA, lens value, active finish, focus ring | 4.8:1 on mist (AA); mist text on it 4.8:1 |
| --tortoise-2 (tint) | #5C5048 | secondary text = tortoise 80% / mist 20% | 6.4:1 on mist (AA) |
| --cobalt-band (tint) | #D4DEED | finish band and exam panel = mist 92% / cobalt 8% | tortoise on it 10.1:1 |
| --line (tint) | #C3CDD2 | hairlines, dimension lines | decorative |

### 3.3 Type (SIL OFL fonts already in the repo; `font-display: swap`, display face preloaded, fallbacks sized with `size-adjust`)

| Style | Font | Size desktop / phone | Weight | Tracking | Line-height |
|---|---|---|---|---|---|
| Chart letters | Archivo (wdth 100) | row 1 = 18vh, each row 0.8x the one above | 800 | 0.18em | 1 |
| Display XL (hero) | Archivo (wdth 112) | clamp(4.5rem, 9vw, 9.5rem) / 3.4rem | 800 | -0.035em | 0.9 |
| Display L (sections) | Archivo (wdth 106) | clamp(2.6rem, 4.4vw, 4.6rem) / 2.3rem | 750 | -0.025em | 0.96 |
| Lead | Inter Tight | 1.375rem / 1.125rem | 450 | -0.01em | 1.4 |
| Body | Inter Tight | 1.0625rem / 1rem | 400 | 0 | 1.55 |
| Dioptre / mm / labels | JetBrains Mono | 0.8125rem / 0.75rem (dioptre readout clamp(4rem,8vw,8rem)) | 400 | 0.08em caps | 1.3 |
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
| slide | drag 1 px = 1.2 mm of glasses travel, inertia friction 0.9/frame, soft walls at the chart edges | #hero |
| lens strength | dioptre eases to the new value over 420ms (--ease-out); refraction strength follows | #hero, #exam |
| explode | each part moves along its own axis up to 14 mm, --ease-io, scrubbed | #frames |
| dimension draw | stroke-dashoffset 600ms each, 120ms stagger, numbers count up | #fit |

---

## 4. Assets (real, credited; no AI imagery, no stock with unclear licence)

| Asset | Source URL | Use | Licence |
|---|---|---|---|
| Round Spectacles | https://polyhaven.com/a/round_spectacles | hero glasses, same GLB on phone and desktop (683 KB, 11,810 tris) | CC0 1.0, Sean Buckley |
| Magnifying Glass 01 | https://polyhaven.com/a/magnifying_glass_01 | #exam: the "1 or 2" lens frames | CC0 1.0, Poly Haven |
| Vintage Wooden Drawer 01 | https://polyhaven.com/a/vintage_wooden_drawer_01 | #finishes: the frame drawer the glasses rest on | CC0 1.0, Poly Haven |
| Studio Small 09 HDRI | https://polyhaven.com/a/studio_small_09 | lighting + lens reflections | CC0 1.0, Sergej Majboroda |
| Eye chart, fit drawing | code-made (canvas texture; SVG) | hero chart, #fit | own work |
| Archivo / Inter Tight / JetBrains Mono | repo fonts | type | SIL OFL 1.1 |

Every asset gets a `.credit.json` beside it and a row in `credits.json` + the repo `CREDITS.md`. Licences re-checked on the source page on the day of download.

---

## 5. Layout, section by section (desktop 1440x900 reference / phone 390x844)

| Section | Desktop | Phone |
|---|---|---|
| Nav | wordmark GLINT left x=40, links (Lenses, Frames, Finishes, Exam, Visit), "Book an eye exam" right; Concept badge. | wordmark + Book + Menu sheet. |
| #hero | title + lens control left 4/12 (tag, Display XL, lead, -3..+3 stepper with big mono readout, CTA); chart wall right 7/12, 86vh tall, glasses in front at y=48%. | chart and glasses top 52%, swipe to slide; title under it; full-width lens stepper (56px buttons). |
| #frames | sticky canvas centre; 4 labels on leader lines, 2 left 2 right. | canvas top 60%, labels as a numbered list under it matching numbered dots on the model. |
| #finishes | drawer + glasses canvas left 7/12; finish name + chips right 5/12. | canvas top, chips row, name. |
| #exam | panel centred max 960px: two round lens previews side by side (40% each), "1" and "2" buttons under them, progress 1/3. | lenses stacked? No: side by side at 44vw each; buttons full width under. |
| #exam | panel centred max 960px: two round lens previews side by side (40% each), "1" and "2" buttons under them, progress 1/3. | two lens previews side by side at 44vw each; 1 and 2 buttons full width under them. |
| #book | form left 6/12, hours + address right 5/12. | stacked, sticky submit. |
| Footer | tortoise ground, mist text. | stacked. |

---

## 6. The hero / 3D part in detail

Real-time three.js, the same on desktop and phone. The chart is drawn once to a 2048 px canvas texture on a plane 0.6 m behind the glasses. Refraction: the chart plane is rendered to a render target each frame the glasses move; the lens meshes use a custom shader that samples that target with UVs offset by the lens normal times the dioptre strength (plus = magnify toward the centre, minus = shrink), plus the HDRI reflection with a Fresnel term and a faint coating tint (cobalt at 6%). This is cheaper and sharper than MeshPhysicalMaterial transmission and looks the same on phone. Frame: the GLB's own PBR materials, ACES, Studio Small 09 HDRI, contact shadow on the chart ledge. Phone: same GLB, same shader, render target 1024 px, DPR max 2; swipe instead of drag; the stepper replaces the scroll wheel.

---

## 7. Motion timelines per scroll section

Progress 0.00 to 1.00 is the pinned section's own scroll progress. Reduced motion shows each section's 1.00 state as a still.

### #frames (220vh)

| Progress | What moves |
|---|---|
| 0.00-0.25 | glasses rotate from front to 3/4 view (--ease-io) |
| 0.25-0.70 | parts separate; labels 1-4 draw at 0.35/0.45/0.55/0.65 |
| 0.70-0.90 | parts return |
| 0.90-1.00 | hold, title reveals |

### #finishes (160vh)

| Progress | What moves |
|---|---|
| 4 equal slots | rim material swaps to the slot's finish (300ms crossfade); page band steps to that finish's tint; finish name reveals |

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
- [ ] Refraction stays sharp (no smearing) at 200% zoom crops on desktop and phone; plus magnifies and minus shrinks, plain = no bend.
- [ ] The "1 or 2" section says plainly it is a demo, not a vision test.
- [ ] Fit numbers come from the model's measured bounding boxes and are written in qa.json.

---

## 9. Storyboard

The storyboard frames are wireframes drawn by hand in code (no generated art). They are in Sujon's PDF summary `/home/user/tab/files/zyqor_best4_specs.pdf` and as images next to this file: `glint-eyewear_frame_<n>.png` (one per beat).

---

## 10. Build notes (Oct 31 2026): what changed from this spec, written back

1. **Status:** approved by Sujon ("Ok", 9:05 PM IST Oct 30 2026) and built in place at site/library/n/N014/ (same URL; the Library cards on / and /m/ already point there; sitemap unchanged).
2. **Fonts: no swap needed.** The spec already named SIL OFL faces only (Archivo, Inter Tight, JetBrains Mono, all self-hosted in the repo); no Fontshare face is named or loaded. The old N014 page used Fontshare Cabinet Grotesk + Satoshi through the shared kit concept.css; the new page drops concept.css / landing.css / landing.js / fx entirely (section 2 listed them as the shared kit) and carries its own reveal (opacity + 20px rise, 460 ms, 60 ms stagger), press feedback, nav and menu sheet, plus the Library chrome (chrome.js). Archivo is the variable file (wght 100-900, wdth 62-125), so the spec's wdth 106 / 112 values are real font-stretch settings.
3. **Refraction without a render target.** Section 6 described rendering the chart to a render target. The chart is a flat plane, so the lens shader intersects the bent ray with the chart plane analytically and samples the 2048 px chart texture directly: per lens pixel the view ray is refracted by the scanned lens's own normal (Snell, ior 1.5, weighted 0.06 because a real lens's two faces mostly cancel) and the hit point is scaled around that lens's centre by 1 + 0.11 x dioptre (+3 = 1.33x larger, -3 = 0.67x). Same result, sharper (no resampling) and cheaper; HDRI reflection + Fresnel kept from MeshStandardMaterial, coating tint cobalt 2% (6% read as a purple cast over the tortoise letters). Same shader on phone.
4. **Slide speed:** the glasses track the finger 1:1 in screen space (the spec's "1 px = 1.2 mm" moved them about 3x faster than the pointer at this camera distance and felt loose); inertia friction 0.9 per frame and soft walls kept. Lens control steps 0.50 D from -3.00 to +3.00, eases over 420 ms; +1.50 at load so the bend reads at once. Keyboard: arrows slide, +/- change the lens.
5. **#frames: the GLB is one mesh but splits cleanly.** Its two primitives contain 13 separate connected pieces; the page finds them at load (union-find over welded vertices) and groups them as lenses, front (rims + bridge, one piece), temples (with their hinge parts) and nose pads (clear pads + arms). They move along their own axes up to 14 mm as specified. Leader labels sit in fixed slots (left 26% / 60%, right 26% / 60%) with lines drawn to the projected part; the phone shows numbered dots on the model and the numbered list under it.
6. **Measured from the model** (bounding boxes of those pieces, written to qa.json): lens width 43 mm, lens height 43 mm, bridge 23 mm, temple 146 mm, front 118 mm. The hero, the frame labels and the #fit drawing read these numbers at runtime; the HTML carries the same numbers as the no-WebGL fallback.
7. **#finishes drawer** is the CC0 Vintage Wooden Drawer 01 (a 1.7 m chest in the scan) scaled to a tabletop frame drawer (0.34x); it rises into view only in #finishes, its top middle drawer slides open, and the frame rests on its top. Desktop: the subject sits in the left 7/12 through a camera view offset, the finish panel on the right sits on the flat band colour.
8. **Finishes:** one physical material on the frame pieces, crossfaded over 300 ms (colour, metalness, roughness, opacity; the map swaps at the midpoint). Tortoise is a canvas pattern drawn in code (amber, mid and deep browns), Cobalt is the cobalt token, Clear mist is mist at 50% opacity, Gold wire is #C9A36A at metalness 0.55. The scan's wire is dark gunmetal, so the hero shows it as gold wire too (scanned normal + roughness maps kept). Band tints per finish: #D9DDDE / #D4DEED / #E2EAEE / #DCDFDF (flat steps). The spec's "page tints" is applied to the pinned studio band, not the whole page.
9. **#exam magnifiers:** the scan's ring and handle are near-black plastic; they are shown in warm tortoise brown (#6B4A2E) with the scanned normal and roughness maps kept (no black on the page). Lens glass is the refraction shader with a small disc blur; pairs: sharp vs 16 px blur, 7 px vs sharp, sharp vs 3 px; after three picks: "Real answers come from a real exam. Book one." The section says it is a demo, not a vision test.
10. **Hero type size:** Display XL is clamp(4rem, 6.4vw, 8rem) instead of clamp(4.5rem, 9vw, 9.5rem); at 1440 the spec size ran "difference." into the chart wall in a 4-5 column copy area.
11. **Phone #book submit is not sticky** (section 5 said "sticky submit"): the rule "sticky bottom bars must never cover labels or text" wins; the submit is the full-width last button of the form. No other sticky bottom bar exists on the page.
12. **Reduced motion:** no intro typing or drop, no idle float, no scrub; #frames shows the exploded still with all four labels, #finishes the drawer still (chips still switch finishes, instantly); each pinned block is 100vh.
13. **Not done in this build:** throttled-4G LCP measurement and the separate reviewer sign-off (QA list). The builder's own checks (qa-library VERDICT PASS on all seven runs, screenshots, live check) are in work/beast/specs/best4/glint_build/.
