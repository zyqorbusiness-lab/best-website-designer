/* N010 Rootline Citrus - one app for index.html (desktop) and m.html (phone).
   Phone = PC: the same three GLB files, the same HDRI, the same roll, flood and cross-section. Only layout differs. */
import { createStage, THREE, isM, reduced } from '../../_kit/stage.js';
import { reveals, splitAll, press } from '../../_kit/fx/index.js';

const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
splitAll(); reveals(); press('[data-press]');
const live = $('#live');
const say = (t) => { if (live) live.textContent = t; };

/* ---------- the three fruits (copy is plain and general; no invented numbers) ---------- */
const FRUIT = {
  lemon:    { name: 'Lemon',    latin: 'Citrus limon',          paper: '#EEE7B4', file: 'models/lemon.glb',    size: 1.46, rough: 1.3, segs: 9,  seeds: 5,
              peel: 'Thick, oily, bright', taste: 'Sharp, clean acid', season: 'Winter into spring', segText: '8 to 10',
              line: 'The loud one. Zest it before you squeeze it; the oil in the peel carries most of the smell.',
              uses: ['Dressings and curd', 'A squeeze over grilled fish', 'Zest in shortbread'] },
  lime:     { name: 'Lime',     latin: 'Citrus × latifolia',    paper: '#E2E8C5', file: 'models/lime.glb',     size: 1.22, segs: 10, seeds: 0,
              peel: 'Thin, glossy, deep green', taste: 'Sour, floral, quick', season: 'High summer', segText: 'About 10',
              line: 'Seedless and thin skinned. Roll it under your palm before cutting and it gives up twice as easily.',
              uses: ['Tacos and ceviche', 'Cocktails and soda', 'Green curry'] },
  mandarin: { name: 'Mandarin', latin: 'Citrus reticulata',     paper: '#F0DCC2', file: 'models/mandarin.glb', size: 1.26, segs: 11, seeds: 0,
              peel: 'Loose, zips off by hand', taste: 'Sweet, low acid', season: 'Late autumn to winter', segText: '10 to 12',
              line: 'The easy one. The peel lifts away in one piece and the segments come apart without a knife.',
              uses: ['Lunch boxes', 'Winter salads', 'Eaten whole, standing up'] }
};
const ORDER = ['lemon', 'lime', 'mandarin'];
let current = 'lime';

/* ---------- colour flood: the new paper opens as a circle from the fruit ---------- */
const root = document.documentElement;
const flood = document.createElement('div'); flood.className = 'flood'; flood.setAttribute('aria-hidden', 'true'); document.body.prepend(flood);
root.style.setProperty('--floor', FRUIT[current].paper);
function setPaper(hex, origin) {
  const meta = $('meta[name=theme-color]'); if (meta) meta.content = hex;
  if (reduced || !origin) { root.style.setProperty('--c1', hex); root.style.setProperty('--floor', hex); return; }
  flood.style.background = hex;
  flood.style.setProperty('--fx', origin.x + 'px'); flood.style.setProperty('--fy', origin.y + 'px');
  flood.classList.remove('is-on'); void flood.offsetWidth; flood.classList.add('is-on');
  root.style.setProperty('--c1', hex);              /* tints, hairlines and tags follow over the same 700 ms (@property) */
  clearTimeout(setPaper.t);
  setPaper.t = setTimeout(() => { root.style.setProperty('--floor', hex); flood.classList.remove('is-on'); }, 760);
}

