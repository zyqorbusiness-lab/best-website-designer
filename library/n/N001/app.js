/* N001 Loomhouse Tailors (best-4 build, Oct 31 2026). Shared app for index.html (desktop) and m.html (phone).
   Beats: tape preloader (real progress, tape.js) -> #hero cloth on its rod, swatches flood the cloth from the exact spot
   you point at and re-theme the page from the cursor -> #cloths: four chapters, each floods the cloth to its fabric and
   pushes the camera into the weave and back -> #alterations: drag the chalk line to set a hem (1 px = 1/16 in, snaps to
   1/4 in), the ticket updates live -> #fitting: a tape that scrolls sideways, steps at 12/24/36/48 in -> #book.
   One scroll engine (rAF, getBoundingClientRect, progress lerped 0.12 per frame), CSS sticky, no scroll library. */
import { createStage, THREE, isM, reduced, clamp, smoothstep, lerp } from '../../_kit/stage.js';
import { makeCloth, CLOTHS } from './cloth.js';

const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const html = document.documentElement;
if (reduced) html.classList.add('rm');
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const live = $('#live');
const say = (t) => { if (live) live.textContent = t; };

/* ---------- reveals (opacity + 20px rise, 460 ms, expo-out, 60 ms stagger) ---------- */
{
  const els = $$('[data-rv]');
  if (reduced || !('IntersectionObserver' in window)) els.forEach((e) => e.classList.add('in'));
  else {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      const sib = $$(':scope > [data-rv]', e.target.parentElement);
      e.target.style.transitionDelay = Math.max(0, sib.indexOf(e.target)) * 60 + 'ms';
      e.target.classList.add('in'); io.unobserve(e.target);
    }), { rootMargin: '0px 0px -8% 0px' });
    els.forEach((e) => io.observe(e));
  }
}

/* ---------- phone menu sheet ---------- */
{
  const mb = $('#nav-menu'), sh = $('#nav-sheet');
  if (mb && sh) {
    const set = (o) => { sh.hidden = !o; mb.setAttribute('aria-expanded', String(o)); mb.textContent = o ? 'Close' : 'Menu'; };
    mb.addEventListener('click', () => set(sh.hidden));
    $$('a', sh).forEach((a) => a.addEventListener('click', () => set(false)));
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && !sh.hidden) { set(false); mb.focus(); } });
  }
}
$('#open-credits')?.addEventListener('click', () => {
  if (window.ZL && window.ZL.openCredits) return window.ZL.openCredits();
  const b = $$('.zk-bar button, .zk-bar a').find((x) => /credit/i.test(x.textContent + (x.getAttribute('aria-label') || '')));
  if (b) b.click(); else $('.foot-cred').scrollIntoView();
});

