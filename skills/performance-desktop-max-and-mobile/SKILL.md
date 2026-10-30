---
name: performance-desktop-max-and-mobile
description: Speed without lowering quality - tier weight budgets (NORMAL <= 1.5 MB, ADVANCED <= 3 MB, PREMIUM <= 8 MB own files), Core Web Vitals targets, the critical path (hero image, fonts, preload, fetchpriority), image/video/3D compression recipes that keep desktop at maximum quality, JavaScript and CSS diet, 60-120 fps animation rules, pausing off-screen, long-task chunking, caching headers on Vercel, low-end Android testing, honest Lighthouse reporting, and a budget script that measures any URL (bytes by type, LCP, CLS, long tasks, scroll fps) against the tier.
when_to_use: "site is slow", "make it faster", "Lighthouse score", "too heavy", "jank on scroll", "phone gets hot", "LCP / CLS / INP", "optimise images / video / 3D", before shipping any page, when choosing what a tier can afford
license: MIT (text and code). Sources in CREDITS.md.
version: 1.0.0
---

# Performance: desktop at maximum, phone just as good

Speed is part of premium. A $10k site that stutters on scroll or shows a white screen for three seconds reads as
cheap, whatever it looks like in a screenshot. But Sujon's rule forbids the usual shortcut: *"PC me no compromise"*
and *phone = same quality, compressed*. So the job is **remove waste, never quality**.

```
set the tier budget (section 1) -> critical path first (2) -> compress every asset at full visual quality (3-5)
   -> JS/CSS diet (6) -> animation + rendering rules (7) -> long tasks (8) -> caching (9)
   -> measure with budget-check.mjs + Lighthouse, report the real numbers (10)
```

`scripts/budget-check.mjs` loads a URL in Chrome and reports transferred bytes by type (with own files and vendor
files apart), LCP, CLS, total long-task time, and frames per second during a scripted scroll, then compares them with
the chosen tier. `examples/index.html` is a performance lab: lazy media, `content-visibility`, an animation that
pauses off-screen and in hidden tabs, chunked work with `scheduler.yield`, and a live FPS/long-task readout.

---

## 0. Desktop first, no compromise

On desktop, quality is the fixed point; everything else moves:

1. **Full quality assets**: 2x images at displayed size, 1080p-4K hero video at visually lossless settings, DPR 2
   WebGL with antialiasing, 2K-4K textures for close-ups.
2. **60 fps minimum, 120 fps on ProMotion/high-refresh screens**: transform/opacity only, one rAF loop, no layout
   reads inside it.
3. **Load smart, not less**: the first screen loads first (hero image or poster, one display font, the critical CSS);
   everything below waits until it is about one viewport away.
4. **Measure on a real mid-range laptop** with the Performance panel, not only Lighthouse (Lighthouse emulates a slow
   phone and says little about desktop smoothness).

### Phone parity

- Same assets, encoded for the phone's displayed size (srcset, a 9:16 video at 1080 x 1920, the same GLB).
- DPR capped at 1.75-2 for WebGL; shadow map 1024 if needed (threejs skill).
- Test with Chrome's **4x CPU throttle** and a slow 4G profile; aim for the same smoothness, accept a longer first load
  before accepting a worse picture.
- Pause everything off-screen; phones heat up and throttle when animations run unseen.

---

## 1. Budgets by tier (own files, desktop first load)

| | NORMAL ($300) | ADVANCED ($1k) | PREMIUM ($10k) |
|---|---|---|---|
| Total own files | <= 1-1.5 MB | <= 3 MB | <= 8 MB (after a finished poster frame) |
| JavaScript (own + vendor, gzip) | <= 80 KB | <= 250 KB | <= 600 KB (three.js + GSAP fit) |
| Fonts | <= 2 files, <= 120 KB | <= 3 files, <= 200 KB | <= 4 files, <= 300 KB |
| Hero media before first paint | image <= 250 KB | image or poster <= 300 KB | poster <= 300 KB, then video/3D streams |
| LCP (mobile, Lighthouse) | <= 2.5 s | <= 2.5 s | <= 3.0 s (poster counts as LCP) |
| CLS | <= 0.1 | <= 0.1 | <= 0.1 |
| INP | <= 200 ms | <= 200 ms | <= 200 ms |
| Scroll fps (desktop) | 60 | 60 | 60, 120 where the screen allows |

The Core Web Vitals thresholds (LCP 2.5 s, INP 200 ms, CLS 0.1 at the 75th percentile) are Google's "good" limits
(web.dev). The weight budgets are Zyqor's own (set with the tier system, Oct 2026). Lazy-loaded media below the fold
counts toward the total but not toward the first-load limits.

---

## 2. The critical path

```html
<link rel="preload" href="/fonts/display.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" as="image" href="/img/hero-1600.webp" imagesrcset="/img/hero-1600.webp 1600w, /img/hero-2400.webp 2400w" imagesizes="100vw" fetchpriority="high">
<style>/* critical CSS for the first screen, inline, under ~14 KB */</style>
<link rel="stylesheet" href="/css/site.css">
<script type="module" src="/js/site.js"></script>            <!-- modules are deferred by default -->
```

