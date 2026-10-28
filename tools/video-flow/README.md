# Video Flow: drop a video, get a scroll site

Video Flow turns one video into a finished scroll-scrubbed landing page. The video can be real footage or your own render of a real 3D model. As the visitor scrolls, the page plays the shot frame by frame on a canvas, and your copy rises in at the scroll positions you choose. It builds a desktop page and a phone page, both inside the Zyqor Lab chrome.

It needs Node 18+ and ffmpeg. There are no npm packages to install.

## 3 steps

1. **Drop a video** into `tools/video-flow/_work/` (git-ignored), or put a `videoUrl` in the config and it downloads itself on the first run.
2. **Copy a config.** Start from `examples/carmine.json`, set the slug, brand, palette, trim and copy beats, and save it as `examples/<slug>.json`.
3. **Run it:**
   ```bash
   node tools/video-flow/build.mjs tools/video-flow/examples/<slug>.json
   ```
   Then open `site/lab/<slug>/` (desktop) and `site/lab/<slug>/m.html` (phone), for example with `npx serve site`.

Add `--dry` first if you want to see the plan (probe, trim, frame counts, output paths) without writing anything.

If you add these scripts to the repo's `package.json`:
```json
"scripts": {
  "video-flow": "node tools/video-flow/build.mjs",
  "video-flow:demos": "node tools/video-flow/build.mjs tools/video-flow/examples/carmine.json && node tools/video-flow/build.mjs tools/video-flow/examples/longway.json && node tools/video-flow/build.mjs tools/video-flow/examples/rise.json"
}
```
then `npm run video-flow -- tools/video-flow/examples/<slug>.json` does the same.

## What it writes

