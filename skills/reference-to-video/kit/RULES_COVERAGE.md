# RULES_COVERAGE — Zyqor Motion Kit v5.3

Every rule and feature from v5, v5.1 and Sujon's Nov 3, 2026 requests, and where it lives in the lean kit.
P = page of Zyqor_Motion_Kit_v5.3.pdf · Prompt = step in MASTER_PROMPT.txt · AGENT = step in AGENT_START_HERE.md · Tool/check = file or QC code.

| # | From | Rule / feature | PDF | Prompt | AGENT | Tool / check |
|---|---|---|---|---|---|---|
| 1 | v5 | Text & effects made EffectCraft-style, not Blender | P1 step 5 · P6 | Prompt 4 | AGENT Step 4 | ec_reel.py + zq_lib.jsx; QC F6 |
| 2 | v5 | Blender only for a real 3D object (as a plate), never text | P1 NEVER · P6 | Prompt 4 | AGENT Step 4 | QC F6 |
| 3 | v5 | Premium kinetic typography (word pop on voice, per-letter title cascade, mixed weights, motion blur, soft settle) | P6 | Prompt 4 | AGENT Step 4 | zq_lib.jsx captionLine/title |
| 4 | v5 | ref8 caption style: 1–3 words, big, ONE gradient keyword + italic serif accent, one highlight style | P1 · P6 · P8 | Prompt 4 | AGENT Step 4 | QC F3/F4 |
| 5 | v5 | Two font families only (Inter + Instrument Serif Italic); 1–4 words a line, line < 0.78 width, ≥ 90 px | P6 | Prompt 4 | AGENT Step 4 | QC F10 (≥40 px hard), warn > 4 words |
| 6 | v5 | Glow OFF; max one subtle glow on one object per scene; never on captions/cards/bg | P1 · P6 | Prompt 4 | AGENT Step 4 | QC F2 |
| 7 | v5 + Nov 3 9:06 PM | No purple / violet / purple-blue neon / blue neon / cyan glow / AI palettes — anywhere | P1 · P5 | Prompt 5 | AGENT Step 5 | zq_config banned 175–320°; QC F4/F5; ref_breakdown flags per second |
| 8 | v5 | 8 curated gradient presets for keywords | P5 | Prompt 4 | AGENT Step 4 | zq_config.json gradients; QC F4 |
| 9 | v5 | Premium textured backgrounds (paper, studio, plate), always moving 4–5 %, never flat black | P1 · P6 | Prompt 4 | AGENT Step 4 | zq_lib.jsx bg |
| 10 | v5 | Warm restrained grade + grain + vignette | P6 | Prompt 4 | AGENT Step 4 | zq_lib.jsx grade |
| 11 | v5 | Premium sfx: pop/card, click/tap, whoosh early + low hit/transition, riser to payoff, 1–3/s, voice on top, music ducked | P6 | Prompt 4 | AGENT Step 4 | sfx_mix.py; QC warn > 4/s |
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

Rules listed: 49 · rules with no home: 0. (P1-P10 = page numbers of the v5.2 PDF layout; the v5.3 PDF keeps that order and appends the restored content, see its contents page.)