- **One preloaded display font** (the hero headline), body font loaded normally with `font-display: swap`; a fallback
  with `size-adjust` / `ascent-override` so the swap does not shift the layout (typography skill).
- **The LCP element is an image or poster** with `fetchpriority="high"`, never lazy, never behind JavaScript.
- No render-blocking third-party scripts; analytics loaded after `load`.
- A preloader only when it shows real progress (motion skill; Drive M11), never as a cover for a slow page.

---

## 3. Images

| Step | Setting |
|---|---|
| Format | AVIF (q 50-60) with WebP (q 75-82) fallback; PNG only for flat graphics; SVG for icons and line art |
| Sizes | srcset at 800 / 1200 / 1600 / 2400 / 3200 w; `sizes` matching the layout |
| Desktop hero | 2400-3200 w for full-bleed at DPR 2 (no compromise), ~150-300 KB in AVIF |
| Phone hero | a portrait crop at 800-1200 w (responsive skill) |
| Below the fold | `loading="lazy" decoding="async"`, `width`/`height` set |
| Placeholders | dominant colour or a 20 px blurred LQIP inline; never a spinner |

```js
// npm i -D sharp (Apache-2.0): one source -> every size in AVIF and WebP
import sharp from 'sharp';
for (const w of [800, 1200, 1600, 2400, 3200]) {
  await sharp('hero.jpg').resize({ width: w }).avif({ quality: 55 }).toFile(`out/hero-${w}.avif`);
  await sharp('hero.jpg').resize({ width: w }).webp({ quality: 80 }).toFile(`out/hero-${w}.webp`);
}
```
Check by eye at 100% on a retina screen: a visible artefact on desktop is a quality loss, raise the quality.

---

## 4. Video (scroll and hero)

```bash
# web hero / scroll video: H.264 for reach, all-keyframe-ish GOP for smooth scrubbing
ffmpeg -i in.mov -vf "scale=1920:-2,fps=30" -c:v libx264 -preset slow -crf 23 -g 12 -pix_fmt yuv420p -movflags +faststart -an hero-1920.mp4
ffmpeg -i in-portrait.mov -vf "scale=1080:-2,fps=30" -c:v libx264 -preset slow -crf 24 -g 12 -pix_fmt yuv420p -movflags +faststart -an hero-1080x1920.mp4
```
- `-g 12` (a keyframe every 12 frames) makes scrubbing smooth; the measured web encode on the Zyqor bakery build was
  crf 26 / g 12. Desktop PREMIUM can go to crf 20-22.
- Scroll video loads as a Blob (motion skill, scroll-world T2) so seeking never waits on the network.
- `poster` always; `preload="metadata"` for below-the-fold videos; autoplay only muted + `playsinline`.
- Pause videos that leave the screen (IntersectionObserver).

---

## 5. 3D

- `gltf-transform optimize --compress meshopt --texture-compress webp` (threejs skill §3); the same GLB on both devices.
- Dynamic `import()` of three.js and loaders when the stage is about one viewport away.
- Render on demand; pause when off-screen or the tab is hidden.
- `renderer.info.render.calls` under 50-100; textures 2K for heroes, 4K only for macro chapters.

---

## 6. JavaScript and CSS diet

- **No library for one effect**: CSS scroll-driven animations, View Transitions, `IntersectionObserver` and Web
  Animations cover much of what used to need a library. GSAP + ScrollTrigger + Lenis is ~90 KB gzip and worth it
  for real scroll stories.
- **Self-host and pin versions** (Drive P7): no `@latest`, no development CDNs (the Tailwind Play CDN is for
  development only).
- Split by route and by feature (`import()` the configurator only when it is opened).
- Remove unused CSS; avoid giant utility bundles in production.
- Blur is expensive: `backdrop-filter` on at most 2-3 visible layers at a time on phones; radius 8-16 px.
- `content-visibility: auto` with `contain-intrinsic-size` for long below-the-fold sections.

---

## 7. Animation and rendering

| Rule | Why |
|---|---|
| Animate `transform` and `opacity` only | composited on the GPU; no layout or paint per frame |
| One rAF loop for all pointer and scroll effects | many loops fight for the frame |
| Never read layout (`getBoundingClientRect`, `offsetTop`) after writing styles in the same frame | forced synchronous layout (layout thrash) |
| `will-change` only on elements about to animate, removed after | each one costs GPU memory |
| Pause off-screen (`IntersectionObserver`) and in hidden tabs (`visibilitychange`) | his rule; phones throttle when hot |
| No endless loops (marquees, auto-rotating models) on portfolio sites | his 15 Oct rule, and constant cost |
| Passive scroll and touch listeners | scrolling never waits for JavaScript |

---

## 8. Long tasks and INP

Any task over 50 ms blocks input. Break work into chunks and yield:

