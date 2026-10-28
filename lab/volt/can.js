/* VOLT can, v3 real-model upgrade (Zyqor Studio, Oct 28 2026).
   The can itself is a REAL 3D model: "Aluminium can 500ml" by YouniqueĪdeaStudio (Sketchfab, CC-BY 4.0,
   https://sketchfab.com/3d-models/aluminium-can-500ml-510892f099614171bb6167ab88de03d4): its body, necked shoulder,
   rolled double seam, domed base, countersunk lid with score line, rivet and stay-on pull tab are the author's geometry.
   What Zyqor Studio changed: aligned and scaled it, rotated the opening to the front, split the straight wall out with a
   cylindrical UV so the fictional VOLT print can sit on it, and compressed it (meshopt) into ONE file that desktop
   and phone both load: assets/lab/volt/volt-can.glb.
   Code-made on top (named as code in the credits): the VOLT print and its ink/varnish map (canvas), the brushed and
   spun-metal roughness maps (canvas), the condensation normal map (baked webp) and the instanced water beads. */
import * as THREE from 'three';
import { loadGLB } from '../_kit/kit.js';

/* real proportions of the model (66 x 162 mm), scaled so the can is CAN_H tall; the print covers the straight wall */
export const CAN_H = 2.625, CAN_R = 0.5318;
export const WALL_Y0 = -1.1688, WALL_Y1 = 1.0136;

/* deterministic random so every load looks the same */
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }


function canvasTex(c, srgb) { const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t; }

/* circumferential brushing: rows of slightly different roughness (u runs around the can) */
function brushTex(h, seed) {
  const c = document.createElement('canvas'); c.width = 8; c.height = h; const g = c.getContext('2d'); const r = rng(seed);
  for (let y = 0; y < h; y++) { const v = 150 + (r() - 0.5) * 70 + (r() < 0.06 ? 40 : 0); g.fillStyle = `rgb(255,${v | 0},255)`; g.fillRect(0, y, 8, 1); }
  const t = canvasTex(c, false); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}

/* condensation: a tileable height field of beads and a few runs, turned into a tangent-space normal map */
export function dropletNormals(size, count, seed) {
  const N = size, hgt = new Float32Array(N * N), r = rng(seed);
  const bead = (cx, cy, rx, ry, amp) => {
    const x0 = Math.floor(cx - rx), x1 = Math.ceil(cx + rx), y0 = Math.floor(cy - ry), y1 = Math.ceil(cy + ry);
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const dx = (x - cx) / rx, dy = (y - cy) / ry, d = dx * dx + dy * dy; if (d >= 1) continue;
      const i = (((y % N) + N) % N) * N + (((x % N) + N) % N);
      hgt[i] = Math.max(hgt[i], amp * Math.sqrt(1 - d));
    }
  };
  for (let i = 0; i < count; i++) {
    const big = r() < 0.1, rad = big ? 3.6 + r() * 5 : 1.3 + Math.pow(r(), 1.6) * 3.4;
    const k = N / 512, x = r() * N, y = r() * N, rr = rad * k;
    bead(x, y, rr * (0.9 + r() * 0.2), rr * (1.0 + r() * 0.35), rr * 0.9);
    if (big && r() < 0.55) { // a run: the heavy drop slid down and left a trail of beads
      let ty = y - rr; const len = (10 + r() * 40) * k;
      for (let s = 0; s < len; s += 2.2 * k) bead(x + Math.sin(s * 0.08) * 1.2 * k, ty - s, 0.9 * k + r() * 0.6 * k, 1.6 * k, 0.8 * k);
    }
  }
  const c = document.createElement('canvas'); c.width = c.height = N; const g = c.getContext('2d'); const img = g.createImageData(N, N);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const L = hgt[y * N + ((x - 1 + N) % N)], R = hgt[y * N + ((x + 1) % N)], U = hgt[((y - 1 + N) % N) * N + x], D = hgt[((y + 1) % N) * N + x];
    let nx = (L - R) * 0.9, ny = (D - U) * 0.9, nz = 1; const l = Math.hypot(nx, ny, nz); nx /= l; ny /= l; nz /= l;
    const o = (y * N + x) * 4; img.data[o] = (nx * 0.5 + 0.5) * 255; img.data[o + 1] = (ny * 0.5 + 0.5) * 255; img.data[o + 2] = (nz * 0.5 + 0.5) * 255; img.data[o + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const t = canvasTex(c, false); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}

