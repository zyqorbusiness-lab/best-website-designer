# MASTER_ASKS.md: everything Sujon asked for, checked

Updated Oct 30 2026, 03:41 UTC by the big-review worker. Built from `work/beast/CHAT_ANALYSIS.md` (all 697 of his messages, Oct 25 to Oct 30), `VOICE_NOTES.md` (9 voice notes) and `DRIVE_BEST_POINTS.md`. One row per ask; repeated asks are merged into the first. Process rules (one agent, fast replies, quality first) and non-repo errands (calls, reels, Instagram) are in CHAT_ANALYSIS sections 8-13 and are not counted here.

**Counts: 53 done, 11 partial, 0 missing (64 asks).**


## Big asks (Oct 28)

| | Ask | When / ref | Status | Evidence |
|---|---|---|---|---|
| [~] B1 | 300 premium 3D-model concepts (100 normal, 100 advanced, 100 premium) | Oct 28 06:30 `bf1bce4d` | **PARTIAL** | 18 of 300 live and QA-passed (N001-N010, N014, N020, N025, N048, A013, A018, A027, P017): `site/library/`, live at zyqor-concepts.sites.tab.bot/library/. The other 282 show as "Coming" palette cards. |
| [~] B1b | More skills anyone can download | Oct 28 06:30 `bf1bce4d` | **PARTIAL** | 6 of 22 planned skills ready in `skills/`: qa-harness, liquid-glass-ui, model-optimisation-phone, unique-concepts (v1.1), web-security (new Oct 30), scroll-video-hero (new Oct 30). |
| [x] B1c | Best points from his premium-design Drive in the repo | Oct 28 06:30 `bf1bce4d` | **DONE** | `docs/beast/DESIGN_RULES.md`, `work/beast/DRIVE_BEST_POINTS.md` (sections 1-17); Drive component anatomy used for the components (pricing squish toggle, odometer, accordion physics). |
| [~] B1d | A beast repo built from an analysis of the whole chat | Oct 28 06:30 `bf1bce4d` | **PARTIAL** | CHAT_ANALYSIS.md (sections 0-16, through Oct 30), this checklist, VOICE_NOTES.md; repo commits 7ed5a01 and (Oct 30 batch, see the commit list in STATE.md). Scale (300 concepts, 22 skills) not reached. |
| [x] B2 | The best of the 3D (scroll-world) repo goes in too | Oct 28 06:36 `fcf2f86b` | **DONE** | The scroll-world engine drives the portfolio intro (`site/scrub-engine.js`, MIT credit to cyw/oso95), and since Oct 30 the top-of-site scroll video is a downloadable skill: `skills/scroll-video-hero/` (method, 4 KB engine, a working example with desktop and phone clips rendered from a real CC0 model). The full multi-scene "scroll-world-real" skill is still on the Coming list. |
| [x] B3 | Same repo (best-website-designer) | Oct 28 06:36 `623a942f` | **DONE** | All work is on `zyqorbusiness-lab/best-website-designer` main. |

## Websites and portfolio

