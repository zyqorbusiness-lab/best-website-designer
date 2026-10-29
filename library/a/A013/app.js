/* A013 Shelfline Ceramics - shared app for index.html (desktop) and m.html (phone).
   Signature: four real scanned vases (Poly Haven: Ceramic Vase 01, 02, 04 and Antique Ceramic Vase 01, all by James
   Ray Cock, CC0) stand on one long shelf. Vertical scroll walks the camera along it; the vase you reach is lit by a
   warm spot, turns a quarter towards you and its caption comes up. Hand-made details: (1) each caption's height is
   measured from the scan (real millimetres), (2) the spot slides along the shelf with you and its light pools on the
   wood (Poly Haven "Dark Planks" texture, CC0), (3) the tick row bottom right is the walk itself, 01 to 04.
   Code-made: the shelf plank geometry (a prop; its wood is a real CC0 texture). Same models, texture, lights, shadows
   and camera path on phone and desktop; the phone camera stands closer so one vase fills the screen. */
import { createStage, THREE, isM, reduced, smoothstep, damp, smooth } from '../../_kit/stage.js';
import { reveals, press } from '../../_kit/fx/index.js';
import { landing } from '../../_kit/landing.js';
landing(); reveals(); press('[data-press]');
const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
await new Promise((r) => (document.readyState === 'complete' ? r() : addEventListener('load', r, { once: true })));
smooth();
const FILES = ['models/ceramic_vase_01.glb', 'models/ceramic_vase_02.glb', 'models/ceramic_vase_04.glb', 'models/antique_ceramic_vase_01.glb'];
const GAP = 2.3, N = FILES.length;
const stage = await createStage({
  el: '[data-stage]', exposure: 1.0, envIntensity: 0.55, shadows: true, lazyMargin: '600px 0px',
  camera: { fov: 30, position: [0, 0.9, 4], target: [0, 0.6, 0] },
  label: 'Shelfline: four ceramic vases on a wooden shelf. Scroll to walk past them.'
});
const caps = $$('.vcap'), ticks = $$('.ticks li');
let shown = -1;
const showV = (i) => { if (i === shown) return; shown = i; caps.forEach((c, k) => c.classList.toggle('is-on', k === i)); ticks.forEach((t, k) => t.classList.toggle('is-on', k === i)); };
showV(0);
if (stage.failed) { const sec = $('#shelf'); addEventListener('scroll', () => { const r = sec.getBoundingClientRect(); const p = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight))); showV(Math.round(p * (N - 1))); }, { passive: true }); }
else {
  const [diff, nor] = await Promise.all([stage.loadTexture(stage.asset('tex/dark_planks_diff_512.webp'), { repeat: [6, 1] }), stage.loadTexture(stage.asset('tex/dark_planks_nor_512.webp'), { srgb: false, repeat: [6, 1] })]);
  const plankW = GAP * (N - 1) + 3.2;
  const plank = new THREE.Mesh(new THREE.BoxGeometry(plankW, 0.08, 0.62), new THREE.MeshStandardMaterial({ map: diff, normalMap: nor, roughness: 0.72, color: 0xd9c8bb }));
  plank.position.set(GAP * (N - 1) / 2, -0.04, 0); plank.receiveShadow = true; stage.add(plank);
  const wallC = new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue('--c1').trim());
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(plankW + 8, 6), new THREE.MeshStandardMaterial({ color: wallC.clone().offsetHSL(0, 0.06, 0.07), roughness: 0.95 }));
  wall.position.set(GAP * (N - 1) / 2, 1.6, -0.45); wall.receiveShadow = true; stage.add(wall);
  const gl = await Promise.all(FILES.map((f) => stage.load(stage.asset(f))));
  const vases = gl.map((g, i) => {
    const o = g.scene; const s = new THREE.Box3().setFromObject(o).getSize(new THREE.Vector3());
    const h = $('#vh' + i); if (h) h.textContent = (s.y * 100).toFixed(1) + ' cm';
    o.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    const pivot = new THREE.Group(); pivot.add(o);
    const k = 0.75 + 0.25 * (s.y / 0.44);                         // keep their real height ratio (tallest = 1.0)
    stage.fit(o, 1.05 * k, true);
    const cc = new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3()); o.position.x -= cc.x; o.position.z -= cc.z;   /* turn about its own axis */
    pivot.position.x = i * GAP; stage.add(pivot); return pivot;
  });
  const spot = new THREE.SpotLight(0xffe6cf, 26, 6, 0.42, 0.55, 1.6);
  spot.castShadow = true; spot.shadow.mapSize.set(1024, 1024); spot.shadow.bias = -0.0004;
  const spotT = new THREE.Object3D(); stage.scene.add(spot, spotT); spot.target = spotT;
  const fill = new THREE.DirectionalLight(0xdfe6ff, 0.35); fill.position.set(-3, 3, 4); stage.scene.add(fill);
  const camZ = isM ? 5.3 : 3.6, camY = isM ? 1.0 : 0.85, lookY = isM ? 0.32 : 0.55, off = isM ? 0 : -0.55;
  let prog = 0, want = 0;
  function pose(p) {
    const f = p * (N - 1), i0 = Math.min(N - 2, Math.floor(f)), x = GAP * (i0 + smoothstep(0.3, 0.7, f - i0));   /* dwell at each vase, walk quickly between */
    stage.camera.position.set(x + off, camY, camZ); stage.camera.lookAt(x + off, lookY, 0);
    spot.position.set(x, 2.6, 1.2); spotT.position.set(x, 0.3, 0);
    vases.forEach((v, i) => { const near = 1 - smoothstep(0.15, 0.6, Math.abs(x - i * GAP) / GAP); v.rotation.y = -0.6 + near * 0.6; });
    showV(Math.min(N - 1, Math.round(p * (N - 1))));
  }
  pose(0);
  stage.scroll('#shelf', (p) => { want = p; stage.invalidate(); }, { native: isM });
  stage.onFrame((dt) => {
    if (Math.abs(want - prog) < 0.0004) { if (prog !== want) { prog = want; pose(prog); } return false; }
    prog = reduced ? want : damp(prog, want, 7, dt); pose(prog); return true;
  });
  stage.loaded();
}
