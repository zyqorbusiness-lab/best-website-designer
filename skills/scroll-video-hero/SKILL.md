---
name: scroll-video-hero
description: The scroll-scrubbed video hero at the top of the Zyqor portfolio, as a downloadable skill. The visitor's scroll drives a video frame by frame (a camera flight, a product turning, a fly-through), with copy that rises in at chosen points. Covers getting a clip without AI renders, encoding it so scrubbing is smooth, a desktop and a phone cut of the same shot, a 4 KB vanilla engine, fallbacks and QA.
when_to_use: "make the video at the top move with scroll", "scroll-world style hero", "Apple-style scroll video", "the camera flies in when I scroll", any landing page whose first screen is one strong shot
license: MIT (code and text). The example clip is a render of a CC0 model; see example/*.credit.json.
version: 1.0.0
---

# Scroll video hero

The first screen of [the Zyqor portfolio](https://zyqor-portfolio-v3.sites.tab.bot/) is a camera flight that moves only when you scroll. This skill is that technique on its own, small enough to drop into any site: **one video, its timeline mapped to the scroll position of a tall section, with a sticky frame and copy beats on top.**

Open `example/index.html` (any static server, e.g. `npx serve example`) to see it: a 4-second, 120-frame flight around a real scanned pair of binoculars, a desktop cut and a phone cut, 576 KB and 373 KB.

Credit: the idea and the original multi-scene engine come from **[scroll-world](https://github.com/oso95/scroll-world) by cyw (MIT)**. The portfolio uses an adapted copy of that engine (`site/scrub-engine.js` in this repo, licence kept). `scroll-video.js` here is a short rewrite for a single hero clip.

## 1. Get a clip (no AI renders)

Good scroll clips are one continuous move with no cuts: a dolly-in, an orbit, a fly-through, a product turning. 3 to 6 seconds is plenty; the scroll length decides how long it feels.

- **Your own footage**: a phone on a gimbal, one slow move, locked exposure, 30 or 60 fps.
- **A render of a real model**: a CC0/CC-BY scan (Poly Haven, Sketchfab with a licence you have checked), lit with an HDRI, rendered frame by frame. The example was rendered in three.js in a headless browser: load the model and HDRI, move the camera along an eased path for t = 0..1, call `renderer.render()` and save `canvas.toDataURL()` for each of 120 frames. Blender works the same way.
- **Licensed stock** only if the licence allows web use and editing, and only with a credit file next to the clip.
- Not: AI-generated video. It flickers when scrubbed backwards, details melt between frames, and clients can tell.

Render or cut the shot **twice**: 16:9 (or 3:2) for desktop and 9:16 for phones, with the camera framed for each. A phone should not get a cropped desktop clip; that is where most scroll heroes look cheap.

## 2. Encode it for scrubbing

Seeking to a frame means decoding from the previous keyframe, so keyframes must be close together:

```bash
# desktop, H.264, a keyframe every 4 frames, no audio, fast start
ffmpeg -framerate 30 -i frames/f%04d.jpg -c:v libx264 -pix_fmt yuv420p -preset slow -crf 24 \
  -g 4 -keyint_min 4 -sc_threshold 0 -movflags +faststart -an clip-d.mp4

# optional VP9 copy for browsers without H.264 (some Linux Chromium builds)
ffmpeg -framerate 30 -i frames/f%04d.jpg -c:v libvpx-vp9 -b:v 0 -crf 36 -g 4 -row-mt 1 -an clip-d.webm

# poster = first frame
ffmpeg -i frames/f0000.jpg -q:v 80 poster-d.webp
```

Measured on the example clip (120 frames, 1280x720): `-g 1` (every frame a keyframe) 1,306 KB, `-g 4` 576 KB, `-g 10` 425 KB. `-g 4` scrubs smoothly in Chrome, Safari and Firefox; `-g 10` starts to stutter on fast scrolls backwards. From footage instead of frames, replace the input with `-i shot.mov -vf "scale=1280:-2,fps=30"`.

Budgets that keep the first screen fast: desktop clip under 2 MB, phone clip under 1.2 MB, poster under 60 KB. The clip loads only when the section is near the screen; the poster shows instantly.

## 3. Mount it

```html
<link rel="stylesheet" href="scroll-video.css">
<section class="sv" data-scroll-video data-webm
         data-src-desktop="clip-d.mp4" data-src-phone="clip-m.mp4"
         data-poster-desktop="poster-d.webp" data-poster-phone="poster-m.webp">
  <div class="sv-pin">
    <video muted playsinline preload="none" aria-hidden="true" tabindex="-1"></video>
    <div class="sv-beat" data-at="0" data-len="0.3"><h1>First line</h1></div>
    <div class="sv-beat" data-at="0.5" data-len="0.25"><h2>Second line</h2></div>
    <div class="sv-bar" aria-hidden="true"><i></i></div>
  </div>
</section>
<script type="module" src="scroll-video.js"></script>
```

- `--sv-length` on `.sv` sets the scroll distance (default `420vh`: about four screens of scroll for the whole clip).
- `.sv-beat` `data-at` is where the line appears (0 to 1 of the section), `data-len` how long it stays. Position each beat with your own CSS (`top`, `bottom`, alignment).
- `--sv-fit: contain` when the clip's background matches the page (no crop on any screen); the default `cover` is for full-bleed footage.
- The phone clip is used on portrait or narrow screens (`max-aspect-ratio: 4/5` or `max-width: 700px`), and switches if the phone is rotated.

How the engine stays smooth: scroll only sets a target time; every animation frame the shown time eases toward it, and a new seek is sent only after the previous one finished (`video.seeking` is false). It never queues a backlog of seeks, which is what makes cheap scroll videos stutter. On iOS a muted `playsinline` video is unlocked by `play()` then `pause()` on the first touch, after which seeking works.

## 4. Fallbacks (they are part of the design)

- **Reduced motion, Save-Data, or the clip fails to load**: the section becomes a normal block with the poster image and all beats as plain text, in order. Nothing is hidden.
- **No JavaScript**: the poster is the pin's background, so the first screen still shows the shot.
- The copy is real HTML text over the video, so it is readable, translatable and indexed.

## 5. QA

At 1440x900, 390x844 and 360x740, plus a reduced-motion run:
- 0 console errors (aborted range requests while seeking are normal media behaviour, not errors);
- `video.currentTime` follows the scroll (the example reports 0, 1.18, 2.37, 3.74 s at 0, 30, 60 and 95 % of the section);
- no horizontal overflow; the phone uses the phone clip;
- reduced motion shows the still layout with every beat visible.
The repo's [`qa-harness`](../qa-harness/) skill runs these checks on any page.

## Files

- `scroll-video.js` (4 KB) and `scroll-video.css`: the engine. MIT.
- `example/`: the binoculars demo (clips, posters, credit files, page).

## Credits

- Technique and original engine: [scroll-world](https://github.com/oso95/scroll-world) by cyw, MIT.
- Example model: "Binoculars" by Derek Wight, [Poly Haven](https://polyhaven.com/a/binoculars), CC0 1.0. Lighting: "Studio Small 09" HDRI by Sergej Majboroda, Poly Haven, CC0 1.0. Rendered by Zyqor Studio.
- Fieldglass is a fictional brand made for the example.
