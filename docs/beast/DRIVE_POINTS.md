> Copied into the repo on 30 Oct 2026 from the working notes (`work/beast/`), so every skill's source can be checked. Paths below that start with `work/` or `site/library/_kit` refer to the working tree and the concept kit.

# DRIVE_BEST_POINTS.md: the best points from Sujon's premium-design Drive

BEAST REPO Phase 0, Drive helper (task aa503a78), written 28 Oct 2026 for the beast coordinator (2fc59ab0). Read-only on his Drive: nothing was modified, moved or shared.

## How to read this

**Sources and short names** (full table of what each file is, with dates and sizes, is in the last section):

| Short | File (in `work/beast/drive/`) | Note |
|---|---|---|
| MA | `Master-Award-Website-Guide-Improved-v4.2` (.docx + .txt) | Parts A-H. **Part E is his original "Master Award Web Design System v2.0", verbatim**, sections §0-§13. Part F holds 14 of his own messages/prompts. |
| DS3 | `Master-Award-Design-System-Combined-v3` | 610 of its 616 text lines are identical to MA (Part E + Part G). Cited as MA; nothing in it is missing from MA. |
| WBG | `Website-Building-Guide-New-Site.md` ("v6", newest, 22 Oct) | The distilled start-to-publish guide. Sections §1-§11. |
| IDX | `DESIGN-LIBRARY-INDEX.md` | His global and per-project rules, prompt list, links (16 Oct). |
| CHK | `web-design-promo-checklist.txt` | **His own** design checklist ("Design karneka time yaad rakh", 2 Oct). |
| PRX | `prismx-web-build-framework.txt` | **His own** PRISMX build order (28 Sep). |
| BOLO | `boloflow-native-motion-design-system.txt` | **His own** BoloFlow motion brief (1 Oct). App-specific, but its motion principles transfer. |
| GEM | `gemini-instruction-DRAFT-motion-design.txt` | Defaults for motion **films** (it says it does not govern websites). Principles only. |
| LOT | `lottie-icon-click-animation-note.txt` | Click-animation sources note (27 Sep). |
| SKL | `skills.md` | GOD-MODE VIDEO EDITOR skill. Video only. |
| MMG | MA Part F item 11, "Master Motion Graphics Video Creator" (3 Oct) | Video prompt; its §5 motion, §12 compositing, §13 lighting and §26-29 QA transfer to 3D web. |
| PTS | `work/drive_ref/POINTS.md` | Distilled points of the Drive PDF he sent in this chat on 27 Oct 6:09 PM. |
| GRV / STK / BKL | `drive/extra_gravitas-coding-rules.txt`, `extra_gemini-instruction-DRAFT-stack-freedom.txt`, `extra_site-polish-BACKLOG.md` | Three more files from the same Drive library that I fetched today (read-only), see "Further files". |

**Status tags.** `ADOPT` = use as written. `ADAPT` = use, changed as stated so it fits his rules. `CONFLICT` = clashes with one of his permanent rules: listed, **not adopted**. `SUPERSEDED` = an older Drive default that a later instruction of his replaced.

**His permanent rules this was checked against** (from memory/zyqor.md, zyqor_skills.md and work/audit/REQUIREMENTS.md):
- **R-colour** (27 Oct 12:15 IST): "Premium colour, no black and purple, ye sab AI-feel colour hai. Premium fonts. Ek website par 3 colour sabse best lagta hai."
- **R-real**: real premium assets only (CC0/CC-BY, credited), no AI renders, no code-made look (27 Oct 6:22 PM); no emojis, "real hona chahiye sab" (27 Oct 9:13 AM).
- **R-honest**: no fake clients, reviews, metrics; fictional brands labelled Concept.
- **R-phone** (27 Oct 8:23 PM): the phone gets the SAME models and quality, just compressed.
- **R-glass** (27 Oct 7:30 PM): "premium liquid glass on every screen of the whole website".
- **R-click** (27 Oct 12:07 PM): study award and premium sites, add click effects and much more.
- **R-loops** (15 Oct, portfolio): no endless loop animations; entrance, scroll and hover motion instead.

**Precedence when sources disagree** (WBG §2, and his own "latest instruction wins", IDX §1): 1) his latest instruction for the project; 2) the style named for that project; 3) the 30-item avoid list; 4) Master Award defaults. His 27 Oct rules are later than every Drive file (the newest is 22 Oct), so they win wherever they clash.

**Mapping targets** used below: tier rules (NORMAL / ADVANCED / PREMIUM, CONCEPTS_300.md), the shared kit (`site/library/_kit/…`, BUILD_PLAN.md), the 18 skills in SKILLS_PLAN.md (`qa-harness`, `lab-demo-template`, `3d-product-scroll`, `video-to-scroll`, `liquid-glass-ui`, `model-optimisation-phone`, `hdri-lighting-materials`, `premium-typography`, `colour-3-palette`, `scroll-animation`, `micro-interactions`, `shader-starters`, `physics-interactions`, `asset-sourcing-credits`, `award-site-checklist`, `performance-budget`, `honest-portfolio`, `concept-library-index`), plus the optional `motion-design-system` skill, which this analysis says is worth building (see M1-M15).

---
## 1. Layout and grid

**L1. Never ship the generic wireframe; pick a named structure.** "Never fall back to a generic 'Hero -> 3 Feature Boxes -> About -> Contact' wireframe. Implement one of these 14 distinct architectural blueprints." The 14 are: 01 Precision Bento, 02 Swiss exposed-hairline grid, 03 scroll-driven 3D showcase, 04 editorial maison, 05 horizontal exhibition, 06 live sandbox hero, 07 split-screen sticky narrative, 08 neo-brutalist grid, 09 spatial glass, 10 kinetic typography manifesto, 11 draggable infinite canvas, 12 whisper-quiet zen, 13 conversion funnel, 14 multi-scene WebGL portal.
*Cite:* MA Part E §5 (intro + Structures 01-14); WBG §5. *Beast:* every concept row in `concepts_300.json` records a `structure` (01-14) next to its ayzz pattern letter, and `/library/` gets a "structure" filter. Structures 01 and 13 contain bento, 3-card and 3-tier blocks: build them only without those parts (see X5). *Status:* ADOPT.

**L2. Spatial budget tokens.** Max container 1440px, centred, horizontal padding `clamp(1.5rem, 5vw, 5rem)`, full-bleed stages at 100vw; 12 columns with 24px (1.5rem) gaps on desktop; vertical section rhythm `clamp(6rem, 12vw, 11rem)` "so every chapter breathes like a curated gallery frame".
*Cite:* MA Part E §2 Step 3; WBG §4a-4c. *Beast:* `_kit/concept.css` tokens `--container`, `--gutter`, `--section-y`, `--grid-gap: clamp(1rem, 2vw, 1.5rem)` (MA §3). *Status:* ADOPT.

**L3. One spacing scale, no random margins.** "Random margin-padding nahi. Consistent spacing scale use karo: 8 / 12 / 16 / 24 / 32 / 48 / 64 etc." The BEAST prompt asks for "8-point spacing" in the brief.
*Cite:* CHK "Spacing system"; MA Part F item 13 §5. *Beast:* `_kit` spacing tokens `--s-1…--s-7` = 8/12/16/24/32/48/64 (plus 96/128 for sections); `award-site-checklist` row "spacing on scale". *Status:* ADOPT.

**L4. One focal point per section, intentional empty space.** For every section ask: what is the focal point, where does the eye land first, is the hierarchy clear, is the empty space intentional, did we cram elements, does the composition survive on both desktop and mobile.
*Cite:* CHK "Composition"; WBG §6 rule 4 ("one focal point per section"); MA Part E §8.3 (the 3-second test: "1 unmistakable focal centerpiece"). *Beast:* the first item of every tier checklist; reviewer rejects a concept whose hero has two competing focal points. *Status:* ADOPT.

**L5. A story, not a pile of sections.** "Website ko sections ka collection mat banao. Flow banao: Problem → Product → How it works → Proof → Details → CTA. Har section previous section ko naturally continue kare."
*Cite:* CHK "Visual storytelling"; MA Part F item 13 §6 (BEAST: same flow). *Beast:* default section order in `_kit/template/` for multi-section ADVANCED and PREMIUM product concepts ("Proof" = real specs, materials or a working demo, never testimonials, see H1). NORMAL single-section pieces are exempt. *Status:* ADOPT.

**L6. Negative space by brand type.** Luxury and craft: "Generous negative space (40%+ open canvas), high-contrast serif display typography, full-bleed cinematic imagery". Quiet luxury: "over 50% of the viewport remains intentional negative space on a tactile paper/stone canvas".
*Cite:* MA Part E §2 Step 1; Structure 12. *Beast:* concept rows in luxury categories (perfume, watch, jewellery, interiors) carry `whitespace: 40%+`; `premium-typography` example shows it. *Status:* ADOPT.

**L7. Hairline grid and numbered ledger rows instead of cards.** Exposed 1px structural lines with 5px crosshair markers (+) at key intersections; replace cards with "full-width 1px horizontal rows (01 / Strategy, 02 / Systems…)" that expand, invert tone and show a floating preview image on hover.
*Cite:* MA Part E Structure 02; §7 Part C rule 3. *Beast:* the default replacement for card grids (cards in a row are on his avoid list); NORMAL concept ideas ("Swiss ledger", "blueprint index"); `_kit/fx/ledger`. The hover preview needs a tap equivalent (I12). *Status:* ADOPT.

**L8. Split-screen sticky narrative.** Left half `height:100vh; position:sticky; top:0` as a pinned visual stage that cross-fades/morphs through chapters 01-05 with a circular SVG progress ring; right half scrolls the chapters.
*Cite:* MA Part E Structure 07. *Beast:* ADVANCED pattern (one 3D model or photo set morphing as the copy scrolls); `scroll-animation` pattern #4. On phone the stage stacks above each chapter (CHK "Responsive design": section order). *Status:* ADOPT.

**L9. Pinned horizontal exhibition track.** Vertical scroll pins and translates a ~400vw track sideways; frames skewX in proportion to scroll velocity; live counter "SELECTED WORKS [01 — 08]" and a horizontal progress bar.
*Cite:* MA Part E Structure 05. *Beast:* ADVANCED concept pattern and a `scroll-animation` pattern; skew clamped small (I5 uses ±3.5°). *Status:* ADOPT.

**L10. Editorial maison layout moves.** 24px inset frame around the viewport that expands to full-bleed on first scroll; inline pill-shaped image/video cutouts between words of a serif manifesto; staggered lookbook (col-span-6 3/4 image beside a col-span-4 4/5 image offset 160px lower, parallax speeds 0.85 vs 1.15); pinned chapters wiping upward with `clip-path: inset(100% 0 0 0)` → `inset(0)`.
*Cite:* MA Part E Structure 04. *Beast:* PREMIUM/ADVANCED fashion, perfume, hotel concepts; each move is a reusable `_kit/fx` module. *Status:* ADOPT.

