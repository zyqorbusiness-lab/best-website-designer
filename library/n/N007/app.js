/* N007 Brasswick Diya - one app for index.html (desktop) and m.html (phone, isM).
   Real asset: Poly Haven "Brass Diya Lantern" by Bhargav Kubal (CC0), the same 642 KB file on both builds.
   Signature: hover (desktop) or tap / the button (everywhere) lights the flame: emissive ramp + layered flicker noise, a warm point light
   inside the glass whose strength follows the flame, and the page turns from day linen to an olive evening.
   Hand-made details: (1) flicker from three noise speeds, light follows flame size, (2) drag/swipe/arrow keys swing it as a damped pendulum
   and the flame leans against the swing, (3) the ember glow behind it tracks the lantern's real screen position. */
import { createStage, THREE, isM, reduced, damp } from '../../_kit/stage.js';
import { reveals, press } from '../../_kit/fx/index.js';

const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const live = $('#live'), root = document.documentElement, body = document.body;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
press('[data-press]');

/* ---------------- light state (works without WebGL too: the page still turns to evening) ---------------- */
const S = { toggled: false, hover: false, lit: 0, target: 0 };
const btn = $('[data-action="light"]'), sFlame = $('#s-flame span'), sSwing = $('#s-swing'), sFinish = $('#s-finish');
let stage = null;
function setTarget() {
  const on = S.toggled || S.hover; S.target = on ? 1 : 0;
  body.classList.toggle('is-lit', on);
  sFlame.textContent = on ? 'Lit' : 'Out';
  btn.setAttribute('aria-pressed', String(S.toggled)); btn.querySelector('.lb-t').textContent = S.toggled ? 'Put it out' : 'Light the diya';
  if (stage) stage.invalidate(); else root.style.setProperty('--lit', on ? 1 : 0);
}
function toggle() { S.toggled = !S.toggled; live.textContent = S.toggled ? 'The diya is lit' : 'The diya is out'; setTarget(); }
btn.addEventListener('click', toggle);

/* ---------------- page UI ---------------- */
/* the evening layer runs from the page top to the end of the hero (header and the phone menu included) */
const heroEl = $('#lantern');
const sizeDusk = () => root.style.setProperty('--dusk-h', `${Math.round(heroEl.getBoundingClientRect().bottom + scrollY)}px`);
sizeDusk(); addEventListener('resize', sizeDusk, { passive: true }); document.fonts && document.fonts.ready.then(sizeDusk);
if ('ResizeObserver' in window) new ResizeObserver(sizeDusk).observe(document.body);
const menuBtn = $('.menu-btn'), menu = $('#menu');
if (menuBtn && menu) {
  const setMenu = (open) => { menuBtn.setAttribute('aria-expanded', String(open)); menu.hidden = !open; menuBtn.querySelector('span').textContent = open ? 'Close' : 'Menu'; if (open) menu.querySelector('a').focus(); };
  menuBtn.addEventListener('click', () => setMenu(menu.hidden));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); } });
}
const navLinks = $$('.nav a');
if (navLinks.length && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) navLinks.forEach((a) => a.classList.toggle('is-here', a.getAttribute('href') === '#' + en.target.id)); }), { rootMargin: '-45% 0px -50% 0px' });
  ['lantern', 'craft', 'care', 'reserve'].forEach((id) => { const s = document.getElementById(id); s && io.observe(s); });
}
/* quantity stepper */
let qty = 1; const qOut = $('#qty'), qBtns = $$('.qty button');
const setQty = (n) => { qty = Math.max(1, Math.min(6, n)); qOut.textContent = qty; qBtns[0].disabled = qty <= 1; qBtns[1].disabled = qty >= 6; };
qBtns.forEach((b) => b.addEventListener('click', () => setQty(qty + +b.dataset.q))); setQty(1);
/* reservation form: validate, loading, honest success */
const form = $('.form');
{
  const fields = [['r-name', 'e-name', (v) => v.trim().length > 1], ['r-mail', 'e-mail', (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())]];
  const okBox = form.querySelector('input[name=ok]'), eOk = $('#e-ok'), submit = form.querySelector('.submit'), done = form.querySelector('.done');
  const check = (id, eid, fn, show) => { const el = document.getElementById(id), good = fn(el.value); if (show || el.getAttribute('aria-invalid')) { el.setAttribute('aria-invalid', String(!good)); document.getElementById(eid).hidden = good; } return good; };
  fields.forEach(([id, eid, fn]) => document.getElementById(id).addEventListener('input', () => check(id, eid, fn, false)));
  okBox.addEventListener('change', () => { if (okBox.checked) eOk.hidden = true; });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const res = fields.map(([id, eid, fn]) => check(id, eid, fn, true)); const okv = okBox.checked; eOk.hidden = okv;
    if (res.includes(false) || !okv) { const first = res.indexOf(false); (first >= 0 ? document.getElementById(fields[first][0]) : okBox).focus(); live.textContent = 'Check the highlighted fields'; return; }
    submit.setAttribute('aria-busy', 'true'); submit.querySelector('.b-label').textContent = 'Reserving';
    setTimeout(() => { submit.removeAttribute('aria-busy'); submit.querySelector('.b-label').textContent = 'Reserve a lantern'; done.hidden = false; done.querySelector('button').focus(); live.textContent = 'Concept, not sent. Nothing left this page.'; }, reduced ? 0 : 700);
  });
  form.querySelector('[data-action=reset]').addEventListener('click', () => { form.reset(); setQty(1); setFinish('aged'); done.hidden = true; form.querySelectorAll('[aria-invalid]').forEach((x) => x.removeAttribute('aria-invalid')); form.querySelector('input[type=text]').focus(); });
}
/* finish radios (also drive the 3D brass) */
let brassMats = [], finishT = { rough: 1, bright: 1 }, finishCur = { rough: 1, bright: 1 };
function setFinish(v) {
  finishT = v === 'polished' ? { rough: 0.38, bright: 1.22 } : { rough: 1, bright: 1 };
  sFinish.textContent = v === 'polished' ? 'Polished brass' : 'Aged brass'; if (stage) stage.invalidate();
}
$$('input[name=finish]').forEach((r) => r.addEventListener('change', () => { setFinish(r.value); live.textContent = `Finish: ${r.value} brass`; }));
reveals();

