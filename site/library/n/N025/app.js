/* N025 Bathtime Duck - shared app for index.html (desktop) and m.html (phone).
   Signature: the real rubber duck (Poly Haven "Rubber Duck Toy" by Plat251, CC0) floats on a bath-water surface. Tap or
   click the water: a ring ripple starts exactly there, and when its front reaches the duck the duck heels over and drifts
   away from it, then a soft spring brings it back to the middle. Hand-made details: (1) the readout is the simulation's
   own state (heel angle from the water slope under the duck, drift in cm at the duck's real 9 cm scale), (2) the duck
   rides the same wave formula the shader draws, so it never floats above or sinks through a crest, (3) the water is a full-bleed
   bath-blue tub (#7EC8E3 to #BDE6F2) with foam on the crests and a soft contact shadow under the duck (Oct 31 refresh). Code-made: only the water surface (a prop).
   Same model, water mesh (160 x 160 segments), shader and HDRI on phone and desktop. */
import { createStage, THREE, isM, reduced, clamp } from '../../_kit/stage.js';
import { reveals, press } from '../../_kit/fx/index.js';
import { landing } from '../../_kit/landing.js';
landing(); reveals(); press('[data-press]');
const $ = (s) => document.querySelector(s);
const css = getComputedStyle(document.documentElement);
const C = { c1: css.getPropertyValue('--c1').trim(), c2: css.getPropertyValue('--c2').trim(), c3: css.getPropertyValue('--c3').trim() };
const stageEl = $('[data-stage]');
const stage = await createStage({
  el: stageEl, exposure: 1.0, envIntensity: 1.0,
  camera: { fov: 30, position: isM ? [0, 4.4, 4.9] : [0, 3.9, 4.0], target: [0, 0.18, 0] },
  label: 'Bathtime Duck: a yellow rubber duck floating on bath water. Tap the water to make a ripple.', fitFov: true
});

const RIP = 4, SPEED = 1.15, K = 9.0, W = SPEED * K;                  // ripple ring: speed (units/s), wavenumber
const rip = Array.from({ length: RIP }, () => new THREE.Vector4(0, 0, -99, 0));   // x, z, start time, strength
let ri = 0, now = 0, made = 0;
const ambient = reduced ? 0 : 1;
/* the same height formula in JS and GLSL */
function heightAt(x, z, t) {
  let h = ambient * (0.010 * Math.sin(x * 2.1 + t * 0.9) + 0.008 * Math.sin(z * 2.7 - t * 1.1) + 0.005 * Math.sin((x + z) * 4.3 + t * 1.7));
  for (const r of rip) { const age = t - r.z; if (age < 0 || age > 5) continue; const d = Math.hypot(x - r.x, z - r.y); const front = SPEED * age;
    const env = Math.exp(-Math.pow((d - front) * 2.4, 2)) * Math.exp(-age * 0.9) * r.w / (1 + d * 1.4); h += 0.12 * env * Math.sin(K * d - W * age); }
  return h;
}
const GLSL = `
uniform float uT; uniform vec4 uR[${RIP}]; uniform float uA;
float hAt(vec2 p){
  float h = uA*(0.010*sin(p.x*2.1+uT*0.9)+0.008*sin(p.y*2.7-uT*1.1)+0.005*sin((p.x+p.y)*4.3+uT*1.7));
  for(int i=0;i<${RIP};i++){ vec4 r=uR[i]; float age=uT-r.z; if(age<0.0||age>5.0) continue; float d=distance(p,r.xy); float fr=${SPEED.toFixed(3)}*age;
    float env=exp(-pow((d-fr)*2.4,2.0))*exp(-age*0.9)*r.w/(1.0+d*1.4); h+=0.12*env*sin(${K.toFixed(3)}*d-${W.toFixed(3)}*age); }
  return h; }`;

