# AUDIT nb1b — fix-and-push gate (2026-10-29, 08:35–11:45 UTC)

Run for Sujon (one agent at a time). Scope: the FIX FIRST items of AUDIT_nb1a.md (N002, A018, N003, N004, N008), R2/R3 (kit footer), the v3 Lab model swaps signal + hush, and the push gate.
Untouched on purpose (Sujon, Oct 29: UNDECIDED): the Fontshare/ITF fonts and the Mixkit frames in carmine / longway / rise. Also untouched (Sujon, Oct 29): every hero video / site/assets/hero/* file.

## Verdict: PASS (push allowed)

| Gate | Result |
|---|---|
| Kit-v2 QA, all 11 built concepts x 7 runs (d1440, m390, m360, rd1440, rm390, nd1440, nm390) + library index 4 runs | **PASS** 77/77 + 4/4, 0 console errors, 0 failed requests, 0 overflow (work/beast/qa_nb1b/full/summary.md) |
| Phone = PC (same 3D files + same effects) | **PASS** on all 11 |
| No-WebGL poster fallback (desktop + phone) | **PASS** on all 11 |
| v3 Lab signal + hush: 1440 / 390 / 360 + no-WebGL 1440 / 390 | **PASS** 10/10, 0 console errors, 0 failed requests, 0 overflow, same GLB on desktop and phone (work/beast/qa_nb1b/v3/) |
| Credit gate (tools/credits-check.mjs, repo staging) | **PASS**: 1435 asset files, 0 missing / incomplete credit files, every CC-BY asset attributed visibly. 977 files are flagged 'licence under review' = the known undecided groups (Mixkit 862, ITF fonts 22, own work 70, BY-SA/BY 3.0 US 23); unchanged by this run |
| Secret scan (site/, tools/, skills/, docs/) | **PASS**: 0 tokens/keys. Only hits: two local Chrome fallback paths in tools/qa-library.mjs (dev tool, not secrets) |

## Per concept (full run)

| concept | verdict | runs | own KB d/m (budget) | same 3D files | same effects | no-WebGL | credits |
|---|---|---|---|---|---|---|---|
| N001 | **PASS** | d1440:P m390:P m360:P rd1440:P rm390:P nd1440:P nm390:P | 723/711 (1536) | True | True | True | ok (14 files, 0 CC-BY) |
| N002 | **PASS** | d1440:P m390:P m360:P rd1440:P rm390:P nd1440:P nm390:P | 286/273 (1536) | True | True | True | ok (9 files, 0 CC-BY) |
| N003 | **PASS** | d1440:P m390:P m360:P rd1440:P rm390:P nd1440:P nm390:P | 469/460 (1536) | True | True | True | ok (8 files, 1 CC-BY) |
| N004 | **PASS** | d1440:P m390:P m360:P rd1440:P rm390:P nd1440:P nm390:P | 195/177 (1536) | True | True | True | ok (9 files, 0 CC-BY) |
| N005 | **PASS** | d1440:P m390:P m360:P rd1440:P rm390:P nd1440:P nm390:P | 958/939 (1536) | True | True | True | ok (10 files, 0 CC-BY) |
| N006 | **PASS** | d1440:P m390:P m360:P rd1440:P rm390:P nd1440:P nm390:P | 461/451 (1536) | True | True | True | ok (9 files, 0 CC-BY) |
| N007 | **PASS** | d1440:P m390:P m360:P rd1440:P rm390:P nd1440:P nm390:P | 756/746 (1536) | True | True | True | ok (10 files, 0 CC-BY) |
| N008 | **PASS** | d1440:P m390:P m360:P rd1440:P rm390:P nd1440:P nm390:P | 1377/1365 (1536) | True | True | True | ok (12 files, 2 CC-BY) |
| N009 | **PASS** | d1440:P m390:P m360:P rd1440:P rm390:P nd1440:P nm390:P | 134/120 (1536) | True | True | True | ok (6 files, 0 CC-BY) |
| N010 | **PASS** | d1440:P m390:P m360:P rd1440:P rm390:P nd1440:P nm390:P | 597/585 (1536) | True | True | True | ok (10 files, 0 CC-BY) |
| A018 | **PASS** | d1440:P m390:P m360:P rd1440:P rm390:P nd1440:P nm390:P | 1624/1611 (3072) | True | True | True | ok (16 files, 0 CC-BY) |

## What changed

- **Kit footer (R2, R3):** `_kit/chrome.js` footer now carries "Want a site like this? Hire Zyqor Studio" with Email (Gmail compose on desktop, mailto on touch) zyqorbusiness@gmail.com, WhatsApp +91 95479 08593 (wa.me/919547908593), Instagram @zyqor_og; all links `target=_blank rel="noopener noreferrer"`; credit links now `noopener noreferrer`. Inline SVG icons, no emoji. Applies to every library concept.
- **Kit production shell:** new `_kit/landing.css` + `_kit/landing.js` (generalised from N005): glass nav with section links + phone menu sheet, honest concept form (validation, loading, "Concept: not sent" success, no action / no fetch), section blocks, dark-page variants.
- **N002 Kiln & Quiet:** nav (The vase, Glazes, Studio, Reserve) + phone menu; new Glazes, Studio (5-step process) and "Reserve a piece" form sections on both index.html and m.html. Poster/thumb re-shot.
- **A018 Tranquility Base:** nav (Approach, Surface, Mission, Visit) + phone menu; Mission (3-day itinerary), FAQ and "Request a viewing" form. Phone detail cuts removed: m.html now uses 12 rocks, 3200 stars, 240x240 terrain, 2048 shadow map (same as desktop). Credits: one line per moon rock to its exact Poly Haven page; code scene marked own work (MIT).
- **N003 Tidewell Salt:** code-made lathe jar replaced by "Glass Jar with Marble Lid 2.0" by InGameStudio (Sketchfab uid f5383b6b32eb4439b874473b6d52df0c, CC BY 4.0); spec/gloss converted to metal/rough, 1024 px WebP, meshopt, all triangles kept (264 KB). The middle jar of the set, re-materialed (transmission glass, coral-tinted marble lid); lid-lift scroll, flakes, label, refracted band kept. Phone flakes 340 -> 420 (= desktop). Visible CC-BY line on both pages + credits sheet.
- **N008 Northpine Cabins:** code cabin + faceted pines replaced by "Wooden Cabin" by donnichols (uid c90674a377864ac1b8fd141ad1917ee3, CC BY 4.0, 601 KB) and "Pine Tree" by evolveduk (uid d45218a3fab349e5b1de040f29e7b6f9, CC BY 4.0, 255 KB, placed 10x); snow shader on both so the season split still cuts roof and needles. Planks/roof textures no longer loaded. Own weight 1377 KB (budget 1536). Visible CC-BY line on both pages.
- **N004 Morrow Light:** orb off-state now opal glass, not grey clay: shell colour #efe4d8, transmission 0.86 off, roughness 0.3 + clear coat + sheen, faint ember core and inner glow when off, cool rim light, more HDRI light at night. Poster/thumb re-shot. Lamp stays code-made (no usable CC0/CC-BY orb lamp found; noted in brief.md).
- **v3 Lab signal:** the real-model page (speaker.js) loads assets/lab/signal/signal-one.glb, but the site copy had lost the GLB and three of its four stills; restored from the helper's build (GLB + stills re-encoded from the bake) and wrote the missing signal-one.glb.credit.json (CC BY 4.0, Chizheo). Repo already held identical GLB/stills; only the credit file is new there.
- **v3 Lab hush:** real "Over-ear headphones" model (Zack Kenin, CC BY 4.0) already in site and repo staging, byte-identical; verified by QA above.
- **Library index:** library-build: 11 built (N001-N010, A018); N003/N004/N008 move from "building" to built.
- **CREDITS.md** regenerated (495 credit files) with the existing header kept.

## Left / notes
- Undecided by Sujon, untouched: Fontshare fonts (ITF FFL) and Mixkit frame sequences (carmine, longway, rise) + their tools/video-flow work files.
- Hero videos: untouched; live-site republish waits for Sujon's choice of hero video.
- N003: the real jar sits a little small in the 1440 hero; N004/N007 re-theme mechanic overlap (optional distinctness item) not done.
- N008 pine normal maps dropped and trunk maps 128 px to stay inside the normal-tier budget (needles at 1024 px).
