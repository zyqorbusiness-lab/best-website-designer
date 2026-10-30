---
name: premium-tiers-normal-advanced-premium
description: Exactly what separates a NORMAL, an ADVANCED and a PREMIUM website (Zyqor Studio's $300 / $1k / $10k tiers) - features, techniques, weight budgets, frame-rate targets, asset rules, time, and the review that decides. Includes scripts/tier-check.mjs (scans a site folder, reports which tier's gates it meets, the weight budget and the red flags from the 30-item avoid list), an 8-dimension scorecard, a tier-picking decision tree, and the "desktop no compromise / phone same quality" rules per tier.
when_to_use: "what's the difference between premium and advanced", "is this good enough for the $1k package", "make this premium", "what should a $300 site have", scoping a client brief, reviewing a build before it ships, deciding how much 3D a site needs
license: MIT (text and code). Sources in CREDITS.md.
version: 1.0.0
---

# Premium vs advanced vs normal

"Premium" is not a number of effects. Sujon's own Drive says it plainly: *"Kami tools ki nahi, sahi selection,
execution aur checking ki hai"* (the gap is not tools, it is selection, execution and checking). A NORMAL site can
look more premium than a PREMIUM one if it is better chosen and better finished. The tiers below separate **scope
and technique**; the scorecard (section 6) separates **quality**, and every tier must pass it.

```
client brief -> pick the tier by what the idea NEEDS (section 3) -> build to that tier's spec (section 2)
   -> tier-check.mjs (budget + gates + red flags) -> 8-dimension scorecard >= 4.0 avg, no 1s -> ship
```

```bash
node scripts/tier-check.mjs path/to/site                       # which tier's gates it meets, budget, red flags
node scripts/tier-check.mjs path/to/site --tier advanced       # exit 1 if it does not meet ADVANCED or has a red flag
node scripts/tier-check.mjs site/page --with site/_kit         # count a shared kit for features (not for weight)
```

---

## 0. Desktop first, no compromise (every tier)

*"PC me no compromise, ek dam best"* (Sujon, 30 Oct 2026). A tier decides **how much** is built, never how well the
desktop shows it:

- A NORMAL site on desktop still gets full-resolution images (2x for retina), the real fonts, every hover/press state,
  grain, and its signature interaction at full quality.
- ADVANCED and PREMIUM on desktop run at **DPR up to 2**, full post-processing, the highest texture set, antialiasing
  on, 60 fps target. Nothing is turned down on desktop to save bytes; heavy files load **after** first paint instead.
- Weight budgets below are about the first load staying fast; they are never a reason to ship a blurrier desktop.
  If quality needs more bytes, load them lazily behind a poster that already looks finished.

### Phone parity (every tier)

Sujon, 27 Oct 2026 8:23 PM: the phone gets **the same models, website and effects**, made lighter only by
compression (meshopt/Draco geometry, WebP/KTX2 textures), lazy-loaded and paused off-screen. Never a cheaper mesh,
never "static image on mobile" unless WebGL fails or the visitor asked for reduced motion. DPR capped at 1.5-2 on
phones is compression, not a downgrade.

---

## 1. The three tiers at a glance

| | NORMAL | ADVANCED | PREMIUM |
|---|---|---|---|
| Client price (Zyqor, 28 Oct 2026) | **$300**: "simple but premium website" | **$1,000**: "scroll-based 3D + premium" | **$10,000**: "everything: content, top quality, fast delivery, the full package" |
| What it is | one strong page (or one section per page) with one signature interaction | a 3-5 section landing page where scroll drives 3D, shaders, physics or video | a flagship: detailed real model, PBR + HDRI, cinematic scroll, configurator, glass UI, sound if it is the idea |
| Technique (Drive D8: simplest that works) | CSS / SVG / canvas, or one light three.js object | scroll scenes, custom GLSL, physics, frame-sequence or video scrub, instancing, post-processing | everything in ADVANCED + detailed scans, clearcoat/transmission/sheen, exploded views, day/night, multi-scene |
| Structure (layout skill §2) | 02, 07, 10, 12, 13 | 03, 05, 07, 10, 11 | 03, 09, 14 or custom |
| 3D | optional; one model or none | yes, tied to scroll or touch | yes, real detailed model, holds a close-up crop |
| Motion | masked reveals, one signature interaction, 1+ micro-interaction | scroll-linked scenes, pinned chapters, smooth scroll | 4-6 camera beats, page transitions, every state animated |
| Own-file weight (first load, excl. shared runtime) | **<= 1-1.5 MB** | **<= 3 MB** | **<= 8 MB desktop**, phone same assets compressed (3-6 MB measured on v3) |
| Frame rate | 60 fps (nothing heavy) | 60 desktop, >= 45 mid phone | 60 desktop, >= 45 mid phone, DPR 2 desktop |
| Sections | 1-3 | 3-5 | 5+ chapters, multiple pages possible |
| Content | client's text, polished | + spec/detail section and CTA | written for them: copy, photography direction, all states, legal pages |
| Build time (one agent) | 20-40 min from a kit, 1-3 h custom | 45-90 min from a kit, 1-2 days custom | 2+ h per page from a kit (iterate 60+ min), 1-3 weeks custom |
| Proof shipped | screenshots 1440/390/360, QA report | + video capture of the scroll | + side-by-side desktop/phone, close-up crops, performance numbers, licence file |

