---
name: model-optimisation-phone
description: Turn one glTF/GLB into ONE optimised GLB that desktop and phone both load and that looks identical, then prove it with pixel-measured side-by-side renders. Use it before any 3D model goes on a website, especially when the phone build must keep the desktop quality.
when_to_use: "a 3D model is too heavy for the web or for phones", "the phone build should show the same model", "compress this GLB without losing quality", before shipping any three.js / model-viewer page
license: MIT (code and text). Example model and HDRI are CC0, see example/CREDITS.md.
version: 1.0.0
---

# Model optimisation for phone

**The rule this skill exists for** (Sujon Hoque, Zyqor Studio, Oct 27 2026): mobile gets the same premium model as desktop. Size is negotiable, looks are not. Compress it so nobody can see a difference.

So the job is never "make it small". The job is: **make it as small as it can be while a pixel comparison still says IDENTICAL**, and ship that one file to both builds.

```
in.glb / in.gltf ──► optimise.mjs ──► out.glb ──► verify.mjs ──► IDENTICAL? ──► ship the same file to index.html and m.html
                     (guards, report,              (desktop + 390 px renders,
                      budget, validator)            close-ups, PSNR, crops)
```

## 1. Install (once)

```bash
npm i @gltf-transform/core @gltf-transform/extensions @gltf-transform/functions meshoptimizer sharp
npm i -D playwright-core three gltf-validator && npx playwright install chromium-headless-shell   # for verify.mjs
# optional, only for --textures ktx2: KTX-Software 4.3+ (the `ktx` command) from github.com/KhronosGroup/KTX-Software/releases
# optional, only for --geometry draco: npm i draco3dgltf
```
Or run `npm install` inside this folder (package.json lists them).

## 2. Optimise

```bash
node starter/optimise.mjs model.gltf model.glb --budget 14MB
```
What it does, in this order (every step is lossless unless named):
1. `dedup`, `prune`, `instance`, `resample`, `weld` (exact duplicates only). **No simplify.**
2. Textures: resized only if bigger than `--max` (2048), Lanczos3, never upscaled. `--max-for "<regex>=1024"` lowers parts that are small on screen.
3. Texture encoding by what the map *is*:

| map | `--textures webp` (default) | `--textures ktx2` | never |
|---|---|---|---|
| base colour, emissive (sRGB) | WebP q92 | UASTC (RDO 1) + zstd | quality < 85; ETC1S unless `--allow-etc1s` |
| ORM / roughness / metal / AO (data) | WebP q92 | UASTC (RDO 1) + zstd | quality < 88 |
| **normal maps** | **WebP near-lossless (40)** | **UASTC, no RDO** | **lossy WebP, ETC1S, JPEG 4:2:0** |

4. Geometry: meshopt (`EXT_meshopt_compression`) with **16-bit positions, 12-bit normals, 14-bit UVs**. `--geometry draco` uses the same bits.
5. Writes `out.glb`, a `out.report.json`, prints before/after size, triangles, draw calls, every texture, estimated GPU texture memory, glTF validator result, budget PASS/OVER.

Exit codes: 0 ok, 2 over budget (nothing lowered automatically), 3 refused settings, 4 validator errors.

### Guards (why it refuses things)
The script stops with `REFUSED (nothing written)` when you ask for a setting we have watched break a model:

- `--simplify` → refused unless `--i-accept-shape-change`. In v3 round 1 the car body got wrinkles from simplify + weld.
- normal bits < 10, position bits < 14, UV bits < 12 → refused. Round 1 used 8-bit normals: soft, blotchy knit on the shoe.
- lossy WebP on normal maps → refused unless `--allow-lossy-normals`. Measured on the Flight Helmet leather normal map (2048 px): lossy WebP has a **mean error of 3.1-3.4 degrees and a 99th percentile of 17 degrees at q90, q95 and even q100**, because WebP lossy always stores colour at half resolution (4:2:0) and a normal map keeps X and Y in colour channels. Near-lossless 60: mean 0.55, p99 1.3 degrees. UASTC: mean 1.3, p99 6.5. ETC1S: mean 4.6, p99 23.5.
- texture `--max` below 1024 → refused unless `--allow-small-textures`. A hero model on a 390 px phone at DPR 2-3 covers 780-1170 device pixels.
- colour quality < 85 / data quality < 88 → refused unless `--allow-low-quality`.
- `--unsafe-demo` writes the file anyway with a warning (only for before/after demos like the table below).

### Never run plain `gltf-transform optimize`
Its defaults (glTF Transform 4.5) are `--simplify true`, `--join true`, `--flatten true`, `--palette true` (merges materials) and lossy texture compression on every slot, normal maps included. Fine for a game prop at a distance, wrong for a premium close-up. `starter/recipe.sh` is the same safe recipe as plain CLI commands, with those switched off.

