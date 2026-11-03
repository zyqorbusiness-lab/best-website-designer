# Ref 1 — Faceless soft-3D explainer

**Link:** https://www.instagram.com/reel/DfJvupgpmeq/
**Creator:** Deepak Kumar (@d2epak_)
**Contact sheet:** `contact_sheet.jpg` (1 frame per 1 s, time in yellow)
**Copyright:** the reel belongs to its creator. This folder holds only the link, our analysis, measured numbers and a small low-res contact sheet for study. No video or audio from the reel is included.

**Reel:** "This small Google review tag can make you ₹3000 daily" · 38.7 s · 1080×1920 · 30 fps · Hindi voice, Hinglish captions · 3,835 likes when saved (Nov 3 2026).
**Template in our kit:** `soft3d_explainer` → `templates/explainer_soft3d_v4/`

## Measured numbers (analyze_ref.py → style.json)
- Hard cuts: **0** (one continuous world; every "cut" is a camera move or an object swap)
- Motion mean 5.4 (calm but never still; 1.3 % still frames)
- Sound: −14.4 LUFS, −0.3 dBTP, 89 sound hits in 38.7 s (~2.3 per second)
- Palette: #ECECEB #EFE5E0 #F3ECE4 #B3AAA5 #F4F1EF (off-white world) + accents blue #2F6FD6, coral #F0643C, money green #22C55E

## Shot by shot (times from the 1-fps contact sheet)
- **0.0–1.0 s HOOK** — 3D NFC review tag (white card, blue top) floats big in the top half, mascot tile (cartoon boy with glasses on a white rounded app-icon) sits centre. Caption "Ye chhota" starts on word 1. Pop sfx at 0.26 s.
- **1–3 s** — ripple ring expands behind the tag, small 3D coins/icons drift in from the edges (depth-blurred). Caption "Ye chhota sa **Google** review tag dekh rahe ho?" — blue keyword.
- **3–5 s** — blurred banknote bundles float up behind; coral italic word "_bechkar_". Whoosh on every new object.
- **5–7.5 s** — big glossy green count-up **₹42,000 → ₹84,000** above the mascot (glow, overshoot scale). Cash sfx on the land.
- **8–11 s "how it works"** — tag tilts, red "NFC" sticker pops, phone mockup slides in from the top right; mascot moves aside. Camera push-in.
- **11–15 s** — phone shows the Google review page; "Customer bas phone touch…", Google "G" tile pops; ripple + tap ring on the tag.
- **15–18 s chapter 1 "Cost"** — white pill with blue number square at top; tag returns, green **₹40** count-up + small "Total investment" pill.
- **18–21 s chapter 2 "Who buys"** — tiny icons (restaurant, salon, hotel, cafe) orbit the mascot one per word.
- **21–24 s chapter 3 "Selling price"** — **₹600–700** big green, red "16X profit" tag slams in.
- **24–27 s chapter 4 "Daily income"** — glass list card "Today's sales" with green ticks, cash stack, "₹3000/day" pill.
- **27–30 s** — "Offline + Online" pill; 3D food photo card on a tilted glass panel, "Easiest" ribbon.
- **30–34 s** — website globe tile + Instagram tile fly in; DOF blur swaps focus between them.
- **34–38.7 s CTA** — app icons scatter out, white comment box types **ROADMAP** (red caps) with keyboard ticks, blue "Follow" pill, then "Full roadmap in your DM" pill. Mascot stays centre to the end.

## Look
- **Camera:** slow push 1.00→1.08 per beat, gentle drift; depth-of-field — the active object sharp, everything else blurred.
- **Objects:** soft white plastic, rounded, long soft shadows; every object floats (sine bob ±8 px, ±5° rotation).
- **Entrances:** scale 0.6→1.0 with overshoot (easeOutBack) + motion blur; exits blur out.
- **Text:** captions bottom-centre (y ≈ 74 %), ≤2 lines, heavy geometric sans ~64 px #1D1D1F; key nouns blue #2F6FD6; emotional words coral italic serif (Instrument Serif Italic look); each word blur-to-sharp + 10 px rise in ~0.2 s.
- **Pace:** a new visual every 0.4–0.7 s, synced to words.
- **Sound:** voice on top, soft music bed always on, pops on entrances, whoosh on camera moves, cash "cha-ching" on money, keyboard ticks on the typed comment.

## Recreate it with the kit (Blender = 3D objects · code = captions/numbers · EffectCraft = layout, camera, blur)
1. **[Code]** **Write the story** — edit `CAPTIONS` and `BEATS` at the top of `templates/explainer_soft3d_v4/build_ref1.py` (`*word*` = blue, `_word_` = coral italic). Keep numbers true or clearly "steps 1-2-3".
2. **[You]** **Mascot** — put 3 expressions of YOUR character as `assets/avatar.png`, `avatar_wow.png`, `avatar_wink.png` (square PNG; a photo of your face or a drawn avatar).
3. **[Blender]** **Blender sprites (real 3D, transparent 2-s loops)** — one per object:
   `blender -b --factory-startup -t 8 -P sprites_v4.py -- --sprite phone_search --out renders/sp_phone_search/ --size 900x1500 --frames 60`
   Sprites available: `tile` (any glossy icon, `--color "#2f6bff" --glyph "3"`), `phone_search`, `phone_site` (`--media screen.mp4`), `avatar` (`--tex face.png`), `star`, `pin`, `coin`, `tile_call`, `tile_check`, `tile_globe`. ~4 s/frame on a CPU at 16 samples.
4. **[Code — PIL]** **Build 2D + comp** — `python3 build_ref1.py` writes captions, chapter pills, green count-ups, the typed "Comment SITE" box, glass card, blobs, ripples, plus `comp_ref1.jsx` and `sfx_ref1.json`.
5. **[EffectCraft]** **EffectCraft** — `effectcraft-cli script comp_ref1.jsx` then `effectcraft-cli render --project ref1.ecproj --comp Ref1 --out renders/silent.mp4 --format h264 --bitrate 24000`. In the comp: blob gradient world, sprites as 3D layers, Camera Lens Blur for DOF, Drop Shadow, camera push per beat.
6. **[Code — sfx_mix.py + master_mix.sh]** **Sound** — `python3 sfx_mix.py sfx_ref1.json sfx.wav 22.5` (pop.mp3 on entrances, whoosh2.mp3 on camera moves, cash.mp3 on numbers, typing.mp3 on the comment box), then `master_mix.sh mix.wav 22.5 --sfx sfx.wav --music music/digital_clouds_175.mp3 --music-db -9` (add `--voice vo.wav` when you record the VO from `vo_script_ref1.txt`).
7. **[Code — one script]** **All in one:** `./build_all_v4.sh ref1 [--voice my_vo.wav]` → `V4_ref1_soft3d_explainer.mp4`.

**Status today (honest):** builder + sprite script written and tested in parts; a full v4 render was not made (Sujon asked for docs, not videos). Expect ~40–60 min CPU for the sprites, ~15 min for the comp.
