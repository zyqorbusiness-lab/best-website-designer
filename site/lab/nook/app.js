/* Nook - Zyqor Lab concept 11. Shared by index.html (desktop) and m.html (phone, isM). */
import { useHDRI } from '../../assets/hdri/hdri.js';
import { THREE, reduced, coarse, isM, Q, loadGLB, modelURL, makeRenderer, glRenderer, studioEnv, fitObject, reveals, smooth, whenVisible, clamp, lerp } from '../_kit/kit.js';

const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const gsap = window.gsap, ST = window.ScrollTrigger;
if (gsap && ST) gsap.registerPlugin(ST);
const root = document.documentElement;

const COLS = [
  { n: 'Olive', t: 'Olive Grove', bar: '#6B7440', fab: '#6F7A3C', wood: 'brown', rug: '#B4A57C' },
  { n: 'Rust', t: 'Rust Hour', bar: '#B5512E', fab: '#B04A28', wood: 'brown', rug: '#C9A186' },
  { n: 'Oat', t: 'Oat Field', bar: '#D6C3A0', fab: '#D9C6A2', wood: 'brown', rug: '#BCA984' },
  { n: 'Moss', t: 'Moss Room', bar: '#3E5137', fab: '#3D5236', wood: 'black', rug: '#A39F7F' },
  { n: 'Clay', t: 'Clay Studio', bar: '#C47E5A', fab: '#C27A55', wood: 'black', rug: '#C69E82' }
];
const BG0 = '#EDE5D8';
let cur = 0;

/* ---------- helpers ---------- */
function mixHex(a, b, t) { const A = new THREE.Color(a), B = new THREE.Color(b); return '#' + A.lerp(B, t).getHexString(); }
function texCanvas(w, h, draw, srgb = true) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
const shadowTex = texCanvas(256, 256, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(40,30,15,.55)'); gr.addColorStop(0.5, 'rgba(40,30,15,.25)'); gr.addColorStop(1, 'rgba(40,30,15,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });

/* ---------- odometer ---------- */
const odo = $('#odo');
function roll(el, str) {
  if (!el.dataset.ready) {
    el.innerHTML = [...str].map(() => `<span class="dg"><span>${'0123456789'.split('').map((d) => `<span>${d}</span>`).join('')}</span></span>`).join('');
    el.dataset.ready = 1;
  }
  $$('.dg', el).forEach((dg, i) => { dg.firstElementChild.style.transitionDelay = (i * 90) + 'ms'; dg.firstElementChild.style.transform = `translateY(${-(+str[i]) * 10}%)`; });
  el.setAttribute('aria-label', str);
}
if (odo) roll(odo, '01');

/* ---------- the chair (shared by hero + room) ----------
   "Modern Arm Chair 01" photoscan by Poly Haven (CC0). The cushion texture was converted to a neutral
   grey so the collection colour tints the fabric; the solid oak frame keeps its own maps. */
