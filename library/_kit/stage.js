/* Zyqor Library kit: stage.js  -  one call sets up a correct three.js scene for a concept.

   import { createStage, THREE } from '../../_kit/stage.js';
   const stage = await createStage({ el: document.querySelector('[data-stage]') });
   const gltf = await stage.load(stage.asset('models/ceramic_vase_01.glb'));
   stage.fit(gltf.scene, 1.6, true);  stage.scene.add(gltf.scene);
   stage.contactShadow({ size: 3, opacity: .55 });
   stage.spin(gltf.scene);                       // drag / swipe / arrow keys, with inertia
   stage.onFrame((dt, t) => { ... });            // only runs while the stage is on screen

   What you get, so no concept re-solves it:
   - WebGLRenderer: sRGB output, ACES Filmic, exposure, DPR capped at 2 (both builds), adaptive DPR if frames are slow.
   - Environment: instant RoomEnvironment, then the shared Poly Haven HDRI (Studio Small 09, CC0) swapped in after first paint.
   - GLTFLoader with meshopt + Draco + KTX2 decoders (self-hosted under /vendor/three/addons/libs/).
   - Lazy: the WebGL context is created only when the stage comes near the viewport (opts.lazy, default true).
   - Pause: the loop stops while the stage is off screen or the tab is hidden.
   - Poster fallback: if WebGL is missing or the context is lost, <img class="poster" src="poster.webp"> is shown
     (or a palette card with the concept name if no poster exists yet). The returned stage then has failed=true and
     every method is a safe no-op, so app code never crashes.
   - Reduced motion: stage.reduced is true; auto-rotation and idle motion are off; scroll scenes should jump, not glide.
   - Scroll hook: stage.scroll(sectionEl, p => ...) gives 0..1 progress (GSAP ScrollTrigger scrub when present).
   The same file runs the phone build (<html data-build="m">); the phone loads the SAME assets. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

export { THREE };
export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const coarse = matchMedia('(hover: none) and (pointer: coarse)').matches;
export const isM = document.documentElement.dataset.build === 'm';
export const lerp = (a, b, t) => a + (b - a) * t;
export const damp = (a, b, k, dt) => lerp(a, b, 1 - Math.exp(-k * dt));
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const smoothstep = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };

const LIB = new URL('../', import.meta.url);                       // site/library/
const VENDOR = new URL('../../vendor/three/addons/libs/', import.meta.url);
const HDRI = new URL('../../assets/hdri/', import.meta.url);
const HDR_FILES = { 1024: 'studio_1k.hdr', 512: 'studio_512.hdr', 256: 'studio_256.hdr' };

/* shared loader (one per page) */
let _gltf = null, _ktx2 = null, _draco = null;
function gltfLoader(renderer) {
  if (_gltf) return _gltf;
  _draco = new DRACOLoader().setDecoderPath(new URL('draco/gltf/', VENDOR).href);
  _ktx2 = new KTX2Loader().setTranscoderPath(new URL('basis/', VENDOR).href);
  if (renderer) _ktx2.detectSupport(renderer);
  _gltf = new GLTFLoader().setDRACOLoader(_draco).setKTX2Loader(_ktx2).setMeshoptDecoder(MeshoptDecoder);
  return _gltf;
}
const hdrCache = new Map();
function loadHDR(renderer, src) {
  const url = typeof src === 'number' ? new URL(HDR_FILES[src] || HDR_FILES[512], HDRI).href : src;
  if (hdrCache.has(url)) return hdrCache.get(url);
  const get = () => new RGBELoader().setDataType(THREE.HalfFloatType).loadAsync(url);
  // one retry: phones drop requests on flaky networks, and a lost HDRI would silently leave the room fallback
  const p = get().catch(() => new Promise((r) => setTimeout(r, 400)).then(get)).then((hdr) => {
    hdr.mapping = THREE.EquirectangularReflectionMapping;
    const pm = new THREE.PMREMGenerator(renderer); const env = pm.fromEquirectangular(hdr).texture; pm.dispose(); hdr.dispose(); return env;
  });
  hdrCache.set(url, p); return p;
}

