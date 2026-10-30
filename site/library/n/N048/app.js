/* N048 Ironbark Barbers (best-4 build, Oct 31 2026). Shared app for index.html (desktop) and m.html (phone).
   Beats: poster -> hero chair turns into view and settles (hydraulic dip) -> drag / swipe / arrow keys swing it onto one
   of six services (detents every 60 deg) -> #shop: the camera pulls back and the lamps come on -> #services: scroll swings
   the chair through all six, the chalkboard writes each price, the mirror name swaps -> #visit-steps barber pole ->
   #book (service synced with the chair both ways) -> #hours. One rAF scroll engine, progress lerped 0.12 per frame. */
import { createStage, THREE, isM, reduced, damp, clamp } from '../../_kit/stage.js';

const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
if (reduced) document.documentElement.classList.add('rm');
const SERV = [
  { name: 'Classic cut', time: '35 min', price: 35, inc: ['A quick talk about what you want', 'Scissors on top, clippers at the sides', 'Wash and a warm towel', 'Finished and styled'] },
  { name: 'Skin fade', time: '45 min', price: 40, inc: ['Down to the skin at the neck', 'Blended up by hand', 'Sharp line-up at the edges', 'Hot lather on the neckline'] },
  { name: 'Hot towel shave', time: '30 min', price: 35, inc: ['Two hot towels to soften', 'Pre-shave oil and a rich lather', 'Straight razor, with and against', 'Cold towel and balm to close'] },
  { name: 'Beard shape', time: '20 min', price: 20, inc: ['Lined at the cheek and neck', 'Trimmed to the jaw', 'Hot towel at the end', 'A drop of beard oil'] },
  { name: 'Father and son', time: '60 min', price: 60, inc: ['Two chairs side by side', 'Two cuts, one booking', 'Kids under 12 sit first', 'Same time, same mirror'] },
  { name: 'Tidy up', time: '15 min', price: 15, inc: ['Neckline cleaned up', 'Around the ears', 'Brows if you want', 'Between two full cuts'] }
];
const N = SERV.length, STEP = (Math.PI * 2) / N, pad = (i) => String(i + 1).padStart(2, '0');
const live = $('#live');

/* ---------- reveals (opacity + 20px rise, 460 ms, 60 ms stagger) ---------- */
{
  const els = $$('[data-rv]');
  if (reduced || !('IntersectionObserver' in window)) els.forEach((e) => e.classList.add('in'));
  else {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (!e.isIntersecting) return; const sib = $$('[data-rv]', e.target.parentElement); e.target.style.transitionDelay = Math.max(0, sib.indexOf(e.target)) * 60 + 'ms'; e.target.classList.add('in'); io.unobserve(e.target); }), { rootMargin: '0px 0px -8% 0px' });
    els.forEach((e) => io.observe(e));
  }
}

/* ---------- phone nav sheet ---------- */
const mb = $('#nav-menu');
if (mb) {
  const sh = $('#nav-sheet');
  mb.addEventListener('click', () => { const o = sh.hidden; sh.hidden = !o; mb.setAttribute('aria-expanded', String(o)); mb.textContent = o ? 'Close' : 'Menu'; });
  $$('a', sh).forEach((a) => a.addEventListener('click', () => { sh.hidden = true; mb.setAttribute('aria-expanded', 'false'); mb.textContent = 'Menu'; }));
}
$('#open-credits').addEventListener('click', () => { const b = $$('.zk-bar button, .zk-bar a').find((x) => /credit/i.test(x.textContent + (x.getAttribute('aria-label') || ''))); if (b) b.click(); else $('.foot-cred').scrollIntoView(); });

