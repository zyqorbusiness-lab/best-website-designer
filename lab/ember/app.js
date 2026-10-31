/* Ember & Oak - Zyqor Lab concept 04.
   Paper-tear reveal (caramel roast-paper layer tears open), travelling real photo cup (CC0 photo) and scanned 3D beans (CC BY, see model.js),
   outline giant type, roast-level control that recolours the coffee, the beans and the page. */
import { THREE, Q, isM, reduced, coarse, makeRenderer, studioEnv, reveals, smooth, clamp, lerp } from '../_kit/kit.js';
import { modeSwitch } from './mode.js';
import { cremaMaterial, cremaGeometry, glazeMaterial, glazeNormal, speckleMap, spoonGroup, steelMaterial, shadowTex as softShadow } from './assets.js';
import { useHDRI } from '../../assets/hdri/hdri.js';
import { loadEmber, realBeanMaterial } from './model.js';
let REAL = null, READY = false; // the loaded real models (one file for phone and desktop)

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const eio = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const eo = (t) => 1 - Math.pow(1 - t, 4);
let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

const ROASTS = [
  { name: 'Light', notes: 'Bergamot, apricot, wildflower honey', coffee: '#7A4524', crema: '#D7A774', bean: '#A06A3B', acc: '#C27236', temp: '205', acid: 9, body: 4, sweet: 7 },
  { name: 'Medium', notes: 'Cocoa, toasted almond, dark honey', coffee: '#45230F', crema: '#B07A4B', bean: '#5E341B', acc: '#C26A3D', temp: '218', acid: 6, body: 7, sweet: 8 },
  { name: 'Dark', notes: 'Smoked cacao, molasses, cedar', coffee: '#1C0F08', crema: '#7A4A2B', bean: '#26150C', acc: '#9A4626', temp: '232', acid: 3, body: 9, sweet: 6 },
];
const C = (h) => new THREE.Color(h);
const RC = ROASTS.map((r) => ({ coffee: C(r.coffee), crema: C(r.crema), bean: C(r.bean), acc: C(r.acc) }));

/* ------------------------------------------------------------------ geometry */
const NOISE = `
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*vn(p);p*=2.03;a*=.5;}return s;}`;
function coffeeMat() { return cremaMaterial(ROASTS[1].coffee, ROASTS[1].crema); }
function steamMat(op) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uT: { value: 0 }, uO: { value: op }, uS: { value: rnd() * 10 } },
    vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: `uniform float uT;uniform float uO;uniform float uS;varying vec2 vUv;${NOISE}
void main(){vec2 uv=vUv;float t=uT*.35+uS;
 float sway=sin(uv.y*4.2-t*1.6)*.11*uv.y+sin(uv.y*9.-t*2.3)*.03*uv.y;
 float x=uv.x-.5+sway;
 float w=mix(.05,.2,uv.y);
 float col=smoothstep(w,0.,abs(x));
 float n=fbm(vec2(x*5.+uS,uv.y*3.2-t*1.1));
 float a=col*smoothstep(.0,.18,uv.y)*smoothstep(.95,.35,uv.y)*smoothstep(.5,.86,n)*uO;
 gl_FragColor=vec4(vec3(1.,.97,.92),a*.38);
}`,
  });
}

