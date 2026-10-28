/* N006 Quarry Type Foundry - one app for index.html (desktop) and m.html (phone, isM).
   Signature: a magnet over variable type (Roboto Flex: wght / wdth / GRAD per letter, each letter on its own damping clock),
   plus a stone Q extruded from the font's own outlines at five weights (glyphs.js), faced with Poly Haven "Marble Rock 02" (CC0).
   Hand-made details: (1) in Weight mode width pays for weight so each line keeps its length, (2) letters relax in a ripple,
   (3) recasting the Q sinks it to a sliver and cuts it again; on desktop it leans toward the cursor. */
import { createStage, THREE, isM, reduced, damp } from '../../_kit/stage.js';
import { reveals, press } from '../../_kit/fx/index.js';
import { Q } from './glyphs.js';

const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const leanT = { x: 0, y: 0 };            // the Q's lean target (set by the pointer before the stage may exist)
let stage = null;
const live = $('#live');
press('[data-press]');

/* ---------------- the type field ---------------- */
const REST = { w: 150, d: 100, g: 0 };
const MODES = {
  weight: (t) => ({ w: 150 + 700 * t, d: 100 - 65 * t, g: 0 }),      // measured: (150,100) -> (850,35) keeps 1.05x advance
  width: (t) => ({ w: 150 + 120 * t, d: 100 - 75 * t, g: 0 }),       // squeeze: letters pull in toward the magnet
  grade: (t) => ({ w: 150 + 60 * t, d: 100, g: 150 * t + 0 }),       // grade: darker strokes, no change in width
};
let mode = 'weight';
const letters = [];
$$('[data-field]').forEach((field) => {
  $$('.ln', field).forEach((ln) => {
    const text = ln.textContent; ln.textContent = ''; ln.setAttribute('aria-hidden', 'true');
    [...text].forEach((c) => {
      const s = document.createElement('span'); s.className = c === ' ' ? 'ch sp' : 'ch'; s.textContent = c === ' ' ? '\u00a0' : c; ln.append(s);
      if (c !== ' ') letters.push({ el: s, c, field, x: 0, y: 0, cur: { ...REST }, k: 0, last: '' });
    });
  });
});
letters.forEach((L, i) => { L.k = 4.2 + ((i * 7) % 5) * 0.9; });     // release clocks: each letter relaxes at its own pace

function measure() {
  const sx = scrollX, sy = scrollY;
  letters.forEach((L) => { const r = L.el.getBoundingClientRect(); L.x = r.left + r.width / 2 + sx; L.y = r.top + r.height / 2 + sy; L.h = r.height; });
}
document.fonts.ready.then(() => { measure(); kick(); });
addEventListener('resize', () => { measure(); kick(); }, { passive: true });
measure();

/* the magnet: page coordinates + strength */
const M = { x: -1e4, y: -1e4, s: 0, target: 0, src: null };
const ring = $('.magnet');
function radius(L) { return (L.h || 100) * (isM ? 1.15 : 1.35); }
function setMagnet(cx, cy, src) { M.x = cx + scrollX; M.y = cy + scrollY; M.src = src; M.target = 1; kick(); }
function dropMagnet() { M.target = 0; kick(); }

