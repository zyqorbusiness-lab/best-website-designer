/* P041 Hotcoal Kitchen: app3d.js - scroll story for the 3D stage, the drag-to-drop builder, ticket and pickup form. */
import { createStage, sstep, clamp01, KINDS } from './pizza3d.js';
import { buildOven, OVEN_Z } from './oven3d.js';
const $ = (s, r = document) => r.querySelector(s); const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const phone = matchMedia('(max-width: 860px)').matches;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const stageEl = $('[data-stage]'); const canvas = $('.stage-c');
const lerp = (a, b, t) => a + (b - a) * t; const mix3 = (a, b, t) => a.map((v, i) => lerp(v, b[i], t));
const PRICE = { mozzarella: 2.5, tomato: 2, pepperoni: 3, mushroom: 2, olive: 1.5, pepper: 1.5, onion: 1, basil: 1 };
const NAME = { mozzarella: 'Fior di latte', tomato: 'Cherry tomato', pepperoni: 'Pepperoni', mushroom: 'Mushroom', olive: 'Black olive', pepper: 'Roast pepper', onion: 'Red onion', basil: 'Basil' };
const STORY = [['pepperoni', 0.55, 0.66, 8], ['tomato', 0.62, 0.73, 6], ['olive', 0.69, 0.8, 7], ['basil', 0.76, 0.88, 4]];

