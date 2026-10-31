/* HALDE R2 - Zyqor Lab concept (round 2: 4k scan textures, same model on phone, coated optics + iris). One WebGL renderer, one real scanned camera (Poly Haven "Camera 01", CC0),
   drawn into two hosts with scissor: the hero viewport and the studio. Studio: finish switch, light mode, exploded lens. */
import { THREE, reduced, isM, Q, loadGLB, makeRenderer, glRenderer, studioEnv, damp, reveals } from '../_kit/kit.js';
reveals();
import { useHDRI } from '../../assets/hdri/hdri.js';

const $ = (s, r = document) => r.querySelector(s);
const heroHost = $('.hero-viewport');
const studioHost = $('#studio-scene');
const scanHost = $('#scan-scene');
const scanSec = $('#scan');
const hosts = [heroHost, scanHost, studioHost].filter(Boolean);
/* R2: the phone build's hero is a still photo; mount a live 3D host over it (the photo stays as the loading poster) */
let heroLive = null;
if (isM && !heroHost) {
  const hp = $('.hero-photo');
  if (hp) {
    if (getComputedStyle(hp).position === 'static') hp.style.position = 'relative';
    heroLive = document.createElement('div'); heroLive.className = 'hero-live'; heroLive.setAttribute('aria-hidden', 'true');
    heroLive.style.cssText = 'position:absolute;inset:0;pointer-events:none';
    hp.append(heroLive); hosts.unshift(heroLive);
  }
}
/* R2: phone and desktop load the SAME 4k-texture model (meshopt + webp); halde-m.glb is no longer used */
const URL_GLB = '../../assets/lab/halde/halde-d.glb';
const SH = true; /* soft key shadow on both builds (phone uses a 1024 map) */

/* ---------- renderer: one fixed transparent canvas, scissored into host rects ---------- */
const canvas = document.createElement('canvas');
canvas.id = 'gl'; canvas.setAttribute('aria-hidden', 'true');
canvas.dataset.nogl = 'self'; /* R3: no WebGL -> each host shows its own still (no full-viewport poster on the fixed canvas) */
document.body.append(canvas);
/* R2: own renderer so the phone gets the same antialiasing and DPR (capped at 2) as desktop */
const renderer = glRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.02;
renderer.setClearColor(0x000000, 0);
renderer.shadowMap.enabled = SH;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setScissorTest(true);
const scene = new THREE.Scene();
scene.environment = studioEnv(renderer);
scene.environmentIntensity = 0.9;
useHDRI(renderer, scene, { size: 512, rotation: 2.2 });

const cam = new THREE.PerspectiveCamera(28, 1, 0.05, 60);

/* lights: warm key with soft shadow, cool fill from the HDRI, rim from behind */
const key = new THREE.DirectionalLight(0xfff1df, 2.1);
key.position.set(-3.2, 5.2, 3.6);
key.castShadow = SH;
key.shadow.mapSize.set(isM ? 1024 : 2048, isM ? 1024 : 2048);
key.shadow.camera.left = -2.4; key.shadow.camera.right = 2.4; key.shadow.camera.top = 2.4; key.shadow.camera.bottom = -2.4;
key.shadow.camera.near = 1; key.shadow.camera.far = 14;
key.shadow.radius = 7; key.shadow.blurSamples = 16; key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02;
scene.add(key);
const rim = new THREE.DirectionalLight(0xffd2a8, 1.3);
rim.position.set(3.5, 2.2, -4); scene.add(rim);
const dusk = new THREE.DirectionalLight(0x8fb2ff, 0); dusk.position.set(-4, 3, -2); scene.add(dusk);

/* ground: shadow catcher + a soft contact blob (ambient occlusion under the body) */
const ground = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.ShadowMaterial({ color: 0x2a2219, opacity: 0.32 }));
ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
function blobTex() {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d'), gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, 'rgba(26,20,14,0.85)'); gr.addColorStop(0.45, 'rgba(26,20,14,0.35)'); gr.addColorStop(1, 'rgba(26,20,14,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: blobTex(), transparent: true, depthWrite: false, opacity: 0.75 }));
blob.rotation.x = -Math.PI / 2; blob.position.y = 0.002; blob.scale.set(2.1, 0.62, 1); blob.renderOrder = -1;

