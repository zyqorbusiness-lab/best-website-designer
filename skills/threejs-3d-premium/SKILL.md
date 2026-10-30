---
name: threejs-3d-premium
description: Premium 3D on the web with three.js - when 3D earns its place, real models instead of code-made shapes (sourcing, licences, optimisation), renderer defaults (ACES/AgX, exposure, colour space, DPR), HDRI image-based lighting plus a key/rim rig, PBR materials that look real (clearcoat, transmission, sheen, anisotropy), contact shadows, camera framing for desktop and portrait phones, scroll-driven camera beats, the finish studio configurator, post-processing, render-on-demand and pausing, the no-WebGL poster, and the five-chapter product arc. Desktop at maximum quality, phone with the same model compressed. Tested demo on a real CC0 scan.
when_to_use: "add a 3D model", "three.js hero", "product turns with scroll", "make the 3D look real / premium / less fake", "lighting looks flat", "model looks plastic", "3D on mobile", "configurator / swatches", any WebGL scene on a website
license: MIT (text and code). The demo's model and HDRI are CC0 (Poly Haven); three.js is MIT.
version: 1.0.0
---

# Premium 3D with three.js

Cheap 3D on websites looks the same everywhere: a grey torus knot, a wireframe icosahedron, a field of glowing
particles, flat lighting, a model floating with no shadow. Sujon's rule kills all of it at once: **real premium
models only (CC0/CC-BY, credited), no AI renders, no code-made look**, and **the phone gets the same model**.
Award winners use 3D the same way (study doc §5): *a real object, lit like a photo, doing one thing.*

```
does the idea need 3D? (section 1) -> source a real model + licence (2) -> optimise once for both devices (3)
   -> renderer defaults (4) -> HDRI + rig (5) -> materials (6) -> contact shadow (7) -> camera + framing (8)
   -> scroll beats / configurator (9-10) -> performance + pausing (11) -> poster fallback (12) -> QA (14)
```

`examples/index.html` is a working stage built on these rules: a CC0 photogrammetry vase (Poly Haven), a CC0 studio
HDRI, ACES tone mapping, key + rim lights, a soft contact shadow, three scroll-driven camera beats, a finish studio
with real buttons, real loading progress, pause off-screen and when the tab is hidden, and a poster when WebGL is
unavailable. It runs inside this repo (it loads three.js r170 from `site/vendor/three/`).

---

## 0. Desktop first, no compromise

*"PC me no compromise, ek dam best"* (Sujon, 30 Oct 2026). On desktop:

1. **`renderer.setPixelRatio(Math.min(devicePixelRatio, 2))`**: full retina sharpness, antialias on.
2. **The highest texture set** the model ships with (2K-4K for the hero), 1K HDRI or larger for reflections.
3. **Shadows on, soft** (PCFSoft or a baked contact shadow), physical materials (clearcoat, transmission) where the
   object has them, post-processing (SMAA or MSAA, subtle bloom only on real highlights) if it improves the image.
4. **60 fps at 1440 x 900** with all of the above. If it drops, remove waste (draw calls, overdraw, oversized
   shadow maps, rendering when nothing changes), never quality.

### Phone parity (Sujon, 27 Oct 2026 8:23 PM: same models, same quality, compressed)

- **The same GLB file** (meshopt geometry + WebP/KTX2 textures make it small enough for both). Never a decimated
  "mobile mesh" (the A018 mistake in `unique-concepts` §9.3).
- DPR capped at 1.5-2 on phones; shadow map 1024 instead of 2048 if the frame budget needs it; same HDRI.
- **Portrait framing**: compute the camera distance from the model's bounding sphere and the portrait aspect, so the
  object fills the phone frame like it fills the desktop (section 8).
- Lazy-load the stage when it nears the viewport; pause when off-screen.
- A static poster only when WebGL fails or the visitor asked for reduced motion (Drive D6, X8): never the phone default.

---

## 1. Does this site need 3D?