| | Ask | When / ref | Status | Evidence |
|---|---|---|---|---|
| [x] W1 | Use the scroll-world skill on every website, permanently | Oct 27 06:28 `1a6e33e2` | **DONE** | v3 intro + `site/scrub-engine.js`; bakery site; standing rule in memory. |
| [x] W2 | Lazy-load effects on every website | Oct 27 06:29 `9983167f` | **DONE** | Kit `whenVisible`, `loading="lazy"`, 3D starts on view; components lazy-load 3D too. |
| [x] W3 | Separate laptop and phone builds | Oct 27 06:29 `e586cec8` | **DONE** | `index.html` + `m.html` per page; same assets (see P1). |
| [x] W4 | Optimise on every device | Oct 27 09:11 `d19c78fb` | **DONE** | Weight budgets in QA; per-page weights in FINAL_REPORT. |
| [x] W5 | Full laptop video of the site | Oct 27 09:11 `ce8a4dd9` | **DONE** | `docs/scroll.gif`, walkthrough mp4s; Oct 30 concept videos (N020, P017). |
| [x] W6 | Autoplay and Skip buttons | Oct 27 | **DONE** | v3 `.sw-tour__btn--play` / skip. |
| [x] W7 | Cute panda loading screen | Oct 27 | **DONE** | Bakery site (not a repo item). |
| [x] W8 | A "meta" portfolio with all his work | Oct 27 | **DONE** | https://zyqor-portfolio-v3.sites.tab.bot/ Work section, 6 live links. |
| [x] W9 | Award-level polish, click effects, many effects | Oct 27 | **DONE** | `fx.js`, `/studio/ui/`; now 14 components (magnetic button, cursor, page transition, ...). |
| [x] W10 | Gmail link opens Gmail (not copy) | Oct 27 | **DONE** | Gmail compose on desktop, mailto on phone (site + footer-wordmark component). |
| [x] W11 | Keep fixing UI/UX and animation | Oct 27 | **DONE** | 4 audit passes; Oct 30 fixes (library title, back link, P017 footer, encoding). |
| [x] W12 | Give him the source code | Oct 27 | **DONE** | GitHub ZIP + `node tools/join-parts.mjs`. |
| [~] W13 | Study @ayzz.thedesigner, "khatarnak level" repo with many concepts | Oct 27 15:35 `dc92a593` | **PARTIAL** | 499 posts catalogued (patterns A-K), 18 Lab + 18 library concepts; ayzz section in the study doc. Many-concepts scale still growing. |
| [x] W14 | Check it yourself, fix it yourself | Oct 27 | **DONE** | QA harness, audits, this review. |
| [x] W15 | More pages: colour theory, design, animation, model | Oct 27 | **DONE** | `site/color/`, studio pages, process, services. |
| [x] W16 | Premium liquid glass on every screen | Oct 27 | **DONE** | `site/assets/glass/`; `skills/liquid-glass-ui`; liquid-glass-card component. |
| [x] W17 | Check the repo against everything he said, again and again | Oct 27 | **DONE** | REQUIREMENTS R1-R35; CHAT_ANALYSIS; this file. |
| [x] W18 | Install the 3D skill repo | Oct 27 | **DONE** | Installed and safety-checked (MIT). |

## 3D and models

| | Ask | When / ref | Status | Evidence |
|---|---|---|---|---|
| [x] M1 | Better assets and models, about 1 hour each | Oct 27 | **DONE** | Two upgrade rounds, 14/14 items, 60-97 min per helper. |
| [x] M3 | Real premium assets; code-made only when better; no fake emojis | Oct 27 | **DONE** | Lab demos use real CC0/CC-BY models since Oct 28; library concepts use real models + credit files; components use a real CC0 scan. |
| [x] M4 | More detail on the models | Oct 28 | **DONE** | Normal/roughness/AO maps, HDRI, contact shadows, ACES. |
| [~] M5 | Many concepts, not one design repeated | Oct 27 | **PARTIAL** | 36 distinct concepts (18 Lab + 18 library) with pattern letters so pairs do not repeat; 282 library concepts to go. |
| [~] M6 | Show in detail how 3D models are made | Oct 30 06:29 `b06c7f5b` | **PARTIAL** | `skills/model-optimisation-phone`, the scroll-3d-stage component README (HDRI, ACES, poster, lazy), study section 5. No full "modelling from scratch" guide. |

## Design

| | Ask | When / ref | Status | Evidence |
|---|---|---|---|---|
| [x] D1 | 3-colour palette per site, no black, no purple, premium fonts | Oct 27 | **DONE** | Palette check in `skills/unique-concepts/tools/`; components use a unique 3-colour set each, OFL fonts. |
| [x] D2 | No emojis on websites | Oct 27 | **DONE** | Emoji scan = 0; SVG icons only. |
| [~] D5 | Nothing should feel AI-made | Oct 27 | **PARTIAL** | No AI images in Lab, library or components. Judged by eye; he said Oct 30 the concepts still feel too simple. |
| [x] D6 | Study award sites and premium sites, plus ayzz | Oct 27 | **DONE** | `docs/how-top-designers-build-unique-sites.md` (Oct 30): 30 Awwwards sites read, 20 opened in Chrome, CSSDA, ayzz. |