/* ---------------- the lantern ---------------- */
const stageEl = $('[data-stage]');
stage = await createStage({
  el: stageEl, exposure: 1.0, envIntensity: 1.0, fitFov: true,
  camera: { fov: isM ? 30 : 28, position: isM ? [0, 1.0, 5.9] : [0.3, 1.15, 5.8], target: isM ? [0, 1.0, 0] : [0.3, 1.2, 0] },
  label: 'Brasswick Diya: a brass diya lantern with glass panes hanging on a chain. Press Enter to light it, arrow keys to swing it.'
});
const S_ = 9;                                            // model metres -> scene units (0.381 m tall with chain -> 3.43)
const TOP = 0.381 * S_;                                  // pivot: the top of the chain
const pivot = new THREE.Group(); pivot.position.y = TOP; stage.add(pivot);
let flame = null, flameMat = null, glassMats = [];
const flameC = new THREE.Vector3();
const lamp = new THREE.PointLight(0xffa25a, 0, 3.2, 1.6);
try {
  const g = await stage.load(stage.asset('models/brass_diya_lantern.glb'));
  const m = g.scene; m.scale.setScalar(S_); m.position.y = -TOP; pivot.add(m);
  m.traverse((o) => {
    if (!o.isMesh) return; const n = (o.material.name || '').toLowerCase();
    if (n.includes('flame')) { flame = o; flameMat = o.material; }
    else if (n.includes('glass')) { const gm = o.material; glassMats.push(gm); gm.transparent = true; gm.color.set(0xffffff); gm.opacity = 0.07; gm.roughness = 0.03; gm.metalness = 0; gm.envMapIntensity = 0.9; gm.side = THREE.FrontSide; gm.depthWrite = false; o.renderOrder = 2; }   // clear glass: mostly reflection, the flame shows through
    else { brassMats.push(o.material); o.material.userData.r0 = o.material.roughness; o.material.userData.c0 = o.material.color.clone(); o.material.envMapIntensity = 1.15; }
  });
  if (flame) {
    flame.geometry.computeBoundingBox(); flame.geometry.boundingBox.getCenter(flameC);
    const base = flameC.clone(); base.y = flame.geometry.boundingBox.min.y;            // scale the flame from its base, like a real one
    flame.geometry.translate(-base.x, -base.y, -base.z); flame.position.add(base);
    flameMat.emissive = new THREE.Color(0xffb46a); flameMat.toneMapped = false; flameMat.depthWrite = false; flameMat.transparent = true;
    flameMat.color.set(0x000000);   // the flame card adds light only
    // additive colour, and no alpha written: on a transparent canvas a written alpha shows as a dark card behind the flame
    flameMat.blending = THREE.CustomBlending; flameMat.blendEquation = THREE.AddEquation; flameMat.blendSrc = THREE.SrcAlphaFactor; flameMat.blendDst = THREE.OneFactor; flameMat.blendSrcAlpha = THREE.ZeroFactor; flameMat.blendDstAlpha = THREE.OneFactor;
    flame.scale.setScalar(0.001); flame.visible = false;
    flame.updateWorldMatrix(true, false);
    lamp.position.copy(flame.position).add(new THREE.Vector3(0, (flameC.y - base.y) * 1.2, 0));
    flame.parent.add(lamp);
  }
} catch (e) { stageEl.classList.add('is-fallback'); }
const fill = new THREE.DirectionalLight(0xfff4e8, 0.9); fill.position.set(-2.5, 3.5, 4); stage.add(fill);
const fillBase = fill.intensity;

