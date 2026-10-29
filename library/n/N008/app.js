/* N008 Northpine Cabins - shared app for index.html (desktop) and m.html (phone).
   Signature: one three.js clearing rendered twice per frame with scissor, deep winter left of the divider and high summer
   right of it. Snow is a shader on every material (it settles on faces that point up), so the season line cuts through
   the roof, the pines, the scanned stump and the fire pit on one vertical line. The page layers (background and the
   headline) are clipped by the same divider, so type changes colour exactly where the season does.
   Real assets: Wooden Cabin (donnichols) and Pine Tree (evolveduk), CC BY 4.0, Sketchfab; Poly Haven CC0: Dark Planks, Grey Roof 01, Snow 02 textures; Stone Fire Pit, Tree Stump 01, Wooden Axe scans.
   Same files on phone and desktop. */
import { createStage, THREE, isM, reduced, damp, clamp } from '../../_kit/stage.js';
import { reveals, press } from '../../_kit/fx/index.js';

reveals(); press('[data-press]');
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const css = getComputedStyle(document.documentElement);
const C = { c1: css.getPropertyValue('--c1').trim(), c2: css.getPropertyValue('--c2').trim(), c3: css.getPropertyValue('--c3').trim() };
/* mix two palette colours in sRGB (a perceptual mix; a linear-light lerp washes every tint out towards the light colour) */
const srgb = (h) => { const c = new THREE.Color(h); return c.convertLinearToSRGB(); };
const col = (a, b, t) => { const x = srgb(a), y = srgb(b); return new THREE.Color().setRGB(x.r + (y.r - x.r) * t, x.g + (y.g - x.g) * t, x.b + (y.b - x.b) * t, THREE.SRGBColorSpace); };
const hero = $('.hero'), stageEl = $('[data-stage]'), grip = $('.grip'), live = $('#live');

/* ---------- the winter copy of the ink layer (same words, light on dark, clipped by the divider) ---------- */
const inkS = $('.ink--summer');
const inkW = inkS.cloneNode(true);
inkW.classList.replace('ink--summer', 'ink--winter'); inkW.setAttribute('aria-hidden', 'true'); inkW.setAttribute('inert', '');
inkW.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
inkW.querySelectorAll('dialog').forEach((n) => n.remove());
inkW.querySelectorAll('[data-rv]').forEach((n) => n.classList.add('rv-in'));
inkS.after(inkW);
/* the clone must reveal together with the original */
new MutationObserver(() => { $$('[data-rv]', inkS).forEach((n, i) => { const w = $$('[data-rv]', inkW)[i]; if (w) w.classList.toggle('rv-pre', !n.classList.contains('rv-in')); }); })
  .observe(inkS, { subtree: true, attributes: true, attributeFilter: ['class'] });
$$('[data-rv]', inkW).forEach((n) => n.classList.add('rv-pre'));

/* ---------- divider state: p = share of the width that is winter (0..1) ---------- */
let p = 0.5, pT = 0.5, tween = null, dragging = false;
const W = () => hero.clientWidth;
function applyDivider() {
  const x = p * W();
  hero.style.setProperty('--x', x.toFixed(1) + 'px');
  hero.style.setProperty('--gx', (clamp(x, 34, W() - 34) - x).toFixed(1) + 'px');   // the grip stays fully on screen at the ends
  const v = Math.round(p * 100);
  if (grip.getAttribute('aria-valuenow') !== String(v)) {
    grip.setAttribute('aria-valuenow', v);
    grip.setAttribute('aria-valuetext', v >= 99 ? 'All winter' : v <= 1 ? 'All summer' : `${v}% winter, ${100 - v}% summer`);
    $$('.seg button').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.p === (v >= 99 ? 1 : v <= 1 ? 0 : (v === 50 ? 0.5 : -1)))));
  }
}
const ease = (t) => (t < 0.5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2);   // in-out-quart
function goTo(v, dur = 0.7) {
  v = clamp(v);
  if (reduced || dur === 0) { tween = null; p = pT = v; applyDivider(); kick(); if (typeof syncSeason === 'function') syncSeason(); return; }
  tween = { from: p, to: v, t: 0, dur }; pT = v; kick();
}
let kick = () => {};