## Honesty and assets

| | Ask | When / ref | Status | Evidence |
|---|---|---|---|---|
| [x] H1 | Repo includes the video-flow way (real assets) | Oct 27 | **DONE** | `tools/video-flow/`. |
| [x] H3 | No AI renders | Oct 27 | **DONE** | New work uses real footage/models only; old AI scroll clips flagged as his own intro clips. |
| [x] H5 | Concepts labelled, no fake clients | Oct 27 | **DONE** | Every page says concept/fictional; quote carousel uses real attributed designer quotes, labelled. |
| [x] H6 | Credits for every asset | Oct 27 | **DONE** | `CREDITS.md`, `<asset>.credit.json`, `tools/credits-check.mjs` gate (0 failures at push). |

## Phone

| | Ask | When / ref | Status | Evidence |
|---|---|---|---|---|
| [x] P1 | Phone = same premium quality and same models | Oct 27 20:23 | **DONE** | Same files on phone; QA 1440/390/360 with 0 console errors for all concepts and components. |

## Skills

| | Ask | When / ref | Status | Evidence |
|---|---|---|---|---|
| [~] S3 | More downloadable skills | Oct 28 06:30 `bf1bce4d` | **PARTIAL** | See B1b. |
| [x] S5 | Security skill an agent can follow, with an automatic check | Oct 28 09:18 `ef07f0d1` | **DONE** | `skills/web-security/` (SKILL.md, `check.mjs` for a folder or a live URL, header examples, honeypot form). Repo now passes it with 0 HIGH (CSP left as a documented MEDIUM). |
| [x] S6 | Skills must be general and downloadable, not his portfolio | Oct 28 09:19 `3a7c4eb7` | **DONE** | Each skill folder is self-contained with MIT licence; `npx degit` instructions in `skills/README.md`. |
| [x] S7 | A skill on how to make unique concepts, many techniques | Oct 29 18:01 `a2fda030` | **DONE** | `skills/unique-concepts` v1.1 (now with the award-site study table and ayzz techniques). |
| [x] S8 | Include the mistakes Tab made | Oct 29 18:01 `321e7e7b` | **DONE** | unique-concepts section 9 + `preflight.mjs`. |

## Oct 28-30 asks