/* ---------- the object ---------- */
const rig = new THREE.Group(); scene.add(rig);          // yaw lives here
const wrap = new THREE.Group(); rig.add(wrap);          // scale lives here
wrap.add(blob);
const S = 12;                                            // metres -> scene units
let model = null, lensPivot = null, frontPivot = null, bodyMats = [], uSilver = { value: 0 };
const anchors = { lens: new THREE.Vector3(0.0079, 0.0338, 0.071), mount: new THREE.Vector3(0.0079, 0.0338, 0.019), dial: new THREE.Vector3(-0.046, 0.083, -0.002) };

function silverPatch(mat) {
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uSilver = uSilver;
    sh.fragmentShader = 'uniform float uSilver;\n' + sh.fragmentShader.replace('#include <map_fragment>', `#include <map_fragment>
      {
        vec3 c = diffuseColor.rgb;
        float l = dot(c, vec3(0.299, 0.587, 0.114));
        float mx = max(c.r, max(c.g, c.b)), mn = min(c.r, min(c.g, c.b));
        float sat = (mx - mn) / max(mx, 1e-3);
        float brass = smoothstep(0.18, 0.42, sat) * smoothstep(0.06, 0.22, l) * step(c.b, c.r);
        vec3 silver = vec3(l * 1.35 + 0.06) * vec3(0.96, 0.98, 1.0);
        vec3 graphite = c * 2.1 + vec3(0.018, 0.021, 0.026);
        vec3 alt = mix(graphite, silver, brass);
        diffuseColor.rgb = mix(c, alt, uSilver);
      }`);
  };
  mat.customProgramCacheKey = () => 'halde-silver';
  mat.needsUpdate = true;
}

function splitGlass(mesh) {
  /* the scan keeps all glass in one primitive: split the lens front element from the finder windows */
  const g = mesh.geometry, pos = g.attributes.position, idx = g.index;
  const v = new THREE.Vector3(), m = mesh.matrixWorld;
  const P = (i) => v.fromBufferAttribute(pos, i).applyMatrix4(m).clone();
  const a = [], b = [];
  for (let t = 0; t < idx.count; t += 3) {
    const i0 = idx.getX(t), i1 = idx.getX(t + 1), i2 = idx.getX(t + 2);
    const c = P(i0).add(P(i1)).add(P(i2)).multiplyScalar(1 / 3);
    const r = Math.hypot(c.x - 0.0079, c.y - 0.0338);
    (r < 0.03 && c.z > 0.03 ? a : b).push(i0, i1, i2);
  }
  const mk = (arr) => { const ng = new THREE.BufferGeometry(); for (const k in g.attributes) ng.setAttribute(k, g.attributes[k]); ng.setIndex(arr); return ng; };
  const lens = new THREE.Mesh(mk(a), mesh.material); const win = new THREE.Mesh(mk(b), mesh.material);
  for (const o of [lens, win]) { o.matrix.copy(mesh.matrix); o.matrix.decompose(o.position, o.quaternion, o.scale); }
  return { lens, win };
}


