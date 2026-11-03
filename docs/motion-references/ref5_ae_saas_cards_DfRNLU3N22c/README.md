# Ref 5 — After Effects SaaS card promo

**Link:** https://www.instagram.com/reel/DfRNLU3N22c/
**Creator:** Jekay Valiente (@jekyiesz) — a recreation of a tutorial by @madebyveduboi
**Contact sheet:** `contact_sheet.jpg` (1 frame per 1 s, time in yellow)
**Copyright:** the reel belongs to its creator. This folder holds only the link, our analysis, measured numbers and a small low-res contact sheet for study. No video or audio from the reel is included.

**Reel:** "Sharing a recent project I worked on in After Effects" · 43.3 s · 1080×1920 · 30 fps · promo for a fictional payments brand "Opptics" (vs "Whop").
**Template in our kit:** `saas_card_grid` → `templates/saas_cards_v4/` (`build_ref5.py` + `comp_ref5.jsx`)

## Measured numbers
- 9 hard cuts (8.9, 14.1, 16.3, 17.9, 18.5, 33.7, 35.9, 37.8, 40.2 s); motion mean **19.4 — the camera never stops**
- 114 sound hits in 43 s (~2.6 per second); −14.1 LUFS, −0.6 dBTP
- Palette: #EFEFEF #ACA0BF #351D36 #B5DCDC #EAE6E4 — off-white + pastel mesh gradients (mint→sky, pink→violet), deep plum

## Shot by shot
- **0–1 s** — single dark glass UI card ("Payment hub") enters tilted on off-white, 3D icons on it.
- **1–4 s** — a stack of glossy coloured cards (orange, purple, pink, blue) fans out in 3D; 3D padlock, piggy bank, gear, credit-card icons pop onto them one per beat.
- **4–6 s** — cards spin into a ring and whip away with heavy motion blur → black frame with a rainbow light-bokeh burst (light-streak transition).
- **7–8 s** — radial rainbow light rays; 3D logo tile "opptics" (navy) meets "whop" (orange) tile, hand cursor taps.
- **9–11 s** — kinetic headline on pastel gradient: "The future" (glow) → "of e-commerce" (selection-box/cursor frame around the word) → "is here" + red 3D map-pin emoji.
- **12–13 s** — "get **Paid** in 1 2 business days" with a 3D pink piggy bank + notification pills.
- **14–15 s** — mint gradient: "Lowest fees" glow headline, glossy 3D coin logos, "Pay the lowest in the industry" pill with green tick.
- **16–17 s** — black: green-glow UI cards fly through; "Superior approval rates" + "Congratulations" card with emoji stickers.
- **18 s** — "But wait|" typed with a blinking cursor on white.
- **19–20 s** — light streak across a pink→mint gradient; a 3D folder opens and a feature card rises out of it.
- **21–33 s** — the hero move: an **infinite grid of feature cards** (pastel icon tile + title + "Learn more →" pill) on a plane tilted ~25–30°, drifting diagonally while the camera slowly rotates; 3D icons (cart, shield, warning, padlock, Shopify bag, check) pop as each card passes centre.
- **34–35 s** — white: "Are **you** ready to make the switch?" with the two logo tiles and a 3D toggle switch.
- **36–37 s** — black + radial rainbow rays, logo tiles, the toggle flips **on** (green); yellow glow line "This is just the beginning".
- **38–39 s** — "Switch today" + toggle; logo wordmark on sky-blue gradient.
- **40–43 s** — black end card: "Lets work together! Link below" + small link line.

## Look
- **3D layers:** every card is a flat layer in AE 3D space (thickness faked with a 2nd offset layer + shadow), camera with depth of field.
- **Easing:** strong ease-out (exponential), overshoot on pops, motion blur on every move.
- **Transitions:** light streaks / rainbow bokeh on black between chapters; whip spins with motion blur.
- **Type:** bold rounded sans, gradient glow on key words, selection box around one word, typed lines with a cursor.

## Recreate it with the kit (Blender = 3D icons · code = cards, type · EffectCraft = 3D layers + camera, streaks, rays)
1. **[Code]** Edit the `SERVICES` list in `templates/saas_cards_v4/build_ref5.py` (title, subtitle, tint, icon) — use your real services; no fake numbers.
2. **[Blender]** Blender icons (transparent loops): `blender -b --factory-startup -t 8 -P templates/explainer_soft3d_v4/sprites_v4.py -- --sprite tile --color "#7c5cff" --glyph "</>" --size 500x500 --frames 60 --out renders/sp_tile_code/` (same for `tile_play`, `tile_globe`, `tile_check`, `coin`, `star`, your logo letter `tile_z`).
3. **[Code — PIL]** `python3 build_ref5.py` → glossy cards, headlines, selection box, toggle, rays + `comp_ref5.jsx` + `sfx_ref5.json`.
4. **[EffectCraft]** EffectCraft: `effectcraft-cli script comp_ref5.jsx` → `render --project ref5.ecproj --comp Ref5 --out silent.mp4 --format h264 --bitrate 24000`. The comp uses `threeDLayer = true` cards on a tilted grid + a camera drift, light-streak transitions, radial rays.
5. **[Code — sfx_mix.py + master_mix.sh]** Sound + master: `sfx_mix.py sfx_ref5.json` → `master_mix.sh … --music music/digital_clouds_175.mp3 --music-db -8`.
6. **[Code — one script]** All in one: `./build_all_v4.sh ref5`.

**Status today (honest):** card + camera comp tested in EffectCraft with real 3D layers; the full render was not made. The tutorial it copies (by @madebyveduboi) is listed in this folder's RESEARCH.md if it was found.
