# Skills: free, downloadable, tested

Each folder here is one self-contained skill you can download and use on your own projects: a written method (`SKILL.md`, readable by people and by AI coding agents), a working example, starter code, a QA checklist and an MIT licence. Every example was checked at 1440x900, 390x844 and 360x740 with 0 console errors before it shipped.

## Website-design skills (the core of this repo, 18 skills + 6 tool skills = 24)

Sujon, 30 Oct 2026: teach an AI agent, through many detailed skills, exactly how to design and build unique, premium, advanced websites. Desktop is the top bar ("PC me no compromise"); the phone matches it. Open [`premium-website-playbook`](premium-website-playbook/) first: it says which skill to use at each step. Each skill below folds in the points from his design Drive and from scroll-world (map: [`docs/beast/SKILLS_SOURCE_MAP.md`](../docs/beast/SKILLS_SOURCE_MAP.md)).

| Skill | What it teaches |
|---|---|
| [`premium-website-playbook`](premium-website-playbook/) | **Start here.** The master route from brief to award-level site in 20 steps: which skill to open at each step, the command, and the gate that must pass. `route.mjs` prints the route for a tier and lints the library. |
| [`unique-idea-and-concept`](unique-idea-and-concept/) | Find the one big idea ("[product] as [thing or place]"), metaphor, story arc, chapters, camera grammar, brief. `storyboard.mjs` checks the idea sentence. |
| [`colour-systems`](colour-systems/) | Premium 3-colour palettes with OKLCH maths and WCAG checks; no black, no purple, no neon, no decorative gradients. `palette.mjs` generates and checks. |
| [`typography-premium`](typography-premium/) | Font pairing, fluid clamp() scale, tracking/leading by size, craft details, loading without shift, OFL vs Fontshare vs paid licences. `type-scale.mjs`. |
| [`layout-grid-spacing`](layout-grid-spacing/) | 14 named page structures, spatial tokens, 8-point scale, 12-column grid, ledgers, sticky narratives, horizontal tracks, phone re-composition. `layout-audit.js`. |
| [`copywriting-for-premium-sites`](copywriting-for-premium-sites/) | Specific, short, true copy: facts-sheet interview, voice brief, eyebrow/title/body/proof/CTA numbers, honest proof, microcopy for every state, banned list. `copy-lint.mjs`. |
| [`premium-tiers-normal-advanced-premium`](premium-tiers-normal-advanced-premium/) | What separates $300 / $1k / $10k sites: features, budgets, fps, red flags and the 8-dimension scorecard. `tier-check.mjs`. |
| [`motion-and-scroll-storytelling`](motion-and-scroll-storytelling/) | Motion tokens, three named curves, reveal timings, GSAP ScrollTrigger + Lenis pins/scrubs/horizontal tracks, CSS scroll-driven animations, scroll-scrubbed video with every scroll-world engine rule, page transitions, reduced motion. |
| [`threejs-3d-premium`](threejs-3d-premium/) | Real models (sourcing, licences, gltf-transform), ACES renderer defaults, HDRI + key/rim lighting, PBR materials, contact shadows, bounding-sphere framing for portrait, scroll camera beats, finish studio, render on demand, no-WebGL poster. |
| [`micro-interactions-and-cursor`](micro-interactions-and-cursor/) | State matrix for every control, magnetic button, labelled lerp cursor, border light + tilt, press feedback, squish toggle, odometer (real numbers), accordion physics, real-action toasts, opt-in sound, a touch version of every pointer effect. |
| [`responsive-phone-pc-parity`](responsive-phone-pc-parity/) | Desktop-first composition, recomposed (not shrunk) for phones: viewport matrix, content breakpoints, svh and the iOS URL bar, safe areas, art direction, video/3D per aspect. `parity-check.mjs` checks 10 sizes. |
| [`performance-desktop-max-and-mobile`](performance-desktop-max-and-mobile/) | Speed without lowering quality: tier weight budgets, Core Web Vitals, critical path, image/video/3D recipes, 60-120 fps rules, long tasks, caching. `budget-check.mjs` measures any URL against the tier. |
| [`accessibility-and-reduced-motion`](accessibility-and-reduced-motion/) | WCAG 2.2 AA as numbers, keyboard paths for menus/dialogs/carousels/configurators, accessible 3D and canvas, forms, reduced motion designed per scene, forced colours. `a11y-check.mjs` at 1440 and 390. |
| [`seo-and-meta`](seo-and-meta/) | Titles, descriptions, one H1, canonicals (incl. desktop + m.html), Open Graph / X cards, JSON-LD without fake reviews, sitemap.xml, robots.txt and Google Search Console step by step. `seo-check.mjs`, `sitemap.mjs`. |
| [`imagery-assets-licensing`](imagery-assets-licensing/) | Free sources and each licence's limits, "unclear means skip", credit files that pass the gate, photo direction, grading into the palette, portrait crops, knockouts, own renders instead of AI images. `credit.mjs`, `knockout.py`. |
| [`interactive-product-configurator`](interactive-product-configurator/) | Drag-to-build configurators (pizza builder from the @online.by.annie reel): real photo layers, drag with snap ring, tap-to-add on phone, layer order, live ticket, bake transition, a11y. Lead example: concept P041. |
| [`award-site-teardown-method`](award-site-teardown-method/) | How to study Awwwards / FWA / CSSDA sites and extract techniques, not content: the teardown card, DevTools recipes (performance, network, layers), motion timing by frame, what to take and never take. `teardown.mjs` reads a live page's stack. |
| [`client-site-delivery-workflow`](client-site-delivery-workflow/) | Brief → build → QA → deploy (Vercel / sites.tab.bot) → handover, for client and concept sites: intake questions, scope, staging, evidence, Search Console, credits, handover pack. `brief.mjs`, `handover.mjs`. |