/* ---------- pointer: drag the grip, or press anywhere on the stage and drag ---------- */
let pid = null, sx = 0, sy = 0, decided = false;
function toP(clientX) { const r = hero.getBoundingClientRect(); return clamp((clientX - r.left) / r.width); }
function down(e) {
  if (e.button > 0 || e.target.closest('button:not(.grip), a, dialog, input, select, textarea')) return;
  pid = e.pointerId; sx = e.clientX; sy = e.clientY;
  decided = e.pointerType === 'mouse' || e.target === grip || grip.contains(e.target);
  if (decided) start(e);
}
function start(e) {
  dragging = true; tween = null; hero.classList.add('is-dragging'); hero.classList.add('has-moved');
  try { hero.setPointerCapture(pid); } catch {}
  pT = toP(e.clientX); kick();
}
function move(e) {
  if (e.pointerId !== pid) return;
  if (!decided) {
    const dx = Math.abs(e.clientX - sx), dy = Math.abs(e.clientY - sy);
    if (dx + dy < 7) return; decided = true;
    if (dx > dy) start(e); else { pid = null; return; }
  }
  if (dragging) { pT = toP(e.clientX); kick(); }
}
function up(e) { if (e.pointerId !== pid) return; pid = null; if (dragging) { dragging = false; hero.classList.remove('is-dragging'); live.textContent = grip.getAttribute('aria-valuetext'); syncSeason(); } }
hero.addEventListener('pointerdown', down);
hero.addEventListener('pointermove', move);
hero.addEventListener('pointerup', up); hero.addEventListener('pointercancel', up);
grip.addEventListener('keydown', (e) => {
  const step = { ArrowLeft: -0.05, ArrowDown: -0.05, ArrowRight: 0.05, ArrowUp: 0.05, PageDown: -0.25, PageUp: 0.25 }[e.key];
  if (step !== undefined) { e.preventDefault(); hero.classList.add('has-moved'); goTo(pT + step, 0.32); }
  else if (e.key === 'Home') { e.preventDefault(); goTo(0); } else if (e.key === 'End') { e.preventDefault(); goTo(1); }
});
$$('[data-p]').forEach((b) => b.addEventListener('click', () => {
  hero.classList.add('has-moved');
  const v = +b.dataset.p;
  if (b.closest('.seasons')) { hero.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); }
  goTo(v); live.textContent = v === 1 ? 'Deep winter' : v === 0 ? 'High summer' : 'Half and half';
}));
/* ---------- phone menu ---------- */
const menu = $('#menu');
if (menu) {
  $$('[data-open-menu]').forEach((b) => b.addEventListener('click', () => menu.showModal()));
  $$('[data-close-menu]', menu).forEach((b) => b.addEventListener('click', () => menu.close()));
  menu.addEventListener('click', (e) => { if (e.target === menu) menu.close(); });
}