if (fine) {
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' || sweeping) return;
    const over = e.target.closest && e.target.closest('[data-field]');
    if (over) setMagnet(e.clientX, e.clientY, 'mouse'); else if (M.src === 'mouse') dropMagnet();
    ring.style.transform = `translate3d(${e.clientX}px,${e.clientY}px,0)`; ring.classList.toggle('on', !!over);
    tilt(e);
  }, { passive: true });
  document.addEventListener('pointerleave', () => { if (!sweeping) { dropMagnet(); ring.classList.remove('on'); } });
}
/* touch: tap drops the magnet; a sideways drag carries it (vertical drags still scroll, field is touch-action: pan-y) */
let touchTimer = 0;
$$('[data-field]').forEach((field) => {
  field.addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse' || sweeping) return; clearTimeout(touchTimer); setMagnet(e.clientX, e.clientY, 'touch'); showRing(e.clientX, e.clientY); });
  field.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse' || sweeping || M.src !== 'touch') return; setMagnet(e.clientX, e.clientY, 'touch'); showRing(e.clientX, e.clientY); });
  const up = (e) => { if (e.pointerType === 'mouse' || M.src !== 'touch') return; clearTimeout(touchTimer); touchTimer = setTimeout(() => { if (M.src === 'touch') { dropMagnet(); ring.classList.remove('on'); } }, 1400); };
  field.addEventListener('pointerup', up); field.addEventListener('pointercancel', up);
});
addEventListener('scroll', () => { if (M.src === 'touch' || M.src === 'sweep') return; if (M.src === 'mouse') { dropMagnet(); ring.classList.remove('on'); } }, { passive: true });
function showRing(cx, cy) { ring.style.transform = `translate3d(${cx}px,${cy}px,0)`; ring.classList.add('on'); }

/* mode radios */
const chips = $$('.axis .chip');
function setMode(m) {
  mode = m; chips.forEach((c) => c.setAttribute('aria-checked', String(c.dataset.mode === m)));
  live.textContent = `Magnet pulls ${m}`; kick();
}
chips.forEach((c) => c.addEventListener('click', () => setMode(c.dataset.mode)));
$('.axis').addEventListener('keydown', (e) => {
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return; e.preventDefault();
  const i = chips.findIndex((c) => c.dataset.mode === mode), n = chips[(i + (e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 1) + chips.length) % chips.length];
  n.focus(); setMode(n.dataset.mode);
});

/* the loop: only runs while something is changing */
const roCh = $('#ro-ch'), roV = $('#ro-v');
let raf = 0, last = 0;
function kick() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }
function frame(now) {
  raf = 0; const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now;   // rAF time can trail performance.now()
  if (sweeping) stepSweep(dt);
  M.s = reduced ? M.target : damp(M.s, M.target, M.target > M.s ? 14 : 5, dt);
  let busy = Math.abs(M.s - M.target) > 0.002 || sweeping, best = null, bestT = 0;
  const fn = MODES[mode];
  for (const L of letters) {
    const dist = Math.hypot(M.x - L.x, M.y - L.y), R = radius(L);
    let t = dist < R ? 1 - dist / R : 0; t = t * t * (3 - 2 * t) * M.s;
    if (t > bestT) { bestT = t; best = L; }
    const tg = t > 0 ? fn(t) : REST;
    const attack = (tg.w > L.cur.w + 0.5 || tg.g > L.cur.g + 0.5 || Math.abs(tg.d - L.cur.d) > 0.5) && t > 0;
    const k = attack ? 18 : L.k;
    for (const a of ['w', 'd', 'g']) { L.cur[a] = reduced ? tg[a] : damp(L.cur[a], tg[a], k, dt); if (Math.abs(L.cur[a] - tg[a]) > 0.4) busy = true; }
    const v = `"wght" ${L.cur.w.toFixed(0)}, "wdth" ${L.cur.d.toFixed(1)}, "GRAD" ${L.cur.g.toFixed(0)}, "opsz" 144`;
    if (v !== L.last) { L.el.style.fontVariationSettings = v; L.last = v; }
  }
  if (best && bestT > 0.05) { roCh.textContent = best.c; roV.textContent = `wght ${best.cur.w.toFixed(0)} \u00b7 wdth ${best.cur.d.toFixed(0)} \u00b7 GRAD ${best.cur.g.toFixed(0)}`; }
  if (busy) kick();
}

