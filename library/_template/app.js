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

/* The hero is ALWAYS a real credited CC0 / CC-BY model (unique-concepts skill, mistake 9.2: code-made stand-ins shipped
   as the product and had to be redone). Set MODEL to the optimised GLB in _assets/models/ and add its .credit.json. */
const MODEL = '';   // e.g. 'models/rubber_duck_toy.glb'
if (!MODEL) throw new Error('{{ID}}: set MODEL to a real CC0/CC-BY model before building (no code-made placeholder)');
const g = await stage.load(stage.asset(MODEL));
const obj = g.scene; stage.fit(obj, 1.6, true); stage.add(obj);
stage.contactShadow({ size: 3, opacity: 0.5 });
const turn = stage.spin(obj, { auto: 0.2 });
stage.loaded();

document.querySelector('[data-action="primary"]')?.addEventListener('click', () => turn.kick(reduced ? 0.1 : 0.45));
