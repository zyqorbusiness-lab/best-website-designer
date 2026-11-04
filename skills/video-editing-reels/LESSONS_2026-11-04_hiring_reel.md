# Lessons - Nov 4 2026 hiring reel (kit v5.4 run)
1. Honest claims: a hiring announcement says only what the script says; no salary, no client names, no handle unless given. Brand line = studio name only. Do not post it unless the studio is really hiring.
2. Voice: Hindi script goes to TTS in Devanagari with English tech words kept in Latin; on-screen captions stay Roman Hinglish, word-synced from the TTS character alignment (pair the two word lists 1:1 before generating).
3. Audio proof, not listening: loudness/silence via the audio proof tool, plus a speech-to-text pass (multilingual base model) to confirm every sentence is present; say plainly the audio was not listened to.
4. Review pins on frames, not covers (see recipe 10).
5. Raw-to-edited as a visual metaphor is cheap: one b-roll clip, two grades.
6. Keep a per-transition log with timestamps while building; it becomes the used-list and the match log without extra work.

7. (added after the fix) The voice must be in the final mix exactly once. Check it: `qc_v5.py --video out.mp4 --vo vo.mp3` (F14, cross-correlation, one dominant peak) and run speech-to-text on the MIX, not just the VO. The first hiring-reel export had the voice twice, 0.35 s apart; it passed loudness/silence/peak checks and the client heard two voices. Fix = rebuild the audio with one VO path and remux onto the same video with -c:v copy (no re-render). See skills/sound-design.
