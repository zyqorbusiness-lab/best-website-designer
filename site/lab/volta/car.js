/* Volta One - procedural EV built in code (no model file).
   Body = a lofted surface: one cross-section per station along the car, every section
   made of bezier segments (sill, wheel well, side, shoulder, greenhouse, roof). */
import * as THREE from 'three';

const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const L = 2.3, W = 0.96;
const WHEEL = { x: 1.42, y: 0.365, r: 0.365, arch: 0.41 };

function prof(t) {
  const at = Math.abs(t);
  const p = t > 0 ? 2.3 : 3.4;
  const w = W * Math.pow(Math.max(0, 1 - Math.pow(at, p)), 1 / p);
  const yb = 0.2 + 0.1 * sm(0.74, 1, at);
  const ys = 0.93 - 0.33 * sm(0.62, 1.0, t) + 0.04 * sm(0.25, 0.95, -t) - 0.08 * sm(0.93, 1, -t);
  // cabin bump: windshield front ramp, fastback rear ramp
  const front = 1 - sm(-0.02, 0.5, t);
  const rear = Math.pow(1 - sm(-0.34, -0.97, t), 1.0);
  const rr = 1 - Math.pow(1 - (t < -0.2 ? 1 - sm(-0.2, -0.985, t) : 1), 1.9);
  const c = Math.min(front, t < -0.2 ? rr : 1);
  const yTop = ys + 0.06 + 0.39 * c;
  const x = t * L;
  // wheel arch height (outer side only)
  let ya = yb;
  for (const sx of [WHEEL.x, -WHEEL.x]) {
    const dx = x - sx;
    if (Math.abs(dx) < WHEEL.arch) ya = Math.max(ya, WHEEL.y + Math.sqrt(WHEEL.arch * WHEEL.arch - dx * dx));
  }
  ya = Math.min(ya, ys - 0.15);
  return { w, yb, ys, yTop, c, ya, x };
}

const bez = (a, k, b, n, out, skipFirst) => {
  for (let i = skipFirst ? 1 : 0; i <= n; i++) {
    const u = i / n, v = 1 - u;
    out.push([v * v * a[0] + 2 * v * u * k[0] + u * u * b[0], v * v * a[1] + 2 * v * u * k[1] + u * u * b[1]]);
  }
};
const lin = (a, b, n, out, skipFirst) => bez(a, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], b, n, out, skipFirst);

/* half section, bottom centre -> top centre. returns points + named indices */
function halfSection(P, Q) {
  const { w, yb, ys, yTop, c, ya } = P;
  const pts = [], idx = {};
  const zi = Math.max(0, w - 0.3);
  const lowC = Math.max(ya, yb);
  lin([0, yb], [zi, yb], 3 * Q, pts, false);
  lin([zi, yb], [zi, lowC], 1, pts, true);
  lin([zi, lowC], [Math.max(zi, w - 0.07), lowC], 2, pts, true);
  const yS0 = Math.min(lowC + 0.08, ys - 0.1);
  bez([Math.max(zi, w - 0.07), lowC], [w, lowC], [w, yS0], 3 * Q, pts, true);
  idx.sill = pts.length - 1;
  lin([w, yS0], [w, ys - 0.07], 3 * Q, pts, true);
  idx.belt = pts.length - 1;
  const gb = [w * 0.88, ys + 0.045];
  bez([w, ys - 0.07], [w, ys + 0.03], gb, 3 * Q, pts, true);
  idx.gh = pts.length - 1;
  const wr = w * (0.72 - 0.15 * c);
  const yRe = Math.max(ys + 0.052, yTop - 0.07 * c - 0.008);
  bez(gb, [gb[0] + (wr - gb[0]) * 0.3, gb[1] + (yRe - gb[1]) * 0.78], [wr, yRe], 6 * Q, pts, true);
  bez([wr, yRe], [wr * 0.5, yTop], [0, yTop], 5 * Q, pts, true);
  return { pts, idx };
}

