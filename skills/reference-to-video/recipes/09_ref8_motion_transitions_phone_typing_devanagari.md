# Recipe 09 - ref8-style motion: real transitions, phone UI with real typing, Devanagari captions (face-lock v5)

Built Nov 4 2026 for the Hindi face-lock reel v5 (24 s, 1080x1920, 30 fps). Fixes what the v4 audit found: hard cuts, ~6x less motion than ref8,
no overlay-title scramble, no stickers, two paper tones. Everything below is EffectCraft (text + effects) - no Blender.

## 1. Scenes are rigs, transitions are moves (not cuts)
- Build each scene normally, then adopt every layer created since `n0 = comp.numLayers` into a Null: `adopt(n0,"S2",a,b,padIn,padOut)`
  (helpers: `kit/templates/ec_transitions_v5/zq_v5_helpers.jsx`). New layers land on TOP, so layers 1..(numLayers-n0) are the scene's.
- A null at [540,960] scales and rotates about the comp centre, children keep their comp coordinates (frame-tested in 0.19).
- Overlap the two scenes by the transition length: outgoing layers get outPoint = b+padOut, incoming inPoint = a-padIn. Keep the pads SMALL
  (0.04-0.1 s) for spin/zoom/leak: a bg that starts 0.25 s early covers the outgoing scene and you get a dead dark frame.
- Timings measured on ref8 (30 fps source) and used:
  | ref8 | move | v5 |
  |---|---|---|
  | 5.05-5.65 vertical push | out: y 960->-960, scale 100->90; in: y 2880->960, scale 112->100; Directional Blur 110 at the middle; whoosh | 0.5 s window |
  | 23.7-24.4 spin-blur | out: scale 100->165, Rotate Z 0->-16 in 0.33 s; in: scale 150->100, Rotate Z 14->0 in 0.35 s; Radial Blur (Type spin) + CC Radial Fast Blur | swap hidden under the blur |
  | 19.5-19.85 push through the phone | out: scale 105->320 in 0.25 s; in: scale 125->100; CC Radial Fast Blur 90 | zoom-through |
  | 26.55-27.2 light leak | two warm gradient solids (Screen) sliding across + Exposure bump 0.55; leak starts 0.12-0.3 s before the cut | orange->white |
  | 10.3-10.55 glitch | VR Digital Glitch (slice tears, amplitude 60) + 0.2 s warm tint/amber flash. NOT VR Chromatic Aberrations (cyan fringe is banned) | 0.22 s |
- Background change every 2-3 s: a new paper tone wipes in over the old one (Linear Wipe on the base solid). EXTEND the old segment's
  outPoint by the wipe time + 0.15 or the wipe reveals black. v5 used 7 warm tones (cream, peach, sand, espresso, clay, warm grey, butter).
- Constant motion: every rig drifts 5-9 % in scale between transitions plus a small punch (+3 %) wherever the scene would sit still;
  check with the frame-difference profile below.

## 2. Overlay title scramble + stickers (ref8 2.7-3.2 s, 1.1-2.45 s)
- `scramble(text,x,y,a,b,style,{steps:7,dt:0.05})`: 7 text layers with progressively more real characters, last one is the real text with a
  112 % -> 100 % settle. `pop(file,x,y,a,b,scale,rot,{})`: scale 0 -> 118 % -> 96 % -> 100 % in 0.38 s, rotate -18 -> +3 -> 0, idle float.
  `slideCard`: y+1500 -> y-46 -> y in 0.64 s (ref8's card slide-up). Stickers are HTML -> PNG (`make_stickers.js`, no logos, warm colours only).

## 3. Phone UI with real typing (ui_screen_v5)
- `typing_states.py` builds one state per frame from the voice's word times; `frames_pw.js` (playwright-core; puppeteer-core is not on the box)
  writes 1242x2604 RGBA PNGs; identical states are copied, not re-rendered (about 1 min for 140-240 frames).
- Show the PAYOFF long enough: v5's first cut revealed the fixed image under the zoom-through (0.1 s visible). Compress the typing so the
  result + the "same face" tick sit on screen for >= 0.4 s before the transition starts.
- Tap rings: parent a ring to the phone layer, Position = rect centre x3.

## 4. Devanagari captions
- EffectCraft 0.19 shapes Devanagari correctly (conjuncts, nukta, matras checked on all 37 caption lines). Fonts: Hind (SemiBold/Bold, OFL) for
  body, Tiro Devanagari Hindi Italic (OFL) for the accent word. Copy the .ttf to ~/.fonts and use the POSTSCRIPT name in the text document
  (`fc-scan --format '%{postscriptname}\n' file.ttf` -> `Hind-Bold`, `TiroDevaHindi-Italic`). Latin loan words (AI, ChatGPT, Custom Instructions) stay Latin.
- View every caption line as a crop (strip contact sheet) - a wrong glyph shows only there.

## 5. Evidence habit
- Burst frames (9 frames over the transition) of ref8 and of your reel stacked in one image; plus the frame-difference profile:
  `ffmpeg -i v.mp4 -vf scale=108:192,format=gray -f rawvideo -` -> mean |frame[n+1]-frame[n]| per frame. v5 final: mean 4.4, no stretch
  >= 0.45 s below 0.5 (v4: 1.7 with a 2.1 s still; ref8 first 24 s: 8.9). Be honest: v5 reaches about half of ref8's pixel motion.
