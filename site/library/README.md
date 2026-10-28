# Zyqor Library: how to build a concept with the kit

The library is 300 fictional-brand 3D web concepts (100 Normal, 100 Advanced, 100 Premium). Every concept is two
pages, `index.html` (desktop) and `m.html` (phone), that load the **same** models, textures and HDRI. The kit in
`_kit/` does the boring, easy-to-get-wrong parts so each builder spends their time on the idea.

Reference concepts (copy these, they pass QA):
- `n/N002/` Kiln & Quiet (Normal): one real CC0 vase on a code-made potter's wheel, drag inertia, live rpm dial.
- `a/A018/` Tranquility Base (Advanced): a pinned scroll scene, one camera on two splines, scanned CC0 moon rocks, NASA Earth.

## The 10 steps

1. **Pick your row.** Find your id in `work/beast/concepts_300.json` (name, idea, technique, asset, palette, structure).
2. **Scaffold it.** `node tools/new-concept.mjs N014` creates `site/library/n/N014/` from `_template/` with the name,
   tier, palette (`--c1` light / `--c2` dark / `--c3` accent) and a `credits.json` pre-filled from the row's assets.
3. **Write `brief.md` before any code.** Palette roles, the two fonts, which of the 14 structures, the states, the
   touch equivalent of every hover, and **three hand-made signature details**. If you can't name three, the idea isn't ready.
4. **Get the real asset.** Only verified CC0 / CC-BY (Poly Haven, Khronos samples, NASA public domain, ...). No AI images.
   Optimise once with gltf-transform (meshopt + webp, 1k-2k textures) into `_assets/models/` or `_assets/tex/`,
   and add the author + licence + URL to `credits.json`. Phone and desktop use this one file.
5. **Set up the scene with one call.**
   ```js
   import { createStage, THREE, isM, reduced } from '../../_kit/stage.js';
   const stage = await createStage({ el: '[data-stage]', camera: { fov: 30, position: [0, 1.2, isM ? 6.2 : 5.2], target: [0, .75, 0] } });
   const g = await stage.load(stage.asset('models/my_model.glb')); stage.fit(g.scene, 1.6, true); stage.add(g.scene);
   stage.contactShadow(); stage.loaded();
   ```
   You get ACES + sRGB, the shared studio HDRI, DPR cap 2, meshopt/Draco/KTX2 decoders, resize, lazy start when the
   stage scrolls into view, pause off-screen, reduced-motion handling and the poster fallback if WebGL fails.
   Interaction: `stage.spin(obj)` (drag/swipe/keys with inertia), `stage.scroll(section, p => ...)` (ScrollTrigger + Lenis
   on desktop, native on phone), `stage.onFrame(fn)` (return `true` while animating; the loop sleeps when nothing changes).
6. **Build the page around it.** Structure from your brief, never hero + 3 cards + about + contact. Use the kit classes
   (`.display .h2 .lead .body .tag .mono .btn .btn--accent .section .wrap`) and the spacing scale only. The accent is ~1%.
7. **Add the interactions from `_kit/fx/`** (`reveals, splitAll, magnetic, tilt, cursor, press, marquee, morph`).
   Every hover has a tap or keyboard equivalent; the cursor follower only runs on a fine pointer. Motion is the kit
   default: opacity + 20px rise, 480 ms, expo-out, no bounce, no blur.
8. **Build the phone page properly.** `m.html` + `m.css`: same `app.js` (it sees `isM === true`), same files, a layout
   designed for a 390px thumb (48px targets, native scroll, the touch gesture shown on screen), not a squeezed desktop.
9. **QA it.** `node tools/qa-library.mjs N014` runs desktop 1440x900, phone 390x844 (must redirect to `m.html`), phone
   360x740 and reduced motion; it fails on any console error or warning, failed request, horizontal overflow, missing
   chrome/credits, or phone loading different asset files. It writes `thumb.webp` + `poster.webp` + `qa.json`. Fix, re-run, look at
   the screenshots yourself against the brief, improve, repeat (at least an hour of iteration).
10. **Publish it to the index.** `node tools/library-build.mjs` regenerates `library.json`; the concept appears on
    `/library/` as Live only when its `qa.json` says PASS. Everything else stays a palette card marked Coming.

## What is in the kit

| file | what it does |
|---|---|
| `_kit/concept.css` | reset, fluid type scale, spacing scale, palette tokens, hairlines + specular edges, grain, glass tokens, focus, reduced motion |
| `_kit/chrome.js` + `chrome.css` | the top glass bar (back to library, "Zyqor Library · Concept N002 · fictional brand", tier badge), credits sheet from `credits.json`, honest footer with previous / next |
| `_kit/stage.js` | `createStage()` and helpers: `load, fit, add, asset, loadTexture, contactShadow, spin, scroll, smooth, onFrame, invalidate, loaded` |
| `_kit/fx/*.js` | reveal, split-text, magnetic, tilt, cursor follower, press ripple, marquee, SVG morph |
| `_kit/font/` | JetBrains Mono (OFL) for index tags; display/body fonts come from the portfolio's licensed set |
| `_template/` | the page template the scaffold copies (index.html, m.html, style.css, m.css, app.js, credits.json, brief.md) |
| `_assets/` | shared optimised models and textures (one copy, used by desktop and phone) |
| `library.json` | the catalogue the index reads, generated from the plan + each concept's `qa.json` |
| `index.html`, `m.html`, `lib.*` | the filterable library index (tier, category, technique, search, show/hide Coming) |

## Rules that fail review

Real assets only, credited. No emoji (inline SVG icons). Fictional brands say Concept. No invented clients, reviews or
numbers. Three colours per page, warm paper instead of white, coloured darks instead of black, no purple AI gradients.
Nothing hover-only. Phone loads the same assets as desktop. 0 console errors and no horizontal overflow at 1440, 390 and 360.