/* ---------- page theme + cursor flood ---------- */
const THEMES = ['rose', 'glen', 'satin', 'jacq'];
const ROOM = { rose: '#F6E2E5', glen: '#E2D2D1', satin: '#293E20', jacq: '#DCD6D2' };
const flood = $('#flood'), sticky = $('#w-sticky');
let floodAnim = null, themeNow = 'rose';
function setTheme(i, x, y) {
  const th = THEMES[i]; if (th === themeNow && !floodAnim) return; themeNow = th;
  const finish = () => { html.dataset.theme = th; flood.style.clipPath = 'circle(0px at 50% 50%)'; };
  if (reduced || !flood || !flood.animate) { html.dataset.ink = th; finish(); return; }
  if (floodAnim) { floodAnim.cancel(); floodAnim = null; }
  const r = sticky.getBoundingClientRect();
  const fx = (x ?? r.left + r.width * 0.65) - r.left, fy = (y ?? r.top + r.height * 0.45) - r.top;
  const R = Math.hypot(Math.max(fx, r.width - fx), Math.max(fy, r.height - fy)) + 8;
  flood.style.background = ROOM[th];
  const a = flood.animate([{ clipPath: `circle(0px at ${fx}px ${fy}px)` }, { clipPath: `circle(${R}px at ${fx}px ${fy}px)` }], { duration: 700, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' });
  floodAnim = a;
  setTimeout(() => { if (floodAnim === a) html.dataset.ink = th; }, 360);
  a.onfinish = () => { if (floodAnim !== a) return; html.dataset.ink = th; html.dataset.theme = th; requestAnimationFrame(() => requestAnimationFrame(() => { if (floodAnim !== a) return; flood.style.clipPath = 'circle(0px at 50% 50%)'; a.cancel(); floodAnim = null; })); };
}

/* ---------- swatches: hover (fine pointer) and click / tap / Enter do the same ---------- */
let cloth = null, current = 0, pendingUV = null;
const nameEls = $$('[data-now]');
function syncSw(i) { $$('.sw[data-cloth]').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.cloth === i))); nameEls.forEach((n) => (n.textContent = CLOTHS[i].name)); }
function choose(i, o = {}) {
  if (i === current && !o.force) { cloth?.ripple(o.uv || [0.5, 0.6], 0.5); return; }
  current = i; syncSw(i); setTheme(i, o.x, o.y);
  if (cloth) cloth.reveal(i, o.uv || [0.5, 0.6]); else pendingUV = o.uv || [0.5, 0.6];
  if (!o.quiet) say(CLOTHS[i].name + ' is hanging on the rail.');
}
$$('.sw[data-cloth]').forEach((b) => {
  const i = +b.dataset.cloth, cut = $('.sw-cut', b);
  const uvOf = (e) => { const r = cut.getBoundingClientRect(); return [clamp((e.clientX - r.left) / r.width), clamp(1 - (e.clientY - r.top) / r.height)]; };
  let t = 0;
  if (fine) {
    b.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'mouse') return; clearTimeout(t); const ev = { clientX: e.clientX, clientY: e.clientY }; t = setTimeout(() => choose(i, { uv: uvOf(ev), x: ev.clientX, y: ev.clientY }), 110); });
    b.addEventListener('pointerleave', () => clearTimeout(t));
  }
  b.addEventListener('click', (e) => {
    clearTimeout(t);
    if (e.detail === 0) { const r = cut.getBoundingClientRect(); choose(i, { uv: [0.5, 0.5], x: r.left + r.width / 2, y: r.top + r.height / 2 }); }
    else choose(i, { uv: uvOf(e), x: e.clientX, y: e.clientY });
  });
});
syncSw(0);

/* ---------- the world: one sticky stage behind #hero and #cloths ---------- */
const world = $('#world'), hero = $('#hero'), chapters = $$('.ch'), chIdx = $('#ch-idx'), chName = $('#ch-name'), dots = $$('.ch-dots li');
const S = { heroP: 0, heroT: 0, ch: -1, chP: 0, chPT: 0 };
let worldVisible = true;
function readWorld() {
  const vh = innerHeight;
  const hr = hero.getBoundingClientRect();
  S.heroT = clamp(-hr.top / Math.max(1, hr.height));
  const mid = isM ? vh * 0.8 : vh * 0.5;
  let ch = -1, p = 0;
  chapters.forEach((c, k) => { const r = c.getBoundingClientRect(); if (r.top <= mid) { ch = k; p = clamp((mid - r.top) / r.height); } });
  const wr = world.getBoundingClientRect(); worldVisible = wr.bottom > 0 && wr.top < vh;
  if (ch !== S.ch) enterChapter(ch);
  S.chPT = ch < 0 ? 0 : p;
}
function enterChapter(k) {
  const prev = S.ch; S.ch = k;
  html.classList.toggle('in-cloths', k >= 0);
  if (k < 0) return;
  if (chIdx) chIdx.textContent = String(k + 1).padStart(2, '0') + ' / 04';
  if (chName) chName.textContent = CLOTHS[k].name;
  dots.forEach((d, j) => d.classList.toggle('on', j === k));
  if (k !== current) { const r = sticky.getBoundingClientRect(); choose(k, { uv: [0.5, 0.55], x: r.left + r.width * (isM ? 0.5 : 0.3), y: r.top + r.height * 0.45, quiet: prev === -1 && false }); }
}

