# Nov 4 2026 - 12 reference reels, frame-by-frame breakdown (numbers + report only, no video)

- `BREAKDOWN_ALL12.pdf` (5 pages): per-ref stats, "human-made not AI" section, 20 effects ranked by how many refs use them (with recipes), SFX gap, tool-identification statement.
- `breakdown_data.json`: per-ref cuts, shot lengths, duration, crops used. `audio_ref1..12.json`, `audio_ours.json`: loudness, true peak, crest, band shares, event stats (made by `aud_measure.py`; same measures as `tools/audio_gap.py`).
- Links to the 12 reels: `../../REFERENCE_LINKS.csv` (kind `instagram_reference_reel`); download with `python3 tools/get_references.py --out ~/refs_nov4` (`--edit-only` crops the edit panel of before/after refs 5 and 6).
- Honest tags: [M] measured by code = cut times (ffmpeg scene scores 0.3 and 0.15, clustered within 0.2 s), loudness, true peak, band shares, SFX levels. [E] eyeballed = effect names, text style, colours and timestamps in recipes: from 3 fps overview sheets of every ref plus one native-fps burst of 0.8 s per ref - NOT every frame was looked at. Refs 5 and 6 were analysed on the EDIT panel only (crop boxes eyeballed).
