---
name: reference-to-video
description: (v5: EffectCraft text+effects, Pinterest first, gradient captions, no glow, QC gate) Turn ANY reference reel (Instagram, TikTok, YouTube, Pinterest pin, file) or any topic into a video with real 3D (Blender), code (Python + ffmpeg) and EffectCraft (free After Effects alternative) — measure the reference, pick the closest of 6 proven recipes, build, QA. Includes Sujon's 6 reference breakdowns, the "which tool for which job" table, ready prompts for an AI agent, and an edit-your-raw-footage workflow.
when_to_use: "make a video like this reel", "copy this style", "recreate this edit", "use this reference", "edit my raw clip", "soft 3D explainer", "SaaS promo", "talking head edit", "original vs edited", "timeline reveal", any short vertical video from a reference
license: MIT (text + code)
version: 5.0.0
---

# Reference → video (Zyqor Motion Kit v5)

## v5 HARD RULES (Sujon, Nov 3 2026, 6:49-6:58 PM IST, after the face-lock v2 reel: "faltu" … "strictly laga")
These override anything older in this skill. `kit/qc_v5.py` fails a render that breaks one; a failed render is never sent.
1. **Pinterest FIRST, for everything.** At edit time take references, effects/overlays, textures/backgrounds, caption styles, gradients and sfx-pack pointers from Pinterest before building (*"edit ke time sab kuch pehle Pinterest se lo"*). Pins usually link to the real asset page (Envato, Motion Array, Patreon, Canva, "comment SFX" posts): download only free/licensed files, note the licence, keep third-party video/audio out of the repo (links only).
2. **Text and effects in EffectCraft, not Blender.** Captions, titles, kinetic type, glow, transitions and grade come from `kit/templates/ec_kinetic_v5/zq_lib.jsx` through `kit/ec_reel.py`. Blender is only for a real 3D object the story needs, rendered as a transparent plate. (v2's Blender 3D "SAVE" and grey tiles read as stock 3D — the main reason it looked cheap.)
3. **Glow OFF by default.** Max one subtle glow per scene on one focal object, never on captions, cards, backgrounds or an adjustment layer.
4. **Caption colour system.** Base text = ink #141414 on light, or off-white #FAF7F2 + soft warm shadow on footage; the key word in ONE curated **gradient** preset (`kit/zq_config.json`: ember #FFB34D→#FF5A1F (brand default), sunset_rose, clay, peach_coral, lime_teal, cream_gold, sage_mint, ink). One highlight style per video. 1-4 words per line, voice-synced.
5. **No AI look.** Purple/blue/cyan neon, glow-on-black and stock "AI" gradients/templates are banned (QC samples frames: >6 % of a frame in hue 185-300° at saturation ≥0.45 = FAIL).
6. **Premium backgrounds.** Warm paper (fibre noise, soft radial light), studio sweep with floor shadow, photographic plate, or footage — with grain. Never a flat dark fill.
7. **Premium sfx, licensed.** Pop on cards, click on cursor taps, soft whoosh + sub hit on real transitions, riser into the payoff; 1-3 hits per second, never the same sound twice within 0.12 s. (Replaces the old "no whooshes" rule.)
8. **Model edit = ref 8** (https://www.instagram.com/reel/DfR63QgTvNj/, Sanidhya): 1-3 word captions with a coloured key word and a serif/script accent, pop-up cards with hand-cursor taps, phone mockup with a real screen recording, speaker cut-out on a clean set, glitch/zoom-blur transitions, warm light leak, natural grade.

## v5 default pipeline
```
cd kit
python3 make_video.py "<topic>" --voice vo.mp3 [--lang hi]      # 4 Pinterest searches -> analyze_ref -> projects_v5/<slug>/shots.json
python3 ec_reel.py projects_v5/<slug>/shots.json --frames-only 1,3,5   # look at stills first
python3 ec_reel.py projects_v5/<slug>/shots.json --out reel.mp4        # EffectCraft render + sfx cues + mix + qc_v5.py
python3 qc_v5.py --jsx old_comp.jsx                                     # audit an old comp (the v4 hero fails: 2 glows, #38c8ff)
```
`shots.json`: shots (a, b, bg paper|studio|{plate}), cards (file, x, y, t, rot, scale), cursor (path, taps), captions (y, end, tokens {w, t, s: b|r|i|g|m}), titles, out (zoom|whip|glitch). Measured on the box (Nov 3): the 8 s demo builds 50 layers and renders 246 frames in ~47 s on 16 CPU threads; QC PASS (0 glow, 0 % banned colour, -14.0 LUFS, -2.2 dBTP). Recipe for the ref 8 style: [`recipes/07_ref8_creator_caption_edit.md`](recipes/07_ref8_creator_caption_edit.md).

---
*Everything below is the v4 text, kept for the 6 recipes; where it says Blender for type or glow on the world, the v5 rules above win.*

## v5 field notes: face-lock reel v3 (Nov 3 2026, first full reel on the v5 pipeline, QC PASS)
What made it look premium, and the traps found on the way. Apply these on every v5 reel.
- **Real UI, not a drawn mockup.** Phone/app screens are a code-built screen recording: an HTML/CSS `render(state)` page
  rendered once per frame in headless Chromium at 3x (1242x2604 RGBA WebP, phone frame included), imported into EffectCraft as
  ONE image sequence (`ImportOptions.sequence=true`, then `layer.startTime` = time of frame 1). Keyboard with key pop-ups, upload
  progress ring, typing synced to the VO word times, send, "Creating image" shimmer, blur-to-sharp image reveal. Template:
  `kit/templates/ui_screen_v5/`. Brand names as text only, never a logo.
- **Zoom the phone for reading, keep captions clear of it.** Normal: scale 56 %, centre y 1080 (phone top ~350, captions at y 270).
  Typing: scale 74-80 % and push the phone DOWN (top stays ~345) so the composer sits near y 1360 and the keyboard runs off the
  bottom. Pushing it up instead puts the captions on top of the app header (looked broken on the first test).
- **Aim taps from measured rects.** The engine returns each element's rect per frame; comp = phonePos + (css*3 - anchor) * scale.
  Hold the phone still (equal keyframes) at every tap so the cursor lands exactly on "+", the photo, the send button.
- **Editorial cards, not simple figures.** Taped polaroid-style photo prints (paper grain, mono file name, colour tag pill),
  hand-drawn doodle circle revealed with Radial Wipe, coral "wrong" chips and sage "right" chips, a cream sticky note with a
  serif-italic line. Faces: Open Peeps (CC0) via DiceBear: same seed/features for "reference" and "fixed", change face +
  facial hair + skin for the "AI changed the face" result. No real person.
- **Pop-up chips give typing scenes rhythm.** While the prompt types, chips pop next to the phone on the keywords
  ("SAME chehra / skin tone / facial features", "BADLO kapde / background"): ref8-style cards, one every ~0.4-0.6 s.
- **No blank frames at cuts.** Cards pop from scale 0, so a card that starts AT the cut leaves 3-5 near-empty frames. Start the
  next shot's first card 0.1-0.2 s BEFORE the cut (it pops under the zoom/glitch blur), give outgoing cards `stay` (no shrink-out)
  so the blur has content, and start the very first card at t = -0.25 s so frame 0 already has the hero card (IG thumbnail).
  Check: frame std-dev scan + a contact sheet of every transition frame.
- **Gradient contrast:** on paper backgrounds use `clay` (or ember) for keywords; `sunset_rose`'s light amber end washes out on
  #F1ECE3. sunset_rose is fine on the studio grey. Accent green `sage_mint` for "correct/save" words.
- **Sfx density:** the cue de-clutter keeps at most 2 sounds per 0.12 s, so a "ding" right after a tap + pop gets dropped:
  move it 0.2 s later. Mute a card's pop with `"sfx":"none"` when a caption keyword pops at the same moment. Add a low `bass`
  under glitch and whip cuts too (zoom has it built in). Riser lands on the cut into the CTA (its lead = its length).
- **WhatsApp size:** final under 15 MB = 2-pass x264 `-b:v 3900k -maxrate 6000k -tune grain` from the EffectCraft master +
  mix.wav (13.5 MB for 26.4 s), not a re-encode of the CRF 19 mux.
- **Kit bug fixed (zq_lib.jsx):** EffectCraft 0.19 has no "ADBE Rotation"; 2D rotation is `"ADBE Rotate Z"`. `setv` silently
  skipped the missing property, so every card's rotation and spin-in was ignored in the v5 demo. Also `comp.layer("name")`
  throws; look layers up by looping `comp.layer(i).name`.

# Reference → video (Zyqor Motion Kit v4)

Sujon's rule (Nov 3 2026): use the tool that does each job best — *"jo blender par sahi rahega o blender, jo code par sahi rahega o code, jo EffectCraft par sahi rahega o oha"* — and the kit must let **any** AI agent make and edit videos, not only Tab.

## The 6 references (breakdowns in `docs/motion-references/`)
1. **Faceless soft-3D explainer** — https://www.instagram.com/reel/DfJvupgpmeq/ (Deepak Kumar (@d2epak_)) → [`docs/motion-references/ref1_soft3d_explainer_DfJvupgpmeq/`](../../docs/motion-references/ref1_soft3d_explainer_DfJvupgpmeq/README.md) · recipe [`recipes/01_soft3d_explainer.md`](recipes/01_soft3d_explainer.md)
2. **SaaS promo: tilted 3D screen + glossy 3D type** — https://www.instagram.com/reel/DfPSHbysI7k/ (Raieum | Editor (@raieum.edit)) → [`docs/motion-references/ref2_saas_plugin_promo_DfPSHbysI7k/`](../../docs/motion-references/ref2_saas_plugin_promo_DfPSHbysI7k/README.md) · recipe [`recipes/02_saas_tilted_screen.md`](recipes/02_saas_tilted_screen.md)
3. **Talking head in a framed card, effect every 0.5 s** — https://www.instagram.com/reel/DfNHu7UzIc2/ (Sanidhya | Tech Mentor | Editor (@sanidhyadecodes)) → [`docs/motion-references/ref3_talking_head_sfx_DfNHu7UzIc2/`](../../docs/motion-references/ref3_talking_head_sfx_DfNHu7UzIc2/README.md) · recipe [`recipes/03_talking_head_framed_card.md`](recipes/03_talking_head_framed_card.md)
4. **"Original vs Edited" editor showcase** — https://www.instagram.com/reel/DfRKIG-B6FV/ (Crafoo (@crafoo9)) → [`docs/motion-references/ref4_original_vs_edited_DfRKIG-B6FV/`](../../docs/motion-references/ref4_original_vs_edited_DfRKIG-B6FV/README.md) · recipe [`recipes/04_original_vs_edited.md`](recipes/04_original_vs_edited.md)
5. **After Effects SaaS card promo** — https://www.instagram.com/reel/DfRNLU3N22c/ (Jekay Valiente (@jekyiesz) — a recreation of a tutorial by @madebyveduboi) → [`docs/motion-references/ref5_ae_saas_cards_DfRNLU3N22c/`](../../docs/motion-references/ref5_ae_saas_cards_DfRNLU3N22c/README.md) · recipe [`recipes/05_saas_card_grid.md`](recipes/05_saas_card_grid.md)
6. **Gaming "Editing Timeline" reveal** — https://www.instagram.com/reel/DfRIa9ziZIy/ (Deep (@dplayz_official16)) → [`docs/motion-references/ref6_gaming_timeline_reveal_DfRIa9ziZIy/`](../../docs/motion-references/ref6_gaming_timeline_reveal_DfRIa9ziZIy/README.md) · recipe [`recipes/06_gaming_timeline_reveal.md`](recipes/06_gaming_timeline_reveal.md)

Copyright: those reels belong to their creators — this repo holds links, our analysis, numbers and small study stills only. No third-party video or audio.

## Which tool for which job (master table)

Rule: real 3D → **Blender**. Anything from data, timing, sound or export → **code**. After-Effects-style effects and the final composite → **EffectCraft**.

| Task | Best tool | Why | Command / template |
|---|---|---|---|
| Glossy extruded 3D text | ~~Blender~~ **EffectCraft (v5)** | v5: kinetic title with gradient preset; Blender type is retired | `zq_lib.jsx title()` (v4: `blender/text3d.py`) |
| Device/screen tilted in 3D | Blender | real thickness, shadow, camera | `blender/screen3d.py, hero_v4.py` |
| Camera zoom to a UI click | Blender | camera aims at the exact pixel | `screen_timeline.json + hero_v4.py` |
| 3D icons, coins, mascot tile | Blender | transparent loops to reuse | `sprites_v4.py` |
| Soft-3D floating world, DOF | Blender | soft light, real depth blur | `blender/softworld.py` |
| Materials + lighting | Blender | physically based | `blender/mk3d.py` |
| Cut pauses / jump cuts | Code (Python + ffmpeg) | exact, from word timings | `cut_pauses.py` |
| Clean voice | Code (ffmpeg) | same chain every time | `clean_voice.sh` |
| Word timings + captions | Code (faster-whisper + PIL) | data-driven, no typing | `transcribe_words.py, build_ref3.py` |
| Count-ups, pills, comment box | Code (PIL) | text and numbers from data | `build_ref1.py` |
| Site/app screen capture | Code (headless Chrome) | pixel-exact UI states | `capture_dark.js` |
| SFX placement + music duck | Code | event list, repeatable | `sfx_mix.py, master_mix.sh` |
| Loudness master −14 LUFS | Code (ffmpeg) | measured, not by ear | `master_mix.sh` |
| Batch, export, WhatsApp copy | Code (ffmpeg) | one command | `build_all_v4.sh` |
| Measure a reference | Code | numbers + template pick | `analyze_ref.py, make_video.py` |
| Glow, light sweep, light leak | EffectCraft | After-Effects-style effects | `comp_v4.jsx` |
| RGB split, glitch, flash, B&W | EffectCraft | per-frame effects on hits | `build_ref3.py → comp_ref3.jsx` |
| Whip/zoom blur, light streaks | EffectCraft | transitions with motion blur | `comp_v4.jsx, comp_ref5.jsx` |
| Framed card, panels, masks | EffectCraft | layers, mattes, shadows | `build_ref3.py, build_ref4.py` |
| 3D layers + camera (2.5D) | EffectCraft | fast, no re-render of 3D | `comp_ref1.jsx, comp_ref5.jsx` |
| Final composite | EffectCraft | Blender + 2D + video in one comp | `every template` |

## Workflow (any topic, any reference)
The kit turns a reference (a Pinterest video pin, an Instagram/TikTok/YouTube link, or a file) into numbers, picks the closest of our 6 recipes, and writes a plan for your topic. Blender, code and EffectCraft then build it.

## The 4 steps
1. **Get the reference**
   - Link: `python3 make_video.py "your topic" --ref https://www.instagram.com/reel/XXXX/` (yt-dlp downloads it)
   - File: `--ref my_ref.mp4`
   No reference yet: **send the topic (or a Pinterest link) to Tab on WhatsApp** — Tab searches Pinterest and sends back the pins sheet + `STYLE.md` (camera, easing, colours, type, transitions, sfx). Then pass the pin you like with `--ref <pin link>` (yt-dlp downloads video pins). Advanced/optional, on Tab's box only: `python3 make_video.py "your topic"` with no `--ref` runs `pinterest_refs.mjs` (signed-in browser, read-only).
2. **Measure it** — `analyze_ref.py ref.mp4 outdir/` → `style.json` + `strip.jpg`:
   duration, fps, hard cuts and cuts/second, motion (how much moves), still-frame share, flashes, brightness, saturation, 5 palette hexes, face share + size, white-card rows, loudness (LUFS + true peak), sound hits per second → **template** pick.
3. **Pick the recipe** — `style.json` → one of: `soft3d_explainer` (ref 1), `tilted_device_saas` (ref 2), `framed_talking_head` (ref 3), `before_after_showcase` (ref 4), `saas_card_grid` (ref 5), `timeline_reveal_showcase` (ref 6). Force one with `--template`.
4. **Plan + build** — `projects_v4/<topic>/params.json` (palette, beat length, sfx density) + `plan.md` (beats, captions to write, assets to gather, the commands). Add `--render` to run it end to end when the inputs exist: talking head needs `--clip`, before/after needs `--raw` + `--edited`; soft-3D and SaaS need you to edit the captions/beats in the template first.

## Which tool does what
- **Blender (real 3D, Python, headless):** 3D objects, extruded glossy type, the tilted device with the screen as a movie texture, camera moves that zoom to UI clicks, icons/coins/stars as transparent loops.
- **Code (Python + PIL + ffmpeg):** captions word by word, count-up numbers, chapter pills, comment boxes, pause cutting, word timings, the sfx track, the master mix.
- **EffectCraft (free After Effects alternative, headless JSX):** layout in 2.5D/3D layers, camera, depth blur, glow, light sweeps, RGB split, flashes, whip/zoom blur, the final render.

## Honest limits (Nov 3 2026)
- Steps 1–3 run automatically and were tested on all 6 references (each maps to the right template). Step 4 writes the plan; it does not write your story for you.
- The numbers miss style. Always LOOK at `strip.jpg` (or a 1-fps contact sheet) before you build. Example: ref 3 has an effect every 0.5 s but the sound detector reads only ~1 hit/s on the quiet parts.
- A new kind of reference (one that is none of the 6) gets the closest template — you will need to add the new moves by hand in Blender/EffectCraft.
- CPU only here: Blender Cycles ~4 s/frame at 810×1440, ~10 s/frame at 1080×1920. 60 fps doubles that. A GPU PC is much faster.
- Music and sfx: only licensed (Mixkit free licence — see `get_audio.sh`), never the reference's audio.

## QA every render
- 1-fps contact sheet: something new every 0.5–1 s, nothing outside the 90 % title-safe area.
- Side-by-side with the reference (same moments).
- `audio-proof` / loudness: −14 LUFS, ≤ −1 dBTP, no gaps.

## Edit your own raw footage (talking head, any clip)
1. **[Code]** `kit/clean_voice.sh in.mp4 clean.wav` — de-noise, EQ, compress.
2. **[Code]** `kit/transcribe_words.py clean.wav words.json base.en` — word timings (faster-whisper).
3. **[Code]** `kit/cut_pauses.py in.mp4 cut.mp4 --audio clean.wav --words words.json` — cut pauses > 0.4 s, punch-in + flash on cuts.
4. **[Code → EffectCraft]** captions word by word + framed card + effects: `kit/templates/talking_head_v4/run_ref3.sh in.mp4 out.mp4 --keyword SITE` does 1–9 in one go.
5. **[EffectCraft]** colour (grade, B&W beats), glow, RGB split, whip/zoom transitions.
6. **[Code]** `kit/sfx_mix.py events.json sfx.wav DUR` — one sfx per visual event (whoosh on moves, pop on pop-ins, click on UI, hit on big words), ~2–3 per second.
7. **[Code]** `kit/master_mix.sh mix.wav DUR --voice voice.wav --music music/x.mp3 --sfx sfx.wav` — music ducked under voice, −14 LUFS, ≤ −1 dBTP.
8. **[Code — ffmpeg]** export 1080×1920, 30 fps, H.264 CRF 18–21, `+faststart`; a ≤15 MB copy for WhatsApp; IG: under 60 s for Reels reach, captions inside the 90 % safe area.

## Give it to your AI agent
Ready prompts 15–24 are in [`recipes/PROMPTS_v4.md`](recipes/PROMPTS_v4.md). Examples:
- "Using skills/reference-to-video, edit raw.mp4 in the style of reference 3 — run kit/templates/talking_head_v4/run_ref3.sh raw.mp4 out.mp4 --keyword SITE and show me the contact sheet."
- "Read docs/motion-references/ref2_*/README.md and build a 16-second promo for <my site> with recipe 2; render one Blender test still first and tell me the seconds per frame."
- "Here is a new reference <link>: run kit/analyze_ref.py, write a breakdown in the same format as ref 1, tell me which recipe is closest."

## Install
Blender 4.2 LTS, EffectCraft (getartcraft.com/apps/effectcraft), FFmpeg, Python 3.11 (`pip install -r kit/requirements.txt`), Node 20, yt-dlp; `kit/get_audio.sh` for the licensed Mixkit audio; env `BLENDER`, `EFFECTCRAFT_CLI`, `PYTHON` if not on PATH. Binary assets (fonts, stills) are in the zip, listed in `kit/ASSETS_NOT_IN_REPO.md`. Details: `kit/README.md`.

## Honest status (Nov 3 2026)
Proven end to end: the v3 SaaS hero. Built and tested in parts: refs 1–5 recipes (no full v4 renders kept). Ref 6: recipe only. `analyze_ref.py` maps all 6 references to the right template. CPU render: Blender ~4 s/frame at 810×1440, ~10 s/frame at 1080×1920.

Related skills: [video-editing-reels](../video-editing-reels/) · [motion-graphics-blender](../motion-graphics-blender/) · [effectcraft-compositing](../effectcraft-compositing/) · [sound-design](../sound-design/) · [pinterest-reference-research](../pinterest-reference-research/)
