# AUDIT nb2: new concept batch + unique-concepts skill (2026-10-29, 19:24-21:10 UTC)

Run for Sujon by one agent (one-agent rule: no helpers). This is a **self-review** against the 118 chat items (distilled into the 20 rules of `work/beast/CHAT_ANALYSIS.md` section 14), `docs/beast/DESIGN_RULES.md` and the per-concept rules (production page, phone = PC, real models, credits, no emoji, 3 colours, no black/purple, reduced motion, poster fallback). It is not a separate-reviewer audit like nb1a; a separate review of nb2 is still worth doing.

Untouched on purpose: `site/assets/hero/*`, `config-desktop.js`, `m/config-mobile.js`, the Fontshare/ITF fonts and the Mixkit frames (Sujon: undecided).

## Verdict: PASS (push allowed)

| Gate | Result |
|---|---|
| Kit-v2 QA, all 18 built concepts x 7 runs (d1440, m390, m360, rd1440, rm390, nd1440, nm390) + library index 4 runs | **PASS** 126/126 + 4/4: 0 console errors, 0 failed requests, 0 overflow (work/beast/nb2/qa/full/summary.md). The 11 older concepts were re-run because the shared kit changed (contact shadow resolution). |
| Re-run of the 7 new concepts after the credits.json path fix | **PASS** 49/49 runs (7 concepts x 7), no credit notes left; P017 and A027 re-run once more after a framing fix (14/14, work/beast/nb2/qa/new_final2/) (work/beast/nb2/qa/new_final/summary.md) |
| Phone = PC (same 3D files + same effects) | **PASS** on all 18 (QA asset/effect diff) + `preflight.mjs` M5 on all 18 (found and fixed one real cut in N006: phone glyph curves 12 vs 14 segments) |
| No-WebGL poster fallback (desktop + phone) | **PASS** on all 18 |
| Weight budget (own files) | **PASS**: N 134-1377 KB of 1536; A 609-1624 KB of 3072; P017 2604 KB of 6144 |
| Credit gate (`tools/credits-check.mjs`) | **PASS** on the working tree (1446 asset files) and on the push staging folder (1459 asset files incl. parts-split files):  0 missing / incomplete credit files, every CC-BY asset attributed visibly. 976 / 977 files flagged "licence under review" = the known undecided groups (Mixkit 862, ITF fonts 22, own work 70, BY-SA / BY 3.0 US 22), unchanged by this run. Root `CREDITS.md` regenerated (519 credit files) |
| Preflight (`skills/unique-concepts/tools/preflight.mjs`) on all 18 concepts | **PASS** (N001, N003, N004, N006, N008, N009 with `--code-ok` where the hero is code-made by design) |
| Preflight `--tree` on the push staging folder | **PASS**: 0 hardlinked files in 2544 files; no placeholder text in shipped html/js/css/json. 15 warnings, all pre-existing `href="#"` links in Lab demos / studio pages (out of scope, unchanged) |
| Secret scan (whole staging folder: site/, skills/, tools/, docs/, root files) | **PASS**: 0 tokens / keys / private keys / bearer strings (regex scan of 1,076 text files) |
| Palette check (3 colours, no black, no purple, contrast) on the 7 new concepts | **PASS** 7/7 (P017 had a near-black shadow #140806, replaced with an oxblood tint) |

## 1. Concepts added (7): running total 18 built (was 11)

| ID | Name | Tier | Signature | Real assets | Palette | Own KB d/m |
|---|---|---|---|---|---|---|
| N014 | Glint Eyewear | Normal | spectacles over a live canvas eye chart, transmission lenses, dioptre stepper | Round Spectacles (Sean Buckley, CC0 1.0); Studio Small 09 (Sergej Majboroda, CC0 1.0) | #E2EAEE / #3B2A1E / #2F58DE | 790/779 (1536) |
| N020 | Chordline Music School | Normal | ukulele strings are the menu, Karplus-Strong pluck, chord diagrams | Ukulele 01 (Joseph Burgan, CC0 1.0); Studio Small 09 (Sergej Majboroda, CC0 1.0) | #F3E6CF / #2B2118 / #2E9E5E | 446/431 (1536) |
| N025 | Bathtime Duck | Normal | duck on a ripple shader, tap to ripple, live bob readout | Rubber Duck Toy (Plat251, CC0 1.0); Studio Small 09 (Sergej Majboroda, CC0 1.0) | #FBE7DA / #164234 / #C59B24 | 315/303 (1536) |
| N048 | Ironbark Barbers | Normal | chair turns on a 6-service compass ring with detents, seat pump 48-58 cm | Barber Shop Chair 01 (Fernando Quinn, CC0 1.0); Studio Small 09 (Sergej Majboroda, CC0 1.0) | #EFE7DA / #17303A / #C8402F | 542/529 (1536) |
| A013 | Shelfline Ceramics | Advanced | shelf walk, moving spot + shadows, heights measured from scans | Ceramic Vase 01 (James Ray Cock, CC0 1.0); Ceramic Vase 02 (James Ray Cock, CC0 1.0); Ceramic Vase 04 (James Ray Cock, CC0 1.0); Antique Ceramic Vase 01 (James Ray Cock, CC0 1.0); Dark Planks (Rob Tuytel, CC0 1.0); Studio Small 09 (Sergej Majboroda, CC0 1.0) | #ECD6CE / #2F2316 / #E64B76 | 986/976 (3072) |
| A027 | Cut & Grain Knives | Advanced | pinned 4-chapter scroll, edge macro, blade/handle explode, lengths from scan | Fish Knife (Mateusz Sadek, CC0 1.0); Studio Small 09 (Sergej Majboroda, CC0 1.0) | #EFEEDA / #353F21 / #EAA21C | 609/599 (3072) |
| P017 | Tapehead Hi-Fi | Premium | VU meter driven by real Web Audio RMS, tape eject + side-B flip on scroll, glass deck | Cassette Player (Oday Abuzaeed, CC0 1.0); Music Hall 01 (Sergej Majboroda, CC0 1.0) | #F2EBDD / #3A1F1A / #E5C61A | 2604/2594 (6144) |

Every new page: nav, real sections, an honest form that says "Concept: not sent" and never sends, the Hire Zyqor footer from the kit, the brand labelled "Concept", `brief.md` written before the code, `credits.json` per concept and a `.credit.json` next to every asset (including poster.webp / thumb.webp).

## 2. Rule matrix (new concepts)

| Rule | N014 | N020 | N025 | N048 | A013 | A027 | P017 |
|---|---|---|---|---|---|---|---|
| 1. Quality, iterated (screens reviewed, fixes applied) | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| 3. Self-check: QA harness passed before report | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| 4. Distinct signature vs library | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| 5. 3D element; premium = PBR + HDRI | PASS | PASS | PASS | PASS | PASS | PASS | PASS (PBR scan + own HDRI) |
| 6. Real CC0/CC-BY assets, code-made only as props | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| 7. No emoji (preflight M7) | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| 8. Fictional brand labelled Concept (M8) | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| 9. Credits per asset + CREDITS.md | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| 10. 3 colours, no black/purple (palette-check) | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| 11. Signature interaction + click/hover feedback | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| 12. Liquid glass (premium) | n/a | n/a | n/a | n/a | n/a | n/a | PASS (glass deck) |
| 13. Scroll kit / reveals | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| 14. Lazy 3D, pause off-screen (kit) | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| 15. Same models/effects on phone (QA + M5) | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| 16. Weight budget | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| 17. 0 errors 1440/390/360, no overflow, reduced motion, new-tab links, Hire Zyqor footer | PASS | PASS | PASS | PASS | PASS | PASS | PASS |

Rule 2 (one agent per item) was replaced for this run by Sujon's one-agent rule. Rule 20 (numbers) is in the report.

## 3. Weak spots (honest)

- **P017 shows a real maker's badge:** the CC0 cassette-player scan carries its original "Dixons" badge in the texture. Tapehead is a fictional shop selling restored decks, so a vintage maker's badge is plausible, but it is a real brand name on a concept page; masking it in the texture is a fair follow-up.
- **Self-review only.** Same agent built and audited; a separate reviewer pass over nb2 is still open.
- **P017 Tapehead:** the scan has the cassette as one mesh, so the reels cannot turn; "playing" is shown by the live VU needle and a faint deck tremble, not reel motion. The chord loop is a simple synthesised demo, not music. The 1.65 MB concert-hall HDRI is most of the premium weight.
- **A027 Cut & Grain:** the Fish Knife scan is light (2,736 triangles); the macro opening shot is sharp but the handle grain is soft up close. On phone the camera rolls 90 degrees in chapters 02-03 so the long blade fits the tall screen (framing only, same scene).
- **A013 Shelfline:** the shelf plank and wall are code-made props (real CC0 Dark Planks texture on the plank); vase 01 is the same scan N002 uses; under the warm spot the clay-pink wall reads a little greyer than #ECD6CE.
- **N014 Glint:** the eye chart is a canvas texture made in code (it is the subject the lenses refract, not the hero); transmission glass is the heaviest effect in the batch on low-end phones.
- **N025 Bathtime Duck:** the water is a code-made ripple shader plane under the real duck scan.
- **Posters:** pinned/fixed-stage concepts first captured nav and captions inside poster.webp; `tools/qa-library.mjs` now hides every overlay before the poster screenshot. The 11 older posters were not re-shot (they were already clean).
- **Not built this batch:** the mid-century lounge chair and brass pot were downloaded and optimised, then dropped (no concept used them), so they are not in the repo.

## 4. Shared changes

- `site/library/_kit/stage.js`: contact shadow is 512 px on phone and desktop (was 256 on phone): mistake 9.3 in the new skill.
- `site/library/_template/app.js`: no code-made placeholder model any more; `MODEL` must be set or the page throws (mistake 9.2).
- `site/library/n/N006/app.js`: same glyph curve detail on phone (14 segments, was 12).
- `tools/qa-library.mjs`: poster.webp is shot with overlays hidden.
- `skills/unique-concepts/tools/preflight.mjs --tree`: placeholder scan limited to shipped html/js/css/json (vendor libraries, `_template/` and docs/dev tools skipped), hardlink scan over every file.
- Root `CREDITS.md` regenerated from 519 credit files, plus an "Idea sources" section; root `README.md` live count 8 -> 18 and the skills line.
- `site/library/library.json` + `_data/catalogue.json` + `_data/nav.json` rebuilt: 18 built (14 normal, 3 advanced, 1 premium).
- New skill `skills/unique-concepts/` (SKILL.md with exactly 7 mistakes + checks, 4 tools, data, examples, credits), listed in `skills/README.md` and the root README.

## 5. Not pushed on purpose

The push staging folder (`repo/gh_push`) holds 30 files under `site/lab/hush/`, `site/lab/signal/` and `site/assets/lab/signal/` (dated Oct 28) that differ from what `main` has at e026834. They were not made by this run and the nb1b push chose `main`'s versions, so this commit leaves them exactly as they are on `main`. Someone who owns the Lab v3 swaps should decide them. Also untouched: the Lab demos' `href="#"` links that `preflight --tree` warns about.

Push method: incremental, fast-forward only on top of e026834 (`work/beast/nb2/ghpush_nb2.py`: head read from `/branches/main`, only changed or new blobs uploaded, tree built in chunks of 100 on `base_tree`, no deletions). 150 files.
