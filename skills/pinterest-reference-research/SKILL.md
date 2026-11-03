---
name: pinterest-reference-research
description: Turn Pinterest into a measured style guide before editing. Search a topic, collect the top video pins, extract frames, measure camera moves, cuts, colours, transitions and sound, and write a STYLE.md per topic plus one combined style bible of reproducible recipes.
when_to_use: "find references", "Pinterest research for this edit", "what style should this video have", before any new video format or brand
license: MIT (text). Pins belong to their creators: study them, link them, never re-upload them.
version: 2.0.0
---

## v5: Pinterest FIRST for everything (Sujon, Nov 3 2026, 6:54/6:58 PM: "har ak chis … pinterest par mil jayega", "pdf me vi bol dena")
At edit time, before building anything, search Pinterest for: the topic's reference edits (videos), caption styles, gradient/texture backgrounds, light-leak/grain/film overlays, and sfx packs. Look at every sheet, write TAKE/SKIP + what to copy. **Skip purple/blue/cyan neon pins** — on Nov 3, 5 of 16 "aesthetic gradient background reels" results were exactly that banned AI look. Pins usually point to the real asset page (Envato, Motion Array, Patreon, Canva, Instagram "comment SFX" posts): download only free/licensed files and record the licence; sfx audio lives on the linked site, not on Pinterest. Third-party videos stay as links + analysis. Nov 3 board (5 topics, links + verdicts): `docs/motion-references/PINTEREST_V5_BOARD.md`. qc_v5.py F1 fails a video whose spec lists no Pinterest/reference folder.



# Pinterest reference research

Sujon's rule (Nov 3 2026): every edit starts from references — "pinterest se reference". Looking is not enough; the references are **measured** into numbers an editor (or a script) can copy.

## 1. Collect (read only)
- Search `https://www.pinterest.com/search/pins/?q=<topic>&rs=typed`, Videos filter when available. Signed in gives better results than logged out.
- Take the top 16 video pins: pin URL, title, creator, thumbnail, video URL (pin pages carry HLS `.m3u8` links; `ffmpeg -i <m3u8> -t 30 -c copy clip.mp4`; yt-dlp also opens pin URLs).
- Download at most 4 clips per topic (≤ 720p, ≤ 30 s), extract frames, then delete the clips you don't need. Never save, pin, follow or like from the research account.
- Contact sheet: thumbnails + 6 frames per clip (`ffmpeg -vf "fps=2,scale=240:-1,tile=8x5"`).

## 2. Measure
| what | how |
|---|---|
| cuts / shot length | `ffmpeg -vf "select='gt(scene,0.3)',showinfo" -f null -` |
| camera zoom % and roll ° | ORB feature matches between frames at 10 fps (OpenCV `estimateAffinePartial2D`) → scale and angle per second |
| transition frames | frames whose sharpness (Laplacian variance) drops below 35 % of the clip median = motion-blurred whip/zoom frames; luma jumps > 35/255 = flashes |
| colours | PIL median-cut palette on a frame at 3 s → hexes |
| sound | loudness (LUFS, true peak, LRA) + spectral-flux onsets → hits per second, offset of hits vs cuts |

## 3. Write it down
- `<topic>/STYLE.md`: shared style (layout, camera, easing, materials, lighting, colour, type, transitions, pacing, sfx) and 6–10 "do this" rules, each naming the pins that show it, with numbers.
- `PINTEREST_STYLE_BIBLE.md` (included here, Nov 3 2026, 6 topics × 16 pins): camera moves, easing cheat-sheet, Principled BSDF values for each material look, lighting rigs, palettes, 3D text styles, transitions with frame counts and ffmpeg filters, effects, sfx placement and density, pacing, and the top 12 pins to study.

## 4. Topics already researched
blender 3d motion graphics · after effects transitions · sound design sfx video editing · saas product promo 3d · instagram reel editing effects · kinetic typography 3d · saas product promo motion graphics · instagram reel edit captions transitions.

## 5. Use it
Before the beat plan, pick 3–5 references and copy their numbers into the plan (shot length, zoom %, eases, palette, sfx density). After the render, put our frames next to theirs and list where ours is still cheaper.

## v4 (Nov 3 2026)
- 6 more topics researched to match Sujon's references: soft 3d explainer animation · saas promo video after effects · before after video editing showcase · talking head reel editing · 3d glossy ui cards motion · kinetic typography reels. Recipes appended to [PINTEREST_STYLE_BIBLE.md](PINTEREST_STYLE_BIBLE.md) ("v4 additions"); per-topic STYLE.md + pin links in [`docs/motion-references/pinterest/`](../../docs/motion-references/pinterest/).
- After Pinterest, measure the reference with `analyze_ref.py` and pick a recipe: [reference-to-video](../reference-to-video/SKILL.md). Tutorials we opened for each style: [`RESEARCH_INDEX.md`](../../docs/motion-references/RESEARCH_INDEX.md).
- **Who does this step:** Tab. Sujon (or his agent) sends the topic or a Pinterest link to Tab on WhatsApp; Tab returns the pins sheet + STYLE.md. `pinterest_refs.mjs` is optional/advanced (needs a signed-in browser session on Tab's box). With a pin link in hand, anyone can run `make_video.py --ref <pin link>` (yt-dlp downloads video pins).
