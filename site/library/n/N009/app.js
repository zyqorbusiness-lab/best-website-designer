/* N009 Glasskit Toggles - shared app for index.html (desktop) and m.html (phone).
   Signature: our liquid-glass kit (./kit, MIT, from skills/liquid-glass-ui) refracting a live three.js room fixed
   behind the page, plus a spring layer written here: segmented lenses and switch thumbs move on a damped spring
   (ratio ~0.73, one small overshoot) and stretch with their speed. The control centre changes the room and the glass. */
import { createStage, THREE, isM, reduced, damp, clamp } from '../../_kit/stage.js';
import { reveals } from '../../_kit/fx/index.js';

reveals();
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const css = getComputedStyle(document.documentElement);
const C = { c1: css.getPropertyValue('--c1').trim(), c2: css.getPropertyValue('--c2').trim(), c3: css.getPropertyValue('--c3').trim() };
const live = $('#live');
const LG = () => window.LiquidGlass;
const whenKit = new Promise((res) => { const t = () => (window.LiquidGlass ? res(window.LiquidGlass) : setTimeout(t, 30)); t(); });

/* the kit footer/credits sheet come from chrome.js; keep the big credits sheet frosted only (refraction on a sheet that size costs a lot) */
whenKit.then(() => { $$('.zk-sheet, .zk-foot .lg').forEach((n) => { n.dataset.lgRefract = 'off'; n.style.removeProperty('backdrop-filter'); }); });

/* ---------------- springs ---------------- */
const K = 620, DAMP = 36;                                   // zeta = 36 / (2 * sqrt(620)) = 0.72
const springs = new Set(); let raf = 0;
function spring(apply, x = 0) { const s = { x, v: 0, t: x, apply, set(t) { this.t = t; if (reduced) { this.x = t; this.v = 0; apply(this.x, 0); return; } springs.add(this); loop(); } }; apply(x, 0); return s; }
function loop() { if (!raf) raf = requestAnimationFrame(step); }
let lastT = performance.now();
function step(now) {
  raf = 0; const dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
  springs.forEach((s) => {
    const n = 4, h = dt / n;
    for (let i = 0; i < n; i++) { const a = -K * (s.x - s.t) - DAMP * s.v; s.v += a * h; s.x += s.v * h; }
    s.apply(s.x, s.v);
    if (Math.abs(s.x - s.t) < 0.0005 && Math.abs(s.v) < 0.005) { s.x = s.t; s.v = 0; s.apply(s.x, 0); springs.delete(s); }
  });
  if (springs.size) raf = requestAnimationFrame(step); else lastT = performance.now();
}
document.addEventListener('visibilitychange', () => { lastT = performance.now(); });

/* segmented lens: the kit moves it instantly (transform); we add a decaying offset with the independent `translate`
   property, so what you see is target + spring offset, and stretch it along x with its speed */
function springLens(g) {
  const lens = g.querySelector(':scope > .lg-lens'); if (!lens) return;
  const attr = g.getAttribute('role') === 'tablist' ? 'aria-selected' : 'aria-pressed';
  const active = () => [...g.querySelectorAll(':scope > button')].find((b) => b.getAttribute(attr) === 'true');
  let target = (active() || {}).offsetLeft || 0;
  const s = spring((x, v) => { lens.style.translate = `${x.toFixed(2)}px 0`; const st = Math.min(0.3, Math.abs(v) / 2600); lens.style.scale = `${(1 + st).toFixed(3)} ${(1 - st * 0.45).toFixed(3)}`; }, 0);
  g.addEventListener('lg:change', () => { const nt = (active() || {}).offsetLeft || 0; s.x = s.x + target - nt; target = nt; s.set(0); });
  new ResizeObserver(() => { target = (active() || {}).offsetLeft || 0; }).observe(g);
}
/* switch thumb: position k (0..1) on a spring, stretch from speed; width/clear-lens on press stays the kit's */
function springSwitch(sw) {
  const thumb = sw.querySelector('.lg-switch__thumb'); if (!thumb) return;
  const on = () => sw.getAttribute('aria-checked') === 'true';
  const s = spring((k, v) => { sw.style.setProperty('--k', k.toFixed(4)); sw.style.setProperty('--st', (1 + Math.min(0.32, Math.abs(v) / 26)).toFixed(3)); }, on() ? 1 : 0);
  new MutationObserver(() => s.set(on() ? 1 : 0)).observe(sw, { attributes: true, attributeFilter: ['aria-checked'] });
}
whenKit.then(() => { $$('.lg-seg, .lg-tabbar').forEach(springLens); $$('.lg-switch').forEach(springSwitch); document.body.classList.add('gk-springs'); });