/* ---------- enquiry form: real validation, honest success state, nothing is sent ---------- */
const form = $('.enquiry');
const today = new Date(); const iso = (d) => d.toISOString().slice(0, 10);
const dateIn = $('#f-date'); dateIn.min = iso(today);
const inSeason = (v, s) => { if (!v) return false; const m = new Date(v + 'T12:00:00').getMonth() + 1; return s === 'winter' ? (m === 12 || m <= 3) : s === 'summer' ? (m >= 6 && m <= 8) : true; };
function check(field) {
  const el = form.elements[field]; let ok = true;
  const season = (form.querySelector('input[name=season]:checked') || {}).value;
  if (field === 'name') ok = el.value.trim().length > 1;
  if (field === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(el.value.trim());
  if (field === 'season') ok = !!season;
  if (field === 'arrival') ok = !!el.value && el.value >= el.min && (!season || inSeason(el.value, season));
  const wrap = field === 'season' ? form.querySelector('.season-pick') : el.closest('.field');
  wrap.classList.toggle('is-bad', !ok);
  if (field !== 'season') el.setAttribute('aria-invalid', String(!ok));
  return ok;
}
['name', 'email', 'arrival'].forEach((f) => form.elements[f].addEventListener('blur', () => { if (form.elements[f].value) check(f); }));
['name', 'email', 'arrival'].forEach((f) => form.elements[f].addEventListener('input', () => { if (form.elements[f].closest('.field').classList.contains('is-bad')) check(f); }));
form.querySelectorAll('input[name=season]').forEach((r) => r.addEventListener('change', () => { check('season'); if (dateIn.value) check('arrival'); goTo(r.value === 'winter' ? 1 : 0); }));
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const order = ['name', 'email', 'season', 'arrival'];
  const bad = order.filter((f) => !check(f));
  if (bad.length) { const f = bad[0]; (f === 'season' ? form.querySelector('input[name=season]') : form.elements[f]).focus(); live.textContent = 'Please check the highlighted fields.'; return; }
  const btn = form.querySelector('.submit'); btn.disabled = true; btn.classList.add('is-busy');
  setTimeout(() => {
    const s = form.querySelector('input[name=season]:checked').value, d = new Date(dateIn.value + 'T12:00:00');
    form.querySelector('.done-sum').textContent = `Your enquiry would have asked for ${s} from ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}, ${form.elements.guests.value} ${form.elements.guests.value === '1' ? 'guest' : 'guests'}.`;
    form.classList.add('is-done'); const done = form.querySelector('.done'); done.hidden = false; done.focus();
    btn.disabled = false; btn.classList.remove('is-busy');
  }, reduced ? 200 : 900);
});
form.querySelector('[data-reset]').addEventListener('click', () => {
  form.reset(); form.classList.remove('is-done'); form.querySelector('.done').hidden = true;
  form.querySelectorAll('.is-bad').forEach((n) => n.classList.remove('is-bad')); form.querySelectorAll('[aria-invalid]').forEach((n) => n.removeAttribute('aria-invalid'));
  form.elements.name.focus();
});
/* the season radio follows the divider until the visitor picks one (hand-made detail) */
let pickedByHand = false;
form.querySelectorAll('input[name=season]').forEach((r) => { r.addEventListener('pointerdown', () => { pickedByHand = true; }); r.addEventListener('keydown', () => { pickedByHand = true; }); });
function syncSeason() { if (pickedByHand || form.classList.contains('is-done')) return; const want = p > 0.5 ? 'winter' : p < 0.5 ? 'summer' : null; form.querySelectorAll('input[name=season]').forEach((r) => { r.checked = r.value === want; }); }
applyDivider();
addEventListener('resize', applyDivider);

/* ---------- the stage ---------- */
const stage = await createStage({
  el: stageEl, demand: true, shadows: true, exposure: 1.0, envIntensity: 0.8,
  camera: { fov: isM ? 30 : 24, position: isM ? [0, 5.2, 13.6] : [0, 4.9, 15.4], target: isM ? [0, 1.25, 0] : [0, 1.55, 0] },
  fitFov: true,
  label: 'Northpine Cabins: a small 3D clearing with a cabin, pines, a fire pit and a pond. Left of the divider it is deep winter, right of it high summer.'
});
const { scene, renderer, camera } = stage;
kick = () => stage.invalidate();

