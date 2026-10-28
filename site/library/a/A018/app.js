/* A018 Tranquility Base - shared app for index.html (desktop) and m.html (phone).
   One pinned three.js scene; scroll progress drives a single camera along a spline, from lunar orbit to the surface
   and back up for an earthrise. Real assets: Poly Haven Moon Rock 01/05/07 (photo-scanned, CC0), Poly Haven
   "Moon Footprints 01" regolith texture (CC0), NASA Blue Marble on the Earth (public domain). Code-made: crater terrain,
   starfield, sky dome, atmosphere rim. The phone loads the same files and runs the same path. */
import { createStage, THREE, isM, reduced, damp, clamp, smoothstep, smooth } from '../../_kit/stage.js';
import { reveals, press } from '../../_kit/fx/index.js';

reveals(); press('[data-press]');
const css = getComputedStyle(document.documentElement);
const C1 = new THREE.Color(css.getPropertyValue('--c1').trim()), C2 = new THREE.Color(css.getPropertyValue('--c2').trim());
const $ = (s) => document.querySelector(s);
const journey = $('.journey'), rail = $('.rail');

const stage = await createStage({
  el: '.scene', lazy: false, hdri: 0, envIntensity: 0.1, exposure: 1.08, shadows: true,
  camera: { fov: isM ? 52 : 40, near: 0.05, far: 1200, position: [0, 40, 30], target: [0, 0, -5] },
  label: 'Tranquility Base: a camera flies from lunar orbit down to scanned moon rocks, then rises to an earthrise as you scroll.'
});
const { scene, camera, renderer } = stage;
if (!stage.failed) { renderer.shadowMap.type = THREE.PCFSoftShadowMap; }
const skyCol = C2.clone().lerp(new THREE.Color('#0d1626'), 0.35);
const horizonCol = C2.clone().lerp(C1, 0.035);
scene.fog = new THREE.Fog(horizonCol, 22, 62);

/* --- sky dome (navy, never black) + starfield (code-made) --- */
const sky = new THREE.Mesh(new THREE.SphereGeometry(1000, 32, 16), new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false,
  uniforms: { top: { value: skyCol.clone().multiplyScalar(0.55) }, horizon: { value: horizonCol } },
  vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: 'uniform vec3 top; uniform vec3 horizon; varying vec3 vP; void main(){ float h = smoothstep(-0.05, 0.55, vP.y); gl_FragColor = vec4(mix(horizon, top, h), 1.0);\n#include <colorspace_fragment>\n}'
}));
scene.add(sky);
const N = isM ? 2200 : 3200, sp = new Float32Array(N * 3), ss = new Float32Array(N);
let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
for (let i = 0; i < N; i++) { const u = rnd() * 2 - 1, th = rnd() * Math.PI * 2, y = Math.abs(u) * 0.96 + 0.02, r = Math.sqrt(1 - y * y); sp.set([Math.cos(th) * r * 900, y * 900, Math.sin(th) * r * 900], i * 3); ss[i] = rnd() < 0.06 ? 2.6 : 1 + rnd(); }
const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3)); sg.setAttribute('size', new THREE.BufferAttribute(ss, 1));
const stars = new THREE.Points(sg, new THREE.ShaderMaterial({ transparent: true, depthWrite: false, fog: false, uniforms: { px: { value: stage.dpr } , tint: { value: C1 } },
  vertexShader: 'attribute float size; uniform float px; void main(){ gl_PointSize = size * px; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: 'uniform vec3 tint; void main(){ float d = length(gl_PointCoord - 0.5); gl_FragColor = vec4(tint, smoothstep(0.5, 0.1, d) * 0.9);\n#include <colorspace_fragment>\n}' }));
scene.add(stars);

/* --- light: one low sun (long, sharp shadows) + faint earthshine --- */
const sun = new THREE.DirectionalLight(0xfff5e8, 3.1); sun.position.set(-14, 7, -6);
sun.castShadow = true; sun.shadow.mapSize.set(isM ? 1024 : 2048, isM ? 1024 : 2048);
Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 50 }); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
sun.target.position.set(0, 0, -1); scene.add(sun, sun.target);
scene.add(new THREE.HemisphereLight(0x9fb3d9, 0x3a3630, 0.35));
const rimL = new THREE.DirectionalLight(0xbcd0ff, 0.9); rimL.position.set(10, 4, -26); scene.add(rimL);   // cool earthshine from behind: rims the rocks and crater lips so the ground has depth

/* --- crater terrain with the real regolith texture (Poly Haven "Moon Dusted 02"), footprints only around the landing --- */
const tex = (f, o) => stage.loadTexture(stage.asset('tex/' + f), o).catch(() => null);
const [diff, nor, arm, fpCol, fpNor] = await Promise.all([
  tex('moon_dusted_02_diff_1k.webp', { repeat: 30 }), tex('moon_dusted_02_nor_1k.webp', { repeat: 30, srgb: false }), tex('moon_dusted_02_arm_1k.webp', { repeat: 30, srgb: false }),
  tex('moon_footprints_01_decal_1k.webp'), tex('moon_footprints_01_nor_1k.webp', { srgb: false })
]);
const SIZE = 150, R0 = 60;                                       // detailed disc of radius ~60, flattened to y=0 at its rim
const G = new THREE.PlaneGeometry(SIZE, SIZE, isM ? 180 : 240, isM ? 180 : 240).rotateX(-Math.PI / 2);
const craters = [[-6, -9, 3.2], [7, -16, 5], [-14, 6, 4], [12, 4, 2.4], [-3, -26, 7], [18, -30, 6], [-22, -18, 5.5], [3, 10, 2], [-9, -3, 1.4], [5, -5, 1.1], [-30, -40, 9], [28, -8, 4.5], [-38, 12, 6]];
const pos = G.attributes.position;
for (let i = 0; i < pos.count; i++) {
  const x = pos.getX(i), z = pos.getZ(i); let h = Math.sin(x * 0.11) * Math.cos(z * 0.09) * 0.35 + Math.sin(x * 0.37 + z * 0.21) * 0.08;
  for (const [cx, cz, r] of craters) { const d = Math.hypot(x - cx, z - cz) / r; if (d < 1.6) h += d < 1 ? -0.55 * r * 0.22 * (1 - d * d) : 0.22 * r * 0.18 * Math.exp(-((d - 1.05) ** 2) * 18); }
  const rr = Math.hypot(x, z);
  if (rr < 4) h *= rr / 4;                                       // the landing patch stays level
  h *= 1 - smoothstep(R0 - 14, R0, rr);                          // fade to flat so the apron meets it with no step
  pos.setY(i, h);
}
G.computeVertexNormals();
const groundMat = new THREE.MeshStandardMaterial({ color: 0xc2bfba, map: diff, normalMap: nor, normalScale: new THREE.Vector2(1.7, 1.7), roughnessMap: arm, aoMap: arm, roughness: 1, metalness: 0 });
const ground = new THREE.Mesh(G, groundMat); ground.receiveShadow = true; scene.add(ground);
/* the apron to the horizon: same maps, UVs scaled so the tiling matches (5 units per tile) */
const ring = new THREE.RingGeometry(SIZE * 0.5 - 6, 900, 96, 1).rotateX(-Math.PI / 2);
{ const p = ring.attributes.position, uv = ring.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / SIZE + 0.5, -p.getZ(i) / SIZE + 0.5); }
const apron = new THREE.Mesh(ring, groundMat); apron.position.y = -0.02; apron.receiveShadow = true; scene.add(apron);
/* the footprints: a feathered decal of the real footprint scan where the camera lands */
if (fpCol) {
  const fp = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: fpCol, normalMap: fpNor, transparent: true, roughness: 1, metalness: 0, color: 0xc2bfba, polygonOffset: true, polygonOffsetFactor: -2, depthWrite: false }));
  fp.position.set(0.2, 0.012, 0.3); fp.rotation.y = 0.5; fp.receiveShadow = true; scene.add(fp);
}