/* ---------------- the room ---------------- */
const stageEl = $('[data-stage]');
const stage = await createStage({
  el: stageEl, demand: true, lazy: false, exposure: 1.0, envIntensity: 0.85,
  camera: { fov: isM ? 34 : 30, position: [0, 0, isM ? 13 : 11], target: [0, 0, 0] }, fitFov: true,
  label: 'A pale room with softly lit shapes in fog, petrol and rust, floating behind the page'
});
const { scene } = stage;
const sr = (h) => new THREE.Color(h).convertLinearToSRGB();
const col = (a, b, t) => { const x = sr(a), y = sr(b); return new THREE.Color().setRGB(x.r + (y.r - x.r) * t, x.g + (y.g - x.g) * t, x.b + (y.b - x.b) * t, THREE.SRGBColorSpace); };
const { RoundedBoxGeometry } = await import('three/addons/geometries/RoundedBoxGeometry.js');
const MAT = {
  fog: new THREE.MeshPhysicalMaterial({ color: col(C.c1, '#ffffff', 0.35), roughness: 0.62, clearcoat: 0, clearcoatRoughness: 0.12 }),
  fog2: new THREE.MeshPhysicalMaterial({ color: col(C.c1, C.c2, 0.18), roughness: 0.58, clearcoat: 0, clearcoatRoughness: 0.12 }),
  petrol: new THREE.MeshPhysicalMaterial({ color: col(C.c2, C.c1, 0.06), roughness: 0.42, clearcoat: 0, clearcoatRoughness: 0.1 }),
  petrol2: new THREE.MeshPhysicalMaterial({ color: col(C.c2, C.c1, 0.32), roughness: 0.48, clearcoat: 0, clearcoatRoughness: 0.1 }),
  rust: new THREE.MeshPhysicalMaterial({ color: new THREE.Color(C.c3), roughness: 0.46, clearcoat: 0, clearcoatRoughness: 0.1 })
};
const BASE_R = Object.fromEntries(Object.entries(MAT).map(([k, m]) => [k, m.roughness]));
/* composition: weight behind the control centre (right on desktop, lower half on phone), air behind the headline */
const D = isM
  ? [['torus', 'petrol', [1.15, -2.2, -1.2], 1.25], ['sphere', 'fog', [-1.6, -4.2, 0.4], 1.25], ['capsule', 'rust', [1.7, -4.6, 0.8], 0.62], ['box', 'petrol2', [-1.9, -3.1, -2.4], 1.0], ['sphere', 'petrol', [-0.2, -6.2, -0.8], 0.75], ['sphere', 'fog2', [1.9, 2.4, -3.2], 0.8], ['cyl', 'fog', [-2.1, 0.4, -1.6], 0.7], ['sphere', 'rust', [1.7, 3.3, -1.8], 0.26], ['box', 'fog2', [1.5, -7.2, -1.8], 0.9]]
  : [['torus', 'petrol', [3.05, 0.35, -1.0], 1.55], ['sphere', 'fog', [1.25, -2.2, 0.2], 1.25], ['capsule', 'rust', [4.7, -1.55, 0.8], 0.7], ['box', 'petrol2', [5.3, 2.0, -2.2], 1.25], ['sphere', 'petrol', [-1.2, -2.9, -1.0], 0.62], ['sphere', 'fog2', [-4.6, 2.5, -3.6], 0.9], ['cyl', 'fog', [6.1, -0.5, -2.8], 0.75], ['sphere', 'rust', [0.9, 2.5, -1.8], 0.26], ['box', 'fog2', [-3.9, -2.6, -2.4], 0.85]];