let GLAZE_N = null, INNER = null;
function buildCup(glaze, opts = {}) {
  const seg = 160;
  GLAZE_N = GLAZE_N || glazeNormal();
  const R = REAL;
  const root = new THREE.Group();
  const cup = new THREE.Group(); root.add(cup);
  // real cup: outer shell + handle take the roast glaze, the lip and well stay white, the inner wall keeps the scan's coffee-stained texture
  const gm = glazeMaterial(glaze, { map: speckleMap(glaze, 0.6), normal: GLAZE_N, clay: opts.clay || '#EAD7B9', roughness: opts.rough ?? 0.17, footLine: !!opts.footLine, pool: 0.32 });
  gm.color.setScalar(1.16); // the real bowl is deeper than the old lathe one and sits in more of its own shadow
  const wm = glazeMaterial('#F7F0E4', { map: speckleMap('#F7F0E4', 0.2, 4), normal: GLAZE_N, clay: '#E3CFAE', roughness: 0.12 });
  INNER = INNER || new THREE.MeshPhysicalMaterial({ color: '#FFFFFF', map: R.innerMap, roughness: 0.16, normalMap: GLAZE_N, normalScale: new THREE.Vector2(0.15, 0.15),
    clearcoat: 1, clearcoatRoughness: 0.1, ior: 1.52, specularIntensity: 0.9 });
  cup.add(new THREE.Mesh(R.cup.outer, gm), new THREE.Mesh(R.cup.handle, gm), new THREE.Mesh(R.cup.body, wm), new THREE.Mesh(R.cup.inner, INNER));
  // coffee: our lit, glossy crema surface (code) with a meniscus at the wall, sized to the real cup's inner wall
  const coffee = new THREE.Mesh(cremaGeometry(R.coffeeR, seg), opts.coffee || coffeeMat());
  coffee.rotation.x = -Math.PI / 2; coffee.position.y = R.coffeeY; cup.add(coffee);
  cup.position.y = R.cupBase;
  // real saucer, same white stoneware glaze as the cup lip; the scan's throwing-ring texture rides in as the colour map
  const sm = glazeMaterial(opts.saucer || '#F6F0E6', { normal: GLAZE_N, clay: '#DCC5A2', roughness: 0.13 });
  sm.map = null; sm.roughnessMap = null; sm.clearcoatRoughnessMap = null; sm.color.set(opts.saucer || '#F6F0E6'); sm.roughness = 0.24;
  sm.normalScale.set(0.05, 0.05); sm.envMapIntensity = 1.35; // the flatter real saucer: an even glossy white glaze (the lathe speckle and roughness prints read as blotches on its wide flat top)
  root.add(new THREE.Mesh(R.saucer.body, sm), new THREE.Mesh(R.saucer.top, sm));
  const ao = new THREE.Mesh(new THREE.PlaneGeometry(R.foot * 3.4, R.foot * 3.4), new THREE.MeshBasicMaterial({ map: AO, transparent: true, depthWrite: false, opacity: 0.85 }));
  ao.rotation.x = -Math.PI / 2; ao.position.y = R.cupBase + 0.0025; root.add(ao);
  if (opts.spoon) {
    const sp = spoonGroup(STEEL); sp.rotation.y = -Math.PI / 2 + 0.35; sp.position.set(-0.1, 0.1, 0.6); root.add(sp);
  }
  // contact shadow on the page: a tight core under the foot ring plus a wide soft falloff
  const sh = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 3.0), new THREE.MeshBasicMaterial({ map: SHADOW, transparent: true, depthWrite: false }));
  sh.rotation.x = -Math.PI / 2; sh.position.y = -0.012; sh.renderOrder = -1; root.add(sh);
  const sh2 = new THREE.Mesh(new THREE.PlaneGeometry(1.35, 1.35), new THREE.MeshBasicMaterial({ map: CORE, transparent: true, depthWrite: false }));
  sh2.rotation.x = -Math.PI / 2; sh2.position.y = -0.008; sh2.renderOrder = -1; root.add(sh2);
  root.children.forEach((c) => (c.position.y -= 0.55));
  root.scale.setScalar(1.1);
  const pivot = new THREE.Group(); pivot.add(root);
  pivot.userData = { coffee, rimY: (R.cupBase + R.cupTop - 0.55) * 1.1 };
  return pivot;
}
const AO = softShadow(0.75, 0.45, '60,30,14');
const CORE = softShadow(0.7, 0.35);
let STEEL = null;
const SHADOW = softShadow(0.42, 0.2);

/* ------------------------------------------------------------------ DOM bits */
const tear = $('#tear'), stage = $('#stage');
const halves = $$('.tw .half'), wraps = $$('.tw'), fibs = $$('.fib'), cue = $('.t-cue');
const beansCv = $('.beans'), cupCv = $('.cupgl'), EPB = $('.ep-beans');
let W = innerWidth, H = innerHeight;

function tearPaths() {
  seed = 23;
  const pts = []; const step = isM ? 16 : 11;
  for (let y = -50; y <= H + 50; y += step * (0.55 + rnd() * 0.9)) {
    const base = W * (isM ? 0.5 : 0.545) + Math.sin((y / H) * Math.PI * 1.55 + 0.5) * W * (isM ? 0.08 : 0.05) + Math.sin((y / H) * Math.PI * 5.1) * W * 0.012;
    pts.push([base + (rnd() - 0.5) * (isM ? 12 : 18), y]);
  }
  const P = (a) => a.map(([x, y]) => x.toFixed(1) + ' ' + y.toFixed(1)).join(' L');
  const dl = `M-80 -60 L${P(pts)} L-80 ${H + 60}Z`;
  const dr = `M${W + 80} -60 L${P(pts)} L${W + 80} ${H + 60}Z`;
  halves[0].style.clipPath = `path('${dl}')`; halves[1].style.clipPath = `path('${dr}')`;
  // paper fibre: the pale torn core of the paper along each edge
  let w = 6; const offL = pts.map(([x, y]) => { w = clamp(w + (rnd() - 0.5) * 5, 3, isM ? 9 : 13); return [x - w, y]; });
  let w2 = 2; const offR = pts.map(([x, y]) => { w2 = clamp(w2 + (rnd() - 0.5) * 2.4, 1, 4.5); return [x + w2, y]; });
  const fl = `M${P(pts)} L${P(offL.slice().reverse())}Z`, fr = `M${P(pts)} L${P(offR.slice().reverse())}Z`;
  const filt = `<defs><filter id="fz" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="${isM ? 3 : 5}"/></filter>
<linearGradient id="fg" x1="0" x2="1"><stop offset="0" stop-color="#cdb08c"/><stop offset=".7" stop-color="#efe0c8"/><stop offset="1" stop-color="#fff6e6"/></linearGradient></defs>`;
  fibs[0].setAttribute('viewBox', `0 0 ${W} ${H}`); fibs[1].setAttribute('viewBox', `0 0 ${W} ${H}`);
  fibs[0].innerHTML = filt + `<path d="${fl}" fill="url(#fg)" filter="url(#fz)"/>`;
  fibs[1].innerHTML = `<path d="${fr}" fill="#d9c09f" opacity=".9"/>`;
}