/* ---------- 3D ---------- */
(async () => {
  const stage = await createStage({
    el: '#w-stage',
    camera: { fov: 30, position: [-0.55, 0.25, isM ? 4.75 : 5.25], target: [0, 0.02, 0] },
    exposure: 1.05, envIntensity: 0.4, fitFov: true, dpr: 2,
    label: 'A length of cloth hanging from a rod. Arrow keys change the cloth, Enter makes it move.'
  });
  if (stage.failed) { dispatchEvent(new Event('loom:fail')); world.classList.add('nogl'); return; }
  let c;
  try { c = await makeCloth(stage, current); } catch (e) { dispatchEvent(new Event('loom:fail')); return; }
  cloth = c;
  if (c.current !== current) c.reveal(current, pendingUV || [0.5, 0.6]);
  stage.loaded && stage.loaded();
  const C0 = stage.camera.position.clone(), T0 = stage.target.clone();
  const P = new THREE.Vector3(), tmp = new THREE.Vector3();
  const easeIO = (x) => (x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2);
  const bump = (p) => (p < 0.25 ? 0 : p < 0.45 ? easeIO((p - 0.25) / 0.2) : p < 0.65 ? 1 - easeIO((p - 0.45) / 0.2) : 0);
  let rotY = 0.3, lastClip = -1;
  const MACRO = [0.86, 0.8, 0.52, 0.8];          // how far the camera pushes into each weave (satin has the least detail to show)
  const canvas = stage.renderer.domElement;
  stage.onFrame((dt, t) => {
    let busy = c.tick(dt, t);
    /* scroll state, lerped 0.12 per frame (jumps under reduced motion) */
    const k = reduced ? 1 : 1 - Math.pow(1 - 0.12, dt * 60);
    S.heroP += (S.heroT - S.heroP) * k; S.chP += (S.chPT - S.chP) * k;
    if (Math.abs(S.heroT - S.heroP) > 1e-4 || Math.abs(S.chPT - S.chP) > 1e-4) busy = true;
    /* framing: desktop slides the cloth from the right 6/12 (hero) to the left 55% (#cloths); phone stays centred */
    const vh = 2 * C0.length() * Math.tan(THREE.MathUtils.degToRad(stage.camera.fov / 2)), vw = vh * stage.camera.aspect;
    const frac = isM ? 0.5 : (reduced ? (S.ch >= 0 ? 0.29 : 0.71) : lerp(0.71, 0.29, smoothstep(0.25, 0.95, S.heroP)));
    c.group.position.x = (frac - 0.5) * vw * 0.92 + 0.12;
    c.group.position.y = isM ? -0.08 : -0.16;
    const clipR = isM ? 0 : (reduced ? (S.ch >= 0 ? 45 : 0) : 45 * smoothstep(0.25, 0.95, S.heroP));
    if (Math.abs(clipR - lastClip) > 0.05) { lastClip = clipR; canvas.style.clipPath = clipR > 0.1 ? `inset(0 ${clipR.toFixed(2)}% 0 0)` : 'none'; }
    /* macro push into the weave (chapters only), ease-io in and out */
    const m = reduced || S.ch < 0 ? 0 : bump(S.chP) * MACRO[S.ch] * (isM ? 0.72 : 1);
    P.set(c.group.position.x, c.group.position.y - 0.15, 0);
    tmp.copy(C0).lerp(P, m); stage.camera.position.copy(tmp);
    stage.camera.lookAt(tmp.x - C0.x + T0.x + (P.x - T0.x) * m, tmp.y - C0.y + T0.y, tmp.z - C0.z + T0.z);
    if (fine && !reduced) { rotY += ((stage.pointer.active ? 0.3 + stage.pointer.x * 0.1 : 0.3) - rotY) * Math.min(1, dt * 3); busy = true; }
    c.group.rotation.y = rotY * (1 - m * 0.85);
    return busy;
  });
  /* tap / drag on the cloth sends a ripple from the finger */
  let down = false, lastRip = 0;
  stage.el.addEventListener('pointerdown', (e) => { const uv = c.hitUV(e); if (uv) { down = true; c.ripple(uv, 0.9); lastRip = performance.now(); } });
  stage.el.addEventListener('pointermove', (e) => { if (!down) return; const now = performance.now(); if (now - lastRip < 140) return; const uv = c.hitUV(e); if (uv) { c.ripple(uv, 0.55); lastRip = now; } });
  addEventListener('pointerup', () => (down = false));
  canvas.tabIndex = 0;
  canvas.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); const n = (current + (e.key === 'ArrowRight' ? 1 : 3)) % 4; choose(n, { uv: [0.5, 0.6] }); }
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); c.ripple([0.5, 0.5], 1); }
  });
  c.ripple([0.5, 0.95], 0.6);
  world.classList.add('live');
  requestAnimationFrame(() => dispatchEvent(new Event('loom:live')));
  window.__loom = { choose, cloth: c, S, pick: (i, u, v, x, y) => { window.__revDur = 3; choose(i, { uv: [u, v], x, y }); } };
})();