// one asset set for every screen: the phone loads the same -d models and textures as desktop (meshopt + webp keep it light)
const ASSETS = '../../assets/lab/nook/', SUF = '-d.glb', WEAVE = 22, SH = true;
// renderer with full quality on every screen (AA on, DPR up to 2, ACES, sRGB): no phone-only cuts
function mkRenderer(canvas, opts = {}) {
  const r = glRenderer({ canvas, antialias: true, alpha: opts.alpha ?? true, powerPreference: 'high-performance' });
  r.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = opts.exposure ?? 1; return r;
}
let fabric = null, woodMesh = null, woodBrown = null, woodBlack = null, chairSrc = null;
const fabCol = new THREE.Color(COLS[0].fab), FK = 1.25;
function tintFabric(c) { if (!fabric) return; fabric.color.copy(c).multiplyScalar(FK); if (fabric.sheenColor) fabric.sheenColor.copy(c).lerp(new THREE.Color('#ffffff'), 0.35); }
const chairReady = loadGLB(ASSETS + 'chair' + SUF).then((g) => {
  chairSrc = g.scene;
  g.scene.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = SH; o.receiveShadow = SH;
    const m = o.material;
    if (/pillow/i.test(m.name)) {
      // woven upholstery: matte, with a soft fibre sheen on the grazing edges
      const f = new THREE.MeshPhysicalMaterial({
        name: m.name, map: m.map, normalMap: m.normalMap, aoMap: m.aoMap, aoMapIntensity: 0.9,
        roughness: 0.93, metalness: 0, sheen: 0.22, sheenRoughness: 1.0, specularIntensity: 0.35, sheenColor: new THREE.Color('#ffffff'),
        normalScale: new THREE.Vector2(1.4, 1.4)
      });
      if (m.normalMap) f.normalMap.anisotropy = 8;
      {
        // fine linen weave (Poly Haven "Rough Linen", CC0), tiled at its own scale over the scanned cushions:
        // tints the albedo, breaks the roughness and adds a micro bump, so the fabric reads woven, not satin
        const wl = new THREE.TextureLoader();
        const wt = (n, srgb) => { const t = wl.load(ASSETS + n + '-d.webp'); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(WEAVE, WEAVE); t.anisotropy = 8; if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t; };
        f.roughnessMap = wt('weave_rough', false); f.roughness = 1.0;
        const weave = wt('weave_h', false); // linen displacement used as a fine height field
        f.sheenColorMap = weave;
        f.onBeforeCompile = (sh) => {
          sh.uniforms.weaveMap = { value: weave };
          sh.fragmentShader = 'uniform sampler2D weaveMap;\n' + sh.fragmentShader
            .replace('#include <map_fragment>', `#include <map_fragment>
              float wH = texture2D(weaveMap, vMapUv * ${WEAVE.toFixed(1)}).r;
              diffuseColor.rgb *= 0.72 + 0.42 * wH;`)
            .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
              {
                vec2 dH = vec2(dFdx(wH), dFdy(wH)) * 2.6;
                vec3 sx = normalize(dFdx(-vViewPosition)), sy = normalize(dFdy(-vViewPosition));
                vec3 r1 = cross(sy, normal), r2 = cross(normal, sx);
                float det = dot(sx, r1) * faceDirection;
                normal = normalize(abs(det) * normal - sign(det) * (dH.x * r1 + dH.y * r2));
              }`);
        };
      }
      if (f.map) f.map.anisotropy = 8;
      o.material = fabric = f;
    } else {
      m.envMapIntensity = 1; woodMesh = woodMesh || []; woodMesh.push(o); woodBrown = m;
      woodBlack = m.clone(); woodBlack.name = 'ebonised oak'; woodBlack.color = new THREE.Color('#3a2c22'); woodBlack.roughness = 0.9;
    }
  });
  tintFabric(fabCol);
  applyWood(COLS[0].wood);
  return g.scene;
});
function applyWood(w) { if (!woodMesh) return; woodMesh.forEach((m) => (m.material = w === 'black' ? woodBlack : woodBrown)); }

/* ---------- hero stage ---------- */
const stage = $('#stage'), hc = $('#chairGl');
const hr = mkRenderer(hc, { alpha: true, exposure: 1.0 });
hr.shadowMap.enabled = SH; hr.shadowMap.type = THREE.VSMShadowMap;
const hs = new THREE.Scene(); hs.environment = studioEnv(hr, 0.04); hs.environmentIntensity = 0.75;
// studio HDRI ("Studio Small 09", Poly Haven, CC0) swaps in after first paint on desktop; phones keep the free fallback
useHDRI(hr, hs, { size: 512, intensity: 0.9, rotation: 0.6 });
const hcam = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
const hkey = new THREE.DirectionalLight(0xfff1dc, 1.15); hkey.position.set(-0.9, 6, 1.6); hkey.castShadow = SH;
hkey.shadow.mapSize.set(1024, 1024); hkey.shadow.camera.near = 1; hkey.shadow.camera.far = 14; hkey.shadow.radius = 14; hkey.shadow.blurSamples = 16; hkey.shadow.bias = -0.0004;
['left', 'bottom'].forEach((k) => (hkey.shadow.camera[k] = -1.4)); ['right', 'top'].forEach((k) => (hkey.shadow.camera[k] = 1.4));
const hrim = new THREE.DirectionalLight(0xffffff, 0.6); hrim.position.set(3, 2.4, -2.5);
hs.add(hkey, hrim);
const turn = new THREE.Group(); hs.add(turn);
// rug texture (used by the room scene; the hero floats on no disc any more)
const rugTex = texCanvas(512, 512, (g, w) => {
  g.fillStyle = '#fff'; g.fillRect(0, 0, w, w);
  for (let r = w / 2; r > 8; r -= 14) { g.beginPath(); g.arc(w / 2, w / 2, r, 0, 7); g.strokeStyle = r % 28 ? 'rgba(0,0,0,.06)' : 'rgba(255,255,255,.5)'; g.lineWidth = 5; g.stroke(); }
  for (let i = 0; i < 2600; i++) { const a = Math.random() * 7, rr = Math.sqrt(Math.random()) * w / 2; g.fillStyle = `rgba(0,0,0,${Math.random() * 0.05})`; g.fillRect(w / 2 + Math.cos(a) * rr, w / 2 + Math.sin(a) * rr, 2, 2); }
});
const rugMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(COLS[0].rug), map: rugTex, roughness: 0.95 });
const sideMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(COLS[0].rug).multiplyScalar(0.85), roughness: 0.95 });
// floor: an invisible shadow catcher (the page colour is the floor) + a tight ambient-occlusion contact shadow
const floorCatch = new THREE.Mesh(new THREE.CircleGeometry(1.1, 64), new THREE.ShadowMaterial({ color: 0x2a2014, opacity: 0.2 }));
floorCatch.rotation.x = -Math.PI / 2; floorCatch.receiveShadow = SH; hs.add(floorCatch);
const aoTex = texCanvas(256, 256, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(30,22,12,.62)'); gr.addColorStop(0.35, 'rgba(30,22,12,.42)'); gr.addColorStop(0.7, 'rgba(30,22,12,.1)'); gr.addColorStop(1, 'rgba(30,22,12,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
const hShadow = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 1.35), new THREE.MeshBasicMaterial({ map: aoTex, transparent: true, depthWrite: false, opacity: 0.85 }));
hShadow.rotation.x = -Math.PI / 2; hShadow.position.y = 0.003; turn.add(hShadow);
const hWide = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.25), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.35 }));
hWide.rotation.x = -Math.PI / 2; hWide.position.set(0.05, 0.002, -0.08); hs.add(hWide);
const H = { yaw: -0.5, spin: 0, lift: 0, drag: 0, v: 0, intro: reduced ? 0 : 1 };
let heroChair = null;
chairReady.then((sc) => {
  heroChair = sc; turn.add(heroChair); // native metres: 82 x 102 x 98 cm
  if (gsap && !reduced) gsap.fromTo(H, { intro: 1 }, { intro: 0, duration: 1.6, ease: 'expo.out', delay: 0.2 });
});
const ZOOM = Math.max(1, +(new URLSearchParams(location.search).get('zoom') || 1));
function sizeHero() {
  const w = hc.clientWidth, h = hc.clientHeight; hr.setSize(w, h, false); hcam.aspect = w / h;
  // the chair is ~1.02 m tall; frame it so it fills the stage (bigger than the old shot)
  const fitH = isM ? 1.32 : 1.22, fitW = isM ? 1.55 : 1.45;
  let d = Math.max(fitH / (2 * Math.tan(THREE.MathUtils.degToRad(15))), fitW / (2 * Math.tan(THREE.MathUtils.degToRad(15)) * hcam.aspect));
  // ?zoom=N (QA close-ups only): same camera line, N times closer, aimed at the seat cushion
  const ty = ZOOM > 1 ? 0.5 : 0.47; d /= ZOOM;
  hcam.position.set(0, d * 0.28 + 0.2 / ZOOM + (ZOOM > 1 ? 0.35 : 0), d); hcam.lookAt(0, ty, 0); hcam.updateProjectionMatrix();
}
let heroVis = true; whenVisible(hc, (v) => (heroVis = v));
// drag to turn
let dragging = false, lx = 0;
stage.addEventListener('pointerdown', (e) => { dragging = true; lx = e.clientX; });
addEventListener('pointermove', (e) => { if (!dragging) return; const dx = e.clientX - lx; lx = e.clientX; H.v = dx * 0.008; H.drag += H.v; }, { passive: true });
addEventListener('pointerup', () => (dragging = false)); addEventListener('pointercancel', () => (dragging = false));

/* ---------- colour switch (accordion + counter + chair + page tint) ---------- */
const bars = $$('.bar'), colName = $('#colName');
function setCol(i, focus) {
  i = (i + COLS.length) % COLS.length;
  if (i === cur && !focus) return;
  const c = COLS[i]; cur = i;
  bars.forEach((b, j) => { b.classList.toggle('on', j === i); b.setAttribute('aria-pressed', j === i); });
  if (focus) bars[i].focus();
  roll(odo, String(i + 1).padStart(2, '0'));
  root.style.setProperty('--cur', c.bar);
  root.style.setProperty('--bg', mixHex(BG0, c.bar, isM ? 0.1 : 0.13));
  const tm = $('meta[name="theme-color"]'); if (tm) tm.content = mixHex(BG0, c.bar, 0.13);
  const target = new THREE.Color(c.fab), rugT = new THREE.Color(c.rug);
  if (reduced || !gsap) {
    fabCol.copy(target); tintFabric(fabCol);
    rugMat.color.copy(rugT); sideMat.color.copy(rugT).multiplyScalar(0.85); applyWood(c.wood); if (colName) colName.textContent = c.t; return;
  }
  const from = fabCol.clone(), rFrom = rugMat.color.clone(), o = { t: 0 };
  gsap.killTweensOf(H, 'spin,lift'); gsap.killTweensOf(o);
  gsap.to(o, { t: 1, duration: 0.9, ease: 'power2.inOut', delay: 0.25, onUpdate: () => {
    fabCol.copy(from).lerp(target, o.t);
    tintFabric(fabCol);
    rugMat.color.copy(rFrom).lerp(rugT, o.t); sideMat.color.copy(rugMat.color).multiplyScalar(0.85);
  } });
  gsap.delayedCall(0.6, () => applyWood(c.wood));
  gsap.to(H, { spin: Math.round(H.spin / (Math.PI * 2)) * Math.PI * 2 + Math.PI * 2, duration: 1.4, ease: 'power3.inOut' });
  gsap.fromTo(H, { lift: 0 }, { lift: 1, duration: 1.3, ease: 'sine.inOut' });
  if (colName) gsap.timeline().to(colName, { yPercent: -60, opacity: 0, duration: 0.3, ease: 'power2.in' }).add(() => (colName.textContent = c.t)).fromTo(colName, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.7, ease: 'expo.out' });
}
let hoverT = 0;
bars.forEach((b, j) => {
  b.addEventListener('click', () => setCol(j));
  if (!coarse && !isM) {
    b.addEventListener('pointerenter', () => { clearTimeout(hoverT); hoverT = setTimeout(() => setCol(j), 170); });
    b.addEventListener('pointerleave', () => clearTimeout(hoverT));
  }
  b.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); setCol(cur + 1, true); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); setCol(cur - 1, true); }
  });
});
$('#prev').addEventListener('click', () => setCol(cur - 1));
$('#next').addEventListener('click', () => setCol(cur + 1));
addEventListener('keydown', (e) => {
  if (e.target.closest && e.target.closest('.acc, .chips, .units, input')) return;
  if (scrollY > innerHeight * 0.6) return;
  if (e.key === 'ArrowRight') setCol(cur + 1); if (e.key === 'ArrowLeft') setCol(cur - 1);
});

/* ---------- materials: swatch chips with ripple ---------- */
const MATS = [
  { k: 'Bouclé', t: 'Looped wool, cloud soft', b: '70% wool, 30% cotton', r: 60000, f: 'Plush', c: '#D8C7A2', cls: 'sw-boucle', ink: '#2C3020' },
  { k: 'Linen', t: 'Washed linen, cool hand', b: '100% European linen', r: 30000, f: 'Crisp', c: '#8E9A6A', cls: 'sw-linen', ink: '#1f2414' },
  { k: 'Velvet', t: 'Deep pile with a glow', b: '88% cotton, 12% viscose', r: 50000, f: 'Silky', c: '#3E5137', cls: 'sw-velvet', ink: '#F4EFE4' },
  { k: 'Wool', t: 'Tight twill, warm weight', b: '90% wool, 10% nylon', r: 80000, f: 'Dense', c: '#B5512E', cls: 'sw-wool', ink: '#FFF5EC' },
  { k: 'Cord', t: 'Wide wale corduroy', b: '100% cotton', r: 40000, f: 'Ribbed', c: '#C47E5A', cls: 'sw-cord', ink: '#2a1a10' }
];
const chips = $$('.chip'), mView = $('#mView'), ripple = $('#ripple'), mSw = $('#mSwatch');
let mat = 0;
function setMat(i, ev) {
  if (i === mat) return; mat = i; const m = MATS[i];
  chips.forEach((c, j) => { c.classList.toggle('on', j === i); c.setAttribute('aria-checked', j === i); });
  const chip = chips[i];
  if (ev && !reduced) { // small ripple inside the chip
    const r = chip.getBoundingClientRect(), s = Math.max(r.width, r.height) * 2.2, sp = document.createElement('span');
    sp.className = 'rp'; sp.style.cssText = `width:${s}px;height:${s}px;left:${(ev.clientX || r.left + r.width / 2) - r.left - s / 2}px;top:${(ev.clientY || r.top + r.height / 2) - r.top - s / 2}px`;
    chip.append(sp); setTimeout(() => sp.remove(), 800);
  }
  const fill = () => {
    mView.style.background = m.c; mView.style.setProperty('--mi', m.ink);
    mSw.className = 'm-swatch ' + m.cls; mSw.style.setProperty('--sw2', m.c);
    $('#mK').textContent = String(i + 1).padStart(2, '0') + ' \u00b7 ' + m.k; $('#mT').textContent = m.t; $('#mB').textContent = m.b; $('#mF').textContent = m.f;
  };
  if (reduced || !gsap) { fill(); $('#mR').textContent = m.r.toLocaleString('en-US'); return; }
  // big ripple across the panel, from the chip
  const vr = mView.getBoundingClientRect(), cr = chip.getBoundingClientRect();
  const x = cr.left + cr.width / 2 - vr.left, y = cr.top + cr.height / 2 - vr.top;
  const R = Math.hypot(Math.max(x, vr.width - x), Math.max(y, vr.height - y)) * 2 / 10;
  ripple.style.left = x + 'px'; ripple.style.top = y + 'px'; ripple.style.setProperty('--rc', m.c);
  gsap.killTweensOf(ripple);
  gsap.fromTo(ripple, { scale: 0 }, { scale: R * 1.05, duration: 0.95, ease: 'power3.inOut', onComplete: () => { fill(); gsap.set(ripple, { scale: 0 }); } });
  gsap.timeline().to('.m-info, .m-swatch', { opacity: 0, y: 12, duration: 0.3, ease: 'power2.in', stagger: 0.04 }).add(() => { mSw.className = 'm-swatch ' + m.cls; mSw.style.setProperty('--sw2', m.c); mView.style.setProperty('--mi', m.ink); $('#mK').textContent = String(i + 1).padStart(2, '0') + ' \u00b7 ' + m.k; $('#mT').textContent = m.t; $('#mB').textContent = m.b; $('#mF').textContent = m.f; }, '+=0.3').to('.m-info, .m-swatch', { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out', stagger: 0.06 });
  const o = { v: +$('#mR').textContent.replace(/,/g, '') };
  gsap.to(o, { v: m.r, duration: 1.2, ease: 'power2.out', delay: 0.4, onUpdate: () => ($('#mR').textContent = Math.round(o.v / 100) * 100 > 0 ? (Math.round(o.v / 100) * 100).toLocaleString('en-US') : '0') });
}
chips.forEach((c, j) => {
  c.addEventListener('click', (e) => setMat(j, e));
  c.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); const n = (mat + 1) % 5; setMat(n); chips[n].focus(); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); const n = (mat + 4) % 5; setMat(n); chips[n].focus(); }
  });
  c.tabIndex = j === 0 ? 0 : -1;
});
if (mView) { mView.style.background = MATS[0].c; mSw.style.setProperty('--sw2', MATS[0].c); }

/* ---------- room scene (built lazily) ---------- */
const roomSec = $('#room'), rc = $('#roomGl');
let R = null, lampGlobe = null;
function buildRoom() {
  const r = mkRenderer(rc, { alpha: false, exposure: 1.0 });
  r.shadowMap.enabled = SH; r.shadowMap.type = THREE.PCFSoftShadowMap;
  const s = new THREE.Scene(); s.background = new THREE.Color('#E9DFCF'); s.environment = studioEnv(r, 0.04);
  useHDRI(r, s, { size: 512, rotation: 0.6 });
  const cam = new THREE.PerspectiveCamera(isM ? 46 : 36, 1, 0.1, 60);
  // real surfaces: herringbone oak floor, plastered walls (Poly Haven textures, CC0), loaded as webp
  const tl = new THREE.TextureLoader(), TS = '-d.webp';
  const tex = (n, srgb, rep) => { const t = tl.load(ASSETS + n + TS, () => { if (R) R.dirty = true; }); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); t.anisotropy = 8; return t; };
  const wallMat = new THREE.MeshStandardMaterial({ color: '#E7DCC8', roughness: 0.95 });
  { wallMat.normalMap = tex('wall_nor', false, 3); wallMat.normalScale.set(0.6, 0.6); }
  const floorMat = new THREE.MeshStandardMaterial({ map: tex('floor_diff', true, 3), roughness: 0.55, color: '#f2e6d6' });
  { floorMat.normalMap = tex('floor_nor', false, 3); floorMat.roughnessMap = tex('floor_rough', false, 3); floorMat.roughness = 1; }
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), floorMat);
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = SH; s.add(floor);
  // wool herringbone rug (Poly Haven "Poly Wool Herringbone", CC0) that follows the collection colour: real fibre normal + roughness
  const rugRoom = new THREE.MeshStandardMaterial({ color: rugMat.color, map: tex('rugw_diff', true, 3), roughness: 1, normalMap: tex('rugw_nor', false, 3), roughnessMap: tex('rugw_rough', false, 3) });
  rugRoom.normalScale.set(1.2, 1.2);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(8, 4), wallMat); back.position.set(0, 2, -2); back.receiveShadow = SH; s.add(back);
  // left wall with a window opening (4 panels around a hole)
  const lw = new THREE.Group(); lw.position.set(-2, 0, 0); lw.rotation.y = Math.PI / 2; s.add(lw);
  const panel = (w, h, x, y) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wallMat); m.position.set(x, y, 0); m.receiveShadow = SH; lw.add(m); };
  panel(8, 0.9, 0, 0.45); panel(8, 0.9, 0, 3.55); panel(3.3, 2.2, -2.35, 2); panel(3.3, 2.2, 2.35, 2);
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.2), new THREE.MeshBasicMaterial({ color: '#FFF6E6', toneMapped: false }));
  glow.position.set(0, 2, -0.12); lw.add(glow);
  const frameMat = new THREE.MeshStandardMaterial({ color: '#F4EEE3', roughness: 0.6 });
  [[0, 2, 1.5, 0.06], [0, 0.93, 1.5, 0.08], [0, 3.07, 1.5, 0.08]].forEach(([x, y, w, h]) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.1), frameMat); b.position.set(x, y, 0.02); lw.add(b); });
  [[-0.72], [0], [0.72]].forEach(([x]) => { const b = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.2, 0.1), frameMat); b.position.set(x, 2, 0.02); lw.add(b); });
  // linen curtains either side of the window: folded panels (sine pleats), light passes through them
  const curtainMat = new THREE.MeshStandardMaterial({ color: '#F3ECE0', roughness: 0.95, transparent: true, opacity: 0.88, side: THREE.DoubleSide });
  [-0.98, 0.98].forEach((cx) => {
    const g = new THREE.PlaneGeometry(0.55, 2.75, 48, 1), p = g.attributes.position;
    for (let k = 0; k < p.count; k++) { const x = p.getX(k); p.setZ(k, Math.sin((x + 0.3) * 34) * 0.035 + Math.sin((x + 0.1) * 13) * 0.015); }
    g.computeVertexNormals();
    const c = new THREE.Mesh(g, curtainMat); c.position.set(cx, 1.92, 0.16); c.castShadow = SH; lw.add(c);
  });
  const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 2.6, 10), new THREE.MeshStandardMaterial({ color: '#2b2520', roughness: 0.4, metalness: 0.6 }));
  rail.rotation.z = Math.PI / 2; rail.position.set(0, 3.32, 0.16); lw.add(rail);
  const sun = new THREE.DirectionalLight('#FFE9C7', 3.2); sun.position.set(-6, 3.4, 0.6); sun.target.position.set(0.4, 0, 0); s.add(sun, sun.target);
  sun.castShadow = SH; sun.shadow.mapSize.set(1024, 1024); sun.shadow.camera.left = -3; sun.shadow.camera.right = 3; sun.shadow.camera.top = 3; sun.shadow.camera.bottom = -3; sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.03;
  const fill = new THREE.HemisphereLight('#fff4e4', '#a08660', 0.9); s.add(fill);
  // rug
  const rug = new THREE.Mesh(new THREE.CircleGeometry(1.35, 80), rugRoom); rug.rotation.x = -Math.PI / 2; rug.position.set(0.2, 0.006, 0.1); rug.receiveShadow = SH; s.add(rug);
  // side table: "Side Table 01" photoscan, Poly Haven (CC0), dressed with real scanned props (all Poly Haven, CC0):
  // three hardcover books laid flat (from "Book Encyclopedia Set 01") and a glazed "Ceramic Vase 02"
  const books = new THREE.Group(); s.add(books);
  const shad = (o) => o.traverse((m) => { if (m.isMesh) { m.castShadow = m.receiveShadow = SH; } });
  loadGLB(ASSETS + 'table' + SUF).then((g) => {
    const tb = g.scene; tb.position.set(0.95, 0, -0.62); tb.rotation.y = -0.35; shad(tb); s.add(tb);
    const top = new THREE.Box3().setFromObject(tb).max.y;
    books.position.set(0.86, top, -0.56); books.rotation.y = -0.2;
    loadGLB(ASSETS + 'books' + SUF).then((gb) => {
      const ms = []; gb.scene.traverse((o) => { if (o.isMesh) ms.push(o); });
      let y = 0; [0, 7, 13].forEach((k, i) => {
        const m = ms[k % ms.length]; if (!m) return; gb.scene.updateMatrixWorld(true); const geo = m.geometry.clone().applyMatrix4(m.matrixWorld); geo.computeBoundingBox();
        const c = new THREE.Vector3(); geo.boundingBox.getCenter(c); geo.translate(-c.x, -c.y, -c.z);
        const b = new THREE.Mesh(geo, m.material); b.rotation.z = Math.PI / 2; b.rotation.y = i * 0.32 - 0.25;
        const sz = new THREE.Vector3(); geo.boundingBox.getSize(sz); b.position.y = y + sz.x / 2; y += sz.x;
        shad(b); books.add(b);
      });
      books.userData.h = y;
    }).catch(() => {});
    loadGLB(ASSETS + 'vase' + SUF).then((gv) => { const v = gv.scene; v.position.set(1.05, top, -0.72); shad(v); s.add(v); }).catch(() => {});
  }).catch(() => {});
  // floor plant beside the chair: "Potted Plant 02", Poly Haven (CC0)
  loadGLB(ASSETS + 'plant' + SUF).then((gp) => { const pl = gp.scene; pl.position.set(-1.75, 0, -1.35); pl.rotation.y = 0.8; pl.scale.setScalar(1.2); shad(pl); s.add(pl); }).catch(() => {});
  // framed art on the back wall (code-made abstract)
  const art = texCanvas(400, 520, (g, w, h) => { g.fillStyle = '#F2EADB'; g.fillRect(0, 0, w, h); g.fillStyle = '#B5512E'; g.beginPath(); g.arc(w * 0.38, h * 0.42, w * 0.22, 0, 7); g.fill(); g.fillStyle = '#5B6B3A'; g.fillRect(w * 0.18, h * 0.6, w * 0.64, h * 0.16); g.fillStyle = '#D6C3A0'; g.beginPath(); g.arc(w * 0.66, h * 0.3, w * 0.12, 0, 7); g.fill(); });
  const fr = new THREE.Mesh(new THREE.BoxGeometry(0.86, 1.1, 0.04), new THREE.MeshStandardMaterial({ color: '#2C3020', roughness: 0.5 })); fr.position.set(-0.45, 2.0, -1.97); s.add(fr);
  const pic = new THREE.Mesh(new THREE.PlaneGeometry(0.76, 1.0), new THREE.MeshStandardMaterial({ map: art, roughness: 0.9 })); pic.position.set(-0.45, 2.0, -1.948); s.add(pic);
  // chair clone
  const chairGroup = new THREE.Group(); s.add(chairGroup);
  chairReady.then((sc) => { const c = sc.clone(true); c.position.set(0, 0, 0); c.rotation.set(0, 0.55, 0); c.scale.set(1, 1, 1); chairGroup.add(c); chairGroup.position.set(0.15, 0, 0.05); 
    // one scatter cushion on the seat: "Throw Pillows 01", Poly Haven (CC0)
    loadGLB(ASSETS + 'pillows' + SUF).then((gq) => {
      let m = null; gq.scene.traverse((o) => { if (o.isMesh && !m) m = o; }); if (!m) return; gq.scene.updateMatrixWorld(true);
      const geo = m.geometry.clone().applyMatrix4(m.matrixWorld); geo.computeBoundingBox(); const ce = new THREE.Vector3(); geo.boundingBox.getCenter(ce); geo.translate(-ce.x, -ce.y, -ce.z);
      const qm = m.material.clone(); qm.map = null; qm.color = new THREE.Color('#E4D8C4'); qm.roughness = 1; // cream boucle cover (Poly Haven "Wool Boucle", CC0) instead of the scan's loud chevron print
      const q = new THREE.Mesh(geo, qm); q.position.set(0.12, 0.62, -0.12); q.rotation.set(-0.35, 0.25, 0.1); shad(q); c.add(q);
    }).catch(() => {});
  });
  // pendant lamp: "Modern Ceiling Lamp 01" photoscan, Poly Haven (CC0), hung over the reading corner
  const lampLight = new THREE.PointLight('#FFB35C', 0, 5, 1.6); lampLight.position.set(1.0, 1.75, -0.6); s.add(lampLight);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 12), new THREE.MeshBasicMaterial({ color: '#FFD9A0', toneMapped: false, transparent: true, opacity: 0 })); bulb.position.copy(lampLight.position); s.add(bulb);
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 1, 6), new THREE.MeshStandardMaterial({ color: '#2b2520', roughness: 0.6 })); s.add(cord);
  loadGLB(ASSETS + 'lamp' + SUF).then((g) => {
    const l = g.scene, k = 0.85; l.scale.setScalar(k); l.position.set(1.0, 1.75 - 0.22 * k, -0.6);
    l.traverse((o) => {
      if (!o.isMesh) return; o.castShadow = false; const mt = o.material;
      // opal globe glows from inside once the lamp is on; the clear outer glass stays a thin, see-through shell
      if (/globe/i.test(mt.name)) { mt.emissive = new THREE.Color('#FFD8A8'); mt.emissiveIntensity = 0.05; mt.roughness = 0.35; if (R) R.globe = mt; else lampGlobe = mt; }
      else if (/glass/i.test(mt.name)) { mt.transparent = true; mt.opacity = 0.28; mt.roughness = 0.04; mt.metalness = 0; mt.envMapIntensity = 1.6; mt.depthWrite = false; }
    });
    s.add(l);
    const b = new THREE.Box3().setFromObject(l);
    lampLight.position.set(1.0, b.min.y + 0.06, -0.6); bulb.position.copy(lampLight.position);
    cord.scale.y = 3.4 - b.max.y; cord.position.set(1.0, b.max.y + cord.scale.y / 2, -0.6);
  }).catch(() => {});
  return { r, s, cam, sun, fill, glow, lampLight, bulb, wallMat, vis: false, p: 0, lastP: -1, lastT: 0 };
}
function sizeRoom() { if (!R) return; const w = rc.clientWidth, h = rc.clientHeight; R.r.setSize(w, h, false); R.cam.aspect = w / h; R.cam.updateProjectionMatrix(); }
const caps = $$('.rc'), roomBar = $('#roomBar');
const io = new IntersectionObserver((es) => es.forEach((e) => {
  if (e.isIntersecting && !R) { R = buildRoom(); sizeRoom(); whenVisible(rc, (v) => (R.vis = v)); }
}), { rootMargin: '80% 0px' }); // room models + textures load only as the section nears the viewport
io.observe(roomSec);
const camA = new THREE.Vector3(3.3, 1.9, 4.2), camB = new THREE.Vector3(1.55, 1.05, 1.75), lookA = new THREE.Vector3(-0.2, 0.9, -0.5), lookB = new THREE.Vector3(0.05, 0.55, 0);
if (isM) { camA.set(2.6, 2.0, 4.6); camB.set(1.3, 1.15, 2.2); }
const v3 = new THREE.Vector3(), l3 = new THREE.Vector3(), wallDay = new THREE.Color('#E7DCC8'), wallDusk = new THREE.Color('#D9B48C'), bgDay = new THREE.Color('#E9DFCF'), bgDusk = new THREE.Color('#5E4632');
function roomTick(dt) {
  if (!R || !R.vis) return;
  const rr = roomSec.getBoundingClientRect();
  const span = roomSec.offsetHeight - innerHeight;
  const target = reduced ? 0.15 : clamp(-rr.top / Math.max(1, span));
  R.p = reduced ? target : lerp(R.p, target, 1 - Math.exp(-5 * dt));
  const p = R.p, e = p * p * (3 - 2 * p);
  v3.copy(camA).lerp(camB, e); l3.copy(lookA).lerp(lookB, e);
  R.cam.position.copy(v3); R.cam.lookAt(l3);
  const dusk = clamp((p - 0.45) / 0.45);
  R.sun.intensity = lerp(3.2, 0.25, dusk); R.fill.intensity = lerp(1.0, 0.2, dusk); R.s.environmentIntensity = lerp(1.45, 0.22, dusk);
  R.glow.material.color.set('#FFF6E6').lerp(new THREE.Color('#E9A86A'), dusk).multiplyScalar(lerp(1, 0.55, dusk));
  R.lampLight.intensity = lerp(0, 7, clamp((p - 0.55) / 0.3)); { const gl = R.globe || lampGlobe; if (gl) gl.emissiveIntensity = lerp(0.05, 2.4, clamp((p - 0.55) / 0.3)); } R.bulb.material.opacity = clamp((p - 0.55) / 0.2);
  R.wallMat.color.copy(wallDay).lerp(wallDusk, dusk * 0.6);
  R.r.toneMappingExposure = lerp(1, 1.15, dusk);
  const ci = p < 0.34 ? 0 : p < 0.67 ? 1 : 2;
  caps.forEach((c, i) => c.classList.toggle('on', reduced || i === ci));
  if (roomBar) roomBar.style.transform = `scaleX(${p})`;
  if (Math.abs(p - R.lastP) > 1e-4 || t - R.lastT > 0.3) { R.r.render(R.s, R.cam); R.lastP = p; R.lastT = t; }
}

/* ---------- dimensions ---------- */
const dim = $('#dim');
if (dim) { const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { dim.classList.add('in'); o.disconnect(); } }, { threshold: 0.35 }); o.observe(dim); }
const units = $('.units');
$$('.u').forEach((b) => b.addEventListener('click', () => {
  const inch = b.dataset.u === 'in';
  $$('.u').forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-checked', x === b); });
  units.classList.toggle('in', inch);
  $$('.dv').forEach((t) => {
    const cm = +t.dataset.cm, to = inch ? cm / 2.54 : cm, unit = inch ? 'in' : 'cm';
    if (reduced || !gsap) { t.textContent = (inch ? to.toFixed(1) : to) + ' ' + unit; return; }
    const o = { v: inch ? cm : cm / 2.54 };
    gsap.to(o, { v: to, duration: 0.9, ease: 'power3.out', onUpdate: () => (t.textContent = (inch ? o.v.toFixed(1) : Math.round(o.v)) + ' ' + unit) });
  });
}));

/* ---------- visit pills: concept only ---------- */
$$('.v-cta a').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); const n = $('#vNote'); n.textContent = a.dataset.msg; n.style.color = 'var(--c3)'; }));
$$('a[href^="#"]').forEach((a) => { if (a.closest('.v-cta')) return; a.addEventListener('click', (e) => {
  const id = a.getAttribute('href'), el = id.length > 1 && $(id); if (!el) return; e.preventDefault();
  if (window.__lenis) window.__lenis.scrollTo(el, { duration: 1.5 }); else el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
}); });
if (!coarse && !reduced && gsap) $$('.mag').forEach((el) => {
  const qx = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' }), qy = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
  el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); qx((e.clientX - r.left - r.width / 2) * 0.25); qy((e.clientY - r.top - r.height / 2) * 0.4); });
  el.addEventListener('pointerleave', () => { qx(0); qy(0); });
});

/* ---------- loop ---------- */
let last = performance.now(), t = 0;
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt;
  if (heroVis) {
    if (!dragging) { H.v *= Math.pow(0.05, dt); H.drag += H.v; }
    const idle = reduced ? 0 : Math.sin(t * 0.5) * 0.18;
    turn.rotation.y = H.yaw + H.drag + idle + H.spin + H.intro * 1.4;
    turn.position.y = Math.sin(H.lift * Math.PI) * 0.12 + H.intro * 0.6;
    const air = Math.sin(H.lift * Math.PI) * 0.6 + H.intro; hShadow.material.opacity = Math.max(0, 0.85 - air * 0.75); hWide.material.opacity = Math.max(0, 0.35 - air * 0.25); hShadow.position.y = 0.003 - turn.position.y;
    hr.render(hs, hcam);
  }
  roomTick(dt);
  requestAnimationFrame(frame);
}

/* ---------- boot ---------- */
['.m-head', '.m-grid', '.s-head', '.dim', '.v-h', '.v-p', '.v-cta'].forEach((s, i) => { const el = $(s); if (el) { el.setAttribute('data-rv', 'up'); el.setAttribute('data-rv-d', String(i % 3)); } });
reveals();
smooth();
function resize() { sizeHero(); sizeRoom(); }
resize(); addEventListener('resize', resize);
requestAnimationFrame(frame);
if (gsap && !reduced) {
  gsap.from('.hl1 .ln > span', { yPercent: 110, duration: 1.2, ease: 'expo.out', stagger: 0.1, delay: 0.1 });
  gsap.from(['.hero-l .eyebrow', '.lede', '.counter'], { y: 20, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08, delay: 0.35 });
  gsap.from('.bar', isM ? { y: 28, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.06, delay: 0.3 } : { yPercent: 60, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.07, delay: 0.25 });
}
