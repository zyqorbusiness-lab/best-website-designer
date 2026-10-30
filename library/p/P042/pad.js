/* P042 Tally Pad: the product model, built in code (own work, Zyqor Studio). 1 unit = 10 mm.
   Spec: work/beast/specs/tally-pad_SPEC.md section 6. Parts are grouped so the page can explode, press and turn them. */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const LIGHTS = [
  { id: 'ember', name: 'Ember', hex: '#FFAA3B' },
  { id: 'tide', name: 'Tide', hex: '#3FC2A4' },
  { id: 'coral', name: 'Coral', hex: '#FF7A66' },
  { id: 'frost', name: 'Frost', hex: '#DCEFF5' }
];
export const FINISHES = [
  { id: 'raw', name: 'Raw aluminium', hex: '#C8C6C1', rough: 0.42 },
  { id: 'sand', name: 'Sand', hex: '#D8C3A0', rough: 0.4 },
  { id: 'sage', name: 'Sage', hex: '#9DAF9B', rough: 0.4 }
];

/* knurl: a diamond pattern drawn as a height field, turned into a tangent-space normal map */
function knurlNormal(w = 1024, h = 256, cells = 110) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d'); const img = x.createImageData(w, h); const H = new Float32Array(w * h);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const u = (i / w) * cells, v = (j / h) * cells * (h / w) * 4;
    const a = Math.abs(((u + v) % 1) - 0.5), b = Math.abs(((u - v + 1000) % 1) - 0.5);
    H[j * w + i] = Math.min(a, b);
  }
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const l = H[j * w + ((i - 1 + w) % w)], r = H[j * w + ((i + 1) % w)], d = H[((j - 1 + h) % h) * w + i], u = H[((j + 1) % h) * w + i];
    let nx = (l - r) * 6, ny = (d - u) * 6, nz = 1; const k = 1 / Math.hypot(nx, ny, nz); nx *= k; ny *= k; nz *= k;
    const o = (j * w + i) * 4; img.data[o] = (nx * 0.5 + 0.5) * 255; img.data[o + 1] = (ny * 0.5 + 0.5) * 255; img.data[o + 2] = (nz * 0.5 + 0.5) * 255; img.data[o + 3] = 255;
  }
  x.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.NoColorSpace; return t;
}

/* a keycap: rounded box with a 0.6 mm dish pressed into the top face */
function capGeo() {
  const g = new RoundedBoxGeometry(1.8, 0.9, 1.8, 4, 0.22);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i); if (y < 0.4) continue;
    const r = Math.hypot(p.getX(i), p.getZ(i)) / 0.9; p.setY(i, y - 0.06 * Math.max(0, 1 - r * r));
  }
  /* slight taper: the top is 8 % smaller than the skirt, like a real cap */
  for (let i = 0; i < p.count; i++) { const t = (p.getY(i) + 0.45) / 0.9; const k = 1 - 0.08 * t; p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k); }
  g.computeVertexNormals(); return g;
}

