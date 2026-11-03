# Recipe 5 — After Effects SaaS card promo

Reference: https://www.instagram.com/reel/DfRNLU3N22c/ (Jekay Valiente (@jekyiesz) — a recreation of a tutorial by @madebyveduboi) · full breakdown: `references/ref5_ae_saas_cards_DfRNLU3N22c/README.md`
AI-agent prompt: PROMPT 21 in `PROMPTS_v4.md`.

## Recreate it with the kit (Blender = 3D icons · code = cards, type · EffectCraft = 3D layers + camera, streaks, rays)
1. **[Code]** Edit the `SERVICES` list in `templates/saas_cards_v4/build_ref5.py` (title, subtitle, tint, icon) — use your real services; no fake numbers.
2. **[Blender]** Blender icons (transparent loops): `blender -b --factory-startup -t 8 -P templates/explainer_soft3d_v4/sprites_v4.py -- --sprite tile --color "#7c5cff" --glyph "</>" --size 500x500 --frames 60 --out renders/sp_tile_code/` (same for `tile_play`, `tile_globe`, `tile_check`, `coin`, `star`, your logo letter `tile_z`).
3. **[Code — PIL]** `python3 build_ref5.py` → glossy cards, headlines, selection box, toggle, rays + `comp_ref5.jsx` + `sfx_ref5.json`.
4. **[EffectCraft]** EffectCraft: `effectcraft-cli script comp_ref5.jsx` → `render --project ref5.ecproj --comp Ref5 --out silent.mp4 --format h264 --bitrate 24000`. The comp uses `threeDLayer = true` cards on a tilted grid + a camera drift, light-streak transitions, radial rays.
5. **[Code — sfx_mix.py + master_mix.sh]** Sound + master: `sfx_mix.py sfx_ref5.json` → `master_mix.sh … --music music/digital_clouds_175.mp3 --music-db -8`.
6. **[Code — one script]** All in one: `./build_all_v4.sh ref5`.

**Status today (honest):** card + camera comp tested in EffectCraft with real 3D layers; the full render was not made. The tutorial it copies (by @madebyveduboi) is listed in this folder's RESEARCH.md if it was found.
