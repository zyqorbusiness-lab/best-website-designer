/* Zyqor Studio portfolio v3 - "Worlds": five design concepts in one pinned scroll.
   01 Colourway morph (page follows the product) - 02 Giant type behind the product -
   03 Callouts that track a spinning product - 04 Orbit carousel - 05 Organic mask reveal into the Lab.
   One three.js canvas between a back layer (colours, giant words) and a front layer (UI, labels).
   Desktop (heavy) and phone (light) builds share this module; window.__WORLDS_M switches the profile. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const M = !!window.__WORLDS_M;
const root = document.getElementById('worlds');
if (root) init();

function init() {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const BASE = root.dataset.base || '';
  const canvas = root.querySelector('.wd-gl');
  const pin = root.querySelector('.wd-pin');
  const back = root.querySelector('.wd-back');
  const ch = [...root.querySelectorAll('[data-ch]')], chb = [...root.querySelectorAll('[data-chb]')];
  const rail = [...root.querySelectorAll('.wd-rail button')];
  const hudN = root.querySelector('.wd-hud b'), hudL = root.querySelector('.wd-hud span'), hudBar = root.querySelector('.wd-hud i');
  const dots = [...root.querySelectorAll('.wd-dots button')];
  const sw = [...root.querySelectorAll('.wd-sw button')];
  const card = root.querySelector('.wd-card');
  const maskWrap = root.querySelector('.wd-mask');
  const orbitName = root.querySelector('.wd-orbit-name'), orbitIdx = root.querySelector('.wd-orbit-idx');
  const calls = [...root.querySelectorAll('.wd-call')];
  const lines = [...root.querySelectorAll('.wd-lines line')];
  const NAMES = ['Colourway morph', 'Giant type', 'Callouts', 'Orbit', 'Mask reveal'];

  /* palettes for world 01 (page follows the shoe) */
  const CW = [
    { name: 'Cobalt', page: '#E1EAEF', card: '#CFE2EC', ink: '#0E3550', acc: '#1E7FB8', word: '#B2D1E2', accInk: '#F3EDE1' },
    { name: 'Blush', page: '#F2E8E3', card: '#F1DCD6', ink: '#5A2A2A', acc: '#D9645A', word: '#E6C3BB', accInk: '#FFF7F2' },
    { name: 'Night run', page: '#D8DBDC', card: '#25313A', ink: '#F3EDE1', acc: '#F0645A', word: '#33434E', accInk: '#1B1F22' },
  ];
  const BG = ['#E4E2DD', '#EFE8D8', '#DCE5DF', '#17423C', '#17423C'];

  /* ---------- three ---------- */
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { root.classList.add('wd-nogl'); return; }
  /* round 2: phone renders exactly like desktop (same DPR cap, AA, HDRI, models, textures) */
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose();
  /* real studio HDRI (Poly Haven, CC0) on BOTH builds after first paint; 1k map for crisp reflections on the gloss parts */
  import('../assets/hdri/hdri.js').then((m) => m.useHDRI(renderer, scene, { size: 1024, intensity: 1.0 })).catch(() => {});
  const key = new THREE.DirectionalLight(0xfff6ea, 1.05); key.position.set(2.5, 4, 3); scene.add(key);
  const rim = new THREE.DirectionalLight(0xdfe9ff, 0.9); rim.position.set(-3, 2.2, -3.5); scene.add(rim);
  scene.add(new THREE.HemisphereLight(0xfff4e6, 0x30403c, 0.3));
  const maxAniso = renderer.capabilities.getMaxAnisotropy ? renderer.capabilities.getMaxAnisotropy() : 1;
  const cam = new THREE.PerspectiveCamera(30, 1, 0.05, 60); cam.position.set(0, 0, 6);
  let VW = 5, VH = 3.2;
  function resize() {
    const w = pin.clientWidth, h = pin.clientHeight;
    renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
    VH = 2 * cam.position.z * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)); VW = VH * cam.aspect;
  }
  resize(); addEventListener('resize', resize);

  /* contact shadow: tight dark core where the product touches + wide soft penumbra (256px, two radial layers) */
  const sc = document.createElement('canvas'); sc.width = sc.height = 256;
  const g2 = sc.getContext('2d');
  let gr = g2.createRadialGradient(128, 128, 4, 128, 128, 126);
  gr.addColorStop(0, 'rgba(12,24,22,.42)'); gr.addColorStop(.5, 'rgba(12,24,22,.16)'); gr.addColorStop(1, 'rgba(12,24,22,0)');
  g2.fillStyle = gr; g2.fillRect(0, 0, 256, 256);
  gr = g2.createRadialGradient(128, 128, 2, 128, 128, 58);
  gr.addColorStop(0, 'rgba(8,16,14,.55)'); gr.addColorStop(.6, 'rgba(8,16,14,.2)'); gr.addColorStop(1, 'rgba(8,16,14,0)');
  g2.fillStyle = gr; g2.fillRect(0, 0, 256, 256);
  const shTex = new THREE.CanvasTexture(sc); shTex.colorSpace = THREE.SRGBColorSpace;
  function shadow(w, d) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: shTex, transparent: true, depthWrite: false, toneMapped: false }));
    m.rotation.x = -Math.PI / 2; m.scale.set(w, d, 1); m.renderOrder = -1; return m;
  }

  const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
  /* round 2: one asset set for both builds: full-res Khronos sources, 2048px webp q92 textures, meshopt (12-bit normals) */
  const SUF = '-hd.glb';
  const P = {}; // product groups
  function fit(obj, size) {
    const b = new THREE.Box3().setFromObject(obj), s = b.getSize(new THREE.Vector3());
    const k = size / Math.max(s.x, s.y, s.z); obj.scale.multiplyScalar(k);
    const b2 = new THREE.Box3().setFromObject(obj), c = b2.getCenter(new THREE.Vector3()); obj.position.sub(c);
    return b2.getSize(new THREE.Vector3());
  }
  function holder(obj, size, rot) {
    const base = new THREE.Group(); base.add(obj); if (rot) base.rotation.set(rot[0], rot[1], rot[2]);
    const inner = new THREE.Group(); inner.add(base);
    const sz = fit(inner, size);
    const pivot = new THREE.Group(); pivot.add(inner);
    const g = new THREE.Group(); g.add(pivot);
    const sh = shadow(sz.x * 1.25, Math.max(sz.z, sz.x * .45) * 1.25); sh.position.y = -sz.y / 2 - 0.02; g.add(sh);
    g.userData = { pivot, inner, sz, sh }; g.visible = false; scene.add(g); return g;
  }

  let shoeVar = null, ready = false;
  P.ring = [];
  /* sharpen every texture at grazing angles and give gloss parts a touch more studio reflection */
  function tune(root3) {
    root3.traverse((o) => {
      if (!o.isMesh) return;
      const ms = Array.isArray(o.material) ? o.material : [o.material];
      ms.forEach((m) => {
        if (!m) return;
        ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'emissiveMap', 'clearcoatNormalMap', 'sheenColorMap'].forEach((k) => { if (m[k]) { m[k].anisotropy = Math.min(16, maxAniso); m[k].needsUpdate = true; } });
        if (m.envMapIntensity !== undefined) m.envMapIntensity = m.metalness > 0.5 || m.metalnessMap ? 0.9 : 1.05;
      });
    });
    return root3;
  }
  const get = (n) => loader.loadAsync(BASE + 'assets/models/' + n + SUF).then((g) => { tune(g.scene); return g; }).catch(() => null);
  async function load() {
    /* world 01's shoe first so the first world is live quickly; the rest stream in behind it */
    const want = [['shoe', 'MaterialsVariantsShoe', 1.7, [0, 0, 0]], ['camera', 'AntiqueCamera', 1.75, [0, -0.5, 0]], ['boom', 'BoomBox', 1.5, [0, 0, 0]]];
    const ring = [['bottle', 'WaterBottle', 0.9], ['vase', 'GlassVaseFlowers', 0.95], ['lantern', 'Lantern', 1.0]];
    const G = {};
    G.shoe = await get('MaterialsVariantsShoe');
    if (G.shoe) { P.shoe = holder(G.shoe.scene, 1.7, [0, 0, 0]); shoeVar = await variantsOf(G.shoe); if (shoeVar) await shoeVar.select(Math.max(cwI, 0)); }
    ready = true; root.classList.add('wd-ready'); loop();
    const rest = await Promise.all([...want.slice(1), ...ring].map(([k, n]) => get(n).then((g) => [k, g])));
    for (const [k, g] of rest) G[k] = g;
    for (const [k, , size, rot] of want.slice(1)) if (G[k]) P[k] = holder(G[k].scene, size, rot);
    /* ring: clones of the hero products + three more */
    const ringSrc = [['shoe', 0.95], ['camera', 0.95], ['boom', 0.85], ['bottle', 0.9], ['vase', 0.85], ['lantern', 1.0]];
    const built = [];
    for (const [k, s] of ringSrc) {
      const src = G[k] && G[k].scene;
      if (!src) continue;
      const obj = P[k] ? src.clone(true) : src;
      const h = holder(obj, s, k === 'camera' ? [0, -0.5, 0] : null); h.userData.label = { shoe: 'Stride Aero, sneaker', camera: 'Frame No. 4, camera', boom: 'Loudbox, speaker', bottle: 'Field Flask, bottle', vase: 'Bloom, glass vase', lantern: 'Old Town, lamp' }[k];
      built.push(h);
    }
    P.ring = built;
    loop();
  }
  async function variantsOf(gltf) {
    const parser = gltf.parser, ext = parser.json.extensions && parser.json.extensions.KHR_materials_variants;
    if (!ext) return null;
    const names = ext.variants.map((v) => v.name), targets = [], cache = new Map();
    gltf.scene.traverse((o) => {
      if (!o.isMesh) return; const a = parser.associations.get(o); if (!a || a.meshes === undefined) return;
      const pr = parser.json.meshes[a.meshes].primitives[a.primitives || 0];
      const m = pr.extensions && pr.extensions.KHR_materials_variants; if (m) targets.push({ o, m: m.mappings });
    });
    return { names, async select(i) {
      await Promise.all(targets.map(async (t) => {
        const mp = t.m.find((x) => x.variants.includes(i)); if (!mp) return;
        if (!cache.has(mp.material)) cache.set(mp.material, parser.getDependency('material', mp.material));
        t.o.material = await cache.get(mp.material);
      }));
    } };
  }

  /* ---------- scroll + state ---------- */
  let pT = 0, pS = 0, visible = false, raf = 0, last = performance.now();
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const sm = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const mix = (a, b, t) => a + (b - a) * t;
  function readP() {
    const r = root.getBoundingClientRect(), span = r.height - innerHeight;
    pT = clamp(-r.top / (span || 1));
  }
  let loading = false;
  function startLoad() { loading = true; load(); }
  /* Begin fetching as the section nears the viewport, but only animate while it actually intersects. */
  const lazyIO = new IntersectionObserver(([e]) => { if (e.isIntersecting && !loading) { startLoad(); lazyIO.disconnect(); } }, { rootMargin: '120% 0px 120% 0px' });
  lazyIO.observe(root);
  const liveIO = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) { if (!loading) startLoad(); last = performance.now(); loop(); }
    else if (raf) { cancelAnimationFrame(raf); raf = 0; }
  }, { rootMargin: '0px' });
  liveIO.observe(root);
  addEventListener('scroll', readP, { passive: true }); readP();

  /* world 01: colourway index from scroll + time-based spin on change */
  let cwI = -1, spin = 0, spinT = 1, auto = 0, userPick = -1;
  function setCW(i) {
    if (i === cwI) return; const first = cwI < 0; cwI = i;
    const c = CW[i];
    root.style.setProperty('--cw-page', c.page); root.style.setProperty('--cw-card', c.card); root.style.setProperty('--cw-ink', c.ink);
    root.style.setProperty('--cw-acc', c.acc); root.style.setProperty('--cw-word', c.word); root.style.setProperty('--cw-acc-ink', c.accInk);
    dots.forEach((d, k) => d.setAttribute('aria-current', k === i ? 'true' : 'false'));
    sw.forEach((d, k) => d.setAttribute('aria-pressed', k === i ? 'true' : 'false'));
    const lbl = root.querySelector('.wd-cw-name'); if (lbl) lbl.textContent = c.name;
    const num = root.querySelector('.wd-cw-num'); if (num) num.textContent = '0' + (i + 1);
    if (first || reduce) { shoeVar && shoeVar.select(i); return; }
    spinT = 0; spin = 0; swapped = false;
  }
  let swapped = true;
  [...dots, ...sw].forEach((b) => b.addEventListener('click', () => { userPick = +b.dataset.i; setCW(userPick); }));

  const fitW = (wd) => Math.min(1, (VW * (M ? 0.86 : 0.82)) / wd);
  function seg(p, a, b) { return clamp((p - a) / (b - a)); }
  function place(g, x, y, z, s, ry, rx) {
    if (!g) return; g.visible = s > 0.002; g.position.set(x, y, z); g.scale.setScalar(Math.max(s, 0.0001));
    g.userData.pivot.rotation.y = ry || 0;
    g.rotation.x = rx || 0;
  }
  const v3 = new THREE.Vector3();
  function toScreen(obj, lx, ly, lz) {
    v3.set(lx, ly, lz); obj.localToWorld(v3); v3.project(cam);
    return [(v3.x * .5 + .5) * pin.clientWidth, (-v3.y * .5 + .5) * pin.clientHeight];
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    pS = reduce ? pT : pS + (pT - pS) * (1 - Math.exp(-8 * dt));
    const p = pS, t = now / 1000;
    const idle = reduce ? 0 : 1;
    /* active chapter */
    const ci = Math.min(4, Math.floor(p * 5 + 0.0001));
    ch.forEach((el, k) => {
      const c = k * 0.2, a = sm(c - 0.035, c + 0.02, p) * (k === 4 ? 1 : 1 - sm(c + 0.165, c + 0.205, p));
      el.style.opacity = (k === 0 ? Math.max(a, p < 0.02 ? 1 : 0) : a).toFixed(3);
      el.style.visibility = el.style.opacity > 0.01 ? 'visible' : 'hidden';
      el.classList.toggle('on', k === ci);
      if (chb[k]) { chb[k].style.opacity = el.style.opacity; chb[k].style.visibility = el.style.visibility; }
    });
    rail.forEach((b, k) => b.setAttribute('aria-current', k === ci ? 'true' : 'false'));
    root.classList.toggle('is-dark', p > 0.6 && p < 0.9);
    if (hudN) { hudN.textContent = '0' + (ci + 1) + ' / 05'; hudL.textContent = NAMES[ci]; hudBar.style.transform = 'scaleX(' + p.toFixed(4) + ')'; }
    /* background colour per chapter */
    const bgi = Math.min(4, p * 5); const b0 = Math.floor(bgi), bt = sm(0.78, 1, bgi - b0);
    back.style.backgroundColor = '#' + new THREE.Color(b0 === 0 ? (CW[Math.max(cwI, 0)].page) : BG[b0]).lerp(new THREE.Color(BG[Math.min(4, b0 + 1)]), b0 < 4 ? bt : 0).getHexString();

    /* world 01 */
    const p1 = seg(p, 0, 0.2);
    if (userPick < 0) setCW(Math.min(2, Math.floor(seg(p, 0.0, 0.17) * 3)));
    if (spinT < 1) { spinT = Math.min(1, spinT + dt / 0.9); spin = ease(spinT) * Math.PI * 2; if (!swapped && spinT > 0.45) { swapped = true; shoeVar && shoeVar.select(cwI); } }
    if (ready) {
      const out1 = sm(0.16, 0.23, p);
      place(P.shoe, mix(VW * (M ? 0 : 0.08), -VW * 0.55, out1), mix(M ? 0.12 : -0.08, VH * 0.4, out1) + Math.sin(t * 1.2) * 0.04 * idle, 0,
        (1 - out1) * fitW(1.7), -0.5 + spin + Math.sin(t * 0.6) * 0.18 * idle + p1 * 0.6, 0.08);
      /* world 02: camera rises in, giant word behind */
      const in2 = sm(0.17, 0.25, p), out2 = sm(0.36, 0.43, p);
      place(P.camera, mix(0, -VW * 0.6, out2) + (M ? 0 : VW * 0.02), mix(-VH * 0.8, -0.05, in2) + Math.sin(t) * 0.03 * idle, 0,
        in2 * (1 - out2 * 0.6) * Math.min(1, VH * 0.62 / 1.75), mix(-0.9, 0.7, seg(p, 0.2, 0.4)), 0.05);
      /* world 03: boombox spins, callouts follow */
      const in3 = sm(0.37, 0.45, p), out3 = sm(0.56, 0.63, p);
      const bx = mix(VW * 0.6, M ? 0 : -VW * 0.05, in3), by = (M ? 0.15 : 0) + Math.sin(t * 1.1) * 0.03 * idle;
      place(P.boom, mix(bx, 0, out3), by, 0, in3 * (1 - out3) * fitW(1.5), mix(-0.8, 0.8, seg(p, 0.4, 0.6)), 0.06);
      if (P.boom && calls.length) {
        const sz = P.boom.userData.sz, pivot = P.boom.userData.pivot;
        const anchors = [[-sz.x * 0.3, 0, sz.z * 0.5], [sz.x * 0.0, sz.y * 0.05, sz.z * 0.5], [sz.x * 0.3, 0, sz.z * 0.5], [0, sz.y * 0.48, 0]];
        const vis3 = in3 * (1 - out3);
        calls.forEach((el, k) => {
          const a = anchors[k % anchors.length];
          /* inner is scaled and centred; convert from inner-local using the holder */
          P.boom.updateMatrixWorld();
          const local = new THREE.Vector3(a[0], a[1], a[2]).applyEuler(pivot.rotation);
          const [sx, sy] = toScreen(P.boom, local.x, local.y, local.z);
          const r = el.getBoundingClientRect(), pr = pin.getBoundingClientRect();
          const ex = r.left - pr.left + (k % 2 ? 0 : r.width), ey = r.top - pr.top + r.height / 2;
          const ln = lines[k]; if (ln) { ln.setAttribute('x1', sx.toFixed(1)); ln.setAttribute('y1', sy.toFixed(1)); ln.setAttribute('x2', ex.toFixed(1)); ln.setAttribute('y2', ey.toFixed(1)); ln.style.opacity = (vis3 * sm(0.42 + k * 0.03, 0.47 + k * 0.03, p)).toFixed(3); }
          el.style.opacity = (vis3 * sm(0.42 + k * 0.03, 0.47 + k * 0.03, p)).toFixed(3);
        });
      }
      /* world 04: orbit ring */
      const in4 = sm(0.57, 0.65, p), out4 = sm(0.8, 0.9, p);
      const n = P.ring.length, rot = seg(p, 0.6, 0.82) * Math.PI * 2 * 0.84 + (reduce ? 0 : t * 0.04);
      let front = 0, fz = -9;
      P.ring.forEach((h, k) => {
        const a = (k / n) * Math.PI * 2 - rot;
        const R = (M ? VW * 0.4 : Math.min(VW * 0.36, 2.6)) * (1 + out4 * 0.8);
        const D = M ? 1.0 : 1.25, x = Math.sin(a) * R, z = Math.cos(a) * D - 0.4;
        const fr = (z + 0.4 + D) / (2 * D);
        if (z > fz) { fz = z; front = k; }
        place(h, x, mix(-VH, (M ? 0.15 : 0.05), in4) + Math.sin(t + k) * 0.03 * idle - fr * 0.18, z, in4 * (1 - out4) * (0.5 + fr * fr * 0.45) * Math.min(1, VW / (M ? 3.2 : 4.6)), -a * 0.6 + t * 0.2 * idle, 0.08);
      });
      if (orbitName && P.ring[front]) { const lb = P.ring[front].userData.label; if (orbitName.textContent !== lb) { orbitName.textContent = lb; orbitIdx.textContent = '0' + (front + 1) + ' / 0' + n; } }
    }
    /* world 05: organic mask */
    if (maskWrap) {
      const m5 = sm(0.8, 0.97, p);
      maskWrap.style.setProperty('--ms', (m5 * m5 * 330).toFixed(2) + 'vmax');
      maskWrap.style.visibility = m5 > 0.001 ? 'visible' : 'hidden';
      const tz = root.querySelector('.wd-lab-teaser'); if (tz) tz.style.transform = 'scale(' + (1.12 - 0.12 * m5).toFixed(4) + ')';
    }
    if (ready) renderer.render(scene, cam);
  }
  function loop() {
    if (raf) return;
    const step = (now) => { raf = 0; if (!visible) return; frame(now); raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
  }
  /* rail jumps */
  rail.forEach((b, k) => b.addEventListener('click', () => {
    const r = root.getBoundingClientRect(), top = r.top + scrollY, span = r.height - innerHeight;
    const y = top + span * (k * 0.2 + 0.1);
    if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.4 }); else scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
  }));
  setCW(0);
  frame(performance.now());
}
