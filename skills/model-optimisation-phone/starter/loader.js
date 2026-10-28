// loader.js: one three.js viewer that desktop AND phone use for the SAME optimised GLB.
// Part of the model-optimisation-phone skill (Zyqor Studio, MIT).
// GLTFLoader + MeshoptDecoder + DRACOLoader + KTX2Loader, HDRI + ACES, lazy load on view,
// pause off-screen, DPR cap 2, poster fallback when WebGL fails, reduced motion respected.
//
//   import { createViewer } from './loader.js';
//   const v = createViewer({ el: document.querySelector('.stage'), model: 'model.glb',
//     hdr: 'studio_1k.hdr', decoders: { draco: 'vendor/draco/', basis: 'vendor/basis/' } });
//   v.ready.then(() => v.goTo('detail'));
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const easeOutExpo = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

export function webglOK() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
}

export function createViewer(opts) {
  const o = { maxDpr: 2, exposure: 1, lazy: true, rootMargin: '300px', autoRotate: 0.12, autoRotateFor: 8, drag: true,
    envRotation: 0, background: null, views: {}, fit: 1.25, fov: 30, shadow: true, preserve: false, ...opts };
  const el = o.el; let resolveReady, rejectReady;
  const api = { ready: new Promise((r, j) => { resolveReady = r; rejectReady = j; }), loaded: false, fallback: false, goTo, render: () => { dirty = true; wake(); }, dispose, stats: {} };
  if (!webglOK()) { showPoster('WebGL is not available'); return api; }

  // renderer: same settings on phone and desktop; only the pixel ratio is capped
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: o.background == null, powerPreference: 'high-performance', preserveDrawingBuffer: !!o.preserve });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, o.maxDpr));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = o.exposure;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  renderer.domElement.style.touchAction = 'pan-y';   // vertical page scroll still works on phones
  el.appendChild(renderer.domElement);
  renderer.domElement.addEventListener('webglcontextlost', (e) => { e.preventDefault(); showPoster('WebGL context lost'); });

  const scene = new THREE.Scene();
  if (o.background != null) scene.background = new THREE.Color(o.background);
  const camera = new THREE.PerspectiveCamera(o.fov, 1, 0.01, 100);
  const pivot = new THREE.Group(); scene.add(pivot);

  const ktx2 = new KTX2Loader().setTranscoderPath(o.decoders?.basis || 'vendor/basis/').detectSupport(renderer);
  const draco = new DRACOLoader().setDecoderPath(o.decoders?.draco || 'vendor/draco/');
  const gltfLoader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).setDRACOLoader(draco).setKTX2Loader(ktx2);

  let dirty = true, visible = !o.lazy, running = false, started = false, target = new THREE.Vector3(), dist = 1, size = 1;
  let yaw = 0, pitch = 0, tween = null, last = performance.now(), spinLeft = o.autoRotateFor;   // seconds of idle spin, then the GPU rests
  const cur = { theta: 0.6, phi: 1.25, r: 1, tx: 0, ty: 0, tz: 0 };

  function resize() {
    const w = el.clientWidth || 1, h = el.clientHeight || 1;
    renderer.setSize(w, h, false); renderer.domElement.style.width = w + 'px'; renderer.domElement.style.height = h + 'px';
    camera.aspect = w / h; fitDistance(); camera.updateProjectionMatrix(); dirty = true;
  }
  // fit the whole model on any screen shape: portrait phones fit by width, landscape desktops by height
  function fitDistance() { const t = Math.tan(THREE.MathUtils.degToRad(o.fov / 2)); dist = Math.max((size / 2) / t, (size / 2) / (t * camera.aspect)) * o.fit;
    camera.near = dist / 100; camera.far = dist * 20; }
  const ro = new ResizeObserver(resize); ro.observe(el); resize();

  function placeCamera() {
    const sp = Math.sin(cur.phi);
    const r = cur.r * dist; camera.position.set(cur.tx + r * sp * Math.sin(cur.theta), cur.ty + r * Math.cos(cur.phi), cur.tz + r * sp * Math.cos(cur.theta));
    camera.lookAt(cur.tx, cur.ty, cur.tz);
  }
  // a view = { theta, phi, r (x fit distance), at: [x,y,z] in model space, normalised to the bounding box }
  function viewToState(v) {
    const at = v.at ? new THREE.Vector3(...v.at).multiplyScalar(size).add(target) : target.clone();
    return { theta: v.theta ?? 0.6, phi: v.phi ?? 1.25, r: v.r ?? 1, tx: at.x, ty: at.y, tz: at.z };
  }
  function goTo(name, ms = 520) {
    const v = typeof name === 'string' ? o.views[name] : name; if (!v || !api.loaded) return;
    const to = viewToState(v); yaw = 0; pitch = 0; spinLeft = 0;
    if (ms === 0 || reduced()) { Object.assign(cur, to); tween = null; dirty = true; wake(); return; }
    tween = { from: { ...cur }, to, t0: performance.now(), ms }; wake();
  }

  async function load() {
    if (started) return; started = true;
    try {
      if (o.hdr) {
        const pmrem = new THREE.PMREMGenerator(renderer);
        const hdr = await new RGBELoader().loadAsync(o.hdr);
        scene.environment = pmrem.fromEquirectangular(hdr).texture; hdr.dispose(); pmrem.dispose();
        scene.environmentRotation = new THREE.Euler(0, o.envRotation, 0);
      }
      const t0 = performance.now();
      const gltf = await gltfLoader.loadAsync(o.model, (e) => o.onProgress?.(e.total ? e.loaded / e.total : 0));
      api.stats.loadMs = Math.round(performance.now() - t0);
      const root = gltf.scene; pivot.add(root);
      const box = new THREE.Box3().setFromObject(root); const s = box.getSize(new THREE.Vector3()); box.getCenter(target);
      size = Math.max(s.x, s.y, s.z); fitDistance(); camera.updateProjectionMatrix();
      let tris = 0; root.traverse((m) => { if (m.isMesh) { const g = m.geometry; tris += (g.index ? g.index.count : g.attributes.position.count) / 3; } });
      api.stats.triangles = Math.round(tris);
      if (o.shadow) pivot.add(contactShadow(box, s));
      Object.assign(cur, viewToState(o.views.start || {}));
      api.loaded = true; dirty = true; o.onLoad?.(api); resolveReady(api); wake();
    } catch (e) { console.error('[viewer]', e); showPoster('The 3D model could not load'); rejectReady(e); }
  }

  function contactShadow(box, s) { // soft radial contact shadow: one 128px canvas, no shadow maps
    const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(20,16,12,0.55)'); gr.addColorStop(0.55, 'rgba(20,16,12,0.18)'); gr.addColorStop(1, 'rgba(20,16,12,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false }));
    m.rotation.x = -Math.PI / 2; m.position.set(target.x, box.min.y + size * 0.002, target.z); m.scale.set(Math.max(s.x, s.z) * 1.6, Math.max(s.x, s.z) * 1.6, 1); m.renderOrder = -1;
    return m;
  }

  // drag to turn (pointer events; touch keeps vertical scrolling because of touch-action: pan-y)
  if (o.drag) {
    let down = null;
    renderer.domElement.addEventListener('pointerdown', (e) => { spinLeft = 0; down = { x: e.clientX, y: e.clientY, yaw, pitch }; renderer.domElement.setPointerCapture(e.pointerId); el.classList.add('is-dragging'); });
    renderer.domElement.addEventListener('pointermove', (e) => { if (!down) return; yaw = down.yaw + (e.clientX - down.x) * 0.008; pitch = THREE.MathUtils.clamp(down.pitch + (e.clientY - down.y) * 0.004, -0.35, 0.35); tween = null; wake(); });
    const up = () => { down = null; el.classList.remove('is-dragging'); };
    renderer.domElement.addEventListener('pointerup', up); renderer.domElement.addEventListener('pointercancel', up);
  }

  function frame(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    let animating = false;
    if (tween) { const k = easeOutExpo(Math.min(1, (now - tween.t0) / tween.ms));
      for (const key in tween.to) cur[key] = tween.from[key] + (tween.to[key] - tween.from[key]) * k;
      if (k >= 1) tween = null; animating = true; }
    if (o.autoRotate && spinLeft > 0 && !reduced() && !tween && api.loaded) { pivot.rotation.y += o.autoRotate * dt; spinLeft -= dt; animating = true; }
    pivot.rotation.x = pitch; if (yaw) { pivot.rotation.y += yaw; yaw = 0; }
    if (api.loaded && (dirty || animating)) { placeCamera(); renderer.render(scene, camera); dirty = false; o.onFrame?.(api); }
    if (animating || dirty) requestAnimationFrame(frame); else running = false;   // idle = no frames = cool phone
  }
  function wake() { if (running || !visible || document.hidden) return; running = true; last = performance.now(); requestAnimationFrame(frame); }

  // lazy: load when near the viewport, pause when off-screen or tab hidden
  const io = new IntersectionObserver((ents) => { for (const e of ents) { visible = e.isIntersecting; if (visible) { load(); wake(); } else running = false; } }, { rootMargin: o.rootMargin });
  io.observe(el);
  if (!o.lazy) load();
  const onVis = () => { if (!document.hidden) wake(); else running = false; };
  document.addEventListener('visibilitychange', onVis);
  const mq = matchMedia('(prefers-reduced-motion: reduce)'); mq.addEventListener?.('change', () => { dirty = true; wake(); });

  function showPoster(why) {
    api.fallback = true; el.classList.add('is-fallback');
    if (o.poster && !el.querySelector('img.viewer-poster')) { const img = new Image(); img.className = 'viewer-poster'; img.alt = o.posterAlt || ''; img.src = o.poster; el.appendChild(img); }
    console.warn('[viewer] poster fallback:', why); resolveReady?.(api);
  }
  function dispose() { io.disconnect(); ro.disconnect(); document.removeEventListener('visibilitychange', onVis); running = false; renderer.dispose(); ktx2.dispose(); draco.dispose(); }
  api.renderer = renderer; api.scene = scene; api.camera = camera; api.pivot = pivot;
  api.setYaw = (a) => { pivot.rotation.y = a; dirty = true; wake(); };
  api.spin = (seconds) => { spinLeft = seconds; wake(); };   // spin(0) stops the idle turn
  return api;
}