/* ---------- snow: one shader patch for every standard material ---------- */
const U = { snow: { value: 0 }, snowCol: { value: new THREE.Color('#F7F3EE') }, iceCol: { value: col('#DCE6E8', C.c1, 0.15) } };
function snowify(m, o = {}) {
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uSnow = U.snow; sh.uniforms.uSnowCol = U.snowCol; sh.uniforms.uIceCol = U.iceCol;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWN; varying vec3 vWP;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvWN = normalize(mat3(modelMatrix) * objectNormal); vWP = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>
uniform float uSnow; uniform vec3 uSnowCol; uniform vec3 uIceCol; varying vec3 vWN; varying vec3 vWP;
float nh(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(nh(i), nh(i + vec2(1, 0)), f.x), mix(nh(i + vec2(0, 1)), nh(i + vec2(1, 1)), f.x), f.y); }`)
      .replace('#include <metalnessmap_fragment>', `#include <metalnessmap_fragment>
float nz = vn(vWP.xz * 7.0) * 0.6 + vn(vWP.xz * 23.0 + 3.1) * 0.4;
float sn = uSnow * smoothstep(${(o.lo ?? 0.18).toFixed(2)} + 0.22 * nz, ${(o.hi ?? 0.62).toFixed(2)}, normalize(vWN).y);
${o.ice ? 'diffuseColor.rgb = mix(diffuseColor.rgb, uIceCol, uSnow); roughnessFactor = mix(roughnessFactor, 0.32, uSnow);' : `diffuseColor.rgb = mix(diffuseColor.rgb, uSnowCol * (0.94 + 0.06 * nz), sn); roughnessFactor = mix(roughnessFactor, 0.86, sn); metalnessFactor = mix(metalnessFactor, 0.0, sn);`}`);
  };
  m.customProgramCacheKey = () => 'snow' + (o.ice ? 'i' : '') + (o.lo ?? '') + (o.hi ?? '');
  return m;
}
const std = (o, s) => snowify(new THREE.MeshStandardMaterial(o), s);
const castAll = (g, cast = true, recv = true) => g.traverse((n) => { if (n.isMesh) { n.castShadow = cast; n.receiveShadow = recv; } });

/* ---------- textures (real, CC0) ---------- */
const tx = (p, o) => stage.loadTexture(stage.asset('tex/' + p), o).catch(() => null);
const snowN = await tx('snow_02_nor_512.webp', { srgb: false, repeat: [3, 3] });

/* ---------- the island ---------- */
const world = new THREE.Group(); scene.add(world);
const R = 2.35, H = 0.42;
function noisyDisc(r, n = 96, amp = 0.09, seed = 3) {
  const s = new THREE.Shape();
  for (let i = 0; i <= n; i++) { const a = (i / n) * Math.PI * 2; const rr = r + Math.sin(a * 3 + seed) * amp + Math.sin(a * 7 + seed * 2) * amp * 0.45 + Math.sin(a * 13) * amp * 0.2; const x = Math.cos(a) * rr, y = Math.sin(a) * rr; i ? s.lineTo(x, y) : s.moveTo(x, y); }
  return s;
}
function soilTexture() {                                 // the cut face of the clearing: turf, dark loam, a stone band, clay
  const c = document.createElement('canvas'); c.width = 64; c.height = 256; const g = c.getContext('2d');
  const bands = [[0, 0.09, col(C.c2, '#5f7f4c', 0.4)], [0.09, 0.45, col(C.c2, C.c3, 0.28)], [0.45, 0.6, col(C.c2, C.c1, 0.3)], [0.6, 1, col(C.c3, C.c2, 0.62)]];
  bands.forEach(([a, b, k]) => { g.fillStyle = '#' + k.getHexString(); g.fillRect(0, a * 256, 64, (b - a) * 256); });
  for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(${Math.random() < 0.5 ? '255,240,225' : '10,30,20'},${0.05 + Math.random() * 0.08})`; g.fillRect(Math.random() * 64, Math.random() * 256, 1 + Math.random() * 3, 1 + Math.random() * 2); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; return t;
}
/* top (grass, takes the snow) + a cut soil face + a bottom cap (so the contact shadow sees the island from below) */
const RIM = noisyDisc(R).getPoints(160);
const topGeo = new THREE.ShapeGeometry(new THREE.Shape(RIM), 1).rotateX(-Math.PI / 2); topGeo.translate(0, H, 0);
const botGeo = new THREE.ShapeGeometry(new THREE.Shape(RIM), 1).rotateX(Math.PI / 2);
function sideGeo(pts, h) {                                // a vertical strip around the outline: u = distance round the rim, v = depth
  const n = pts.length, pos = [], nor = [], uv = [], idx = []; let run = 0;
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % n], pr = pts[(i - 1 + n) % n];
    const tx = b.x - pr.x, ty = b.y - pr.y, l = Math.hypot(tx, ty) || 1;
    if (i) run += Math.hypot(a.x - pr.x, a.y - pr.y);
    // the shape's y becomes -z after rotateX(-90deg) on the top cap, so mirror it here too
    pos.push(a.x, h, -a.y, a.x, 0, -a.y); nor.push(ty / l, 0, tx / l, ty / l, 0, tx / l); uv.push(run * 0.8, 0, run * 0.8, 1);
  }
  for (let i = 0; i < n; i++) { const j = (i + 1) % n, a0 = i * 2, b0 = j * 2; idx.push(a0, a0 + 1, b0, b0, a0 + 1, b0 + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); return g;
}
const grass = std({ color: col(C.c2, '#5f7f4c', 0.55), roughness: 0.95, normalMap: snowN, normalScale: new THREE.Vector2(0.3, 0.3) }, { lo: 0.0, hi: 0.3 });
const soilTex = soilTexture(); soilTex.wrapT = THREE.ClampToEdgeWrapping;
const soil = new THREE.MeshStandardMaterial({ map: soilTex, roughness: 1, side: THREE.DoubleSide });
const topM = new THREE.Mesh(topGeo, grass); topM.receiveShadow = true;
const side = new THREE.Mesh(sideGeo(RIM, H), soil); side.receiveShadow = true;
const bot = new THREE.Mesh(botGeo, soil);
world.add(topM, side, bot);
/* in winter a soft lip of snow hangs over the cut edge */
const lip = new THREE.Mesh(sideGeo(RIM.map((v) => v.clone().multiplyScalar(1.004)), 0.05), snowify(new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.9, side: THREE.DoubleSide }), { lo: -2, hi: -1 }));
lip.position.y = H - 0.035; lip.userData.winterOnly = true; world.add(lip);
const TOP = H;

