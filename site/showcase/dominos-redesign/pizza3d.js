/* pizza3d.js (shared with Zyqor concept P041) - one real-time 3D pizza for Zyqor concept sites (three.js r170).
   Geometry is ours (lathe crust, displaced cheese sheet, 3D toppings); every surface colour comes from real CC photographs
   (see credits.json): crust, sauce and melted-cheese photo layers, ingredient cut-outs, a Poly Haven wood board.
   The cheese is a live shader: shreds -> melted sheet -> blistered and browned as the bake value rises. */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const NOISE = `
float h21(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
float vn(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.0-2.0*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),u.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),u.x), u.y); }
float fbm(vec2 p){ float s=0.0,a=0.5; for(int i=0;i<4;i++){ s+=a*vn(p); p*=2.03; a*=0.5; } return s; }
`;
export const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
export const clamp01 = (x) => Math.min(1, Math.max(0, x));
const lerp = (a, b, t) => a + (b - a) * t;

/* topping kinds: size in pizza radii (pizza radius 1 = 15 cm) */
export const KINDS = {
  mozzarella: { geo: 'blob', size: 0.26, tex: ['mozz-raw-1', 'mozz-raw-3'], n: 6 },
  tomato:     { geo: 'dome', size: 0.17, tex: ['tom-raw-1', 'tom-raw-2'], n: 7, color: 0xc4291b },
  pepperoni:  { geo: 'puck', size: 0.25, tex: ['pep-raw-1', 'pep-raw-3'], n: 8 },
  mushroom:   { geo: 'leaf', size: 0.26, tex: ['mush-raw-1', 'mush-raw-2'], n: 8, bend: 0.12 },
  olive:      { geo: 'ring', size: 0.11, n: 10, color: 0x33262b },
  pepper:     { geo: 'leaf', size: 0.36, tex: ['pepper-raw-1', 'pepper-raw-2'], n: 7, bend: 0.25 },
  onion:      { geo: 'leaf', size: 0.33, tex: ['onion-raw-1', 'onion-raw-2'], n: 7, bend: 0.1 },
  basil:      { geo: 'leaf', size: 0.30, tex: ['basil-raw-1', 'basil-raw-3', 'basil-raw-4'], n: 5, bend: 0.35 },
  jalapeno:   { geo: 'ring', size: 0.13, n: 7, color: 0x4f7d2c }
};

/* geometric radius -> radius in the base photo (photo disc radius 0.4645, sauce edge 0.351) */
function rToTex(r) { return r < 0.8 ? (r / 0.8) * 0.351 : 0.351 + ((r - 0.8) / 0.2) * 0.109; }

function crustGeometry(seg) {
  const prof = [[0, 0], [0.97, 0], [0.995, 0.018], [1.0, 0.045], [0.99, 0.072], [0.965, 0.092], [0.93, 0.098], [0.895, 0.088],
    [0.86, 0.064], [0.83, 0.044], [0.8, 0.036], [0.6, 0.034], [0.3, 0.033], [0.0001, 0.033]];
  /* lathe goes bottom-out then top-in: reverse order so normals face out */
  const pts = prof.slice().reverse().map(([r, y]) => new THREE.Vector2(r, y));
  const g = new THREE.LatheGeometry(pts, seg);
  const pos = g.attributes.position, uv = g.attributes.uv; const top = new Float32Array(pos.count);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i); const r = Math.hypot(x, z); const rt = rToTex(Math.min(r, 1));
    const a = Math.atan2(z, x); uv.setXY(i, 0.5 + Math.cos(a) * rt, 0.5 - Math.sin(a) * rt);
    top[i] = y > 0.001 || r > 0.97 ? 1 : 0;
  }
  g.setAttribute('aTop', new THREE.BufferAttribute(top, 1));
  g.computeVertexNormals();
  return g;
}

function cheeseGeometry(seg) {
  const g = new THREE.RingGeometry(0.0001, 0.815, seg, Math.round(seg / 4));
  g.rotateX(-Math.PI / 2);
  const pos = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), z = pos.getZ(i); uv.setXY(i, 0.5 + (x / 0.8) * 0.359, 0.5 - (z / 0.8) * 0.359); }
  return g;
}

