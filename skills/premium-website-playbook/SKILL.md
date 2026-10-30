---
name: premium-website-playbook
description: The master skill. How an AI agent goes from a one-line brief to a unique, premium, award-level website, in order - intake and brief, reference teardown, the one idea, tier and budgets, palette, type, layout, copy, assets, motion, scroll video, 3D, interaction, phone parity, performance, accessibility, SEO, security, QA, deploy and handover - naming which of the 24 Zyqor skills to open at each step, the command to run, and the gate that must pass before the next step. Includes scripts/route.mjs (prints the route for a tier and feature set, and lints that all 24 skills exist and are linked) and a route planner page.
when_to_use: "build me a premium website", "make a site for this client", any new website from scratch, when you do not know which skill to open next, before quoting a tier, when an agent is about to start coding without a brief
license: MIT (text and code). Sources credited in CREDITS.md.
version: 1.0.0
---

# Premium website playbook (start here)

This is the map. The other 23 skills in this folder each teach one craft in depth; this one says **which craft, in
which order, and what must be true before moving on**. An agent that follows it does not skip the brief, does not
start with a hero animation, and does not ship anything it has not checked.

```
brief -> teardown -> idea -> tier -> palette -> type -> layout -> copy -> assets
      -> motion -> (scroll video) -> (3D) -> interaction -> phone parity
      -> performance -> accessibility -> SEO -> security -> QA -> deploy + handover
```

Quick start (Node 18+, no install, run from the repo root):

```bash
node skills/premium-website-playbook/scripts/route.mjs --tier premium --video --configurator --type product
node skills/premium-website-playbook/scripts/route.mjs --tier normal --type local-business --json > route.json
node skills/premium-website-playbook/scripts/route.mjs --lint .     # all 24 skills present, named, linked; start commands exist
```

`examples/index.html` is the same router as a page: pick a tier and features, read the route.

The rule above every other rule, from Sujon's Drive (*Master-Award-Website-Guide-Improved-v4.2*, Part G §8):
*"Kami tools ki nahi, sahi selection, execution aur checking ki hai."* The tools are not what is missing; selection,
execution and checking are. This playbook is mostly about the last two.

---

## 0. Desktop first, no compromise (read this before anything else)

Zyqor Studio's rule (Sujon, 30 Oct 2026): *"PC me no compromise, ek dam best."*

1. **The desktop build is designed and judged first, at 1440x900 and 1920x1080.** Every step below produces its
   desktop result first. Nothing on desktop is removed, lowered or simplified to make the phone easier.
2. **Speed work never lowers desktop quality.** If a page is slow, fix delivery (compression, lazy loading, code
   splitting, preloading the right thing), not the art. The performance skill gives the budgets that make this possible.
3. **Every heavy feature has a designed fallback, not a missing one**: a poster for the 3D canvas, a still for the scroll
   video, a static layout for reduced motion. A fallback is a design deliverable with its own screenshot.

### Phone parity (after desktop is right)

- The phone gets the **same idea, same palette, same type, same assets, same story**, recomposed for a tall narrow screen
  (see `responsive-phone-pc-parity`). It is not a shrunken desktop and it is not a lesser site.
- Same 3D model file on both (see `model-optimisation-phone`); the phone may lower pixel ratio, never the model.
- Every step's gate is checked at **1440, 390 and 360** wide, plus **375x667** (short phone) for the first screen.

---

## 1. The route at a glance