/* "Pass the magnet": sweeps every line of the hero field, left to right, top to bottom */
const sweepBtn = $('[data-action="sweep"]'), heroField = $('.hero [data-field]');
let sweeping = false, sw = null;
function startSweep() {
  if (sweeping) return; measure();
  const lines = $$('.ln', heroField).map((ln) => { const ls = letters.filter((L) => ln.contains(L.el)); return ls.length ? { x0: ls[0].x - 20, x1: ls[ls.length - 1].x + 20, y: ls[0].y } : null; }).filter(Boolean);
  if (!lines.length) return;
  sw = { lines, t: 0, per: reduced ? 0 : 1.05 };
  sweeping = true; sweepBtn.setAttribute('aria-busy', 'true'); M.src = 'sweep'; M.target = 1; live.textContent = 'The magnet passes over the type'; kick();
}
function stepSweep(dt) {
  if (!sw.per) { endSweep(); return; }
  sw.t += dt / sw.per; const i = Math.min(sw.lines.length - 1, Math.floor(sw.t)), f = Math.min(1, sw.t - i), ln = sw.lines[i];
  const e = f < 0.5 ? 4 * f * f * f : 1 - Math.pow(-2 * f + 2, 3) / 2;           // in-out cubic per line
  M.x = ln.x0 + (ln.x1 - ln.x0) * e; M.y = ln.y;
  ring.style.transform = `translate3d(${M.x - scrollX}px,${M.y - scrollY}px,0)`; ring.classList.add('on');
  if (sw.t >= sw.lines.length) endSweep();
}
function endSweep() { sweeping = false; sweepBtn.removeAttribute('aria-busy'); M.target = 0; M.src = null; ring.classList.remove('on'); kick(); }
sweepBtn.addEventListener('click', startSweep);
/* one pass on arrival so the first screen shows what it does (never with reduced motion) */
if (!reduced) {
  const io = new IntersectionObserver((en) => { if (en[0].isIntersecting) { io.disconnect(); setTimeout(() => { if (scrollY < innerHeight * 0.5) startSweep(); }, 900); } }, { threshold: 0.6 });
  io.observe(heroField);
}


/* ---------------- page UI (works with or without WebGL) ---------------- */
/* phone menu */
const menuBtn = $('.menu-btn'), menu = $('#menu');
if (menuBtn && menu) {
  const setMenu = (open) => { menuBtn.setAttribute('aria-expanded', String(open)); menu.hidden = !open; menuBtn.querySelector('span').textContent = open ? 'Close' : 'Menu'; if (open) menu.querySelector('a').focus(); };
  menuBtn.addEventListener('click', () => setMenu(menu.hidden));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); } });
}
/* nav: mark the section in view */
const navLinks = $$('.nav a');
if (navLinks.length && 'IntersectionObserver' in window) {
  const io2 = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) navLinks.forEach((a) => a.classList.toggle('is-here', a.getAttribute('href') === '#' + en.target.id)); }), { rootMargin: '-45% 0px -50% 0px' });
  ['specimen', 'weights', 'axes', 'licence'].forEach((id) => { const s = document.getElementById(id); s && io2.observe(s); });
}
/* trial licence form: validates, shows a loading state, then an honest "Concept, not sent" (nothing leaves the page) */
const form = $('.form');
if (form) {
  const fields = [['f-name', 'e-name', (v) => v.trim().length > 1], ['f-mail', 'e-mail', (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())]];
  const okBox = form.querySelector('input[name=ok]'), eOk = $('#e-ok'), submit = form.querySelector('.submit'), done = form.querySelector('.done');
  const check = (id, eid, fn, show) => { const el = document.getElementById(id), good = fn(el.value); if (show || el.getAttribute('aria-invalid')) { el.setAttribute('aria-invalid', String(!good)); document.getElementById(eid).hidden = good; } return good; };
  fields.forEach(([id, eid, fn]) => document.getElementById(id).addEventListener('input', () => check(id, eid, fn, false)));
  okBox.addEventListener('change', () => { if (okBox.checked) eOk.hidden = true; });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const res = fields.map(([id, eid, fn]) => check(id, eid, fn, true)); const okv = okBox.checked; eOk.hidden = okv;
    if (res.includes(false) || !okv) { const first = res.indexOf(false); (first >= 0 ? document.getElementById(fields[first][0]) : okBox).focus(); live.textContent = 'Check the highlighted fields'; return; }
    submit.setAttribute('aria-busy', 'true'); submit.querySelector('.b-label').textContent = 'Checking';
    setTimeout(() => { submit.removeAttribute('aria-busy'); submit.querySelector('.b-label').textContent = 'Request a trial licence'; done.hidden = false; done.querySelector('button').focus(); live.textContent = 'Concept, not sent. Nothing left this page.'; }, reduced ? 0 : 700);
  });
  form.querySelector('[data-action=reset]').addEventListener('click', () => { form.reset(); done.hidden = true; form.querySelectorAll('[aria-invalid]').forEach((x) => x.removeAttribute('aria-invalid')); form.querySelector('input').focus(); });
}