function glOK() { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } }
let st = null;
if (glOK()) {
  try { st = await createStage({ canvas, phone, extras: { oven: buildOven } }); }
  catch (e) { st = null; }
}
if (!st) { stageEl.classList.add('no-gl', 'is-fallback'); window.__stage = { ok: false, info: () => ({ ok: false, poster: 'poster.webp' }) }; }
else {
  window.__st = st; window.__stage = { ok: true, info: () => st.info() }; stageEl.classList.add('ready');
  const oven = st.parts.oven; oven.group.visible = false;
  st.tick((dt, t) => oven.group.visible && oven.tick(dt, t, st.camera));
  /* portrait fit: pull the camera back so the 2 m peel fits the narrow width, and frame the pizza in the free part of the screen */
  const fit = () => { const a = innerWidth / innerHeight; return a < 1 ? Math.min(2.4, 0.85 / a + 0.3) : a < 1.3 ? 1.15 : 1; };
  const view = (pos, look, sh, instant, kcap) => { const k = kcap ? Math.min(fit(), kcap) : fit(); const p = pos.map((v, i) => look[i] + (v - look[i]) * k); st.view(p, look, phone ? [0, sh[1]] : [sh[0], 0], instant); };

  let mode = ''; let boardRot = Math.PI + 0.6; let userSet = []; let makeBake = 0, makeHeat = 0; let spin = 0, spinV = reduced ? 0 : 0.18, drag = null;
  function useStory() { st.clear(); STORY.forEach(([k, , , n]) => st.add(k, n, { instant: true })); }
  function useUser() { st.clear(); for (const u of userSet) st.add(u.kind, u.n, { instant: true, at: u.at }); }
  function setMode(m) {
    if (m === mode) return; const prev = mode; mode = m;
    if (m === 'make') { useUser(); } else if (prev === 'make' || prev === '') { useStory(); }
    oven.group.visible = m === 'fire'; st.floor.visible = m !== 'fire';
    st.emberMat.uniforms.uAmt.value = m === 'hero' ? 0.9 : m === 'fire' ? 1 : 0.25;
  }
  const H = $('#hero'), S = $('#story'), F = $('#fire'), M = $('#make'), REAL = $('#real');
  const prog = (el) => { const r = el.getBoundingClientRect(); return clamp01(-r.top / Math.max(1, el.offsetHeight - innerHeight)); };
  let lastStep = -1;
  function update(instant) {
    const vh = innerHeight; const rS = S.getBoundingClientRect(), rF = F.getBoundingClientRect(), rM = M.getBoundingClientRect(), rR = REAL.getBoundingClientRect();
    stageEl.classList.toggle('off', rR.top < 0 && rM.bottom < 0);
    st.pause(rR.top < 0 && rM.bottom < 0);
    if (rS.top > vh * 0.5) { /* hero */
      setMode('hero'); boardRot = Math.PI + 0.6;
      st.set({ uBall: 0, uSauce: 1, uCheese: 1, uMelt: 1, uBake: 1, uHeat: 0 }); STORY.forEach(([k]) => st.setScrub(k, 1));
      st.pizza.position.z = 0; st.board.position.z = 0; st.rim.intensity = 5;
      view([0, 1.75, 3.35], [0, 0, 0], [0.22, -0.2], instant);
    } else if (rF.top > vh * 0.5) { /* story */
      setMode('story'); const p = prog(S); boardRot = lerp(Math.PI + 0.6, Math.PI * 2, sstep(0.8, 1, p));
      st.set({ uBall: 1 - sstep(0.02, 0.2, p), uSauce: sstep(0.2, 0.36, p), uCheese: sstep(0.38, 0.52, p), uMelt: 0.12 + 0.18 * sstep(0.45, 0.6, p), uBake: 0, uHeat: 0 });
      STORY.forEach(([k, a, b]) => st.setScrub(k, sstep(a, b, p)));
      st.pizza.position.z = 0; st.board.position.z = 0; st.rim.intensity = 2;
      const c0 = [0, 1.9, 2.8], c1 = [0, 3.4, 1.3], c2 = [1.0, 2.4, 2.5];
      const cp = p < 0.5 ? mix3(c0, c1, sstep(0, 0.5, p)) : mix3(c1, c2, sstep(0.5, 1, p));
      view(cp, [0, 0.05, 0], [0.22, -0.2], instant);
      spin = lerp(spin, 0, 0.1);
      const step = Math.min(3, Math.floor(p * 4.0 + 0.0001 - (p > 0.2 ? 0 : 0)));
      const s2 = p < 0.2 ? 0 : p < 0.37 ? 1 : p < 0.53 ? 2 : 3;
      if (s2 !== lastStep) { lastStep = s2; $$('#steps li').forEach((li, i) => li.classList.toggle('on', i === s2)); $('#st-n').textContent = (s2 + 1) + ' / 4'; }
      $('#st-bar').style.transform = `scaleX(${p.toFixed(3)})`;
    } else if (rM.top > vh * 0.45) { /* fire */
      setMode('fire'); const f = prog(F); boardRot = Math.PI * 2; spin = 0;
      STORY.forEach(([k]) => st.setScrub(k, 1));
      const z = lerp(0, OVEN_Z, sstep(0.04, 0.48, f));
      st.pizza.position.z = z; st.board.position.z = z;
      const bake = sstep(0.5, 0.93, f);
      st.set({ uBall: 0, uSauce: 1, uCheese: 1, uMelt: 0.08 + 0.92 * sstep(0.5, 0.75, f), uBake: bake, uHeat: sstep(0.45, 0.6, f) * (1 - 0.6 * sstep(0.93, 1, f)) });
      oven.set(0.35 + 0.65 * sstep(0.2, 0.5, f)); st.rim.intensity = 2 + 4 * sstep(0.3, 0.6, f);
      let pos, look, kc = 0;
      if (f < 0.48) { const t = sstep(0, 0.48, f); pos = mix3([1.0, 2.4, 2.5], [0.0, 1.25, OVEN_Z + 5.4], t); look = mix3([0, 0.05, 0], [0, 0.45, OVEN_Z], t); }
      else { const t = sstep(0.48, 0.82, f); pos = mix3([0.0, 1.25, OVEN_Z + 5.4], [0.55, 0.62, OVEN_Z + 1.25], t); look = mix3([0, 0.45, OVEN_Z], [0, 0.0, OVEN_Z], t); kc = lerp(2.4, 1.5, t); }
      view(pos, look, [0.18, -0.2], instant, kc);
      $('#clock').textContent = String(Math.round(sstep(0.5, 0.93, f) * 90)).padStart(2, '0');
      $('#f-line').textContent = f < 0.5 ? 'Oak burns at the back. The peel slides in and the stone does the rest.' : f < 0.93 ? 'The rim blisters, the cheese pools, the pepperoni cups.' : 'Out in ninety seconds. Now build your own.';
    } else { /* make */
      setMode('make'); boardRot = Math.PI + 0.6;
      st.pizza.position.z = 0; st.board.position.z = 0; st.rim.intensity = 3;
      st.set({ uBall: 0, uSauce: 1, uCheese: 1, uMelt: 0.55 + 0.45 * makeBake, uBake: makeBake, uHeat: makeHeat });
      view([0, 3.1, 2.3], [0, 0, 0], [0.22, -0.22], instant);
    }
  }
  st.tick((dt) => {
    let moving = false;
    if ((mode === 'hero' || mode === 'make') && !drag && !reduced) { spin += spinV * dt * (mode === 'hero' ? 1 : 0.25); moving = mode === 'hero'; }
    st.pizza.rotation.y = spin; st.board.rotation.y = boardRot + spin * (mode === 'fire' ? 0 : 0.15);
    return moving;
  });
  /* hero: drag to turn */
  addEventListener('pointerdown', (e) => { if (mode !== 'hero' || e.target.closest('a,button,input,label')) return; drag = { x: e.clientX, s: spin }; });
  addEventListener('pointermove', (e) => { if (!drag) return; spin = drag.s + (e.clientX - drag.x) * 0.008; st.invalidate(); });
  addEventListener('pointerup', () => { drag = null; }); addEventListener('pointercancel', () => { drag = null; });

  /* builder */
  const tList = $('#t-list'), tTot = $('#t-tot'), tClear = $('#t-clear'), fireBtn = $('#fire-it');
  function ticket() {
    const counts = {}; userSet.forEach((u) => (counts[u.kind] = (counts[u.kind] || 0) + 1));
    const keys = Object.keys(counts); let tot = 9;
    keys.forEach((k) => (tot += PRICE[k] * counts[k]));
    tList.textContent = keys.length ? keys.map((k) => NAME[k] + (counts[k] > 1 ? ' x' + counts[k] : '')).join(', ') : 'Nothing on top yet.';
    tTot.textContent = '$' + tot.toFixed(2); tClear.disabled = !keys.length;
    $$('.chip3').forEach((c) => c.classList.toggle('n1', !!counts[c.dataset.type]));
    const sum = $('#od-sum'); if (sum) sum.textContent = 'Your pizza: marinara base' + (keys.length ? ' with ' + keys.map((k) => NAME[k].toLowerCase()).join(', ') : '') + ', $' + tot.toFixed(2) + ' (sample price).';
  }
  function unbake() { if (makeBake > 0) { makeBake = 0; makeHeat = 0; fireBtn.textContent = 'Fire it'; update(); } }
  function addUser(kind, at) {
    if (userSet.filter((u) => u.kind === kind).length >= 3) return;
    unbake(); const n = Math.max(3, Math.round(KINDS[kind].n * (at ? 0.6 : 1)));
    userSet.push({ kind, n, at }); if (mode === 'make') st.add(kind, n, { at }); ticket();
  }
  $$('.preset').forEach((b) => b.addEventListener('click', () => {
    $$('.preset').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    unbake(); userSet = []; st.clear(); b.dataset.load.split(',').forEach((k, i) => { userSet.push({ kind: k, n: KINDS[k].n }); st.add(k, KINDS[k].n, { delay: i * 0.25 }); }); ticket();
  }));
  tClear.addEventListener('click', () => { userSet = []; st.clear(); unbake(); $$('.preset').forEach((x) => x.setAttribute('aria-pressed', 'false')); ticket(); });
  fireBtn.addEventListener('click', () => {
    if (makeBake >= 1) { location.hash = '#visit'; return; }
    const t0 = performance.now(), dur = reduced ? 1 : 2600; fireBtn.disabled = true;
    const step = (now) => { const t = clamp01((now - t0) / dur); makeBake = sstep(0, 1, t); makeHeat = Math.sin(t * Math.PI) * 0.9; update();
      if (t < 1) requestAnimationFrame(step); else { makeHeat = 0; update(); fireBtn.disabled = false; fireBtn.textContent = 'Order this one'; } };
    requestAnimationFrame(step);
  });
  /* drag a chip onto the pizza (mouse + touch); a tap adds a handful */
  $$('.chip3').forEach((chip) => {
    chip.addEventListener('pointerdown', (e) => {
      const kind = chip.dataset.type; const x0 = e.clientX, y0 = e.clientY; let ghost = null; const pid = e.pointerId;
      chip.setPointerCapture(pid);
      const move = (ev) => { if (!ghost && Math.hypot(ev.clientX - x0, ev.clientY - y0) > 8) { ghost = chip.querySelector('img').cloneNode(); ghost.className = 'ghost3'; document.body.appendChild(ghost); }
        if (ghost) { ghost.style.transform = `translate(${ev.clientX}px,${ev.clientY}px)`; const h = st.pick(ev.clientX, ev.clientY); ghost.classList.toggle('on-pizza', !!(h && h.on)); } };
      const up = (ev) => { chip.removeEventListener('pointermove', move); chip.removeEventListener('pointerup', up); chip.removeEventListener('pointercancel', up);
        if (ghost) { ghost.remove(); const h = st.pick(ev.clientX, ev.clientY); if (h && h.on) addUser(kind, { x: h.x, z: h.z }); }
        else if (ev.type === 'pointerup') addUser(kind); };
      chip.addEventListener('pointermove', move); chip.addEventListener('pointerup', up); chip.addEventListener('pointercancel', up);
    });
    chip.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); addUser(chip.dataset.type); } });
  });
  let raf = 0; const onScroll = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; update(); }); };
  addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', () => update(true));
  update(true); ticket();
}