const roomG = new THREE.Group(); scene.add(roomG);
const shapes = [];
for (const [kind, mat, pos, s] of D) {
  const geo = kind === 'torus' ? new THREE.TorusGeometry(1, 0.36, 48, 128) : kind === 'sphere' ? new THREE.SphereGeometry(1, 64, 48) : kind === 'capsule' ? new THREE.CapsuleGeometry(0.62, 1.5, 16, 48)
    : kind === 'box' ? new RoundedBoxGeometry(1.5, 1.5, 1.5, 6, 0.32) : new THREE.CylinderGeometry(0.8, 0.8, 1.6, 64, 1);
  const m = new THREE.Mesh(geo, MAT[mat]); m.scale.setScalar(s); m.position.set(...pos);
  m.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
  m.userData = { base: new THREE.Vector3(...pos), ph: Math.random() * 6.28, spin: new THREE.Vector3((Math.random() - 0.5) * 0.25, (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.2) };
  roomG.add(m); shapes.push(m);
}
const key = new THREE.DirectionalLight(0xffffff, 1.6); const fill = new THREE.DirectionalLight(0xffffff, 0.35); fill.position.set(-4, -2, 3);
const rimL = new THREE.DirectionalLight(0xffffff, 0.6); rimL.position.set(-2, 3, -6);
scene.add(key, fill, rimL);
const LIGHT = {
  morning: { pos: [-6, 3, 5], col: col('#ffffff', C.c1, 0.25), i: 1.7, env: 0.9, bg: [col(C.c1, '#fff4e8', 0.5), col(C.c1, C.c3, 0.05)] },
  noon: { pos: [1, 7, 6], col: new THREE.Color('#ffffff'), i: 1.6, env: 1.0, bg: [col(C.c1, '#ffffff', 0.3), col(C.c1, C.c2, 0.06)] },
  dusk: { pos: [7, 0.6, 3], col: col(C.c3, '#ffd2b0', 0.55), i: 2.3, env: 0.55, bg: [col(C.c1, C.c3, 0.26), col(C.c1, C.c2, 0.3)] }
};
let light = 'noon', lightK = 1; const from = { pos: new THREE.Vector3(1, 7, 6), col: new THREE.Color('#ffffff'), i: 1.6, env: 1 };
function setLight(name) {
  from.pos.copy(key.position); from.col.copy(key.color); from.i = key.intensity; from.env = scene.environmentIntensity ?? 1; light = name; lightK = reduced ? 1 : 0;
  const L = LIGHT[name]; const bg = document.querySelector('.room-bg');
  bg.style.setProperty('--bg-a', '#' + new THREE.Color(L.bg[0]).getHexString()); bg.style.setProperty('--bg-b', typeof L.bg[1] === 'string' ? L.bg[1] : '#' + L.bg[1].getHexString());
  document.body.dataset.light = name; stage.invalidate();
}
key.position.set(...LIGHT.noon.pos);
let drift = !reduced, gloss = false, glossK = 0, depth = 0.45, depthS = 0.45;
setLight('noon');

/* scroll turns the room a little, so each section sees the shapes from a new side (and the glass has something new to bend) */
let scrollP = 0, roomP = 0;
const onScroll = () => { const max = Math.max(1, document.documentElement.scrollHeight - innerHeight); scrollP = clamp(scrollY / max); stage.invalidate(); };
addEventListener('scroll', onScroll, { passive: true }); onScroll();
stage.onFrame((dt, t) => {
  let busy = false;
  if (Math.abs(roomP - scrollP) > 0.0005) { roomP = reduced ? scrollP : damp(roomP, scrollP, 5, dt); busy = true; }
  roomG.rotation.y = -roomP * 0.9; roomG.rotation.x = roomP * 0.18; roomG.position.y = roomP * (isM ? 3.2 : 1.4);
  if (lightK < 1) { lightK = Math.min(1, lightK + dt / 0.9); const e = 1 - Math.pow(1 - lightK, 3), L = LIGHT[light];
    key.position.lerpVectors(from.pos, new THREE.Vector3(...L.pos), e); key.color.copy(from.col).lerp(L.col, e); key.intensity = from.i + (L.i - from.i) * e; scene.environmentIntensity = from.env + (L.env - from.env) * e; busy = true; }
  const gT = gloss ? 1 : 0; if (Math.abs(glossK - gT) > 0.002) { glossK = reduced ? gT : damp(glossK, gT, 6, dt); Object.entries(MAT).forEach(([k, m]) => { m.clearcoat = glossK; m.roughness = BASE_R[k] * (1 - glossK * 0.55); }); busy = true; }
  if (Math.abs(depthS - depth) > 0.0005) { depthS = reduced ? depth : damp(depthS, depth, 7, dt); busy = true; }
  const z = (depthS - 0.45) * 5.0;
  shapes.forEach((m, i) => {
    const u = m.userData, a = drift ? t : 0;
    m.position.set(u.base.x * (1 + (depthS - 0.45) * 0.18), u.base.y + (drift ? Math.sin(a * 0.5 + u.ph) * 0.22 : 0), u.base.z + z);
    if (drift) { m.rotation.x += u.spin.x * dt; m.rotation.y += u.spin.y * dt; m.rotation.z += u.spin.z * dt; }
  });
  return busy || drift;
});
stage.loaded();

/* ---------------- control centre ---------------- */
$('[data-ctl="light"]').addEventListener('lg:change', (e) => { const v = e.detail.value.toLowerCase(); setLight(v); live.textContent = `Light: ${e.detail.value}`; });
$('[data-ctl="drift"]').addEventListener('lg:change', (e) => { drift = e.detail.checked; $('#drift-state').textContent = drift ? 'On' : 'Off'; stage.invalidate(); });
$('[data-ctl="gloss"]').addEventListener('lg:change', (e) => { gloss = e.detail.checked; $('#gloss-state').textContent = gloss ? 'On' : 'Off'; stage.invalidate(); });
if (reduced) { const d = $('[data-ctl="drift"]'); d.setAttribute('aria-checked', 'false'); $('#drift-state').textContent = 'Off'; }
const DEPTH = ['Far', 'Far', 'Mid', 'Near', 'Near'];
$('[data-ctl="depth"]').addEventListener('input', (e) => { depth = e.target.value / 100; $('#depth-val').textContent = DEPTH[Math.min(4, Math.floor(depth * 5))]; stage.invalidate(); });
/* refraction strength: every glass surface on the page re-bends (quantised to 0.1 so the kit's filter cache stays small) */
let refrT = 0;
$('[data-ctl="refract"]').addEventListener('input', (e) => {
  const v = e.target.value / 10; $('#refr-val').textContent = v.toFixed(1) + '\u00d7';
  $$('.lg, .lg-lens').forEach((n) => { if (n.classList.contains('specimen') || n.closest('.zk-bar, .zk-foot, .zk-sheet')) return; n.dataset.lgStrength = String(v); });
  clearTimeout(refrT); refrT = setTimeout(() => LG() && LG().refresh(), 16);
});

/* ---------------- specimens ---------------- */
const vol = $('#vol'); if (vol) vol.addEventListener('input', () => { $('#vol-val').textContent = vol.value; });

/* ---------------- anatomy: switch off the five layers ---------------- */
const spec = $('.specimen');
function layers() {
  const on = Object.fromEntries($$('[data-layer]').map((b) => [b.dataset.layer, b.getAttribute('aria-checked') === 'true']));
  spec.dataset.lgRefract = on.refract ? 'on' : 'off'; spec.dataset.lgChroma = on.chroma ? 'on' : 'off';
  spec.classList.toggle('no-frost', !on.frost); spec.classList.toggle('no-spec', !on.spec); spec.classList.toggle('no-depth', !on.depth);
  if (!on.refract) spec.style.removeProperty('backdrop-filter');
  const n = Object.values(on).filter(Boolean).length; $('#layer-count').textContent = `${n} of 5 layers`;
  requestAnimationFrame(() => LG() && LG().refresh());
}
$$('[data-layer]').forEach((b) => b.addEventListener('lg:change', layers));
whenKit.then(() => { spec.dataset.lgRefract = 'on'; LG().refresh(); });

/* ---------------- install: copy ---------------- */
const copyBtn = $('[data-copy]'), copyL = $('.copy-l');
let copyT = 0;
copyBtn.addEventListener('click', async () => {
  const txt = $('#code').textContent;
  let ok = false;
  try { await navigator.clipboard.writeText(txt); ok = true; } catch (e) { const r = document.createRange(); r.selectNodeContents($('#code')); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
  copyL.textContent = ok ? 'Copied' : (isM ? 'Selected' : 'Press Ctrl+C'); copyBtn.classList.add('is-done'); live.textContent = ok ? 'Code copied' : 'Code selected';
  clearTimeout(copyT); copyT = setTimeout(() => { copyL.textContent = 'Copy'; copyBtn.classList.remove('is-done'); }, 1600);
});

/* ---------------- get the kit: honest form ---------------- */
const form = $('.get-form'), email = $('#g-email');
const okMail = () => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim());
const mark = () => { const ok = okMail(); email.closest('.field').classList.toggle('is-bad', !ok); email.setAttribute('aria-invalid', String(!ok)); return ok; };
email.addEventListener('blur', () => { if (email.value) mark(); });
email.addEventListener('input', () => { if (email.closest('.field').classList.contains('is-bad')) mark(); });
form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!mark()) { email.focus(); live.textContent = 'Please add a valid email address.'; return; }
  const btn = form.querySelector('.submit'); btn.disabled = true; btn.classList.add('is-busy');
  setTimeout(() => {
    const use = (form.querySelector('.use-seg [aria-pressed="true"]') || {}).textContent || 'Website';
    form.querySelector('.done-sum').textContent = `It would have signed up ${email.value.trim()} for release notes, for a ${use.toLowerCase()}. The kit itself is free in the Zyqor Studio repository.`;
    form.classList.add('is-done'); const d = form.querySelector('.done'); d.hidden = false; d.focus(); btn.disabled = false; btn.classList.remove('is-busy');
  }, reduced ? 200 : 900);
});
form.querySelector('[data-reset]').addEventListener('click', () => { form.reset(); form.classList.remove('is-done'); form.querySelector('.done').hidden = true; email.closest('.field').classList.remove('is-bad'); email.removeAttribute('aria-invalid'); email.focus(); });