reveals();

/* ---------------- the stone Q ---------------- */
const stageEl = $('[data-stage]');
stage = await createStage({
  el: stageEl, exposure: 1.0, envIntensity: 0.85, fitFov: true,
  camera: { fov: isM ? 26 : 24, position: isM ? [0, 1.1, 6.5] : [0, 1.2, 7.1], target: [0, 1.0, 0] },
  label: 'Quarry Type Foundry: a capital Q cut in stone. Drag sideways or use the arrow keys to turn it.'
});

/* tiny SVG path reader for the fontTools outlines (M L H V Q C Z, absolute) */
function shapesFrom(d) {
  const sp = new THREE.ShapePath(); const tk = d.match(/[MLHVQCZ]|-?\d*\.?\d+(?:e-?\d+)?/gi); let i = 0, cx = 0, cy = 0, cmd = '';
  const n = () => parseFloat(tk[i++]);
  while (i < tk.length) {
    if (/[A-Z]/i.test(tk[i])) cmd = tk[i++];
    if (cmd === 'M') { cx = n(); cy = n(); sp.moveTo(cx, cy); cmd = 'L'; }
    else if (cmd === 'L') { cx = n(); cy = n(); sp.lineTo(cx, cy); }
    else if (cmd === 'H') { cx = n(); sp.lineTo(cx, cy); }
    else if (cmd === 'V') { cy = n(); sp.lineTo(cx, cy); }
    else if (cmd === 'Q') { const a = n(), b = n(); cx = n(); cy = n(); sp.quadraticCurveTo(a, b, cx, cy); }
    else if (cmd === 'C') { const a = n(), b = n(), c = n(), e = n(); cx = n(); cy = n(); sp.bezierCurveTo(a, b, c, e, cx, cy); }
    else if (cmd === 'Z') { sp.currentPath && sp.currentPath.closePath && sp.currentPath.closePath(); cmd = ''; }
    else i++;
  }
  return sp.toShapes(true);   // outer ring + tail solid, the counter a hole (checked in node: 2 shapes, 1 hole)
}
const UNIT = 1.95 / 1700;                        // font units -> scene (cap + tail about 1.95 tall)
const geoCache = {};
function glyphGeo(w) {
  if (geoCache[w]) return geoCache[w];
  const g = Q[w], [x0, y0, x1, y1] = g.b;
  const geo = new THREE.ExtrudeGeometry(shapesFrom(g.d), { depth: 190, bevelEnabled: true, bevelThickness: 26, bevelSize: 15, bevelSegments: 5, curveSegments: isM ? 12 : 14 });
  geo.translate(-(x0 + x1) / 2, -y0 + 26, -95); geo.scale(UNIT, UNIT, UNIT); geo.computeVertexNormals();
  return (geoCache[w] = geo);
}
const tl = new THREE.TextureLoader();
const tex = (f, srgb) => new Promise((res) => tl.load(f, (t) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / 1500, 1 / 1500); t.anisotropy = 8; if (srgb) t.colorSpace = THREE.SRGBColorSpace; res(t); }, undefined, () => res(null)));
const [map, nrm, rgh] = await Promise.all([tex('stone_diff_1k.webp', true), tex('stone_nor_1k.webp'), tex('stone_rough_1k.webp')]);
const stone = new THREE.MeshStandardMaterial({ map, normalMap: nrm, roughnessMap: rgh, roughness: 1, metalness: 0, color: new THREE.Color('#f4ece6'), normalScale: new THREE.Vector2(1.1, 1.1) });
const spinner = new THREE.Group(), lean = new THREE.Group(); spinner.add(lean); stage.add(spinner);
const glyph = new THREE.Mesh(glyphGeo(400), stone); lean.add(glyph);
const key = new THREE.DirectionalLight(0xfff1e6, 2.1); key.position.set(-3.4, 4.2, 3.2);   // raking key: the chisel marks and the bevel catch it
const rim = new THREE.DirectionalLight(0xe6ecff, 0.8); rim.position.set(3.2, 2.2, -3.5);
stage.add(key, rim);
const shadow = stage.contactShadow({ size: 3.6, opacity: 0.42, blur: 3.2, darkness: 1.3, height: 1.4, update: 2 });
spinner.rotation.y = -0.38;
const st = stage.spin(spinner, { friction: 0.93, sensitivity: isM ? 0.012 : 0.009, auto: 0, maxVelocity: 0.4, onStart: () => stageEl.classList.add('has-turned') });