Use 3D when the idea needs the visitor to **see an object from several sides, take it apart, change its finish, or
travel through a space**. Otherwise a great photograph is better and lighter (Drive D8: *"the simplest technique that
can produce the desired result... a simple scene executed brilliantly is better than a complicated scene executed
badly"*).

| Need | Technique |
|---|---|
| One object, one turn | scroll-scrubbed video of our own render (scroll-video-hero skill) or a live model |
| See all sides, change finish | live three.js model + finish studio |
| Take it apart | live model with separable parts (check the asset has them) |
| Travel through a world | pre-rendered flight scrubbed by scroll (motion skill §7) |
| Decorative background | **no 3D**: it is the AI look |

---

## 2. Sourcing real models (and licences)

| Source | Licence | Notes |
|---|---|---|
| Poly Haven models (https://polyhaven.com/models) | CC0 1.0 | photogrammetry quality, PBR textures up to 8K, glTF download; the Zyqor library checked 521 models via `api.polyhaven.com` on Oct 28 2026 |
| Khronos glTF Sample Assets (https://github.com/KhronosGroup/glTF-Sample-Assets) | per model (`metadata.json`): many CC0/CC-BY 4.0 | **leave out** models with non-free parts: DamagedHelmet (CC-BY-NC part), Sponza (CryEngine agreement), Stanford dragons, Duck (SCEA), VirtualCity, BrainStem; paint out Khronos/UX3D/Cesium logos |
| Smithsonian 3D (https://3d.si.edu) | CC0 for items marked so | museum scans, check each item |
| Sketchfab (downloadable, CC-BY or CC0) | per model | read the licence on the model page; CC-BY needs the exact attribution; "Editorial" or NC licences are not for client sites |
| A client's real product | theirs | the best option for PREMIUM: a scan or CAD export |
| Our own modelling | own work | for simple objects; must still look real (materials, bevels) |

Rules: write a credit file next to every model (`model.glb.credit.json`: title, author, source URL, licence, licence
URL, attribution, changes, date). Paint out maker logos and text on scans and replace them with the fictional brand
mark. No AI-generated meshes, no code-made placeholders (Drive D11, X4: the procedural torus-knot + icosahedron +
1,200-particle hero is exactly what is banned).

---

## 3. Optimise once, ship the same file to both devices

```bash
# gltf-transform (MIT), one command; keeps PBR, compresses geometry and textures
npx @gltf-transform/cli optimize in.glb out.glb --compress meshopt --texture-compress webp --texture-size 2048
npx @gltf-transform/cli inspect out.glb      # triangles, draw calls, texture sizes, extensions
```

Budgets that worked on the Zyqor library (same file desktop and phone): hero model 150-900 KB as GLB after
meshopt + WebP; 20k-200k triangles for a detailed scan (the components demo stage shows a 19,248-triangle scan
holding up full-screen); under 30 draw calls per scene. For heavy scans, decimate with a normal-map bake rather than
dropping below what reads at full-screen. The [`model-optimisation-phone`](../model-optimisation-phone/) skill has the
full pipeline and side-by-side proof renders.

Loader setup (meshopt and KTX2 decoders self-hosted, no CDN):

```js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
const manager = new THREE.LoadingManager();
manager.onProgress = (url, loaded, total) => setProgress(loaded / total);   // REAL progress (Drive M11), never a fake timer
const gltf = new GLTFLoader(manager).setMeshoptDecoder(MeshoptDecoder);
```

---

## 4. Renderer defaults

```js
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
const coarse = matchMedia('(pointer: coarse)').matches;
renderer.setPixelRatio(Math.min(devicePixelRatio, coarse ? 1.75 : 2));     // desktop: full 2x
renderer.outputColorSpace = THREE.SRGBColorSpace;                          // default since r152; set it anyway
renderer.toneMapping = THREE.ACESFilmicToneMapping;                        // or THREE.AgXToneMapping for less hue shift
renderer.toneMappingExposure = 1.0;                                        // tune per HDRI: 0.8-1.3
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
```

| Setting | Value | Why |
|---|---|---|
| Tone mapping | ACES Filmic (Drive D2) or AgX | film-like highlight roll-off; linear output looks like a game engine from 2008 |
| Exposure | 1.0 start, about 1.2 in the Drive's hero; tune by eye per HDRI | the HDRI decides brightness |
| Colour space | sRGB output, sRGB colour textures, linear data textures (normal, roughness) | wrong spaces = washed-out or crushed colours |
| DPR | min(dpr, 2) desktop; 1.5-2 phone | sharpness without 3x/4x fill cost |
| Clear colour | transparent (`alpha: true`) over the page canvas colour | the scene sits in the page palette, not a black box |

---

## 5. Lighting: HDRI + a rig, one logic for the whole site

```js
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
const pmrem = new THREE.PMREMGenerator(renderer);
const hdr = await new RGBELoader().loadAsync('studio_1k.hdr');
scene.environment = pmrem.fromEquirectangular(hdr).texture;   // reflections + diffuse light for every PBR material
hdr.dispose(); pmrem.dispose();
scene.environmentIntensity = 1.0;                             // r163+; balance against the rig

const key = new THREE.DirectionalLight(0xfff4e6, 2.2);  key.position.set(3, 4, 2);  key.castShadow = true;
key.shadow.mapSize.set(coarse ? 1024 : 2048, coarse ? 1024 : 2048); key.shadow.radius = 6; key.shadow.bias = -0.0005;
const rim = new THREE.DirectionalLight(0xdfe9ff, 1.4);  rim.position.set(-3, 2, -3);  // separates the silhouette from the page
scene.add(key, rim);
```

Rules (Drive D3, MMG §13): define key, rim, ambient (the HDRI), accent, shadow direction, intensity and contrast
**once** and keep it across every scene; the DOM's own highlights (glass edges, type shadows) come from the same
direction. Warm key + cool rim is the classic product look. Studio HDRIs for products, interior/outdoor HDRIs only
when the object belongs in that place. Never light with a single ambient light (flat, plastic).

One shared look per site (scroll-world's "style preamble", translated): the same HDRI, rig, tone mapping, material
palette, lens and grade for every scene, so separate scenes read as one world.

---

## 6. Materials that look real

Scans come with good PBR textures; keep them. When you author or tweak:

| Surface | Material settings (MeshPhysicalMaterial) |
|---|---|
| Lacquer, car paint, piano black (not black for Zyqor: use the palette's deep colour) | `metalness 0, roughness 0.35, clearcoat 1, clearcoatRoughness 0.04` |
| Brushed metal | `metalness 1, roughness 0.3, anisotropy 0.6, anisotropyRotation` along the brush direction |
| Polished metal | `metalness 1, roughness 0.08`; needs a good HDRI or it looks grey |
| Glass | `transmission 1, thickness 0.5, ior 1.5, roughness 0.02, attenuationColor` tinted from the palette |
| Ceramic glaze | `roughness 0.2-0.35, clearcoat 0.6, clearcoatRoughness 0.15` |
| Fabric, velvet | `roughness 0.9, sheen 1, sheenRoughness 0.5, sheenColor` |
| Skin, wax, soap | `transmission 0.2-0.4, thickness 1` (cheap subsurface look) |

Never "clay" grey on a hero (Zyqor's N004 mistake). Colour accents in the model come from the site's three colours
(colour-systems skill): one part in the accent, the rest true to the material.

---

## 7. Contact shadow: grounding the object

Every grounded object needs a soft shadow where it touches (Drive D4: *"contact shadows... Do not make objects look
like they were pasted on top"*).

```js
const ground = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.ShadowMaterial({ opacity: 0.22 }));
ground.rotation.x = -Math.PI / 2; ground.position.y = box.min.y; ground.receiveShadow = true; scene.add(ground);
model.traverse((o) => { if (o.isMesh) o.castShadow = true; });
```
Alternatives: a baked AO plane (a blurred dark ellipse texture under the object, zero runtime cost), or a
render-target contact shadow (blurred depth from below) for moving objects. Floating objects (product in a world,
ayzz pattern H) still get a soft shadow below them that grows and fades with the float height.

---

## 8. Camera and framing (desktop and portrait)

- **Product lens**: FOV 25-35° (less distortion, the "telephoto" look of product photography). Interiors 45-60°.
- **Frame from the bounding sphere**, so any model and any aspect is framed the same:

```js
function frame(camera, object, fill = 0.72) {             // fill = share of the frame the object occupies
  const sphere = new THREE.Box3().setFromObject(object).getBoundingSphere(new THREE.Sphere());
  const vfov = THREE.MathUtils.degToRad(camera.fov);
  const hfov = 2 * Math.atan(Math.tan(vfov / 2) * camera.aspect);
  const fov = Math.min(vfov, hfov);                       // portrait phones: the horizontal FOV is the tight one
  const dist = sphere.radius / Math.sin(fov / 2) / fill;
  camera.position.copy(sphere.center).add(new THREE.Vector3(0, sphere.radius * 0.25, dist));
  camera.near = dist / 100; camera.far = dist * 10; camera.updateProjectionMatrix(); camera.lookAt(sphere.center);
  return { center: sphere.center, dist };
}
```
- **Compose for the centre** (scroll-world T18): keep the subject centred with headroom; nothing essential at the
  edges; the same rule makes 16:9 and 9:16 renders both work.
- Camera grammar by concept (unique-idea skill §4): product = slow half-orbit; interiors = steadicam; and so on.

---

## 9. Scroll-driven camera beats (the five-chapter product arc)

From the Master Award System (Structure 03): a fixed full-viewport canvas synced with Lenis and ScrollTrigger
(scrub 1.2), about 500vh in five chapters:

| Chapter | Camera / object | UI |
|---|---|---|
| 1 Silhouette | object dark against rim light, oversized type behind it | headline only |
| 2 Orbit | 90° orbit, macro on the material | a glass HUD card with one spec |
| 3 Exploded | parts separate along their axes | 1px SVG leader lines to labelled parts |
| 4 Finish studio | pinned; swatches change material and studio light | swatch buttons |
| 5 Spec sheet | object settles, smaller | spec ledger + sticky reservation bar |

Implement beats as **keyframes on one progress value** (0-1), eased per segment, so scrolling backwards plays the
story backwards:

```js
const beats = [ { p: 0, az: -0.6, el: 0.15, d: 1.0 }, { p: 0.5, az: 0.9, el: 0.35, d: 0.75 }, { p: 1, az: 2.4, el: 0.1, d: 1.1 } ];
const ease = (t) => 1 - Math.pow(1 - t, 3);
function cameraAt(progress) {
  let i = 0; while (i < beats.length - 2 && progress > beats[i + 1].p) i++;
  const a = beats[i], b = beats[i + 1], t = ease((progress - a.p) / (b.p - a.p));
  const lerp = (x, y) => x + (y - x) * t;
  return { az: lerp(a.az, b.az), el: lerp(a.el, b.el), d: lerp(a.d, b.d) };
}
```
Seams between chapters: never reverse direction across a beat boundary (scroll-world T6); ease into a slow constant
drift at the end of each beat.

---

## 10. The finish studio (configurator)

Swatches that change the material **and** the light (Drive D7). Real `<button>`s with `aria-pressed`, labels, keyboard
focus; the change animates over 600-700 ms on the settle curve; the page's colour tokens can flood with the finish
(colour-systems §9).

```js
const finishes = { glaze: { color: 0xffffff, roughness: 0.25 }, clay: { color: 0xd9a58a, roughness: 0.6 }, celadon: { color: 0xb9d3c4, roughness: 0.18 } };
function setFinish(name) {
  const f = finishes[name]; const to = new THREE.Color(f.color);
  model.traverse((o) => { if (!o.isMesh) return; const m = o.material; const from = m.color.clone(), r0 = m.roughness; let t0 = null;
    const step = (now) => { t0 ??= now; const k = Math.min(1, (now - t0) / 650), e = 1 - Math.pow(1 - k, 4);
      m.color.lerpColors(from, to, e); m.roughness = r0 + (f.roughness - r0) * e; requestRender(); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step); });
}
```

---

## 11. Performance without lowering quality

- **Render on demand**: render when the camera, a material or the scroll changed; stop the loop when idle.
- **Pause off-screen and in hidden tabs**: `IntersectionObserver` on the canvas; `document.visibilitychange`.
- **One renderer per page** (scissor viewports if several views).
- **Lazy-create**: import three.js and the loaders when the stage is about 1 viewport away (dynamic `import()`).
- **Instancing** for repeats (`InstancedMesh`), merged static geometry, texture atlases.
- **Dispose** geometries, materials, textures and the PMREM target on teardown.
- Budgets: draw calls < 50-100, textures 2K for heroes (4K only for a macro chapter), shadow map 2048 desktop.
- Measure: `renderer.info.render.calls`, `renderer.info.render.triangles`, Performance panel at 1440 and a 4x CPU
  throttled 390 run.

---

## 12. The no-WebGL poster (never a blank canvas)

```js
function webglOK(){ try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch { return false; } }
if (!webglOK() || matchMedia('(prefers-reduced-motion: reduce)').matches) stage.classList.add('is-poster');   // show <img class="poster">
```
The poster is **our own render of the same model** (same lighting, same framing), saved as WebP for desktop and a
portrait one for phone. Drive D6: *"Disable WebGL... pass if a static image or simple layout appears. No blank
screen."* Under reduced motion you may keep the live model static (no auto-rotation, no scroll camera) instead of the
poster; both are acceptable.

---

## 13. Post-processing and shaders (sparingly)

- Post-processing (EffectComposer, or pmndrs `postprocessing`): SMAA/MSAA for crisp edges; bloom only on real
  emissive highlights (threshold above 1.0); a subtle vignette; film grain matches the page grain (colour skill §7).
  Every pass costs a full-screen draw: verify 60 fps after each.
- Shader portals and liquid backdrops (Drive D9, D10) belong to ADVANCED concepts that are about the effect, tinted
  from the site's three colours, paused off-screen, never the default hero. Chromatic aberration subtle or none.
- Banned: decorative particle fields, glowing orbs, wireframe shells, constant pulsing (Drive D11, M9).

---

## 14. Tiers

| | NORMAL ($300) | ADVANCED ($1k) | PREMIUM ($10k) |
|---|---|---|---|
| 3D | none, or one light model (<= 400 KB) | real model tied to scroll or drag; or a scrubbed render | detailed scan/authored model that holds a close-up crop |
| Lighting | RoomEnvironment or 1K HDRI, ACES | 1K HDRI + key/rim, contact shadow | art-directed HDRI + rig, day/night if used, contact shadow, shared light with DOM |
| Materials | as shipped | tuned PBR | clearcoat/transmission/sheen/anisotropy where the object has them |
| Motion | gentle turn on scroll | 3-4 camera beats, pinned | five-chapter arc, exploded view, finish studio |
| Post | none | SMAA | SMAA + subtle bloom on real highlights, grain |
| Phone | same model | same model, portrait framing | same model, portrait framing, side-by-side proof |
| Budget (own files) | <= 1.5 MB | <= 3 MB | <= 8 MB after a finished poster |

---

## 15. Do and don't

| Do | Because |
|---|---|
| Use a real scanned or authored model with a credit file | his real-assets rule; it looks real because it is |
| Light with an HDRI plus a key and a rim | reflections + shape + separation |
| Ground every object with a contact shadow | otherwise it floats like a sticker |
| Frame from the bounding sphere for each aspect | the phone gets the same composition |
| Drive progress from real loading | his "no fake 97%" rule |
| Render on demand and pause off-screen | 60 fps where it matters, cool phones |

| Don't | Because |
|---|---|
| Torus knots, icosahedra, particle fields as heroes | the code-made AI look (Drive D11) |
| Grey clay or default MeshStandardMaterial grey | lifeless; the N004 mistake |
| A separate low-poly mobile model | phone = same quality |
| Linear tone mapping with no environment | flat, game-like, wrong colours |
| An auto-rotating model that never stops | an endless loop (his 15 Oct rule) |
| A blank canvas when WebGL fails | Drive D6 |

---

## 16. Pre-ship checklist

- [ ] The model is real, credited (`.credit.json` + visible credits), logos painted out.
- [ ] `gltf-transform inspect`: triangles, draw calls, texture sizes noted; same GLB on phone and desktop.
- [ ] ACES (or AgX), sRGB output, exposure tuned; HDRI environment set; key + rim lights; contact shadow.
- [ ] Materials match the real surfaces; no grey clay.
- [ ] Framing from the bounding sphere checked at 1440 x 900, 390 x 844 and 360 x 740.
- [ ] Loading progress is real; a finished poster shows until the first frame renders.
- [ ] Render on demand; paused off-screen and on hidden tabs (check with the Performance panel).
- [ ] No-WebGL and reduced-motion runs show the poster or a static model, never a blank canvas.
- [ ] Finish swatches are buttons with labels, focus and `aria-pressed`.
- [ ] 60 fps desktop; >= 45 fps on a throttled phone run; 0 console errors or shader warnings at all three sizes.

## 17. Files

| File | What |
|---|---|
| `examples/index.html` | the stage: real CC0 scan, CC0 HDRI, ACES, rig, contact shadow, bounding-sphere framing, three scroll beats, finish studio, real progress, pause/resume, poster fallback, self-tests |


## Worked build: a product modelled in code, driven by scroll (P042 Tally Pad, Oct 30 2026)
The brief: a macro-pad launch page of our own (three keys, a knurled dial, a light bar), desktop with no compromise and a phone page that tells the same story. No downloaded model: the product is ~110 lines of `pad.js` and the page is ~155 lines of `app.js`. Live: `site/library/p/P042/`. Spec first: `docs/beast/specs/tally-pad_SPEC.md`.

### Why model it in code
- A fictional product has no scan to download, and a generated "AI" model is off-brand for the studio.
- Every part is a separate mesh with a name, so the story (take it apart, press a key, turn the dial, change the light) is just moving named meshes.
- The whole model costs about 25 KB of JavaScript. No GLB, no decoder, nothing to compress.

### Building blocks that read as real
| part | geometry | material | the detail that sells it |
|---|---|---|---|
| case | `RoundedBoxGeometry(w, h, d, 6, r)` | `MeshPhysicalMaterial` metalness 0.78, roughness 0.48, clearcoat 0.2 | rounded radius ~4 % of width; a hard box reads as a render |
| top plate | thin rounded box | metalness 0.55, roughness 0.5, a lighter warm grey | a different roughness from the case so the seam shows |
| switches | small boxes, sunk mostly below the plate | plastic, roughness 0.6 | visible only in the exploded view |
| keycaps | `RoundedBoxGeometry` with a 0.6 mm dish pushed into the top vertices | `MeshPhysicalMaterial` roughness 0.66-0.72 with a little `sheen` (0.2) for PBT-like plastic | cap bottoms just above the plate; caps floating over visible switch housings read as toys |
| dial | `CylinderGeometry` with 96 segments | metal with a **canvas normal map** for the knurl | knurl drawn as a height field, then converted to a tangent normal map; `normalScale` 0.2, not 0.5 (a deep knurl looks like mesh fabric) |
| light bar | thin rounded box, `MeshPhysicalMaterial` with `transmission` 0.55 and emissive | emissive colour + intensity animated | change the emissive colour and a matching `PointLight` (in front, low) together, so the light also lands on the table |
| shadow | one plane with a 256 px canvas radial gradient | `MeshBasicMaterial`, transparent, depthWrite false | no shadow maps; the soft contact patch is what grounds it |

### Explode by data, not by hand-written tweens
Each layer group (caps, switches, pcb, case) stores its rest height in `userData.y0`. One eased value per layer, staggered so the stack opens top-down:
```js
const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const lift = (i) => ss(0.15 + i * 0.08, 0.6 + i * 0.08, ex);    // ex = progress through the #explode section
L.caps.position.y     = L.caps.userData.y0     + 2.6 * lift(0);
L.switches.position.y = L.switches.userData.y0 + 1.6 * lift(1);
L.pcb.position.y      = L.pcb.userData.y0      + 0.4 * lift(2);
```
The case stays put, so the eye has an anchor. The layer names are an HTML list beside the canvas whose items light up with the same `lift` values (no 3D text).

### Camera: one keyframe per section, eased between them
```js
const K = {
  hero:    { pos: V(14, 12, 24),   tgt: V(0, 0.8, 0),  sx: 0.2,  sy: 0.02 },
  explode: { pos: V(24, 11, 19),   tgt: V(0, 2.4, 0),  sx: 0.21, sy: 0 },
  keys:    { pos: V(6, 21, 21),    tgt: V(-0.6, 1.2, 0), sx: 0.17, sy: 0 },
  dial:    { pos: V(19, 13, 15),   tgt: V(2.2, 1.4, 0), sx: 0.21, sy: 0 },
  light:   { pos: V(0.01, 40, 11), tgt: V(0, 0, 0.6),  sx: 0.21, sy: 0 }
};
```
Each frame: find the active section and the previous one, blend the two keyframes by the section's progress, then lerp the live camera towards the blend (factor 0.12 per frame; 1 under `prefers-reduced-motion`).

**Framing rule: shift the picture, never the look direction.** Our first version put the model on the right by aiming the camera at a point left of the model (`tgt.x = -8`). In the top-down light shot that rolled the whole product about 20 degrees, and in close shots it pushed the pad off the edge. The fix is a screen-space shift:
```js
cam.position.copy(pos); cam.lookAt(tgt);               // tgt = the part you are talking about
cam.setViewOffset(innerWidth, innerHeight, -sx * innerWidth, -sy * innerHeight, innerWidth, innerHeight);
```
`sx = 0.2` moves the product a fifth of the screen to the right, leaving the left for copy. Interpolate `sx`/`sy` like the camera. Remember `clearViewOffset()` if a section wants the model centred.

### Phone: same story, different distance
A portrait screen has about half the horizontal field of view. Copying the desktop camera cropped the pad on every section. What worked:
- multiply each camera position by **1.9** (hero, explode) or **1.7** (close sections);
- `sx = 0`, `sy = -0.2`: the product sits in the top half, the copy card in the bottom half;
- check the phone at 390 and 360 px; the 360 shot is where a tight crop shows first.

### The CLS trap in a canvas page
First load scored **CLS 1.0** on a page whose canvas never moves. The cause: inline `<svg>` icons with only a `viewBox` render at full container width for one frame before the CSS arrives (we measured an SVG at 1421 x 883 px for 70 ms), then collapse, and the hero section shifts by its full height. Two fixes, both needed:
- give every inline SVG a `width` and `height` attribute;
- load the shared kit CSS (`chrome.css`, `liquid-glass.css`, `premium.css`) as render-blocking `<link>`s in the head, not injected by JavaScript.
After: CLS 0.004-0.009 at 1440, 390 and 360.

### Poster from the real scene
The poster (shown before WebGL starts, and as the no-WebGL fallback) must be the same model, not a mock-up. Open the page headless at 1600 x 1000, wait for the first frames, hide everything except the canvas (`document.querySelectorAll('body > *:not(.tp-stage)').forEach(e => e.style.visibility = 'hidden')`), screenshot, save WebP q82. Give it a `.credit.json` that says "own render".

### QA that caught real bugs on this build
- section-by-section screenshots at 1440 and 390 in one contact sheet (found the cropped close-ups and the rolled top-down shot);
- CLS with the shift sources listed (found the SVG flash);
- a run with reduced motion at 360 px, clicking the finish and light buttons;
- console errors and failed requests: 0 on all four runs, locally and on the live host.

## Sources

- Sujon Hoque (Zyqor Studio): WhatsApp 27 Oct 2026 6:22 PM (real premium models, no code-made look), 27 Oct 2026 8:23 PM (phone same models and quality, compressed), 28 Oct 2026 9:42 AM (new websites use real models), 30 Oct 2026 ("PC me no compromise"), 15 Oct 2026 (no endless loops).
- Sujon's Drive: *Master-Award-Website-Guide-Improved-v4.2* Part E §7 Part A (renderer code, 3-point studio lighting, never an empty canvas), Part B (liquid shader), Structures 03 (five-chapter arc, finish studio) and 14 (shader portals); Part F item 11 *Master Motion Graphics Video Creator* §8, §12, §13, §28; *Website-Building-Guide-New-Site.md* §3, §7 (3D fallback test), §10b; *DESIGN-LIBRARY-INDEX.md* §2 (different real object per section).
- Drive points D1-D11, M11, X4, X8, X17 (`docs/beast/SKILLS_SOURCE_MAP.md`).
- scroll-world by cyw (MIT), https://github.com/oso95/scroll-world: seam and velocity laws (T5, T6), camera grammar (T7), one shared look (T17), compose for the centre (T18), previz before final (T20).
- Zyqor library asset checks (Poly Haven API, Khronos `metadata.json` exclusions) from the CONCEPTS_300 catalogue, 28 Oct 2026; the components `scroll-3d-stage` (19,248-triangle CC0 scan).
- three.js r170 documentation (WebGLRenderer, PMREMGenerator, MeshPhysicalMaterial, LoadingManager), https://threejs.org/docs/ ; glTF-Transform, https://gltf-transform.dev ; Poly Haven, https://polyhaven.com ; Khronos glTF Sample Assets.
- Award examples: Lusion v3, Opal Tadpole, Igloo Inc and Messenger (abeto), Overworld Audio, via Awwwards pages read Oct 30 2026 (`docs/how-top-designers-build-unique-sites.md` §5).
- Demo assets: "Ceramic Vase 01" by James Ray Cock, Poly Haven, CC0 1.0; "Studio Small 09" HDRI by Sergej Majboroda, Poly Haven, CC0 1.0 (`site/assets/hdri/studio_1k.hdr`).
