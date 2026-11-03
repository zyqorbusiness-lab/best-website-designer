---
name: video-editing-reels
description: How to edit Instagram reels and short promos at the level of top motion editors — the reference-first workflow, beat plans for the three formats Sujon studies (soft-3D explainer, 3D SaaS promo, framed talking head), pacing, transitions, captions, CTA, and a QA pass that compares every render side by side with its reference.
when_to_use: "edit a reel", "make a promo video", "why does my edit look cheap", "copy this reel's style", "SaaS promo", "talking head edit", planning any short vertical video
license: MIT (text)
version: 1.1.0
---

# Editing reels that don't look like templates

The lesson from Nov 3 2026: Sujon rejected an edit that was technically complete because it **looked cheaper than his references**. Every rule here exists to close that gap.

## 1. Workflow (every video)
1. **Topic + format** in one line ("16 s SaaS promo, music only, concept product").
2. **References**: his reels (download, frame sheets) + 3–5 Pinterest references for the topic ([pinterest-reference-research](../pinterest-reference-research/)). Pick the closest in format, not the prettiest.
3. **Measure, don't describe**: cut times (`ffmpeg -vf "select='gt(scene,0.12)',showinfo"`), zoom/tilt numbers, shot lengths, loudness, sfx per second.
4. **Beat plan with timestamps** before any render: every 0.4–1.0 s something changes (camera move, type slam, UI action, caption, sfx).
5. **Build**: real 3D in Blender ([motion-graphics-blender](../motion-graphics-blender/)) → compositing/effects in EffectCraft ([effectcraft-compositing](../effectcraft-compositing/)) → sound ([sound-design](../sound-design/)).
6. **QA** (§6) and fix before anyone sees it.

## 2. The three formats (from Sujon's references)
**A. 3D SaaS / software promo** (ref: @raieum.edit plugin promo, 36 s, 60 fps)
- Odd visual hook in 0–1 s, then big glossy 3D type, then the product **never flat**: a rounded screen floating in 3D (10–25° tilt, big soft shadow) on a pastel gradient.
- The camera glides and **zooms into the exact UI area the cursor clicks** (160–250 %), then pulls back; only ~7 real cuts in 36 s — pace comes from camera moves every 1–1.5 s.
- Glossy blue extruded feature list ("1. SHAKE 2. HIT 3. FLASH 4. CRT") slamming in one by one. Whoosh on every move, pop on every bubble, click on every click.
**B. Soft-3D faceless explainer** (ref: @d2epak_, 38.7 s)
- One continuous off-white world, no hard cuts; floating rounded objects with depth of field; numbered chapter pills; big green count-up numbers; captions are the spine (charcoal heavy sans, keywords blue, emotional words coral italic serif, blur-in per word); a new beat every ~0.5 s with a pop/whoosh; CTA = a comment box typing the keyword.
**C. Framed talking head** (ref: @sanidhyadecodes, 11 s)
- Face full-screen + icon pop with glow + hit at 0.0 s; from 1 s the video sits in a rounded white-bordered card over a blurred copy of itself; a permanent "Comment X" line under the card; an effect every 0.5–0.8 s (scribble circles, stickers, colour flashes, RGB-split cuts, stacked kinetic words); face punch-ins 110→125 % on stressed words; ~20 sfx in 11 s.

## 3. Pacing and camera (measured on Pinterest, 30 fps)
- Motion in the first 0.3 s; one camera move per shot (24–45 frames), then a 15–30 frame near-still **hold** — the hold is what reads as premium.
- Shots 1.2–2.0 s for 3D product work; montage bursts 0.43–0.6 s; slam type 2–3 frames per word.
- Transitions are punctuation: 6–11 per 30 s (zoom-through 24–30 f, whip 2–4 blurred frames each side, flash 2–4 f, light leak 15–20 f, shape wipe 12–20 f); everything else is a cut or continuous camera.
- Eases: ease-out cubic for arrivals, ease-in-out cubic for long moves, back-out (≈10 % overshoot) for pops, ease-in for the last frames before a whip.

## 4. Type, captions, colour
- Big 3D type for beats (2–4 words), small clean labels for facts. Captions 1–3 words at a time, centre/chest height, two colours + one italic-serif accent word.
- Max 3 hues per frame: background tone + brand hue + white. Lift blacks.
- Keep everything inside the 90 % title-safe area and out of the bottom ~320 px (Instagram UI).

## 5. Honesty (non-negotiable)
Concept products say "concept" on screen. No fake users, revenue, reviews or results. Numbers on screen are true or the speaker's own words.