function webglOK() {
  try { const c = document.createElement('canvas'); return !!(window.WebGL2RenderingContext && c.getContext('webgl2')) || !!c.getContext('webgl'); } catch { return false; }
}
function whenNear(el, margin) {
  return new Promise((res) => {
    if (!('IntersectionObserver' in window)) return res();
    const io = new IntersectionObserver((ents) => { if (ents.some((e) => e.isIntersecting)) { io.disconnect(); res(); } }, { rootMargin: margin });
    io.observe(el);
  });
}

/* poster / palette-card fallback */
function showFallback(el, opts, reason) {
  el.classList.remove('is-loading'); el.classList.add('is-fallback'); el.dataset.fallback = reason;
  let img = el.querySelector('img.poster');
  const posterUrl = opts.poster === false ? null : (opts.poster || 'poster.webp');
  if (!img && posterUrl) { img = document.createElement('img'); img.className = 'poster'; img.alt = opts.posterAlt || ''; img.decoding = 'async'; img.src = posterUrl; el.append(img); }
  const card = () => { if (el.querySelector('.stage-fallback-card')) return; const d = document.createElement('div'); d.className = 'stage-fallback-card'; d.textContent = (document.body.dataset.name || 'Concept') + ' · 3D preview needs WebGL'; el.append(d); };
  if (img) img.addEventListener('error', () => { img.remove(); card(); }, { once: true }); else card();
  window.__stage = Object.assign(window.__stage || {}, { ok: false, reason });
}

/* the no-op stage returned when WebGL is unavailable */
function deadStage(el, reason) {
  const noop = () => {}; const self = () => dead;
  const dead = { failed: true, reason, el, THREE, reduced, isM, scene: null, camera: null, renderer: null, ready: Promise.resolve(),
    load: () => new Promise(() => {}), loadTexture: () => new Promise(() => {}), asset: (p) => new URL('_assets/' + p, LIB).href, fit: (o) => o,
    add: self, onFrame: noop, offFrame: noop, invalidate: noop, start: noop, stop: noop, contactShadow: () => null, spin: () => ({ angle: 0, velocity: 0, set: noop }),
    scroll: noop, pointer: { x: 0, y: 0 }, setEnv: () => Promise.resolve(null), dispose: noop, render: noop };
  return dead;
}