/* lid: planar UVs so the score line, the bead and the stamping can be drawn as a bump map */
/* spun lid: concentric tooling rings in the roughness channel (planar UV centred on the lid) */
function spinTex(n, seed) {
  const c = document.createElement('canvas'); c.width = c.height = n; const g = c.getContext('2d'); const r = rng(seed);
  g.fillStyle = 'rgb(255,150,255)'; g.fillRect(0, 0, n, n);
  for (let rad = n * 0.5; rad > 2; rad -= 1 + r() * 1.6) {
    const v = 150 + (r() - 0.5) * 46 + (r() < 0.05 ? 30 : 0);
    g.strokeStyle = `rgb(255,${v | 0},255)`; g.lineWidth = 1.2; g.beginPath(); g.arc(n / 2, n / 2, rad, 0, Math.PI * 2); g.stroke();
  }
  const t = canvasTex(c, false); return t;
}

/* quantized glTF nodes carry their dequantisation in the node transform: bake it into plain float geometry */
function bakeGeo(mesh) {
  mesh.updateWorldMatrix(true, false);
  const g = mesh.geometry.clone();
  for (const k of Object.keys(g.attributes)) {
    const a = g.attributes[k], n = a.itemSize, f = new Float32Array(a.count * n);
    for (let i = 0; i < a.count; i++) { f[i * n] = a.getX(i); if (n > 1) f[i * n + 1] = a.getY(i); if (n > 2) f[i * n + 2] = a.getZ(i); if (n > 3) f[i * n + 3] = a.getW(i); }
    g.setAttribute(k, new THREE.BufferAttribute(f, n));
  }
  g.applyMatrix4(mesh.matrixWorld);
  if (g.attributes.normal) g.normalizeNormals();
  g.computeBoundingSphere();
  return g;
}

/* --------- baked maps (Python, see work/assets_upgrade2/volt/bake_src.py), the SAME files on desktop and phone --------- */
const ASSETS = new URL('../../assets/lab/volt/', import.meta.url).href;
/* the placeholder has the final size (every baked map is 2048 square) so the swap is a same-size upload, never a re-allocation */
function flatTex(rgb, n = 2048) { const c = document.createElement('canvas'); c.width = c.height = n; const g = c.getContext('2d'); g.fillStyle = rgb; g.fillRect(0, 0, n, n); return c; }
/* a texture that shows a neutral value until its webp has arrived, then swaps the image in place (no shader recompile) */
function bakedTex(file, neutral, srgb, ready) {
  const t = new THREE.Texture(flatTex(neutral)); t.needsUpdate = true;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  const p = new Promise((res) => {
    const img = new Image(); img.decoding = 'async';
    img.onload = () => { const ph = t.image; t.image = img; t.needsUpdate = true; ph.width = ph.height = 1; res(t); };
    img.onerror = () => res(t);
    img.src = ASSETS + file;
  });
  ready.push(p); return t;
}

/* real water beads: a flattened hemisphere instanced over the wall, refracting the print through transmission */
function beadMatrices(seed) {
  const r = rng(seed), out = [], m = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), s = new THREE.Vector3(), p = new THREE.Vector3();
  const add = (th, y, rad, sag) => {
    const nrm = new THREE.Vector3(Math.sin(th), 0, Math.cos(th));
    q.setFromUnitVectors(up, nrm);
    p.set(nrm.x * (CAN_R * 1.0025), y - CAN_H / 2, nrm.z * (CAN_R * 1.0025));
    s.set(rad, rad * 0.62, rad * sag); // x: around, y: out of the wall (contact angle), z: along the can (gravity sag)
    m.compose(p, q, s); out.push(m.clone());
  };
  for (let i = 0; i < 420; i++) {
    const big = r() < 0.09, rad = big ? 0.026 + r() * 0.02 : 0.007 + Math.pow(r(), 1.7) * 0.02;
    add(r() * Math.PI * 2, 0.27 + r() * 1.9, rad, big ? 1.25 + r() * 0.2 : 1.0 + r() * 0.15);
  }
  // two slow runs: a heavy drop with a chain of small beads above it
  for (let k = 0; k < 7; k++) {
    const th = r() * Math.PI * 2, y0 = 0.35 + r() * 0.9, len = 0.25 + r() * 0.6;
    add(th, y0, 0.04 + r() * 0.012, 1.45);
    for (let s2 = 0.06; s2 < len; s2 += 0.035 + r() * 0.03) add(th + Math.sin(s2 * 9) * 0.012, y0 + s2, 0.006 + r() * 0.006, 1.1);
  }
  return out;
}