/* pond (open water in summer, white ice in winter) with a ring of stones */
const pond = new THREE.Mesh(new THREE.ShapeGeometry(noisyDisc(0.5, 48, 0.05, 1.3)).rotateX(-Math.PI / 2), std({ color: col(C.c2, '#2a5560', 0.4), roughness: 0.06, metalness: 0.0, envMapIntensity: 1.4 }, { ice: true }));
pond.position.set(1.18, TOP + 0.004, 0.72); pond.receiveShadow = true; world.add(pond);
const stoneMat = std({ color: col(C.c2, C.c1, 0.55), roughness: 0.85, flatShading: true }, { lo: 0.1, hi: 0.5 });
function rock(r, seed) {
  const g = new THREE.IcosahedronGeometry(r, 1); const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const v = new THREE.Vector3().fromBufferAttribute(p, i); const k = 1 + Math.sin(v.x * 9 + seed) * 0.12 + Math.cos(v.z * 11 + seed * 2) * 0.12; v.multiplyScalar(k); v.y *= 0.62; p.setXYZ(i, v.x, v.y, v.z); }
  g.computeVertexNormals(); const m = new THREE.Mesh(g, stoneMat); m.castShadow = m.receiveShadow = true; return m;
}
for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; const rr = 0.52 + Math.sin(i * 2.3) * 0.04; const s = rock(0.045 + (i % 3) * 0.015, i); s.position.set(1.18 + Math.cos(a) * rr * 1.02, TOP + 0.01, 0.72 + Math.sin(a) * rr * 0.98); s.rotation.y = i; world.add(s); }
[[-1.75, 0.55, 0.16], [1.9, -0.5, 0.2], [-0.6, -1.7, 0.14], [0.25, 1.55, 0.09]].forEach(([x, z, r], i) => { const s = rock(r, i * 5 + 2); s.position.set(x, TOP + r * 0.25, z); s.rotation.y = i * 1.7; world.add(s); });

