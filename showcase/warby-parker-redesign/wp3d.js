/* wp3d.js - the 3D layer of the Warby Parker redesign concept by Zyqor Studio (unofficial; not affiliated with Warby Parker).
   One WebGL canvas behind the page. A real glTF frame (Khronos "Sunglasses Khronos", Eric Chadwick / Darmstadt Graphics Group,
   CC BY 4.0, geometry only, logo texture not used) with every material rebuilt here: acetate finishes (procedural tortoiseshell),
   real-transmission lenses that tint the sunlit street photo behind them (Poly Haven, CC0), studio light from a CC0 HDRI. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const $ = (s, r = document) => r.querySelector(s);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const lerp = (a, b, t) => a + (b - a) * t;
const sstep = (t) => t * t * (3 - 2 * t);
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const PHONE = matchMedia('(max-width: 760px)').matches;

const canvas = $('#gl');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
} catch (e) { document.documentElement.classList.add('no-gl'); throw e; }
if (!renderer.getContext()) { document.documentElement.classList.add('no-gl'); }
renderer.setPixelRatio(Math.min(devicePixelRatio, PHONE ? 1.75 : 2));
renderer.toneMapping = THREE.NeutralToneMapping; // keeps paper white through the lenses (ACES greys the transmitted background)
renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const PAPER = new THREE.Color('#F6F9F8');
scene.background = PAPER.clone();
const camera = new THREE.PerspectiveCamera(PHONE ? 34 : 28, 1, 0.01, 20);

/* light: RoomEnvironment (a code-built studio box) for reflections + a soft key from top-left (the DOM shadows use the same direction) */
const pmrem = new THREE.PMREMGenerator(renderer);
const key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(-0.6, 1.0, 0.8); scene.add(key);
scene.add(new THREE.HemisphereLight(0xffffff, 0xcfdedb, 0.5));

/* ---------- materials ---------- */
const NOISE = `
float h31(vec3 p){ p=fract(p*0.3183099+vec3(0.1,0.2,0.3)); p*=17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float vn3(vec3 x){ vec3 i=floor(x), f=fract(x); f=f*f*(3.0-2.0*f);
  return mix(mix(mix(h31(i),h31(i+vec3(1,0,0)),f.x),mix(h31(i+vec3(0,1,0)),h31(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(h31(i+vec3(0,0,1)),h31(i+vec3(1,0,1)),f.x),mix(h31(i+vec3(0,1,1)),h31(i+vec3(1,1,1)),f.x),f.y),f.z); }
float fbm3(vec3 p){ float s=0.0,a=0.5; for(int i=0;i<5;i++){ s+=a*vn3(p); p=p*2.07+vec3(1.7,9.2,3.1); a*=0.5; } return s; }`;

/* one acetate material per frame copy; uniforms drive the finish so a swap is a tween, not a recompile */
function acetate() {
  const m = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.18, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.06,
    transmission: 0, thickness: 0.004, ior: 1.49, envMapIntensity: 1.0, side: THREE.DoubleSide });
  const U = { uTort: { value: 1 }, uA: { value: new THREE.Color('#1f0d05') }, uB: { value: new THREE.Color('#9a5a22') }, uC: { value: new THREE.Color('#d8a259') } };
  m.userData.U = U;
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vOP;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvOP = position;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vOP;\nuniform float uTort; uniform vec3 uA,uB,uC;' + NOISE)
      .replace('#include <color_fragment>', `#include <color_fragment>
        { vec3 q = vOP * vec3(95.0, 95.0, 160.0);
          float n = fbm3(q + 2.0*fbm3(q*0.6));
          float spots = smoothstep(0.42, 0.62, n);
          float glow = smoothstep(0.35, 0.8, fbm3(q*0.35 + 7.0));
          vec3 tort = mix(mix(uC, uB, smoothstep(0.2,0.55,n)), uA, spots);
          tort = mix(tort, uC*1.08, (1.0-spots)*glow*0.35);
          diffuseColor.rgb = mix(diffuseColor.rgb, tort, uTort); }`);
  };
  m.customProgramCacheKey = () => 'wp-acetate';
  return m;
}
export const FINISHES = [
  { id: 'tortoise', name: 'Whiskey Tortoise', tort: 1, color: '#ffffff', rough: 0.16, trans: 0 },
  { id: 'black', name: 'Jet Black', tort: 0, color: '#121414', rough: 0.12, trans: 0 },
  { id: 'crystal', name: 'Crystal', tort: 0, color: '#eef3f2', rough: 0.05, trans: 0.92 },
  { id: 'sea', name: 'Sea Glass', tort: 0, color: '#3f9c8f', rough: 0.07, trans: 0.7 },
];
function applyFinish(m, f, k = 1) { // k = blend amount toward f (for tweening from the current state)
  const U = m.userData.U;
  U.uTort.value = lerp(U.uTort.value, f.tort, k);
  m.color.lerp(new THREE.Color(f.color), k);
  m.roughness = lerp(m.roughness, f.rough, k);
  m.transmission = lerp(m.transmission, f.trans, k);
}
/* lens stops: Clear, Blue-light (faint warm tint), Light-responsive (mid grey), Sun (G-15 green grey). Iridescence was tried and dropped:
   with a studio env it paints magenta smudges on the lens (and purple is off-palette). */
