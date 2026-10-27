/* Dew Theory - Zyqor Lab concept 06.
   Cloud world (shader sky + layered cloud puffs, clouds in front of AND behind the bottle), giant soft type,
   procedural glass dropper bottle that travels to an ingredient orbit and lands on a 3D podium with the routine. */
import { THREE, Q, isM, reduced, coarse, makeRenderer, studioEnv, reveals, smooth, clamp, lerp } from '../_kit/kit.js';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { useHDRI } from '../../assets/hdri/hdri.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const eio = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const eob = (t) => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
let seed = 3; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const C = (h) => new THREE.Color(h);
const NOISE = `
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*vn(p);p*=2.03;a*=.5;}return s;}`;

/* AM / PM sweep: one diagonal front crosses the screen; every shader asks "is this pixel night yet?" */
const SW = { uFrom: { value: 0 }, uTo: { value: 0 }, uW: { value: 2 }, uRes: { value: new THREE.Vector2(1, 1) } };
const SWEEP = `
uniform float uFrom;uniform float uTo;uniform float uW;uniform vec2 uRes;
float swF(vec2 fc){vec2 q=fc/uRes;return q.x+(1.-q.y)*.25;}
float nightAt(vec2 fc){float f=swF(fc);return mix(uFrom,uTo,smoothstep(uW+.012,uW-.012,f));}
float edgeAt(vec2 fc){float d=swF(fc)-uW+.03;return exp(-d*d*700.)*step(uW,1.5)*abs(uTo-uFrom);}`;
const cv = $('.dewgl');
let W = innerWidth, H = innerHeight;
const r = makeRenderer(cv, { exposure: 1.0 });
r.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); // round 2: phone renders at the same density as desktop (cap 2)
/* round 2: baked surface maps (same files on desktop and phone) */
const AS = '../../assets/lab/dew/';
const TL = new THREE.TextureLoader();
const mapTex = (f, rep) => { const t = TL.load(AS + f); t.flipY = false; t.wrapS = THREE.RepeatWrapping; t.wrapT = rep ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping; t.anisotropy = 8; if (rep) t.repeat.set(rep[0], rep[1]); return t; };
const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(30, W / H, 0.1, 80); cam.position.set(0, 0, 14);
scene.environment = studioEnv(r); scene.environmentIntensity = 0.95;
// studio HDRI (Poly Haven, CC0) swaps in after first paint on desktop; phones keep the free procedural room
let envK = 1, lightK = 1;
useHDRI(r, scene, { size: 1024, rotation: -0.6, onReady: () => { envK = 0.85; lightK = 0.7; } });
const key = new THREE.DirectionalLight('#fff1ea', 2.2); key.position.set(-3, 6, 6); scene.add(key);
const rim = new THREE.DirectionalLight('#ffc2b5', 1.4); rim.position.set(4, 2, -5); scene.add(rim);
scene.add(new THREE.HemisphereLight('#fff4f0', '#d89a90', 0.5));

/* ------------------------------------------------------------ hero world (desktop: shader sky + cloud puffs + type plane) */
const hero = { items: [] };
const uppAt = (z) => (2 * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * (cam.position.z - z)) / H; // world units per px at depth z
if (!isM) {
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    depthWrite: false, depthTest: false,
    uniforms: Object.assign({ uT: { value: 0 }, uOff: { value: 0 }, uAsp: { value: 1 }, uA: { value: C('#E7AFA5') }, uB: { value: C('#F2D2CA') }, uC: { value: C('#F6E3DF') }, uAn: { value: C('#2E1C20') }, uBn: { value: C('#552F35') }, uCn: { value: C('#A85E5D') }, uBg: { value: C('#3A2326') } }, SW),
    vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.999,1.);}',
    fragmentShader: `uniform float uT;uniform float uOff;uniform float uAsp;uniform vec3 uA;uniform vec3 uB;uniform vec3 uC;uniform vec3 uAn;uniform vec3 uBn;uniform vec3 uCn;uniform vec3 uBg;varying vec2 vUv;${NOISE}${SWEEP}
void main(){float y=vUv.y-uOff; if(y<0.)discard;
 vec3 col=mix(uC,uB,smoothstep(.0,.55,y));col=mix(col,uA,smoothstep(.55,1.05,y));
 float sun=smoothstep(.55,.0,length((vec2(vUv.x,y)-vec2(.68,.78))*vec2(1.6,1.)));col+=sun*vec3(.12,.08,.06);
 float n=fbm(vec2(vUv.x*3.+uT*.01,y*7.));col=mix(col,vec3(1.,.97,.96),smoothstep(.55,.8,n)*.25*smoothstep(.2,.8,y));
 float nt=nightAt(gl_FragCoord.xy);
 if(nt>.001){
  vec3 nc=mix(uCn,uBn,smoothstep(.16,.55,y));nc=mix(nc,uAn,smoothstep(.55,1.05,y));nc=mix(uBg,nc,smoothstep(.0,.2,y));
  vec2 mp=(vec2(vUv.x,y)-vec2(.7,.79))*vec2(uAsp,1.);float md=length(mp);
  nc+=exp(-md*7.)*.32*vec3(1.,.8,.76);
  float moon=smoothstep(.062,.057,md);float crater=fbm(mp*40.)*.12;
  float cut=smoothstep(.058,.052,length(mp-vec2(.026,.012)));
  nc=mix(nc,vec3(1.,.93,.88)-crater,moon*(1.-cut*.92));
  vec2 g=vec2(vUv.x*uAsp,y)*70.;vec2 id=floor(g);float h=h21(id);vec2 c=fract(g)-.5-(vec2(h21(id+3.1),h21(id+7.7))-.5)*.6;
  float st=smoothstep(.09,.0,length(c))*step(.955,h)*(.45+.55*sin(uT*1.7+h*60.))*smoothstep(.3,.75,y);
  nc+=st*vec3(1.,.92,.86);
  nc=mix(nc,vec3(.62,.4,.42),smoothstep(.55,.8,n)*.16*smoothstep(.2,.8,y));
  col=mix(col,nc,nt);
 }
 col+=edgeAt(gl_FragCoord.xy)*vec3(1.,.74,.62)*.85;
 gl_FragColor=vec4(col,1.);
 #include <colorspace_fragment>
}` }));
  sky.frustumCulled = false; sky.renderOrder = -10; scene.add(sky); hero.sky = sky;
  // giant soft type, drawn to a canvas texture so the clouds can sit in front of and behind it
  const mkTypeTex = (w1, w2, fill, glow) => {
    const tc = document.createElement('canvas'); tc.width = 2048; tc.height = 1100;
    const tx = tc.getContext('2d');
    const tex = new THREE.CanvasTexture(tc); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    const draw = () => {
      tx.clearRect(0, 0, 2048, 1100); tx.textBaseline = 'alphabetic';
      tx.shadowColor = glow; tx.shadowBlur = 60; tx.fillStyle = fill;
      tx.font = '400 600px "Instrument Serif"'; tx.textAlign = 'right'; tx.fillText(w1, w1.length > 4 ? 1050 : 1010, 760);
      tx.font = 'italic 400 600px "Instrument Serif"'; tx.textAlign = 'left'; tx.fillText(w2, w1.length > 4 ? 1120 : 1090, 760);
      tex.needsUpdate = true;
    };
    draw(); if (document.fonts) {
      document.fonts.ready.then(draw);
      document.fonts.load('400 100px "Instrument Serif"').then(draw).catch(() => {});
      document.fonts.load('italic 400 100px "Instrument Serif"').then(draw).catch(() => {});
    }
    return tex;
  };
  const tDay = mkTypeTex('Pure', 'Dew', 'rgba(255,255,255,.96)', 'rgba(255,255,255,.75)');
  const tNight = mkTypeTex('Night', 'Dew', 'rgba(255,226,220,.92)', 'rgba(232,140,130,.6)');
  const type = new THREE.Mesh(new THREE.PlaneGeometry(1, 1100 / 2048), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, toneMapped: false,
    uniforms: Object.assign({ map0: { value: tDay }, map1: { value: tNight }, opacity: { value: 1 } }, SW),
    vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: `uniform sampler2D map0;uniform sampler2D map1;uniform float opacity;varying vec2 vUv;${SWEEP}
void main(){float n=nightAt(gl_FragCoord.xy);vec4 c=mix(texture2D(map0,vUv),texture2D(map1,vUv),n);gl_FragColor=vec4(c.rgb,c.a*opacity);
 #include <colorspace_fragment>
}` }));
  type.renderOrder = -2; scene.add(type); hero.type = type;
  // cloud puffs (one shader, many billboards)
  const cg = new THREE.PlaneGeometry(1, 0.62);
  const mk = (x, y, z, s, a, sh) => {
    const m = new THREE.Mesh(cg, new THREE.ShaderMaterial({
      transparent: true, depthWrite: false,
      uniforms: Object.assign({ uT: { value: 0 }, uS: { value: rnd() * 50 }, uA: { value: a }, uSh: { value: sh } }, SW),
      vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader: `uniform float uT;uniform float uS;uniform float uA;uniform float uSh;varying vec2 vUv;${NOISE}${SWEEP}
void main(){vec2 p=(vUv-.5)*vec2(1.,.62)*2.;
 float n=fbm(vUv*vec2(3.2,2.4)+vec2(uS+uT*.015,uS*.7));
 float n2=fbm(vUv*vec2(7.,5.)+vec2(uS*1.3-uT*.02,uS));
 float base=smoothstep(-.05,.2,vUv.y+ (n-.5)*.18);
 float d=length(p*vec2(.95,1.45))+(n-.5)*.55+(n2-.5)*.18;
 float m=smoothstep(.95,.35,d)*base;
 float lit=smoothstep(.15,.85,vUv.y+(n2-.5)*.4);
 vec3 col=mix(vec3(.93,.74,.71),vec3(1.,.985,.98),lit);col=mix(col,vec3(1.),.25*(1.-uSh));
 float nt=nightAt(gl_FragCoord.xy);
 vec3 ncol=mix(vec3(.30,.17,.2),vec3(.84,.62,.64),pow(lit,1.4));ncol=mix(ncol,vec3(.55,.36,.4),.2*(1.-uSh));
 col=mix(col,ncol,nt);col+=edgeAt(gl_FragCoord.xy)*vec3(1.,.7,.58)*.6*m;
 gl_FragColor=vec4(col,m*uA*(1.-nt*.12));
}` }));
    m.position.set(x, y, z); m.scale.setScalar(s); m.renderOrder = z > 1 ? 5 : -5 + z * 0.01; scene.add(m);
    hero.items.push({ m, x, y, z, s, sp: 0.02 + rnd() * 0.05, ph: rnd() * 6 });
  };
  seed = 17;
  const nb = Math.round(16 * Q.particles), nf = 9;
  for (let i = 0; i < nb; i++) mk(-11 + rnd() * 22, -2.6 + rnd() * 4.6, -9 + rnd() * 5, 5 + rnd() * 6, 0.75, 0.3);
  for (let i = 0; i < 6; i++) mk(-7 + rnd() * 14, -3.6 + rnd() * 1.2, -2.6, 3.8 + rnd() * 3, 0.85, 0.5);
  for (let i = 0; i < nf; i++) mk(-7.5 + (i / (nf - 1)) * 15 + (rnd() - 0.5) * 1.5, (Math.abs(i - (nf - 1) / 2) < 1.6 ? -2.05 : -2.6) + rnd() * 0.5, 3 + rnd() * 1.2, 2.6 + rnd() * 2.2, 0.95, 0.7);
}

