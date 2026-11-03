# STYLE — "talking head reel editing" (Pinterest, signed in, 2026-11-03, v4 research)

16 video pins (pins.json): Motion Pet (×3, "real estate style"), RivoZen, Prakhar Parsai, Made and Styled (caption trick), Studio Astreon, PerfectShots, Main Realty (×2), Karan Sharma (×2), Bailey Pate, Peak Architects.
Measured on 4 clips with `analyze_ref.py` (measure/NN/style.json). Mp4s deleted after measuring.
Maps to **ref 3** (@sanidhyadecodes framed talking head + effect every 0.5 s). Finding: on Pinterest, "talking head editing" pins are mostly editors **selling the edit as Before/After** (4 of 4 downloaded) — same layout as before_after_video_editing_showcase.

## Look
- White #f7f7f7–#fafafa world, two orange #fea101 blobs (Motion Pet), small raw "Before" card + big "After" card (see the before/after STYLE for pixel rects); or plain white with black "Before / After" headings (04 RivoZen).
- Inside the After card (= the actual talking-head edit):
  - **Full-card B-roll cutaways** every 2–3 s: architecture stills, city shots, crowds, a clock — black-and-white or desaturated, matching the sentence (02, 03).
  - **Kinetic words**: one word at a time, small white sans in the lower middle, with a bigger italic/serif accent word for emphasis ("largest relocation", "15%") (01).
  - **Big vertical type** behind/over B-roll: "LONDON" in tall orange condensed caps running vertically down the card (02).
  - **White text cards**: the After card flips to white with 2–3 words in black + one red word + a small emoji/icon (04: "in your 🧠 brain").
  - Brand lower-mark (logo) at the bottom of the card (01 "N2N").
- Warm skin tones: palette #4a2720 / #d2ae7d (01–03) — slightly warm grade on the speaker.

## Timing (measured)
- No hard cuts in the Motion Pet pieces (0 in 16.8 / 17.1 / 19.1 s) — the take runs continuously and B-roll is **inserted inside the card**; 04 has 5 cuts in 13.3 s (every ~2.0 s: 1.7, 3.7, 6.8, 9.3, 11.3 s) alternating speaker ↔ white text card.
- Onsets 1.6–2.0 /s (beat 1.0–1.3 s); loudness −14.2…−14.5 LUFS (all on target).
- Ref 3 itself is denser (effect every ~0.5 s); these pins are the calmer "premium" version: one event per 1–2 s.

## Do this (rules)
1. Keep the take continuous; change the picture *inside* the frame/card with B-roll inserts every 2–3 s. — 02 https://www.pinterest.com/pin/671599363236225503/ , 03 https://www.pinterest.com/pin/671599363236245110/
2. Word-by-word captions small and low, with 1 accent word per sentence in italic serif or a colour. — 01 https://www.pinterest.com/pin/671599363236283537/
3. Alternate speaker and a white text card (black words + 1 red word + icon) every ~2 s for list-type scripts. — 04 https://www.pinterest.com/pin/875176140111922304/
4. B-roll in B&W/desaturated so the speaker stays the only warm colour. — 02, 03
5. One sfx per event (whoosh for B-roll in, pop for a word, click for a text card); don't stack more than ~2 per second unless you want ref 3's hyper pace. — measured 01–04
6. Sell the edit: export a second version as Before/After cards (see before_after STYLE). — 01–04

## Kit mapping
- `templates/talking_head_v4/run_ref3.sh <clip.mp4>` (framed card over blurred copy, permanent "Comment X" line, stacked kinetic words, stickers, flashes, punch-ins).
- Calmer "Motion Pet" variant = same script with event spacing 1–2 s and B&W B-roll inserts; captions from `transcribe_words.py`; voice via `clean_voice.sh` + `cut_pauses.py`.
- Then `templates/before_after_v4/run_ref4.sh raw.mp4 edited.mp4` for the showcase cut.
