/* Longway: 3D route. A procedural valley (three.js) with the road as a ribbon, five stops and a 4x4 that drives the
   route as you scroll; the camera flies with it. Own work (Zyqor Studio, MIT). Phone: same scene, lighter mesh, DPR 1.5.
   Reduced motion: one still overview frame. No WebGL: the poster image stays. */
import * as THREE from 'three';

const root = document.querySelector('.lw-route');
if (root) init(root);

function hasGL() { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } }

function init(root) {
  const isM = document.documentElement.dataset.build === 'm';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) root.classList.add('lw-still');
  if (!hasGL()) { root.classList.add('lw-nogl'); return; }
  const canvas = root.querySelector('canvas');
  const stage = root.querySelector('.lw-stage');
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' }); }
  catch (e) { root.classList.add('lw-nogl'); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, isM ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const SKY = new THREE.Color('#F4E6CC');
  const scene = new THREE.Scene();
  scene.background = SKY;
  scene.fog = new THREE.Fog(SKY, 170, 460);
  const camera = new THREE.PerspectiveCamera(isM ? 52 : 40, 1, 0.5, 900);

  /* light: warm key + cool-ish sky fill, one look for the whole scene */
  scene.add(new THREE.HemisphereLight(0xfff1d6, 0x7d6b4c, 1.35));
  const key = new THREE.DirectionalLight(0xffdfae, 2.6);
  key.position.set(-80, 95, 70);
  key.castShadow = true;
  key.shadow.mapSize.set(isM ? 1024 : 2048, isM ? 1024 : 2048);
  Object.assign(key.shadow.camera, { left: -130, right: 130, top: 130, bottom: -130, near: 10, far: 360 });
  key.shadow.bias = -0.0006; key.shadow.normalBias = 0.6;
  scene.add(key);

  /* noise */
  const hash = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
  const sm = (t) => t * t * (3 - 2 * t);
  function vnoise(x, y) { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi; const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1); const u = sm(xf), v = sm(yf); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; }
  function fbm(x, y) { let s = 0, a = 0.5, f = 1; for (let i = 0; i < 5; i++) { s += a * vnoise(x * f, y * f); f *= 2.03; a *= 0.5; } return s; }
  const smooth = (e0, e1, x) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };

  /* the road: one curve, five stops */
  const P = [[-78, 84], [-58, 62], [-40, 40], [-52, 16], [-34, -4], [-6, 2], [16, -16], [8, -42], [30, -60], [58, -66], [80, -88]];
  const curve = new THREE.CatmullRomCurve3(P.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, 'catmullrom', 0.5);
  const N = 420; const samples = curve.getSpacedPoints(N);
  const roadY = (t) => 3 + 5 * Math.sin(t * Math.PI * 2.2) * 0.5 + t * 4;
  samples.forEach((p, i) => { p.y = roadY(i / N); });

  /* terrain: mountains rise away from the road, the valley is carved by it */
  const SIZE = 360, SEG = isM ? 150 : 260;
  const geo = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG); geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position; const col = new Float32Array(pos.count * 3);
  const cGrass = new THREE.Color('#A3AE6A'), cGreen = new THREE.Color('#6E8452'), cRock = new THREE.Color('#A98D69'), cTop = new THREE.Color('#F4E8D2'), cSand = new THREE.Color('#E3CC9E');
  const tmp = new THREE.Color();
  const heightAt = [];
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    let best = 1e9, bi = 0;
    for (let k = 0; k <= N; k += 2) { const s = samples[k]; const dx = s.x - x, dz = s.z - z; const d = dx * dx + dz * dz; if (d < best) { best = d; bi = k; } }
    const dist = Math.sqrt(best); const ry = samples[bi].y;
    const m = 8 + fbm(x * 0.018 + 3.1, z * 0.018 - 1.7) * 46 + Math.pow(fbm(x * 0.05, z * 0.05), 2) * 14;
    const edge = Math.min(1, Math.max(Math.abs(x), Math.abs(z)) / 150);
    const h = ry - 0.35 + smooth(4.5, 30, dist) * (m * (0.55 + 0.6 * smooth(0.3, 1, edge))) + (fbm(x * 0.2, z * 0.2) - 0.5) * 0.8 * smooth(3, 8, dist);
    pos.setY(i, h);
    const rel = h - ry;
    if (rel < 1.2 && dist < 7) tmp.copy(cSand);
    else if (rel < 9) tmp.copy(cGrass).lerp(cGreen, smooth(2, 9, rel));
    else if (rel < 26) tmp.copy(cGreen).lerp(cRock, smooth(12, 26, rel));
    else tmp.copy(cRock).lerp(cTop, smooth(30, 40, rel));
    tmp.offsetHSL(0, 0, (hash(x, z) - 0.5) * 0.02);
    col.set([tmp.r, tmp.g, tmp.b], i * 3);
    heightAt.push(h);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.computeVertexNormals();
  const terrain = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.95, metalness: 0 }));
  terrain.receiveShadow = true; terrain.castShadow = !isM;
  scene.add(terrain);
  const hAt = (x, z) => { const gx = Math.round((x + SIZE / 2) / SIZE * SEG), gz = Math.round((z + SIZE / 2) / SIZE * SEG); const i = Math.min(SEG, Math.max(0, gz)) * (SEG + 1) + Math.min(SEG, Math.max(0, gx)); return heightAt[i]; };

  /* road ribbon + centre dashes */
  const up = new THREE.Vector3(0, 1, 0);
  function ribbon(width, lift, every, color, emissive) {
    const v = [], idx = []; let n = 0;
    for (let i = 0; i <= N; i++) {
      const p = samples[i], t = curve.getTangentAt(i / N), side = new THREE.Vector3().crossVectors(t, up).normalize();
      v.push(p.x + side.x * width, p.y + lift, p.z + side.z * width, p.x - side.x * width, p.y + lift, p.z - side.z * width);
      if (i > 0 && (!every || (i % every) < every / 2)) idx.push(n - 2, n - 1, n, n - 1, n + 1, n);
      n += 2;
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); g.setIndex(idx); g.computeVertexNormals();
    const mesh = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color, roughness: 0.75, emissive: emissive || 0x000000, side: THREE.DoubleSide }));
    mesh.receiveShadow = true; scene.add(mesh); return mesh;
  }
  ribbon(1.9, 0.22, 0, 0x4a5966);
  ribbon(0.13, 0.26, 6, 0xf2b42f, 0x3a2600);

  /* trees on the lower slopes */
  const treeN = isM ? 260 : 620;
  const treeGeo = new THREE.ConeGeometry(1, 3.2, 6); treeGeo.translate(0, 1.6, 0);
  const trees = new THREE.InstancedMesh(treeGeo, new THREE.MeshStandardMaterial({ color: 0x5b7347, flatShading: true, roughness: 0.9 }), treeN);
  const mtx = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), tp = new THREE.Vector3();
  let placed = 0, guard = 0;
  while (placed < treeN && guard++ < 20000) {
    const x = (hash(guard, 1.3) - 0.5) * 260, z = (hash(2.7, guard) - 0.5) * 260;
    let best = 1e9; for (let k = 0; k <= N; k += 6) { const s = samples[k]; const d = (s.x - x) ** 2 + (s.z - z) ** 2; if (d < best) best = d; }
    const d = Math.sqrt(best); if (d < 6 || d > 46) continue;
    const y = hAt(x, z); const ry = 3; if (y - ry > 20) continue;
    const s = 0.7 + hash(x, z) * 0.9; tp.set(x, y - 0.2, z); sc.set(s, s * (0.9 + hash(z, x) * 0.5), s);
    mtx.compose(tp, q, sc); trees.setMatrixAt(placed++, mtx);
  }
  trees.count = placed; trees.castShadow = true; trees.receiveShadow = true; scene.add(trees);

  /* clouds: big sky */
  const cloudMat = new THREE.MeshStandardMaterial({ color: 0xfffaf0, flatShading: true, roughness: 1, transparent: true, opacity: 0.92 });
  const clouds = new THREE.Group();
  for (let i = 0; i < (isM ? 7 : 12); i++) {
    const g = new THREE.Group(); const ang = i / (isM ? 7 : 12) * Math.PI * 2 + hash(i, 4), rad = 120 + hash(i, 9) * 50; const cx = Math.cos(ang) * rad, cz = Math.sin(ang) * rad, cy = 46 + hash(i, i) * 22;
    for (let j = 0; j < 4; j++) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(5 + hash(i, j) * 5, 1), cloudMat); b.position.set(j * 6 - 9, hash(j, i) * 3, hash(i + j, 3) * 4); b.scale.y = 0.55; b.castShadow = true; g.add(b); }
    g.position.set(cx, cy, cz); clouds.add(g);
  }
  scene.add(clouds);

  /* the 4x4 */
  const car = new THREE.Group();
  const yellow = new THREE.MeshStandardMaterial({ color: 0xf2b42f, roughness: 0.35, metalness: 0.1 });
  const ink = new THREE.MeshStandardMaterial({ color: 0x1f2a33, roughness: 0.6 });
  const sand = new THREE.MeshStandardMaterial({ color: 0xf2e2c4, roughness: 0.5 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.7, 3.4), yellow); body.position.y = 0.75;
  const cab = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.62, 1.9), sand); cab.position.set(0, 1.38, -0.25);
  const tent = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.32, 1.7), ink); tent.position.set(0, 1.86, -0.25);
  car.add(body, cab, tent);
  const wg = new THREE.CylinderGeometry(0.42, 0.42, 0.34, 14); wg.rotateZ(Math.PI / 2);
  for (const [x, z] of [[-0.86, 1.1], [0.86, 1.1], [-0.86, -1.1], [0.86, -1.1]]) { const w = new THREE.Mesh(wg, ink); w.position.set(x, 0.42, z); car.add(w); }
  car.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  car.scale.setScalar(1.15);
  scene.add(car);

  /* stops */
  const stops = [...root.querySelectorAll('[data-stop]')].map((el) => ({ el, t: +el.dataset.stop }));
  const labels = [...root.querySelectorAll('.lw-lab')];
  const pinMat = new THREE.MeshStandardMaterial({ color: 0x1f2a33, roughness: 0.5 });
  const headMat = new THREE.MeshStandardMaterial({ color: 0xf2b42f, roughness: 0.3, emissive: 0x2a1a00 });
  const pins = stops.map((s) => {
    const p = curve.getPointAt(s.t); p.y = roadY(s.t);
    const side = new THREE.Vector3().crossVectors(curve.getTangentAt(s.t), up).normalize();
    p.addScaledVector(side, 3.4);
    const g = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 6, 8), pinMat); pole.position.y = 3;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.75, 18, 12), headMat); head.position.y = 6.4;
    g.add(pole, head); g.position.set(p.x, hAt(p.x, p.z) - 0.2, p.z); g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    scene.add(g); return g;
  });

  /* camera path */
  const over0 = { pos: new THREE.Vector3(isM ? -10 : -40, isM ? 200 : 135, isM ? 150 : 135), look: new THREE.Vector3(isM ? 0 : -28, 0, isM ? 10 : -6) };
  const over1 = { pos: new THREE.Vector3(isM ? 120 : 140, isM ? 175 : 115, isM ? 40 : 20), look: new THREE.Vector3(isM ? 5 : -12, 0, isM ? -15 : -20) };
  const v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), look = new THREE.Vector3(), camPos = new THREE.Vector3();
  const odo = root.querySelector('.lw-odo b');
  const KM = 812;
  let cur = reduced ? 0.5 : 0, target = cur, inView = false, raf = 0, lastKm = -1, lastStop = -1;

  function place(p) {
    const tCar = reduced ? 0.5 : Math.min(1, Math.max(0, (p - 0.1) / 0.78));
    const c = curve.getPointAt(Math.min(0.999, tCar)); c.y = roadY(tCar) + 0.22;
    const fwd = curve.getTangentAt(Math.min(0.999, tCar)).setY(0).normalize();
    car.position.copy(c); car.lookAt(c.x + fwd.x, c.y, c.z + fwd.z);
    const side = new THREE.Vector3().crossVectors(fwd, up).normalize();
    const chasePos = v1.copy(c).addScaledVector(fwd, isM ? -30 : -27).addScaledVector(up, isM ? 17 : 13).addScaledVector(side, 6);
    const chaseLook = v2.copy(c).addScaledVector(fwd, 16).addScaledVector(up, 1);
    const w1 = reduced ? 0 : smooth(0.02, 0.16, p), w2 = reduced ? 0 : smooth(0.86, 0.99, p);
    camPos.copy(over0.pos).lerp(chasePos, w1).lerp(over1.pos, w2);
    look.copy(over0.look).lerp(chaseLook, w1).lerp(over1.look, w2);
    camera.position.copy(camPos); camera.lookAt(look);
    clouds.rotation.y = p * 0.25;
    const km = Math.round(tCar * KM);
    if (odo && km !== lastKm) { odo.textContent = String(km); lastKm = km; }
    let si = 0; stops.forEach((s, i) => { if (tCar >= s.t - 0.02) si = i; });
    if (si !== lastStop) { stops.forEach((s, i) => s.el.classList.toggle('on', i === si)); lastStop = si; }
  }

  const pv = new THREE.Vector3();
  function render() {
    place(cur);
    renderer.render(scene, camera);
    const w = canvas.clientWidth, h = canvas.clientHeight;
    pins.forEach((g, i) => {
      const lab = labels[i]; if (!lab) return;
      pv.copy(g.position); pv.y += 7.6; pv.project(camera);
      const vis = pv.z < 1 && Math.abs(pv.x) < 1.1 && Math.abs(pv.y) < 1.1 && camera.position.distanceTo(g.position) < 300;
      lab.style.transform = `translate(${((pv.x + 1) / 2 * w).toFixed(1)}px, ${((1 - pv.y) / 2 * h).toFixed(1)}px) translate(-50%, -100%)`;
      lab.style.opacity = vis ? '1' : '0';
    });
    if (!root.classList.contains('lw-ready')) root.classList.add('lw-ready');
  }

  function progress() {
    if (reduced) return 0.5;
    const r = root.getBoundingClientRect(); const span = root.offsetHeight - innerHeight;
    return span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
  }
  function tick() {
    raf = 0;
    target = progress();
    cur += (target - cur) * 0.14;
    if (Math.abs(target - cur) < 0.0004) cur = target;
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
  cur = target = progress();
  resize();
}
