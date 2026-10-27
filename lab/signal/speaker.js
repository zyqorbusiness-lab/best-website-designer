/* SIGNAL ONE - the studio's 3D showcase object (Concept 09, Zyqor Lab). Round 2 (detail pass).
   A fictional smart speaker modelled in code, same mesh + textures on desktop and phone:
   - barrel-turned body wrapped in a melange plain-weave fabric (1024px procedural yarn/fibre normal + shade map, sheen fuzz),
     rear seam with a lock-stitch either side, a folded woven label tag sewn into the seam;
   - floating rubber foot with two moulding grooves and micro-grain, set back under a large rounded shoulder (shadow gap);
   - anodised aluminium cap: fine vertical knurl on the wall, concentric-turned top ring (anisotropy map),
     two polished diamond-cut chamfers, parting-line gap to the fabric;
   - smoked glass touch top: micro-perforation field, backlit engraved icons (minus / play-pause / plus / mic), faint
     fingerprint smudges in the roughness map, a 48-bar LED ring with a diffused halo (Calm: slow breath / Loud: 118 BPM);
   - curved, bevelled aluminium name badge with laser-engraved lettering.
   Lit by the shared studio HDRI (Poly Haven "Studio Small 09", CC0) through PMREM, ACES, sRGB.
   No downloads besides the HDRI; every texture is drawn on a canvas at start. */
import * as THREE from 'three';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

/* The brand name lives here only (engraved on the badge and woven on the tag). */
export const BRAND = 'Signal';
export const PRODUCT = BRAND + ' One';

export const WAYS = {
  calm: { fabric: '#E6DFD0', sheen: '#FFFFFF', alu: '#C3C7CF', aluRough: 0.26, led: '#FF8A3D', foot: '#2A2D38', ring: '#FF7A2F', tag: '#FF7A2F' },
  loud: { fabric: '#FF6A22', sheen: '#FFD6BC', alu: '#3550E0', aluRough: 0.32, led: '#FFE1C2', foot: '#1E2233', ring: '#2340D8', tag: '#1A2FA6' },
};

const TAU = Math.PI * 2;
function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function rng(seed) { return () => ((seed = (seed * 16807) % 2147483647) / 2147483647); }
function hash(a, b) { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; }
function tex(c, { srgb = false, repeat = null, aniso = 8 } = {}) {
  const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = aniso;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  return t;
}
/* height field (Float32Array N*N, wraps) -> tangent-space normal map canvas */
function normalFrom(H, N, k) {
  const c = canvas(N, N), x = c.getContext('2d'), d = x.createImageData(N, N);
  for (let y = 0; y < N; y++) for (let i = 0; i < N; i++) {
    const h = (a, b) => H[((b + N) % N) * N + ((a + N) % N)];
    const dx = (h(i + 1, y) - h(i - 1, y)) * k, dy = (h(i, y + 1) - h(i, y - 1)) * k;
    const l = Math.hypot(dx, dy, 1), o = (y * N + i) * 4;
    d.data[o] = (-dx / l * 0.5 + 0.5) * 255; d.data[o + 1] = (dy / l * 0.5 + 0.5) * 255; d.data[o + 2] = (1 / l * 0.5 + 0.5) * 255; d.data[o + 3] = 255;
  }
  x.putImageData(d, 0, 0); return c;
}

/* Melange plain weave: each yarn is a bundle of twisted fibres of slightly different tone, crossing over/under. */
function weaveMaps(N = 1024, pairs = 32) {
  const H = new Float32Array(N * N), S = new Float32Array(N * N), P = N / (pairs * 2);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const cx = Math.floor(x / P), cy = Math.floor(y / P), fx = (x % P) / P, fy = (y % P) / P;
    const over = (cx + cy) % 2 === 0;
    const warp = Math.pow(Math.sin(Math.PI * fx), 0.7), weft = Math.pow(Math.sin(Math.PI * fy), 0.7);
    const dipW = 0.5 + 0.5 * Math.sin(Math.PI * fy), dipF = 0.5 + 0.5 * Math.sin(Math.PI * fx);
    const warpH = warp * (over ? 0.62 + 0.38 * dipW : 0.48 - 0.1 * dipW) + 0.05 * (hash(cx, 3) - 0.5);
    const weftH = weft * (over ? 0.48 - 0.1 * dipF : 0.62 + 0.38 * dipF) + 0.05 * (hash(cy, 9) - 0.5);
    const onWarp = warpH >= weftH, i = y * N + x;
    // twisted fibres: slanted strands across the yarn, tone varies per strand (melange) and slowly along the length
    const strand = onWarp ? Math.floor((x + y * 0.42) / 2.3) : Math.floor((y + x * 0.42) / 2.3);
    const along = onWarp ? Math.floor(y / 37) : Math.floor(x / 37);
    const t1 = hash(strand, along + (onWarp ? 0 : 999));
    let tone = 0.93 + 0.12 * (t1 - 0.5);
    if (t1 > 0.965) tone += 0.16; else if (t1 < 0.03) tone -= 0.2;       // light and dark flecks
    const fib = 0.06 * Math.sin((onWarp ? x : y) * 2.75 + (onWarp ? y : x) * 1.15);
    const hgt = Math.max(warpH, weftH);
    H[i] = hgt + fib * hgt;
    S[i] = tone * (0.62 + 0.38 * Math.min(1, Math.max(0, hgt * 1.05)));   // crevices darker = baked AO
  }
  const sc = canvas(N, N), sx = sc.getContext('2d'), sd = sx.createImageData(N, N);
  for (let i = 0; i < N * N; i++) { const v = Math.min(255, S[i] * 262); sd.data[i * 4] = sd.data[i * 4 + 1] = sd.data[i * 4 + 2] = v; sd.data[i * 4 + 3] = 255; }
  sx.putImageData(sd, 0, 0);
  return { normal: normalFrom(H, N, 3.2), shade: sc };
}