| # | Step | Open this skill | You leave with | Gate (must pass) |
|---|---|---|---|---|
| 1 | Intake and brief | [`client-site-delivery-workflow`](../client-site-delivery-workflow/) | brief.json + scope the client said yes to | brief has goal, audience, tier, pages, assets, deadline |
| 2 | Reference teardown | [`award-site-teardown-method`](../award-site-teardown-method/) | 3-5 teardown cards | each card says take / never take |
| 3 | The one idea | [`unique-idea-and-concept`](../unique-idea-and-concept/), [`unique-concepts`](../unique-concepts/) | idea sentence, chapters, 3 signature details | `storyboard.mjs` passes |
| 4 | Tier and budgets | [`premium-tiers-normal-advanced-premium`](../premium-tiers-normal-advanced-premium/) | tier, weight budget, fps target | nothing outside the tier promised |
| 5 | Palette | [`colour-systems`](../colour-systems/) | canvas / ink / accent tokens | `palette.mjs --check` VERDICT PASS |
| 6 | Typography | [`typography-premium`](../typography-premium/) | font pair, fluid scale, licence notes | licences recorded, 2-3 weights |
| 7 | Layout | [`layout-grid-spacing`](../layout-grid-spacing/) | named structure per section, spacing scale | one focal point per section |
| 8 | Copy | [`copywriting-for-premium-sites`](../copywriting-for-premium-sites/) | every word on the page | `copy-lint.mjs` passes |
| 9 | Assets | [`imagery-assets-licensing`](../imagery-assets-licensing/) | images, video, models + credit files | `credits-check.mjs` passes |
| 10 | Motion | [`motion-and-scroll-storytelling`](../motion-and-scroll-storytelling/) | easing tokens, reveals, pinned chapters | every animation answers "why" |
| 11 | Scroll video (optional) | [`scroll-video-hero`](../scroll-video-hero/) | all-keyframe clip, poster, phone clip | scrubs smoothly, still for reduced motion |
| 12 | 3D (optional) | [`threejs-3d-premium`](../threejs-3d-premium/), [`model-optimisation-phone`](../model-optimisation-phone/) | real model, lighting, one GLB | side-by-side render proof, poster fallback |
| 13 | Interaction | [`micro-interactions-and-cursor`](../micro-interactions-and-cursor/), [`liquid-glass-ui`](../liquid-glass-ui/), [`interactive-product-configurator`](../interactive-product-configurator/) | states, hover, cursor, glass, configurator | every state designed |
| 14 | Phone = PC | [`responsive-phone-pc-parity`](../responsive-phone-pc-parity/) | recomposed phone build | `parity-check.mjs` passes |
| 15 | Performance | [`performance-desktop-max-and-mobile`](../performance-desktop-max-and-mobile/) | budgets met, vitals measured | `budget-check.mjs` passes |
| 16 | Accessibility | [`accessibility-and-reduced-motion`](../accessibility-and-reduced-motion/) | WCAG 2.2 AA, reduced-motion design | `a11y-check.mjs` exits 0 |
| 17 | SEO and sharing | [`seo-and-meta`](../seo-and-meta/) | tags, OG image, JSON-LD, sitemap, robots | `seo-check.mjs` exits 0 |
| 18 | Security | [`web-security`](../web-security/) | headers, CSP, safe forms | `check.mjs` passes |
| 19 | QA | [`qa-harness`](../qa-harness/) | screenshots, results.json | 0 errors at 1440/390/360 + reduced |
| 20 | Deploy and handover | [`client-site-delivery-workflow`](../client-site-delivery-workflow/) | live URL, Search Console, handover note | live checks pass on the real URL |

This file is [`premium-website-playbook`](../premium-website-playbook/) itself. That is all 24 skills.

**Order matters for three reasons.** Copy comes before motion because animation is choreography for words and
images that must already exist (scroll-world times every section's copy to its segment: the first greets on landing and
fades by 62% of the segment, SW-T15; that timing cannot be set for words that are not written yet). Tier comes before palette
because the tier decides the budget for everything after it. Accessibility and SEO come after interaction but before
QA because they change markup, and QA must test the final markup.

---

## 2. The 24 skills, grouped by job