## 3. Verify (the proof)

```bash
node starter/verify.mjs model.gltf model.glb --views views.json --out verify/
```
It serves both files on a local port, opens one headless Chromium, and renders **both files with the same viewer (`loader.js`), camera, HDRI and tone mapping**:
- desktop 1440x900 at DPR 1, phone 390x844 at DPR 3 (capped to 2 by the loader, like the real page);
- a full view plus close-ups (three automatic ones on the biggest meshes, or your own `views.json`);
- per view: PSNR and the % of pixels whose colour moved by more than 12/255, plus a x8 difference image.

**Pass mark: every view >= 38 dB PSNR and <= 1% changed pixels.** Output: `verify.json` (verdict IDENTICAL / VISIBLE CHANGE, exit code 0 / 5), `compare_closeups.jpg` (original | optimised | difference), `compare_desktop_phone.jpg`, `compare_closeup_desktop_phone.jpg`.

On a shared machine run one browser at a time: `flock -w 1200 /tmp/chrome.lock node starter/verify.mjs ...` (the script also waits up to `--wait` seconds for other headless Chromes).

If the verdict is VISIBLE CHANGE: look at the difference image, find the part, raise that part (`--max-for` back up, near-lossless normals, higher quality), run again. Never ship a VISIBLE CHANGE file to the phone build.

## 4. Load it (desktop and phone, same file)

`starter/loader.js` (`createViewer`) is the three.js viewer both builds use:
- `GLTFLoader` + `MeshoptDecoder` + `DRACOLoader` + `KTX2Loader` (transcoder paths are options; copy `three/examples/jsm/libs/basis/` and `libs/draco/gltf/` next to your page);
- HDRI through PMREM, ACES filmic, sRGB output, a soft contact shadow from one 128 px canvas (no shadow maps);
- **lazy**: loads when the stage comes within 300 px of the viewport; **pauses** off-screen and in hidden tabs; renders **only when something moves** (idle = zero frames = cool phone);
- **DPR capped at 2** (the only difference between phone and desktop), `antialias: true` on both;
- portrait screens fit the model by width, landscape by height;
- drag to turn with `touch-action: pan-y` (the page still scrolls on phones); named views with an expo-out tween (520 ms), instant with `prefers-reduced-motion`; a short idle spin that stops after 8 s or on first touch;
- poster image fallback when WebGL is missing or the context is lost.

```js
import { createViewer } from './loader.js';
const v = createViewer({ el: document.querySelector('.stage'), model: 'models/helmet.glb', hdr: 'studio_1k.hdr',
  decoders: { draco: 'vendor/three/examples/jsm/libs/draco/gltf/', basis: 'vendor/three/examples/jsm/libs/basis/' },
  poster: 'img/poster.webp', views: { detail: { at: [0.03, 0.27, 0.13], theta: 0.3, phi: 1.4, r: 0.27 } } });
v.ready.then(() => v.goTo('detail'));
```

## 5. Choosing WebP or KTX2 (measured, not guessed)
- **WebP** is the download winner: 13.76 MB for the example, IDENTICAL. But the browser decodes it to full RGBA: 15 maps at 2048 px is about **272 MB of GPU memory**.
- **KTX2 (UASTC)** stays compressed on the GPU: about **68 MB** for the same maps, IDENTICAL, but here the download was **35.7 MB** (zstd does not shrink UASTC much). ETC1S on colour got it to 28.8 MB and failed the check.
- Rule of thumb: start with WebP. If the report's GPU estimate is over ~200 MB, or a phone tab reloads/crashes, first lower parts that are small on screen with `--max-for` (check with verify), then consider `--textures ktx2` and accept the bigger download.

## 6. Budgets
A budget is a guard, not a target. When `--budget` is exceeded the script lists the biggest textures and the safe options, and exits 2 without touching quality. For the Zyqor library: NORMAL 1.5 MB, ADVANCED 4 MB, PREMIUM 12 MB per concept are planning numbers; a hero model that cannot pass verify under its budget gets a bigger budget, not a softer texture.

## 7. The "lighter home page" pass (Oct 30 2026): what passed and what did not
The brief was "make the home page lighter". The six desktop models were 11.6 MB of a 29.3 MB full scroll. Two passes, both measured with `verify.mjs` against the shipped file:

| pass | what changed | camera size | verify worst view | verdict |
|---|---|---|---|---|
| A | every map 2048 -> 1024 px, colour WebP q80, normals lossy q90 | 4.58 -> 0.92 MB | desktop close-up 30.1 dB, 4.5 % pixels moved | VISIBLE CHANGE |
| B | colour + normals at 1536 px (q90 / q96), data maps 1024 | 4.58 -> 2.18 MB | 32.9 dB, 2.6 % | VISIBLE CHANGE |
| C | **only roughness / metal / occlusion maps** to 1024 px WebP q92, colour and normals untouched | 4.58 -> 3.30 MB | 48.6 dB, 0.07 % | IDENTICAL |