**L11. Stacked sticky case cards.** Cards stack with `position: sticky; top: calc(80px + var(--index) * 24px)`, receding cards scale to 0.94 and brightness 0.6.
*Cite:* MA Part E Structure 10.3. *Beast:* NORMAL concept and a `scroll-animation` pattern; also a good library-index "featured" strip. *Status:* ADOPT.

**L12. Draggable infinite canvas.** A [Canvas View | Grid View] toggle; the 2D surface drags in X and Y with momentum and friction decay; cards tilt with drag velocity; click expands a full-screen case modal; HUD with mini-map.
*Cite:* MA Part E Structure 11. *Beast:* ADVANCED concept (archive or moodboard); the Grid view is the accessible and reduced-motion path. *Status:* ADOPT.

**L13. Smart navigation.** Full-width transparent header that compacts into a floating frosted pill (`backdrop-filter: blur(20px)`) after scrolling 80px.
*Cite:* MA Part E §8.2; Structure 01 ("top: 20px, max-width: 760px, backdrop-filter: blur(16px)"). *Beast:* `_kit` concept chrome; the glass pill fits R-glass and the `liquid-glass-ui` skill. *Status:* ADOPT.

**L14. A grand finale footer.** A pre-footer CTA stage above an edge-to-edge brand wordmark (`clamp(4rem, 15vw, 16rem)`, or 16vw at opacity 0.06 under a 4-column sitemap).
*Cite:* MA Part E §8.10; Structure 01 footer. *Beast:* the default footer of `_kit/template/` (the wordmark is the fictional brand's name plus the Concept label). The "magnetic button (Let's Build Something Iconic ↗)" copy is not adopted: arrow decoration, see X13. *Status:* ADAPT.

**L15. The phone is not a shrunken desktop.** "Mobile ko 'desktop ka chhota version' mat banao. Check: Navigation, Typography, Image crop, Card stacking, CTA placement, Touch targets, Section order."
*Cite:* CHK "Responsive design". *Beast:* phone review checklist in every tier; `qa-harness` screenshots at 390x844 and 360x740 are reviewed for crop, order and CTA position, not only for overflow. This fits R-phone: same assets, re-composed layout. *Status:* ADOPT.

## 2. Typography

**T1. Fluid type scale (copy-paste values).** H1 `clamp(2.75rem, 6.5vw + 1rem, 6.5rem)`, line-height 0.96, letter-spacing -0.04em, weight 600. H2 `clamp(2rem, 4vw + 0.5rem, 4rem)`, 1.04, -0.03em. H3 `clamp(1.25rem, 2vw, 1.75rem)`, 1.2, -0.02em. Body `clamp(1rem, 1.1vw, 1.15rem)`, line-height 1.65, max-width 62ch. Eyebrow/index tag: mono 0.75rem, uppercase, letter-spacing 0.14em. "Never hardcode static pixel sizes for headings".
*Cite:* MA Part E §2 Step 4; WBG §4a-4c. *Beast:* `_kit/concept.css` type tokens; the `premium-typography` skill's specimen page uses exactly these, and shows how to retune line-height for condensed or serif display faces. *Status:* ADOPT.

**T2. Display + body + mono pairing.** "Oversized display headlines with tight tracking (-0.04em), clean geometric body copy, and monospace (JetBrains Mono) index tags/metrics." Index tags in the form `01 // SECTION`.
*Cite:* MA Part E §1 (agency-standard column), §12. *Beast:* each concept row stores a font triple; mono only where it carries information (index numbers, specs, coordinates), not as decoration. *Status:* ADOPT.

**T3. Two or three weights, one heading font, one body font.** "Brand ke hisaab se typeface; 2–3 weight maximum; Proper heading/body contrast; Line-height; Letter spacing; Readability; Consistent type scale."
*Cite:* CHK "Typography"; MA Part F item 13 §5 and Part 2 B ("ek heading font + ek body font, 2-3 weights"). *Beast:* `qa-harness` lists loaded font files per page and flags more than 2 families or 3 weights per family (mono counts as the optional third family). *Status:* ADOPT.

**T4. Italic serif keyword inside a tight geometric sans headline.**
*Cite:* MA Part E §7 Part C rule 1 ("Typography as Architecture"). *Beast:* a `premium-typography` pattern and a NORMAL concept idea (editorial headline studies). *Status:* ADOPT.

**T5. Masked line reveals.** Wrap each heading line in an `overflow: hidden` mask and animate `translateY(105%)` → `translateY(0%)` with a 0.08s stagger.
*Cite:* MA Part E §7 Part C rule 2. *Beast:* `_kit/fx/reveal.js` (line mode); `scroll-animation` pattern #1; timing follows M5 (fast, no bounce). *Status:* ADOPT.

**T6. Word-by-word scrubbed manifesto.** A pinned ~150vh stage where each word lights from opacity 0.15 to 1.0 with scroll; optional inline video pill that expands from 90px to 100vw.
*Cite:* MA Part E Structure 10. *Beast:* ADVANCED concept + `scroll-animation` pattern; reduced motion shows the paragraph fully lit. *Status:* ADOPT.

**T7. Industry font pairs (usable rows).** Luxury: Cormorant Garamond / Playfair Display + Plus Jakarta Sans. Real estate / interiors: Instrument Serif + Plus Jakarta Sans + Space Mono. Healthcare: Fraunces + Plus Jakarta Sans + DM Mono. Dining / coffee / hotel: Newsreader / Cormorant Garamond + Work Sans. EdTech: Bricolage Grotesque + Plus Jakarta Sans. Fitness: Oswald / Anton + DM Sans. Law: Libre Baskerville / Newsreader. Streetwear: Archivo Black. Skincare: Cormorant Garamond (italic accents) + Outfit. Portfolio: Instrument Serif + Plus Jakarta Sans + JetBrains Mono.
*Cite:* MA Part E §4 (font column); WBG §4e. *Beast:* the concept catalogue picks fonts per category from these rows. **Drop Inter, Space Grotesk and Geist wherever a row lists them** (rows 1, 9, 11, 12, 13): they are on his avoid list (WBG §2 "Fonts" row; MA Part F item 1). *Status:* ADAPT.

**T8. Free fonts only, licence read per font.** Google Fonts (open licences, commercial use allowed) and Fontshare ("har font ka apna licence padho; kuch closed-source EULA wale hain").
*Cite:* WBG §5b and §8; MA Part F item 14 B. *Beast:* `asset-sourcing-credits` licence checklist; fonts self-hosted as in v3; each font named in CREDITS.md. *Status:* ADOPT.

**T9. Text craft details.** Baseline alignment, text wrapping, optical spacing are named among "Details that make it feel premium".
*Cite:* CHK "Details that make it feel premium". *Beast:* `text-wrap: balance` on headings and `pretty` on body in `_kit`; a row in `award-site-checklist`. *Status:* ADOPT.

## 3. Colour and palettes

**C1. Every colour has a fixed job.** "'Random neon gradient' nahi. Define: Primary, Secondary, Accent, Background, Surface, Text, Muted text, Error/success colors. Har color ka purpose fixed ho."
*Cite:* CHK "Color system"; MA Part F item 13 §5 (BEAST asks for these roles with hex codes). *Beast:* each concept's 3-colour palette (R-colour) maps to roles: `--c1` canvas, `--c2` ink/surface, `--c3` accent; muted, hairline, error and success are derived tints of those three, not new hues. `colour-3-palette` skill explains the mapping. *Status:* ADOPT.

**C2. The accent is rare.** 60% canvas, 30% elevated surface, 9% neutral type, 1% "high-voltage" accent, restricted to "Primary CTA Buttons, Active Toggle States, Live Status Dots, and Text Selection Highlights".
*Cite:* MA Part E §2 Step 2 (5-layer formula, item 5); §12 "COLOR ARCHITECTURE". *Beast:* fits the 3-colour rule exactly (canvas / ink / accent). Tier checklist: the accent covers a small share of any screen, and `::selection` uses it. *Status:* ADOPT (the percentages; not the black canvas, see C3).

**C3. Derive the system from one seed hue.** "Never dump [the brand seed colour] raw onto large backgrounds": take the hue H and derive the canvas, surface, text and accent from it.
*Cite:* MA Part E §2 Step 2. *Beast:* `colour-3-palette` skill and palette generator page use the method. **ADAPT:** the file's outputs are near-black canvases (Carbon-Navy #06080E, Espresso #0B0907, Forest-Obsidian #050A08, Onyx-Burgundy #0C0607, default `--bg-canvas: #070709`). Those read as black, which R-colour bans. Use the same hue math to make a canvas that reads as a colour (deep pine like v3's #17423C, oxblood, ink blue, olive) or a warm light canvas (C5). *Status:* ADAPT; dark-obsidian default = CONFLICT (X1).

**C4. Never pure white text on a dark canvas.** Headline text #F4F4F6 ("96% off-white prevents harsh halation on dark screens"), body #9496A1, captions #5E606E.
*Cite:* MA Part E §2 Step 2 item 4. *Beast:* `_kit` text tokens on dark-coloured concepts. Check the grey body colour against the actual canvas for 4.5:1 (A1). *Status:* ADOPT.

