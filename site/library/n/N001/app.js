/* N001 Loomhouse Tailors - shared app for index.html (desktop) and m.html (phone).
   Same textures and HDRI on both builds; the phone only gets fewer cloth segments (geometry is code, not an asset).

   The cloth: a plane hung from a rod, displaced in the vertex shader (drape folds + sway + one travelling ripple),
   normals rebuilt from the same function. Two meshes share that geometry and shader: the bottom one shows the cloth
   that is hanging, the top one shows the incoming cloth only inside a circle that grows in cloth-UV space from the
   point you chose (with a dashed tailor's-chalk seam on its edge). The page colourway floods from the cursor at the
   same moment (CSS clip-path circle on .flood), and --c1/--c2 ease so the type follows. */
import { createStage, THREE, isM, reduced, clamp } from '../../_kit/stage.js';
import { reveals, splitAll, press, magnetic } from '../../_kit/fx/index.js';

splitAll(); reveals(); press('[data-press]');
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
document.querySelectorAll('.site-cta, .hero-cta .btn--book').forEach((b) => magnetic(b, { strength: 0.25 }));

const CLOTHS = [
  { key: 'denim', name: 'Indigo Denim', weave: 'Twill', theme: 'denim', room: '#F6E2E5', map: 'tex/denim_diff.webp', nor: 'tex/denim_nor.webp', rep: 2.1, ar: 758 / 768, color: '#ffffff', rough: 0.88, sheen: 0.4, sheenColor: '#c9d6f0', nScale: 1.5 },
  { key: 'glen', name: 'Glen Check Wool', weave: 'Woven check', theme: 'glen', room: '#E2D2D1', map: 'tex/glen_diff.webp', nor: 'tex/glen_nor.webp', rep: 1.5, ar: 793 / 640, color: '#ffffff', rough: 0.92, sheen: 0.6, sheenColor: '#f3e6e0', nScale: 1.3 },
  { key: 'satin', name: 'Blush Crepe Satin', weave: 'Crepe back satin', theme: 'satin', room: '#293E20', nor: 'tex/satin_nor.webp', rep: 2.4, ar: 1042 / 1024, color: '#F2D3D8', rough: 0.3, sheen: 1, sheenColor: '#fff4f5', sheenRough: 0.35, aniso: 0.75, nScale: 0.6 },
  { key: 'jacq', name: 'Fern Jacquard', weave: 'Quatrefoil jacquard', theme: 'jacq', room: '#DCD6D2', patt: 'tex/jacq_rough.webp', nor: 'tex/jacq_nor.webp', rep: 1.6, ar: 648 / 640, color: '#4FA571', rough: 0.55, sheen: 0.8, sheenColor: '#dff3e6', nScale: 1.3 }
];

/* ---------------- the page side: swatches, theme, flood ---------------- */
const root = document.documentElement;
const flood = document.querySelector('.flood');
const nowEl = document.querySelector('.now');
const nowName = document.querySelector('[data-now]'), nowWeave = document.querySelector('[data-now-weave]');
const select = document.querySelector('[data-cloth-select]');
let current = 0, floodAnim = null;

