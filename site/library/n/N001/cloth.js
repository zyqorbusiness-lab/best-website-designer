/* N001 Loomhouse Tailors: cloth.js. The hanging cloth, the same on desktop and phone (same mesh density, same maps).
   A 120x160 plane hung from a lacquered rod; the vertex shader drapes it (two fold sets + a gravity curve), sways it
   (about 0.2 Hz) and runs a ripple out from the reveal point; normals are rebuilt per vertex from the same function.
   Two meshes share the geometry: the bottom shows the hanging cloth, the top shows the incoming cloth only inside a
   circle growing in cloth-UV space from the chosen point, with a dashed fern chalk seam on its edge.
   Textures: Poly Haven scans (CC0), loaded through the kit stage so desktop and phone fetch the same files. */
import { THREE, reduced, clamp } from '../../_kit/stage.js';

export const CLOTHS = [
  { key: 'denim', name: 'Indigo Denim', weave: 'Twill', map: 'tex/denim_diff.webp', nor: 'tex/denim_nor.webp', rep: 2.1, ar: 758 / 768, color: '#ffffff', rough: 0.88, sheen: 0.4, sheenColor: '#c9d6f0', nScale: 1.5 },
  { key: 'glen', name: 'Glen Check Wool', weave: 'Woven check', map: 'tex/glen_diff.webp', nor: 'tex/glen_nor.webp', rep: 1.5, ar: 793 / 640, color: '#ffffff', rough: 0.92, sheen: 0.6, sheenColor: '#f3e6e0', nScale: 1.3 },
  { key: 'satin', name: 'Blush Crepe Satin', weave: 'Crepe back satin', nor: 'tex/satin_nor.webp', rep: 2.4, ar: 1042 / 1024, color: '#F2D3D8', rough: 0.3, sheen: 1, sheenColor: '#fff4f5', sheenRough: 0.35, aniso: 0.75, nScale: 0.6 },
  { key: 'jacq', name: 'Fern Jacquard', weave: 'Quatrefoil jacquard', patt: 'tex/jacq_rough.webp', nor: 'tex/jacq_nor.webp', rep: 1.6, ar: 648 / 640, color: '#4FA571', rough: 0.55, sheen: 0.8, sheenColor: '#dff3e6', nScale: 1.3 }
];
export const W = 1.3, H = 1.84;
const TOP = H / 2;

