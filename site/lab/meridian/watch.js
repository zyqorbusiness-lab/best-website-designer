/* Meridian - a procedural automatic watch (three.js). No model download: every part is geometry + physical materials.
   Built Y-up (dial faces +y, 12 o'clock = -z, 3 o'clock = +x); the returned group is turned so the dial faces the camera. */
import { THREE, Q, isM } from '../_kit/kit.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const DIALS = [
  { key: 'forest',   word: 'MERIDIAN', name: 'Forest',   note: 'Sunburst green, tan leather', dial: '#1F4D3A', dial2: '#2E6B52', strap: '#6E4426', stitch: '#E9DCC0', text: '#EFE8D8', word_c: '#1F4D3A', bg: '#EFE8D8' },
  { key: 'nocturne', word: 'NOCTURNE', name: 'Nocturne', note: 'Midnight green, sand stitching', dial: '#0F2D29', dial2: '#1D4A42', strap: '#1B3A33', stitch: '#C9A24A', text: '#E9DFC8', word_c: '#14382F', bg: '#E9E3D3' },
  { key: 'solstice', word: 'SOLSTICE', name: 'Solstice', note: 'Sand dial, forest leather',  dial: '#D8C49A', dial2: '#EFE2C2', strap: '#1F4D3A', stitch: '#EFE8D8', text: '#1F4D3A', word_c: '#B48E3C', bg: '#F1EADB' },
];

const GOLD = 0xC9A24A;

function dialCanvas(d, size) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d'), R = size / 2;
  g.translate(R, R);
  /* sunburst: a soft radial base + hundreds of hairline rays */
  const base = g.createRadialGradient(-R * 0.25, -R * 0.35, R * 0.05, 0, 0, R);
  base.addColorStop(0, d.dial2); base.addColorStop(0.65, d.dial); base.addColorStop(1, shade(d.dial, -0.28));
  g.fillStyle = base; g.beginPath(); g.arc(0, 0, R, 0, Math.PI * 2); g.fill();
  for (let i = 0; i < 360; i++) {
    const a = (i / 360) * Math.PI * 2, k = (Math.sin(a * 2 + 0.6) + 1) / 2;
    g.strokeStyle = `rgba(255,255,255,${0.012 + 0.05 * k * k})`; g.lineWidth = size / 900;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * R, Math.sin(a) * R); g.stroke();
  }
  /* railroad minute track: two hairline rails, 60 minute ticks, 240 quarter-second ticks between them */
  const ink = d.text;
  g.strokeStyle = ink; g.globalAlpha = 0.9;
  g.lineWidth = size * 0.0011;
  for (const rr of [0.962, 0.912]) { g.beginPath(); g.arc(0, 0, R * rr, 0, Math.PI * 2); g.stroke(); }
  for (let i = 0; i < 240; i++) {
    if (i % 4 === 0) continue;
    const a = (i / 240) * Math.PI * 2; g.lineWidth = size * 0.0007; g.globalAlpha = 0.55;
    g.beginPath(); g.moveTo(Math.sin(a) * R * 0.962, -Math.cos(a) * R * 0.962); g.lineTo(Math.sin(a) * R * 0.945, -Math.cos(a) * R * 0.945); g.stroke();
  }
  g.globalAlpha = 0.92;
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2, big = i % 5 === 0;
    g.lineWidth = size * (big ? 0.0042 : 0.0019);
    const r1 = R * 0.962, r2 = R * (big ? 0.9 : 0.912);
    g.beginPath(); g.moveTo(Math.sin(a) * r1, -Math.cos(a) * r1); g.lineTo(Math.sin(a) * r2, -Math.cos(a) * r2); g.stroke();
  }
  /* five-minute numerals, printed upright just inside the track */
  g.fillStyle = ink; g.globalAlpha = 0.78; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = `600 ${size * 0.0215}px "Inter Tight", sans-serif`;
  for (let i = 1; i <= 12; i++) {
    if (i === 3) continue;
    const a = (i / 12) * Math.PI * 2, r = R * 0.862;
    g.save(); g.translate(Math.sin(a) * r, -Math.cos(a) * r); g.rotate(a); g.fillText(String(i * 5).padStart(2, '0'), 0, 0); g.restore();
  }
  g.globalAlpha = 1;
  /* inner chapter ring + a fine circular-grain band under the indices */
  g.strokeStyle = ink; g.globalAlpha = 0.28; g.lineWidth = size * 0.0012;
  g.beginPath(); g.arc(0, 0, R * 0.825, 0, Math.PI * 2); g.stroke();
  g.globalAlpha = 0.07;
  for (let rr = 0.6; rr < 0.82; rr += 0.0035) { g.lineWidth = size * 0.0006; g.beginPath(); g.arc(0, 0, R * rr, 0, Math.PI * 2); g.stroke(); }
  g.globalAlpha = 1;
  /* wordmark + small print (a fictional brand; the page labels it Concept) */
  g.fillStyle = ink; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = `400 ${size * 0.058}px Anton, "Arial Narrow", sans-serif`;
  spaced(g, 'MERIDIAN', 0, -R * 0.36, size * 0.011);
  g.font = `500 ${size * 0.0175}px "Inter Tight", sans-serif`; g.globalAlpha = 0.75;
  spaced(g, 'ZYQOR LAB  ·  CONCEPT 02', 0, -R * 0.27, size * 0.006);
  g.globalAlpha = 1;
  g.font = `italic 500 ${size * 0.03}px "Instrument Serif", Georgia, serif`;
  g.fillText('Automatic', 0, R * 0.3);
  g.font = `600 ${size * 0.0165}px "Inter Tight", sans-serif`; g.globalAlpha = 0.72;
  spaced(g, 'CALIBRE ZQ-28  ·  72 H  ·  100 M', 0, R * 0.375, size * 0.0045);
  /* tiny print either side of 6 o'clock, outside the track rails */
  g.font = `600 ${size * 0.0118}px "Inter Tight", sans-serif`; g.globalAlpha = 0.6;
  for (const [txt, sgn] of [['CONCEPT', -1], ['NOT FOR SALE', 1]]) {
    const a = Math.PI + sgn * 0.17; g.save(); g.rotate(a); g.translate(0, -R * 0.982); g.rotate(Math.PI);
    spaced(g, txt, 0, 0, size * 0.003); g.restore();
  }
  g.globalAlpha = 1;
  /* date window at 3 o'clock */
  const dw = size * 0.075, dh = size * 0.06, dx = R * 0.62;
  g.fillStyle = '#F4EEE1'; g.fillRect(dx - dw / 2, -dh / 2, dw, dh);
  { const sh = g.createLinearGradient(0, -dh / 2, 0, -dh / 2 + dh * 0.35); sh.addColorStop(0, 'rgba(0,0,0,.28)'); sh.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = sh; g.fillRect(dx - dw / 2, -dh / 2, dw, dh * 0.35); }
  g.strokeStyle = '#C9A24A'; g.lineWidth = size * 0.004; g.strokeRect(dx - dw / 2, -dh / 2, dw, dh);
  g.fillStyle = '#1F2A26'; g.font = `600 ${size * 0.04}px "Inter Tight", sans-serif`;
  g.fillText(String(new Date().getDate()), dx, size * 0.002);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}