function setTheme(i, x, y) {
  const c = CLOTHS[i];
  const finish = () => { root.style.setProperty('--room', c.room); flood.style.clipPath = 'circle(0 at 50% 50%)'; };
  root.dataset.theme = c.theme;
  if (reduced || !flood.animate) { finish(); return; }
  floodAnim?.cancel();
  const R = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 8;
  flood.style.setProperty('--flood', c.room);
  floodAnim = flood.animate([{ clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(${R}px at ${x}px ${y}px)` }], { duration: 760, easing: 'cubic-bezier(.76,0,.24,1)', fill: 'forwards' });
  floodAnim.onfinish = () => { finish(); floodAnim.cancel(); floodAnim = null; };
}
function setLabel(i) {
  const c = CLOTHS[i];
  if (reduced) { nowName.textContent = c.name; nowWeave.textContent = c.weave; return; }
  nowEl.classList.add('is-swap');
  setTimeout(() => { nowName.textContent = c.name; nowWeave.textContent = c.weave; nowEl.classList.remove('is-swap'); }, 260);
}
function syncUI(i) {
  document.querySelectorAll('.sw[data-cloth]').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.cloth === i)));
  document.querySelectorAll('.row').forEach((r, k) => r.classList.toggle('is-current', k === i));
  if (select && select.value !== CLOTHS[i].key) select.value = CLOTHS[i].key;
}

/* choose(i, {uv:[u,v] on the cloth, x,y viewport point for the flood}) */
let cloth = null;              // set once the 3D side is ready
function choose(i, o = {}) {
  if (i === current && !o.force) { cloth?.ripple(o.uv || [0.5, 0.6], 0.5); return; }
  current = i; syncUI(i); setLabel(i);
  const x = o.x ?? innerWidth * 0.7, y = o.y ?? innerHeight * 0.45;
  setTheme(i, x, y);
  cloth?.reveal(i, o.uv || [0.5, 0.75]);
}

/* swatches: hover (fine pointer, with a short intent delay) and click/tap/Enter do the same thing */
document.querySelectorAll('.sw[data-cloth]').forEach((b) => {
  const i = +b.dataset.cloth;
  const uvOf = (e) => { const r = b.querySelector('.sw-cut').getBoundingClientRect(); return [clamp((e.clientX - r.left) / r.width), clamp(1 - (e.clientY - r.top) / r.height)]; };
  let t = 0;
  if (fine) {
    b.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'mouse') return; clearTimeout(t); const ev = { clientX: e.clientX, clientY: e.clientY }; t = setTimeout(() => choose(i, { uv: uvOf(ev), x: ev.clientX, y: ev.clientY }), 110); });
    b.addEventListener('pointerleave', () => clearTimeout(t));
  }
  b.addEventListener('click', (e) => {
    clearTimeout(t);
    const kb = e.detail === 0;                                   // keyboard activation: start from the swatch centre
    const r = b.getBoundingClientRect();
    choose(i, kb ? { uv: [0.5, 0.75], x: r.left + r.width / 2, y: r.top + r.height / 2 } : { uv: uvOf(e), x: e.clientX, y: e.clientY });
  });
});
/* rows in "The cloths": hang it, then bring the cloth into view */
document.querySelectorAll('.row-btn[data-cloth]').forEach((b) => b.addEventListener('click', (e) => {
  const i = +b.dataset.cloth;
  const stageEl = document.querySelector('.hero-stage-wrap');
  const go = () => { const r = stageEl.getBoundingClientRect(); choose(i, { uv: [0.5, 0.8], x: r.left + r.width / 2, y: Math.max(80, r.top + r.height * 0.3) }); };
  const top = stageEl.getBoundingClientRect().top + scrollY - 90;
  if (window.__lenis) { window.__lenis.scrollTo(top, { duration: 1.0, onComplete: go }); }
  else { window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' }); setTimeout(go, reduced ? 0 : 650); }
}));
select?.addEventListener('change', () => { const i = CLOTHS.findIndex((c) => c.key === select.value); if (i >= 0 && i !== current) choose(i, { uv: [0.5, 0.5] }); });

/* ---------------- the form: works as UI, sends nothing ---------------- */
const form = document.getElementById('book-form');
if (form) {
  const ok = form.querySelector('.f-ok');
  const msg = { name: 'Please add your name.', email: 'That email does not look complete.', day: 'Pick a day for the fitting.' };
  const check = (el) => {
    const err = el.closest('.f')?.querySelector('.f-err'); if (!err) return true;
    let m = '';
    if (el.required && !el.value.trim()) m = el.name === 'email' ? 'Please add your email.' : msg[el.name] || 'Required.';
    else if (el.name === 'name' && el.value.trim().length < 2) m = msg.name;
    else if (el.type === 'email' && el.value && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(el.value.trim())) m = msg.email;
    err.textContent = m; el.setAttribute('aria-invalid', m ? 'true' : 'false'); return !m;
  };
  form.querySelectorAll('input,select,textarea').forEach((el) => {
    el.addEventListener('blur', () => { if (el.value || el.getAttribute('aria-invalid')) check(el); });
    el.addEventListener('input', () => { if (el.getAttribute('aria-invalid') === 'true') check(el); });
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fields = [...form.querySelectorAll('[required]')];
    const bad = fields.filter((el) => !check(el));
    if (bad.length) { bad[0].focus(); return; }
    const btn = form.querySelector('[type=submit]');
    form.classList.add('is-sending'); btn.disabled = true; btn.setAttribute('aria-busy', 'true');
    setTimeout(() => {
      form.classList.remove('is-sending'); btn.disabled = false; btn.removeAttribute('aria-busy');
      const c = CLOTHS.find((k) => k.key === form.elements.namedItem('cloth').value);
      ok.querySelector('[data-ok-cloth]').textContent = (c ? c.name : 'cloth') + ' fitting';
      ok.hidden = false; ok.querySelector('.f-again').focus({ preventScroll: true });
    }, reduced ? 0 : 650);
  });
  ok.querySelector('.f-again').addEventListener('click', () => { form.reset(); syncUI(current); form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid')); form.querySelectorAll('.f-err').forEach((el) => (el.textContent = '')); ok.hidden = true; form.querySelector('[name=name]').focus(); });
}

/* ---------------- phone menu (m.html only) ---------------- */
const menuBtn = document.querySelector('[data-menu]'), menu = document.getElementById('menu');
if (menuBtn && menu) {
  const set = (open) => { menu.hidden = !open; menuBtn.setAttribute('aria-expanded', String(open)); document.body.classList.toggle('menu-open', open); if (open) menu.querySelector('a')?.focus(); else menuBtn.focus({ preventScroll: true }); };
  menuBtn.addEventListener('click', () => set(menu.hidden));
  menu.querySelector('[data-menu-close]')?.addEventListener('click', () => set(false));
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => { menu.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); document.body.classList.remove('menu-open'); }));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) set(false); });
}

/* ---------------- the 3D cloth ---------------- */
const stage = await createStage({
  el: '[data-stage]',
  camera: { fov: 30, position: [-0.55, 0.25, isM ? 4.3 : 4.9], target: [0, 0.02, 0] },
  exposure: 1.05, envIntensity: 0.4, fitFov: true,
  label: 'A length of cloth hanging from a rod. Tap or drag across it to make it move.'
});

if (!stage.failed) {
  const W = 1.3, H = 1.84, TOP = H / 2;
  const seg = isM ? [72, 104] : [120, 172];
  const geo = new THREE.PlaneGeometry(W, H, seg[0], seg[1]);
  const U = {                                                  // shared uniforms (one object per name, shared by all cloth materials)
    uTime: { value: 0 }, uSize: { value: new THREE.Vector2(W, H) },
    uRipO: { value: new THREE.Vector2(0.5, 0.6) }, uRipT: { value: 9 }, uRipA: { value: 0 },
    uRevO: { value: new THREE.Vector2(0.5, 0.7) }, uRevR: { value: 0 }, uSeamA: { value: 0 }, uChalk: { value: new THREE.Color('#F6E2E5') }
  };
  const VERT_HEAD = /* glsl */`
    uniform float uTime; uniform vec2 uSize; uniform vec2 uRipO; uniform float uRipT; uniform float uRipA;
    varying vec2 vCloth;
    float clothZ(vec2 q){
      float hang = pow(clamp(1.0 - q.y, 0.0, 1.0), 0.75);
      // soft vertical folds that open toward the hem, slightly skewed so they do not read as a corrugated sheet
      float x = q.x + (1.0 - q.y)*0.06*sin(q.x*3.0);
      float folds = sin(x*12.5 + 0.4)*0.05 + sin(x*5.2 - 1.1)*0.10 + sin(x*23.0 + q.y*2.3)*0.012;
      folds *= 0.3 + 0.9*hang;
      // the clamp pinches the top edge into small gathers
      folds += sin(q.x*62.8)*0.006*smoothstep(0.86, 1.0, q.y);
      float bow = hang*hang*0.05;
      float sway = (sin(uTime*0.8 + q.y*2.4)*0.022 + sin(uTime*0.47 + q.x*3.1)*0.01) * hang;
      vec2 d = (q - uRipO)*uSize; float r = length(d);
      float front = uRipT*1.15;
      float rip = sin((r - front)*11.0) * exp(-abs(r - front)*4.0) * exp(-uRipT*1.25) * uRipA * (0.25 + 0.75*hang);
      return folds + bow + sway + rip*0.085;
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
            float edge = 1.0 - smoothstep(0.006, 0.026, uRevR - dist);
            float ang = atan(dd.y, dd.x);
            float dash = step(0.45, fract(ang*dist*26.0/6.2831));
            gl_FragColor.rgb = mix(gl_FragColor.rgb, uChalk, edge*dash*uSeamA*0.92);
          }`);
    };
    m.customProgramCacheKey = () => 'loom-cloth';
    return m;
  }

  /* textures: the SAME webp files on both builds; repeat set per cloth */
  const texOf = async (c) => {
    const L = (url, srgb) => stage.loadTexture(url, { srgb, repeat: [c.rep, c.rep * (H / W) / c.ar], anisotropy: isM ? 4 : 8 });
    const [map, nor, patt] = await Promise.all([c.map ? L(c.map, true) : null, L(c.nor, false), c.patt ? L(c.patt, true) : null]);
    return { map, nor, patt };
  };
  const mats = new Array(CLOTHS.length).fill(null);
  const ensure = (i) => mats[i] ? Promise.resolve(mats[i]) : (mats[i] = texOf(CLOTHS[i]).then((t) => (mats[i] = clothMaterial(CLOTHS[i], t))));

  const group = new THREE.Group(); stage.add(group);
  const first = await ensure(current);
  const base = new THREE.Mesh(geo, first); const top = new THREE.Mesh(geo, first);
  top.visible = false; top.renderOrder = 2; base.renderOrder = 1;
  group.add(base, top);

  /* the hanger: a lacquered moss clamp (two rounded bars) on a fern-glazed hook, palette only */
  const lac = new THREE.MeshPhysicalMaterial({ color: '#293E20', roughness: 0.32, metalness: 0.15, clearcoat: 1, clearcoatRoughness: 0.12 });
  const fern = new THREE.MeshPhysicalMaterial({ color: '#3B8C5F', roughness: 0.22, metalness: 0.55, clearcoat: 0.6 });
  const barGeo = new THREE.CapsuleGeometry(0.032, W + 0.12, 8, 24); barGeo.rotateZ(Math.PI / 2);
  [-1, 1].forEach((s) => { const b = new THREE.Mesh(barGeo, lac); b.position.set(0, TOP - 0.01, s * 0.04); b.scale.set(1, 1.15, 0.8); group.add(b); });
  [-1, 1].forEach((s) => { const k = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.14, 20), fern); k.rotation.x = Math.PI / 2; k.position.set(s * (W / 2 + 0.02), TOP - 0.01, 0); group.add(k); });
  const hook = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.011, 12, 48, Math.PI * 1.35), fern);
  hook.position.set(0, TOP + 0.2, 0); hook.rotation.z = -Math.PI * 0.18; group.add(hook);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.12, 12), fern); stem.position.set(0, TOP + 0.06, 0); group.add(stem);
  group.position.y = 0.1; group.rotation.y = 0.3;

  const key = new THREE.DirectionalLight('#fff6ee', 2.4); key.position.set(-4.0, 1.2, 1.1); stage.scene.add(key);
  const rim = new THREE.DirectionalLight('#ffe9ee', 0.9); rim.position.set(2.8, 1.0, -1.2); stage.scene.add(rim);
  stage.loaded();

  /* animation state */
  let rev = null;                                              // { i, t, dur }
  let ripT = 9;
  const ripple = (uv, a = 1) => { if (reduced) return; U.uRipO.value.set(uv[0], uv[1]); ripT = 0; U.uRipA.value = a; stage.invalidate(); };
  const settle = (i) => { const m = mats[i]; m.userData.own.uRevOn.value = 0; base.material = m; top.visible = false; U.uSeamA.value = 0; rev = null; stage.invalidate(); };
  async function reveal(i, uv) {
    const m = await ensure(i);
    if (i !== current) return;                                 // superseded while loading
    if (rev) { const prev = mats[rev.i]; if (prev && prev !== m) { prev.userData.own.uRevOn.value = 0; base.material = prev; } }
    if (base.material === m) { top.visible = false; return; }
    U.uRevO.value.set(uv[0], uv[1]);
    if (reduced) { settle(i); return; }
    const far = Math.max(...[[0, 0], [1, 0], [0, 1], [1, 1]].map(([a, b]) => Math.hypot((a - uv[0]) * W, (b - uv[1]) * H)));
    m.userData.own.uRevOn.value = 1; top.material = m; top.visible = true;
    U.uRevR.value = 0; U.uSeamA.value = 1;
    rev = { i, t: 0, dur: window.__revDur || 0.95, far };
    ripple(uv, 1);
  }
  cloth = { reveal, ripple };
  // warm the other cloths when the browser is idle, so the first hover is instant
  const idle = window.requestIdleCallback || ((f) => setTimeout(f, 1200));
  idle(() => CLOTHS.forEach((_, i) => ensure(i)), { timeout: 2500 });

  const easeIO = (x) => (x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2);
  stage.onFrame((dt, t) => {
    U.uTime.value = reduced ? 0 : t;
    let busy = !reduced;
    if (ripT < 6) { ripT += dt; U.uRipT.value = ripT; busy = true; } else U.uRipA.value = 0;
    if (rev) {
      rev.t += dt; const p = clamp(rev.t / rev.dur);
      U.uRevR.value = easeIO(p) * (rev.far + 0.05);
      U.uSeamA.value = 1 - clamp((p - 0.7) / 0.3);
      if (p >= 1) settle(rev.i);
      busy = true;
    }
    // gentle parallax toward a fine pointer
    if (fine && !reduced) { group.rotation.y += ((stage.pointer.active ? 0.3 + stage.pointer.x * 0.12 : 0.3) - group.rotation.y) * Math.min(1, dt * 3); }
    return busy;
  });

  /* tap / drag on the cloth: a ripple from the finger (raycast on the flat plane is close enough) */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const hitUV = (e) => { const r = stage.el.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, stage.camera); const h = ray.intersectObject(base, false)[0]; return h && h.uv ? [h.uv.x, h.uv.y] : null; };
  let down = false, lastRip = 0;
  stage.el.addEventListener('pointerdown', (e) => { const uv = hitUV(e); if (uv) { down = true; ripple(uv, 0.9); lastRip = performance.now(); } });
  stage.el.addEventListener('pointermove', (e) => { if (!down) return; const now = performance.now(); if (now - lastRip < 140) return; const uv = hitUV(e); if (uv) { ripple(uv, 0.55); lastRip = now; } });
  addEventListener('pointerup', () => (down = false));
  const canvas = stage.renderer.domElement; canvas.tabIndex = 0;
  canvas.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); const n = (current + (e.key === 'ArrowRight' ? 1 : CLOTHS.length - 1)) % CLOTHS.length; const r = canvas.getBoundingClientRect(); choose(n, { uv: [0.5, 0.75], x: r.left + r.width / 2, y: r.top + r.height / 3 }); }
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ripple([0.5, 0.5], 1); }
  });
  canvas.setAttribute('aria-label', 'A length of cloth hanging from a rod. Left and right arrows change the cloth, Enter makes it move.');
  ripple([0.5, 0.95], 0.6);
  window.__loom = { choose, cloth, pick: (i, u, v, x, y) => { window.__revDur = 3; choose(i, { uv: [u, v], x, y }); } };
}
syncUI(current);