const LENS = [
  { c: '#ffffff', iri: 0.0, env: 0.5 },
  { c: '#fff2cf', iri: 0.0, env: 0.6 },
  { c: '#a9b0ab', iri: 0.0, env: 0.7 },
  { c: '#56665b', iri: 0.0, env: 0.8 },   // ~10% of the light through, like a real category-3 sun lens
];
const lensMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 1, roughness: 0.02, metalness: 0, ior: 1.5, thickness: 0.0015,
  specularIntensity: 0.55, envMapIntensity: 0.2, iridescence: 0, iridescenceIOR: 1.8, iridescenceThicknessRange: [180, 420], side: THREE.DoubleSide });
const lensIn = lensMat.clone();
function setLens(v) { // v in 0..3
  v = Math.min(3, Math.max(0, v)); const i = Math.min(2, Math.floor(v)), t = sstep(v - i);
  const a = LENS[i], b = LENS[i + 1];
  for (const m of [lensMat, lensIn]) {
    if (m === lensIn) { m.envMapIntensity = 0.25; continue; } // only the outer surface carries the tint (two tinted surfaces = black)
    m.color.set(a.c).lerp(new THREE.Color(b.c), t);
    m.iridescence = lerp(a.iri, b.iri, t) * (m === lensIn ? 0 : 1);
    m.envMapIntensity = lerp(a.env, b.env, t);
  }
  S.lens = v; dirty = true;
}
const padMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 1, roughness: 0.1, thickness: 0.003, ior: 1.45 });
const hingeMat = new THREE.MeshPhysicalMaterial({ color: 0xc9cfcd, metalness: 1, roughness: 0.22 });

/* ---------- street (the view through the lenses) ---------- */
/* the street must be OPAQUE: three.js only renders opaque objects into the transmission pass, so a transparent plane would
   never be seen through the lenses. The fade in/out is a paper-coloured veil in front of it (transparent, so the lenses
   keep seeing the street while the veil fades). */
const street = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }));
street.visible = false; scene.add(street);
const veil = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: PAPER, transparent: true, opacity: 1, toneMapped: false, depthWrite: false }));
veil.visible = false; scene.add(veil);
new THREE.TextureLoader().load(PHONE ? 'img/street-m.webp' : 'img/street.webp', (t) => {
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; street.material.map = t; street.material.needsUpdate = true; street.userData.aspect = t.image.width / t.image.height; dirty = true;
});

/* ---------- frames ---------- */
const S = { open: RM ? 1 : 0, lens: 0, finish: 0, drag: 0, dragV: 0, loaded: false };
const rig = new THREE.Group(); scene.add(rig);           // scroll-driven pose of the hero frame
const copies = [];                                       // 5 frames for Home Try-On (index 2 is the hero frame)
let dirty = true;
const TRY = [3, 1, 0, 2, 3]; // finishes of the five try-on frames (slot 2 = the hero frame, keeps the chosen finish)
const TRYF = [FINISHES[3], FINISHES[1], null, FINISHES[2], FINISHES[0]];

