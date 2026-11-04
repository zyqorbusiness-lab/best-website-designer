# Recipe 13 - raw-vs-edit reference: use the EDIT side only, in a rounded phone panel (refs 5, 6)

Sujon's strict rule (Nov 4 2026): for before/after or raw-vs-edit references take ONLY the edited/after part, never the raw/before part. Refs 5 and 6 are 1080x1920 files with a small B/W RAW panel (left) and the EDIT panel (right) as rounded phone frames on a gradient (ref 5: gold/peach, true 60 fps; ref 6: purple studio - colour banned for us).

## Analyse only the edit panel
Crop boxes (x:y:w:h in the 1080x1920 frame, EYEBALLED on one frame each, check them): ref 5 `443:485:573:1016`, ref 6 `354:168:646:981`.
`python3 tools/get_references.py --only 5 6 --edit-only` writes `ref9_5_EDIT.mp4` / `ref9_6_EDIT.mp4`; run `ref_breakdown.py` on THOSE files so nothing from the raw panel enters the numbers (measured on the crops: ref 5 = 6 hard scene changes in 23 s, ref 6 = 5 in 45.6 s).

## Build our version (own footage)
`python3 tools/fx_phone_frame.py edit.mp4 out.mp4 --bg peach --panel-h 0.66 --radius 64 --tilt -2` puts the edit (or a crop of it) into a rounded phone panel on a warm gradient (peach/gold/cream/ember), soft shadow, optional tilt; audio copied. Tested on a synthetic clip (1080x1920 out, 45 frames in = 45 out, audio kept). Do NOT build a raw panel: this layout shows the edited video only.
Panel content ideas from ref 5's edit: small elegant captions (bold humanist sans, soft peach glow), script + hand-drawn red underline, year-ruler timeline, card carousel on an arc, orange wash flash at the end of a scene (ref 5 12.82-13.07 s, 60 fps: 10 frames of orange ink swirl, hard cut, orange overlay decays over ~0.25 s).

## Gotchas
Phone panel should be 60-70 % of the frame height; keep captions inside the panel; no purple/blue background (fx_phone_frame.py refuses banned hues).
## Status
Tool tested (crop, rounded mask, shadow, tilt, banned-hue refusal). Not yet used on a real reel.