/* ---------- R2 optics: internal coated elements, 10-blade iris, baffle, engraved front ring ---------- */
function ringTex(R) {
  /* engraved name ring around the front element (fictional brand) */
  const c = document.createElement('canvas'); c.width = 2048; c.height = 2048;
  const g = c.getContext('2d'); g.fillStyle = '#060606'; g.fillRect(0, 0, 2048, 2048);
  g.translate(1024, 1024);
  g.fillStyle = '#d9d4c8'; g.font = '600 64px "Manrope", "Helvetica Neue", Arial, sans-serif'; g.textBaseline = 'middle';
  const txt = 'HALDE OPTIK  \u00b7  SOLVER 1:1.4 / 35  \u00b7  CONCEPT  \u00b7  No 170317  \u00b7  E39  \u00b7  ';
  let a = -Math.PI / 2 - 0.9;
  for (const ch of txt) { const w = g.measureText(ch).width; g.save(); g.rotate(a); g.translate(0, -870); g.fillText(ch, -w / 2, 0); g.restore(); a += (w + 2) / 870; }
  /* fine ruled rings */
  g.strokeStyle = 'rgba(217,212,200,0.35)'; g.lineWidth = 3;
  for (const r of [790, 955]) { g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
function bladeShape(rIn, rOut, span) {
  /* one iris blade: straight inner edge tangent at rIn (overlapping blades form a clean decagon), curved outer edge */
  const s = new THREE.Shape(), n = 16, h = Math.tan(span / 2) * rIn;
  s.moveTo(rIn, -h * 1.15); s.lineTo(rIn, h * 1.15);
  for (let i = 0; i <= n; i++) { const a = span / 2 - span * i / n; s.lineTo(Math.cos(a) * rOut, Math.sin(a) * rOut); }
  s.closePath(); return s;
}
function buildOptics(front) {
  /* bbox of the indexed subset only (split geometry shares the full position buffer) */
  const b = new THREE.Box3(), pa = front.geometry.attributes.position, ix = front.geometry.index, vv = new THREE.Vector3();
  front.updateMatrixWorld(true);
  for (let i = 0; i < ix.count; i++) b.expandByPoint(vv.fromBufferAttribute(pa, ix.getX(i)).applyMatrix4(front.matrixWorld));
  const c = b.getCenter(new THREE.Vector3()), sz = b.getSize(new THREE.Vector3());
  const R = Math.max(sz.x, sz.y) / 2, zf = b.min.z;
  const deep = new THREE.Group(), near = new THREE.Group();
  const z0 = b.max.z - 0.0065; /* just behind the front element's rim */
  deep.position.set(c.x, c.y, z0); near.position.set(c.x, c.y, z0);
  /* matte black baffle tube + back stop so nothing see-through shows */
  const black = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.92, metalness: 0.1, side: THREE.DoubleSide });
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.97, R * 0.9, R * 1.3, 64, 1, true), black);
  tube.rotation.x = Math.PI / 2; tube.position.z = -R * 0.65; deep.add(tube);
  const stop = new THREE.Mesh(new THREE.CircleGeometry(R * 0.92, 64), black); stop.position.z = -R * 1.28; deep.add(stop);
  /* baffle grooves (thin dark rings) */
  const ringM = new THREE.MeshStandardMaterial({ color: 0x0c0c0c, roughness: 0.6, metalness: 0.3, side: THREE.DoubleSide });
  for (let i = 0; i < 4; i++) { const r = new THREE.Mesh(new THREE.RingGeometry(R * (0.8 - i * 0.02), R * 0.96, 72), ringM); r.position.z = -R * (0.2 + i * 0.26); deep.add(r); }
  /* internal coated elements: dark, mirror-smooth, each coating a different hue */
  const tints = [0x1b3a2c, 0x3a1f3c, 0x13283d, 0x3a2a12];
  tints.forEach((col, i) => {
    const m = new THREE.MeshPhysicalMaterial({ color: 0x020304, metalness: 0.0, roughness: 0.02, clearcoat: 1, clearcoatRoughness: 0.0,
      iridescence: 1, iridescenceIOR: 1.3 + i * 0.08, iridescenceThicknessRange: [200 + i * 60, 600 + i * 40], sheen: 1, sheenColor: new THREE.Color(col), sheenRoughness: 0.25,
      envMapIntensity: 1.5 - i * 0.2, specularIntensity: 1, transparent: true, opacity: 0.42 - i * 0.05, depthWrite: false });
    const g = new THREE.SphereGeometry(R * (0.86 - i * 0.12) * 2.2, 64, 16, 0, Math.PI * 2, 0, 0.47);
    const e = new THREE.Mesh(g, m); e.rotation.x = Math.PI / 2;
    e.position.z = -R * (0.12 + i * 0.22) - R * (0.86 - i * 0.12) * 2.2 * Math.cos(0.47);
    e.renderOrder = 6 - i; /* deepest first */
    (i < 1 ? near : deep).add(e);
  });
  /* 10-blade iris, slightly stopped down (f/2.8 look) */
  const bladeM = new THREE.MeshStandardMaterial({ color: 0x0a0a0b, roughness: 0.38, metalness: 0.65, side: THREE.DoubleSide });
  const bg = new THREE.ShapeGeometry(bladeShape(R * 0.36, R * 0.94, (Math.PI * 2) / 10 * 1.6), 2);
  for (let i = 0; i < 10; i++) { const m = new THREE.Mesh(bg, bladeM); m.rotation.z = i * Math.PI * 2 / 10; m.position.z = -R * 0.52 - i * 0.00004; deep.add(m); }
  /* engraved name ring just inside the front element */
  const ring = new THREE.Mesh(new THREE.RingGeometry(R * 0.79, R * 1.0, 128), new THREE.MeshStandardMaterial({ map: ringTex(R), roughness: 0.55, metalness: 0.2 }));
  ring.geometry.attributes.uv.array.forEach((v, i, arr) => {});
  { const pos = ring.geometry.attributes.position, uv = ring.geometry.attributes.uv; for (let i = 0; i < pos.count; i++) { uv.setXY(i, pos.getX(i) / (2 * R) + 0.5, pos.getY(i) / (2 * R) + 0.5); } }
  ring.position.z = -R * 0.06; near.add(ring);
  for (const g of [deep, near]) g.traverse((o) => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; } });
  model.add(deep, near); model.updateMatrixWorld(true);
  lensPivot.attach(deep); frontPivot.attach(near);
}