Pass A went live for twenty minutes before this check and was rolled back. Its full views scored 45-48 dB: a full-view render alone would have called it fine. **The close-ups are the test.** A model on the home page is still a model somebody zooms into on a 3x phone.

Pass C on all six:

| model | before | after | verify |
|---|---|---|---|
| AntiqueCamera-hd | 4.58 MB | 3.30 MB | IDENTICAL 48.6 dB |
| MaterialsVariantsShoe-hd | 3.12 MB | 2.83 MB | IDENTICAL 49.2 dB |
| Lantern-hd | 1.80 MB | 1.53 MB | IDENTICAL 56.9 dB |
| WaterBottle-hd | 0.79 MB | 0.54 MB | IDENTICAL 42.2 dB |
| BoomBox-hd | 0.98 MB | (0.53 MB) | **VISIBLE CHANGE 32.0 dB, kept original** |
| GlassVaseFlowers-hd | 0.32 MB | (0.33 MB, bigger) | kept original |
| total | 11.6 MB | 9.5 MB | |

Why BoomBox failed: its occlusion map carries real painted detail (grille holes, seams), so halving it shows. A data map is only "data" when it is smooth. Check each model; never apply a pass to a folder blind.

### The recipe (data maps only)
`starter/data-maps-1024.mjs`:
```js
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { textureCompress } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import sharp from 'sharp';
const [src, out] = process.argv.slice(2);
await MeshoptDecoder.ready; await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
const doc = await io.read(src);
await doc.transform(textureCompress({ encoder: sharp, targetFormat: 'webp', quality: 92,
  resize: [1024, 1024], slots: /^(metallicRoughness|occlusion)/ }));
await io.write(out, doc);
```
Then, for every file: `node starter/verify.mjs original.glb out.glb --out verify/<name>`. Ship only the IDENTICAL ones.

### Order of moves when a page is too heavy
1. Is the model loaded before anyone can see it? Lazy-load first (zero quality cost).
2. Data maps (roughness, metal, occlusion) to 1024: usually IDENTICAL, saves 10-45 % per model.
3. A part that is small on screen (`--max-for "<regex>=1024"`), verified.
4. Only then colour or normal maps, and expect VISIBLE CHANGE.
5. If nothing passes, the budget grows. The look does not shrink.

### Gotchas met on the day
- `gltf-transform resize` has no `--slots` (it has `--pattern` on texture names, and names differ per model). Use `textureCompress({ slots })` in a script, as above.
- Re-encoding an already-lossy WebP adds a second generation of loss. Only touch the maps you mean to change; pass C leaves colour and normal bytes untouched.
- A file over ~3 MB is stored in this repo as `.part1/.part2` with a line in `tools/parts.json` (sha256 + bytes + parts). If you change such a model, rewrite the parts **and** the manifest line, then run `node tools/join-parts.mjs` locally: it must say the file is rebuilt and the sha must match. A stale whole file in git is harmless (the build overwrites it); a stale manifest breaks the Vercel build.
- `--allow-flagged` credits check still has to pass: add one line to the model's `.credit.json` `changes` saying what was resized and when.

## Files
- `starter/optimise.mjs`: the optimiser (guards, report, budget, validator).
- `starter/verify.mjs`: the proof renders and metrics.
- `starter/loader.js`: the three.js viewer for desktop and phone.
- `starter/recipe.sh`: the same recipe as glTF Transform CLI commands.
- `starter/data-maps-1024.mjs`: the data-maps-only pass from section 7.
- `starter/studio_1k.hdr`: the studio HDRI the checker lights with (Poly Haven, CC0).
- `example/`: Flight Helmet (CC0) through the pipeline, desktop `index.html` + phone `m.html` loading the same 13.76 MB GLB, `report.json`, `verify.json`, `screens/`.
- `checklist.md`: what "done" means.

## Lessons this is built on
From Zyqor portfolio v3, round 1 to round 2 (14 models, Oct 27 2026): round 1 simplified meshes, halved textures to 1024 at low WebP quality and used 8-bit normals, and the phone got a cheaper `-m` file. It looked soft and jaggy on close-ups. Round 2 rebuilt every model from full-resolution sources (no simplify, 2048 px WebP q90-92, meshopt 16/12/14) and the phone loaded the same file with the same HDRI, DPR 2 and antialiasing. This skill keeps round 2 and fixes the one thing round 2 still did wrong: lossy WebP on normal maps (measured: VISIBLE CHANGE, 36.2 dB on the leather close-up).