/* ---------- cross-section drawn in code: segments, pith ring, seeds ---------- */
const svg = $('[data-section-svg]');
function drawSection(key, animate) {
  if (!svg) return;
  const f = FRUIT[key], n = f.segs, cx = 160, cy = 160, R = 150, pith = 136, inner = 18, gap = 0.035;
  const wedge = (a0, a1) => {
    const p = (r, a) => `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;
    const ri = inner + 4, ro = pith - 6, am = (a0 + a1) / 2;
    return `M${p(ri, a0 + gap * 1.6)} L${p(ro, a0 + gap)} A${ro} ${ro} 0 0 1 ${p(ro, a1 - gap)} L${p(ri, a1 - gap * 1.6)} Q${p(inner - 2, am)} ${p(ri, a0 + gap * 1.6)}Z`;
  };
  let segs = '', ves = '', seeds = '';
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2 - Math.PI / 2, a1 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2, am = (a0 + a1) / 2;
    segs += `<path class="seg" style="--i:${i}" d="${wedge(a0, a1)}"/>`;
    for (let k = 0; k < 3; k++) { const a = am + (k - 1) * (a1 - a0) * 0.22, r0 = 46 + k * 9, r1 = pith - 22 - k * 6; ves += `<path class="ves" d="M${(cx + r0 * Math.cos(a)).toFixed(1)} ${(cy + r0 * Math.sin(a)).toFixed(1)} L${(cx + r1 * Math.cos(a)).toFixed(1)} ${(cy + r1 * Math.sin(a)).toFixed(1)}"/>`; }
  }
  for (let s = 0; s < f.seeds; s++) { const a = ((s * 2 + 1) / n) * Math.PI * 2 - Math.PI / 2 + 0.06, r = 40; const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a); seeds += `<ellipse class="seed" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="3.4" ry="7" transform="rotate(${(a * 180 / Math.PI + 90).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`; }
  svg.innerHTML = `<circle class="peel" cx="${cx}" cy="${cy}" r="${R}"/><circle class="pith" cx="${cx}" cy="${cy}" r="${pith}"/><g class="segs">${segs}</g><g class="vess">${ves}</g>${seeds}<circle class="core" cx="${cx}" cy="${cy}" r="${inner - 6}"/>`;
  svg.setAttribute('aria-label', `Cross-section of a ${f.name.toLowerCase()}: ${n} segments${f.seeds ? ', a few seeds' : ', seedless'}`);
  svg.classList.toggle('is-draw', !!animate && !reduced);
  if (animate && !reduced) { void svg.getBoundingClientRect(); requestAnimationFrame(() => svg.classList.remove('is-draw')); }
}

/* ---------- copy that follows the fruit ---------- */
function setCopy(key) {
  const f = FRUIT[key];
  $$('[data-f]').forEach((el) => {
    const k = el.dataset.f; let v = f[k];
    if (k === 'segs') v = f.segText;
    if (k === 'uses') { el.innerHTML = f.uses.map((u) => `<li>${u}</li>`).join(''); return; }
    if (v == null) return;
    if (reduced) { el.textContent = v; return; }
    el.classList.add('is-swap'); setTimeout(() => { el.textContent = v; el.classList.remove('is-swap'); }, 180);
  });
  $$('[data-fruit-radio]').forEach((r) => { r.checked = r.value === key; });
  const crate = $('#f-crate'); if (crate && crate.value !== 'mix') crate.value = key;
  $$('.sw').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.fruit === key)));
  document.body.dataset.fruit = key;
}

/* ---------- the stage ---------- */
const stageEl = $('[data-stage]');
const loadEl = $('[data-load]');
let stage = null, holder = null, spinner = null, shadow = null, turn = null;
const models = {};                 // key -> Promise<Object3D>
let rolling = null;                // active roll animation state

function getFruit(key) {
  if (!stage || stage.failed) return Promise.resolve(null);
  if (!models[key]) {
    models[key] = stage.load(new URL(FRUIT[key].file, import.meta.url).href, (e) => {
      if (key === current && loadEl && e.total) loadEl.textContent = `Picking the ${FRUIT[key].name.toLowerCase()} ${Math.round((e.loaded / e.total) * 100)}%`;
    }).then((g) => {
      const o = g.scene;
      o.traverse((m) => { if (m.isMesh) { m.castShadow = false; if (m.material) { m.material.envMapIntensity = 1.05; m.material.roughness *= (FRUIT[key].rough || 1); m.material.needsUpdate = true; } } });
      if (key !== 'mandarin') o.rotation.z = Math.PI / 2;            // lemons and limes rest on their side, long axis across the table
      const wrap = new THREE.Group(); wrap.add(o); stage.fit(wrap, FRUIT[key].size, false);
      const b = new THREE.Box3().setFromObject(wrap), s = b.getSize(new THREE.Vector3());
      wrap.userData.r = s.y / 2;                                      // rolling radius = half its height on the table
      wrap.userData.long = key !== 'mandarin';                        // elongated: turn end-on before it rolls, like a real lemon does
      return wrap;
    }).catch(() => null);
  }
  return models[key];
}

