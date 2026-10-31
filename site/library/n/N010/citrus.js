/* N010 Rootline Citrus — the 3D fruit (three.js r170, built in code, no downloaded models).
   Whole fruit + a half cut open. The cut face is a custom shader: segments, white membranes, pith ring,
   radial juice sacs with wet specular and a back-lit translucent glow.
   Scroll camera: the pair sits in the hero; scrolling to "The fruit" flies the half into the colour disc face-on,
   then the camera orbits a little round its side so you see the peel and pith thickness.
   Phone = PC: same scene, DPR capped at 1.75 and fewer segments. No WebGL -> the real photos stay (no class added).
   Reduced motion: no idle spin, no flight (the fruit is placed, not flown), fruit switch without a spin. */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const phone = document.documentElement.dataset.build === 'm' || innerWidth < 860;
const $ = (s) => document.querySelector(s);
const stage = $('[data-stage]'), disc = $('.cut-disc'), section = $('#fruit');
if (!stage || !disc || !section) throw new Error('N010 3D: anchors missing');

let renderer;
try {
  const c = document.createElement('canvas');
  const gl = c.getContext('webgl2') || c.getContext('webgl');
  if (!gl) throw new Error('no webgl');
  renderer = new THREE.WebGLRenderer({ canvas: c, antialias: true, alpha: true, powerPreference: 'high-performance' });
} catch (e) { renderer = null; }

if (renderer) start();

