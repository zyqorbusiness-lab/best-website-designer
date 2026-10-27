/* Volta One - real 3D model build (replaces the procedural car.js body).
   Model: "Car Concept" from the Khronos glTF Sample Assets, CC-BY 4.0
   (https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/CarConcept), compressed (meshopt + webp),
   interior removed on the phone file. The licence plate mesh is removed (no text, no real brand).
   Same interface as car.js: { group, paint, U, glassMat, fMat, rMat, fBar, rBar, wheels, anchors, L, W }.
   The object is returned at once; the model streams in and fills the group, so the page never waits on it. */
import * as THREE from 'three';
import { loadGLB, isM } from '../_kit/kit.js';
/* one asset for BOTH builds (round 2): full 213k-tri model, full-res webp textures, meshopt; phone = desktop */
const MODEL = new URL('../../assets/lab/volta/volta.glb?v=4', import.meta.url).href;

const L = 2.3;            // half length in car units (front at +X), same as the procedural car
const LEN = isM ? 3.95 : 4.45;   // full length the model is scaled to (a touch smaller on the phone frame)

function toFloat(geo) {
  for (const k of Object.keys(geo.attributes)) {
    const a = geo.attributes[k];
    if (a.array instanceof Float32Array && !a.isInterleavedBufferAttribute) continue;
    const n = a.count, s = a.itemSize, out = new Float32Array(n * s);
    for (let i = 0; i < n; i++) for (let c = 0; c < s; c++) out[i * s + c] = a.getComponent ? a.getComponent(i, c) : [a.getX(i), a.getY(i), a.getZ(i), a.getW(i)][c];
    geo.setAttribute(k, new THREE.BufferAttribute(out, s));
  }
  return geo;
}

