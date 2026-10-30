---
name: award-site-teardown-method
description: How to study award-winning websites (Awwwards, CSS Design Awards, FWA) and extract techniques, not content - choosing references, the teardown card, a measuring script (stack, fonts, palette, page shape, weight by type, idle motion, screenshots at desktop and phone), DevTools recipes for network, performance, animations and layers, timing motion by counting frames, the jury lens (Awwwards Design 40 / Usability 30 / Creativity 20 / Content 10), what to take and what never to take, licences, and how a teardown becomes a chapter in a Zyqor build. Includes scripts/teardown.mjs, two real worked teardowns (Lusion, Igloo Inc, measured 30 Oct 2026) and a teardown board page.
when_to_use: before designing any premium or advanced site, "study the best sites", "how did they make this", "make it look like an Awwwards site", when a client sends a reference link or a reel, when the idea feels generic, when judging our own build against award level
license: MIT (text and code). Sources credited in CREDITS.md.
version: 1.0.0
---

# Award-site teardown method

The best sites are the best textbook, if you read them properly. Reading properly means: **measure what is there,
judge why it works, take the technique, leave everything that belongs to them.** A teardown that ends in "it has
nice 3D" is wasted; a teardown that ends in "one object assembled by scroll, KTX2 textures, HUD type in the corners,
14 MB, no reduced-motion rule" gives the next build three moves and one warning.

```
pick 3-5 references -> use each as a visitor (3 lines of feeling) -> teardown.mjs (facts)
  -> DevTools passes (network, performance, animations, layers) -> time the motion by frames
  -> judgment card (idea, structure, palette, type, motion, 3D, phone, sound, signature details)
  -> take / never take -> map each technique to a skill or component -> credit line
```

Quick start (Playwright needed for the script: `npm i -D playwright`):

```bash
node scripts/teardown.mjs https://lusion.co/ --out work/teardowns       # writes TEARDOWN.md + teardown.json + 8 screenshots
node scripts/teardown.mjs https://www.igloo.inc/ --out work/teardowns --name igloo
```

`examples/lusion-co.md` and `examples/igloo-inc.md` are finished cards from real runs on 30 Oct 2026;
`examples/index.html` reads `examples/teardowns.json` and sets both sites against Zyqor's tier budgets.

---

## 0. Desktop first, no compromise

Zyqor Studio's rule (Sujon, 30 Oct 2026): *"PC me no compromise, ek dam best."* So the study starts where the award
sites are strongest:

1. **Study at 1440x900 and 1920x1080 on a real GPU first.** Headless software WebGL (what the script uses) shows the
   structure and the stack but not the frame rate or the true lighting; the judgment of motion quality needs a real
   desktop browser.
2. **Note what desktop does that phone does not** (pointer physics, hover reveals, cursor, larger scenes). Those are
   the "no compromise" moves to borrow for our desktop build.
3. **Never borrow a desktop downgrade.** If an award site hides its 3D on desktop behind a video for speed, that is
   their trade-off, not a technique.

### Phone parity

- Every teardown includes the 390 px pass (the script does it). Record whether the site **recomposes** (same scene,
  new framing: Igloo) or **shrinks** or **swaps** (a video instead of the scene).
- Note the phone weight beside desktop: Lusion 16.6 MB on phone vs 20.4 MB desktop (19% less) is a fact worth knowing
  before promising a client "the same on phone".
- Check touch equivalents for every pointer effect you plan to borrow.

---

## 1. Why the method exists (Sujon's Drive rules it follows)

| Rule | Source |
|---|---|
| Analyse each reference before building: style and why, palette with approximate hex, typography, layout, shape, components, motion ("still image se motion prove nahi hota, jo likho use 'inference' label karo"), what to copy and what not | Drive point Q3 (MA Part F item 13 §2) |
| Copy a reference's choreography, never its content | Drive M12 (IDX §1, GEM rule 1) |
| Licence before copying; unclear means write it yourself | Drive H8 |
| The result must feel like "a designer intentionally chose every movement", not "AI generated a bunch of cool effects" | Drive W3 (MMG §29) |
| The 3-second test: one unmistakable focal centrepiece above the fold | Drive W7 (MA Part E) |
| MA's 15-point quality gate and the anti-AI-slop table as the red-flag scan | Drive W1, W6 |

---

## 2. Choosing references

1. **3-5 per project.** More than five becomes a mood board, not a study.
2. **At least two from outside the client's industry.** A bakery learns more from a camera site's object-on-a-table
   framing than from another bakery.