function leafGeometry(aspect, bend) {
  const g = new THREE.PlaneGeometry(1, aspect, 8, 8); g.rotateX(-Math.PI / 2);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, bend * (x * x * 1.6) + 0.04 * Math.sin(z * 4)); }
  g.computeVertexNormals(); return g;
}

export async function createStage(opt) {
  const { canvas, img = 'img/', phone = false, extras = {}, board: showBoard = true } = opt;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let dirty = true, running = true, last = performance.now(); const tickers = [];
  function invalidate() { dirty = true; }
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  const dprCap = phone ? 1.75 : 2;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, dprCap));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.55;
  const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 80);
  const loader = new THREE.TextureLoader(); const texUrls = [];
  const tex = (name, srgb = true) => { const u = img + name + '.webp'; texUrls.push(u); const t = loader.load(u, () => invalidate()); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };

  /* lights: warm key from the top-left (one light, like a window), soft fill, orange rim from the fire side */
  const key = new THREE.DirectionalLight(0xfff1df, 2.6); key.position.set(-3, 6, 3); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024); key.shadow.camera.left = -2.2; key.shadow.camera.right = 2.2; key.shadow.camera.top = 2.2; key.shadow.camera.bottom = -2.2;
  key.shadow.camera.near = 1; key.shadow.camera.far = 14; key.shadow.bias = -0.0008; key.shadow.normalBias = 0.02; key.shadow.radius = 4;
  scene.add(key);
  const rim = new THREE.PointLight(0xff8a3d, 0, 9, 1.6); rim.position.set(2.2, 1.2, -1.6); scene.add(rim);
  scene.add(new THREE.HemisphereLight(0xfff4e6, 0x6b4a33, 0.45));

  const U = { uSauce: { value: 1 }, uBake: { value: 1 }, uBall: { value: 0 }, uHeat: { value: 0 }, uMelt: { value: 1 }, uCheese: { value: 1 }, uTime: { value: 0 } };

  /* the pizza */
  const pizza = new THREE.Group(); scene.add(pizza);
  const seg = phone ? 128 : 192;
  const tRaw = tex('base-raw'), tBaked = tex('base-baked'), tDough = tex('dough'), tCheese = tex('base-cheese');
  const crustMat = new THREE.MeshStandardMaterial({ map: tRaw, roughness: 0.78, metalness: 0, side: THREE.DoubleSide });
  crustMat.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, U, { tBaked: { value: tBaked }, tDough: { value: tDough } });
    s.vertexShader = s.vertexShader.replace('#include <common>', '#include <common>\nattribute float aTop; varying float vTop; varying float vR; uniform float uBall;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        vTop = aTop; float r0 = length(position.xz); vR = r0;
        float k = 1.0 - 0.66 * uBall; transformed.xz *= k;
        float dome = 0.62 * sqrt(max(0.0, 1.0 - r0 * r0));
        transformed.y = mix(transformed.y, aTop * (0.03 + dome), uBall);`);
    s.fragmentShader = s.fragmentShader.replace('#include <common>', '#include <common>\n' + NOISE + 'uniform sampler2D tBaked; uniform sampler2D tDough; uniform float uSauce, uBake, uBall, uHeat; varying float vTop; varying float vR;')
      .replace('#include <map_fragment>', `
        vec2 d = vMapUv - 0.5; float rt = length(d);
        vec4 cR = texture2D(map, vMapUv); vec4 cB = texture2D(tBaked, vMapUv);
        vec3 dough = texture2D(tDough, 0.5 + d * 0.44).rgb;
        float n = fbm(vMapUv * 24.0);
        float sauceR = uSauce * 0.362;
        float sm = (1.0 - smoothstep(sauceR - 0.02, sauceR, rt + (n - 0.5) * 0.03)) * step(0.0001, uSauce);
        vec3 rawC = rt < 0.345 ? mix(dough, cR.rgb, sm) : mix(cR.rgb, dough, 0.25);
        float bk = rt < 0.345 ? uBake * sm : uBake;
        vec3 col = mix(rawC, cB.rgb, bk);
        vec3 under = mix(dough * 0.95, vec3(0.62, 0.42, 0.24), uBake * 0.8) * (0.85 + 0.3 * n);
        col = mix(under, col, vTop);
        col = mix(col, dough, uBall);
        diffuseColor.rgb *= col;`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        totalEmissiveRadiance += uHeat * vec3(0.55, 0.16, 0.03) * smoothstep(0.82, 0.96, vR) * (0.6 + 0.4 * fbm(vMapUv * 40.0));`);
  };
  const crust = new THREE.Mesh(crustGeometry(seg), crustMat); crust.castShadow = true; crust.receiveShadow = true; pizza.add(crust);

  /* cheese v2 (Oct 31 polish): one continuous melted sheet at every build stage - no raw white shreds, no sauce holes.
     Gloss from a low-roughness clearcoat, body from a fragment bump (bubbles + pooled ridges), browning only where bubbles rise. */
  const cheeseMat = new THREE.MeshPhysicalMaterial({ map: tCheese, roughness: 0.3, metalness: 0, clearcoat: 0.8, clearcoatRoughness: 0.18, sheen: 0.35, sheenColor: new THREE.Color(0xfff0c0), transparent: false, alphaTest: 0.5 });
  cheeseMat.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, U);
    s.vertexShader = s.vertexShader.replace('#include <common>', '#include <common>\n' + NOISE + 'uniform float uMelt, uBake, uCheese, uBall; varying vec2 vP;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        vP = position.xz; float r0 = length(position.xz);
        float bub = pow(fbm(position.xz * 7.0 + 3.1), 2.0);
        float edge = 1.0 - smoothstep(0.66, 0.815, r0);
        transformed.y = 0.036 + edge * (0.006 + bub * mix(0.022, 0.04, uMelt) + uBake * bub * 0.026);
        transformed.xz *= 1.0 - 0.6 * uBall;`);
    s.fragmentShader = s.fragmentShader.replace('#include <common>', '#include <common>\n' + NOISE + `uniform float uMelt, uBake, uCheese, uHeat, uTime; varying vec2 vP;
        float chH(vec2 p){ float b = fbm(p * 7.0 + 3.1); float ridge = fbm(p * 15.0 + 7.3); return b * b * 0.9 + ridge * 0.25; }`)
      .replace('#include <map_fragment>', `
        vec4 c = texture2D(map, vMapUv);
        float r0 = length(vP);
        float spread = smoothstep(uCheese * 0.86 + 0.02, uCheese * 0.86 - 0.05, r0 + (fbm(vP * 6.0) - 0.5) * 0.16);
        float edgeN = fbm(vP * 7.0 + 2.0);
        float rim = 1.0 - smoothstep(0.765, 0.8, r0 + (edgeN - 0.5) * 0.1);
        float a = c.a * spread * rim * step(0.001, uCheese);
        float hgt = chH(vP);
        float thin = 1.0 - smoothstep(0.28, 0.5, fbm(vP * 5.0 + 11.0));
        vec3 cd = clamp((c.rgb - 0.62) * 1.5 + 0.62, 0.0, 1.0);
        vec3 melt = mix(vec3(1.0, 0.85, 0.52), cd * vec3(1.06, 0.97, 0.8), 0.62);
        melt = mix(melt, vec3(0.97, 0.66, 0.26), thin * 0.3);
        melt *= 0.86 + 0.2 * hgt;
        vec3 fresh = mix(vec3(0.99, 0.9, 0.68), melt, 0.7);
        vec3 col = mix(fresh, melt, smoothstep(0.0, 0.9, uMelt));
        float edgeT = smoothstep(0.0, 0.07, (uCheese * 0.86 - r0)) * smoothstep(0.0, 0.05, 0.8 - r0);
        col = mix(vec3(0.95, 0.6, 0.3) * col, col, 0.55 + 0.45 * edgeT);
        float spots = smoothstep(0.5, 0.78, hgt + (fbm(vP * 11.0 + 4.0) - 0.5) * 0.35);
        col = mix(col, col * vec3(1.0, 0.86, 0.62), uBake * 0.55);
        col = mix(col, vec3(0.72, 0.42, 0.17), uBake * spots * 0.62);
        diffuseColor.rgb *= col; diffuseColor.a *= a;`)
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
        { float hb = chH(vP) * (0.055 + 0.02 * uMelt + 0.025 * uBake);
          vec3 sX = dFdx(-vViewPosition), sY = dFdy(-vViewPosition); vec3 R1 = cross(sY, normal), R2 = cross(normal, sX);
          float det = dot(sX, R1); vec2 dH = vec2(dFdx(hb), dFdy(hb));
          vec3 grad = sign(det) * (dH.x * R1 + dH.y * R2); normal = normalize(abs(det) * normal - grad); }`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
        roughnessFactor = clamp(roughnessFactor - 0.12 * chH(vP) + 0.18 * uBake * smoothstep(0.55, 0.8, chH(vP)), 0.12, 0.9);`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        totalEmissiveRadiance += uHeat * vec3(0.4, 0.17, 0.03) * fbm(vP * 9.0 + uTime * 0.3);
        { float pool = smoothstep(0.6, 0.78, fbm(vP * 9.0 + 1.3)) * (1.0 - 0.6 * uBake); totalEmissiveRadiance += vec3(1.0, 0.93, 0.74) * pool * 0.1 * uMelt; }`);
  };
  const cheese = new THREE.Mesh(cheeseGeometry(seg), cheeseMat); cheese.castShadow = true; cheese.receiveShadow = true; pizza.add(cheese);
  cheeseMat.customDepthMaterial = undefined;

  /* toppings: one InstancedMesh per kind/texture, matrices from a small model */
  const MAX = 24; const groups = {}; const pieces = [];
  const mats = {};
  function topMat(kind, tname) {
    const k = KINDS[kind];
    if (k.geo === 'ring') return new THREE.MeshPhysicalMaterial({ color: k.color, roughness: 0.38, clearcoat: 0.5, clearcoatRoughness: 0.3 });
    if (k.geo === 'dome') return new THREE.MeshPhysicalMaterial({ color: k.color, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.12, sheen: 0.2 });
    if (k.geo === 'blob') { const m = new THREE.MeshPhysicalMaterial({ color: 0xefe3c8, roughness: 0.55, sheen: 0.5, sheenColor: new THREE.Color(0xfff1d0), clearcoat: 0.15 }); return m; }
    const t = tex(tname);
    const m = new THREE.MeshStandardMaterial({ map: t, roughness: kind === 'basil' ? 0.5 : 0.55, alphaTest: 0.45, side: THREE.DoubleSide });
    if (k.geo === 'puck') { m.side = THREE.FrontSide; }
    m.onBeforeCompile = (s) => { Object.assign(s.uniforms, U);
      s.fragmentShader = s.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uBake;')
        .replace('#include <map_fragment>', '#include <map_fragment>\n diffuseColor.rgb *= mix(vec3(1.0), ' + (kind === 'basil' ? 'vec3(0.92,0.95,0.9)' : 'vec3(0.86,0.72,0.62)') + ', uBake);');
      if (k.geo === 'puck') s.vertexShader = s.vertexShader.replace('#include <common>', '#include <common>\nuniform float uBake;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\n transformed.y += uBake * 0.22 * dot(position.xz, position.xz) * step(0.0, position.y);');
    };
    return m;
  }
  function topGeo(kind) {
    const k = KINDS[kind];
    if (k.geo === 'puck') { const g = new THREE.CylinderGeometry(0.5, 0.48, 0.04, 36, 1); const uv = g.attributes.uv, p = g.attributes.position;
      for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), y = p.getY(i); const s = y > 0 ? 0.47 : 0.45; uv.setXY(i, 0.5 + x * 2 * s * 0.98, 0.5 - z * 2 * s * 0.98); }
      g.translate(0, 0.02, 0); return g; }
    if (k.geo === 'dome') { const g = new THREE.SphereGeometry(0.5, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2); g.scale(1, 0.8, 1); return g; }
    if (k.geo === 'ring') { const g = new THREE.TorusGeometry(0.33, 0.13, 12, 24); g.scale(1, 1, 1.25); g.rotateX(Math.PI / 2); g.translate(0, 0.12, 0); return g; }
    if (k.geo === 'blob') { const g = new THREE.SphereGeometry(0.5, 20, 12); g.scale(1, 0.38, 0.85); const p = g.attributes.position;
      for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, p.getY(i) * (1 + 0.25 * Math.sin(x * 9 + z * 7))); }
      g.computeVertexNormals(); g.translate(0, 0.12, 0); return g; }
    return leafGeometry(kind === 'pepper' || kind === 'onion' ? 0.45 : 1.3, k.bend || 0.1);
  }
  for (const kind of Object.keys(KINDS)) {
    const k = KINDS[kind]; const geo = topGeo(kind); const names = k.tex || ['solid'];
    groups[kind] = names.map((tn) => { let mt = topMat(kind, tn); if (k.geo === 'puck') mt = [new THREE.MeshStandardMaterial({ color: 0x7a2416, roughness: 0.6 }), mt, mt];
      const m = new THREE.InstancedMesh(geo, mt, MAX); m.count = 0; m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; pizza.add(m); return m; });
  }
  if (KINDS.tomato) { /* cut face on top of each tomato dome */ }

  const dummy = new THREE.Object3D();
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  function placeFor(kind, n, at) {
    const out = []; const k = KINDS[kind]; const minD = k.size * 0.85;
    const existing = pieces.filter((p) => p.kind === kind);
    for (let tries = 0; out.length < n && tries < 400; tries++) {
      let x, z;
      if (at && out.length === 0) { x = at.x; z = at.z; }
      else if (at) { const a = rnd() * Math.PI * 2, d = 0.12 + rnd() * 0.22; x = at.x + Math.cos(a) * d; z = at.z + Math.sin(a) * d; }
      else { const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * 0.66; x = Math.cos(a) * d; z = Math.sin(a) * d; }
      if (Math.hypot(x, z) > 0.7) { const s = 0.7 / Math.hypot(x, z); x *= s; z *= s; }
      if (!at && existing.concat(out).some((p) => Math.hypot(p.x - x, p.z - z) < minD)) continue;
      if (!at && tries < 300 && pieces.some((p) => p.kind !== kind && Math.hypot(p.x - x, p.z - z) < (k.size + KINDS[p.kind].size) * 0.42)) continue;
      out.push({ x, z });
    }
    return out;
  }
  function add(kind, n, opts = {}) {
    const k = KINDS[kind]; n = n || k.n; const spots = placeFor(kind, n, opts.at);
    const nt = groups[kind].length; const added = [];
    spots.forEach((s, i) => {
      const used = pieces.filter((p) => p.kind === kind).length; if (used >= MAX * nt) return;
      const p = { kind, x: s.x, z: s.z, yaw: rnd() * Math.PI * 2, tilt: (rnd() - 0.5) * 0.2, sc: k.size * (0.88 + rnd() * 0.24), v: (used) % nt,
        a: opts.instant ? 1 : 0, target: 1, delay: opts.instant ? 0 : i * 0.07 + (opts.delay || 0), spin: (rnd() - 0.5) * 6 };
      pieces.push(p); added.push(p);
    });
    rebuild(); invalidate(); return added;
  }
  function clear(kind) { for (let i = pieces.length - 1; i >= 0; i--) if (!kind || pieces[i].kind === kind) pieces.splice(i, 1); rebuild(); invalidate(); }
  function rebuild() {
    for (const kind in groups) groups[kind].forEach((m) => (m.count = 0));
    for (const p of pieces) { const m = groups[p.kind][p.v % groups[p.kind].length]; p.mesh = m; p.idx = m.count; m.count++; }
    updateMatrices(true);
  }
  const surfaceY = 0.05;
  function updateMatrices(force) {
    let moving = false;
    const melt = U.uBake.value;
    for (const p of pieces) {
      const a = p.a; const e = 1 - Math.pow(1 - a, 3);
      const k = KINDS[p.kind];
      const fall = (1 - e);
      const bounce = a < 1 ? Math.sin(Math.min(1, a) * Math.PI) * 0.03 * (1 - a) : 0;
      dummy.position.set(p.x, surfaceY + fall * 1.6 + bounce, p.z);
      dummy.rotation.set(p.tilt + fall * p.spin * 0.4, p.yaw + fall * p.spin, fall * p.spin * 0.3);
      let sx = p.sc, sy = p.sc, sz = p.sc;
      if (k.geo === 'blob') { sx *= 1 + melt * 0.55; sz *= 1 + melt * 0.55; sy *= 1 - melt * 0.7; }
      if (k.geo === 'dome') { sy *= 1 - melt * 0.25; }
      const vis = a > 0.001 ? 1 : 0.0001;
      dummy.scale.set(sx * vis, sy * vis, sz * vis);
      dummy.updateMatrix(); p.mesh.setMatrixAt(p.idx, dummy.matrix);
      if (a < 1 && a > 0) moving = true;
    }
    for (const kind in groups) groups[kind].forEach((m) => (m.instanceMatrix.needsUpdate = true));
    return moving;
  }

  /* the board under the pizza: real Poly Haven wood, our geometry (a peel with a handle) */
  const board = new THREE.Group(); scene.add(board);
  const tBoard = tex('board'); tBoard.wrapS = tBoard.wrapT = THREE.RepeatWrapping;
  const peelShape = new THREE.Shape(); peelShape.absarc(0, 0, 1.18, 0, Math.PI * 2, false);
  const handle = new THREE.Shape(); handle.moveTo(-0.13, 1.05); handle.lineTo(0.13, 1.05); handle.lineTo(0.11, 2.6); handle.quadraticCurveTo(0, 2.72, -0.11, 2.6); handle.lineTo(-0.13, 1.05);
  const peelGeo = new THREE.ExtrudeGeometry([peelShape, handle], { depth: 0.05, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.02, bevelSegments: 3, curveSegments: 64 });
  peelGeo.rotateX(Math.PI / 2); peelGeo.translate(0, -0.005, 0);
  { const p = peelGeo.attributes.position, uv = peelGeo.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) * 0.3 + 0.5, p.getZ(i) * 0.3 + 0.5); }
  const peel = new THREE.Mesh(peelGeo, new THREE.MeshStandardMaterial({ map: tBoard, roughness: 0.62, color: 0xf2e2cc })); peel.receiveShadow = true; peel.castShadow = true;
  board.add(peel); board.visible = showBoard;
  const floorMat = new THREE.ShadowMaterial({ opacity: 0.22 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), floorMat); floor.rotation.x = -Math.PI / 2; floor.position.y = -0.07; floor.receiveShadow = true; scene.add(floor);

  /* embers: additive sparks that rise and fade (hero + oven) */
  const EN = phone ? 90 : 160; const eg = new THREE.BufferGeometry(); const ep = new Float32Array(EN * 3), es = new Float32Array(EN);
  for (let i = 0; i < EN; i++) { ep[i * 3] = (Math.random() - 0.5) * 4; ep[i * 3 + 1] = Math.random() * 3; ep[i * 3 + 2] = (Math.random() - 0.5) * 3; es[i] = Math.random(); }
  eg.setAttribute('position', new THREE.BufferAttribute(ep, 3)); eg.setAttribute('aSeed', new THREE.BufferAttribute(es, 1));
  const emberMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: U.uTime, uAmt: { value: 0 }, uPx: { value: renderer.getPixelRatio() } },
    vertexShader: `attribute float aSeed; uniform float uTime, uPx; varying float vA;
      void main(){ vec3 p = position; float t = fract(aSeed + uTime * (0.05 + aSeed * 0.06));
        p.y = mod(p.y + t * 3.0, 3.2) - 0.2; p.x += sin(uTime * 0.8 + aSeed * 30.0) * 0.18 * t; p.z += cos(uTime * 0.6 + aSeed * 20.0) * 0.12;
        vA = smoothstep(0.0, 0.15, t) * (1.0 - t); vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = (2.0 + aSeed * 4.0) * uPx * (3.0 / -mv.z); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform float uAmt; varying float vA; void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d) * vA * uAmt;
      gl_FragColor = vec4(vec3(1.0, 0.55, 0.18) * a * 1.6, a); }` });
  const embers = new THREE.Points(eg, emberMat); embers.frustumCulled = false; scene.add(embers);

  /* optional scene pieces supplied by the page (oven, box, street) */
  const ctx = { THREE, scene, U, tex, pizza, board, rim, key, renderer, phone, NOISE, floor, invalidate: () => invalidate() };
  const parts = {};
  for (const [name, fn] of Object.entries(extras)) parts[name] = fn(ctx);

  /* camera rig: smooth towards targets; framing keeps the subject inside a safe rect of the canvas */
  const cam = { pos: new THREE.Vector3(0, 2.6, 3.4), look: new THREE.Vector3(0, 0, 0), tPos: new THREE.Vector3(0, 2.6, 3.4), tLook: new THREE.Vector3(), shift: { x: 0, y: 0 }, tShift: { x: 0, y: 0 } };
  let W = 1, H = 1;
  function resize() {
    const r = canvas.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height);
    renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix(); emberMat.uniforms.uPx.value = renderer.getPixelRatio(); invalidate();
  }
  new ResizeObserver(resize).observe(canvas); resize();

  const ray = new THREE.Raycaster(); const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -surfaceY);
  function pick(clientX, clientY) {
    const r = canvas.getBoundingClientRect(); const v = new THREE.Vector2(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(v, camera); const hit = new THREE.Vector3(); if (!ray.ray.intersectPlane(plane, hit)) return null;
    const local = pizza.worldToLocal(hit.clone()); const d = Math.hypot(local.x, local.z); return { x: local.x, z: local.z, on: d < 0.78, d };
  }
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!running) return;
    const animated = !reduced;
    if (animated) U.uTime.value += dt;
    let moving = false;
    for (const p of pieces) { if (p.a < p.target) { if (p.delay > 0) { p.delay -= dt; moving = true; continue; } p.a = reduced ? 1 : Math.min(1, p.a + dt / 0.55); moving = true; } }
    if (moving) updateMatrices();
    const k = reduced ? 1 : 1 - Math.pow(0.0015, dt);
    cam.pos.lerp(cam.tPos, k); cam.look.lerp(cam.tLook, k); cam.shift.x = lerp(cam.shift.x, cam.tShift.x, k); cam.shift.y = lerp(cam.shift.y, cam.tShift.y, k);
    if (cam.pos.distanceToSquared(cam.tPos) > 1e-7 || cam.look.distanceToSquared(cam.tLook) > 1e-7) moving = true;
    for (const t of tickers) if (t(dt, U.uTime.value)) moving = true;
    if (emberMat.uniforms.uAmt.value > 0.01 && animated) moving = true;
    if (!moving && !dirty) return;
    dirty = false;
    camera.position.copy(cam.pos); camera.lookAt(cam.look);
    camera.setViewOffset(W, H, -cam.shift.x * W, -cam.shift.y * H, W, H);
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);

  const api = {
    THREE, scene, camera, renderer, U, pizza, board, peel, rim, key, embers, floor, emberMat, parts, cam, pieces,
    add, clear, pick, invalidate, reduced,
    set(state) { for (const k in state) if (U[k]) U[k].value = state[k]; invalidate(); },
    setScrub(kind, a) { for (const p of pieces) if (p.kind === kind) { p.a = p.target = a; p.delay = 0; } updateMatrices(); invalidate(); },
    view(pos, look, shift, instant) { cam.tPos.set(...pos); cam.tLook.set(...look); if (shift) { cam.tShift.x = shift[0]; cam.tShift.y = shift[1]; }
      if (instant || reduced) { cam.pos.copy(cam.tPos); cam.look.copy(cam.tLook); cam.shift.x = cam.tShift.x; cam.shift.y = cam.tShift.y; } invalidate(); },
    tick(fn) { tickers.push(fn); },
    pause(v) { running = !v; if (!v) { last = performance.now(); invalidate(); } },
    count(kind) { return pieces.filter((p) => p.kind === kind).length; },
    info() { return { ok: true, models: [], textures: [...new Set(texUrls)].sort(), hdri: 'RoomEnvironment (generated)', toneMapping: 'ACESFilmic', exposure: renderer.toneMappingExposure,
      shadows: true, antialias: true, env: true, passes: [], contact: 'shadowmap' }; }
  };
  return api;
}
