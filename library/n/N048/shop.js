/* N048 Ironbark Barbers: shop.js, the walk-in shop for #shop and #services (one sticky canvas behind both sections).
   Built from CC0 Poly Haven scans: Barber Shop Chair 01 (Fernando Quinn), Ornate Mirror 01 (James Ray Cock), Hanging
   Industrial Lamp (Kuutti Siitonen), Metal Stool 01 (Ulan Cabanilla), Standing Chalkboard 01 (ParzivalCG), Shelf 01
   (Gabriel Radic). Floor tiles and the board/mirror lettering are canvases drawn here. Same files on phone and desktop.
   API: const w = await createShop({ el, services }); w.set(shopP, servP); w.slot (current service). */
import { createStage, THREE, isM, reduced, damp, clamp, smoothstep, lerp } from '../../_kit/stage.js';
import { drawText, textWidth, GLYPH_MS } from './chalk.js';

const BONE = '#EFE7DA', SLATE = '#17303A', RED = '#C8402F', REDINK = '#A53D31', SLATE2 = '#42555A', CHALK = '#E2DCD0';
const ease = (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2);   /* in-out-quart */

function fadeMat(m, u) {                         /* bone silhouette -> full material, one uniform per prop */
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uFade = u; sh.uniforms.uBone = { value: new THREE.Color(CHALK) };
    sh.fragmentShader = 'uniform float uFade; uniform vec3 uBone;\n' + sh.fragmentShader.replace('#include <dithering_fragment>', 'gl_FragColor.rgb = mix(uBone, gl_FragColor.rgb, uFade);\n#include <dithering_fragment>');
  };
  m.customProgramCacheKey = () => 'zkfade'; m.needsUpdate = true;
}