/* ------------------------------------------------------------------ bean scene (dark hero) */
const B = { r: null };
function initBeans() {
  const r = makeRenderer(beansCv, { exposure: 1.05 }); r.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  const sc = new THREE.Scene(); const cam = new THREE.PerspectiveCamera(32, 1, 0.1, 60); cam.position.set(0, 0, 12);
  sc.environment = studioEnv(r); sc.environmentIntensity = 0.35;
  useHDRI(r, sc, { size: 512, intensity: 0.5, rotation: 2.2 });
  const key = new THREE.PointLight('#ffd2ac', isM ? 30 : 58, 30, 1.6); key.position.set(4, 2.5, 6); sc.add(key);
  const rim = new THREE.DirectionalLight('#ffd2a6', 2.6); rim.position.set(-4, 5, -6); sc.add(rim);
  sc.add(new THREE.AmbientLight('#5a3020', 0.45));
  // dark-roast beans: oily, a pale silverskin line in the cleft
  // the real scanned bean (same file on phone and desktop), recoloured to the dark roast
  const mat = realBeanMaterial(REAL.bean, '#3D2216', { clearcoat: 0.25, clearcoatRoughness: 0.32, roughness: 0.56 });
  const heroMat = realBeanMaterial(REAL.bean, '#3D2216', { clearcoat: 0.3, clearcoatRoughness: 0.3, roughness: 0.52 });
  const hero = new THREE.Mesh(REAL.bean.geo, heroMat); sc.add(hero);
  const N = Math.round(46 * Q.particles), NV = 3;
  const insts = Array.from({ length: NV }, (_, k) => {
    const im = new THREE.InstancedMesh(REAL.bean.geo, mat, Math.ceil(N / NV)); sc.add(im); return im;
  });
  seed = 5;
  const tint = new THREE.Color();
  const items = Array.from({ length: N }, (_, i) => {
    const left = rnd() < 0.18;
    const it = {
      p: left ? new THREE.Vector3(-8.2 + rnd() * 1.6, -4.6 + rnd() * 9.2, -7 + rnd() * 4) : new THREE.Vector3(0.2 + rnd() * 7, -4.6 + rnd() * 9.2, -7 + rnd() * 8),
      r: new THREE.Euler(rnd() * 6, rnd() * 6, rnd() * 6), s: (left ? 0.18 : 0.22) + rnd() * 0.3, sp: 0.2 + rnd() * 0.6, ph: rnd() * 6,
      sx: 0.9 + rnd() * 0.2, sz: 0.88 + rnd() * 0.24, m: i % NV, j: Math.floor(i / NV),
    };
    const l = 0.6 + rnd() * 0.4; tint.setRGB(l, l * (0.9 + rnd() * 0.1), l * (0.8 + rnd() * 0.18));
    insts[it.m].setColorAt(it.j, tint);
    return it;
  });
  insts.forEach((im) => { if (im.instanceColor) im.instanceColor.needsUpdate = true; });
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), s = new THREE.Vector3();
  // rising ember sparks
  const NS = Math.round(70 * Q.particles), sp = new Float32Array(NS * 3), sd = new Float32Array(NS);
  for (let i = 0; i < NS; i++) { sp[i * 3] = -6 + rnd() * 12; sp[i * 3 + 1] = -5 + rnd() * 10; sp[i * 3 + 2] = -4 + rnd() * 6; sd[i] = rnd(); }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3)); sg.setAttribute('aSeed', new THREE.BufferAttribute(sd, 1));
  const smat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uT: { value: 0 }, uO: { value: 1 }, uPx: { value: Math.min(devicePixelRatio || 1, 2) } },
    vertexShader: `attribute float aSeed;uniform float uT;uniform float uPx;varying float vA;
void main(){vec3 p=position;float sp=.35+aSeed*.6;p.y=mod(p.y+5.+uT*sp,10.)-5.;p.x+=sin(uT*(.6+aSeed)+aSeed*20.)*.35;
 vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;
 vA=smoothstep(-5.,-2.,p.y)*smoothstep(5.,1.5,p.y)*(.45+.55*sin(uT*3.+aSeed*40.)*.5+.25);
 gl_PointSize=(6.+aSeed*10.)*uPx*(8./-mv.z);}`,
    fragmentShader: `uniform float uO;varying float vA;void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,0.,d);gl_FragColor=vec4(1.,.55,.22,a*a*vA*uO);}`,
  });
  sc.add(new THREE.Points(sg, smat));
  function size() { r.setSize(W, H, false); cam.aspect = W / H; cam.updateProjectionMatrix(); }
  size();
  function frame(t, p, mx, my) {
    smat.uniforms.uT.value = t; smat.uniforms.uO.value = 1 - ss(0, 0.4, p);
    const burst = eo(clamp(p * 1.6));
    const hx = isM ? 0 : Math.min(3.4, 1.9 * cam.aspect), hy = isM ? 1.55 : 0.1;
    hero.position.set(hx + mx * 0.25 + burst * 2, hy + my * 0.2 + Math.sin(t * 0.6) * 0.08 + burst * 3.5, burst * 7);
    hero.rotation.set(0.5 + Math.sin(t * 0.3) * 0.2 + my * 0.3, t * 0.25 + mx * 0.4 + burst * 3, 0.6 + burst * 2);
    hero.scale.setScalar(isM ? 1.05 : 1.45);
    items.forEach((it, i) => {
      v.copy(it.p); v.y += Math.sin(t * it.sp + it.ph) * 0.25; v.x += Math.cos(t * it.sp * 0.7 + it.ph) * 0.15;
      v.x += mx * (0.2 + (it.p.z + 7) * 0.05); v.y += my * 0.15;
      const d = v.x - hx; v.x += Math.sign(d || 1) * burst * (4 + Math.abs(d)); v.y += burst * (v.y * 0.8 + 1.5); v.z += burst * 6;
      e.set(it.r.x + t * it.sp * 0.5, it.r.y + t * it.sp * 0.4, it.r.z + burst * 4); q.setFromEuler(e);
      s.set(it.s * it.sx, it.s, it.s * it.sz); m4.compose(v, q, s); insts[it.m].setMatrixAt(it.j, m4);
    });
    insts.forEach((im) => (im.instanceMatrix.needsUpdate = true));
    r.render(sc, cam);
  }
  Object.assign(B, { r, size, frame });
}

