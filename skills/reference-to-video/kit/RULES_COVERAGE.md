# RULES_COVERAGE — Zyqor Motion Kit v5.5

Every rule and feature from v5, v5.1 and Sujon's Nov 3, 2026 requests, and where it lives in the lean kit.
P = page of Zyqor_Motion_Kit_v5.3.pdf · Prompt = step in MASTER_PROMPT.txt · AGENT = step in AGENT_START_HERE.md · Tool/check = file or QC code.

| # | From | Rule / feature | PDF | Prompt | AGENT | Tool / check |
|---|---|---|---|---|---|---|
| 1 | v5 | Text & effects made EffectCraft-style, not Blender | P1 step 5 · P6 | Prompt 4 | AGENT Step 4 | ec_reel.py + zq_lib.jsx; QC F6 |
| 2 | v5 | Blender only for a real 3D object (as a plate), never text | P1 NEVER · P6 | Prompt 4 | AGENT Step 4 | QC F6 |
| 3 | v5 | Premium kinetic typography (word pop on voice, per-letter title cascade, mixed weights, motion blur, soft settle) | P6 | Prompt 4 | AGENT Step 4 | zq_lib.jsx captionLine/title |
| 4 | v5 | ref8 caption style: 1–3 words, big, ONE gradient keyword + italic serif accent, one highlight style | P1 · P6 · P8 | Prompt 4 | AGENT Step 4 | QC F3/F4 |
| 5 | v5 | **SUPERSEDED in v5.5 by row 52** (was: Two font families only (Inter + Instrument Serif Italic)); 1–4 words a line, line < 0.78 width, ≥ 90 px still applies | P6 | Prompt 4 | AGENT Step 4 | QC F10 (≥40 px hard), warn > 4 words |
| 6 | v5 | **SUPERSEDED in v5.5 by row 50** (was: Glow OFF; max one subtle glow on one object per scene; never on captions/cards/bg) | P1 · P6 | Prompt 4 | AGENT Step 4 | QC F2 (relaxed in v5.5) |
| 7 | v5 + Nov 3 9:06 PM | No purple / violet / purple-blue neon / blue neon / cyan glow / AI palettes — anywhere | P1 · P5 | Prompt 5 | AGENT Step 5 | zq_config banned 175–320°; QC F4/F5; ref_breakdown flags per second |
| 8 | v5 | 8 curated gradient presets for keywords | P5 | Prompt 4 | AGENT Step 4 | zq_config.json gradients; QC F4 |
| 9 | v5 | Premium textured backgrounds (paper, studio, plate), always moving 4–5 %, never flat black | P1 · P6 | Prompt 4 | AGENT Step 4 | zq_lib.jsx bg |
| 10 | v5 | Warm restrained grade + grain + vignette | P6 | Prompt 4 | AGENT Step 4 | zq_lib.jsx grade |
| 11 | v5 | **Density/levels SUPERSEDED in v5.5 by row 59** (was: Premium sfx: pop/card, click/tap, whoosh early + low hit/transition, riser to payoff, 1–3/s, voice on top, music ducked) | P6 | Prompt 4 | AGENT Step 4 | sfx_mix.py; QC warn > 2/s (v5.5) |
| 12 | v5 | Hook: something moves before 0.5 s, first word by 0.3 s; no dead-still second; no blank frames | P6 | Prompt 4 | AGENT Step 4 | QC warning (dead-still) |
| 13 | v5 | Layout grid: subject 40–60 % height, captions lower third (y 1380–1690) | — | — | AGENT Step 4 | zq_config safe_area; QC F10 |
| 14 | v5 | Motion: soft-settle ease + motion blur, overshoot only on pops, cards float, cursor taps | P6 | Prompt 4 | AGENT Step 4 | zq_lib.jsx |
| 15 | v5 | Transitions mixed (push, zoom-through, spin-blur warm, light leak, glitch warm), one per idea change | P6 · P8 | Prompt 4 | AGENT Step 4 | zq_lib.jsx out types |
| 16 | v5 | Export 1080×1920 30 fps, H.264 CRF 19, AAC 192k, +faststart; WhatsApp copy ≤ 16 MB | P1 | Prompt 6 | AGENT Step 6 | QC F9 |
| 17 | v5 | -14 LUFS, true peak ≤ -1 dBTP | P1 · P7 | Prompt 6 | AGENT Step 6 | master_mix.sh; QC F8 |
| 18 | v5 | Captions inside the 90 % title-safe area | P1 · P7 | Prompt 6 | AGENT Step 6 | QC F10 |
| 19 | v5 | QC gate must PASS; failed render never sent | P1 · P7 | Prompt 7c | AGENT Step 7 | qc_v5.py |
| 20 | v5 | Contact sheet + one full watch on a phone before sending | P1 step 6 · P7 | Prompt 7a | AGENT Step 7 | ref_breakdown.py on own output |
| 21 | v5 | Model edit = ref8 | P8 · P9 | Prompt fill-in {reference} | AGENT Step 4 | breakdowns/ref8_breakdown |
| 22 | v5.1 | Card rotation/tilt actually applied (bug fixed in zq_lib.jsx) | — | — | — | tools/templates/ec_kinetic_v5/zq_lib.jsx (v5.1 fix kept) |
| 23 | v5.1 | App/chat screen as a crisp UI built in code (no brand logo), not a drawn mockup | P10 | Prompt 4 | AGENT Step 4 | templates/ui_screen_v5 |
| 24 | face-lock v3 brief | Speech-to-text of the render matches the script | — | Prompt 7b | AGENT Step 7 | transcribe_words.py |
| 25 | Nov 3 9:11 PM | Zip contains ALL reference video links, clickable | P9 | — | AGENT Map | REFERENCE_LINKS.html/.csv/.txt |
| 26 | Nov 3 9:11 PM | Every reference: each second → 60 frames, every frame looked at | P1 · P4 | Prompt 2 | AGENT Step 2 | ref_breakdown.py (sheets, graph) |
| 27 | Nov 3 9:11 PM | Per frame/second: effects, animation (what/when/how/easing), text, text colour, glow, background, subject, b-roll | P4 | Prompt 2 | AGENT Step 2 | breakdown.json fields; QC F11 |
| 28 | Nov 3 9:11 PM | Pinterest refs first, then the breakdown, then the edit | P1 · P3 | Prompt 1–4 | AGENT Steps 1–4 | QC F1/F11 |
| 29 | Nov 3 9:14 PM | Music, sfx, b-roll, subject, effects (and background) all from Pinterest first, with search terms | P3 | Prompt 1 | AGENT Step 1 | pin_download.py; QC F12 |
| 30 | Nov 3 9:16–9:17 PM | Use the Pinterest files directly (downloader), best quality first, log pin links; no licence warnings | P3 | Prompt 1b | AGENT Step 1 | pin_download.py (assets_log.json, SOURCES.txt); QC F7 |
| 31 | Nov 3 9:16 PM | Pins are often reposts — original link worth checking (a note, not a block) | P3 | — | AGENT Step 1 | pin_download.py logs 'original' |
| 32 | Nov 3 9:16 PM | Zip/public repo carry links + downloader, not downloaded third-party media | P3 · P10 | — | — | zip contains no pin media / third-party mp4 |
| 33 | Nov 3 9:14 PM | Make it unique: change ≥ 3 things, log them | P1 · P5 | Prompt 3 | AGENT Step 3 | make_it_ours; QC F13 |
| 34 | Nov 3 9:22–9:24 PM | PDF upgraded but SMALL (≤ 15 pages), cheat sheet first, ref8 example page, links page | P1–P10 | — | — | Zyqor_Motion_Kit_v5.3.pdf |
| 35 | Nov 3 9:24 PM | AGENT_START_HERE.md ≤ 150 lines at the top of the zip; README points to it | — | — | whole file | AGENT_START_HERE.md, README.md |
| 36 | Nov 3 9:24 PM | Slim zip: used tools, small files, no third-party media (v5.3 adds the dropped TEXT back + code-only legacy_v4/) | P10 | — | README | zip (<= 10 MB) |
| 37 | Nov 3 9:26 PM | One master copy-paste prompt with fill-in block and gates | P2 | whole file | AGENT top line | MASTER_PROMPT.txt |
| 38 | Nov 3 9:26 PM | Rules coverage table, 0 missing | — | — | AGENT Map | RULES_COVERAGE.md (this file) |
| 39 | v5 Part B note | His original 'Motion graphics with Claude Code' prompts 01-14 restored (recoloured: no purple/cyan); superseded where they conflict (purple-blue bg, neon Pop Bold, 'no whooshes'); Editorial Grain = closest to default | — | — | — | prompts/PROMPTS_ALL_27.md |


