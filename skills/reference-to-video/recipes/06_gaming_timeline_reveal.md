# Recipe 6 — Gaming "Editing Timeline" reveal

Reference: https://www.instagram.com/reel/DfRIa9ziZIy/ (Deep (@dplayz_official16)) · full breakdown: `references/ref6_gaming_timeline_reveal_DfRIa9ziZIy/README.md`
AI-agent prompt: PROMPT 24 in `PROMPTS_v4.md`.

## Recreate it with the kit (which tool does what)
1. **[You / any NLE]** Edit your clip (or run `run_ref3.sh` on it) and screen-record your editor's timeline while it plays → `timeline.mp4` (same length, 1080 wide).
2. **[Code — ffmpeg]** Background: one still (your own art or a licensed image), `boxblur=20` + darken 20 %.
3. **[Code — PIL]** Banner "EDITING / TIMELINE": chunky font (e.g. Lilita One / Luckiest Guy, OFL) yellow + cyan, black 8 px stroke, on a green chalkboard strip; the "DM FOR PAID EDIT" strip with your avatar repeated.
4. **[Code — Python + faster-whisper]** Word timings → captions 1–2 words at a time, lime #B6FF3B / yellow #FFE600 fill + black stroke (`build_ref3.py` caption builder; change the colours).
5. **[Blender]** Big 3D bubble words: `blender -b --factory-startup -P blender/text3d.py -- --text "CRAZYYY" --style plastic --side "#9b5cff" --anim slam --seconds 1.5 --out renders/w_crazy/` (transparent frames), plus confetti (a particle burst in the same scene, or a licensed confetti overlay).
6. **[EffectCraft]** Stack the 3 panels (start from `build_ref4.py`: replace its 2 cards with banner / middle card / timeline card), sync the timeline to the edit, add Motion Blur on the 3D word sweeps, Zoom Blur on whips, B&W on one beat, the colour key for cutaways.
7. **[Code — sfx_mix.py + master_mix.sh]** Whoosh on every big word, pop on captions, confetti pop, bass hit on the hook; master −14 LUFS / −1 dBTP.

**Status today (honest):** no one-command script for ref 6 yet — the parts exist (captions from ref 3, card layout from ref 4, 3D words from Blender), the 3-panel comp has to be written from `build_ref4.py`. `analyze_ref.py` now maps this style to `timeline_reveal_showcase` (6/6 references map correctly).