export async function createStage(opts = {}) {
  const el = typeof opts.el === 'string' ? document.querySelector(opts.el) : (opts.el || document.querySelector('[data-stage]'));
  if (!el) throw new Error('createStage: no stage element ([data-stage])');
  el.classList.add('stage', 'is-loading');
  if (!el.querySelector('.stage-load')) { const s = document.createElement('span'); s.className = 'stage-load'; s.setAttribute('aria-hidden', 'true'); s.textContent = 'Loading 3D'; el.append(s); }
  if (!webglOK()) { showFallback(el, opts, 'no-webgl'); return deadStage(el, 'no-webgl'); }
  if (opts.lazy !== false) await whenNear(el, opts.lazyMargin || '240px 0px');

  const dprCap = opts.dpr || 2;
  let canvas = el.querySelector('canvas');
  if (!canvas) { canvas = document.createElement('canvas'); el.prepend(canvas); }
  if (opts.label) { canvas.setAttribute('role', 'img'); canvas.setAttribute('aria-label', opts.label); }
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: opts.antialias ?? true, alpha: opts.alpha ?? true, powerPreference: 'high-performance', preserveDrawingBuffer: !!opts.preserve });
  } catch (e) { showFallback(el, opts, 'context-failed'); return deadStage(el, 'context-failed'); }
  let dpr = Math.min(window.devicePixelRatio || 1, dprCap);
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = opts.toneMapping ?? THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = opts.exposure ?? 1;
  if (opts.shadows) { renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; }
  if (opts.clearColor !== undefined) renderer.setClearColor(opts.clearColor, opts.clearAlpha ?? 1);

  const scene = new THREE.Scene();
  if (opts.background) scene.background = new THREE.Color(opts.background);
  const cam = opts.camera || {};
  const camera = new THREE.PerspectiveCamera(cam.fov ?? 32, 1, cam.near ?? 0.05, cam.far ?? 200);
  camera.position.set(...(cam.position || [0, 1.1, 5]));
  const target = new THREE.Vector3(...(cam.target || [0, 0.6, 0]));
  camera.lookAt(target);

  /* loop state (declared first: resize() and setEnv() call invalidate()) */
  const frameFns = new Set();
  let visible = true, running = false, raf = 0, last = performance.now(), dirty = true, t = 0;
  const demand = !!opts.demand;                               // render only when something changed
  function invalidate() { dirty = true; if (!running && visible && demand) kick(); }

  /* environment: instant room, then the HDRI after first paint */
  const pm = new THREE.PMREMGenerator(renderer);
  const room = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose();
  scene.environment = room;
  if (opts.envIntensity !== undefined) scene.environmentIntensity = opts.envIntensity;
  if (opts.envRotation !== undefined) scene.environmentRotation.y = opts.envRotation;
  const hdri = opts.hdri === undefined ? 512 : opts.hdri;
  const setEnv = (src) => loadHDR(renderer, src).then((env) => { scene.environment = env; if (opts.envBackground) scene.background = env; invalidate(); return env; }).catch(() => null);
  if (hdri) { const go = () => setEnv(hdri); ('requestIdleCallback' in window) ? requestIdleCallback(go, { timeout: 1200 }) : setTimeout(go, 300); }

  /* size */
  const size = { w: 1, h: 1 };
  function resize() {
    const r = el.getBoundingClientRect(); const w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
    if (w === size.w && h === size.h) return; size.w = w; size.h = h;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    if (opts.fitFov) { const base = cam.fov ?? 32; camera.fov = w / h < 1 ? Math.min(base * 1.6, base / (w / h) ** 0.55) : base; }
    camera.updateProjectionMatrix(); invalidate();
    frameFns.forEach((f) => f.resize && f.resize(w, h));
  }
  const ro = new ResizeObserver(resize); ro.observe(el); resize();

  /* loop */
  const perf = { n: 0, sum: 0, lowered: false };
  function tick(now) {
    raf = 0; if (!visible) { running = false; return; }
    const dt = Math.min(0.1, (now - last) / 1000); last = now; t += dt;   // cap 0.1 s: slow GPUs still converge in wall-clock time
    let wants = !demand;
    for (const f of frameFns) { if (f(dt, t) === true) wants = true; }
    if (dirty || wants) { renderer.render(scene, camera); dirty = false; }
    /* adaptive DPR: if the first 90 frames average over 24 ms, step down once (2 -> 1.5 -> 1) */
    if (!perf.lowered && dt > 0) { perf.n++; perf.sum += dt; if (perf.n === 90) { if (perf.sum / 90 > 0.024 && dpr > 1) { dpr = Math.max(1, dpr - 0.5); renderer.setPixelRatio(dpr); size.w = 0; resize(); } perf.lowered = perf.sum / 90 <= 0.024; perf.n = 0; perf.sum = 0; } }
    if (!demand || wants || dirty) { raf = requestAnimationFrame(tick); running = true; } else running = false;
  }
  function kick() { if (raf) return; last = performance.now(); raf = requestAnimationFrame(tick); running = true; }
  const vis = new IntersectionObserver(([e]) => { visible = e.isIntersecting && !document.hidden; if (visible) kick(); }, { threshold: 0 });
  vis.observe(el);
  const onVis = () => { visible = !document.hidden && el.getBoundingClientRect().bottom > 0 && el.getBoundingClientRect().top < innerHeight; if (visible) kick(); };
  document.addEventListener('visibilitychange', onVis);

  /* context loss -> poster */
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); showFallback(el, opts, 'context-lost'); }, false);

  /* pointer (normalised -1..1 over the stage), for parallax / hover looks; phones get it from touch */
  const pointer = { x: 0, y: 0, active: false };
  el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1; pointer.y = -(((e.clientY - r.top) / r.height) * 2 - 1); pointer.active = true; invalidate(); }, { passive: true });
  el.addEventListener('pointerleave', () => { pointer.active = false; }, { passive: true });

  const stage = {
    failed: false, el, THREE, scene, camera, renderer, target, reduced, isM, pointer, size,
    get dpr() { return dpr; },
    asset: (p) => new URL('_assets/' + p, LIB).href,     // site/library/_assets/<p>, shared by all concepts
    load(url, onProgress) { return gltfLoader(renderer).loadAsync(url, onProgress).then((g) => { invalidate(); return g; }); },
    loadTexture(url, { srgb = true, repeat, anisotropy = 8 } = {}) {
      return new THREE.TextureLoader().loadAsync(url).then((tx) => { if (srgb) tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = Math.min(anisotropy, renderer.capabilities.getMaxAnisotropy()); if (repeat) { tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(...(Array.isArray(repeat) ? repeat : [repeat, repeat])); } invalidate(); return tx; });
    },
    fit(obj, maxSize = 1, sit = false) {                      // scale so the largest side == maxSize, centre on origin, optionally sit on y=0
      const b = new THREE.Box3().setFromObject(obj), s = b.getSize(new THREE.Vector3());
      obj.scale.multiplyScalar(maxSize / Math.max(s.x, s.y, s.z));
      const b2 = new THREE.Box3().setFromObject(obj), c = b2.getCenter(new THREE.Vector3());
      obj.position.sub(c); if (sit) obj.position.y += (b2.max.y - b2.min.y) / 2;
      obj.updateMatrixWorld(true); return obj;
    },
    add(...o) { scene.add(...o); invalidate(); return stage; },
    onFrame(fn) { frameFns.add(fn); kick(); return fn; },
    offFrame(fn) { frameFns.delete(fn); },
    invalidate, setEnv,
    render() { renderer.render(scene, camera); },
    start() { visible = true; kick(); }, stop() { visible = false; },
    contactShadow: (o) => contactShadow(stage, o),
    spin: (obj, o) => spin(stage, obj, o),
    scroll: (sec, fn, o) => scrollProgress(sec, fn, o),
    dispose() { cancelAnimationFrame(raf); ro.disconnect(); vis.disconnect(); document.removeEventListener('visibilitychange', onVis); renderer.dispose(); }
  };
  stage.ready = new Promise((r) => requestAnimationFrame(() => r()));
  /* remove the loading veil after the first frame that has content; apps may call stage.loaded() themselves */
  stage.loaded = () => { el.classList.remove('is-loading'); el.classList.add('is-ready'); invalidate(); };
  window.__stage = { ok: true, webgl2: renderer.capabilities.isWebGL2, dpr, id: document.body.dataset.id };
  kick();
  return stage;
}

