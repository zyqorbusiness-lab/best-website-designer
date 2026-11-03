# Ref 6 — Gaming "Editing Timeline" reveal

**Link:** https://www.instagram.com/reel/DfRIa9ziZIy/
**Creator:** Deep (@dplayz_official16)
**Contact sheet:** `contact_sheet.jpg` (1 frame per 1 s, time in yellow)
**Copyright:** the reel belongs to its creator. This folder holds only the link, our analysis, measured numbers and a small low-res contact sheet for study. No video or audio from the reel is included.

**Reel:** "New recent Intro Edit .!!! Dm for paid edit" (#timelinereveal #primerproedit) · 35.2 s · 1080×1920 · 60 fps · editor portfolio reel, Premiere Pro.
**Template in our kit:** `timeline_reveal_showcase` (new in v4) → built from `templates/before_after_v4/` (same "proof" idea as ref 4, 3 panels instead of 2)

## Measured numbers
- No hard cuts in the layout (all cuts are inside the middle card); motion mean 8.2
- 96 sound hits in 35 s (~2.7 per second); −14.1 LUFS, −0.65 dBTP
- Palette: #1C1C1C #D1D5BB #09231E #66715B #532D35 — dark, saturated; banner green ≈#1F6B3A, title yellow ≈#FFD400 + cyan ≈#3FD4FF, caption lime/yellow with black stroke, timeline purple/green/blue clips

## Layout (all 35 s, never changes)
- **Background:** blurred anime classroom (orange desks, cream wall) under everything.
- **Top banner (y ≈ 0–9 %):** green chalkboard strip, chunky game font **EDITING** (yellow) / **TIMELINE** (cyan), black outline.
- **Middle card (y ≈ 10–45 %):** the edited talking-head clip, rounded corners, full width.
- **Strip (y ≈ 46 %):** "DM FOR PAID EDIT" white bold on a dark strip with small chibi avatar faces repeated.
- **Bottom card (y ≈ 50–80 %):** the real Premiere Pro timeline (purple/green/blue clips, playhead moving) screen-recorded **in sync** with the edit — the proof that he made it.

## Shot by shot (middle card)
- **0 s HOOK** — face close + giant motion-blurred yellow/pink 3D word sweeping across ("**…EY**"), hit sfx.
- **1 s** — white flash/zoom blur with "**AWESOME**"-style word ghosted over the frame.
- **2 s** — confetti burst (multi-colour) + word-by-word caption "AASA KARTA HU" (lime, black stroke).
- **3–4 s** — gaming chair, cyan LED room; captions "BAHOT", "BADHIYA HOGE" one word per beat.
- **5 s** — orange/yellow 3D word **GAMEPLAY** slides across behind him.
- **6 s** — caption "BAHOT HI".
- **7 s** — big purple bubble word "**CRAZYYY**" with outline, shakes.
- **8–9 s** — punch-ins, captions per word.
- **10 s** — cutaway: Japanese flag background behind him (green-screen style key).
- **11 s** — cutaway: anime classroom, he sits at a desk.
- **12–14 s** — back in the room, small zooms on stressed words.
- **15–17 s** — paper prop: a sheet zooms toward camera, "SO", "ME YAHA" captions; screen-lit dark look at 17 s.
- **18–20 s** — anime street cutaway (cherry-blossom road, school gate) — he stands in it.
- **21–23 s** — room again; captions "WALE", "SCHOOL".
- **24 s** — black-and-white beat (B&W + contrast).
- **25–33 s** — captions per word ("AAJ", "CHIJ", "HE AND"), small punch-ins and whips every ~1 s.
- **34–35 s** — hand gesture to camera, end.

## Look
- **Captions:** 1–2 words at a time, bottom-centre of the middle card, heavy rounded sans, lime or yellow fill, 6–8 px black stroke, pop scale 0.7→1.0 in 3 frames.
- **Big words:** 3D/bevelled bubble letters with motion blur, sweeping across the frame (0.3–0.5 s each).
- **Cutaways:** keyed onto anime/flag backgrounds for 1–3 s.
- **Rhythm:** something changes every 0.5–1 s; each change has a whoosh, pop or hit; the timeline at the bottom moves the whole time.

## Recreate it with the kit (which tool does what)
1. **[You / any NLE]** Edit your clip (or run `run_ref3.sh` on it) and screen-record your editor's timeline while it plays → `timeline.mp4` (same length, 1080 wide).
2. **[Code — ffmpeg]** Background: one still (your own art or a licensed image), `boxblur=20` + darken 20 %.
3. **[Code — PIL]** Banner "EDITING / TIMELINE": chunky font (e.g. Lilita One / Luckiest Guy, OFL) yellow + cyan, black 8 px stroke, on a green chalkboard strip; the "DM FOR PAID EDIT" strip with your avatar repeated.
4. **[Code — Python + faster-whisper]** Word timings → captions 1–2 words at a time, lime #B6FF3B / yellow #FFE600 fill + black stroke (`build_ref3.py` caption builder; change the colours).
5. **[Blender]** Big 3D bubble words: `blender -b --factory-startup -P blender/text3d.py -- --text "CRAZYYY" --style plastic --side "#9b5cff" --anim slam --seconds 1.5 --out renders/w_crazy/` (transparent frames), plus confetti (a particle burst in the same scene, or a licensed confetti overlay).
6. **[EffectCraft]** Stack the 3 panels (start from `build_ref4.py`: replace its 2 cards with banner / middle card / timeline card), sync the timeline to the edit, add Motion Blur on the 3D word sweeps, Zoom Blur on whips, B&W on one beat, the colour key for cutaways.
7. **[Code — sfx_mix.py + master_mix.sh]** Whoosh on every big word, pop on captions, confetti pop, bass hit on the hook; master −14 LUFS / −1 dBTP.

**Status today (honest):** no one-command script for ref 6 yet — the parts exist (captions from ref 3, card layout from ref 4, 3D words from Blender), the 3-panel comp has to be written from `build_ref4.py`. `analyze_ref.py` now maps this style to `timeline_reveal_showcase` (6/6 references map correctly).