| Job | Skill | One line |
|---|---|---|
| Plan | [`premium-website-playbook`](../premium-website-playbook/) | this file: order of work, gates, routing |
| Plan | [`client-site-delivery-workflow`](../client-site-delivery-workflow/) | intake, brief, scope, staging, deploy, handover |
| Plan | [`award-site-teardown-method`](../award-site-teardown-method/) | study award sites, extract techniques not content |
| Plan | [`premium-tiers-normal-advanced-premium`](../premium-tiers-normal-advanced-premium/) | what separates $300 / $1k / $10k work |
| Idea | [`unique-idea-and-concept`](../unique-idea-and-concept/) | the one big idea, metaphor, chapters, camera grammar |
| Idea | [`unique-concepts`](../unique-concepts/) | idea generators, filters, the seven mistakes |
| Design | [`colour-systems`](../colour-systems/) | 3-colour OKLCH palettes with contrast checks |
| Design | [`typography-premium`](../typography-premium/) | pairing, fluid scale, licences, loading |
| Design | [`layout-grid-spacing`](../layout-grid-spacing/) | 14 named structures, grid, spacing, rhythm |
| Content | [`copywriting-for-premium-sites`](../copywriting-for-premium-sites/) | headlines, body, CTAs, honest proof |
| Content | [`imagery-assets-licensing`](../imagery-assets-licensing/) | real assets, licences, credit files |
| Motion | [`motion-and-scroll-storytelling`](../motion-and-scroll-storytelling/) | easing, reveals, pinned chapters, smooth scroll |
| Motion | [`scroll-video-hero`](../scroll-video-hero/) | scroll-scrubbed video hero |
| 3D | [`threejs-3d-premium`](../threejs-3d-premium/) | models, PBR, HDRI, post-processing |
| 3D | [`model-optimisation-phone`](../model-optimisation-phone/) | one GLB for desktop and phone, proven |
| Interaction | [`micro-interactions-and-cursor`](../micro-interactions-and-cursor/) | hover, magnetic, cursor, states, sound |
| Interaction | [`liquid-glass-ui`](../liquid-glass-ui/) | glass nav, cards, sheets with fallbacks |
| Interaction | [`interactive-product-configurator`](../interactive-product-configurator/) | drag-to-build with live price |
| Ship | [`responsive-phone-pc-parity`](../responsive-phone-pc-parity/) | phone recomposition with desktop quality |
| Ship | [`performance-desktop-max-and-mobile`](../performance-desktop-max-and-mobile/) | budgets, critical path, vitals |
| Ship | [`accessibility-and-reduced-motion`](../accessibility-and-reduced-motion/) | WCAG 2.2 AA, keyboard, reduced motion |
| Ship | [`seo-and-meta`](../seo-and-meta/) | meta, OG, JSON-LD, sitemap, Search Console |
| Ship | [`web-security`](../web-security/) | secrets, headers, CSP, forms |
| Ship | [`qa-harness`](../qa-harness/) | the one-command test at three sizes |

---

## 3. Step by step

### Step 1. Intake and brief  ->  `client-site-delivery-workflow`

