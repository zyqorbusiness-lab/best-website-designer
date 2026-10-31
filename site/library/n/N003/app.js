/* N003 Tidewell Salt - shared app for index.html (desktop) and m.html (phone).
   Same photo + HDRI on both builds. The jar is a real CC-BY model (Glass Jar with Marble Lid 2.0, InGameStudio, Sketchfab) re-materialed in the palette;
   code-made: a wrap label, instanced hollow-pyramid flakes, a stone plinth. The outline wordmark bands and the salt photo are planes
   INSIDE the scene, behind the jar, so the glass refracts them. The bands move only with scroll velocity (and drag),
   then settle: no endless loop. */
import { createStage, THREE, isM, reduced, clamp, smoothstep, damp } from '../../_kit/stage.js';
import { reveals, splitAll, press, magnetic } from '../../_kit/fx/index.js';

splitAll(); reveals(); press('[data-press]');
document.querySelectorAll('.site-cta').forEach((b) => magnetic(b, { strength: 0.25 }));
const css = getComputedStyle(document.documentElement);
const C1 = css.getPropertyValue('--c1').trim() || '#F9DDC7', C2 = css.getPropertyValue('--c2').trim() || '#1B3A2F', C3 = css.getPropertyValue('--c3').trim() || '#E48B62';

/* ---------------- order form: works as UI, sends nothing ---------------- */
const form = document.getElementById('order-form');
if (form) {
  const ok = form.querySelector('.f-ok'); const out = form.querySelector('.st-v');
  const minus = form.querySelector('[data-step="-1"]'), plus = form.querySelector('[data-step="1"]');
  let qty = 1, size = '180 g jar';
  const setQty = (q) => { qty = clamp(q, 1, 6); out.value = out.textContent = String(qty); minus.disabled = qty <= 1; plus.disabled = qty >= 6; };
  form.querySelectorAll('[data-step]').forEach((b) => b.addEventListener('click', () => setQty(qty + +b.dataset.step)));
  form.querySelectorAll('.size').forEach((b) => b.addEventListener('click', () => { size = b.dataset.size; form.querySelectorAll('.size').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); }));
  setQty(1);
  const email = form.querySelector('[name=email]'), err = email.closest('.f').querySelector('.f-err');
  const check = () => { const v = email.value.trim(); const m = !v ? 'Please add an email for the order note.' : (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? 'That email does not look complete.' : ''); err.textContent = m; email.setAttribute('aria-invalid', m ? 'true' : 'false'); return !m; };
  email.addEventListener('blur', () => { if (email.value) check(); });
  email.addEventListener('input', () => { if (email.getAttribute('aria-invalid') === 'true') check(); });
  form.addEventListener('submit', (e) => {
    e.preventDefault(); if (!check()) { email.focus(); return; }
    const btn = form.querySelector('[type=submit]'); form.classList.add('is-sending'); btn.disabled = true; btn.setAttribute('aria-busy', 'true');
    setTimeout(() => {
      form.classList.remove('is-sending'); btn.disabled = false; btn.removeAttribute('aria-busy');
      ok.querySelector('[data-ok-sum]').textContent = `${qty} x ${size}${form.querySelector('[name=grind]').checked ? ' + a pinch pot' : ''}`;
      ok.hidden = false; ok.querySelector('.f-again').focus({ preventScroll: true });
    }, reduced ? 0 : 650);
  });
  ok.querySelector('.f-again').addEventListener('click', () => { form.reset(); setQty(1); email.removeAttribute('aria-invalid'); err.textContent = ''; ok.hidden = true; email.focus(); });
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

/* ---------------- the 3D scene ---------------- */
const pin = document.querySelector('.pin');
const hint = document.querySelector('[data-hint]'), hintWrap = document.querySelector('.pin-hint');
const stage = await createStage({
  el: '[data-stage]', alpha: false, clearColor: C1, lazy: false,
  camera: { fov: 30, position: [0, 0.62, 5.6], target: [0, 0.42, 0] },
  exposure: 1.0, envIntensity: 0.9, fitFov: true,
  label: 'A glass jar of sea salt flakes on a stone plinth in front of the Tidewell wordmark. Swipe sideways to turn it.'
});

