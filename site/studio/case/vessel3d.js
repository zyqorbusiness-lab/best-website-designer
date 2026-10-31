/* Kilnfold hero: three stoneware pieces turned in code (three.js LatheGeometry), glazes from the case palette.
   Slow wheel spin, drag to turn, scroll tilts the camera. Own work (Zyqor Studio, MIT).
   Phone: same pieces, fewer lathe segments, DPR 1.5. Reduced motion: one still frame. No WebGL: poster image. */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const fig = document.querySelector('.hero-3d');
if (fig) init(fig);

function hasGL() { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } }

function init(fig) {
  const coarse = matchMedia('(pointer: coarse)').matches || innerWidth < 760;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!hasGL()) { fig.classList.add('h3-nogl'); return; }
  const canvas = fig.querySelector('canvas'), box = fig.querySelector('.h3-stage');
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); }
  catch (e) { fig.classList.add('h3-nogl'); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, coarse ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture; pmrem.dispose();
  scene.environmentIntensity = 0.55;
  const camera = new THREE.PerspectiveCamera(coarse ? 34 : 28, 1, 0.1, 100);

  const key = new THREE.DirectionalLight(0xfff0dc, 2.4); key.position.set(4, 7, 5); key.castShadow = true;
  key.shadow.mapSize.set(coarse ? 1024 : 2048, coarse ? 1024 : 2048); key.shadow.radius = 8; key.shadow.bias = -0.0004;
  Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 1, far: 30 });
  const rim = new THREE.DirectionalLight(0xe4ecff, 1.1); rim.position.set(-5, 3, -4);
  scene.add(key, rim, new THREE.HemisphereLight(0xfff6ea, 0xb89c80, 0.5));

  const SEG = coarse ? 72 : 140;
  const hash = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
  /* profile: outer wall up to the rim, a rounded lip, inner wall back down (thick stoneware) */
  function vessel(outer, wall, glaze, clay, dipAt, speck) {
    const pts = [];
    outer.forEach(([r, y]) => pts.push(new THREE.Vector2(r, y)));
    const [rr, ry] = outer[outer.length - 1];
    pts.push(new THREE.Vector2(rr - wall * 0.5, ry + wall * 0.35));
    for (let i = outer.length - 1; i >= 1; i--) { const [r, y] = outer[i]; pts.push(new THREE.Vector2(Math.max(0.001, r - wall), Math.max(outer[0][1] + wall, y))); }
    pts.push(new THREE.Vector2(0.001, outer[0][1] + wall));
    const g = new THREE.LatheGeometry(pts, SEG);
    const p = g.attributes.position, col = new Float32Array(p.count * 3), c = new THREE.Color(), gc = new THREE.Color(glaze), cc = new THREE.Color(clay);
    const top = ry;
    const nP = pts.length;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i), a = Math.atan2(z, x);
      const inner = (i % nP) >= outer.length;
      const drip = dipAt + 0.04 * Math.sin(a * 3 + 0.7) + 0.09 * Math.pow(Math.max(0, Math.sin(a * 5 + 1.1)), 6) + 0.05 * Math.pow(Math.max(0, Math.sin(a * 9 + 2.3)), 8);
      const glazed = inner || y > (1 - drip) * 0 + drip * top;
      c.copy(glazed ? gc : cc);
      if (glazed && !inner) c.lerp(gc.clone().offsetHSL(0, 0.04, -0.08), Math.max(0, 1 - (y - drip * top) / (0.25 * top)) * 0.6);
      if (speck && hash(i, 11) > 0.985) c.offsetHSL(0, 0, -0.14);
      col.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.computeVertexNormals();
    const m = new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.32, metalness: 0, clearcoat: 0.7, clearcoatRoughness: 0.18, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(g, m); mesh.castShadow = true; mesh.receiveShadow = true; return mesh;
  }
  const vase = vessel([[0.001, 0], [0.42, 0], [0.5, 0.06], [0.62, 0.45], [0.66, 0.9], [0.56, 1.35], [0.36, 1.7], [0.3, 1.95], [0.36, 2.12]], 0.07, '#8FA896', '#D8BC9C', 0.22, true);
  const bowl = vessel([[0.001, 0], [0.45, 0], [0.52, 0.05], [0.85, 0.3], [1.08, 0.62], [1.18, 0.86]], 0.08, '#A9491F', '#DDBFA0', 0.3, false);
  const cup = vessel([[0.001, 0], [0.34, 0], [0.4, 0.05], [0.47, 0.4], [0.5, 0.8], [0.52, 1.05]], 0.06, '#E9DFCC', '#C9A27E', 0.18, true);
  vase.position.set(-1.65, 0, -0.35); bowl.position.set(0.35, 0, 0.3); cup.position.set(2.15, 0, -0.2);
  const group = new THREE.Group(); group.add(vase, bowl, cup); scene.add(group);

  /* wheel head + contact shadow */
  const wheel = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.7, 0.16, coarse ? 64 : 128), new THREE.MeshPhysicalMaterial({ color: 0xD3BFA6, roughness: 0.7, clearcoat: 0.1 }));
  wheel.position.y = -0.08; wheel.receiveShadow = true; group.add(wheel);
  const sh = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.ShadowMaterial({ opacity: 0.18 })); sh.rotation.x = -Math.PI / 2; sh.position.y = -0.17; sh.receiveShadow = true; scene.add(sh);

  let spin = 0.35, vel = 0, drag = false, lx = 0, sp = 0, inView = false, raf = 0, last = performance.now();
  function frame(now) {
    raf = 0; const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!drag) { vel *= 0.94; spin += (reduced ? 0 : 0.22) * dt + vel; }
    const r = fig.getBoundingClientRect(); sp = Math.min(1, Math.max(0, 1 - (r.top + r.height) / (innerHeight + r.height)));
    group.rotation.y = spin;
    const el = 0.42 - sp * 0.22, d = coarse ? 10.8 : 9.2;
    camera.position.set(Math.sin(0.35) * d * Math.cos(el), 0.9 + Math.sin(el) * d, Math.cos(0.35) * d * Math.cos(el));
    camera.lookAt(0, 0.85, 0);
    renderer.render(scene, camera);
    if (!fig.classList.contains('h3-ready')) fig.classList.add('h3-ready');
    if (inView && !reduced) raf = requestAnimationFrame(frame);
  }
  const kick = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } };
  function resize() { const w = box.clientWidth, h = box.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); kick(); }
  new ResizeObserver(resize).observe(box);
  new IntersectionObserver((es) => { inView = es[0].isIntersecting; if (inView) kick(); }, { rootMargin: '100px 0px' }).observe(fig);
  if (reduced) addEventListener('scroll', kick, { passive: true });
  canvas.addEventListener('pointerdown', (e) => { drag = true; lx = e.clientX; vel = 0; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', (e) => { if (!drag) return; const dx = (e.clientX - lx) / box.clientWidth * 4; spin += dx; vel = dx * 0.4; lx = e.clientX; kick(); });
  const up = () => { drag = false; };
  canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
  resize();
}
