/* Rise No.3: the can, in 3D. An aluminium can with a printed label, whole strawberries and rising bubbles, all modelled
   in code with three.js (Zyqor Studio, MIT; no downloaded models). Scroll: the berries tumble in, the tab pops, the fizz
   rises out of the can. Phone: same scene, fewer bubbles, DPR capped at 1.5. Reduced motion: one still frame (tab open).
   No WebGL: the poster image stays. */
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
  const berries = [];
  const spots = [[-1.25, 0.31, 0.5, 0.4], [1.2, 0.31, 0.75, -0.6], [0.95, 0.31, -0.9, 2.2], [-0.9, 0.31, -0.75, 3.6], [-1.75, 0.31, -0.25, 1.1]];
  spots.forEach(([x, y, z, r], i) => { const b = makeBerry(); b.userData = { x, y, z, r, d: 0.12 * i }; scene.add(b); berries.push(b); });

  /* bubbles: instanced, they rise out of the open can */
  const NB = isM ? 70 : 140;
  const bub = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 12, 8), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.05, transmission: 0.9, thickness: 0.05, transparent: true, opacity: 0.75, clearcoat: 1 }), NB);
  bub.frustumCulled = false; scene.add(bub);
  const bm = new THREE.Matrix4(), bq = new THREE.Quaternion(), bs = new THREE.Vector3(), bp = new THREE.Vector3();

  /* story */
  const steps = [...root.querySelectorAll('.rs3d-steps li')];
  let lastStep = -1;
  const camA = new THREE.Vector3(isM ? 0 : 0.6, isM ? 2.3 : 1.9, isM ? 8.2 : 6.6), lookA = new THREE.Vector3(isM ? 0 : -0.55, 1.05, 0);
  const camB = new THREE.Vector3(1.4, isM ? 6.0 : 5.3, isM ? 6.2 : 4.8), lookB = new THREE.Vector3(0, H - 0.05, 0.05);
  const camC = new THREE.Vector3(isM ? 0.4 : 1.2, isM ? 3.1 : 2.6, isM ? 6.4 : 4.6), lookC = new THREE.Vector3(isM ? 0 : -0.4, 2.2, 0);
  const cp = new THREE.Vector3(), lk = new THREE.Vector3();
  function place(p) {
    const tumble = smooth(0.0, 0.3, p);
    berries.forEach((b, i) => { const u = b.userData; const t = smooth(u.d, u.d + 0.3, p * 1.1); b.position.set(u.x, u.y + (1 - t) * (3.5 + i * 0.4) + Math.abs(Math.sin(t * Math.PI * 2)) * 0.15 * (1 - t), u.z); b.rotation.set(1.35 + (1 - t) * 3, u.r + (1 - t) * 4, 0.3); });
    const pop = smooth(0.36, 0.5, p);
    tabPivot.rotation.x = -pop * 1.1; hole.scale.z = Math.max(0.001, smooth(0.42, 0.5, p)); hole.scale.x = hole.scale.z;
    can.rotation.y = -0.5 + tumble * 0.7 + smooth(0.6, 1, p) * 0.6;
    const fizz = smooth(0.46, 0.6, p);
    for (let i = 0; i < NB; i++) {
      const ph = hash(i * 3.1), sp = 0.5 + hash(i * 5.7);
      const life = ((p - 0.46) * 6 * sp + ph) % 1; const on = fizz > 0 && p > 0.46;
      const a = hash(i * 9.1) * Math.PI * 2, r = 0.02 + hash(i * 2.3) * 0.09 + life * 0.25;
      bp.set(Math.cos(a) * r, H + 0.02 + life * (2.4 + hash(i) * 1.2), 0.22 + Math.sin(a) * r);
      const sz = on ? (0.012 + hash(i * 4.4) * 0.03) * (1 - life * 0.3) * fizz : 0.00001;
      bs.set(sz, sz, sz); bm.compose(bp, bq, bs); bub.setMatrixAt(i, bm);
    }
    bub.instanceMatrix.needsUpdate = true;
    const wB = smooth(0.3, 0.45, p) - smooth(0.6, 0.78, p), wC = smooth(0.6, 0.8, p);
    cp.copy(camA).lerp(camB, wB).lerp(camC, wC * (1 - wB));
    lk.copy(lookA).lerp(lookB, wB).lerp(lookC, wC * (1 - wB));
    camera.position.copy(cp); camera.lookAt(lk);
    const si = p < 0.32 ? 0 : p < 0.56 ? 1 : 2;
    if (si !== lastStep) { steps.forEach((s, i) => s.classList.toggle('on', i === si)); lastStep = si; }
  }
  let ready = false;
  function render() {
    place(cur); renderer.render(scene, camera); ready = true;
    if (!root.classList.contains('rs3d-ready')) root.classList.add('rs3d-ready');
  }
  function progress() {
    if (reduced) return 0.62;
    const r = root.getBoundingClientRect(); const span = root.offsetHeight - innerHeight;
    return span > 0 ? clamp(-r.top / span) : 0;
  }
  let cur = progress(), target = cur, inView = false, raf = 0;
  function tick() {
    raf = 0; target = progress();
    cur += (target - cur) * 0.14; if (Math.abs(target - cur) < 0.0004) cur = target;
    render();
    if (inView && cur !== target) raf = requestAnimationFrame(tick);
  }
  const kick = () => { if (inView && !raf) raf = requestAnimationFrame(tick); };
  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); render();
  }
  new ResizeObserver(resize).observe(stage);
  new IntersectionObserver((es) => { inView = es[0].isIntersecting; if (inView) { cur = target = progress(); kick(); } }, { rootMargin: '200px 0px' }).observe(root);
  addEventListener('scroll', kick, { passive: true });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) kick(); });
  resize();
}

const root = document.querySelector('.rs3d');
if (root) init(root);