/* pendulum: theta (rad) around z, damped; drag / swipe / keys push it */
const P = { a: 0, v: 0, drag: false, L: TOP - 0.7, lean: 0 };
let px = 0, py = 0, pid = null, decided = false, moved = 0, lastX = 0, lastT = 0, a0 = 0;
stageEl.dataset.drag = '';
const canvas = stage.renderer ? stage.renderer.domElement : stageEl.querySelector('canvas');
if (canvas) { canvas.tabIndex = 0; }
stageEl.addEventListener('pointerdown', (e) => { if (e.button > 0) return; pid = e.pointerId; px = lastX = e.clientX; py = e.clientY; lastT = performance.now(); moved = 0; decided = e.pointerType === 'mouse'; a0 = P.a; if (decided) { stageEl.setPointerCapture(pid); P.drag = true; } stage.invalidate(); });
stageEl.addEventListener('pointermove', (e) => {
  if (e.pointerId !== pid) return; const dx = e.clientX - px, dy = e.clientY - py; moved = Math.max(moved, Math.abs(dx) + Math.abs(dy));
  if (!decided) { if (Math.abs(dx) + Math.abs(dy) < 8) return; decided = true; if (Math.abs(dy) > Math.abs(dx)) { pid = null; return; } stageEl.setPointerCapture(pid); P.drag = true; }
  if (!P.drag) return;
  const w = stageEl.clientWidth, na = Math.max(-maxA(), Math.min(maxA(), a0 - (dx / w) * 0.9));   // about 14 degrees at most: it stays inside the stage
  const now = performance.now(); P.v = (na - P.a) / Math.max(0.008, (now - lastT) / 1000); P.a = na; lastT = now; lastX = e.clientX;
  stageEl.classList.add('has-swung'); stage.invalidate();
});
const up = (e) => {
  if (e.pointerId !== pid) return; pid = null; const wasDrag = P.drag; P.drag = false;
  if (performance.now() - lastT > 90) P.v *= 0.3; P.v = Math.max(-maxV(), Math.min(maxV(), P.v));
  if (moved < 8) toggle();                               // a tap or click lights / puts it out
  else if (wasDrag) live.textContent = 'The lantern swings';
  stage.invalidate();
};
stageEl.addEventListener('pointerup', up); stageEl.addEventListener('pointercancel', (e) => { if (e.pointerId === pid) { pid = null; P.drag = false; } });
if (fine) {
  stageEl.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { S.hover = true; setTarget(); } });
  stageEl.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') { S.hover = false; setTarget(); } });
}
canvas && canvas.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); P.v = Math.max(-maxV(), Math.min(maxV(), P.v + (e.key === 'ArrowLeft' ? 0.3 : -0.3))); stageEl.classList.add('has-swung'); stage.invalidate(); }
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
});

/* noise: smooth 1D value noise, three speeds layered */
const hash = (n) => { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); };
const vnoise = (x) => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return hash(i) * (1 - u) + hash(i + 1) * u; };
const flick = (t) => (vnoise(t * 2.1) * 0.5 + vnoise(t * 5.3 + 11) * 0.3 + vnoise(t * 13.7 + 37) * 0.2) - 0.5;

