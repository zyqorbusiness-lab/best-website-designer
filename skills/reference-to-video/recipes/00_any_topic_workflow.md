# Any topic, any reference → a video (the v4 workflow, as it works today)

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