export function buildCar() {
  const group = new THREE.Group();
  const U = { uOld: { value: new THREE.Color('#0F7C7A') }, uNew: { value: new THREE.Color('#0F7C7A') }, uSweep: { value: -9 }, uEdge: { value: 0 }, uEdgeCol: { value: new THREE.Color('#ffffff') } };
  const paint = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0.5, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.035, envMapIntensity: 1.2 });
  paint.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vPosO;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvPosO = position;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vPosO;uniform vec3 uOld,uNew,uEdgeCol;uniform float uSweep,uEdge;')
      .replace('vec4 diffuseColor = vec4( diffuse, opacity );', 'float sw = smoothstep(uSweep - 0.09, uSweep + 0.09, vPosO.x);\nvec4 diffuseColor = vec4( diffuse * mix(uOld, uNew, sw), opacity );')
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
{ vec3 fp = vPosO * 520.0; vec3 cell = floor(fp);
  vec3 h3 = fract(sin(vec3(dot(cell, vec3(127.1, 311.7, 74.7)), dot(cell, vec3(269.5, 183.3, 246.1)), dot(cell, vec3(113.5, 271.9, 124.6)))) * 43758.5453);
  float px = length(fwidth(fp));
  float fade = 1.0 - smoothstep(0.35, 1.2, px);
  normal = normalize(normal + (h3 - 0.5) * 0.32 * fade);
  roughnessFactor = clamp(roughnessFactor + (h3.x - 0.5) * 0.12 * fade, 0.04, 1.0); }`)
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance += uEdgeCol * (1.0 - abs(sw * 2.0 - 1.0)) * uEdge;');
  };
  paint.customProgramCacheKey = () => 'voltaPaintGLB';
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x0a1416, metalness: 0.0, roughness: 0.04, clearcoat: 1, clearcoatRoughness: 0.02, transparent: true, opacity: 0.62, envMapIntensity: 1.5, emissive: new THREE.Color('#2fd1c4'), emissiveIntensity: 0, depthWrite: false });
  const fMat = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
  const rMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#F26B3A'), toneMapped: false });

  // placeholder light-bar paths (the app builds its night glow from these); refitted to the model once it loads
  const barPath = (front) => {
    const x = front ? L * 0.97 : -L * 0.97, y = front ? 0.66 : 0.82, pts = [];
    for (let i = 0; i <= 12; i++) { const z = -0.8 + 1.6 * i / 12; pts.push(new THREE.Vector3(x - Math.sign(x) * 0.25 * Math.pow(Math.abs(z) / 0.8, 2), y, z)); }
    return new THREE.CatmullRomCurve3(pts);
  };
  const fPath = barPath(true), rPath = barPath(false);
  const fBar = new THREE.Mesh(new THREE.TubeGeometry(fPath, 40, 0.017, 6, false), fMat);
  const rBar = new THREE.Mesh(new THREE.TubeGeometry(rPath, 40, 0.02, 6, false), rMat);

  const wheels = [];
  const wheelSlots = [];
  for (const sx of [1, -1]) for (const sz of [1, -1]) {
    const wg = new THREE.Group(), spin = new THREE.Group(); wg.add(spin);
    wg.position.set(sx * 1.4, 0.36, sz * 0.82); group.add(wg); wheels.push(spin); wheelSlots.push({ wg, spin, sx, sz });
  }
  const anchors = {
    light: new THREE.Vector3(L * 0.98, 0.66, 0), glass: new THREE.Vector3(-0.1, 1.2, 0), wheel: new THREE.Vector3(1.4, 0.36, 0.95),
    tail: new THREE.Vector3(-L * 0.98, 0.82, 0), charge: new THREE.Vector3(-1.55, 0.78, 0.95), floor: new THREE.Vector3(0, 0.24, 0.95)
  };
  const car = { group, paint, U, glassMat, fMat, rMat, fBar, rBar, wheels, anchors, L, W: 1.0, ready: null };

  car.ready = loadGLB(MODEL).then((gltf) => fill(car, gltf, wheelSlots, fPath, rPath)).catch(() => null);
  return car;
}

function fill(car, gltf, wheelSlots, fPath, rPath) {
  const { group, paint, glassMat, fMat, rMat, anchors } = car;
  const root = gltf.scene;
  // orientation: length is along the model's Z; headlights decide which end is the front
  let hl = null, tl = null;
  root.traverse((o) => { if (o.isMesh && /Headlights/.test(o.name)) hl = o; if (o.isMesh && /Taillights$/.test(o.name)) tl = o; });
  root.updateMatrixWorld(true);
  const hz = hl ? new THREE.Box3().setFromObject(hl).getCenter(new THREE.Vector3()).z : 1;
  const holder = new THREE.Group(); holder.add(root);
  holder.rotation.y = hz >= 0 ? Math.PI / 2 : -Math.PI / 2;
  holder.updateMatrixWorld(true);
  let bb = new THREE.Box3().setFromObject(holder), sz = bb.getSize(new THREE.Vector3());
  const k = LEN / sz.x; holder.scale.setScalar(k); holder.updateMatrixWorld(true);
  bb = new THREE.Box3().setFromObject(holder); const c = bb.getCenter(new THREE.Vector3());
  holder.position.set(-c.x, -bb.min.y, -c.z); holder.updateMatrixWorld(true);
  bb = new THREE.Box3().setFromObject(holder); sz = bb.getSize(new THREE.Vector3());

  // which wheel group a mesh belongs to
  const wheelOf = (o) => { let p = o; while (p) { const m = /^Wheel(Front|Rear)(L|R)$/.exec(p.name || ''); if (m) return m[1] + m[2]; p = p.parent; } return null; };
  const meshes = []; root.traverse((o) => { if (o.isMesh) meshes.push(o); });
  const wheelMeshes = {};
  const mats = new Map();
  const remat = (m) => {
    if (!m) return m;
    if (mats.has(m)) return mats.get(m);
    let out = m; const n = m.name || '';
    if (/^Paint 1/.test(n)) {
      /* the paint's own normal map is left off: without tangents it ripples the clearcoat; the body reads cleaner smooth */
      if (m.aoMap) { paint.aoMap = m.aoMap; paint.aoMapIntensity = 1; }
      out = paint;
    } else if (/^Paint 2/.test(n)) {
      m.color.set('#1c2426'); m.metalness = 0.35; m.roughness = 0.38; if ('clearcoat' in m) { m.clearcoat = 0.8; m.clearcoatRoughness = 0.08; }
    } else if (/^Glass/.test(n)) {
      out = glassMat;
    } else if (/^Interior 3/.test(n)) {
      m.color.set('#0f6f6c');
    } else if (/^Headlight|^Brakelight/.test(n)) {
      out = m.clone(); out.emissive = new THREE.Color(0, 0, 0); out.emissiveIntensity = 1; out.toneMapped = false;
      out.userData.drive = /^Head/.test(n) ? fMat : rMat;
    }
    if (out.envMapIntensity !== undefined && out !== glassMat && out !== paint) out.envMapIntensity = 1.1;
    mats.set(m, out); return out;
  };
  for (const o of meshes) {
    const g = toFloat(o.geometry.clone()); g.applyMatrix4(o.matrixWorld);
    const mat = Array.isArray(o.material) ? o.material.map(remat) : remat(o.material);
    const mesh = new THREE.Mesh(g, mat); mesh.name = o.name;
    if (mat && mat.userData && mat.userData.drive) {
      const drv = mat.userData.drive, tgt = mat;
      mesh.onBeforeRender = () => { tgt.emissive.copy(drv.color).multiplyScalar(1.4); };
    }
    const w = wheelOf(o);
    if (w) (wheelMeshes[w] = wheelMeshes[w] || []).push(mesh); else group.add(mesh);
  }
  // wheels: centre each spinning group on its tyre/rim so rotation.z spins it in place
  for (const s of wheelSlots) {
    const key = (s.sx > 0 ? 'Front' : 'Rear') + (s.sz > 0 ? 'L' : 'R');
    let list = wheelMeshes[key];
    if (!list) continue;
    const box = new THREE.Box3(); list.forEach((m) => { m.geometry.computeBoundingBox(); box.union(m.geometry.boundingBox); });
    const ctr = box.getCenter(new THREE.Vector3());
    // the side the model calls L/R may be mirrored after the rotation: put the group where the geometry really is
    s.wg.position.copy(ctr);
    for (const m of list) {
      m.geometry.translate(-ctr.x, -ctr.y, -ctr.z);
      if (/BrakePad/.test(m.name)) s.wg.add(m); else s.spin.add(m);
    }
  }
  // anchors from the real geometry
  const boxOf = (re) => { const b = new THREE.Box3(); group.traverse((o) => { if (o.isMesh && re.test(o.name)) { o.geometry.computeBoundingBox(); b.union(o.geometry.boundingBox); } }); return b; };
  const hb = boxOf(/Headlights/), tb = boxOf(/Taillights$/), rb = boxOf(/RoofPanel|Windshield$/), fw = wheelSlots.find((s) => s.sx > 0 && s.wg.position.z > 0) || wheelSlots[0];
  if (!hb.isEmpty()) anchors.light.set(hb.max.x, (hb.min.y + hb.max.y) / 2, 0);
  if (!tb.isEmpty()) anchors.tail.set(tb.min.x, (tb.min.y + tb.max.y) / 2, 0);
  anchors.glass.set(rb.isEmpty() ? -0.1 : (rb.min.x + rb.max.x) / 2, (rb.isEmpty() ? bb.max.y : rb.max.y) + 0.02, 0);
  anchors.wheel.set(fw.wg.position.x, fw.wg.position.y, Math.abs(fw.wg.position.z) + 0.12);
  anchors.charge.set(-sz.x * 0.3, bb.max.y * 0.62, sz.z * 0.46);
  anchors.floor.set(0, 0.22, sz.z * 0.46);
  car.W = sz.z / 2;
  // refit the night light bars to the real lamps
  const refit = (path, b, front) => {
    if (b.isEmpty()) return;
    const pts = path.points, n = pts.length - 1, x = front ? b.max.x : b.min.x, y = (b.min.y + b.max.y) / 2, hw = (b.max.z - b.min.z) / 2, cz = (b.max.z + b.min.z) / 2;
    pts.forEach((p, i) => { const u = i / n * 2 - 1; p.set(x - (front ? 1 : -1) * (b.max.x - b.min.x) * 0.8 * u * u, y, cz + u * hw); });
  };
  refit(fPath, hb, true); refit(rPath, tb, false);
  group.traverse((o) => {
    const gp = o.geometry && o.geometry.parameters;
    if (gp && (gp.path === fPath || gp.path === rPath)) { const ng = new THREE.TubeGeometry(gp.path, 60, gp.radius, 8, false); o.geometry.dispose(); o.geometry = ng; }
  });
  return car;
}