/* --- three photo-scanned rocks + scattered copies (shared geometry, no extra download) --- */
const rocks = new THREE.Group(); scene.add(rocks);
const files = ['moon_rock_01', 'moon_rock_05', 'moon_rock_07'];
const gl = await Promise.all(files.map((f) => stage.load(stage.asset(`models/${f}.glb`)).catch(() => null)));
const hero = [[-1.3, -1.6, 1.25, 0.3], [1.5, -2.6, 0.9, 1.9], [0.25, -4.2, 1.7, 4.1]];
gl.forEach((g, i) => {
  if (!g) return; const base = g.scene; stage.fit(base, 1, true);
  base.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  const make = () => { const w = new THREE.Group(); w.add(base.clone()); return w; };   // wrapper keeps fit()'s centring
  const [x, z, s, ry] = hero[i]; const h = make(); h.scale.setScalar(s); h.position.set(x, -0.06 * s, z); h.rotation.y = ry; rocks.add(h);
  for (let k = 0; k < (isM ? 9 : 12); k++) { const c = make(); const r = 3.5 + rnd() * 16, an = rnd() * Math.PI * 2, sc = 0.18 + rnd() * 0.6; c.scale.setScalar(sc); c.position.set(Math.cos(an) * r, -0.1 * sc, Math.sin(an) * r - 4); c.rotation.set(rnd() * 0.4, rnd() * 6.3, rnd() * 0.4); rocks.add(c); }
});