const easeIn = (t) => t * t * t, easeOut = (t) => 1 - Math.pow(1 - t, 3);
function show(wrap, r) {
  spinner.clear(); spinner.add(wrap); holder.position.set(0, r * 0.985, 0); holder.rotation.set(0, 0, 0); holder.userData.r = r;
}
function fruitScreenPoint() {
  const rect = stageEl.getBoundingClientRect();
  if (!stage || stage.failed || !holder) return { x: rect.left + rect.width * 0.62, y: rect.top + rect.height * 0.5 };
  const v = new THREE.Vector3(0, holder.userData.r || 0.6, 0).project(stage.camera);
  return { x: rect.left + (v.x * 0.5 + 0.5) * rect.width, y: rect.top + (-v.y * 0.5 + 0.5) * rect.height };
}

async function choose(key, { fromUser = true } = {}) {
  if (!FRUIT[key] || (key === current && fromUser)) return;
  const prev = current; current = key;
  const origin = fruitScreenPoint();
  setPaper(FRUIT[key].paper, origin);
  setCopy(key); drawSection(key, true); drawRing(key);
  say(`${FRUIT[key].name} selected. The page turns ${key === 'lime' ? 'matcha green' : key === 'lemon' ? 'pale lemon' : 'mandarin cream'}.`);
  if (!stage || stage.failed) return;
  const nextP = getFruit(key);
  if (reduced) { const w = await nextP; if (w && current === key) { show(w, w.userData.r); turn && turn.set(w.userData.long ? 0.42 : 0.6); shadow && shadow.draw(); stage.invalidate(); } return; }
  /* roll out to the right: rotation = distance / radius, so the peel never slides */
  const dir = ORDER.indexOf(key) > ORDER.indexOf(prev) ? 1 : -1;
  const x0 = holder.position.x, r0 = holder.userData.r || 0.6, out = dir * (isM ? 2.6 : 3.4);
  const a0 = turn ? turn.angle : 0, aim = Math.round((a0 - Math.PI / 2) / Math.PI) * Math.PI + Math.PI / 2;
  const longNow = !!(spinner.children[0] && spinner.children[0].userData.long);
  rolling = { phase: 'out', t: 0, dur: 0.46, from: x0, to: out, r: r0, dir, key, next: nextP, a0, aim: longNow ? aim : a0 };
  stage.invalidate();
}

function rollFrame(dt) {
  if (!rolling) return false;
  const R = rolling; R.t += dt / R.dur; const k = Math.min(1, R.t);
  if (R.phase === 'out') {
    const x = R.from + (R.to - R.from) * easeIn(k); holder.position.x = x; holder.rotation.z = -x / R.r;
    if (turn) { const ang = R.a0 + (R.aim - R.a0) * easeOut(Math.min(1, k * 1.8)); turn.angle = ang; turn.velocity = 0; spinner.rotation.y = ang; }
    if (k >= 1) {
      R.phase = 'wait';
      R.next.then((w) => {
        if (rolling !== R) return; if (!w) { rolling = null; return; }
        show(w, w.userData.r); const from = -R.dir * (isM ? 2.6 : 3.4);
        const endOn = w.userData.long ? Math.PI / 2 : 0, rest = w.userData.long ? 0.42 : 0.6;   // arrives end-on, settles three-quarter
        Object.assign(R, { phase: 'in', t: 0, dur: 0.66, from, to: 0, r: w.userData.r, inA0: endOn, inA1: rest });
        if (turn) { turn.angle = endOn; turn.velocity = 0; spinner.rotation.y = endOn; }
        holder.position.x = from; holder.rotation.z = -from / R.r; stage.invalidate();
      });
    }
  } else if (R.phase === 'in') {
    const x = R.from + (R.to - R.from) * easeOut(k); holder.position.x = x; holder.rotation.z = -x / R.r;
    if (turn) { const kk = Math.max(0, (k - 0.55) / 0.45), ang = R.inA0 + (R.inA1 - R.inA0) * (1 - Math.pow(1 - kk, 3)); turn.angle = ang; turn.velocity = 0; spinner.rotation.y = ang; }
    if (k >= 1) { holder.position.x = 0; holder.rotation.z = 0; rolling = null; shadow && shadow.draw(); return true; }
  }
  if (shadow && R.phase !== 'wait') shadow.draw();
  return true;
}