/* ------------------------------------------------------------------ cup scene */
const S = {};
function initCups() {
  const r = makeRenderer(cupCv, { exposure: 1.0 });
  const sc = new THREE.Scene(); const cam = new THREE.PerspectiveCamera(28, 1, 0.1, 80); cam.position.set(0, 0, 16);
  sc.environment = studioEnv(r); sc.environmentIntensity = 0.85;
  useHDRI(r, sc, { size: 512, intensity: 0.9, rotation: 0.6 });
  r.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); // same sharpness on phones (kit caps phones at 1.5)
  // warm studio: a soft key from upper left, a peach fill, and a back rim that draws the glaze edge
  const key = new THREE.DirectionalLight('#ffe2c4', 1.5); key.position.set(-4, 7, 6); sc.add(key);
  const fill = new THREE.DirectionalLight('#ffb98a', 0.45); fill.position.set(6, -1, 4); sc.add(fill);
  const rimL = new THREE.DirectionalLight('#ffd7b0', 1.1); rimL.position.set(3, 4, -6); sc.add(rimL);
  STEEL = steelMaterial();
  const coffee = coffeeMat();
  const main = buildCup('#C26A3D', { coffee, footLine: true }); sc.add(main);
  const sides = isM ? [] : [buildCup('#3B2419', { coffee, saucer: '#E9DCC6', clay: '#8A6A50', rough: 0.2, footLine: true }), buildCup('#EFE4D2', { coffee, clay: '#D9C1A0', footLine: true })];
  sides.forEach((c) => sc.add(c));
  // steam
  const steam = new THREE.Group(); sc.add(steam);
  const sm = [0.9, 0.7, 0.55].map((o, i) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 2.1), steamMat(o));
    m.position.set((i - 1) * 0.16, 1.05, i * 0.02); steam.add(m); return m;
  });
  // bean ring (roast section): same bean, its oil and colour follow the roast
  const bmat = realBeanMaterial(REAL.bean, RC[1].bean.clone(), { clearcoat: 0.6, clearcoatRoughness: 0.25 });
  const NB = 22; const ring = new THREE.InstancedMesh(REAL.bean.geo, bmat, NB); sc.add(ring);
  seed = 9; const rb = Array.from({ length: NB }, (_, i) => ({ a: (i / NB) * Math.PI * 2, rr: 1.55 + rnd() * 0.35, y: (rnd() - 0.5) * 0.5, sp: rnd() * 6, s: 0.13 + rnd() * 0.05, sx: 0.9 + rnd() * 0.2 }));
  const tc = new THREE.Color(); rb.forEach((b, j) => { const l = 0.78 + rnd() * 0.22; ring.setColorAt(j, tc.setRGB(l, l * 0.96, l * 0.9)); });
  ring.instanceColor.needsUpdate = true;
  function size() {
    const h = isM ? Math.max(cupCv.clientHeight, H) : H;
    r.setSize(W, h, false); cam.aspect = W / h; cam.updateProjectionMatrix(); S.ch = h;
  }
  size();
  Object.assign(S, { r, sc, cam, main, sides, steam, sm, ring, rb, bmat, coffee, size });
  if (/[?&]shot=1/.test(location.search)) { // QA close-up + poster-render hook, inert otherwise
    window.__ember = { S, B, REAL, snap(which) {
      if (which === 'beans') { B.frame(0, 0, 0, 0); return B.r.domElement.toDataURL('image/png'); }
      cupFrame(0, 1, 0, 0); S.r.render(S.sc, S.cam);
      const b = document.querySelector('.h-cup').getBoundingClientRect(); return { url: S.r.domElement.toDataURL('image/png'), rect: [b.left, b.top, b.width, b.height], dpr: S.r.getPixelRatio() };
    } };
  }
}

