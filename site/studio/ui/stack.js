/* STUDIO UI R3 - "One stack": a real-time three.js stack of six UI cards (drawn live from this page's own components:
   pill button, spring toggle, range with bubble, segmented control, one-time code, toast). Scroll fans the pile out into an
   exploded isometric spread and turns it; the pointer tilts it. Own work (Zyqor Studio). Phone: same scene, DPR cap 1.5.
   Reduced motion = one still, half-fanned frame. No WebGL = the cards fall back to a CSS-drawn flat row. */
import * as THREE from '../../vendor/three/three.module.min.js';
const sec = document.getElementById('stack');
if (sec) init();
async function init() {
  const isM = document.documentElement.dataset.build === 'm' || matchMedia('(max-width: 860px)').matches;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = sec.querySelector('.stack-gl');
  let renderer;
  try {
    const t = document.createElement('canvas');
    if (!(t.getContext('webgl2') || t.getContext('webgl'))) throw new Error('no webgl');
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { canvas.hidden = true; sec.classList.add('stack-nogl'); return; }
  try { await document.fonts.ready; } catch (e) {}
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, isM ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  scene.add(new THREE.HemisphereLight('#FBF7F0', '#D9CFBF', 1.15));
  const key = new THREE.DirectionalLight('#FFF3E4', 2.2); key.position.set(-4, 9, 6); key.castShadow = true;
  key.shadow.mapSize.set(isM ? 1024 : 2048, isM ? 1024 : 2048); Object.assign(key.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 1, far: 30 });
  key.shadow.radius = 6; key.shadow.bias = -0.0005; scene.add(key);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ color: '#3A3022', opacity: 0.16 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -0.02; floor.receiveShadow = true; scene.add(floor);

  const INK = '#17403A', ACC = '#C8603A', PAPER = '#F6F1E8', LINE = 'rgba(23,64,58,.14)';
  const W = 1024, H = 640, R = 56;
  function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  function face(n, title, draw) {
    const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
    g.fillStyle = PAPER; g.fillRect(0, 0, W, H);
    g.fillStyle = ACC; g.font = 'italic 44px "Instrument Serif", Georgia, serif'; g.fillText(n, 60, 104);
    g.fillStyle = INK; g.font = '600 44px Manrope, sans-serif'; g.fillText(title, 118, 104);
    g.strokeStyle = LINE; g.lineWidth = 3; g.beginPath(); g.moveTo(60, 150); g.lineTo(W - 60, 150); g.stroke();
    draw(g);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
  }
  const faces = [
    face('01', 'Magnetic pill', (g) => { rr(g, 262, 300, 500, 150, 75); g.fillStyle = INK; g.fill(); g.fillStyle = PAPER; g.font = '600 54px Manrope'; g.fillText('Book a call', 352, 395); }),
    face('04', 'Spring toggle', (g) => { rr(g, 362, 300, 300, 160, 80); g.fillStyle = ACC; g.fill(); g.beginPath(); g.arc(582, 380, 62, 0, 7); g.fillStyle = PAPER; g.fill(); g.fillStyle = INK; g.font = '500 40px Manrope'; g.fillText('Notifications on', 360, 540); }),
    face('06', 'Range with bubble', (g) => { g.fillStyle = 'rgba(23,64,58,.18)'; rr(g, 140, 410, 744, 18, 9); g.fill(); g.fillStyle = INK; rr(g, 140, 410, 470, 18, 9); g.fill(); g.beginPath(); g.arc(610, 419, 36, 0, 7); g.fillStyle = PAPER; g.fill(); g.lineWidth = 8; g.strokeStyle = INK; g.stroke(); rr(g, 540, 250, 140, 90, 22); g.fillStyle = ACC; g.fill(); g.fillStyle = PAPER; g.font = '700 48px Manrope'; g.fillText('64', 580, 312); }),
    face('03', 'Segmented control', (g) => { rr(g, 120, 320, 784, 130, 65); g.fillStyle = 'rgba(23,64,58,.08)'; g.fill(); rr(g, 132, 332, 250, 106, 53); g.fillStyle = INK; g.fill(); g.font = '600 42px Manrope'; g.fillStyle = PAPER; g.fillText('Day', 212, 400); g.fillStyle = INK; g.fillText('Week', 452, 400); g.fillText('Month', 690, 400); }),
    face('08', 'One-time code', (g) => { const d = '4 8 1 _ _ _'.split(' '); d.forEach((ch, i) => { rr(g, 132 + i * 128, 290, 110, 150, 24); g.fillStyle = i === 3 ? 'rgba(200,96,58,.14)' : 'rgba(23,64,58,.07)'; g.fill(); g.lineWidth = 4; g.strokeStyle = i === 3 ? ACC : 'rgba(23,64,58,.2)'; g.stroke(); if (ch !== '_') { g.fillStyle = INK; g.font = '600 70px Manrope'; g.fillText(ch, 166 + i * 128, 392); } }); }),
    face('11', 'Toast stack', (g) => { for (let i = 2; i >= 0; i--) { rr(g, 170 + i * 20, 260 + i * 40, 684 - i * 40, 130, 30); g.fillStyle = i ? 'rgba(23,64,58,' + (0.18 - i * 0.05) + ')' : INK; g.fill(); } g.fillStyle = PAPER; g.font = '600 42px Manrope'; g.fillText('Saved to your library', 230, 338); g.fillStyle = ACC; g.fillText('Undo', 700, 338); }),
  ];
  // rounded card body
  const CW = 4, CH = 2.5, CR = 0.22, T = 0.08;
  const s = new THREE.Shape(); const x = CW / 2, y = CH / 2;
  s.moveTo(-x + CR, -y); s.lineTo(x - CR, -y); s.quadraticCurveTo(x, -y, x, -y + CR); s.lineTo(x, y - CR); s.quadraticCurveTo(x, y, x - CR, y); s.lineTo(-x + CR, y); s.quadraticCurveTo(-x, y, -x, y - CR); s.lineTo(-x, -y + CR); s.quadraticCurveTo(-x, -y, -x + CR, -y);
  const body = new THREE.ExtrudeGeometry(s, { depth: T, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 3, curveSegments: 10 });
  body.translate(0, 0, -T / 2);
  const faceG = new THREE.ShapeGeometry(s, 10); const uv = faceG.attributes.uv, pos = faceG.attributes.position;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (pos.getX(i) + x) / CW, (pos.getY(i) + y) / CH);
  const edge = new THREE.MeshStandardMaterial({ color: '#EDE6DA', roughness: 0.6 });
  const cards = faces.map((tex, i) => {
    const g = new THREE.Group();
    const b = new THREE.Mesh(body, edge); b.castShadow = true; b.receiveShadow = true; g.add(b);
    const f = new THREE.Mesh(faceG, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.55 })); f.position.z = T / 2 + 0.021; f.receiveShadow = true; g.add(f);
    g.rotation.x = -Math.PI / 2; scene.add(g); return g;
  });
  // layouts: pile (stacked flat), spread (exploded isometric grid)
  const n = cards.length;
  const pile = (i) => ({ x: (i % 2 ? 0.08 : -0.06), y: 0.06 + i * 0.14, z: (i % 3 - 1) * 0.06, rz: (i % 2 ? 0.05 : -0.04) });
  const spread = (i) => { const col = i % 3, row = Math.floor(i / 3); return isM ? { x: (i % 2 - 0.5) * 4.5, y: 0.06 + i * 0.35, z: (Math.floor(i / 2) - 1) * 3.0, rz: 0 } : { x: (col - 1) * 4.6, y: 0.06 + i * 0.32, z: (row - 0.5) * 3.1, rz: 0 }; };
  let p = reduced ? 0.55 : 0, pT = p, vis = true, dirty = true, px = 0, py = 0, Wc = 1, Hc = 1;
  function resize() { const r = canvas.getBoundingClientRect(); Wc = Math.max(1, r.width); Hc = Math.max(1, r.height); renderer.setSize(Wc, Hc, false); cam.aspect = Wc / Hc; cam.updateProjectionMatrix(); dirty = true; }
  function read() { if (reduced) return; const r = sec.getBoundingClientRect(); pT = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight))); vis = r.bottom > 0 && r.top < innerHeight; }
  if (!reduced && matchMedia('(hover: hover)').matches) addEventListener('pointermove', (e) => { px = e.clientX / innerWidth - 0.5; py = e.clientY / innerHeight - 0.5; dirty = true; });
  const ease = (t) => t * t * (3 - 2 * t);
  function place(t, time) {
    const f = ease(Math.min(1, Math.max(0, (t - 0.08) / 0.62)));
    cards.forEach((c, i) => {
      const a = pile(i), b = spread(i), lag = ease(Math.min(1, Math.max(0, f * 1.25 - i * 0.05)));
      c.position.set(a.x + (b.x - a.x) * lag, a.y + (b.y - a.y) * lag + Math.sin(lag * Math.PI) * 0.9, a.z + (b.z - a.z) * lag);
      c.rotation.set(-Math.PI / 2 + Math.sin(lag * Math.PI) * 0.18, 0, a.rz + (b.rz - a.rz) * lag + Math.sin(lag * Math.PI) * (i % 2 ? 0.25 : -0.25));
    });
    const turn = (t - 0.5) * 0.9 + px * 0.25;
    const portrait = Wc / Hc < 0.9, d = portrait ? 19 + f * 7 : 11 + f * 6.5;
    const el = THREE.MathUtils.lerp(0.95, 0.78, f) - py * 0.08;
    cam.position.set(Math.sin(turn) * Math.cos(el) * d, Math.sin(el) * d, Math.cos(turn) * Math.cos(el) * d);
    cam.lookAt(0, 0.4, 0);
    if (!portrait) cam.setViewOffset(Wc, Hc, -Wc * 0.24, -Hc * 0.03, Wc, Hc); else cam.setViewOffset(Wc, Hc, 0, -Hc * 0.1, Wc, Hc);
  }
  addEventListener('resize', resize); addEventListener('scroll', read, { passive: true }); resize(); read();
  let last = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!vis && !dirty) return;
    const np = reduced ? pT : p + (pT - p) * (1 - Math.exp(-6 * dt));
    if (Math.abs(np - p) < 1e-5 && !dirty) return;
    p = np; place(p, now / 1000); renderer.render(scene, cam); dirty = false;
  }
  requestAnimationFrame(frame);
}