/* switcher, keyboard 1/2/3, crate rows */
$$('.sw').forEach((b) => {
  b.addEventListener('click', () => choose(b.dataset.fruit));
  b.addEventListener('keydown', (e) => {
    const i = ORDER.indexOf(b.dataset.fruit);
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); const k = ORDER[(i + 1) % 3]; choose(k); $(`.sw[data-fruit=${k}]`).focus(); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); const k = ORDER[(i + 2) % 3]; choose(k); $(`.sw[data-fruit=${k}]`).focus(); }
  });
});
$$('.sw').forEach((b) => { b.tabIndex = b.dataset.fruit === current ? 0 : -1; });
const syncTab = () => $$('.sw').forEach((b) => { b.tabIndex = b.dataset.fruit === current ? 0 : -1; });
addEventListener('keydown', (e) => {
  if (e.target.closest('input,select,textarea,[contenteditable]') || e.metaKey || e.ctrlKey || e.altKey) return;
  const k = { 1: 'lemon', 2: 'lime', 3: 'mandarin' }[e.key]; if (k) { choose(k); syncTab(); }
});
document.addEventListener('click', () => syncTab());
$$('[data-fruit-radio]').forEach((r) => r.addEventListener('change', () => { if (r.checked) choose(r.value); }));
$$('[data-crate]').forEach((b) => b.addEventListener('click', () => {
  const sel = $('#f-crate'); if (sel) sel.value = b.dataset.crate;
  if (b.dataset.fruit) choose(b.dataset.fruit);
  const target = $('#reserve'); if (target) target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  setTimeout(() => $('#f-name')?.focus({ preventScroll: true }), reduced ? 0 : 700);
}));


/* ---------- the dial ring behind the fruit: one tick per segment, turns with the fruit ---------- */
const ring = $('[data-ring]');
function drawRing(key) {
  if (!ring) return;
  const n = FRUIT[key].segs; let t = '';
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; t += `<line x1="${(Math.sin(a) * 88).toFixed(2)}" y1="${(-Math.cos(a) * 88).toFixed(2)}" x2="${(Math.sin(a) * 97).toFixed(2)}" y2="${(-Math.cos(a) * 97).toFixed(2)}"/>`; }
  for (let i = 0; i < 72; i++) { if (i % (72 / 12)) { const a = (i / 72) * Math.PI * 2; t += `<line class="fine" x1="${(Math.sin(a) * 94).toFixed(2)}" y1="${(-Math.cos(a) * 94).toFixed(2)}" x2="${(Math.sin(a) * 97).toFixed(2)}" y2="${(-Math.cos(a) * 97).toFixed(2)}"/>`; } }
  ring.querySelector('.ticks').innerHTML = t;
}
function placeRing() {
  if (!ring) return;
  const rect = stageEl.getBoundingClientRect(), p = fruitScreenPoint();
  ring.style.left = (p.x - rect.left) + 'px'; ring.style.top = (p.y - rect.top) + 'px';
}
drawRing(current);

/* first paint: copy + section for the default fruit, no animation */
setCopy(current); drawSection(current, false);

/* ---------- phone menu ---------- */
const menuBtn = $('.menu-btn'), menu = $('#menu');
if (menuBtn && menu) {
  const setMenu = (open) => { menuBtn.setAttribute('aria-expanded', String(open)); menu.hidden = !open; menuBtn.querySelector('span').textContent = open ? 'Close' : 'Menu'; if (open) menu.querySelector('a')?.focus(); };
  menuBtn.addEventListener('click', () => setMenu(menu.hidden));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); } });
}

/* ---------- nav: mark the section in view ---------- */
const navLinks = $$('.nav a[href^="#"]');
if (navLinks.length && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) navLinks.forEach((a) => a.classList.toggle('is-here', a.getAttribute('href') === '#' + en.target.id)); }), { rootMargin: '-45% 0px -50% 0px' });
  navLinks.forEach((a) => { const s = $(a.getAttribute('href')); if (s) io.observe(s); });
}