/* lean toward the cursor (desktop, fine pointer), like it feels the magnet */
function tilt(e) { if (reduced || !stage) return; leanT.y = (e.clientX / innerWidth - 0.5) * 0.5; leanT.x = (e.clientY / innerHeight - 0.5) * 0.22; stage.invalidate(); }
/* recast: sink to a sliver, swap the outline, rise again (520 ms expo-out) */
let cast = { phase: 0, t: 1, next: 400 };
function recast(w) {
  if (reduced) { glyph.geometry = glyphGeo(w); stage.invalidate(); shadow && shadow.draw(); return; }
  cast = { phase: 1, t: 0, next: w }; st.kick(0.07); stage.invalidate();
}
stage.onFrame((dt) => {
  let busy = false;
  lean.rotation.y = damp(lean.rotation.y, leanT.y, 6, dt); lean.rotation.x = damp(lean.rotation.x, leanT.x, 6, dt);
  if (Math.abs(lean.rotation.y - leanT.y) > 0.001 || Math.abs(lean.rotation.x - leanT.x) > 0.001) busy = true;
  if (cast.phase === 1) { cast.t = Math.min(1, cast.t + dt / 0.22); const e = cast.t * cast.t * cast.t; glyph.scale.set(1 - 0.06 * e, 1 - 0.04 * e, 1 - 0.95 * e); if (cast.t >= 1) { glyph.geometry = glyphGeo(cast.next); cast = { phase: 2, t: 0, next: cast.next }; } busy = true; }
  else if (cast.phase === 2) { cast.t = Math.min(1, cast.t + dt / 0.52); const e = 1 - Math.pow(2, -10 * cast.t); glyph.scale.set(0.94 + 0.06 * e, 0.96 + 0.04 * e, 0.05 + 0.95 * e); if (cast.t >= 1) { glyph.scale.set(1, 1, 1); cast.phase = 0; } busy = true; }
  return busy;
});
stage.loaded();

/* weight pickers: the ledger rows (desktop) and the "Cut at" radios under the Q both recast it */
const NAMES = { 100: 'Thin', 300: 'Light', 400: 'Regular', 700: 'Bold', 1000: 'Black' };
const cutBtns = $$('.cut button'), rowBtns = $$('button.row');
let curW = 400;
function choose(w) {
  if (w === curW) return; curW = w;
  cutBtns.forEach((x) => x.setAttribute('aria-checked', String(+x.dataset.w === w)));
  rowBtns.forEach((x) => x.setAttribute('aria-pressed', String(+x.dataset.w === w)));
  $('#q-w').textContent = w; $('#q-n').textContent = NAMES[w]; live.textContent = `The Q is cut again at ${w}, ${NAMES[w]}`; recast(w);
}
rowBtns.forEach((b) => b.addEventListener('click', () => choose(+b.dataset.w)));
cutBtns.forEach((b) => b.addEventListener('click', () => choose(+b.dataset.w)));
$('.cut').addEventListener('keydown', (e) => {
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return; e.preventDefault();
  const i = cutBtns.findIndex((x) => +x.dataset.w === curW), n = cutBtns[(i + (e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 1) + cutBtns.length) % cutBtns.length];
  n.focus(); choose(+n.dataset.w);
});