/* ---------- ticket + ring + rail + form, one source of truth ---------- */
let picked = 0;
const sel = $('#f-svc');
function pick(i, from) {
  picked = i;
  $('#tk-i').textContent = pad(i) + ' / 06'; $('#tk-h').textContent = SERV[i].name; $('#tk-b').textContent = SERV[i].inc[1] + '.';
  $('#tk-t').textContent = SERV[i].time; $('#tk-p').textContent = '$' + SERV[i].price;
  const tk = $('#ticket'); tk.classList.remove('flash'); void tk.offsetWidth; tk.classList.add('flash');
  $$('.rs').forEach((li) => li.classList.toggle('is-on', +li.dataset.i === i));
  $$('#rail .chip').forEach((b) => { const on = +b.dataset.face === i; b.setAttribute('aria-pressed', String(on)); });
  if (isM && from !== 'rail') { const c = $(`#rail .chip[data-face="${i}"]`); if (c) { const r = $('#rail'); r.scrollTo({ left: c.offsetLeft - (r.clientWidth - c.offsetWidth) / 2, behavior: reduced ? 'auto' : 'smooth' }); } }
  if (from !== 'form') sel.value = String(i);
}
pick(0);

/* ---------- hero chair ---------- */
let heroSwing = () => {};
let chairReady; const chairScene = new Promise((r) => (chairReady = r));   /* the shop reuses the hero's chair (one download) */
(async () => {
  const el = $('#hero-stage');
  const stage = await createStage({
    el, exposure: 1.0, envIntensity: 1.0, fitFov: true, lazy: false, demand: true,
    camera: { fov: 30, position: [0, 1.4, 3.7], target: [0, 0.7, 0.12] },
    label: 'Ironbark Barbers: a vintage barber chair. Drag sideways or use the arrow keys to swing it onto a service.'
  });
  if (stage.failed) { chairReady(null); return; }
  const g = await stage.load(stage.asset('models/barbershopchair_01.glb'));
  const chair = g.scene; chairReady(chair.clone(true));
  const base = new THREE.Group(), lift = new THREE.Group(); lift.add(chair); base.add(lift); stage.add(base);
  stage.contactShadow({ size: 2.6, opacity: 0.5, blur: 2.4, color: 0x17303a });
  const keyL = new THREE.DirectionalLight(0xfff0dc, 1.35); keyL.position.set(-2.5, 5, 3); stage.scene.add(keyL);
  const turn = stage.spin(base, { auto: 0, friction: 0.92, sensitivity: 0.35 * Math.PI / 180, onStart: () => { el.classList.add('has-turned'); target = null; } });
  let target = reduced ? null : 0, dipT = 9, last = -1, settledOn = -1;
  turn.angle = reduced ? 0 : Math.PI; base.rotation.y = turn.angle;
  const heading = (a) => ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const nearest = () => Math.round(heading(turn.angle) / STEP) % N;
  heroSwing = (i, why) => {
    const now = turn.angle, want = i * STEP; const d = Math.atan2(Math.sin(want - now), Math.cos(want - now));
    target = now + d; turn.velocity = 0; el.classList.add('has-turned');
    if (why) live.textContent = 'The chair swings to ' + SERV[i].name + '.'; stage.invalidate();
  };
  /* arrow keys step one service (replaces the kit's free nudge) */
  stage.renderer.domElement.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return; e.preventDefault(); e.stopImmediatePropagation();
    const i = (nearest() + (e.key === 'ArrowRight' ? 1 : N - 1)) % N; heroSwing(i, true); pick(i, 'chair');
  }, true);
  stage.onFrame((dt) => {
    let busy = false;
    if (target !== null) {
      turn.angle = reduced ? target : damp(turn.angle, target, 6.5, dt); turn.velocity = 0;
      if (Math.abs(turn.angle - target) < 0.002) { turn.angle = target; target = null; }
      busy = true;
    } else if (!turn.dragging && Math.abs(turn.velocity) < 0.01) {            /* detent: pull to the nearest 60 deg slot */
      const snap = Math.round(turn.angle / STEP) * STEP;
      if (Math.abs(snap - turn.angle) > 0.002) { turn.angle += (snap - turn.angle) * (1 - Math.pow(1 - 0.18, dt * 60)); busy = true; }
      else if (settledOn !== nearest()) { turn.angle = snap; settledOn = nearest(); if (!reduced) dipT = 0; }
    }
    base.rotation.y = turn.angle;
    const n = nearest(); if (n !== last) { last = n; if (target === null || turn.dragging) pick(n, 'chair'); }
    dipT += dt; let dip = 0;
    if (dipT < 0.58) { dip = dipT < 0.16 ? -0.02 * (1 - Math.pow(1 - dipT / 0.16, 3)) : -0.02 * Math.pow(1 - (dipT - 0.16) / 0.42, 4); busy = true; }
    lift.position.y = dip;
    return busy;
  });
  stage.loaded();
  requestAnimationFrame(() => el.classList.add('live'));
})();
$$('.rs button, #rail .chip').forEach((b) => b.addEventListener('click', () => { const i = +b.dataset.face; pick(i, b.closest('#rail') ? 'rail' : 'ring'); heroSwing(i, true); }));
sel.addEventListener('change', () => { const i = +sel.value; pick(i, 'form'); heroSwing(i, true); });
$('#tk-book').addEventListener('click', () => { sel.value = String(picked); });