Times for "from a kit" are the Zyqor concept-library measurements (CONCEPTS_300 tier definitions); custom client
times are planning estimates.

---

## 2. Tier specs (build to these)

### 2.1 NORMAL: one clean page, still premium

Ships only if:
- [ ] The first screen is a finished composition: heavy display type, the object or photo, refined UI. Nothing looks like a tutorial.
- [ ] One signature interaction, polished: custom easing (`cubic-bezier(.16,1,.3,1)`), staggered, interruptible, with a touch equivalent.
- [ ] At least one micro-interaction beyond it (magnetic CTA, number roll, cursor label, press state).
- [ ] Palette discipline: warm paper canvas, ink type, accent about 1% (colour-systems skill).
- [ ] One display + one text face, tight tracking on display (typography skill).
- [ ] Own files <= 1-1.5 MB (one model <= 400 KB compressed, photos WebP <= 200 KB each); first paint < 1.5 s on a mid phone.
- [ ] Reduced motion shows the final state; keyboard works; 0 console errors; no overflow at 360px.
- [ ] Credits filled; if it is a concept, the "Concept" label is visible.

Good NORMAL signatures: a before/after slider, an inertia gallery, a ledger with image previews, a word-lit manifesto,
a colour flood on variant switch, a single rotating product, a circular page-reveal from the click point.

### 2.2 ADVANCED: scroll-driven 3D, shaders, physics

Ships only if:
- [ ] The technique is visibly the star (a reviewer names it in one look) and is tied to **scroll or direct manipulation**, never a looping background.
- [ ] 60 fps desktop, >= 45 fps mid phone: instancing for repeats, one renderer per page, DPR capped (desktop 2, phone 1.5), paused off-screen and when the tab is hidden.
- [ ] Physics stable (fixed timestep, sleeping bodies, bounded count); same body count on phone unless the phone frame budget fails, and then it is written in the notes.
- [ ] Shaders have a fallback (no WebGL2 -> static poster with the same composition) and no compile warnings.
- [ ] Frame sequences / video scrub use real footage or our own renders of credited models; desktop 1920px and phone 1080px at the same visual quality (scroll-video-hero skill).
- [ ] Reduced motion: scroll scenes become stepped states with a play control; physics starts settled.
- [ ] Own files <= 3 MB; 0 console errors at 1440/390/360.
- [ ] Includes a details/spec section and a CTA, so it reads as a landing page, not a tech demo.

### 2.3 PREMIUM: the flagship

Ships only if:
- [ ] The hero holds a **close-up crop**: real scanned/authored detail, correct material response, no stretched textures, no low-poly silhouettes.
- [ ] Lighting: HDRI (1k .hdr, same file on phone), ACES Filmic (or AgX), a soft contact shadow, exposure tuned; day/night states both art-directed if present.
- [ ] Cinematic scroll: 4-6 camera beats with eased transitions; the product reacts (rotates, separates, changes finish or light); type and UI follow.
- [ ] At least one configurator or state change (finish, variant, light mode, exploded view) and 2-3 micro-interactions.
- [ ] Liquid-glass UI where it adds depth (Sujon wants glass on every screen of his own sites), with a non-glass fallback.
- [ ] Phone runs the **same** live model, textures and HDRI (compressed), lazy and paused off-screen; a 1440 vs 390 side-by-side and a close-up crop prove it.
- [ ] Desktop <= 8 MB own files; the model starts loading after first paint with a finished poster in place.
- [ ] Maker logos/text on scans painted out; CC-BY attributions exact.
- [ ] 0 console errors/warnings at 1440/390/360; no overflow; reduced motion clean; posters saved.
- [ ] Copy written, every state designed (loading, empty, error, success), Privacy/Terms/Contact pages real.

---

## 3. Picking the tier (decision tree)

1. **Does the idea need the visitor to see an object from several sides, or travel through a space?**
   No -> NORMAL can carry it. Yes -> go to 2.