export function buildCar(opts = {}) {
  const Q = opts.q || 1; // 1 desktop, smaller on phone
  const rows = Math.round(150 * (Q > 0.8 ? 1 : 0.62));
  const ts = [];
  for (let i = 0; i <= rows; i++) { const u = i / rows; ts.push(-Math.cos(u * Math.PI) * 0.5 * 0 + (Math.sin((u - 0.5) * Math.PI))); }
  const segQ = Q > 0.8 ? 2 : 1;
  // ring = right half reversed (top->bottom, without bottom centre) + left half (bottom->top, without top centre)
  let ringN = 0, idx = null;
  const pos = [], col = [], glassMask = [];
  ts.forEach((t, r) => {
    const P = prof(t);
    const h = halfSection(P, segQ);
    idx = h.idx;
    const right = h.pts.slice().reverse();      // top centre ... bottom centre
    const left = h.pts.slice(1, -1);              // bottom+1 ... top-1
    const ring = [];
    right.forEach(([z, y], i) => ring.push([z, y, i]));
    left.forEach(([z, y], i) => ring.push([-z, y, 1 + i]));
    ringN = ring.length;
    const n = h.pts.length;
    ring.forEach(([z, y], k) => {
      pos.push(P.x, y, z);
      // half-section index of this ring vertex
      const hi = k < n ? n - 1 - k : k - n + 1;
      const trim = 1 - sm(P.yb + 0.17, P.yb + 0.21, y);
      const v = 1 - 0.9 * trim;
      col.push(v, v, v);
      glassMask.push(hi >= h.idx.gh && P.c > 0.05 ? 1 : 0);
    });
  });
  const index = [], gIndex = [];
  for (let r = 0; r < rows; r++) for (let k = 0; k < ringN; k++) {
    const a = r * ringN + k, b = r * ringN + (k + 1) % ringN, c = (r + 1) * ringN + k, d = (r + 1) * ringN + (k + 1) % ringN;
    index.push(a, b, c, b, d, c);
    if (glassMask[a] && glassMask[b] && glassMask[c] && glassMask[d]) gIndex.push(a, b, c, b, d, c);
  }
  const body = new THREE.BufferGeometry();
  body.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  body.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  body.setIndex(index);
  body.computeVertexNormals();
  // glass: same vertices pushed out along the normal
  const gp = pos.slice(), nrm = body.attributes.normal.array;
  for (let i = 0; i < gp.length; i++) gp[i] += nrm[i] * 0.004;
  const glass = new THREE.BufferGeometry();
  glass.setAttribute('position', new THREE.Float32BufferAttribute(gp, 3));
  glass.setIndex(gIndex);
  glass.computeVertexNormals();

  const group = new THREE.Group();
  const paint = new THREE.MeshPhysicalMaterial({ color: 0xffffff, vertexColors: true, metalness: 0.42, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.15 });
  const U = { uOld: { value: new THREE.Color('#0F7C7A') }, uNew: { value: new THREE.Color('#0F7C7A') }, uSweep: { value: -9 }, uEdge: { value: 0 }, uEdgeCol: { value: new THREE.Color('#ffffff') } };
  paint.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vPosO;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvPosO = position;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vPosO;uniform vec3 uOld,uNew,uEdgeCol;uniform float uSweep,uEdge;')
      .replace('vec4 diffuseColor = vec4( diffuse, opacity );', 'float sw = smoothstep(uSweep - 0.09, uSweep + 0.09, vPosO.x);\nvec4 diffuseColor = vec4( diffuse * mix(uOld, uNew, sw), opacity );')
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance += uEdgeCol * (1.0 - abs(sw * 2.0 - 1.0)) * uEdge;');
  };
  paint.customProgramCacheKey = () => 'voltaPaint';
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x061214, metalness: 0.3, roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1.0, emissive: new THREE.Color('#2fd1c4'), emissiveIntensity: 0 });
  const bodyMesh = new THREE.Mesh(body, paint);
  const glassMesh = new THREE.Mesh(glass, glassMat);
  group.add(bodyMesh, glassMesh);

  // light bars: follow the belt line around the nose / tail
  const barPts = (front) => {
    const out = [];
    const n = 26;
    for (let side of [1, -1]) {
      const seq = [];
      for (let i = 0; i <= n; i++) {
        const t = front ? 0.82 + 0.18 * (i / n) : -0.85 - 0.15 * (i / n);
        const P = prof(Math.min(0.9999, Math.max(-0.9999, t)));
        const h = halfSection(P, 1);
        const [z, y] = h.pts[h.idx.belt];
        seq.push(new THREE.Vector3(P.x + (front ? 0.012 : -0.012), y + 0.005, side * (z + 0.008)));
      }
      if (side === 1) out.push(...seq); else out.push(...seq.reverse());
    }
    // the two sides meet at the tip: drop the duplicate
    return out.filter((p, i, a) => i === 0 || p.distanceTo(a[i - 1]) > 1e-4);
  };
  const barMat = (hex) => new THREE.MeshBasicMaterial({ color: new THREE.Color(hex), toneMapped: false });
  const fMat = barMat('#ffffff'), rMat = barMat('#F26B3A');
  const fBar = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(barPts(true)), 90, 0.017, 6, false), fMat);
  const rBar = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(barPts(false)), 90, 0.02, 6, false), rMat);
  group.add(fBar, rBar);

  // wheels
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x1a2224, roughness: 0.82, metalness: 0 });
  const rimMat = new THREE.MeshPhysicalMaterial({ color: 0x9aa6a8, metalness: 0.95, roughness: 0.22, clearcoat: 0.6 });
  const hubMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#F26B3A'), metalness: 0.4, roughness: 0.35 });
  const R = WHEEL.r, tw = 0.25;
  const tp = [];
  const rIn = R * 0.7;
  // tyre cross-section (lathe around Y, later rotated so the axle is Z)
  const rr = 0.05;
  tp.push(new THREE.Vector2(rIn, -tw / 2));
  for (let i = 0; i <= 6; i++) { const a = -Math.PI / 2 + (i / 6) * Math.PI / 2; tp.push(new THREE.Vector2(R - rr + Math.cos(a) * rr, -tw / 2 + rr + Math.sin(a) * rr)); }
  for (let i = 0; i <= 6; i++) { const a = (i / 6) * Math.PI / 2; tp.push(new THREE.Vector2(R - rr + Math.cos(a) * rr, tw / 2 - rr + Math.sin(a) * rr)); }
  tp.push(new THREE.Vector2(rIn, tw / 2));
  const tireGeo = new THREE.LatheGeometry(tp, Q > 0.8 ? 48 : 28);
  tireGeo.rotateX(Math.PI / 2);
  // aero rim: disc with five teardrop cut-outs
  const rimShape = new THREE.Shape(); rimShape.absarc(0, 0, rIn + 0.012, 0, Math.PI * 2, false);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2, h = new THREE.Path();
    const p = (r, da) => [Math.cos(a + da) * r, Math.sin(a + da) * r];
    const s0 = p(0.085, 0), s1 = p(0.2, -0.36), s2 = p(0.215, 0.18);
    h.moveTo(...s0); h.quadraticCurveTo(...p(0.16, -0.42), ...s1); h.quadraticCurveTo(...p(0.24, -0.1), ...s2); h.quadraticCurveTo(...p(0.15, 0.24), ...s0);
    rimShape.holes.push(h);
  }
  const rimGeo = new THREE.ExtrudeGeometry(rimShape, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.008, bevelSegments: 2, curveSegments: Q > 0.8 ? 40 : 20 });
  const hubGeo = new THREE.CylinderGeometry(0.05, 0.055, 0.03, 24); hubGeo.rotateX(Math.PI / 2);
  const discGeo = new THREE.CircleGeometry(rIn + 0.01, 32);
  const discMat = new THREE.MeshStandardMaterial({ color: 0x1d2a2c, roughness: 0.6, metalness: 0.3 });
  const wheels = [];
  for (const sx of [WHEEL.x, -WHEEL.x]) for (const sz of [1, -1]) {
    const P = prof(sx / L);
    const wg = new THREE.Group();
    const spin = new THREE.Group();
    const tire = new THREE.Mesh(tireGeo, tireMat);
    const rim = new THREE.Mesh(rimGeo, rimMat); rim.position.z = sz > 0 ? tw / 2 - 0.05 : -(tw / 2 - 0.05);
    if (sz < 0) rim.rotation.y = Math.PI;
    const hub = new THREE.Mesh(hubGeo, hubMat); hub.position.z = sz * (tw / 2 - 0.0);
    const disc = new THREE.Mesh(discGeo, discMat); disc.position.z = sz * (tw / 2 - 0.09); if (sz < 0) disc.rotation.y = Math.PI;
    spin.add(tire, rim, hub, disc);
    wg.add(spin);
    wg.position.set(sx, WHEEL.y, sz * (P.w - tw / 2 - 0.035));
    group.add(wg);
    wheels.push(spin);
  }
  // anchors for UI hotspots (car-local)
  const pf = prof(0.95), pr = prof(-0.95), pc = prof(-0.1), pw = prof(WHEEL.x / L), pq = prof(-0.72);
  const anchors = {
    light: new THREE.Vector3(L * 0.985, halfSection(pf, 1).pts[halfSection(pf, 1).idx.belt][1], 0.0),
    glass: new THREE.Vector3(pc.x, pc.yTop + 0.02, 0),
    wheel: new THREE.Vector3(WHEEL.x, WHEEL.y, pw.w),
    tail: new THREE.Vector3(-L * 0.99, halfSection(pr, 1).pts[halfSection(pr, 1).idx.belt][1], 0),
    charge: new THREE.Vector3(pq.x, pq.ys - 0.05, pq.w),
    floor: new THREE.Vector3(0, 0.24, pc.w * 0.98)
  };
  return { group, paint, U, glassMat, fMat, rMat, fBar, rBar, wheels, anchors, L, W };
}
