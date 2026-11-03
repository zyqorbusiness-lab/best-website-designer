# zyqor-kit — the code (v4)

Real 3D in **Blender** (Python, headless), data/timing/sound/export in **code** (Python + ffmpeg), effects and the final composite in **EffectCraft** (free After Effects alternative, headless JSX).

## Install (Windows / Mac)
- Blender 4.2 LTS — blender.org
- EffectCraft — getartcraft.com/apps/effectcraft (find `effectcraft-cli`; Windows: `%LOCALAPPDATA%\Programs\ArtCraft\EffectCraft\effectcraft-cli.exe`)
- FFmpeg, Python 3.11 (`pip install -r requirements.txt`), Node 20 (`npm i puppeteer-core` for the screen-capture scripts), yt-dlp
- `./get_audio.sh` — downloads the Mixkit sfx/music (licensed, not shipped)
- If they aren't on PATH: set `BLENDER`, `EFFECTCRAFT_CLI`, `PYTHON`, `CHROME_PATH` (capture scripts), `EMOJI_FONT` (Windows: `C:/Windows/Fonts/seguiemj.ttf`)
- The shell scripts are bash: on Windows run them in Git Bash or WSL, or ask your AI agent to run the same steps in PowerShell.

## Files
- `analyze_ref.py ref.mp4 outdir/` → `style.json` + `strip.jpg` (cuts, motion, palette, faces, cards, loudness, sound hits → template)
- `make_video.py "topic" [--ref link|file] [--template …] [--render]` → `projects_v4/<topic>/` plan + params
- `build_all_v4.sh ref1|ref2|ref5 [--voice vo.wav]` → render + comp + mix (output in `out/`)
- `templates/talking_head_v4/run_ref3.sh clip.mp4` (ref 3) · `templates/before_after_v4/run_ref4.sh raw.mp4 edited.mp4` (ref 4)
- `templates/explainer_soft3d_v4/` ref 1 (`sprites_v4.py` Blender sprites, `build_ref1.py`) · `templates/saas_blender_hero_v4/` ref 2 (`hero_v4.py`, `comp_v4.jsx`, `make_overlays.py`, `capture_dark.js`) · `templates/saas_cards_v4/` ref 5 (`build_ref5.py`) · `templates/saas_blender_hero/` the v3 hero (rendered end to end)
- `blender/` — `mk3d.py` (shared lib), `text3d.py`, `screen3d.py`, `screen_video.py`, `softworld.py`, `bgcomp.py`, fonts
- Sound: `clean_voice.sh`, `cut_pauses.py`, `transcribe_words.py`, `sfx_mix.py`, `master_mix.sh`
- Pinterest references: send the topic or a Pinterest link to Tab on WhatsApp — Tab returns the pins sheet + `STYLE.md`. Then `make_video.py --ref <pin link>`. The Pinterest search script is optional/advanced and stays on Tab's box (it needs Tab's browser + your saved Pinterest login), so it is not in this kit.
- The full v3 technical guide (EffectCraft gotchas, render times, recipes) is Part C of the Zyqor_Motion_Kit_v4.pdf (in the zip).

## Status (honest, Nov 3 2026)
- End to end and proven: the v3 SaaS hero (`templates/saas_blender_hero/`).
- Built and tested in parts, no full v4 render kept (you asked for docs, not videos): ref 1 builder + sprites, ref 2 `hero_v4.py` (test stills; full render stopped at 388/510 frames), ref 3 pipeline (ran through the EffectCraft comp on `clip.mp4`), ref 4 (card videos rendered in a test), ref 5 (comp tested in EffectCraft). Ref 6 has a recipe, no script yet.
- Timing on a CPU (no GPU): Blender Cycles ~4 s/frame at 810×1440, ~10 s/frame at 1080×1920. A GPU PC is much faster.

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
