/* Kilnfold case study — 3D hero vessel (three.js r170, built in code: a lathe-turned stoneware bowl).
   Outside: kiln-red glaze that breaks brown at the rim and stops in drips above a raw speckled-clay foot;
   inside: bisque glaze. Scroll camera: as the hero photo scrolls, the bowl turns and the camera tilts down into it.
   Phone = PC (DPR capped 1.75, fewer segments). No WebGL: nothing is added and the photo hero stands alone.
   Reduced motion: no idle spin; scroll sets a still angle instead of animating. */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const host = document.querySelector('.hero-3d');
const media = document.querySelector('.hero-media');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const phone = document.documentElement.dataset.build === 'm' || innerWidth < 860;
let renderer = null;
try { const t = document.createElement('canvas'); if (t.getContext('webgl2') || t.getContext('webgl')) renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch (e) { renderer = null; }
if (host && media && renderer) {
  host.appendChild(renderer.domElement);
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, phone ? 1.75 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  const cam = new THREE.PerspectiveCamera(30, 1, .1, 50);
  const key = new THREE.DirectionalLight(0xfff1e2, 2.4); key.position.set(-3, 5, 4); scene.add(key);
  scene.add(new THREE.HemisphereLight(0xfff8f0, 0xcdb9a4, .55));

  // profile: foot -> outer wall -> rim -> inner wall -> centre (r, y)
  const raw = [[0, 0], [.34, 0], [.385, .012], [.39, .05], [.355, .075], [.42, .1], [.56, .2], [.7, .36], [.8, .54], [.86, .7], [.885, .8], [.884, .83], [.862, .835], [.846, .8],
    [.82, .69], [.75, .53], [.64, .37], [.5, .24], [.33, .15], [.15, .115], [0, .108]];
  const curve = new THREE.CatmullRomCurve3(raw.map(([r, y]) => new THREE.Vector3(r, y, 0)), false, 'centripetal', .2);
  const pts = curve.getPoints(phone ? 70 : 120).map((v) => new THREE.Vector2(Math.max(0, v.x), v.y));
  const geo = new THREE.LatheGeometry(pts, phone ? 72 : 140); geo.computeVertexNormals();

  // glaze / clay maps drawn in code: x = around, y = along the profile (0 foot centre -> 1 inside centre)
  const W = phone ? 512 : 1024, H = phone ? 256 : 512;
  const cv = (fn) => { const c = document.createElement('canvas'); c.width = W; c.height = H; fn(c.getContext('2d')); return c; };
  let s = 11; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const drips = Array.from({ length: 26 }, () => [rnd() * W, .04 + rnd() * .09, 6 + rnd() * 16]);
  const breakAt = (x) => { let b = .27 + Math.sin(x / W * Math.PI * 6) * .012; for (const [dx, len, w] of drips) { const d = Math.min(Math.abs(x - dx), W - Math.abs(x - dx)); if (d < w) b -= len * Math.cos(d / w * Math.PI / 2) ** 2; } return b; };
  const rimV = .52, innerV = .56;
  const colorC = cv((g) => {
    const img = g.createImageData(W, H), d = img.data;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const v = y / H, i = (y * W + x) * 4, b = breakAt(x);
      let r, gg, bb;
      if (v < b) { // raw clay foot, speckled
        const n = rnd(); r = 185; gg = 146; bb = 110; if (n > .985) { r = 90; gg = 62; bb = 45; } else { const k = (n - .5) * 16; r += k; gg += k; bb += k; }
      } else if (v < rimV) { // outside: kiln red, darker where it pools at the break, browner at the rim
        const t = (v - b) / (rimV - b); const pool = Math.exp(-(((v - b) / .025) ** 2));
        r = 169 - pool * 40 - Math.max(0, t - .82) * 260; gg = 73 - pool * 22 - Math.max(0, t - .82) * 80; bb = 31 - pool * 8 - Math.max(0, t - .82) * 20;
        const k = (rnd() - .5) * 10 + Math.sin(x * .05 + v * 40) * 4; r += k; gg += k * .5; bb += k * .3;
      } else if (v < innerV) { r = 112; gg = 60; bb = 34; } // rim edge where the glaze thins
      else { // inside: bisque glaze with iron speckle
        const n = rnd(); r = 236; gg = 226; bb = 210; if (n > .992) { r = 120; gg = 84; bb = 60; } else { const k = (n - .5) * 8; r += k; gg += k; bb += k; }
        const pool = Math.max(0, (v - .9) / .1); r -= pool * 18; gg -= pool * 16; bb -= pool * 10;
      }
      d[i] = r; d[i + 1] = gg; d[i + 2] = bb; d[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
  });
  const roughC = cv((g) => { for (let x = 0; x < W; x += 2) { const b = breakAt(x) * H; g.fillStyle = '#ffffff'; g.fillRect(x, 0, 2, H); g.fillStyle = 'rgb(0,60,0)'; g.fillRect(x, b, 2, H - b); } });
  const coatC = cv((g) => { for (let x = 0; x < W; x += 2) { const b = breakAt(x) * H; g.fillStyle = '#000'; g.fillRect(x, 0, 2, H); g.fillStyle = '#fff'; g.fillRect(x, b, 2, H - b); } });
  const tex = (c, srgb) => { const t = new THREE.CanvasTexture(c); t.flipY = false; t.wrapS = THREE.RepeatWrapping; if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const mat = new THREE.MeshPhysicalMaterial({ map: tex(colorC, true), roughnessMap: tex(roughC), roughness: 1, metalness: 0, clearcoat: .8, clearcoatMap: tex(coatC), clearcoatRoughness: .12, side: THREE.DoubleSide, envMapIntensity: .8 });
  const bowl = new THREE.Mesh(geo, mat); bowl.position.y = -.42;
  const grp = new THREE.Group(); grp.add(bowl); scene.add(grp);
  // contact shadow
  const sc = document.createElement('canvas'); sc.width = sc.height = 128; const sg = sc.getContext('2d');
  const gr = sg.createRadialGradient(64, 64, 2, 64, 64, 64); gr.addColorStop(0, 'rgba(51,37,30,.5)'); gr.addColorStop(1, 'rgba(51,37,30,0)'); sg.fillStyle = gr; sg.fillRect(0, 0, 128, 128);
  const sh = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 2.1), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }));
  sh.rotation.x = -Math.PI / 2; sh.position.y = -.425; grp.add(sh);

  function size() { const r = host.getBoundingClientRect(); renderer.setSize(r.width, r.height, false); cam.aspect = r.width / r.height; cam.updateProjectionMatrix(); kick(); }
  let raf = 0, inView = true;
  const kick = () => { if (!raf && inView) raf = requestAnimationFrame(frame); };
  new IntersectionObserver((e) => { inView = e[0].isIntersecting; kick(); }).observe(host);
  addEventListener('scroll', kick, { passive: true }); addEventListener('resize', size);
  function frame(now) {
    raf = 0;
    const r = media.getBoundingClientRect(), vh = innerHeight;
    const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height * .6)));
    const t = reduced ? 0 : now / 1000;
    const elev = THREE.MathUtils.lerp(.1, .68, p * p * (3 - 2 * p));   // side view -> looking down into the bowl
    const dist = THREE.MathUtils.lerp(4.2, 3.9, p);
    cam.position.set(0, Math.sin(elev) * dist, Math.cos(elev) * dist); cam.lookAt(0, -.05 - .1 * p, 0);
    grp.rotation.y = t * .25 + p * Math.PI * 1.2;
    renderer.render(scene, cam);
    if (!reduced) kick();
  }
  size(); host.classList.add('is-on');
}