2. **Is one camera move or one rotation enough?** Yes -> ADVANCED (scroll-scrubbed video or one scroll scene).
   No (configurator, exploded view, several scenes, material close-ups) -> PREMIUM.
3. **Does a real, licensable asset exist at the quality the tier needs?** If PREMIUM needs a detailed model and none
   exists (or the client has no product scan), drop to ADVANCED with real footage, or budget a scan/model.
4. **Budget and deadline**: the tier's build time must fit. Never sell PREMIUM at NORMAL time; ship a great NORMAL instead.
5. **Audience device**: if most visitors are on low-end Android (Drive P2, P6), every tier still ships the same
   assets, but PREMIUM needs more QA time on a real device.

Upsell honestly: the $300 page gets a working, beautiful page; the $1k page adds the scroll-driven 3D moment; the
$10k page adds the content, the flagship 3D and the speed of delivery. Never promise awards (Drive H7).

---

## 4. What does NOT make something premium (common mistakes)

| Looks like "more premium" | Why it isn't | Do instead |
|---|---|---|
| More effects on screen at once | one main mover at a time (Drive M14); noise reads as AI | one effect per chapter, chosen |
| A particle field / glowing orbs / torus knot | code-made placeholder look (Drive D11, X4, X17) | a real model, lit like a photo |
| Neon on black | banned palette (colour skill) | 3 colours, coloured deep canvas |
| Endless loops (marquees, spinning objects) | his rule: no endless loops on portfolio sites (Drive M8) | motion on scroll, hover/press, entrance |
| Fake proof ("trusted by", 4.9 stars, +184%) | dishonest; his rule (Drive H1, X3) | the product itself as proof, real specs |
| Bento grid, 3 cards, 3 pricing tiers in a row | template blocks (avoid list) | ledgers, editorial layouts, a plan switcher |
| Heavier files | slower, not better | the right asset, compressed, lazy |
| A custom cursor on everything | gimmick on touch, noise on desktop | cursor labels only where they mean something |

---

## 5. Red flags (block shipping at every tier)

From his 30-item avoid list (Drive §13) and the anti-AI table (Master Award System §1). `tier-check.mjs` finds the
machine-visible ones; a person checks the rest on screenshots.

