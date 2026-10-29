/* N002 Kiln & Quiet - shared app for index.html (desktop) and m.html (phone).
   Signature: a real scanned vase (Poly Haven "Ceramic Vase 01", CC0; swapped in for Ceramic Vase 03, whose square body read as a slab) on a code-made potter's wheel. Drag, swipe or arrow
   keys turn it; on release it coasts down with real friction, and the readout shows the live wheel speed.
   Hand-made details: (1) the turned-aluminium wheel head (concentric lathe marks drawn in code) spins with the vase,
   (2) the speed dial's ticks rotate with the wheel itself, (3) when it stops, the page says "Still." */
import { createStage, THREE, isM, reduced, damp } from '../../_kit/stage.js';
import { reveals, press } from '../../_kit/fx/index.js';
import { landing } from '../../_kit/landing.js';
landing();

reveals(); press('[data-press]');
const css = getComputedStyle(document.documentElement);
const C = { c1: css.getPropertyValue('--c1').trim(), c2: css.getPropertyValue('--c2').trim(), c3: css.getPropertyValue('--c3').trim() };
const $ = (s) => document.querySelector(s);
const stageEl = $('[data-stage]'), rpmEl = $('#rpm'), live = $('#live');

/* dial ticks (SVG, built once) */
const ticks = $('.dial-ticks');
for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2, major = i % 6 === 0, r1 = major ? 40 : 44, r2 = 50; const l = document.createElementNS('http://www.w3.org/2000/svg', 'line'); l.setAttribute('x1', 60 + Math.sin(a) * r1); l.setAttribute('y1', 60 - Math.cos(a) * r1); l.setAttribute('x2', 60 + Math.sin(a) * r2); l.setAttribute('y2', 60 - Math.cos(a) * r2); if (major) l.setAttribute('class', 'major'); ticks.append(l); }

const stage = await createStage({
  el: stageEl, exposure: 1.02, envIntensity: 0.9,
  camera: { fov: isM ? 30 : 25, position: isM ? [0, 1.6, 5.7] : [0.2, 1.95, 7.6], target: isM ? [0, 1.06, 0] : [0, 1.08, 0] },
  label: "Kiln & Quiet: a tall ceramic vase on a potter's wheel. Drag sideways or use the arrow keys to spin it.",
  fitFov: true
});

/* --- the wheel: a fixed indigo plinth + a turned aluminium wheel head (code-made) --- */
function latheMarks(size = 512) {                       // concentric turning marks -> roughness + bump texture
  const c = document.createElement('canvas'); c.width = c.height = size; const g = c.getContext('2d');
  g.fillStyle = '#8a8a8a'; g.fillRect(0, 0, size, size);
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let r = 2; r < size / 2; r += 1.25) { const v = 118 + rnd() * 40 + (r % 23 < 1.3 ? 50 : 0); g.strokeStyle = `rgb(${v},${v},${v})`; g.lineWidth = 0.9 + rnd() * 0.8; g.beginPath(); g.arc(size / 2, size / 2, r, 0, Math.PI * 2); g.stroke(); }
  g.fillStyle = '#505050'; g.beginPath(); g.arc(size / 2, size / 2, 6, 0, Math.PI * 2); g.fill();
  const t = new THREE.CanvasTexture(c); t.anisotropy = 8; return t;
}
const plinthH = 0.42, headH = 0.07, headR = 0.66;
const plinth = new THREE.Mesh(
  new THREE.LatheGeometry([[0, 0], [0.74, 0], [0.78, 0.02], [0.78, plinthH - 0.03], [0.75, plinthH], [0, plinthH]].map(([x, y]) => new THREE.Vector2(x, y)), 96),
  new THREE.MeshStandardMaterial({ color: new THREE.Color(C.c2).lerp(new THREE.Color(C.c1), 0.08), roughness: 0.62, metalness: 0 })
);
const marks = latheMarks();
const head = new THREE.Group();
const headMesh = new THREE.Mesh(
  new THREE.LatheGeometry([[0, 0], [headR - 0.02, 0], [headR, 0.012], [headR, headH - 0.012], [headR - 0.012, headH], [0, headH]].map(([x, y]) => new THREE.Vector2(x, y)), 128),
  new THREE.MeshStandardMaterial({ color: 0xd9d6d0, metalness: 0.92, roughness: 0.34 })
);
const top = new THREE.Mesh(new THREE.CircleGeometry(headR - 0.012, 128).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xdedbd5, metalness: 0.95, roughness: 0.3, roughnessMap: marks, bumpMap: marks, bumpScale: 0.6 }));
top.position.y = headH + 0.0005;
head.add(headMesh, top); head.position.y = plinthH;
stage.add(plinth, head);
/* a soft key from the upper left and a cool rim from behind: gives the matte glaze its form (the HDRI alone reads flat) */
const key = new THREE.DirectionalLight(0xfff3e4, 1.35); key.position.set(-3.2, 5, 4.2);
const rim = new THREE.DirectionalLight(0xdfe6ff, 0.9); rim.position.set(3.5, 2.6, -3.8);
stage.add(key, rim);

