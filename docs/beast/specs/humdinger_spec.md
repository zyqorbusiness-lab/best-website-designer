# BUILD SPEC + STORYBOARD: "Humdinger" (CONCEPT): a pocket groovebox you can play on the page

Status: approved by Sujon (Oct 31 2026, 1:32 PM IST) and built; see section 10.
Model: the Buttermax pattern (one flat loud colour, a giant wordmark, one 3D object that is the navigation). Everything here is our own: brand, product, copy, geometry, sound.
Rules applied: Sujon's process rule (Oct 30), the repo's DESIGN_RULES.md (3 colours, no black or purple, no heavy gradients, real or code assets credited, separate index.html / m.html with the SAME 3D, lazy reveal, QA gate), the scroll-world rule (we use the scroll-world *style*, a pinned scroll that scrubs the scene, with the repo's own scroll kit; the AI-clip step is replaced by a real-time Three.js scene), and "PC no compromise, phone = PC quality".

---

## 1. Goal: what it is, beat by beat
**Brand (fictional):** Humdinger Instruments. **Product:** the Humdinger H-1, a palm-size groovebox (drum machine + synth) on a lanyard.
**One-line idea:** *"A whole band that fits in your jeans pocket."* The page IS the instrument: the 3D H-1 flies, flips and opens up as you scroll, and at any point you can tap its pads to play real sound made live in the browser.
**Tag:** a fixed "CONCEPT" pill top-right on every screen, and a footer line: "Humdinger is a fictional brand. A concept site by Zyqor Studio. Nothing here is for sale."

Story in 7 beats: loader (the sequencer boots) → hero (the H-1 floats on lime, PRESS ANY PAD) → turn it over (360° flip, back details) → open it up (exploded view) → play it (a big playable device + 4-step pattern builder) → take it anywhere (the device flies through 3 flat cut-out scenes) → pocket it (it drops into a pocket, CTA + credits).

## 2. Stack, setup, folder
- Static HTML/CSS/JS, no framework, no build step. The repo's vendored libraries only: `site/vendor/three/` (three.module + RoundedBoxGeometry, RoomEnvironment, BufferGeometryUtils), `site/vendor/gsap.min.js` + `ScrollTrigger.min.js`, `site/vendor/lenis.min.js`.
- Sound: Web Audio API synthesis written in code (kick, snare, hat, clap, bass, 3 lead notes). **No audio files, so no licences.** Sound is OFF until the visitor taps "Sound on" (the browser rule), and it is remembered in sessionStorage.
- Folder (new, nothing existing touched):
```
site/showcase/humdinger/
  index.html        desktop build (heavy, full quality)
  m.html            phone build (same 3D, lighter settings)
  hd.css  hd-m.css
  js/scene.js       builds the H-1 in code (shared by both builds)
  js/story.js       ScrollTrigger timelines (desktop)
  js/story-m.js     timelines tuned for phone
  js/sound.js       Web Audio voices + sequencer
  js/nogl.js        fallback when WebGL is off
  stills/*.webp     fallback stills rendered from our own scene (8 poses, desktop + phone sizes)
  fonts/*.woff2 + OFL.txt + *.credit.json
  CREDITS.md
```
- Redirect: the library's own phone switch (`?desktop=1` keeps desktop). Canonical + `alternate` links as on library pages. Add both URLs to `site/sitemap.xml`.

## 3. Design tokens
### Colour: exactly 3 (one job each)
| Name | Hex | Role |
|---|---|---|
| Lime | `#C6F03C` | The page. Full-bleed flat background of hero, play and pocket sections. The screen glow on the device. |
| Ink | `#1B2340` | All text, the H-1's body shell, the pads' legends, rules and lines. (Never a background colour: the "no black" rule.) |
| Cream | `#FFF4E2` | Alternate section backgrounds (flip, exploded, anywhere), the H-1's pads and knobs, buttons. |
Contrast: Ink on Lime 11.7:1, Ink on Cream 14.2:1, so all text is AAA. No gradients except the soft contact shadow under the device (Ink at 18% → 0, radial, under the object only).
*Alternative if Sujon prefers warm:* Tomato `#FF5533` / Ink `#18213A` / Cream `#FFF2DF` (Ink on Tomato 5.0:1, AA). Lime is my pick because it is loud like Buttermax's yellow but clearly not a copy, and it stays away from his own Ember orange.

### Type (Google Fonts, OFL, self-hosted woff2, Latin subset)
| Style | Font | Desktop | Phone | Weight | Tracking | Line-height |
|---|---|---|---|---|---|---|
| Wordmark | Bricolage Grotesque (variable, opsz) | clamp(180px, 22vw, 360px) | 26vw (~100px at 390) | 800 | -0.05em | 0.82 |
| H2 | Bricolage Grotesque | clamp(56px, 6vw, 96px) | 44px | 700 | -0.04em | 0.95 |
| Body | DM Sans | 19px | 17px | 400 / 500 | 0 | 1.5, max 52ch |
| Labels, pad legends, screen | JetBrains Mono (already in the kit) | 13px caps | 12px caps | 500 | 0.08em | 1.2 |
Fonts budget: ≤ 110 KB woff2 total.

### Spacing, grid, motion
- 1440 container, 12 columns, 24 px gutters; phone 20 px side padding, 4 columns. Scale 8/12/16/24/32/48/64/96. Section rhythm clamp(6rem, 12vw, 11rem).
- Text reveals (Sujon's own taste): opacity + 20 px rise, 480 ms, expo.out, no bounce, no blur, 60 ms stagger.
- 3D moves: scrubbed by scroll (Lenis smooth, `scrub: 0.6`), with power3.inOut between key poses. Playful **object** motion (a pad press squash 0.92 → 1, the device's idle float ±8 px / ±3°) is allowed because it's the product's character, not a text reveal.
- Cursor: a 14 px Ink ring that grows to 56 px over a pad and shows "TAP".

## 4. Assets
| Asset | Source | Use | Licence |
|---|---|---|---|
| H-1 device (all parts) | Built in code: RoundedBoxGeometry body, instanced rounded pads, LatheGeometry knobs with knurl, CylinderGeometry speaker holes (instanced), a CanvasTexture screen, a TubeGeometry lanyard | The hero object everywhere | Our own work. Why code instead of a CC0 model: the product is fictional and every part must move and react (16 pads press, 2 knobs turn, the screen is live, the shell explodes into layers). No CC0 model has that. The page states "3D model built in code". |
| PCB inside (exploded view) | CanvasTexture drawn in code (traces, chips as boxes) | Exploded layer | Our own |
| Environment light | three.js RoomEnvironment (generated, no HDRI file) | Reflections | MIT (three.js) |
| Scenes in "Take it anywhere" | Flat SVG cut-outs drawn by hand in code: a bus window, a desk + lamp, a festival tent line | Background shapes | Our own |
| Sounds | Web Audio synthesis in sound.js | Pads, sequencer | Our own |
| Fonts | Bricolage Grotesque (Mathieu Triay), DM Sans (Colophon/Google), JetBrains Mono (JetBrains) | Type | SIL OFL 1.1, a credit file each |
| Libraries | three.js, GSAP + ScrollTrigger, Lenis | Already vendored | MIT / GSAP standard licence (free) / MIT |
No photos, no video, no AI images, no Mixkit, no Fontshare.

## 5. The 3D object in detail (H-1)
- Size in scene: 1.0 × 1.55 × 0.16 units (a phone-ish slab, rounded radius 0.09).
- Front: a top screen (0.78 × 0.36, glossy, with the Lime glow as emissive), 2 knobs top-right (TEMPO, TONE), a 4×4 pad grid (cream rubber, Ink legends: KICK, SNARE, HAT, CLAP, BASS 1–4, LEAD 1–4, and 4 function pads PLAY / REC / SHIFT / FX), a speaker grille of 37 holes bottom-left, the "HUMDINGER" logotype printed in the corner, a lanyard loop.
- Back: a battery door with screw heads, an engraved "H-1 / DESIGNED IN A POCKET" line, rubber feet.
- Materials: body = MeshPhysicalMaterial Ink, roughness 0.38, clearcoat 0.6 (glossy plastic); pads = Cream, roughness 0.85 (rubber); knobs = Cream, metalness 0, with a knurl normal; screen = black-free: it's Ink with a Lime emissive pixel UI (a 16-step grid, a waveform, the BPM).
- Light: RoomEnvironment for reflections + one key light (warm) + a soft rim; ACES tone mapping; a contact shadow (a baked blur plane) on the flat colour; no fog.
- Budget: < 60k triangles, < 40 draw calls (pads and speaker holes instanced), 1 canvas texture 1024² (512² on phone, redrawn only when the screen changes).
- Live screen states: BOOT (loader), PRESS ANY PAD (hero), FLIP (shows a rotating icon), INSIDE (exploded), PATTERN (play section, the 16-step grid lights to the beat), TRAVEL (a tiny map dot moves), POCKET (shows "SEE YOU").

## 6. Section-by-section storyboard (desktop; phone notes in §8)
| # | Section (pinned length) | Layout | What the H-1 does at each scroll point | Copy |
|---|---|---|---|---|
| 0 | **Loader** (0–2.4 s) | Cream screen. Centre: 16 small Ink dots in a 4×4 grid. | Not shown. The dots light up one by one in real load order (fonts, three, scene built). At 100%: the 4×4 grid scales up and its rows turn into **4 Lime sine-wave bands that sweep across the screen** (our version of Buttermax's band wipe), revealing the hero. | "booting your band… 0–100" in mono |
| 1 | **Hero** (100vh, not pinned) | Lime full bleed. The giant "Humdinger" wordmark in Ink across the middle, letters slightly behind the device. Top: the logo left; pills "Inside", "Play", "Specs" centre; "CONCEPT" pill + "Sound on" toggle right. Bottom-left: a 2-line intro. Bottom-right: "scroll to flip it". | Drops in from above on load (0.9 s, power3.out, one squash on landing), then floats idle and tilts toward the cursor (max 10°). Screen: PRESS ANY PAD. **Pads work here already**: a tap plays a sound and sends a Cream ring rippling out over the Lime (2D canvas behind the wordmark). | "A whole band that fits in your jeans pocket." / "Humdinger H-1 pocket groovebox. A concept." |
| 2 | **Turn it over** (pinned 180vh) | Background wipes Lime → Cream with a vertical sine edge. Left column of 3 labels with Ink leader lines that draw to the parts. | 0% front → 50% rotated 180° on Y (back shown: battery door, feet, lanyard loop) → 100% back to the front with a 15° tilt. Leader lines draw at 30/55/80%. | "Rubber you can drum on." · "A battery door with real screws." · "A loop for your keys, your bag, your neck." |
| 3 | **Open it up** (pinned 220vh) | Cream. The device centred, labels alternating left/right. | Exploded view along Z: 0–40% the back shell, battery, PCB, pad sheet and faceplate separate (0.25 units apart) and the camera orbits 35° to a three-quarter view; 40–80% each layer gets a label + leader line; 80–100% it closes back up with a small "click" (sound if on). Screen: INSIDE. | 5 short labels: Faceplate / 16 pads / Board / Battery / Shell. No invented numbers. |
| 4 | **Play it** (pinned 250vh) | Lime. The device big (60% of the height), front-on, slightly left. Right: a 4-step "make a beat" list. | The scroll is a **guided demo**: at 0/25/50/75% the H-1 auto-presses KICK, then SNARE + HAT, then BASS, then LEAD; the screen's 16-step grid fills in and loops; each step's line on the right highlights. The visitor can tap pads at any time and turn TEMPO by dragging the knob (70–160 BPM, the screen shows it). | "1 Kick. 2 Snare + hat. 3 Bass. 4 Lead. That's a song." |
| 5 | **Take it anywhere** (pinned 300vh, horizontal) | Cream band. Three flat Ink-line cut-out scenes slide right-to-left: a bus window, a desk with a lamp, a festival tent line. | The H-1 shrinks to 35%, swings on its lanyard like it's being carried, and lands in each scene (a hand-drawn Lime glow behind it). Screen: TRAVEL, a dot moving along a line. | "On the bus." · "On your desk." · "In the field." |
| 6 | **Specs** (not pinned) | Lime. A 2-column spec sheet in mono, the device lying flat top-down beside it, rotating slowly. | Rotates 0 → 90° as the sheet scrolls past. | Product features only (16 pads, 2 knobs, built-in speaker, USB-C, lanyard). Plainly a concept: no prices, no ratings, no "users". |
| 7 | **Pocket it** (pinned 120vh) + footer | Cream. A big flat Ink-line jeans-pocket shape at the bottom. | The device flips once and drops into the pocket (it slides behind the pocket's front layer); the screen says SEE YOU. A Lime sticker pops: "CONCEPT". | "Pocket a band." Button "Join the waitlist (concept)", which opens a small note saying it's a concept. Footer: "Concept by Zyqor Studio, Sujon Hoque. Humdinger is a fictional brand." Contact: Gmail compose (desktop) / mailto (phone) + WhatsApp +91 95479 08593. Credits link. |

## 7. Loader, micro-interactions, signature details
- Loader: the real progress of the 16 dots, then the sine-band wipe (500 ms, power2.inOut). Skipped on repeat visits within a session (a 300 ms fade).
- Three hand-made signature details: (1) **sound rings**: every pad hit sends a Cream ring across the flat colour, sized by the sound (kick = big, hat = small); (2) **the screen is the menu**: hovering a nav pill previews that section's screen on the device; (3) **knob drag**: turning TEMPO speeds up the idle float and the ring rhythm.
- Hover/press feedback on every control: pads squash (scale 0.92, 90 ms), magnetic nav pills (8 px pull), buttons press 2 px down, a focus ring in Ink 2 px with a 3 px Lime offset.
- Keyboard: keys 1–8 and Q–I play the pads; Space = play/stop pattern; all pads are real `<button>`s in an off-screen grid that mirrors the 3D (so screen readers and keyboard work).

## 8. Phone plan (phone = PC quality; separate m.html)
- **Same H-1 model, same materials, same sounds.** Only the settings change: DPR cap 1.75 (desktop 2), screen texture 512², shadow plane 512², antialias on.
- 390 px layout: wordmark 26vw across the top third, the device in the middle 52% of the height, the intro at the bottom; nav collapses to the logo + "CONCEPT" + a sound toggle; section pins are 70% as long. 360 px: the same with the wordmark at 25vw and labels below the device instead of beside it (no leader lines crossing text).
- Touch: tap pads (44 px minimum hit area via the mirrored button grid), drag the device to spin it (in the hero only), drag the knob. The cursor tilt is replaced by a gentle automatic sway (no motion-permission prompt).
- "Take it anywhere" on phone: vertical instead of horizontal (the scenes stack, the device swings down between them).
- Perf budget (phone): first screen ≤ 350 KB transferred (HTML + CSS + fonts + three core), everything else lazy after first paint; 3D starts when visible and pauses off-screen and on `visibilitychange`; ≥ 50 fps on a mid Android (Moto G-class) and 60 fps on iPhone 12+.
- **WebGL off / lost context:** js/nogl.js swaps in the 8 stills (rendered from this same scene by us), crossfading per section; pads become a 2D 4×4 grid that still plays sound. No blank boxes, no errors.

## 9. Reduced motion
`prefers-reduced-motion: reduce` → no Lenis smoothing, no scroll scrub: each section shows its key pose with a 200 ms crossfade, no idle float, no rings (a static highlight instead), the loader wipe becomes a fade. Sound still works on tap. Nothing auto-plays sound.

## 10. Performance budget (desktop)
- First screen ≤ 550 KB transferred; total ≤ 1.2 MB (it's all code plus fonts, so this is easy to hold).
- three.js loaded as an ES module with only the addons named above; GSAP + ScrollTrigger + Lenis ≈ 90 KB.
- 60 fps at 1440×900 on a 2020 laptop; < 40 draw calls; no layout thrash (transforms only; the scroll-linked DOM is limited to labels).
- LCP < 2.0 s (the wordmark is the LCP element, painted before the 3D arrives), CLS 0.

## 11. QA bar (gate before Sujon sees a preview)
- 0 console errors and 0 failed requests at 1440×900, 390×844 and 360×740, plus 1440 reduced-motion and WebGL-off runs (the repo's `tools/qa-library.mjs` pattern).
- No horizontal overflow; text never covered by the device at 360 (checked with screenshots of every pinned section at 0/50/100%).
- Every pad plays on click, tap and key; the sound toggle works; the knob changes BPM; reduced motion respected.
- Same 3D on phone (one shared scene.js, asserted in the test).
- Credits: CREDITS.md + one credit file per font; `tools/credits-check.mjs` passes. Security check passes. The google-site-verification meta in site/index.html stays untouched.
- A frame-by-frame look at a 2 fps scroll capture on desktop and phone before reporting.
- Content: "CONCEPT" visible on every screen; no "AI" wording; no fake stats, reviews, prices or clients.

## 12. Build estimate
One builder, about 3–4 hours: the device in code (1 h), the scroll story desktop (1 h), the phone build + fallback stills (45 min), sound + pads (30 min), QA + polish (45 min+). Then it goes into the Best Concepts page (see best_concepts.md).

## 13. Open decisions (only Sujon)
1. Colour: Lime / Ink / Cream (my pick) or Tomato / Ink / Cream.
2. The name "Humdinger" (I found no synth brand by that name; it's tagged CONCEPT and fictional anyway). An alternative if he dislikes it: "Pocketband".
3. The device is built in code (not a downloaded model), because every part has to move and play. OK?
4. Where it lives: `/showcase/humdinger/` (my pick, outside the 300-slot library) or as a library Premium slot.


---

## 10. Build notes (Oct 31 2026, as built)
Live: https://zyqor-portfolio.vercel.app/showcase/humdinger/ (desktop `index.html`, phone `m.html`, same `js/scene.js`).

What was built, beat by beat
- Loader: 16 dots fill with real progress (modules parsed, fonts ready, 3D scene built, first frame drawn), then 4 lime sine-edged bands sweep in. Skipped (300 ms fade) on a repeat visit in the same session; a plain fade with reduced motion. A 7 s safety timer never holds the page.
- Hero: the giant wordmark sits BEHIND the device (a back layer), the device drops in with one squash, floats, tilts to the cursor (desktop) or sways (phone), and can be spun by a horizontal drag. Pads play from the first screen.
- Turn it over (pinned): 0-30 % front, 30-60 % turns 180 deg to the back (battery door, screws, feet), 68-92 % turns on to the front with a 15 deg tilt. One label at a time; on desktop an ink leader line runs from the active label to the real part (projected from 3D every frame, hidden when the part faces away).
- Open it up (pinned): 5 layers (faceplate, 16 pads, board, battery, shell) separate along Z while the device turns to three-quarter, labels arrive one by one with leader lines (desktop) or numbered markers + a list (phone), then it closes with a click (sound if on).
- Play it (pinned): guided demo; at 0/25/50/75 % the H-1 adds Kick, Snare + hat, Bass, Lead (auto-pressing those pads); the screen's 16-step grid fills and loops. Tap pads any time, drag the TEMPO knob (70-160 BPM) or use the - / + buttons, PLAY / REC / SHIFT / FX pads work (REC writes your taps into the loop, SHIFT = octave up, FX = echo). Keys 1-8 and Q-I, Space = play/stop.
- Take it anywhere (pinned): bus / desk / field line scenes slide right-to-left (desktop) or bottom-to-top (phone) while the device swings on its lanyard and lands in each one; the screen shows a travel dot.
- Specs (short pin): 7 plain rows, no prices, ratings or users; the device turns 90 deg.
- Pocket it (pinned): the device flips once and drops behind the front of a jeans pocket; the CONCEPT sticker pops; "Join the waitlist (concept)" opens a note that says it is a concept.
- Sound: all synthesised with Web Audio (no files). Off until the visitor asks: the "Sound" button, or a tap on a pad (a pad tap is the visitor asking for sound; scrolling alone never starts sound).
- WebGL off / context lost: 7 stills rendered from this same scene are placed with the same poses; in the Play section the pads become a visible 2D grid that still plays sound.

Deviations from the spec (and why)
- Pins are CSS sticky sections + one progress function, not GSAP ScrollTrigger: fewer bytes, no pin-spacer jumps on phones, and the same code drives the 3D, the DOM labels and the still fallback. Lenis smooths the wheel on desktop only (phones keep native scroll).
- One story.js with a phone profile instead of a separate story-m.js: same beats, phone poses and layout differ, nothing to keep in sync twice.
- Tone mapping: Neutral instead of ACES, so lime, ink and cream stay true on the device.
- Ripple rings draw above the wordmark (below the device), not behind it: section backgrounds would otherwise cover them.
- Stills: one 640 px set for both builds (about 180 KB total, only loaded when WebGL is off).
- Phone "Best" word on the portfolio header shows from 421 px (not 390 px): at 390 px it pushed "Start a project" onto two lines.
- The palette lives in 3 CSS variables (--pop, --ink, --cream) at the top of hd.css; the 3D device reads the same variables at start, so the switch to the tomato option is one edit (those 3 lines).

Numbers: about 16k triangles, 24 draw calls; fonts 69 KB (Bricolage Grotesque instanced to opsz 96 / wght 700-800, DM Sans opsz 14 / wght 400-500, JetBrains Mono 500, all Latin subsets).
