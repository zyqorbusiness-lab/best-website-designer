/* PLINTH R3 - "The sun crosses": a real-time three.js plate. A plaster arcade on a plinth (own modelling, Zyqor Studio),
   one sun swept from morning to dusk by scroll, so the arch shadows draw across the back wall and floor. Same scene on phone
   (DPR cap 1.5, 1024 shadow map). Reduced motion = one still afternoon frame. No WebGL = the arcade photograph. */
import * as THREE from '../../vendor/three/three.module.min.js';
const sec = document.getElementById('sun');
if (sec) init();
function init() {
  const isM = document.documentElement.dataset.build === 'm' || matchMedia('(max-width: 860px)').matches;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = sec.querySelector('.sun-gl'), still = sec.querySelector('.sun-still'), clockEl = sec.querySelector('.sun-time');
  let renderer;
  try {
    const t = document.createElement('canvas');
    if (!(t.getContext('webgl2') || t.getContext('webgl'))) throw new Error('no webgl');
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  } catch (e) { canvas.hidden = true; if (still) still.hidden = false; sec.classList.add('sun-nogl'); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, isM ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const PAPER = new THREE.Color('#EDE8DE');
  renderer.setClearColor(PAPER, 1);
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(PAPER, 26, 60);
  const cam = new THREE.PerspectiveCamera(isM ? 34 : 28, 1, 0.1, 100);

  const plaster = new THREE.MeshStandardMaterial({ color: '#F3EFE7', roughness: 0.92, metalness: 0 });
  const stone = new THREE.MeshStandardMaterial({ color: '#E4DCCD', roughness: 0.96 });
  const accent = new THREE.MeshStandardMaterial({ color: '#DA4A2A', roughness: 0.7 });
  const shadowy = (m) => { m.castShadow = true; m.receiveShadow = true; return m; };

  // ground
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), new THREE.MeshStandardMaterial({ color: '#E6E0D4', roughness: 1 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  // plinth (bevelled block)
  const rr = (w, d, h, b) => { const s = new THREE.Shape(); const x = w / 2 - b, z = d / 2 - b;
    s.moveTo(-x, -z - b); s.lineTo(x, -z - b); s.quadraticCurveTo(x + b, -z - b, x + b, -z); s.lineTo(x + b, z); s.quadraticCurveTo(x + b, z + b, x, z + b);
    s.lineTo(-x, z + b); s.quadraticCurveTo(-x - b, z + b, -x - b, z); s.lineTo(-x - b, -z); s.quadraticCurveTo(-x - b, -z - b, -x, -z - b);
    const g = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2, curveSegments: 6 });
    g.rotateX(-Math.PI / 2); return g; };
  const plinth = shadowy(new THREE.Mesh(rr(9.2, 5.2, 0.7, 0.12), stone)); scene.add(plinth);
  const TOP = 0.76;
  // arcade wall: rectangle with N round-headed openings
  function arcade(n, w, h, depth, ow, oh) {
    const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, h); s.lineTo(-w / 2, h); s.lineTo(-w / 2, 0);
    const pitch = w / n;
    for (let i = 0; i < n; i++) {
      const cx = -w / 2 + pitch * (i + 0.5), r = ow / 2, hole = new THREE.Path();
      hole.moveTo(cx - r, 0.0001 + 0.02); hole.lineTo(cx + r, 0.02); hole.lineTo(cx + r, oh - r); hole.absarc(cx, oh - r, r, 0, Math.PI, false); hole.lineTo(cx - r, 0.02);
      s.holes.push(hole);
    }
    const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015, bevelSegments: 1, curveSegments: 28 });
    g.translate(0, 0, -depth / 2); return g;
  }
  const front = shadowy(new THREE.Mesh(arcade(5, 7.6, 3.1, 0.42, 0.95, 2.35), plaster)); front.position.set(0, TOP, 1.15); scene.add(front);
  const back = shadowy(new THREE.Mesh(new THREE.BoxGeometry(7.6, 3.1, 0.3), plaster)); back.position.set(0, TOP + 1.55, -1.55); scene.add(back);
  const side = shadowy(new THREE.Mesh(arcade(2, 2.7, 3.1, 0.42, 0.85, 2.3), plaster)); side.rotation.y = Math.PI / 2; side.position.set(-3.6, TOP, -0.2); scene.add(side);
  const roof = shadowy(new THREE.Mesh(new THREE.BoxGeometry(7.9, 0.16, 3.3), plaster)); roof.position.set(0, TOP + 3.18, -0.2); scene.add(roof);
  // a single red figure for scale (the issue's accent)
  const fig = shadowy(new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.62, 4, 12), accent)); fig.position.set(1.9, TOP + 0.42, 0.2); scene.add(fig);

  // light: one sun + sky fill
  const hemi = new THREE.HemisphereLight('#F6F1E8', '#C9BDA8', 0.55); scene.add(hemi);
  const sun = new THREE.DirectionalLight('#FFE2BE', 3.2); sun.castShadow = true;
  const sm = isM ? 1024 : 2048; sun.shadow.mapSize.set(sm, sm);
  Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 50 });
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; sun.shadow.radius = 3;
  scene.add(sun); scene.add(sun.target); sun.target.position.set(0, TOP + 1, 0);
  const warm = new THREE.Color('#FFB27A'), noon = new THREE.Color('#FFF4E6'), tmp = new THREE.Color();

  let p = reduced ? 0.62 : 0, pT = p, W = 0, H = 0, vis = true, dirty = true;
  function resize() {
    const r = canvas.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height);
    renderer.setSize(W, H, false); cam.aspect = W / H; cam.updateProjectionMatrix(); dirty = true;
  }
  function read() {
    if (reduced) return;
    const r = sec.getBoundingClientRect(), span = Math.max(1, r.height - innerHeight);
    pT = Math.min(1, Math.max(0, -r.top / span));
    vis = r.bottom > 0 && r.top < innerHeight;
  }
  function place(t) {
    // sun: azimuth sweeps east -> west, elevation low -> high -> low
    const az = THREE.MathUtils.lerp(-1.25, 1.25, t), el = 0.16 + Math.sin(t * Math.PI) * 0.72;
    const R = 22; sun.position.set(Math.sin(az) * Math.cos(el) * R, Math.sin(el) * R + TOP, Math.cos(az) * Math.cos(el) * R * 0.9 + 4);
    const k = Math.sin(t * Math.PI); tmp.copy(warm).lerp(noon, Math.pow(k, 0.7)); sun.color.copy(tmp);
    sun.intensity = 2.3 + k * 1.5; hemi.intensity = 0.6 + k * 0.25;
    // camera: slow orbit + dolly toward the arches; portrait screens get a closer 3/4 view, model framed under the copy
    const portrait = W / H < 0.9;
    const ca = portrait ? THREE.MathUtils.lerp(-0.85, 0.55, t) : THREE.MathUtils.lerp(-0.42, 0.34, t);
    const cd = portrait ? 25 - t * 2.5 : (isM ? 17 : 15.5) - t * 2.2;
    const ch = portrait ? THREE.MathUtils.lerp(6.4, 4.6, t) : THREE.MathUtils.lerp(4.6, 3.2, t);
    cam.position.set(Math.sin(ca) * cd, ch + TOP, Math.cos(ca) * cd);
    cam.lookAt(0, TOP + 1.3, 0);
    if (portrait) cam.setViewOffset(W, H, 0, -H * 0.13, W, H); else cam.setViewOffset(W, H, -W * 0.22, -H * 0.05, W, H);
    if (clockEl) { const mins = Math.round(7 * 60 + 40 + t * (10 * 60 + 40)); clockEl.textContent = String(Math.floor(mins / 60)).padStart(2, '0') + ':' + String(mins % 60).padStart(2, '0'); }
  }
  addEventListener('resize', resize); addEventListener('scroll', read, { passive: true });
  resize(); read();
  let last = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!vis && !dirty) return;
    const np = reduced ? pT : p + (pT - p) * (1 - Math.exp(-6 * dt));
    if (Math.abs(np - p) < 1e-5 && !dirty) return;
    p = np; place(p); renderer.render(scene, cam); dirty = false;
  }
  requestAnimationFrame(frame);
}
