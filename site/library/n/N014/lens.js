/* N014 Glint Eyewear: real refraction through the scanned lens shape (own shader code, MIT).
   The lens meshes keep a MeshStandardMaterial for the HDRI reflection + Fresnel, and onBeforeCompile swaps their colour
   for the chart seen THROUGH them: for every lens pixel the view ray is bent by the lens's own surface normal (Snell,
   refract()) and intersected with the chart plane, and the dioptre scales the hit point around the lens centre
   (plus = magnify toward the centre, minus = shrink). The chart texture is sampled directly, so it stays sharp at any
   zoom (no render target, no smearing). uBlur adds a small disc blur for the "1 or 2" exam pairs.
   splitSpectacles() cuts the CC0 Round Spectacles GLB into its real parts (connected pieces of its own mesh: front with
   rims + bridge, two lenses, two temples, hinges, nose pads) and measures them in millimetres. */
import { THREE } from '../../_kit/stage.js';

export function lensMaterial({ map, plane, size, tint = '#2F58DE', tintAmt = 0.06, ior = 1.5, env = 0.7 } = {}) {
  const m = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.035, metalness: 0, envMapIntensity: env, toneMapped: false });
  const u = {
    uMap: { value: map }, uPlane: { value: new THREE.Vector3(plane.x, plane.y, plane.z) }, uSize: { value: new THREE.Vector2(size.x, size.y) },
    uC0: { value: new THREE.Vector3() }, uC1: { value: new THREE.Vector3(1e3, 0, 0) }, uMag: { value: 1 }, uBlur: { value: 0 },
    uIor: { value: ior }, uBend: { value: 0.35 }, uTint: { value: new THREE.Color(tint) }, uTintAmt: { value: tintAmt }, uPaper: { value: new THREE.Color('#E2EAEE') }
  };
  m.userData.u = u;
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, u);
    sh.vertexShader = 'varying vec3 vWP;\nvarying vec3 vWN;\n' + sh.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\n vWP = (modelMatrix * vec4(transformed, 1.0)).xyz;\n vWN = normalize(mat3(modelMatrix) * objectNormal);');
    sh.fragmentShader = `varying vec3 vWP;\nvarying vec3 vWN;\nuniform sampler2D uMap; uniform vec3 uPlane; uniform vec2 uSize; uniform vec3 uC0; uniform vec3 uC1;
uniform float uMag; uniform float uBlur; uniform float uIor; uniform float uBend; uniform vec3 uTint; uniform float uTintAmt; uniform vec3 uPaper;
vec2 zkHit(vec3 o, vec3 d){ float t = (uPlane.z - o.z) / min(d.z, -1e-4); vec3 p = o + d * t; return (p.xy - uPlane.xy) / uSize + 0.5; }
vec3 zkTap(vec2 uv){ vec2 inb = step(vec2(0.0), uv) * step(uv, vec2(1.0)); return mix(uPaper, texture2D(uMap, uv).rgb, inb.x * inb.y); }
` + sh.fragmentShader.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
 {
  vec3 V = normalize(vWP - cameraPosition);
  vec3 C = distance(vWP, uC0) < distance(vWP, uC1) ? uC0 : uC1;
  vec2 uvP = zkHit(cameraPosition, V), uvC = zkHit(cameraPosition, normalize(C - cameraPosition));
  vec3 N = normalize(vWN); if (dot(N, V) > 0.0) N = -N;
  vec2 uvR = zkHit(vWP, refract(V, N, 1.0 / uIor));
  vec2 uv = uvC + (uvP - uvC) / uMag + (uvR - uvP) * uBend;
  vec3 col = zkTap(uv);
  if (uBlur > 0.0) {
    vec2 r = vec2(uBlur) / vec2(textureSize(uMap, 0)); vec3 acc = col;
    for (int i = 0; i < 12; i++) { float a = float(i) * 2.39996; float k = sqrt((float(i) + 0.5) / 12.0); acc += zkTap(uv + vec2(cos(a), sin(a)) * r * k * 1.6); }
    col = acc / 13.0;
  }
  col = mix(col, uTint, uTintAmt);
  totalEmissiveRadiance = col;
 }`);
  };
  m.customProgramCacheKey = () => 'zk-lens-v1';
  return m;
}

/* union-find over welded vertices -> connected pieces of one primitive */
function pieces(geo) {
  const pos = geo.attributes.position, idx = geo.index, n = pos.count;
  const key = new Map(), weld = new Int32Array(n);
  for (let i = 0; i < n; i++) { const k = Math.round(pos.getX(i) * 4e4) + ',' + Math.round(pos.getY(i) * 4e4) + ',' + Math.round(pos.getZ(i) * 4e4); let w = key.get(k); if (w === undefined) { w = key.size; key.set(k, w); } weld[i] = w; }
  const par = new Int32Array(key.size).map((_, i) => i);
  const f = (a) => { while (par[a] !== a) { par[a] = par[par[a]]; a = par[a]; } return a; };
  const tri = idx.count / 3;
  for (let t = 0; t < tri; t++) { const a = f(weld[idx.getX(t * 3)]), b = f(weld[idx.getX(t * 3 + 1)]), c = f(weld[idx.getX(t * 3 + 2)]); par[b] = a; par[f(c)] = a; }
  const groups = new Map();
  for (let t = 0; t < tri; t++) { const r = f(weld[idx.getX(t * 3)]); let gArr = groups.get(r); if (!gArr) groups.set(r, gArr = []); gArr.push(idx.getX(t * 3), idx.getX(t * 3 + 1), idx.getX(t * 3 + 2)); }
  return [...groups.values()];
}

/* returns { root, parts: {front, lensL, lensR, templeL, templeR, padL, padR}, lensMeshes, frameMeshes, mm } */
export function splitSpectacles(gltfScene) {
  gltfScene.updateMatrixWorld(true);
  const root = new THREE.Group(); root.name = 'spectacles';
  const parts = {}; const lensMeshes = [], frameMeshes = [];
  const meshes = []; gltfScene.traverse((o) => { if (o.isMesh) meshes.push(o); });
  const all = [];
  for (const src of meshes) {
    const glass = /glass/i.test(src.material.name);
    for (const ix of pieces(src.geometry)) {
      const g = new THREE.BufferGeometry();
      for (const k in src.geometry.attributes) g.setAttribute(k, src.geometry.attributes[k]);
      g.setIndex(ix);
      const m = new THREE.Mesh(g, src.material); m.matrixAutoUpdate = false; m.matrix.copy(src.matrixWorld); m.matrixWorldNeedsUpdate = true;
      const b = new THREE.Box3(); const v = new THREE.Vector3(); for (const i of new Set(ix)) { v.fromBufferAttribute(src.geometry.attributes.position, i).applyMatrix4(src.matrixWorld); b.expandByPoint(v); }
      all.push({ m, b, glass, size: b.getSize(new THREE.Vector3()), c: b.getCenter(new THREE.Vector3()) });
    }
  }
  const W = all.reduce((a, p) => Math.max(a, p.size.x), 0);
  const group = (name) => { if (!parts[name]) { parts[name] = new THREE.Group(); parts[name].name = name; root.add(parts[name]); } return parts[name]; };
  for (const p of all) {
    const side = p.c.x < 0 ? 'L' : 'R';
    let name;
    if (p.glass) name = p.size.x > W * 0.2 ? 'lens' + side : 'pad' + side;
    else if (p.size.z > W * 0.5) name = 'temple' + side;
    else if (p.size.x > W * 0.6) name = 'front';
    else if (Math.abs(p.c.x) > W * 0.3) name = 'temple' + side;     /* hinge pieces ride with their temple */
    else name = 'pad' + side;                                       /* nose-pad arms ride with the pads */
    group(name).add(p.m); (p.glass && name.startsWith('lens') ? lensMeshes : frameMeshes).push(p.m);
    p.name = name;
  }
  const lens = all.filter((p) => p.name.startsWith('lens')).sort((a, b) => a.c.x - b.c.x);
  const temple = all.filter((p) => p.name.startsWith('temple') && p.size.z > W * 0.5);
  const front = all.find((p) => p.name === 'front');
  const mm = (x) => Math.round(x * 1000);
  const out = {
    lensWidth: lens.length ? mm(lens[0].size.x) : 0, lensHeight: lens.length ? mm(lens[0].size.y) : 0,
    bridge: lens.length > 1 ? mm(lens[1].b.min.x - lens[0].b.max.x) : 0,
    temple: temple.length ? mm(Math.max(...temple.map((t) => t.size.z))) : 0,
    frameWidth: front ? mm(W) : 0
  };
  /* anchors (local, metres) for leader labels and explode axes */
  const anchors = {
    lens: lens.length ? lens[0].c.clone() : new THREE.Vector3(),
    front: front ? new THREE.Vector3(front.c.x, front.b.max.y, front.c.z) : new THREE.Vector3(),
    temple: temple.length ? (() => { const t = temple.find((q) => q.c.x > 0) || temple[0]; return new THREE.Vector3(t.c.x, t.c.y, t.b.min.z + t.size.z * 0.35); })() : new THREE.Vector3(),
    pad: (() => { const p = all.find((q) => q.name === 'padR' && q.glass) || all.find((q) => q.name.startsWith('pad')); return p ? p.c.clone() : new THREE.Vector3(); })()
  };
  return { root, parts, lensMeshes, frameMeshes, mm: out, anchors, width: W };
}

export function lensCentres(parts) {
  const v0 = new THREE.Vector3(), v1 = new THREE.Vector3();
  const box = new THREE.Box3();
  if (parts.lensL) { box.setFromObject(parts.lensL); box.getCenter(v0); }
  if (parts.lensR) { box.setFromObject(parts.lensR); box.getCenter(v1); }
  return [v0, v1];
}