const TRYLENS = ['#ffffff', '#56665b', null, '#fff2cf', '#7a6450']; // clear, sun green, (hero), blue-light, sun brown
const lensClones = [];
function fixedLens(c, outer) { const m = lensMat.clone(); lensClones.push(m); m.color.set(outer ? c : '#ffffff'); m.iridescence = 0; return m; }
function buildFrame(src, finish, lensC) {
  const g = new THREE.Group(); const inner = src.clone(true);
  const LO = lensC ? fixedLens(lensC, true) : lensMat, LI = lensC ? fixedLens(lensC, false) : lensIn;
  const mat = acetate(); applyFinish(mat, finish, 1);
  const hinges = [];
  inner.traverse((o) => {
    if (!o.isMesh) return;
    const n = (o.name || '') + '|' + (o.material && o.material.name);
    if (/lens_exterior/.test(n)) o.material = LO;
    else if (/lens_interior/.test(n)) o.material = LI;
    else if (/nose_pads/.test(n)) o.material = padMat;
    else if (/Temple/i.test(o.name)) { o.material = hingeMat; }
    else o.material = mat; // frame front + earhooks (the earhook logo texture is dropped)
    o.castShadow = false;
  });
  g.add(inner);
  g.userData = { mat, inner };
  return g;
}
/* temples fold about their hinge: wrap each side (hinge + earhook) in a pivot placed at the hinge */
function rigTemples(g) {
  const inner = g.userData.inner; inner.updateMatrixWorld(true);
  const sides = { L: [], R: [] };
  inner.traverse((o) => { if (!o.isMesh) return; if (/Left/.test(o.name)) sides.L.push(o); if (/Right/.test(o.name)) sides.R.push(o); });
  g.userData.piv = {};
  for (const k of ['L', 'R']) {
    const hinge = sides[k].find((o) => /Temple/.test(o.name)); if (!hinge) continue;
    const c = new THREE.Box3().setFromObject(hinge).getCenter(new THREE.Vector3());
    const piv = new THREE.Group(); piv.position.copy(c); inner.add(piv); piv.updateMatrixWorld(true);
    for (const o of sides[k]) piv.attach(o);
    g.userData.piv[k] = piv;
  }
}
function setOpen(g, u) { // u: 0 folded, 1 open
  const p = g.userData.piv; if (!p) return; const a = (1 - u) * 1.52;
  if (p.L) p.L.rotation.y = -a * (p.L.position.x > 0 ? 1 : -1);
  if (p.R) p.R.rotation.y = -a * (p.R.position.x > 0 ? 1 : -1);
}

let hero; let frameW = 0.15;
const loader = new GLTFLoader();
Promise.all([
  Promise.resolve().then(() => {
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.03).texture; scene.environmentRotation.set(0.35, 0.9, 0);
    /* lenses get their own soft sky-gradient env: RoomEnvironment's light boxes read as white smudges on a lens */
    const gs = new THREE.Scene(); const sky = new THREE.Mesh(new THREE.SphereGeometry(5, 32, 16), new THREE.ShaderMaterial({ side: THREE.BackSide,
      vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: 'varying vec3 vP; void main(){ float h = normalize(vP).y; vec3 c = mix(vec3(0.18,0.2,0.2), vec3(1.6,1.7,1.7), smoothstep(-0.2,0.7,h)); gl_FragColor = vec4(c,1.0); }' }));
    gs.add(sky); const lensEnv = pmrem.fromScene(gs, 0.02).texture;
    for (const m of [lensMat, lensIn, ...lensClones]) m.envMap = lensEnv;
  }),
  new Promise((res, rej) => loader.load('3d/frame.glb', res, undefined, rej)),
]).then(([, gl]) => {
  const src = gl.scene;
  const box = new THREE.Box3().setFromObject(src); const ctr = box.getCenter(new THREE.Vector3()); const size = box.getSize(new THREE.Vector3());
  src.position.sub(ctr); // centre the frame on its own middle
  frameW = Math.max(size.x, 0.12);
  for (let i = 0; i < 5; i++) {
    const g = buildFrame(src, i === 2 ? FINISHES[0] : TRYF[i], i === 2 ? null : TRYLENS[i]);
    rigTemples(g); setOpen(g, i === 2 ? S.open : 1);
    if (i === 2) { hero = g; rig.add(g); } else { g.visible = false; scene.add(g); }
    copies.push(g);
  }
  // a test hook for the sanity of the fold: temples must end up behind the front when open
  S.loaded = true; document.documentElement.classList.add('gl-ready'); dirty = true;
  if (!RM) S.unfoldAt = performance.now() + 250;
  window.dispatchEvent(new Event('wp3d-ready'));
}).catch((e) => { console.error(e); document.documentElement.classList.add('no-gl'); });

