/* Fumée - WebGL smoke field (desktop). A feedback "ink" buffer advected by curl noise and fed by the cursor,
   composited over a domain-warped fbm smoke. Light build (Oct 31): rose-taupe smoke on warm parchment. Cursor velocity stirs it, scroll speed adds turbulence, scroll depth shifts the mood. */
import * as THREE from 'three';

const NOISE = /* glsl */`
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec2 mod289(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}
vec3 permute(vec3 x){return mod289(((x*34.0)+10.0)*x);}
float snoise(vec2 v){
  const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
  vec2 i=floor(v+dot(v,C.yy)); vec2 x0=v-i+dot(i,C.xx);
  vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);
  vec4 x12=x0.xyxy+C.xxzz; x12.xy-=i1; i=mod289(i);
  vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
  vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0); m=m*m; m=m*m;
  vec3 x=2.0*fract(p*C.www)-1.0; vec3 h=abs(x)-0.5; vec3 ox=floor(x+0.5); vec3 a0=x-ox;
  m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
  vec3 g; g.x=a0.x*x0.x+h.x*x0.y; g.yz=a0.yz*x12.xz+h.yz*x12.yw; return 130.0*dot(m,g);
}
float fbm(vec2 p){ float f=0.0, a=0.5; mat2 r=mat2(0.8,-0.6,0.6,0.8); for(int i=0;i<5;i++){ f+=a*snoise(p); p=r*p*2.02+3.1; a*=0.5; } return f; }
`;
const VERT = `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.0,1.0); }`;

const SIM = /* glsl */`
precision highp float; varying vec2 vUv;
uniform sampler2D uPrev; uniform vec2 uMouse; uniform vec2 uVel; uniform float uTime; uniform float uAspect; uniform float uTurb; uniform float uDecay;
${NOISE}
vec2 curl(vec2 p){ float e=0.01; float n1=snoise(p+vec2(0.0,e)), n2=snoise(p-vec2(0.0,e)), n3=snoise(p+vec2(e,0.0)), n4=snoise(p-vec2(e,0.0)); return vec2(n1-n2, n4-n3)/(2.0*e); }
void main(){
  vec2 uv=vUv;
  vec2 c=curl(vec2(uv.x*uAspect,uv.y)*2.4+vec2(0.0,uTime*0.08));
  vec2 p=uv - c*(0.0016+uTurb*0.0016) - vec2(0.0,0.0009);
  vec4 prev=texture2D(uPrev,p);
  float d=length((uv-uMouse)*vec2(uAspect,1.0));
  float sp=clamp(length(uVel)*14.0,0.0,1.4);
  float s=exp(-d*d/0.0045)*sp;
  float dens=prev.r*uDecay + s*0.30;
  float warm=prev.g*uDecay + s*0.35*smoothstep(0.2,1.2,sp);
  gl_FragColor=vec4(min(dens,1.6),min(warm,1.2),0.0,1.0);
}`;

const DISP = /* glsl */`
precision highp float; varying vec2 vUv;
uniform sampler2D uInk; uniform float uTime; uniform float uAspect; uniform float uScroll; uniform float uTurb; uniform vec2 uMouse;
uniform vec3 uC1; uniform vec3 uC2; uniform vec3 uC2d; uniform vec3 uC3; uniform float uMood;
${NOISE}
void main(){
  vec2 uv=vUv;
  vec2 p=vec2(uv.x*uAspect,uv.y)*0.62+vec2(0.0,uScroll*0.5);
  vec4 ink=texture2D(uInk,uv);
  p+=ink.r*vec2(0.03,0.06);
  float t=uTime*0.025;
  vec2 q=vec2(fbm(p*0.9+vec2(0.0,-t)), fbm(p*0.9+vec2(5.2,1.3)+vec2(t*0.4,0.0)));
  float f=fbm(p+1.25*q+vec2(t*0.5,-t*1.5)+uTurb*0.18)*0.5+0.5;
  float billow=smoothstep(0.5,0.95,f);
  float f2=fbm(p*1.3+1.8*q+vec2(-t*0.6,-t*2.0));
  float fil=pow(1.0-abs(f2),14.0)*smoothstep(0.35,0.75,f);
  vec3 col=mix(uC2d,uC2,smoothstep(-0.1,1.1,uv.y*0.6+0.2+q.y*0.35));
  vec3 smokeLight=mix(uC2,uC1,0.38);
  col=mix(col,smokeLight,billow*0.38);
  col=mix(col,smokeLight*1.05,fil*0.13);
  col=mix(col,mix(uC2,uC3,0.7),smoothstep(0.75,1.2,length(q))*0.07*uMood);
  vec2 px=vec2(0.004,0.006); float inkS=(ink.r*2.0+texture2D(uInk,uv+px).r+texture2D(uInk,uv-px).r+texture2D(uInk,uv+vec2(px.x,-px.y)).r+texture2D(uInk,uv-vec2(px.x,-px.y)).r)/6.0;
  float wisp=smoothstep(0.0,1.1,inkS);
  vec3 inkCol=mix(mix(uC2,uC1,0.8),mix(uC1,uC3,0.5),clamp(ink.g*1.2,0.0,1.0));
  col=mix(col,inkCol,wisp*0.42);
  float vig=smoothstep(1.35,0.2,length((uv-vec2(0.5,0.6))*vec2(1.0,1.25)));
  col*=mix(0.95,1.015,vig);
  gl_FragColor=vec4(col,1.0);
  #include <colorspace_fragment>
}`;

