# Recipe 2 — SaaS promo: tilted 3D screen + glossy 3D type

Reference: https://www.instagram.com/reel/DfPSHbysI7k/ (Raieum | Editor (@raieum.edit)) · full breakdown: `references/ref2_saas_plugin_promo_DfPSHbysI7k/README.md`
AI-agent prompt: PROMPT 18 in `PROMPTS_v4.md`.

## Recreate it with the kit (Blender = whole 3D scene · code = UI capture + overlays · EffectCraft = world, glow, sweeps)
1. **[Code — headless Chrome]** **Capture the product screen** — `node templates/saas_blender_hero_v4/capture_dark.js` (headless Chrome via puppeteer captures each UI state of a real concept site at 2160×1350, dark theme forced with CSS variables) → the screen frames; the click points (UI pixel x,y + time) live in `screen_timeline.json`.
2. **[You / image]** **Hook image** — a striking key visual (your own photo, a generated character, or the product) as `assets/hook.png`.
3. **[Blender]** **Blender scene** — `blender -b --factory-startup -t 8 -P hero_v4.py -- --out renders/f --start 1 --end 255 --samples 12` (and 256–510 in a 2nd process). It builds: chrome 3D "2027", the device slab with `screen.mp4` as a movie texture, a camera that zooms to every click point, glossy feature words, the 3D chat-bubble end card. Test one frame first: `-- --still test.png --frame 150`. Cost: ~10 s/frame at 1080×1920 on CPU → 60 fps is not practical here; 30 fps full-res.
4. **[Code — PIL]** **Overlays** — `python3 make_overlays.py` (glowing italic subtitle, offer line, "concept" label).
5. **[EffectCraft]** **EffectCraft** — `effectcraft-cli script comp_v4.jsx` → `render --project hero_v4.ecproj --comp Hero --out renders/silent.mp4 --format h264 --bitrate 26000`. Comp adds gradient world, Glow (threshold 96), light sweeps, zoom-through, whip blur, RGB-split hits, flash, light leak.
6. **[Code — sfx_mix.py + master_mix.sh]** **Sound** — `audio_sfx_events_v4.json` → `sfx_mix.py`; music `uplifting_bass_726.mp3 --music-start 12.27` so the drop lands on the device fly-in; master `master_mix.sh … --duck-sfx`.
7. **[Code — one script]** **All in one:** `./build_all_v4.sh ref2 [--voice my_vo.wav]` (VO script: `vo_script_ref2.txt`).

**Status today (honest):** v3 of this recipe rendered end to end (16 s, 13.8 MB, −14.2 LUFS). v4 fixes (glowing hook, dark UI on peach, small italic feature words, single chat-bubble end card) are in `hero_v4.py`; test stills rendered, the full v4 render was stopped at 388/510 frames when Sujon said he wanted docs, not videos.