const anchors = $$('.cup-a').map((el) => ({ el, s: +el.dataset.s || 1, tilt: +el.dataset.tilt || 0.2, key: el.dataset.cup }));
const RY = { hero: 0.55, origin: -0.75, roast: 0.3, brew: 2.5, order: 0.35 };
const m4 = new THREE.Matrix4(), qq = new THREE.Quaternion(), ee = new THREE.Euler(), vv = new THREE.Vector3(), s3 = new THREE.Vector3();
function cupFrame(t, p, mx, my) {
  const ch = S.ch, halfH = Math.tan(THREE.MathUtils.degToRad(S.cam.fov / 2)) * S.cam.position.z, ppu = ch / (2 * halfH);
  const toW = (x, y) => [(x - W / 2) / ppu, -(y - ch / 2) / ppu];
  const vc = H * 0.5;
  const A = anchors.map((a) => { const b = a.el.getBoundingClientRect(); return { a, x: b.left + b.width / 2, y: b.top + b.height / 2, h: b.height, w: b.width }; });
  let i = 0; while (i < A.length - 1 && A[i + 1].y <= vc) i++;
  let k = 0;
  if (A[0].y > vc) k = 0; else if (i < A.length - 1) k = clamp((vc - A[i].y) / (A[i + 1].y - A[i].y));
  const a0 = A[i], a1 = A[Math.min(i + 1, A.length - 1)], e = eio(k);
  const sc = (o) => (o.h / ppu / 1.9) * o.a.s;
  const x = lerp(a0.x, a1.x, e), y = lerp(a0.y, a1.y, e) - Math.sin(e * Math.PI) * H * 0.06;
  const s = lerp(sc(a0), sc(a1), e);
  const tilt = lerp(a0.a.tilt, a1.a.tilt, e), ry = lerp(RY[a0.a.key], RY[a1.a.key], e);
  const rev = reduced ? 1 : ss(0.3, 0.95, p);
  const [wx, wy] = toW(x, y + (1 - eo(rev)) * H * 0.9);
  const M = S.main;
  M.position.set(wx, wy, 0); M.scale.setScalar(s);
  const travel = Math.sin(e * Math.PI) * (i === 0 ? 0 : 1);
  M.rotation.set(tilt + my * 0.08 + (1 - rev) * 0.6, ry + Math.sin(t * 0.45) * 0.12 + mx * 0.25 + e * Math.PI * 2 * (k > 0 && k < 1 ? 1 : 0), Math.sin(e * Math.PI) * 0.22 * (i % 2 ? -1 : 1) + (1 - rev) * -0.3);
  // hero side cups: staggered slide-in with the tear, slide out as the hero leaves
  const heroW = i === 0 ? 1 - e : 0;
  S.sides.forEach((c, j) => {
    const d = j ? 1 : -1, r2 = reduced ? 1 : ss(0.38 + j * 0.08, 1, p);
    const out = 1 - heroW;
    const [sx, sy] = toW(A[0].x + d * A[0].w * 0.36 + d * out * W * 0.35, A[0].y + A[0].h * 0.08 + (1 - eo(r2)) * H + out * H * 0.25);
    c.position.set(sx, sy, -1.2); c.scale.setScalar(sc(A[0]) * 0.8);
    c.rotation.set(0.32 + (1 - r2) * 0.5, (j ? -0.4 : 2.6) + Math.sin(t * 0.4 + j) * 0.1 + mx * 0.2, d * -0.2 + d * out * -0.6);
    c.visible = out < 0.999;
  });
  // steam follows the rim, upright
  M.updateMatrixWorld(); const rim = new THREE.Vector3(0, M.userData.rimY - 0.05, 0).applyMatrix4(M.matrixWorld);
  S.steam.position.copy(rim); S.steam.scale.setScalar(s); S.steam.position.z = 0.4;
  const stO = (1 - Math.abs(tilt - 0.25) * 1.1) * rev * (1 - travel * 0.7);
  S.sm.forEach((m) => { m.material.uniforms.uT.value = t; m.material.uniforms.uO.value = clamp(stO * (1 + FX.puff)) * (reduced ? 0.6 : 1); });
  S.coffee.uniforms.uT.value = reduced ? 3 : t; S.coffee.uniforms.uS.value = FX.stir;
  // bean ring around the cup in the roast section
  const rw = (a0.a.key === 'roast' ? 1 - e : 0) + (a1.a.key === 'roast' ? e : 0);
  S.ring.visible = rw > 0.01;
  if (S.ring.visible) {
    S.ring.position.set(wx, wy, 0);
    S.rb.forEach((b, j) => {
      const ang = b.a + t * 0.18 + (1 - rw) * 1.5;
      const rr = b.rr * s * (0.6 + 0.4 * rw);
      vv.set(Math.cos(ang) * rr, (b.y - 0.15) * s + Math.sin(t + b.sp) * 0.04 * s, Math.sin(ang) * rr * 0.55);
      ee.set(b.sp + t * 0.3, b.sp * 2 + t * 0.2, b.sp); qq.setFromEuler(ee);
      s3.set(b.s * s * rw * b.sx, b.s * s * rw, b.s * s * rw); m4.compose(vv, qq, s3); S.ring.setMatrixAt(j, m4);
    });
    S.ring.instanceMatrix.needsUpdate = true;
  }
  S.r.render(S.sc, S.cam);
}


/* ------------------------------------------------------------------ travelling photo cup (Oct 31)
   A real top-down espresso (CC0 photo, cut out) travels between the same .cup-a anchors the 3D cup used:
   it arcs between sections, spins a full turn like a saucer slid across a counter, and the roast level
   warms or deepens the coffee through a light colour grade. */