const hex = (h) => new THREE.Color(h);

export function createSmoke(canvas, { scale = 0.55, simScale = 0.25, still = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance', depth: false, stencil: false });
  renderer.setPixelRatio(1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const cam = new THREE.Camera();
  const quad = new THREE.PlaneGeometry(2, 2);
  const rtOpts = { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false, stencilBuffer: false };
  let rtA = new THREE.WebGLRenderTarget(4, 4, rtOpts), rtB = new THREE.WebGLRenderTarget(4, 4, rtOpts);
  const simMat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: SIM, depthTest: false, depthWrite: false,
    uniforms: { uPrev: { value: null }, uMouse: { value: new THREE.Vector2(.5, .5) }, uVel: { value: new THREE.Vector2() }, uTime: { value: 0 }, uAspect: { value: 1 }, uTurb: { value: 0 }, uDecay: { value: .975 } } });
  const dispMat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: DISP, depthTest: false, depthWrite: false,
    uniforms: { uInk: { value: null }, uTime: { value: 0 }, uAspect: { value: 1 }, uScroll: { value: 0 }, uTurb: { value: 0 }, uMouse: { value: new THREE.Vector2(.5, .5) }, uMood: { value: 1 },
      uC1: { value: hex('#9A6A5C') }, uC2: { value: hex('#F2EAE0') }, uC2d: { value: hex('#E3D3C0') }, uC3: { value: hex('#C9705F') } } });
  const simScene = new THREE.Scene(); simScene.add(new THREE.Mesh(quad, simMat));
  const dispScene = new THREE.Scene(); dispScene.add(new THREE.Mesh(quad, dispMat));

  const st = { mx: .5, my: .5, tx: .5, ty: .5, vx: 0, vy: 0, scroll: 0, turb: 0, turbT: 0, t: 0, running: false, raf: 0, last: 0, w: 0, h: 0 };
  function size() {
    const w = innerWidth, h = innerHeight; st.w = w; st.h = h;
    renderer.setSize(Math.round(w * scale), Math.round(h * scale), false);
    canvas.style.width = '100vw'; canvas.style.height = '100vh';
    const sw = Math.max(64, Math.round(w * simScale)), sh = Math.max(64, Math.round(h * simScale));
    rtA.setSize(sw, sh); rtB.setSize(sw, sh);
    simMat.uniforms.uAspect.value = dispMat.uniforms.uAspect.value = w / h;
  }
  size(); addEventListener('resize', size);
  addEventListener('pointermove', (e) => { st.tx = e.clientX / st.w; st.ty = 1 - e.clientY / st.h; }, { passive: true });

  function frame(now) {
    const dt = Math.min(.05, (now - (st.last || now)) / 1000 || .016); st.last = now; st.t += dt;
    const px = st.mx, py = st.my;
    st.mx += (st.tx - st.mx) * (1 - Math.exp(-dt * 14)); st.my += (st.ty - st.my) * (1 - Math.exp(-dt * 14));
    st.vx = st.mx - px; st.vy = st.my - py;
    st.turb += (st.turbT - st.turb) * (1 - Math.exp(-dt * 3)); st.turbT *= Math.exp(-dt * 2.2);
    const su = simMat.uniforms; su.uPrev.value = rtA.texture; su.uMouse.value.set(st.mx, st.my); su.uVel.value.set(st.vx * (st.w / st.h), st.vy); su.uTime.value = st.t; su.uTurb.value = st.turb;
    renderer.setRenderTarget(rtB); renderer.render(simScene, cam);
    const tmp = rtA; rtA = rtB; rtB = tmp;
    const du = dispMat.uniforms; du.uInk.value = rtA.texture; du.uTime.value = st.t; du.uScroll.value = st.scroll; du.uTurb.value = st.turb; du.uMouse.value.set(st.mx, st.my);
    renderer.setRenderTarget(null); renderer.render(dispScene, cam);
    if (st.running) st.raf = requestAnimationFrame(frame);
  }
  const api = {
    start() { if (st.running || still) return; st.running = true; st.last = 0; st.raf = requestAnimationFrame(frame); },
    stop() { st.running = false; cancelAnimationFrame(st.raf); },
    renderOnce() { st.t = 12.0; frame(performance.now()); },
    setScroll(y) { st.scroll = y; },
    kick(v) { st.turbT = Math.min(2.2, st.turbT + v); },
    setMood(m) { dispMat.uniforms.uMood.value = m; },
    puff(x, y, n = 6) { /* a burst of ink at a point, used by the intro */
      let k = 0; const go = () => { st.tx = x + Math.sin(k * 1.7) * .06; st.ty = y + Math.cos(k * 1.3) * .05; if (++k < n) setTimeout(go, 40); }; go();
    },
  };
  document.addEventListener('visibilitychange', () => { if (document.hidden) api.stop(); else if (!still) api.start(); });
  return api;
}