/* ---------- scroll keys ---------- */
/* each key: world width to fit (w), screen offset of the frame (dx desktop, dy phone, in frame widths), turn (ry, rx),
   street plane opacity (st), try-on lineup amount (tr) */
const KEYS = { // w desktop fit width, wm portrait-phone fit width
  hero:   { w: 0.50, wm: 0.255, dx: 0.25, dy: 0.235, ry: -0.62, rx: 0.16, st: 0, tr: 0 },
  hero2:  { w: 0.48, wm: 0.255, dx: 0.25, dy: 0.235, ry: -2.2, rx: 0.10, st: 0, tr: 0 },
  finish: { w: 0.36, wm: 0.23, dx: -0.26, dy: 0.26, ry: 0.55, rx: 0.12, st: 0, tr: 0 },
  lens:   { w: 0.205, wm: 0.17, dx: 0, dy: 0.10, ry: 0, rx: 0.0, st: 1, tr: 0 },
  lens2:  { w: 0.19, wm: 0.16, dx: 0, dy: 0.10, ry: 0, rx: 0.0, st: 1, tr: 0 },
  tryon:  { w: 1.16, wm: 0.56, dx: 0, dy: 0.12, ry: -0.35, rx: 0.22, st: 0, tr: 1 },
  end:    { w: 1.16, wm: 0.56, dx: 0, dy: 0.06, ry: -0.35, rx: 0.22, st: 0, tr: 1 },
};
let stops = [];
function measure() {
  const y = (sel, f = 0) => { const e = $(sel); if (!e) return 0; const r = e.getBoundingClientRect(); return scrollY + r.top + e.offsetHeight * f; };
  const vh = innerHeight;
  stops = [
    [0, KEYS.hero],
    [Math.max(1, y('#hero', 1) - vh * 0.9), KEYS.hero2],
    [y('#finish', 0.18), KEYS.finish],
    [y('#finish', 1) - vh * 0.75, KEYS.finish],
    [y('#lens', 0) , KEYS.lens],
    [y('#lens', 1) - vh * 1.35, KEYS.lens2],
    [y('#tryon', 0) + vh * 0.05, KEYS.tryon],
    [y('#tryon', 1), KEYS.end],
  ];
}
function pose(sy) {
  let i = 0; while (i < stops.length - 2 && sy > stops[i + 1][0]) i++;
  const [y0, a] = stops[i], [y1, b] = stops[i + 1];
  const t = sstep(clamp01((sy - y0) / Math.max(1, y1 - y0)));
  const o = {}; for (const k in a) o[k] = lerp(a[k], b[k], t); return o;
}

/* ---------- size ---------- */
function resize() {
  const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); measure(); dirty = true;
}
addEventListener('resize', resize); resize();
addEventListener('load', measure);
if (document.fonts) document.fonts.ready.then(measure);

/* drag to turn (finish studio) */
const dz = $('#turnzone');
if (dz) {
  let down = false, lx = 0;
  dz.addEventListener('pointerdown', (e) => { down = true; lx = e.clientX; dz.setPointerCapture(e.pointerId); });
  dz.addEventListener('pointermove', (e) => { if (!down) return; const d = (e.clientX - lx) / 180; lx = e.clientX; S.drag += d; S.dragV = d; dirty = true; });
  const up = () => { down = false; }; dz.addEventListener('pointerup', up); dz.addEventListener('pointercancel', up);
}

/* finish swap: a quick spin + material tween */
let fTween = null;
function setFinish(i) {
  if (!hero) { S.finish = i; return; }
  const m = hero.userData.mat;
  S.finish = i; fTween = { t0: performance.now(), f: FINISHES[i], a: { tort: m.userData.U.uTort.value, color: m.color.clone(), rough: m.roughness, trans: m.transmission } }; S.spin = (S.spin || 0) + (RM ? 0 : Math.PI * 2); dirty = true;
}
window.__wp3d = { setLens, setFinish, FINISHES, get S() { return S; } };
window.dispatchEvent(new Event('wp3d-api'));

