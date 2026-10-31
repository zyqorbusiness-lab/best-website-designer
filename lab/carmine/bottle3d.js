/* Carmine No.7: the bottle, in 3D. A faceted glass ink bottle, carmine ink, a fountain pen and a sheet of paper, all
   modelled in code with three.js (Zyqor Studio, MIT; no downloaded models). Scroll: the cap lifts, the pen dips, the nib
   writes one red line. Phone: same scene, lighter geometry, DPR capped at 1.5. Reduced motion: one still frame (the dip).
   No WebGL: the poster image stays. */
import * as THREE from 'three';
import { RoomEnvironment } from '../../vendor/three/addons/environments/RoomEnvironment.js';


function hasGL() { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } }
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };

function init(root) {
  const isM = document.documentElement.dataset.build === 'm';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) root.classList.add('cm3d-still');
  if (!hasGL()) { root.classList.add('cm3d-nogl'); return; }
  const canvas = root.querySelector('canvas');
  const stage = root.querySelector('.cm3d-stage');
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' }); }
  catch (e) { root.classList.add('cm3d-nogl'); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, isM ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const PAPER = new THREE.Color('#F4EFE9');
  const scene = new THREE.Scene();
  scene.background = PAPER;
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const camera = new THREE.PerspectiveCamera(isM ? 40 : 30, 1, 0.05, 60);

  const key = new THREE.DirectionalLight(0xfff4e8, 2.2);
  key.position.set(-3, 6, 4); key.castShadow = true;
  key.shadow.mapSize.set(isM ? 1024 : 2048, isM ? 1024 : 2048);
  Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 0.5, far: 20 });
  key.shadow.bias = -0.0004; key.shadow.radius = 4;
  scene.add(key, new THREE.HemisphereLight(0xffffff, 0xe9d9c8, 0.5));

  /* desk + paper */
  const desk = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ color: 0xEDE5DA, roughness: 0.95 }));
  desk.rotation.x = -Math.PI / 2; desk.receiveShadow = true; scene.add(desk);
  const sheet = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.01, 2.97), new THREE.MeshStandardMaterial({ color: 0xFBF8F3, roughness: 0.9 }));
  sheet.position.set(1.55, 0.005, 0.35); sheet.rotation.y = -0.18; sheet.receiveShadow = true; scene.add(sheet);
  /* faint ruled lines on the sheet */
  const ruleMat = new THREE.MeshBasicMaterial({ color: 0xE3D6CB });
  for (let i = 0; i < 9; i++) { const r = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.006), ruleMat); r.rotation.x = -Math.PI / 2; r.position.set(0, 0.0112, -1.0 + i * 0.26); sheet.add(r); }

  /* the bottle: an eight-sided glass lathe with a thick base and a short neck */
  const seg = 8;
  const prof = [[0, 0], [0.62, 0], [0.70, 0.04], [0.72, 0.12], [0.72, 0.95], [0.66, 1.06], [0.30, 1.16], [0.24, 1.20], [0.24, 1.42], [0.27, 1.44], [0.27, 1.5]].map(([x, y]) => new THREE.Vector2(x, y));
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: 0.04, transmission: 1, thickness: 0.35, ior: 1.5, envMapIntensity: 1.2, clearcoat: 1, clearcoatRoughness: 0.03, specularIntensity: 1, attenuationColor: new THREE.Color('#f3ece6'), attenuationDistance: 3 });
  const bottle = new THREE.Group(); scene.add(bottle);
  const glass = new THREE.Mesh(new THREE.LatheGeometry(prof, seg), glassMat); glass.rotation.y = Math.PI / 8; glass.castShadow = true; bottle.add(glass);
  /* ink inside: a lathe solid whose height we scale (level drops as the pen drinks) */
  const inkProf = [[0, 0.07], [0.6, 0.07], [0.64, 0.12], [0.64, 1.0], [0, 1.0]].map(([x, y]) => new THREE.Vector2(x, y));
  const inkMat = new THREE.MeshPhysicalMaterial({ color: 0x6A0A1C, roughness: 0.1, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.04 });
  const ink = new THREE.Mesh(new THREE.LatheGeometry(inkProf, seg), inkMat); ink.rotation.y = Math.PI / 8; bottle.add(ink);
  ink.scale.y = 0.82;
  /* paper label on the front face */
  const lc = document.createElement('canvas'); lc.width = 512; lc.height = 512; const lx = lc.getContext('2d');
  const labelTex = new THREE.CanvasTexture(lc); labelTex.colorSpace = THREE.SRGBColorSpace; labelTex.anisotropy = 4;
  function drawLabel() {
    lx.fillStyle = '#F7F1EA'; lx.fillRect(0, 0, 512, 512);
    lx.strokeStyle = '#96122A'; lx.lineWidth = 6; lx.strokeRect(22, 22, 468, 468);
    lx.fillStyle = '#96122A'; lx.textAlign = 'center';
    lx.font = '400 150px Anton, Impact, sans-serif'; lx.fillText('No.7', 256, 250);
    lx.font = '600 44px "Space Grotesk", system-ui, sans-serif'; lx.fillText('CARMINE', 256, 340);
    lx.font = '500 26px "Space Grotesk", system-ui, sans-serif'; lx.fillText('FOUNTAIN PEN INK · 50 ML', 256, 410);
    labelTex.needsUpdate = true;
  }
  drawLabel(); if (document.fonts && document.fonts.load) Promise.all([document.fonts.load('400 150px Anton'), document.fonts.load('600 44px "Space Grotesk"')]).then(() => { drawLabel(); render(); }).catch(() => {});
  const label = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.52), new THREE.MeshStandardMaterial({ map: labelTex, roughness: 0.85 }));
  const apo = 0.72 * Math.cos(Math.PI / seg) + 0.004; label.position.set(0, 0.52, apo); bottle.add(label);
  /* cap */
  const cap = new THREE.Group(); bottle.add(cap);
  const capMat = new THREE.MeshStandardMaterial({ color: 0x2B0A0E, roughness: 0.35, metalness: 0.1 });
  const capBody = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.42, isM ? 24 : 40), capMat); capBody.position.y = 0.21; capBody.castShadow = true; cap.add(capBody);
  const capRing = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.018, 8, isM ? 24 : 40), new THREE.MeshStandardMaterial({ color: 0xC9A15A, metalness: 1, roughness: 0.25 })); capRing.rotation.x = Math.PI / 2; capRing.position.y = 0.02; cap.add(capRing);
  cap.position.y = 1.4;

  /* the pen: ivory barrel, gold band, gold nib (extruded outline with a breather hole and a slit) */
  const pen = new THREE.Group(); scene.add(pen);
  const gold = new THREE.MeshStandardMaterial({ color: 0xD7B06A, metalness: 1, roughness: 0.22 });
  const barrelMat = new THREE.MeshPhysicalMaterial({ color: 0xB3172F, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.06 });
  const S = isM ? 28 : 48;
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.06, 0.5, S), new THREE.MeshStandardMaterial({ color: 0x2B0A0E, roughness: 0.3 })); grip.position.y = 0.38; pen.add(grip);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.082, 0.05, S), gold); band.position.y = 0.66; pen.add(band);
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.08, 1.7, S), barrelMat); barrel.position.y = 1.52; pen.add(barrel);
  const end = new THREE.Mesh(new THREE.SphereGeometry(0.085, S, 12, 0, Math.PI * 2, 0, Math.PI / 2), barrelMat); end.position.y = 2.37; pen.add(end);
  const nibShape = new THREE.Shape();
  nibShape.moveTo(0, 0); nibShape.bezierCurveTo(0.03, 0.08, 0.07, 0.17, 0.065, 0.3); nibShape.lineTo(-0.065, 0.3); nibShape.bezierCurveTo(-0.07, 0.17, -0.03, 0.08, 0, 0);
  const hole = new THREE.Path(); hole.absarc(0, 0.17, 0.014, 0, Math.PI * 2, true); nibShape.holes.push(hole);
  const nibGeo = new THREE.ExtrudeGeometry(nibShape, { depth: 0.008, bevelEnabled: true, bevelThickness: 0.003, bevelSize: 0.003, bevelSegments: 2, curveSegments: 16 });
  const nib = new THREE.Mesh(nibGeo, gold); nib.position.set(0, 0.0, 0.035); nib.rotation.x = 0.12; nib.castShadow = true; pen.add(nib);
  const slit = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.16, 0.02), new THREE.MeshBasicMaterial({ color: 0x3a2a1a })); slit.position.set(0, 0.085, 0.046); slit.rotation.x = 0.12; pen.add(slit);
  const nibInk = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 8), inkMat); nibInk.position.set(0, 0.03, 0.04); nibInk.scale.set(1, 1.6, 0.6); pen.add(nibInk);
  pen.traverse((o) => { if (o.isMesh) o.castShadow = true; });

  /* the written line: a tube on the paper, revealed with drawRange */
  const pts = [];
  for (let i = 0; i <= 120; i++) { const t = i / 120; pts.push(new THREE.Vector3(-0.7 + t * 1.4, 0.014, 0.1 + Math.sin(t * Math.PI * 3.2) * 0.13 * (1 - t * 0.4) + Math.sin(t * 19) * 0.02)); }
  const stroke = new THREE.CatmullRomCurve3(pts);
  const strokeGeo = new THREE.TubeGeometry(stroke, 240, 0.012, 6, false);
  const strokeMesh = new THREE.Mesh(strokeGeo, new THREE.MeshStandardMaterial({ color: 0x96122A, roughness: 0.35 })); strokeMesh.scale.y = 0.25; sheet.add(strokeMesh);
  const strokeCount = strokeGeo.index.count;
  strokeGeo.setDrawRange(0, 0);

  /* story */
  const steps = [...root.querySelectorAll('.cm3d-steps li')];
  let lastStep = -1;
  const camA = new THREE.Vector3(isM ? 2.2 : 3.6, isM ? 2.4 : 2.1, isM ? 5.6 : 4.6), lookA = new THREE.Vector3(isM ? 0.25 : 0.55, 0.75, 0);
  const camB = new THREE.Vector3(isM ? 1.7 : 2.1, isM ? 2.9 : 2.5, isM ? 5.0 : 3.7), lookB = new THREE.Vector3(isM ? 0 : 0.35, 1.05, 0);
  const camC = new THREE.Vector3(isM ? 2.0 : 2.4, isM ? 3.4 : 2.6, isM ? 3.6 : 2.6), lookC = new THREE.Vector3(1.5, 0.05, 0.3);
  const cp = new THREE.Vector3(), lk = new THREE.Vector3(), tmp = new THREE.Vector3();
  const penOver = new THREE.Vector3(0, 2.4, 0), penDip = new THREE.Vector3(0, 0.62, 0);
  const sheetPt = (t) => { const p = stroke.getPointAt(clamp(t)).clone(); sheet.localToWorld(p); return p; };

  function place(p) {
    /* 0-.3 orbit + uncap, .3-.6 dip, .6-1 write */
    const uncap = smooth(0.08, 0.26, p);
    cap.position.set(-0.95 * uncap, 1.4 * (1 - uncap) + Math.sin(uncap * Math.PI) * 0.7, 0.4 * uncap);
    cap.rotation.z = Math.sin(uncap * Math.PI) * 0.5;
    const enter = smooth(0.22, 0.36, p), dip = smooth(0.36, 0.48, p) - smooth(0.52, 0.6, p), write = smooth(0.62, 0.94, p), toPaper = smooth(0.56, 0.66, p);
    const over = tmp.copy(penOver).add(new THREE.Vector3((1 - enter) * -1.2, (1 - enter) * 1.4, 0));
    const pos = over.clone().lerp(penDip, dip);
    const paperPos = sheetPt(write).add(new THREE.Vector3(0, 0.0, 0));
    pos.lerp(paperPos, toPaper);
    pen.position.copy(pos);
    pen.rotation.set(toPaper * -0.45, 0, (1 - toPaper) * 0.0 + toPaper * 0.35);
    pen.visible = enter > 0.001;
    nibInk.visible = p > 0.47;
    ink.scale.y = 0.82 - 0.06 * smooth(0.45, 0.6, p) + Math.sin(p * 90) * 0.004 * dip;
    strokeGeo.setDrawRange(0, Math.floor(strokeCount * write / 3) * 3);
    const wAB = smooth(0.18, 0.4, p), wC = smooth(0.56, 0.7, p);
    const orbit = (1 - wAB) * (p * 1.6 - 0.25);
    cp.copy(camA).applyAxisAngle(THREE.Object3D.DEFAULT_UP, orbit).lerp(camB, wAB).lerp(camC, wC);
    lk.copy(lookA).lerp(lookB, wAB).lerp(lookC, wC);
    camera.position.copy(cp); camera.lookAt(lk);
    const si = p < 0.3 ? 0 : p < 0.58 ? 1 : 2;
    if (si !== lastStep) { steps.forEach((s, i) => s.classList.toggle('on', i === si)); lastStep = si; }
  }

  function render() {
    place(cur);
    renderer.render(scene, camera);
    if (!root.classList.contains('cm3d-ready')) root.classList.add('cm3d-ready');
  }
  function progress() {
    if (reduced) return 0.2;
    const r = root.getBoundingClientRect(); const span = root.offsetHeight - innerHeight;
    return span > 0 ? clamp(-r.top / span) : 0;
  }
  let cur = progress(), target = cur, inView = false, raf = 0;
  function tick() {
    raf = 0; target = progress();
    cur += (target - cur) * 0.14; if (Math.abs(target - cur) < 0.0004) cur = target;
    render();
    if (inView && cur !== target) raf = requestAnimationFrame(tick);
  }
  const kick = () => { if (inView && !raf) raf = requestAnimationFrame(tick); };
  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); render();
  }
  new ResizeObserver(resize).observe(stage);
  new IntersectionObserver((es) => { inView = es[0].isIntersecting; if (inView) { cur = target = progress(); kick(); } }, { rootMargin: '200px 0px' }).observe(root);
  addEventListener('scroll', kick, { passive: true });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) kick(); });
  resize();
}

const root = document.querySelector('.cm3d');
if (root) init(root);
