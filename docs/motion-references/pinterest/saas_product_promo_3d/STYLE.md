# STYLE — "saas product promo 3d" (Pinterest, signed in, 2026-11-03)

16 video pins: 3D SaaS/agency promos (05 Sellix web3 UI+3D, 12 Acuity Studios floating UI cards, 13 Zelios AI app-builder demo, 11 EarnEdits SpatialFlow explainer), 3D brand pieces (01 doo "Glass"/Blue Box, 10 Sony Ericsson, 14 Orange, 09 Moolah), Spline/Figma tutorials (06 3D carousel, 02 scroll-lighting), clean UI explainer (03 PING).
Measured on 9 clips (camera = ORB affine @10 fps, cuts = scene>0.3, blur runs = frames <35 % median sharpness). measure.json.

## Shared look
- **Dark-violet tech** (05 Sellix): #14121a / #29233e / #5b4b71 + neon violet glow; UI on a laptop tilted ~25–35° in perspective, purple rim/arc light behind the screen.
- **Pastel float** (12 Acuity): sky #8ec9f8 / #61a8e9 / #c4e0f7, hot pink #f29ec6-ish (04 pink #f29ec6/#dc76a3); UI cards as thick rounded slabs with soft drop shadows floating in space at different depths.
- **Glass + grey studio** (01 Glass): frosted/translucent blue glass cubes (#8485a1, #c2c0c8) on a light grey cyc with one big soft key and long soft shadows; minimal sans type "BLUE BOX™" small, bottom-left.
- **Device-in-context** (13 Zelios): the product UI playing on a real monitor in a warm desk scene (#d7bda3 / #776053 / #0b0a0a), camera static, UI does the motion.
- Lavender explainer UI (03 PING): #d1cce8 / #8565db / #ab9be1 — flat UI, soft shadows, no 3D camera.

## Camera + timing (measured)
- **Slow orbit around a tilted screen** (05): continuous image roll +3.5…+6.3°/s for 8 s with zoom drift ≤±4 %/s and a slow upward pan; then a **zoom-through** transition at 9 s: +30 % zoom with −24° counter-roll in ~1 s into the flat UI.
- **Push-in then snap-out** (12): +22…+25 %/s for 2 s (6–8 s), then −41 % in the next second (a pull-back reveal to the full card layout).
- **2-second metronome cuts** (01 Glass): cuts at 3.03, 4.97, 6.97, 9.00, 11.20 s → **shot = 2.0 s** (60 frames) each, every shot a slow drift (−7…−24 %/s zoom-out, ±2–9°/s roll).
- **Fast cut montage** (09 Moolah): 14 cuts in 7 s → 0.43–0.6 s shots (13–18 frames), black #121212 bg + white #bbb5b6 UI.
- Onsets 2.6–3.7 /s, median gap 0.22–0.35 s on music-led promos.

## Do this (rules)
1. Tilted screen card: laptop/phone at 25–35° yaw and ~10–15° pitch, camera orbits it continuously at 4–6°/s for 6–8 s; never fully static. — 05 https://www.pinterest.com/pin/774124930781997/
2. Zoom-through into the UI: in ~0.8–1.0 s scale +30 % with a −20…−25° counter-roll, motion-blurred, landing on the flat UI view. — 05
3. Floating UI slabs: cards as rounded boxes (radius ~6 % of card width, depth 3–5 % of width), 3–5 layers at different Z, soft shadows, push-in 20–25 %/s for 2 s then pull back 40 % to reveal. — 12 https://www.pinterest.com/pin/688769336769270909/
4. Shot length 2.0 s on brand pieces (exactly 60 frames), each with a slow drift; 0.4–0.6 s shots only in a montage burst. — 01 https://www.pinterest.com/pin/127578601939225224/ , 09 https://www.pinterest.com/pin/933230354041679411/
5. Pick ONE palette family per promo: dark violet (#14121a/#29233e/#5b4b71 + neon #8b5cf6-ish glow) or pastel sky (#8ec9f8/#61a8e9/#c4e0f7) or grey-studio glass (#c2c0c8/#8485a1). — 05, 12, 01
6. Glass material for the "hero" brand object: transmission ~1, roughness 0.05–0.2, tinted blue; long soft shadows. — 01
7. Product-in-context shot: UI playing on a real monitor/desk scene, camera static, the screen content animates. — 13 https://www.pinterest.com/pin/1008595279068679614/
8. Type stays small and clean (sans, white or near-black, bottom-left or centred, ≤ 4 words) — the 3D is the hero. — 01, 03 https://www.pinterest.com/pin/1152077148463396779/
