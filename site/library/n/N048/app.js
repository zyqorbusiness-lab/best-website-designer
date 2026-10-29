/* N048 Ironbark Barbers - shared app for index.html (desktop) and m.html (phone).
   Signature: the real scanned barber chair (Poly Haven "Barber Shop Chair 01" by Fernando Quinn, CC0) swings on its
   pedestal with inertia, and the service ring around it is a compass: the service the seat faces is highlighted and the
   ticket shows it. Tap a service and the chair swings to face it. Hand-made details: (1) the chair settles with a
   detent on the nearest service, like a heavy chair stopping where you meant, (2) "Pump the chair" raises it in real
   hydraulic steps of 2.5 cm (48 to 58 cm) and the ticket shows the height, (3) on the phone the service rail scrolls to
   follow the chair, so the ring and the chair never disagree. Same model, textures and HDRI on phone and desktop. */
import { createStage, THREE, isM, reduced, damp } from '../../_kit/stage.js';
import { reveals, press } from '../../_kit/fx/index.js';
import { landing } from '../../_kit/landing.js';
landing(); reveals(); press('[data-press]');
const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
const SERV = [['Classic cut', '35 min', 'Scissors on top, clippers at the sides, washed and finished.'], ['Skin fade', '45 min', 'Down to the skin at the neck, blended up by hand.'], ['Hot towel shave', '30 min', 'Two hot towels, a straight razor, a cold towel to close.'], ['Beard shape', '20 min', 'Lined at the cheek and neck, trimmed to the jaw.'], ['Father and son', '60 min', 'Two chairs side by side, two cuts, one booking.'], ['Tidy up', '15 min', 'Neckline and ears between cuts.']];
const N = SERV.length, STEP = (Math.PI * 2) / N;
const stageEl = $('[data-stage]'), ticket = $('.ticket'), live = $('#live');
let current = -1, heightCm = 48;
function show(i) {
  if (i === current) return; current = i;
  $$('.rs').forEach((li) => li.classList.toggle('is-on', +li.dataset.i === i));
  $('#tk-h').textContent = SERV[i][0]; $('#tk-b').textContent = SERV[i][2]; $('#tk-t').textContent = SERV[i][1];
  ticket.classList.remove('flash'); void ticket.offsetWidth; ticket.classList.add('flash');
  if (isM) { const li = $(`.rs[data-i="${i}"]`); li && li.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', inline: 'center', block: 'nearest' }); }
}
show(0);
const stage = await createStage({
  el: stageEl, exposure: 1.0, envIntensity: 1.0,
  camera: { fov: 28, position: [0.9, 2.5, 5.0], target: [0, 0.72, 0] },
  label: 'Ironbark Barbers: a vintage barber chair. Drag sideways or use the arrow keys to swing it.', fitFov: true
});
if (!stage.failed) {
  const g = await stage.load(stage.asset('models/barbershopchair_01.glb'));
  const chair = g.scene; stage.fit(chair, 1.75, true);
  const base = new THREE.Group(), lift = new THREE.Group(); lift.add(chair); base.add(lift); stage.add(base);
  stage.contactShadow({ size: 2.6, opacity: 0.55, blur: 2.4 });
  const key = new THREE.DirectionalLight(0xfff2e0, 1.3); key.position.set(-3, 5, 3); stage.scene.add(key);
  const FRONT = 0;                            // this scan's seat faces +z (towards the viewer) at rest: heading 0 = service 0 (bottom of the ring)
  const turn = stage.spin(base, { auto: 0, friction: 0.93, onStart: () => stageEl.classList.add('has-turned') });
  let target = null, liftY = 0;
  const heading = () => ((base.rotation.y % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);   /* rotation a turns +z to (sin a, cos a): the ring is laid out the same way */
  const nearest = () => Math.round(heading() / STEP) % N;
  $$('.rs button').forEach((b) => b.addEventListener('click', () => {
    const i = +b.dataset.face; const now = turn.angle; const want = i * STEP;
    let d = ((want - now) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI; target = now + d; turn.velocity = 0;
    live.textContent = 'The chair swings to ' + SERV[i][0] + '.'; stageEl.classList.add('has-turned'); stage.invalidate();
  }));
  $('[data-action="pump"]').addEventListener('click', () => { heightCm = Math.min(58, heightCm + 2.5); $('#tk-hgt').textContent = heightCm.toFixed(heightCm % 1 ? 1 : 0); live.textContent = 'Chair raised to ' + heightCm + ' centimetres.'; stage.invalidate(); });
  $('[data-action="lower"]').addEventListener('click', () => { heightCm = 48; $('#tk-hgt').textContent = '48'; live.textContent = 'Chair lowered to 48 centimetres.'; stage.invalidate(); });
  stage.onFrame((dt) => {
    let busy = false;
    if (target !== null) { turn.angle = reduced ? target : damp(turn.angle, target, 7, dt); if (Math.abs(turn.angle - target) < 0.002) { turn.angle = target; target = null; } busy = true; }
    else if (!turn.dragging && Math.abs(turn.velocity) < 0.004) {           // detent: settle on the nearest service
      const snap = Math.round(turn.angle / STEP) * STEP; if (Math.abs(snap - turn.angle) > 0.002) { turn.angle = damp(turn.angle, snap, 5, dt); busy = true; }
    }
    base.rotation.y = turn.angle;
    const wantY = (heightCm - 48) / 100 * 1.75 / 1.1;      // scene units: the chair is fitted to 1.75 for ~110 cm
    if (Math.abs(liftY - wantY) > 0.0005) { liftY = reduced ? wantY : damp(liftY, wantY, heightCm === 48 ? 2.5 : 9, dt); busy = true; }
    lift.position.y = liftY;
    show(nearest());
    return busy;
  });
  base.rotation.y = 0; chair.rotation.y = FRONT;
  stage.loaded();
}
