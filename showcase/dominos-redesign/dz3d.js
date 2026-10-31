/* dz3d.js - the 3D layer of the Domino's redesign concept (unofficial; not affiliated with Domino's).
   One WebGL canvas that moves between three slots: the hero (a box opens on a hot pizza, the camera dips in as you scroll),
   the builder (toppings drop onto the pizza in 3D, drag to turn it) and the tracker (dough -> bake -> box closes -> on its way).
   Pizza geometry and shaders: pizza3d.js. Surfaces: real CC photographs (img/3d/*.credit.json). Box and street: our geometry. */
import { createStage, sstep, clamp01, KINDS } from './pizza3d.js';
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const phone = matchMedia('(max-width: 760px)').matches;
const lerp = (a, b, t) => a + (b - a) * t;
function glOK() { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } }

function kraftTexture(THREE, top) {
  const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d');
  g.fillStyle = top ? '#C99A63' : '#D6B07E'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(${90 + Math.random() * 60},${60 + Math.random() * 40},30,${Math.random() * 0.08})`; g.fillRect(Math.random() * 512, Math.random() * 512, 1 + Math.random() * 3, 1); }
  if (top) {
    g.strokeStyle = '#043440'; g.lineWidth = 10; g.beginPath(); g.arc(256, 226, 120, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 6; for (let a = 0; a < 6; a++) { g.beginPath(); g.moveTo(256, 226); g.lineTo(256 + Math.cos(a * Math.PI / 3) * 120, 226 + Math.sin(a * Math.PI / 3) * 120); g.stroke(); }
    g.fillStyle = '#B14D1A'; [[220, 190], [300, 200], [250, 280], [200, 250], [305, 262]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 13, 0, Math.PI * 2); g.fill(); });
    g.fillStyle = '#043440'; g.textAlign = 'center'; g.font = '800 44px "Bricolage Grotesque", sans-serif'; g.fillText('HOT & FRESH', 256, 410);
    g.font = '600 20px "DM Sans", sans-serif'; g.fillText('UNOFFICIAL REDESIGN CONCEPT', 256, 448);
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
function buildBox(ctx) {
  const { THREE, scene } = ctx;
  const W = 2.36, Hh = 0.36, T = 0.03; const g = new THREE.Group(); scene.add(g);
  const side = new THREE.MeshStandardMaterial({ map: kraftTexture(THREE, false), roughness: 0.85 });
  const topM = new THREE.MeshStandardMaterial({ map: kraftTexture(THREE, true), roughness: 0.8 });
  const inside = new THREE.MeshStandardMaterial({ color: 0xe9d3ad, roughness: 0.9 });
  const add = (geo, mat, x, y, z, parent = g) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; };
  add(new THREE.BoxGeometry(W, T, W), inside, 0, -T / 2 - 0.0, 0);
  add(new THREE.BoxGeometry(W, Hh, T), side, 0, Hh / 2, W / 2); add(new THREE.BoxGeometry(W, Hh, T), side, 0, Hh / 2, -W / 2);
  add(new THREE.BoxGeometry(T, Hh, W), side, W / 2, Hh / 2, 0); add(new THREE.BoxGeometry(T, Hh, W), side, -W / 2, Hh / 2, 0);
  const hinge = new THREE.Group(); hinge.position.set(0, Hh, -W / 2); g.add(hinge);
  const lid = add(new THREE.BoxGeometry(W + 0.02, T, W + 0.02), [side, side, topM, inside, side, side], 0, T / 2, W / 2 + 0.01, hinge);
  add(new THREE.BoxGeometry(W + 0.02, Hh * 0.9, T), side, 0, -Hh * 0.45, W + 0.02, hinge);
  /* the street for the last tracker step: a paper-map road with a pin */
  const street = new THREE.Group(); street.visible = false; scene.add(street);
  const sc = document.createElement('canvas'); sc.width = 1024; sc.height = 512; const s2 = sc.getContext('2d');
  s2.fillStyle = '#EDE7DE'; s2.fillRect(0, 0, 1024, 512); s2.fillStyle = '#d9cfbf'; for (let i = 0; i < 9; i++) s2.fillRect(i * 120 + 10, 30, 90, 130), s2.fillRect(i * 120 + 40, 350, 90, 140);
  s2.fillStyle = '#c9c0b2'; s2.fillRect(0, 200, 1024, 110); s2.strokeStyle = '#F5EEE4'; s2.setLineDash([40, 30]); s2.lineWidth = 8; s2.beginPath(); s2.moveTo(0, 255); s2.lineTo(1024, 255); s2.stroke();
  const stex = new THREE.CanvasTexture(sc); stex.colorSpace = THREE.SRGBColorSpace;
  const road = new THREE.Mesh(new THREE.PlaneGeometry(16, 8), new THREE.MeshStandardMaterial({ map: stex, roughness: 1 })); road.rotation.x = -Math.PI / 2; road.position.y = -0.08; road.receiveShadow = true; street.add(road);
  const pin = new THREE.Group(); const pm = new THREE.MeshStandardMaterial({ color: 0xb14d1a, roughness: 0.4 });
  const pb = new THREE.Mesh(new THREE.SphereGeometry(0.32, 24, 16), pm); pb.position.y = 1.0; pin.add(pb);
  const pc = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.75, 24), pm); pc.rotation.x = Math.PI; pc.position.y = 0.55; pin.add(pc);
  const pd = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), new THREE.MeshStandardMaterial({ color: 0xf5eee4 })); pd.position.set(0, 1.02, 0.27); pin.add(pd);
  pin.position.set(5.5, 0, 0); pin.traverse((o) => (o.castShadow = true)); street.add(pin);
  return { group: g, hinge, street, pin, setLid(a) { hinge.rotation.x = -a; } };
}

const PRESET = { pepperoni: [['pepperoni', 10]], cheesepull: [['mozzarella', 8]], garden: [['pepper', 6], ['onion', 5], ['olive', 8], ['tomato', 6], ['mushroom', 5]], supreme: [['pepperoni', 7], ['mushroom', 6], ['olive', 8], ['pepper', 5], ['onion', 4]] };
const EXTRA = { Mushrooms: ['mushroom', 5], Olives: ['olive', 7], 'Jalapeños': ['jalapeno', 7], Onions: ['onion', 5] };
const SIZE = { Small: 0.8, Medium: 0.9, Large: 1 };

if (glOK()) {
  const canvas = document.createElement('canvas'); canvas.className = 'dz3'; canvas.setAttribute('aria-hidden', 'true');
  const slots = { hero: $('.hero-media'), build: $('#stage'), track: $('.track-media') };
  slots.hero.appendChild(canvas);
  let st;
  try { st = await createStage({ canvas, img: 'img/3d/', phone, board: false, extras: { box: buildBox } }); } catch (e) { st = null; canvas.remove(); }
  if (st) {
    window.__st = st; window.__stage = { ok: true, info: () => st.info() }; document.documentElement.classList.add('has3d');
    const box = st.parts.box; st.rim.color.set(0xffa25a);
    let slot = '', heroLid = RM ? 1 : 0, preset = 'pepperoni', extras = new Set(), size = 1, sizeT = 1, spin = 0, drag = null, tStep = -1, tT = 1, tFrom = 0;
    const setPizza = (kind, stagger) => { st.clear(); (PRESET[kind] || []).forEach(([k, n], i) => st.add(k, n, { instant: !stagger, delay: stagger ? 0.15 + i * 0.22 : 0 })); extras.forEach((t) => { const e = EXTRA[t]; if (e) st.add(e[0], e[1], { instant: !stagger, delay: stagger ? 0.9 : 0 }); }); };
    function enter(name) {
      if (slot === name && canvas.parentElement === slots[name]) return; slot = name; slots[name].appendChild(canvas);
      if (name === 'hero') { setPizza('supreme'); }
      if (name === 'build') { setPizza(preset); }
      if (name === 'track') { setPizza('pepperoni'); tStep = -1; }
      apply(true);
    }
    function apply(instant) {
      const r = slots[slot].getBoundingClientRect(); const vh = innerHeight;
      const a = r.width / Math.max(1, r.height);
      const k = a < 1 ? Math.min(2.2, 0.95 / a + 0.15) : 1;
      const V = (p, l) => st.view(p.map((v, i) => l[i] + (v - l[i]) * k), l, [0, 0], instant);
      if (slot === 'hero') {
        const p = clamp01((-r.top + 60) / Math.max(1, r.height));
        box.group.visible = true; box.street.visible = false; box.group.position.set(0, -0.03, 0); box.group.rotation.y = 0; st.pizza.position.set(0, 0.0, 0); st.pizza.scale.setScalar(0.96);
        box.setLid(lerp(0.15, 1.95, heroLid)); st.set({ uBall: 0, uSauce: 1, uCheese: 1, uMelt: 1, uBake: 1, uHeat: 0 }); st.emberMat.uniforms.uAmt.value = 0.6; st.rim.intensity = 4;
        V([lerp(1.2, 0.2, p), lerp(2.9, 2.2, p), lerp(3.4, 2.2, p)], [0, 0.05, lerp(0.15, 0, p)]);
      } else if (slot === 'build') {
        box.group.visible = false; box.street.visible = false; st.pizza.position.set(0, 0, 0); st.emberMat.uniforms.uAmt.value = 0; st.rim.intensity = 2.5;
        st.set({ uBall: 0, uSauce: 1, uCheese: 1, uMelt: 1, uBake: 1, uHeat: 0 });
        const p = clamp01((vh - r.top) / (vh + r.height));
        st.view([0, lerp(4.0, 3.5, p), lerp(1.9, 1.5, p)], [0, -0.05, 0.02], [0, 0], instant);
      } else {
        box.street.visible = tStep >= 3; st.emberMat.uniforms.uAmt.value = tStep === 1 ? 1 : 0;
        const t = tT; const s = tStep;
        if (s <= 0) { st.set({ uBall: 1 - sstep(0, 0.45, t), uSauce: sstep(0.35, 0.7, t), uCheese: sstep(0.6, 1, t), uMelt: 0.15, uBake: 0, uHeat: 0 }); box.group.visible = false; }
        else if (s === 1) { st.set({ uBall: 0, uSauce: 1, uCheese: 1, uMelt: 0.15 + 0.85 * sstep(0, 0.6, t), uBake: sstep(0, 1, t), uHeat: Math.sin(Math.min(1, t) * Math.PI) * 0.9 }); box.group.visible = false; }
        else { st.set({ uBall: 0, uSauce: 1, uCheese: 1, uMelt: 1, uBake: 1, uHeat: 0 }); box.group.visible = true; box.setLid(s === 2 ? lerp(1.95, 0, sstep(0.1, 0.9, t)) : 0); }
        const bx = s >= 3 ? lerp(0, 4.2, sstep(0, 1, t)) : 0; box.group.position.set(bx, -0.03, 0); st.pizza.position.set(bx, 0, 0); st.pizza.scale.setScalar(0.96);
        if (s >= 3) V([lerp(0.5, 3.0, sstep(0, 1, t)), 4.4, 5.4], [lerp(0, 3.2, sstep(0, 1, t)), 0, 0]);
        else V([0.0, 2.7, 3.0], [0, 0.05, 0.1]);
      }
    }
    st.tick((dt) => {
      let moving = false;
      if (slot === 'hero' && heroLid < 1) { heroLid = Math.min(1, heroLid + dt / 1.4); moving = true; apply(); }
      if (slot === 'track' && tT < 1) { tT = Math.min(1, tT + dt / (RM ? 0.01 : 1.15)); moving = true; apply(); }
      if (Math.abs(size - sizeT) > 0.002) { size = lerp(size, sizeT, RM ? 1 : 0.15); moving = true; }
      if (slot === 'build') { if (!drag && !RM) spin += dt * 0.12; st.pizza.scale.setScalar(size); moving = moving || !RM; }
      else if (slot === 'hero' && !RM) { spin += dt * 0.08; moving = true; }
      st.pizza.rotation.y = slot === 'track' ? 0 : spin;
      if (slot === 'hero') box.group.rotation.y = 0;
      return moving;
    });
    /* which slot owns the canvas: the one most on screen */
    const pick = () => { let best = null, bv = 0; for (const [n, el] of Object.entries(slots)) { const r = el.getBoundingClientRect(); const v = Math.max(0, Math.min(innerHeight, r.bottom) - Math.max(0, r.top)) * Math.max(0, Math.min(innerWidth, r.right) - Math.max(0, r.left)); if (v > bv) { bv = v; best = n; } }
      st.pause(!best); if (best) { enter(best); apply(); } };
    let raf = 0; addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; pick(); }); }, { passive: true }); addEventListener('resize', () => pick());
    pick();
    /* builder hooks (dz.js keeps the UI; this layer mirrors it in 3D) */
    $$('.sty').forEach((b) => b.addEventListener('click', () => { preset = b.dataset.k; if (slot !== 'build') return; setTimeout(() => setPizza(preset, true), RM ? 0 : 420); setTimeout(() => { $('#stageCredit').textContent = '3D pizza from real photos · credits below'; }, 0); }));
    $$('.seg button').forEach((b) => b.addEventListener('click', () => { sizeT = SIZE[b.dataset.size] || 1; st.invalidate(); }));
    $$('.top-btn').forEach((b) => b.addEventListener('click', () => { const t = b.dataset.t; const on = b.getAttribute('aria-pressed') === 'true'; const e = EXTRA[t];
      if (on) { extras.add(t); if (e && slot === 'build') st.add(e[0], e[1]); } else { extras.delete(t); if (e && slot === 'build') { st.clear(e[0]); } } }));
    $('#stageCredit').textContent = '3D pizza from real photos · credits below';
    { const hc = $('.hero-media .credit'); if (hc) hc.textContent = '3D scene · pizza surfaced with real photos, credits below'; }
    slots.build.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, s: spin }; slots.build.setPointerCapture(e.pointerId); });
    slots.build.addEventListener('pointermove', (e) => { if (drag) { spin = drag.s + (e.clientX - drag.x) * 0.01; st.invalidate(); } });
    slots.build.addEventListener('pointerup', () => (drag = null)); slots.build.addEventListener('pointercancel', () => (drag = null));
    /* tracker hooks: follow dz.js's active step */
    const steps = $$('#steps li'); const watch = () => { const i = steps.findIndex((li) => li.classList.contains('on')); if (i !== tStep && i >= 0) { if (slot !== 'track') { tStep = i; tT = 1; return; } tStep = i; tT = 0; st.invalidate(); } };
    new MutationObserver(watch).observe($('#steps'), { subtree: true, attributes: true, attributeFilter: ['class'] }); watch();
    /* keep the step photo as a small inset next to the 3D scene */
    const ti = $('#trackImg'); const inset = document.createElement('img'); inset.className = 'track-inset'; inset.alt = ''; inset.src = ti.getAttribute('src'); inset.width = 480; inset.height = 320; slots.track.appendChild(inset);
    new MutationObserver(() => { inset.src = ti.getAttribute('src'); }).observe(ti, { attributes: true, attributeFilter: ['src'] });
  }
}
