---
name: pinterest-reference-research
description: Turn Pinterest into a measured style guide before editing. Search a topic, collect the top video pins, extract frames, measure camera moves, cuts, colours, transitions and sound, and write a STYLE.md per topic plus one combined style bible of reproducible recipes.
when_to_use: "find references", "Pinterest research for this edit", "what style should this video have", before any new video format or brand
license: MIT (text). Pins belong to their creators: study them, link them, never re-upload them.
version: 1.0.0
---

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
