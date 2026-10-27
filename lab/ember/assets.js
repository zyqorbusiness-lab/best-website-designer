/* Ember & Oak - physical asset kit (v2, Oct 27).
   Every object here is built in code, no downloads: a real cappuccino cup (lathe profile with a foot ring,
   rounded lip, white-glazed interior, glaze break at the rim, swept oval handle), a saucer with a well and
   foot ring, a brushed-steel teaspoon, crema with latte art on a physical (lit, glossy) surface, and coffee
   beans with the centre crease, pale silverskin in the cleft, wrinkle normals, oily clearcoat and per-bean
   size / colour variation. Textures are tiny canvases generated at start-up. */
import { THREE, isM } from '../_kit/kit.js';

const V2 = (x, y) => new THREE.Vector2(x, y);
let s0 = 7; const rnd = () => (s0 = (s0 * 16807) % 2147483647) / 2147483647;
const C = (h) => new THREE.Color(h);

/* ------------------------------------------------------------------ canvas textures */
function cv(n) { const c = document.createElement('canvas'); c.width = c.height = n; return [c, c.getContext('2d')]; }
/* height canvas -> tangent-space normal map */
function toNormal(src, strength = 2) {
  const n = src.width, g = src.getContext('2d').getImageData(0, 0, n, n).data;
  const [c, x] = cv(n); const out = x.createImageData(n, n), o = out.data;
  const H = (i, j) => g[(((j + n) % n) * n + ((i + n) % n)) * 4] / 255;
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const dx = (H(i + 1, j) - H(i - 1, j)) * strength, dy = (H(i, j + 1) - H(i, j - 1)) * strength;
    const l = Math.hypot(dx, dy, 1), k = (j * n + i) * 4;
    o[k] = (-dx / l * 0.5 + 0.5) * 255; o[k + 1] = (dy / l * 0.5 + 0.5) * 255; o[k + 2] = (1 / l * 0.5 + 0.5) * 255; o[k + 3] = 255;
  }
  x.putImageData(out, 0, 0);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.NoColorSpace; return t;
}
function blobs(x, n, count, rMin, rMax, a0, a1, col = '255,255,255') {
  for (let i = 0; i < count; i++) {
    const r = rMin + rnd() * (rMax - rMin), px = rnd() * n, py = rnd() * n;
    const g = x.createRadialGradient(px, py, 0, px, py, r); const a = a0 + rnd() * (a1 - a0);
    g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`);
    x.fillStyle = g;
    for (const ox of [-n, 0, n]) for (const oy of [-n, 0, n]) { x.save(); x.translate(ox, oy); x.fillRect(px - r, py - r, r * 2, r * 2); x.restore(); }
  }
}
/* glaze: the faint "orange peel" ripple a real kiln-fired glaze has */
export function glazeNormal() {
  s0 = 31; const n = 512; const [c, x] = cv(n);
  x.fillStyle = '#808080'; x.fillRect(0, 0, n, n);
  blobs(x, n, 2600, n * 0.006, n * 0.026, 0.05, 0.15);
  blobs(x, n, 2200, n * 0.006, n * 0.026, 0.05, 0.15, '0,0,0');
  blobs(x, n, 120, n * 0.04, n * 0.12, 0.03, 0.07); blobs(x, n, 120, n * 0.04, n * 0.12, 0.03, 0.07, '0,0,0');
  const t = toNormal(c, 1.6); t.repeat.set(4, 2); t.anisotropy = 8; return t;
}
/* stoneware speckle (iron spots in the clay that show through the glaze) */
export function speckleMap(base, dens = 1, rep = 3) {
  s0 = 17; const n = 1024; const [c, x] = cv(n);
  x.fillStyle = base; x.fillRect(0, 0, n, n);
  // soft pooling variation of the glaze
  blobs(x, n, 60, n * 0.05, n * 0.18, 0.04, 0.09, '255,240,220');
  blobs(x, n, 50, n * 0.05, n * 0.16, 0.03, 0.08, '40,18,8');
  for (let i = 0; i < 5200 * dens; i++) {
    const a = rnd(), r = 0.3 + Math.pow(rnd(), 4) * 2.2, px = rnd() * n, py = rnd() * n;
    if (a < 0.8) {
      // iron speck: a tiny dark core with a soft rust halo where it bled into the glaze
      if (rnd() < 0.45) { const g = x.createRadialGradient(px, py, 0, px, py, r * 3.2); g.addColorStop(0, `rgba(96,48,20,${0.1 + rnd() * 0.12})`); g.addColorStop(1, 'rgba(96,48,20,0)'); x.fillStyle = g; x.fillRect(px - r * 3.2, py - r * 3.2, r * 6.4, r * 6.4); }
      x.fillStyle = `rgba(42,20,10,${0.18 + rnd() * 0.42})`;
    } else x.fillStyle = `rgba(255,246,232,${0.15 + rnd() * 0.25})`;
    x.beginPath(); x.ellipse(px, py, r, r * (0.7 + rnd() * 0.5), rnd() * 3, 0, 6.283); x.fill();
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, 1);
  t.anisotropy = 8; return t;
}

/* glaze micro-surface: a satin haze of handling, two faint thumb prints and wipe streaks.
   Used as roughnessMap AND clearcoatRoughnessMap so the highlights break up the way a real cup's do. */
let GLAZE_R = null;
export function glazeRough() {
  if (GLAZE_R) return GLAZE_R;
  s0 = 53; const n = 1024; const [c, x] = cv(n);
  x.fillStyle = 'rgb(118,118,118)'; x.fillRect(0, 0, n, n);
  blobs(x, n, 90, n * 0.03, n * 0.12, 0.05, 0.14, '255,255,255');      // haze
  blobs(x, n, 70, n * 0.03, n * 0.1, 0.05, 0.12, '60,60,60');           // freshly wiped (sharper) patches
  // finger prints: concentric ridged ellipses
  for (let f = 0; f < 5; f++) {
    const cx = (0.15 + rnd() * 0.7) * n, cy = (0.2 + rnd() * 0.6) * n, rx = n * (0.022 + rnd() * 0.01), ry = rx * 1.35, rot = rnd() * 3;
    x.save(); x.translate(cx, cy); x.rotate(rot); x.lineWidth = 1.1;
    for (let k = 1; k < 16; k++) {
      x.strokeStyle = `rgba(255,255,255,${0.16 * (1 - k / 16)})`;
      x.beginPath(); x.ellipse(0, 0, rx * k / 15, ry * k / 15, 0, rnd() * 0.4, 6.283 - rnd() * 0.6); x.stroke();
    }
    x.restore();
  }
  // wipe streaks
  x.lineCap = 'round';
  for (let i = 0; i < 260; i++) {
    const px = rnd() * n, py = rnd() * n, l = n * (0.03 + rnd() * 0.12);
    x.strokeStyle = `rgba(255,255,255,${0.025 + rnd() * 0.05})`; x.lineWidth = 1 + rnd() * 3;
    x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + l * 0.5, py + (rnd() - 0.5) * 12, px + l, py + (rnd() - 0.5) * 6); x.stroke();
  }
  // pin-holes (tiny glaze pits read as sharp sparkle points)
  for (let i = 0; i < 1400; i++) { x.fillStyle = `rgba(255,255,255,${0.2 + rnd() * 0.4})`; x.fillRect(rnd() * n, rnd() * n, 1.2, 1.2); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.NoColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 1); t.anisotropy = 8;
  GLAZE_R = t; return t;
}
/* bean skin: fine lengthwise wrinkles + pores (height) */
function beanHeight(n) {
  s0 = 3; const [c, x] = cv(n);
  x.fillStyle = '#808080'; x.fillRect(0, 0, n, n);
  blobs(x, n, 160, n * 0.03, n * 0.1, 0.04, 0.1, '0,0,0'); blobs(x, n, 160, n * 0.03, n * 0.1, 0.04, 0.1);
  x.lineCap = 'round';
  // fine striations running the length of the bean (texture v)
  for (let i = 0; i < 2200; i++) {
    const px = rnd() * n, py = rnd() * n, len = n * (0.04 + rnd() * 0.16);
    x.strokeStyle = rnd() < 0.5 ? `rgba(255,255,255,${0.025 + rnd() * 0.05})` : `rgba(0,0,0,${0.03 + rnd() * 0.06})`;
    x.lineWidth = 1.0 + rnd() * 2.6; x.beginPath(); x.moveTo(px, py);
    x.quadraticCurveTo(px + (rnd() - 0.5) * 5, py + len * 0.5, px + (rnd() - 0.5) * 4, py + len); x.stroke();
  }
  return c;
}
function beanColour(n) {
  s0 = 41; const [c, x] = cv(n);
  x.fillStyle = '#d8d8d8'; x.fillRect(0, 0, n, n);
  blobs(x, n, 110, n * 0.05, n * 0.2, 0.08, 0.2, '255,236,214');   // uneven roast: lighter patches
  blobs(x, n, 110, n * 0.05, n * 0.18, 0.08, 0.22, '40,22,12');    // darker patches
  for (let i = 0; i < 1000; i++) {
    const px = rnd() * n, py = rnd() * n, len = n * (0.03 + rnd() * 0.1);
    x.strokeStyle = rnd() < 0.5 ? `rgba(255,240,220,${0.06 + rnd() * 0.08})` : `rgba(30,15,8,${0.06 + rnd() * 0.1})`;
    x.lineWidth = 1.2 + rnd() * 2; x.beginPath(); x.moveTo(px, py); x.lineTo(px + (rnd() - 0.5) * 6, py + len); x.stroke();
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 1); return t;
}
let BEAN_TEX = null;
export function beanTextures() {
  if (BEAN_TEX) return BEAN_TEX;
  const n = 512, h = beanHeight(n);
  const normal = toNormal(h, 3.4); normal.repeat.set(2, 1); normal.anisotropy = 8;
  // roughness: oily patches (low) on a satin skin
  s0 = 77; const [c, x] = cv(n); x.fillStyle = '#e4e4e4'; x.fillRect(0, 0, n, n);
  blobs(x, n, 50, n * 0.04, n * 0.16, 0.15, 0.32, '40,40,40');
  const rough = new THREE.CanvasTexture(c); rough.wrapS = rough.wrapT = THREE.RepeatWrapping; rough.colorSpace = THREE.NoColorSpace; rough.repeat.set(2, 1);
  BEAN_TEX = { normal, rough, map: beanColour(n) }; return BEAN_TEX;
}
export function shadowTex(core = 0.6, mid = 0.28, col = '40,18,8') {
  const [c, x] = cv(256); const g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, `rgba(${col},${core})`); g.addColorStop(0.35, `rgba(${col},${mid})`); g.addColorStop(0.7, `rgba(${col},${mid * 0.3})`); g.addColorStop(1, `rgba(${col},0)`);
  x.fillStyle = g; x.fillRect(0, 0, 256, 256); return new THREE.CanvasTexture(c);
}

/* ------------------------------------------------------------------ bean */
/* Arabica bean: ~10 x 7.5 x 5 mm. Domed back, flatter face with an S-shaped centre cleft whose lips roll in.
   Longitude is warped so vertices crowd the cleft (sharp crease without a dense mesh). aCrease marks the
   cleft so the shader can show the pale silverskin left in it. */
export function beanGeometry(seg, variant = 0) {
  s0 = 101 + variant * 37;
  const wob = [rnd() - 0.5, rnd() - 0.5, rnd() - 0.5];
  const g = new THREE.SphereGeometry(1, seg, Math.round(seg * 0.7));
  const p = g.attributes.position, n = p.count, cr = new Float32Array(n), v = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    v.fromBufferAttribute(p, i);
    const yy = v.y, rr = Math.hypot(v.x, v.z);
    let phi = Math.atan2(v.z, -v.x);                // 0..pi front half has z>0
    let u = phi - Math.PI / 2; if (u < -Math.PI) u += 2 * Math.PI; if (u > Math.PI) u -= 2 * Math.PI;
    u = Math.sign(u) * Math.PI * Math.pow(Math.abs(u) / Math.PI, 1.8); // crowd the front centre line
    phi = u + Math.PI / 2;
    let x = -Math.cos(phi) * rr, z = Math.sin(phi) * rr, y = yy;
    // body proportions + slight asymmetry
    x *= 0.66 + wob[0] * 0.05; y *= 1.0;
    const front = z > 0;
    z *= front ? 0.4 : 0.56;                          // face flatter than the domed back
    if (front) z *= 1 - 0.2 * Math.pow(Math.abs(y), 3);
    // the S-shaped cleft
    const cx = 0.07 * Math.sin(y * 2.6 + wob[1]) + 0.02 * y;
    const d = x - cx, ay = Math.abs(y);
    const fade = 1 - Math.pow(Math.min(1, ay / 0.86), 4);
    const ad = Math.abs(d);
    const valley = Math.pow(Math.max(0, 1 - ad / 0.16), 2) * fade;   // the two halves fold in
    const groove = Math.pow(Math.max(0, 1 - ad / 0.03), 2) * fade;   // the cleft itself
    if (front) { z -= 0.075 * valley + 0.2 * groove * (z / 0.4 + 0.15); }
    cr[i] = front ? Math.min(1, Math.pow(Math.max(0, 1 - ad / 0.022), 1.5) * fade * 1.2) : 0;
    // ends slightly pinched, one end rounder
    x *= 1 - 0.1 * y * y; z *= 1 - 0.08 * Math.max(0, y + wob[2] * 0.3) * y;
    p.setXYZ(i, x, y, z);
  }
  g.setAttribute('aCrease', new THREE.BufferAttribute(cr, 1));
  g.computeVertexNormals();
  return g;
}
/* oily roasted-bean material; color = roast; chaff colour shows in the cleft */
export function beanMaterial(color, opts = {}) {
  const { normal, rough, map } = beanTextures();
  const m = new THREE.MeshPhysicalMaterial({
    color, map, roughness: opts.roughness ?? 0.42, roughnessMap: rough, normalMap: normal, normalScale: new THREE.Vector2(1.0, 1.0),
    clearcoat: opts.clearcoat ?? 0.7, clearcoatRoughness: opts.clearcoatRoughness ?? 0.22,
    sheen: 0.18, sheenColor: C('#c89670'), sheenRoughness: 0.6,
  });
  m.userData.chaff = { value: C(opts.chaff || '#C9A271') };
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uChaff = m.userData.chaff;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float aCrease;\nvarying float vCrease;\nvarying float vEdge;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvCrease = aCrease; vEdge = smoothstep(.55, 1., abs(position.y));');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform vec3 uChaff;\nvarying float vCrease;\nvarying float vEdge;')
      .replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.rgb = mix(diffuseColor.rgb * mix(1., .42, smoothstep(.0, .5, vCrease)), uChaff * .85, smoothstep(.5, 1., vCrease) * .8);\ndiffuseColor.rgb *= .86 + .32 * vEdge;')
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, .9, smoothstep(.2, .8, vCrease));');
  };
  m.customProgramCacheKey = () => 'bean2';
  return m;
}

/* ------------------------------------------------------------------ cup + saucer */
/* outer bowl curve: t 0 (foot) .. 1 (rim) */
const FOOT_Y = 0.03, CUP_H = 0.8, R0 = 0.27, R1 = 0.335, WALL = 0.042;
const outerR = (t) => R0 + R1 * (1 - Math.pow(1 - t, 2.4));
const innerR = (t) => outerR(t) - WALL * (1 + 0.35 * (1 - t));
export const CUP = { top: FOOT_Y + CUP_H + WALL / 2, coffeeY: FOOT_Y + CUP_H * 0.885 };
CUP.coffeeR = innerR(0.885) + 0.004;

function latheBreak(pts, seg, breakFn) {
  const g = new THREE.LatheGeometry(pts, seg);
  const n = g.attributes.position.count, b = new Float32Array(n), per = pts.length;
  for (let i = 0; i < n; i++) b[i] = breakFn(i % per, per);
  g.setAttribute('aBreak', new THREE.BufferAttribute(b, 1));
  return g;
}
/* glaze with the lighter "break" where it thins over the lip */
export function glazeMaterial(color, opts = {}) {
  const R = glazeRough();
  const m = new THREE.MeshPhysicalMaterial({
    color: opts.map ? '#ffffff' : color, map: opts.map || null, roughness: (opts.roughness ?? 0.16) * 1.9, roughnessMap: R,
    normalMap: opts.normal || null, normalScale: new THREE.Vector2(0.22, 0.22),
    clearcoat: 1, clearcoatRoughness: 0.11, clearcoatRoughnessMap: R, ior: 1.52, specularIntensity: 0.9,
  });
  m.userData.clay = { value: C(opts.clay || '#E9D6B8') };
  m.userData.foot = { value: opts.footLine ? 1 : 0 };
  m.userData.pool = { value: opts.pool ?? 0.5 };
  m.userData.stain = { value: new THREE.Vector2(opts.stainY ?? -9, opts.stainY != null ? 0.55 : 0) };
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uClay = m.userData.clay; sh.uniforms.uFoot = m.userData.foot; sh.uniforms.uPool = m.userData.pool; sh.uniforms.uStain = m.userData.stain;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float aBreak;\nvarying float vBreak;\nvarying vec3 vLP;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvBreak = aBreak; vLP = position;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
uniform vec3 uClay; uniform float uFoot; uniform float uPool; uniform vec2 uStain; varying float vBreak; varying vec3 vLP;
float gh(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float gn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(gh(i),gh(i+vec2(1,0)),f.x),mix(gh(i+vec2(0,1)),gh(i+vec2(1,1)),f.x),f.y);}
float gStop(){ float a=atan(vLP.z,vLP.x); return 0.058+0.011*gn(vec2(a*7.,1.3))+0.005*gn(vec2(a*23.,4.1)); }`)
      .replace('#include <color_fragment>', `#include <color_fragment>
diffuseColor.rgb = mix(diffuseColor.rgb, uClay, vBreak);
{ float a=atan(vLP.z,vLP.x);
  // glaze runs and pools: richer, darker toward the foot, with faint vertical drip streaks
  float drip=gn(vec2(a*38.,vLP.y*2.5))*gn(vec2(a*9.,0.7));
  float pool=uPool*(1.-smoothstep(0.06,0.42,vLP.y))*(0.75+0.5*drip)*uFoot;
  diffuseColor.rgb*=1.-0.32*pool; diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(0.92,0.82,0.78),pool*0.6);
  // where the glaze stops above the foot: a thick rolled glaze edge, then raw stoneware
  float gs=gStop(); float bare=uFoot*(1.-smoothstep(gs-0.004,gs+0.002,vLP.y));
  float lip=uFoot*smoothstep(gs-0.002,gs+0.006,vLP.y)*(1.-smoothstep(gs+0.006,gs+0.02,vLP.y));
  diffuseColor.rgb*=1.-0.25*lip;
  diffuseColor.rgb=mix(diffuseColor.rgb,uClay*(0.88+0.2*gn(vLP.xz*180.)),bare);
  // the coffee tide line: a faint brown ring the crema leaves on the white wall just above the surface
  float sd=vLP.y-uStain.x; float sw=0.012+0.008*gn(vec2(a*14.,2.7));
  float stn=smoothstep(-0.003,0.002,sd)*(1.-smoothstep(sw*0.35,sw,sd))*(0.6+0.4*gn(vec2(a*40.,sd*300.)));
  diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(.62,.44,.3),stn*uStain.y); }`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
{ float gs=gStop(); float bare=uFoot*(1.-smoothstep(gs-0.004,gs+0.002,vLP.y)); roughnessFactor=mix(roughnessFactor,0.82,bare); }`)
      .replace('#include <lights_physical_fragment>', `#include <lights_physical_fragment>
{ float gs=gStop(); float bare=uFoot*(1.-smoothstep(gs-0.004,gs+0.002,vLP.y)); material.clearcoat*=1.-bare; }`);
  };
  m.customProgramCacheKey = () => 'glaze3';
  return m;
}

export function cupGeometry(seg) {
  const N = 90;
  // outer glazed wall: from the foot shoulder to the lip apex
  const out = [];
  const groove = (t) => 0.0035 * (Math.exp(-(((t - 0.155) / 0.0065) ** 2)) + Math.exp(-(((t - 0.19) / 0.0065) ** 2)));
  const gEdge = [];
  const throwR = (t) => 0.0009 * Math.sin(t * 61 + 1.3) * (0.6 + 0.4 * Math.sin(t * 17)) * Math.min(1, t * 5) * Math.min(1, (1 - t) * 12);
  for (let i = 0; i <= N; i++) { const t = i / N; out.push(V2(outerR(t) - groove(t) + throwR(t), FOOT_Y + CUP_H * t)); gEdge.push(Math.min(1, groove(t) / 0.0035) * 0.22); }
  const lc = V2(outerR(1) - WALL / 2, FOOT_Y + CUP_H);           // lip centre
  for (let i = 1; i <= 6; i++) { const a = (i / 12) * Math.PI; out.push(V2(lc.x + Math.cos(a) * WALL / 2, lc.y + Math.sin(a) * WALL / 2)); }
  const nOut = out.length;
  const outer = latheBreak(out, seg, (k) => Math.max(Math.max(0, (k - (nOut - 9)) / 8) ** 1.6 * 0.5, gEdge[k] || 0));
  // interior (white glaze): lip apex -> down the wall -> floor
  const inn = [];
  for (let i = 6; i <= 12; i++) { const a = (i / 12) * Math.PI; inn.push(V2(lc.x + Math.cos(a) * WALL / 2, lc.y + Math.sin(a) * WALL / 2)); }
  for (let i = N; i >= 4; i--) { const t = i / N; inn.push(V2(innerR(t), FOOT_Y + CUP_H * t)); }
  const fy = FOOT_Y + CUP_H * (4 / N), fr = innerR(4 / N);
  for (let i = 1; i <= 6; i++) { const k = i / 6; inn.push(V2(fr * (1 - k), fy - 0.022 * Math.sin(k * Math.PI * 0.5) - 0.004)); }
  const inner = latheBreak(inn, seg, (k) => Math.max(0, 1 - k / 4) ** 1.6 * 0.35);
  // unglazed foot ring (bisque) with a recessed underside
  const foot = new THREE.LatheGeometry([V2(0, 0.016), V2(R0 - 0.07, 0.016), V2(R0 - 0.05, 0.003), V2(R0 - 0.035, 0), V2(R0 - 0.012, 0.002),
    V2(R0 - 0.002, 0.012), V2(R0, FOOT_Y * 0.7), V2(outerR(0), FOOT_Y)], seg);
  return { outer, inner, foot };
}

/* handle: a swept oval section, thicker where it joins the wall */
export function handleGeometry() {
  const curve = new THREE.CatmullRomCurve3([
    [0.56, 0.69], [0.68, 0.745], [0.81, 0.705], [0.875, 0.585], [0.85, 0.45], [0.74, 0.345], [0.6, 0.29], [0.44, 0.285],
  ].map(([x, y]) => new THREE.Vector3(x, y, 0)), false, 'centripetal');
  const TS = 110, RS = 28;
  const fr = curve.computeFrenetFrames(TS, false);
  const pos = [], nor = [], uv = [], idx = [];
  const P = new THREE.Vector3(), Nn = new THREE.Vector3(), tmp = new THREE.Vector3();
  for (let i = 0; i <= TS; i++) {
    const t = i / TS; curve.getPointAt(t, P);
    const N = fr.normals[i], B = fr.binormals[i];
    const ends = Math.pow(Math.abs(t - 0.5) * 2, 6);
    const r = 0.036 + 0.026 * ends + 0.004 * Math.sin(t * Math.PI);
    const a = r * 0.78, b = r * 1.25;                 // in-plane x across
    for (let j = 0; j <= RS; j++) {
      const th = (j / RS) * Math.PI * 2, c = Math.cos(th), s = Math.sin(th);
      tmp.copy(N).multiplyScalar(c * a).addScaledVector(B, s * b).add(P);
      pos.push(tmp.x, tmp.y, tmp.z);
      Nn.copy(N).multiplyScalar(c / a).addScaledVector(B, s / b).normalize(); nor.push(Nn.x, Nn.y, Nn.z);
      uv.push(t, j / RS);
    }
  }
  for (let i = 0; i < TS; i++) for (let j = 0; j < RS; j++) {
    const a = i * (RS + 1) + j, b = a + RS + 1; idx.push(a, a + 1, b, b, a + 1, b + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setAttribute('aBreak', new THREE.BufferAttribute(new Float32Array(pos.length / 3), 1));
  g.setIndex(idx); return g;
}

export const SAUCER = { well: 0.05 };
export function saucerGeometry(seg) {
  const top = [V2(0, SAUCER.well), V2(0.25, SAUCER.well), V2(0.31, SAUCER.well + 0.002), V2(0.345, SAUCER.well + 0.012), V2(0.37, SAUCER.well + 0.014),
    V2(0.4, SAUCER.well + 0.011), V2(0.55, 0.068), V2(0.72, 0.088), V2(0.86, 0.112), V2(0.94, 0.132), V2(0.965, 0.141)];
  const lipC = V2(0.968, 0.128), lr = 0.014;
  const lip = []; for (let i = 1; i < 10; i++) { const a = Math.PI * 0.62 - (i / 10) * Math.PI * 1.15; lip.push(V2(lipC.x + Math.cos(a) * lr, lipC.y + Math.sin(a) * lr)); }
  const under = [V2(0.955, 0.108), V2(0.88, 0.086), V2(0.74, 0.058), V2(0.58, 0.032), V2(0.5, 0.016), V2(0.485, 0.004), V2(0.47, 0),
    V2(0.43, 0), V2(0.415, 0.004), V2(0.4, 0.014), V2(0, 0.014)];
  // resample the glazed top so the wheel-throwing rings show in the reflections
  const topF = []; for (let i = 0; i < top.length - 1; i++) { const a = top[i], b = top[i + 1]; const k = Math.max(1, Math.round((b.x - a.x) / 0.006));
    for (let j = 0; j < k; j++) { const t = j / k, x = a.x + (b.x - a.x) * t; const rip = x > 0.42 && x < 0.93 ? 0.0011 * Math.sin(x * 140) * Math.sin(x * 9 + 0.6) : (x < 0.24 ? 0.0006 * Math.sin(x * 120) : 0);
      topF.push(V2(x, a.y + (b.y - a.y) * t + rip)); } }
  topF.push(top[top.length - 1]);
  const pts = [...topF, ...lip, ...under].reverse();
  // the rim and the foot are where the glaze thins; mark them for the break shader
  const g = latheBreak(pts, seg, (k) => {
    const p = pts[k]; const rim = Math.max(0, 1 - Math.abs(p.x - 0.97) / 0.05); const ft = p.y < 0.006 && p.x > 0.4 ? 0.8 : 0;
    return Math.max(rim * 0.45, ft);
  });
  // planar UVs, so the glaze speckle doesn't streak into the centre the way lathe UVs do
  const P = g.attributes.position, U = g.attributes.uv;
  for (let i = 0; i < P.count; i++) U.setXY(i, P.getX(i) * 0.5 + 0.5, P.getZ(i) * 0.5 + 0.5);
  return g;
}

/* brushed-steel teaspoon, resting on the saucer */
export function spoonGroup(mat) {
  const g = new THREE.Group();
  // bowl: a squashed half-ellipsoid shell
  const bowl = new THREE.SphereGeometry(0.1, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
  const bp = bowl.attributes.position;
  for (let i = 0; i < bp.count; i++) bp.setXYZ(i, bp.getX(i) * 0.72, bp.getY(i) * 0.32, bp.getZ(i) * 1.12);
  bowl.computeVertexNormals();
  const bm = new THREE.Mesh(bowl, mat); g.add(bm);
  // handle: a flat tapered strip, swept and slightly arched
  const shape = new THREE.Shape();
  const L = 0.62; shape.moveTo(-0.012, 0); shape.bezierCurveTo(-0.01, L * 0.4, -0.02, L * 0.75, -0.032, L * 0.95);
  shape.quadraticCurveTo(0, L * 1.04, 0.032, L * 0.95); shape.bezierCurveTo(0.02, L * 0.75, 0.01, L * 0.4, 0.012, 0); shape.lineTo(-0.012, 0);
  const hg = new THREE.ExtrudeGeometry(shape, { depth: 0.008, bevelEnabled: true, bevelThickness: 0.003, bevelSize: 0.003, bevelSegments: 2, curveSegments: 16 });
  const hp = hg.attributes.position;
  for (let i = 0; i < hp.count; i++) { const y = hp.getY(i); hp.setZ(i, hp.getZ(i) + 0.05 * Math.sin((y / L) * Math.PI * 0.9)); }
  hg.computeVertexNormals();
  const h = new THREE.Mesh(hg, mat); h.rotation.x = -Math.PI / 2; h.position.set(0, 0.0, -0.1); g.add(h);
  return g;
}
export function steelMaterial() {
  return new THREE.MeshPhysicalMaterial({ color: '#ece8e2', metalness: 1, roughness: 0.32, side: THREE.DoubleSide });
}

/* ------------------------------------------------------------------ crema with latte art */
const NOISE = `
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*vn(p);p*=2.03;a*=.5;}return s;}
float sdHeart(vec2 p){p.x=abs(p.x);if(p.y+p.x>1.)return sqrt(dot(p-vec2(.25,.75),p-vec2(.25,.75)))-sqrt(2.)/4.;
 return sqrt(min(dot(p-vec2(0.,1.),p-vec2(0.,1.)),dot(p-.5*max(p.x+p.y,0.),p-.5*max(p.x+p.y,0.))))*sign(p.x-p.y);}