/* ---------- #alterations: the chalk line ---------- */
const ALT = {
  hem: { name: 'Hem', price: 18, days: 3, axis: 'y', min: -1.5, max: 4, note: 'Drag the chalk line up to shorten, down to let down.' },
  in: { name: 'Take in', price: 28, days: 5, axis: 'x', min: 0, max: 2, note: 'Drag the chalk line in from the side seam.' },
  out: { name: 'Let out', price: 32, days: 5, axis: 'x', min: 0, max: 1, note: 'Drag the chalk line out. We keep one inch in every seam.' },
  zip: { name: 'Zip', price: 22, days: 2, axis: null, note: 'No chalk needed: we match the zip to the cloth at the counter.' }
};
const frac = (v) => { const a = Math.abs(v), w = Math.floor(a + 1e-6), q = Math.round((a - w) * 4); const f = ['', '\u00bc', '\u00bd', '\u00be'][q]; return (w ? w + (f ? ' ' + f : '') : (f || '0')); };
const alt = { mode: 'hem', v: { hem: 1.25, in: 0.75, out: 0.5, zip: 0 } };
{
  const svg = $('#leg'), hdl = $('#chalk-h'), line = $('#chalk-l'), wrap = $('#leg-wrap');
  const HEM_Y = 560, SEAM = (y) => 262 - (12 * (y - 60)) / 270;     // outseam x on the drawing, from y 60 (hip) to 330
  const scale = () => { const r = svg.getBoundingClientRect(); return r.height / 600; };   // CSS px per drawing unit
  function draw() {
    const m = alt.mode, A = ALT[m], v = alt.v[m], s = scale();
    $$('.alt-chip').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.alt === m)));
    wrap.dataset.mode = m;
    let x1, y1, x2, y2, hx, hy;
    if (m === 'hem') { const y = HEM_Y - (v * 16) / s; x1 = 70; x2 = 250; y1 = y2 = y; hx = 160; hy = y; }
    else if (m === 'in' || m === 'out') { const d = ((m === 'in' ? -1 : 1) * v * 16) / s; x1 = SEAM(70) + d; y1 = 70; x2 = SEAM(320) + d; y2 = 320; hx = (x1 + x2) / 2; hy = 195; }
    else { x1 = 150; y1 = 62; x2 = 150; y2 = 150; hx = 150; hy = 106; }
    line.setAttribute('x1', x1); line.setAttribute('y1', y1); line.setAttribute('x2', x2); line.setAttribute('y2', y2);
    hdl.style.left = (hx / 300) * 100 + '%'; hdl.style.top = (hy / 600) * 100 + '%';
    hdl.hidden = !A.axis;
    if (A.axis) {
      hdl.setAttribute('aria-label', m === 'hem' ? 'Hem chalk line' : A.name + ' chalk line');
      hdl.setAttribute('aria-orientation', A.axis === 'y' ? 'vertical' : 'horizontal');
      hdl.setAttribute('aria-valuemin', A.min); hdl.setAttribute('aria-valuemax', A.max); hdl.setAttribute('aria-valuenow', v);
      hdl.setAttribute('aria-valuetext', measureText(m, v));
    }
    $('#tk-job').textContent = A.name;
    $('#tk-m').textContent = measureText(m, v);
    $('#tk-new').textContent = m === 'hem' ? frac(32 - v) + ' in inseam' : m === 'zip' ? 'Trouser fly, 7 in zip' : (m === 'in' ? 'Waist ' + frac(34 - v * 2) : 'Waist ' + frac(34 + v * 2)) + ' in';
    $('#tk-p').textContent = '$' + A.price;
    $('#tk-d').textContent = A.days + ' days';
    $('#alt-note').textContent = A.note;
  }
  function measureText(m, v) {
    if (m === 'hem') return v === 0 ? 'No change yet' : v > 0 ? 'Shorten ' + frac(v) + ' in' : 'Let down ' + frac(v) + ' in';
    if (m === 'in') return v === 0 ? 'No change yet' : 'Take in ' + frac(v) + ' in each side';
    if (m === 'out') return v === 0 ? 'No change yet' : 'Let out ' + frac(v) + ' in each side';
    return 'Measured at the counter';
  }
  const setV = (v) => { const A = ALT[alt.mode]; v = Math.round(clamp(v, A.min, A.max) * 4) / 4; if (v !== alt.v[alt.mode]) { alt.v[alt.mode] = v; draw(); } };
  $$('.alt-chip').forEach((b) => b.addEventListener('click', () => { alt.mode = b.dataset.alt; draw(); say(ALT[alt.mode].name + ': ' + measureText(alt.mode, alt.v[alt.mode])); }));
  let drag = null;
  hdl.addEventListener('pointerdown', (e) => { e.preventDefault(); hdl.setPointerCapture(e.pointerId); drag = { x: e.clientX, y: e.clientY, v: alt.v[alt.mode] }; wrap.classList.add('dragging'); });
  hdl.addEventListener('pointermove', (e) => {
    if (!drag) return; const A = ALT[alt.mode];
    const dpx = A.axis === 'y' ? drag.y - e.clientY : (alt.mode === 'in' ? drag.x - e.clientX : e.clientX - drag.x);
    setV(drag.v + dpx / 16);                                  // 1 px = 1/16 in, snapped to 1/4 in
  });
  const end = () => { if (!drag) return; drag = null; wrap.classList.remove('dragging'); say(measureText(alt.mode, alt.v[alt.mode])); };
  hdl.addEventListener('pointerup', end); hdl.addEventListener('pointercancel', end);
  hdl.addEventListener('keydown', (e) => {
    const A = ALT[alt.mode]; if (!A.axis) return;
    const up = A.axis === 'y' ? ['ArrowUp', 'ArrowRight'] : alt.mode === 'in' ? ['ArrowLeft', 'ArrowUp'] : ['ArrowRight', 'ArrowUp'];
    const dn = A.axis === 'y' ? ['ArrowDown', 'ArrowLeft'] : alt.mode === 'in' ? ['ArrowRight', 'ArrowDown'] : ['ArrowLeft', 'ArrowDown'];
    if (up.includes(e.key)) { e.preventDefault(); setV(alt.v[alt.mode] + 0.25); }
    else if (dn.includes(e.key)) { e.preventDefault(); setV(alt.v[alt.mode] - 0.25); }
    else if (e.key === 'Home') { e.preventDefault(); setV(A.min); } else if (e.key === 'End') { e.preventDefault(); setV(A.max); }
  });
  new ResizeObserver(draw).observe(svg);
  draw();
  $('#tk-book').addEventListener('click', () => { const s = $('#f-svc'); if (s) s.value = 'alt'; });
  window.__alt = { set: (m, v) => { alt.mode = m; setV(v); draw(); }, state: alt };
}