export function buildPad(opts = {}) {
  const maxAniso = opts.maxAniso || 8;
  const M = {
    alu: new THREE.MeshPhysicalMaterial({ color: FINISHES[0].hex, metalness: 0.78, roughness: 0.48, clearcoat: 0.2, clearcoatRoughness: 0.35, envMapIntensity: 1.25 }),
    plate: new THREE.MeshPhysicalMaterial({ color: '#CFCBC4', metalness: 0.55, roughness: 0.5 }),
    cap: new THREE.MeshPhysicalMaterial({ color: '#F3EFE7', roughness: 0.72, sheen: 0.2, sheenRoughness: 0.8, sheenColor: new THREE.Color('#ffffff') }),
    capA: new THREE.MeshPhysicalMaterial({ color: '#E2572B', roughness: 0.66, sheen: 0.2, sheenRoughness: 0.8 }),
    sw: new THREE.MeshStandardMaterial({ color: '#8E8A84', roughness: 0.6 }),
    stem: new THREE.MeshStandardMaterial({ color: '#D9A441', roughness: 0.5 }),
    pcb: new THREE.MeshStandardMaterial({ color: '#4F7A5A', roughness: 0.5 }),
    pad: new THREE.MeshStandardMaterial({ color: '#C79B5A', metalness: 0.8, roughness: 0.35 }),
    feet: new THREE.MeshStandardMaterial({ color: '#9C7A55', roughness: 0.9 }),
    bar: new THREE.MeshPhysicalMaterial({ color: '#F6EBDC', roughness: 0.35, transmission: 0.55, thickness: 0.2, emissive: new THREE.Color(LIGHTS[0].hex), emissiveIntensity: 1.6 }),
    dial: new THREE.MeshPhysicalMaterial({ color: '#CFCDC8', metalness: 1, roughness: 0.28, normalMap: knurlNormal(), normalScale: new THREE.Vector2(0.2, 0.2), envMapIntensity: 1.2 }),
    dialTop: new THREE.MeshPhysicalMaterial({ color: '#D3D0CA', metalness: 0.8, roughness: 0.3, clearcoat: 0.4, envMapIntensity: 1.3 }),
    tick: new THREE.MeshStandardMaterial({ color: '#E2572B', roughness: 0.5 })
  };
  M.dial.normalMap.repeat.set(1, 1); M.dial.normalMap.anisotropy = maxAniso;
  const root = new THREE.Group(); root.name = 'TallyPad';
  const L = {}; /* layers for the explode view */
  /* case */
  L.case = new THREE.Group();
  const body = new THREE.Mesh(new RoundedBoxGeometry(12.4, 2.2, 7.2, 6, 0.6), M.alu); L.case.add(body);
  const plate = new THREE.Mesh(new RoundedBoxGeometry(11.2, 0.15, 6.0, 3, 0.07), M.plate); plate.position.y = 1.03; L.case.add(plate);
  const bar = new THREE.Mesh(new RoundedBoxGeometry(9.6, 0.3, 0.2, 3, 0.08), M.bar); bar.position.set(0, -0.35, 3.56); L.case.add(bar);
  for (const [x, z] of [[-5.2, -2.8], [5.2, -2.8], [-5.2, 2.8], [5.2, 2.8]]) { const f = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.15, 24), M.feet); f.position.set(x, -1.17, z); L.case.add(f); }
  /* PCB */
  L.pcb = new THREE.Group();
  const pcb = new THREE.Mesh(new THREE.BoxGeometry(11.2, 0.16, 6.0), M.pcb); L.pcb.add(pcb);
  for (let i = 0; i < 18; i++) { const pd = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.03, 0.22), M.pad); pd.position.set(-4.8 + (i % 9) * 0.5, 0.09, -2.3 + Math.floor(i / 9) * 0.5); L.pcb.add(pd); }
  L.pcb.position.y = 0.86;
  /* switches + caps: three keys on the left two thirds, dial on the right */
  const keyX = [-3.9, -1.995, -0.09];
  L.switches = new THREE.Group(); L.caps = new THREE.Group(); const caps = [];
  keyX.forEach((x, i) => {
    const s = new THREE.Group();
    const hous = new THREE.Mesh(new RoundedBoxGeometry(1.4, 1.1, 1.4, 2, 0.08), M.sw); s.add(hous);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.5, 16), M.stem); stem.position.y = 0.7; s.add(stem);
    s.position.set(x, 1.15, 0); L.switches.add(s);
    const cap = new THREE.Mesh(capGeo(), i === 2 ? M.capA : M.cap); cap.position.set(x, 1.72, 0); cap.userData.y0 = 1.72; L.caps.add(cap); caps.push(cap);
  });
  /* dial */
  const dial = new THREE.Group();
  const knob = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 1.8, 96, 1, false), [M.dial, M.dialTop, M.dialTop]); dial.add(knob);
  const cham = new THREE.Mesh(new THREE.TorusGeometry(1.46, 0.06, 12, 96), M.dialTop); cham.rotation.x = Math.PI / 2; cham.position.y = 0.9; dial.add(cham);
  const tick = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.04, 0.5), M.tick); tick.position.set(0, 0.92, -0.95); dial.add(tick);
  dial.position.set(3.55, 1.95, 0); L.caps.add(dial);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.0, 20), M.sw); shaft.position.set(3.55, 1.5, 0); L.switches.add(shaft);
  for (const k of ['case', 'pcb', 'switches', 'caps']) { L[k].userData.y0 = L[k].position.y; root.add(L[k]); }
  root.userData = { L, caps, dial, bar, M };
  return root;
}

/* soft contact shadow: two radial layers baked into a small canvas (no shadow maps) */
export function contactShadow(w = 15, d = 9.5) {
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
  g.translate(128, 128); g.scale(1, 1);
  for (const [r, a] of [[124, 0.22], [86, 0.22], [56, 0.3]]) { const gr = g.createRadialGradient(0, 0, 0, 0, 0, r); gr.addColorStop(0, `rgba(40,52,46,${a})`); gr.addColorStop(1, 'rgba(40,52,46,0)'); g.fillStyle = gr; g.fillRect(-128, -128, 256, 256); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, toneMapped: false }));
  m.rotation.x = -Math.PI / 2; m.position.y = -1.26; m.renderOrder = -1; return m;
}

export function setLight(pad, hex, k = 1) { const { M } = pad.userData; M.bar.emissive.set(hex); M.bar.emissiveIntensity = 1.6 * k; }
export function setFinish(pad, f) { const { M } = pad.userData; M.alu.color.set(f.hex); M.alu.roughness = f.rough; }