/* ---------- the cabin: real CC-BY model ("Wooden Cabin" by donnichols, Sketchfab), snow by the shader ---------- */
const cabin = new THREE.Group(); cabin.position.set(-0.28, TOP, -0.28); cabin.rotation.y = 0.18; world.add(cabin);
const [cabG, pineG] = await Promise.all([stage.load(stage.asset('models/wooden_cabin.glb')), stage.load(stage.asset('models/pine_tree.glb'))]);
{
  const o = cabG.scene; o.updateMatrixWorld(true);
  const bb = new THREE.Box3().setFromObject(o), sz = bb.getSize(new THREE.Vector3()), ctr = bb.getCenter(new THREE.Vector3());
  const k = 1.62 / Math.max(sz.x, sz.z);
  o.scale.multiplyScalar(k); o.position.set(-ctr.x * k, -bb.min.y * k, -ctr.z * k);
  o.traverse((n) => { if (n.isMesh) { n.castShadow = n.receiveShadow = true; snowify(n.material, { lo: 0.55, hi: 0.92 }); n.material.needsUpdate = true; } });
  cabin.add(o);
}
const cabTop = new THREE.Box3().setFromObject(cabin).max.y - TOP;
/* smoke anchor near the roof ridge (the model has no chimney, so the stove pipe smoke rises from the ridge, back half) */
const chimCap = new THREE.Object3D(); chimCap.position.set(0.32, cabTop - 0.06, -0.2); cabin.add(chimCap);
/* warm window light in winter: the model's glazing is baked into its texture, so the glow is a light (glow) plus this material slot */
const glassMat = new THREE.MeshStandardMaterial({ color: col(C.c2, '#000000', 0.2), emissive: new THREE.Color(C.c3), emissiveIntensity: 0 });
const wins = [];
/* ---------- pines: real CC-BY model ("Pine Tree" by evolveduk, Sketchfab), one geometry instanced by clone ---------- */
{
  const o = pineG.scene; o.updateMatrixWorld(true);
  const bb = new THREE.Box3().setFromObject(o);
  o.traverse((n) => { if (n.isMesh) { n.castShadow = n.receiveShadow = true; const m = n.material;
    if (m.color) m.color.copy(col('#ffffff', C.c2, 0.18)); snowify(m, m.alphaTest > 0 || m.transparent ? { lo: 0.38, hi: 0.78 } : { lo: 0.5, hi: 0.9 }); m.needsUpdate = true; } });
  var pineProto = o, pineH = bb.max.y - bb.min.y;
}
function pine(h) { const t = pineProto.clone(true); t.scale.setScalar(h * 1.15 / pineH); return t; }
const PINES = [[-1.75, -1.05, 1.35], [-1.25, -1.6, 1.7], [-0.55, -1.95, 1.25], [0.45, -1.85, 1.55], [1.15, -1.45, 1.15], [1.7, -0.95, 1.45], [-2.0, -0.2, 0.95], [2.05, 0.15, 0.85], [0.85, -2.0, 0.8], [-1.6, 1.05, 0.7]];
PINES.forEach(([x, z, h], i) => { const t = pine(h); t.position.set(x, TOP, z); t.rotation.y = i * 1.3; world.add(t); });

