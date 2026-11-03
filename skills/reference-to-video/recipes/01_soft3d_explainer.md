# Recipe 1 — Faceless soft-3D explainer

Reference: https://www.instagram.com/reel/DfJvupgpmeq/ (Deepak Kumar (@d2epak_)) · full breakdown: `references/ref1_soft3d_explainer_DfJvupgpmeq/README.md`
AI-agent prompt: PROMPT 17 in `PROMPTS_v4.md`.

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