/* ---------- loop ---------- */
/* phone lineup: 3 over 2 (hero frame top middle) */
const PX = [-0.175, -0.088, 0, 0.175, 0.088], PY = [0.085, -0.075, 0.085, 0.085, -0.075];
const P = new THREE.Vector3(); const tmp = new THREE.Vector3();
let spinNow = 0, last = performance.now(), visible = true;
document.addEventListener('visibilitychange', () => { visible = !document.hidden; });
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (!visible || !hero) { if (dirty && !hero) { renderer.render(scene, camera); dirty = false; } return; }
  const k = pose(scrollY);
  // unfold on load
  if (S.unfoldAt !== undefined && now > S.unfoldAt && S.open < 1) { S.open = Math.min(1, S.open + dt / 1.6); setOpen(hero, sstep(S.open)); }
  if (fTween) { const u = clamp01((now - fTween.t0) / 650); const m = hero.userData.mat, A = fTween.a, F = fTween.f, e = sstep(u);
    m.userData.U.uTort.value = lerp(A.tort, F.tort, e); m.color.copy(A.color).lerp(new THREE.Color(F.color), e);
    m.roughness = lerp(A.rough, F.rough, e); m.transmission = lerp(A.trans, F.trans, e); if (u >= 1) fTween = null; }
  spinNow += ((S.spin || 0) - spinNow) * Math.min(1, dt * 5);
  const idle = RM ? 0 : Math.sin(now / 2400) * 0.06;
  // camera: solve the distance that fits world width k.w across the view
  const vfov = THREE.MathUtils.degToRad(camera.fov); const hf = 2 * Math.atan(Math.tan(vfov / 2) * camera.aspect);
  const portrait = camera.aspect < 0.8;
  const visW = portrait ? k.wm : k.w, visH = visW / camera.aspect;
  const dist = (visW / 2) / Math.tan(hf / 2);
  // frame offset in world units (desktop: sideways, phone: up)
  const ox = portrait ? 0 : -k.dx * visW; const oy = portrait ? -k.dy * visH : 0;
  camera.position.set(ox, oy + 0.006, dist); camera.lookAt(ox, oy, 0);
  rig.rotation.set(k.rx + idle * 0.3, k.ry + idle + spinNow + S.drag, 0);
  // street plane: sits behind the frame, sized to cover the view
  const sz = -0.22; const sd = dist - sz; const sh = 2 * Math.tan(vfov / 2) * sd * 1.08; const sw = sh * camera.aspect;
  const asp = street.userData.aspect || 1.5; const W = Math.max(sw, sh * asp), Hh = W / asp;
  street.position.set(ox, oy, sz); street.scale.set(W, Math.max(Hh, sh), 1); street.visible = k.st > 0.002 && !!street.material.map;
  veil.position.set(ox, oy, sz + 0.001); veil.scale.copy(street.scale); veil.material.opacity = 1 - k.st; veil.visible = street.visible && k.st < 0.998;
  // the street brightens the lens env a touch so the tint reads
  // try-on lineup: hero frame slides to slot 2 (middle), others rise in
  const tr = k.tr; const gap = 0.19;
  rig.position.set(0, lerp(0, (portrait ? PY[2] : 0) - 0.02, tr), 0);
  for (let i = 0; i < 5; i++) {
    const g = copies[i]; if (i === 2) { g.position.set(0, 0, 0); continue; }
    const ti = clamp01(tr * 1.6 - Math.abs(i - 2) * 0.25);
    g.visible = ti > 0.001; if (!g.visible) continue;
    const e = sstep(ti);
    const px = portrait ? PX[i] : (i - 2) * gap, py = portrait ? PY[i] : 0;
    g.position.set(px, lerp(-0.35, py - 0.02, e), lerp(-0.1, 0, e));
    g.rotation.set(k.rx + idle * 0.3, k.ry + idle * (i % 2 ? -1 : 1) + (1 - e) * 1.2 * (i < 2 ? -1 : 1), 0);
  }
  renderer.render(scene, camera);
}
requestAnimationFrame(frame);
setLens(0);
