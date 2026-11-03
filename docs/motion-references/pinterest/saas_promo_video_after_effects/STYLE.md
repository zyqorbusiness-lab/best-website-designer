# STYLE — "saas promo video after effects" (Pinterest, signed in, 2026-11-03, v4 research)

16 video pins (pins.json): 8 from **MotionDesigners.Pro** ("Motion inspiration – Orange/Frames/Glass/Clip/Green/Moolah/Flow"), plus WizArt Studios, Over Sight Webflow, EarnEdits (SpatialFlow UI AE project), Quantum Motions, SoftwareWOW, Kulveer.
Measured on 4 clips with `analyze_ref.py` (measure/NN/style.json). Mp4s deleted after measuring.
Maps to **ref 2** (@raieum.edit plugin promo) and **ref 5** (Jekay Valiente AE SaaS cards).

## Shared look
- Two camps: **(a) bright purple/white brand promo** (01 WizArt: #4f00af / #5702b5 purple, #fdfdfd white, #140937 ink; huge bold sans words "More reach", "ANDS", tilted screens) and **(b) dark-mode UI on black** (02 Over Sight Webflow scroll: brightness 0.04, #000000 / #06080b with one glow; 04 EarnEdits SpatialFlow: #09160c deep green-black + lilac #ddcdf3 / #9c83bc cards).
- POV / headline frames: one short claim in a bold grotesk (Inter/Satoshi-like), 2–4 words, centred, with the UI card under or behind it (03 MotionDesigners "Orange": "POV: your SaaS explainer ADS").
- UI is always a **real product screenshot on a rounded card** (radius ≈ 3–4 % of card width) with a soft drop shadow or rim glow, never a full-bleed screen recording.

## Motion + timing (measured)
- Brand promo (01): 8 hard cuts in 30.2 s, but they cluster at the end: shots of 6.9 / 6.1 / 3.5 / 3.2 s and then 1.5 / 1.1 / 1.1 s → **accelerate the cutting into the CTA**. 10 flash frames, onsets 2.5/s, −13.3 LUFS.
- UI-scroll pieces (02, 04): **0 cuts**, motion 1.5–3.6 (slow), still 24–34 % → long holds, a slow vertical scroll or parallax of cards, a light sweep crossing a card. 02 has no audio track at all (silent Pinterest upload).
- 03 (9.5 s): 1 cut at 2.8 s → hook text 2.8 s, then the UI demo.
- Typical beat 0.8–1.5 s; sfx: soft clicks on UI taps, whoosh on card moves, a riser into the logo/CTA.

## Do this (rules)
1. Hook with a 2–4-word claim in bold sans on brand colour for ≤3 s, then show the product. — 03 https://www.pinterest.com/pin/933230354048290966/ , 01 https://www.pinterest.com/pin/925700898420097801/
2. Put every screenshot on a rounded card (radius 3–4 %), tilt 8–15° in Y, add rim light / glow on the top edge. — 04 https://www.pinterest.com/pin/1086986060078349776/ , 07 https://www.pinterest.com/pin/127578601939225224/
3. Dark-mode UI reads premium on black/deep-green; pastel lilac cards on near-black (#09160c + #ddcdf3) is a strong ref-5 alternative palette. — 04, 02 https://www.pinterest.com/pin/926052742129752155/
4. Long UI shots: slow scroll (≈ 3–6 % of frame height per second) with a diagonal light sweep every 2–3 s. — 02, 15 https://www.pinterest.com/pin/933230354044475708/
5. Cut pace accelerates into the CTA: 6 s → 3 s → 1 s shots, flash frame on the last 3 cuts. — 01
6. Sound: click per UI tap, whoosh per card move, riser 1 s before the logo; master −14 LUFS. — 01, 03

## Kit mapping
- Ref 2 look: `blender/screen3d.py` / `blender/screen_video.py` (tilted 3D screen, zoom-to-pixel), `blender/text3d.py` (glossy extruded type), hero builder `templates/saas_blender_hero_v4/hero_v4.py` + `comp_v4.jsx`.
- Ref 5 look: `templates/saas_cards_v4/build_ref5.py` + `comp_ref5.jsx` (EffectCraft card grid, light streaks, rays).
- Audio: `sfx_mix.py` with events json (`audio_sfx_events_v4.json`, `sfx_ref5.json`) → `master_mix.sh`.