const PC = $('.pcup'), PCI = PC ? PC.querySelector('img') : null, PB = $('.pbed');
const PRY = { hero: -8, origin: 14, roast: -4, brew: 22, order: 6 };
function photoCup(t, p, mx, my) {
  if (!PC) return;
  const vc = H * 0.5;
  const A = anchors.map((a) => { const b = a.el.getBoundingClientRect(); return { a, x: b.left + b.width / 2, y: b.top + b.height / 2, h: b.height, w: b.width }; });
  let i = 0; while (i < A.length - 1 && A[i + 1].y <= vc) i++;
  let k = 0;
  if (A[0].y > vc) k = 0; else if (i < A.length - 1) k = clamp((vc - A[i].y) / (A[i + 1].y - A[i].y));
  const a0 = A[i], a1 = A[Math.min(i + 1, A.length - 1)], e = eio(k);
  const dia = (o) => Math.min(o.h * 0.86, isM ? W * 0.74 : 560) * o.a.s; // anchors are empty boxes: size from height only, like the 3D cup did
  const x = lerp(a0.x, a1.x, e), y = lerp(a0.y, a1.y, e) - Math.sin(e * Math.PI) * H * 0.06;
  const d = lerp(dia(a0), dia(a1), e);
  const rev = reduced ? 1 : ss(0.3, 0.95, p);
  const yy = y + (1 - eo(rev)) * H * 0.9;
  const spin = reduced ? 0 : e * 360 * (k > 0 && k < 1 ? 1 : 0);
  const rot = lerp(PRY[a0.a.key] || 0, PRY[a1.a.key] || 0, e) + spin + (reduced ? 0 : Math.sin(t * 0.45) * 3 + mx * 6) + (1 - rev) * -24;
  const lift = Math.sin(e * Math.PI) * (i === 0 && k === 0 ? 0 : 1);
  if (PB) { // the round bed of real beans sits under the cup at the Roast anchor
    const R = A.find((o) => o.a.key === 'roast');
    if (R) { const bw = PB.offsetWidth, on = R.y > -bw && R.y < H + bw; PB.style.visibility = on ? 'visible' : 'hidden';
      if (on) PB.style.transform = `translate3d(${(R.x - bw / 2).toFixed(1)}px,${(R.y - bw / 2).toFixed(1)}px,0)`; }
  }
  PC.style.width = PC.style.height = d.toFixed(1) + 'px';
  PC.style.transform = `translate3d(${(x - d / 2).toFixed(1)}px,${(yy - d / 2).toFixed(1)}px,0) scale(${(1 + lift * 0.06).toFixed(3)})`;
  if (PCI) PCI.style.transform = `rotate(${rot.toFixed(2)}deg)`;
  PC.style.setProperty('--lift', lift.toFixed(3));
  if (PCI) {
    const v = roast.v; // 0 light .. 2 dark: a gentle grade, the photo stays a photo
    const br = v < 1 ? lerp(1.1, 1, v) : lerp(1, 0.84, v - 1), sa = v < 1 ? lerp(0.92, 1.04, v) : lerp(1.04, 1.12, v - 1), se = v < 1 ? lerp(0.14, 0, v) : 0;
    PCI.style.filter = `brightness(${br.toFixed(3)}) saturate(${sa.toFixed(3)}) sepia(${se.toFixed(3)})`;
  }
}

