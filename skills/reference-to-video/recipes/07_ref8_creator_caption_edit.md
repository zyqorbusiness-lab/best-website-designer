# Recipe 07 — creator caption edit like ref 8 (v5 default look)
Model: https://www.instagram.com/reel/DfR63QgTvNj/ (Sanidhya | Tech Mentor | Editor) — link + analysis only. Breakdown: docs/motion-references/ref8_creator_caption_edit_DfR63QgTvNj/README.md
Measured: 6 hard cuts in 32.9 s (changes happen inside motion), motion mean 25, 2 % still frames, 1.55 sound hits/s, -14.2 LUFS, natural palette (sat 0.29).

## Build (all EffectCraft through kit/ec_reel.py — no Blender)
0. Pinterest first: "<topic> reel edit" (videos), "<topic> caption style", "warm aesthetic gradient background reels", "light leak overlay grain texture". TAKE/SKIP notes, licences.
1. Voice -> `transcribe_words.py` -> `make_video.py "<topic>" --voice vo.mp3` writes shots.json with 1-3 word captions + gradient keyword every other line.
2. Talking head? Use it as the shot background (`"bg": {"plate": "talk.mp4"}` with blur 0) and place captions on the chest (y 1300-1450); a big key word behind the subject needs a cut-out (EffectCraft Roto Brush in the GUI).
3. Every noun the voice mentions = a pop-up card (screenshot / photo / UI) with `card()`, plus a cursor tap (`cursor.taps`) — 1 card every 1.5-3 s.
4. App demos: phone mockup card + the real screen recording inside (precomp or plate), speaker cut-out beside it on a studio bg.
5. Transitions only on idea changes: zoom (into a new idea), glitch (punch line), whip (list item); a warm light-leak overlay from Pinterest on Screen at 60-85 % for 0.6 s on the biggest beat.
6. Grade: zq_config grade_default (warm, contrast +14, sat 94, grain 0.28). No glow except one icon reveal.
7. Sound: pop per card, click per tap, whoosh + sub per transition, riser into the payoff, music bed ducked under the voice. -14 LUFS.
8. `qc_v5.py` must PASS; watch once on a phone.