/* ---------------- contact shadow ----------------
   A soft, physically placed shadow under the object (three.js "contact shadows" technique: depth from below,
   blurred twice). update: 'once' (static object: rendered once, then free) | 'always' | N (every N frames). */
export function contactShadow(stage, o = {}) {
  if (stage.failed) return null;
  const { THREE: T, scene, renderer } = stage;
  const size = o.size ?? 3, res = o.resolution ?? (isM ? 256 : 512), blur = o.blur ?? 2.6, darkness = o.darkness ?? 1.6, opacity = o.opacity ?? 0.6, height = o.height ?? 1.2, y = o.y ?? 0.001;
  const group = new T.Group(); group.position.y = y; scene.add(group);
  const rt = new T.WebGLRenderTarget(res, res); rt.texture.generateMipmaps = false;
  const rtB = new T.WebGLRenderTarget(res, res); rtB.texture.generateMipmaps = false;
  const planeGeo = new T.PlaneGeometry(size, size).rotateX(Math.PI / 2);
  const col = new T.Color(o.color ?? 0x000000);
  const plane = new T.Mesh(planeGeo, new T.MeshBasicMaterial({ map: rt.texture, opacity, transparent: true, depthWrite: false, color: col }));
  plane.renderOrder = 1; plane.scale.y = -1; group.add(plane);
  const blurPlane = new T.Mesh(planeGeo); blurPlane.visible = false; group.add(blurPlane);
  const cam = new T.OrthographicCamera(-size / 2, size / 2, size / 2, -size / 2, 0, height); cam.rotation.x = Math.PI / 2; group.add(cam);
  const depthMat = new T.MeshDepthMaterial(); depthMat.userData.darkness = { value: darkness };
  depthMat.onBeforeCompile = (sh) => { sh.uniforms.darkness = depthMat.userData.darkness; sh.fragmentShader = 'uniform float darkness;\n' + sh.fragmentShader.replace('gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );', 'gl_FragColor = vec4( vec3( 0.0 ), ( 1.0 - fragCoordZ ) * darkness );'); };
  depthMat.depthTest = false; depthMat.depthWrite = false;
  const blurMat = (dir) => new T.ShaderMaterial({ uniforms: { tDiffuse: { value: null }, h: { value: 1 / 256 } }, depthTest: false, depthWrite: false,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform sampler2D tDiffuse; uniform float h; varying vec2 vUv; void main(){ vec4 s = vec4(0.0); vec2 d = ${dir === 'h' ? 'vec2(h,0.0)' : 'vec2(0.0,h)'};
      s += texture2D(tDiffuse, vUv - 4.0*d) * 0.051; s += texture2D(tDiffuse, vUv - 3.0*d) * 0.0918; s += texture2D(tDiffuse, vUv - 2.0*d) * 0.12245; s += texture2D(tDiffuse, vUv - d) * 0.1531;
      s += texture2D(tDiffuse, vUv) * 0.1633; s += texture2D(tDiffuse, vUv + d) * 0.1531; s += texture2D(tDiffuse, vUv + 2.0*d) * 0.12245; s += texture2D(tDiffuse, vUv + 3.0*d) * 0.0918; s += texture2D(tDiffuse, vUv + 4.0*d) * 0.051; gl_FragColor = s; }` });
  const hB = blurMat('h'), vB = blurMat('v');
  function blurPass(amount) {
    blurPlane.visible = true;
    blurPlane.material = hB; hB.uniforms.tDiffuse.value = rt.texture; hB.uniforms.h.value = amount / 256; renderer.setRenderTarget(rtB); renderer.render(blurPlane, cam);
    blurPlane.material = vB; vB.uniforms.tDiffuse.value = rtB.texture; vB.uniforms.h.value = amount / 256; renderer.setRenderTarget(rt); renderer.render(blurPlane, cam);
    blurPlane.visible = false;
  }
  function draw() {
    const bg = scene.background, ov = scene.overrideMaterial, pv = plane.visible, cc = renderer.getClearAlpha();
    scene.background = null; plane.visible = false; scene.overrideMaterial = depthMat; renderer.setClearAlpha(0);
    const hidden = []; (o.exclude || []).forEach((m) => { if (m.visible) { m.visible = false; hidden.push(m); } });
    renderer.setRenderTarget(rt); renderer.clear(); renderer.render(scene, cam);
    scene.overrideMaterial = ov; hidden.forEach((m) => (m.visible = true));
    blurPass(blur); blurPass(blur * 0.4);
    renderer.setRenderTarget(null); renderer.setClearAlpha(cc); scene.background = bg; plane.visible = pv;
    stage.invalidate();
  }
  const upd = o.update ?? 'once';
  let n = 0;
  if (upd === 'once') { requestAnimationFrame(draw); }
  else stage.onFrame(() => { if (upd === 'always' || (n++ % upd === 0)) draw(); });
  return { group, plane, draw, set opacity(v) { plane.material.opacity = v; stage.invalidate(); } };
}

/* ---------------- spin: drag / swipe / keys with inertia ----------------
   Horizontal drag turns the object; vertical swipes still scroll the page on phones (touch-action: pan-y).
   Arrow keys turn it when the canvas has focus. Returns live state { angle, velocity } and set(angle). */
export function spin(stage, obj, o = {}) {
  const st = { angle: obj.rotation.y, velocity: 0, dragging: false };
  if (stage.failed) return Object.assign(st, { set() {} });
  const el = stage.el, canvas = stage.renderer.domElement;
  const friction = o.friction ?? 0.94, sens = o.sensitivity ?? 0.0105, auto = reduced ? 0 : (o.auto ?? 0.18), maxV = o.maxVelocity ?? 0.6;
  el.dataset.drag = '';
  canvas.tabIndex = 0;
  if (!canvas.getAttribute('aria-label')) canvas.setAttribute('aria-label', (o.label || 'Drag or use the arrow keys to turn the object'));
  canvas.setAttribute('role', 'img');
  let px = 0, py = 0, lastX = 0, lastT = 0, id = null, decided = false, horizontal = false, idleFor = 9;
  el.addEventListener('pointerdown', (e) => { if (e.button > 0) return; id = e.pointerId; px = lastX = e.clientX; py = e.clientY; lastT = performance.now(); decided = e.pointerType === 'mouse'; horizontal = decided; st.dragging = true; st.velocity = 0; if (decided) { el.setPointerCapture(id); el.classList.add('is-dragging'); } o.onStart && o.onStart(); stage.invalidate(); });
  el.addEventListener('pointermove', (e) => {
    if (e.pointerId !== id || !st.dragging) return;
    if (!decided) { const dx = Math.abs(e.clientX - px), dy = Math.abs(e.clientY - py); if (dx + dy < 6) return; decided = true; horizontal = dx > dy; if (!horizontal) { st.dragging = false; id = null; return; } el.setPointerCapture(id); el.classList.add('is-dragging'); }
    const now = performance.now(), dx = e.clientX - lastX; const dA = dx * sens;
    st.angle += dA; st.velocity = clamp(dA / Math.max(0.008, (now - lastT) / 1000) * 0.016, -maxV, maxV); lastX = e.clientX; lastT = now; idleFor = 0; stage.invalidate();
  });
  const up = (e) => { if (e.pointerId !== id) return; st.dragging = false; id = null; el.classList.remove('is-dragging'); if (performance.now() - lastT > 90) st.velocity *= 0.3; o.onEnd && o.onEnd(st.velocity); };
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  canvas.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); st.velocity += (e.key === 'ArrowLeft' ? -1 : 1) * 0.12; idleFor = 0; stage.invalidate(); } });
  stage.onFrame((dt) => {
    let moving = false;
    if (!st.dragging) {
      const f = Math.pow(friction, dt * 60); st.velocity *= f; st.angle += st.velocity * dt * 60; idleFor += dt;
      if (Math.abs(st.velocity) > 0.0004) moving = true;
      if (auto && idleFor > 2.2) { st.angle += auto * dt * Math.min(1, (idleFor - 2.2) / 1.2); moving = true; }
    } else moving = true;
    obj.rotation.y = st.angle; o.onSpin && o.onSpin(st);
    return moving;
  });
  st.set = (a) => { st.angle = a; st.velocity = 0; stage.invalidate(); };
  st.kick = (v) => { st.velocity = v; idleFor = 0; stage.invalidate(); };
  return st;
}

/* ---------------- scroll progress ----------------
   scrollProgress(section, p => {...}, { start: 'top top', end: 'bottom bottom', scrub: true })
   Uses GSAP ScrollTrigger when the page loaded it (desktop: Lenis-smoothed), else a light native listener (phone). */
export function scrollProgress(section, fn, o = {}) {
  const el = typeof section === 'string' ? document.querySelector(section) : section;
  if (!el) return null;
  if (window.ScrollTrigger && window.gsap && !o.native) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    return window.ScrollTrigger.create({ trigger: el, start: o.start || 'top top', end: o.end || 'bottom bottom', scrub: reduced ? false : (o.scrub ?? true), onUpdate: (s) => fn(s.progress, s) });
  }
  let raf = 0;
  const calc = () => { raf = 0; const r = el.getBoundingClientRect(); const total = r.height - innerHeight; const p = total > 0 ? clamp(-r.top / total) : clamp((innerHeight - r.top) / (innerHeight + r.height)); fn(p); };
  const on = () => { if (!raf) raf = requestAnimationFrame(calc); };
  addEventListener('scroll', on, { passive: true }); addEventListener('resize', on); calc();
  return { kill() { removeEventListener('scroll', on); removeEventListener('resize', on); } };
}

/* ---------------- smooth scroll (desktop only; phones keep native scroll) ---------------- */
export function smooth(o = {}) {
  if (reduced || isM || coarse || !window.Lenis) return null;
  const lenis = new window.Lenis({ lerp: o.lerp ?? 0.1, smoothWheel: true });
  if (window.ScrollTrigger) lenis.on('scroll', window.ScrollTrigger.update);
  if (window.gsap) { window.gsap.ticker.add((t) => lenis.raf(t * 1000)); window.gsap.ticker.lagSmoothing(0); }
  else { const f = (t) => { lenis.raf(t); requestAnimationFrame(f); }; requestAnimationFrame(f); }
  window.__lenis = lenis; return lenis;
}