export async function createShop({ el, services, label, chair }) {
  const stage = await createStage({
    el, exposure: 1.0, envIntensity: 0.8, shadows: true, demand: true, fitFov: true, antialias: true,
    camera: { fov: 34, position: [0, 1.15, 1.6], target: [0, 0.85, 0] },
    label: label || 'Ironbark Barbers: the shop, with the barber chair, a mirror, two hanging lamps, a stool, a shelf and the price board.'
  });
  if (stage.failed) return { failed: true, set() {}, slot: 0 };
  const { scene, camera, renderer } = stage;
  scene.background = new THREE.Color(BONE);
  scene.fog = new THREE.Fog(BONE, 6.5, 13);

  /* room: checker floor (canvas) + back and side wall */
  const fc = document.createElement('canvas'); fc.width = fc.height = 256; const fx = fc.getContext('2d');
  for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { fx.fillStyle = (x + y) % 2 ? '#9FA9A8' : BONE; fx.fillRect(x * 64, y * 64, 64, 64); }
  const ftex = new THREE.CanvasTexture(fc); ftex.colorSpace = THREE.SRGBColorSpace; ftex.wrapS = ftex.wrapT = THREE.RepeatWrapping; ftex.repeat.set(5, 5); ftex.anisotropy = 8;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.MeshStandardMaterial({ map: ftex, roughness: 0.55, metalness: 0 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const wallM = new THREE.MeshStandardMaterial({ color: new THREE.Color(CHALK), roughness: 0.95 });
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(12, 6), wallM); wall.position.set(0, 3, -1.75); wall.receiveShadow = true; scene.add(wall);
  const dado = new THREE.Mesh(new THREE.BoxGeometry(12, 0.06, 0.04), new THREE.MeshStandardMaterial({ color: new THREE.Color(SLATE2), roughness: 0.7 })); dado.position.set(0, 1.0, -1.72); scene.add(dado);
  const lower = new THREE.Mesh(new THREE.PlaneGeometry(12, 1.0), new THREE.MeshStandardMaterial({ color: new THREE.Color('#D3CCC0'), roughness: 0.9 })); lower.position.set(0, 0.5, -1.745); lower.receiveShadow = true; scene.add(lower);

  /* lights: soft fill + one warm key spot from lamp 1 (the only real-time shadow) */
  const hemi = new THREE.HemisphereLight(0xfff6ea, 0xb8b0a4, 0.55); scene.add(hemi);
  const key = new THREE.SpotLight(0xffe2bf, 0, 9, 0.62, 0.55, 1.2); key.position.set(0.95, 2.78, 0.15); key.target.position.set(0, 0.4, 0);
  key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02; scene.add(key, key.target);
  const key2 = new THREE.PointLight(0xffe6c8, 0, 6, 1.4); key2.position.set(-0.95, 2.5, -0.45); scene.add(key2);

  const load = (n) => stage.load(stage.asset('models/' + n + '.glb')).then((g) => g.scene);
  const [chairC, mirrorS, lampS, stoolS, boardS, shelfS] = await Promise.all([chair || null, ...['ornate_mirror_01', 'hanging_industrial_lamp', 'metal_stool_01', 'standing_chalkboard_01', 'shelf_01'].map(load)]);
  const chairS = chairC || await load('barbershopchair_01');
  const shadowAll = (o, cast = true) => o.traverse((m) => { if (m.isMesh) { m.castShadow = cast; m.receiveShadow = true; } });

  /* chair: pivot -> lift (hydraulic dip) -> scan */
  const pivot = new THREE.Group(), lift = new THREE.Group(); lift.add(chairS); pivot.add(lift); scene.add(pivot); shadowAll(chairS);

  /* props, each with its own fade uniform */
  const props = [];
  const addProp = (obj, pos, rotY = 0, scale = 1) => {
    const u = { value: reduced ? 1 : 0 }; obj.traverse((m) => { if (m.isMesh) fadeMat(m.material, u); });
    obj.position.set(...pos); obj.rotation.y = rotY; obj.scale.setScalar(scale); shadowAll(obj); scene.add(obj);
    const p = { obj, u, t: reduced ? 1 : 0, on: reduced }; props.push(p); return p;
  };
  mirrorS.traverse((m) => { if (m.isMesh) m.material.envMapIntensity = 2.2; });
  const mirror = new THREE.Group(); mirror.add(mirrorS); addProp(mirror, [0, 1.95, -1.73], 0, 2.15);
  const shelf = addProp(shelfS, [1.65, 0, -1.74], 0, 1);
  const stool = addProp(stoolS, [-1.25, 0, -0.55], 0.4, 1);
  const board = new THREE.Group(); board.add(boardS); addProp(board, [1.2, 0, 0.15], -0.55, 1);

  stage.contactShadow({ size: 2.0, opacity: 0.4, blur: 2.4, color: 0x17303a, exclude: props.map((p) => p.obj) });
  /* lamps (two of the same scan); emissive is the bulb */
  const lamps = [[0.95, 0.15], [-0.95, -0.45]].map(([x, z], i) => {
    const l = i ? lampS.clone(true) : lampS; l.position.set(x, 3.05, z); l.traverse((m) => { if (m.isMesh) { m.material = m.material.clone(); m.castShadow = false; } }); scene.add(l);
    const mats = []; l.traverse((m) => { if (m.isMesh && m.material.emissive) mats.push(m.material); });
    return { l, mats, v: reduced ? 1 : 0, want: reduced ? 1 : 0, t0: 0 };
  });

  /* board lettering: a canvas plane on the board's front face */
  const bc = document.createElement('canvas'); bc.width = 512; bc.height = 640; const bx = bc.getContext('2d');
  const btex = new THREE.CanvasTexture(bc); btex.colorSpace = THREE.SRGBColorSpace; btex.anisotropy = 8;
  const bPlane = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.9), new THREE.MeshStandardMaterial({ map: btex, roughness: 0.95, metalness: 0 }));
  const bu = props[3].u; fadeMat(bPlane.material, bu);
  bPlane.position.set(0.013, 0.98, 0.205); bPlane.rotation.x = -0.245; board.add(bPlane);

  /* mirror lettering: painted on the glass, aria-hidden (the real name is in the HTML) */
  const mc = document.createElement('canvas'); mc.width = 512; mc.height = 512; const mx = mc.getContext('2d');
  const mtex = new THREE.CanvasTexture(mc); mtex.colorSpace = THREE.SRGBColorSpace;
  const mPlane = new THREE.Mesh(new THREE.PlaneGeometry(0.29, 0.29), new THREE.MeshBasicMaterial({ map: mtex, transparent: true, depthWrite: false, toneMapped: false }));
  fadeMat(mPlane.material, props[0].u);
  mPlane.position.set(0, 0.02, 0.03); mirror.add(mPlane);

  try { await Promise.all([document.fonts.load('80px Anton'), document.fonts.load('700 40px "Inter Tight"')]); } catch {}

  let slot = 0, writeT = 1, writeStart = 0, writeDur = 1;
  function paintBoard(i, t) {
    const s = services[i]; bx.fillStyle = SLATE; bx.fillRect(0, 0, 512, 640);
    bx.strokeStyle = 'rgba(226,220,208,.08)'; for (let k = 0; k < 40; k++) { bx.lineWidth = 6 + (k % 5) * 3; bx.beginPath(); bx.moveTo(-20, 40 + k * 16); bx.bezierCurveTo(140, 20 + k * 16, 360, 60 + k * 16, 540, 30 + k * 16); bx.stroke(); }
    bx.fillStyle = CHALK; bx.textAlign = 'center';
    bx.font = '64px Anton, Impact, sans-serif'; bx.fillText('IRONBARK', 256, 96);
    bx.font = '500 22px "JetBrains Mono", monospace'; bx.fillText('TODAY  /  SAMPLE PRICES', 256, 134);
    bx.fillRect(96, 160, 320, 3);
    bx.font = '700 46px "Inter Tight", Arial, sans-serif'; bx.fillText(s.name, 256, 236);
    bx.font = '500 26px "JetBrains Mono", monospace'; bx.fillText(s.time.toUpperCase(), 256, 282);
    const str = '$' + s.price, h = 190; drawText(bx, str, 256 - textWidth(str, h) / 2, 330, h, t, CHALK);
    bx.font = '500 20px "JetBrains Mono", monospace'; bx.fillText('SAMPLE PRICE', 256, 596);
    btex.needsUpdate = true;
  }
  function paintMirror(i) {
    mx.clearRect(0, 0, 512, 512); mx.textAlign = 'center';
    mx.fillStyle = 'rgba(239,231,218,.92)'; mx.font = '108px Anton, Impact, sans-serif'; mx.fillText('IRONBARK', 256, 208);
    mx.fillStyle = 'rgba(200,64,47,.95)'; mx.fillRect(96, 236, 320, 6);
    mx.fillStyle = 'rgba(239,231,218,.92)'; mx.font = '700 44px "Inter Tight", Arial, sans-serif'; mx.fillText(services[i].name.toUpperCase(), 256, 312);
    mx.font = '500 24px "JetBrains Mono", monospace'; mx.fillText('BARBERS  /  WALK-INS', 256, 360);
    mtex.needsUpdate = true;
  }
  paintBoard(0, 1); paintMirror(0);

  /* state from the page's scroll engine */
  let shopP = reduced ? 1 : 0, servP = 0, yaw = reduced ? 0 : Math.PI * 0.12, dipT = 9;
  const camA = { p: new THREE.Vector3(0, 1.1, 1.8), t: new THREE.Vector3(0, 0.72, 0) };
  const camB = { p: new THREE.Vector3(0.45, 1.5, 4.4), t: new THREE.Vector3(0.12, 1.05, -0.45) };
  if (isM) { camA.p.set(0, 1.25, 2.7); camA.t.set(0, 0.7, 0); camB.p.set(0.35, 1.75, 6.0); camB.t.set(0.15, 1.1, -0.45); }
  const camC = isM ? { p: new THREE.Vector3(0.95, 1.6, 5.4), t: new THREE.Vector3(0.6, 1.05, -0.25) } : { p: new THREE.Vector3(1.0, 1.42, 4.4), t: new THREE.Vector3(0.55, 0.98, -0.25) };
  const P = new THREE.Vector3(), T = new THREE.Vector3(), tmp = new THREE.Vector3();
  let offX = 0, offY = 0, slow = 0, shadowsOff = false;

  function goSlot(i) {
    if (i === slot) return; slot = i; paintMirror(i);
    writeStart = performance.now(); writeDur = GLYPH_MS * (String(services[i].price).length + 1); writeT = reduced ? 1 : 0; paintBoard(i, writeT);
    dipT = 0; api.onSlot && api.onSlot(i);
  }

  stage.onFrame((dt) => {
    const now = performance.now();
    if (dt > 0.024) slow += dt; else slow = Math.max(0, slow - dt * 0.5);
    if (isM && !shadowsOff && slow > 2) { shadowsOff = true; key.castShadow = false; window.__ironbark = { shadowFallback: true }; }   /* phone: lamp shadow -> contact shadow only (spec 6) */
    /* camera */
    const a = ease(clamp(shopP / 0.4)), c = smoothstep(0, 0.14, servP);
    P.lerpVectors(camA.p, camB.p, a); T.lerpVectors(camA.t, camB.t, a);
    P.lerp(camC.p, c); T.lerp(camC.t, c);
    camera.position.copy(P); camera.lookAt(T);
    /* frame offset for the copy panel: desktop scene sits left (copy right 42%), phone scene sits up (copy below) */
    const w = stage.size.w, h = stage.size.h;
    const wantX = isM ? 0 : 0.2 * w * c, wantY = isM ? h * (0.14 * a * (1 - c) + 0.21 * c) : 0;
    offX = damp(offX, wantX, 8, dt); offY = damp(offY, wantY, 8, dt);
    camera.setViewOffset(w, h, offX, offY, w, h);
    let busy = Math.abs(offX - wantX) > 0.5 || Math.abs(offY - wantY) > 0.5;
    /* lamps */
    lamps[0].want = shopP >= 0.25 ? 1 : 0; lamps[1].want = shopP >= 0.45 ? 1 : 0; if (reduced) lamps.forEach((l) => (l.want = 1));
    lamps.forEach((l) => {
      if (l.want !== l.target) { l.target = l.want; l.t0 = now; l.from = l.v; }
      const e = (now - l.t0) / (l.target ? 300 : 200);
      if (e < 1 && !reduced) { l.v = lerp(l.from, l.target, e); if (l.target && e > 0.33 && e < 0.33 + 40 / 300) l.v = 0.2; busy = true; } else l.v = l.target;
      l.mats.forEach((m) => (m.emissiveIntensity = 0.15 + l.v * 6));
    });
    key.intensity = 2.2 + lamps[0].v * 12; key2.intensity = lamps[1].v * 3.2; hemi.intensity = 1.0 + 0.3 * (lamps[0].v + lamps[1].v) / 2;
    /* props fade in, triggered at 0.40 / 0.50 / 0.60 / 0.70 of #shop */
    props.forEach((p, i) => {
      const want = reduced || shopP >= 0.4 + i * 0.1 || servP > 0 ? 1 : 0;
      if (want !== p.goal) { p.goal = want; p.t0 = now; p.from = p.u.value; }
      const e = clamp((now - (p.t0 || 0)) / 300); const v = lerp(p.from ?? p.u.value, p.goal, 1 - Math.pow(1 - e, 4));
      if (Math.abs(v - p.u.value) > 0.001) { p.u.value = v; busy = true; }
    });
    /* chair: services slots (6 equal parts); the shop phase holds service 0 */
    const s = servP > 0 ? Math.min(services.length - 1, Math.floor(servP * services.length)) : 0;
    goSlot(s);
    const target = s * (Math.PI * 2 / services.length);
    let d = target - yaw; d = Math.atan2(Math.sin(d), Math.cos(d));
    if (Math.abs(d) > 0.0008) { yaw += reduced ? d : d * (1 - Math.exp(-7 * dt)); busy = true; } else yaw = target;
    pivot.rotation.y = yaw;
    /* hydraulic dip: down 2 cm in 160 ms, back in 420 ms */
    dipT += dt; let dip = 0;
    if (!reduced && dipT < 0.58) { dip = dipT < 0.16 ? -0.02 * (1 - Math.pow(1 - dipT / 0.16, 3)) : -0.02 * (1 - (1 - Math.pow(1 - (dipT - 0.16) / 0.42, 4))); busy = true; }
    lift.position.y = dip;
    /* chalk */
    if (writeT < 1) { writeT = clamp((now - writeStart) / writeDur); paintBoard(slot, writeT); busy = true; }
    return busy;
  });
  stage.loaded();
  const api = {
    failed: false, stage,
    get slot() { return slot; },
    set(a, b) { a = reduced ? 1 : a; if (Math.abs(a - shopP) < 1e-4 && Math.abs(b - servP) < 1e-4) return; shopP = a; servP = b; stage.invalidate(); }
  };
  return api;
}