/* Fine knurl / vertical ribs for the cap wall (u wraps once around). */
function knurlMap() {
  const W = 2048, Hh = 32, c = canvas(W, Hh), x = c.getContext('2d'), d = x.createImageData(W, Hh); const r = rng(5);
  for (let i = 0; i < W; i++) { const v = 128 + 110 * Math.sin(i / W * 900 * TAU); for (let j = 0; j < Hh; j++) { const o = (j * W + i) * 4; const g = v + (r() - 0.5) * 18; d.data[o] = d.data[o + 1] = d.data[o + 2] = g; d.data[o + 3] = 255; } }
  x.putImageData(d, 0, 0); return c;
}
/* Concentric turning on the flat top ring: anisotropy direction map (RG = tangent dir, B = strength) + roughness rings. */
function turnedMaps(N = 1024) {
  const a = canvas(N, N), r = canvas(N, N), ax = a.getContext('2d'), rx = r.getContext('2d');
  const ad = ax.createImageData(N, N), rd = rx.createImageData(N, N); const rnd = rng(11);
  const rings = new Float32Array(N).map(() => rnd());
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const u = i / N - 0.5, v = (1 - j / N) - 0.5, rad = Math.hypot(u, v) || 1e-6, o = (j * N + i) * 4;
    const tx = -v / rad, ty = u / rad;
    ad.data[o] = (tx * 0.5 + 0.5) * 255; ad.data[o + 1] = (ty * 0.5 + 0.5) * 255; ad.data[o + 2] = 255; ad.data[o + 3] = 255;
    const g = 150 + 60 * rings[Math.floor(rad * N * 1.6) % N] + 20 * (rnd() - 0.5);
    rd.data[o] = rd.data[o + 1] = rd.data[o + 2] = g; rd.data[o + 3] = 255;
  }
  ax.putImageData(ad, 0, 0); rx.putImageData(rd, 0, 0); return { aniso: a, rough: r };
}

/* Glass touch top: colour (perforation field + engraved icons), roughness (fingerprints), emissive (backlit icons). */
function topMaps(N = 1024) {
  const col = canvas(N, N), rou = canvas(N, N), emi = canvas(N, N);
  const c = col.getContext('2d'), r = rou.getContext('2d'), e = emi.getContext('2d');
  const C = N / 2, R = N / 2;
  c.fillStyle = '#0d1018'; c.fillRect(0, 0, N, N);
  r.fillStyle = 'rgb(40,40,40)'; r.fillRect(0, 0, N, N);
  e.fillStyle = '#000'; e.fillRect(0, 0, N, N);
  // micro-perforation field (hex grid) in the outer band and inner disc, leaving the LED ring band clear
  const step = 11, rowH = step * 0.866;
  for (let yy = 0, row = 0; yy < N; yy += rowH, row++) for (let xx = (row % 2) * step / 2; xx < N; xx += step) {
    const d = Math.hypot(xx - C, yy - C) / R;
    if (d > 0.955 || (d > 0.47 && d < 0.84)) continue;
    if (d < 0.40 && Math.abs(yy - C) < 70) continue;  // keep the icon row clean
    c.fillStyle = '#05070c'; c.beginPath(); c.arc(xx, yy, 2.1, 0, TAU); c.fill();
    c.fillStyle = 'rgba(120,128,150,.35)'; c.beginPath(); c.arc(xx + 0.5, yy + 1.3, 1.0, 0, Math.PI); c.fill();
    r.fillStyle = 'rgb(170,170,170)'; r.beginPath(); r.arc(xx, yy, 2.1, 0, TAU); r.fill();
  }
  // a hair-line ring marking the LED band, and the outer polished edge
  c.strokeStyle = 'rgba(160,168,186,.22)'; c.lineWidth = 2;
  for (const k of [0.49, 0.82]) { c.beginPath(); c.arc(C, C, R * k, 0, TAU); c.stroke(); }
  // engraved, backlit icons (line icons, round caps)
  const icon = (ctx, colour, w) => {
    ctx.strokeStyle = colour; ctx.fillStyle = colour; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const s = 34, y = C;
    ctx.beginPath(); ctx.moveTo(C - 230 - s, y); ctx.lineTo(C - 230 + s, y); ctx.stroke();                       // minus
    ctx.beginPath(); ctx.moveTo(C + 230 - s, y); ctx.lineTo(C + 230 + s, y); ctx.moveTo(C + 230, y - s); ctx.lineTo(C + 230, y + s); ctx.stroke(); // plus
    ctx.beginPath(); ctx.moveTo(C - 26, y - 26); ctx.lineTo(C - 26, y + 26); ctx.lineTo(C + 6, y); ctx.closePath(); ctx.stroke();   // play
    ctx.beginPath(); ctx.moveTo(C + 22, y - 24); ctx.lineTo(C + 22, y + 24); ctx.moveTo(C + 36, y - 24); ctx.lineTo(C + 36, y + 24); ctx.stroke(); // pause
    // mic (back of the top, outside the ring)
    const my = C - R * 0.895;
    ctx.beginPath(); ctx.roundRect(C - 9, my - 16, 18, 28, 9); ctx.stroke();
    ctx.beginPath(); ctx.arc(C, my + 2, 17, 0.15 * Math.PI, 0.85 * Math.PI); ctx.moveTo(C, my + 19); ctx.lineTo(C, my + 25); ctx.stroke();
  };
  icon(c, 'rgba(196,202,214,.92)', 6.5);
  icon(r, 'rgb(120,120,120)', 7.5);
  e.filter = 'blur(3px)'; icon(e, '#ffffff', 9); e.filter = 'none'; icon(e, '#ffffff', 5);
  // fingerprints and smudges (roughness only): faint whorls of concentric ridges
  const rnd = rng(23);
  for (let k = 0; k < 5; k++) {
    const px = C + (rnd() - 0.5) * N * 0.7, py = C + (rnd() - 0.5) * N * 0.7, rot = rnd() * Math.PI;
    r.save(); r.translate(px, py); r.rotate(rot); r.scale(1, 1.35);
    for (let q = 4; q < 46; q += 3.2) { r.strokeStyle = `rgba(230,230,230,${0.10 * (1 - q / 50)})`; r.lineWidth = 1.4; r.beginPath(); r.arc(0, 0, q, rnd() * 0.6, TAU - rnd() * 0.6); r.stroke(); }
    r.restore();
  }
  const sm = r.createRadialGradient(C * 1.3, C * 0.75, 10, C * 1.3, C * 0.75, 220); sm.addColorStop(0, 'rgba(210,210,210,.16)'); sm.addColorStop(1, 'rgba(210,210,210,0)');
  r.fillStyle = sm; r.fillRect(0, 0, N, N);
  return { col, rou, emi };
}