| 40 | v5 | Honesty: concepts are labelled; no fake clients, reviews, testimonials, results; real faces only with permission | P1 · P7 | Preamble + Prompt 25 | AGENT Step 0 | CHECKLIST.md box 1 |
| 41 | v5 | Tick checklist before export (restored) | P1 | — | AGENT Step 7 | CHECKLIST.md |
| 42 | v4/v5.1 | All 27 prompts incl. raw-footage edit prompt 22 (restored) | P8 | Raw-footage line | AGENT Step 0 | prompts/PROMPTS_ALL_27.md |
| 43 | v4 | Recipes 00-06 + tools table + VO scripts (restored) | — | — | AGENT Map | recipes/ |
| 44 | v4 | Notes for ref1-ref6 (README, RESEARCH, style.json) + ref8 + style bible + boards (restored) | P9 | — | AGENT Map | references/ |
| 45 | Nov 3 9:11 PM + Nov 4 | 60 fps breakdown FILLED for ALL references ref1-ref8 + 2 Pinterest examples (effects, animation, text, colour, background, b-roll per second; machine facts + 2 fps viewing flag) | P4 | Prompt 2 | AGENT Step 2 | breakdowns/INDEX.md |
| 46 | Nov 3 9:14 PM + Nov 4 | Pinterest lists for music, b-roll, subject, sfx/effects (real pins, URL + title, reviewed flag, TAKE/SKIP) | P3 | Prompt 1 | AGENT Step 1 | pins/INDEX.md |
| 47 | Nov 4 | Kit runs outside Tab's box: no machine paths, requirements.txt = shipped scripts only, pinterest_refs.mjs marked BOX-ONLY, ec_reel.py --dry-run | — | — | README | tools/ (tested from a clean unzip) |
| 48 | Nov 3 9:16 PM | No third-party media in the zip or public repo (links + downloader only) | P3 | — | AGENT Step 0 | zip contains no pin media / reference video |
| 49 | v5 | Contact sheet of own render, ref8 'unique' standard: nothing 1:1 | P5 | Prompt 3 | AGENT Step 3 | make_it_ours per breakdown |
| 50 | Sujon Nov 4 12:11 PM | Glow ALLOWED and wanted on big words/keywords, warm colours only (supersedes row 6) | v5.5 | see MASTER_PROMPT | AGENT 'NEW IN v5.5' | STYLE_RULES S1 · zq_config glow · QC F2 relaxed (fails only blanket adjustment-layer glow) |
| 51 | Sujon Nov 4 | Still no purple/violet/blue/cyan/magenta glow or colour, even when a reference uses it (5 of 12 refs do) | v5.5 | see MASTER_PROMPT | AGENT 'NEW IN v5.5' | STYLE_RULES S2/S3 · QC F4/F5; fx_extrude_text.py + fx_phone_frame.py refuse banned hues |
| 52 | Sujon Nov 4 | Heavy bold display fonts like the refs; up to 3 families, one accent colour family (supersedes row 5) | v5.5 | see MASTER_PROMPT | AGENT 'NEW IN v5.5' | STYLE_RULES S4 · zq_config display_fonts · fonts/ArchivoBlack-400.woff2; fx_extrude_text.py |
| 53 | Sujon Nov 4 | Human-made imperfection: jitter, rotated words, varied sizes, grain, dust, torn edges, jittered sound | v5.5 | see MASTER_PROMPT | AGENT 'NEW IN v5.5' | STYLE_RULES S6 · zq_config human_made · fx_extrude_text --jitter; fx_torn_reveal --seed; audio jitter in SOUND_DESIGN |
| 54 | Sujon Nov 4 | One joint frame-by-frame breakdown of 12 references, PDF <= 8 pages | v5.5 | see MASTER_PROMPT | AGENT 'NEW IN v5.5' | breakdowns/nov4_12refs/BREAKDOWN_ALL12.pdf (5 pages) · raw numbers next to it |
| 55 | Sujon Nov 4 | Before/after refs: use ONLY the edited/after part (refs 5, 6) | v5.5 | see MASTER_PROMPT | AGENT 'NEW IN v5.5' | recipe 13 · breakdown crops · get_references.py --edit-only; fx_phone_frame.py (no raw panel) |
| 56 | Sujon Nov 4 | Merged 'human-made, not AI' section; effects ranked by frequency with recipes | v5.5 | see MASTER_PROMPT | AGENT 'NEW IN v5.5' | BREAKDOWN_ALL12.pdf · recipes 11-18 |
| 57 | Sujon Nov 4 | Honest claims: every number tagged measured vs eyeballed; tool named only where visible; no 'undetectable as AI' | v5.5 | see MASTER_PROMPT | AGENT 'NEW IN v5.5' | STYLE_RULES S9 · breakdowns README · MASTER_PROMPT step 8 |
| 58 | Sujon Nov 4 | SFX gap measured on 12 refs vs our reel (cannot listen; numbers only) | v5.5 | see MASTER_PROMPT | AGENT 'NEW IN v5.5' | SOUND_DESIGN_v5.5.md · audio_gap.py |
| 59 | Sujon Nov 4 | Sound design update: density 0.5-1.5/s, sfx bus +18 dB, sub-bass + air, limiter -1 dBTP, jitter (supersedes row 11) | v5.5 | see MASTER_PROMPT | AGENT 'NEW IN v5.5' | SOUND_DESIGN_v5.5.md · zq_config sound_design · master_mix.sh --tp; QC F15; audio_gap.py |
| 60 | Sujon Nov 4 | Recipe 11 word behind the head included | v5.5 | see MASTER_PROMPT | AGENT 'NEW IN v5.5' | recipes/11_word_behind_head.md · tools/word_behind_head/ |
| 61 | Sujon Nov 4 | New recipes: text-as-UI cursor click (12), edit-only phone frame (13), torn paper (14), photo-card stack (15), extruded warm text (16), sunburst/whip/B&W flash/punch-in (17), extras (18) | v5.5 | see MASTER_PROMPT | AGENT 'NEW IN v5.5' | recipes/12..18 · fx_extrude_text · fx_torn_reveal · fx_phone_frame · fx_cut_fx |
| 62 | Sujon Nov 4 | Pin colour bug: purple/blue-bokeh light-leak pin 603200943843150335 TAKE -> SKIP; pin videos colour-measured, 21 pins flipped to SKIP | v5.5 | see MASTER_PROMPT | AGENT 'NEW IN v5.5' | pins/INDEX.md · colour_recheck_v55 in the pin JSON · REFERENCE_LINKS.* updated |
| 63 | Sujon Nov 4 | 12 reference links + downloader; no third-party media in zip or repo | v5.5 | see MASTER_PROMPT | AGENT 'NEW IN v5.5' | REFERENCE_LINKS.csv/.html/.txt (kind instagram_reference_reel) · tools/get_references.py |
| 64 | Sujon Nov 4 | One-page master prompt + checklist | v5.5 | see MASTER_PROMPT | AGENT 'NEW IN v5.5' | MASTER_PROMPT.txt · CHECKLIST.md · PDF page 3 · - |
| 65 | Nov 4 | No machine paths in legacy_v4 (and prompts / pinterest_refs.mjs) | v5.5 | see MASTER_PROMPT | AGENT 'NEW IN v5.5' | CHANGE_ME placeholders · grep shows none |
| 66 | Nov 4 | Tests: clean unzip, every tool --help, requirements install check | v5.5 | see MASTER_PROMPT | AGENT 'NEW IN v5.5' | TEST_REPORT_v5.5.md · - |

Rules listed: 66 (49 from v5.3 + 17 added in v5.5) · rules with no home: 0. Rows 5, 6 and 11 are superseded and kept for history. P1-P10 in rows 1-49 = page numbers of the v5.2 PDF layout; rows 50+ point to files and to the v5.5 PDF pages (1 cheat sheet, 2 style rules, 3 master prompt + checklist, 4 sound design, 5-6 recipes, 7 the 12 refs, 8 pin fixes).