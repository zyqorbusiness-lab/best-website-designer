# Which tool for which job (master table)

Rule: real 3D → **Blender**. Anything from data, timing, sound or export → **code**. After-Effects-style effects and the final composite → **EffectCraft**.

| Task | Best tool | Why | Command / template |
|---|---|---|---|
| Glossy extruded TEXT (v5.5) | Code (Pillow, 2.5D extrusion + warm glow) | text is never Blender; refuses banned hues | `tools/fx_extrude_text.py`, recipe 16 (legacy Blender: `blender/text3d.py`, only for a real 3D object) |
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

| Torn-paper reveal | Code (numpy + ffmpeg) | seeded rough tear, no stock | `tools/fx_torn_reveal.py` (recipe 14) |
| Edit-only phone panel | Code (ffmpeg + Pillow) | edit side only, warm gradient | `tools/fx_phone_frame.py`, `get_references.py --edit-only` (recipe 13) |
| Flash / B&W / punch-in / whip / warm leak | Code (ffmpeg) | exact frames, jitter seed | `tools/fx_cut_fx.py` (recipe 17) |
| Measure the sound design | Code (numpy + ffmpeg) | numbers, because nobody can listen | `tools/audio_gap.py`, QC F15 |
| Download the reference reels | Code (yt-dlp) | links only live in the kit | `tools/get_references.py` |