/* pickup form (concept: nothing is sent) */
const chips = $('#chips');
if (chips) { const now = new Date(); ['ASAP, about 20 min', '+30 min', '+45 min', '+60 min'].forEach((t, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = t; b.setAttribute('aria-pressed', String(i === 0)); b.addEventListener('click', () => $$('.chip', chips).forEach((x) => x.setAttribute('aria-pressed', String(x === b)))); chips.appendChild(b); }); }
const form = $('#order-form');
if (form) form.addEventListener('submit', (e) => {
  e.preventDefault(); const n = $('#od-name'), p = $('#od-phone'); let ok = true;
  const err = (el, msg) => { $('#' + el.id + '-err').textContent = msg; el.setAttribute('aria-invalid', msg ? 'true' : 'false'); if (msg) ok = false; };
  err(n, n.value.trim().length < 2 ? 'Add your name, two letters or more.' : ''); err(p, (p.value.match(/\d/g) || []).length < 7 ? 'Add a phone number, seven digits or more.' : '');
  if (!ok) return; form.hidden = true; const s = $('#od-ok'); s.hidden = false; $('#od-echo').textContent = 'Thanks, ' + n.value.trim().split(' ')[0] + '. ' + ($('#od-sum')?.textContent || ''); s.focus();
});
$('#od-again')?.addEventListener('click', () => { form.hidden = false; $('#od-ok').hidden = true; form.reset(); });
const hrs = $('#hours'); if (hrs) { const d = new Date().getDay(); $$('tr', hrs).forEach((tr) => tr.classList.toggle('today', tr.dataset.d.split(',').map(Number).includes(d))); }