```js
async function processAll(items, fn) {
  const yieldNow = () => (globalThis.scheduler?.yield ? scheduler.yield() : new Promise((r) => setTimeout(r, 0)));
  let t = performance.now();
  for (const it of items) { fn(it); if (performance.now() - t > 8) { await yieldNow(); t = performance.now(); } }
}
```
Heavy work (image decoding, data parsing, physics) goes to a Web Worker. Click handlers update the UI first (the
press state from the micro-interactions skill), then do the work.

---

## 9. Caching and delivery (Vercel)

```json
{ "headers": [
  { "source": "/(.*)\\.(woff2|webp|avif|mp4|glb|hdr|js|css)", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] }
] }
```
Use `immutable` only for files whose names change when their content changes (hashed or versioned names); HTML stays
short-cached. Vercel serves Brotli/gzip and HTTP/2-3 automatically. Large media can live on the same project unless
traffic is high (Vercel Hobby is for personal and small projects: Drive P8).

---

## 10. Measuring and reporting

1. `node scripts/budget-check.mjs <url> --tier advanced` (bytes by type, LCP, CLS, long tasks, scroll fps).
2. Lighthouse in Chrome DevTools, **Mobile and Desktop**, in an incognito window. *"Record the real score. Aim 90+
   for Performance and Accessibility."* **Report the number you got, not a target** (Drive P3).
3. Performance panel: record a scroll through the whole page at 1440 (no throttle) and at 390 with 4x CPU throttle;
   look for red frames, long tasks, layout shifts.
4. A real low-end Android if possible (Drive P2); say whether one was used.

---

## 11. Do and don't

| Do | Because |
|---|---|
| Fix waste before touching quality | his "no compromise" rule |
| Load the first screen first, the rest near the viewport | fast and full quality |
| Use AVIF/WebP, meshopt, H.264 with short GOP | same picture, a fraction of the bytes |
| Pause off-screen | cool phones, smooth pages |
| Report measured numbers | trust; Drive P3 |

| Don't | Because |
|---|---|
| Ship a blurry hero to hit a score | quality loss the client sees |
| Lazy-load the LCP image | it becomes the slowest thing on the page |
| Load three.js on pages without 3D | 150+ KB for nothing |
| Stack many blurred glass layers on phone | GPU cost, jank |
| Claim "90+ Lighthouse" without a run | his rule |

---

## 12. Pre-ship checklist

- [ ] `budget-check.mjs` within the tier at 1440 and 390; numbers written into the project notes.
- [ ] LCP element is an image/poster with `fetchpriority="high"`; one preloaded display font.
- [ ] Images AVIF/WebP with srcset; below-the-fold lazy; width/height set; CLS <= 0.1.
- [ ] Videos: poster, faststart, short GOP for scrub, paused off-screen.
- [ ] 3D: meshopt GLB, dynamic import, render on demand, paused off-screen.
- [ ] No unpinned CDNs; no unused libraries; JS within the tier budget.
- [ ] No long task over 50 ms during interaction; INP checked on the main controls.
- [ ] Scroll at 60 fps desktop; smooth on 4x throttle.
- [ ] Cache headers for versioned assets.
- [ ] Lighthouse Mobile and Desktop run; real numbers reported.

## 13. Files

| File | What |
|---|---|
| `scripts/budget-check.mjs` | measures a URL: bytes by type (own vs vendor), LCP, CLS, long tasks, scroll fps; compares with `--tier normal|advanced|premium`; exits 1 over budget |
| `examples/index.html` | performance lab: lazy media, content-visibility, IO + visibility pause, chunked work with scheduler.yield, live FPS and long-task readout; self-tests confirm the pause works |

## Sources

- Sujon Hoque (Zyqor Studio): WhatsApp 30 Oct 2026 ("PC me no compromise"), 27 Oct 2026 8:23 PM (phone same quality, compressed), 15 Oct 2026 (no endless loops; pause off-screen); Zyqor tier budgets (NORMAL / ADVANCED / PREMIUM, Oct 2026).
- Sujon's Drive: *Website-Building-Guide-New-Site.md* §7 (Lighthouse mobile, report the real number), §8 (pin versions; free hosting caveats); *Master-Award-Website-Guide-Improved-v4.2* Part B ("Performance" row), Part C (pinned versions), Part F item 2 "PERFORMANCE"; *boloflow-native-motion-design-system.txt* "PERFORMANCE".
- Drive points P1-P3, P7, P8, M11 (`docs/beast/SKILLS_SOURCE_MAP.md`).
- scroll-world by cyw (MIT), https://github.com/oso95/scroll-world: Blob-loaded video (T2), lazy window (T14), seek coalescing (T15), encode recipes (T10).
- web.dev: Core Web Vitals thresholds (LCP, INP, CLS), Optimize LCP, `content-visibility`, `scheduler.yield`; MDN: PerformanceObserver (largest-contentful-paint, layout-shift, longtask), `fetchpriority`, preload.
- Vercel documentation: headers in `vercel.json`, caching; Zyqor portfolio v3 measured bakery encode (crf 26, g 12).