/* ---------- lights: one sun (one shadow direction), its colour and strength change per season ---------- */
const sun = new THREE.DirectionalLight(0xffffff, 2); sun.position.set(-3.2, 5.6, 3.4); sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: 1, far: 14 }); sun.shadow.bias = -0.0008; sun.shadow.normalBias = 0.02; sun.shadow.radius = 4;
const hemi = new THREE.HemisphereLight(0xffffff, 0x000000, 0.5);
const glow = new THREE.PointLight(new THREE.Color(C.c3), 0, 2.2, 1.6); glow.position.set(-0.28 + 0.02, TOP + 0.55, 0.62);
scene.add(sun, hemi, glow);
const SEASON = {
  winter: { snow: 1, sun: col('#cfdcf2', C.c1, 0.12), sunI: 1.5, hemiSky: col('#c7d4e0', C.c1, 0.2), hemiGround: col(C.c2, '#000', 0.2), hemiI: 0.55, env: 0.55, win: 2.4, glow: 1.6 },
  summer: { snow: 0, sun: col('#fff0dc', C.c1, 0.3), sunI: 2.7, hemiSky: col(C.c1, '#ffffff', 0.3), hemiGround: col(C.c2, C.c1, 0.3), hemiI: 0.6, env: 0.95, win: 0, glow: 0 }
};
function season(s) {
  const S = SEASON[s]; U.snow.value = S.snow; sun.color.copy(S.sun); sun.intensity = S.sunI;
  hemi.color.copy(S.hemiSky); hemi.groundColor.copy(S.hemiGround); hemi.intensity = S.hemiI; scene.environmentIntensity = S.env;
  glassMat.emissiveIntensity = S.win; glow.intensity = S.glow; flakes.visible = smoke.visible = lip.visible = s === 'winter';
}

/* ---------- winter life: a few falling flakes and chimney smoke (winter pass only) ---------- */
function dotTex() { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.45, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
const dot = dotTex();
const NF = 420, fpos = new Float32Array(NF * 3), fsp = new Float32Array(NF);
for (let i = 0; i < NF; i++) { const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 3.6; fpos.set([Math.cos(a) * r, Math.random() * 4.2, Math.sin(a) * r], i * 3); fsp[i] = 0.25 + Math.random() * 0.35; }
const fGeo = new THREE.BufferGeometry(); fGeo.setAttribute('position', new THREE.BufferAttribute(fpos, 3));
const flakes = new THREE.Points(fGeo, new THREE.PointsMaterial({ map: dot, size: isM ? 0.06 : 0.05, transparent: true, depthWrite: false, color: 0xffffff, opacity: 0.9 }));
scene.add(flakes);
const smoke = new THREE.Group(); scene.add(smoke);
const chimTop = new THREE.Vector3(); chimCap.getWorldPosition(chimTop);
const puffs = Array.from({ length: 7 }, (_, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: dot, color: col(C.c1, '#ffffff', 0.4), transparent: true, depthWrite: false, opacity: 0 })); s.userData.o = i / 7; smoke.add(s); return s; });

/* ---------- the real scanned props (CC0): stone fire pit, tree stump with an axe in it ---------- */
async function prop(file, size, x, z, ry = 0, extra) {
  try {
    const g = await stage.load(stage.asset('models/' + file)); const o = g.scene; stage.fit(o, size, true);
    o.traverse((n) => { if (n.isMesh) { n.castShadow = n.receiveShadow = true; snowify(n.material, { lo: 0.25, hi: 0.7 }); n.material.needsUpdate = true; } });
    const holder = new THREE.Group(); holder.add(o); holder.position.set(x, TOP, z); holder.rotation.y = ry; world.add(holder); extra && extra(holder, o); return holder;
  } catch (e) { return null; }
}
const propsReady = Promise.all([
  prop('stone_fire_pit.glb', 0.42, -0.95, 1.22, 0.4),
  prop('tree_stump_01.glb', 0.34, 0.28, 1.5, 1.1, async (h, o) => {
    const b = new THREE.Box3().setFromObject(o);
    try { const g = await stage.load(stage.asset('models/wooden_axe.glb')); const ax = g.scene; stage.fit(ax, 0.36, false);
      ax.traverse((n) => { if (n.isMesh) { n.castShadow = true; snowify(n.material, { lo: 0.3, hi: 0.75 }); n.material.needsUpdate = true; } });
      const a = new THREE.Group(); a.add(ax); a.position.set(0.02, b.max.y + 0.06, 0); a.rotation.set(0, 0, -0.5); h.add(a); a.userData.axe = true;
    } catch (e) {}
  })
]).then(() => { renderer.shadowMap.needsUpdate = true; stage.invalidate(); });