function start() {
  const canvas = renderer.domElement;
  canvas.className = 'citrus-gl'; canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, phone ? 1.75 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  camera.position.set(0, 0, 12);
  const key = new THREE.DirectionalLight(0xfff4e0, 2.2); key.position.set(-4, 6, 8); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 1.2); rim.position.set(5, 2, -4); scene.add(rim);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd8e6c0, 0.5));

  /* ---------- fruit looks ---------- */
  const LOOK = {
    lemon:    { peel: '#EBB300', peel2: '#C88E00', pith: '#FAF0C8', flesh: '#F6DB4E', flesh2: '#E2B320', leaf: '#3F7A2A', sy: 1.22, tip: .32, flat: 0, segs: 9,  pithW: .085, seeds: 1 },
    lime:     { peel: '#3F8A1C', peel2: '#235E0E', pith: '#E2EDB8', flesh: '#A9D23E', flesh2: '#79A824', leaf: '#2F6B1E', sy: 1.03, tip: .05, flat: 0, segs: 10, pithW: .05,  seeds: 0 },
    mandarin: { peel: '#F2700C', peel2: '#D05204', pith: '#FCE2BC', flesh: '#FF9A26', flesh2: '#EE6E06', leaf: '#356F22', sy: .82,  tip: 0,   flat: .1, segs: 11, pithW: .03,  seeds: 0 }
  };
  const col = (h) => new THREE.Color(h);

  /* ---------- peel texture: oil glands (normal map) + mottling (map), drawn once in code ---------- */
  function peelMaps() {
    const W = phone ? 512 : 1024, H = W / 2;
    const h = new Float32Array(W * H);
    let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const n = phone ? 9000 : 30000;
    for (let i = 0; i < n; i++) {
      const cx = rnd() * W, cy = rnd() * H, r = (phone ? .7 : 1.1) + rnd() * (phone ? .9 : 1.5), d = .5 + rnd() * .5;
      const sx = r / Math.max(.25, Math.sin(Math.PI * cy / H)); // wider near the poles of the equirect map
      for (let y = Math.floor(cy - r - 1); y <= cy + r + 1; y++) for (let x = Math.floor(cx - sx - 1); x <= cx + sx + 1; x++) {
        const yy = (y + H) % H, xx = (x + W) % W;
        const q = ((x - cx) / sx) ** 2 + ((y - cy) / r) ** 2; if (q > 1) continue;
        h[yy * W + xx] -= d * (1 - q) * (1 - q);
      }
    }
    const nc = document.createElement('canvas'); nc.width = W; nc.height = H;
    const mc = document.createElement('canvas'); mc.width = W; mc.height = H;
    const nx = nc.getContext('2d'), mx = mc.getContext('2d');
    const ni = nx.createImageData(W, H), mi = mx.createImageData(W, H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const dx = h[y * W + (x + 1) % W] - h[y * W + (x - 1 + W) % W];
      const dy = h[((y + 1) % H) * W + x] - h[((y - 1 + H) % H) * W + x];
      let vx = -dx * 1.4, vy = -dy * 1.4, vz = 1; const l = Math.hypot(vx, vy, vz); vx /= l; vy /= l; vz /= l;
      ni.data[i * 4] = (vx * .5 + .5) * 255; ni.data[i * 4 + 1] = (vy * .5 + .5) * 255; ni.data[i * 4 + 2] = (vz * .5 + .5) * 255; ni.data[i * 4 + 3] = 255;
      const m = 238 + h[i] * 10 + Math.sin(x * .021 + Math.sin(y * .05) * 3) * 6 + (rnd() - .5) * 8;
      mi.data[i * 4] = mi.data[i * 4 + 1] = mi.data[i * 4 + 2] = Math.max(0, Math.min(255, m)); mi.data[i * 4 + 3] = 255;
    }
    nx.putImageData(ni, 0, 0); mx.putImageData(mi, 0, 0);
    const normal = new THREE.CanvasTexture(nc); normal.wrapS = THREE.RepeatWrapping; normal.anisotropy = 4;
    const map = new THREE.CanvasTexture(mc); map.wrapS = THREE.RepeatWrapping; map.colorSpace = THREE.SRGBColorSpace;
    return { normal, map };
  }
  const maps = peelMaps();
  const peelMat = new THREE.MeshPhysicalMaterial({ color: col(LOOK.lime.peel), map: maps.map, normalMap: maps.normal, normalScale: new THREE.Vector2(.5, .5),
    roughness: .48, clearcoat: .45, clearcoatRoughness: .3, envMapIntensity: .55 });

  /* ---------- shape: a sphere pushed into lemon / lime / mandarin ---------- */
  const SEG = phone ? [72, 48] : [128, 88];
  function shapePositions(geo, base, L) {
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      let x = base[i * 3], y = base[i * 3 + 1], z = base[i * 3 + 2];
      const ay = Math.abs(y), s = Math.sign(y) || 1;
      let k = 1 - L.tip * Math.pow(ay, 3) * .55 - L.flat * Math.pow(ay, 6) * .6;
      let yy = y * L.sy + s * L.tip * Math.pow(ay, 10) * .9;
      if (L.flat) yy -= s * L.flat * Math.exp(-(x * x + z * z) / .03) * .6; // the mandarin's sunken top
      p.setXYZ(i, x * k, yy, z * k);
    }
    p.needsUpdate = true; geo.computeVertexNormals();
  }
  const wholeGeo = new THREE.SphereGeometry(1, SEG[0], SEG[1]);
  const wholeBase = Float32Array.from(wholeGeo.attributes.position.array);
  // the half: upper hemisphere, cut plane y=0, turned so the cut faces +z
  const halfGeo = new THREE.SphereGeometry(1, SEG[0], SEG[1] / 2, 0, Math.PI * 2, 0, Math.PI / 2);
  const halfBase = Float32Array.from(halfGeo.attributes.position.array);

  const whole = new THREE.Group(), half = new THREE.Group();
  const wholeMesh = new THREE.Mesh(wholeGeo, peelMat); whole.add(wholeMesh);
  const halfShell = new THREE.Mesh(halfGeo, peelMat);
  const halfInner = new THREE.Group(); halfInner.rotation.x = -Math.PI / 2; // +y (dome) -> -z, cut plane faces +z
  halfInner.add(halfShell); half.add(halfInner);

  // stem button + leaf on the whole fruit
  const stemMat = new THREE.MeshStandardMaterial({ color: col('#7C7A32'), roughness: .7 });
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(.07, .1, .12, 16), stemMat); whole.add(stem);
  const leafShape = new THREE.Shape(); leafShape.moveTo(0, 0); leafShape.bezierCurveTo(.28, .18, .34, .62, 0, 1.0); leafShape.bezierCurveTo(-.34, .62, -.28, .18, 0, 0);
  const leafGeo = new THREE.ShapeGeometry(leafShape, 24); const lp = leafGeo.attributes.position;
  for (let i = 0; i < lp.count; i++) { const x = lp.getX(i), y = lp.getY(i); lp.setZ(i, -x * x * 1.6 + Math.sin(y * 2.6) * .06); }
  leafGeo.computeVertexNormals();
  const leafMat = new THREE.MeshPhysicalMaterial({ color: col(LOOK.lime.leaf), roughness: .35, clearcoat: .8, side: THREE.DoubleSide });
  const leaf = new THREE.Mesh(leafGeo, leafMat); leaf.scale.setScalar(.95); whole.add(leaf);

  /* ---------- the cut face shader ---------- */
  const faceU = {
    uPeel: { value: col(LOOK.lime.peel) }, uPeel2: { value: col(LOOK.lime.peel2) }, uPith: { value: col(LOOK.lime.pith) },
    uFlesh: { value: col(LOOK.lime.flesh) }, uFlesh2: { value: col(LOOK.lime.flesh2) },
    uSegs: { value: LOOK.lime.segs }, uPithW: { value: LOOK.lime.pithW }, uSeeds: { value: 0 },
    uLight: { value: new THREE.Vector3(-.45, .6, .66).normalize() }, uTime: { value: 0 }
  };
  const faceMat = new THREE.ShaderMaterial({
    uniforms: faceU,
    vertexShader: `
      varying vec2 vUv; varying vec3 vN; varying vec3 vPos;
      void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position,1.); vPos = mv.xyz; vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `
      uniform vec3 uPeel,uPeel2,uPith,uFlesh,uFlesh2,uLight; uniform float uSegs,uPithW,uSeeds,uTime;
      varying vec2 vUv; varying vec3 vN; varying vec3 vPos;
      vec2 hash2(vec2 p){ p = vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))); return fract(sin(p)*43758.5453); }
      vec3 worley(vec2 p){ vec2 i=floor(p), f=fract(p); float d1=8., d2=8.; vec2 id=vec2(0.);
        for(int y=-1;y<=1;y++) for(int x=-1;x<=1;x++){ vec2 g=vec2(float(x),float(y)); vec2 o=hash2(i+g); vec2 r=g+o-f; float d=dot(r,r);
          if(d<d1){ d2=d1; d1=d; id=i+g; } else if(d<d2){ d2=d; } }
        return vec3(sqrt(d1), sqrt(d2), hash2(id).x); }
      vec3 perturb(vec3 pos, vec3 n, vec2 dh){ vec3 sx=dFdx(pos), sy=dFdy(pos); vec3 r1=cross(sy,n), r2=cross(n,sx); float det=dot(sx,r1);
        vec3 g=sign(det)*(dh.x*r1+dh.y*r2); return normalize(abs(det)*n-g); }
      void main(){
        vec2 c = vUv*2.-1.; float r = length(c); float a = atan(c.y,c.x)+3.14159265;
        float N = uSegs; float sa = a/6.2831853*N; float si = floor(sa); float sf = fract(sa);
        float arc = (min(sf,1.-sf))*6.2831853*r/N;          // distance to the nearest membrane (arc length)
        float pithIn = 1.-.05-uPithW;                       // where the flesh ends
        float lobe = pithIn - .025 - .05*(1.-sqrt(sin(3.14159*sf)));   // rounded outer end of each segment
        float core = .07 + uPithW*.6;
        // juice sacs: long cells pointing at the centre
        vec2 q = vec2(r*8.5, (sf-.5)*N*.5*(.35+r) + si*3.7);
        vec3 w = worley(q*vec2(1.,1.7));
        float cellEdge = smoothstep(.0,.16,w.y-w.x);         // 0 on sac walls
        float sac = 1.-smoothstep(.0,.75,w.x);               // 1 at a sac's centre
        float memb = 1.-smoothstep(.003,.009,arc);           // white membrane between segments
        float inFlesh = step(core, r)*(1.-smoothstep(lobe-.012,lobe,r));
        float ringPith = smoothstep(lobe-.01,lobe+.004,r)*(1.-step(1.-.05,r));
        float isPeel = smoothstep(1.-.055,1.-.045,r);
        float isCore = 1.-smoothstep(core-.015,core,r);
        // height for the wet bumps
        float h = inFlesh*(1.-memb)*(sac*.8+cellEdge*.4) + memb*.25*inFlesh;
        vec2 dh = vec2(dFdx(h),dFdy(h))*.9;
        vec3 n = perturb(vPos, normalize(vN), dh);
        vec3 v = normalize(-vPos);
        // colour
        vec3 flesh = mix(uFlesh2, uFlesh, .35+.65*sac) * (.86+.14*cellEdge);
        flesh = mix(flesh, uFlesh*1.12, smoothstep(.6,.0,r)*.25);      // lighter toward the centre
        flesh *= .92 + .16*w.z;
        vec3 pith = uPith*(.92+.08*sac);
        vec3 base = flesh;
        base = mix(base, pith, max(memb*inFlesh, max(ringPith, isCore)));
        base = mix(base, mix(uPeel, uPeel2, smoothstep(1.-.05,1.,r)), isPeel);
        // seeds (lemon)
        if(uSeeds>.5){ float sd = length(vec2((r-.24)*2.2, (sf-.5)*N*.5*r*6.)); float isSeed = (1.-smoothstep(.17,.2,sd))*step(.5,mod(si,2.)); base = mix(base, vec3(.93,.89,.72), isSeed); }
        // light: wrap diffuse + translucent back-glow + wet spec
        vec3 L = normalize(uLight); float ndl = dot(n,L);
        float diff = clamp((ndl+.35)/1.35,0.,1.);
        float trans = inFlesh*(1.-memb)*(.35+.65*sac);
        vec3 glow = uFlesh*uFlesh*1.1*trans*(.55+.45*smoothstep(1.,.0,r));
        vec3 hv = normalize(L+v); float spec = pow(max(dot(n,hv),0.),140.)*(.25+.9*inFlesh*sac) + pow(max(dot(n,hv),0.),20.)*.05;
        float fres = pow(1.-max(dot(n,v),0.),3.)*.25;
        float pithAmt = max(memb*inFlesh, max(ringPith, isCore))*(1.-isPeel);
        vec3 col = base*(.36+.6*diff) + glow*.55 + uPith*pithAmt*.3 + vec3(1.)*spec*(1.-isPeel*.7) + base*fres;
        gl_FragColor = vec4(col,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`
  });
  const face = new THREE.Mesh(new THREE.CircleGeometry(1, phone ? 96 : 160), faceMat);
  face.position.z = .001; half.add(face);
  // a thin pith lip so the edge of the cut doesn't look paper-thin
  const lip = new THREE.Mesh(new THREE.TorusGeometry(.985, .018, 8, phone ? 96 : 160), new THREE.MeshStandardMaterial({ color: col(LOOK.lime.pith), roughness: .6 }));
  half.add(lip);

  // juice drops: a few glossy beads on the cut face
  const dropMat = new THREE.MeshPhysicalMaterial({ color: col(LOOK.lime.flesh), roughness: .05, clearcoat: 1, transparent: true, opacity: .55, ior: 1.33 });
  const drops = new THREE.Group();
  [[.32, .41, .06], [-.45, .18, .045], [.12, -.52, .05], [-.2, -.3, .035], [.55, -.12, .04]].forEach(([x, y, r]) => {
    const d = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), dropMat); d.position.set(x, y, r * .35); d.scale.z = .45; drops.add(d);
  });
  half.add(drops);

  scene.add(whole, half);

  // soft contact shadow under the pair (hero only)
  const sh = document.createElement('canvas'); sh.width = sh.height = 128; const sx = sh.getContext('2d');
  const gr = sx.createRadialGradient(64, 64, 4, 64, 64, 64); gr.addColorStop(0, 'rgba(31,59,44,.42)'); gr.addColorStop(1, 'rgba(31,59,44,0)'); sx.fillStyle = gr; sx.fillRect(0, 0, 128, 128);
  const shadowMat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sh), transparent: true, depthWrite: false });
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), shadowMat); shadow.renderOrder = -1; scene.add(shadow);

  /* ---------- apply a fruit ---------- */
  let cur = document.body.dataset.fruit || 'lime';
  function apply(k) {
    const L = LOOK[k]; if (!L) return;
    shapePositions(wholeGeo, wholeBase, L); shapePositions(halfGeo, halfBase, L);
    peelMat.color.set(L.peel); leafMat.color.set(L.leaf); lip.material.color.set(L.pith); dropMat.color.set(L.flesh);
    faceU.uPeel.value.set(L.peel); faceU.uPeel2.value.set(L.peel2); faceU.uPith.value.set(L.pith); faceU.uFlesh.value.set(L.flesh); faceU.uFlesh2.value.set(L.flesh2);
    faceU.uSegs.value = L.segs; faceU.uPithW.value = L.pithW; faceU.uSeeds.value = L.seeds;
    const topY = L.sy + L.tip * .9 - L.flat * .55;
    stem.position.set(0, topY + .02, 0); leaf.position.set(.02, topY + .04, 0); leaf.rotation.set(-.5, .4, -.9);
    stem.visible = true; whole.userData.top = topY;
    // the half's peel depth: a lemon half is deeper than a mandarin half
    halfInner.scale.set(1, 1, 1);
  }
  apply(cur);

  // switch: both fruits spin; the shape and colour change at the half-turn
  let spin = null;
  new MutationObserver(() => {
    const k = document.body.dataset.fruit; if (!k || k === cur) return; cur = k;
    if (reduced) { apply(k); kick(); return; }
    spin = { t0: performance.now(), k, swapped: false }; kick();
  }).observe(document.body, { attributes: true, attributeFilter: ['data-fruit'] });

  /* ---------- layout: track the DOM anchors, so the fruit sits where the layout puts it on any screen ---------- */
  let W = 1, H = 1, visH = 1, visW = 1;
  function size() {
    W = innerWidth; H = innerHeight;
    renderer.setSize(W, H, false); canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    camera.aspect = W / H; camera.updateProjectionMatrix();
    visH = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)); visW = visH * camera.aspect;
    kick();
  }
  const toWorld = (px, py) => new THREE.Vector3((px / W - .5) * visW, (.5 - py / H) * visH, 0);
  const pxToWorld = (p) => p / H * visH;

  const qA_half = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(.5, .32, .8).normalize());
  const qTwist = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -.4); qA_half.multiply(qTwist);
  const qB_half = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(-.04, .05, 1).normalize());
  const tmpQ = new THREE.Quaternion(), e = new THREE.Euler();
  const ease = (t) => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  let pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  if (!phone && !reduced) addEventListener('pointermove', (ev) => { pointer.tx = ev.clientX / W - .5; pointer.ty = ev.clientY / H - .5; kick(); }, { passive: true });

  let raf = 0, visible = true;
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }
  addEventListener('scroll', kick, { passive: true }); addEventListener('resize', size);
  document.addEventListener('visibilitychange', kick);

  function frame(now) {
    raf = 0;
    const sr = stage.getBoundingClientRect(), dr = disc.getBoundingClientRect(), secR = section.getBoundingClientRect();
    // progress of the flight hero -> disc
    const off = (dr.top + dr.height / 2) - secR.top;
    const endTop = H / 2 - off;
    let p = clamp((H - secR.top) / Math.max(1, H - endTop));
    if (reduced) p = p < .5 ? 0 : 1;
    const t = ease(p);
    // orbit after the half has landed: the camera swings round its side as "The fruit" scrolls on
    const p2 = reduced ? 0 : clamp(((H / 2) - (dr.top + dr.height / 2)) / (H * .7));
    const onScreen = sr.bottom > -40 || (dr.bottom > -80 && dr.top < H + 80) || (p > 0 && p < 1);
    if (!onScreen) { canvas.style.visibility = 'hidden'; return; }
    canvas.style.visibility = 'visible';

    // anchor A: the hero stage
    const sA = Math.min(sr.height / 2.7, sr.width / (phone ? 4.9 : 4.5));
    const cA = toWorld(sr.left + sr.width * (phone ? .5 : .46), sr.top + sr.height * (phone ? .5 : .47));
    const SA = pxToWorld(sA);
    // anchor B: the colour disc
    const cB = toWorld(dr.left + dr.width / 2, dr.top + dr.height / 2);
    const SB = pxToWorld(dr.width * .43);

    pointer.x += (pointer.tx - pointer.x) * .08; pointer.y += (pointer.ty - pointer.y) * .08;
    const time = now / 1000;
    const idle = reduced ? 0 : time;

    // spin on switch
    let spinY = 0, squash = 1;
    if (spin) {
      const u = clamp((now - spin.t0) / 900); spinY = ease(u) * Math.PI * 2; squash = 1 - Math.sin(u * Math.PI) * .08;
      if (u > .5 && !spin.swapped) { apply(spin.k); spin.swapped = true; }
      if (u >= 1) spin = null;
    }

    // the half
    const hp = new THREE.Vector3().lerpVectors(cA.clone().add(new THREE.Vector3(.95, -.22, .6).multiplyScalar(SA)), cB, t);
    half.position.copy(hp);
    half.scale.setScalar(THREE.MathUtils.lerp(SA, SB, t) * squash);
    tmpQ.slerpQuaternions(qA_half, qB_half, t);
    e.set(pointer.y * .25 * (1 - t) + p2 * .5, pointer.x * .35 * (1 - t) + spinY + Math.sin(idle * .5) * .06 * (1 - t) + p2 * -.85, 0);
    half.quaternion.copy(tmpQ).multiply(new THREE.Quaternion().setFromEuler(e));
    drops.visible = t > .2 || !phone;

    // the whole fruit: sits behind-left in the hero, slides away as the half flies
    const wp = cA.clone().add(new THREE.Vector3(-.98, .16, -.7).multiplyScalar(SA));
    wp.add(new THREE.Vector3(-1.6, 1.4, -2).multiplyScalar(SA * t));
    whole.position.copy(wp);
    const ws = SA * (1 - t * .9) * squash; whole.scale.setScalar(Math.max(ws, .0001)); whole.visible = t < .98;
    whole.rotation.set(.18 + pointer.y * .2, idle * .25 + spinY + pointer.x * .4, -.14);

    // contact shadow under the pair, fades as they lift
    shadow.position.set(cA.x + SA * .1, cA.y - SA * 1.18, -1.2);
    shadow.scale.set(SA * 4.3, SA * .7, 1); shadowMat.opacity = (1 - t) * .9;

    faceU.uTime.value = time;
    renderer.render(scene, camera);
    const moving = spin || (!reduced && (Math.abs(pointer.tx - pointer.x) > .001 || Math.abs(pointer.ty - pointer.y) > .001 || sr.bottom > 0));
    if (moving && !document.hidden) kick();
  }
  size();
  document.documentElement.classList.add('is-3d');
  frame(performance.now());
}
