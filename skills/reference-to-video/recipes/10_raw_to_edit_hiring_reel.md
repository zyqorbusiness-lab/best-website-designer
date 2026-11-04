# Recipe 10 - "raw clips -> polished reel" announcement (Hinglish hiring reel, Nov 4 2026)

Built on kit v5.4 workflow in EffectCraft (all text and effects are comp layers; Blender not used). 18.4 s, 1080x1920, 30 fps, -14 LUFS.

## Shape (VO sets the clock; ElevenLabs /with-timestamps -> word starts by splitting the character alignment on spaces)
| t (s) | scene | camera / transition |
|---|---|---|
| 0-3.5 | two grey, shaky RAW b-roll cards slide in, "FX" crossed out, "story" sticker, card turns to colour | warm slice glitch 1.95; spin-blur out 3.2-3.8 |
| 3.5-5.55 | "WE'RE HIRING" scramble title + code-built timeline UI, playhead sweeps | vertical push 5.28-5.68 (both rigs move together) |
| 5.55-6.65 | three RAW cards | zoom-through 6.4-6.95 + light-leak footage |
| 6.65-8.5 | timeline turns coloured, three graded EDITED cards, sparks | spin-blur 8.2-8.85 |
| 8.5-11.0 | EDIT 1 / EDIT 2 cards, calendar + DM stickers | stutter cut 10.6-11.0: scale 100/116/100/134 and tone flips on 3 holds |
| 11.0-15.45 | DM phone revealed by a pull-out (scale 200 -> 100 with radial blur), style/team/match stickers | small side push 13.5, leak into end card 15.2 |
| 15.45-18.4 | brand scramble, "DM your 2 best edits + availability", three EDITED cards | end hold with floating cards |

## Techniques that worked (EffectCraft 0.19)
- Video-in-card: video layer + matte layer directly above it (`moveBefore`) + `trackMatteType = TrackMatteType.ALPHA` + a frame PNG with a transparent window on top; parent all three to a null and animate the null.
- Raw vs edited look on the same footage: Lumetri Saturation 0 / Contrast -28 / shaky position expression vs Temperature +14, Contrast +16, Saturation 112 and a 1.18x punch-in.
- Stutter cut = hold-style key pairs 0.01 s apart on the scene rig (scale + roll) with 0.1 s background-tone segments.
- Pull-out = start the rig at scale 200 and slide the null so a coloured element is centred, ease to 100, CC Radial Fast Blur 55 -> 0.
- Real Pinterest light-leak footage, rotated 90 degrees, Screen blend, seek into the ramp, opacity 14-30 (the clips are mostly white).
- Cream fabric texture from a Pinterest pin: Multiply 40 % over the paper tone.

## Gotchas (each cost a render)
- A Pinterest TAKE flag from the cover alone was wrong once: a light-leak pin had purple/blue bokeh inside. Look at frames across the video before TAKE.
- Parenting in EffectCraft keeps the world position at the moment of parenting; rig null anchor is 50,50 and rests at 540,960.
- A push needs both rigs moving in the same 0.3 s; moving out first and in later leaves black.
- bgSeg with a wipe needs the previous segment to overlap, or black shows through.
- scramble() needs a hex `fill`, else the in-between frames are white on light paper.
- captionLine gap about 0.33 em (56 px at 172 px type) or words mash; lines of two words at 150+ px read big (lines over ~12 characters are scaled to 0.78 of the width).
- sfx_mix.py looks for .mp3 before .m4a in the same folder; keep names unique.
- Four parallel EffectCraft renders with video layers got two chunks OOM-killed on a 16 GB box; two at a time is safe (about 95 s per 4.6 s chunk).
- Chunk the render by --start/--end and re-render only the chunks that changed; concat with -c copy.
- Pull-out/stutter etc. cannot be judged from the contact sheet: sample 30 fps bursts at each transition.