/* ---------- the shop world (#shop + #services) ---------- */
let world = null;
const W = $('#world'), wsvc = $('#w-svc'), wshop = $('#w-shop');
function showSlot(i) {
  $('#sv-idx').textContent = pad(i); $('#sv-cur').textContent = SERV[i].name; $('#sv-t').textContent = SERV[i].time; $('#sv-p').textContent = '$' + SERV[i].price;
  $('#sv-inc').innerHTML = SERV[i].inc.map((x) => `<li>${x}</li>`).join('');
  $$('.sv-dots li').forEach((d, k) => d.classList.toggle('on', k === i));
  wsvc.classList.remove('swap'); void wsvc.offsetWidth; wsvc.classList.add('swap');
}
showSlot(0);
const near = new IntersectionObserver(async ([e]) => {
  if (!e.isIntersecting || world) return; near.disconnect();
  try { const { createShop } = await import('./shop.js'); world = await createShop({ el: $('#w-stage'), services: SERV, chair: chairScene }); if (world && !world.failed) { world.onSlot = showSlot; W.classList.add('live'); } } catch (err) { W.classList.add('nogl'); }
}, { rootMargin: '100% 0px' });
near.observe(W);

/* ---------- visit steps ---------- */
const VS = $('#visit-steps'), stripes = $('.pole-stripes'), stepEls = $$('.vs-step'), TH = [0.15, 0.38, 0.61, 0.84];

/* ---------- one scroll engine ---------- */
const prog = { shop: reduced ? 1 : 0, serv: 0, vs: reduced ? 1 : 0 };
const want = { ...prog };
let lastSlotShown = 0;
function read() {
  const vh = innerHeight;
  const r = W.getBoundingClientRect(), shopH = $('#shop').offsetHeight, S = r.height - vh, y = -r.top;
  const shopLen = shopH - vh * 0.5, servStart = shopH - vh * 0.3, servLen = Math.max(1, S - servStart);
  want.shop = clamp(y / shopLen); want.serv = y > servStart ? clamp((y - servStart) / servLen) : 0;
  const v = VS.getBoundingClientRect(); want.vs = clamp(-v.top / Math.max(1, v.height - vh));
}
let tPrev = performance.now();
function frame(now) {
  const dt = Math.min(0.25, Math.max(0, (now - tPrev) / 1000)); tPrev = now;
  if (!reduced) {
    read();
    const k12 = 1 - Math.pow(1 - 0.12, dt * 60);          /* 0.12 per frame at 60 fps, the same feel on a slow phone */
    for (const k of ['shop', 'serv', 'vs']) prog[k] += (want[k] - prog[k]) * k12;
    if (Math.abs(want.serv - prog.serv) < 0.0005) prog.serv = want.serv;
    W.style.setProperty('--sp', prog.shop.toFixed(4)); W.style.setProperty('--vp', prog.serv.toFixed(4));
    const inServ = prog.serv > 0.001;
    wshop.classList.toggle('on', prog.shop > 0.62 && !inServ); wsvc.classList.toggle('on', inServ);
    if (world) world.set(prog.shop, prog.serv);
    else { const s = inServ ? Math.min(N - 1, Math.floor(prog.serv * N)) : 0; if (s !== lastSlotShown) { lastSlotShown = s; showSlot(s); } }
    stripes.style.transform = `translateY(${(prog.vs * 400).toFixed(1)}px)`;
    stepEls.forEach((s, i) => s.classList.toggle('lit', prog.vs >= TH[i]));
  }
  requestAnimationFrame(frame);
}
if (reduced) { stepEls.forEach((s) => s.classList.add('lit')); wshop.classList.add('on'); }
requestAnimationFrame(frame);