**C5. Warm paper instead of pure white.** Light tokens: canvas #F5F2EB, surfaces #ECE8DF / #E2DDD2, text #121211 / #52504C / #85827C; industry light canvases Warm Travertine #F4F0EA, Warm Silk #F6F3EC, Warm Cashmere #F8F4F0, paper #F6F4EF.
*Cite:* MA Part E §3 (`[data-theme="light"]`), §4, Structure 12; avoid list "pure white background" (MA Part F item 1). *Beast:* the default light canvas family for the library (v3 already uses Ivory #F3EDE1). *Status:* ADOPT.

**C6. Hairlines and a top highlight instead of drop shadows.** Cards get a 1px border (`rgba(255,255,255,0.07-0.08)` on dark, `rgba(20,20,19,0.09)` on light) and a top specular edge `inset 0 1px 0 0 rgba(255,255,255,0.12)` (0.65 on light).
*Cite:* MA Part E §2 Step 2 item 3; §3 tokens; §12. *Beast:* `_kit` surface tokens; this replaces box-shadows, which are on his avoid list ("drop shadows"). 3D contact shadows are lighting, not UI shadows, and stay (D4). *Status:* ADOPT.

**C7. Film grain against banding.** A fixed SVG `feTurbulence` (fractalNoise, baseFrequency 0.8, 3 octaves) overlay at opacity 0.028, `pointer-events: none`, "to eliminate digital gradient banding and impart an anodized, tactile finish".
*Cite:* MA Part E §2 Step 5; §9 (snippet); §7 Part C rule 6. *Beast:* `_kit/grain.svg` + one class; on by default for PREMIUM and editorial NORMAL concepts. It is a static overlay, so no performance cost on phone. *Status:* ADOPT.

**C8. Theme inversion as a chapter break.** Smoothly invert light→dark (or dark→warm ivory) when scrolling into the flagship section (Structure 07: 600ms).
*Cite:* MA Part E §7 Part C rule 7; Structure 07.3. *Beast:* ADVANCED pattern; the "dark" side is the palette's deep colour, not black (R-colour). *Status:* ADAPT.

**C9. Industry palette rows that already pass his rules.** Real estate / interiors: Travertine #F4F0EA + bronze #8C6D46. Skincare / spa: Cashmere #F8F4F0 + rose clay #C88D83 or sage #4A5D4E. Healthcare: Porcelain #F6F9F8 or Deep Cypress #071715 + bio-teal #0D9488. Luxury: Warm Silk #F6F3EC + champagne #D4AF37. Law: brass #C5A059. Dining: terracotta #D97736 (on a light canvas, not the file's "Smoked Truffle" near-black).
*Cite:* MA Part E §4; WBG §4e. *Beast:* seed palettes for the concept catalogue's categories; each concept still gets its own 3-colour palette. Rows whose accents are neon or purple are excluded (X2). *Status:* ADAPT.

**C10. The banned AI palette, named.** "Neon Purple-to-Blue Gradients: Cheap #6366F1 to #A855F7 gradients over default #0F172A Tailwind slate backgrounds."
*Cite:* MA Part E §1 table; §12 "BANNED AESTHETICS". *Beast:* `qa-harness` greps CSS for #6366F1, #A855F7, #0F172A, #7000FF and pure #000000/#000 as colour values and fails on them. *Status:* ADOPT (matches R-colour).
## 4. Motion and easing

**M1. Three named easing curves.** `--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1)`, `--ease-in-out-quart: cubic-bezier(0.76, 0, 0.24, 1)`, `--ease-spring-snappy: cubic-bezier(0.34, 1.56, 0.64, 1)` ("Awwwards Standard").
*Cite:* MA Part E §3 token group 5. *Beast:* `_kit/motion.css` + the same constants in JS. Use the overshooting spring only for small controls (toggles, a button settling back): GEM rule 3 asks for "tiny overshoot, no cartoon bounce". *Status:* ADOPT.

**M2. Purpose first.** "PURPOSE FIRST → MOTION SECOND → DECORATION LAST." Every animation must communicate "1. what changed 2. where it came from 3. what the user should notice 4. what action completed". "Animation ka kaam information samjhana hona chahiye."
*Cite:* BOLO "MOTION PRINCIPLE" and "IMPORTANT: Unique does NOT mean random"; CHK "Motion". *Beast:* each concept's NOTES.md lists its animations with a one-line reason; `award-site-checklist` motion section. *Status:* ADOPT.

**M3. Different actions get different physics.** "Do NOT make every interaction use the same scale/fade animation": selection = morph, navigation = continuity, dragging = physics, expansion = shape/size change, confirmation = concise feedback. Use "different motion personalities for different objects".
*Cite:* BOLO "PRIMARY MOTION GOAL"; MMG §5. *Beast:* the proposed `motion-design-system` skill (web version of his BoloFlow system); the concept template assigns one behaviour per interaction type. *Status:* ADOPT.

**M4. Centralised motion tokens.** "Create a centralized Motion System. Do NOT scatter random animation values across files." Tokens for fast feedback, standard transition, expressive transition, spring response, modal/sheet motion, gesture motion, shared-element motion, reduced-motion mode.
*Cite:* BOLO "MOTION ARCHITECTURE". *Beast:* `_kit/motion.css` defines exactly these eight tokens; no concept hard-codes durations. *Status:* ADOPT.

**M5. His own verdict on reveal timing: fast and smooth, no bounce, no blur.** On 16 Oct he picked "smooth fade-in (opacity+24px rise, 520ms, no bounce)" for his portfolio "over blur after preview comparison"; drop-bounce entrances were replaced by smooth fades on Anvaya and the portfolio; Fizzly's reveals were de-blurred (48px + scale .96 + blur 4px spring → 24px, no scale, no blur, .55-.6s ease-out); and when he said Anvaya's scroll effect was too slow it was cut to reveal 0.4s, travel 16px, threshold 0.06. BOLO says the same in rule form: "Do not make the application feel slow just because animations are 'premium.'"
*Cite:* BKL "Done log" (16 Oct entries for portfolio, Fizzly, Anvaya); BOLO "MOTION TIMING". *Beast:* the library's default content reveal = opacity + 16-24px rise, 400-520ms, `--ease-out-expo`, no bounce, no blur, IntersectionObserver threshold about 0.06-0.15 (MA §9 uses 0.15 and rootMargin -60px). This is the most reliable taste data in the whole Drive, because it records what he actually chose. *Status:* ADOPT.

**M6. Slow luxury transitions, kept for the right moment.** Luxury: "slow, velvety (1.2s) transitions"; Zen: "1.4s cubic-bezier(0.16, 1, 0.3, 1)".
*Cite:* MA Part E §2 Step 1; Structure 12. *Beast:* ADAPT: only for image curtain wipes, chapter changes and camera moves in luxury concepts; content reveals stay fast (M5). *Status:* ADAPT.

**M7. Motion never blocks the user.** "All animations must be interruptible where possible. The user should never need to wait for a decorative animation before continuing."
*Cite:* BOLO "NO ANIMATION SHOULD BLOCK USER INPUT". *Beast:* QA step: scroll and tap during the intro/preloader; any intro has a skip; scroll is never locked waiting for an animation. *Status:* ADOPT.

**M8. No endless loops by default.** Portfolio sites: "no endless/infinity loop animations; entrance/scroll/hover motion instead; thumbnail strip static" (15 Oct). Default for every build: "Entrance, scroll and hover motion only. Respect reduced-motion", allowed when "the project is a motion showcase".
*Cite:* IDX §2 "Portfolio sites"; WBG §2 "Heavy motion / endless loops" row; MA Part F item 13 §6 (BEAST's "ek hand-made hero loop" is older than the 15 Oct rule). *Beast:* library rule: an idle loop only when the concept's idea IS motion, paused off-screen and stopped by reduced motion; no infinite logo marquees (they also imply fake clients, H1). *Status:* ADOPT.

**M9. Motion that reads as AI, named.** "No: random glowing particles, neon energy beams, floating blobs, excessive glass effects, random orbiting objects, meaningless HUD elements, repeated zoom animations, generic AI shimmer, constant pulsing, excessive bounce, endless morphing, decorative loading animations, random gradient movement."
*Cite:* BOLO "GLOBAL MOTION LANGUAGE"; MMG §28 "STRICTLY AVOID". *Beast:* red-flag list in `award-site-checklist`; the reviewer rejects a concept showing any of them. ("Excessive glass effects" is about decoration: R-glass asks for premium glass surfaces, see X11.) *Status:* ADOPT.

**M10. Icons move only to explain state.** "Icons should not constantly wiggle, rotate or pulse." Examples: microphone idle → listening → stopped; copy → confirmed; "Retry: icon rotates only once while retrying."
*Cite:* BOLO "ICON ANIMATION", "MICROINTERACTIONS". *Beast:* `micro-interactions` skill: SVG icon morphs tied to real state changes. *Status:* ADOPT.

**M11. Progress must be real.** "The animation must reflect actual application state… Never display fake '97% processing' progress."
*Cite:* BOLO "SIGNATURE ANIMATION 4". *Beast:* any preloader counter (MA §8.1 "00% -> 100%") is driven by real asset progress (three.js `LoadingManager`, image decode), never a timer. *Status:* ADOPT.

**M12. Copy a reference's choreography, never its content.** "Follow a reference's motion choreography (scroll effects, animation), not just its theme." "Take the grammar, never the content or logos."
*Cite:* IDX §1; GEM rule 1; MA Part F item 13 §2h. *Beast:* concepts built from the ayzz patterns copy structure, rhythm and motion grammar, with original brand, copy and assets. *Status:* ADOPT.

**M13. Classical motion principles.** Use "proper easing, anticipation, follow-through, overshoot…, acceleration/deceleration, momentum, inertia, parallax, depth, masking, reveals"; avoid "constant linear movement, everything moving simultaneously, random bouncing, generic fade-ins, repetitive zooms, identical transition timing".
*Cite:* MMG §5. *Beast:* `scroll-animation` and `motion-design-system` skills; stagger and offset timing per element group. *Status:* ADOPT.

**M14. One main mover at a time.** "Prefer one accent color, one main mover at a time, one visual system from start to end."
*Cite:* GEM rule 5. *Beast:* tier checklist item (especially PREMIUM, where a model, glass HUD and type all move). *Status:* ADOPT.

**M15. Animate transform and opacity only.** "Animate exclusively transform (translate3d, scale, rotate) and opacity. Never animate top, left, width, height, or margin on scroll."
*Cite:* MA Part E §2 Step 6; WBG §10b. *Beast:* `performance-budget` lint (grep keyframes and GSAP tweens for layout properties); the one exception is the FAQ `grid-template-rows` trick (I10), on click only. *Status:* ADOPT.

## 5. 3D and lighting

**D1. The five-chapter scroll arc for a product.** A fixed full-viewport canvas synced with Lenis and GSAP ScrollTrigger (scrub 1.2); 500vh in five chapters: (1) silhouette reveal with rim light and oversized type behind the mesh; (2) 90° orbit with a material macro and a glass HUD card; (3) exploded internal view with 1px SVG leader lines calling out parts; (4) pinned colour/finish studio where swatches change the material and studio lighting live; (5) spec sheet with a sticky reservation bar.
*Cite:* MA Part E Structure 03. *Beast:* the default chapter arc for PREMIUM product concepts and the example of the `3d-product-scroll` skill; concept rows list which chapters they use. Exploded views need a model with separable parts (a requirement for the asset search). The glass HUD fits R-glass. *Status:* ADOPT.

**D2. Renderer defaults.** `ACESFilmicToneMapping`, exposure about 1.2, `setPixelRatio(Math.min(window.devicePixelRatio, 2))`, physical materials with clearcoat for hero metal and lacquer.
*Cite:* MA Part E §7 Part A (code). *Beast:* `_kit/three-stage.js` (ACES and the DPR cap are already the v3 standard; exposure tuned per HDRI). *Status:* ADOPT.

**D3. One lighting logic for the whole piece.** Define "key light, rim light, ambient light, accent light, shadow direction, light intensity, contrast level" and "maintain visual continuity between scenes". MA's hero uses a key + accent rim + cool fill rig.
*Cite:* MMG §13; MA Part E §7 Part A ("3-Point Studio Lighting"). *Beast:* `hdri-lighting-materials` skill: shared HDRI for reflections plus a rim light for silhouettes; each PREMIUM concept writes its light rig in NOTES.md. *Status:* ADOPT.

**D4. Composite like a finished image.** "Create: foreground separation, realistic overlap, controlled occlusion, lighting integration, contact shadows, atmospheric depth, consistent perspective. Do not make objects look like they were pasted on top of each other."
*Cite:* MMG §12. *Beast:* PREMIUM tier checklist (contact shadow under every grounded model, model and DOM type share one light direction). *Status:* ADOPT.

**D5. A different real object per section.** "3D studio site: desktop-first, real 3D objects, different object per section"; "Different 3D object per section (no repeated shape)."
*Cite:* IDX §2; WBG §3 ("3D / scroll site") and §10b. *Beast:* multi-section ADVANCED/PREMIUM "worlds" concepts; the catalogue must not repeat one model across a concept's sections. The "desktop-first" wording is now read as "designed on desktop first": the phone still gets the same models (X8). *Status:* ADOPT.

**D6. Never a blank canvas.** "Usable with WebGL off"; test "Disable WebGL or use an old phone", pass if "A static image or simple layout appears. No blank screen."; "never leave an empty <canvas> placeholder".
*Cite:* WBG §3 and §7 ("3D fallback"); MA Part A and Part E §7 Part A. *Beast:* `qa-harness` adds a run with WebGL disabled: the poster still (our own render of the real model) and all content must show. *Status:* ADAPT: the fallback is for WebGL failure and reduced motion only, never the phone default (X8).

**D7. Interactive finish studio.** Swatch toggles that update the mesh material and the studio lighting in real time.
*Cite:* MA Part E Structure 03 chapter 4. *Beast:* PREMIUM signature interaction (v3's colourway/orbit already does this); swatches are real buttons with labels and keyboard focus (A3). *Status:* ADOPT.

**D8. The simplest technique that gets the result.** "Use the simplest technique that can produce the desired result… WebGL when necessary… Do not add unnecessary technical complexity." "A simple scene executed brilliantly is better than a complicated scene executed badly."
*Cite:* MMG §8 and "FINAL STANDARD". *Beast:* tier definitions: NORMAL = CSS/SVG/canvas or one light three.js object; ADVANCED adds scroll scenes, shaders and physics; PREMIUM adds detailed real models, PBR, HDRI and cinematic scroll. *Status:* ADOPT.

**D9. Shader portals, used sparingly.** Full-bleed shader planes with cursor ripples, circular or diamond clip-path portal transitions between scenes, chromatic aberration tied to scroll velocity.
*Cite:* MA Part E Structure 14. *Beast:* a few ADVANCED shader concepts and `shader-starters`; chromatic aberration kept subtle (MMG §28 lists "unnecessary chromatic aberration"). *Status:* ADAPT.

**D10. Pure-WebGL liquid shader backdrop.** A dependency-free fragment shader (domain-warped sine field reacting to the cursor).
*Cite:* MA Part E §7 Part B. *Beast:* ADAPT for `shader-starters`: tinted from the concept's own 3 colours, low contrast, paused off-screen, never the default hero. The file's own colours (near-black base, acid-lime accent) are not used (X1, X2). *Status:* ADAPT.

**D11. The procedural hero: torus knot, wireframe icosahedron shell and a 1,200-particle field.**
*Cite:* MA Part E §7 Part A. *Beast:* not used. It is exactly the code-made, particle-and-orb look his rules reject (R-real; BOLO "random glowing particles", "random orbiting objects"). *Status:* CONFLICT (X4).
## 6. Interaction and click effects

**I1. Magnetic primary button, three layers.** (1) Within an 80px radius the button follows the cursor by `(mouse - centre) * 0.28` while its label moves `* 0.14` (dual-layer parallax), snapping back with the spring curve; (2) a radial accent fill grows from the exact entry point (`e.offsetX/offsetY`); (3) a dual-label vertical slot roll on hover (`translateY(-120%)` out, duplicate rises in). Working code is in the file.
*Cite:* MA Part E §6.1. *Beast:* `_kit/fx/magnetic.js` and the `micro-interactions` gallery; on `pointer: fine` only, with a press state on touch (I12). Hover effects are on his 2 Oct avoid list, but his 27 Oct ask for award-site click effects (R-click) is later and v3 already ships magnetic buttons (REQUIREMENTS R31), see X10. *Status:* ADAPT.

**I2. Liquid squish segmented toggle.** The active pill stretches `scaleX(1.12)` mid-flight and settles with a spring (Motion: stiffness 420, damping 28).
*Cite:* MA Part E §6.2 item 1. *Beast:* `micro-interactions`; used for tier/category filters in `/library/` and for monthly/annual style toggles. *Status:* ADOPT.

**I3. Circular clip-path theme reveal from the click point.** View Transition API, `circle(0)` → `circle(endRadius)` at the click coordinates, 650ms `cubic-bezier(0.16, 1, 0.3, 1)`, plain switch as the fallback.
*Cite:* MA Part E §6.2 item 3 (code). *Beast:* a NORMAL concept and a `micro-interactions` demo; instant under reduced motion. Not mandatory on every page (MA §13 gate 6 is not adopted, see W1). *Status:* ADOPT (as optional).

**I4. Rolling odometer numbers.** easeOutQuart over 1600ms when a number enters view or a toggle changes it.
*Cite:* MA Part E §6.2 item 4, §9 (`animateCounter`). *Beast:* only for real numbers: a fictional product's own specs or a price configurator, never invented proof metrics (H1). *Status:* ADAPT.

**I5. One tactile draggable thing.** "Include at least one tactile draggable component (Inertia Case Track, Interactive Before/After Split Slider, or Draggable Floating Widget)." Momentum track: velocity decays ×0.93 per frame, skew clamped to ±3.5°.
*Cite:* MA Part E §6.3 (code), §12 rule 3. *Beast:* NORMAL concepts (before/after slider, inertia gallery); `physics-interactions` for heavier versions; all pointer-events based so they work by touch. *Status:* ADOPT.

**I6. Custom lerp cursor with context labels.** Dot follows exactly, ring lerps at 0.16; context labels appear over targets (MA's are "[ VIEW ↗ ], [ ‹ DRAG › ]"; we drop the arrow glyphs, X13); the whole thing is skipped on `(pointer: coarse)`.
*Cite:* MA Part E §6.4 (code); §2 Step 6. *Beast:* `_kit/fx/cursor.js`, opt-in per concept (cursor followers are part of R-click); off on touch and for keyboard users. *Status:* ADAPT.

**I7. Cursor-proximity border spotlight and gentle tilt.** Shared `--mouse-x/--mouse-y` drive a radial highlight on card borders; optional tilt of ±8° with perspective 1000px.
*Cite:* MA Part E §6.4 ("Shared Mouse Radial Spotlight + 3D Card Tilt"). *Beast:* `micro-interactions` demo; pointer-fine only. MA attaches it to bento grids; we use it on ledger rows or glass panels (bento is avoided, X5). *Status:* ADAPT.

**I8. Card hover: the frame stays still, the image moves.** Instead of `hover:scale-105` with heavy shadows, "keep the card frame locked; scale internal media scale(1.04) over 700ms cubic-bezier(0.16, 1, 0.3, 1)" with the border lit by cursor proximity.
*Cite:* MA Part E §1 table ("Cheap Card Bounce" → replacement). *Beast:* `_kit` card style and the `/library/` index thumbnails. *Status:* ADOPT.

**I9. Press feedback that is short and quiet.** "On Copy: button compresses → state changes → brief confirmation → returns to normal. Do not leave a giant persistent 'Copied!' animation." "When Insert succeeds: Do not explode confetti."
*Cite:* BOLO "SIGNATURE ANIMATION 5" and "6". *Beast:* `_kit/fx/press.js` used by every button (copy email, add to cart, swatches); the `micro-interactions` skill's tactile press states. *Status:* ADOPT.

**I10. Accordion with real height physics.** `grid-template-rows: 0fr` → `1fr`, with a `+` that rotates 45° into an accent `×`.
*Cite:* MA Part E §8.9. *Beast:* `_kit/fx/accordion`; NORMAL concepts with specs or FAQs; the button carries `aria-expanded`. *Status:* ADOPT.

**I11. Click animations from LottieFiles, free items only.** LottieFiles offers dotLottie, Lottie JSON, GIF and MP4; IconScout has click assets, but "IconScout name alone is not proof of free use".
*Cite:* LOT; WBG §5b ("LottieFiles, IconScout" row); IDX §5. *Beast:* `micro-interactions` skill shows licensed Lottie click icons (his LottieFiles login is saved on this box); each animation's licence and author go in CREDITS.md; SVG/CSS first, Lottie only where it adds something. *Status:* ADOPT.

**I12. Nothing that only works on hover.** Avoid "hover-based interactions on mobile" / "Hover-based UI that makes no sense on mobile".
*Cite:* BOLO anti-vibecode item 28; MA Part F item 8 item 27. *Beast:* rule in every tier checklist: each hover effect has a tap or press equivalent, and no information is revealed only on hover; the QA phone pass checks it. *Status:* ADOPT.

**I13. Sound: opt-in only.** BEAST: "click pe halki sound (scroll pe nahi)". Structure 14 has a header sound toggle with 4 SVG equaliser bars that flatten into a 1px line when muted. For his portfolio, sound on the intro was skipped because it "annoys clients".
*Cite:* MA Part F item 13 §6; MA Part E Structure 14.3; PTS item 19. *Beast:* sound is off by default; a concept may offer an equaliser toggle; never on scroll. *Status:* ADAPT.

**I14. Zero dead buttons.** "Zero buttons on the page may remain dead or un-wired"; "Every button and link must work"; test: "None dead, none just '#'".
*Cite:* MA Part E §11; WBG §6 rule 5 and §7 ("Links and buttons"). *Beast:* `qa-harness` runs `tools/check-links.mjs --all` and fails on `href="#"` or buttons with no handler. *Status:* ADOPT.

**I15. Command palette and toast engine.** ⌘K / Ctrl+K modal and a glass toast for every action.
*Cite:* MA Part E §11. *Beast:* ADAPT: the library index gets a real ⌘K search (it has 300 items to search); toasts appear only for real actions and with true text. MA's default subtitle "Action confirmed • Instant telemetry sync" is fake and is not used. Not required on every concept. *Status:* ADAPT.

## 7. Performance and phone

**P1. Phone guardrails.** Cap WebGL pixel ratio with `Math.min(window.devicePixelRatio, 2)`, disable custom cursors under `@media (pointer: coarse)`, collapse multi-column grids cleanly below 768px.
*Cite:* MA Part E §2 Step 6. *Beast:* built into `_kit/three-stage.js` and `concept.css`. *Status:* ADOPT.

**P2. Build for low-end Android.** "Lazy-load images, Compress images, Optimize thumbnails, Lazy-load videos, Avoid unnecessary JavaScript, Minimize large animations." Avoid "expensive continuous effects, huge particle counts, unnecessary blur, constantly running animations".
*Cite:* MA Part F item 2 "PERFORMANCE"; BOLO "PERFORMANCE". *Beast:* `performance-budget` skill; IntersectionObserver pause off-screen (already his rule); `backdrop-filter` blur radius budgeted on phone (glass stays, R-glass, but stacked blurred layers are limited). *Status:* ADOPT.

**P3. Record the real Lighthouse number.** "Lighthouse (Chrome DevTools, Mobile): Record the real score. Aim 90+ for Performance and Accessibility." "Report the number you got, not a target."
*Cite:* WBG §7; MA Part B ("Performance" row). *Beast:* `performance-budget` writes the measured scores into each concept's NOTES.md and the library index can show weight; never claim 90+ without the run. *Status:* ADOPT.

**P4. A real phone is the final test.** "Open the live URL on a phone: Readable without zoom, easy taps." "Tests pass hona akela real-phone quality ka proof nahi."
*Cite:* WBG §7 ("Real phone"); MA Part G §8. *Beast:* every milestone report says plainly whether a real phone was used; until Sujon opens it, phone quality is "checked in a desktop browser at 390/360 only". *Status:* ADOPT.

**P5. The main button is visible without scrolling at 360px and 1440px.**
*Cite:* MA Part A ("Landing page / promo"); WBG §3. *Beast:* `qa-harness` checks the primary CTA's bounding box is inside the first viewport at 360x740 and 1440x900 for landing-style concepts. *Status:* ADOPT.

**P6. 360px is a known weak width for his audience.** His live site needed a 360px overlap fix on 23 Oct.
*Cite:* PTS item 17 / C1. *Beast:* 360x740 is a required QA viewport (already in the plan). *Status:* ADOPT.

**P7. Pin versions; no development-only CDNs in production.** "Tailwind docs say the Play CDN is for development only"; "r128 is an old release"; Lucide `@latest` "can change. Pin a version".
*Cite:* MA Part C; WBG §8. *Beast:* `_kit` vendors pinned, self-hosted libraries (as v3 does); MA §9's `<head>` CDN block is not copied as-is. *Status:* ADAPT.

**P8. Free hosting caveats.** GitHub Pages is not allowed as free hosting for an online business; Vercel Hobby is for personal and small projects; Cloudflare Pages free has a 500 deploys/month limit.
*Cite:* WBG §8 "Free hosting options". *Beast:* README "Deploy" section notes these; the library is a showcase, so Vercel/Netlify/Cloudflare Pages are all fine for it. *Status:* ADOPT.

## 8. Accessibility

**A1. Contrast, focus, alt text, no colour-only meaning.** Body text at least 4.5:1, large text at least 3:1; visible keyboard focus; alt text on images; avoid colour-only meaning; respect motion sensitivity.
*Cite:* WBG §6 rule 6 and §7; MA Part B; CHK "Accessibility". *Beast:* `qa-harness` adds an automated contrast/alt check (axe-core, MPL-2.0, run in the QA browser only, not shipped) and a focus-visible check; palettes in `colour-3-palette` are tested pairwise. *Status:* ADOPT.

**A2. Reduced motion that still makes sense.** "Remove unnecessary scaling, reduce travel distance, reduce bounce, replace elaborate transitions with simpler fades/state changes, never make important information depend only on animation."
*Cite:* BOLO "ACCESSIBILITY / REDUCED MOTION"; WBG §7 ("Heavy animation stops, content readable"). *Beast:* `_kit` reduced-motion path: scroll scenes jump to their resting frame, the 3D model shows a still pose, reveals become instant. *Status:* ADOPT.

**A3. Keyboard works.** "Tab through the page: Focus visible. Menu and buttons usable without a mouse"; Escape closes the command palette.
*Cite:* MA Part B ("Keyboard"); MA Part E §11 (Escape handler). *Beast:* QA keyboard pass on the library index and template (filters, swatches, accordion, modal focus trap). *Status:* ADOPT.

**A4. Touch targets.** Checked in the responsive pass and in BEAST's quality step ("Contrast, touch targets, reduced motion").
*Cite:* CHK "Responsive design"; MA Part F item 13 §7. *Beast:* `_kit` minimum 44x44px hit areas on touch. *Status:* ADOPT.

**A5. Design every state, not only the happy path.** "Designers aksar happy path bana ke bhaag jaate hain. Include: Loading, Empty state, Error, Success, Disabled, Processing, Offline, Permission, First-use state."
*Cite:* CHK "UX states"; MA Part F item 13 §5. *Beast:* any concept with an interactive widget (configurator, form, cart, booking) shows its loading, error, success and disabled states; the 3D loader shows real progress (M11). *Status:* ADOPT.
## 9. Content and honesty

**H1. Real proof or nothing.** "Fake testimonials ke badle: Real customer logos, Actual metrics, Case studies, Product usage data, Real screenshots, Named customers, where permitted, Concrete outcomes." If none are real: "leave the block out or mark it 'sample'". Every client name, award, metric, logo and "Trusted by" figure in the 14 blueprints (Prada, +184% conversion, 40+ teams, awards ledgers) "is a placeholder".
*Cite:* CHK "Real proof"; WBG §2 ("Trust numbers…" row), §5 note, §6 rule 3; MA Part B ("Trust"). *Beast:* concept pages carry no testimonials, client logos, ratings, review counts or award ledgers; "proof" sections show the product itself (materials, exploded view, specs, a working demo). The fictional brand is labelled Concept in the chrome. *Status:* ADOPT (matches R-honest).

**H2. Show the real thing, not decoration.** "Fake decorative graphics ki jagah: Real UI screenshots, Actual product workflow, Before/after, Real dashboard states, Interactive demo, Product ke important features ke close-ups." "Real product photos/footage, not code-drawn visuals, for product/brand concept sites."
*Cite:* CHK "Real product visuals"; IDX §1; MMG §17. *Beast:* PREMIUM concepts use detailed real CC0/CC-BY models and real photos; close-up chapters exist to show detail; skills' READMEs use our own screenshots. *Status:* ADOPT (matches R-real).

**H3. Concrete copy, no filler.** Banned: "Unlock the power of…", "Seamless integration", "Elevate your digital journey"; use "Specific metrics, engineering claims, and sensory material details" (its example: "Hand-finished Grade-5 brushed titanium"). His avoid list adds: em dashes, "it's not x, it's y", checkmark bullets.
*Cite:* MA Part E §1 table ("Generic Marketing Fluff"); MA Part F item 1. *Beast:* copy lint in `award-site-checklist` (grep for those phrases, for "—", for "it's not … it's"). ADAPT: sensory and material details are welcome on fictional products; invented performance numbers ("Sub-12ms global edge routing") are not presented as facts on a concept page. *Status:* ADAPT.

**H4. Nothing on the page says or looks AI.** "No AI mention anywhere on his sites; nothing should look AI-made"; "Website me AI ka mention kahin nahi."
*Cite:* IDX §1; MA Part F item 13 §3. *Beast:* no "AI-generated" or "made with AI" wording in pages, credits or alt text; combined with R-real (no AI renders at all). *Status:* ADOPT.

**H5. Concepts are labelled and original.** "Concept sites from reels: fictional brands, labelled concepts, not exact copies." "Original design banao, brand clone nahi."
*Cite:* IDX §2; MA Part F item 13 §2h. *Beast:* concept chrome "Zyqor Library / Concept N001 / fictional brand"; no real brand logos (already his rule). *Status:* ADOPT.

**H6. Legal pages exist.** Avoid list items "no TOS" and "no privacy policy"; checklist: Privacy Policy, Terms, Contact, Security info, Company information.
*Cite:* MA Part F item 1; CHK "Trust + legal". *Beast:* every library page links the repo's existing `privacy.html` and contact in its footer. *Status:* ADOPT.

**H7. Never claim an award.** "'Award-winning' / 'Awwwards-level' wording: Not verifiable… They do not mean any site has won or will win. Do not claim awards." "This guide does not promise an award or a ranking."
*Cite:* MA Part C; WBG header; MA intro ("Honest scope"). *Beast:* README and library copy say "award-level craft" at most, never "award-winning". *Status:* ADOPT.

**H8. Licence before copying; unclear means write it yourself.** "Koi bhi code/asset copy karne se pehle owner page ya repo me licence dekho. Paid, Pro ya unclear ho to skip. Source ka naam aur licence project notes me likho." "Agar licence unclear ho: Copy mat karo. Pattern ko khud likho ya koi MIT/OFL alternative lo."
*Cite:* MA Part F item 14 (rule + E); WBG §5b "Rules". *Beast:* `asset-sourcing-credits` skill; each concept's credits.md lists source, author, licence and link. *Status:* ADOPT.

**H9. Free only; for mixed libraries only the free part.** "Sirf free libraries/assets/fonts/hosting. Mixed library me sirf free part, attribution ke saath." Skip Animmaster Lib (paid), Skiper UI Pro, 21st.dev paid generation.
*Cite:* MA Part F item 13 §3 and item 14 A; WBG §5b. *Beast:* already his rule; `asset-sourcing-credits` lists the free/paid split per library. *Status:* ADOPT.

**H10. Photo licences have edges.** Unsplash: "Free for commercial use… Does not cover trademarks, logos or recognizable people shown in a photo."
*Cite:* MA Part C ("Unsplash licence"); WBG §8. *Beast:* `asset-sourcing-credits`: crop out visible brand labels on photos used in concepts (MA Part C's skincare replacement photo shows a printed label). *Status:* ADOPT.

**H11. One consistent language per site.** "Har page par same: Typography, Spacing, Icon logic, Image treatment, Button language, Color rules, Illustration language."
*Cite:* CHK "Brand consistency". *Beast:* the library chrome is identical on all 300 pages; inside a concept, one icon set, one image treatment, one button style. *Status:* ADOPT.

**H12. Calm, specific CTAs.** "CTA ko giant glowing button banana zaroori nahi. CTA ko: Clear, Contextual, Visible, Action-specific rakho."
*Cite:* CHK "CTA design". *Beast:* template CTAs name the action ("Reserve the Concept", "View the build"), no glow. *Status:* ADOPT.

**H13. Icons: Phosphor, Tabler or custom SVG, never Lucide, no sparkles or decorative arrows.**
*Cite:* MA Part F item 14 C; WBG §2 ("Lucide icons" row) and §5b; avoid list ("lucide icons", "sparkle icons", "animated arrows"). *Beast:* `_kit/icons/` = a pinned Phosphor or Tabler subset (MIT) plus custom SVG; no emoji anywhere (his rule). *Status:* ADOPT.

## 10. Process and QA checklists

**Q1. Write the brief before any code.** BEAST §5: "Chosen style + list se kahan alag hue; colour roles (primary, secondary, accent, background, surface, text, muted, error, success) hex ke saath; free font pair, 2-3 weights, type scale; 8-point spacing; grid; 3 signature details jo hand-made feel dein; components; states". MA: "First output the 5-Line Design Token Summary". WBG: "First give me a short brief: style, palette with hex codes, font pair, spacing, signature details."
*Cite:* MA Part F item 13 §5; MA Part E §0 rule 3; WBG §6 "ORDER OF WORK a". *Beast:* every concept helper writes this BRIEF block at the top of NOTES.md before coding; the JSON row already holds palette, fonts, structure and technique; reviewers check the "3 signature details" exist on screen. *Status:* ADOPT.

**Q2. Name the style.** "'Beautiful/modern' jaise vague words nahi; style ka naam lo: Flat, Minimalism, Glassmorphism/Liquid Glass, Claymorphism, Neumorphism, Skeuomorphism, Neo-Brutalism, Maximalism, Bento Grid, Spatial UI, Material 3, Dark mode." Per-project named styles, "not one style everywhere".
*Cite:* MA Part F item 13 §1; IDX §2 ("Per-project styles"). *Beast:* `style` field in `concepts_300.json` and a filter on `/library/`; the 300 should spread across these styles rather than repeat one look. *Status:* ADOPT.

**Q3. Analyse each reference before building.** For each: style and why; palette with approximate hex; typography; layout (grid, order, density, whitespace); shape (radius, border, shadow, icons); components; motion ("still image se motion prove nahi hota, jo likho use 'inference' label karo"); what to copy (structure, rhythm, hierarchy) and what not (logo, brand, illustration, text, photos).
*Cite:* MA Part F item 13 §2. *Beast:* the ayzz-pattern research notes follow this shape; concept helpers fill it for any reference they use. *Status:* ADOPT.

**Q4. Build a section at a time, judge the render.** "Build one section at a time… Ask for a single page first, not a whole site." "Show the render, not the code. Judge by screenshots at 360, 768 and 1440 px, then on a real phone."
*Cite:* MA Part A steps 3 and 6; WBG §1 step 6. *Beast:* the helper loop (build → screenshot → critique → improve) and the 60-minute iteration rule. *Status:* ADOPT.

**Q5. Pass/fail table; never ship a FAIL.** Rows: layout 360/768/1440, real phone, links and buttons, forms, contrast, keyboard, images/alt, reduced motion, performance (Lighthouse), 3D fallback, console, SEO basics, trust, avoid list.
*Cite:* WBG §7; MA Part B. *Beast:* `qa-harness` automates the machine-checkable rows; `checklist.md` in each skill and the tier checklists keep the rest; the report lists every row as PASS/FAIL. *Status:* ADOPT.

**Q6. Iterate and fix the weakest moment first.** "PLAN → BUILD → PREVIEW → INSPECT → IDENTIFY WEAK MOMENTS → IMPROVE → PREVIEW AGAIN → FINAL POLISH. Fix the weakest moments first." "Judge harshly, like a motion director, not a proud author."
*Cite:* MMG §26; GEM rule 8. *Beast:* fits his ≥60-minute rule: each iteration in NOTES.md names the weakest thing found and what changed. *Status:* ADOPT.

**Q7. Report evidence, not intent.** "Report what actually happened, not what you intended." Invariants: completion needs evidence observed after the last change; "Never exact-retry a failure"; "Say what you can't verify." Every verification ends "VERDICT: PASS" or "VERDICT: FAIL -- [reason]". His 15 Oct directive: read this file before any coding.
*Cite:* GRV ("One rule above all", "THE 6 INVARIANTS" 3, 4, 6, "VERIFICATION HIERARCHY"); IDX §3 and §5. *Beast:* `qa-harness` reports end with a VERDICT line; helper reports list unverified items (real phone, real-device fps). Gravitas is MIT; the `skills/` README can link it as recommended discipline. *Status:* ADOPT.

**Q8. PRISMX build order.** P = Purpose, R = Requirements, I = Interaction, S = System, M = "Make it premium", X = eXecution; "Establish a coherent design system before building individual pages"; "Do not overuse gradients, glassmorphism, animations, cards, or decorative elements"; "Do not leave placeholder logic, fake security, broken buttons, or unfinished flows."
*Cite:* PRX. *Beast:* the section order of every SKILL.md (purpose, requirements, interaction, system, premium checks, execution/QA); the kit (design system) is built before concepts. *Status:* ADOPT.

**Q9. At most two component libraries per site, restyled.** "Rules: at most 2 component libraries per site. Check the licence before copying… If the licence is unclear, write the pattern yourself." shadcn/ui: "Restyle it, do not ship the default look."
*Cite:* WBG §5b ("Rules", shadcn row); MA Part F item 13 §5-6. *Beast:* concepts mostly use our own `_kit`; any outside component is restyled and credited. *Status:* ADOPT.

**Q10. Free choice of stack; not a single-file limit.** "Choose whatever languages, frameworks, code and assets produce the best quality result… never restrict the output to a single self-contained HTML file unless I explicitly ask."
*Cite:* STK; IDX §1 ("Stack (16 Oct)"). *Beast:* the library may use ES modules and the shared kit; no forced single-file pages. *Status:* ADOPT.

**Q11. The final motion review questions.** "WHY does this animation exist? WHAT changed? CAN the user understand the result without the animation? DOES the motion feel connected to the user's action? IS it too slow? IS it repetitive? DOES it look like an AI-generated template? Remove any animation that fails these tests."
*Cite:* BOLO "FINAL MOTION QA". *Beast:* verbatim as the motion section of `award-site-checklist`. *Status:* ADOPT.

**Q12. SEO basics on every page.** One H1, unique title and meta description, descriptive alt text, sitemap.xml, robots.txt, social preview image, real headings.
*Cite:* WBG §1 step 8 and §6 rule 8. *Beast:* `tools/new-concept.mjs` writes title/description/og tags from the JSON row; one sitemap covers `/library/`. *Status:* ADOPT.

**Q13. Restyles never remove working features.** "Never remove a working feature when restyling. Test desktop and Android; every button."
*Cite:* IDX §1; MA Part F item 13 §3. *Beast:* the library is added beside portfolio v3; nothing in v3 is removed; the home page only gains a Library link. *Status:* ADOPT.

## 11. Award criteria (what the Drive actually defines)

The Drive does not contain Awwwards' own judging criteria. What it defines is its own "100/100" gate list, plus several statements of the bar. Nothing below invents jury criteria.

**W1. MA's 15-point quality gate, sorted against his rules.**
*Cite:* MA Part E §13. *Beast:* `award-site-checklist` keeps gates 2 (display + sans + mono with clamp), 3 (one of the 14 structures), 4 (magnetic CTA, pointer-fine), 5 (working spring toggles), 7 (a draggable/sandbox interaction), 12 (grain + specular borders), 13 (concrete copy, no lorem ipsum), 14 (stacking below 768px, no custom cursor on touch) and 15 (no TODOs, complete code). Changed: gate 1 becomes "palette passes R-colour (3 colours, no black, no purple)"; gate 10 becomes "pinned self-hosted libraries, no broken images". Not adopted as mandatory: gate 6 (theme switcher), 8 (bento spotlights), 9 (procedural sculpture / liquid shader stage), 11 (⌘K + toasts on every site). *Status:* ADAPT.

**W2. The bar is selection, execution and checking, not tools.** "Honest verdict: toolkit kaafi strong hai. Kami tools ki nahi, sahi selection, execution aur checking ki hai." "Quality comes from real assets, testing on real devices, and rejecting weak outputs."
*Cite:* MA Part G §8; MA header ("Honest scope"). *Beast:* the coordinator's review gate rejects templated-looking concepts even if they pass QA. *Status:* ADOPT.

**W3. The human-designed test.** "The result must NOT feel like: 'AI generated a bunch of cool effects.' It should feel like: 'A designer intentionally chose every movement.' Prioritize: taste, clarity, story, timing, composition, restraint, originality, craft over: effect count, technical complexity, visual noise."
*Cite:* MMG §29. *Beast:* the eight scoring dimensions of `award-site-checklist` (each 1-5, a concept ships at 4+ average with no 1s). *Status:* ADOPT.

**W4. The details that make it premium.** "Sabse zyada difference yahan aata hai: Baseline alignment, Consistent borders, Image cropping, Optical spacing, Button proportions, Icon sizing, Corner consistency, Text wrapping, Section rhythm."
*Cite:* CHK "Details that make it feel premium". *Beast:* the "craft" block of `award-site-checklist`, reviewed on the 1440 and 390 screenshots. *Status:* ADOPT.

**W5. Three hand-made signature details per piece.** "3 signature details jo hand-made feel dein".
*Cite:* MA Part F item 13 §5. *Beast:* a required field per concept (named in NOTES.md and visible in the hero screenshot). *Status:* ADOPT.

**W6. The anti-AI-slop table and the 30-item avoid list as a red-flag scan.**
*Cite:* MA Part E §1; MA Part F item 1; WBG §9; BOLO "ANTI-VIBECODE DESIGN CONTRACT". *Beast:* `award-site-checklist` red-flag section, partly automated in `qa-harness` (banned hex values, Lucide, emoji code points, em dashes in copy, `hover:scale-105`-style card bounce, Inter/Geist/Space Grotesk font loads). *Status:* ADOPT (with the exceptions in the conflict register).

**W7. The 3-second test.** "Hero Section (Above the Fold — The 3-Second Test): 1 unmistakable focal centerpiece (3D canvas, live interactive sandbox, or editorial frame)".
*Cite:* MA Part E §8.3. *Beast:* hero screenshot review: can a stranger say what the concept is within 3 seconds? (The "Trust Telemetry Bar ★ 4.9/5 across 1,200+ teams" in the same line is not adopted, X3.) *Status:* ADAPT.
## 12. Conflict register (listed, not adopted)

| # | Drive item (cite) | Clashes with | What the beast repo does instead |
|---|---|---|---|
| X1 | Dark "Tinted Obsidian" / "Signature Premium Black" as the 60% canvas: #070709, #07080C, #06080E, #0B0907, #050A08, #0C0607, #040407, #080808, #070707 (MA Part E §2 Step 2, §3, §4, §12) | R-colour: "no black and purple, ye sab AI-feel colour hai" | Same hue-derivation method, but the canvas reads as a colour (pine, oxblood, ink, olive) or a warm paper light (C3, C5). |
| X2 | Neon and purple accents: Acid Lime #E2FF32 / #D4FF00 (the default token and its 0.18 glow), Safety Volt #CCFF00, Acid Yellow #E8FF00, Cyber Cyan #00F0FF + Plasma #7000FF, Electric Indigo #6366F1 (MA Part E §3, §4 rows 1, 5, 8, 9, 10, 13) | R-colour; avoid list "neon colors", "purple and black"; MA's own §1 bans #6366F1 | Accents from the usable rows (C9) or the concept's own 3-colour palette. |
| X3 | Sample trust blocks: "★ 4.9/5 across 1,200+ teams", "SOC2 Type II • 99.99% Uptime", logo marquees, "Client Roster & Awards Ledger", "+184% Conversion", "Trusted by 40+ Series A–C Teams", Prada labels (MA Part E §5, §8.3-8.4) | R-honest; CHK "Real proof"; WBG §2 | Left out. Proof = the product itself (H1). |
| X4 | Procedural torus-knot + wireframe icosahedron + 1,200-particle hero; "Zero External .glb Needed" (MA Part E §7 Part A); "Build each from code, no paid assets" (WBG §10b) | R-real (real premium models, not code-made); BOLO "random glowing particles", "random orbiting objects" | Real CC0/CC-BY models with PBR and HDRI (D1-D4). |
| X5 | Bento grids, 3 feature cards in a row, 3 pricing tiers (Structure 01, 13; §8.5; §12 "Bento") | His 30-item avoid list | Hairline ledgers, editorial grids, varied counts (L7). Allowed only when a concept's named style is Bento (WBG §2). |
| X6 | Lucide icons loaded from unpkg `@latest` (MA Part E §9) | Avoid list "lucide icons" | Phosphor / Tabler (MIT) or custom SVG, pinned (H13). |
| X7 | Inter, Geist, Space Grotesk in font rows and §12 directive (MA Part E §4 rows 1, 9, 11, 12, 13; §12) | Avoid list "Inter/Geist/Space Grotesk" | Plus Jakarta Sans and the other non-banned pairs (T7). |
| X8 | "Static fallback image for phones and reduced-motion", "Mobile and reduced-motion: show a static image per section, no WebGL", "desktop first" (WBG §3, §6 rule 7, §10b; MA Part A) | R-phone (27 Oct 8:23 PM): the phone runs the same models, compressed. SUPERSEDED. | Static poster only when WebGL fails or reduced motion is on (D6). |
| X9 | Endless motion: infinite logo ticker, "Dual Kinetic Marquee Bars", constantly spinning procedural scene, BEAST's "ek hand-made hero loop" (MA Part E Structures 01, 08, §7 Part A; MA Part F item 13 §6) | R-loops (15 Oct, later than BEAST's 14 Oct prompt) | Loops only where the concept's idea is motion, paused off-screen, stopped by reduced motion (M8). |
| X10 | Hover-driven effects everywhere: magnetic pull, slot roll, spotlight, tilt, hover-expanding rows (MA Part E §6, §12) | 2 Oct avoid list "hover animations" | SUPERSEDED in part by R-click (27 Oct: click effects, cursor; v3 R31). Kept on `pointer: fine` only, each with a tap/press equivalent, never the only way to reveal information (I1, I6, I7, I12). |
| X11 | Avoid list "liquid glass" (2 Oct) and "liquid glass everywhere" (BOLO) | R-glass (27 Oct 7:30 PM): "premium liquid glass on every screen" | SUPERSEDED by R-glass for his sites; in the library glass is a PREMIUM-tier signature and a named style, with blur budgets on phone (P2). PRX ("Do not overuse gradients, glassmorphism, animations, cards, or decorative elements") still guides how much. |
| X12 | Drop shadows (toasts `shadow-2xl`) and soft 18px card radius (MA Part E §3, §11) | Avoid list "drop shadows", "soft corner radius" | Hairline + specular edge (C6); tighter radii (around 4-10px) unless the named style needs soft shapes. |
| X13 | Decorative arrows: "custom SVG directional arrows (↗) that slide 45deg on hover", "Let's Build Something Iconic ↗", "EXPLORE CASE ↗" (MA Part E §1, §5, §8.10) | Avoid list "animated arrows", "sparkle icons" | Text CTAs; an arrow glyph only where it means "opens in a new tab", static. |
| X14 | Preloader "fast monospace counter (00% -> 100%)" as decoration (MA Part E §8.1, Structure 14.1) | BOLO "Never display fake '97% processing' progress" | Counter tied to real loading progress, or no counter (M11). |
| X15 | Toast default text "Action confirmed • Instant telemetry sync"; ⌘K palette required on every site (MA Part E §11, §12 rule 5, §13 gate 11) | R-honest; "Do not add an effect just because it is possible" (WBG §6 rule 4) | Toasts only for real actions with true text; ⌘K only on the library index (I15). |
| X16 | "Specific metrics, engineering claims" copy such as "Sub-12ms global edge routing" (MA Part E §1) | R-honest when used for a fictional brand | Material and sensory detail yes; invented performance numbers no (H3). |
| X17 | Ambient radial glow "blur(140px) radial glow (opacity: 0.12)" behind the hero (MA Part E §2 Step 5) | Avoid list "radial orbs"; BOLO "radial orbs used decoratively" | Not as a decorative orb. Light behind a 3D object comes from the scene's own lighting (D3). |
| X18 | Metallic gradient text fill #FFFFFF → #71717A, rotating conic border beam, "zero-trust cipher matrix", "self-typing terminal" (MA Part E Structure 01) | Avoid list "terminal window", "harsh gradients"; BOLO "meaningless HUD elements" | Not used. |
| X19 | Tailwind Play CDN and three.js r128 in the "verified" head (MA Part E §9) | MA Part C itself: Play CDN is development-only, r128 is old | Pinned, self-hosted, current libraries (P7). |
| X20 | Separate heavy desktop / light mobile builds (his 27 Oct 6:29 AM rule, recorded in zyqor_skills.md; not a Drive item) | His later 27 Oct 8:23 PM rule (same quality on phone) and CHK "Mobile ko desktop ka chhota version mat banao" | One page per concept with the same assets compressed, phone-specific layout (BUILD_PLAN already does this). Listed here because the Drive checklist sides with the later rule. |

Not conflicts, but scoped out on purpose: the video-editing material (SKL, MA Part F items 5, 6, 7, 11, 12) and the BoloFlow Android specifics (MA Part F items 8, 9). Only their transferable principles are used above (MMG for motion, compositing, lighting and QA; BOLO for motion rules).

## 13. His 30-item avoid list (verbatim, 2 Oct 2026 9:39 AM)

From MA Part F item 1 and WBG §9 (identical). The note at the end is his: "Ignore this a sab use mat karo" (meaning: avoid all of these).

```
harsh gradients / lucide icons / pure white background / rainbow coloring / drop shadows /
3 feature cards in a row / emojis / liquid glass / em dashes / Inter/Geist/Space Grotesk /
colored left stripe / fake testimonials / bento grids / terminal window / "it's not x, it's y" /
checkmark bullets / 3 pricing tiers / no real product demos / soft corner radius / purple and black /
no skeleton loaders / radial orbs / dot grids / sparkle icons / animated arrows /
no TOS / no privacy policy / hover animations / neon colors / basic pastel colors
```

How to read three of the items (from the BEAST prompt, MA Part F item 13 §4: "Isko ulta samjho"): "no real product demos" means show real product demos and screens; "no skeleton loaders" means use skeleton loaders where they are needed; "no TOS / no privacy policy" means provide real Privacy, Terms and Contact pages. Also from §4: "Agar maine kisi project ke liye aisa style khud chuna jo list se takrata hai (jaise GlassOS = Liquid Glass), wahi chalega." (A style he picks for a project wins over the list.) This is why "liquid glass" and "hover animations" are superseded by his 27 Oct asks (X10, X11). The same list, expanded with explanations, is BOLO's "ANTI-VIBECODE DESIGN CONTRACT" and MA Part F item 8's "ANTI-AI / ANTI-VIBECODE RULES" (items 1-30).
## 14. Top 25 points

Ranked by how much they will change the quality of the 300 concepts and the skills, and how directly they can be applied.

1. **His own motion taste: fast, smooth reveals, no bounce, no blur** (opacity + 16-24px rise, 400-520ms, expo-out). He chose this himself after comparing previews on 16 Oct. (M5; BKL, BOLO)
2. **Precedence plus the avoid list as a hard gate**: latest instruction > named style > the 30 items > Master Award defaults; a style he names (glass, hover effects) overrides the list. (precedence in "How to read this", and section 13; WBG §2, MA Part F items 1 and 13)
3. **Every colour has one job; the accent is about 1%** (CTA, active state, selection). This maps directly onto his 3-colour rule. (C1, C2; CHK, MA §2)
4. **Real proof or nothing**: no testimonials, ratings, client logos or award ledgers on concept pages. The product itself is the proof. (H1; CHK, WBG §2/§6, MA Part B)
5. **Never the generic hero-3-cards-about-contact wireframe**: each concept is built on one of the 14 named structures. (L1; MA §5)
6. **Write the brief before code**, including palette roles, fonts, spacing, states and **three hand-made signature details**. (Q1, W5; MA Part F item 13 §5)
7. **The five-chapter product scroll**: silhouette, orbit + material macro, exploded view with leader lines, finish studio, spec sheet. This is the PREMIUM backbone. (D1; MA Structure 03)
8. **Fluid clamp() type scale** with -0.04em display tracking, 62ch body, mono index tags. (T1, T2; MA §2 Step 4)
9. **Spatial tokens and one spacing scale**: 1440 container, 12 columns / 24px gaps, section rhythm clamp(6rem, 12vw, 11rem), 8/12/16/24/32/48/64. (L2, L3; MA §2 Step 3, CHK)
10. **Purpose-first motion**: every animation says what changed, where it came from, what to notice, what completed; otherwise remove it. (M2, Q11; BOLO)
11. **Centralised motion tokens and three easing curves** (expo-out, in-out-quart, small spring). (M1, M4; MA §3, BOLO)
12. **Hairline borders + top specular edge instead of drop shadows; 2.8% film grain** against banding. (C6, C7; MA §2, §3, §9)
13. **Warm paper canvases (#F5F2EB family) instead of pure white; coloured darks instead of black.** (C5, C3 adapted; MA §3-4 vs R-colour)
14. **The phone is not a shrunken desktop**: re-check nav, type, crop, stacking, CTA, touch targets and section order at 390 and 360. (L15, P6; CHK, PTS)
15. **Nothing works only on hover**: every hover effect gets a tap/press equivalent; cursors and magnetism on pointer-fine only. (I12, I1, I6; BOLO, MA §2 Step 6)
16. **Restrained press feedback**: compress → state → brief confirmation → back; no confetti, no lingering "Copied!". (I9; BOLO)
17. **Transform and opacity only; DPR cap 2; pause what is off-screen**; build for low-end Android. (M15, P1, P2; MA §2 Step 6, MA Part F item 2, BOLO)
18. **Never a blank canvas**: poster still and full content when WebGL fails or motion is reduced. (D6; WBG §7)
19. **One lighting logic per piece plus contact shadows and real compositing**, so models never look pasted on. (D3, D4; MMG §12-13)
20. **Contrast 4.5:1, visible focus, alt text, and a reduced-motion path that still makes sense.** (A1, A2; WBG §6-7, BOLO)
21. **Design every state**: loading (real progress), empty, error, success, disabled, offline, first use. (A5, M11; CHK, BOLO)
22. **Concrete copy**: no "unlock the power of", no em dashes, no "it's not X, it's Y"; sensory material detail instead of invented metrics. (H3; MA §1, avoid list)
23. **The premium-details pass**: baseline alignment, consistent borders and corners, image cropping, optical spacing, button proportions, icon sizing, text wrapping, section rhythm. (W4, T9; CHK)
24. **Pass/fail QA with evidence**: no FAIL ships; every report ends with a VERDICT and names what was not verified (real phone, real-device frame rate). (Q5, Q7, P3, P4; WBG §7, GRV)
25. **Licence first, free only, credit everything**; if a licence is unclear, write the pattern yourself. (H8, H9, T8; MA Part F item 14, WBG §5b)

## 15. What the Drive actually is

**In one paragraph.** His connected Google Drive (zyqorbusiness@gmail.com) holds a "ZYQOR Design Library" built for him before he joined this Tab (16-22 Oct 2026). It contains three long design guides that all centre on his "Master Award-Winning Web Design System & Anti-AI-Slop Architecture v2.0" (a 922-line prompt, MA Part G §1). The newest and most usable is `Website-Building-Guide-New-Site.md`, which reorganises that system into steps and adds licence checks and a conflict rule. Around them sit his own short rule documents (design checklist, PRISMX, BoloFlow motion system, 30-item avoid list), a library index, and several video-editing prompts. Roughly half of the text is genuinely about premium web design; most of the rest is video or Android-app material. The Master Award core is strong on layout, type, tokens and interaction physics, but it defaults to a near-black, neon-accent, bento, fake-metrics "Awwwards SaaS" look that his later rules reject. That is why many of its points are marked ADAPT or CONFLICT above.

**Which "Drive" he meant.** On 28 Oct he wrote "mene jojo bola ha kaisa primium deisgn ka ak drive diya tha". The only Drive link he sent in this WhatsApp chat for repo points is from 27 Oct 6:09 PM ([m:b282a2af], `drive.google.com/file/d/1OTIowxn4T3OezSLEkP6zL_t5CsTbP0xz`, "Aha se vi best best sahi sahi points repo me katdo"). That file is `ZYQOR-Portfolio-Details-27Oct2026.pdf`, a status report on his live portfolio, not a design guide; its points were already applied to v3 (PTS). The premium-design material is the Master Award / Website-Building-Guide set in the same Drive, which he never linked in this chat (no message mentions "Master" or those file ids). This document covers both, so whichever one he meant is covered. If he names another file, it can be added.

| File | Drive dates (UTC) | Size | What it is | Really about premium design? |
|---|---|---|---|---|
| `Website-Building-Guide-New-Site.md` (also a .docx, 62,672 B) | created 22 Oct 15:17, modified 15:18 | 50,906 B | "v6" start-to-publish guide: 9 steps, rule precedence, workflow per project type, Master Award §2/3/4/8/7C and all 14 structures verbatim, UI/UX tool picks with licences checked 22 Oct, launch prompt, pass/fail table, free stack and hosting, the 30-item avoid list, substitutes for lost PDFs. | **Yes**, the best single file. |
| `Master-Award-Website-Guide-Improved-v4.2.docx` (+ .txt) | created/modified 22 Oct 13:10 | 133,050 B (182,776 B text) | Parts A-D (workflows, pass/fail, URL/licence checks, disputed items; written 22 Oct), **Part E = Master Award v2.0 verbatim (§0-§13 with working code)**, Part F = 14 recovered prompts of his (avoid list, notes-platform brief, PRISMX, 4 video prompts, battle animation, launch-video agent, 2 BoloFlow briefs, design checklist, BEAST design prompt parts 1-2), Part G toolkit inventory, Part H what was not recovered. Its internal title says "v4.0"; a v4.1 also exists in the Drive. | **Yes** for Parts A-E, F items 1, 4, 10, 13, 14 and G; no for the video/app prompts. |
| `Master-Award-Design-System-Combined-v3.docx` (+ .txt) | created/modified 22 Oct 09:32 | 72,350 B | Master Award v2.0 verbatim + the toolkit inventory. 610 of 616 lines are identical to v4.2. | Yes, but fully contained in v4.2 (superseded). |
| `DESIGN-LIBRARY-INDEX.md` | 16 Oct 05:00-05:02 | 12,535 B | Index of the "ZYQOR Design Library" folder: global rules, per-project rules, list of his prompts, reels and links, tools with licence notes, backup folders, list of lost files. | Partly: rules and links, not a design method. |
| `web-design-promo-checklist.txt` | file 16 Oct; his message 2 Oct 11:51 | 3,102 B | **His own** Hinglish design checklist (brand direction, composition, real visuals, type, colour roles, storytelling, states, spacing scale, responsive, a11y, legal, CTA, premium details). | **Yes**, short and high value. |
| `prismx-web-build-framework.txt` | file 16 Oct; message 28 Sep | 2,801 B | **His own** PRISMX product-build order and engineering rules. | Partly (process). |
| `boloflow-native-motion-design-system.txt` | file 16 Oct; message 1 Oct | 13,444 B | **His own** motion brief for the BoloFlow Android app, with the 30-item anti-vibecode contract. | Partly: app-specific, motion principles transfer. |
| `gemini-instruction-DRAFT-motion-design.txt` | 16 Oct | 2,353 B | Defaults for code-rendered motion films; says it does not govern websites. | Principles only. |
| `lottie-icon-click-animation-note.txt` | file 16 Oct; message 27 Sep | 1,700 B | A pasted search result about LottieFiles / IconScout click animations. | Minor. |
| `skills.md` | 19 Oct 05:32 (an earlier 16,730 B copy at 03:32) | 16,056 B | "GOD-MODE VIDEO EDITOR" Gemini skill (silence cuts, captions, colour grade, QC). | **No**, video editing. |
| `drive_ref/ZYQOR-Portfolio-Details-27Oct2026.pdf` → PTS | Drive PDF he sent 27 Oct 6:09 PM | 818,341 B | Status report on his live portfolio. | No: facts about his projects, already applied in v3. |
| extra: `gravitas-coding-rules.txt` | 16 Oct 04:17 | 7,210 B | Gravitas SKILL.md (MIT, udaysharmadev) + his 15 Oct directive to read it before any coding. | Process/QA discipline. |
| extra: `gemini-instruction-DRAFT-stack-freedom.txt` | 16 Oct 04:47 | 499 B | Use any free stack; no single-file limit; native app when the brief says so. | Process. |
| extra: `site-polish-BACKLOG.md` (newest of ~12 copies) | 16 Oct | 6,520 B | Polish log of his live sites; records the motion timings he actually chose. | Yes, as taste evidence (M5). |

(The .docx core properties carry python-docx default dates from 2013, so the dates above are the Drive's created/modified times, read today.)

## 16. Further files

**Fetched today (read-only) and used above:** `gravitas-coding-rules.txt` (1dwqJ3kFHUAndPleXtWY1FqjFYu9ywDOp), `gemini-instruction-DRAFT-stack-freedom.txt` (11_2xyLDNa7rD6raSdccjKNeF297WKRWr), `site-polish-BACKLOG.md` (1-pnw6Ekos4Gsfx00mafe_jXOabKpPDpX). Saved as `work/beast/drive/extra_*`.

**Not worth fetching for design:** `master-motion-graphics-video-creator.txt`, `launch-video-production-agent.txt` and `boloflow-native-android-rebuild.txt` in the Drive `prompts/` folder are already verbatim in MA Part F (items 11, 7, 8). The Gemini/GodMode video-editor PDFs and "2026 Elite AI Video Editing Agent" doc are video. `Numivra-Math-website-detailed-prompt.md` is project-specific (and Numivra is "keep the current design").

**Possibly useful, not fetched:** `own-redesign-index.html` / `own-redesign-build.py` (his portfolio redesign of 16 Oct, his approved ivory look) and `BoloFlow-v1.14.1-design-record.md`. They are build artefacts, not premium-design guidance.

**Lost originals (only he can resend):** `4-UI-Libraries.pdf` (Unlumen UI, Magic UI, SmoothUI, RetroUI), `scroll_3d_build_prompts_v2.pdf`, `ChatGPT Poster Prompts 7.pdf` (all 2 Oct), the 27 Sep avoid-list image, and the BEAST INFINITY motion series (X9 is unwanted by him). MA Part H and WBG §10-11 say these were searched for and not found. `scroll_3d_build_prompts_v2.pdf` is the one most relevant to the beast library; it is worth one line to him asking whether he still has it.


---
## 17. Re-read Oct 30 (big-review worker): what was added

I re-read every file in `work/beast/drive/` (18 files, 712 KB) against sections 1-16.

- **`new_doc.txt` = the Google Doc he linked on Oct 28 09:52 IST** (`1GR1TEWm…`, "Isla baat kar raha ha kha"). It is the Website-Building Guide v6 as a Doc (97% the same text as `Website-Building-Guide-New-Site.md`, WBG). Nothing in it is missing from WBG, so no new design rule comes from it. `Website-Building-Guide-New-Site_sent_Oct28.docx` is Tab's own export of WBG, sent to him on Oct 28.
- **Nothing was missed on layout, type, colour, motion or 3D.** The one gap was use: the Drive's **component anatomy** (MA Part E §6 and §8, WBG §4) was written as rules but never shipped as reusable parts. It is now the spec for `site/components/` (Oct 30). The mapping:

| Drive item | Component in `site/components/` |
|---|---|
| I1 magnetic button (radius pull 0.28 / label 0.14, entry-point fill, label slot roll) | `magnetic-button` |
| I6 lerp cursor with context labels, off on touch | `cursor-follower` |
| I8 frame stays still, media moves | `image-trail` (hover list) and `liquid-glass-card` |
| I3 click-point circular reveal, I10 accordion physics | `page-transition`, `mega-menu` |
| I4 odometer numbers (only real numbers) | `pricing-table` (his real $300 / $1k / $10k tiers) |
| I5 one tactile draggable thing (inertia track, velocity x0.93, skew clamp) | `quote-carousel` (drag with inertia) and `marquee` |
| Motion: split headlines, staggered reveal, custom curves | `split-text` |
| Preloader with real progress, no fake bars | `preloader` |
| Sticky storytelling / pinned sections | `sticky-story` |
| 3D: scroll-scrubbed product with HDRI, contact shadow, poster fallback | `scroll-3d-stage` |
| Grand footer wordmark, real Privacy/Terms/Contact links | `footer-wordmark` |

- **His avoid list (section 13) is applied to every component:** no emoji, no Lucide icons (hand-drawn SVG), no pure white or black background, no purple, no neon, no harsh gradients, no drop shadows, no checkmark bullets, no fake testimonials (the quote carousel ships with labelled sample quotes and a note to use only real, permitted quotes), no Inter/Geist/Space Grotesk, no em dashes in the copy. "3 pricing tiers" is on the list, but his own three prices win (his rule in §4: a style he chose himself beats the list), and they are shown as a plan switcher, not three cards in a row.
- **Still lost:** `4-UI-Libraries.pdf` (Unlumen UI, Magic UI, SmoothUI, RetroUI). Those four libraries are credited as inspiration in `site/components/README.md` (public sites; no code copied).
