# STYLE — "3d glossy ui cards motion" (Pinterest, signed in, 2026-11-03, v4 research)

Only **8 video pins** came back for this query (pins.json): Spline (glassy 3D icon), Vova Vindar ("Rove" metal cards), Over Sight Webflow (dark scroll), 60fps ("Binge" gyroscope card), astroospace, P A N T E R (AE poster + glass tutorial), Details.so (liquid cards by @its_sslvr), ilovecreatives.
Measured on 4 clips with `analyze_ref.py` (measure/NN/style.json); all 4 are silent uploads (no audio). Mp4s deleted after measuring.
Maps to **ref 5** (Jekay Valiente AE SaaS cards: glossy 3D UI cards, card-grid scroll, light streaks) and to the end-card / chat-bubble moments of **ref 2**.

## Look
- **Glass + solid stack** (01 Spline): a frosted glass chat bubble (white→lilac gradient, ~60 % opacity, blurred refraction) floating over a solid orange #d5ad8c-ish / #ff8a1f bubble, on a dark grey #3e3e44 floor with a faint grid; a mouse cursor hovers and the stack tilts toward it. Soft contact shadow under the stack.
- **Dark metal cards** (02 Rove): two credit cards in brushed dark purple metal (#433e4c on #000000), thin specular edge highlights, flip and cross in 3D, then settle flat facing camera. 80 % of frames are near-still → the motion is short bursts then holds.
- **Dark web UI scroll** (03): full-page dark site (#000000 / #06080b) with one orange accent (#ff6a00 buttons/glow), sections slide up as cards with an orange rim glow; brightness 0.04.
- **Gyroscope phone card** (04 "Binge" 60fps): white page #fdfdfd, a phone mockup with a poster card that tilts ±8–10° with the (fake) device gyroscope and has a moving specular sheen; 33 % still frames.

## Motion + timing (measured)
- 0 hard cuts in all 4 clips (6.5 / 5.2 / 22.6 / 6.2 s) — this genre is **one-shot loops**, 5–7 s each, built to repeat seamlessly.
- Motion is low (1.8–4.7) with long still stretches (13–80 %): a fast 0.3–0.6 s move, then a 0.8–1.5 s hold with only the light sheen moving.
- Tilt ranges: cards rotate 10–25° on Y and 5–10° on X during a move; the "gyroscope" sheen slides diagonally across the card in ~1 s.

## Do this (rules)
1. Glass over solid: one frosted glass card (white→lilac, roughness 0.05, transmission 0.9, IOR 1.45) layered 8–12 % in front of a solid colour card. — 01 https://www.pinterest.com/pin/816629344969284873/
2. Dark premium: dark metal cards (metallic 1, roughness 0.3, base #2b2633) on pure black; let one rim light draw the edges. — 02 https://www.pinterest.com/pin/845832373800023107/
3. Move fast, hold long: 0.4 s ease-out move (cubic-bezier .2,.8,.2,1), then 1 s hold where only a specular sheen travels across the card. — 02, 04 https://www.pinterest.com/pin/1110770695653147817/
4. Cursor-driven tilt: card tilts 8–10° toward a mouse cursor, cursor click = tiny scale pulse 100→96→100 % in 6 frames. — 01, 04
5. Dark UI scroll with one accent colour (orange #ff6a00) and an orange rim glow on the active card. — 03 https://www.pinterest.com/pin/926052742129752155/
6. Make each beat a 5–7 s seamless loop; join loops with a whip or a card fly-through. — 01–04

## Kit mapping
- Blender: `blender/mk3d.py` / `blender/screen3d.py` for cards (rounded cube + bevel, image texture on the face), Principled glass (Transmission 0.9) for the frosted layer; Cycles CPU low samples + denoise.
- EffectCraft: `templates/saas_cards_v4/build_ref5.py` + `comp_ref5.jsx` (card grid scroll, light streaks, rays, toggle).
- Sound (these pins are silent — design your own): soft click on cursor tap, glass "tink" on card settle, airy whoosh on flips.