/* ---------- reserve form: validate, loading, honest success ---------- */
const form = $('.form');
if (form) {
  const submit = form.querySelector('.submit'), done = form.querySelector('.done'), label = submit.querySelector('.b-label');
  const rules = {
    name: (v) => v.trim().length >= 2 || 'Add the name for the crate label.',
    email: (v) => (!v.trim() ? 'Add an email for the crate note.' : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'That email looks incomplete.'),
    ok: (_, el) => el.checked || 'Tick this so we both know nothing is sent.'
  };
  const check = (el) => {
    const r = rules[el.name]; if (!r) return true;
    const res = r(el.value, el), msg = $('#e-' + el.name);
    if (res === true) { el.removeAttribute('aria-invalid'); if (msg) msg.textContent = ''; return true; }
    el.setAttribute('aria-invalid', 'true'); if (msg) msg.textContent = res; return false;
  };
  form.querySelectorAll('input[name=name],input[name=email],input[name=ok]').forEach((el) => {
    el.addEventListener('blur', () => { if (el.value || el.type === 'checkbox') check(el); });
    el.addEventListener('input', () => { if (el.hasAttribute('aria-invalid')) check(el); });
    el.addEventListener('change', () => { if (el.hasAttribute('aria-invalid')) check(el); });
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fields = [...form.querySelectorAll('input[name=name],input[name=email],input[name=ok]')];
    const bad = fields.filter((el) => !check(el));
    if (bad.length) { bad[0].focus(); say('Please fix the highlighted fields.'); return; }
    submit.setAttribute('aria-busy', 'true'); submit.disabled = true; label.textContent = 'Packing';
    setTimeout(() => {
      submit.removeAttribute('aria-busy'); submit.disabled = false; label.textContent = 'Reserve a crate';
      const crate = $('#f-crate'); const what = crate ? crate.options[crate.selectedIndex].text : 'crate';
      const d = done.querySelector('[data-done-what]'); if (d) d.textContent = what;
      done.hidden = false; submit.hidden = true; done.querySelector('button').focus();
      say('Concept, not sent. Nothing left this page.');
    }, reduced ? 0 : 750);
  });
  form.querySelector('[data-action=reset]').addEventListener('click', () => {
    form.reset(); done.hidden = true; submit.hidden = false; form.querySelectorAll('[aria-invalid]').forEach((x) => x.removeAttribute('aria-invalid'));
    form.querySelectorAll('.err').forEach((x) => (x.textContent = '')); setCopy(current); $('#f-name').focus();
  });
}

/* ---------- 3D: poster first, stage near the viewport, first fruit with real progress, the rest on idle ---------- */
stage = await createStage({
  el: stageEl,
  camera: { fov: isM ? 30 : 26, position: [0, 0.95, isM ? 6.0 : 6.6], target: [0, 0.5, 0] },
  exposure: 1.02, envIntensity: 1.0, envRotation: 0.6,
  label: 'Rootline Citrus: the chosen fruit. Drag sideways to turn it, or use the arrow keys.'
});
if (!stage.failed) {
  holder = new THREE.Group(); spinner = new THREE.Group(); holder.add(spinner); stage.add(holder);
  const key = new THREE.DirectionalLight(0xfff4e0, 1.1); key.position.set(-2.5, 4, 3); stage.add(key);
  shadow = stage.contactShadow({ size: 3.2, opacity: 0.72, blur: 1.7, darkness: 1.9, height: 0.65, color: 0x1e2522 });
  turn = stage.spin(spinner, { auto: 0.16, onSpin: (st) => { if (ring) ring.style.setProperty('--a', (st.angle * 57.2958).toFixed(2) + 'deg'); }, label: 'Rootline Citrus: the chosen fruit. Drag sideways to turn it, or use the arrow keys.' });
  stage.onFrame(rollFrame);
  const first = await getFruit(current);
  if (first) { show(first, first.userData.r); turn.set(first.userData.long ? 0.42 : 0.6); shadow && shadow.draw(); }
  stage.loaded(); placeRing(); ring && ring.classList.add('is-on');
  new ResizeObserver(() => placeRing()).observe(stageEl);
  /* the other two fruits load on intent: the moment a pointer, finger or focus reaches a switch (or a crate row), never before */
  const warm = (e) => { const b = e.target.closest && e.target.closest('[data-fruit]'); if (b && FRUIT[b.dataset.fruit]) getFruit(b.dataset.fruit); };
  ['pointerover', 'focusin', 'touchstart'].forEach((ev) => document.addEventListener(ev, warm, { passive: true }));
}