function spaced(g, txt, x, y, sp) {
  const w = [...txt].reduce((s, ch) => s + g.measureText(ch).width + sp, -sp);
  let cx = x - w / 2;
  for (const ch of txt) { const cw = g.measureText(ch).width; g.fillText(ch, cx + cw / 2, y); cx += cw + sp; }
}
function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16); let r = n >> 16, gg = (n >> 8) & 255, b = n & 255;
  const f = (v) => Math.round(Math.min(255, Math.max(0, k < 0 ? v * (1 + k) : v + (255 - v) * k)));
  return `rgb(${f(r)},${f(gg)},${f(b)})`;
}
/* ---------------- procedural surface maps (all generated in the browser, no downloads) ---------------- */
const _cache = {};
/* circular graining for the case flank: streaks that run around the case */
function brushTex() {
  if (_cache.brush) return _cache.brush;
  const c = document.createElement('canvas'); c.width = 8; c.height = 1024;
  const g = c.getContext('2d'), img = g.createImageData(8, 1024), px = img.data;
  for (let y = 0; y < 1024; y++) {
    const v = 200 + Math.random() * 55 - (Math.random() < 0.08 ? 40 : 0);
    for (let x = 0; x < 8; x++) { const i = (y * 8 + x) * 4; px[i] = px[i + 1] = px[i + 2] = v; px[i + 3] = 255; }
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, 3);
  return (_cache.brush = t);
}
/* sunburst: the anisotropy direction is tangential everywhere, so the light fans out in rays from the centre */
function sunburstDir() {
  if (_cache.sun) return _cache.sun;
  const N = 256, c = document.createElement('canvas'); c.width = c.height = N;
  const g = c.getContext('2d'), img = g.createImageData(N, N), px = img.data;
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const u = (x + 0.5) / N - 0.5, v = 0.5 - (y + 0.5) / N, l = Math.hypot(u, v) || 1;
    const i = (y * N + x) * 4;
    px[i] = (-v / l * 0.5 + 0.5) * 255; px[i + 1] = (u / l * 0.5 + 0.5) * 255; px[i + 2] = 255; px[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return (_cache.sun = new THREE.CanvasTexture(c));
}
/* pebbled leather: a tileable cell-noise height field, turned into a normal map and a grain mask */
function leatherHeight() {
  if (_cache.lh) return _cache.lh;
  const N = 256, C = 22, pts = [];
  for (let j = 0; j < C; j++) for (let i = 0; i < C; i++) pts.push([(i + Math.random()) / C, (j + Math.random()) / C]);
  const h = new Float32Array(N * N);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const px = (x + 0.5) / N, py = (y + 0.5) / N, ci = Math.floor(px * C), cj = Math.floor(py * C);
    let f1 = 9, f2 = 9;
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
      const ii = (ci + di + C) % C, jj = (cj + dj + C) % C, p = pts[jj * C + ii];
      let dx = p[0] + Math.floor((ci + di) / C) - px, dy = p[1] + Math.floor((cj + dj) / C) - py;
      const d = dx * dx + dy * dy;
      if (d < f1) { f2 = f1; f1 = d; } else if (d < f2) f2 = d;
    }
    h[y * N + x] = Math.min(1, (Math.sqrt(f2) - Math.sqrt(f1)) * C * 1.6) + (Math.random() - 0.5) * 0.08;
  }
  return (_cache.lh = { h, N });
}
function leatherNormal() {
  if (_cache.ln) return _cache.ln;
  const { h, N } = leatherHeight(), c = document.createElement('canvas'); c.width = c.height = N;
  const g = c.getContext('2d'), img = g.createImageData(N, N), px = img.data, at = (x, y) => h[((y + N) % N) * N + ((x + N) % N)];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    let nx = (at(x - 1, y) - at(x + 1, y)) * 2.2, ny = (at(x, y + 1) - at(x, y - 1)) * 2.2, nz = 1;
    const l = Math.hypot(nx, ny, nz); const i = (y * N + x) * 4;
    px[i] = (nx / l * 0.5 + 0.5) * 255; px[i + 1] = (ny / l * 0.5 + 0.5) * 255; px[i + 2] = (nz / l * 0.5 + 0.5) * 255; px[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return (_cache.ln = t);
}
function leatherColor(d) {
  const { h, N } = leatherHeight(), c = document.createElement('canvas'); c.width = c.height = N;
  const g = c.getContext('2d'); g.fillStyle = d.strap; g.fillRect(0, 0, N, N);
  const img = g.getImageData(0, 0, N, N), px = img.data;
  for (let k = 0; k < N * N; k++) { const f = 0.8 + 0.28 * h[k]; px[k * 4] *= f; px[k * 4 + 1] *= f; px[k * 4 + 2] *= f; }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/* dial fonts: loaded by the module itself so the printed dial never falls back to a system face */
const FONT = (f) => new URL('../../assets/font/' + f, import.meta.url).href;
const dialFonts = (() => {
  if (!('FontFace' in window) || !document.fonts) return Promise.resolve();
  const faces = [
    new FontFace('Anton', `url(${FONT('anton-400.woff2')})`, { weight: '400' }),
    new FontFace('Inter Tight', `url(${FONT('intertight-normal.woff2')})`, { weight: '100 900' }),
    new FontFace('Instrument Serif', `url(${FONT('instrumentserif-400-italic.woff2')})`, { style: 'italic', weight: '400' }),
  ];
  return Promise.all(faces.map((f) => f.load().then((ff) => document.fonts.add(ff)).catch(() => null)));
})();
/* sunburst brushing as a roughness map: thousands of radial hairlines with random strength */
function sunRough() {
  if (_cache.sr) return _cache.sr;
  const N = 1024, c = document.createElement('canvas'); c.width = c.height = N;
  const g = c.getContext('2d'); g.fillStyle = 'rgb(150,150,150)'; g.fillRect(0, 0, N, N); g.translate(N / 2, N / 2);
  for (let i = 0; i < 2600; i++) {
    const a = Math.random() * Math.PI * 2, v = 110 + Math.random() * 90, r0 = Math.random() * N * 0.08;
    g.strokeStyle = `rgba(${v},${v},${v},0.5)`; g.lineWidth = 0.6 + Math.random() * 0.8;
    g.beginPath(); g.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); g.lineTo(Math.cos(a) * N * 0.72, Math.sin(a) * N * 0.72); g.stroke();
  }
  const t = new THREE.CanvasTexture(c); t.anisotropy = 8;
  return (_cache.sr = t);
}
/* polished steel is never perfect: faint wipes and fingerprint-like smudges in the roughness channel */
function smudgeRough() {
  if (_cache.sm) return _cache.sm;
  const N = 512, c = document.createElement('canvas'); c.width = c.height = N;
  const g = c.getContext('2d'); g.fillStyle = 'rgb(40,40,40)'; g.fillRect(0, 0, N, N);
  for (let i = 0; i < 26; i++) {
    const x = Math.random() * N, y = Math.random() * N, r = 20 + Math.random() * 60, gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, 'rgba(120,120,120,.35)'); gr.addColorStop(1, 'rgba(120,120,120,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  g.strokeStyle = 'rgba(110,110,110,.18)';
  for (let i = 0; i < 160; i++) { const x = Math.random() * N, y = Math.random() * N, a = Math.random() * 6.28, l = 10 + Math.random() * 70;
    g.lineWidth = 0.5 + Math.random(); g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return (_cache.sm = t);
}
/* engraved caseback: concentric text ring, sun emblem, serial; drawn as a height map (bump) + matching roughness */
function casebackMaps() {
  if (_cache.cb) return _cache.cb;
  const N = 1024, mk = () => { const c = document.createElement('canvas'); c.width = c.height = N; return c; };
  const hc = mk(), g = hc.getContext('2d'), R = N / 2;
  g.fillStyle = '#fff'; g.fillRect(0, 0, N, N); g.translate(R, R);
  /* fine circular graining in the centre medallion */
  g.strokeStyle = 'rgba(0,0,0,.05)'; for (let r = 4; r < R * 0.62; r += 2.2) { g.lineWidth = 1; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.stroke(); }
  g.fillStyle = '#000'; g.strokeStyle = '#000';
  /* engraved rings */
  for (const [r, w] of [[0.95, 3], [0.66, 2.5], [0.63, 1.2]]) { g.lineWidth = w; g.beginPath(); g.arc(0, 0, R * r, 0, Math.PI * 2); g.stroke(); }
  /* text on the ring */
  const ring = 'MERIDIAN  ·  AUTOMATIC  ·  STAINLESS STEEL  ·  SAPPHIRE  ·  WATER RESISTANT 100 M  ·  CONCEPT 02  ·  ';
  g.font = `600 ${N * 0.034}px "Inter Tight", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
  const chars = [...ring], step = (Math.PI * 2) / chars.length;
  chars.forEach((ch, i) => { g.save(); g.rotate(i * step); g.translate(0, -R * 0.805); g.fillText(ch, 0, 0); g.restore(); });
  /* sun emblem: 24 tapered rays round a disc */
  for (let i = 0; i < 24; i++) { g.save(); g.rotate((i / 24) * Math.PI * 2); g.beginPath(); g.moveTo(-N * 0.006, -R * 0.14); g.lineTo(N * 0.006, -R * 0.14); g.lineTo(0, -R * (i % 2 ? 0.3 : 0.4)); g.closePath(); g.fill(); g.restore(); }
  g.lineWidth = 3; g.beginPath(); g.arc(0, 0, R * 0.11, 0, Math.PI * 2); g.stroke();
  g.font = `600 ${N * 0.026}px "Inter Tight", sans-serif`;
  spaced(g, 'ZQ-28  ·  N\u00B0 0207', 0, R * 0.5, N * 0.006);
  /* blur a touch so the bump has soft walls, then derive roughness: engraved grooves are matte */
  const bc = mk(), bg = bc.getContext('2d'); bg.filter = 'blur(1.2px)'; bg.drawImage(hc, 0, 0);
  const rc = mk(), rg = rc.getContext('2d'); rg.drawImage(bc, 0, 0);
  const id = rg.getImageData(0, 0, N, N), px = id.data;
  for (let i = 0; i < px.length; i += 4) { const v = 255 - px[i]; const r = 75 + v * 0.5; px[i] = px[i + 1] = px[i + 2] = r; }
  rg.putImageData(id, 0, 0);
  const bump = new THREE.CanvasTexture(bc), rough = new THREE.CanvasTexture(rc);
  bump.anisotropy = rough.anisotropy = 8;
  return (_cache.cb = { bump, rough });
}
const P2 = (a) => a.map(([r, y]) => new THREE.Vector2(r, y));
/* a padded, tapered leather strap, bent around the wrist. Outer (visible) face is +y before bending. */
function strapGeo(w0, w1, t, L, R, dir, pad) {
  const NS = 96, NC = 40, pos = [], uv = [], col = [], idx = [], cross = [];
  for (let k = 0; k < NC; k++) {
    const ph = (k / NC) * Math.PI * 2 - Math.PI / 2, c = Math.cos(ph), s = Math.sin(ph);
    cross.push([Math.sign(c) * Math.pow(Math.abs(c), 0.42), Math.sign(s) * Math.pow(Math.abs(s), 0.42)]);
  }
  for (let i = 0; i <= NS; i++) {
    const f = i / NS, sl = f * L, wv = w0 + (w1 - w0) * f * f, a = sl / R;
    for (let k = 0; k <= NC; k++) {
      const [cx, cy] = cross[k % NC];
      let x = cx * wv / 2, y = cy * t / 2; if (cy > 0) y += pad * (1 - cx * cx) * cy;
      const rr = R + y;
      pos.push(x, -(R - Math.cos(a) * rr), dir * Math.sin(a) * rr);
      uv.push((k / NC) * 5.0, sl * 3.4);
      const e = Math.abs(cx) > 0.9 ? 0.5 : 1; col.push(e, e * 0.96, e * 0.93);
    }
  }
  for (let i = 0; i < NS; i++) for (let k = 0; k < NC; k++) {
    const a0 = i * (NC + 1) + k, b0 = a0 + NC + 1;
    if (dir > 0) idx.push(a0, b0, a0 + 1, b0, b0 + 1, a0 + 1); else idx.push(a0, a0 + 1, b0, b0, a0 + 1, b0 + 1);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  geo.setIndex(idx); geo.computeVertexNormals();
  return geo;
}

export function buildWatch(renderer) {
  const root = new THREE.Group();   /* faces camera */
  const w = new THREE.Group();      /* Y-up watch */
  w.rotation.x = Math.PI / 2;
  root.add(w);

  const SEG = 192;   /* one tier on every device */
  const steel = new THREE.MeshPhysicalMaterial({ color: 0xE6E3DC, metalness: 1, roughness: 0.16, roughnessMap: smudgeRough(), envMapIntensity: 1.2 });
  const brushed = new THREE.MeshPhysicalMaterial({ color: 0xCFCCC5, metalness: 1, roughness: 0.42, roughnessMap: brushTex(), anisotropy: 0.8, anisotropyRotation: Math.PI / 2 });
  const gold = new THREE.MeshPhysicalMaterial({ color: GOLD, metalness: 1, roughness: 0.24 });
  const handGold = new THREE.MeshPhysicalMaterial({ color: 0xD4B060, metalness: 1, roughness: 0.36 });
  const lume = new THREE.MeshStandardMaterial({ color: 0xF2EAD6, roughness: 0.55, emissive: 0x23301f, emissiveIntensity: 0.2 });
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), one = new THREE.Vector3(1, 1, 1);
  const seg = SEG;

  /* case: polished back, circular-grained flank, polished chamfer, stepped polished bezel */
  const lathe = (pts, mat, s = SEG) => { const m = new THREE.Mesh(new THREE.LatheGeometry(P2(pts), s), mat); w.add(m); return m; };
  /* caseback: satin circular-grained back with a polished outer chamfer */
  const backSatin = new THREE.MeshPhysicalMaterial({ color: 0xD9D6CF, metalness: 1, roughness: 0.34, roughnessMap: smudgeRough(), anisotropy: 0.6, anisotropyRotation: Math.PI / 2 });
  lathe([[0, -0.195], [0.5, -0.195], [0.78, -0.183]], backSatin);
  lathe([[0.78, -0.183], [0.92, -0.158], [0.965, -0.13]], steel);
  lathe([[0.965, -0.13], [0.988, -0.095], [0.999, -0.04], [1.0, 0.02], [0.995, 0.065], [0.985, 0.082]], brushed);
  lathe([[0.985, 0.082], [0.958, 0.122], [0.952, 0.126]], steel);
  lathe([[0.952, 0.126], [0.948, 0.15], [0.936, 0.168], [0.912, 0.178], [0.892, 0.179], [0.886, 0.172], [0.884, 0.164]], steel);
  /* engraved caseback medallion (seen during the dial-change twist) + a screw-down ring with six notches */
  { const cb = casebackMaps();
    const backMat = new THREE.MeshPhysicalMaterial({ color: 0xD6D3CC, metalness: 1, roughness: 1, roughnessMap: cb.rough, bumpMap: cb.bump, bumpScale: 1.6 });
    const disc = new THREE.Mesh(new THREE.CircleGeometry(0.62, SEG), backMat); disc.rotation.x = Math.PI / 2; disc.position.y = -0.1965; w.add(disc);
    const notchG = new RoundedBoxGeometry(0.07, 0.012, 0.03, 2, 0.005), notchMat = new THREE.MeshStandardMaterial({ color: 0x55534f, metalness: 1, roughness: 0.5 });
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + 0.26, n = new THREE.Mesh(notchG, notchMat); n.position.set(Math.sin(a) * 0.7, -0.193, Math.cos(a) * 0.7); n.rotation.y = a; w.add(n); } }
  /* rehaut (inner flange) */
  const rehautMat = new THREE.MeshStandardMaterial({ color: 0x173a2c, roughness: 0.55, metalness: 0.2, side: THREE.DoubleSide });
  lathe([[0.884, 0.164], [0.861, 0.1]], rehautMat, 96);

  /* dial: lacquered sunburst (radial anisotropy) under the printed canvas */
  const dialMat = new THREE.MeshPhysicalMaterial({ roughness: 0.42, roughnessMap: sunRough(), metalness: 0.55, clearcoat: 1, clearcoatRoughness: 0.05, anisotropy: 0.92, anisotropyMap: sunburstDir() });
  const dial = new THREE.Mesh(new THREE.CircleGeometry(0.862, SEG), dialMat);
  dial.rotation.x = -Math.PI / 2; dial.position.y = 0.1;
  w.add(dial);

  /* applied gold batons with chamfered edges and a lume insert each (12 o'clock is a double baton) */
  const IR = 0.69, slots = [];
  for (let i = 0; i < 12; i++) { if (i === 3) continue; const a = (i / 12) * Math.PI * 2; (i === 0 ? [-0.034, 0.034] : [0]).forEach((off) => slots.push({ a, off })); }
  /* faceted baton: a cross-section with two polished slopes and a flat top that carries the lume strip, chamfered ends */
  const bs = new THREE.Shape(); bs.moveTo(-0.022, 0); bs.lineTo(0.022, 0); bs.lineTo(0.022, 0.003); bs.lineTo(0.0125, 0.014); bs.lineTo(-0.0125, 0.014); bs.lineTo(-0.022, 0.003); bs.closePath();
  const batonG = new THREE.ExtrudeGeometry(bs, { depth: 0.14, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.0015, bevelSegments: 1, curveSegments: 1 });
  batonG.translate(0, 0, -0.07); batonG.computeVertexNormals();
  const idx = new THREE.InstancedMesh(batonG, gold, slots.length);
  const slotPos = (s, y) => new THREE.Vector3(Math.sin(s.a) * IR + Math.cos(s.a) * s.off, y, -Math.cos(s.a) * IR + Math.sin(s.a) * s.off);
  slots.forEach((s, k) => { q.setFromEuler(e.set(0, -s.a, 0)); m4.compose(slotPos(s, 0.1), q, one); idx.setMatrixAt(k, m4); });
  w.add(idx);
  /* date window frame (applied, gold) */
  const fr = new THREE.Shape(); fr.moveTo(-0.072, -0.058); fr.lineTo(0.072, -0.058); fr.lineTo(0.072, 0.058); fr.lineTo(-0.072, 0.058); fr.closePath();
  const fh = new THREE.Path(); fh.moveTo(-0.062, -0.049); fh.lineTo(-0.062, 0.049); fh.lineTo(0.062, 0.049); fh.lineTo(0.062, -0.049); fh.closePath(); fr.holes.push(fh);
  const frG = new THREE.ExtrudeGeometry(fr, { depth: 0.006, bevelEnabled: true, bevelThickness: 0.003, bevelSize: 0.003, bevelSegments: 2 });
  frG.rotateX(-Math.PI / 2);
  const frame = new THREE.Mesh(frG, gold); frame.position.set(0.533, 0.103, 0); w.add(frame);

  /* hands: polished gold sword hands with a lume channel, a needle seconds hand with counterweight */
  function hand(len, wid, tail, mat, depth, y, withLume) {
    const s = new THREE.Shape();
    s.moveTo(-wid * 0.3, -tail); s.lineTo(wid * 0.3, -tail); s.lineTo(wid * 0.5, 0); s.lineTo(wid * 0.4, len * 0.8); s.lineTo(0, len); s.lineTo(-wid * 0.4, len * 0.8); s.lineTo(-wid * 0.5, 0); s.closePath();
    const hp = [[-wid * 0.25, len * 0.17], [wid * 0.25, len * 0.17], [wid * 0.2, len * 0.79], [0, len * 0.9], [-wid * 0.2, len * 0.79]];
    const hole = new THREE.Path(); hole.moveTo(...hp[0]); hp.slice(1).forEach((p) => hole.lineTo(...p)); hole.closePath(); s.holes.push(hole);
    const geo = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: 0.0025, bevelSize: 0.0025, bevelSegments: 2, curveSegments: 1 });
    /* facet: top-face vertices rise toward the lume channel, so each flank of the frame is a sloped polished facet */
    { const p = geo.attributes.position;
      for (let i = 0; i < p.count; i++) { const zz = p.getZ(i); if (zz > depth * 0.5) { const xx = Math.abs(p.getX(i)), yy = p.getY(i);
        const half = yy < 0 ? wid * 0.3 : yy < len * 0.8 ? wid * (0.5 - 0.1 * yy / (len * 0.8)) : wid * 0.4 * (len - yy) / (len * 0.2);
        const k = 1 - Math.min(1, xx / Math.max(1e-4, half)); p.setZ(i, zz + depth * 0.9 * k); } }
      geo.computeVertexNormals(); }
    geo.rotateX(-Math.PI / 2);
    const g = new THREE.Group(); g.add(new THREE.Mesh(geo, mat)); g.position.y = y;
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(wid * 0.52, wid * 0.52, depth + 0.004, 32), mat); hub.position.y = depth / 2; g.add(hub);
    if (withLume) {
      const ls = new THREE.Shape(); ls.moveTo(...hp[0]); hp.slice(1).forEach((p) => ls.lineTo(...p)); ls.closePath();
      const lg = new THREE.ExtrudeGeometry(ls, { depth: depth * 0.8, bevelEnabled: false }); lg.rotateX(-Math.PI / 2);
      const lm = new THREE.Mesh(lg, lume); lm.position.y = 0.0004; g.add(lm);
    }
    return g;
  }
  const hH = hand(0.46, 0.078, 0.08, handGold, 0.007, 0.126, true);
  const hM = hand(0.71, 0.06, 0.1, handGold, 0.007, 0.139, true);
  const secMat = new THREE.MeshPhysicalMaterial({ color: 0xE9DFC8, metalness: 0.7, roughness: 0.22 });
  const hS = new THREE.Group(); hS.position.y = 0.152;
  const ns = new THREE.Shape(); ns.moveTo(-0.0055, 0.19); ns.lineTo(0.0055, 0.19); ns.lineTo(0.0022, -0.78); ns.lineTo(-0.0022, -0.78); ns.closePath();
  const nG = new THREE.ExtrudeGeometry(ns, { depth: 0.004, bevelEnabled: false }); nG.rotateX(Math.PI / 2); nG.translate(0, 0.004, 0);
  hS.add(new THREE.Mesh(nG, secMat));
  const cw = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.004, 32), secMat); cw.position.set(0, 0.002, 0.14); hS.add(cw);
  const sTip = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.005, 0.06), lume); sTip.position.set(0, 0.004, -0.62); hS.add(sTip);
  const cap = new THREE.Mesh(new THREE.LatheGeometry(P2([[0, 0.016], [0.018, 0.013], [0.03, 0.006], [0.034, 0]]), 32), gold); cap.position.y = 0.157;
  w.add(hH, hM, hS, cap);

  /* crown at 3 o'clock: coin-edge knurling on the grip, polished end with an applied ring */
  const crown = new THREE.Group();
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.08, 32), steel); tube.rotation.z = Math.PI / 2; tube.position.x = 1.02; crown.add(tube);
  const cg = new THREE.LatheGeometry(P2([[0.001, 0], [0.084, 0], [0.1, 0.012], [0.104, 0.028], [0.104, 0.1], [0.1, 0.116], [0.086, 0.128], [0.04, 0.133], [0.001, 0.134]]), 240);
  { const p = cg.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); if (v.y > 0.024 && v.y < 0.104) {
      const th = Math.atan2(v.x, v.z), f = (th / (Math.PI * 2)) * 40, tri = Math.abs(f - Math.floor(f) - 0.5) * 2, k = 1 - 0.07 * tri;
      p.setXYZ(i, v.x * k, v.y, v.z * k); } }
    cg.computeVertexNormals(); cg.rotateZ(-Math.PI / 2); }
  const crw = new THREE.Mesh(cg, brushed); crw.position.x = 1.035; crown.add(crw);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.006, 10, 48), gold); ring.rotation.y = Math.PI / 2; ring.position.x = 1.035 + 0.135; crown.add(ring);
  crown.position.y = -0.02; w.add(crown);
  /* crown guards: brushed shoulders either side of the crown, with polished chamfers */
  { const gs = new THREE.Shape(); gs.moveTo(0, -0.11); gs.quadraticCurveTo(0.09, -0.1, 0.1, -0.03); gs.lineTo(0.1, 0.03); gs.quadraticCurveTo(0.09, 0.1, 0, 0.11); gs.closePath();
    const gG = new THREE.ExtrudeGeometry(gs, { depth: 0.035, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 3, curveSegments: 14 });
    gG.rotateX(Math.PI / 2); gG.translate(0.975, 0.0, 0);
    for (const sz of [-1, 1]) { const gm = new THREE.Mesh(gG, brushed); gm.position.set(0, -0.02 + 0.03 * 0, sz * 0.15); gm.scale.y = 1; gm.position.y = 0.03; w.add(gm); } }

  /* lugs: curved, chamfered, extruded from a side profile */
  const lp = new THREE.Shape();
  lp.moveTo(0.7, -0.15); lp.lineTo(0.7, 0.066); lp.quadraticCurveTo(1.0, 0.08, 1.19, -0.03); lp.quadraticCurveTo(1.25, -0.065, 1.215, -0.12);
  lp.quadraticCurveTo(1.12, -0.17, 0.95, -0.168); lp.lineTo(0.7, -0.15);
  const lugMat = new THREE.MeshPhysicalMaterial({ color: 0xC2BFB8, metalness: 1, roughness: 0.3, roughnessMap: brushTex(), anisotropy: 0.5 });
  const lugG = new THREE.ExtrudeGeometry(lp, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.016, bevelSize: 0.014, bevelSegments: 3, curveSegments: 18 });
  lugG.rotateY(-Math.PI / 2); lugG.translate(0.06, 0, 0);
  { const p = lugG.attributes.position; for (let i = 0; i < p.count; i++) { const z = p.getZ(i), t = Math.min(1, Math.max(0, (z - 0.8) / 0.45)); p.setX(i, p.getX(i) * (1 - 0.3 * t)); } lugG.computeVertexNormals(); }
  for (const sz of [-1, 1]) for (const sx of [-1, 1]) {
    const l = new THREE.Mesh(lugG, lugMat); l.position.set(sx * 0.515, 0, 0); l.scale.z = sz; w.add(l);
  }

  /* strap: padded, tapered leather with a pebbled grain, painted edges and real stitches */
  const strapMat = new THREE.MeshPhysicalMaterial({ roughness: 0.62, metalness: 0, vertexColors: true, normalMap: leatherNormal(), normalScale: new THREE.Vector2(0.38, 0.38),
    sheen: 0.35, sheenRoughness: 0.55, sheenColor: new THREE.Color(0xd9c3a0), clearcoat: 0.12, clearcoatRoughness: 0.45, envMapIntensity: 0.8, side: THREE.DoubleSide });
  const stitchMat = new THREE.MeshStandardMaterial({ color: 0xE9DCC0, roughness: 0.8 });
  const keeperMat = strapMat.clone(); keeperMat.vertexColors = false; keeperMat.normalScale = new THREE.Vector2(0.15, 0.15);
  const SW0 = 0.84, SW1 = 0.7, ST = 0.085, SL = 2.4, SR = 1.9, SPAD = 0.022;
  const stG = new RoundedBoxGeometry(0.014, 0.01, 0.036, 2, 0.004);
  const stitchList = [];
  for (const dir of [-1, 1]) {
    const s = new THREE.Mesh(strapGeo(SW0, SW1, ST, SL, SR, dir, SPAD), strapMat);
    s.position.set(0, -0.04, dir * 1.07); w.add(s);
    for (let sl = 0.09; sl < SL - 0.12; sl += 0.058) {
      const f = sl / SL, wv = SW0 + (SW1 - SW0) * f * f, a = sl / SR;
      for (const sx of [-1, 1]) {
        const x = sx * (wv / 2 - 0.055), cx = x / (wv / 2), yt = ST / 2 + SPAD * (1 - cx * cx) * 0.9 + 0.001, rr = SR + yt;
        stitchList.push({ p: new THREE.Vector3(x, -(SR - Math.cos(a) * rr) - 0.04, dir * Math.sin(a) * rr + dir * 1.07), r: dir * a });
      }
    }
    if (dir === 1) {
      const a = 0.62 / SR, k = new THREE.Mesh(new RoundedBoxGeometry(SW0 + 0.05, ST + 0.075, 0.11, 3, 0.035), keeperMat);
      k.position.set(0, -(SR - Math.cos(a) * SR) - 0.04 + 0.01, Math.sin(a) * SR + 1.07); k.rotation.x = a; w.add(k);
      const a2 = 0.84 / SR, k2 = new THREE.Mesh(new RoundedBoxGeometry(SW0 - 0.02 + 0.05, ST + 0.07, 0.085, 3, 0.03), keeperMat);
      k2.position.set(0, -(SR - Math.cos(a2) * SR) - 0.04 + 0.01, Math.sin(a2) * SR + 1.07); k2.rotation.x = a2; w.add(k2);
    } else {
      /* punched holes with a darker burnished rim on the other strap */
      const holeMat = new THREE.MeshStandardMaterial({ color: 0x120c08, roughness: 0.9 });
      for (let hI = 0; hI < 5; hI++) {
        const sl = 1.05 + hI * 0.17, f = sl / SL, a = sl / SR, yt = ST / 2 + SPAD + 0.0015, rr = SR + yt;
        const hm = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.004, 32), holeMat);
        hm.position.set(0, -(SR - Math.cos(a) * rr) - 0.04, -Math.sin(a) * rr - 1.07); hm.rotation.x = -a; w.add(hm);
      }
    }
  }
  const stitches = new THREE.InstancedMesh(stG, stitchMat, stitchList.length);
  stitchList.forEach((s, k) => { q.setFromEuler(e.set(s.r, 0, 0)); m4.compose(s.p, q, one); stitches.setMatrixAt(k, m4); });
  w.add(stitches);

  /* sapphire crystal: a shallow box-dome with an anti-reflective tint */
  const crysG = new THREE.LatheGeometry(P2([[0, 0.2], [0.3, 0.198], [0.6, 0.192], [0.8, 0.182], [0.86, 0.172], [0.872, 0.165], [0.886, 0.165], [0.888, 0.176], [0.83, 0.19], [0.62, 0.203], [0.32, 0.21], [0, 0.212]]), SEG);
  /* transmission sampling showed a checker artefact at the rim, so the crystal is a thin clear coat of glass with an AR (iridescent) tint */
  const crysMat = new THREE.MeshPhysicalMaterial({ transparent: true, opacity: 0.1, roughness: 0.16, metalness: 0,
    specularIntensity: 0.6, ior: 1.77, iridescence: 0.5, iridescenceIOR: 1.38, iridescenceThicknessRange: [250, 340],
    envMapIntensity: 0.7, depthWrite: false, color: 0xf3f6ff });
  const crys = new THREE.Mesh(crysG, crysMat); crys.renderOrder = 2; w.add(crys);
  /* light sweep across the crystal */
  const sweepMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uT: { value: -1 }, uA: { value: 1 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'varying vec2 vUv; uniform float uT; uniform float uA; void main(){ vec2 p = vUv - 0.5; float m = smoothstep(0.5, 0.47, length(p)); float d = (p.x + p.y) * 0.7 - uT; float b = exp(-d*d*90.0) * 0.55 + exp(-pow(d+0.09,2.0)*700.0) * 0.35; b *= uA; gl_FragColor = vec4(vec3(1.0, 0.97, 0.9) * b * m, b * m); }',
  });
  const sweep = new THREE.Mesh(new THREE.CircleGeometry(0.87, 64), sweepMat);
  sweep.rotation.x = -Math.PI / 2; sweep.position.y = 0.216; w.add(sweep);


  /* ---- lume: pips + a glow layer that ignites clockwise, hand glows ---- */
  const LUME_D = new THREE.Color(0xE9E1CC), LUME_N = new THREE.Color(0xC4FFDC);
  const pipPos = slots.map((sl) => ({ a: sl.a, p: slotPos(sl, 0.1158) }));
  const pips = new THREE.InstancedMesh(new THREE.BoxGeometry(0.017, 0.004, 0.11), new THREE.MeshBasicMaterial({ toneMapped: false }), pipPos.length);
  pipPos.forEach((p, k) => { m4.compose(p.p, q.setFromEuler(e.set(0, -p.a, 0)), one); pips.setMatrixAt(k, m4); pips.setColorAt(k, LUME_D); });
  w.add(pips);
  function glowTex() {
    const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); return t;
  }
  const gt = glowTex();
  /* dial glow: one quad, a shader draws soft halos at the pips, revealed clockwise by uIgn */
  const glowMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
    uniforms: { uIgn: { value: 0 }, uN: { value: 0 }, uC: { value: new THREE.Color(0x9DF7C4) } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `varying vec2 vUv; uniform float uIgn; uniform float uN; uniform vec3 uC;
      void main(){ vec2 p = (vUv - 0.5) * 2.0; float r = length(p); float ang = atan(p.x, p.y); ang = ang < 0.0 ? ang + 6.2831853 : ang;
        float rev = smoothstep(ang - 0.25, ang, uIgn * 6.6);
        float k = floor(ang / 0.5235988 + 0.5); float ca = k * 0.5235988; vec2 c = vec2(sin(ca), cos(ca)) * 0.69 / 0.95;
        float pip = (abs(k - 3.0) < 0.5) ? 0.0 : exp(-pow(length(p - c) * 10.5, 2.0)) * 1.15;
        float ring = exp(-pow((r - 0.84) * 14.0, 2.0)) * 0.12;
        float a = (pip + ring) * rev * uN; gl_FragColor = vec4(uC * a, a); }`,
  });
  const dGlow = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.9), glowMat);
  dGlow.rotation.x = -Math.PI / 2; dGlow.position.y = 0.123; w.add(dGlow);
  const hgMat = new THREE.MeshBasicMaterial({ map: gt, color: 0x9DF7C4, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  for (const [g, len] of [[hH, 0.46], [hM, 0.7]]) {
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(0.16, len * 0.95), hgMat);
    gl.rotation.x = -Math.PI / 2; gl.position.set(0, 0.03, -len * 0.5); g.add(gl);
  }
  const dialDay = new THREE.Color(0xffffff), dialNight = new THREE.Color(0x7d9488), strapNight = new THREE.Color(0x5a5850);
  const tmp = new THREE.Color();
  function setLume(n, ign) {
    glowMat.uniforms.uN.value = n; glowMat.uniforms.uIgn.value = ign;
    lume.emissive.setHex(0x9DF7C4); lume.emissiveIntensity = 0.2 * (1 - n) + 2.6 * n * ign; lume.color.copy(LUME_D).lerp(LUME_N, n);
    pipPos.forEach((p, k) => { const on = n * Math.min(1, Math.max(0, (ign * 6.6 - p.a) / 0.25)); tmp.copy(LUME_D).lerp(LUME_N, on).multiplyScalar(1 + on * 0.6); pips.setColorAt(k, tmp); });
    pips.instanceColor.needsUpdate = true;
    hgMat.opacity = 0.55 * n * ign;
    dialMat.color.copy(dialDay).lerp(dialNight, n);
    strapMat.color.copy(dialDay).lerp(strapNight, n); keeperMat.color.copy(strapMat.color);
  }
  const dialTex = DIALS.map(() => null);
  const strapTex = DIALS.map(() => null);
  function setVariant(i) {
    const d = DIALS[i]; curV = i;
    if (!dialTex[i]) dialTex[i] = dialCanvas(d, 2048);
    if (!strapTex[i]) strapTex[i] = leatherColor(d);
    dialMat.map = dialTex[i]; dialMat.needsUpdate = true;
    strapMat.map = strapTex[i]; strapMat.needsUpdate = true; keeperMat.map = strapTex[i]; keeperMat.needsUpdate = true;
    secMat.color.set(i === 2 ? 0x1F4D3A : 0xE9DFC8);
    stitchMat.color.set(d.stitch);
    rehautMat.color.set(shade(d.dial, -0.3));
  }
  let curV = 0;
  dialFonts.then(() => { for (let k = 0; k < dialTex.length; k++) if (dialTex[k]) { dialTex[k].dispose(); dialTex[k] = null; } setVariant(curV); });
  function setTime(date, smooth = true, offMin = 0) {
    const ms = date.getMilliseconds(), s = date.getSeconds() + (smooth ? ms / 1000 : 0);
    /* 28,800 vph: the seconds hand moves in 8 tiny steps per second */
    const sStep = smooth ? Math.floor(s * 8) / 8 : s;
    const m = date.getMinutes() + s / 60 + offMin, h = (date.getHours() % 12) + m / 60;
    hS.rotation.y = -(sStep / 60) * Math.PI * 2;
    hM.rotation.y = -(m / 60) * Math.PI * 2;
    hH.rotation.y = -(h / 12) * Math.PI * 2;
  }
  return { root, w, setVariant, setTime, setLume, sweepMat, dial };
}

/* presentation box: forest felt case, cream pillow, open lid */
export function buildBox() {
  const g = new THREE.Group();
  const felt = new THREE.MeshPhysicalMaterial({ color: 0x1F4D3A, roughness: 0.92, sheen: 1, sheenRoughness: 0.5, sheenColor: new THREE.Color(0x5f8f78) });
  const lining = new THREE.MeshPhysicalMaterial({ color: 0xEDE3CC, roughness: 0.95, sheen: 1, sheenRoughness: 0.4, sheenColor: new THREE.Color(0xffffff) });
  const goldM = new THREE.MeshPhysicalMaterial({ color: 0xD6B467, metalness: 1, roughness: 0.5 });
  const W = 3.4, D = 2.9, H = 0.95;
  const base = new THREE.Mesh(new RoundedBoxGeometry(W, H, D, 4, 0.12), felt); base.position.y = -H / 2 - 0.25; g.add(base);
  const well = new THREE.Mesh(new RoundedBoxGeometry(W - 0.3, 0.1, D - 0.3, 3, 0.04), lining); well.position.y = -0.22; g.add(well);
  const pillow = new THREE.Mesh(new RoundedBoxGeometry(1.5, 0.5, 1.9, 6, 0.24), lining); pillow.position.y = -0.2; g.add(pillow);
  const hinge = new THREE.Group(); hinge.position.set(0, -0.2, -D / 2); g.add(hinge);
  const lid = new THREE.Mesh(new RoundedBoxGeometry(W, 0.32, D, 4, 0.12), felt); lid.position.set(0, 0, D / 2); hinge.add(lid);
  const lidIn = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.4, D - 0.4), lining); lidIn.rotation.x = Math.PI / 2; lidIn.position.set(0, -0.165, D / 2); hinge.add(lidIn);
  const plaque = new THREE.Mesh(new RoundedBoxGeometry(0.9, 0.02, 0.22, 2, 0.01), goldM); plaque.position.set(0, -0.18, D / 2 + 0.6); hinge.add(plaque);
  hinge.rotation.x = -1.95;
  g.userData.hinge = hinge;
  return g;
}