/* Badge artwork: laser-engraved lettering (colour + bump), 1024 x 256 over the plate's UV box. */
function badgeMaps(text) {
  const W = 1024, Hh = 256, col = canvas(W, Hh), bmp = canvas(W, Hh), c = col.getContext('2d'), b = bmp.getContext('2d');
  c.fillStyle = '#ffffff'; c.fillRect(0, 0, W, Hh); b.fillStyle = '#fff'; b.fillRect(0, 0, W, Hh);
  const t = text.toUpperCase().split('').join('\u200A');
  const font = '700 104px "Unbounded", "Inter Tight", system-ui, sans-serif';
  for (const [ctx, colour] of [[c, '#585d6a'], [b, '#202020']]) {
    ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = colour; ctx.fillText(t, W / 2, Hh / 2 + 6);
  }
  // fine brushed grain on the plate
  const r = rng(31); c.globalAlpha = 0.08; for (let y = 0; y < Hh; y++) { c.fillStyle = r() > 0.5 ? '#000' : '#fff'; c.fillRect(0, y, W, 1); } c.globalAlpha = 1;
  return { col, bmp };
}

/* Seam strip: a sunken centre line and a lock-stitch row either side (alpha = only the threads + groove show). */
function seamMap() {
  const W = 128, Hh = 512, c = canvas(W, Hh), x = c.getContext('2d');
  x.clearRect(0, 0, W, Hh);
  const g = x.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0.36, 'rgba(0,0,0,0)'); g.addColorStop(0.47, 'rgba(0,0,0,.55)'); g.addColorStop(0.5, 'rgba(0,0,0,.75)'); g.addColorStop(0.53, 'rgba(0,0,0,.55)'); g.addColorStop(0.64, 'rgba(0,0,0,0)');
  x.fillStyle = g; x.fillRect(0, 0, W, Hh);
  for (const sx of [22, W - 22]) for (let y = 4; y < Hh; y += 32) {
    x.save(); x.translate(sx, y + 12); x.rotate(sx < W / 2 ? 0.18 : -0.18);
    x.fillStyle = 'rgba(0,0,0,.35)'; x.beginPath(); x.roundRect(-5, -11, 11, 25, 5); x.fill();
    const tg = x.createLinearGradient(-4, 0, 4, 0); tg.addColorStop(0, 'rgba(255,255,255,.55)'); tg.addColorStop(0.5, 'rgba(255,255,255,.95)'); tg.addColorStop(1, 'rgba(255,255,255,.5)');
    x.fillStyle = tg; x.beginPath(); x.roundRect(-4, -11, 8, 22, 4); x.fill(); x.restore();
  }
  return c;
}
/* Woven tag artwork */
function tagMap(text) {
  const W = 128, Hh = 256, c = canvas(W, Hh), x = c.getContext('2d');
  x.fillStyle = '#ffffff'; x.fillRect(0, 0, W, Hh);
  for (let y = 0; y < Hh; y += 3) { x.fillStyle = `rgba(0,0,0,${y % 6 ? 0.06 : 0.12})`; x.fillRect(0, y, W, 1.5); }
  x.save(); x.translate(W / 2, Hh / 2); x.rotate(-Math.PI / 2);
  x.font = '700 40px "Unbounded", "Inter Tight", system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = 'rgba(255,255,255,.95)';
  x.globalCompositeOperation = 'difference'; x.fillText(text.toUpperCase(), 0, 3); x.restore();
  return c;
}
function softBar() {
  const c = canvas(64, 256), x = c.getContext('2d'), g = x.createLinearGradient(0, 0, 64, 0);
  g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 64, 256);
  x.globalCompositeOperation = 'destination-in';
  const v = x.createLinearGradient(0, 0, 0, 256); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(0.12, 'rgba(0,0,0,1)'); v.addColorStop(0.88, 'rgba(0,0,0,1)'); v.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = v; x.fillRect(0, 0, 64, 256); return c;
}
function grainMap(N = 256, seed = 41) {
  const H = new Float32Array(N * N), r = rng(seed); for (let i = 0; i < N * N; i++) H[i] = r();
  return normalFrom(H, N, 0.35);
}
function shadowTex(inner = 0.0, soft = 1) {
  const c = canvas(256, 256), x = c.getContext('2d');
  const g = x.createRadialGradient(128, 128, 128 * inner, 128, 128, 128);
  g.addColorStop(0, `rgba(8,12,40,${0.62 * soft})`); g.addColorStop(0.45, `rgba(8,12,40,${0.32 * soft})`);
  g.addColorStop(1, 'rgba(8,12,40,0)');
  x.fillStyle = g; x.fillRect(0, 0, 256, 256); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

/* LatheGeometry spaces v by point index; re-map it by arc length (world units) so textures are not stretched. */
function lathe(pts, seg = 192) {
  const geo = new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);
  const acc = [0]; for (let i = 1; i < pts.length; i++) acc.push(acc[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const uv = geo.attributes.uv, n = pts.length;
  for (let k = 0; k < uv.count; k++) uv.setY(k, acc[k % n]);
  uv.needsUpdate = true; return geo;
}
function arc(cx, cy, rad, a0, a1, n, out) { for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; out.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]); } return out; }
/* wrap a flat geometry (x along the arc, z outward) around a cylinder of radius R, centred on angle phi0 */
function bend(geo, R, phi0 = 0) {
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), a = phi0 + x / R, rr = R + z;
    p.setXYZ(i, Math.sin(a) * rr, y, Math.cos(a) * rr);
  }
  p.needsUpdate = true;
  if (!geo.index) { geo.deleteAttribute('normal'); geo = mergeVertices(geo, 1e-6); }
  geo.computeVertexNormals(); return geo;
}

