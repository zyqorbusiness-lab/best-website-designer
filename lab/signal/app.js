/* SIGNAL STUDIO - Concept 09, Zyqor Lab. Card deck: stack -> radial flower -> tilted fan (scroll),
   bento grid that assembles, Matter.js pill playground, per-letter giant footer. No WebGL. */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = matchMedia('(hover: none) and (pointer: coarse)').matches;
const isM = document.documentElement.dataset.build === 'm';
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const eOut = (t) => 1 - Math.pow(1 - t, 4);
const eIO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/* ---------- basics: reveals, smooth scroll, anchors, toast, magnetic, cursor ---------- */
function reveals() {
  const els = $$('[data-rv]');
  if (reduced || !('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('rv-in')); return; }
  const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('rv-in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  els.forEach((e) => io.observe(e));
}
let lenis = null;
function smooth() {
  if (reduced || isM || !window.Lenis) return;
  lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
  const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf);
}
const toastEl = $('.toast'); let toastT;
function toast(m) { toastEl.textContent = m; toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('on'), 3400); }
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]'); if (!a) return; e.preventDefault();
  if (a.classList.contains('concept')) { toast('Concept only: Signal Studio is a fictional agency. For real projects, talk to Zyqor Studio.'); return; }
  const el = $(a.getAttribute('href')); if (!el) return;
  if (lenis) lenis.scrollTo(el, { duration: 1.5 }); else el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
});
function pointerFX() {
  if (coarse || isM || reduced) return;
  $$('.mag').forEach((el) => {
    el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); el.style.transition = 'transform .15s ease-out'; el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.22}px,${(e.clientY - r.top - r.height / 2) * 0.3}px)`; });
    el.addEventListener('pointerleave', () => { el.style.transition = 'transform .7s cubic-bezier(.16,1,.3,1)'; el.style.transform = ''; });
  });
  const cur = $('.cursor'), lab = cur.firstElementChild; let x = -100, y = -100, tx = x, ty = y;
  addEventListener('pointermove', (e) => {
    tx = e.clientX; ty = e.clientY;
    const t = e.target.closest && (e.target.closest('[data-cursor]') || e.target.closest('.ppill'));
    if (t) { lab.textContent = t.dataset.cursor || 'Drag'; cur.classList.add('big'); } else cur.classList.remove('big');
  });
  (function loop() { x += (tx - x) * 0.22; y += (ty - y) * 0.22; cur.style.translate = `${x}px ${y}px`; requestAnimationFrame(loop); })();
}

/* ---------- hero deck ---------- */
const hero = $('.hero'), hl = $('.hl'), deck = $('.deck'), cards = $$('.card'), side = $('.hero-side');
const N = cards.length;
// split the headline into letters (weight wave + kinetic loud mode); line spans keep the intro reveal
$$('.hl-l > span').forEach((line) => {
  let li = 0; const txt = line.textContent; line.textContent = '';
  txt.split(' ').forEach((w, wi) => {
    if (wi) line.append(' ');
    const word = document.createElement('span'); word.style.whiteSpace = 'nowrap'; word.style.display = 'inline-block';
    [...w].forEach((ch) => { const s = document.createElement('span'); s.className = 'ch'; s.textContent = ch; s.style.setProperty('--li', li++); word.append(s); });
    line.append(word);
  });
});
hl.setAttribute('aria-label', 'Make them stop scrolling.');
$$('.hl-l', hl).forEach((l) => l.setAttribute('aria-hidden', 'true'));
const chars = $$('.hl .ch');
// per-card mode state: k = calm(0) -> loud(1) formation, spin = extra turn, pop = scale kick
const cst = cards.map(() => ({ k: 0, spin: 0, pop: 0 }));
const rnd = (i, s) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
let VW = innerWidth, VH = innerHeight, CW = 160, CH = 208, hlBox = { w: 0, h: 0 };
function layout() {
  VW = innerWidth; VH = innerHeight;
  CW = isM ? Math.round(Math.min(VW * 0.29, 120)) : Math.round(clamp(VW * 0.105, 128, 168)); CH = Math.round(CW * 1.3);
  deck.style.setProperty('--cw', CW + 'px'); deck.style.setProperty('--ch', CH + 'px');
  hl.style.transform = 'none'; const r = hl.getBoundingClientRect(); hlBox = { w: r.width, h: r.height }; hl.style.transform = '';
}
function stateStack(i) { const k = i - (N - 1) / 2; return { x: k * 3, y: -i * 2 + 10, r: k * 2.5, s: 1 }; }
function stateFlower(i) {
  const rx = isM ? VW * 0.37 : Math.min(VW * 0.37, 600), ry = isM ? VH * 0.33 : VH * 0.31;
  const a = (isM ? -90 : -67.5) + i * 360 / N, ar = a * Math.PI / 180;
  return { x: Math.cos(ar) * rx, y: Math.sin(ar) * ry, r: a + 90, s: isM ? 0.9 : 0.86 };
}
function stateFan(i) {
  const spread = isM ? 48 : 56, th = -spread / 2 + (spread * i) / (N - 1), tr = th * Math.PI / 180;
  const L = CH * (isM ? 1.15 : 1.5);
  const px = isM ? 0 : -VW * 0.1, py = isM ? VH * 0.2 : VH * 0.56;
  return { x: px + Math.sin(tr) * L, y: py - Math.cos(tr) * L, r: th, s: isM ? 0.92 : 1.2 };
}
function stateLoud(i) { // sticker wall: upright-ish, jittered, bigger
  if (isM) { // phone: two rows that leave the headline band clear
    const top = i < 3, k = top ? i : i - 3, n = top ? 3 : N - 3;
    const x = (k - (n - 1) / 2) * VW * (top ? 0.33 : 0.27) + (rnd(i, 3) - 0.5) * 14;
    const y = (top ? -0.29 : 0.25) * VH + (k % 2 ? 26 : -10) + (rnd(i, 4) - 0.5) * 16;
    return { x, y, r: (rnd(i, 2) - 0.5) * 30, s: top ? 0.92 : 0.8 };
  }
  const rx = isM ? VW * 0.36 : Math.min(VW * 0.4, 640), ry = isM ? VH * 0.34 : VH * 0.33;
  const slot = (i * 3) % N, a = -67.5 + slot * 360 / N, ar = a * Math.PI / 180, j = 0.9 + rnd(i, 1) * 0.2; // cards trade places
  return { x: Math.cos(ar) * rx * j, y: Math.sin(ar) * ry * j, r: (rnd(i, 2) - 0.5) * 34, s: isM ? 0.98 : 1.0 };
}
function stateFanLoud(i) { // wider, taller, louder fan
  const spread = isM ? 70 : 84, th = -spread / 2 + (spread * i) / (N - 1), tr = th * Math.PI / 180;
  const L = CH * (isM ? 1.25 : 1.75);
  const px = isM ? 0 : -VW * 0.06, py = isM ? VH * 0.24 : VH * 0.62;
  return { x: px + Math.sin(tr) * L, y: py - Math.cos(tr) * L, r: th * 1.1, s: isM ? 0.96 : 1.28 };
}
const mix = (p, q, t) => ({ x: lerp(p.x, q.x, t), y: lerp(p.y, q.y, t), r: lerp(p.r, q.r, t), s: lerp(p.s, q.s, t) });
const backOut = (t) => { const c1 = 1.55, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const intro = { t: reduced ? 1 : 0, d: reduced ? 1 : 0, sq: 0 };
let ptrX = 0, ptrY = 0;
if (!coarse) addEventListener('pointermove', (e) => { ptrX = e.clientX / VW - 0.5; ptrY = e.clientY / VH - 0.5; });
let lastKey = '';
function heroFrame(T) {
  const r = hero.getBoundingClientRect();
  if (r.bottom < 0 || r.top > VH) return;
  const p = reduced ? 1 : clamp(-r.top / Math.max(1, r.height - VH));
  const tilt = isM || reduced ? 0 : ptrX * 6;
  let key = '';
  cards.forEach((c, i) => {
    const m = cst[i], a = stateStack(i), b = mix(stateFlower(i), stateLoud(i), m.k), f = mix(stateFan(i), stateFanLoud(i), m.k);
    const tr0 = clamp(intro.t * 1.3 - i * 0.04), ti = reduced ? 1 : backOut(tr0);
    const pi = eIO(clamp((p - 0.06 - i * 0.025) / 0.62));
    const fl = (1 - pi) * ti; // flower float only while in flower
    let x = lerp(lerp(a.x, b.x, ti), f.x, pi), y = lerp(lerp(a.y, b.y, ti), f.y, pi), rot = lerp(lerp(a.r, b.r, ti), f.r, pi), s = lerp(lerp(a.s, b.s, ti), f.s, pi);
    if (!reduced) { y += Math.sin(T * 1.3 + i) * 5 * fl; rot += Math.sin(T * 0.9 + i * 1.7) * 1.4 * fl; }
    if (tilt) { const ca = Math.cos(tilt * Math.PI / 180 * fl), sa = Math.sin(tilt * Math.PI / 180 * fl); const nx = x * ca - y * sa, ny = x * sa + y * ca; x = nx; y = ny; rot += tilt * fl; }
    const di = eOut(clamp(intro.d * 1.6 - i * 0.075));
    const enter = (1 - di) * VH * 0.85;
    rot += (1 - di) * (i % 2 ? 24 : -24) + (1 - eOut(tr0)) * -150 * clamp(ti) + m.spin;
    s *= (1 - 0.1 * intro.sq * (1 - tr0)) * (1 + 0.2 * m.pop);
    const tf = `translate3d(${x.toFixed(1)}px,${(y + enter).toFixed(1)}px,0) rotate(${rot.toFixed(2)}deg) scale(${s.toFixed(3)})`;
    key += tf; c.style.transform = tf; c.style.zIndex = String(pi > 0.5 ? i : N - Math.abs(i - N / 2));
  });
  // headline glides to the top-left as the deck folds
  const hp = eIO(clamp((p - 0.12) / 0.6));
  if (!isM) {
    const sc = lerp(1, 0.78, hp), dx = lerp(0, 40 - (VW / 2 - hlBox.w / 2), hp), dy = lerp(0, 110 - (VH / 2 - hlBox.h / 2), hp);
    hl.style.transform = `translate(calc(-50% + ${dx.toFixed(1)}px), calc(-50% + ${dy.toFixed(1)}px)) scale(${sc.toFixed(3)})`;
    hl.style.textAlign = hp > 0.5 ? 'left' : 'center';
  } else {
    const dy = lerp(0, -(VH * 0.5 - hlBox.h / 2 - 108), hp);
    hl.style.transform = `translate(-50%, calc(-50% + ${dy.toFixed(1)}px)) scale(${lerp(1, 0.9, hp).toFixed(3)})`;
  }
  const so = reduced ? 1 : clamp((p - 0.55) / 0.25);
  side.style.opacity = so; side.style.transform = `translateY(${((1 - so) * 30).toFixed(1)}px)`; side.classList.toggle('on', so > 0.5);
  $('.scroll-cue').style.opacity = String(0.75 * (1 - clamp(p / 0.15)));
  void key; void lastKey;
}

/* ---------- bento assembly ---------- */
function bento() {
  const b = $('.bento'); if (reduced) { b.classList.add('in'); return; }
  const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { b.classList.add('in'); io.disconnect(); } }, { threshold: 0.22 }); io.observe(b);
}

/* ---------- physics playground ---------- */
const physics = { loud() {} };
function playgroundLazy() { // phone: the physics engine only downloads when the playground is close
  if (window.Matter || !isM || reduced) return playground();
  const arena = $('#arena');
  const io = new IntersectionObserver(([en]) => {
    if (!en.isIntersecting) return; io.disconnect();
    const s = document.createElement('script'); s.src = '../../vendor/matter.min.js';
    s.onload = playground; s.onerror = playground; document.head.append(s);
  }, { rootMargin: '900px 0px' });
  io.observe(arena);
}
function playground() {
  const arena = $('#arena'), wrap = $('#pills'), idea = $('#idea');
  const all = $$('.ppill', wrap);
  if (reduced || !window.Matter) { wrap.classList.add('static'); idea.addEventListener('click', () => toast('Concept only: send the brief to Zyqor Studio instead.')); return; }
  const M = window.Matter, { Engine, Bodies, Body, Composite, Mouse, MouseConstraint, Events } = M;
  const engine = Engine.create({ gravity: { x: 0, y: 1.05 } });
  let W = arena.clientWidth, H = arena.clientHeight;
  const T = 400;
  const statics = [];
  function buildStatics() {
    statics.forEach((s) => Composite.remove(engine.world, s)); statics.length = 0;
    W = arena.clientWidth; H = arena.clientHeight;
    const ir = idea.getBoundingClientRect(), ar = arena.getBoundingClientRect();
    statics.push(
      Bodies.rectangle(W / 2, H + T / 2 - 2, W + T * 2, T, { isStatic: true }),
      Bodies.rectangle(-T / 2, H / 2, T, H * 4, { isStatic: true }),
      Bodies.rectangle(W + T / 2, H / 2, T, H * 4, { isStatic: true }),
      Bodies.rectangle(ir.left - ar.left + ir.width / 2, ir.top - ar.top + ir.height / 2, ir.width, ir.height, { isStatic: true, chamfer: { radius: 26 }, restitution: 0.9 }),
    );
    Composite.add(engine.world, statics);
  }
  buildStatics();
  const items = [];
  const max = isM ? 9 : all.length;
  let bounce = 0.55;
  physics.loud = (on) => {
    bounce = on ? 0.92 : 0.55; engine.gravity.y = on ? 1.25 : 1.05;
    items.forEach((it, i) => {
      it.body.restitution = bounce;
      if (vis) setTimeout(() => Body.setVelocity(it.body, { x: (Math.random() - 0.5) * (on ? 14 : 6), y: -(on ? 13 : 6) - Math.random() * (on ? 9 : 4) }), 260 + i * 18);
    });
  };
  function drop(el) {
    el.classList.add('on');
    const w = el.offsetWidth, h = el.offsetHeight;
    const x = clamp(W * (0.12 + Math.random() * 0.76), w / 2 + 4, W - w / 2 - 4);
    const body = Bodies.rectangle(x, -h - Math.random() * 120, w, h, { chamfer: { radius: h / 2 }, restitution: bounce, friction: 0.08, frictionAir: 0.012, density: 0.0018 });
    Body.setAngle(body, (Math.random() - 0.5) * 0.8); Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.08);
    Composite.add(engine.world, body); items.push({ el, body, w, h });
    if (isM) el.addEventListener('pointerdown', () => Body.applyForce(body, body.position, { x: (Math.random() - 0.5) * 0.04, y: -0.07 }));
  }
  let pool = all.slice(0, max); all.slice(max).forEach((e) => e.remove());
  let made = 0;
  const names = all.map((e) => e.textContent);
  idea.addEventListener('click', () => {
    if (items.length >= (isM ? 16 : 30)) { // recycle the oldest ones back to the top
      items.slice(0, 4).forEach((it) => { Body.setPosition(it.body, { x: W * (0.2 + Math.random() * 0.6), y: -80 }); Body.setVelocity(it.body, { x: 0, y: 0 }); });
      return;
    }
    for (let k = 0; k < 3; k++) {
      const el = document.createElement('span'); el.className = 'ppill' + (made % 3 === 0 ? ' alt' : made % 3 === 1 ? ' hot' : '');
      el.textContent = names[(made++ * 5 + 3) % names.length]; wrap.append(el); setTimeout(() => drop(el), k * 140);
    }
  });
  // keyboard: with the brief box focused, arrows shove the pile (Left/Right) or toss it (Up)
  idea.setAttribute('aria-keyshortcuts', 'ArrowLeft ArrowRight ArrowUp');
  idea.setAttribute('aria-label', 'Drop more pills. Arrow keys shove the pile left, right or up.');
  idea.addEventListener('keydown', (e) => {
    const f = { ArrowLeft: { x: -0.03, y: -0.02 }, ArrowRight: { x: 0.03, y: -0.02 }, ArrowUp: { x: 0, y: -0.08 } }[e.key];
    if (!f) return; e.preventDefault();
    items.forEach((it) => Body.applyForce(it.body, it.body.position, { x: f.x * (0.6 + Math.random() * 0.8) * it.body.mass * 0.5, y: f.y * (0.6 + Math.random() * 0.8) * it.body.mass * 0.5 }));
  });
  if (!isM && !coarse) {
    const mouse = Mouse.create(arena);
    ['mousewheel', 'DOMMouseScroll', 'wheel'].forEach((ev) => arena.removeEventListener(ev, mouse.mousewheel));
    const mc = MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.18, damping: 0.1, render: { visible: false } } });
    Composite.add(engine.world, mc);
    Events.on(mc, 'startdrag', () => arena.classList.add('grab'));
    Events.on(mc, 'enddrag', () => arena.classList.remove('grab'));
  }
  let running = false, started = false, vis = false;
  const io = new IntersectionObserver(([en]) => {
    vis = en.isIntersecting;
    if (vis && !started) { started = true; pool.forEach((el, i) => setTimeout(() => drop(el), 250 + i * 170)); }
    if (vis && !running) { running = true; requestAnimationFrame(step); }
  }, { threshold: 0.25 });
  io.observe(arena);
  let lastT = 0, acc = 0;
  function step(t) {
    if (!vis) { running = false; lastT = 0; return; }
    acc += lastT ? Math.min(50, t - lastT) : 16.6; lastT = t;
    let n = 0; while (acc >= 16.6 && n < 3) { Engine.update(engine, 16.6); acc -= 16.6; n++; }
    if (n === 3) acc = 0;
    for (const it of items) {
      const { x, y } = it.body.position;
      if (y > H + 300) { Body.setPosition(it.body, { x: W / 2, y: -100 }); Body.setVelocity(it.body, { x: 0, y: 0 }); }
      it.el.style.transform = `translate(${(x - it.w / 2).toFixed(1)}px,${(y - it.h / 2).toFixed(1)}px) rotate(${it.body.angle.toFixed(3)}rad)`;
    }
    requestAnimationFrame(step);
  }
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(buildStatics, 200); });
}

/* ---------- process line + giant wordmark ---------- */
const pline = $('.pline'), procS = $('.process'), giant = $('.giant'), gl = $$('.giant span');
function scrollFX() {
  const pr = procS.getBoundingClientRect(); pline.style.setProperty('--p', clamp((VH * 0.9 - pr.top) / (pr.height * 0.95)).toFixed(3));
  if (reduced) return;
  const g = giant.getBoundingClientRect(); const d = VH - g.top;
  gl.forEach((s, i) => { const t = eOut(clamp((d - i * g.height * 0.12) / (g.height * 0.95))); s.style.setProperty('--y', ((1 - t) * 105).toFixed(1) + '%'); });
}

/* ---------- Calm / Loud page mode ---------- */
const root = document.documentElement, modeEl = $('.mode'), modeBtns = $$('.mode-b'), thumb = $('.mode-th'), rings = $('.rings');
const themeMeta = $('meta[name="theme-color"]');
let loud = false, switching = false;
function placeThumb() {
  const b = modeBtns.find((x) => x.getAttribute('aria-pressed') === 'true') || modeBtns[0];
  thumb.style.width = b.offsetWidth + 'px'; thumb.style.transform = `translateX(${b.offsetLeft}px)`;
}
function pulseRings() { if (reduced) return; rings.classList.remove('go'); void rings.offsetWidth; rings.classList.add('go'); }
function relayoutSoon() { [120, 450, 900, 1400, 2100].forEach((t) => setTimeout(layout, t)); }
function applyMode(on) {
  loud = on; root.classList.toggle('loud', on);
  modeBtns.forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.mode === 'loud') === on)));
  placeThumb();
  if (themeMeta) themeMeta.content = on ? '#13229A' : '#F1EEE6';
  physics.loud(on);
}
function choreo(on) { // the cards, the headline and the rings react together
  const gs = window.gsap;
  if (reduced || !gs) { cst.forEach((m) => { m.k = on ? 1 : 0; m.spin = 0; m.pop = 0; }); return; }
  gs.killTweensOf(cst);
  gs.to(cst, { k: on ? 1 : 0, duration: 1.35, ease: 'expo.inOut', stagger: { each: 0.045, from: on ? 'start' : 'end' } });
  gs.fromTo(cst, { spin: 0 }, { spin: on ? 360 : -360, duration: 1.35, ease: 'power4.inOut', stagger: { each: 0.045, from: on ? 'start' : 'end' }, onComplete() { cst.forEach((m) => { m.spin = 0; }); } });
  gs.timeline().to(cst, { pop: 1, duration: 0.45, ease: 'power3.out', stagger: { each: 0.04, from: 'center' } })
    .to(cst, { pop: 0, duration: 1.1, ease: 'elastic.out(1,0.45)', stagger: { each: 0.04, from: 'center' } }, '>-0.15');
  gs.killTweensOf(chars);
  gs.fromTo(chars, { y: 0, scaleY: 1 }, { keyframes: [{ y: on ? -26 : -10, scaleY: on ? 1.22 : 1.06, duration: 0.24, ease: 'power4.out' }, { y: 0, scaleY: 1, duration: 0.9, ease: 'elastic.out(1,0.4)' }],
    stagger: { each: 0.03, from: on ? 'start' : 'end' }, delay: 0.12, clearProps: 'transform' });
  pulseRings(); relayoutSoon();
}
function setMode(on, ev) {
  if (on === loud || switching) return;
  const vtOK = !reduced && typeof document.startViewTransition === 'function';
  if (!vtOK) {
    if (!reduced) { root.classList.add('tween'); setTimeout(() => root.classList.remove('tween'), 1000); }
    applyMode(on); choreo(on); return;
  }
  const r = (ev && ev.currentTarget ? ev.currentTarget : modeEl).getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  const R = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy));
  switching = true;
  let vt;
  try { vt = document.startViewTransition(() => { applyMode(on); }); } catch (e) { switching = false; applyMode(on); choreo(on); return; }
  vt.ready.then(() => {
    root.animate({ clipPath: [`circle(0px at ${cx}px ${cy}px)`, `circle(${R}px at ${cx}px ${cy}px)`] },
      { duration: 1050, easing: 'cubic-bezier(.76,0,.24,1)', pseudoElement: '::view-transition-new(root)' });
    choreo(on);
  }).catch(() => choreo(on));
  vt.finished.finally(() => { switching = false; });
}
function modeUI() {
  modeBtns.forEach((b) => b.addEventListener('click', (e) => setMode(b.dataset.mode === 'loud', e)));
  modeEl.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return; e.preventDefault();
    const on = e.key === 'ArrowRight'; setMode(on); modeBtns[on ? 1 : 0].focus();
  });
  placeThumb(); addEventListener('resize', placeThumb);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeThumb);
  // step aside when the footer is on screen
  const foot = () => $('.zl-foot');
  const watch = () => { const f = foot(); if (!f) return setTimeout(watch, 400); new IntersectionObserver(([en]) => modeEl.classList.toggle('gone', en.isIntersecting), { threshold: 0.05 }).observe(f); };
  watch();
}

/* ---------- boot ---------- */
function boot() {
  layout(); addEventListener('resize', layout);
  smooth(); reveals(); pointerFX(); bento(); playgroundLazy();
  const gs = window.gsap;
  modeUI();
  if (!reduced && gs) {
    // 1 deck flies in and stacks, 2 squeeze + signal rings, 3 spiral bloom with overshoot, 4 headline rises thin and goes bold
    hl.classList.add('pre'); modeEl.classList.add('pre');
    const tl = gs.timeline({ delay: 0.2 });
    tl.to(intro, { d: 1, duration: 1.0, ease: 'none' })
      .to(intro, { sq: 1, duration: 0.28, ease: 'power2.in' }, '-=0.15')
      .add(pulseRings)
      .to(intro, { t: 1, duration: 1.9, ease: 'none' })
      .to(intro, { sq: 0, duration: 0.2 }, '<')
      .from('.hl-l > span', { yPercent: 115, duration: 1.1, ease: 'expo.out', stagger: 0.09 }, '<0.25')
      .add(() => hl.classList.remove('pre'), '<0.7')
      .add(() => { modeEl.classList.remove('pre'); placeThumb(); }, '<0.5');
  } else intro.t = 1;
  let t0 = performance.now();
  (function loop(now) { const T = (now - t0) / 1000; heroFrame(T); scrollFX(); requestAnimationFrame(loop); })(t0);
}
if (document.readyState === 'loading') addEventListener('DOMContentLoaded', boot); else boot();