if (!stage.failed) {
  const T = THREE;
  stage.scene.background = new T.Color(C1);
  await document.fonts.load('800 200px "Bricolage Grotesque"').catch(() => {});

  /* outline wordmark bands, drawn once into canvases (wrap-repeat, offset by scroll velocity) */
  function bandTexture(text, { h = 512, size = 400, stroke = 6, fill = false, font = '800', track = -0.04 } = {}) {
    const c = document.createElement('canvas'); const g = c.getContext('2d');
    g.font = `${font} ${size}px "Bricolage Grotesque", system-ui, sans-serif`;
    const gap = size * 0.5; let w = 0; const chars = [...text];
    const widths = chars.map((ch) => g.measureText(ch).width + size * track); w = widths.reduce((a, b) => a + b, 0) + gap;
    c.width = Math.min(4096, Math.ceil(w)); c.height = h; const k = c.width / Math.ceil(w);
    g.scale(k, 1); g.font = `${font} ${size}px "Bricolage Grotesque", system-ui, sans-serif`; g.textBaseline = 'middle';
    g.lineJoin = 'round'; g.lineWidth = stroke / k; g.strokeStyle = C2; g.fillStyle = C2;
    let x = gap / 2;
    chars.forEach((ch, i) => {
      if (fill) g.fillText(ch, x, h * 0.54);
      else { g.lineWidth = stroke / k; g.strokeStyle = C2; g.strokeText(ch, x, h * 0.54); g.lineWidth = (stroke * 0.42) / k; g.strokeStyle = C1; g.strokeText(ch, x, h * 0.54); }
      x += widths[i];
    });
    const tx = new T.CanvasTexture(c); tx.colorSpace = T.SRGBColorSpace; tx.wrapS = T.RepeatWrapping; tx.anisotropy = 4;
    return { tx, aspect: Math.ceil(w) / h };
  }
  const A = bandTexture('TIDEWELL', { size: 420, stroke: 9 });
  // the band fades in from its left end so it never runs through the headline column
  const bandMat = (t) => { const m = new T.MeshBasicMaterial({ map: t.tx, transparent: true, depthWrite: false, toneMapped: false });
    m.onBeforeCompile = (sh) => {
      sh.vertexShader = 'varying vec2 vPl;\n' + sh.vertexShader.replace('#include <uv_vertex>', '#include <uv_vertex>\n vPl = uv;');
      sh.fragmentShader = 'uniform float uFade; varying vec2 vPl;\n' + sh.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\n diffuseColor.a *= smoothstep(0.0, uFade, vPl.x);');
      sh.uniforms.uFade = m.userData.fade;
    };
    m.userData.fade = { value: 0.28 }; return m; };
  const bandA = new T.Mesh(new T.PlaneGeometry(1, 1), bandMat(A));
  stage.add(bandA);

  /* the photo card (arch), real CC0 photo */
  const photoTex = await stage.loadTexture('img/salt-flakes.webp', { anisotropy: 4 });
  function archGeo(w, h) {
    const s = new T.Shape(); const r = w / 2;
    s.moveTo(-r, 0); s.lineTo(r, 0); s.lineTo(r, h - r); s.absarc(0, h - r, r, 0, Math.PI, false); s.lineTo(-r, 0);
    const g = new T.ShapeGeometry(s, 48); const p = g.attributes.position, uv = g.attributes.uv;
    for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + r) / w, p.getY(i) / h);
    return g;
  }
  const photo = new T.Mesh(archGeo(1.62, 2.16), new T.MeshBasicMaterial({ map: photoTex, toneMapped: false }));
  stage.add(photo);

  /* the jar: real CC-BY model ("Glass Jar with Marble Lid 2.0" by InGameStudio, Sketchfab). The set holds three jars;
     this concept uses the middle one (body + marble lid + seal), re-materialed in the page palette (geometry untouched). */
  const jar = new T.Group(); stage.add(jar);
  const glass = new T.MeshPhysicalMaterial({ color: '#ffffff', metalness: 0, roughness: 0.04, transmission: 1, thickness: 0.18, ior: 1.5,
    attenuationColor: new T.Color('#dceee4'), attenuationDistance: 1.4, specularIntensity: 1, clearcoat: 0.6, clearcoatRoughness: 0.05, envMapIntensity: 1.2, side: T.DoubleSide, transparent: false });
  const jg = await stage.load(stage.asset('models/glass_jar_marble_lid.glb'));
  const pick = (re) => { const out = []; jg.scene.traverse((n) => { if (n.isMesh && re.test(n.name)) out.push(n); }); return out; };
  const bodyM = pick(/003/), lidM = pick(/00[57]/);
  jg.scene.updateMatrixWorld(true);
  const bb = new T.Box3(); bodyM.forEach((m) => bb.expandByObject(m));
  const ctr = bb.getCenter(new T.Vector3()), Hraw = bb.max.y - bb.min.y;
  const Hj = 0.9, K = Hj / Hraw, R = (bb.max.x - bb.min.x) / 2 * K;
  const place = (m, mat, parent) => { const g = m.geometry.clone(); g.applyMatrix4(m.matrixWorld); g.translate(-ctr.x, -bb.min.y, -ctr.z); g.scale(K, K, K);
    const mesh = new T.Mesh(g, mat); mesh.castShadow = true; parent.add(mesh); return mesh; };
  bodyM.forEach((m) => place(m, glass, jar));
  const body = jar.children[0];
  // flakes: hollow square pyramids (open cones with 4 sides), instanced
  const flakeGeo = new T.ConeGeometry(1, 0.55, 4, 1, true); flakeGeo.rotateX(Math.PI);
  const flakeMat = new T.MeshStandardMaterial({ color: '#fbf7f1', roughness: 0.32, metalness: 0, side: T.DoubleSide });
  const N = 420; const flakes = new T.InstancedMesh(flakeGeo, flakeMat, N);
  const m4 = new T.Matrix4(), q = new T.Quaternion(), e = new T.Euler(), v = new T.Vector3(), sc = new T.Vector3();
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < N; i++) {
    const a = rnd() * Math.PI * 2, rr = Math.sqrt(rnd()) * (R - 0.07); const top = 0.5 + 0.06 * Math.cos(rr * 5);
    v.set(Math.cos(a) * rr, 0.03 + rnd() * (top - 0.03), Math.sin(a) * rr);
    e.set(rnd() * 6.28, rnd() * 6.28, rnd() * 6.28); q.setFromEuler(e); const s = 0.022 + rnd() * 0.03; sc.set(s, s * (0.6 + rnd() * 0.5), s);
    flakes.setMatrixAt(i, m4.compose(v, q, sc));
  }
  jar.add(flakes);
  // label: paper wrap with the wordmark, drawn in canvas (palette only)
  const lc = document.createElement('canvas'); lc.width = 1340; lc.height = 300; const lg = lc.getContext('2d');
  lg.fillStyle = C1; lg.fillRect(0, 0, 1340, 300); lg.strokeStyle = C2; lg.lineWidth = 3; lg.strokeRect(18, 18, 1304, 264);
  lg.fillStyle = C2; lg.textAlign = 'center'; lg.font = '800 120px "Bricolage Grotesque", system-ui'; lg.fillText('TIDEWELL', 670, 160);
  lg.font = '500 30px "JetBrains Mono", ui-monospace, monospace'; lg.fillText('FLAKY SEA SALT  \u00B7  180 G', 670, 222);
  lg.fillStyle = C3; lg.fillRect(630, 246, 80, 6);
  const labelTex = new T.CanvasTexture(lc); labelTex.colorSpace = T.SRGBColorSpace; labelTex.anisotropy = 4;
  const label = new T.Mesh(new T.CylinderGeometry(R + 0.004, R + 0.004, 0.3, 64, 1, true, -1.5, 3.0), new T.MeshStandardMaterial({ map: labelTex, roughness: 0.85 }));
  label.position.y = 0.4; jar.add(label);
  // lid: the model's marble lid and seal, the marble tinted towards the coral accent
  const lid = new T.Group(); jar.add(lid);
  lidM.forEach((m) => { const src = m.material; const isMarble = !!src.map;
    const mat = isMarble ? new T.MeshPhysicalMaterial({ map: src.map, color: new T.Color(C3).lerp(new T.Color('#ffffff'), 0.35), roughness: 0.32, clearcoat: 0.9, clearcoatRoughness: 0.16 })
      : new T.MeshStandardMaterial({ color: new T.Color(C2).lerp(new T.Color('#ffffff'), 0.12), roughness: 0.6 });
    place(m, mat, lid); });
  { const lb = new T.Box3().setFromObject(lid), lc = lb.getCenter(new T.Vector3());
    lid.children.forEach((c) => c.geometry.translate(0, -lc.y, 0)); lid.position.y = lc.y; }
  const lidY = lid.position.y;
  // plinth
  const plinth = new T.Mesh(new T.CylinderGeometry(0.58, 0.6, 0.14, 96), new T.MeshPhysicalMaterial({ color: C2, roughness: 0.42, clearcoat: 0.5, clearcoatRoughness: 0.3 }));
  plinth.position.y = -0.07;
  const base = new T.Group(); base.add(plinth, jar); stage.add(base);
  const shadow = stage.contactShadow({ size: 1.6, opacity: 0.55, blur: 2.2, darkness: 1.4, height: 1.0, update: 'once' });
  if (shadow) base.add(shadow.group);

  const key = new T.DirectionalLight('#fff3e6', 1.6); key.position.set(-2.5, 3, 2.5); stage.scene.add(key);
  const rim = new T.DirectionalLight('#ffe2cf', 1.2); rim.position.set(3, 1.5, -2); stage.scene.add(rim);

  /* layout: desktop puts the scene in the right half; a portrait screen stacks it under the copy */
  let portrait = null;
  function layout() {
    const p = stage.size.w / stage.size.h < 0.9;
    if (p === portrait) return; portrait = p;
    if (!p) {
      base.position.set(1.05, -0.62, 0.3); base.scale.setScalar(1.05);
      photo.position.set(1.05, -0.6, -1.0); photo.scale.setScalar(0.93);
      bandA.scale.set(4.3, 1.3, 1); bandA.position.set(-0.3 + 4.3 / 2, -0.12, -0.42);
      A.tx.repeat.x = 4.3 / (1.3 * A.aspect); bandA.material.userData.fade.value = 0.3;
    } else {
      base.position.set(0, -1.34, 0.3); base.scale.setScalar(0.86);
      photo.position.set(0, -1.28, -1.0); photo.scale.setScalar(0.78);
      bandA.scale.set(4.2, 0.95, 1); bandA.position.set(0, -0.9, -0.42);
      A.tx.repeat.x = 4.2 / (0.95 * A.aspect); bandA.material.userData.fade.value = 0.12;
    }
    shadow?.draw();
  }
  layout();

  /* interaction: swipe/drag turns the jar (kit spin); the band reacts to scroll velocity + drag velocity */
  const turn = stage.spin(jar, { auto: 0.06, sensitivity: 0.009, label: 'Glass jar of Tidewell salt: drag or use the arrow keys to turn it' });
  let prog = reduced ? 1 : 0, lastY = scrollY, vel = 0, offA = 0.08;
  if (!reduced) stage.scroll(pin, (p) => { prog = p; document.documentElement.style.setProperty('--pp', p.toFixed(3)); stage.invalidate(); });
  const camZ = 5.6;
  stage.onFrame((dt) => {
    layout();
    const y = scrollY; const dy = y - lastY; lastY = y;
    if (!reduced) { const target = dy / Math.max(dt, 1 / 120) * 0.00011 + turn.velocity * 0.6; vel = damp(vel, target, 5, dt); }
    offA += vel * dt;
    A.tx.offset.x = offA;
    jar.rotation.y = turn.angle + prog * Math.PI;
    const lt = reduced ? 1 : smoothstep(0.3, 0.62, prog);
    lid.position.set(lt * 0.16, lidY + lt * 0.34, 0); lid.rotation.z = -lt * 0.55;
    stage.camera.position.z = camZ - prog * 0.5 * (portrait ? 0.4 : 1); stage.camera.position.y = 0.62 - prog * 0.08;
    stage.camera.lookAt(stage.target);
    if (hint) { const t = prog < 0.3 ? 'Scroll to open the jar' : prog < 0.66 ? 'Lid off, look inside' : 'Keep going'; if (hint.textContent !== t) hint.textContent = t; }
    if (hintWrap) hintWrap.style.opacity = prog > 0.95 ? '0' : '1';
    return Math.abs(vel) > 0.0005;
  });
  stage.loaded();
  window.__salt = { stage, turn, set: (p) => { prog = p; stage.invalidate(); }, kick: (v) => { vel = v; stage.invalidate(); } };
}