/* --------- shared model + materials, built once (one quality for every screen) --------- */
export function canKit({ aniso = 8, load = true } = {}) {
  const SEG = 128, ready = [];
  // the real model: one GLB, the same file on desktop and phone (not fetched at all without WebGL)
  const geo = { wall: null, shell: null, lid: null, tab: null };
  const model = !load ? Promise.resolve(geo) : loadGLB(ASSETS + 'volt-can.glb').then((gltf) => {
    gltf.scene.updateMatrixWorld(true);
    for (const k of Object.keys(geo)) { const m = gltf.scene.getObjectByName('volt_' + k); if (m && m.isMesh) geo[k] = bakeGeo(m); }
    return geo;
  });
  ready.push(model.catch(() => geo));

  const brush = brushTex(1024, 5);
  const drops = load ? bakedTex('drops_n.webp', 'rgb(128,128,255)', false, ready) : new THREE.Texture(); drops.wrapS = drops.wrapT = THREE.RepeatWrapping; drops.anisotropy = aniso;
  const dropsBody = drops.clone(); dropsBody.repeat.set(5, 4.4);
  // bare aluminium: foot, dome, shoulder, neck and double seam
  const alu = new THREE.MeshPhysicalMaterial({
    color: 0xdfe3e8, metalness: 1, roughness: 0.4, roughnessMap: brush, envMapIntensity: 0.8,
    clearcoat: 0.4, clearcoatRoughness: 0.1, anisotropy: 0.55, anisotropyRotation: 0,
    normalMap: dropsBody, normalScale: new THREE.Vector2(0.3, 0.3), clearcoatNormalMap: dropsBody, clearcoatNormalScale: new THREE.Vector2(0.9, 0.9),
  });
  // lid and tab: the model's own embossing, a spun / brushed finish on top
  const spin = spinTex(1024, 9); spin.anisotropy = aniso;
  const lidMat = new THREE.MeshPhysicalMaterial({ color: 0xf1f3f6, metalness: 1, roughness: 0.62, roughnessMap: spin,
    clearcoat: 0.2, clearcoatRoughness: 0.3, envMapIntensity: 1.45 });
  const tabMat = new THREE.MeshPhysicalMaterial({ color: 0xe6e9ed, metalness: 1, roughness: 0.42, roughnessMap: brush,
    clearcoat: 0.45, clearcoatRoughness: 0.12, envMapIntensity: 1.25 });
  // water: clear, refractive, very glossy
  const beadGeo = new THREE.SphereGeometry(1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2);
  const beadMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: 0.04, transmission: 1, thickness: 0.05, ior: 1.33,
    specularIntensity: 0.85, envMapIntensity: 1.1, attenuationColor: new THREE.Color(0xf4fbff), attenuationDistance: 0.5 });
  const beads = beadMatrices(21);
  return { SEG, geo, model, alu, lidMat, tabMat, drops, aniso, beadGeo, beadMat, beads, ready: Promise.all(ready) };
}

/* --------- the printed wrap: colour pass + ORM pass drawn by the same routine --------- */
const ORM = {
  metalInk: [1.0, 0.3, 0.72],   // translucent flavour ink over aluminium: colour with a metal sheen
  matteInk: [0.18, 0.62, 0.0],  // opaque ink under a matte varnish
  bare: [0.9, 0.24, 1.0],       // unprinted brushed aluminium
  white: [0.3, 0.55, 0.0],      // opaque white base (barcode panel)
  accent: [1.0, 0.2, 0.85],     // metallic accent ink (bolt, rule)
};
const ormCss = ([c, r, m], a = 1) => `rgba(${(c * 255) | 0},${(r * 255) | 0},${(m * 255) | 0},${a})`;
const SILVER = '#cfd5dc';