/* ------------------------------------------------------------------ roast control */
const roast = { v: 1, target: 1, idx: 1 };
/* roast is also the page mode: Light = airy latte, Medium = house cream, Dark = espresso night */
const FX = { stir: 0, puff: 0 };
const THEME = ['r-light', '', 'r-dark'], THEME_BG = ['#FAF3E8', '#F2E6D3', '#6B3E2E'];
let themeIdx = 1, themeBusy = false, themePending = -1;
function setTheme(i, vt = true) {
  if (i === themeIdx) return;
  if (themeBusy) { themePending = i; return; }
  const apply = () => {
    themeIdx = i; const de = document.documentElement;
    de.classList.remove('r-light', 'r-dark'); if (THEME[i]) de.classList.add(THEME[i]);
    const meta = $('meta[name="theme-color"]'); if (meta) meta.setAttribute('content', THEME_BG[i]);
  };
  const after = () => {
    if (reduced || !window.gsap) return;
    /* the cup gets stirred and lets off a puff of steam as the new roast pours in */
    window.gsap.fromTo(FX, { stir: 1 }, { stir: 0, duration: 2.6, ease: 'power3.out' }); /* the fresh pour unwinds into a clean heart */
    window.gsap.fromTo(FX, { puff: 1.6 }, { puff: 0, duration: 2.2, ease: 'power2.out' });
    const hw = $('.h-word'); if (hw) window.gsap.fromTo(hw, { scale: 1.06, opacity: 0.4 }, { scale: 1, opacity: 1, duration: 1.4, ease: 'expo.out', clearProps: 'transform,opacity' });
  };
  if (!vt) { apply(); after(); return; }
  themeBusy = true;
  modeSwitch({ apply, after, reduced, shape: 'pour', duration: 1150 }).then(() => {
    themeBusy = false;
    if (themePending >= 0 && themePending !== themeIdx) { const n = themePending; themePending = -1; setTheme(n); } else themePending = -1;
  });
  if (reduced || !document.startViewTransition) themeBusy = false;
}
const rollEls = $$('.roll');
function initRoll(el) {
  const v = el.dataset.roll;
  el.innerHTML = [...v].map(() => '<span class="col">' + [...'0123456789'].map((d) => `<span>${d}</span>`).join('') + '</span>').join('');
  setRoll(el, v);
}
function setRoll(el, v) {
  v = String(v).padStart(el.children.length, '0');
  [...el.children].forEach((c, i) => (c.style.transform = `translateY(${-(+v[i])}em)`));
  const sr = el.nextElementSibling; if (sr && sr.classList.contains('sr')) sr.textContent = String(+v);
}
function setRoastUI(i) {
  const R = ROASTS[i]; roast.idx = i;
  $('#r-name').textContent = R.name; $('#r-tn').textContent = R.notes;
  $('#b-acid').style.width = R.acid * 10 + '%'; $('#b-body').style.width = R.body * 10 + '%'; $('#b-sweet').style.width = R.sweet * 10 + '%';
  setRoll(rollEls[0], String(R.acid).padStart(2, '0')); setRoll(rollEls[1], String(R.body).padStart(2, '0')); setRoll(rollEls[2], String(R.sweet).padStart(2, '0'));
  setRoll(rollEls[3], R.temp);
  $$('.seg button').forEach((b, j) => b.setAttribute('aria-checked', j === i ? 'true' : 'false'));
  $('.seg-k').style.transform = `translateX(${i * 100}%)`;
  $$('.rd-seg button').forEach((b, j) => b.setAttribute('aria-pressed', j === i ? 'true' : 'false'));
  const rk = $('.rd-k'); if (rk) rk.style.transform = `translateX(${i * 100}%)`;
}
const tmpC = new THREE.Color();
function mixRoast(key, v, out) { const a = Math.floor(clamp(v, 0, 1.999)), f = v - a; return out.copy(RC[a][key]).lerp(RC[a + 1][key], f); }
let lastAcc = -1;
function roastFrame(dt) {
  roast.v = reduced ? roast.target : lerp(roast.v, roast.target, 1 - Math.exp(-dt * 5));
  const v = roast.v;
  if (READY && S.coffee) {
    mixRoast('coffee', v, S.coffee.uniforms.uA.value); mixRoast('crema', v, S.coffee.uniforms.uB.value);
    mixRoast('bean', v, S.bmat.color);
    S.bmat.clearcoat = 0.1 + 0.26 * v; S.bmat.clearcoatRoughness = 0.42 - 0.1 * v; S.bmat.roughness = 0.64 - 0.08 * v;
  }
  if (Math.abs(v - lastAcc) > 0.004) { lastAcc = v; document.documentElement.style.setProperty('--acc', '#' + mixRoast('acc', v, tmpC).getHexString()); }
}
function initRoast() {
  rollEls.forEach(initRoll);
  const range = $('#r-range');
  const go = (v, fromRange) => {
    roast.target = v; const i = Math.round(v);
    if (!fromRange) range.value = v;
    if (i !== roast.idx) setRoastUI(i);
    setTheme(i, !fromRange);
  };
  $$('.rd-seg button').forEach((b, j) => b.addEventListener('click', () => go(j)));
  /* the roast dock: shown once the hero is open, tucked away where the full control or the order block is on screen */
  const dock = $('.rdock');
  if (dock) {
    let near = 0;
    const vis = () => dock.classList.toggle('on', scrollY > innerHeight * 0.55 && !near);
    const io = new IntersectionObserver((ents) => { ents.forEach((en) => { en.target._in = en.isIntersecting; }); near = ['roast', 'order'].some((id) => document.getElementById(id)._in); vis(); }, { threshold: 0.25 });
    ['roast', 'order'].forEach((id) => io.observe(document.getElementById(id)));
    addEventListener('scroll', vis, { passive: true }); vis();
  }
  range.addEventListener('input', () => go(+range.value, true));
  range.addEventListener('change', () => { const i = Math.round(+range.value); range.value = i; go(i); });
  const btns = $$('.seg button');
  btns.forEach((b, j) => {
    b.addEventListener('click', () => go(j));
    b.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault(); const n = (j + (e.key === 'ArrowRight' ? 1 : 2)) % 3; go(n); btns[n].focus();
      }
    });
  });
  setRoastUI(1);
}

