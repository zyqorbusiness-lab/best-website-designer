# Reference breakdowns (all 8 references + 2 Pinterest examples)

Every video was decoded at 60 fps by `tools/ref_breakdown.py` (frames sampled, unique frames counted, motion, cuts, flashes, colours per second, audio onsets).
Then Tab looked at 2 fps contact sheets (one frame every 0.5 s) and filled effects / animation / easing / text / font / text colour / glow / background / subject / b-roll / transition / camera / sfx per second and per detected event.

**What is and is not claimed:** the 60 fps numbers are machine-measured on every frame. The visual notes come from viewing every 0.5 s (2 fps), not every one of the 60 frames per second by eye - a 60-frame look at every second is what `ref_breakdown.py` + `sheets/sec_NNN.jpg` give you when you re-run it on the link (sheets are not shipped: third-party frames). ref8's rows were filled in v5.2 (viewing density not recorded there).
The tool's cut counter uses a fixed threshold on 180 px thumbnails and misses cuts between similar-looking scenes (it reports 0 cuts for ref1, which does have 12 blur-swaps); the per-second notes mark cuts/swaps that were seen.

| ref | link | size / fps | s | rows filled | machine counts (cuts / flashes / animation segments / audio onsets) |
|---|---|---|---|---|---|
| ref1_soft3d_explainer | https://www.instagram.com/reel/DfJvupgpmeq/ | 1080x1920 / 30 | 38.7 | 39/39 | 0 / 0 / 32 / 77 |
| ref2_saas_plugin_promo | https://www.instagram.com/reel/DfPSHbysI7k/ | 1080x1920 / 60 | 36.4 | 37/37 | 2 / 1 / 24 / 81 |
| ref3_talking_head_sfx | https://www.instagram.com/reel/DfNHu7UzIc2/ | 1080x1920 / 30 | 11.1 | 11/11 | 0 / 0 / 10 / 14 |
| ref4_original_vs_edited | https://www.instagram.com/reel/DfRKIG-B6FV/ | 1080x1920 / 60 | 42.4 | 43/43 | 1 / 0 / 22 / 114 |
| ref5_ae_saas_cards | https://www.instagram.com/reel/DfRNLU3N22c/ | 720x1280 / 30 | 43.3 | 44/44 | 18 / 0 / 33 / 67 |
| ref6_gaming_timeline | https://www.instagram.com/reel/DfRIa9ziZIy/ | 1080x1920 / 60 | 35.2 | 36/36 | 0 / 0 / 29 / 98 |
| ref7_flow | (local Flow-generated clip, no public link) | 848x478 / 25 | 18.0 | 18/18 | 11 / 4 / 15 / 9 |
| ref8_breakdown | https://www.instagram.com/reel/DfR63QgTvNj/ | 1080x1920 / 30 | 32.9 | 33/33 | 7 / 1 / 32 / 55 |
| pin_caption01 | https://www.pinterest.com/pin/671599363236245110/ | 720x1280 / 30 | 19.1 | 20/20 | 0 / 0 / 16 / 48 |
| pin_kinetic03 | https://www.pinterest.com/pin/933230354043913635/ | 720x1280 / 25 | 17.8 | 18/18 | 19 / 2 / 24 / 27 |

Each folder: `breakdown.md` (read this), `breakdown.json` (same data), `motion_graph.png` (frame-difference over time). Banned colours (purple/violet/blue neon/cyan) in a reference are flagged TAKE/SKIP in the folder's summary: copy the structure, never the palette.

Make-it-ours (min 3 changes) is written per reference in `make_it_ours`.


## v5.5 - 12 new reference reels (Nov 4 2026)
One joint breakdown: `nov4_12refs/BREAKDOWN_ALL12.pdf` + raw numbers (see its README). Median over the 12: 24.7 hard cuts/min, 2.3 s average shot, -14.2 LUFS, -0.7 dBTP. Refs 5 and 6: edit panel only.
