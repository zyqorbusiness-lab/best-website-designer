/* TALUS Ridge C1 - phone 3D: the SAME model (talus-d.glb), SAME materials and maps (detail.js) and SAME HDRI as desktop.
   One WebGL canvas that moves into whichever bike figure is on screen (hero, teardown, paint, dusk).
   Lazy-loaded by m.js; renders only while a bike figure is visible; the webp stills are only loading posters. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { useHDRI } from '../../assets/hdri/hdri.js';
import { enhance, frameMaterial, anodised, addDecals } from './detail.js';

const WAYS = { glacier: { c: '#8FB3C7', rim: '#B4552E' }, oxide: { c: '#A4472A', rim: '#C9D3D6' }, chalk: { c: '#E4DCCB', rim: '#7FA3B8' } };
const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));

export function start({ figs, state, reduced }) {
  const cv = document.createElement('canvas');
  cv.className = 'bike-gl'; cv.setAttribute('aria-hidden', 'true');
  cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;opacity:0;transition:opacity .5s;touch-action:pan-y;z-index:1';
  const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1;
  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose();
  useHDRI(renderer, scene, { size: 512, rotation: 0.6, onReady: () => { dirty = 2; } });     // same HDRI file as desktop
  const camera = new THREE.PerspectiveCamera(26, 1.46, 0.1, 60);
  const key = new THREE.DirectionalLight(0xfff4e6, 1.2); key.position.set(3, 5, 4); scene.add(key);
  const rim = new THREE.DirectionalLight(0xff9a5a, 0); rim.position.set(-4, 2.2, -3); scene.add(rim);
  scene.add(new THREE.HemisphereLight(0xdfe8ec, 0x3d2219, 0.25));
  const spin = new THREE.Group(); scene.add(spin);
  const sc = document.createElement('canvas'); sc.width = sc.height = 256; const g = sc.getContext('2d');
  const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, 'rgba(40,22,16,.55)'); gr.addColorStop(.45, 'rgba(40,22,16,.22)'); gr.addColorStop(1, 'rgba(40,22,16,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  const st = new THREE.CanvasTexture(sc); st.colorSpace = THREE.SRGBColorSpace;
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: st, transparent: true, depthWrite: false, opacity: 0.9 }));
  shadow.rotation.x = -Math.PI / 2; shadow.scale.set(3.4, 1.1, 1); shadow.position.y = 0.002; shadow.renderOrder = -1; spin.add(shadow);

  let model, mixer, action, tMax = 0, frame, accent, gun, dirty = 2, host = null, ready = false;
  const col = new THREE.Color(WAYS.glacier.c), acc = new THREE.Color(WAYS.glacier.rim);
  const L = { env: 1, key: 1.2, rim: 0, exp: 1 }; let ex = 0, yawUser = 0, yawVel = 0, t0 = 0;
  const setAnim = (t) => { if (!action) return; action.time = t; mixer.update(0); };

  new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load('../../assets/lab/cadence/talus-d.glb', (gl) => {
    model = gl.scene;
    const b = new THREE.Box3().setFromObject(model), s = b.getSize(new THREE.Vector3());
    model.scale.setScalar(2.6 / s.x);
    const b2 = new THREE.Box3().setFromObject(model), c = b2.getCenter(new THREE.Vector3());
    model.position.set(-c.x, -b2.min.y, -c.z);
    enhance(model);
    model.traverse((o) => {
      if (!o.isMesh) return; o.frustumCulled = false; const m = o.material; if (!m) return;
      if (m.name === 'Carbon') { if (!frame) frame = frameMaterial(m.normalMap, WAYS.glacier.c); o.material = frame; }
      else if (m.name === 'Rahmen') { if (!gun) gun = new THREE.MeshPhysicalMaterial({ color: 0x2a2826, metalness: 0.85, roughness: 0.3, clearcoat: 0.5, clearcoatRoughness: 0.2 }); o.material = gun; }
      else if (m.name === 'FelgeInnen' || m.name === 'GriffSeiten') { if (!accent) accent = anodised(WAYS.glacier.rim); o.material = accent; }
    });
    spin.add(model);
    if (gl.animations.length) {
      mixer = new THREE.AnimationMixer(model); action = mixer.clipAction(gl.animations[0]); action.play();
      // the 12 s clip explodes and returns: find the widest moment
      const meshes = []; model.traverse((o) => { if (o.isMesh) meshes.push(o); });
      const dur = gl.animations[0].duration, v = new THREE.Vector3(); let best = dur / 2, bs = -1;
      setAnim(0); model.updateMatrixWorld(true); const base = meshes.map((m) => m.getWorldPosition(new THREE.Vector3()));
      for (let i = 1; i <= 36; i++) { const t = dur * i / 37; setAnim(t); model.updateMatrixWorld(true); let sum = 0; meshes.forEach((m, j) => { m.getWorldPosition(v); sum += v.distanceTo(base[j]); }); if (sum > bs) { bs = sum; best = t; } }
      tMax = best; setAnim(0);
    }
    model.updateMatrixWorld(true); try { addDecals(model, spin); } catch (e) { /* decals are optional */ }
    const S = state(); col.set(WAYS[S.way].c); acc.set(WAYS[S.way].rim);
    ready = true; window.__cadModel = model; dirty = 2; pick();
  });

  // which figure is on screen
  const vis = new Map();
  const io = new IntersectionObserver((es) => { es.forEach((e) => vis.set(e.target, e.intersectionRatio)); pick(); }, { threshold: [0, 0.15, 0.4, 0.7, 1] });
  Object.values(figs).forEach((f) => { if (getComputedStyle(f).position === 'static') f.style.position = 'relative'; io.observe(f); });
  function pick() {
    let best = null, br = 0; for (const [f, r] of vis) if (r > br) { br = r; best = f; }
    if (!ready || !best || best === host) { if (!best) running = false; else if (ready && !running) kick(); return; }
    if (host) host.querySelectorAll('img').forEach((i) => { i.style.visibility = ''; });
    host = best; host.appendChild(cv); size(); dirty = 2; cv.style.opacity = '0'; shown = false; kick();
  }
  function size() {
    if (!host) return; const w = host.clientWidth, h = host.clientHeight || w / 1.46;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  addEventListener('resize', () => { size(); dirty = 2; });
  // touch / drag to turn the bike
  let drag = false, px = 0;
  cv.addEventListener('pointerdown', (e) => { drag = true; px = e.clientX; });
  addEventListener('pointerup', () => { drag = false; });
  cv.addEventListener('pointermove', (e) => { if (!drag) return; const d = (e.clientX - px) / 160; px = e.clientX; yawUser += d; yawVel = d; dirty = 2; });

  let running = false, shown = false, last = 0;
  function kick() { if (running) return; running = true; last = performance.now(); requestAnimationFrame(loop); }
  function loop(now) {
    if (!running || !host) { running = false; return; }
    const dt = Math.min((now - last) / 1000, 0.05); last = now; t0 += dt;
    const S = state(), dusk = S.mode === 'dusk' && host === figs.dusk;
    const exT = host === figs.tear ? S.ex : 0;
    ex = reduced ? exT : damp(ex, exT, 5, dt);
    col.lerp(new THREE.Color(WAYS[S.way].c), reduced ? 1 : 1 - Math.exp(-4 * dt)); acc.lerp(new THREE.Color(WAYS[S.way].rim), reduced ? 1 : 1 - Math.exp(-4 * dt));
    if (frame) frame.color.copy(col); if (accent) accent.color.copy(acc);
    const LT = dusk ? { env: 0.32, key: 0.25, rim: 3.2, exp: 1.08 } : { env: 1, key: 1.2, rim: 0, exp: 1 };
    for (const k in L) L[k] = reduced ? LT[k] : damp(L[k], LT[k], 2.5, dt);
    scene.environmentIntensity = L.env; key.intensity = L.key; rim.intensity = L.rim; renderer.toneMappingExposure = L.exp;
    if (!drag) { yawVel *= Math.pow(0.04, dt); yawUser += yawVel; yawUser = damp(yawUser, 0, 0.35, dt); }
    const idle = reduced ? 0 : Math.sin(t0 * 0.35) * 0.16;
    spin.rotation.y = -0.22 + yawUser + idle;
    const ease = (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
    if (mixer) setAnim(ease(ex) * tMax);
    shadow.scale.set(3.4 + ex * 1.6, 1.1 + ex * 1.2, 1); shadow.material.opacity = 0.9 - ex * 0.35;
    const fit = Math.max(1, 1.46 / camera.aspect);
    camera.position.set(0, 0.6, (4.35 + ex * 2.8) * fit); camera.lookAt(0, 0.66 + ex * 0.05, 0);
    if (window.__camO) { const o = window.__camO; camera.position.set(o.p[0], o.p[1], o.p[2]); camera.lookAt(o.l[0], o.l[1], o.l[2]); if (o.f && camera.fov !== o.f) { camera.fov = o.f; camera.updateProjectionMatrix(); } }
    renderer.render(scene, camera);
    if (!shown) { shown = true; cv.style.opacity = '1'; host.querySelectorAll('img').forEach((i) => { i.style.visibility = 'hidden'; }); document.body.dataset.live3d = '1'; }
    requestAnimationFrame(loop);
  }
  // off-screen = paused (pick() stops the loop when no figure is visible)
  document.addEventListener('visibilitychange', () => { if (document.hidden) running = false; else kick(); });
  return { renderer };
}