/* ---------- #fitting: a tape that scrolls sideways ---------- */
{
  const sec = $('#fitting'), strip = $('#fit-strip'), ruler = $('#fit-ruler'), cards = $$('.fit-card');
  const LEN = 80;                                             // inches drawn (about 2 m)
  let ppi = 40, cx = 0, pT = 0, p = 0, raf = 0;
  function build() {
    ppi = isM ? 26 : 40;
    const w = LEN * ppi, h = isM ? 64 : 84;
    let s = `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true" focusable="false"><rect width="${w}" height="${h}" rx="3" class="fr-bg"/>`;
    for (let i = 0; i <= LEN * 4; i++) {
      const x = (i / 4) * ppi, inch = i % 4 === 0, six = i % 24 === 0;
      const l = six ? h * 0.5 : inch ? h * 0.32 : i % 2 === 0 ? h * 0.2 : h * 0.13;
      s += `<line x1="${x.toFixed(1)}" y1="0" x2="${x.toFixed(1)}" y2="${l.toFixed(1)}" class="${six ? 'fr-t6' : 'fr-t'}"/>`;
      if (inch && i > 0 && i < LEN * 4) s += `<text x="${(x + 3).toFixed(1)}" y="${(h - 10).toFixed(1)}" class="${[48, 96, 144, 192].includes(i) ? 'fr-n fr-n--k' : 'fr-n'}">${i / 4}</text>`;
    }
    ruler.innerHTML = s + '</svg>';
    cards.forEach((c) => { c.style.left = (+c.dataset.in * ppi) + 'px'; });
    strip.style.width = w + 'px';
  }
  function read() { const r = sec.getBoundingClientRect(); const run = r.height - innerHeight; pT = clamp(-r.top / Math.max(1, run)); cx = innerWidth / 2; }
  function frame() {
    raf = 0; const k = reduced ? 1 : 0.12; p += (pT - p) * k; if (Math.abs(pT - p) < 1e-4) p = pT;
    const pp = reduced ? 0.87 : p;
    const x = cx - 6.24 * ppi - pp * 48 * ppi;
    strip.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
    let on = -1;
    cards.forEach((c, j) => { const mark = x + +c.dataset.in * ppi; const shown = reduced || mark <= cx + 2; c.classList.toggle('in', shown); if (shown) on = j; });
    cards.forEach((c, j) => c.classList.toggle('cur', j === on));
    if (p !== pT) raf = requestAnimationFrame(frame);
  }
  const go = () => { read(); if (!raf) raf = requestAnimationFrame(frame); };
  build(); go();
  addEventListener('scroll', go, { passive: true });
  addEventListener('resize', () => { build(); go(); });
}

