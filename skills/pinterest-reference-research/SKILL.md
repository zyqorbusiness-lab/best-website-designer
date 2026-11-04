---
name: pinterest-reference-research
description: Pinterest first for EVERYTHING in an edit — references and the actual files for music, sfx, b-roll, subject, effects and background — downloaded into the project with the pin logged.
when_to_use: the first step of every video edit; "find references", "get sfx / music / b-roll / overlays for this edit"
license: MIT (text). Downloaded pin media stays in the user's project folder, never in this repo.
version: 3.1.0
---

# Pinterest for everything (v5.3)

Sujon, Nov 3 2026: "Background music se b roll subject sound effects har ek chiz pinterest se le" · "Sab use kar pinterest se".

1. Search per category (examples): music "lofi beat reel", "cinematic background music" · sfx "whoosh sound effect",
   "ui click sound", "riser transition sound", "sfx pack video editing" · b-roll "<topic> b roll", "laptop desk aesthetic video" ·
   subject "phone mockup hand video", "talking head framed reel" · effect "light leak overlay", "film grain overlay",
   "paper tear transition" · background "paper texture background", "beige gradient background video".
   Agents on Tab's box: `node skills/reference-to-video/kit/pinterest_refs.mjs "<topic>" 16 --scope=videos` (read-only, signed-in
   Browserbase context; writes pins.json + contact sheets). On a PC: search in the browser and paste the pin links.
2. Download best quality first, straight into the project:
   `python3 skills/reference-to-video/kit/pin_download.py <pin_url> --cat <music|sfx|broll|subject|effect|background> --project projects/<topic>
    [--breakdown refs_breakdown/<ref>/breakdown.json] [--name whoosh] [--clip 3.2-4.1] [--original]`
   → `assets/pinterest/<cat>/…`, `assets_log.json`, `SOURCES.txt` (pin link, creator, original link).
3. Pins are often reposts: the `original` link in the log is where the first upload lives (worth a look).
4. Render with `ZQ_SFX_DIR=projects/<topic>/assets/pinterest/sfx` so Pinterest sounds are used first.
5. Gate: a pin logged for all 6 categories (qc_v5.py F12; F7 checks each sound's source is logged).
6. Skip any pin whose look is purple / violet / blue neon / cyan glow — learn the motion, never the palette.

All references used so far, with TAKE/SKIP: `skills/reference-to-video/kit/REFERENCE_LINKS.html`.

## Pin lists and what "reviewed" means (v5.3, Nov 4 2026)
`kit/pins/{music,broll,subject,sfx_effects}.json` + `.md` + `INDEX.md`: 168 pins (60 / 36 / 36 / 36), each URL + title + creator +
what it is + use-for + TAKE/SKIP + `reviewed`. Built by a read-only signed-in browser session: search queries per category, open
each result, read title/description, and log the numeric pin id (no saves, boards, follows or comments).
- **reviewed = the cover thumbnail was seen** (and the title/description read). Audio was NOT played and video was NOT watched.
  Say that wherever you give a count ("168 of 168 reviewed from covers, 0 heard"). Sample-open some URLs live (10 of 168 in v5.3,
  all loaded) and say how many.
- Reviewing a big older list: build numbered contact sheets of 30 thumbnails, give one line per index (what it is + TAKE/SKIP +
  colour flag), write the verdicts back into the csv/txt/html. In v5.3 214 "not reviewed" pins became reviewed this way; 76 of the
  168 new + older pins are SKIP, mostly purple / blue / teal-cyan glow looks, tiny type, or ads.
- SFX / music pins are demo reels: the real file comes from `pin_download.py ... --clip A-B`; check the audio with the
  loudness/onset tools before you rely on it.
- Third-party media is never committed or zipped - the lists are links and the downloader is the way to get a file.