/* ------------------------------------------------------------ products */
/* Canvas textures redraw once the webfonts are in, so the print never ships in a fallback face. */
const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
function canvasTex(w, h, draw, k = 1) {
  const c = document.createElement('canvas'); c.width = w * k; c.height = h * k; const x = c.getContext('2d');
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  const paint = () => { x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, w * k, h * k); x.setTransform(k, 0, 0, k, 0, 0); draw(x, w, h); t.needsUpdate = true; };
  paint(); fontsReady.then(() => (document.fonts && document.fonts.load ? Promise.all([document.fonts.load('400 40px "Instrument Serif"'), document.fonts.load('italic 400 40px "Instrument Serif"'), document.fonts.load('600 20px "Inter Tight"')]) : 0)).then(paint, paint);
  return t;
}
const spaced = (x, s, cx, y, sp) => { // letter-spaced centred text
  const ch = [...s], ws = ch.map((c) => x.measureText(c).width), tw = ws.reduce((a, b) => a + b, 0) + sp * (ch.length - 1);
  let px = cx - tw / 2; x.textAlign = 'left'; ch.forEach((c, i) => { x.fillText(c, px, y); px += ws[i] + sp; });
};
// paper label for the cleanser and the jar (matte stock, letterpress feel)
function labelTex(lines, night) {
  return canvasTex(1024, 512, (x, w, h) => {
    x.fillStyle = night ? '#3B2427' : '#F7E9E4'; x.fillRect(0, 0, w, h);
    // paper fibre noise
    seed = 91; for (let i = 0; i < 2600; i++) { x.fillStyle = `rgba(${night ? '255,230,225' : '120,70,60'},${0.025 + rnd() * 0.035})`; x.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 2, 1); }
    const ink = night ? '#F6E3DF' : '#4A2E2A', acc = night ? '#E79A8F' : '#B85C5C';
    x.fillStyle = ink; x.font = '600 22px "Inter Tight", sans-serif'; spaced(x, 'DEW THEORY', w / 2, 92, 9);
    x.fillRect(w / 2 - 40, 112, 80, 2);
    x.textAlign = 'center'; x.font = '400 128px "Instrument Serif", Georgia, serif'; x.fillText(lines[0], w / 2, 250);
    x.font = 'italic 400 92px "Instrument Serif", Georgia, serif'; x.fillStyle = acc; x.fillText(lines[1], w / 2, 340);
    x.fillStyle = ink; x.font = '600 24px "Inter Tight", sans-serif'; spaced(x, lines[2], w / 2, 420, 6);
  });
}
// screen print straight onto the glass: ink only, transparent everywhere else
function printTex(night, mask) {
  return canvasTex(1024, 720, (x, w, h) => {
    if (mask) { x.fillStyle = '#000'; x.fillRect(0, 0, w, h); }
    const ink = mask ? '#fff' : night ? 'rgba(255,242,238,1)' : 'rgba(66,30,27,1)', acc = mask ? '#fff' : night ? 'rgba(246,172,158,1)' : 'rgba(162,72,64,1)';
    const cx = w / 2;
    x.strokeStyle = ink; x.lineWidth = 3;
    // drop mark
    x.beginPath(); x.moveTo(cx, 64); x.bezierCurveTo(cx + 26, 98, cx + 30, 116, cx + 30, 128); x.arc(cx, 128, 30, 0, Math.PI); x.bezierCurveTo(cx - 30, 116, cx - 26, 98, cx, 64); x.stroke();
    x.fillStyle = ink; x.font = '600 30px "Inter Tight", sans-serif'; spaced(x, 'DEW THEORY', cx, 214, 12);
    x.fillRect(cx - 28, 238, 56, 2.5);
    x.textAlign = 'center'; x.font = '400 150px "Instrument Serif", Georgia, serif'; x.fillText(night ? 'Night' : 'Pure', cx, 392);
    x.fillStyle = acc; x.font = 'italic 400 132px "Instrument Serif", Georgia, serif'; x.fillText('Dew', cx, 500);
    x.fillStyle = ink; x.font = '600 25px "Inter Tight", sans-serif'; spaced(x, night ? 'SERUM 02  /  NIGHT PEPTIDE' : 'SERUM 01  /  ROSE CLAY', cx, 576, 6);
    x.font = '500 21px "Inter Tight", sans-serif'; spaced(x, night ? 'PEPTIDES + 3% SQUALANE' : '2% HYALURONIC ACID  ·  pH 5.5', cx, 622, 4);
    x.font = '500 21px "Inter Tight", sans-serif'; spaced(x, '30 ml  /  1.0 fl oz', cx, 664, 4);
    // fine print: batch code, concept line and a hairline frame, the kind of detail a real screen print carries
    x.font = '500 13px "Inter Tight", sans-serif'; spaced(x, 'ZYQOR LAB CONCEPT  ·  NOT FOR SALE  ·  LOT 06-2610', cx, 700, 3);
    x.lineWidth = 1.2; x.strokeStyle = ink; x.beginPath(); x.moveTo(cx - 180, 548); x.lineTo(cx - 60, 548); x.moveTo(cx + 60, 548); x.lineTo(cx + 180, 548); x.stroke();
    x.beginPath(); x.arc(cx, 548, 3, 0, 7); x.fill();
  }, 2);
}
// pipette: printed graduations (0.25 ml steps) on the glass tube, with the serum column inside it
function pipetteTex(night) {
  return canvasTex(128, 1024, (x, w, h) => {
    const yOf = (y) => ((y - 0.2) / 0.98) * h; // canvas row = tube height (uv v)
    const fill = 0.776; // serum level inside the bottle
    x.fillStyle = night ? '#dcbcc2' : '#ecd3cc'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 6; i++) { x.fillStyle = `rgba(255,255,255,${0.05 + 0.03 * i})`; x.fillRect(w * (0.08 + i * 0.012), 0, w * 0.03, h); } // drawn-glass streak
    const g = x.createLinearGradient(0, yOf(0.2), 0, yOf(fill));
    g.addColorStop(0, night ? '#7a2638' : '#c8705f'); g.addColorStop(1, night ? '#9a3a4c' : '#dc9182');
    x.fillStyle = g; x.fillRect(0, 0, w, yOf(fill));
    x.fillStyle = night ? 'rgba(255,220,225,.9)' : 'rgba(255,240,234,.9)'; x.fillRect(0, yOf(fill) - 3, w, 3); // meniscus line
    x.fillStyle = night ? 'rgba(255,236,236,.92)' : 'rgba(92,44,38,.9)';
    x.font = '600 11px "Inter Tight", sans-serif'; x.textAlign = 'left';
    for (let i = 0; i <= 6; i++) { // marks sit in the visible stretch between the serum line and the collar
      const y = yOf(0.8 + i * 0.037), big = i % 2 === 0;
      x.fillRect(w * 0.18, y - 1, big ? w * 0.34 : w * 0.2, 2);
      x.fillRect(w * 0.68, y - 1, big ? w * 0.22 : w * 0.12, 2);
      if (big) { x.save(); x.translate(w * 0.56, y - 4); x.scale(1, -1); x.fillText((i / 4 + 0.25).toFixed(2).replace(/0$/, ''), 0, 0); x.restore(); }
    }
  }, 2);
}
const V2 = (x, y) => new THREE.Vector2(x, y);
const seg = 96; // round 2: one geometry for desktop and phone
// THREE.Path -> lathe points (all curve types sampled smoothly)
const prof = (build, div) => { const p = new THREE.Path(); build(p); return p.getPoints(div || 12); };
// knurled ridges on a lathe band (radial displacement) + welded normals
function knurl(geo, y0, y1, n, amp) {
  geo.deleteAttribute('uv'); geo.deleteAttribute('normal');
  const g = mergeVertices(geo, 1e-5), p = g.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i); if (v.y <= y0 || v.y >= y1) continue;
    const e = Math.min(1, (v.y - y0) / 0.014, (y1 - v.y) / 0.014), a = Math.atan2(v.x, v.z);
    const k = 1 - amp * e * (0.5 - 0.5 * Math.cos(a * n)); p.setXYZ(i, v.x * k, v.y, v.z * k);
  }
  g.computeVertexNormals(); return g;
}
function dropper() {
  const g = new THREE.Group();
  /* glass: one closed lathe profile with real wall thickness and a heavy base (outer up, inner down) */
  const body = prof((p) => {
    p.moveTo(0, 0.016); p.quadraticCurveTo(0.2, 0.002, 0.34, 0.0);
    p.absarc(0.38, 0.04, 0.04, -Math.PI / 2, 0, false);
    p.lineTo(0.42, 0.835);
    p.bezierCurveTo(0.42, 0.975, 0.3, 1.02, 0.19, 1.034);
    p.quadraticCurveTo(0.172, 1.04, 0.172, 1.07);
    p.lineTo(0.172, 1.168); p.absarc(0.172, 1.184, 0.016, -Math.PI / 2, Math.PI / 2, false);
    p.lineTo(0.14, 1.2); p.quadraticCurveTo(0.134, 1.2, 0.134, 1.19);
    p.lineTo(0.134, 1.06);
    p.bezierCurveTo(0.134, 1.0, 0.384, 0.97, 0.384, 0.83);
    p.lineTo(0.384, 0.205); p.absarc(0.322, 0.205, 0.062, 0, -Math.PI / 2, true);
    p.quadraticCurveTo(0.12, 0.138, 0, 0.152);
  });
  // round 2: the phone gets the same transmission glass and the full double wall as desktop
  const gN = mapTex('glass_n.webp'), gR = mapTex('glass_r.webp');
  const glass = new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 1, roughnessMap: gR, normalMap: gN, normalScale: new THREE.Vector2(0.55, 0.55), transmission: 1, thickness: 0.18, ior: 1.5, dispersion: 0.35, attenuationColor: C('#f6cdc4'), attenuationDistance: 0.9, specularIntensity: 1, specularColor: C('#ffffff'), envMapIntensity: 1.25, clearcoat: 0.0 });
  const glG = new THREE.LatheGeometry(body, 160);
  { // uv for the baked maps: u = angle; v 0-.06 base disk (by radius), .06-.5 outer wall (by height), .5-1 inner wall
    const top = body.findIndex((v, i) => i > 4 && v.y >= 1.199), baseEnd = body.findIndex((v) => v.x >= 0.3399), n = body.length, uv = glG.attributes.uv;
    const vOf = body.map((pt, j) => j > top ? 0.5 + Math.max(0, pt.y) / 1.25 * 0.5 : j <= baseEnd ? Math.min(pt.x, 0.34) / 0.34 * 0.06 : 0.06 + Math.min(1.2, pt.y) / 1.2 * 0.44);
    for (let i = 0; i < uv.count; i++) uv.setY(i, vOf[i % n]);
  }
  const gm = new THREE.Mesh(glG, glass); gm.renderOrder = 2; g.add(gm);
  /* liquid: its own mesh, sits on the dome of the heavy base, meniscus climbs the wall */
  const F = 0.64;
  const liq = prof((p) => {
    p.moveTo(0, 0.016); p.quadraticCurveTo(0.12, 0.002, 0.322, 0.004);
    p.absarc(0.322, 0.066, 0.058, -Math.PI / 2, 0, false);
    p.lineTo(0.38, F + 0.004);
    p.quadraticCurveTo(0.38, F + 0.026, 0.372, F + 0.02); p.quadraticCurveTo(0.35, F + 0.004, 0.3, F + 0.001); p.lineTo(0, F);
  });
  const lg = new THREE.LatheGeometry(liq, 128);
  { // depth gradient: deeper colour low in the bottle, lighter under the meniscus
    const pos = lg.attributes.position, col = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) { const y = pos.getY(i) / F, k = 0.74 + 0.3 * Math.pow(Math.min(1, y), 1.4); col[i * 3] = Math.min(1, k * 1.0); col[i * 3 + 1] = k * 0.97; col[i * 3 + 2] = k * 0.97; }
    lg.setAttribute('color', new THREE.BufferAttribute(col, 3));
  }
  const lm = new THREE.MeshPhysicalMaterial({ color: '#D9897B', vertexColors: true, roughness: 0.1, clearcoat: 1, clearcoatRoughness: 0.06, sheen: 0.7, sheenRoughness: 0.45, sheenColor: C('#ffd8cd'), ior: 1.36, specularIntensity: 0.7 });
  // volume cue: a longer light path at the grazing edges reads deeper and more saturated, the core glows lighter
  lm.onBeforeCompile = (sh) => {
    sh.fragmentShader = sh.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
      { float fv = 1.0 - abs(dot(normalize(vNormal), normalize(vViewPosition))); diffuseColor.rgb *= mix(1.1, 0.62, pow(fv, 1.6)); }`);
  };
  const liqM = new THREE.Mesh(lg, lm); liqM.position.y = 0.136; g.add(liqM);
  /* suspended micro-bubbles: clinging to the inner wall and gathered under the meniscus (opaque, so the glass refracts them) */
  const bubU = { uC: { value: C('#D9897B') } };
  const bubMat = new THREE.ShaderMaterial({ uniforms: bubU,
    vertexShader: `varying vec3 vN; varying vec3 vV;
      void main(){ vec4 mv = modelViewMatrix * instanceMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * mat3(instanceMatrix) * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform vec3 uC; varying vec3 vN; varying vec3 vV;
      void main(){ vec3 n = normalize(vN), v = normalize(vV); float f = 1.0 - max(dot(n, v), 0.0);
        vec3 c = mix(uC * 1.35 + 0.05, uC * 0.55, smoothstep(0.35, 0.75, f));
        c = mix(c, vec3(1.0, 0.96, 0.94), smoothstep(0.8, 0.98, f));
        c += pow(max(dot(reflect(-v, n), normalize(vec3(-0.45, 0.75, 0.5))), 0.0), 36.0) * 1.6;
        gl_FragColor = vec4(c, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }` });
  seed = 61; const NB = 110, bub = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 16, 12), bubMat, NB);
  { const m = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), ps = new THREE.Vector3();
    for (let i = 0; i < NB; i++) {
      const a = rnd() * 6.283, wall = i < 84, rr = wall ? 0.3815 : 0.06 + rnd() * 0.29, sz = wall ? 0.0022 + Math.pow(rnd(), 3) * 0.009 : 0.0025 + rnd() * 0.004;
      const y = wall ? 0.07 + Math.pow(rnd(), 0.8) * (F - 0.1) : F + 0.0005;
      ps.set(Math.sin(a) * rr, y, Math.cos(a) * rr); sc.setScalar(sz); m.compose(ps, q, sc); bub.setMatrixAt(i, m);
    } }
  liqM.add(bub);

  /* screen-printed label on the glass */
  const labDay = printTex(false), labNight = printTex(true), labBump = printTex(false, true);
  const lab = new THREE.Mesh(new THREE.CylinderGeometry(0.4218, 0.4218, 0.58, 160, 1, true, -0.95, 1.9),
    new THREE.MeshPhysicalMaterial({ map: labDay, bumpMap: labBump, bumpScale: 1.6, transparent: true, depthWrite: false, roughness: 0.42, clearcoat: 0.55, clearcoatRoughness: 0.22, specularIntensity: 0.7 }));
  lab.position.y = 0.47; lab.renderOrder = 3; g.add(lab);
  /* pipette (glass rod look; opaque so it reads through the transmissive bottle) */
  const pp = prof((p) => { p.moveTo(0, 0.2); p.quadraticCurveTo(0.016, 0.2, 0.02, 0.24); p.lineTo(0.03, 0.36); p.lineTo(0.03, 1.18); p.lineTo(0, 1.18); }, 10);
  const ppG = new THREE.LatheGeometry(pp, 48); { const uv = ppG.attributes.uv, n = pp.length; for (let i = 0; i < uv.count; i++) uv.setY(i, (pp[i % n].y - 0.2) / 0.98); }
  const pipDay = pipetteTex(false), pipNight = pipetteTex(true); pipDay.flipY = pipNight.flipY = false;
  const pipM = new THREE.MeshPhysicalMaterial({ map: pipDay, roughness: 0.04, clearcoat: 1, clearcoatRoughness: 0.03, specularIntensity: 1, envMapIntensity: 1.1 });
  const pip = new THREE.Mesh(ppG, pipM); g.add(pip);
  /* knurled champagne-gold collar with bevels, polished ring, matte rubber bulb */
  const gold = new THREE.MeshPhysicalMaterial({ color: '#DDB088', metalness: 1, roughness: 1, roughnessMap: mapTex('collar_r.webp'), normalMap: mapTex('collar_n.webp'), normalScale: new THREE.Vector2(0.08, 0.08), anisotropy: 0.35, anisotropyRotation: Math.PI / 2, clearcoat: 0.25, clearcoatRoughness: 0.25 });
  const polished = new THREE.MeshPhysicalMaterial({ color: '#E7C29C', metalness: 1, roughness: 0.12 });
  const colP = prof((p) => {
    p.moveTo(0.15, 1.056); p.lineTo(0.2, 1.056); p.quadraticCurveTo(0.214, 1.056, 0.216, 1.072);
    p.lineTo(0.216, 1.28); p.quadraticCurveTo(0.215, 1.298, 0.198, 1.3); p.lineTo(0.128, 1.3);
  }, 8);
  let colG = knurl(new THREE.LatheGeometry(colP, 288), 1.1, 1.258, 72, 0.03);
  { const p = colG.attributes.position, uv = new Float32Array(p.count * 2); // knurl drops uv: rebuild (u = angle, v = height)
    for (let i = 0; i < p.count; i++) { uv[i * 2] = Math.atan2(p.getX(i), p.getZ(i)) / 6.2832 + 0.5; uv[i * 2 + 1] = (p.getY(i) - 1.056) / 0.244; }
    colG.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); }
  const col = new THREE.Mesh(colG, gold); g.add(col);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.205, 0.012, 16, 160), polished); ring.rotation.x = Math.PI / 2; ring.position.y = 1.068; g.add(ring);
  const ring2 = ring.clone(); ring2.scale.setScalar(0.985); ring2.position.y = 1.289; g.add(ring2);
  const bulbPts = new THREE.SplineCurve([V2(0, 0), V2(0.128, 0), V2(0.134, 0.02), V2(0.126, 0.05), V2(0.15, 0.11), V2(0.164, 0.18), V2(0.156, 0.26), V2(0.118, 0.33), V2(0.06, 0.366), V2(0, 0.374)]).getPoints(64);
  bulbPts[bulbPts.length - 1].x = 0;
  const bulbM = new THREE.Mesh(new THREE.LatheGeometry(bulbPts, 128), new THREE.MeshPhysicalMaterial({ color: '#4E2F2B', roughness: 0.66, normalMap: mapTex('bulb_n.webp'), normalScale: new THREE.Vector2(0.7, 0.7), sheen: 0.8, sheenRoughness: 0.5, sheenColor: C('#b98479'), clearcoat: 0.12, clearcoatRoughness: 0.6 }));
  bulbM.position.y = 1.296; g.add(bulbM);
  for (let k = 0; k < 3; k++) { const gr = new THREE.Mesh(new THREE.TorusGeometry(0.131 - k * 0.002, 0.0055, 10, 96), bulbM.material); gr.rotation.x = Math.PI / 2; gr.position.y = 1.322 + k * 0.016; g.add(gr); }
  g.children.forEach((c) => (c.position.y -= 0.83));
  const p = new THREE.Group(); p.add(g); p.userData = { h: 1.67, glass, liq: liqM, lm, lab: lab.material, labDay, labNight, bulb: bulbM, inner: g, bubU, pipM, pipDay, pipNight }; return p;
}
const paperN = (a, b) => mapTex('paper_n.webp', [a, b]);
function cleanser() {
  const g = new THREE.Group();
  const b = prof((p) => { p.moveTo(0, 0); p.lineTo(0.26, 0); p.absarc(0.26, 0.04, 0.04, -Math.PI / 2, 0, false); p.lineTo(0.3, 0.98); p.bezierCurveTo(0.3, 1.07, 0.16, 1.08, 0.11, 1.1); p.lineTo(0.11, 1.15); p.lineTo(0, 1.15); });
  const bm = new THREE.MeshPhysicalMaterial({ color: '#C86E68', roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.08 });
  g.add(new THREE.Mesh(new THREE.LatheGeometry(b, seg), bm));
  const labDay = labelTex(['Cloud', 'Milk', 'GENTLE CLEANSER']), labNight = labelTex(['Moon', 'Oil', 'CLEANSING OIL'], true);
  const lab = new THREE.Mesh(new THREE.CylinderGeometry(0.303, 0.303, 0.4, 128, 1, true, -0.9, 1.8), new THREE.MeshPhysicalMaterial({ map: labDay, roughness: 0.78, normalMap: paperN(2.4, 1), normalScale: new THREE.Vector2(0.45, 0.45), sheen: 0.3, sheenColor: C('#ffffff') }));
  lab.position.y = 0.52; g.add(lab);
  const cream = new THREE.MeshPhysicalMaterial({ color: '#F7E7E2', roughness: 0.34, clearcoat: 0.6, clearcoatRoughness: 0.2 });
  // ribbed pump collar
  const cp = prof((p) => { p.moveTo(0.1, 1.1); p.lineTo(0.135, 1.1); p.quadraticCurveTo(0.142, 1.1, 0.142, 1.11); p.lineTo(0.142, 1.21); p.quadraticCurveTo(0.142, 1.22, 0.13, 1.22); p.lineTo(0.05, 1.22); }, 4);
  const cg = knurl(new THREE.LatheGeometry(cp, 160), 1.115, 1.205, 40, 0.035);
  g.add(new THREE.Mesh(cg, cream));
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.1, 48), cream); stem.position.y = 1.27; g.add(stem);
  // actuator head with a rounded top and a curved nozzle
  const hp = prof((p) => { p.moveTo(0, 1.3); p.lineTo(0.1, 1.3); p.quadraticCurveTo(0.125, 1.3, 0.125, 1.33); p.lineTo(0.125, 1.37); p.quadraticCurveTo(0.125, 1.405, 0.08, 1.41); p.lineTo(0, 1.412); }, 6);
  g.add(new THREE.Mesh(new THREE.LatheGeometry(hp, 96), cream));
  const nz = new THREE.CatmullRomCurve3([new THREE.Vector3(0.08, 1.37, 0), new THREE.Vector3(0.2, 1.372, 0), new THREE.Vector3(0.27, 1.36, 0), new THREE.Vector3(0.3, 1.33, 0)]);
  const noz = new THREE.Mesh(new THREE.TubeGeometry(nz, 24, 0.026, 14, false), cream); g.add(noz);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.026, 24, 16), cream); tip.position.set(0.3, 1.33, 0); g.add(tip);
  { // dispensing orifice at the nozzle tip (dark recess with a lip)
    const d = new THREE.Vector3(0.707, -0.707, 0), q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), d);
    const hole = new THREE.Mesh(new THREE.CircleGeometry(0.0115, 24), new THREE.MeshStandardMaterial({ color: '#3a2422', roughness: 0.8 }));
    hole.position.set(0.3, 1.33, 0).addScaledVector(d, 0.0262); hole.quaternion.copy(q); g.add(hole);
    const lipR = new THREE.Mesh(new THREE.TorusGeometry(0.0125, 0.0022, 8, 32), cream); lipR.position.copy(hole.position).addScaledVector(d, -0.0006); lipR.quaternion.copy(q); g.add(lipR);
  }
  const p = new THREE.Group(); g.position.y = 0; p.add(g); p.userData = { h: 1.4, body: bm, dayC: C('#C86E68'), nightC: C('#7E4250'), lab: lab.material, labDay, labNight, inner: g }; return p;
}
function jar() {
  const g = new THREE.Group();
  const b = prof((p) => { p.moveTo(0, 0); p.lineTo(0.5, 0); p.absarc(0.5, 0.05, 0.05, -Math.PI / 2, 0, false); p.lineTo(0.555, 0.35); p.quadraticCurveTo(0.555, 0.385, 0.52, 0.39); p.lineTo(0.5, 0.4); p.lineTo(0, 0.4); });
  const bm = new THREE.MeshPhysicalMaterial({ color: '#F4D6CF', roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.12, sheen: 0.4, sheenColor: C('#fff') });
  g.add(new THREE.Mesh(new THREE.LatheGeometry(b, seg), bm));
  const lp = prof((p) => { p.moveTo(0, 0.6); p.lineTo(0.42, 0.6); p.quadraticCurveTo(0.5, 0.6, 0.53, 0.61); p.quadraticCurveTo(0.562, 0.612, 0.562, 0.585); p.lineTo(0.562, 0.425); p.quadraticCurveTo(0.562, 0.4, 0.535, 0.4); p.lineTo(0.5, 0.4); }, 6);
  const lgeo = knurl(new THREE.LatheGeometry(lp, 320), 0.44, 0.565, 120, 0.012);
  g.add(new THREE.Mesh(lgeo, new THREE.MeshPhysicalMaterial({ color: '#DDB088', metalness: 1, roughness: 0.26, clearcoat: 0.3 })));
  const labDay = labelTex(['Dew', 'Balm', 'MOISTURISER']), labNight = labelTex(['Sleep', 'Balm', 'OVERNIGHT MASK'], true);
  const lab = new THREE.Mesh(new THREE.CylinderGeometry(0.558, 0.558, 0.22, 160, 1, true, -0.7, 1.4), new THREE.MeshPhysicalMaterial({ map: labDay, roughness: 0.78, normalMap: paperN(3.6, 0.6), normalScale: new THREE.Vector2(0.45, 0.45), sheen: 0.3, sheenColor: C('#ffffff') }));
  lab.position.y = 0.2; g.add(lab);
  const p = new THREE.Group(); p.add(g); p.userData = { h: 0.61, body: bm, dayC: C('#F4D6CF'), nightC: C('#6E3A41'), lab: lab.material, labDay, labNight, inner: g }; return p;
}
function shadowMesh(s) {
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  const gr = x.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(120,50,45,.45)'); gr.addColorStop(1, 'rgba(120,50,45,0)');
  x.fillStyle = gr; x.fillRect(0, 0, 128, 128);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(s, s), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; return m;
}
const bottle = dropper(); scene.add(bottle);
// transmission backdrop: drawn only into three's transmission buffer (which otherwise clears to half-white on an
// alpha canvas), so the glass refracts the page colour instead of a milky white. Invisible in the visible pass.
const BD = [C('#F6E3DF'), C('#3A2326')];
const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshBasicMaterial({ color: BD[0].clone(), depthWrite: false, depthTest: false, toneMapped: false }));
backdrop.position.z = -30; backdrop.renderOrder = -20; backdrop.frustumCulled = false;
backdrop.onBeforeRender = (rr) => { backdrop.material.colorWrite = rr.getRenderTarget() !== null; };
scene.add(backdrop);
// floating dew droplets around the bottle in the hero
const NDp = 14; seed = 29;
const drops = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 28, 20),
  new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.03, transmission: 1, thickness: 0.4, ior: 1.33, clearcoat: 1 }), NDp);
const dropD = Array.from({ length: NDp }, () => ({ a: rnd() * 6.28, r: 1.2 + rnd() * 1.6, y: -1.2 + rnd() * 2.6, s: 0.05 + rnd() * 0.09, sp: 0.15 + rnd() * 0.3, z: (rnd() - 0.5) * 2 }));
scene.add(drops);
// at night the droplets shrink away and soft stars take their place
const starTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,250,240,1)'); g.addColorStop(0.2, 'rgba(255,225,215,.9)'); g.addColorStop(0.5, 'rgba(240,160,150,.25)'); g.addColorStop(1, 'rgba(240,160,150,0)');
  x.fillStyle = g; x.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
const starGeo = new THREE.BufferGeometry();
starGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NDp * 3), 3));
starGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(NDp * 3), 3));
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ size: 0.4, map: starTex, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true }));
stars.frustumCulled = false; stars.renderOrder = 8; scene.add(stars);
/* mode state (AM 0 / PM 1) */
const MD = { from: 0, to: 0, t0: 0, dur: (isM ? 1500 : 1750) * Math.min(10, Math.max(1, +(new URLSearchParams(location.search).get('slowmo') || 1))), dir: 1 };
const LIQ = [C('#D9897B'), C('#86283A')], GL = [C('#fff4f1'), C('#e2b2b4')];
const LK = { kd: C('#fff1ea'), kn: C('#f0c8cf'), rd: C('#ffc2b5'), rn: C('#ff8f80'), hd: C('#fff4f0'), hn: C('#6e4048'), gd: C('#d89a90'), gn: C('#2a181b') };
const hemi = scene.children.find((o) => o.isHemisphereLight);
const tmpC = new THREE.Color();
function setMode3D(on) { if (on === MD.to) return; MD.from = MD.to; MD.to = on; MD.t0 = performance.now(); MD.dir = on ? 1 : -1; }
function syncMode3D() { MD.t0 = performance.now(); }
// podium: three plinths + cleanser + jar (the dropper lands on the middle one)
const pod = new THREE.Group(); scene.add(pod);
const PL = [{ x: -1.55, r: 0.85, h: 0.55, c: '#E8B2A8', n: '#6B3E42' }, { x: 0, r: 0.75, h: 1.05, c: '#F0C9C0', n: '#7D4A4D' }, { x: 1.55, r: 0.85, h: 0.75, c: '#DE9F94', n: '#62383D' }];
PL.forEach((p) => {
  p.mat = new THREE.MeshPhysicalMaterial({ color: p.c, roughness: 0.42, clearcoat: 0.6, clearcoatRoughness: 0.3, sheen: 0.3, sheenColor: C('#ffe8e2'), envMapIntensity: 0.55 }); p.dc = C(p.c); p.nc = C(p.n);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(p.r, p.r, p.h, seg), p.mat);
  m.position.set(p.x, p.h / 2, p.x === 0 ? -0.3 : 0.2); pod.add(m);
  const lip = new THREE.Mesh(new THREE.TorusGeometry(p.r, 0.02, 8, seg), new THREE.MeshPhysicalMaterial({ color: '#D9A877', metalness: 1, roughness: 0.3 }));
  lip.rotation.x = Math.PI / 2; lip.position.set(p.x, p.h, m.position.z); pod.add(lip);
  const sh = shadowMesh(p.r * 1.6); sh.position.set(p.x, p.h + 0.005, m.position.z); pod.add(sh); p.sh = sh;
});
// contact shadow + caustic under the dropper on the middle plinth (glass focuses the key light into a rose bloom)
function causticTex() {
  const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
  const blob = (cx, cy, rx, ry, a, col) => { x.save(); x.translate(cx, cy); x.scale(rx, ry); const g = x.createRadialGradient(0, 0, 0, 0, 0, 1); g.addColorStop(0, col(a)); g.addColorStop(1, col(0)); x.fillStyle = g; x.beginPath(); x.arc(0, 0, 1, 0, 7); x.fill(); x.restore(); };
  const rose = (a) => `rgba(255,214,196,${a})`;
  // ring of focused light with a hot core and a couple of soft streaks
  x.globalCompositeOperation = 'lighter';
  blob(128, 128, 70, 46, 0.35, rose); blob(128, 128, 40, 26, 0.55, rose); blob(124, 126, 13, 9, 0.9, (a) => `rgba(255,246,238,${a})`);
  x.lineWidth = 5; x.strokeStyle = 'rgba(255,226,210,.55)'; x.filter = 'blur(3px)';
  x.beginPath(); x.ellipse(128, 128, 54, 34, 0, 0.2, Math.PI * 1.75); x.stroke();
  x.lineWidth = 2; x.beginPath(); x.ellipse(128, 128, 30, 19, 0, -0.6, Math.PI * 1.2); x.stroke();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const bsh = shadowMesh(0.95); bsh.material.opacity = 0; bsh.scale.set(1, 0.85, 1); pod.add(bsh);
const caus = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.0), new THREE.MeshBasicMaterial({ map: causticTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0, toneMapped: false }));
caus.rotation.x = -Math.PI / 2; pod.add(caus);
bsh.position.set(0.06, PL[1].h + 0.007, -0.3); caus.position.set(0.33, PL[1].h + 0.009, -0.12); bsh.renderOrder = caus.renderOrder = 1;
const floorSh = shadowMesh(6.5); floorSh.position.y = 0.002; floorSh.scale.set(1, 0.5, 1); pod.add(floorSh);
const cl = cleanser(), jr = jar(); pod.add(cl, jr);
cl.position.set(PL[0].x, PL[0].h, 0.2); jr.position.set(PL[2].x, PL[2].h, 0.2);
pod.position.y = -0.9;

/* ------------------------------------------------------------ anchors + travel */
const anchors = $$('.cup-a').map((el) => ({ el, key: el.dataset.a }));
const toW = (x, y) => { const upp = uppAt(0); return [(x - W / 2) * upp, -(y - H / 2) * upp]; };
const ptr = { x: 0, y: 0 };
addEventListener('pointermove', (e) => { ptr.x = e.clientX / W * 2 - 1; ptr.y = e.clientY / H * 2 - 1; }, { passive: true });
const podTags = $$('.pt');
const vD = new THREE.Vector3(), sD = new THREE.Vector3(), qD = new THREE.Quaternion(), mD = new THREE.Matrix4();
const podSec = $('#ritual');
const ZQ = new URLSearchParams(location.search), ZOOM = ZQ.get('zoom') ? { k: +ZQ.get('zoom'), x: +(ZQ.get('zx') || 0), y: +(ZQ.get('zy') || 0) } : null;
function frame(t) {
  const upp = uppAt(0);
  // ---- AM / PM transition
  let mp = 1;
  if (MD.from !== MD.to) {
    mp = reduced ? 1 : clamp((performance.now() - MD.t0) / MD.dur);
    SW.uFrom.value = MD.from; SW.uTo.value = MD.to; SW.uW.value = lerp(-0.32, 1.32, eio(mp));
    if (mp >= 1) { MD.from = MD.to; SW.uFrom.value = SW.uTo.value = MD.to; SW.uW.value = 2; }
  }
  const tr = MD.from !== MD.to, me = tr ? eio(mp) : 1;
  const Nn = tr ? lerp(MD.from, MD.to, ss(0.42, 0.78, me)) : MD.to;
  key.color.copy(LK.kd).lerp(LK.kn, Nn); key.intensity = lerp(2.2, 1.0, Nn) * lightK;
  rim.color.copy(LK.rd).lerp(LK.rn, Nn); rim.intensity = lerp(1.4, 2.4, Nn) * (0.5 + 0.5 * lightK);
  if (hemi) { hemi.color.copy(LK.hd).lerp(LK.hn, Nn); hemi.groundColor.copy(LK.gd).lerp(LK.gn, Nn); }
  scene.environmentIntensity = lerp(0.95, 0.5, Nn) * envK; r.toneMappingExposure = lerp(1.0, 0.92, Nn);
  const U = bottle.userData;
  U.lm.color.copy(LIQ[0]).lerp(LIQ[1], Nn); backdrop.material.color.copy(BD[0]).lerp(BD[1], Nn); U.lm.emissive.copy(U.lm.color).multiplyScalar(0.12);
  U.bubU.uC.value.copy(U.lm.color); U.pipM.map = Nn > 0.5 ? U.pipNight : U.pipDay;
  U.lab.map = Nn > 0.5 ? U.labNight : U.labDay;
  U.liq.scale.y = tr ? Math.max(0.05, 1 - 0.93 * Math.sin(Math.PI * ss(0.16, 0.92, me))) : 1;
  const sq = tr ? Math.sin(Math.PI * ss(0.08, 0.36, me)) : 0; U.bulb.scale.set(1 + 0.2 * sq, 1 - 0.16 * sq, 1 + 0.2 * sq);
  const spin = tr && !reduced ? MD.dir * Math.PI * 2 * eio(ss(0.06, 0.96, mp)) : 0;
  PL.forEach((p) => p.mat.color.copy(p.dc).lerp(p.nc, Nn));
  [cl, jr].forEach((o, k) => {
    const d = o.userData; d.body.color.copy(d.dayC).lerp(d.nightC, Nn); d.lab.map = Nn > 0.5 ? d.labNight : d.labDay;
    const w = tr ? ss(0.22 + k * 0.1, 0.82 + k * 0.08, mp) : 1;
    d.inner.rotation.y = tr && !reduced ? MD.dir * Math.PI * 2 * eio(w) : 0;
    d.hop = tr && !reduced ? Math.sin(Math.PI * w) * 0.45 : 0;
  });
  const A = anchors.map((a) => { const b = a.el.getBoundingClientRect(); return { a, x: b.left + b.width / 2, y: b.top + b.height / 2, h: b.height, w: b.width }; });
  const vc = H * 0.5;
  let i = 0; while (i < A.length - 1 && A[i + 1].y <= vc) i++;
  let k = 0; if (A[0].y > vc) k = 0; else if (i < A.length - 1) k = clamp((vc - A[i].y) / (A[i + 1].y - A[i].y));
  const a0 = A[i], a1 = A[Math.min(i + 1, A.length - 1)], e = eio(k);
  // podium placement (scale from its anchor)
  const P = A[2]; const ps = (P.w * upp) / 5.2;
  const [px, py] = toW(P.x, P.y + P.h * 0.5);
  pod.position.set(px, py, 0); pod.scale.setScalar(ps); pod.rotation.y = reduced ? 0 : ptr.x * 0.08;
  // podium drop sequence
  const pb = podSec.getBoundingClientRect();
  const pp = reduced ? 1 : clamp(-pb.top / Math.max(1, pb.height - H));
  const d1 = eob(ss(0.12, 0.38, pp)), d2 = eob(ss(0.36, 0.62, pp));
  cl.position.y = PL[0].h + (1 - d1) * 5 + cl.userData.hop; jr.position.y = PL[2].h + (1 - d2) * 5 + jr.userData.hop;
  cl.visible = d1 > 0.001; jr.visible = d2 > 0.001;
  PL[0].sh.material.opacity = d1; PL[2].sh.material.opacity = d2;
  podTags[0].classList.toggle('on', d1 > 0.6 || reduced); podTags[2].classList.toggle('on', d2 > 0.6 || reduced);
  // bottle target per anchor
  const tgt = (o) => {
    if (o.a.key === 'podium') {
      const v = new THREE.Vector3(0, PL[1].h + 0.83 * 0.8, -0.3).multiplyScalar(1); pod.updateMatrixWorld();
      const w = pod.localToWorld(new THREE.Vector3(0, PL[1].h + 0.83 * 0.8, -0.3));
      return { x: w.x, y: w.y, s: ps * 0.8 };
    }
    const [x, y] = toW(o.x, o.y); return { x, y, s: (o.h * upp) / 1.75 };
  };
  const t0 = tgt(a0), t1 = tgt(a1);
  const bx = lerp(t0.x, t1.x, e), by = lerp(t0.y, t1.y, e), bs = lerp(t0.s, t1.s, e);
  const onPod = a0.a.key === 'podium' || (a1.a.key === 'podium' && e > 0.98);
  const bob = reduced || onPod ? 0 : Math.sin(t * 0.9) * 0.08 * bs;
  const intro = reduced ? 1 : eob(clamp((t - 0.15) / 1.5));
  bottle.position.set(bx, by + bob + (1 - intro) * 4 * bs, 0.4); bottle.scale.setScalar(bs);
  bottle.rotation.set((reduced ? 0 : ptr.y * 0.1) + Math.sin(e * Math.PI) * 0.2, (reduced ? 0.3 : t * 0.25 + ptr.x * 0.4) + e * Math.PI * 2 * (k > 0 && k < 1 ? 1 : 0) + spin, Math.sin(e * Math.PI) * -0.25 + (onPod ? 0 : Math.sin(t * 0.6) * 0.04));
  podTags[1].classList.toggle('on', onPod && pb.top < H * 0.2 || reduced);
  { const land = a0.a.key === 'podium' ? 1 : a1.a.key === 'podium' ? ss(0.7, 1, e) : 0; bsh.material.opacity = land * 0.95; caus.material.opacity = land * (0.75 - 0.35 * Nn); caus.visible = bsh.visible = land > 0.001; }
  // droplets orbit lazily around the hero bottle and leave with the hero
  const hs = (isM ? 0 : 0) + scrollY, h0 = tgt(A[0]);
  drops.visible = hs < H * 1.2; stars.visible = drops.visible && Nn > 0.01;
  if (drops.visible) {
    dropD.forEach((d, j) => {
      const ang = d.a + (reduced ? 0 : t * d.sp);
      vD.set(h0.x + Math.cos(ang) * d.r * h0.s * 0.9, h0.y + (d.y + (reduced ? 0 : Math.sin(t * 0.7 + j) * 0.12)) * h0.s, 0.4 + Math.sin(ang) * d.r * 0.6 + d.z);
      sD.setScalar(d.s * h0.s * intro * (1 - Nn * 0.92)); mD.compose(vD, qD, sD); drops.setMatrixAt(j, mD);
      starGeo.attributes.position.setXYZ(j, vD.x, vD.y, vD.z);
      const tw = Nn * (reduced ? 0.8 : 0.45 + 0.55 * Math.pow(0.5 + 0.5 * Math.sin(t * (1.3 + j * 0.37) + j * 2.1), 2));
      starGeo.attributes.color.setXYZ(j, tw, tw, tw);
    });
    drops.instanceMatrix.needsUpdate = true;
    starGeo.attributes.position.needsUpdate = true; starGeo.attributes.color.needsUpdate = true;
    stars.material.size = 0.55 * h0.s;
  }
  // hero world scrolls with the page
  if (!isM) {
    const s = scrollY;
    hero.sky.material.uniforms.uT.value = t; hero.type.material.uniforms.opacity.value = reduced ? 1 : ss(0.2, 1.6, t); hero.sky.material.uniforms.uOff.value = s / H;
    const vis = s < H * 1.3; hero.sky.visible = vis; hero.type.visible = vis;
    const zt = -3.2, ut = uppAt(zt);
    hero.type.scale.setScalar(W * ut * 1.0); hero.type.position.set(ptr.x * -0.15, H * ut * 0.04 + s * ut, zt);
    hero.items.forEach((it) => {
      it.m.visible = vis; if (!vis) return;
      const u = uppAt(it.z), par = (it.z + 9) * 0.04;
      it.m.position.set(it.x + Math.sin(t * it.sp + it.ph) * 0.6 + (reduced ? 0 : ptr.x * -par), it.y + s * u, it.z);
      it.m.material.uniforms.uT.value = reduced ? 0 : t;
    });
  }
  if (ZOOM) { // ?zoom=k&zx=&zy= : close-up render for QA shots (camera narrows on the bottle; layout maths untouched)
    const f0 = cam.fov, x0 = cam.position.x, y0 = cam.position.y;
    cam.fov = f0 / ZOOM.k; cam.position.x = bottle.position.x + ZOOM.x * bs; cam.position.y = bottle.position.y + ZOOM.y * bs; cam.updateProjectionMatrix();
    r.render(scene, cam); cam.fov = f0; cam.position.x = x0; cam.position.y = y0; cam.updateProjectionMatrix(); return;
  }
  r.render(scene, cam);
}

/* ------------------------------------------------------------ ingredient orbit (desktop) */
const ING = [
  ['Hyaluronic acid', '2%', 'Pulls water into the skin and holds it there, so it looks plump and dewy.'],
  ['Niacinamide', '4%', 'Calms redness and evens tone over a few weeks of daily use.'],
  ['Rose clay', '1%', 'A soft pink clay that gently lifts oil without drying.'],
  ['Squalane', '3%', 'A light, plant-based oil that seals in moisture without shine.'],
  ['Panthenol', '1.5%', 'Vitamin B5 for a skin barrier that feels comfortable again.'],
];
const orb = { a: 0, target: 0, sel: 0 };
const bubs = $$('.bub'); const bubWrap = $('.bubs');
function selectIng(i) {
  i = (i + 5) % 5; orb.sel = i;
  // rotate the ring so the chosen bubble comes to the front (bottom of the ellipse = closest)
  const want = Math.PI / 2 - (i / 5) * Math.PI * 2;
  let d = want - orb.target; d = Math.atan2(Math.sin(d), Math.cos(d)); orb.target += d;
  bubs.forEach((b, j) => b.setAttribute('aria-pressed', j === i ? 'true' : 'false'));
  const card = $('.ing-card'); card.classList.add('sw');
  setTimeout(() => {
    $('#ic-i').textContent = String(i + 1).padStart(2, '0'); $('#ic-p').textContent = ING[i][1]; $('#ic-h').textContent = ING[i][0]; $('#ic-d').textContent = ING[i][2];
    card.classList.remove('sw');
  }, reduced ? 0 : 220);
}
function orbitFrame(dt) {
  const anc = $('.o-anc').getBoundingClientRect();
  if (anc.bottom < -200 || anc.top > H + 200) return;
  orb.a = reduced ? orb.target : lerp(orb.a, orb.target, 1 - Math.exp(-dt * 4));
  const box = bubWrap.getBoundingClientRect();
  const cx = anc.left + anc.width / 2 - box.left, cy = anc.top + anc.height * 0.56 - box.top, rx = Math.min(W * 0.22, 360), ry = anc.height * 0.18;
  bubs.forEach((b, j) => {
    const ang = orb.a + (j / 5) * Math.PI * 2;
    const dz = Math.sin(ang); const sc = 0.72 + 0.38 * (dz + 1) / 2;
    const x = cx + Math.cos(ang) * rx, y = cy + dz * ry;
    b.style.transform = `translate(${(x - 42).toFixed(1)}px,${(y - 42).toFixed(1)}px) scale(${sc.toFixed(3)})`;
    b.style.zIndex = dz > -0.05 ? 7 : 3; b.style.opacity = (0.55 + 0.45 * (dz + 1) / 2).toFixed(3);
  });
}


/* ------------------------------------------------------------ AM / PM ritual switch
   One diagonal front sweeps the page left to right: the DOM is revealed by a View Transition clip in the
   same geometry and timing as the shader front, so sky, clouds, giant type and page all turn together. */
function initMode() {
  const root = document.documentElement, btns = $$('.mode-b'), tc = $('#tc'), sr = $('#h1');
  const tws = $$('[data-pm]'); tws.forEach((t) => { t.dataset.am = t.textContent; });
  let cur = 0, busy = false;
  const apply = (on) => {
    root.classList.toggle('pm', !!on);
    btns.forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.m === on)));
    tws.forEach((t) => { t.textContent = on ? t.dataset.pm : t.dataset.am; });
    if (sr) sr.textContent = on ? 'Night Dew: Serum 02 by Dew Theory' : 'Pure Dew: Serum 01 by Dew Theory';
    if (tc) tc.content = on ? '#3A2326' : '#F6E3DF';
    setMode3D(on);
  };
  const set = (on) => {
    on = on ? 1 : 0; if (on === cur || busy) return; cur = on;
    if (reduced) { root.classList.add('rm-instant'); apply(on); requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('rm-instant'))); return; }
    if (!document.startViewTransition) { root.classList.add('mode-anim'); apply(on); setTimeout(() => root.classList.remove('mode-anim'), 1200); return; }
    busy = true;
    const vt = document.startViewTransition(() => apply(on));
    vt.ready.then(() => {
      syncMode3D();
      const kf = [];
      for (let i = 0; i <= 28; i++) {
        const w = lerp(-0.32, 1.32, eio(i / 28));
        kf.push({ clipPath: `polygon(-60% 0, ${(w * 100).toFixed(2)}% 0, ${((w - 0.25) * 100).toFixed(2)}% 100%, -60% 100%)` });
      }
      root.animate(kf, { duration: MD.dur, easing: 'linear', pseudoElement: '::view-transition-new(root)' });
    }).catch(() => {});
    vt.finished.finally(() => { busy = false; });
  };
  btns.forEach((b) => {
    b.addEventListener('click', () => set(+b.dataset.m));
    b.addEventListener('keydown', (e) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) { e.preventDefault(); const n = cur ? 0 : 1; set(n); btns[n].focus(); }
    });
  });
}

/* ------------------------------------------------------------ boot */
let lenis = null;
function initUI() {
  const go = (el) => {
    if (lenis) lenis.scrollTo(el || 0, { duration: 1.6 });
    else if (el) el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); else scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  };
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href').slice(1); if (!id || id === 'main') return;
    e.preventDefault(); if (a.id === 'cta') return; go(id === 'top' ? null : document.getElementById(id));
  }));
  $('#cta').addEventListener('click', () => { $('#toast').textContent = 'Concept only: Dew Theory is a fictional brand, so there is no waitlist yet.'; });
  if (!isM) {
    bubs.forEach((b, j) => {
      b.addEventListener('click', () => selectIng(j));
      b.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); selectIng(j + 1); bubs[(j + 1) % 5].focus(); }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); selectIng(j - 1); bubs[(j + 4) % 5].focus(); }
      });
    });
    $('#ic-prev').addEventListener('click', () => selectIng(orb.sel - 1));
    $('#ic-next').addEventListener('click', () => selectIng(orb.sel + 1));
    orb.a = orb.target = Math.PI / 2;
  }
  if (!coarse && !reduced) {
    $$('.mag').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const b = el.getBoundingClientRect(); const dx = e.clientX - (b.left + b.width / 2), dy = e.clientY - (b.top + b.height / 2);
        el.style.transition = 'transform .15s'; el.style.transform = `translate(${dx * 0.22}px,${dy * 0.32}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transition = 'transform .7s cubic-bezier(.16,1,.3,1)'; el.style.transform = ''; });
    });
  }
}
function size() {
  const w = innerWidth, h = innerHeight;
  if (isM && w === W && Math.abs(h - H) < 140 && r.domElement.width) return;
  W = w; H = h; r.setSize(W, H, false); cam.aspect = W / H; cam.updateProjectionMatrix(); setRes();
}
function setRes() { r.getDrawingBufferSize(SW.uRes.value); if (hero.sky) hero.sky.material.uniforms.uAsp.value = W / H; }
r.setSize(W, H, false); setRes();
addEventListener('resize', size);
initUI(); initMode(); reveals(); lenis = smooth();
let T = 0, last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now; if (!reduced) T += dt;
  if (!isM) orbitFrame(dt);
  frame(T);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
