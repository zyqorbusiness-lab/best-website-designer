# Ref 2 — SaaS promo: tilted 3D screen + glossy 3D type

**Link:** https://www.instagram.com/reel/DfPSHbysI7k/
**Creator:** Raieum | Editor (@raieum.edit)
**Contact sheet:** `contact_sheet.jpg` (1 frame per 1 s, time in yellow)
**Copyright:** the reel belongs to its creator. This folder holds only the link, our analysis, measured numbers and a small low-res contact sheet for study. No video or audio from the reel is included.

**Reel:** "Use this tool for better transitions. Want link? Comment 'plugin'" · 36.4 s · 1080×1920 · **60 fps** · promo for a Premiere Pro transitions plugin.
**Template in our kit:** `tilted_device_saas` → `templates/saas_blender_hero_v4/` (v3 version proven end to end: `templates/saas_blender_hero/`)

## Measured numbers
- Hard cuts: 4 (3.6, 23.3, 23.4, 32.7 s) — pace comes from the camera, not from cuts
- 96 sound hits in 36 s (~2.6 per second); −14.8 LUFS but true peak **+4.3 dBTP (clips — don't copy that; we limit to −1 dBTP)**
- Palette (measured): #F7DBC5 #E4B1A8 #444454 #FAECDC #E9D4C8 — warm peach world; by eye: royal-blue 3D type ≈#2453FF with cyan glow ≈#7CDCFF, dark UI with cyan buttons

## Shot by shot
- **0.0–1.0 s HOOK** — anime character close-up (calm, eyes closed), soft film grade on peach; glossy blue extruded **"2026"** builds in digit by digit at the bottom. Hit sfx at 0.1 s.
- **1–3.6 s** — "2026" complete with cyan glow; subtitle "2026 me bhi purane transition use kr rhe ho?"; three glossy 3D app icons pop in a row (Motion Array, a character icon, a play icon), one pop each (~0.3 s apart).
- **3.6 s CUT → 4–6 s chat story** — tall white rounded phone card on a pink/lilac/mint mesh gradient; iMessage-style bubbles pop in one by one with memoji avatars (notif pop on each).
- **6–7 s** — white flash/whip transition back to peach.
- **7–10 s product reveal** — dark plugin panel as a thick rounded 3D card, tilted ~25° and turning to face camera (rotateY 25°→0°), big soft shadow.
- **10–17 s feature list** — panel straight-on; glossy italic 3D words stack below it one per beat: **1. SHAKE / 2. HIT / 3. FLASH / 4. CRT** (each slams in with a whoosh+hit). Cursor clicks the panel; camera nudges in.
- **17–23 s Premiere demo** — real screen recording (Premiere timeline, menus) on the same tilted card; camera pushes into each menu the cursor opens (punch-in ~160–250 %), pulls back out. Click sfx on each click.
- **23.3 s CUT → 24–32 s** — plugin panel used inside Premiere: cursor picks presets, camera follows the cursor, cyan buttons glow on click.
- **32.7 s CUT → 33–36 s END** — single white profile card (avatar, handle, followers) centre; glossy blue 3D **COMMENT 'PLUGIN'** drops in under it.

## Look
- **Camera:** always moving — glide + rotate between 3 angles, then zoom to the exact UI point the cursor clicks, ease out (cubic), hold ~0.4 s, pull back.
- **3D type:** extruded + bevelled, candy-chrome blue, italic, cyan inner glow, seen almost straight-on (not from above).
- **Screen:** never flat — a thick slab with rounded corners, soft drop shadow, slight reflection.
- **Background:** warm peach gradient, never black; the chat section swaps to a pastel mesh.
- **Sound:** upbeat music bed + voice; whoosh on every camera move, pop on bubbles, click on cursor clicks, hit on each 3D word.

## Recreate it with the kit (Blender = whole 3D scene · code = UI capture + overlays · EffectCraft = world, glow, sweeps)
1. **[Code — headless Chrome]** **Capture the product screen** — `node templates/saas_blender_hero_v4/capture_dark.js` (headless Chrome via puppeteer captures each UI state of a real concept site at 2160×1350, dark theme forced with CSS variables) → the screen frames; the click points (UI pixel x,y + time) live in `screen_timeline.json`.
2. **[You / image]** **Hook image** — a striking key visual (your own photo, a generated character, or the product) as `assets/hook.png`.
3. **[Blender]** **Blender scene** — `blender -b --factory-startup -t 8 -P hero_v4.py -- --out renders/f --start 1 --end 255 --samples 12` (and 256–510 in a 2nd process). It builds: chrome 3D "2027", the device slab with `screen.mp4` as a movie texture, a camera that zooms to every click point, glossy feature words, the 3D chat-bubble end card. Test one frame first: `-- --still test.png --frame 150`. Cost: ~10 s/frame at 1080×1920 on CPU → 60 fps is not practical here; 30 fps full-res.
4. **[Code — PIL]** **Overlays** — `python3 make_overlays.py` (glowing italic subtitle, offer line, "concept" label).
5. **[EffectCraft]** **EffectCraft** — `effectcraft-cli script comp_v4.jsx` → `render --project hero_v4.ecproj --comp Hero --out renders/silent.mp4 --format h264 --bitrate 26000`. Comp adds gradient world, Glow (threshold 96), light sweeps, zoom-through, whip blur, RGB-split hits, flash, light leak.
6. **[Code — sfx_mix.py + master_mix.sh]** **Sound** — `audio_sfx_events_v4.json` → `sfx_mix.py`; music `uplifting_bass_726.mp3 --music-start 12.27` so the drop lands on the device fly-in; master `master_mix.sh … --duck-sfx`.
7. **[Code — one script]** **All in one:** `./build_all_v4.sh ref2 [--voice my_vo.wav]` (VO script: `vo_script_ref2.txt`).

**Status today (honest):** v3 of this recipe rendered end to end (16 s, 13.8 MB, −14.2 LUFS). v4 fixes (glowing hook, dark UI on peach, small italic feature words, single chat-bubble end card) are in `hero_v4.py`; test stills rendered, the full v4 render was stopped at 388/510 frames when Sujon said he wanted docs, not videos.
