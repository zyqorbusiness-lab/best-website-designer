# Ref 3 — Talking head in a framed card, effect every 0.5 s

**Link:** https://www.instagram.com/reel/DfNHu7UzIc2/
**Creator:** Sanidhya | Tech Mentor | Editor (@sanidhyadecodes)
**Contact sheet:** `contact_sheet.jpg` (1 frame per 0.5 s, time in yellow)
**Copyright:** the reel belongs to its creator. This folder holds only the link, our analysis, measured numbers and a small low-res contact sheet for study. No video or audio from the reel is included.

**Reel:** "Grab my Most Used SFX in your DMs" · 11.1 s · 1080×1920 · 30 fps · talking-head editor reel.
**Template in our kit:** `framed_talking_head` → `templates/talking_head_v4/` (`run_ref3.sh his_clip.mp4`)

## Measured numbers
- No hard cuts in the frame layout (the cuts happen inside the card); motion mean 10.6 (busy)
- 22 sound hits in 11 s (~2 per second) — one per visual event; −15.4 LUFS, true peak +0.5 (slightly hot; we master to −14 / −1 dBTP)
- Palette: #658FAC #B2CED6 #061C2D #2F383F #5E5253 — dark navy world, blue bokeh, white text

## Shot by shot (0.5-s steps)
- **0.0–0.5 s HOOK** — full-screen face; glossy After Effects app icon pops in front of his chest, glowing light-blue "AFTER EFFECTS" letters behind it. Hit on frame 1.
- **0.5 s** — the whole video **shrinks into a rounded card** (~60 % width, centred, thin white border, soft shadow) over a blurred, blue-tinted copy of the same footage with big bokeh discs + a blue ring. Handle on top, white 2-line CTA under the card stays to the end: *Comment "SFX" to get all the sound effects I used in this Reel.*
- **0.5–1.5 s** — AE effects panel UI slides in front of him inside the card (screen-grab sticker).
- **1.5 s** — **colour flash**: card tinted red/orange for a few frames + glowing white scribble lines over the panel.
- **2.0–2.5 s** — warm/yellow grade beat; cartoon sticker (meme duck) pops on his shirt.
- **3.0–3.5 s** — **B&W** beat with a cartoon character sticker pointing a gun at him (comedy cut-out).
- **4.0 s** — blue whip/glitch transition inside the card → screen recording of the SFX panel.
- **5.0 s** — **RGB-split / tunnel warp** transition (red/green/blue smear).
- **6.0–6.5 s** — the SFX panel UI tilted in 3D, cursor scrolling.
- **7.0 s** — glitch transition (RGB noise) back to the face.
- **7.5 s** — face, punch-in; yellow/white caption "ISNE MERA" stacked words.
- **8.0–8.5 s** — B&W timeline shot + grain, distressed white 3D text **"EDITING WORKFLOW"**.
- **9.0–10.5 s** — back on the face; stacked kinetic type builds word by word: **10X** (big heavy white) → **FASTER** (cyan) → **EASIER** (cyan, smaller). A hit on each word.
- **10.5–11.1 s** — hold on the face + CTA line.

## Look
- **Frame:** card ≈ 650×1180 centred at y ≈ 47 %, radius ~18 px, 3 px white border, dark drop shadow; background = same video, 40 px blur, darkened, blue duotone, plus bokeh discs.
- **Rhythm:** a new effect every 0.5–0.8 s and every effect has its own sfx.
- **Effects list:** colour flashes (2–4 frames), RGB split, whip/zoom blur transitions, B&W + grain, sticker pops with bounce, glowing scribbles, punch-ins 110→125 % on stressed words, small shake on hits.
- **Type:** heavy condensed white + cyan accent words, stacked, slammed in with a shake.

## Recreate it with the kit (code = cuts, timing, captions · Blender = 3D hook icon · EffectCraft = frame, effects)
1. **[You]** Record yourself 10–40 s, vertical, face roughly centred.
2. **[Code + Blender + EffectCraft, one script]** Run **one command**: `templates/talking_head_v4/run_ref3.sh my_clip.mp4 out.mp4 --keyword SITE --hook "3 THINGS"`
   It does, in order: normalise to 1080×1920/30 → `clean_voice.sh` (de-noise, EQ, compress) → `transcribe_words.py` (faster-whisper word timings) → `cut_pauses.py` (removes pauses > 0.4 s, punch-in + RGB/flash on every cut) → Blender 3D hook icon (`sprites_v4.py --sprite tile --glyph 3`) → `build_ref3.py` (plans every effect from the transcript: framed card, blurred blue copy, permanent "Comment SITE" line, stickers, flashes, scribble ring, B&W + grain word, stacked kinetic words, captions) → EffectCraft render → `sfx_mix.py` + music ducked under the voice → `master_mix.sh` (−14 LUFS) → mux → contact sheet + audio check.
3. **[Code]** Options: `--face X,Y` (where your face is, for punch-ins), `--icon 3` (glyph on the 3D icon), `--music music/better_times_173.mp3`.
4. **[You — QA]** Check `*_contact.jpg` — every 0.5 s should look different.

**Status today (honest):** the pipeline ran on the practice clip (`clip.mp4`) through the cut, the word timings and the EffectCraft comp; the final full-length render was not kept. Runs in ~15–25 min for a 20 s clip on CPU.