/* ---------- booking ---------- */
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dayUl = $('#days'), today = new Date();
for (let k = 0; k < 7; k++) {
  const d = new Date(today); d.setDate(today.getDate() + k); const closed = d.getDay() === 1;
  const li = document.createElement('li');
  li.innerHTML = `<button class="chip dchip" type="button" aria-pressed="false" data-day="${k}"${closed ? ' disabled aria-disabled="true"' : ''}><span>${k === 0 ? 'Today' : k === 1 ? 'Tomorrow' : DAYS[d.getDay()]}</span><small class="mono">${closed ? 'closed' : d.getDate() + ' ' + MON[d.getMonth()]}</small></button>`;
  li.firstChild.dataset.label = (k === 0 ? 'today' : k === 1 ? 'tomorrow' : DAYS[d.getDay()] + ' ' + d.getDate() + ' ' + MON[d.getMonth()]);
  dayUl.append(li);
}
const group = (ul) => ul.addEventListener('click', (e) => { const b = e.target.closest('.chip'); if (!b || b.disabled) return; $$('.chip', ul).forEach((c) => c.setAttribute('aria-pressed', String(c === b))); ul.parentElement.querySelector('.err').hidden = true; });
group(dayUl); group($('#times'));
const form = $('#bk-form'), done = $('#bk-done'), go = $('#bk-go');
const tel = $('#f-tel'), nm = $('#f-name');
[nm, tel].forEach((i) => i.addEventListener('input', () => { i.removeAttribute('aria-invalid'); $('#e-' + (i === nm ? 'name' : 'tel')).hidden = true; }));
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const day = $('#days .chip[aria-pressed="true"]'), time = $('#times .chip[aria-pressed="true"]');
  const bad = []; $$('.err', form).forEach((x) => (x.hidden = true)); [nm, tel].forEach((x) => x.removeAttribute('aria-invalid'));
  if (!day) { $('#e-day').hidden = false; bad.push($('#days .chip:not([disabled])')); }
  if (!time) { $('#e-time').hidden = false; bad.push($('#times .chip:not([disabled])')); }
  if (nm.value.trim().length < 2) { $('#e-name').hidden = false; nm.setAttribute('aria-invalid', 'true'); bad.push(nm); }
  if (tel.value.replace(/\D/g, '').length < 7) { $('#e-tel').hidden = false; tel.setAttribute('aria-invalid', 'true'); bad.push(tel); }
  if (bad.length) { bad[0].focus(); return; }
  go.disabled = true; go.textContent = 'Holding your chair';
  setTimeout(() => {
    const s = SERV[+sel.value];
    $('#bk-sum').textContent = `${s.name} (${s.time}, $${s.price} sample price), ${day.dataset.label} at ${time.dataset.time}, for ${nm.value.trim()}.`;
    form.hidden = true; done.hidden = false; done.focus(); go.disabled = false; go.textContent = 'Hold my chair';
  }, reduced ? 0 : 700);
});
$('#bk-again').addEventListener('click', () => { done.hidden = true; form.hidden = false; sel.focus(); });

/* ---------- hours: today ---------- */
{ const tr = $(`.hr-t tr[data-d="${today.getDay()}"]`); if (tr) { tr.classList.add('today'); tr.querySelector('th').insertAdjacentHTML('beforeend', ' <small class="mono">today</small>'); } }
