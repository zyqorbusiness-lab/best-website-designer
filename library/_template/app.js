/* {{ID}} {{NAME}} - shared app for index.html (desktop) and m.html (phone).
   The phone build is the same code with isM === true: same model, same textures, same HDRI. */
import { createStage, THREE, isM, reduced } from '../../_kit/stage.js';
import { reveals, splitAll, press } from '../../_kit/fx/index.js';

splitAll(); reveals(); press('[data-press]');

const stage = await createStage({
  el: '[data-stage]',
  camera: { fov: 30, position: [0, 1.15, isM ? 6.2 : 5.2], target: [0, 0.75, 0] },
  exposure: 1.0,
  label: '{{NAME}}: drag to turn the object'
});

/* Replace this placeholder with the concept's real asset:
     const g = await stage.load(stage.asset('models/<slug>.glb'));  stage.fit(g.scene, 1.6, true);  stage.add(g.scene);  */
const obj = new THREE.Mesh(
  new THREE.LatheGeometry(Array.from({ length: 24 }, (_, i) => { const t = i / 23; return new THREE.Vector2(0.35 + Math.sin(t * Math.PI) * 0.32 - t * 0.12, t * 1.5); }), 96),
  new THREE.MeshPhysicalMaterial({ color: getComputedStyle(document.documentElement).getPropertyValue('--c3').trim() || '#B5832F', roughness: 0.32, clearcoat: 0.8, clearcoatRoughness: 0.2, side: THREE.DoubleSide })
);
stage.add(obj);
stage.contactShadow({ size: 3, opacity: 0.5 });
const turn = stage.spin(obj, { auto: 0.2 });
stage.loaded();

document.querySelector('[data-action="primary"]')?.addEventListener('click', () => turn.kick(reduced ? 0.1 : 0.45));