3. **At least one current Awwwards Site of the Day** (the craft moves fast) and **one Site of the Year** (proven).
4. **Not three from the same agency**: you would be learning one studio's habits.
5. **Still live, opens in a normal browser, works on a phone.** A site that only works on a gaming desktop is a demo.
6. **Match the tier**: for a $300 NORMAL site, study well-made simple sites (CSSDA and siteinspire carry many) as well
   as the spectacular ones; for PREMIUM, the Awwwards SOTY list.

Where to look: Awwwards (Sites of the Day / Month / Year, with jury scores and technology tags on each site's page),
CSS Design Awards (Website of the Day, scored on UI / UX / Innovation), The FWA, siteinspire (calm, typographic work).
On 30 Oct 2026 the FWA list did not render for a script, so it was not used as evidence in this repo's study.

---

## 3. The teardown card

The script writes the measured half; you write the judgment half. Keep both in the project notes
(`work/teardowns/<site>/TEARDOWN.md`).

**Measured** (from `teardown.mjs`, desktop and phone): libraries on `window`, canvases and their context type,
videos and iframes, fonts actually loaded, largest text size, background and text colours by area, page height in
screens, whether the page animates at rest, whether any `prefers-reduced-motion` CSS exists, requests and weight by
type, the largest files, third-party hosts, LCP and CLS (indicative), headings outline, screenshots at 0 / 33 / 66 /
100% of the page.

**Judgment** (yours, after using the site):

| Field | Write |
|---|---|
| Idea | one sentence, "[product] as [thing or place]" |
| Structure | chapters, what stays on screen between them, a named layout per section (`layout-grid-spacing`) |
| Palette | canvas / ink / accent with approximate hex and the accent's share |
| Type | display + body (+ mono), sizes, tracking, the one move that makes it |
| Motion | what follows scroll, what follows the pointer, durations (by frame count), easing feel; anything seen only in stills is labelled *inference* |
| 3D / media | what the canvas or video does, material approach, how it falls back on phone |
| Phone | recomposed, shrunk or swapped; what changes |
| Sound | opt-in at the door, autoplay, none |
| Signature details | 2-3 hand-made moments |
| Take | structure, rhythm, hierarchy, choreography, a technique |
| Never take | logo, brand, copy, photos, illustrations, models, fonts without a licence, code without a licence |
| Where it goes | the skill section or component that will carry the technique |
| Against our rules | weight vs tier budget, reduced motion, contrast, anything that breaks Sujon's rules |

---

## 4. Procedure, step by step

1. **Visit as a visitor first** (no DevTools, sound off, then on if offered). Write three lines: what you felt, what
   you remember after closing the tab, what annoyed you. The memory line is usually the idea.
2. **Run `teardown.mjs`**. One visit per site; do not crawl. Screenshots are private study notes and never published.
3. **Network pass** (DevTools > Network, *Disable cache*, reload): sort by size; note image formats (AVIF/WebP), texture
   formats (`.ktx2`, `.basis`, `.exr`), model formats (`.glb`, Draco/meshopt), video codecs and sizes, fonts and how
   many. Throttle to "Fast 4G" once and watch what appears first: that is their loading choreography.
4. **Performance pass** (Performance panel, record 5 s of scrolling): long tasks (> 50 ms), scripting vs rendering
   share, whether the frame rate holds while scrolling, what runs every frame.
5. **Animations pass** (DevTools > More tools > Animations): capture CSS and Web Animations as they play; read
   durations, delays and the easing curve straight from the panel (cubic-bezier values are shown for CSS).
6. **Rendering pass** (More tools > Rendering): *Paint flashing*, *Layout Shift Regions*, *Frame Rendering Stats*,
   and *Emulate prefers-reduced-motion*: does the site change at all?
7. **Time the motion by frames** for anything the panels cannot see (WebGL, JS-driven): section 5.
8. **Phone pass**: a real phone if possible, otherwise device emulation at 390x844. Same order: feeling, then facts.
9. **Write the judgment card**, then the take / never-take lines.
10. **Map each technique** to a skill section or a component, and write the credit line.

---

## 5. Timing motion by counting frames

What you cannot read in a panel you can measure from a recording. With Playwright:

```js
// record-motion.mjs (sketch): record 6 s of a page at 1440x900 while scrolling once
import { chromium } from 'playwright';
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: 'rec', size: { width: 1440, height: 900 } } });
const p = await ctx.newPage(); await p.goto(process.argv[2], { waitUntil: 'load' }); await p.waitForTimeout(2500);
await p.mouse.wheel(0, 900); await p.waitForTimeout(3500); await ctx.close(); await b.close();
```

```bash
ffmpeg -i rec/*.webm -vf "fps=60,scale=720:-1" frames/%04d.png     # one PNG per 1/60 s
```

Find the first and last frame of a movement: **duration = frames / 60 s**. For the easing, note the element's position
in 5-6 frames across the movement: a big jump early and a long settle is an ease-out (expo-like, our `settle` token
`cubic-bezier(.16,1,.3,1)`); slow-fast-slow is in-out (our `wipe` token `cubic-bezier(.76,0,.24,1)`). Headless
recordings drop frames on heavy WebGL; time WebGL motion on a real desktop with OBS or the OS screen recorder instead.
Write the result as *measured* only when it came from frames; otherwise *inference*.

---

## 6. Take / never take

| Take (learn and rebuild in your own code) | Never take |
|---|---|
| The idea *shape* ("object assembled by scroll"), not their object | logos, brand names, wordmarks |
| Structure: chapter count, what persists between chapters | copy, headlines, taglines |
| Rhythm: section lengths, pauses, where the big moment sits | photos, illustrations, videos, showreels |
| Hierarchy: one oversized element per screen | 3D models, textures, HDRIs, sounds |
| Choreography: what moves first, durations, easing family | fonts you have no licence for (Aeonik, Neue Montreal and most award fonts are commercial) |
| A technique (matcap gloss, KTX2 textures, HUD corners, pointer physics) | their code, unless its licence says you may (minified site code is not open source) |
| Loading choreography (what appears first on 4G) | screenshots in your published work |

Libraries are a separate question: three.js and Lenis are MIT; GSAP has its own licence (free to use, not MIT; read
it). Record every library and its licence in `CREDITS.md` (`imagery-assets-licensing`).

---

## 7. The jury lens: score your own build the same way

Awwwards shows its weighting on every site page: **Design 40%, Usability 30%, Creativity 20%, Content 10%**. CSS
Design Awards scores **UI, UX, Innovation**. Usability is 30%: a beautiful site that is slow or confusing on a phone
does not win. Score your build 1-10 on the four and multiply; then run Sujon's gates:

- **3-second test** (Drive W7): one unmistakable focal centrepiece above the fold at 1440 and 390.
- **Human-designed test** (Drive W3): could you defend every movement as a choice? Delete the ones you cannot.
- **Red-flag scan** (Drive W6): the anti-AI-slop table and the 30-item avoid list (`premium-tiers-normal-advanced-premium` §5).

Nobody can promise an award (Drive H7). The lens is for finding the weakest dimension, not for a claim.

---

## 8. What the studies in this repo found

From 20 award sites opened on 30 Oct 2026 (`docs/how-top-designers-build-unique-sites.md`) and the two teardowns
in `examples/`:

| Observation | Evidence | What we do with it |
|---|---|---|
| Smooth-scroll library present | Lenis on 9 of 20 | allowed, with native scroll underneath (`motion-and-scroll-storytelling`) |
| A live canvas | 12 of 20 | 3D or 2D canvas is normal at PREMIUM; it must be the product or the world, not decoration |
| One-screen "app" pages | 9 of 20 (Lusion and Igloo both, measured) | for client sites keep the long readable page; borrow the entrance or one chapter |
| Small palettes, one loud colour | most; Lusion `#0016EC` on pale `#F0F1FA` | `colour-systems` R1 |
| Grotesk + editorial serif, or grotesk + mono | most; Lusion Aeonik + mono | `typography-premium` pairing rules |
| Sound offered at the door | 4 of 20 | opt-in only (`micro-interactions-and-cursor`) |
| GPU-compressed textures (`.ktx2`) for heavy scenes | Igloo: every large texture | `model-optimisation-phone` §5 |
| Matcap / normal-mapped gloss instead of heavy lighting | Lusion: `.exr` matcap, `.webp` normal maps | `threejs-3d-premium` |
| Weight far above our budgets | Lusion 20.4 MB, Igloo 14.0 MB desktop | PREMIUM stays <= 8 MB own files; take the technique, not the weight |
| No `prefers-reduced-motion` CSS found | Lusion and Igloo (CSS only; JS handling not visible to the script) | we design reduced motion per scene anyway (`accessibility-and-reduced-motion`) |

---

## 9. From teardown to build: a worked example

Reference: Igloo Inc (object assembled by scroll; KTX2; HUD corners). Client: a $1k ADVANCED bakery site.

1. **Idea shape taken**: "an object assembled by scroll" becomes *"a loaf built layer by layer: flour, water, salt,
   48 hours, oven"* as the middle chapter (`unique-idea-and-concept`).
2. **Technique taken**: five real photo layers (credited CC0 / own photos) that stack on scroll, pinned for 3 screens
   (`motion-and-scroll-storytelling` pinned chapter; `interactive-product-configurator` layer order).
3. **Detail taken**: small mono labels in the corners naming each stage ("02 / Water, 72%"), our version of the HUD
   (`typography-premium` mono labels).
4. **Not taken**: 3D, music, the snow world, the weight. Budget stays 3 MB.
5. **Credit line** in the notes: "Assembly-by-scroll technique studied from igloo.inc (abeto), inspiration only."

---

## 10. Tiers

| | NORMAL ($300) | ADVANCED ($1k) | PREMIUM ($10k) |
|---|---|---|---|
| References | 2 (one in-industry, one outside) | 3-4 | 5, incl. one current SOTD and one SOTY |
| Depth | visitor pass + `teardown.mjs` | + network and animations passes | + performance pass, frame timing, real-phone pass |
| Output | 2 cards, 3 techniques chosen | 3-4 cards, a technique per chapter | 5 cards, a shot-by-shot study of the main reference |
| Client-facing | none | a one-page reference board | a reference board with the take / never-take lines |

---

## 11. Do and don't

Do:
- Measure first, then judge; label anything you did not measure as inference.
- Write the take and never-take lines for every reference.
- Study the phone build as seriously as desktop.
- Map each technique to the skill or component that will carry it.
- Credit the reference in the notes and, when a technique is clearly derived, in `CREDITS.md`.

Don't:
- Copy code, models, textures, fonts, copy or photos from a reference.
- Publish screenshots of other people's sites in your portfolio or repo.
- Crawl or hammer a site; one visit per study is enough.
- Borrow an award site's weight, or its missing reduced-motion handling.
- Claim your site is "award-level" (Drive H7).

---

## 12. Pre-build checklist

- [ ] 3-5 references chosen by the rules in section 2.
- [ ] Each has a TEARDOWN.md with the measured table and the judgment fields filled.
- [ ] Motion durations either measured by frames or labelled inference.
- [ ] Take / never-take lines written; nothing from the never-take column enters the project.
- [ ] Each taken technique is mapped to a skill section or component.
- [ ] Weight and reduced-motion findings compared with our tier budget and rules.
- [ ] Credit lines written in the project notes.
- [ ] Screenshots kept private (study folder, not published, not committed to a public repo).

---

## 13. Files

| File | What |
|---|---|
| `scripts/teardown.mjs` | measures a live page at 1440 and 390 (stack, canvases, fonts, largest text, palette by area, page shape, idle motion, reduced-motion CSS, requests and weight by type, largest files, third parties, LCP/CLS, headings) and writes TEARDOWN.md + teardown.json + screenshots; one-screen "app" pages are driven with wheel events |
| `examples/lusion-co.md`, `examples/igloo-inc.md` | finished cards from runs on 30 Oct 2026 |
| `examples/teardowns.json` | the measured data behind them (screenshot names removed) |
| `examples/index.html` | teardown board: both sites against Zyqor's tier budgets; 6 self-tests |
| `CREDITS.md` | sources |

## Sources

- Sujon Hoque (Zyqor Studio): WhatsApp 30 Oct 2026 ("PC me no compromise"); the Instagram designer @ayzz.thedesigner he shared on 27 Oct 2026, studied as inspiration in `docs/how-top-designers-build-unique-sites.md` §9.
- Sujon's Drive: *Master-Award-Website-Guide-Improved-v4.2* Part F item 13 §2 (reference analysis, inference label), Part E (3-second test, anti-AI-slop table, §13 quality gate), Part F item 1 (avoid list); *DESIGN-LIBRARY-INDEX.md* §1; *gemini-instruction-DRAFT-motion-design.txt* rule 1; MMG §29. Points Q3, M12, H7, H8, W1, W3, W6, W7 in `docs/beast/DRIVE_POINTS.md`; mapping in `docs/beast/SKILLS_SOURCE_MAP.md`.
- scroll-world by cyw (MIT), https://github.com/oso95/scroll-world: seam QA by screenshots before/after each transition (SW-T19), the same "judge by composition" habit used here; copy choreography (SW-T15).
- `docs/how-top-designers-build-unique-sites.md` (this repo, 30 Oct 2026): 20 award sites measured; Awwwards jury weighting as shown on its site pages; CSSDA criteria.
- Lusion, https://lusion.co/ and Igloo Inc by abeto, https://www.igloo.inc/ : measured with `teardown.mjs` on 30 Oct 2026; inspiration only, nothing copied.
- Awwwards, https://www.awwwards.com/ ; CSS Design Awards, https://www.cssdesignawards.com/ ; The FWA, https://thefwa.com/ ; siteinspire, https://www.siteinspire.com/.
- Chrome DevTools documentation (Network, Performance, Animations, Rendering panels), https://developer.chrome.com/docs/devtools ; Playwright `recordVideo`; FFmpeg `fps` filter.
- Licences: three.js (MIT), Lenis (MIT), GSAP (GreenSock's own licence).
