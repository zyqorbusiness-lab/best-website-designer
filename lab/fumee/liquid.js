/* Fumée - liquid image transition between the three scents (desktop).
   Two textures, a progress value and a smoky noise front that rises through the frame. The cursor adds a soft ripple. */
import * as THREE from 'three';

const FRAG = /* glsl */`
precision highp float; varying vec2 vUv;
uniform sampler2D uA; uniform sampler2D uB; uniform float uP; uniform float uTime; uniform vec2 uMouse; uniform float uHover; uniform float uAspect;
float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y); }
float fbm(vec2 p){ float v=0.0,a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p=p*2.03+1.7; a*=0.5; } return v; }
void main(){
  vec2 uv=vUv;
  vec2 m=uMouse; float d=distance(uv*vec2(1.0,1.0/uAspect),m*vec2(1.0,1.0/uAspect));
  uv+=normalize(uv-m+1e-4)*sin(d*38.0-uTime*4.0)*0.006*uHover*smoothstep(0.35,0.0,d);
  float n=fbm(uv*vec2(3.0,2.2)+vec2(0.0,-uTime*0.12));
  float front=uP*1.9-0.4;                /* sweeps from below the frame to above it */
  float h=uv.y*0.9+n*0.55;               /* the new scent rises from the bottom with a smoky edge */
  float mask=1.0-smoothstep(front-0.16,front+0.02,h);   /* 1 = new image */
  float edge=1.0-abs(mask*2.0-1.0); edge=pow(edge,1.6);
  vec2 dA=vec2(n-0.5,(n-0.5)*1.4)*0.12*edge + vec2(0.0,-uP*0.06);
  vec2 dB=vec2(0.5-n,(0.5-n)*1.4)*0.12*edge + vec2(0.0,(1.0-uP)*0.06);
  float zA=1.0+uP*0.06, zB=1.06-uP*0.06;
  vec4 a=texture2D(uA,(uv-0.5)/zA+0.5+dA);
  vec4 b=texture2D(uB,(uv-0.5)/zB+0.5+dB);
  vec3 col=mix(a.rgb,b.rgb,mask);
  col+=vec3(0.93,0.88,0.82)*edge*0.22*smoothstep(0.0,0.15,uP)*smoothstep(1.0,0.85,uP);
  gl_FragColor=vec4(col,1.0);
  #include <colorspace_fragment>
}`;

export function createLiquid(canvas, urls) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, depth: false, stencil: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const loader = new THREE.TextureLoader();
  const tex = urls.map(() => null);
  const mat = new THREE.ShaderMaterial({
    vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.0,1.0); }',
    fragmentShader: FRAG, depthTest: false, depthWrite: false,
    uniforms: { uA: { value: null }, uB: { value: null }, uP: { value: 0 }, uTime: { value: 0 }, uMouse: { value: new THREE.Vector2(.5, .5) }, uHover: { value: 0 }, uAspect: { value: .75 } },
  });
  const scene = new THREE.Scene(); scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
  const cam = new THREE.Camera();
  const st = { pos: 0, hover: 0, hoverT: 0, mx: .5, my: .5, tmx: .5, tmy: .5, t: 0, running: false, raf: 0, last: 0, dirty: true };
  function size() { const r = canvas.getBoundingClientRect(); if (!r.width) return; renderer.setSize(r.width, r.height, false); mat.uniforms.uAspect.value = r.width / r.height; st.dirty = true; }
  const ro = new ResizeObserver(size); ro.observe(canvas);
  canvas.parentElement.addEventListener('pointermove', (e) => { const r = canvas.getBoundingClientRect(); st.tmx = (e.clientX - r.left) / r.width; st.tmy = 1 - (e.clientY - r.top) / r.height; st.hoverT = 1; });
  canvas.parentElement.addEventListener('pointerleave', () => { st.hoverT = 0; });
  const ready = Promise.all(urls.map((u, i) => loader.loadAsync(u).then((t) => { t.colorSpace = THREE.SRGBColorSpace; t.minFilter = THREE.LinearFilter; t.generateMipmaps = false; tex[i] = t; })));
  function apply() {
    const n = tex.length, p = Math.max(0, Math.min(n - 1, st.pos));
    let i = Math.floor(p); if (i >= n - 1) i = n - 2;
    const f = p - i;
    mat.uniforms.uA.value = tex[i]; mat.uniforms.uB.value = tex[i + 1]; mat.uniforms.uP.value = f;
  }
  function frame(now) {
    const dt = Math.min(.05, (now - (st.last || now)) / 1000 || .016); st.last = now; st.t += dt;
    st.hover += (st.hoverT - st.hover) * (1 - Math.exp(-dt * 4));
    st.mx += (st.tmx - st.mx) * (1 - Math.exp(-dt * 8)); st.my += (st.tmy - st.my) * (1 - Math.exp(-dt * 8));
    if (tex.every(Boolean)) {
      apply(); const u = mat.uniforms; u.uTime.value = st.t; u.uHover.value = st.hover; u.uMouse.value.set(st.mx, st.my);
      renderer.render(scene, cam);
    }
    if (st.running) st.raf = requestAnimationFrame(frame);
  }
  return {
    ready,
    set(pos) { st.pos = pos; },
    start() { if (st.running) return; st.running = true; st.last = 0; st.raf = requestAnimationFrame(frame); },
    stop() { st.running = false; cancelAnimationFrame(st.raf); },
  };
}
