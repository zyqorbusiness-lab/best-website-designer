/* Verdant - the live 3D plant, shared by the desktop build (app.js) and the phone build (m.js): same GLB, same textures, same HDRI, same shaders.
   Photoscanned Syngonium in a terracotta pot (Poly Haven "Potted Plant 02", Rico Cilliers, CC0) at 2K from the 4K scan,
   plus a top dressing of river pebbles and bark mulch on the scanned soil (bark: Poly Haven "Bark Brown 02", Rob Tuytel, CC0). */
import { THREE, loadGLB, studioEnv, fitObject, whenVisible, reduced } from '../_kit/kit.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { useHDRI } from '../../assets/hdri/hdri.js';

const ptr = { x: 0, y: 0 };
addEventListener('pointermove', (e) => { ptr.x = e.clientX / innerWidth * 2 - 1; ptr.y = e.clientY / innerHeight * 2 - 1; }, { passive: true });
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const eio = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const eoe = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
const eob = (t) => { const c1 = 1.7, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const ASSETS = '../../assets/lab/verdant/';

/* Top dressing: river pebbles (displaced icospheres, each its own stone colour) and bark chips (rounded slabs with a real
   CC0 bark scan: colour, normal, AO/roughness), dropped onto the scanned soil by raycasting, partly sunk in, tilted to the soil. */
function mulch(obj, pivot, onTex) {
  let dirt = null; obj.traverse((o) => { if (o.isMesh && /dirt/i.test(o.name + ' ' + (o.parent ? o.parent.name : ''))) dirt = o; });
  if (!dirt) return;
  pivot.updateMatrixWorld(true);
  const bb = new THREE.Box3().setFromObject(dirt), c = bb.getCenter(new THREE.Vector3()), s = bb.getSize(new THREE.Vector3());
  const rad = Math.min(s.x, s.z) * 0.5, unit = rad;
  let sd = 11; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  const ray = new THREE.Raycaster(), down = new THREE.Vector3(0, -1, 0), nm = new THREE.Matrix3();
  const drop = () => { for (let k = 0; k < 8; k++) { const a = rnd() * 6.2832, rr = rad * Math.sqrt(rnd()) * 0.9;
      ray.set(new THREE.Vector3(c.x + Math.cos(a) * rr, bb.max.y + 1, c.z + Math.sin(a) * rr), down);
      const h = ray.intersectObject(dirt, false)[0];
      if (h && h.face) { nm.getNormalMatrix(dirt.matrixWorld); const n = h.face.normal.clone().applyMatrix3(nm).normalize(); if (n.y < 0) n.negate(); return { p: h.point, n }; } }
    return null; };
  const up = new THREE.Vector3(0, 1, 0), q = new THREE.Quaternion(), q2 = new THREE.Quaternion(), e = new THREE.Euler(), m4 = new THREE.Matrix4(), sc = new THREE.Vector3(), pos = new THREE.Vector3();
  const place = (inst, i, hit, sx, sy, sz, sink, tilt) => {
    q.setFromUnitVectors(up, hit.n.clone().lerp(up, 0.35).normalize());
    e.set((rnd() - 0.5) * tilt, rnd() * 6.2832, (rnd() - 0.5) * tilt); q2.setFromEuler(e); q.multiply(q2);
    pos.copy(hit.p).addScaledVector(hit.n, sy * sink); pivot.worldToLocal(pos);
    sc.set(sx, sy, sz); m4.compose(pos, q, sc); inst.setMatrixAt(i, m4);
  };
  // pebbles: lumpy, flattened, a mix of slate, sandstone and quartz greys
  const pg = new THREE.IcosahedronGeometry(1, 4), pp = pg.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < pp.count; i++) { v.fromBufferAttribute(pp, i);
    const d = 1 + 0.07 * Math.sin(v.x * 5.1 + v.y * 2.3) + 0.05 * Math.sin(v.z * 7.7 - v.x * 3.1) + 0.025 * Math.sin(v.y * 13.0 + v.z * 9.0);
    v.multiplyScalar(d); pp.setXYZ(i, v.x, v.y, v.z); }
  pg.computeVertexNormals();
  const NP = 90, pm = new THREE.MeshPhysicalMaterial({ roughness: 0.62, metalness: 0, clearcoat: 0.12, clearcoatRoughness: 0.55, envMapIntensity: 0.9 });
  const peb = new THREE.InstancedMesh(pg, pm, NP), col = new THREE.Color();
  const tones = ['#7d786f', '#8f8473', '#5f5c57', '#9a8d7a', '#4f4c48', '#86796a', '#a69c8c', '#6d655b'];
  let n = 0;
  for (let i = 0; i < NP; i++) { const h = drop(); if (!h) continue; const r0 = unit * (0.024 + rnd() * 0.03);
    place(peb, n, h, r0 * (1 + rnd() * 0.5), r0 * (0.45 + rnd() * 0.2), r0 * (0.9 + rnd() * 0.4), 0.15, 0.5);
    col.set(tones[(rnd() * tones.length) | 0]).multiplyScalar(0.85 + rnd() * 0.25); peb.setColorAt(n, col); n++; }
  peb.count = n; pivot.add(peb);
  // bark chips: real bark scan on rounded slabs
  const tl = new THREE.TextureLoader(), tx = (f, srgb) => { const t = tl.load(ASSETS + f, onTex); t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; return t; };
  const arm = tx('bark-arm.webp', false);
  const bm = new THREE.MeshStandardMaterial({ map: tx('bark-diff.webp', true), normalMap: tx('bark-nor.webp', false), roughnessMap: arm, aoMap: arm, roughness: 1, metalness: 0, color: new THREE.Color('#f2dcc4') });
  bm.normalScale.set(1.4, 1.4);
  const bg = new RoundedBoxGeometry(1, 0.32, 0.62, 3, 0.12); bg.setAttribute('uv1', bg.attributes.uv);
  const NB = 26, bark = new THREE.InstancedMesh(bg, bm, NB); n = 0;
  for (let i = 0; i < NB; i++) { const h = drop(); if (!h) continue; const L0 = unit * (0.06 + rnd() * 0.06);
    place(bark, n, h, L0, L0 * (0.1 + rnd() * 0.05), L0 * (0.32 + rnd() * 0.18), 0.1, 0.55);
    col.setHSL(0.075 + rnd() * 0.03, 0.3 + rnd() * 0.15, 0.72 + rnd() * 0.25); bark.setColorAt(n, col); n++; }
  bark.count = n; pivot.add(bark);
}