/* ------------------------------------------------------------------ micro-interactions */
const ptr = { x: 0, y: 0, mx: 0, my: 0 };
function initMicro() {
  addEventListener('pointermove', (e) => { ptr.x = e.clientX; ptr.y = e.clientY; ptr.mx = e.clientX / W * 2 - 1; ptr.my = e.clientY / H * 2 - 1; }, { passive: true });
  if (coarse || isM) return;
  const cur = $('.cursor'), lab = $('.cursor span');
  let cx = W / 2, cy = H / 2, shown = false;
  (function loop() { cx = lerp(cx, ptr.x, 0.2); cy = lerp(cy, ptr.y, 0.2); cur.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(loop); })();
  addEventListener('pointermove', () => { if (!shown) { shown = true; cur.style.opacity = 1; } }, { once: true });
  $$('[data-cursor]').forEach((el) => {
    el.addEventListener('pointerenter', () => { lab.textContent = el.dataset.cursor; cur.classList.add('big'); });
    el.addEventListener('pointerleave', () => cur.classList.remove('big'));
  });
  if (reduced) return;
  $$('.mag').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const b = el.getBoundingClientRect(); const dx = e.clientX - (b.left + b.width / 2), dy = e.clientY - (b.top + b.height / 2);
      el.style.transition = 'transform .15s'; el.style.transform = `translate(${dx * 0.22}px,${dy * 0.35}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transition = 'transform .7s cubic-bezier(.16,1,.3,1)'; el.style.transform = ''; });
  });
  $$('.tilt').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const b = el.getBoundingClientRect(); const x = (e.clientX - b.left) / b.width - 0.5, y = (e.clientY - b.top) / b.height - 0.5;
      el.style.transform = `perspective(700px) rotateX(${-y * 8}deg) rotateY(${x * 10}deg) translateY(-4px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}

/* ------------------------------------------------------------------ nav + CTA */
let lenis = null;
function initNav() {
  const go = (id) => {
    const el = id === 'top' ? null : document.getElementById(id);
    if (lenis) lenis.scrollTo(el || 0, { duration: 1.6 });
    else if (el) el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); else scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  };
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href').slice(1); if (!id || id === 'main') return;
    e.preventDefault(); if (a.id === 'cta') return; go(id);
  }));
  $('#cta').addEventListener('click', () => {
    $('#toast').textContent = 'Concept only: Ember & Oak is a fictional roastery, so there is no list to join yet.';
  });
  const links = $$('.nav a');
  const io = new IntersectionObserver((ents) => ents.forEach((en) => {
    if (en.isIntersecting) links.forEach((l) => l.classList.toggle('on', l.getAttribute('href') === '#' + en.target.id));
  }), { rootMargin: '-45% 0px -45% 0px' });
  ['origin', 'roast', 'brew', 'order'].forEach((id) => io.observe(document.getElementById(id)));
}

/* ------------------------------------------------------------------ main loop */
let tearDone = false, last = performance.now(), T = 0, lastW = W;
const oL1 = $('.o-l1'), oL2 = $('.o-l2'), origin = $('#origin');
function tearProgress() {
  if (reduced) return 0;
  const top = stage.getBoundingClientRect().top;
  return clamp(-top / (H * 0.95));
}
function applyTear(p) {
  const e = p < 0.12 ? (p / 0.12) * 0.025 : 0.025 + 0.975 * eio((p - 0.12) / 0.88);
  wraps[0].style.transform = `translate(${-e * 64}vw,${e * 7}vh) rotate(${-e * 9}deg)`;
  wraps[1].style.transform = `translate(${e * 66}vw,${-e * 5}vh) rotate(${e * 8}deg)`;
  beansCv.style.opacity = 1 - ss(0.05, 0.55, p);
  if (!READY && EPB) EPB.style.opacity = beansCv.style.opacity; // the poster fades with the tear like the live beans would
  cue.style.opacity = 1 - ss(0, 0.12, p);
  const done = p >= 0.999;
  if (done !== tearDone) { tearDone = done; tear.classList.toggle('gone', done); }
}
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now; if (!reduced) T += dt;
  const p = tearProgress();
  applyTear(p);
  const mx = reduced ? 0 : ptr.mx, my = reduced ? 0 : ptr.my;
  if (READY && !tearDone) B.frame(T, p, mx, my);
  roastFrame(dt);
  photoCup(T, p, mx, my);
  if (!reduced) {
    const b = origin.getBoundingClientRect(); const k = (H - b.top) / (H + b.height);
    oL1.style.transform = `translateX(${(-k * 32 + 6)}vw)`; oL2.style.transform = `translateX(${(k * 32 - 38)}vw)`;
  }
  requestAnimationFrame(frame);
}
function onResize() {
  const w = innerWidth, h = innerHeight;
  if (isM && w === lastW && Math.abs(h - H) < 140) return; // phone URL bar: ignore
  W = w; H = h; lastW = w; tearPaths(); if (READY) { B.size(); } if (S.size) S.size();
}

/* poster first: the page, its copy and the poster images paint straight away; the real 3D loads after first paint.
   No WebGL (or the model fails): the posters simply stay, nothing blank. */
const de = document.documentElement;
const hasGL = (() => { try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (e) { return false; } })();
function noGL() { de.classList.remove('gl-wait'); de.classList.add('no-gl'); beansCv.hidden = true; cupCv.hidden = true; }
tearPaths(); initRoast(); initMicro(); initNav();
reveals(); lenis = smooth();
addEventListener('resize', onResize);
if (reduced) applyTear(0);
requestAnimationFrame(frame);
if (!hasGL) noGL();
else {
  de.classList.add('gl-wait');
  const bar = $('.ep-load i');
  const start = () => loadEmber((f) => { if (bar) bar.style.transform = `scaleX(${f})`; }).then((m) => {
    REAL = m; initBeans(); READY = true; // Oct 31: the cup is now a real photo (see photoCup), so the 3D cup scene is not built
    if (reduced) B.frame(0, 0, 0, 0);
    if (EPB) EPB.style.opacity = '';
    de.classList.remove('gl-wait'); de.classList.add('gl-on');
  }).catch(noGL);
  requestAnimationFrame(() => setTimeout(start, 0));
}