## Process and delivery (3 skills, added 30 Oct 2026)

Sujon, 30 Oct 2026: before any website, a full spec and storyboard first; real assets only; a clean handover. These three run around the design skills above: one before the build, one during it, one at the client end.

| Skill | What it teaches | Lines |
|---|---|---|
| [`build-spec-and-storyboard`](build-spec-and-storyboard/) | **Before any code.** The 10-section build spec (story beats, stack, token tables, assets with licences, section layouts with layering, the 3D/hero part by part, scroll timeline, QA), 4-8 storyboard stills from real assets, and the owner/client review gate. Full worked example (a fictional desk lamp) and `spec-lint.mjs`, which refuses a spec with gaps. | 243 |
| [`asset-sources-and-licence-check`](asset-sources-and-licence-check/) | Where to get real CC0 / CC BY photos, textures, HDRIs and 3D models (Commons, Poly Haven, ambientCG, Smithsonian, Sketchfab filters, Openverse, Unsplash/Pexels notes), how to verify a licence on the asset's own page, the credit file the gate reads, visible CC BY credits. `licence-probe.mjs` reads the licence from the source's API and drafts the credit file. No AI images. | 228 |
| [`client-delivery-kit`](client-delivery-kit/) | What we send a client: brief form, price tiers (from $300, up to $10k; tier contents to be filled by Sujon), stage timeline, revision policy, quote/launch message templates and the handover checklist (domain, hosting, credentials, credits, analytics, Search Console). | 236 |

Also: the one-page ship checklist [`docs/QA_CHECKLIST.md`](../docs/QA_CHECKLIST.md) and case studies in [`docs/case-studies/`](../docs/case-studies/) (first: [P041 Hotcoal Kitchen, the pizza built three times](../docs/case-studies/P041-hotcoal-kitchen.md)).

## Tools and techniques

| Skill | What it gives you |
|---|---|
| [`qa-harness`](qa-harness/) | One command that checks every page of a site at desktop and two phone sizes plus reduced motion: console errors, failed requests, horizontal overflow (and which element causes it), WebGL, broken links, screenshots, and a pass/fail report that ends in a verdict. |
| [`liquid-glass-ui`](liquid-glass-ui/) | A drop-in liquid-glass UI kit (nav pill, cards, buttons, segmented control, switch, slider, sheet, phone tab bar) with edge refraction, specular rim, hairline and fallbacks. Plain CSS + one small JS file. |
| [`unique-concepts`](unique-concepts/) | A method for concept ideas that do not look like templates: an idea matrix, constraint cards, category inversion, a filter, a brief to fill before code, a palette checker, and the seven mistakes Tab made building this library with the check that prevents each (`tools/preflight.mjs`). |
| [`web-security`](web-security/) | Build security into a site from the first file (secrets, headers, a CSP that works with three.js, forms and spam, third-party scripts, backends) plus `check.mjs`, a scanner for a folder or a live URL that exits 1 on anything HIGH. |
| [`scroll-video-hero`](scroll-video-hero/) | The scroll-scrubbed video hero from the top of the Zyqor portfolio (idea from scroll-world by cyw, MIT): get a clip without AI renders, encode it for smooth scrubbing, desktop and phone cuts, a 4 KB engine, fallbacks, QA, and a working example. |
| [`model-optimisation-phone`](model-optimisation-phone/) | Turn one glTF/GLB into one optimised file that desktop and phone both load and that looks identical, then prove it with side-by-side renders. |

## Coming next
Deeper versions of the existing skills (more worked examples per tier), `scroll-world-real` (the full multi-scene flight without AI renders), `shader-starters`, `physics-interactions`, `motion-design-system`.

## How to get one
- Download the whole repo as a ZIP (green "Code" button, then "Download ZIP") and copy the skill folder you want, or
- `npx degit zyqorbusiness-lab/best-website-designer/skills/qa-harness my-qa` (any skill name works).
- Large example files are stored as numbered parts because of an upload limit. After downloading, run `node tools/join-parts.mjs` from the repo root once and they are rebuilt (checksums verified).

To use a skill with an AI coding agent, copy its folder into your agent's skills directory; `SKILL.md` has the name, description and when-to-use at the top.

Code in these folders is MIT (see each `LICENSE`). Third-party models, HDRIs, photos and fonts in the examples keep their own licences, listed in each skill's README.
