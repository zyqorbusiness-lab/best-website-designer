# TEST REPORT - Zyqor Motion Kit v5.5 (Nov 4 2026)

Tested from a CLEAN UNZIP of `Zyqor_Motion_Kit_v5.5.zip` into an empty folder (ffmpeg 5.1, Python 3.11, Node 20, no EffectCraft/Blender). Results below were observed in that run.

## 1. Every tool answers `--help` (20 of 20 passed, exit code 0)
audio_gap.py, clean_voice.sh, cut_pauses.py, ec_reel.py, fx_cut_fx.py, fx_extrude_text.py, fx_phone_frame.py, fx_torn_reveal.py, get_audio.sh, get_references.py, master_mix.sh, pin_download.py, pinterest_refs.mjs, pinterest_sheet.py, qc_v5.py, ref_breakdown.py, sfx_mix.py, transcribe_words.py, word_behind_head/composite.py, word_behind_head/mask_birefnet_lite.py.
(Found and fixed during testing: `clean_voice.sh`, `master_mix.sh`, `word_behind_head/composite.py` and `mask_birefnet_lite.py` crashed on `--help`, and `get_audio.sh --help` started the downloads; all five now print their usage first.)

## 2. Smoke tests on synthetic, self-made warm clips (no third-party media) 
| test | result |
|---|---|
| fx_extrude_text.py KAHANI --preset gold --jitter 2 | PNG written |
| fx_extrude_text.py --face '#7a1fff' (purple) | refused, exit 1 |
| fx_torn_reveal.py A.mp4 B.mp4 (540x960, 0.5 s) | 15 frames written; viewed: rough tear edge |
| fx_phone_frame.py --crop 100:200:700:1300 | 1080x1920, same frame count + audio kept; viewed |
| fx_phone_frame.py --bg-colors '#7a1fff,#3300ff' | refused |
| fx_cut_fx.py flash / bw / punch / whip / leak | all 5 written; frames viewed; banned-hue share of the figure frames 0.0 % |
| audio_gap.py on behind_head/reel.mp4 | sfx 27.6 dB under voice, verdict WARN (reproduces the Nov 4 measurement) |
| qc_v5.py --vo --sfx on the same reel | F15 FAIL as intended |
| get_references.py --list | 12 links |
| get_references.py --only 5 --edit-only | real download + crop, wrote ref9_5_EDIT.mp4 (572x1016) |
| ec_reel.py demo_shots.json --dry-run | comp script written |
Bug found and fixed in testing: the first `fx_cut_fx.py leak` blended RGB leak planes against YUV video planes and produced a pink/purple cast (banned colour). It now converts both to planar RGB before the screen blend; re-rendered frames measure 0.0 % banned hue.

## 3. Requirements
`python3 -m pip install --dry-run -r tools/requirements.txt` resolved (numpy, pillow, opencv-python, faster-whisper, markdown, yt-dlp, requests, scipy, fonttools, brotli). A real install into a fresh venv was NOT done (dry run only).

## 4. Paths and contents
No machine paths in the kit (legacy_v4 jsx now use `CHANGE_ME/...`; prompts and pinterest_refs.mjs cleaned). No third-party media in the zip: links, CSV/HTML, numbers, our own PDFs only.

## 5. What was NOT tested (honest)
- None of the new tools has been used inside a finished 20-30 s reel yet; they ran on synthetic clips only. fx_torn_reveal at 1080x1920 was not timed.
- Recipes 12, 15 and 18 were not rendered end to end.
- Audio: nobody here can listen. The SFX fix list is proposed from measurements; the behind-head reel was not re-mixed.
- EffectCraft (zq_lib.jsx, bigword_lib.jsx) and Blender were not available in the clean unzip, so jsx code paths were not executed in this test.
- Pin colour check: 3-4 fps sampling of pin videos; the music pins were not video-checked.