| | Ask | When / ref | Status | Evidence |
|---|---|---|---|---|
| [x] N1 | Full report: said / done / not done / not understood | Oct 28 09:23 `7c2c7b13` | **DONE** | This file (`docs/beast/MASTER_ASKS.md`). |
| [x] N2 | Price tiers $300 / $1k / $10k | Oct 28 09:42 `9935167c` | **DONE** | README "Prices", library README tier table, pricing-table component. |
| [x] N3 | Exact licence + credit next to every asset | Oct 28 10:16 `84fea3da` | **DONE** | credit.json per asset; credits gate. |
| [x] N4 | Repo downloadable; tell him when done | Oct 28 09:56 `fceaae23` | **DONE** | ZIP + join-parts; report sent per batch. |
| [x] N5 | Is the top-of-site video's repo (scroll-world) in his repo? | Oct 29 14:19 `f755dc38` | **DONE** | The scroll-world engine drives the portfolio intro (`site/scrub-engine.js`, MIT credit to cyw/oso95), and since Oct 30 the top-of-site scroll video is a downloadable skill: `skills/scroll-video-hero/` (method, 4 KB engine, a working example with desktop and phone clips rendered from a real CC0 model). The full multi-scene "scroll-world-real" skill is still on the Coming list. |
| [x] N6 | Study how the best unique sites are made; put it in the skill and the repo | Oct 30 06:26 `119fbe03` | **DONE** | `docs/how-top-designers-build-unique-sites.md` + `skills/unique-concepts` section 10b. |
| [~] N7 | A concept website per industry | Oct 30 06:26 `119fbe03` | **PARTIAL** | 18 concepts across 16 industries (tailor, ceramics, salt, lighting, optics, type, diya, cabins, toggles, citrus, eyewear, music school, toys, barber, knives, hi-fi). No full per-industry index yet. |
| [x] N8 | Repo usable by any AI that downloads it | Oct 30 06:26 `119fbe03` | **DONE** | Every skill has a SKILL.md with front matter (name, description, when_to_use) that agents read; web-security has an "order to work in" for agents. |
| [~] N9 | Concepts feel too simple: make them better | Oct 30 06:28 `9a0d3507` | **PARTIAL** | Oct 30: a premium layer on all 18 concepts, desktop and phone (`site/library/_kit/premium.js`): a colour-blocked type band from each page's own headings that moves with scroll, headings that rise out of a mask, a scroll progress hairline, and the brand name as a giant rising wordmark in the footer. N020 phone: the ukulele now stays pinned while the strings slide over it. Library QA: 18/18 PASS. The concepts were not rebuilt one by one, so the content sections are still fairly plain. |
| [x] N10 | Two concept videos (1 simple, 1 premium) | Oct 30 06:28 `9a0d3507` | **DONE** | N020 + P017 videos sent Oct 30. |
| [~] N11 | Put the sites on Vercel | Oct 30 06:28 `9a0d3507` | **PARTIAL** | `vercel.json` ready (build step, security headers). Needs his one-time "Import Git Repository" on vercel.com; demo link meanwhile: zyqor-concepts.sites.tab.bot. |
| [x] N12 | Detailed, best-quality components | Oct 30 06:29 `b06c7f5b` | **DONE** | 14 components in `site/components/` with demos, READMEs, credits; live gallery zyqor-concepts.sites.tab.bot/components/. |
| [x] N13 | A demo website link to show people | Oct 30 06:29 `64785230` | **DONE** | https://zyqor-concepts.sites.tab.bot/library/ |
| [x] N14 | @ayzz.thedesigner link in the repo | Oct 30 06:32 `93dd054e` | **DONE** | README "Inspiration", study doc section 9, components README. |
| [x] N15 | Understand the whole chat, every voice note, the whole Drive, fix the repo | Oct 30 06:33 `12175b2f` | **DONE** | CHAT_ANALYSIS section 16, VOICE_NOTES.md (9 notes re-transcribed), DRIVE_BEST_POINTS section 17, this batch of fixes. |
| [x] N16 | How unique websites are made | Oct 30 06:34 `091f5a09` | **DONE** | See N6. |

## Known bugs fixed Oct 30

| | Ask | When / ref | Status | Evidence |
|---|---|---|---|---|
| [x] F1 | P017 footer CSS not shipped | Oct 30 | **DONE** | `site/library/p/P017/style.css` + `m.css` pushed. |
| [x] F2 | Library title said the wrong count | Oct 30 | **DONE** | Title, og and description say "18 of 300". |
| [x] F3 | "Back to portfolio" pointed at the wrong page | Oct 30 | **DONE** | Links to https://zyqor-portfolio-v3.sites.tab.bot/ (desktop) and /m/ (phone). |
| [x] F4 | "Â·" mojibake on the demo root page | Oct 30 | **DONE** | Replaced with `&middot;`. |
| [x] F5 | README claimed a "separate reviewer" | Oct 30 | **DONE** | Reworded to what happens (a second QA pass against the 118-point list). |

## Still missing or partial, in the order to do them

1. The other 282 library concepts (batches of 25, each QA-passed), with a premium pass on the "too simple" ones first.
2. The remaining planned skills (`skills/README.md` "Coming next").
3. A per-industry concept index page.
4. A full "how a 3D model is made" guide (modelling, UVs, textures), beyond optimisation.
5. His one-time Vercel import.
6. A Content-Security-Policy header for the portfolio (needs inline scripts moved to files first).