## 6. QA (every render)
1. Contact sheet of the whole video at 2 fps; look at it as a viewer (cut-off text, washed-out frames, anything static > 1 s, unreadable captions).
2. **Comparison sheet**: our frames next to the reference's frames at the same beats. Write down exactly where ours is still cheaper (material, lighting, motion, density, type) — that list is the next iteration.
3. Audio: −14 LUFS ±0.5, true peak ≤ −1 dBTP, no unintended silences.
4. File: 1080×1920, 30 fps, H.264 + AAC; under 15 MB for WhatsApp previews.

## v4 (Nov 3 2026) — 6 references, the tool table, editing raw footage
- Sujon's 6 reference reels are broken down shot by shot (times, camera, transitions, effects, fonts, hexes, sfx placement, pacing) in [`docs/motion-references/`](../../docs/motion-references/README.md); each has a recipe in [reference-to-video/recipes](../reference-to-video/recipes/).
- Formats now covered: **D. Original vs Edited showcase** (ref 4 @crafoo9: red radial bg, two white cards, pixel-font labels, raw first then the edit with sticker pops, "DM to / Edited by / Hire me" end card) · **E. After Effects SaaS card promo** (ref 5: glossy 3D cards as 3D layers, tilted card grid drifting diagonally, light streaks on black, selection box on a headline word, rays + 3D toggle finale) · **F. Gaming "Editing Timeline" reveal** (ref 6: 3 stacked panels — banner, edited clip, the real NLE timeline in sync as proof; 1–2-word captions with lime/yellow fill + black stroke; 3D bubble words with motion blur).
- Every step is marked with its tool: real 3D → Blender, data/timing/sound/export → code, AE-style effects + final composite → EffectCraft. The master table is in [reference-to-video](../reference-to-video/SKILL.md#which-tool-for-which-job-master-table).
- Editing your own raw footage, step by step: [reference-to-video → Edit your own raw footage](../reference-to-video/SKILL.md#edit-your-own-raw-footage-talking-head-any-clip).
- Any new reference: `kit/analyze_ref.py ref.mp4 out/` → `style.json` (template pick) → `kit/make_video.py "topic" --ref <link>` → plan. LOOK at the strip: numbers miss style.
- Ready prompts for an AI agent (Claude Code etc.): [`recipes/PROMPTS_v4.md`](../reference-to-video/recipes/PROMPTS_v4.md).

## Which tool for which job (master table)

Rule: real 3D → **Blender**. Anything from data, timing, sound or export → **code**. After-Effects-style effects and the final composite → **EffectCraft**.

| Task | Best tool | Why | Command / template |
|---|---|---|---|
| Glossy extruded 3D text | Blender | real bevel, reflections, light | `blender/text3d.py` |
| Device/screen tilted in 3D | Blender | real thickness, shadow, camera | `blender/screen3d.py, hero_v4.py` |
| Camera zoom to a UI click | Blender | camera aims at the exact pixel | `screen_timeline.json + hero_v4.py` |
| 3D icons, coins, mascot tile | Blender | transparent loops to reuse | `sprites_v4.py` |
| Soft-3D floating world, DOF | Blender | soft light, real depth blur | `blender/softworld.py` |
| Materials + lighting | Blender | physically based | `blender/mk3d.py` |
| Cut pauses / jump cuts | Code (Python + ffmpeg) | exact, from word timings | `cut_pauses.py` |
| Clean voice | Code (ffmpeg) | same chain every time | `clean_voice.sh` |
| Word timings + captions | Code (faster-whisper + PIL) | data-driven, no typing | `transcribe_words.py, build_ref3.py` |
| Count-ups, pills, comment box | Code (PIL) | text and numbers from data | `build_ref1.py` |
| Site/app screen capture | Code (headless Chrome) | pixel-exact UI states | `capture_dark.js` |
| SFX placement + music duck | Code | event list, repeatable | `sfx_mix.py, master_mix.sh` |
| Loudness master −14 LUFS | Code (ffmpeg) | measured, not by ear | `master_mix.sh` |
| Batch, export, WhatsApp copy | Code (ffmpeg) | one command | `build_all_v4.sh` |
| Measure a reference | Code | numbers + template pick | `analyze_ref.py, make_video.py` |
| Glow, light sweep, light leak | EffectCraft | After-Effects-style effects | `comp_v4.jsx` |
| RGB split, glitch, flash, B&W | EffectCraft | per-frame effects on hits | `build_ref3.py → comp_ref3.jsx` |
| Whip/zoom blur, light streaks | EffectCraft | transitions with motion blur | `comp_v4.jsx, comp_ref5.jsx` |
| Framed card, panels, masks | EffectCraft | layers, mattes, shadows | `build_ref3.py, build_ref4.py` |
| 3D layers + camera (2.5D) | EffectCraft | fast, no re-render of 3D | `comp_ref1.jsx, comp_ref5.jsx` |
| Final composite | EffectCraft | Blender + 2D + video in one comp | `every template` |
