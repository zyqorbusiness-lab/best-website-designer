# Recipe 4 — "Original vs Edited" editor showcase

Reference: https://www.instagram.com/reel/DfRKIG-B6FV/ (Crafoo (@crafoo9)) · full breakdown: `references/ref4_original_vs_edited_DfRKIG-B6FV/README.md`
AI-agent prompt: PROMPT 20 in `PROMPTS_v4.md`.

## Recreate it with the kit (code = layout + audio plan · EffectCraft = cards, pops, end card)
1. **[You]** Pick a raw clip (untouched) and your edit of the same clip — e.g. the output of `run_ref3.sh` on that clip.
2. **[Code + EffectCraft, one script]** Run: `templates/before_after_v4/run_ref4.sh raw.mp4 edited.mp4 out.mp4 --raw-len 8 --name ZYQOR --handle @zyqor.studio`
   - `build_ref4.py` measures nothing — it uses the ref's layout: red radial bg, two cards (858×640 because our clips are vertical), pixel labels, watermark, sticker pops on the edited card, end card "DM to / Edited by ZYQOR / Hire me"; writes `comp_ref4.jsx`, `sfx_ref4.json`, `audio_plan.json`.
   - EffectCraft renders the comp; audio = raw clip's own sound levelled to −20 LUFS (so the edit feels bigger) → the edit's finished mix → end-card sting; `master_mix.sh` with `uplifting_bass_726.mp3` from 13.9 s at −40 dB.
3. **[You — QA]** Check the contact sheet: top card plays first, then bottom; end card readable.

**Status today (honest):** both card videos were rendered in a test (`work_test/card_raw.mp4`, `card_edited.mp4`); the full showcase render was not made. Don't copy his chibi character, icons or name — use your own edit and handle.
