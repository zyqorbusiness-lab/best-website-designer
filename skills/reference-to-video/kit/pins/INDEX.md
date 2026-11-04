# Pinterest pins for music, b-roll, subject and sfx/effects (v5.3, colour-corrected in v5.5)

Searched Nov 4 2026 in a signed-in Pinterest session, **read only** (nothing saved, pinned, liked or followed). Every pin below is a real pin with its URL; no media is in this kit (links only: download with `tools/pin_download.py`).

| list | pins | reviewed (cover looked at) | TAKE | SKIP | live-checked |
|---|---|---|---|---|---|
| [music.md](music.md) | 60 | 60 | 20 | 40 | 4 |
| [broll.md](broll.md) | 36 | 36 | 26 | 10 | 2 + 26 videos colour-measured |
| [subject.md](subject.md) | 36 | 36 | 15 | 21 | 1 + 19 videos colour-measured |
| [sfx_effects.md](sfx_effects.md) | 36 | 36 | 24 | 12 | 3 + 27 videos colour-measured |
| **total** | **168** | **168** | **85** | **83** | **10** |

Same data as JSON next to each list (`music.json`, `broll.json`, `subject.json`, `sfx_effects.json`). The 356 older pins (SaaS, captions, kinetic type, transitions, light leaks, sfx packs, backgrounds) are in `../REFERENCE_LINKS.html` / `.csv`; in v5.3 the 214 of them that were still "not reviewed" got their cover thumbnails viewed and a TAKE/SKIP too (so 524 of 524 pins have a reviewed verdict; links of the older 356 were not re-opened).

## What "reviewed" means (honest limits)
- `reviewed: true` = the cover thumbnail of that pin was viewed (168 of 168); the pin's title/description was read. **No video was played and no audio was heard.** For music, TAKE means the title names a usable background track and the cover is warm/neutral - how the track sounds is NOT reviewed. "No copyright" is the uploader's claim and was not verified.
- Live check: 10 of 168 pin URLs were opened and loaded (HTTP 200, video present); the rest were not opened individually.
- Covers dominated by purple/violet/blue-neon/cyan are marked SKIP (`colour_flag`): learn from them, never copy the palette. Copyrighted songs, film clips and promos are SKIP.
- Many pins are reposts: use `outbound_link` (original post) when it is there; download best quality first.
- Search queries used: music - background music for reels; cinematic background music reel; corporate music background; lofi beat background music; motivational background music video; no copyright music for videos; royalty free background music instrumental; tech startup promo music; trending instagram reel audio; upbeat corporate background music video; warm acoustic background music vlog (thin, no pin kept). b-roll - laptop typing b roll; phone scrolling b roll; website design b roll; small business shop b roll; cinematic hands working b roll; city street b roll vertical. subject - content creator talking head reel; 3d icons floating soft studio; floating 3d objects soft studio render; product on clean paper background; phone mockup floating 3d; phone ui mockup animation; person pointing at screen reel; 3d icon animation. sfx/effects - whoosh sound effect video editing; whoosh transition sfx; sound effects pack for video editing; light leak transition; film grain overlay; glitch transition warm; zoom transition reel; sticker pop animation reel; kinetic captions reel word highlight.


## v5.5 colour correction (Nov 4 2026) - read this
**What went wrong:** the v5.3 verdicts looked at cover thumbnails only. The light-leak pin `603200943843150335` ("Full-frame orange-red gradient light leak", also v4 pin 14) was marked TAKE because its cover is warm, but the video itself has purple/blue bokeh frames: it was used in the behind-head reel and the colour showed. Measured now: **49 of 135 sampled frames are over the 6 % banned-hue limit (peak 100 % of the frame, mean 21 %) -> SKIP.**
**Recheck done (measured, not eyeballed):** every pin that was marked TAKE in the four lists AND the 17 light-leak/overlay pins (older list + sfx list) were downloaded (yt-dlp, deleted afterwards), sampled at 3-4 frames/s at 96x96, and the share of pixels in hue 175-320 deg with saturation >= 0.45 and value >= 0.35 (the kit's banned rule, zq_config.json) was counted per frame. Pins with >= 3 frames over the 6 % limit or a mean above 4 % were switched to SKIP: subject 12, 25, 27, 29; sfx/effects 2, 5, 14. Older reference pins (REFERENCE_LINKS) whose COVER image is over the limit were marked SKIP too (cover-only measurement, video not measured; 14 pins).
**Still clean (video measured, 0 frames over the limit):** the other 16 light-leak/overlay pins measured: 706854104018611568, 582794008056631754, 1011972978781593867, 948922584298729047, 933300722787511197, 563018698079249, 45599014972595377, 18647785950804250, 603200943851052860, 917467755341992522 (peak 1.1 %), 951878071263925843, 922815779909720016, 1030057745993566220, 1052012794311268931, and `1101059809022877440` (its title says "multicolored", it measured 0.0 % on 60 frames). `728246202286883622` peaks at 5.3 % (borderline, under the limit).
**Limits (honest):** 3-4 frames/s sampling can miss a 1-frame flash; the check is colour only (no audio was played, no pin was reviewed for anything else). Each pin JSON now carries `colour_recheck_v55`.
