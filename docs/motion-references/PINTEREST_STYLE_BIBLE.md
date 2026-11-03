# PINTEREST STYLE BIBLE — motion kit v3 (Zyqor)
Built 2026-11-03 from Sujon's signed-in Pinterest (read only). 6 searches × 16 video pins = 96 pins; 49 clips downloaded and measured.
Per-topic detail + pin lists: references/<slug>/STYLE.md, pins.json, measure.json, sheet.jpg, frames_sheet.jpg, strip_NN.jpg (2 fps strips).
Slugs: blender_3d_motion_graphics · after_effects_transitions · sound_design_sfx_video_editing · saas_product_promo_3d · instagram_reel_editing_effects · kinetic_typography_3d

How the numbers were measured: camera = ORB feature affine between frames @10 fps on 360 px (scale → zoom %, angle → roll °); cuts = ffmpeg scene>0.3;
transition frames = frames with Laplacian sharpness < 35 % of clip median (motion blur) and frame-to-frame luma jumps > 35/255 (flashes);
colours = PIL median-cut on a frame at 3 s; audio = audio-proof.mjs (LUFS/peak/LRA) + spectral-flux onsets. Pin codes below = topic:pin# (see each pins.json).
Anything marked (guess) is matched by eye from frames, not measured.

------------------------------------------------------------------------------------------------
## 1. Camera moves (30 fps; % = framing scale; Blender: animate camera, or focal length for pure zoom)
| move | numbers | easing | seen in |
|---|---|---|---|
| Push-in at open | 100→160 % in 1.0 s (30 f); big version 100→250 % in 2.4 s | ease-in-out cubic (slow 0.3 s start, peak ~130 %/s at 0.8–1.0 s) | blender:14 |
| Pull-back + roll, settle | scale 100→71 % over 1.5 s, roll +15° then swing to −43° by 2.6 s, hold 0.9 s | ease-out back (overshoot ~10 %) | blender:02 |
| Slow orbit around tilted screen | continuous roll/orbit 4–6°/s for 6–8 s, zoom drift ≤ ±4 %/s, slight upward pan | linear (constant speed) | saas:05 |
| Zoom-through into UI | +30 % scale + −20…−25° counter-roll in 0.8–1.0 s, motion blurred | ease-in cubic into the cut, ease-out after | saas:05 |
| Push-in then snap-out reveal | +22…+25 %/s for 2 s, then −40 % in 1 s | ease-in quad, then ease-out expo | saas:12 |
| Brand drift per shot | −7…−24 %/s zoom-out + ±2–9°/s roll, each shot 2.0 s | linear | saas:01 |
| Locked camera, object animates | drift ≤1 %/s, ≤0.5°/s for 20 s | — | blender:09, blender:08, kinetic:05 |
| Infinite type tunnel | constant −18 %/s scale + 8°/s roll (seamless loop) / fly-through +84…+129 %/s | linear | kinetic:03, kinetic:02 |
| Primitive spin (sphere/cylinder) | 5–8°/s sphere; 20–30°/s swings cylinder | ease-in-out sine on swings | kinetic:10, kinetic:07 |

Rules: open with motion inside the first 0.3 s · after every move hold 0.5–1.0 s at ≤1 %/s (the hold is what looks expensive) · one move per shot.
Blender (bpy): keyframe camera location/rotation; `kp.interpolation='CUBIC'; kp.easing='EASE_IN_OUT'` (or `'BACK'` + `kp.back=1.7`, `'EXPO'`) on each fcurve keyframe point.
ffmpeg (2D push-in on a flat render, upscale first to avoid zoompan jitter):
`scale=4320:-2,zoompan=z='1+0.6*(1-pow(1-min(on/30,1),3))':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=1:s=1080x1920:fps=30`

## 2. Easing & timing cheat-sheet
- ease-out cubic `1-(1-t)^3` — push-ins, text landing, card arrivals (default).
- ease-in-out cubic — long camera moves ≥1 s.
- ease-out back (s=1.7, overshoot ~10 %) — pop-ins, letter pops, pull-back roll settle (blender:02, kinetic:05).
- ease-in cubic — the last 4–8 frames before a whip/zoom-through cut.
- linear — orbits, tunnels, loops.
- Durations: text pop 6–8 f · letter stagger 0.25 s (7–8 f) · word slam 4–6 f · camera move 24–45 f · hold 15–30 f · shot 36–60 f (1.2–2.0 s).