Ask the subject openly, then only what cannot be defaulted (scroll-world's interview rule, SW-T22): *"What is the
site for?"* first; then the 6 questions that change the build: audience, the one action a visitor should take, tier
(budget), pages, assets the client owns (logo, photos, footage), deadline. Everything else gets a stated default.

Write the brief **before any code** (Drive Q1). Minimum fields: goal, audience, primary action, tier, pages, sections
per page, owned assets, missing assets and where they will come from, deadline, languages, domain, and a placeholder
for the 5-line token summary (section 5). `scripts/brief.mjs --new` in the delivery skill writes the template.

Gate: the client (or Sujon, for concept work) said yes to the scope in writing.

### Step 2. Reference teardown  ->  `award-site-teardown-method`

Pick 3-5 references: at least two outside the client's industry (that is where the unexpected idea comes from), at
least one current Awwwards Site of the Day or Site of the Year. Tear each down with the card in that skill: idea,
structure, palette (approximate hex), type, motion (labelled *inference* when seen only in a still, Drive Q3),
technique stack, what to take (structure, rhythm, hierarchy, choreography) and what never to take (logo, brand,
illustrations, copy, photos, models).

Gate: cards saved in the project notes. No reference's content appears anywhere in the build.

### Step 3. The one idea  ->  `unique-idea-and-concept`, `unique-concepts`

One sentence: **"[product] as [thing or place]"** ("a bakery as a sunrise over a wheat field", "a barber as a
tailor's ledger"). Then 3-7 chapters, a camera or reading direction, and **three hand-made signature details**
(Drive W5) that a template would never have. Run `storyboard.mjs`. Generate 10 ideas, keep 1 (the filter in
`unique-concepts` §6).

Gate: idea sentence passes; signature details listed; no chapter exists only to show an effect.

### Step 4. Tier and budgets  ->  `premium-tiers-normal-advanced-premium`

| | NORMAL ($300) | ADVANCED ($1k) | PREMIUM ($10k) |
|---|---|---|---|
| Promise | simple but premium | scroll-based story + 3D or video | everything: content, top quality, fast delivery |
| Own-file weight, desktop first load | <= 1.5 MB | <= 3 MB | <= 8 MB |
| Motion | CSS reveals, hover states | pinned chapters, smooth scroll, one scroll video or one 3D scene | multiple scenes, custom shaders or a configurator, sound (opt-in) |
| Assets | client photos + CC0 | + one real model or one clip | + commissioned or own-shot footage / models |

(Prices from Sujon's tier note, Oct 2026; budgets from `performance-desktop-max-and-mobile` §1.) Write the tier down;
it decides steps 9-15.

### Step 5. Palette  ->  `colour-systems`

Three colours: canvas, ink, accent, from one seed hue, in OKLCH. No pure black, no purple, no neon, no decorative
gradients (his rule, 27 Oct 2026). Body text 4.5:1 minimum, 7:1 goal. `palette.mjs --check` must print VERDICT PASS.

### Step 6. Typography  ->  `typography-premium`

One display face + one body face (+ an optional mono for numbers and labels), 2-3 weights total (Drive T3). Fluid
scale with `clamp()`; display tracking negative (-0.03em around 56px, -0.04em at 80px and above), body line-height 1.5-1.65,
measure 60-75 characters. Read the licence of every font; OFL is safe to self-host; Fontshare (ITF FFL) files are not
committed to a public repo.

### Step 7. Layout  ->  `layout-grid-spacing`

Pick a **named structure** for each section (never the generic hero + 3 cards + footer wireframe, Drive L1). One
spacing scale (8-point), one focal point per section (Drive L4), negative space chosen by brand type (L6). Sketch the
phone recomposition now, not later.

### Step 8. Copy  ->  `copywriting-for-premium-sites`

Write every word before motion is designed. Specific nouns and numbers, no filler ("unlock", "seamless", "elevate"),
no AI wording, no fake testimonials or logos (Drive H1, H3, H4), one language per site (H11), calm and specific CTAs
(H12). `copy-lint.mjs` passes.

### Step 9. Assets  ->  `imagery-assets-licensing`

Real photos, real footage, real models; nothing that looks generated. Every file gets `<asset>.credit.json` and CC BY
work gets visible attribution on the page that uses it (Sujon's credit rule, 28 Oct 2026). `node tools/credits-check.mjs`
must pass.

### Step 10. Motion  ->  `motion-and-scroll-storytelling`

Three easing tokens (settle `cubic-bezier(.16,1,.3,1)`, wipe `cubic-bezier(.76,0,.24,1)`, a tiny-overshoot spring for
toggles only), content reveals of 16-24px rise over 400-520 ms, UI feedback at 180 ms, no bounce on content, no blur-in,
no endless loops by default (Drive M1-M9; Sujon's 16 Oct timing choice). Motion follows the chapters from step 3.
Run the motion review questions (Drive Q11) and delete anything that fails them.

### Step 11. Scroll video (only if the idea needs it)  ->  `scroll-video-hero`

Use it when the idea is a journey or a turn (a camera flight, a product rotating). Encode with every frame a keyframe
for scrubbing, ship a poster frame, a phone clip in the phone's aspect, and a still for reduced motion.

### Step 12. 3D (PREMIUM by default, ADVANCED when the idea needs it)  ->  `threejs-3d-premium`, `model-optimisation-phone`

Real models from credited sources, HDRI lighting, PBR materials, post-processing on desktop. One optimised GLB for both
builds, proven with a side-by-side render. Never a blank canvas: a poster image until the model is ready and when WebGL
is missing (Drive D6).

### Step 13. Interaction  ->  `micro-interactions-and-cursor`, `liquid-glass-ui`, `interactive-product-configurator`

Design every state: hover, focus, active, loading, empty, error, success, disabled (Drive A5). Magnetic buttons and
custom cursors only on fine pointers. Glass only where something moves behind it. A configurator when the product is
assembled from parts (the Hotcoal Kitchen pizza concept, P041, is the worked example).

### Step 14. Phone = PC  ->  `responsive-phone-pc-parity`

Test the viewport matrix (1920, 1440, 1280, 1024, 768, 430, 390, 375x667, 360). The primary action is visible on the
first screen of every size. `svh` for full-height sections, safe areas for fixed bars.

### Step 15. Performance  ->  `performance-desktop-max-and-mobile`

Inside the tier budget. LCP <= 2.5 s, CLS <= 0.1, INP <= 200 ms (Google's "good" thresholds), measured on a throttled
phone profile and on desktop. The hero image or poster is preloaded with `fetchpriority="high"`; everything below the
fold is lazy.

### Step 16. Accessibility  ->  `accessibility-and-reduced-motion`

WCAG 2.2 AA: contrast, focus visible, keyboard paths for every pointer action, targets at least 24x24 CSS px (44 on
touch by Zyqor's rule), alt text, reduced motion designed per scene (not just switched off).

### Step 17. SEO and sharing  ->  `seo-and-meta`

Unique title (50-60 characters) and meta description (140-160), one H1, canonical, Open Graph + Twitter tags with a
1200x630 image, JSON-LD for the business or person, `sitemap.xml`, `robots.txt`, then Search Console after deploy.

### Step 18. Security  ->  `web-security`

No secrets in the repo, security headers, a CSP that allows only what the page loads, forms with a honeypot and
server-side validation (or labelled "Concept: not sent" when there is no backend).

### Step 19. QA  ->  `qa-harness`

One run at 1440x900, 390x844, 360x740 and a reduced-motion pass: 0 console errors, 0 failed requests, 0 horizontal
overflow. **Look at every screenshot.** A passing run with a broken-looking page is a FAIL.

### Step 20. Deploy and handover  ->  `client-site-delivery-workflow`

Deploy (Vercel from Git, or a static host), check the live URL at 1440 and 390, submit the sitemap in Search Console,
send the handover note with credits, licences and the evidence (screenshots, scores).

---

## 4. Decision rules: which optional skills to add

| If the brief says / the idea is... | Add | Do not add |
|---|---|---|
| a physical product people turn in their hands | `threejs-3d-premium` + `model-optimisation-phone` | a 3D scene with a code-made placeholder model |
| a journey, a place, a process with a direction | `scroll-video-hero` or pinned chapters in `motion-and-scroll-storytelling` | a scroll video that is only decoration |
| a product assembled from parts (food, furniture, bikes, jewellery) | `interactive-product-configurator` | a configurator for a product with one variant |
| a lot of UI floating over moving imagery | `liquid-glass-ui` | glass over a flat colour (it shows nothing) |
| a local business with a $300 budget | NORMAL tier: CSS motion, real photos, strong type | WebGL, video, custom cursor |
| a portfolio or studio site | one signature interaction + case pages | ten effects competing |

When two optional skills fight for the same moment (a 3D model and a scroll video in one hero), pick the one that
carries the idea sentence and drop the other. One hero, one centrepiece (Drive W7, the 3-second test).

---

## 5. The 5-line token summary (write it before the first CSS file)

From Sujon's Drive (MA Part E: *"First output the 5-Line Design Token Summary"*). Fill it in after steps 5-7:

```
1. Style + idea:   [named style] / "[product] as [thing or place]"
2. Colour:         canvas #...  ink #...  accent #...   (palette.mjs PASS, body contrast x.x:1)
3. Type:           [display] + [body] (+ [mono]); weights 400/500/700; scale clamp(...) to clamp(...)
4. Space + grid:   8-pt scale 4/8/12/16/24/32/48/64/96/128; 12-col desktop, 4-col phone; max width 1440
5. Motion:         settle cubic-bezier(.16,1,.3,1) 520ms reveals / wipe cubic-bezier(.76,0,.24,1) 650ms / UI 180ms; leave 320ms
```

These five lines become the `:root` tokens. Anything not derivable from them is a smell.

---

## 6. The working loop inside every step

From Sujon's Drive (MMG §26, GEM rule 8): **PLAN -> BUILD -> PREVIEW -> INSPECT -> IDENTIFY WEAK MOMENTS -> IMPROVE ->
PREVIEW AGAIN -> FINAL POLISH.** Fix the weakest moment first. *"Judge harshly, like a motion director, not a proud
author."*

In practice for an agent:

1. Build **one section at a time** (Drive Q4). Never generate a whole site in one pass.
2. Render it at 1440 and 390 and **look at the screenshots** before writing the next section.
3. Name the single weakest thing on screen in one sentence. Fix that. Render again.
4. Stop polishing a section when the weakest thing on it is smaller than the weakest thing on the next section.
5. Never exact-retry a failure (Drive Q7): change one thing, then retry.
6. Restyles never remove working features (Drive Q13).

---

## 7. Evidence, not intent

Every gate ends with a line the next agent (or Sujon) can check (Drive Q7):

```
VERDICT: PASS  palette.mjs --check "#F3EDE1,#17423C,#8C611C"  body 11.2:1, accent 4.6:1
VERDICT: FAIL  parity-check 375x667: primary button 41px below the fold
```

Report what happened, not what was intended. Say what could not be verified (a real iPhone, a real slow network).
Completion needs evidence observed **after the last change**.

---

## 8. Tier table for the whole route

| Step | NORMAL | ADVANCED | PREMIUM |
|---|---|---|---|
| Teardown | 2 references | 3-4 references | 5 references + one shot-by-shot study |
| Idea | idea sentence + 3 sections | idea + 4-6 chapters | idea + 5-7 chapters + camera grammar |
| Palette / type | 3 colours, system or 1 OFL family | 3 colours, OFL pair | 3 colours, P3 accent, OFL or licensed pair |
| Layout | 2 named structures | 3-4 named structures | a structure per chapter + one custom layout |
| Copy | written from client notes | written + one rewrite pass | written, rewritten, read aloud, client-approved |
| Assets | client photos + CC0 | + 1 real model or clip | own-shot / commissioned + real models |
| Motion | CSS reveals + hover | pinned chapters, smooth scroll | choreographed chapters, scroll video or 3D, sound opt-in |
| 3D | none | optional, one scene | yes, desktop max quality, side-by-side proof |
| Interaction | states + focus | + magnetic, cursor on desktop | + configurator / custom signature interaction |
| QA | 3 sizes + reduced | + 375x667 + 1920 | full matrix + real phone + slow network |
| Budget (own files) | <= 1.5 MB | <= 3 MB | <= 8 MB |

---

## 9. Mistakes this repo actually made (and the step that catches each)

| What happened (Oct 2026) | Caught by |
|---|---|
| The portfolio accent `#8F6420` measured 4.49:1 on the canvas, just under AA | step 5, `palette.mjs` |
| At 375x667 (iPhone SE) the main button sat below the first screen; 1440/390/360 all passed | step 14, `parity-check.mjs` |
| Fontshare (ITF FFL) font files were committed to the public repo | step 6, licence notes |
| Mixkit frame sequences in the public repo; licence not on the allow-list | step 9, credits gate |
| Concepts shipped with code-made placeholder models instead of real ones | step 12 ("real model, credited") |
| A fixed 3D stage drew over the footer and credits on phone and desktop | step 19, looking at the screenshots |
| A builder ignored the credit rule; every asset needed a backfill | step 9 gate before any push |
| Too many concepts, too few skills: the owner had to redirect the work | step 1, scope agreed in writing |

---

## 10. Do and don't

Do:
- Write the brief and the 5-line token summary before the first line of code (the rest of the route depends on them).
- Pick the idea before the effects; effects that do not serve the idea get cut.
- Run each gate's command and paste the VERDICT line into the notes.
- Build and judge one section at a time, at 1440 first, then 390.
- Keep a fallback for every heavy feature and screenshot it.
- Credit every asset the moment it enters the project.

Don't:
- Start with the hero animation (it is step 10-12, after the words and assets exist).
- Promise features from a higher tier to win the job.
- Ship a scorecard claim ("award-level", "Awwwards-worthy") as a fact; nobody can promise an award (Drive H7).
- Let a passing script stand in for looking at the screenshots.
- Copy any reference's logo, copy, photos, illustrations or models.
- Lower desktop quality to make phone numbers look better.

---

## 11. Ship checklist (the whole route)

- [ ] Brief agreed in writing; tier and budget recorded.
- [ ] 3-5 teardown cards; nothing copied.
- [ ] Idea sentence + 3 signature details; `storyboard.mjs` passes.
- [ ] 5-line token summary matches `:root`.
- [ ] `palette.mjs --check` PASS; licences of every font recorded.
- [ ] Named structure for every section; one focal point each.
- [ ] `copy-lint.mjs` passes; no AI wording; no fake proof.
- [ ] `credits-check.mjs` passes; CC BY attribution visible.
- [ ] Motion review questions answered; reduced-motion version designed.
- [ ] 3D / video: fallback poster or still screenshotted.
- [ ] `parity-check.mjs` passes on the matrix incl. 375x667.
- [ ] `budget-check.mjs` inside the tier; vitals measured.
- [ ] `a11y-check.mjs` exit 0 at 1440 and 390; keyboard walk done.
- [ ] `seo-check.mjs` exit 0; sitemap + robots + OG image live.
- [ ] `check.mjs` (web-security) passes.
- [ ] `qa-harness` 0 errors at 1440/390/360 + reduced motion; every screenshot looked at.
- [ ] Live URL checked; Search Console sitemap submitted; handover sent.
- [ ] `route.mjs --lint .` passes (repo-level: all skills present).

---

## 12. Files

| File | What |
|---|---|
| `scripts/route.mjs` | the router: route for a tier + features (text or `--json`), and `--lint` for the repo (24 skills present, frontmatter names match, all linked from this file, every `node ...` start command exists). Importable as an ES module. |
| `examples/index.html` | route planner page using the same module, with self-tests (`window.__skillTest`). |
| `examples/brief.example.json` | a filled brief for a PREMIUM product site, the shape step 1 produces. |
| `CREDITS.md` | sources |

## Sources

- Sujon Hoque (Zyqor Studio), WhatsApp 30 Oct 2026 9:42-9:44 IST: "AI ko sikha, skills de: kaisa ek unique premium advanced website banta hai..." and "PC me no compromise, ek dam best"; tier note ($300 / $1k / $10k), Oct 2026.
- Sujon's Drive: *Master-Award-Website-Guide-Improved-v4.2* (Part A steps 3 and 6; Part B pass/fail rows; Part E §0, 5-line token summary, §13 quality gate; Part F item 13 BEAST §2, §5, §6; Part G §8); *Website-Building-Guide-New-Site.md* §1, §6 "ORDER OF WORK", §7; *prismx-web-build-framework.txt* (PRISMX order); *gemini-instruction-DRAFT-motion-design.txt* rule 8; MMG §26, §29. Points Q1-Q13, W1-W7, D6, A5, H1-H12 in [`docs/beast/DRIVE_POINTS.md`](../../docs/beast/DRIVE_POINTS.md); mapping in [`docs/beast/SKILLS_SOURCE_MAP.md`](../../docs/beast/SKILLS_SOURCE_MAP.md).
- scroll-world by cyw (MIT), https://github.com/oso95/scroll-world: interview rule (SW-T22), previz-then-final (SW-T20), re-roll only the failure (SW-T21), automated seam QA (SW-T19); see [`docs/beast/SCROLL_WORLD_POINTS.md`](../../docs/beast/SCROLL_WORLD_POINTS.md).
- Google, Core Web Vitals thresholds (LCP 2.5 s, INP 200 ms, CLS 0.1), https://web.dev/articles/vitals.
- W3C WCAG 2.2, https://www.w3.org/TR/WCAG22/ (target size 2.5.8: 24x24 CSS px minimum).
- This repo's own history (work notes, Oct 28-30 2026) for section 9.
- [`docs/how-top-designers-build-unique-sites.md`](../../docs/how-top-designers-build-unique-sites.md) (Awwwards study, Oct 30 2026).
