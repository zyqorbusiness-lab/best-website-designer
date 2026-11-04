# Zyqor Motion Kit v5.3 — TICK EVERY BOX BEFORE YOU EXPORT

- [ ] **Honesty:** concepts are labelled; no fake clients, reviews, testimonials or results; real faces only with permission.
- [ ] **Pinterest first:** I pulled reference videos, overlays, textures, caption styles, gradients, music, b-roll, subject and sfx for this topic from Pinterest (pins/ lists + pin_download.py); every pin URL I used is logged in assets_log.json.
- [ ] **Reference studied at 60 fps:** breakdowns/<ref> read (or ref_breakdown.py run on a new link) and I looked at the frames; effects, animation, text, colour, background, b-roll noted per second.
- [ ] **Make it unique:** I changed at least 3 things from the reference (palette, transition, text/layout, set, b-roll angle, sound) and wrote them in make_it_ours.
- [ ] The hook moves in the first 0.5 s: a big word, a face or card, or a cursor. No plain first frame.
- [ ] Text and effects are done EffectCraft-style in code (ec_reel.py / zq_lib.jsx). No Blender for text, titles, glow or transitions (Blender = a real 3D object only, as a plate).
- [ ] Captions (ref8 kinetic): 1 to 3 words at a time (max 4 per line), big (>= 90 px), in sync with the voice, inside the 90 % title-safe area (x 108-972, y 192-1690).
- [ ] ONE gradient keyword from the 8 presets + ONE italic serif accent word. Base text ink on light or off-white on footage. No rainbow, no second highlight system.
- [ ] Glow OFF: none, or one subtle glow on one object. Never on captions, cards or backgrounds.
- [ ] No purple, violet, blue/cyan neon, no glow-on-black, no stock "AI" gradient. The QC colour check of the frames passes.
- [ ] The background is premium and textured (paper, studio sweep, photo plate, light leak). Never flat black.
- [ ] Grade: warm and restrained (contrast +14, saturation 94, grain 0.28, light vignette).
- [ ] Every element enters with eased motion and motion blur; nothing sits dead-still for more than about 1 s; no blank frames.
- [ ] Premium sfx: every hit has a reason (card, tap, cut, payoff), 1 to 3 per second at most; Pinterest/licensed source logged. Never re-share a reference's audio.
- [ ] Mix: voice on top, music bed ducked, -14 LUFS, true peak at or under -1 dBTP.
- [ ] Export: 1080x1920, 30 fps, H.264, and a WhatsApp copy <= 16 MB.
- [ ] qc_v5.py says PASS (F1-F13). I watched the whole video once on a phone.
- [ ] No third-party media in any zip or public repo: links + downloader only.