## 3. Materials (Blender 4.2 Principled BSDF; all (guess) from frames)
| look | Base Color | Rough | Metal | Coat | other | seen in |
|---|---|---|---|---|---|---|
| glossy white plastic (AirPods) | #f2f2f2 | 0.18 | 0 | 0.3 / rough 0.05 | — | blender:02 |
| candy keycap / pastel plastic | #d3c8c6 or #a29ab5 | 0.25 | 0 | 0.5 / 0.1 | — | blender:09 |
| inflated balloon letters | #5ad15a (green) / #ff3b5c (red) | 0.10 | 0 | 1.0 / 0.03 | Subsurface 0.1, deep bevel | kinetic:05 |
| retro extruded type | face #d6bbb3, sides #76202c | 0.45 | 0 | 0 | separate material on extrude sides | kinetic:06 |
| chrome | #e6e6e6 | 0.06 | 1.0 | 0 | needs bright area cards/HDRI to reflect | (generic AE/C4D look; not dominant in pins) |
| frosted glass | tint #9aa8d6 | 0.12 | 0 | 0 | Transmission 1.0, IOR 1.45 | saas:01 |
| jelly / gummy | #d6482f / #e4865a | 0.15 | 0 | 0.4 / 0.05 | Transmission 0.5, Subsurface 0.6 | blender:14, blender:15 |
| matte clay | pastel (#d9c7ad, #c2af99) | 0.70 | 0 | 0 | Specular IOR Level 0.3 | blender:11 |
| concrete / stone type | #b9b4ad | 0.85 | 0 | 0 | noise texture → bump 0.2 | kinetic:11 |
| UI screen | image texture | — | — | — | Emission strength 1.0–1.5 on the screen face, dark glossy bezel #111 rough 0.2 | saas:05, saas:13 |

## 4. Lighting
- **Studio cyc (default)**: seamless curved floor+wall, same colour as world background. Key = area 2×2 m, 45° front-left, 40° up, white 5500–6000 K; Fill = area 30 % of key, opposite side; Rim = area behind/above, 150 % of key. AO/contact shadow on. Soft shadows only. (blender:02/08/03)
- **Dark tech**: world #14121a, rim light violet #8b5cf6 (guess) behind the screen + neon edge glow; key low and soft; bloom/glow on. (saas:05)
- **Pastel float**: bright, low contrast, world #c4e0f7, big soft overhead area, drop shadows on cards only. (saas:12)
- **Black studio**: world #000, single key + strong rim to carve the product edge. (blender:12)
- HDRI only for chrome/glass reflections (low-strength studio HDRI); the pins read as studio boxes, not outdoor HDRIs.
- No GPU on our box: Cycles 16–32 samples + OpenImageDenoise, or EEVEE if headless works.

## 5. Colour palettes (hexes sampled from frames)
| name | hexes | use | seen in |
|---|---|---|---|
| Studio grey | #c4c3c6 #d0cfd2 #8f8f91 | white product hero | blender:02 |
| Lilac keycap | #a29ab5 #594e6c #d3c8c6 #e8e5e3 | soft 3D UI/product | blender:09 |
| Warm beige | #aaa095 #c1b8b0 #625241 #efe2da | lifestyle/coffee | blender:10 |
| Gummy coral | #d6482f #e4865a #f0d5ce #e9ba97 | playful product | blender:14 |
| Dark violet tech | #14121a #29233e #5b4b71 #0b0a13 | SaaS dark mode | saas:05 |
| Pastel sky | #8ec9f8 #61a8e9 #c4e0f7 #76b5ee (+ pink #f29ec6) | SaaS light/agency | saas:12, saas:04 |
| Glass grey-blue | #36343b #c2c0c8 #8485a1 #54515d | brand/glass | saas:01 |
| Lavender UI | #d1cce8 #dfdbeb #8565db #ab9be1 | clean UI explainer | saas:03 |
| Cinematic teal-black | #0c151a #001013 #1e272b #43514f | dark promo/edit | ae:01, reel:03 |
| Acid lime text | #cdfe74 #e6f69c | loud text promo | ae:02 |
| Sky + candy | #2b8edc #4698dd #d8c8df | balloon type | kinetic:05 |
| Retro red | #fb253a #c75969 #76202c #d6bbb3 | slam type | kinetic:06 |
| Hormozi grey | #6e6c6c #3c3738 #999898 + 1 accent | talking-head edit | reel:05 |
| Framed TH cream | #f8f8f8 #553028 #d3ad7e + orange blob | framed talking head | reel:01, reel:09 |
Rule: 1 background tone + 1 product/brand hue + white. Max 3 hues per frame. Lift blacks (~#14121a / #282728) unless the look is a deliberate black studio.

## 6. 3D text styles
| style | extrude (depth/cap height) | bevel | motion | seen in |
|---|---|---|---|---|
| Inflated balloon | 0.20 | 0.35–0.45 of stroke, 6–8 segments (round) | per-letter pop 0→115→100 % every 0.25 s, hold word 1.0–1.5 s | kinetic:05 |
| Retro slam | 0.25, darker side colour | small 0.02 | word every 2–4 f in a burst, 155→100 % over 4–6 f | kinetic:06 |
| Stacked rows | 0.15 | 0.03 | 6–7 pastel rows, sine wave offset per row | kinetic:15 |
| Engraved stone | 0.05 (letters cut into a ribbon) | 0.01 | slow twist | kinetic:11 |
| Text on sphere/cylinder | 0.02 (or texture) | — | spin 5–8°/s | kinetic:10, kinetic:07 |
| Tunnel rings | 0 (flat type on rings) | — | −18 %/s scale + 8°/s roll loop | kinetic:03 |
| Squash/stretch condensed | 0 / small | — | one word to 140–160 % height in 6–10 f, neighbours compress | kinetic:16 |
| Small clean label | flat | — | fade/slide 8 f, ≤4 words, bottom-left | saas:01 |
bpy: `bpy.ops.object.text_add()`; `t.data.extrude=…; t.data.bevel_depth=…; t.data.bevel_resolution=6`; per-letter animation = convert to mesh + separate by loose parts, or one text object per letter.

## 7. Transitions (frame counts @30 fps)
| transition | frames | how (ffmpeg / Blender) | seen in |
|---|---|---|---|
| Whip pan | 2–4 f blurred each side of the cut | translate 12–20 % width/frame + `dblur=angle=0:radius=40` on those frames | ae:09 (2 f, 3 f), ae:14 (4/3/2 f) |
| Flash cut | 2–4 f white (or black) on the cut | `geq`/`color` overlay with `blend=all_mode=screen`, or `eq=brightness=0.6` on frames | ae:02 (4 f every 1.00 s), reel:05 (1–2 f, +90…+160 luma) |
| Flicker cluster | 1–2 f luma spikes ×2–3 around a cut | `eq=brightness` keyed per frame | ae:14, reel:03 (before the drop) |
| Zoom-through | 24–30 f | scale +30 % + −20…−25° roll + zoom blur, cut at peak | saas:05, ae:01 |
| Zoom-blur passage | 15–60 f | radial blur + 100→130 % into next scene | ae:01, ae:04 |
| Shape / blob / brush wipe | 12–20 f | animated mask (circle/blob/brush alpha) grows to full frame, ease-in-out; `overlay` with `alphamerge` | ae:05, ae:13 |
| Micro-cut burst | 3–4 cuts, 3–6 f apart | plain cuts on a drop | ae:03 |
| Light leak | 15–20 f per burst, bursts in pairs ~0.6 s apart | warm red→orange gradient (#ff3b00→#ffb000) screen-blended | reel:14 |
| Text out of blur | 10–20 f | gaussian blur 20 px→0 + scale 110→100 %, ease-out | reel:05 |
| Speed ramp | 8–12 f ramp in, 8–12 f out | `setpts` piecewise (e.g. 1.0→0.25 PTS), or Blender time remap; whoosh on the fast part | (common in ae:01 edits; (guess) on frame counts) |
| RGB split / glitch | 2–6 f | `rgbashift=rh=-8:bh=8` (+ `noise=alls=20`) on the cut frames | (seen as accent in ae:03, kinetic:01) |
Rule: transitions are punctuation — 6–11 per 30 s, the rest plain cuts or continuous camera.

## 8. Effects
- Glow/bloom (dark tech, neon): `split[a][b];[b]gblur=sigma=25[g];[a][g]blend=all_mode=screen:all_opacity=0.45`. Blender: compositor Glare node (Fog Glow, threshold 0.8, size 8) or EEVEE bloom.
- Motion blur: Blender render motion blur on (shutter 0.5) for every camera move and whip — the pins' whip frames are real blur, not crossfades.
- Depth of field: f/2.8–4 focused on the hero, background cyc soft (blender:02/09; saas:12 cards at different Z).
- Grain: `noise=alls=6:allf=t` (subtle; dark cinematic edits up to 10).
- Vignette: `vignette=PI/5` for cinematic edits; none on bright studio looks.
- Chromatic aberration / RGB split: only on cuts (2–6 f), `rgbashift=rh=-6:bh=6`.
- Overlays: sparks/embers or film dust at 20–40 % opacity, screen blend, for dark edits (reel:04, reel:07).
- Low-contrast grade for studio 3D; teal-black + warm skin for cinematic edits.

## 9. SFX placement
| visual event | sound | timing | layers |
|---|---|---|---|
| cut / whip / zoom-through | whoosh 0.3–0.6 s | starts 3–5 f BEFORE the cut, peak on the cut | whoosh + sub hit |
| object lands / text slam | low hit/boom + click | on contact frame; tail ≤0.5 s | hit + click + (riser end) |
| letter/word pop, card pop-in | bubble pop / soft click | on frame 1 of the scale-in | single |
| UI click / checkmark | click, "ding", check-mark | on the press frame | click + ding |
| typing / UI foley | key clicks, mechanical ticks | per action, ≤4 hits/s, each ≤0.2 s | 2–3 foley layers |
| reveal / title | riser 1–2 s | riser ends exactly on reveal frame, then hit | riser + hit + reverb tail |
| joke / pause | crickets, "huh?", downer, record scratch | over the held frame after the line | single, with 0.5–1 s space |
| scene start | ambience bed | constant-power crossfade 6–12 f | bed at −30…−24 dB under voice |
Measured: SFX hits land 0.05–0.30 s after the visual cut (sfx:01 +0.08/+0.30; sfx:02 +0.12/+0.29/+0.20); in music edits cuts sit within −0.17…+0.11 s of an onset (blender:04, ae:16).
Density (hits/s): narrative 1.0–1.7 (sfx:01/02) · product promo 2.4–2.9 (blender:02/04/14) · AE/edit promos 2.7–3.9 (ae:01–05) · foley montage ≤4.1 (sfx:03) · tunnel/glitch type 4.1–4.5 (kinetic:01/02).
Layering: 3–6 SFX tracks (sfx:01 shows 12 audio tracks in Premiere). Keep LRA 7–12 LU for story edits; ≤3 LU for music-led text reels (sfx:13 = 1.3 LU).
Loudness: every pin masters at −13.3…−15.4 LUFS (outlier kinetic:01 at −9.3). Target −14 LUFS integrated, limiter −1 dBTP (several pins clip at +0.3…+3.1 dBTP — don't copy).
Music ducking (standard practice, not measured in pins): music bed −18…−22 LUFS under voice; `sidechaincompress=threshold=0.03:ratio=8:attack=20:release=300` (≈ −8…−12 dB gain reduction while voice speaks).
Pack names worth matching from our licensed library (shown in sfx:04/06/10): whoosh/blade swoosh, pop/bubble, ding, check mark, notification, boxing bell, whistle slide, crickets, "huh?", audience cheer, record scratch.

## 10. Pacing
- Music onsets on these pins: median gap 0.21–0.35 s (≈ 1/8 notes at 86–143 BPM); pick a 120 BPM track → beat 0.5 s (15 f), 1/8 = 7.5 f.
- Shot length: product/brand 3D 1.2–2.0 s (36–60 f; saas:01 is a metronome 2.0 s), montage bursts 0.43–0.6 s (13–18 f, saas:09), slam type 2–3 f per word.
- Edit density per 30 s: 3D product 2–11 cuts · AE promo 10–21 cuts · framed talking head 0 hard cuts (the card stays, captions/stickers change on every beat, reel:01/09).
- Structure seen in edits: slow intro 8–10 s → flicker cluster → beat-cut section (reel:03); 3D promos: hook move in 0.3 s → 4–6 shots of 1.5–2 s → hero/logo hold 1–2 s.
- Flash/effect cadence: 1 effect per beat at 60 BPM for loud text promos (ae:02, every 1.00 s); every 0.5 s on the framed talking head (our ref 3).

## 11. Recipes for the ref-2 SaaS hero (put together)
1. 0.0–0.3 s: open on the tilted laptop/screen (yaw 30°, pitch 12°) already moving — orbit 5°/s. Whoosh + sub hit on frame 0.
2. Each feature shot 1.5–2.0 s: camera glides to a UI point with push-in 100→150 % over 0.8 s ease-out cubic, hold 0.5 s, cursor click (click+ding on the press frame).
3. Between features: zoom-through (+30 %, −22° roll, 24 f, motion blur) or 3-frame whip; whoosh starts 4 f before.
4. Glossy inflated 3D title words between shots: per-letter pop every 0.25 s with back overshoot, pop SFX per letter (≤4/s), word holds 1.0 s.
5. Palette: dark violet (#14121a/#29233e/#5b4b71 + violet rim) OR pastel sky — one per video. Glow on UI highlights, grain 6, motion blur on.
6. Audio: 120 BPM bed ducked under voice, −14 LUFS, −1 dBTP, 2–3 SFX hits/s.

## 12. Top 12 pins to study
1. https://www.pinterest.com/pin/3940718419920753/ — AirPods: pull-back + roll that overshoots and settles, grey cyc, 0 cuts (blender:02)
2. https://www.pinterest.com/pin/127578601938401996/ — Particles/gummies: ease-in-out push-in 100→250 %, then 1.2–1.4 s cuts (blender:14)
3. https://www.pinterest.com/pin/127578601938525446/ — Fluid: product-film cutting on the beat (blender:04)
4. https://www.pinterest.com/pin/774124930781997/ — Sellix: tilted laptop orbit + zoom-through into UI, dark violet (saas:05) ← closest to ref 2
5. https://www.pinterest.com/pin/688769336769270909/ — Acuity: floating UI slabs, push-in then snap-out, pastel sky (saas:12)
6. https://www.pinterest.com/pin/127578601939225224/ — Glass: frosted glass objects, metronome 2.0 s shots (saas:01)
7. https://www.pinterest.com/pin/924645367271311940/ — Olive Young: inflated glossy letters popping per letter (kinetic:05)
8. https://www.pinterest.com/pin/636766834850915635/ — "Show up for yourself": retro extruded word slam on a sunburst (kinetic:06)
9. https://www.pinterest.com/pin/877005727506486694/ — Whip transition tutorial (2–3 blurred frames) (ae:09)
10. https://www.pinterest.com/pin/756604806201382827/ — 200+ shape transitions (blob/shape wipes) (ae:05)
11. https://www.pinterest.com/pin/1027454102536837052/ — "The magic of sound effects": 12-track SFX timeline (sfx:01)
12. https://www.pinterest.com/pin/1147643917677607792/ — Hormozi editing breakdown: flash cuts, text out of blur (reel:05)
Also: framed talking head template https://www.pinterest.com/pin/671599363236283537/ (reel:01) for ref 3.
Clips of these 12 are kept in their topic's vids/ folder (others deleted for disk; strips + frames + measure.json remain).


---

## v4 additions (Nov 3) — 6 new topics for Sujon's 5 reference reels
Signed in, read only, 16 pins per topic (8 for glossy UI cards), 4 clips per topic measured with analyze_ref.py (measure/NN/style.json). Full recipes + pin links in each topic's STYLE.md; one-line list in research/pinterest_v4_topics.md.

### Soft 3D explainer (→ ref 1) — references/soft_3d_explainer_animation/
- Never cut: 0–1 hard cuts in 30 s; change scenes by gliding the camera 20–40 % of width (ease-in-out cubic, 0.8–1.2 s) while objects pop in.
- Pop-in 0→110→100 % in 9 frames @30 fps + pop sfx on frame 1; then float sine ±3 % height, 2.5 s period, phase-offset.
- Palettes measured: pastel UI #926bdf / #87abee / #2c40a6 / #efe2df / #f2aea0; studio grey #c2c2c4–#d2d2d4; warm clay #ccbdb2 / #a69e96 / #e3d1c8.
- Clay roughness 0.55–0.7 for characters, glossy plastic 0.2 for icons/phones; DOF f/1.8–2.8 on the hero. Sound 1–2 onsets/s, −15 LUFS on Pinterest → master −14.

### SaaS promo (→ refs 2, 5) — references/saas_promo_video_after_effects/
- Hook: 2–4 bold-sans words ≤3 s, then product. Screenshot on a rounded card (radius 3–4 %), Y-tilt 8–15°, top-edge rim glow.
- Brand-promo cut curve (WizArt, measured): shots 6.9 / 6.1 / 3.5 / 3.2 / 1.5 / 1.1 / 1.1 s → accelerate into the CTA, flash frame on the last cuts.
- UI-scroll pieces: 0 cuts, slow scroll 3–6 % of height/s, light sweep every 2–3 s, 24–34 % still frames. Palettes: #4f00af purple + #fdfdfd; #09160c near-black + #ddcdf3 lilac.

### Before / after showcase (→ ref 4) — references/before_after_video_editing_showcase/
- Side-by-side overlapping 9:16 cards on 720×1280: Before x87–287 y470–811; After x274–645 y298–955 (scale ×1.5 for 1080 wide). Radius ~4 %, shadow blur ~30 px 25 %.
- Backgrounds: #f9f9f9 + two #fea101 blobs, or the clip blurred (sigma 40) at 30 % brightness. Optional editing-timeline screenshot as proof.
- After card changes something every 1–2 s; Before stays dull. −14.3…−14.6 LUFS.

### Talking-head reel editing (→ ref 3) — references/talking_head_reel_editing/
- Continuous take, B-roll inserted inside the frame every 2–3 s (B&W/desaturated so the speaker is the only warm colour).
- Small word-by-word captions low-centre + 1 emphasis word in italic serif; for lists, alternate speaker ↔ white text card (black words + 1 red word + icon) every ~2 s (RivoZen: cuts at 1.7/3.7/6.8/9.3/11.3 s).
- Calmer than ref 3: 1.6–2.0 onsets/s. Ref 3 = the hyper version (~2 events/s).

### 3D glossy UI cards (→ ref 5, ref 2 end card) — references/3d_glossy_ui_cards_motion/
- Glass over solid: frosted card (transmission 0.9, roughness 0.05, IOR 1.45, white→lilac) 8–12 % in front of a solid card. Dark variant: metal cards (metallic 1, roughness 0.3, #2b2633) on #000.
- Move fast, hold long: 0.4 s ease-out (cubic-bezier .2,.8,.2,1) then ~1 s hold with only a specular sheen moving. 0 cuts; 5–7 s seamless loops. Cursor tilt 8–10°, click pulse 100→96→100 % in 6 frames.

### Kinetic typography (→ captions of refs 1–3) — references/kinetic_typography_reels/
- Two faces: heavy grotesk + italic serif for the 1 emphasis word (1.5–2.5× size). 3-colour systems: red #bb0000 / white / black; cream #cabcad / blue / red; cream on green #73805a.
- Video inside letters (track matte), then scale the word 100→800 % in 0.5 s (ease-in expo) to reveal the next shot.
- Page flip every 2–3 s with 2-frame double cuts on strong beats; each word slides 40–80 px over 6–8 frames or pops 0→105→100 %, landing on an onset ±2 frames.
