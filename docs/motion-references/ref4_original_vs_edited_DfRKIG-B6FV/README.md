# Ref 4 — "Original vs Edited" editor showcase

**Link:** https://www.instagram.com/reel/DfRKIG-B6FV/
**Creator:** Crafoo (@crafoo9)
**Contact sheet:** `contact_sheet.jpg` (1 frame per 1 s, time in yellow)
**Copyright:** the reel belongs to its creator. This folder holds only the link, our analysis, measured numbers and a small low-res contact sheet for study. No video or audio from the reel is included.

**Reel:** "ONE CLIP. TWO DIFFERENT EXPERIENCES" · 42.4 s · 1080×1920 · 60 fps · video-editor portfolio reel ("Looking for a video editor?").
**Template in our kit:** `before_after_showcase` → `templates/before_after_v4/` (`run_ref4.sh raw.mp4 edited.mp4`)

## Measured numbers
- 3 scene changes in the frame (4.1, 10.6, 39.0 s); the layout itself never cuts; motion mean 2.4 (calm frame, the motion lives inside the cards)
- 123 sound hits in 42 s (~2.9 per second, almost all in the edited half); −14.2 LUFS, true peak −4.8; LRA 8.5 — the raw part is quiet on purpose, the edited part loud
- Palette: #EFF0F3 (cards) #A50001 #740001 #C70002 (red vignette) #AB9B9C

## Shot by shot
- **0–4 s** — red radial vignette (centre #DD0002 → edges #660000); two white rounded cards stacked: top labelled **Original**, bottom **Edited** (Minecraft-style pixel font, white with black outline + hard shadow). Faint pixel watermark "@crafoo9" near the bottom. Both cards empty.
- **4.1–10.6 s** — the raw clip plays in the top card: plain phone footage, letterboxed with black bars, flat sound. Bottom card stays white.
- **10.6–18.5 s** — both cards white again (a breather before the reveal; audio continues).
- **19–38 s** — the **edited** version plays in the bottom card; top card white. Edit = chibi animated avatar of the creator, gameplay inserts (20 s), phone mockup (22 s), green **INSTALL** pixel button (23–24 s), hand-held phone shot (25 s), lime pixel word "Interesting" (28 s), PC tower + grass-block icons appear one by one around the avatar (30–33 s), "50" pixel counter (35 s), MINECRAFT logo card (36 s), gameplay (37 s), black frame (38 s). A sticker or icon lands every ~1.5–2 s, each with a pop.
- **39–42.4 s END CARD** — flat red; left-aligned pixel text builds line by line: "DM to" → "Edited by CRAFOO" (purple name) → big lime **Hire** + white "me".

## Look
- Cards 858×483 at x 111–969; top y 309–795, bottom y 981–1467; radius ~45 px; dark-red drop shadow.
- Pixel font for every label (we use Pixelify Sans, SIL OFL).
- The proof format does the selling: same clip, flat vs edited. Stickers only on the edited card.

## Recreate it with the kit (code = layout + audio plan · EffectCraft = cards, pops, end card)
1. **[You]** Pick a raw clip (untouched) and your edit of the same clip — e.g. the output of `run_ref3.sh` on that clip.
2. **[Code + EffectCraft, one script]** Run: `templates/before_after_v4/run_ref4.sh raw.mp4 edited.mp4 out.mp4 --raw-len 8 --name ZYQOR --handle @zyqor.studio`
   - `build_ref4.py` measures nothing — it uses the ref's layout: red radial bg, two cards (858×640 because our clips are vertical), pixel labels, watermark, sticker pops on the edited card, end card "DM to / Edited by ZYQOR / Hire me"; writes `comp_ref4.jsx`, `sfx_ref4.json`, `audio_plan.json`.
   - EffectCraft renders the comp; audio = raw clip's own sound levelled to −20 LUFS (so the edit feels bigger) → the edit's finished mix → end-card sting; `master_mix.sh` with `uplifting_bass_726.mp3` from 13.9 s at −40 dB.
3. **[You — QA]** Check the contact sheet: top card plays first, then bottom; end card readable.

**Status today (honest):** both card videos were rendered in a test (`work_test/card_raw.mp4`, `card_edited.mp4`); the full showcase render was not made. Don't copy his chibi character, icons or name — use your own edit and handle.