async function build() {
  const gltf = await loadGLB(URL_GLB);
  model = gltf.scene; model.updateMatrixWorld(true);
  let lensBody = null, glass = null;
  model.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = SH; o.receiveShadow = SH;
    const n = o.material.name;
    if (n === 'Camera_01_lens_body') lensBody = o;
    if (n === 'Camera_01_lens') glass = o;
    if (n === 'Camera_01_body' || n === 'Camera_01_lens_body') { silverPatch(o.material); bodyMats.push(o.material); o.material.envMapIntensity = 1.15; }
    if (n === 'Camera_01_strap') { o.material.envMapIntensity = 0.7; }
  });
  /* glass: coated optics (iridescent front element), dark finder windows */
  /* multi-coated front element: thin dark glass drawn after the optics, so the iris and inner elements read through it */
  const coat = new THREE.MeshPhysicalMaterial({ color: 0x0b1411, metalness: 0, roughness: 0.012, transparent: true, opacity: 0.34, depthWrite: false,
    specularIntensity: 1, specularColor: new THREE.Color(0xc8ffe0), iridescence: 1, iridescenceIOR: 1.34, iridescenceThicknessRange: [260, 500],
    clearcoat: 0.6, clearcoatRoughness: 0.01, envMapIntensity: 2.0 });
  const win = new THREE.MeshPhysicalMaterial({ color: 0x1a2124, metalness: 0, roughness: 0.03, clearcoat: 1, envMapIntensity: 1.8, transparent: true, opacity: 0.94 });
  if (glass) {
    const parent = glass.parent, sp = splitGlass(glass);
    sp.lens.material = coat; sp.win.material = win; sp.lens.renderOrder = 10;
    parent.add(sp.lens, sp.win); parent.remove(glass); glass.geometry.dispose?.();
    model.updateMatrixWorld(true);
    lensPivot = new THREE.Group(); lensPivot.position.set(0.0079, 0.0338, 0.0); model.add(lensPivot);
    frontPivot = new THREE.Group(); lensPivot.add(frontPivot); model.updateMatrixWorld(true);
    if (lensBody) lensPivot.attach(lensBody);
    frontPivot.attach(sp.lens);
    buildOptics(sp.lens);
  }
  wrap.add(model);
  wrap.scale.setScalar(S);
  blob.scale.set(0.16, 0.05, 1); blob.position.set(0, 0.0003, 0);
  document.documentElement.classList.add('loaded');
  const fb = $('.scene-fallback'); if (fb) fb.hidden = true;
  if (heroLive) { const img = heroLive.parentElement.querySelector('img'); if (img) { img.style.transition = reduced ? 'none' : 'opacity .6s'; img.style.opacity = '0'; } }
}