// swing range: about 14 degrees on a wide stage, 7 on a phone, so the lantern never leaves the frame
const narrow = () => stageEl.clientWidth < 700, maxA = () => (narrow() ? 0.12 : 0.24), maxV = () => (narrow() ? 0.38 : 0.75);
const tmp = new THREE.Vector3(), glowEl = $('.hero .glow'); let t = 0, lastSwing = '';
stage.onFrame((dt) => {
  t += dt; let busy = false;
  /* light ramp */
  S.lit = reduced ? S.target : damp(S.lit, S.target, S.target > S.lit ? 3.2 : 2.4, dt);
  if (Math.abs(S.lit - S.target) > 0.002) busy = true;
  root.style.setProperty('--lit', S.lit.toFixed(3));
  const f = reduced ? 0 : flick(t), lit = S.lit;
  if (flame) {
    flame.visible = lit > 0.01;
    const h = lit * (1 + f * 0.35), wdt = lit * (1 - f * 0.12);
    flame.scale.set(wdt, Math.max(0.001, h), wdt);
    P.lean = damp(P.lean, Math.max(-0.5, Math.min(0.5, P.v * 0.32)), 8, dt);
    flame.rotation.z = P.lean + (reduced ? 0 : vnoise(t * 3.1 + 5) - 0.5) * 0.08 * lit;
    flameMat.emissiveIntensity = lit * (3.2 + f * 1.6); flameMat.opacity = Math.min(1, lit * 1.4);
    lamp.intensity = lit * (2.6 + f * 1.4) * (isM ? 1 : 1);
  }
  stage.scene.environmentIntensity = 1.0 - lit * 0.72;
  fill.intensity = fillBase * (1 - lit * 0.75);
  glassMats.forEach((m) => { m.emissive && m.emissive.setRGB(1, 0.62, 0.32); m.emissiveIntensity = lit * 0.18 * (1 + f * 0.5); });
  if (lit > 0.01 && !reduced) busy = true;               // a lit flame keeps the loop running; out and still, the loop sleeps
  /* finish */
  finishCur.rough = damp(finishCur.rough, finishT.rough, 6, dt); finishCur.bright = damp(finishCur.bright, finishT.bright, 6, dt);
  if (Math.abs(finishCur.rough - finishT.rough) > 0.002) busy = true;
  brassMats.forEach((m) => { m.roughness = m.userData.r0 * finishCur.rough; m.color.copy(m.userData.c0).multiplyScalar(finishCur.bright); });
  /* pendulum */
  if (!P.drag) {
    const g = 9.8, acc = -(g / P.L) * Math.sin(P.a) - 0.42 * P.v;
    P.v += acc * dt; P.a += P.v * dt;
    if (Math.abs(P.a) > 0.0006 || Math.abs(P.v) > 0.0006) busy = true; else { P.a = 0; P.v = 0; }
  } else busy = true;
  pivot.rotation.z = P.a; pivot.rotation.x = P.a * 0.12;
  const deg = `${(P.a * 57.3).toFixed(1)}\u00b0`; if (deg !== lastSwing) { sSwing.textContent = deg.replace('-0.0', '0.0'); lastSwing = deg; }
  /* glow follows the flame on screen */
  if (flame && lit > 0.01) {
    flame.getWorldPosition(tmp); tmp.project(stage.camera);
    const sr = stageEl.getBoundingClientRect(), gr = glowEl.getBoundingClientRect();
    glowEl.style.setProperty('--gx', `${(sr.left + (tmp.x + 1) / 2 * sr.width - gr.left).toFixed(0)}px`); glowEl.style.setProperty('--gy', `${(sr.top + (1 - tmp.y) / 2 * sr.height - gr.top).toFixed(0)}px`);
  }
  return busy;
});
stage.loaded();
/* review hook (used by the QA probe to photograph states): push the lantern, light it */
window.__diya = { view: (x, y, z, tx, ty, tz, fov) => { const c = stage.camera; c.position.set(x, y, z); c.fov = fov; c.updateProjectionMatrix(); c.lookAt(tx, ty, tz); stage.onFrame(() => { c.lookAt(tx, ty, tz); return false; }); stage.invalidate(); }, push: (v) => { P.v = Math.max(-maxV(), Math.min(maxV(), P.v + v)); stageEl.classList.add('has-swung'); stage.invalidate(); }, light: () => { if (!S.toggled) toggle(); } };
