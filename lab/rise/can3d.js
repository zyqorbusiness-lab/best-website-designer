/* Rise No.3: the hero is the can, in 3D. An aluminium can with a printed label, whole strawberries orbiting it and
   bubbles fizzing out of the open tab, all modelled in code with three.js (Zyqor Studio, MIT; no downloaded models).
   Time: the berries orbit and tumble, the fizz never stops. Scroll: the camera circles from the hero view to the open
   tab and back out. Phone: same scene and models, fewer bubbles, DPR capped at 1.5, the can framed below the headline.
   Reduced motion: one still frame. No WebGL: the poster image (an own render of this scene) stays. */
import * as THREE from 'three';
import { RoomEnvironment } from '../../vendor/three/addons/environments/RoomEnvironment.js';


function hasGL() { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } }
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };
const hash = (n) => { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); };

function init(root) {
  const isM = document.documentElement.dataset.build === 'm';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) root.classList.add('rs3d-still');
  if (!hasGL()) { root.classList.add('rs3d-nogl'); return; }
  const canvas = root.querySelector('canvas');
  const stage = root.querySelector('.rs3d-stage');
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' }); }
  catch (e) { root.classList.add('rs3d-nogl'); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, isM ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const BG = new THREE.Color('#F8EBCB');
  const scene = new THREE.Scene();
  scene.background = BG;
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const camera = new THREE.PerspectiveCamera(isM ? 38 : 30, 1, 0.05, 60);
  const key = new THREE.DirectionalLight(0xfff1dc, 2.4);
  key.position.set(3, 7, 4); key.castShadow = true;
  key.shadow.mapSize.set(isM ? 1024 : 2048, isM ? 1024 : 2048);
  Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 0.5, far: 20 });
  key.shadow.bias = -0.0004; key.shadow.radius = 5;
  scene.add(key, new THREE.HemisphereLight(0xfff7e6, 0xe8c9a0, 0.6));
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ color: 0x8a5a2a, opacity: 0.18 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

  /* the can: one lathe for the body, a printed label, a lid with a pull tab */
  const SEG = isM ? 48 : 80;
  const R0 = 0.62, H = 2.3;
  const prof = [[0, 0.02], [0.45, 0.0], [0.56, 0.03], [0.6, 0.12], [R0, 0.24], [R0, H - 0.26], [0.58, H - 0.12], [0.5, H - 0.03], [0.5, H], [0.47, H]].map(([x, y]) => new THREE.Vector2(x, y));
  const lc = document.createElement('canvas'); lc.width = 1024; lc.height = 512; const lx = lc.getContext('2d');
  const tex = new THREE.CanvasTexture(lc); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8; tex.wrapS = THREE.RepeatWrapping;
  function drawLabel() {
    lx.fillStyle = '#E3343B'; lx.fillRect(0, 0, 1024, 512);
    lx.fillStyle = '#F8EBCB'; lx.fillRect(0, 380, 1024, 132);
    lx.fillStyle = 'rgba(248,235,203,.18)';
    for (let i = 0; i < 40; i++) { const x = hash(i) * 1024, y = 40 + hash(i + 9) * 320, r = 6 + hash(i + 3) * 18; lx.beginPath(); lx.arc(x, y, r, 0, Math.PI * 2); lx.fill(); }
    lx.fillStyle = '#F8EBCB'; lx.textAlign = 'center';
    lx.font = '800 170px Archivo, Impact, sans-serif'; lx.fillText('RISE', 256, 250); lx.fillText('RISE', 768, 250);
    lx.font = '700 30px "Inter Tight", system-ui, sans-serif'; lx.fillText('No.3 · SPARKLING STRAWBERRY', 256, 318); lx.fillText('No.3 · SPARKLING STRAWBERRY', 768, 318);
    lx.fillStyle = '#4A0F1E'; lx.font = '700 26px "Inter Tight", system-ui, sans-serif'; lx.fillText('ZERO ADDED SUGAR · 330 ML', 256, 455); lx.fillText('ZERO ADDED SUGAR · 330 ML', 768, 455);
    tex.needsUpdate = true;
  }
  drawLabel(); if (document.fonts && document.fonts.load) Promise.all([document.fonts.load('800 170px Archivo'), document.fonts.load('700 40px "Inter Tight"')]).then(() => { drawLabel(); if (ready) render(); }).catch(() => {});
  const can = new THREE.Group(); scene.add(can);
  const metal = new THREE.MeshStandardMaterial({ color: 0xdedfe2, metalness: 1, roughness: 0.22 });
  const body = new THREE.Mesh(new THREE.LatheGeometry(prof, SEG), metal); body.castShadow = true; can.add(body);
  const label = new THREE.Mesh(new THREE.CylinderGeometry(R0 + 0.003, R0 + 0.003, H - 0.62, SEG, 1, true), new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.32, metalness: 0.15, clearcoat: 0.8, clearcoatRoughness: 0.15 }));
  label.position.y = H / 2; label.rotation.y = -Math.PI / 2; can.add(label);
  const lid = new THREE.Mesh(new THREE.CircleGeometry(0.47, SEG), metal); lid.rotation.x = -Math.PI / 2; lid.position.y = H - 0.04; can.add(lid);
  const hole = new THREE.Mesh(new THREE.CircleGeometry(0.11, 24), new THREE.MeshBasicMaterial({ color: 0x2a0a10 })); hole.rotation.x = -Math.PI / 2; hole.position.set(0, H - 0.035, 0.22); hole.scale.set(1, 0.001, 1); can.add(hole);
  const tabPivot = new THREE.Group(); tabPivot.position.set(0, H - 0.03, 0.02); can.add(tabPivot);
  const tabShape = new THREE.Shape(); tabShape.absellipse(0, 0, 0.12, 0.2, 0, Math.PI * 2, false, 0);
  const ring = new THREE.Path(); ring.absellipse(0, -0.06, 0.06, 0.08, 0, Math.PI * 2, true, 0); tabShape.holes.push(ring);
  const tab = new THREE.Mesh(new THREE.ExtrudeGeometry(tabShape, { depth: 0.012, bevelEnabled: true, bevelSize: 0.006, bevelThickness: 0.004, bevelSegments: 2 }), metal);
  tab.rotation.x = -Math.PI / 2; tab.position.set(0, 0.01, -0.06); tab.castShadow = true; tabPivot.add(tab);

  /* strawberries: a tapered, slightly lumpy body, instanced seeds, a leafy green calyx */
  const berryGeo = new THREE.SphereGeometry(0.26, isM ? 32 : 48, isM ? 24 : 36);
  { const p = berryGeo.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const y = v.y / 0.26; const taper = 1 - 0.42 * smooth(0.1, -1, y) * 0 - 0.38 * clamp(-y) ; const lump = 1 + 0.03 * Math.sin(v.x * 40) * Math.sin(v.z * 40); v.x *= taper * lump; v.z *= taper * lump; v.y *= 1.18; p.setXYZ(i, v.x, v.y, v.z); }
    berryGeo.computeVertexNormals(); }
  const berryMat = new THREE.MeshPhysicalMaterial({ color: 0xD3202E, roughness: 0.28, clearcoat: 0.9, clearcoatRoughness: 0.2, sheen: 0.3, sheenColor: new THREE.Color('#ff8a8a') });
  const seedGeo = new THREE.SphereGeometry(0.012, 6, 4); seedGeo.scale(1, 1.6, 1);
  const seedMat = new THREE.MeshStandardMaterial({ color: 0xF0C54A, roughness: 0.5 });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x3E8A3A, roughness: 0.6, side: THREE.DoubleSide });
  const leafShape = new THREE.Shape(); leafShape.moveTo(0, 0); leafShape.quadraticCurveTo(0.07, 0.07, 0, 0.17); leafShape.quadraticCurveTo(-0.07, 0.07, 0, 0);
  const leafGeo = new THREE.ShapeGeometry(leafShape, 6);
  function makeBerry() {
    const g = new THREE.Group();
    const b = new THREE.Mesh(berryGeo, berryMat); b.castShadow = true; g.add(b);
    const n = isM ? 60 : 110; const seeds = new THREE.InstancedMesh(seedGeo, seedMat, n); const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(1, 1, 1), up = new THREE.Vector3(0, 1, 0);
    const p = berryGeo.attributes.position, nr = berryGeo.attributes.normal, v = new THREE.Vector3(), nn = new THREE.Vector3();
    for (let i = 0; i < n; i++) { const k = Math.floor(hash(i * 7.3 + 1) * p.count); v.fromBufferAttribute(p, k); if (v.y > 0.2) { v.y = -v.y * 0.6; } nn.fromBufferAttribute(nr, k); v.addScaledVector(nn, 0.004); q.setFromUnitVectors(up, nn); m.compose(v, q, s); seeds.setMatrixAt(i, m); }
    g.add(seeds);
    for (let i = 0; i < 6; i++) { const l = new THREE.Mesh(leafGeo, leafMat); l.position.y = 0.29; l.rotation.set(-1.1, i * Math.PI / 3, 0, 'YXZ'); g.add(l); }
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.016, 0.1, 6), leafMat); stem.position.y = 0.35; g.add(stem);
    return g;
  }
  /* berries orbit the can on a tilted ring, each at its own height and tumble */
  const berries = [];
  const NBR = 6;
  for (let i = 0; i < NBR; i++) { const b = makeBerry(); b.userData = { a: i / NBR * Math.PI * 2 + hash(i) * 0.4, y: 0.75 + hash(i * 3.3) * 1.25, s: 0.85 + hash(i * 6.1) * 0.35, sp: 0.8 + hash(i * 1.7) * 0.4, ph: hash(i * 8.2) * 6.28 }; b.scale.setScalar(b.userData.s); scene.add(b); berries.push(b); }

  /* bubbles: instanced; most fizz out of the open tab, the rest drift up around the can */
  const NB = isM ? 90 : 170;
  const bub = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 12, 8), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.05, transmission: 0.9, thickness: 0.05, transparent: true, opacity: 0.8, clearcoat: 1 }), NB);
  bub.frustumCulled = false; scene.add(bub);
  const bm = new THREE.Matrix4(), bq = new THREE.Quaternion(), bs = new THREE.Vector3(), bp = new THREE.Vector3();
  /* the tab is open from the first frame */
  tabPivot.rotation.x = -1.1; hole.scale.set(1, 1, 1);

  /* story: three camera keys, eased by scroll */
  const steps = [...root.querySelectorAll('.rs3d-steps li')];
  let lastStep = -1;
  const keys = isM ? [
    { c: [0.0, 2.2, 9.6], l: [0, 1.45, 0] },
    { c: [2.4, 7.4, 7.0], l: [0, 1.7, 0] },
    { c: [-1.8, 2.6, 9.8], l: [0, 1.55, 0] },
  ] : [
    { c: [0.6, 2.0, 7.4], l: [0, 1.4, 0] },
    { c: [2.8, 6.4, 6.0], l: [0, 1.75, 0] },
    { c: [-2.3, 2.5, 7.8], l: [0, 1.6, 0] },
  ];
  const kv = keys.map((k) => ({ c: new THREE.Vector3(...k.c), l: new THREE.Vector3(...k.l) }));
  const cp = new THREE.Vector3(), lk = new THREE.Vector3();
  /* where the can's centre sits on screen (fractions of the stage): right of the copy on desktop, under it on phone */
  let fx = 0.66, fy = 0.5;
  function frame() {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (isM || w / h < 1.05) { fx = 0.5; const copy = root.querySelector('.rs-copy'); const cb = copy ? (copy.getBoundingClientRect().bottom - stage.getBoundingClientRect().top) / h : 0.45; fy = Math.min(0.74, Math.max(0.6, cb + (1 - cb) * 0.5)); }
    else { fx = w > 1100 ? 0.7 : 0.71; fy = 0.53; }
    camera.setViewOffset(w, h, (0.5 - fx) * w, (0.5 - fy) * h, w, h);
  }
  function place(p, t) {
    /* berries: orbit + tumble + bob */
    const ringR = (isM ? 1.18 : 1.36) + 0.12 * Math.sin(p * Math.PI);
    berries.forEach((b, i) => {
      const u = b.userData; const a = u.a + t * 0.32 * u.sp;
      b.position.set(Math.cos(a) * ringR, u.y + Math.sin(t * 0.9 + u.ph) * 0.12 + Math.sin(a) * 0.18, Math.sin(a) * ringR * 0.92);
      b.rotation.set(1.2 + Math.sin(t * 0.7 + u.ph) * 0.6, a * 1.4 + u.ph, 0.35 + t * 0.25 * u.sp);
    });
    can.rotation.y = -0.45 + Math.sin(t * 0.35) * 0.22 + p * 0.9;
    can.position.y = Math.sin(t * 0.8) * 0.04;
    /* bubbles */
    const nTab = Math.floor(NB * 0.62);
    for (let i = 0; i < NB; i++) {
      const ph = hash(i * 3.1), sp = 0.5 + hash(i * 5.7);
      let sz;
      if (i < nTab) {
        const life = (t * 0.32 * sp + ph) % 1;
        const a = hash(i * 9.1) * Math.PI * 2, r = 0.02 + hash(i * 2.3) * 0.08 + life * 0.3;
        bp.set(Math.cos(a) * r + Math.sin(life * 9 + i) * 0.03, H + 0.02 + can.position.y + life * (isM ? 1.25 + hash(i) * 0.7 : 2.0 + hash(i) * 1.4), 0.22 + Math.sin(a) * r);
        sz = (0.014 + hash(i * 4.4) * 0.032) * (1 - life * 0.35) * Math.min(1, life * 12);
      } else {
        const life = (t * 0.09 * sp + ph) % 1;
        const a = hash(i * 9.1) * Math.PI * 2, r = 0.9 + hash(i * 2.3) * 1.6;
        bp.set(Math.cos(a) * r + Math.sin(life * 6 + i) * 0.05, -0.1 + life * (isM ? 3.2 : 4.4), Math.sin(a) * r * 0.7);
        sz = (0.012 + hash(i * 4.4) * 0.03) * Math.min(1, life * 8, (1 - life) * 8);
      }
      bs.setScalar(Math.max(sz, 0.00001)); bm.compose(bp, bq, bs); bub.setMatrixAt(i, bm);
    }
    bub.instanceMatrix.needsUpdate = true;
    const w1 = smooth(0.18, 0.5, p), w2 = smooth(0.58, 0.92, p);
    cp.copy(kv[0].c).lerp(kv[1].c, w1).lerp(kv[2].c, w2);
    lk.copy(kv[0].l).lerp(kv[1].l, w1).lerp(kv[2].l, w2);
    camera.position.copy(cp); camera.lookAt(lk);
    const si = p < 0.34 ? 0 : p < 0.67 ? 1 : 2;
    if (si !== lastStep) { steps.forEach((s, i) => s.classList.toggle('on', i === si)); lastStep = si; }
  }
  let ready = false;
  const T0 = performance.now();
  const STILL_T = 2.2;
  function now() { return reduced ? STILL_T : (window.__riseT != null ? window.__riseT : (performance.now() - T0) / 1000 + STILL_T); }
  function render() {
    place(cur, now()); renderer.render(scene, camera); ready = true;
    if (!root.classList.contains('rs3d-ready')) root.classList.add('rs3d-ready');
  }
  function progress() {
    if (reduced) return 0;
    const r = root.getBoundingClientRect(); const span = root.offsetHeight - innerHeight;
    return span > 0 ? clamp(-r.top / span) : 0;
  }
  let cur = progress(), target = cur, inView = true, raf = 0;
  root.style.setProperty('--p', cur.toFixed(3));
  function tick() {
    raf = 0; target = progress();
    cur += (target - cur) * 0.12; if (Math.abs(target - cur) < 0.0004) cur = target;
    root.style.setProperty('--p', cur.toFixed(3));
    render();
    if (inView && !document.hidden && !reduced) raf = requestAnimationFrame(tick);
  }
  const kick = () => { if (inView && !raf) raf = requestAnimationFrame(tick); };
  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); frame(); render();
  }
  new ResizeObserver(resize).observe(stage);
  new IntersectionObserver((es) => { inView = es[0].isIntersecting; if (inView) kick(); }, { rootMargin: '100px 0px' }).observe(root);
  addEventListener('scroll', kick, { passive: true });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) kick(); });
  resize(); kick();
}

