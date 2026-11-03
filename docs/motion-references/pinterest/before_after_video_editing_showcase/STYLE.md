# STYLE — "before after video editing showcase" (Pinterest, signed in, 2026-11-03, v4 research)

16 video pins (pins.json) from editors' portfolio boards: Motion Pet, Revuteck, Pixallow, PerfectShots (×2), Snipix (×2), Matthew Ventigan, EarnEdits, Idro, Tanzil, Abdul Karim Juneja, Atila Nobre (CapCut).
Measured on 4 clips with `analyze_ref.py` (measure/NN/style.json). Mp4s deleted after measuring. Note: video 01 here is the same Motion Pet pin as talking_head_reel_editing/02.
Maps to **ref 4** (@crafoo9 "Original vs Edited") — and shows the most common alternative layout to his stacked one.

## The layout everyone uses (4 of 4 clips)
- **Side-by-side, overlapping, both 9:16**: a small "Before" card on the left and a big "After" card on the right that overlaps it by ~2 %.
  Measured on 720x1280 (01): Before x 87–287, y 470–811 (28 % of width); After x 274–645, y 298–955 (52 % of width). Cards have ~4 % corner radius + soft drop shadow (blur ≈ 30 px, 25 % black).
- The two cards play **the same moment in sync**; the After card carries all the effects (B-roll inserts, kinetic captions, stickers, zooms), the Before card is the untouched raw.
- Labels: small bold sans "Before" above the small card, bigger "After" above the big card; a coloured dot or glow beside the label (01: orange dot; 02: yellow neon glow; 04: plain white).
- Backgrounds: **(a)** white #f9f9f9 with two orange #fea101 organic blobs in opposite corners + creator handle at the bottom (01, Motion Pet); **(b)** dark blurred copy of the clip at ~30 % brightness (02 Revuteck, 04 PerfectShots: #030304 / #220c0c); **(c)** plain white with a small "Raw Footage" / "Edit by Pixallow" pill above each card (03).
- 02 adds a **screenshot of the editing timeline** under the cards with a neon yellow "Timeline" word — proof of work.

## Timing (measured)
- Mostly **one continuous 17–30 s take** (01: 0 cuts; 04: 0 cuts); cuts happen only inside the After card's B-roll. 03 has 5 scene changes (new example clip pairs every 6–8 s).
- Onsets 1.4–2.2 /s; loudness −14.3…−14.6 LUFS (02 is −7.8 LUFS: way too loud, don't copy).
- The After card changes something every 1–2 s (B-roll insert, word pop, zoom) while the Before card stays dull — the contrast *is* the sell.

## Do this (rules)
1. Two synced 9:16 cards: Before 28 % width at left-centre, After 52 % width overlapping it, both vertically centred slightly above middle. — 01 https://www.pinterest.com/pin/671599363236225503/ , 04 https://www.pinterest.com/pin/879820477207025790/
2. Label each card ("Before"/"After" or "Original"/"Edited") with a 1-colour accent dot; keep the handle at the bottom centre. — 01, 03 https://www.pinterest.com/pin/591660469841407331/
3. Background: white + 2 brand-colour blobs, or a 30 %-brightness blurred copy (gblur sigma 40) for dark clips. — 01, 02 https://www.pinterest.com/pin/1149403136184229928/
4. Put the editing timeline screenshot under the cards for 3–5 s to prove the work. — 02
5. Every 1–2 s in the After card: a B-roll cutaway, a kinetic word, a sticker or a punch-in (110 %). — 01, 04
6. End on a "Hire me / DM" card (ref 4 does this; pins 08, 14 do it in the caption). — 08 https://www.pinterest.com/pin/987132812086003657/ , 14 https://www.pinterest.com/pin/1135681231028821248/

## Kit mapping
- `templates/before_after_v4/run_ref4.sh RAW.mp4 EDITED.mp4` (built for ref 4's stacked layout); the side-by-side variant = change the two card rects in `build_ref4.py` to the numbers above.
- Edited clip comes from `templates/talking_head_v4/run_ref3.sh` (ref 3 style) → feed it in as EDITED.
- Sound: whoosh when the After card slides in, pop on each label, the After card's own sfx track; `master_mix.sh` −14 LUFS.