export function drawWrap(f, W, pass) {
  const H = Math.round(W * 0.645), s = W / 1024;
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  const P = (col, orm, a = 1) => (pass === 'col' ? col : ormCss(orm, a));
  // base: flavour colour, slightly brighter at the front
  if (pass === 'col') { const gr = g.createLinearGradient(0, 0, W, 0); gr.addColorStop(0, f.can); gr.addColorStop(0.5, f.canHi); gr.addColorStop(1, f.can); g.fillStyle = gr; }
  else g.fillStyle = ormCss(ORM.metalInk);
  g.fillRect(0, 0, W, H);
  // speed stripes behind the wordmark (a matte tint)
  g.save(); g.globalAlpha = pass === 'col' ? 0.16 : 0.5; g.fillStyle = P(f.stripe, ORM.matteInk);
  for (let i = 0; i < 14; i++) { const x = W * 0.18 + i * 52 * s; g.beginPath(); g.moveTo(x, H); g.lineTo(x + 20 * s, H); g.lineTo(x + 20 * s + H * 0.42, 0); g.lineTo(x + H * 0.42, 0); g.fill(); }
  g.restore();
  // top + bottom bands: unprinted aluminium with the repeat line in matte ink
  const bh = 34 * s;
  g.fillStyle = P(SILVER, ORM.bare); g.fillRect(0, 0, W, bh); g.fillRect(0, H - bh, W, bh);
  g.fillStyle = P(f.stripe, ORM.matteInk); g.fillRect(0, bh - 3 * s, W, 3 * s); g.fillRect(0, H - bh, W, 3 * s);
  g.font = `700 ${15 * s}px "Inter Tight", sans-serif`; g.textBaseline = 'middle';
  const rep = 'VOLT SPARKLING ENERGY  \u2022  '; let x = 0; const rw = g.measureText(rep).width;
  g.fillStyle = P(f.stripe === '#4FD8FF' ? '#123A66' : f.stripe, ORM.matteInk);
  while (x < W) { g.fillText(rep, x, 16 * s); g.fillText(rep, x + rw / 2, H - 16 * s); x += rw; }
  // the vertical wordmark on the front (u = 0.5): matte ink so it reads against the metallic field
  const cx = W / 2, len = H * 0.8;
  g.save(); g.translate(cx, H / 2); g.rotate(-Math.PI / 2);
  g.font = '400 100px Anton, Impact, sans-serif'; const mw = g.measureText('VOLT').width; const fs = 100 * len / mw;
  g.font = `400 ${fs}px Anton, Impact, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
  if (pass === 'col') { g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillText('VOLT', 3 * s, fs * 0.04 + 3 * s); } // print trap shadow
  g.fillStyle = P(f.txt, ORM.matteInk); g.fillText('VOLT', 0, fs * 0.04);
  g.restore();
  const half = (fs * 0.74) / 2;
  // bolt: metallic accent ink with a matte keyline
  g.save(); g.translate(cx - half - 70 * s, H * 0.5); g.scale(4.2 * s, 4.2 * s);
  g.beginPath(); g.moveTo(3, -22); g.lineTo(-11, 3); g.lineTo(-1, 3); g.lineTo(-4, 22); g.lineTo(11, -4); g.lineTo(1, -4); g.closePath();
  g.fillStyle = P(f.bolt, ORM.accent); g.fill(); g.lineWidth = 1.6; g.strokeStyle = P(f.stripe, ORM.matteInk); g.stroke(); g.restore();
  // flavour name to the right
  const fx = cx + half + 30 * s; const [a, b] = f.name.toUpperCase().split(' ');
  g.textAlign = 'left'; g.textBaseline = 'alphabetic';
  g.fillStyle = P(f.txt, ORM.matteInk); g.font = `400 ${72 * s}px Anton, Impact, sans-serif`; g.fillText(a, fx, H * 0.43); g.fillText(b, fx, H * 0.43 + 70 * s);
  g.fillStyle = P(f.bolt, ORM.accent); g.fillRect(fx, H * 0.43 + 90 * s, 74 * s, 7 * s);
  g.fillStyle = P(f.txt, ORM.matteInk); g.font = `700 ${17 * s}px "Inter Tight", sans-serif`;
  g.fillText('SPARKLING ENERGY', fx, H * 0.43 + 128 * s); g.fillText('80 MG CAFFEINE  \u00B7  0 SUGAR', fx, H * 0.43 + 152 * s);
  // the back: volume, concept note, a made-up barcode on a white panel
  g.font = `400 ${46 * s}px Anton, Impact, sans-serif`; g.fillText('500 ML', 40 * s, H * 0.3);
  g.font = `700 ${14 * s}px "Inter Tight", sans-serif`;
  g.fillText('CONCEPT CAN  \u00B7  NOT FOR SALE', 40 * s, H * 0.3 + 30 * s); g.fillText('ZYQOR LAB 07', 40 * s, H * 0.3 + 52 * s);
  g.fillStyle = P('#F4F7FA', ORM.white); g.fillRect(W - 190 * s, H * 0.62, 150 * s, 92 * s);
  g.fillStyle = P('#10243E', ORM.matteInk);
  let bx = W - 180 * s; let seed = 7; while (bx < W - 52 * s) { seed = (seed * 9301 + 49297) % 233280; const bw = (1 + (seed % 3)) * 2 * s; g.fillRect(bx, H * 0.62 + 10 * s, bw, 62 * s); bx += bw + 3 * s; }

  /* ---- micro-print (holds up at close range: 3 px per unit at 3072) ---- */
  const ink = P(f.txt, ORM.matteInk), inkA = (a) => (pass === 'col' ? f.txt : ormCss(ORM.matteInk, a));
  // halftone fade at the top and bottom of the colour field (ink dots over metal)
  if (pass === 'col') {
    g.save(); g.fillStyle = f.stripe; g.globalAlpha = 0.22;
    const st = 4.2 * s;
    for (const [y0, dir] of [[bh + 2 * s, 1], [H - bh - 2 * s, -1]]) for (let row = 0; row < 12; row++) {
      const rr = st * 0.5 * (1 - row / 12) * 0.95, y = y0 + dir * (row * st + st / 2), off = (row % 2) * st / 2;
      if (rr < 0.25) continue;
      g.beginPath(); for (let x2 = off; x2 < W; x2 += st) { g.moveTo(x2 + rr, y); g.arc(x2, y, rr, 0, 6.2832); } g.fill();
    }
    g.restore();
  }
  // hairline pinstripes in metallic accent ink
  g.fillStyle = P(f.bolt, ORM.accent); g.fillRect(0, bh + 7 * s, W, 1.3 * s); g.fillRect(0, H - bh - 8.3 * s, W, 1.3 * s);
  // nutrition panel on the back-left
  { const x0 = 40 * s, y0 = H * 0.43, w = 205 * s; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
    g.fillStyle = ink; g.font = `800 ${13 * s}px "Inter Tight", Arial, sans-serif`; g.fillText('NUTRITION', x0, y0);
    g.font = `600 ${8.5 * s}px "Inter Tight", Arial, sans-serif`; g.fillText('TYPICAL VALUES PER 500 ML CAN', x0, y0 + 13 * s);
    g.fillRect(x0, y0 + 18 * s, w, 2.2 * s);
    const rows = [['Energy', '46 kJ / 11 kcal'], ['Fat', '0 g'], ['  of which saturates', '0 g'], ['Carbohydrate', '2.8 g'], ['  of which sugars', '0 g'],
      ['Protein', '0 g'], ['Salt', '0.10 g'], ['Caffeine', '80 mg'], ['Vitamin B3', '8.0 mg (50%*)'], ['Vitamin B6', '1.0 mg (71%*)'], ['Vitamin B12', '1.0 \u00b5g (40%*)']];
    g.font = `600 ${9 * s}px "Inter Tight", Arial, sans-serif`;
    rows.forEach(([k, v], i) => { const y = y0 + 31 * s + i * 12.4 * s; g.textAlign = 'left'; g.fillText(k, x0, y); g.textAlign = 'right'; g.fillText(v, x0 + w, y);
      g.fillStyle = inkA(0.6); g.fillRect(x0, y + 3.4 * s, w, 0.6 * s); g.fillStyle = ink; });
    g.textAlign = 'left'; g.font = `500 ${7 * s}px "Inter Tight", Arial, sans-serif`;
    g.fillText('* of the reference intake. High caffeine content. Not recommended for children,', x0, y0 + 31 * s + 11 * 12.4 * s + 2 * s);
    g.fillText('pregnant or breast-feeding women. Concept product: not for sale.', x0, y0 + 31 * s + 11 * 12.4 * s + 11 * s);
  }
  // ingredients on the back-right, set like real can copy
  { const x0 = W - 236 * s, w = 206 * s; let y = H * 0.19; g.textAlign = 'left'; g.fillStyle = ink;
    g.font = `800 ${10 * s}px "Inter Tight", Arial, sans-serif`; g.fillText('INGREDIENTS', x0, y); y += 12 * s;
    g.font = `500 ${8.2 * s}px "Inter Tight", Arial, sans-serif`;
    const txt = `Carbonated water, acid (citric acid), natural ${f.name.toLowerCase()} flavourings, taurine (0.4%), acidity regulator (sodium citrates), caffeine (0.03%), sweeteners (sucralose, acesulfame K), inositol, glucuronolactone, colour (${f.name === 'Blue Surge' ? 'spirulina extract' : 'beta-carotene'}), vitamins (niacin, B6, B12). Shake gently, serve ice cold. Store in a cool, dry place away from direct sunlight. Best before: see base.`;
    let line = ''; for (const wd of txt.split(' ')) { const t2 = line ? line + ' ' + wd : wd; if (g.measureText(t2).width > w) { g.fillText(line, x0, y); y += 10.2 * s; line = wd; } else line = t2; }
    if (line) { g.fillText(line, x0, y); y += 10.2 * s; }
    y += 6 * s; g.font = `700 ${7.6 * s}px "Inter Tight", Arial, sans-serif`;
    g.fillText('ZYQOR LAB 07  \u00b7  CONCEPT ARTWORK', x0, y); g.fillText('DESIGN STUDY, NOT A REAL PRODUCT', x0, y + 10 * s);
  }
  // recycling mark (three chasing arrows) + ALU, left of the barcode
  { const cx2 = W - 214 * s, cy2 = H * 0.62 + 36 * s, R2 = 17 * s; g.save(); g.translate(cx2, cy2); g.strokeStyle = ink; g.fillStyle = ink; g.lineWidth = 3.2 * s; g.lineJoin = 'round';
    for (let k = 0; k < 3; k++) { g.save(); g.rotate(k * 2.0944); g.beginPath(); g.moveTo(-R2 * 0.62, R2 * 0.42); g.lineTo(R2 * 0.38, R2 * 0.42); g.stroke();
      g.beginPath(); g.moveTo(R2 * 0.56, R2 * 0.42); g.lineTo(R2 * 0.3, R2 * 0.24); g.lineTo(R2 * 0.3, R2 * 0.6); g.closePath(); g.fill(); g.restore(); }
    g.font = `800 ${9 * s}px "Inter Tight", Arial, sans-serif`; g.textAlign = 'center'; g.fillText('ALU', 0, R2 + 13 * s); g.restore(); }
  // barcode digits under the bars
  g.fillStyle = P('#10243E', ORM.matteInk); g.font = `600 ${9 * s}px "Inter Tight", Arial, sans-serif`; g.textAlign = 'center';
  g.fillText('5 0 1 2 3 4 5   6 7 8 9 0 7', W - 115 * s, H * 0.62 + 84 * s);
  // dot-matrix batch code (inkjet) just above the bottom band
  { const code = 'L07 26' + (10 + f.name.length) + ' 14:32  BB 10/2027', dot = 1.25 * s; g.fillStyle = P('#0b1220', ORM.matteInk, 1);
    const glyph = (ch) => { const m = { 'L': [1, 1, 1, 1, 31], '0': [14, 17, 17, 17, 14], '1': [4, 12, 4, 4, 14], '2': [14, 1, 14, 16, 31], '3': [30, 1, 14, 1, 30], '4': [17, 17, 31, 1, 1],
      '5': [31, 16, 30, 1, 30], '6': [14, 16, 30, 17, 14], '7': [31, 1, 2, 4, 4], '8': [14, 17, 14, 17, 14], '9': [14, 17, 15, 1, 14], 'B': [30, 17, 30, 17, 30], ':': [0, 4, 0, 4, 0], '/': [1, 2, 4, 8, 16], ' ': [0, 0, 0, 0, 0] }; return m[ch] || m[' ']; };
    let x3 = 44 * s; const y3 = H - bh - 24 * s;
    for (const ch of code) { const gl = glyph(ch); for (let ry = 0; ry < 5; ry++) for (let rx = 0; rx < 5; rx++) if (gl[ry] & (16 >> rx)) { g.beginPath(); g.arc(x3 + rx * dot * 1.9, y3 + ry * dot * 1.9, dot * 0.62, 0, 6.2832); g.fill(); } x3 += dot * 1.9 * 6.2; }
  }
  return c;
}

export function wrapMaterial(kit) {
  const m = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 1, roughness: 1, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1 });
  const d = kit.drops.clone(); d.repeat.set(5, 3.2);
  m.normalMap = d; m.normalScale = new THREE.Vector2(0.25, 0.25);
  m.clearcoatNormalMap = d; m.clearcoatNormalScale = new THREE.Vector2(1.0, 1.0);
  return m;
}
/* the print: 3072 px colour (about 15 px per mm around the 66 mm can) and a 2048 px ORM, the same on every screen */
export function paintWrap(kit, mat, f) {
  const W = 3072;
  const col = canvasTex(drawWrap(f, W, 'col'), true); col.anisotropy = kit.aniso;
  const big = drawWrap(f, W, 'orm'), half = document.createElement('canvas'); half.width = 2048; half.height = Math.round(big.height * 2048 / W);
  const hg = half.getContext('2d'); hg.imageSmoothingQuality = 'high'; hg.drawImage(big, 0, 0, half.width, half.height);
  const orm = canvasTex(half, false); orm.anisotropy = kit.aniso;
  col.wrapS = orm.wrapS = THREE.RepeatWrapping; // the wall UV runs a hair past 1.0 at the seam
  for (const k of ['map', 'roughnessMap', 'metalnessMap', 'clearcoatMap']) if (mat[k]) mat[k].dispose();
  mat.map = col; mat.roughnessMap = orm; mat.metalnessMap = orm; mat.clearcoatMap = orm;
  mat.needsUpdate = true;
}

export function buildCan(kit, wrapMat) {
  const spin = new THREE.Group();
  const add = (g) => {
    spin.add(new THREE.Mesh(g.wall, wrapMat), new THREE.Mesh(g.shell, kit.alu), new THREE.Mesh(g.lid, kit.lidMat), new THREE.Mesh(g.tab, kit.tabMat));
  };
  if (kit.geo.wall) add(kit.geo); else kit.model.then(add).catch(() => {});
  const beads = new THREE.InstancedMesh(kit.beadGeo, kit.beadMat, kit.beads.length);
  kit.beads.forEach((mx, i) => beads.setMatrixAt(i, mx)); beads.instanceMatrix.needsUpdate = true; beads.computeBoundingSphere();
  spin.add(beads); spin.userData.beads = beads;
  return spin;
}

/* soft contact shadow: a tight dark core plus a wide falloff */
export function contactShadowTex() {
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
  let gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, 'rgba(6,14,26,.42)'); gr.addColorStop(0.35, 'rgba(6,14,26,.2)'); gr.addColorStop(0.7, 'rgba(6,14,26,.06)'); gr.addColorStop(1, 'rgba(6,14,26,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  gr = g.createRadialGradient(128, 128, 0, 128, 128, 52); gr.addColorStop(0, 'rgba(4,10,20,.55)'); gr.addColorStop(1, 'rgba(4,10,20,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