export function buildSpeaker() {
  const W = WAYS.calm, g = new THREE.Group();
  const R = 0.47, H0 = 0.07, SH = 0.13, H1 = 1.40;

  // ---- fabric body: big rounded shoulder at the base, a gentle barrel, tucks in under the cap
  const body = [[0.0, H0 + 0.004], [R - SH, H0]]; arc(R - SH, H0 + SH, SH, -Math.PI / 2, 0, 18, body);
  for (let i = 1; i <= 24; i++) { const t = i / 24, y = H0 + SH + (H1 - 0.02 - H0 - SH) * t; body.push([R + 0.007 * Math.sin(Math.PI * t), y]); }
  body.push([R - 0.002, H1 - 0.006], [R - 0.012, H1 + 0.002], [R - 0.03, H1 + 0.004]);
  const wm = weaveMaps(1024, 32);
  const rep = [12, 4.07];
  const fabN = tex(wm.normal, { repeat: rep, aniso: 16 }), fabS = tex(wm.shade, { srgb: true, repeat: rep, aniso: 16 });
  const fabric = new THREE.MeshPhysicalMaterial({
    color: W.fabric, map: fabS, normalMap: fabN, normalScale: new THREE.Vector2(1.0, 1.0),
    roughness: 0.94, sheen: 1, sheenRoughness: 0.42, sheenColor: new THREE.Color(W.sheen),
  });
  const bodyGeo = lathe(body, 256);
  { // baked ambient occlusion in vertex colours: fabric darkens under the cap overhang and as the shoulder turns under
    const p = bodyGeo.attributes.position, col = new Float32Array(p.count * 3);
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i), rr = Math.hypot(p.getX(i), p.getZ(i));
      let ao = 1 - 0.42 * Math.exp(-Math.max(0, H1 - y) / 0.022);
      if (y < H0 + SH) ao *= 0.55 + 0.45 * Math.min(1, Math.max(0, (rr - (R - SH)) / SH * 1.15 + (y - H0) / SH * 0.6));
      col[i * 3] = col[i * 3 + 1] = col[i * 3 + 2] = ao;
    }
    bodyGeo.setAttribute('color', new THREE.BufferAttribute(col, 3)); fabric.vertexColors = true;
  }
  const mBody = new THREE.Mesh(bodyGeo, fabric); g.add(mBody);

  // rear seam with lock-stitch, follows the barrel
  const seamW = 0.034, seamGeo = new THREE.PlaneGeometry(seamW, H1 - H0 - SH - 0.03, 1, 24);
  const sp = seamGeo.attributes.position;
  for (let i = 0; i < sp.count; i++) { const y = sp.getY(i) + (H1 + H0 + SH - 0.03) / 2; const t = (y - H0 - SH) / (H1 - 0.02 - H0 - SH); sp.setY(i, y); sp.setZ(i, 0.0018 + 0.007 * Math.sin(Math.PI * Math.min(1, Math.max(0, t)))); }
  bend(seamGeo, R, Math.PI);
  const seamTex = tex(seamMap(), { srgb: true }); seamTex.wrapT = THREE.RepeatWrapping; seamTex.repeat.set(1, 9);
  const seamMat = new THREE.MeshPhysicalMaterial({ color: W.fabric, map: seamTex, transparent: true, roughness: 0.9, sheen: 0.6, sheenColor: new THREE.Color(W.sheen), depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  const seam = new THREE.Mesh(seamGeo, seamMat); g.add(seam);

  // woven label tag folded into the seam (a soft loop standing off the fabric)
  const tagTex = tex(tagMap(BRAND), { srgb: true });
  const tagMat = new THREE.MeshPhysicalMaterial({ color: W.tag, map: tagTex, roughness: 0.85, sheen: 0.8, sheenRoughness: 0.5, sheenColor: new THREE.Color('#ffffff'), side: THREE.FrontSide });
  // tag lies along the fabric from the seam (x along the surface = length, y = width, z = thickness outward)
  const tagShape = new THREE.Shape(); const tl = 0.07, tw = 0.032, rc = 0.008;
  tagShape.moveTo(0, -tw / 2); tagShape.lineTo(tl - rc, -tw / 2); tagShape.quadraticCurveTo(tl, -tw / 2, tl, -tw / 2 + rc); tagShape.lineTo(tl, tw / 2 - rc); tagShape.quadraticCurveTo(tl, tw / 2, tl - rc, tw / 2); tagShape.lineTo(0, tw / 2); tagShape.closePath();
  const tagGeo0 = new THREE.ExtrudeGeometry(tagShape, { depth: 0.005, bevelEnabled: true, bevelThickness: 0.0014, bevelSize: 0.0014, bevelSegments: 2, curveSegments: 6 });
  { const uv = tagGeo0.attributes.uv, p = tagGeo0.attributes.position; for (let i = 0; i < p.count; i++) uv.setXY(i, 0.5 - p.getY(i) / tw, p.getX(i) / tl); }
  const tagGeo = bend(tessellateX(tagGeo0, 0.006), R + 0.004, Math.PI);
  const tag = new THREE.Mesh(tagGeo, tagMat); tag.position.y = 0.42; g.add(tag);

  // ---- floating rubber foot: chamfered, two moulding grooves, micro-grain
  const FR = 0.315, foot = [[0, 0.003], [FR - 0.012, 0.003], [FR, 0.015], [FR, 0.024], [FR - 0.004, 0.027], [FR, 0.030], [FR, 0.040], [FR - 0.004, 0.043], [FR, 0.046], [FR, H0 - 0.004], [FR - 0.01, H0 + 0.002]];
  const grain = tex(grainMap(256), { repeat: [24, 3] });
  const rubber = new THREE.MeshPhysicalMaterial({ color: W.foot, roughness: 0.72, normalMap: grain, normalScale: new THREE.Vector2(0.5, 0.5), sheen: 0.45, sheenRoughness: 0.75, sheenColor: new THREE.Color('#5b6080') });
  g.add(new THREE.Mesh(lathe(foot, 160), rubber));
  // rear power inlet: a moulded rubber grommet with a recessed connector slot, low on the back beside the seam
  const rr = (w, h, r) => { const s = new THREE.Shape(); s.moveTo(-w / 2 + r, -h / 2); s.lineTo(w / 2 - r, -h / 2); s.absarc(w / 2 - r, -h / 2 + r, r, -Math.PI / 2, 0); s.lineTo(w / 2, h / 2 - r); s.absarc(w / 2 - r, h / 2 - r, r, 0, Math.PI / 2); s.lineTo(-w / 2 + r, h / 2); s.absarc(-w / 2 + r, h / 2 - r, r, Math.PI / 2, Math.PI); s.lineTo(-w / 2, -h / 2 + r); s.absarc(-w / 2 + r, -h / 2 + r, r, Math.PI, Math.PI * 1.5); return s; };
  const gromGeo0 = new THREE.ExtrudeGeometry(rr(0.075, 0.05, 0.016), { depth: 0.004, bevelEnabled: true, bevelThickness: 0.002, bevelSize: 0.002, bevelSegments: 3, curveSegments: 10 });
  { const uv = gromGeo0.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, 0, 0); }
  const grommet = new THREE.Mesh(bend(tessellateX(gromGeo0, 0.006), R + 0.004, Math.PI + 0.32), rubber); grommet.position.y = H0 + SH + 0.07; g.add(grommet);
  const slotGeo0 = new THREE.ExtrudeGeometry(rr(0.034, 0.012, 0.006), { depth: 0.002, bevelEnabled: false, curveSegments: 8 });
  { const uv = slotGeo0.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, 0, 0); }
  const slot = new THREE.Mesh(bend(tessellateX(slotGeo0, 0.004), R + 0.0085, Math.PI + 0.32), new THREE.MeshStandardMaterial({ color: '#050609', roughness: 0.6, metalness: 0.2 }));
  slot.position.y = H0 + SH + 0.07; g.add(slot);

  // dark fabric under-side seen inside the shadow gap
  const under = new THREE.Mesh(new THREE.RingGeometry(FR - 0.01, R - SH + 0.01, 128).rotateX(Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#141620', roughness: 0.95 }));
  under.position.y = H0 + 0.001; g.add(under);

  // ---- anodised aluminium cap
  const T0 = H1 - 0.012, T1 = H1 + 0.135, RO = R + 0.008, ch = 0.011, RI = R - 0.045;
  const capPts = [[R - 0.02, T0], [RO - ch, T0], [RO, T0 + ch], [RO, T1 - ch * 1.2]];
  const knurl = tex(knurlMap(), { aniso: 16 }); knurl.wrapS = THREE.RepeatWrapping;
  const alu = new THREE.MeshPhysicalMaterial({
    color: W.alu, metalness: 1, roughness: W.aluRough + 0.08, bumpMap: knurl, bumpScale: 0.15,
    clearcoat: 0.35, clearcoatRoughness: 0.25, envMapIntensity: 1.5,
  });
  const capGeo = lathe(capPts, 512);
  { const uv = capGeo.attributes.uv; for (let k = 0; k < uv.count; k++) uv.setY(k, uv.getY(k) * 4); }
  const mCap = new THREE.Mesh(capGeo, alu); g.add(mCap);
  const gap = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.0035, R + 0.0035, 0.007, 192, 1, true), new THREE.MeshStandardMaterial({ color: '#07080e', roughness: 0.9 }));
  gap.position.y = T0 - 0.0015; g.add(gap);
  // polished diamond-cut chamfers (outer edge and the inner lip into the glass)
  const chamfer = new THREE.MeshPhysicalMaterial({ color: '#f6f7f9', metalness: 1, roughness: 0.05 });
  g.add(new THREE.Mesh(lathe([[RO, T1 - ch * 1.2], [RO - ch * 1.3, T1]], 256), chamfer));
  g.add(new THREE.Mesh(lathe([[RI + 0.0, T1], [RI - 0.008, T1 - 0.008]], 256), chamfer));
  // concentric-turned flat top ring (anisotropic highlights rotate around the ring)
  const tm = turnedMaps(1024);
  const ringMat = new THREE.MeshPhysicalMaterial({
    color: W.alu, metalness: 1, roughness: W.aluRough * 0.9, roughnessMap: tex(tm.rough), anisotropy: 0.85, anisotropyMap: tex(tm.aniso),
    envMapIntensity: 1.3,
  });
  const topRing = new THREE.Mesh(new THREE.RingGeometry(RI, RO - ch * 1.3, 256, 2).rotateX(-Math.PI / 2), ringMat);
  { // planar UVs across the full outer diameter so the turning centre is the axis
    const p = topRing.geometry.attributes.position, uv = topRing.geometry.attributes.uv;
    for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / (2 * RO) + 0.5, -p.getZ(i) / (2 * RO) + 0.5);
  }
  topRing.position.y = T1; g.add(topRing);

  // ---- smoked glass touch top
  const TOP = T1 - 0.008, GR = RI - 0.008, tp = topMaps(1024);
  const glass = new THREE.MeshPhysicalMaterial({
    color: '#ffffff', map: tex(tp.col, { srgb: true, aniso: 16 }), roughness: 1, roughnessMap: tex(tp.rou, { aniso: 16 }), metalness: 0,
    clearcoat: 1, clearcoatRoughness: 0.06, ior: 1.5, specularIntensity: 0.6,
    emissive: '#ffffff', emissiveMap: tex(tp.emi, { srgb: true }), emissiveIntensity: 0.22,
  });
  const disc = new THREE.Mesh(new THREE.CircleGeometry(GR, 192).rotateX(-Math.PI / 2), glass); disc.position.y = TOP; g.add(disc);

  // LED ring: 48 soft bars + a wider diffused halo with the same matrices (light spreading under frosted glass)
  const BARS = 48, sb = new THREE.CanvasTexture(softBar());
  const barGeo = new THREE.PlaneGeometry(0.016, 1).translate(0, -0.5, 0).rotateX(-Math.PI / 2);
  const haloGeo = new THREE.PlaneGeometry(0.06, 1.25).translate(0, -0.5, 0).rotateX(-Math.PI / 2);
  const ledMat = new THREE.MeshBasicMaterial({ color: W.led, map: sb, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const haloMat = new THREE.MeshBasicMaterial({ color: W.led, map: sb, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const leds = new THREE.InstancedMesh(barGeo, ledMat, BARS), halo = new THREE.InstancedMesh(haloGeo, haloMat, BARS);
  leds.position.y = TOP + 0.0012; halo.position.y = TOP + 0.0008; leds.renderOrder = 2; halo.renderOrder = 1;
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  g.add(halo, leds);
  const glowC = canvas(256, 256), gx = glowC.getContext('2d');
  const gg = gx.createRadialGradient(128, 128, 40, 128, 128, 128);
  gg.addColorStop(0, 'rgba(255,255,255,0)'); gg.addColorStop(0.55, 'rgba(255,255,255,.55)'); gg.addColorStop(0.75, 'rgba(255,255,255,.25)'); gg.addColorStop(1, 'rgba(255,255,255,0)');
  gx.fillStyle = gg; gx.fillRect(0, 0, 256, 256);
  const glowMat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(glowC), color: W.led, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.8).rotateX(-Math.PI / 2), glowMat); glow.position.y = TOP + 0.0018; g.add(glow);

  // ---- curved, bevelled aluminium badge with laser-engraved lettering
  const bw = 0.25, bh = 0.058, br = bh / 2, bShape = new THREE.Shape();
  bShape.moveTo(-bw / 2 + br, -bh / 2); bShape.lineTo(bw / 2 - br, -bh / 2); bShape.absarc(bw / 2 - br, 0, br, -Math.PI / 2, Math.PI / 2); bShape.lineTo(-bw / 2 + br, bh / 2); bShape.absarc(-bw / 2 + br, 0, br, Math.PI / 2, Math.PI * 1.5);
  const bGeo = new THREE.ExtrudeGeometry(bShape, { depth: 0.003, bevelEnabled: true, bevelThickness: 0.0022, bevelSize: 0.0022, bevelSegments: 4, curveSegments: 24, steps: 1 });
  { const p = bGeo.attributes.position, uv = bGeo.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / bw + 0.5, p.getY(i) / bh + 0.5); }
  // subdivide along x for a smooth bend: rebuild through a tessellated copy
  const bm = badgeMaps(BRAND);
  const badgeMat = new THREE.MeshPhysicalMaterial({ color: W.alu, map: tex(bm.col, { srgb: true, aniso: 16 }), bumpMap: tex(bm.bmp, { aniso: 16 }), bumpScale: 1.4, metalness: 1, roughness: 0.42, envMapIntensity: 1.6, clearcoat: 0.3, clearcoatRoughness: 0.3 });
  const badgeGeo = bend(tessellateX(bGeo, 0.006), R + 0.004, 0);
  const badge = new THREE.Mesh(badgeGeo, badgeMat); badge.position.y = 0.33; g.add(badge);

  // ---- contact shadow: wide soft + tight occlusion under the floating foot
  const sh1 = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: shadowTex(0, 0.75), transparent: true, depthWrite: false, toneMapped: false }));
  sh1.position.y = 0.0005; sh1.renderOrder = -2;
  const sh2 = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 1.05).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: shadowTex(0.5, 1.15), transparent: true, depthWrite: false, toneMapped: false }));
  sh2.position.y = 0.001; sh2.renderOrder = -1;
  const floor = new THREE.Group(); floor.add(sh1, sh2);

  const ripples = [];
  for (let i = 0; i < 3; i++) {
    const rm = new THREE.MeshBasicMaterial({ color: W.ring, transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
    const r = new THREE.Mesh(new THREE.RingGeometry(0.98, 1, 128).rotateX(-Math.PI / 2), rm); r.position.y = 0.002; floor.add(r); ripples.push({ m: r, t: 9 });
  }

  const mats = { fabric, seamMat, alu, ringMat, rubber, ledMat, haloMat, glowMat, glass, tagMat, ripples, metals: [alu, ringMat, chamfer, badgeMat], badgeMat };
  const bars = new Float32Array(BARS);
  function setBars(t, k, env) {
    for (let i = 0; i < BARS; i++) {
      const a = i / BARS * TAU;
      const calm = 0.35 + 0.25 * Math.sin(t * 1.1 - a * 2) * Math.sin(t * 0.37 + a);
      const n = Math.abs(Math.sin(i * 12.9898 + Math.floor(t * 9) * 4.1) * 43758.5453 % 1);
      const hot = 0.3 + 0.7 * env * (0.55 + 0.45 * Math.cos(a * 3 + t * 2)) + 0.35 * n * (0.4 + env);
      const target = THREE.MathUtils.lerp(calm, Math.min(1.25, hot), k);
      bars[i] += (target - bars[i]) * 0.35;
      const len = 0.03 + 0.075 * bars[i];
      v.set(Math.sin(a) * 0.205, 0, Math.cos(a) * 0.205);
      q.setFromAxisAngle(up, a); s.set(1, 1, len);
      m4.compose(v, q, s); leds.setMatrixAt(i, m4);
      v.set(Math.sin(a) * 0.195, 0, Math.cos(a) * 0.195); m4.compose(v, q, s); halo.setMatrixAt(i, m4);
    }
    leds.instanceMatrix.needsUpdate = true; halo.instanceMatrix.needsUpdate = true;
  }
  setBars(0, 0, 0);
  return { group: g, floor, mats, setBars, parts: { body: mBody, cap: mCap } };
}

/* split long triangles of a flat geometry along x so it bends smoothly (non-indexed output) */
function tessellateX(geo, maxLen) {
  let gg = geo.index ? geo.toNonIndexed() : geo;
  for (let pass = 0; pass < 8; pass++) {
    const p = gg.attributes.position, uv = gg.attributes.uv, P = [], U = []; let split = false;
    const A = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3();
    const ua = new THREE.Vector2(), ub = new THREE.Vector2(), uc = new THREE.Vector2();
    const push = (a, b, c, ta, tb, tc) => { P.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z); U.push(ta.x, ta.y, tb.x, tb.y, tc.x, tc.y); };
    for (let i = 0; i < p.count; i += 3) {
      A.fromBufferAttribute(p, i); B.fromBufferAttribute(p, i + 1); C.fromBufferAttribute(p, i + 2);
      ua.fromBufferAttribute(uv, i); ub.fromBufferAttribute(uv, i + 1); uc.fromBufferAttribute(uv, i + 2);
      const e = [[A, B, ua, ub, C, uc], [B, C, ub, uc, A, ua], [C, A, uc, ua, B, ub]];
      let best = null, bl = maxLen;
      for (const [x, y, tx, ty, z, tz] of e) { const l = Math.abs(x.x - y.x); if (l > bl) { bl = l; best = [x, y, tx, ty, z, tz]; } }
      if (!best) { push(A, B, C, ua, ub, uc); continue; }
      split = true; const [x, y, tx, ty, z, tz] = best;
      const m = x.clone().lerp(y, 0.5), tm = tx.clone().lerp(ty, 0.5);
      push(x, m, z, tx, tm, tz); push(m, y, z, tm, ty, tz);
    }
    gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); gg.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2));
    if (!split) break;
  }
  return gg;
}