/* ---------- state ---------- */
const st = {
  explode: 0, explodeT: 0, silver: 0, silverT: 0, dusk: 0, duskT: 0,
  dragYaw: 0, dragV: 0, ptrX: 0, ptrY: 0, t: 0,
};
const ann = [...document.querySelectorAll('.studio-annotation')];

/* controls */
document.querySelectorAll('.swatch').forEach((b) => b.addEventListener('click', () => {
  document.querySelectorAll('.swatch').forEach((x) => { x.classList.toggle('selected', x === b); x.setAttribute('aria-pressed', x === b); });
  st.silverT = +b.dataset.finish; if (reduced) st.silver = st.silverT;
}));
document.querySelectorAll('[data-light]').forEach((b) => b.addEventListener('click', () => {
  document.querySelectorAll('[data-light]').forEach((x) => x.setAttribute('aria-pressed', x === b));
  st.duskT = b.dataset.light === 'dusk' ? 1 : 0; if (reduced) st.dusk = st.duskT;
  $('.studio-main')?.classList.toggle('dusk', st.duskT === 1);
}));
const exBtn = $('#explode');
exBtn?.addEventListener('click', () => {
  const on = exBtn.getAttribute('aria-pressed') !== 'true';
  exBtn.setAttribute('aria-pressed', on); exBtn.querySelector('.explode-word').textContent = on ? 'ASSEMBLE LENS' : 'EXPLODE LENS';
  studioHost.classList.toggle('exploded', on);
  st.explodeT = on ? 1 : 0; if (reduced) st.explode = st.explodeT;
});
/* drag to rotate (studio) */
if (studioHost) {
  let down = false, lx = 0;
  studioHost.addEventListener('pointerdown', (e) => { down = true; lx = e.clientX; studioHost.setPointerCapture(e.pointerId); $('#studio-hint')?.classList.add('used'); });
  studioHost.addEventListener('pointermove', (e) => { if (!down) return; const dx = e.clientX - lx; lx = e.clientX; st.dragYaw += dx * 0.008; st.dragV = dx * 0.008; });
  const up = () => { down = false; };
  studioHost.addEventListener('pointerup', up); studioHost.addEventListener('pointercancel', up);
}
addEventListener('pointermove', (e) => { st.ptrX = e.clientX / innerWidth - 0.5; st.ptrY = e.clientY / innerHeight - 0.5; }, { passive: true });