/* ---------- scroll engine for the world ---------- */
{
  let raf = 0;
  const go = () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; readWorld(); }); };
  addEventListener('scroll', go, { passive: true }); addEventListener('resize', go); readWorld();
}

/* ---------- #book: works as UI, sends nothing ---------- */
{
  const form = $('#bk-form'), done = $('#bk-done');
  const fields = {
    svc: [$('#f-svc'), (v) => (v ? '' : 'Choose what the fitting is for.')],
    day: [null, () => ($('.day[aria-pressed="true"]') ? '' : 'Pick a day.')],
    name: [$('#f-name'), (v) => (v.trim().length >= 2 ? '' : 'Tell us your name.')],
    reach: [$('#f-reach'), (v) => { v = v.trim(); if (!v) return 'A phone number or an email.'; if (v.includes('@')) return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'That email looks incomplete.'; return v.replace(/\D/g, '').length >= 7 ? '' : 'A phone number with at least 7 digits.'; }]
  };
  const check = (k) => { const [el, fn] = fields[k]; const msg = fn(el ? el.value : ''); const err = $('#e-' + k); err.textContent = msg; err.hidden = !msg; if (el) el.setAttribute('aria-invalid', msg ? 'true' : 'false'); return !msg; };
  $$('.day').forEach((b) => b.addEventListener('click', () => { if (b.disabled) return; $$('.day').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); check('day'); }));
  ['name', 'reach'].forEach((k) => { const el = fields[k][0]; el.addEventListener('blur', () => { if (el.value) check(k); }); el.addEventListener('input', () => { if (el.getAttribute('aria-invalid') === 'true') check(k); }); });
  $('#f-svc').addEventListener('change', () => check('svc'));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const bad = Object.keys(fields).filter((k) => !check(k));
    if (bad.length) { const f = fields[bad[0]][0] || $('.day:not([disabled])'); f.focus(); say('Please check the form: ' + bad.length + ' field' + (bad.length > 1 ? 's' : '') + ' need attention.'); return; }
    const btn = $('#bk-go'); btn.disabled = true; btn.setAttribute('aria-busy', 'true'); btn.textContent = 'Sending...';
    setTimeout(() => {
      btn.disabled = false; btn.removeAttribute('aria-busy'); btn.textContent = 'Ask for a fitting';
      const svc = $('#f-svc'); const day = $('.day[aria-pressed="true"]');
      $('#bk-sum').textContent = `${svc.options[svc.selectedIndex].text}, ${day.dataset.day}, for ${$('#f-name').value.trim()}.`;
      form.hidden = true; done.hidden = false; done.focus({ preventScroll: false });
      say('Concept: not sent. Your request stayed on this page.');
    }, reduced ? 0 : 700);
  });
  $('#bk-again').addEventListener('click', () => { done.hidden = true; form.hidden = false; $('#f-name').focus(); });
}
