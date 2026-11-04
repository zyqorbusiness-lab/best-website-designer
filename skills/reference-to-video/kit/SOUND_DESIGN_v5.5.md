# SOUND DESIGN v5.5 - from the measured SFX gap (12 refs vs our behind-head reel)

**Nobody here can listen.** Everything below is measured with numbers (`tools/audio_gap.py`, `breakdowns/nov4_12refs/`), not heard. Sujon's ears are the final judge. Reel measured: `behind_head/reel.mp4` (v5.3 recipe 11 demo).

## What the numbers say [M]
| measure | 12 refs (median) | our reel | verdict |
|---|---|---|---|
| integrated loudness | -14.2 LUFS (-14.1..-14.3) | -14.0 | same |
| true peak | -0.7 dBTP | -3.5 | we are ~3 dB softer in peaks |
| crest factor | 15.8 dB | 13.8 | refs punchier |
| sub-bass share (30-90 Hz) | -7.3 dB | -21.3 | **14 dB less low end** |
| air (4-11 kHz vs mids) | -15.8 dB | -26.1 (-25.9 in first run) | **~10 dB less air** |
| sfx vs voice | n/a (refs: hits audible) | sfx **27.6 dB under the voice**, 13.5 dB under the music bed | **inaudible** |
| per-event margin | n/a | all 54 events 14-52 dB below voice+music (median -32 dB); 0 of 54 within 12 dB | inaudible |
| event density | ~0.46 low-heavy hits/s + ~10 rising swells/min | 3.3 events/s (pop 17, click 11, pop2 11, whoosh_fast 7, bass 4, impact 3, ding 1) | **7x too dense, wrong type** |
| voice vs music bed | bed ~3-4 dB under voice | same | not the problem |
| silence gaps | - | - | not the problem |
Per-cut sync could not be measured in the refs (27 % of cuts have an audio onset within 50 ms vs 27 % for shuffled times), so "sfx exactly on the cut" is a practice rule, not a measured one.
Cause in one line: pops/clicks are bright and short and sit ~45 dB under the voice, there are 7x too many of them, and nothing carries sub-bass.

## Fix list (what to build in the next reel)
1. **Raise the SFX bus ~ +18 dB** (target: sfx RMS <= 18 dB under the voice RMS; impacts peak ~4 dB under the voice peak).
2. **Density 0.5-1.5 events/s**: sound on big words, cuts, zooms and transitions only; one sound per cut; no click+pop on every caption word.
3. **Sub-heavy bed** (45-60 Hz sine swell / sub tail under every impact and big word) to move the sub share from -21 toward -8 dB.
4. **Air layer**: noise swell 4-11 kHz on whooshes and risers.
5. **Full-spectrum whoosh / riser / impact; retire per-word pop and click** (keep one pop for a card entering).
6. **Limiter to -1.0 dBTP at -14 LUFS** (we peaked at -3.5; refs -0.7 [M]).
7. **Human jitter**: +-15 ms timing, +-1.5 dB gain, +-3 % pitch, 3-4 variants per sound, never the same sample twice in a row.
8. Run `python3 tools/audio_gap.py final.mp4 --vo vo_clean.wav --sfx sfx.wav --events sfx_events.json`; `qc_v5.py ... --vo --sfx` now fails F15 when sfx are >18 dB under the voice. We did NOT re-mix the behind-head reel in v5.5 (not asked); the fix list is proposed, not yet validated by a re-mix.

## Reference numbers kept in zq_config.json
`sound_design.targets` (measured) and `sound_design.bus` (proposed). The mix gain fitted on our reel was x0.317 on sfx.wav (= -10 dB): raise it with `master_mix.sh ... --sfx-db 8 --tp -1.0` (v5.5 added `--tp`; +8 dB is the +18 dB fix from the fitted -10), then re-run audio_gap.py - raise or lower until `sfx_under_voice_db` <= 18 and no PASS-breaking clipping. `sfx_map` in the config still lists the v5.3 sounds.
