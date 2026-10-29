/* N014 Glint Eyewear - shared app for index.html (desktop) and m.html (phone).
   Signature: the real round spectacles (Poly Haven "Round Spectacles" by Sean Buckley, CC0, with its own glass
   material) hover in front of a live eye chart. Drag or swipe and the frames slide along the chart with inertia; the
   lenses really refract the chart behind them (three.js transmission), and the lens control changes their strength:
   plus lenses bend the letters one way, minus the other. Hand-made details: (1) the chart is a proper Snellen-style
   ladder drawn at the right proportions (each line about 0.8x the one above), (2) the frames tip slightly into the
   direction you slide them, like a pair pushed along a desk, (3) the readout says in words what the lens does to the
   letters, never a made-up number. Code-made: only the chart (a canvas texture on a plane, a prop).
   Same model, chart, transmission and HDRI on phone and desktop. */
import { createStage, THREE, isM, reduced, damp, clamp } from '../../_kit/stage.js';
import { reveals, press } from '../../_kit/fx/index.js';
import { landing } from '../../_kit/landing.js';
landing(); reveals(); press('[data-press]');
const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
const css = getComputedStyle(document.documentElement);
const C = { c1: css.getPropertyValue('--c1').trim(), c2: css.getPropertyValue('--c2').trim(), c3: css.getPropertyValue('--c3').trim() };
const stageEl = $('[data-stage]');
const RX = [-3, -1.5, 0, 1.5, 3]; let rxI = 3;
const stage = await createStage({
  el: stageEl, exposure: 1.0, envIntensity: 0.9,
  camera: { fov: 26, position: [0, 0.05, isM ? 7.4 : 5.6], target: [0, 0, 0] },
  label: 'Glint Eyewear: round wire spectacles in front of an eye chart. Drag sideways or use the arrow keys to slide them.', fitFov: true
});
function chartTexture() {
  const W = 2048, H = 1280, OX = 0, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  g.fillStyle = C.c1; g.fillRect(0, 0, W, H);
  g.fillStyle = C.c2; g.textAlign = 'center'; g.textBaseline = 'middle';
  const rows = ['E', 'F P', 'T O Z', 'L P E D', 'P E C F D', 'E D F C Z P', 'F E L O P Z D', 'D E F P O T E C'];
  g.save(); g.translate(W / 2, H / 2); g.scale(0.3, 0.3); g.translate(-W / 2, -H / 2);
  let y = 150, s = 230;
  rows.forEach((r, i) => { g.font = `700 ${s}px "Cabinet Grotesk", "Satoshi", Arial, sans-serif`; g.fillText(r.split(' ').join('  '), W / 2, y); g.font = '500 26px "JetBrains Mono", monospace'; g.fillStyle = C.c3; g.fillText(String(i + 1), 90, y); g.fillStyle = C.c2; y += s * 0.62 + 36; s *= 0.78; });
  g.restore();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
if (!stage.failed) {
  const chart = new THREE.Mesh(new THREE.PlaneGeometry(9.6 * 2, 6.0 * 2), new THREE.MeshBasicMaterial({ map: chartTexture(), toneMapped: false }));   /* exact page paper colour: the chart is the wall */
  chart.position.set(0, -0.32, -0.9); stage.add(chart);
  const g = await stage.load(stage.asset('models/round_spectacles.glb'));
  const specs = g.scene; stage.fit(specs, 2.0, false);
  const box = new THREE.Box3().setFromObject(specs); specs.position.sub(box.getCenter(new THREE.Vector3()));
  const lenses = [];
  specs.traverse((o) => { if (o.isMesh && /glass/i.test(o.material.name)) { const m = o.material; m.map = null; m.color.set(0xffffff); m.transmission = 1; m.roughness = 0.02; m.metalness = 0; m.ior = 1.6; m.thickness = 0.6; m.transparent = false; m.envMapIntensity = 1.2; m.specularIntensity = 1; lenses.push(m); } });
  /* the scan lies flat (temples back): stand it so the lenses face the chart's viewer */
  const holder = new THREE.Group(), tip = new THREE.Group(); tip.add(specs); holder.add(tip); stage.add(holder);
  const size = box.getSize(new THREE.Vector3()); if (size.y > size.z && size.y > size.x * 0.6) specs.rotation.x = 0; 
  holder.position.set(0, -0.12, 0.6); holder.rotation.y = -0.08;
  const key = new THREE.DirectionalLight(0xffffff, 1.2); key.position.set(-2, 3, 4); stage.scene.add(key);
  /* slide with inertia */
  const st = { x: 0.05, v: 0, drag: false, px: 0 };
  stageEl.addEventListener('pointerdown', (e) => { st.drag = true; st.px = e.clientX; st.v = 0; stageEl.setPointerCapture(e.pointerId); stageEl.classList.add('has-turned'); stage.invalidate(); });
  stageEl.addEventListener('pointermove', (e) => { if (!st.drag) return; const dx = (e.clientX - st.px) / stageEl.clientWidth * 4.2; st.px = e.clientX; st.x = clamp(st.x + dx, -1.4, 1.4); st.v = dx * 60; stage.invalidate(); });
  const end = () => { st.drag = false; };
  stageEl.addEventListener('pointerup', end); stageEl.addEventListener('pointercancel', end);
  stageEl.style.touchAction = 'pan-y';
  const cv = stage.renderer.domElement; cv.tabIndex = 0;
  cv.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); st.v += e.key === 'ArrowLeft' ? -1.2 : 1.2; stageEl.classList.add('has-turned'); stage.invalidate(); } });
  function setRx() {
    const d = RX[rxI]; $('#rx-v').textContent = (d > 0 ? '+' : d < 0 ? '−' : '') + Math.abs(d).toFixed(2);
    $('#sp-lens').textContent = d === 0 ? 'Plain glass, 0.00' : (d > 0 ? 'Reading, +' : 'Distance, −') + Math.abs(d).toFixed(2);
    $('#sp-mag').textContent = d === 0 ? 'Letters look the same' : d > 0 ? 'Letters look larger' : 'Letters look smaller';
    lenses.forEach((m) => { m.ior = 1.0 + Math.abs(d) * 0.22 + 0.02; m.thickness = d * 0.55; m.attenuationDistance = Infinity; });
    stage.invalidate();
  }
  $$('.rx-b').forEach((b) => b.addEventListener('click', () => { rxI = clamp(rxI + +b.dataset.rx, 0, RX.length - 1); setRx(); }));
  setRx();
  let t0 = 0;
  stage.onFrame((dt, t) => {
    if (!st.drag) { st.x = clamp(st.x + st.v * dt, -1.4, 1.4); st.v *= Math.exp(-dt * 3.2); if (Math.abs(st.x) >= 1.4) st.v *= -0.3; }
    holder.position.x = damp(holder.position.x, st.x, 12, dt);
    tip.rotation.z = damp(tip.rotation.z, clamp(-st.v * 0.05, -0.12, 0.12), 8, dt);
    tip.position.y = reduced ? 0 : Math.sin(t * 0.8) * 0.02;
    return st.drag || Math.abs(st.v) > 0.002 || Math.abs(holder.position.x - st.x) > 0.001 || !reduced;
  });
  stage.loaded();
}