/* ---------- views ---------- */
const POSTER = /[?&]poster/.test(location.search);
if (POSTER) document.documentElement.classList.add('poster-mode');
const VIEWS = {
  hero:   { yaw: -0.3, el: 0.4, dist: 7.5, tx: 0.1, ty: 0.3, tz: 0.55, fov: 26, off: POSTER ? 0 : 0.23 },
  studio: { yaw: -0.38, el: 0.26, dist: 5.9, tx: 0.0, ty: 0.42, tz: 0.45, fov: 26 },
};
/* ?shot=close / ?shot=top : fixed close-up framings used for the detail proof shots */
const SHOT = (location.search.match(/[?&]shot=(\w+)/) || [])[1];
if (SHOT === 'close') VIEWS.hero = { yaw: -0.22, el: 0.12, dist: 2.3, tx: 0.1, ty: 0.41, tz: 0.8, fov: 26, off: 0 };
if (SHOT === 'top') VIEWS.hero = { yaw: 0.5, el: 0.75, dist: 2.6, tx: -0.25, ty: 0.85, tz: 0.1, fov: 26, off: 0 };
VIEWS.heroM = SHOT ? VIEWS.hero : { ...VIEWS.hero, off: 0, dist: 6.6, ty: 0.34, tz: 0.5 };
/* R3 scroll scan: three camera beats flown by scroll (body 3/4 -> lens close-up with the front element sliding out -> dials from above -> rear 3/4) */
const SCAN_K = [
  { p: 0.04, yaw: -0.95, el: 0.34, dist: 6.6, tx: 0.05, ty: 0.34, tz: 0.42, fov: 26, off: 0.2 },
  { p: 0.40, yaw: -0.2, el: 0.13, dist: 3.5, tx: 0.1, ty: 0.41, tz: 0.75, fov: 26, off: 0.22 },
  { p: 0.72, yaw: 0.52, el: 0.8, dist: 4.3, tx: -0.12, ty: 0.78, tz: 0.12, fov: 26, off: 0.27 },
  { p: 1.00, yaw: 2.45, el: 0.3, dist: 6.4, tx: 0.0, ty: 0.36, tz: 0.3, fov: 26, off: 0.2 },
];
const sm = (x) => x * x * (3 - 2 * x);
const scanV = { ...SCAN_K[0] };
function scanView(p) {
  let i = 0; while (i < SCAN_K.length - 2 && p > SCAN_K[i + 1].p) i++;
  const a = SCAN_K[i], b = SCAN_K[i + 1];
  const f = sm(Math.min(1, Math.max(0, (p - a.p) / (b.p - a.p))));
  for (const k of ['yaw', 'el', 'dist', 'tx', 'ty', 'tz', 'fov', 'off']) scanV[k] = a[k] + (b[k] - a[k]) * f;
  return scanV;
}
const beats = scanSec ? [...scanSec.querySelectorAll('.scan-beats li')] : [];
let scanP = reduced ? 0.4 : 0, scanPT = scanP, beatOn = -1;
function readScan() {
  if (!scanSec || reduced) return;
  const r = scanSec.getBoundingClientRect(), span = Math.max(1, r.height - innerHeight);
  scanPT = Math.min(1, Math.max(0, -r.top / span));
  const b = scanPT < 0.24 ? 0 : scanPT < 0.58 ? 1 : 2;
  if (b !== beatOn) { beatOn = b; beats.forEach((li, j) => li.classList.toggle('on', j === b)); }
  scanSec.style.setProperty('--sp', scanPT.toFixed(4));
}
if (reduced) beats.forEach((li) => li.classList.add('on'));
addEventListener('scroll', readScan, { passive: true }); readScan();
if (renderer.isStub) {
  const sf = scanSec && scanSec.querySelector('.scan-fallback'); if (sf) sf.hidden = false;
  const hf = $('.scene-fallback'); if (hf) hf.hidden = false;
  if (studioHost) studioHost.style.cssText += ';background:url(poster.webp) center/contain no-repeat';
}
const tmp = new THREE.Vector3();
function setView(v, rect, yawExtra) {
  cam.fov = v.fov; cam.aspect = rect.width / rect.height;
  const narrow = cam.aspect < 1.25;
  const off = narrow ? 0 : (v.off || 0);
  if (off) cam.setViewOffset(rect.width, rect.height, -off * rect.width, 0, rect.width, rect.height); else cam.clearViewOffset();
  cam.updateProjectionMatrix();
  const d = v.dist * (off ? 0.86 : 1) * (cam.aspect < 1 ? 1.25 / Math.max(cam.aspect, 0.55) : 1);
  const tx = v.tx, ty = v.ty, tz = v.tz;
  cam.position.set(tx + Math.sin(0.0) * 0, ty + Math.sin(v.el) * d, tz + Math.cos(v.el) * d);
  cam.lookAt(tx, ty, tz);
  rig.rotation.y = v.yaw + yawExtra;
}
function applyExplode(e) {
  if (!lensPivot) return;
  const k = e * e * (3 - 2 * e);
  lensPivot.position.set(0.0079, 0.0338 + 0.012 * k, 0.062 * k);
  lensPivot.rotation.z = -0.9 * k;
  frontPivot.position.z = 0.03 * k;
}
function placeAnn(rect) {
  if (!model || !ann.length) return;
  for (const el of ann) {
    const id = el.dataset.a, p = anchors[id].clone();
    if (id === 'lens' && lensPivot) { p.set(0, 0, 0.071); frontPivot.localToWorld(p); }
    else if (id === 'mount' && lensPivot) { p.set(0, 0, 0.012); lensPivot.localToWorld(p); }
    else model.localToWorld(p);
    p.project(cam);
    const x = (p.x * 0.5 + 0.5) * rect.width, y = (-p.y * 0.5 + 0.5) * rect.height;
    const flip = x > rect.width * 0.55; el.classList.toggle('flip', flip);
    el.style.transform = `translate(${flip ? x - el.offsetWidth + 5 : x - 5}px, ${y - 5}px)`;
  }
}

