# Recipe 3 — Talking head in a framed card, effect every 0.5 s

Reference: https://www.instagram.com/reel/DfNHu7UzIc2/ (Sanidhya | Tech Mentor | Editor (@sanidhyadecodes)) · full breakdown: `references/ref3_talking_head_sfx_DfNHu7UzIc2/README.md`
AI-agent prompt: PROMPT 19 in `PROMPTS_v4.md`.

## Recreate it with the kit (code = cuts, timing, captions · Blender = 3D hook icon · EffectCraft = frame, effects)
1. **[You]** Record yourself 10–40 s, vertical, face roughly centred.
2. **[Code + Blender + EffectCraft, one script]** Run **one command**: `templates/talking_head_v4/run_ref3.sh my_clip.mp4 out.mp4 --keyword SITE --hook "3 THINGS"`
   It does, in order: normalise to 1080×1920/30 → `clean_voice.sh` (de-noise, EQ, compress) → `transcribe_words.py` (faster-whisper word timings) → `cut_pauses.py` (removes pauses > 0.4 s, punch-in + RGB/flash on every cut) → Blender 3D hook icon (`sprites_v4.py --sprite tile --glyph 3`) → `build_ref3.py` (plans every effect from the transcript: framed card, blurred blue copy, permanent "Comment SITE" line, stickers, flashes, scribble ring, B&W + grain word, stacked kinetic words, captions) → EffectCraft render → `sfx_mix.py` + music ducked under the voice → `master_mix.sh` (−14 LUFS) → mux → contact sheet + audio check.
3. **[Code]** Options: `--face X,Y` (where your face is, for punch-ins), `--icon 3` (glyph on the 3D icon), `--music music/better_times_173.mp3`.
4. **[You — QA]** Check `*_contact.jpg` — every 0.5 s should look different.

**Status today (honest):** the pipeline ran on the practice clip (`clip.mp4`) through the cut, the word timings and the EffectCraft comp; the final full-length render was not kept. Runs in ~15–25 min for a 20 s clip on CPU.