if (!stage.failed) {
  /* water (prop, code-made): a dense plane displaced in the vertex shader, normals from the same function */
  const geo = new THREE.PlaneGeometry(9, 9, 160, 160).rotateX(-Math.PI / 2);
  const water = new THREE.MeshPhysicalMaterial({ color: new THREE.Color('#6CC0E0'), emissive: new THREE.Color('#7EC8E3'), emissiveIntensity: 0.55, roughness: 0.12, metalness: 0, ior: 1.333, specularIntensity: 0.35, clearcoat: 0, transparent: true, envMapIntensity: 0.12 });
  const U = { uT: { value: 0 }, uR: { value: rip }, uA: { value: ambient }, uD: { value: new THREE.Vector2(0, 0) }, uEdge: { value: new THREE.Color('#BDE6F2') }, uFoam: { value: new THREE.Color('#FFFFFF') } };
  water.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = GLSL + '\nvarying vec2 vXZ; varying float vH;\n' + sh.vertexShader
      .replace('#include <beginnormal_vertex>', `vec2 p0=position.xz; float e=0.02; float hc=hAt(p0); vec3 objectNormal=normalize(vec3(-(hAt(p0+vec2(e,0.0))-hc)/e,1.0,-(hAt(p0+vec2(0.0,e))-hc)/e));
#ifdef USE_TANGENT
vec3 objectTangent = vec3( tangent.xyz );
#endif`)
      .replace('#include <begin_vertex>', 'vec3 transformed = position; transformed.y += hc; vXZ = position.xz; vH = hc;');
    sh.fragmentShader = 'uniform vec2 uD; uniform vec3 uEdge; uniform vec3 uFoam;\nvarying vec2 vXZ; varying float vH;\n' + sh.fragmentShader.replace('#include <alphatest_fragment>', 'float rr = length(vXZ); diffuseColor.rgb = mix(diffuseColor.rgb, uEdge, smoothstep(0.9, 3.2, rr));\nfloat foam = smoothstep(0.022, 0.06, vH); diffuseColor.rgb = mix(diffuseColor.rgb, uFoam, foam * 0.85);\nfloat shd = 1.0 - 0.42 * exp(-pow(distance(vXZ, uD) * 2.3, 2.0));\n diffuseColor.rgb *= shd;\ndiffuseColor.a *= 1.0 - smoothstep(3.4, 4.4, rr);\n#include <alphatest_fragment>').replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n totalEmissiveRadiance = mix(totalEmissiveRadiance, uEdge * 0.62, smoothstep(0.9, 3.2, rr)) * shd + uFoam * foam * 0.25;');
  };
  const sea = new THREE.Mesh(geo, water); sea.renderOrder = 0; stage.add(sea);

  const g = await stage.load(stage.asset('models/rubber_duck_toy.glb'));
  const duck = g.scene; stage.fit(duck, 1.15, true);
  const holder = new THREE.Group(); holder.add(duck); duck.position.y -= 0.16; stage.add(holder);
  duck.rotation.y = -0.6;
  const key = new THREE.DirectionalLight(0xfff0d8, 1.6); key.position.set(-2, 4, -3); stage.scene.add(key);

  const st = { x: 0, z: 0, vx: 0, vz: 0, pending: [] };
  const live = $('#live'), roT = $('#ro-tilt'), roD = $('#ro-drift'), roR = $('#ro-rip');
  function ripple(x, z, w = 1) {
    rip[ri] = new THREE.Vector4(x, z, now, w); ri = (ri + 1) % RIP; made++; roR.textContent = made;
    const d = Math.hypot(st.x - x, st.z - z), dirx = (st.x - x) / (d || 1), dirz = (st.z - z) / (d || 1);
    st.pending.push({ at: now + d / SPEED, ix: dirx * w * 1.6 / (1 + d * 0.8), iz: dirz * w * 1.6 / (1 + d * 0.8) });
    stageEl.classList.add('has-turned'); stage.invalidate();
  }
  /* tap / click on the water: ray to the plane y = 0 */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit = new THREE.Vector3();
  let down = null;
  stageEl.addEventListener('pointerdown', (e) => { down = [e.clientX, e.clientY]; });
  stageEl.addEventListener('pointerup', (e) => {
    if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 8) return; down = null;
    const r = stage.renderer.domElement.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, stage.camera); if (ray.ray.intersectPlane(plane, hit) && Math.hypot(hit.x, hit.z) < 1.9) ripple(hit.x, hit.z, 1);
  });
  stage.renderer.domElement.tabIndex = 0;
  stage.renderer.domElement.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); splash(); } });
  function splash() { const a = Math.random() * Math.PI * 2; ripple(st.x + Math.cos(a) * 0.7, st.z + Math.sin(a) * 0.7, 1.2); live.textContent = 'Splash. The duck drifts away from the ripple.'; }
  document.querySelector('[data-action="splash"]').addEventListener('click', splash);

  const up = new THREE.Vector3(0, 1, 0), n = new THREE.Vector3(), q = new THREE.Quaternion();
  let shown = '';
  stage.onFrame((dt, t) => {
    now = t; U.uT.value = t;
    for (let i = st.pending.length - 1; i >= 0; i--) { const p = st.pending[i]; if (now >= p.at) { st.vx += p.ix; st.vz += p.iz; st.pending.splice(i, 1); } }
    const k = 1.1, c = 1.6;                                            // spring back to the middle, water drag
    st.vx += (-k * st.x - c * st.vx) * dt; st.vz += (-k * st.z - c * st.vz) * dt;
    st.x = clamp(st.x + st.vx * dt, -1.0, 1.0); st.z = clamp(st.z + st.vz * dt, -1.0, 1.0);
    const h = heightAt(st.x, st.z, t), e = 0.05;
    n.set(-(heightAt(st.x + e, st.z, t) - h) / e, 1, -(heightAt(st.x, st.z + e, t) - h) / e).normalize();
    q.setFromUnitVectors(up, n);
    holder.position.set(st.x, h, st.z); U.uD.value.set(st.x + 0.06, st.z + 0.08); holder.quaternion.slerp(q, 1 - Math.exp(-dt * 6));
    const tilt = THREE.MathUtils.radToDeg(up.angleTo(new THREE.Vector3(0, 1, 0).applyQuaternion(holder.quaternion)));
    const txt = tilt.toFixed(1) + '|' + (Math.hypot(st.x, st.z) * 9).toFixed(1);
    if (txt !== shown) { shown = txt; const [a, b] = txt.split('|'); roT.textContent = a; roD.textContent = b; }
    return true;
  });
  stage.loaded();
  if (!reduced) setTimeout(() => { ripple(-0.75, 0.35, 0.9); made = 0; roR.textContent = '0'; }, 900);
}
