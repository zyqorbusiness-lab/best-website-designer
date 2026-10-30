/* scroll-3d-stage.js: Zyqor Components (MIT). Needs three.js (import map "three" + "three/addons/").
   A pinned 3D stage whose camera and model move through keyframes as the page scrolls.

   import { scrollStage } from './scroll-3d-stage.js';
   scrollStage({
     section: document.querySelector('.s3'),          // tall section; its .s3-pin child is the sticky viewport
     model: 'binoculars.glb', hdr: 'studio_1k.hdr', meshopt: '.../meshopt_decoder.module.js',
     keys: [ { cam:[0,.2,3.2], look:[0,0,0], rot:[0,.6,0] }, ... ]  // one key per chapter (.s3-ch)
   });

   - Real PBR look: sRGB output, ACES Filmic tone mapping, HDRI image-based light, soft contact shadow.
   - Smooth: scroll sets a target, the scene eases toward it every frame (critically damped), so a trackpad
     flick or a phone fling never jumps. Chapters cross-fade from the same progress value.
   - Lazy: WebGL starts only when the section is near the screen; the loop pauses off screen and in hidden tabs.
   - Safe: no WebGL or a lost context shows the <img class="s3-poster">; the page still reads top to bottom.
   - Reduced motion: no easing glide and no idle sway; each chapter shows its keyframe as a still.
   - Same files on phone and desktop; DPR capped at 2 and lowered for a moment only if frames get slow. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

const reduced = matchMedia('(prefers-reduced-motion:reduce)').matches;
const sstep = (t) => t * t * (3 - 2 * t);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

function shadowTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
  const r = g.createRadialGradient(128, 128, 8, 128, 128, 128);
  r.addColorStop(0, 'rgba(20,20,20,.62)'); r.addColorStop(.45, 'rgba(20,20,20,.28)'); r.addColorStop(1, 'rgba(20,20,20,0)');
  g.fillStyle = r; g.fillRect(0, 0, 256, 256); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function scrollStage(o) {
  const section = o.section, pin = section.querySelector('.s3-pin'), host = section.querySelector('.s3-canvas');
  const chapters = [...section.querySelectorAll('.s3-ch')], bar = section.querySelector('.s3-bar i');
  const state = { p: 0, sp: 0, started: false, failed: false, visible: false, raf: 0, last: 0, slow: 0 };
  const progress = () => { const r = section.getBoundingClientRect(); const span = r.height - pin.offsetHeight; return clamp(-r.top / Math.max(1, span)); };
  const fail = () => { state.failed = true; section.classList.add('s3--poster'); };

  // chapter copy and progress bar run even without WebGL
  const paintCopy = (p) => {
    const n = chapters.length, seg = 1 / n;
    chapters.forEach((ch, i) => { const c = (i + 0.5) * seg; const d = Math.abs(p - c) / (seg * 0.62); const a = reduced ? (Math.floor(p * n - 1e-6) === i || (i === n - 1 && p >= 1) ? 1 : 0) : clamp(1 - d * d); ch.style.opacity = a.toFixed(3); ch.style.transform = `translate3d(0,${((p - c) * -60).toFixed(1)}px,0)`; ch.toggleAttribute('inert', a < 0.5); });
    if (bar) bar.style.transform = `scaleX(${p.toFixed(4)})`;
  };

  let renderer, scene, camera, model, keys = o.keys, shadow;
  const v3 = (a) => new THREE.Vector3(a[0], a[1], a[2]);
  const camPos = new THREE.Vector3(), look = new THREE.Vector3(), tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3();
  const sample = (p) => {
    const n = keys.length - 1, x = clamp(p) * n, i = Math.min(n - 1, Math.floor(x)), t = reduced ? Math.round(x - i) : sstep(x - i);
    const a = keys[i], b = keys[i + 1];
    camPos.copy(tmpA.fromArray(a.cam)).lerp(tmpB.fromArray(b.cam), t);
    look.copy(tmpA.fromArray(a.look || [0, 0, 0])).lerp(tmpB.fromArray(b.look || [0, 0, 0]), t);
    const ra = a.rot || [0, 0, 0], rb = b.rot || [0, 0, 0];
    return [ra[0] + (rb[0] - ra[0]) * t, ra[1] + (rb[1] - ra[1]) * t, ra[2] + (rb[2] - ra[2]) * t, (a.exposure ?? 1) + ((b.exposure ?? 1) - (a.exposure ?? 1)) * t];
  };

  async function start() {
    if (state.started) return; state.started = true;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch (e) { fail(); return; }
    if (!renderer.getContext()) { fail(); return; }
    renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1;
    renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
    host.append(renderer.domElement);
    renderer.domElement.addEventListener('webglcontextlost', (e) => { e.preventDefault(); fail(); });
    scene = new THREE.Scene(); camera = new THREE.PerspectiveCamera(o.fov || 30, 1, 0.05, 100);
    const pm = new THREE.PMREMGenerator(renderer);
    const loader = new GLTFLoader();
    if (o.meshopt) { const { MeshoptDecoder } = await import(o.meshopt); loader.setMeshoptDecoder(MeshoptDecoder); }
    const [gltf, hdr] = await Promise.all([loader.loadAsync(o.model), o.hdr ? new RGBELoader().loadAsync(o.hdr) : null]);
    if (hdr) { scene.environment = pm.fromEquirectangular(hdr).texture; hdr.dispose(); }
    scene.environmentIntensity = o.envIntensity ?? 1;
    const key = new THREE.DirectionalLight(0xfff4e6, o.keyLight ?? 1.4); key.position.set(2.5, 3, 2); scene.add(key);
    // fit: centre the model and scale it to a unit size so keyframes are portable between models
    model = new THREE.Group(); const inner = gltf.scene; model.add(inner);
    const box = new THREE.Box3().setFromObject(inner), size = box.getSize(new THREE.Vector3()), ctr = box.getCenter(new THREE.Vector3());
    const s = (o.size || 1.6) / Math.max(size.x, size.y, size.z); inner.scale.setScalar(s); inner.position.copy(ctr.multiplyScalar(-s));
    inner.traverse((m) => { if (m.isMesh && m.material) { m.material.envMapIntensity = o.envIntensity ?? 1; } });
    scene.add(model);
    const h = size.y * s; shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false, toneMapped: false }));
    shadow.rotation.x = -Math.PI / 2; shadow.position.y = -h / 2 - 0.002; shadow.scale.setScalar((o.size || 1.6) * 1.25); scene.add(shadow);
    resize(); addEventListener('resize', resize);
    state.sp = state.p = progress(); section.classList.add('s3--ready');
    loop(performance.now());
  }
  function resize() {
    if (!renderer) return; const w = host.clientWidth, h = host.clientHeight; renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.fov = (o.fov || 30) * (w / h < 0.8 ? 1.35 : 1); camera.updateProjectionMatrix();
  }
  function loop(t) {
    state.raf = 0; if (state.failed || !state.visible || document.hidden || !model) return;
    const dt = Math.min(0.05, (t - (state.last || t)) / 1000); state.last = t;
    state.p = progress();
    state.sp = reduced ? state.p : state.sp + (state.p - state.sp) * (1 - Math.exp(-7 * dt));
    const [rx, ry, rz, ex] = sample(state.sp);
    const sway = reduced ? 0 : Math.sin(t / 1400) * 0.025;
    model.rotation.set(rx, ry + sway, rz); renderer.toneMappingExposure = ex;
    if (camera.aspect < 0.8) { look.x = 0; camPos.x *= 0.6; camPos.z *= 1.18; } // narrow screens: centre the model above the copy
    camera.position.copy(camPos); camera.lookAt(look);
    renderer.render(scene, camera);
    paintCopy(state.sp);
    // adaptive DPR: if frames take > 28 ms for a while, drop to 1.25x; recover later
    if (dt > 0.028) state.slow++; else state.slow = Math.max(0, state.slow - 1);
    if (state.slow > 40 && renderer.getPixelRatio() > 1.25) { renderer.setPixelRatio(1.25); resize(); state.slow = 0; }
    state.raf = requestAnimationFrame(loop);
  }
  const io = new IntersectionObserver(([e]) => {
    state.visible = e.isIntersecting;
    if (e.isIntersecting) { start().catch(() => fail()); if (renderer && !state.raf) { state.last = 0; state.raf = requestAnimationFrame(loop); } }
  }, { rootMargin: '300px 0px' });
  io.observe(section);
  addEventListener('scroll', () => { if (state.failed || !renderer) paintCopy(progress()); }, { passive: true });
  document.addEventListener('visibilitychange', () => { if (!document.hidden && state.visible && renderer && !state.raf) { state.last = 0; state.raf = requestAnimationFrame(loop); } });
  paintCopy(progress());
  return state;
}