/* ---------- split render: winter left of the divider, summer right ---------- */
renderer.shadowMap.autoUpdate = false; renderer.shadowMap.needsUpdate = true;
const rawRender = renderer.render.bind(renderer);
renderer.render = (sc, cam) => {
  if (sc !== scene || cam !== camera || renderer.getRenderTarget() !== null) return rawRender(sc, cam);
  const w = stage.size.w, h = stage.size.h, xs = Math.round(clamp(p) * w);
  renderer.setScissorTest(true);
  if (xs > 0) { season('winter'); renderer.setScissor(0, 0, xs, h); renderer.setViewport(0, 0, w, h); rawRender(sc, cam); }
  if (xs < w) { season('summer'); renderer.setScissor(xs, 0, w - xs, h); renderer.setViewport(0, 0, w, h); rawRender(sc, cam); }
  renderer.setScissorTest(false);
};
stage.contactShadow({ size: 6.4, opacity: 0.38, blur: 3.2, darkness: 1.2, height: 1.6, y: -0.05, exclude: [flakes, smoke] });

/* ---------- frame loop ---------- */
let introT = reduced ? 9 : -0.6;
stage.onFrame((dt, t) => {
  let busy = false;
  if (tween) { tween.t += dt / tween.dur; const k = Math.min(1, tween.t); p = tween.from + (tween.to - tween.from) * ease(k); if (k >= 1) { tween = null; p = pT; syncSeason(); } busy = true; }
  else if (dragging || Math.abs(p - pT) > 0.0004) { p = damp(p, pT, 18, dt); busy = true; }
  else if (introT < 1.6 && !hero.classList.contains('has-moved')) { introT += dt; if (introT > 0) { const k = Math.min(1, introT / 1.6); p = 0.5 + Math.sin(k * Math.PI * 2) * 0.06 * (1 - k * 0.2) * (k < 1 ? 1 : 0); pT = p; } busy = true; }
  applyDivider();
  if (p > 0.004 && !reduced) {          // winter is on screen: snow falls, smoke drifts
    for (let i = 0; i < NF; i++) { let y = fpos[i * 3 + 1] - fsp[i] * dt; if (y < TOP) y += 4.2; fpos[i * 3 + 1] = y; fpos[i * 3] += Math.sin(t * 0.7 + i) * 0.0012; }
    fGeo.attributes.position.needsUpdate = true;
    puffs.forEach((s) => { const k = (t * 0.16 + s.userData.o) % 1; s.position.set(chimTop.x + k * 0.35 + Math.sin(k * 6 + s.userData.o * 9) * 0.05, chimTop.y + 0.05 + k * 0.95, chimTop.z - k * 0.12); const sc = 0.12 + k * 0.42; s.scale.set(sc, sc, sc); s.material.opacity = Math.sin(k * Math.PI) * 0.26; });
    busy = true;
  }
  return busy;
});
chimCap.getWorldPosition(chimTop);
if (reduced) { puffs.forEach((s, i) => { const k = i / 7; s.position.set(chimTop.x + k * 0.3, chimTop.y + 0.05 + k * 0.9, chimTop.z); s.scale.setScalar(0.12 + k * 0.4); s.material.opacity = Math.sin(k * Math.PI) * 0.35; }); }
await propsReady;
stage.loaded();
hero.classList.add('is-live');