| Red flag | Machine check |
|---|---|
| Banned colours (#6366F1, #A855F7, #0F172A, acid lime, cyber cyan), pure black/white backgrounds | yes (CSS only) |
| Lucide icons, sparkle icons, animated arrows | Lucide yes; others by eye |
| Inter / Geist / Space Grotesk | yes |
| Emoji in visible text | yes |
| Em dashes in copy | yes |
| Lorem ipsum, fake proof (trusted by, star ratings, +NN%) | yes |
| Card bounce on hover (scale 1.05+) | yes |
| Large drop shadows | yes |
| Infinite animation without a reduced-motion stop | yes |
| Dev CDNs / `@latest` in production | yes |
| Bento, 3 cards in a row, 3 pricing tiers in a row, terminal windows, dot grids, radial orbs, coloured left stripes, checkmark bullets, "it's not X, it's Y" copy | by eye |
| Missing Privacy / Terms / Contact; no real product shown; no skeletons where loading is visible | by eye |

Exceptions: a style the client chose wins (his rule); "liquid glass" and "hover animations" on the 2 Oct list were
superseded by his 27 Oct asks for glass and award-site click effects.

---

## 6. The scorecard (quality, all tiers)

From Sujon's Drive: *"It should feel like: 'A designer intentionally chose every movement.' Prioritize: taste,
clarity, story, timing, composition, restraint, originality, craft over: effect count, technical complexity, visual
noise."* (Master Motion Graphics prompt §29.) Score each 1-5 on the 1440 and 390 screenshots and the scroll
recording. **Ship at 4.0 average with no 1s.** The template is in `examples/scorecard.md`.

| Dimension | 5 looks like | 1 looks like |
|---|---|---|
| Taste | every colour, font and image chosen; nothing default | default fonts, stock gradient, emoji |
| Clarity | a stranger says what it is in 3 seconds (Drive W7) | "what is this site for?" |
| Story | chapters lead to the CTA; each continues the last (Drive L5) | a pile of sections |
| Timing | motion fast where it should be, slow where it matters; no waiting | everything 1 s, everything at once |
| Composition | one focal point per screen, intentional space | crammed or empty by accident |
| Restraint | one main mover at a time, 3 colours, 2 fonts | effect soup |
| Originality | an idea only this brand could have | a template with a new colour |
| Craft | baseline alignment, consistent borders, image crops, button proportions, icon sizes, corner consistency, text wrapping, section rhythm (Drive W4) | misaligned, inconsistent radii, widows |

Plus **three hand-made signature details** per piece, named in the notes (Drive W5): e.g. the cassette's label
handwriting, a stitched edge on a button, the tape counter that really counts.

---

## 7. What tier-check.mjs found in this repo (Oct 30 2026)

Real runs, so you know what the tool can and cannot tell you:

- `site/library/p/P017` (the Tapehead Hi-Fi premium concept) scanned alone: features found three, gsap, scroll,
  poster, glass, sound; **red flag: an em dash in the visible copy**. With `--with site/library/_kit` it meets the
  PREMIUM feature gate.
- `site/library/n/N020` scanned alone "misses reduced motion": that rule lives in the shared kit, which is why
  `--with` exists.
- With the shared kit counted, all three concepts tested (N008, N020, P017) meet every feature gate, because the kit contains all features. That is
  the limit of a static scan: **feature presence is necessary, not sufficient.** The scorecard decides.
- `skills/colour-systems/examples` meets NORMAL; `skills/layout-grid-spacing/examples` failed NORMAL until a
  `:focus-visible` style was added, which is exactly the kind of miss the gate exists for.

---

## 8. Do and don't

| Do | Because |
|---|---|
| Pick the tier from what the idea needs | effects without need are noise |
| Write the tier and its gates into the brief | the client and the builder agree on scope |
| Load heavy files after first paint behind a finished poster | fast first screen, full desktop quality |
| Run `tier-check.mjs --tier X` before every push | budgets and red flags are cheap to catch early |
| Score with the 8 dimensions on real screenshots | quality is judged by eye, not by feature count |

| Don't | Because |
|---|---|
| Sell PREMIUM with NORMAL time | the result is a broken flagship instead of a great NORMAL |
| Turn desktop quality down for the phone's sake | "PC me no compromise" |
| Give the phone a cheaper model | his same-quality rule |
| Count effects as quality | Drive W3 |
| Promise awards or results | dishonest (Drive H7) |

---

## 9. Pre-ship checklist (any tier)

- [ ] Tier written in the brief, with its price and gates.
- [ ] `node scripts/tier-check.mjs <site> --tier <tier>` exits 0 (no red flags, gates met, under budget).
- [ ] Scorecard filled (`examples/scorecard.md`): average >= 4.0, no dimension at 1.
- [ ] Three signature details named.
- [ ] Desktop at full quality (DPR 2, full textures, post-processing where used); nothing turned down.
- [ ] Phone uses the same assets compressed; side-by-side screenshot saved (ADVANCED/PREMIUM).
- [ ] 0 console errors at 1440, 390, 360 and with reduced motion (qa-harness skill).
- [ ] Credits complete; legal pages present.

## 10. Files

| File | What |
|---|---|
| `scripts/tier-check.mjs` | weight, asset inventory, fonts, feature detection, tier gates, red flags; exit code for CI |
| `examples/scorecard.md` | the 8-dimension review template with a worked example |
| `examples/brief-tiers.md` | how to write the tier into a client brief, for each of the three prices |

## Sources

- Sujon Hoque (Zyqor Studio), WhatsApp 28 Oct 2026 9:42 AM IST (pricing: $300 simple but premium; $1k scroll-based 3D + premium; $10k everything), 27 Oct 2026 8:23 PM (phone same quality), 27 Oct 2026 7:30 PM (glass on every screen), 30 Oct 2026 ("PC me no compromise"), 15 Oct 2026 (no endless loops).
- Sujon's Drive: *Master-Award-Website-Guide-Improved-v4.2* Part E §1 (anti-AI table), §8.3 (3-second test), §13 (15-point gate), Part F item 1 (30-item avoid list), item 11 (*Master Motion Graphics Video Creator* §8, §29 "FINAL STANDARD"), item 13 §5 (three signature details), Part G §8 ("kami tools ki nahi..."); *web-design-promo-checklist.txt* ("Details that make it feel premium"); *boloflow-native-motion-design-system.txt* (anti-vibecode contract).
- Drive points D8, W1-W7, H1, H7, M8, M14, X3-X5 and the tier definitions in Zyqor's CONCEPTS_300 catalogue (28 Oct 2026). Mapping: `docs/beast/SKILLS_SOURCE_MAP.md`.
- scroll-world by cyw (MIT), https://github.com/oso95/scroll-world: per-tier use of the scroll-scrubbed video technique (connectors optional, stills-only fallback), previz-then-final cost discipline.
- Awwwards scoring weights (Design 40%, Usability 30%, Creativity 20%, Content 10%), read on awwwards.com on Oct 30 2026 (`docs/how-top-designers-build-unique-sites.md`).
