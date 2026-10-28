// Halden concept: scroll reveals + a small hand-written WebGL copper ring.
// Reveals: fast, smooth, no bounce (480 ms expo-out, 20 px rise). Reduced motion = static.
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('.reveal').forEach(el => reduce ? el.classList.add('in') : io.observe(el));

const stage = document.querySelector('.stage');
if (stage) {
  const c = stage.querySelector('canvas');
  const gl = c.getContext('webgl', { antialias: true, alpha: true, premultipliedAlpha: false });
  if (gl) {
    stage.classList.add('gl');
    const vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    // Ray-marched torus with copper shading, a soft key light and a paper floor shadow.
    const fs = `precision highp float;uniform vec2 r;uniform float t;
    mat2 rot(float a){float s=sin(a),c=cos(a);return mat2(c,-s,s,c);}
    float tor(vec3 p){vec2 q=vec2(length(p.xz)-.62,p.y);return length(q)-.2;}
    float map(vec3 p){p.yz*=rot(1.05);p.xz*=rot(t*.35);return tor(p);}
    vec3 nrm(vec3 p){vec2 e=vec2(.0015,0);return normalize(vec3(map(p+e.xyy)-map(p-e.xyy),map(p+e.yxy)-map(p-e.yxy),map(p+e.yyx)-map(p-e.yyx)));}
    void main(){vec2 uv=(gl_FragCoord.xy-.5*r)/min(r.x,r.y);
      vec3 ro=vec3(0,.05,3.6),rd=normalize(vec3(uv,-1.6));float d=0.;bool hit=false;
      for(int i=0;i<90;i++){float h=map(ro+rd*d);if(h<.001){hit=true;break;}d+=h;if(d>6.)break;}
      vec3 bg=mix(vec3(.984,.973,.949),vec3(.89,.86,.80),length(uv*.9));
      float sh=smoothstep(.75,.0,length((uv-vec2(0.,-.62))*vec2(1.,4.)));bg*=1.-.18*sh;
      vec3 col=bg;
      if(hit){vec3 p=ro+rd*d,n=nrm(p),l=normalize(vec3(.6,.8,.5)),h=normalize(l-rd);
        float dif=max(dot(n,l),0.),spe=pow(max(dot(n,h),0.),70.),fre=pow(1.-max(dot(n,-rd),0.),3.);
        vec3 cu=vec3(.76,.33,.18);
        col=cu*(.22+.9*dif)+vec3(1.,.86,.72)*spe*1.4+vec3(.95,.9,.82)*fre*.35;
        col=mix(col,col*vec3(.55,.6,.58),smoothstep(.2,-.6,n.y)*.5);}
      gl_FragColor=vec4(pow(col,vec3(.95)),1.);}`;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr); gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,3,-1,-1,3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const ur = gl.getUniformLocation(pr, 'r'), ut = gl.getUniformLocation(pr, 't');
    let visible = true, raf = 0; const t0 = performance.now();
    const draw = now => {
      const dpr = Math.min(devicePixelRatio || 1, 2), w = Math.round(c.clientWidth * dpr), h = Math.round(c.clientHeight * dpr);
      if (c.width !== w || c.height !== h) { c.width = w; c.height = h; gl.viewport(0, 0, w, h); }
      gl.uniform2f(ur, w, h); gl.uniform1f(ut, reduce ? 0.6 : (now - t0) / 1000); gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!reduce && visible) raf = requestAnimationFrame(draw);
    };
    // Pause when off-screen; one still frame with reduced motion.
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; cancelAnimationFrame(raf); if (visible) raf = requestAnimationFrame(draw); }).observe(stage);
  }
}
