/* N004 Morrow Light - shared app for index.html (desktop) and m.html (phone).
   Signature: one registered number, --dawn (@property, <number>), that CSS transitions from 0 (night) to 1 (dawn). Every
   colour of the sky, the stars, the hills and the type is a color-mix() of the three palette colours keyed off it; this file
   reads the same number each frame to fly the SVG sun along its path, warm the three.js lamp (code-made: a walnut base wrapped
   in the real Poly Haven "Walnut Veneer" scan, a frosted transmission-glass orb, an LED core on a 1800-3200 K ramp) and fill
   the readouts. Hand-made: stars go out in their own order, the sun's path is drawn before it rises, a real kelvin ramp. */
import { createStage, THREE, isM, reduced, clamp } from '../../_kit/stage.js';
import { reveals, press } from '../../_kit/fx/index.js';
import { landing } from './landing.js';

reveals(); press('[data-press]'); landing();
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
if (reduced) root.classList.add('rm');
const sw = $('[data-switch]'), range = $('#scrub'), arc = $('#arc'), sun = $('.sun');
let arcLen = arc.getTotalLength();
const curve = $('.curve-line'), curveDot = $('.curve-dot'), curveLen = curve ? curve.getTotalLength() : 0;
const K0 = 1800, K1 = 3200;
let alarm = 6 * 60 + 30, target = 0, L3 = null;