export async function makeCloth(stage, first = 0) {
  const geo = new THREE.PlaneGeometry(W, H, 120, 160);
  const U = {
    uTime: { value: 0 }, uSize: { value: new THREE.Vector2(W, H) },
    uRipO: { value: new THREE.Vector2(0.5, 0.6) }, uRipT: { value: 9 }, uRipA: { value: 0 },
    uRevO: { value: new THREE.Vector2(0.5, 0.7) }, uRevR: { value: 0 }, uSeamA: { value: 0 }, uChalk: { value: new THREE.Color('#3B8C5F') }
  };
  const VERT_HEAD = /* glsl */`
    uniform float uTime; uniform vec2 uSize; uniform vec2 uRipO; uniform float uRipT; uniform float uRipA;
    varying vec2 vCloth;
    float clothZ(vec2 q){
      float hang = pow(clamp(1.0 - q.y, 0.0, 1.0), 0.75);
      float x = q.x + (1.0 - q.y)*0.06*sin(q.x*3.0);
      float folds = sin(x*12.5 + 0.4)*0.05 + sin(x*5.2 - 1.1)*0.10 + sin(x*23.0 + q.y*2.3)*0.012;
      folds *= 0.3 + 0.9*hang;
      folds += sin(q.x*62.8)*0.006*smoothstep(0.86, 1.0, q.y);
      float bow = hang*hang*0.05;
      float sway = (sin(uTime*1.26 + q.y*2.4)*0.016 + sin(uTime*0.47 + q.x*3.1)*0.008) * hang;
      vec2 d = (q - uRipO)*uSize; float r = length(d);
      float front = uRipT*1.15;
      float rip = sin((r - front)*11.0) * exp(-abs(r - front)*4.0) * exp(-uRipT*1.25) * uRipA * (0.25 + 0.75*hang);
      return folds + bow + sway + rip*0.07;
    }
`;
  const FRAG_HEAD = /* glsl */`
    uniform vec2 uSize; uniform vec2 uRevO; uniform float uRevR; uniform float uRevOn; uniform float uSeamA; uniform vec3 uChalk;
    varying vec2 vCloth;
`;
  function clothMaterial(c, tex) {
    const m = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(c.color), roughness: c.rough, metalness: 0, side: THREE.DoubleSide,
      sheen: c.sheen, sheenColor: new THREE.Color(c.sheenColor), sheenRoughness: c.sheenRough ?? 0.6,
      normalMap: tex.nor, normalScale: new THREE.Vector2(c.nScale, c.nScale)
    });
    if (tex.map) m.map = tex.map;
    if (tex.patt) { m.map = tex.patt; m.roughnessMap = tex.patt; }
    if (c.aniso) { m.anisotropy = c.aniso; m.anisotropyRotation = Math.PI / 2; }
    m.depthFunc = THREE.LessEqualDepth;
    const own = { uRevOn: { value: 0 } };
    m.userData.own = own;
    m.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, U, own);
      sh.vertexShader = VERT_HEAD + sh.vertexShader
        .replace('#include <beginnormal_vertex>', `
          vCloth = uv;
          float e = 0.0035;
          float z0 = clothZ(uv);
          vec3 tx = vec3(e*uSize.x, 0.0, clothZ(uv + vec2(e, 0.0)) - z0);
          vec3 ty = vec3(0.0, e*uSize.y, clothZ(uv + vec2(0.0, e)) - z0);
          vec3 objectNormal = normalize(cross(tx, ty));
          #ifdef USE_TANGENT
            vec3 objectTangent = vec3( tangent.xyz );
          #endif`)
        .replace('#include <begin_vertex>', 'vec3 transformed = vec3(position.xy, position.z + z0);');
      sh.fragmentShader = FRAG_HEAD + sh.fragmentShader
        .replace('void main() {', `void main() {
          vec2 dd = (vCloth - uRevO)*uSize; float dist = length(dd);
          if (uRevOn > 0.5 && dist > uRevR) discard;`)
        .replace('#include <opaque_fragment>', `#include <opaque_fragment>
          if (uRevOn > 0.5) {
            float edge = 1.0 - smoothstep(0.004, 0.012, uRevR - dist);
            float ang = atan(dd.y, dd.x);
            float dash = step(0.42, fract(ang*dist*26.0/6.2831));
            gl_FragColor.rgb = mix(gl_FragColor.rgb, uChalk, edge*dash*uSeamA*0.95);
          }`);
    };
    m.customProgramCacheKey = () => 'loom-cloth';
    return m;
  }
  const texOf = async (c) => {
    const L = (url, srgb) => stage.loadTexture(url, { srgb, repeat: [c.rep, c.rep * (H / W) / c.ar], anisotropy: 8 });
    const [map, nor, patt] = await Promise.all([c.map ? L(c.map, true) : null, L(c.nor, false), c.patt ? L(c.patt, true) : null]);
    return { map, nor, patt };
  };
  const mats = new Array(CLOTHS.length).fill(null);
  const ensure = (i) => mats[i] ? Promise.resolve(mats[i]) : (mats[i] = texOf(CLOTHS[i]).then((t) => (mats[i] = clothMaterial(CLOTHS[i], t))));

  const group = new THREE.Group(); stage.add(group);
  const firstMat = await ensure(first);
  const base = new THREE.Mesh(geo, firstMat), top = new THREE.Mesh(geo, firstMat);
  top.visible = false; top.renderOrder = 2; base.renderOrder = 1;
  group.add(base, top);

  /* the rod: lacquered moss bar with fern end caps on a fern hook (palette only) */
  const lac = new THREE.MeshPhysicalMaterial({ color: '#293E20', roughness: 0.32, metalness: 0.15, clearcoat: 1, clearcoatRoughness: 0.12 });
  const fernM = new THREE.MeshPhysicalMaterial({ color: '#3B8C5F', roughness: 0.22, metalness: 0.55, clearcoat: 0.6 });
  const barGeo = new THREE.CapsuleGeometry(0.032, W + 0.12, 8, 24); barGeo.rotateZ(Math.PI / 2);
  [-1, 1].forEach((s) => { const b = new THREE.Mesh(barGeo, lac); b.position.set(0, TOP - 0.01, s * 0.04); b.scale.set(1, 1.15, 0.8); group.add(b); });
  [-1, 1].forEach((s) => { const k = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.14, 20), fernM); k.rotation.x = Math.PI / 2; k.position.set(s * (W / 2 + 0.02), TOP - 0.01, 0); group.add(k); });
  const hook = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.011, 12, 48, Math.PI * 1.35), fernM);
  hook.position.set(0, TOP + 0.2, 0); hook.rotation.z = -Math.PI * 0.18; group.add(hook);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.12, 12), fernM); stem.position.set(0, TOP + 0.06, 0); group.add(stem);
  group.rotation.y = 0.3;

  const key = new THREE.DirectionalLight('#fff6ee', 2.4); key.position.set(-4.0, 1.6, 1.4); stage.scene.add(key);
  const rim = new THREE.DirectionalLight('#ffe9ee', 0.9); rim.position.set(2.8, 1.0, -1.2); stage.scene.add(rim);

  let cur = first, rev = null, ripT = 9;
  const ripple = (uv, a = 1) => { if (reduced) return; U.uRipO.value.set(uv[0], uv[1]); ripT = 0; U.uRipA.value = a; stage.invalidate(); };
  const settle = (i) => { const m = mats[i]; m.userData.own.uRevOn.value = 0; base.material = m; top.visible = false; U.uSeamA.value = 0; rev = null; stage.invalidate(); };
  async function reveal(i, uv = [0.5, 0.6], dur = 0.9) {
    cur = i;
    const m = await ensure(i);
    if (i !== cur) return;
    if (rev) { const prev = mats[rev.i]; if (prev && prev !== m && prev.userData) { prev.userData.own.uRevOn.value = 0; base.material = prev; } }
    if (base.material === m) { top.visible = false; rev = null; return; }
    U.uRevO.value.set(uv[0], uv[1]);
    if (reduced) { settle(i); return; }
    const far = Math.max(...[[0, 0], [1, 0], [0, 1], [1, 1]].map(([a, b]) => Math.hypot((a - uv[0]) * W, (b - uv[1]) * H)));
    m.userData.own.uRevOn.value = 1; top.material = m; top.visible = true;
    U.uRevR.value = 0; U.uSeamA.value = 1;
    rev = { i, t: 0, dur: window.__revDur || dur, far };
    ripple(uv, 1);
  }
  const idle = window.requestIdleCallback || ((f) => setTimeout(f, 1200));
  idle(() => CLOTHS.forEach((_, i) => ensure(i)), { timeout: 2500 });
  const expo = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
  function tick(dt, t) {
    U.uTime.value = reduced ? 0 : t;
    let busy = !reduced;
    if (ripT < 6) { ripT += dt; U.uRipT.value = ripT; busy = true; } else U.uRipA.value = 0;
    if (rev) {
      rev.t += dt; const p = clamp(rev.t / rev.dur);
      U.uRevR.value = expo(p) * (rev.far + 0.05);
      U.uSeamA.value = 1 - clamp((p - 0.75) / 0.25);
      if (p >= 1) settle(rev.i);
      busy = true;
    }
    return busy;
  }
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  function hitUV(e) { const r = stage.el.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, stage.camera); const h = ray.intersectObject(base, false)[0]; return h && h.uv ? [h.uv.x, h.uv.y] : null; }
  return { group, base, reveal, ripple, tick, hitUV, ensure, get current() { return cur; } };
}