/* ---------- loop ---------- */
let W = 0, H = 0, drew = true;
function resize() {
  W = innerWidth; H = innerHeight;
  renderer.setSize(W, H, false);
}
resize(); addEventListener('resize', resize);
const clock = new THREE.Clock();
function frame() {
  const dt = Math.min(clock.getDelta(), 0.05);
  st.t += dt;
  const k = reduced ? 60 : 4.5;
  st.explode = damp(st.explode, st.explodeT, k * 0.8, dt);
  scanP = reduced ? scanPT : damp(scanP, scanPT, 6, dt);
  st.silver = damp(st.silver, st.silverT, k, dt);
  st.dusk = damp(st.dusk, st.duskT, k * 0.7, dt);
  if (!reduced) { st.dragV *= Math.pow(0.04, dt); st.dragYaw += st.dragV * 0.0; }
  uSilver.value = st.silver;
  if (drew) { renderer.setScissor(0, 0, W, H); renderer.setViewport(0, 0, W, H); renderer.clear(); drew = false; }
  if (model) {
    for (const host of hosts) {
      const r = host.getBoundingClientRect();
      if (r.bottom < 0 || r.top > H || r.width < 2) continue;
      const isStudio = host === studioHost, isScan = host === scanHost;
      const v = isScan ? scanView(scanP) : isStudio ? VIEWS.studio : (host === heroLive ? VIEWS.heroM : VIEWS.hero);
      const idle = reduced ? 0 : (isStudio ? 0 : isScan ? st.ptrX * 0.06 : Math.sin(st.t * 0.35) * 0.16 + st.ptrX * 0.25);
      setView(v, r, isStudio ? st.dragYaw + (reduced ? 0 : st.ptrX * 0.08) : idle);
      const lensBump = isScan ? Math.max(0, 1 - Math.abs(scanP - 0.42) / 0.17) : 0;
      const e = isStudio ? st.explode : lensBump, du = isStudio ? st.dusk : 0;
      applyExplode(e);
      scene.environmentIntensity = 0.9 - du * 0.45;
      key.intensity = 2.1 - du * 1.4; key.color.setRGB(1, 0.945 - du * 0.12, 0.875 - du * 0.1);
      rim.intensity = 1.3 + du * 1.6; rim.color.setRGB(1, 0.78 - du * 0.12, 0.6 - du * 0.2);
      dusk.intensity = du * 1.4;
      ground.material.opacity = 0.32 - du * 0.12;
      const y = H - r.bottom;
      renderer.setViewport(r.left, y, r.width, r.height);
      renderer.setScissor(r.left, y, r.width, r.height);
      renderer.render(scene, cam); drew = true;
      if (isStudio) placeAnn(r);
    }
  }
  requestAnimationFrame(frame);
}

/* lazy: start when the page is idle; render loop pauses itself when the tab is hidden (rAF) */
const start = () => renderer.isStub ? null : build().catch((e) => { const fb = $('.scene-fallback'); if (fb) fb.hidden = false; const sf = $('.scan-fallback'); if (sf) sf.hidden = false; console.warn('HALDE model failed to load', e && e.message); });
if (isM && studioHost && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); start(); } }, { rootMargin: '900px 0px' });
  hosts.forEach((h) => io.observe(h)); /* R2: hero on phone runs the same live model too */
} else if (document.readyState === 'complete') start(); else addEventListener('load', start, { once: true });
requestAnimationFrame(frame);