/* soft round glow sprite for the fireflies */
function glowTex() {
  const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,248,220,1)'); g.addColorStop(0.18, 'rgba(255,220,140,.95)'); g.addColorStop(0.45, 'rgba(255,170,80,.28)'); g.addColorStop(1, 'rgba(255,150,60,0)');
  x.fillStyle = g; x.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export async function startPlant({ cv, arch, M, onShown }) {
  // own renderer (not the kit's phone profile): antialias on and DPR capped at 2 on BOTH builds, so the phone renders exactly like desktop
  const r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, powerPreference: 'high-performance' });
  r.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.0;
  let kickDraw = () => {};
  const sc = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(26, 1, 0.1, 50);
  sc.environment = studioEnv(r); sc.environmentIntensity = 0.55;
  // shared Poly Haven studio HDRI swaps in after first paint
  useHDRI(r, sc, { size: 512, rotation: 2.2, onReady: () => kickDraw() }); // same HDRI on phone and desktop
  const sun = new THREE.DirectionalLight('#ffe0c0', 2.2); sun.position.set(3, 5, -4); sc.add(sun);
  const key = new THREE.DirectionalLight('#fff6ea', 1.25); key.position.set(-3, 3, 5); sc.add(key);
  const hemi = new THREE.HemisphereLight('#eef3e2', '#3d4a33', 0.32); sc.add(hemi);
  // photoscanned Syngonium in a terracotta pot (Poly Haven "Potted Plant 02", CC0), 2K webp textures (from the 4K scan: colour+alpha, normal, AO/rough) + meshopt; the same file on phone and desktop
  const gltf = await loadGLB('../../assets/lab/verdant/verdant-plant-d.glb');
  const obj = gltf.scene; fitObject(obj, 2.5, true);
  const pivot = new THREE.Group(); pivot.add(obj); pivot.position.y = -1.32; sc.add(pivot);

  /* leaves: unfurl (grow out from the stem) + fold up at dusk, in the vertex shader;
     thin-leaf translucency (light through the blade when the sun is behind it) in the fragment shader */
  const U = { uGrow: { value: reduced ? 1 : 0 }, uFold: { value: 0 }, uBox: { value: new THREE.Vector4(0, 0, 0, 1) },
    uSunV: { value: new THREE.Vector3(0, 1, 0) }, uSunC: { value: new THREE.Color('#ffe0c0') }, uTrans: { value: 0.9 } };
  const phys = (m, extra) => {
    const p = new THREE.MeshPhysicalMaterial({
      name: m.name, map: m.map, normalMap: m.normalMap, roughnessMap: m.roughnessMap, metalness: 0, roughness: 1, aoMap: m.aoMap || null, aoMapIntensity: 1,
      alphaTest: m.alphaTest || 0, transparent: false, side: THREE.DoubleSide, ...extra,
    });
    if (m.normalMap) p.normalScale.copy(m.normalScale || new THREE.Vector2(1, 1));
    return p;
  };
  obj.traverse((o) => {
    if (!o.isMesh || !o.material) return;
    const src = o.material;
    if (src.name === 'pot') {
      // fired terracotta: real scanned colour/normal/roughness, plus a thin sealed-glaze clearcoat that catches the softbox
      o.material = phys(src, { clearcoat: 0.08, clearcoatRoughness: 0.7, sheen: 0.3, sheenRoughness: 0.8, sheenColor: new THREE.Color('#f3c7a6'), envMapIntensity: 1.0, color: new THREE.Color('#f2e6dc') });
      o.material.normalScale.multiplyScalar(1.6);
      return;
    }
    if (src.name !== 'leaves') return;
    o.geometry.computeBoundingBox(); const bb = o.geometry.boundingBox;
    U.uBox.value.set((bb.min.x + bb.max.x) / 2, (bb.min.z + bb.max.z) / 2, bb.min.y, Math.max(1e-4, bb.max.y - bb.min.y));
    const m = phys(src, { sheen: 0.55, sheenRoughness: 0.45, sheenColor: new THREE.Color('#d9f2b8'), specularIntensity: 0.65, envMapIntensity: 1.1, color: new THREE.Color('#e9f5df'), alphaToCoverage: true });
    m.normalScale.multiplyScalar(1.25);
    m.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, U);
      sh.vertexShader = 'uniform float uGrow;uniform float uFold;uniform vec4 uBox;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
        { float hN=clamp((transformed.y-uBox.z)/uBox.w,0.,1.);
          vec2 rel=transformed.xz-uBox.xy; float d=clamp(length(rel)/(uBox.w*.75),0.,1.);
          float g=clamp(uGrow*1.7-hN*.45-d*.45,0.,1.); g=g*g*(3.-2.*g);
          rel*=mix(.03,1.,g); float y=uBox.z+(transformed.y-uBox.z)*mix(.2,1.,g);
          y+=uFold*d*d*uBox.w*.12; rel*=1.-uFold*.12*d;
          transformed.xz=uBox.xy+rel; transformed.y=y; }`);
      sh.fragmentShader = 'uniform vec3 uSunV;uniform vec3 uSunC;uniform float uTrans;\n' + sh.fragmentShader.replace('#include <opaque_fragment>', `
        { vec3 V=normalize(vViewPosition); vec3 L=normalize(uSunV);
          float back=max(dot(-normal,L),0.);                 // sun hitting the far side of the blade
          float through=pow(max(dot(-V,L),0.),4.);            // looking toward the sun through the leaf
          vec3 leaf=diffuseColor.rgb*vec3(1.05,1.25,.55);     // light comes out yellow-green
          outgoingLight+=leaf*uSunC*(back*.55+through*1.1)*uTrans; }
        #include <opaque_fragment>`);
    };
    m.customProgramCacheKey = () => 'verdant-leaves-v3';
    o.material = m;
  });

  mulch(obj, pivot, () => kickDraw());

  // contact shadow: a tight dark core under the pot + a wide soft falloff (two blurred radial planes, no shadow map)
  const radial = (stops) => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
    const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); stops.forEach(([o, s]) => g.addColorStop(o, s)); x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const shMat = new THREE.MeshBasicMaterial({ map: radial([[0, 'rgba(22,40,26,.55)'], [0.55, 'rgba(22,40,26,.18)'], [1, 'rgba(22,40,26,0)']]), transparent: true, depthWrite: false });
  const sh = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 2.3), shMat);
  sh.rotation.x = -Math.PI / 2; sh.position.y = -1.315; sc.add(sh);
  const coreMat = new THREE.MeshBasicMaterial({ map: radial([[0, 'rgba(14,26,17,.8)'], [0.6, 'rgba(14,26,17,.35)'], [1, 'rgba(14,26,17,0)']]), transparent: true, depthWrite: false });
  const core = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 1.05), coreMat);
  core.rotation.x = -Math.PI / 2; core.position.y = -1.312; sc.add(core);

  /* fireflies: glowing sprites; three of them carry real point lights that glint on the leaves */
  const BAKE = /[?&]bake=1/.test(location.search); // poster bake for the phone build: no fireflies (the phone has its own)
  const NF = BAKE ? 0 : 16, flies = [], tex = glowTex(); let sd = 5; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < NF; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
    const f = { s, a: rnd() * 6.28, r: 0.55 + rnd() * 0.75, y: -0.75 + rnd() * 1.75, sp: (0.18 + rnd() * 0.3) * (rnd() > 0.5 ? 1 : -1), bob: rnd() * 6.28, bl: 1.6 + rnd() * 2.4, sz: 0.07 + rnd() * 0.07 };
    if (i < 3) { f.l = new THREE.PointLight('#ffcf7a', 0, 1.5, 2); sc.add(f.l); }
    sc.add(s); flies.push(f);
  }

  // shot params for close-up QA (?zoom=3&zy=-.8&cy=1.2): narrower lens, aim lower, camera higher; default = hero framing
  const qp = new URLSearchParams(location.search), zoom = +qp.get('zoom') || 1, zy = +qp.get('zy') || 0, cy = +qp.get('cy') || 0;
  cam.fov = 26 / zoom; cam.position.set(0, 0.3 + cy, 7.4); cam.lookAt(0, -0.05 + zy, 0);
  const size = () => { const w = arch.clientWidth, h = arch.clientHeight; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
  size(); new ResizeObserver(size).observe(arch);

  /* light states (all inside the Verdant palette family) */
  const C = (h) => new THREE.Color(h);
  const DAY = { sun: C('#ffe2c4'), key: C('#fff6ea'), hs: C('#eef3e2'), hg: C('#3d4a33') };
  const DUSK = { sun: C('#ff9152'), key: C('#c9dccd'), hs: C('#3a5a44'), hg: C('#1a2c20') };
  const GOLD = C('#ffbf6e'), tmp = new THREE.Color();
  const sunV = new THREE.Vector3();
  const applyLight = (n, swing) => {
    // n: 0 day .. 1 dusk; swing: 0..1 progress through the transition (for the gold peak)
    const gold = Math.sin(Math.PI * clamp(swing)) * (M.target ? 1 : 0.5);
    tmp.copy(DAY.sun).lerp(DUSK.sun, n).lerp(GOLD, gold * 0.7); sun.color.copy(tmp);
    sun.intensity = lerp(2.2, 3.0, n) + gold * 2.0;
    // the sun swings from high right to low left, behind the plant (a rim light at dusk)
    const a = lerp(0, 1, n);
    sun.position.set(lerp(3, -2.6, a), lerp(5, 0.7, eio(a)) + Math.sin(a * Math.PI) * 1.2, lerp(-4, -3.4, a));
    key.color.copy(DAY.key).lerp(DUSK.key, n); key.intensity = lerp(1.25, 0.28, n);
    hemi.color.copy(DAY.hs).lerp(DUSK.hs, n); hemi.groundColor.copy(DAY.hg).lerp(DUSK.hg, n); hemi.intensity = lerp(0.32, 0.4, n);
    sc.environmentIntensity = lerp(0.62, 0.16, n);
    r.toneMappingExposure = lerp(1.0, 0.96, n) + gold * 0.06;
    shMat.opacity = lerp(1, 0.6, n); coreMat.opacity = lerp(1, 0.75, n);
    // leaf translucency follows the sun (direction in view space), stronger when it sits low behind the plant
    sunV.copy(sun.position).normalize().transformDirection(cam.matrixWorldInverse); U.uSunV.value.copy(sunV);
    U.uSunC.value.copy(sun.color).multiplyScalar(sun.intensity * 0.28); U.uTrans.value = lerp(0.55, 0.8, n) + gold * 0.35;
  };
  applyLight(0, 0);

  let vis = true, raf = 0, last = performance.now(), ry = reduced ? 0.6 : -1.6, rx = 0, ryp = 0, shown = false, T = 0;
  let turn = 0, turnFrom = 0, lean = 0;
  // intro: the leaves unfurl as the arch opens (skipped if the model arrived late)
  const t0 = performance.now(), late = performance.now() - (window.__vReady || t0) > 2600;
  if (late) U.uGrow.value = 1;
  const introStart = performance.now() + (late ? 0 : 350);
  const draw = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now; T += dt;
    // intro
    if (!reduced) {
      if (!late && now < introStart + 2600) { const k = clamp((now - introStart) / 2600); U.uGrow.value = eoe(k); ry = lerp(-1.6, 0.6, eoe(k)); }
      else { U.uGrow.value = 1; ry += dt * 0.22; }
    }
    // mode transition
    let swing = 1;
    if (reduced) { M.n = M.target; } else {
      swing = clamp((now - M.t0) / M.dur);
      M.n = lerp(M.from, M.target, eio(swing));
    }
    applyLight(M.n, swing < 1 ? swing : 1);
    U.uFold.value = reduced ? M.n : clamp((M.n - 0.25) / 0.75);
    // heliotropism: the plant turns after the light (a little overshoot), and leans toward it
    const tTarget = M.target ? -0.85 : 0;
    if (!reduced && swing < 1) { turn = lerp(turnFrom, tTarget, eob(clamp((swing - 0.08) / 0.8))); } else { turn = tTarget; turnFrom = turn; }
    if (swing >= 1) turnFrom = turn;
    lean += ((M.target ? 0.07 : 0) - lean) * (reduced ? 1 : 0.04);
    rx += ((reduced ? 0 : ptr.y * 0.06) - rx) * 0.06; ryp += ((reduced ? 0 : ptr.x * 0.35) - ryp) * 0.06;
    pivot.rotation.set(rx, ry + ryp + turn, lean);
    // fireflies
    const fo = clamp((M.n - 0.45) / 0.55);
    flies.forEach((f, i) => {
      const a = f.a + (reduced ? 0 : T * f.sp);
      const y = f.y + (reduced ? 0 : Math.sin(T * 0.9 + f.bob) * 0.18);
      const blink = reduced ? 0.8 : 0.35 + 0.65 * Math.pow(0.5 + 0.5 * Math.sin(T * (6.28 / f.bl) + f.bob * 3), 3);
      f.s.position.set(Math.cos(a) * f.r, y, Math.sin(a) * f.r * 0.8 + 0.2);
      f.s.scale.setScalar(f.sz * (0.7 + 0.5 * blink));
      f.s.material.opacity = fo * blink; f.s.visible = fo > 0.001;
      if (f.l) { f.l.position.copy(f.s.position); f.l.intensity = fo * blink * 0.9; }
    });
    r.render(sc, cam);
    if (!shown) { shown = true; onShown && onShown(); }
    const animating = !reduced || swing < 1;
    if (vis && animating && !reduced) raf = requestAnimationFrame(draw);
  };
  const go = () => { cancelAnimationFrame(raf); last = performance.now(); raf = requestAnimationFrame(draw); };
  M.kick = () => { if (reduced) go(); };
  kickDraw = () => { if (reduced || !vis) go(); };
  whenVisible(cv, (v) => { vis = v; cancelAnimationFrame(raf); if (v) go(); });
  go();
  window.__plantReady = true;
}