/* colour temperature -> sRGB (Tanner Helland's fit of the Planckian locus) */
function kelvin(k) {
  const t = k / 100; let r, g, b;
  r = t <= 66 ? 255 : 329.698727446 * Math.pow(t - 60, -0.1332047592);
  g = t <= 66 ? 99.4708025861 * Math.log(t) - 161.1195681661 : 288.1221695283 * Math.pow(t - 60, -0.0755148492);
  b = t >= 66 ? 255 : t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  return [r, g, b].map((v) => clamp(v, 0, 255) / 255);
}
const hhmm = (m) => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(Math.round(m % 60)).padStart(2, '0')}`;
const lightOf = (d) => (d < 0.004 ? 0 : 0.01 + 0.99 * Math.pow(d, 1.7));           // the ramp: slow ember, then a climb

/* ---- set the dawn: animated (CSS transition on the registered property) or direct (scrubbing) ---- */
function setDawn(v, animate) {
  target = clamp(v, 0, 1);
  root.classList.toggle('scrubbing', !animate);
  root.style.setProperty('--dawn', target.toFixed(4));
  sw.setAttribute('aria-checked', String(target >= 0.5));
  kick();
}
const getDawn = () => { const v = parseFloat(getComputedStyle(root).getPropertyValue('--dawn')); return Number.isFinite(v) ? v : 0; };

sw.addEventListener('click', () => setDawn(sw.getAttribute('aria-checked') === 'true' ? 0 : 1, !reduced));
range.addEventListener('input', () => setDawn(range.value / 30, false));
range.addEventListener('change', () => root.classList.remove('scrubbing'));
$$('.stop').forEach((b) => b.addEventListener('click', () => setDawn(+b.dataset.min / 30, !reduced)));
$$('.step').forEach((b) => b.addEventListener('click', () => { alarm = clamp(alarm + +b.dataset.step, 4 * 60 + 30, 9 * 60); labels(); paint(getDawn()); }));
function labels() {
  $('#t0').textContent = hhmm(alarm - 30); $('#t1').textContent = hhmm(alarm - 15); $('#t2').textContent = hhmm(alarm); $('#ro-alarm').textContent = hhmm(alarm);
  $$('.step').forEach((b) => { b.disabled = (+b.dataset.step < 0 && alarm <= 4 * 60 + 30) || (+b.dataset.step > 0 && alarm >= 9 * 60); });
}

/* ---- paint one frame of everything that is not pure CSS ---- */
let lastPaint = -1;
function paint(d) {
  if (Math.abs(d - lastPaint) < 0.0005) return; lastPaint = d;
  const p = arc.getPointAtLength(clamp(d, 0, 1) * arcLen);
  sun.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
  const L = lightOf(d), k = Math.round((K0 + (K1 - K0) * Math.pow(d, 0.8)) / 50) * 50, [r, g, b] = kelvin(k), min = Math.round(alarm - 30 + d * 30);
  const css = `rgb(${Math.round(r * 255)} ${Math.round(g * 255)} ${Math.round(b * 255)})`;
  root.style.setProperty('--lampc', L > 0 ? css : 'color-mix(in oklab, var(--c2) 70%, var(--c1))'); root.style.setProperty('--lampg', L.toFixed(3));
  $('#clock').textContent = hhmm(min); $('#ro-light').textContent = `${Math.round(L * 100)}%`; $('#ro-k').textContent = L > 0 ? `${k.toLocaleString('en-US')} K` : 'lamp off';
  $('#sw-k').textContent = L > 0 ? `${k.toLocaleString('en-US')} K · ${Math.round(L * 100)}% light` : 'Lamp off'; $('#sw-t').textContent = `${hhmm(min)} · alarm ${hhmm(alarm)}`;
  if (!root.classList.contains('scrubbing')) range.value = Math.round(d * 30);
  range.setAttribute('aria-valuetext', `${hhmm(min)}, ${L > 0 ? Math.round(L * 100) + ' percent light' : 'lamp off'}`);
  const mNow = Math.round(d * 30); $$('.stop').forEach((s) => s.setAttribute('aria-pressed', String(+s.dataset.min === mNow)));
  if (curve) { let lo = 0, hi = curveLen; const x = d * 600; for (let i = 0; i < 18; i++) { const mid = (lo + hi) / 2; if (curve.getPointAtLength(mid).x < x) lo = mid; else hi = mid; } const q = curve.getPointAtLength(lo); curveDot.setAttribute('cx', q.x.toFixed(1)); curveDot.setAttribute('cy', q.y.toFixed(1)); }
  lamp3d(d, L, r, g, b);
}
let raf = 0, settleUntil = 0;
function tick() { raf = 0; const d = getDawn(); paint(d); if (performance.now() < settleUntil || Math.abs(d - target) > 0.0005) raf = requestAnimationFrame(tick); }
function kick() { settleUntil = performance.now() + 2700; if (!raf) raf = requestAnimationFrame(tick); }
/* phone: the sun's path is laid out from where the lamp actually sits (the hero height varies by phone) */
function phonePath() {
  if (!isM) return;
  const svg = arc.ownerSVGElement, hr = svg.getBoundingClientRect(), st = document.querySelector('[data-stage]').getBoundingClientRect();
  const s = Math.max(hr.width / 1440, hr.height / 900), ox = (1440 * s - hr.width) / 2, oy = (900 * s - hr.height) / 2;
  const vb = (x, y) => [((x - hr.left + ox) / s).toFixed(0), ((y - hr.top + oy) / s).toFixed(0)];
  const cx = st.left + st.width / 2, a0 = vb(cx + 6, st.top + st.height * 0.62), a1 = vb(cx + st.width * 0.1, st.top + st.height * 0.32), a2 = vb(cx + st.width * 0.36, st.top + st.height * 0.05);
  arc.setAttribute('d', `M${a0[0]} ${a0[1]} Q ${a1[0]} ${a1[1]} ${a2[0]} ${a2[1]}`); arcLen = arc.getTotalLength(); lastPaint = -1; paint(getDawn());
}
labels(); paint(0); phonePath(); if (isM) new ResizeObserver(phonePath).observe(document.querySelector('.hero'));
window.__n4 = { set: (m) => { range.value = m; range.dispatchEvent(new Event('input')); } };   /* QA hook */

/* ---- the lamp (code-made geometry, real walnut scan) ---- */
function lamp3d(d, L, r, g, b) {
  if (!L3) return;
  L3.core.color.setRGB(0.62 + r * L * 1.0, 0.42 + g * L * 1.0, 0.27 + b * L * 1.0);   // off = a faint ember, so the orb reads as opal glass, not clay
  L3.orbM.color.copy(L3.offC).lerp(L3.onC, Math.min(1, d * 1.6)); L3.orbM.transmission = 0.86 + 0.14 * Math.min(1, d * 1.6);
  L3.inner.material.color.setRGB(L > 0 ? r : 1, L > 0 ? g : 0.62, L > 0 ? b : 0.38); L3.inner.material.opacity = 0.05 + L * 0.17;
  L3.glow.material.color.setRGB(r, g, b); L3.glow.material.opacity = 0.06 + L * 0.46; L3.glow.scale.setScalar(1.5 + L * 0.5);
  L3.light.color.setRGB(r, g, b); L3.light.intensity = L * 7;
  L3.stage.scene.environmentIntensity = 0.62 + 0.38 * d; L3.stage.invalidate();
}
try {
  const stage = await createStage({
    el: '[data-stage]', demand: true, exposure: 1.0, envIntensity: 0.4,
    camera: { fov: isM ? 30 : 27, position: isM ? [0, 1.05, 4.6] : [0, 1.0, 4.9], target: [0, 0.74, 0] },
    label: 'Morrow Light: a frosted glass orb lamp on a turned walnut base. Tap it to switch between night and dawn, drag to turn it.'
  });
  if (!stage.failed) {
    const walnut = await stage.loadTexture(new URL('walnut_veneer_diff.webp', import.meta.url).href, { srgb: true });
    walnut.wrapS = walnut.wrapT = THREE.RepeatWrapping; walnut.repeat.set(3, 1);
    const lampG = new THREE.Group(); stage.add(lampG);
    const prof = [[0, 0], [0.5, 0], [0.54, 0.012], [0.56, 0.05], [0.55, 0.15], [0.5, 0.25], [0.42, 0.31], [0.34, 0.335], [0.3, 0.335], [0.3, 0.345], [0, 0.345]];
    const base = new THREE.Mesh(new THREE.LatheGeometry(prof.map(([x, y]) => new THREE.Vector2(x, y)), 128),
      new THREE.MeshPhysicalMaterial({ map: walnut, roughness: 0.48, clearcoat: 0.35, clearcoatRoughness: 0.4, sheen: 0.2 }));
    const R = 0.62, oy = 0.345 + R * 0.93;
    const core = new THREE.MeshBasicMaterial({ color: 0x1a1512 });
    const coreM = new THREE.Mesh(new THREE.SphereGeometry(0.13, 48, 24), core); coreM.position.y = oy - 0.2;
    const orb = new THREE.Mesh(new THREE.SphereGeometry(R, 96, 64), new THREE.MeshPhysicalMaterial({ color: 0xfff7ee, transmission: 1, roughness: 0.3, thickness: 0.9, ior: 1.5, attenuationColor: new THREE.Color('#f3dcc4'), attenuationDistance: 2.4, specularIntensity: 1, clearcoat: 1, clearcoatRoughness: 0.05, sheen: 0.35, sheenRoughness: 0.5, sheenColor: new THREE.Color('#ffe9d2'), envMapIntensity: 1.25 }));
    orb.position.y = oy;
    const inner = new THREE.Mesh(new THREE.SphereGeometry(R * 0.96, 64, 32), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    inner.position.y = oy;
    const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); const gr = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,255,255,.85)'); gr.addColorStop(0.4, 'rgba(255,255,255,.28)'); gr.addColorStop(0.75, 'rgba(255,255,255,.05)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 128, 128);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    glow.position.y = oy; glow.renderOrder = 2;
    const light = new THREE.PointLight(0xffb070, 0, 5, 2); light.position.y = oy;
    const key = new THREE.DirectionalLight(0xfff1e2, 0.9); key.position.set(-2.5, 4, 3);
    const rim = new THREE.DirectionalLight(0xe9f0ff, 1.6); rim.position.set(2.6, 2.4, -3.2);   // cool rim from behind: the glass edge catches it at night
    lampG.add(base, coreM, orb, inner, light); stage.add(glow, key, rim);
    stage.contactShadow({ size: 2.4, opacity: 0.55, blur: 2.6, height: 1.6 });
    L3 = { stage, core, inner, glow, light, orbM: orb.material, offC: new THREE.Color('#efe4d8'), onC: new THREE.Color('#fff7ee') };
    const spin = stage.spin(lampG, { auto: 0, friction: 0.93 });
    /* tap the lamp = flip the switch (a drag turns it instead) */
    const el = stage.el; let dn = null;
    el.addEventListener('pointerdown', (e) => { dn = { x: e.clientX, y: e.clientY, t: performance.now() }; });
    el.addEventListener('pointerup', (e) => { if (dn && Math.hypot(e.clientX - dn.x, e.clientY - dn.y) < 6 && performance.now() - dn.t < 400) sw.click(); dn = null; });
    lastPaint = -1; paint(getDawn()); stage.loaded();
  }
} catch (e) { $('[data-stage]').classList.add('is-fallback'); }