/* Scene + renderer wrapper used by the live tile (desktop and phone use the same call). */
export function createStage(canvasEl, { makeRenderer, studioEnv, useHDRI, hdriSize = 512, alpha = true, dpr } = {}) {
  const renderer = makeRenderer(canvasEl, { alpha, exposure: 1.0 });
  if (dpr) renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const room = studioEnv(renderer);
  scene.environment = room;
  scene.environmentIntensity = 1.0;
  const cam = new THREE.PerspectiveCamera(26, 1, 0.05, 50);
  const spk = buildSpeaker();
  const maxA = renderer.capabilities.getMaxAnisotropy ? renderer.capabilities.getMaxAnisotropy() : 8;
  spk.group.traverse((o) => { const m = o.material; if (!m) return; for (const k of ['map', 'normalMap', 'roughnessMap', 'bumpMap', 'anisotropyMap']) if (m[k]) m[k].anisotropy = Math.min(16, maxA); });
  const pivot = new THREE.Group(); pivot.add(spk.group); scene.add(pivot, spk.floor);
  // metals reflect the bright soft room (silver reads as silver); fabric, glass and rubber take the shared HDRI
  spk.mats.metals.forEach((m) => { m.envMap = room; });
  // rim light from behind-left for the fabric sheen edge, soft key from front-right
  const rim = new THREE.DirectionalLight('#fff1e2', 1.6); rim.position.set(-2.5, 2.2, -3); scene.add(rim);
  const key = new THREE.DirectionalLight('#ffffff', 0.6); key.position.set(2.4, 3, 2.6); scene.add(key);
  const hdri = useHDRI ? useHDRI(renderer, scene, { size: hdriSize, intensity: 0.95, rotation: 0.6, keepOld: true }) : Promise.resolve(null);

  const state = { loud: 0, loudT: 0, hover: 0, spin: 0, tiltX: 0, tiltY: 0, env: 0, lastKick: -9, t: 0 };
  const cA = new THREE.Color(), cB = new THREE.Color();
  function colours(k) {
    const a = WAYS.calm, b = WAYS.loud, m = spk.mats;
    m.fabric.color.copy(cA.set(a.fabric)).lerp(cB.set(b.fabric), k); m.seamMat.color.copy(m.fabric.color);
    m.fabric.sheenColor.copy(cA.set(a.sheen)).lerp(cB.set(b.sheen), k); m.seamMat.sheenColor.copy(m.fabric.sheenColor);
    m.alu.color.copy(cA.set(a.alu)).lerp(cB.set(b.alu), k); m.badgeMat.color.copy(m.alu.color); m.ringMat.color.copy(m.alu.color);
    m.alu.roughness = THREE.MathUtils.lerp(a.aluRough, b.aluRough, k) + 0.08; m.ringMat.roughness = m.alu.roughness * 0.8;
    m.rubber.color.copy(cA.set(a.foot)).lerp(cB.set(b.foot), k);
    m.tagMat.color.copy(cA.set(a.tag)).lerp(cB.set(b.tag), k);
    m.ledMat.color.copy(cA.set(a.led)).lerp(cB.set(b.led), k);
    m.glowMat.color.copy(m.ledMat.color); m.haloMat.color.copy(m.ledMat.color);
    m.ripples.forEach((r) => r.m.material.color.copy(cA.set(a.ring)).lerp(cB.set(b.ring), k));
  }
  function frame(w, h, look = {}) {
    cam.aspect = w / h;
    const dist = look.dist ?? 5.6, el = look.el ?? 0.40;
    cam.position.set(look.x ?? 0, Math.sin(el) * dist + (look.y ?? 0.66), Math.cos(el) * dist);
    cam.lookAt(look.x ?? 0, look.y ?? 0.66, 0);
    if (look.fov) cam.fov = look.fov;
    if (look.shiftY) cam.setViewOffset(w, h, 0, look.shiftY * h, w, h); else cam.clearViewOffset();
    cam.updateProjectionMatrix();
  }
  function step(dt, { animate = true } = {}) {
    state.t += dt;
    state.loud += ((state.loudT) - state.loud) * (1 - Math.exp(-5 * dt));
    colours(state.loud);
    const bpm = 118, beat = 60 / bpm;
    if (animate && state.loudT > 0.5 && state.t - state.lastKick >= beat) {
      state.lastKick = state.t;
      const r = spk.mats.ripples.find((x) => x.t > 1.4) || spk.mats.ripples[0]; r.t = 0;
    }
    const since = state.t - state.lastKick;
    state.env = animate ? Math.exp(-since * 7) * state.loud : 0;
    spk.setBars(animate ? state.t : 1.2, state.loud, state.env);
    spk.mats.glowMat.opacity = 0.12 + 0.05 * state.loud + 0.2 * state.env + (animate ? 0.05 * Math.sin(state.t * 1.6) * (1 - state.loud) : 0);
    spk.mats.haloMat.opacity = 0.18 + 0.12 * state.env;
    spk.mats.ripples.forEach((r) => {
      r.t += dt; const p = Math.min(1, r.t / 1.4), sc = 0.55 + p * 1.25;
      r.m.scale.set(sc, 1, sc); r.m.material.opacity = animate ? (1 - p) * 0.55 * state.loud : 0;
    });
    const thump = 1 + 0.012 * state.env;
    spk.group.scale.set(thump, 1 + 0.006 * state.env, thump);
    spk.mats.fabric.normalScale.setScalar(1.0 + 0.4 * state.env);
    if (animate) state.spin += dt * (0.22 + 0.5 * state.loud + 1.4 * state.hover);
    pivot.rotation.set(state.tiltX, state.spin + (look_.yaw || 0) + state.tiltY, 0);
  }
  const look_ = {};
  function render() { renderer.render(scene, cam); }
  return { renderer, scene, cam, spk, pivot, state, step, render, frame, hdri, look: look_, colours };
}