/* glaze colours multiply the scan's pale clay albedo (avg rgb 213,210,205), so each reads true */
const GLAZE = { natural: ['#fbf3e6', 'Natural'], indigo: ['#4d5a8f', 'Indigo'], tomato: ['#d65a50', 'Tomato'] };

/* --- the vase (real asset, same file on phone and desktop) --- */
const spinner = new THREE.Group(); spinner.position.y = plinthH + headH; stage.add(spinner);
let vaseMats = [];
try {
  const g = await stage.load(stage.asset('models/ceramic_vase_01.glb'));
  const vase = g.scene; stage.fit(vase, isM ? 1.62 : 1.58, true);
  vase.traverse((o) => {                                 // glazed ceramic: keep the scan's maps, add a clearcoat glaze layer
    if (!o.isMesh) return; const s0 = o.material;
    const m = new THREE.MeshPhysicalMaterial({ map: s0.map, normalMap: s0.normalMap, aoMap: s0.aoMap, roughnessMap: s0.roughnessMap, metalnessMap: s0.metalnessMap,
      color: new THREE.Color(GLAZE.natural[0]), roughness: 0.55, metalness: 0, clearcoat: 0.85, clearcoatRoughness: 0.16, envMapIntensity: 1.0 });
    if (s0.normalScale) m.normalScale.copy(s0.normalScale); o.material = m; vaseMats.push(m);
  });
  spinner.add(vase);
} catch (e) { stageEl.classList.add('is-fallback'); }
spinner.add(head); head.position.y = -headH;          // the head turns with the vase
stage.contactShadow({ size: 2.6, opacity: 0.5, blur: 3, darkness: 1.4, height: 1.2 });

/* --- spin: drag / swipe / keys, with the kit's inertia (friction 0.94 per 1/60 s) --- */
let turned = false, wasMoving = false, stillTimer = 0, shownRPM = 0;
spinner.rotation.y = 0.62;                             // start angle: the scan's best side to camera
const st = stage.spin(spinner, {
  friction: 0.94, sensitivity: isM ? 0.013 : 0.0105, auto: 0, maxVelocity: 0.55,
  onStart: () => { stageEl.classList.remove('is-still'); if (!turned) { turned = true; stageEl.classList.add('has-turned'); } }
});
const needle = $('.dial-needle');
stage.onFrame((dt) => {
  const rpm = Math.abs(st.velocity) * 572.96;           // rad per 1/60 s -> revolutions per minute
  shownRPM = damp(shownRPM, st.dragging ? rpm : rpm, 14, dt);
  const n = Math.round(shownRPM);
  if (rpmEl.textContent !== String(n)) rpmEl.textContent = n;
  ticks.setAttribute('transform', `rotate(${(-st.angle * 180 / Math.PI) % 360} 60 60)`);
  needle.style.opacity = Math.min(1, 0.35 + shownRPM / 120);
  const moving = st.dragging || rpm > 0.6;
  if (moving) { wasMoving = true; stillTimer = 0; stageEl.classList.remove('is-still'); }
  else if (wasMoving) { stillTimer += dt; if (stillTimer > 0.35) { wasMoving = false; stageEl.classList.add('is-still'); live.textContent = 'The wheel is still.'; } }
  return moving;
});
stage.loaded();

/* --- controls --- */
$('[data-action="spin"]').addEventListener('click', () => { if (!turned) { turned = true; stageEl.classList.add('has-turned'); } stageEl.classList.remove('is-still'); st.kick(reduced ? 0.18 : 0.42); });
const target = new THREE.Color(GLAZE.natural[0]); let glazeT = 1;
document.querySelectorAll('.sw').forEach((b) => b.addEventListener('click', () => {
  document.querySelectorAll('.sw').forEach((x) => x.setAttribute('aria-checked', String(x === b)));
  const [hex, name] = GLAZE[b.dataset.glaze]; target.set(hex); glazeT = 0;
  $('#glaze-name').textContent = name; live.textContent = `Glaze: ${name}`; stage.invalidate();
}));
document.querySelector('.glaze').addEventListener('keydown', (e) => {   // radio-group arrow keys
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return; e.preventDefault();
  const bs = [...document.querySelectorAll('.sw')]; const i = bs.findIndex((x) => x.getAttribute('aria-checked') === 'true');
  const nb = bs[(i + (e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 1) + bs.length) % bs.length]; nb.focus(); nb.click();
});
stage.onFrame((dt) => {
  if (glazeT >= 1) return false;
  glazeT = reduced ? 1 : Math.min(1, glazeT + dt / 0.48);
  vaseMats.forEach((m) => m.color.lerp(target, reduced ? 1 : 1 - Math.pow(1 - glazeT, 3)));
  return true;
});
