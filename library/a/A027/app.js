/* A027 Cut & Grain Knives - shared app for index.html (desktop) and m.html (phone).
   Signature: one pinned scene and one continuous camera move over the real knife (Poly Haven "Fish Knife" by Mateusz
   Sadek, CC0; its blade and handle are separate parts in the scan). Scroll: 01 a macro run along the edge, 02 the blade
   slides out of the handle (the page prints the lengths measured from the scan, which is in real metres), 03 a view
   down the spine, 04 back together in a three-quarter hero. Hand-made details: (1) the lengths in chapter 02 are
   measured live from the model's own bounding boxes, not typed in, (2) a warm amber rim light only appears on the edge
   during chapter 01, so the edge "catches the light", (3) the progress hairline under the captions is the scroll itself.
   Same model, HDRI, lights and camera path on phone (native scroll) and desktop (Lenis + ScrollTrigger). */
import { createStage, THREE, isM, reduced, smoothstep, lerp, smooth } from '../../_kit/stage.js';
import { reveals, press } from '../../_kit/fx/index.js';
import { landing } from '../../_kit/landing.js';
landing(); reveals(); press('[data-press]');
const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
await new Promise((r) => (document.readyState === 'complete' ? r() : addEventListener('load', r, { once: true })));
smooth();
const stage = await createStage({
  el: '[data-stage]', exposure: 1.05, envIntensity: 1.0, lazyMargin: '600px 0px',
  camera: { fov: 30, position: [0, 0.4, 2], target: [0, 0, 0] },
  label: 'Cut & Grain: a fish knife with a wooden handle. Scroll to move the camera along it.'
});
const chaps = $$('.chap'), bar = $('.prog span'), heroCopy = $('#hero-copy');
/* Oct 31 2026: the page opens on the knife itself (hero hold), then the original four-chapter camera path */
const H = 0.16;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
let shownC = -1;
function caption(P) {
  const p = clamp01((P - H) / (1 - H));
  if (heroCopy) heroCopy.style.setProperty('--ho', (1 - smoothstep(0.03, H * 0.75, P)).toFixed(3));
  const c = P < H * 0.8 ? -1 : Math.min(3, Math.floor(p * 4 + 0.08));
  if (c !== shownC) { shownC = c; chaps.forEach((el, i) => el.classList.toggle('is-on', i === c)); }
  bar.style.transform = `scaleX(${clamp01(P).toFixed(4)})`;
}
caption(0);
if (stage.failed) { stage.scroll && 0; const sec = $('#edge'); addEventListener('scroll', () => { const r = sec.getBoundingClientRect(); caption(Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)))); }, { passive: true }); }
else {
  const g = await stage.load(stage.asset('models/fish_knife.glb'));
  const knife = g.scene;
  let blade = null, handle = null;
  knife.traverse((o) => { if (/blade/i.test(o.name) && !blade) blade = o; if (/handle/i.test(o.name) && !handle) handle = o; });
  /* measure in real units before fitting (Poly Haven scans are in metres) */
  const bb = (o) => new THREE.Box3().setFromObject(o).getSize(new THREE.Vector3());
  const all = bb(knife), axis = all.y >= all.x && all.y >= all.z ? 'y' : all.x >= all.z ? 'x' : 'z';
  const cm = (o) => (o ? (Math.max(...bb(o).toArray()) * 100) : 0);
  if (blade && handle) { $('#m-blade').textContent = cm(blade).toFixed(1) + ' cm'; $('#m-handle').textContent = cm(handle).toFixed(1) + ' cm'; }
  /* re-material (Oct 31 2026): the scan's albedo reads rusty and scratched; the blade becomes clean polished steel,
     the handle keeps its own wood texture warmed toward walnut. Geometry untouched. */
  knife.traverse((o) => {
    if (!o.isMesh) return;
    const m0 = o.material;
    if (/blade/i.test(o.name)) o.material = new THREE.MeshStandardMaterial({ color: 0xe6e8ea, metalness: 0.88, roughness: 0.27, envMapIntensity: 1.5, side: THREE.DoubleSide });
    else { const m = m0.clone(); m.color = new THREE.Color(0xb98c68); m.roughness = 0.55; m.metalness = 0; m.metalnessMap = null; m.side = THREE.DoubleSide; m.needsUpdate = true; o.material = m; }
  });
  const holder = new THREE.Group(); holder.add(knife); stage.add(holder);
  if (axis === 'z') knife.rotation.y = Math.PI / 2;
  if (axis === 'y') { knife.rotation.z = -Math.PI / 2; knife.rotation.x = Math.PI / 2; }   /* the scan stands upright: lay it flat on its side, edge facing the viewer */
  stage.fit(knife, 2.2, false);
  const c = new THREE.Box3().setFromObject(knife).getCenter(new THREE.Vector3()); knife.position.sub(c);
  /* which end is the blade? slide direction = from handle centre to blade centre */
  const bc = blade ? new THREE.Box3().setFromObject(blade).getCenter(new THREE.Vector3()) : new THREE.Vector3(1, 0, 0);
  const hc = handle ? new THREE.Box3().setFromObject(handle).getCenter(new THREE.Vector3()) : new THREE.Vector3(-1, 0, 0);
  const dir = bc.clone().sub(hc).setY(0).normalize();
  const bladeHome = blade ? blade.position.clone() : null, handleHome = handle ? handle.position.clone() : null;
  const toLocal = (o, v) => { const inv = new THREE.Matrix4().copy(o.parent.matrixWorld).invert(); return v.clone().transformDirection(inv); };
  holder.updateMatrixWorld(true);
  const bDir = blade ? toLocal(blade, dir) : null, hDir = handle ? toLocal(handle, dir) : null;
  const sBlade = blade ? 0.32 / blade.parent.getWorldScale(new THREE.Vector3()).x : 0;
  const key = new THREE.DirectionalLight(0xfff4e6, 1.3); key.position.set(-2, 3, 2); stage.scene.add(key);
  const rim = new THREE.DirectionalLight(new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue('--c3').trim()), 0); rim.position.set(2, 0.6, -2); stage.scene.add(rim);
  /* one camera path: [position, target] keyframes; the edge side is +dir */
  const E = dir.clone();
  const side = new THREE.Vector3(-E.z, 0, E.x);                 // perpendicular in the floor plane
  const K = [
    [E.clone().multiplyScalar(0.98).add(side.clone().multiplyScalar(isM ? 0.62 : 0.46)).setY(0.16), E.clone().multiplyScalar(0.62)],
    [side.clone().multiplyScalar(0.25).setY(isM ? 6.0 : 3.7), new THREE.Vector3(0, 0, 0)],
    [side.clone().multiplyScalar(isM ? 6.0 : 2.8).setY(0.3), new THREE.Vector3(0, 0, 0)],
    [E.clone().multiplyScalar(isM ? -2.9 : -1.3).add(side.clone().multiplyScalar(isM ? 6.2 : 2.0)).setY(isM ? 3.0 : 1.0), new THREE.Vector3(0, -0.05, 0)]
  ];
  const pos = new THREE.Vector3(), tgt = new THREE.Vector3();
  let prog = 0, want = 0;
  /* hero pose: the whole knife lying across the lower part of the first screen, three-quarter, under the title */
  const KH = [side.clone().multiplyScalar(isM ? 9.4 : 3.05).add(E.clone().multiplyScalar(isM ? 0 : -0.12)).setY(isM ? 2.4 : 1.3), new THREE.Vector3(0, isM ? 0 : 0.32, 0)];
  function pose(P) {
    const p = clamp01((P - H) / (1 - H));
    const f = p * 3, i = Math.min(2, Math.floor(f)), t = smoothstep(0, 1, f - i);
    pos.lerpVectors(K[i][0], K[i + 1][0], t); tgt.lerpVectors(K[i][1], K[i + 1][1], t);
    if (P < H) { const h = smoothstep(0.04, H, P); pos.lerpVectors(KH[0], K[0][0], h); tgt.lerpVectors(KH[1], K[0][1], h); }
    /* phone layout: in the overhead and side chapters the camera rolls 90 degrees so the long knife runs down the
       tall screen instead of being cropped (a framing change only; same scene, lights and effects) */
    const roll = isM ? (P < H ? 0.42 * (1 - smoothstep(0.04, H, P)) : smoothstep(0.08, 0.28, p) * (1 - smoothstep(0.72, 0.9, p))) : 0;
    stage.camera.up.set(0, 1, 0).lerp(E, roll).normalize();
    stage.camera.position.copy(pos); stage.camera.lookAt(tgt);
    /* phone hero: slide the frame up along the rolled screen-up so the whole knife sits under the title */
    if (isM && P < H) { const k = 1 - smoothstep(0.04, H, P); stage.camera.position.addScaledVector(new THREE.Vector3(0, 1, 0).applyQuaternion(stage.camera.quaternion), 0.95 * k); }
    const apart = smoothstep(0.18, 0.36, p) * (1 - smoothstep(0.62, 0.86, p));
    if (blade) blade.position.copy(bladeHome).addScaledVector(bDir, apart * sBlade);
    if (handle) handle.position.copy(handleHome).addScaledVector(hDir, -apart * sBlade * 0.5);
    rim.intensity = 2.2 * (1 - smoothstep(0.1, 0.25, p));
    holder.rotation.y = P < H ? lerp(0.22, 0, smoothstep(0.04, H, P)) : lerp(0, 0.25, smoothstep(0.7, 1, p));
    caption(P);
  }
  pose(0);
  stage.scroll('#edge', (p) => { want = p; stage.invalidate(); }, { native: isM });
  stage.onFrame((dt) => {
    const k = reduced ? 1 : 1 - Math.exp(-dt * 8);
    if (Math.abs(want - prog) < 0.0004) { if (prog !== want) { prog = want; pose(prog); } return false; }
    prog += (want - prog) * k; pose(prog); return true;
  });
  stage.loaded();
}