/* --- the Earth (NASA Blue Marble) with a code-made atmosphere rim --- */
const earthTex = await stage.loadTexture(stage.asset('tex/earth_bluemarble_2k.webp')).catch(() => null);
const earth = new THREE.Group(); earth.position.set(13, -16, -130); scene.add(earth);
const L = new THREE.Vector3(-1, 0.18, 0.32).normalize();                     // its own sun: a waxing gibbous, like the 1968 photo
const eMesh = new THREE.Mesh(new THREE.SphereGeometry(13, 96, 64), new THREE.ShaderMaterial({ fog: false,
  uniforms: { map: { value: earthTex }, L: { value: L }, night: { value: C2.clone().multiplyScalar(0.25) } },
  vertexShader: 'varying vec2 vUv; varying vec3 vN; void main(){ vUv = uv; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: 'uniform sampler2D map; uniform vec3 L; uniform vec3 night; varying vec2 vUv; varying vec3 vN; void main(){ vec3 c = texture2D(map, vUv).rgb; float d = dot(normalize(vN), L); float day = smoothstep(-0.08, 0.28, d); vec3 g = vec3(dot(c, vec3(0.299, 0.587, 0.114))); c = mix(g, c, 0.62) * vec3(0.95, 0.98, 1.0); vec3 col = mix(night, c * 0.92, day); gl_FragColor = vec4(col, 1.0);\n#include <colorspace_fragment>\n}'
}));
if (earthTex) earthTex.colorSpace = THREE.NoColorSpace;   // sampled raw, converted once at the end of the shader
eMesh.rotation.set(0.25, -1.6, 0.12);
const atmo = new THREE.Mesh(new THREE.SphereGeometry(13.35, 64, 48), new THREE.ShaderMaterial({ transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending,
  uniforms: { col: { value: new THREE.Color('#8fbaff') }, L: { value: L } },
  vertexShader: 'varying vec3 vN; varying vec3 vV; varying vec3 vW; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); vW = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * mv; }',
  fragmentShader: 'uniform vec3 col; uniform vec3 L; varying vec3 vN; varying vec3 vV; varying vec3 vW; void main(){ float f = pow(1.0 - max(dot(vN, vV), 0.0), 3.5); float lit = smoothstep(-0.2, 0.4, dot(vW, L)); gl_FragColor = vec4(col * f * (0.25 + lit), 1.0);\n#include <colorspace_fragment>\n}' }));
earth.add(eMesh, atmo);

/* --- the camera path: one spline for the eye, one for where it looks --- */
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const eye = new THREE.CatmullRomCurve3([V(2, 46, 34), V(6, 22, 20), V(3.2, 6.5, 10), V(1.2, 1.35, 4.2), V(-0.4, 1.05, 1.6), V(0.2, 1.7, 0.6), V(0.4, 3.4, -0.4)], false, 'centripetal');
const look = new THREE.CatmullRomCurve3([V(0, 0, -8), V(0, 0, -6), V(0, 0.2, -3), V(0, 0.55, -2.4), V(0.4, 0.05, 0.1), V(1.2, 3, -40), V(4, 9, -120)], false, 'centripetal');
const tmpL = new THREE.Vector3();
let target = 0, prog = reduced ? 0 : 0;
const chapters = [...document.querySelectorAll('.chapter')], railItems = [...document.querySelectorAll('.rail li')];
function place(p) {
  eye.getPoint(p, camera.position); look.getPoint(p, tmpL); camera.lookAt(tmpL);   // parametric: each chapter gets an equal share of the scroll
  const rise = smoothstep(0.7, 1, p);                                         // earthrise in the last chapter
  earth.position.y = -16 + rise * 27; earth.position.x = 13 + rise * (camera.aspect > 1 ? 12 : -3);   // desktop: clear of the left text column
  eMesh.rotation.y = -1.6 + p * 0.35;
  const y = camera.position.y; scene.fog.near = 14 + y * 1.1; scene.fog.far = 58 + y * 2.4;   // haze scales with altitude
  stars.material.uniforms.px.value = stage.dpr;
  stage.invalidate();
}
place(0);

/* scroll -> progress (ScrollTrigger + Lenis on desktop, native on phone) */
smooth();
stage.scroll(journey, (p) => { target = p; if (reduced) { prog = p; place(p); } });
let lastT = performance.now();
stage.onFrame(() => {
  const now = performance.now(), dt = Math.min(0.25, (now - lastT) / 1000); lastT = now;   // wall-clock, so slow devices keep up
  if (reduced) return false;
  const d = target - prog; if (Math.abs(d) < 0.00005) return false;
  prog = damp(prog, target, isM ? 6 : 4.2, dt); place(clamp(prog)); return true;
});

/* chapter states (which text card shows) + the progress rail */
const io = new IntersectionObserver((ents) => ents.forEach((e) => { e.target.classList.toggle('is-on', e.isIntersecting); if (e.isIntersecting) { const i = +e.target.dataset.ch; railItems.forEach((li, k) => li.classList.toggle('is-on', k === i)); } }), { rootMargin: '-35% 0px -35% 0px' });
chapters.forEach((c) => io.observe(c));
stage.scroll(journey, (p) => { rail.style.setProperty('--p', p.toFixed(4)); rail.classList.toggle('is-on', p > 0.001 && p < 0.985); }, { native: true });   // the rail only lives inside the journey
chapters[0].classList.add('is-on');

$('[data-action="top"]').addEventListener('click', (e) => { e.preventDefault(); if (window.__lenis) window.__lenis.scrollTo(0, { duration: 1.6 }); else window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); });
window.__scene = { stage, sky, apron, ground, earth, get p() { return prog; }, get target() { return target; } };   // for QA probes
stage.loaded();