`;
/* Physical crema: lit by the HDRI, glossy, a meniscus ring and a poured heart that a stir (uS 1 -> 0) unwinds. */
export function cremaMaterial(coffee, crema, milk = '#FFF8EE') {
  const uniforms = { uT: { value: 0 }, uS: { value: 0 }, uA: { value: C(coffee) }, uB: { value: C(crema) }, uM: { value: C(milk) } };
  const m = new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.34, clearcoat: 0.55, clearcoatRoughness: 0.18, sheen: 0.2, sheenColor: C('#fff1e0') });
  m.uniforms = uniforms;
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, uniforms);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec2 vCUv;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvCUv = uv;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
uniform float uT;uniform float uS;uniform vec3 uA;uniform vec3 uB;uniform vec3 uM;varying vec2 vCUv;${NOISE}
float gCH=0.; float gCR=0.;
vec2 h22(vec2 p){p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));return fract(sin(p)*43758.5453);}
// distance to nearest bubble centre (x) and that bubble's radius factor (y)
vec2 vor(vec2 p){vec2 i=floor(p),f=fract(p);float d=8.;float rr=0.;for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 g=vec2(x,y);vec2 o=h22(i+g);float dd=length(g+o-f);if(dd<d){d=dd;rr=o.x;}}return vec2(d,rr);}
float bubbles(vec2 q,float sc,float k){vec2 v=vor(q*sc);float r=.18+.3*v.y;float b=1.-smoothstep(r*.55,r,v.x);float dome=sqrt(max(0.,1.-v.x*v.x/(r*r)));return mix(0.,dome,step(k,v.y))*b;}`)
      .replace('#include <color_fragment>', `#include <color_fragment>
{ vec2 p=vCUv*2.-1.; float r=length(p);
  float tw=uS*5.5*(1.-r)*(1.-r)+uT*.01;           // stirring twists the centre more than the edge
  float cs=cos(tw),sn=sin(tw); vec2 q=mat2(cs,-sn,sn,cs)*p;
  float n=fbm(q*5.+uT*.02), n2=fbm(q*18.);
  vec3 col=mix(uB*.74,uB*1.18+vec3(.03,.012,0.),smoothstep(.25,.75,n));     // mottled (tiger) crema
  col=mix(col,uA,smoothstep(.78,1.,r+(n-.5)*.12)*.75); // darker coffee where the crema thins at the wall
  // the pour: a big soft heart with a pulled-through stem, feathered into the crema
  vec2 hp=(q+vec2(0.,.4))*1.3; hp.x+=(n-.5)*.035; hp.y+=(n2-.5)*.02;
  float hd=sdHeart(hp);
  float art=1.-smoothstep(-.03,.016,hd+(n2-.5)*.012);
  // the pull-through leaves a soft V notch between the lobes
  float vx=abs(q.x+(n-.5)*.012);
  float cut=(1.-smoothstep(.0,.02,vx-(q.y-.3)*.28))*smoothstep(.28,.36,q.y);
  art*=1.-cut;
  float fringe=smoothstep(.12,.0,hd)*(1.-art);                  // darker crema hugging the milk
  col=mix(col,uB*.62,fringe*.45);
  vec3 milk=uM*(1.34+.22*smoothstep(.0,-.25,hd))+(n2-.5)*.06+(n-.5)*.05;
  // a poured heart is stacked layers: thin crema lines echo the outline inside it, pushed by the pour
  float lay=hd+(n-.5)*.02-q.y*.035;
  float lines=0.; for(int k=1;k<3;k++){ float o=-.06*float(k); lines+=(1.-smoothstep(.0,.004+.002*float(k),abs(lay-o)))*(.6-.2*float(k)); }
  lines*=smoothstep(.0,-.02,hd)*(1.-cut);
  milk=mix(milk,uB*1.12,lines*.28);
  milk=mix(milk,uM*vec3(.95,.88,.8),smoothstep(-.03,.01,hd)*.2); // milk edge picks up crema tint
  col=mix(col,milk,art*(1.-smoothstep(.66,.82,r)));
  // the thin ring of white micro-foam where the pour met the wall
  float ring=smoothstep(.9,.96,r+(n-.5)*.05)*(1.-smoothstep(.985,1.,r));
  col=mix(col,uM*.92,ring*.55);
  // micro-foam bubbles near the wall
  // tiger flecks: fine dark speckles and short streaks in the crema
  float fl=smoothstep(.74,.82,vn(q*70.+3.))*(1.-art)*(1.-ring); col=mix(col,uA*.9,fl*.35);
  float st=smoothstep(.62,.9,vn(vec2(atan(q.y,q.x)*9.,r*40.)))*(1.-art)*smoothstep(.3,.8,r); col=mix(col,uB*.7,st*.18);
  // bubbles: micro-foam over all the crema, a few bigger ones crowding the wall, almost none in the poured milk
  float foam=(1.-art);
  float b1=bubbles(q,95.,.35)*foam, b2=bubbles(q+.37,46.,.72)*foam*smoothstep(.62,.95,r), b3=bubbles(q*1.03+.11,190.,.2)*(.4+.6*art);
  col=mix(col,uB*1.22,b2*.35); col*=1.-.12*(b1>0.?1.-b1:0.)*foam;
  gCH=b1*.6+b2*1.4+b3*.25+n2*.25*(1.-art)+art*2.2+lines*.5; gCR=art;
  diffuseColor.rgb=col; }`)
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
{ vec3 dpx=dFdx(-vViewPosition), dpy=dFdy(-vViewPosition); float hx=dFdx(gCH)*.0016, hy=dFdy(gCH)*.0016;
  vec3 r1=cross(dpy,normal), r2=cross(normal,dpx); float det=dot(dpx,r1);
  vec3 gr=sign(det)*(hx*r1+hy*r2); normal=normalize(abs(det)*normal-gr); }`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
roughnessFactor=mix(roughnessFactor,.24,gCR);`);
  };
  m.customProgramCacheKey = () => 'crema3';
  return m;
}
/* liquid disc with a meniscus that climbs the wall */
export function cremaGeometry(R, seg) {
  const g = new THREE.RingGeometry(0.0001, R, seg, 24);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const r = Math.hypot(p.getX(i), p.getY(i)) / R; const k = Math.max(0, (r - 0.86) / 0.14); p.setZ(i, 0.014 * k * k); }
  g.computeVertexNormals(); return g;
}