| Output | Where |
|---|---|
| Desktop frames: webp, up to 1600 px wide, q70-80 | `site/assets/lab/<slug>/d/f0001.webp ...` |
| Phone frames: fewer frames, with an optional portrait crop around the focus point | `site/assets/lab/<slug>/m/f0001.webp ...` |
| Page manifest (frame sets, focus, beats, source) | `site/lab/<slug>/flow.json` |
| Desktop page + CSS (GSAP ScrollTrigger + Lenis) | `site/lab/<slug>/index.html`, `style.css` |
| Phone page + CSS (native scroll, lighter frames) | `site/lab/<slug>/m.html`, `m.css` |
| Lab grid posters, 1200x750 and 720x450 | `site/lab/<slug>/poster.webp`, `poster-m.webp` |
| Lab registry entry (upserted, so re-runs don't duplicate it) | `site/lab/_kit/registry.js` |

Every page loads the same small runtime, `site/lab/_kit/videoflow.js`. It handles:
- DPR-aware cover-fit canvas drawing around the configured focus point;
- loading the first frame first (preloaded, with a 32 px blurred placeholder inlined), then every 8th frame, every 4th, every 2nd, then the rest, so scrubbing works from the first second;
- beats that fade, slide and rise word by word at their scroll positions;
- a numbered rail and a frame counter;
- count-up specs, a clickable filmstrip that scrubs back to a frame, and magnetic pills on desktop;
- `prefers-reduced-motion`: no scrub, no smooth scroll; the poster frame and all the copy render as a normal page.

Re-runs are idempotent. Frames are re-encoded only when the video, trim, frame settings or focus change (the cache lives in `_work/cache/`). `--force` re-encodes anyway, and `--pages-only` regenerates only HTML/CSS/manifest. Each frame set has a size budget: if a set comes out heavier, the tool re-encodes it at a lower quality until it fits (never below `minQuality`).

## Options

```
node tools/video-flow/build.mjs <config.json> [--dry] [--force] [--only=d|m] [--pages-only] [--no-registry]
```

## Config reference

Paths are relative to the config file.

| Key | Required | What it does |
|---|---|---|
| `slug` | yes | Folder name: `site/lab/<slug>/`. Lowercase letters, digits and dashes. |
| `brand` | yes | Brand name; also the default hero title. |
| `n`, `kind`, `pattern` | no | Registry entry: concept number ("12"), product kind, pattern text. |
| `description` | no | The page's meta description. |
| `video` / `videoUrl` | one of them | Local video path, or a direct mp4 URL that is downloaded into `_work/` when the file is missing. |
| `trim` | no | `{ "in": 0.5, "out": 14.6 }` in seconds; keep it to one continuous shot. |
| `frames.desktop` | no | `{ count 150, width 1600, quality 74, budgetKB 8000, minQuality 46 }` |
| `frames.mobile` | no | `{ count 72, crop "portrait" or "none", aspect 0.62, height 1040, width 760, quality 62, budgetKB 2400 }` |
| `focus` | no | `[x, y]` from 0 to 1: where the cover-fit crop centres, and where the phone portrait crop sits. |
| `scroll` | no | `{ desktop: 520, mobile: 440 }`: track length in vh. More vh means a slower scrub. |
| `palette` | yes | `{ light, dark, accent }` as #RRGGBB (`--c1`, `--c2`, `--c3`). Text on the accent picks light or dark by itself. |
| `fonts` | no | `{ display, body }`: a file name from `site/assets/font/` without `.woff2` (e.g. `anton-400`, `bricolage-800`, `archivo-800`, `unbounded-300-900`, `spacegrotesk-300-700`, `intertight-normal`), or `"system"`. |
| `design` | no | `{ tracking: "-0.03em", uppercase: true }` for the display type. |
| `scrim`, `scrimLight` | no | Readability gradients: dark (behind light text) and light (behind dark text), 0 to 1. |
| `hero` | no | `{ tags[], title, sub, cta[{label, href}], to: 0.1, tone: "light" or "dark", cue }`. The hero fades out between scroll 0 and `to`. |
| `beats[]` | 4-6 recommended | `{ from, to, title, eyebrow, body, align: left/right/center, v: top/middle/bottom, tone: light/dark, wide, cta[] }`. `from` and `to` are 0 to 1 of the scrub. A `/` in a title breaks the line. A last beat that ends at 1 holds on screen. |
| `specs` | no | `{ eyebrow, title, body, items: [{ value, suffix, label }] }`: cards that count up. |
| `strip` | no | `{ eyebrow, title, body, at: [0, 0.2, ...] }`: filmstrip frames that scrub back when clicked. `{frames}` becomes the frame count. |
| `cta` | no | `{ eyebrow, title, body, primary, secondary, note }`: the closing section on the accent colour. |
| `poster` | no | `{ at: 0.4, keep: false }`: which moment becomes poster.webp. `keep: true` keeps a hand-made poster (for example a screenshot with the type on it). |
| `credits[]` | yes, for stock | `{ what, title, author, url, licence, note }` or a plain string; these go into the footer's Credits. |
| `registry` | no | Set it to `false` to skip the registry upsert. |
| `extraCss` | no | Extra CSS appended to both stylesheets. |

### Example (shortened from `examples/carmine.json`)

```json
{
  "slug": "carmine", "n": "12", "brand": "Carmine No.7", "kind": "Fountain pen ink",
  "video": "../_work/carmine.mp4",
  "videoUrl": "https://assets.mixkit.co/videos/41999/41999-1080.mp4",
  "trim": { "in": 0.2, "out": 14.6 },
  "frames": {
    "desktop": { "count": 180, "width": 1600, "quality": 80, "budgetKB": 7500 },
    "mobile":  { "count": 90, "crop": "portrait", "height": 1040, "quality": 66, "budgetKB": 2300 }
  },
  "focus": [0.32, 0.5],
  "scroll": { "desktop": 560, "mobile": 460 },
  "palette": { "light": "#F4EFE9", "dark": "#2B0A0E", "accent": "#D81E2C" },
  "fonts": { "display": "anton-400", "body": "spacegrotesk-300-700" },
  "hero": { "tags": ["Fountain pen ink"], "title": "Carmine", "sub": "One drop of No.7 in clear water.", "to": 0.11, "tone": "light",
            "cta": [{ "label": "Meet the colour", "href": "#" }] },
  "beats": [
    { "from": 0.12, "to": 0.31, "align": "left", "v": "bottom", "eyebrow": "The drop", "title": "One drop / is enough", "body": "..." },
    { "from": 0.31, "to": 0.5, "align": "right", "v": "top", "tone": "dark", "title": "Saturated / on purpose", "body": "..." },
    { "from": 0.86, "to": 1.0, "align": "center", "v": "middle", "wide": true, "title": "Write red" }
  ],
  "specs": { "title": "Made to be / written with", "items": [{ "value": "9", "suffix": "s", "label": "dry time" }] },
  "strip": { "title": "One shot. / {frames} frames." },
  "cta": { "title": "Put some / red on it", "primary": { "label": "Request a sample", "href": "#" } },
  "credits": [{ "what": "Footage", "title": "Texture of red ink in water", "author": "Mixkit",
                "url": "https://mixkit.co/free-stock-video/texture-of-red-ink-in-water-on-a-white-background-41999/",
                "licence": "Mixkit Stock Video Free License" }]
}
```

## Choosing a video that scrubs well

- One continuous shot. Hard cuts look like glitches when you scrub through them (trim around them).
- Slow, steady motion: pours, ink or smoke in water, slow-motion splashes, turntable product spins, drone push-ins, a drive.
- 8-15 s of motion across 150-200 frames feels smooth. Long clips with fast motion need more frames, so trim instead.
- Leave calm space (sky, backdrop, water) where the copy will sit, then use `align`, `v` and `tone` per beat.
- Fine detail (foliage, gravel) costs bytes. Plain backdrops and liquids compress very well.

## AI product renders and 3D renders

Renders drop in exactly the same way as footage. Export the turntable or fly-through as an mp4 (Blender, Cinema 4D, Spline, or an AI video tool), set `video` to it, and run the command. A seamless 360 spin is ideal: scroll becomes the rotation. Render on a plain backdrop that matches `palette.dark` or `palette.light` so the page and the frames blend.

## Deploy

The output is static files inside `site/`, so deploy as usual (Vercel: the repo's `vercel.json` already serves `site/`). Commit the generated `site/lab/<slug>/` and `site/assets/lab/<slug>/`. Don't commit `tools/video-flow/_work/`: the source videos stay local, and anyone can re-fetch the demo sources from the URLs in the configs.

Weight guide: aim for a desktop frame set under ~8 MB and a phone set under ~2.5 MB. The tool enforces `budgetKB` for you.

## Demos made with it (Zyqor Lab 12-14)

| Concept | Footage (Mixkit Stock Video Free License) | Desktop frames | Phone frames |
|---|---|---|---|
| 12 Carmine No.7, fountain pen ink | Texture of red ink in water on a white background (41999) | 180 @ 1600x900, ~2.6 MB | 90 @ 646x1040, ~0.4 MB |
| 13 Longway, overland road trips | Going down a curved highway through a mountain range (41576) | 200 @ 1440x810, ~5.0 MB | 90 @ 596x960, ~0.8 MB |
| 14 Rise No.3, sparkling strawberry water | Strawberries Splashing With Yellow Backdrop (101341) | 200 @ 1280x720, ~5.4 MB | 96 @ 446x720, ~1.0 MB |

## Files

```
tools/video-flow/
  build.mjs        CLI: probe, trim, encode, budget, posters, pages, registry
  lib/page.mjs     HTML + CSS generator (pure string templates)
  lib/fonts.json   the self-hosted font files and their families/weights
  examples/*.json  the three demo configs
  _work/           source videos + encode cache (git-ignored)
site/lab/_kit/videoflow.js   the shared runtime every generated page uses
```

Code: MIT, Zyqor Studio. The footage keeps its own licence; credit it in `credits`.
