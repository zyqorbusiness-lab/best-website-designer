# Loomhouse Tailors (N001): BEST 4 build spec + storyboard

Best-4 pick #3 of 4 for Sujon Hoque (Zyqor Studio). Category: Tailor + alterations shop. Fictional brand, labelled "Concept" everywhere.
Written Oct 30 2026, BEFORE any code (Sujon's spec-first rule, 2:31 PM IST). Status: **approved by Sujon ("Ok", 9:05 PM IST Oct 30 2026); built Oct 31 2026, see section 10**. The build must match this file; any change is written back here first.

**Why this one:** Tailors and alteration shops are a real group in our US leads (we are following up Magic Alterations right now). Pointing at a swatch and watching real scanned cloth flood the hanging length is the most elegant effect we own, and alterations give the site a clear money service.

**What exists today:** One editorial screen: a code-made hanging cloth with four real Poly Haven cloth scans, swatch rail, colour flood across the page. Fonts include Fontshare faces that are under licence review.

**Idea in one line:** A tailor's cloth room: the tape measure loads the page, the cloths hang one by one, you set a hem with a chalk line, and book a fitting.

**Three hand-made signature details:**
1. Preloader is a real tape measure: its blade extends with REAL load progress, inch by inch.
2. Pointing at a pinked swatch floods the hanging cloth from that exact spot and re-themes the page from the cursor.
3. Drag the tailor's chalk line on a trouser leg to set a hem; the alteration ticket updates as you drag.

---

## 1. Goal and story, beat by beat

Same beats on desktop and phone (phone = PC quality: same models, same textures, same effects).

| # | Section | Scroll (desktop / phone) | What the visitor feels | What happens |
|---|---|---|---|---|
| 0 | `#intro (first paint)` | 0 / 0 | "Measured, careful" | Poster of the hanging cloth paints first (LCP). The CC0 measuring tape sits top-left; its blade extends 0 -> 60 inches with real loading progress, then retracts with a snap as the cloth goes live. |
| 1 | `#hero` | 100vh / 100svh | Elegant, personal | Cloth hangs right from a lacquered rod, swaying slowly. Pinked swatch rail left. Headline "Cut for you. Altered to last." Pointing/tapping a swatch floods the cloth from that spot and re-themes the page. |
| 2 | `#cloths` | 4 x 100vh pinned / 4 x 85svh pinned | "Feel the cloth" | Four chapters: Denim, Glen check wool, Crepe satin, Jacquard. Each chapter floods the cloth to its fabric, then the camera pushes into a macro of the weave (real 2K normal maps hold up); copy says what each cloth is good for. |
| 3 | `#alterations` | auto (interactive) / auto | "They fix my clothes too" | A trouser leg drawn in SVG with a chalk line. Drag it up/down to set the hem (in inches); pick Hem / Take in / Let out / Zip; a ticket shows the job and a sample price. |
| 4 | `#fitting` | 160vh pinned / 140svh pinned | "I know what to expect" | How a fitting goes, on a tape measure that scrolls sideways: steps sit at 12, 24, 36 and 48 inch marks (Measure / Choose cloth / First fitting / Collect). |
| 5 | `#book` | auto / auto | "Book a fitting" | Form: service, preferred day, name, phone or email. Ends in a "Concept: not sent" panel. Visit details beside it. |
| 6 | `Footer` | auto / auto | Trust | Hours, sample address, credits, Concept label, studio contact. |

---

## 2. Stack, setup, folder layout

- Plain static HTML/CSS/ES modules, no build step, same as every Library concept. three.js from the repo's `vendor/three/` (MIT) via an import map; `GLTFLoader` + `MeshoptDecoder` for the CC0 models; `RGBELoader` for the HDRI.
- One scroll engine: a single `requestAnimationFrame` loop reads each pinned section's progress from `getBoundingClientRect()` (CSS `position: sticky` sections, no scroll library, no scroll-jacking). Progress is lerped 0.12 per frame. 3D renders only while its section is on screen (IntersectionObserver), and pauses off-screen.
- Shared kit: `library/_kit/concept.css`, `landing.css`, `landing.js`, `fx/index.js` (nav, reveals, press feedback, "Concept" badge, credits sheet).
- Desktop `index.html` and phone `m.html` are separate pages that load the SAME models, textures and HDRI (phone = PC quality). `index.html` sends coarse-pointer phones to `m.html`; `?desktop=1` keeps desktop.
- Reduced motion (`prefers-reduced-motion: reduce`): no scrubbing, no idle float, no particles; each pinned section shows its end state as a still and the copy reads top to bottom. No WebGL: the poster still plus the full copy, nothing blank.
- Contact for the studio (footer strip "Want a site like this?"): Gmail compose to zyqorbusiness@gmail.com on desktop, mailto on phone, WhatsApp +91 95479 08593. External links open in a new tab.

```
site/library/n/N001/
  index.html        desktop page
  m.html            phone page (same beats, phone layout)
  style.css         desktop layout
  m.css             phone layout
  app.js            scroll engine, UI states, form
  cloth.js          three.js cloth, shaders, flood
  tape.js           measuring-tape preloader
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
| --rose | #F6E2E5 | page background (rose paper); type on the dark satin chapter | base |
| --moss | #293E20 | headings, body, satin chapter ground, footer (never black) | 9.4:1 on rose (AAA) |
| --fern | #3B8C5F | about 1%: active swatch ring, chalk seam, focus ring, jacquard colourway | 3.3:1 on rose: rings and graphics only |
| --fern-ink (tint) | #357149 | CTA fill = fern 65% / moss 35% | rose text on it 4.7:1 |
| --moss-2 (tint) | #525F47 | secondary text = moss 80% / rose 20% | 5.5:1 on rose (AA) |
| theme tints | rose->moss 10%, rose->fern 14% | Glen check and Jacquard page themes (flat) | all text re-checked per theme |

### 3.3 Type (SIL OFL fonts already in the repo; `font-display: swap`, display face preloaded, fallbacks sized with `size-adjust`)

| Style | Font | Size desktop / phone | Weight | Tracking | Line-height |
|---|---|---|---|---|---|
| Wordmark | Instrument Serif | 1.5rem / 1.25rem | 400 | 0.14em, caps | 1 |
| Display XL (hero) | Instrument Serif | clamp(4.5rem, 9vw, 9rem) / 3.4rem | 400 | -0.02em | 0.92 |
| Cloth names | Instrument Serif italic | clamp(2.6rem, 4.5vw, 4.8rem) / 2.3rem | 400 | -0.01em | 1 |
| Lead | Inter Tight | 1.375rem / 1.125rem | 400 | -0.01em | 1.45 |
| Body | Inter Tight | 1.0625rem / 1rem | 400 | 0 | 1.6 |
| Measures / tags | JetBrains Mono | 0.8125rem / 0.75rem | 400 | 0.08em, caps | 1.3 |
| Button | Inter Tight | 1.0625rem | 600 | 0.01em | 1 |

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
| cloth flood | reveal circle grows in cloth-UV space 0 -> 1.6 radius over 900ms, --ease-out; ripple amplitude 6 mm decays over 1.2 s | #hero, #cloths |
| page flood | clip-path circle() from the pointer, 700ms, --ease-out, swaps the CSS theme at the end | #hero |
| tape blade | extends with load progress (real bytes), snaps back 260ms | #intro |
| chalk line drag | 1 px = 1/16 inch, snaps to 1/4 inch, ticket updates live | #alterations |

---

## 4. Assets (real, credited; no AI imagery, no stock with unclear licence)

| Asset | Source URL | Use | Licence |
|---|---|---|---|
| Denim Fabric 04 | https://polyhaven.com/a/denim_fabric_04 | cloth 1 (diffuse + normal) | CC0 1.0, Poly Haven |
| Wool Boucle | https://polyhaven.com/a/wool_boucle | cloth 2, glen check (diffuse + normal) | CC0 1.0, Poly Haven |
| Crepe Satin | https://polyhaven.com/a/crepe_satin | cloth 3 (normal + roughness; our colourway) | CC0 1.0, Poly Haven |
| Quatrefoil Jacquard Fabric | https://polyhaven.com/a/quatrefoil_jacquard_fabric | cloth 4 (normal + roughness; our colourway) | CC0 1.0, Poly Haven |
| Measuring Tape 01 | https://polyhaven.com/a/measuring_tape_01 | preloader + #fitting accent | CC0 1.0, Poly Haven |
| Studio Small 09 HDRI | https://polyhaven.com/a/studio_small_09 | lighting | CC0 1.0, Sergej Majboroda |
| Cloth mesh, rod, trouser leg drawing | code-made (vertex-shader drape; SVG leg) | hero + #alterations | own work |
| Instrument Serif / Inter Tight / JetBrains Mono | repo fonts (replace Cabinet Grotesk + Satoshi, which are under licence review) | type | SIL OFL 1.1 |

Every asset gets a `.credit.json` beside it and a row in `credits.json` + the repo `CREDITS.md`. Licences re-checked on the source page on the day of download.

---

## 5. Layout, section by section (desktop 1440x900 reference / phone 390x844)

| Section | Desktop | Phone |
|---|---|---|
| Nav | wordmark LOOMHOUSE left x=40, links (The cloths, Alterations, Fittings, Visit), "Book a fitting" right; Concept badge. | wordmark + Book + Menu sheet. |
| #hero | copy + swatch rail left 5/12 (tag, Display XL, lead, 4 pinked swatches 88px, CTA); cloth right 6/12, rod at y=12%, cloth 78vh long. | cloth top 56% of screen, swatch rail as a row of 4 (72px) under it, then copy. |
| #cloths | sticky stage: cloth left 55%; cloth name (italic display) + 3 lines + "good for" chips right 45%; chapter index 01-04 top-right. | cloth top 55%, copy under it, chapter dots on the right edge. |
| #alterations | trouser-leg SVG left (60vh tall) with chalk line handle (48px); service chips + ticket right. | leg top (50vh), chips row, ticket; handle 56px for thumbs. |
| #fitting | horizontal tape (SVG ruler, 2 m long) translating left with scroll; 4 step cards pinned to inch marks above it. | same tape, steps as one card at a time above it. |
| #book | form left 6/12, visit details right 5/12. | stacked, sticky submit. |
| Footer | moss ground, rose text. | stacked. |

---

## 6. The hero / 3D part in detail

Real-time three.js cloth, the same on desktop and phone: a 120x160 segment plane hung from a lacquered rod; the vertex shader drapes it (two sine fold sets + a gravity curve), sways it (0.2 Hz, 4 mm), and runs a ripple out from the reveal point; normals are rebuilt per vertex so light reads the folds. Two cloth layers share the mesh; the fragment shader shows layer B inside a growing circle in cloth-UV space, with a 2 mm fern chalk seam on its edge. The swatch is a map of the cloth: the pointer's spot inside the 88px swatch maps to the same UV on the big cloth, so the flood starts where you pointed. Lighting: Studio Small 09 HDRI, one soft key from top-left, ACES. Macro push in #cloths: the camera moves to 0.18 m from the cloth with a 50 mm equivalent lens; the 2K normal maps are the detail (no upscaling). Phone: same mesh density, same maps, DPR max 2; tap replaces hover.

---

## 7. Motion timelines per scroll section

Progress 0.00 to 1.00 is the pinned section's own scroll progress. Reduced motion shows each section's 1.00 state as a still.

### #cloths (4 x 100vh)

| Progress | What moves |
|---|---|
| each chapter 0.00-0.25 | flood to that cloth from the cloth's centre; page theme swaps |
| 0.25-0.65 | camera pushes into the weave macro and back out (--ease-io) |
| 0.30-0.50 | cloth name + copy reveal; chapter index ticks |
| 0.65-1.00 | hold, then next chapter |

### #fitting (160vh)

| Progress | What moves |
|---|---|
| 0.00-1.00 | tape translates 0 -> -1.6 m (scrubbed) |
| 0.12 / 0.37 / 0.62 / 0.87 | step cards 1-4 reveal as their inch mark crosses the centre line |

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
- [ ] Flood origin matches the pointer spot inside the swatch within 2% of cloth width (desktop) and the tap spot (phone).
- [ ] Every page theme passes 4.5:1 for all text, including the dark satin chapter.
- [ ] The tape preloader shows real progress (bytes loaded / total), never a fake timer, and is skipped instantly when everything is cached.

---

## 9. Storyboard

The storyboard frames are wireframes drawn by hand in code (no generated art). They are in Sujon's PDF summary `/home/user/tab/files/zyqor_best4_specs.pdf` and as images next to this file: `loomhouse-tailors_frame_<n>.png` (one per beat).

---

## 10. Build notes (Oct 31 2026): what changed from this spec, written back

1. **Status:** approved by Sujon ("Ok", 9:05 PM IST Oct 30 2026) and built in place at site/library/n/N001/ (same URL; the Library cards on / and /m/ already point there; sitemap unchanged).
2. **Font swap (Fontshare out):** the old page used Cabinet Grotesk (display) and Satoshi (body) from Fontshare through the shared kit concept.css. They are replaced by Google Fonts / SIL OFL faces already self-hosted in the repo: **Cabinet Grotesk -> Instrument Serif** (wordmark, display, italic cloth names) and **Satoshi -> Inter Tight** (lead, body, buttons), with **JetBrains Mono** for measures and tags. The page no longer loads the shared kit concept.css / landing.css / landing.js / fx (section 2): it carries its own reveal (opacity + 20px rise, 460 ms, 60 ms stagger), press feedback and nav, plus the Library chrome (chrome.js: top bar, credits sheet, honest footer). No Fontshare or Mixkit file is requested.
3. **Tape preloader is drawn in code**, not the Poly Haven "Measuring Tape 01" scan: that scan is a black and yellow builder's tape with a printed brand label (black-heavy and off-palette), and showing it would need the 3D loader before first paint. The tailor's tape (moss case, rose-tint blade, moss inch ticks, fern tip) extends with real progress: bytes of the first-screen files that have finished loading / their total, read from the browser's resource timing (never a timer). It runs out to 60 in and snaps back in 260 ms when the cloth is live, and never shows if the cloth is live within 160 ms (cached). The scan is not used in #fitting either; that tape is an SVG ruler. Credits list only what the page uses.
4. **One sticky canvas for #hero and #cloths** (one cloth, one texture load). Desktop: the cloth slides from the right 6/12 (hero) to the left 55% (#cloths), and the canvas is clipped to the left 55% during the chapters so the copy on the right always sits on the flat theme ground. Phone: the cloth is pinned in the top 56% the whole way and the copy scrolls under it. Each chapter is a 100vh / 85svh block whose copy is real HTML that scrolls past the pinned cloth; the chapter index (desktop) and dots (phone) track it.
5. **Macro push depth:** the camera moves 86% of the way to the cloth for denim, 80% for glen check and jacquard and 52% for satin (phone: 72% of those), not to 0.18 m with a 50 mm lens. The scans stay at 512 to 768 px so the page fits the Library's normal-tier budget (qa-library own 771 KB desktop / 756 KB phone of 1536); 1K maps for all four cloths measured +1.4 MB. Desktop and phone load exactly the same files.
6. **Hero framing:** rod at about 15% of the viewport (spec 12%) so the hook clears the nav at 1440x900; cloth about 72vh long.
7. **Page flood:** drawn inside the sticky cloth room from the pointer (or tap) point, 700 ms expo-out; the type colour switches at 360 ms and the rest of the page takes the theme when the circle completes. Themes: denim = rose, glen check = rose->moss 10% tint, crepe satin = moss ground with rose type, jacquard = rose->fern 14% tint; every text colour re-checked per theme (moss on tints 7.9:1+, moss-2 4.66:1+, rose on moss 9.4:1).
8. **Satin swatch** is flat blush with the satin normal scan multiplied in (the old swatch used a gradient).
9. **#alterations:** Hem drags vertically (-1 1/2 to +4 in, 1 px = 1/16 in, snaps to 1/4 in); Take in (0 to 2 in) and Let out (0 to 1 in) drag horizontally along the side seam; Zip has no chalk ("measured at the counter"). The handle is a keyboard slider (arrows step 1/4 in, Home/End). Sample prices: Hem $18, Take in $28, Let out $32, Zip $22, each labelled sample price. The trouser leg is filled with the Wool Boucle scan.
10. **#fitting:** 160vh desktop / 140svh phone; the four step cards ride on the tape at 12/24/36/48 in and reveal as their mark crosses the centre line (progress .12/.37/.62/.87); the phone shows one card at a time. Reduced motion shows all four as a still list.
11. **Phone #book submit is not sticky** (section 5): the rule "sticky bottom bars must never cover labels or text" wins; the submit is the full-width last button of the form.
12. **Not done in this build:** throttled-4G LCP measurement and the separate reviewer sign-off (QA list). The builder's own checks (qa-library VERDICT PASS on all seven runs, screenshots, live check) are in work/beast/specs/best4/loomhouse_build/.