const root = document.querySelector('.rs3d');
if (root) init(root);

/* page helpers (the page no longer loads the footage runtime): [data-rv] reveals, [data-count] rolls, magnetic pills */
{
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isM = document.documentElement.dataset.build === 'm';
  const els = [...document.querySelectorAll('[data-rv]')];
  if (reduced || !('IntersectionObserver' in window)) els.forEach((e) => e.classList.add('rv-in'));
  else { const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('rv-in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }); els.forEach((e) => io.observe(e)); }
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const run = (el) => { const end = +el.dataset.count; if (reduced) { el.textContent = String(end); return; } const t0 = performance.now(); const tk = (tt) => { const k = ease(clamp((tt - t0) / 1400)); el.textContent = Math.round(end * k); if (k < 1) requestAnimationFrame(tk); }; requestAnimationFrame(tk); };
  const cs = [...document.querySelectorAll('[data-count]')];
  if (!('IntersectionObserver' in window)) cs.forEach(run);
  else { const io2 = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { run(en.target); io2.unobserve(en.target); } }), { threshold: 0.5 }); cs.forEach((e) => io2.observe(e)); }
  if (!reduced && !isM && matchMedia('(hover: hover)').matches) document.querySelectorAll('.vf-mag').forEach((el) => {
    el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); el.style.transform = `translate(${((e.clientX - r.left) / r.width - 0.5) * 14}px,${((e.clientY - r.top) / r.height - 0.5) * 10}px)`; });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}
