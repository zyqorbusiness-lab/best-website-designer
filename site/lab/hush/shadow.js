/* Contact shadow for Hush One.
   live: renders the scene from below into a small target with a depth-to-darkness material, then blurs it twice
   (the three.js "contact shadows" technique, blur shaders from three/examples, MIT). Otherwise a static soft blob. */
import { THREE } from '../_kit/kit.js';

const VERT = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
const blurFrag = (axis) => `uniform sampler2D tDiffuse; uniform float d; varying vec2 vUv;
void main(){ vec4 s = vec4(0.0); vec2 o = ${axis};
s += texture2D(tDiffuse, vUv - 4.0*o*d) * 0.051; s += texture2D(tDiffuse, vUv - 3.0*o*d) * 0.0918;
s += texture2D(tDiffuse, vUv - 2.0*o*d) * 0.12245; s += texture2D(tDiffuse, vUv - 1.0*o*d) * 0.1531;
s += texture2D(tDiffuse, vUv) * 0.1633;
s += texture2D(tDiffuse, vUv + 1.0*o*d) * 0.1531; s += texture2D(tDiffuse, vUv + 2.0*o*d) * 0.12245;
s += texture2D(tDiffuse, vUv + 3.0*o*d) * 0.0918; s += texture2D(tDiffuse, vUv + 4.0*o*d) * 0.051;
gl_FragColor = s; }`;

export function contactShadow(renderer, scene, parent, o) {
  const g = new THREE.Group(); g.position.y = o.y; parent.add(g);
  if (!o.live) {
    const c = document.createElement('canvas'); c.width = 256; c.height = 128; const x = c.getContext('2d');
    const blob = (cx, cy, rx, ry, a) => { x.save(); x.translate(cx, cy); x.scale(rx / 64, ry / 64); const gr = x.createRadialGradient(0, 0, 0, 0, 0, 64);
      gr.addColorStop(0, `rgba(0,0,0,${a})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gr; x.fillRect(-64, -64, 128, 128); x.restore(); };
    blob(128, 64, 120, 46, 0.35); blob(70, 64, 46, 34, 0.5); blob(186, 64, 46, 34, 0.5);
    const material = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, color: 0x1a2838, opacity: 0.5 });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(o.w * 0.85, o.h * 0.6), material); m.rotation.x = -Math.PI / 2; g.add(m);
    return { material, update() {} };
  }
  const S = 512, rt = new THREE.WebGLRenderTarget(S, S), rtB = new THREE.WebGLRenderTarget(S, S);
  rt.texture.generateMipmaps = rtB.texture.generateMipmaps = false;
  const geo = new THREE.PlaneGeometry(o.w, o.h).rotateX(Math.PI / 2);
  const material = new THREE.MeshBasicMaterial({ map: rt.texture, transparent: true, depthWrite: false, color: 0x0f1a26, opacity: 0.8 });
  const plane = new THREE.Mesh(geo, material); plane.scale.y = -1; plane.renderOrder = 1; g.add(plane);
  const hB = new THREE.ShaderMaterial({ uniforms: { tDiffuse: { value: null }, d: { value: 1 / S } }, vertexShader: VERT, fragmentShader: blurFrag('vec2(1.0, 0.0)'), depthTest: false });
  const vB = new THREE.ShaderMaterial({ uniforms: { tDiffuse: { value: null }, d: { value: 1 / S } }, vertexShader: VERT, fragmentShader: blurFrag('vec2(0.0, 1.0)'), depthTest: false });
  const blurPlane = new THREE.Mesh(geo, hB); blurPlane.visible = false; g.add(blurPlane);
  const cam = new THREE.OrthographicCamera(-o.w / 2, o.w / 2, o.h / 2, -o.h / 2, 0, o.far); cam.rotation.x = Math.PI / 2; g.add(cam);
  const depth = new THREE.MeshDepthMaterial(); const dark = { value: 1.6 };
  depth.onBeforeCompile = (sh) => { sh.uniforms.darkness = dark;
    sh.fragmentShader = 'uniform float darkness;\n' + sh.fragmentShader.replace('gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );', 'gl_FragColor = vec4( vec3( 0.0 ), ( 1.0 - fragCoordZ ) * darkness );'); };
  depth.depthTest = false; depth.depthWrite = false;
  function blur(amount) {
    blurPlane.visible = true;
    blurPlane.material = hB; hB.uniforms.tDiffuse.value = rt.texture; hB.uniforms.d.value = amount / 256;
    renderer.setRenderTarget(rtB); renderer.render(blurPlane, cam);
    blurPlane.material = vB; vB.uniforms.tDiffuse.value = rtB.texture; vB.uniforms.d.value = amount / 256;
    renderer.setRenderTarget(rt); renderer.render(blurPlane, cam);
    blurPlane.visible = false;
  }
  const keep = new THREE.Color();
  function update() {
    if (material.opacity < 0.01) return;
    const bg = scene.background, ca = renderer.getClearAlpha(); renderer.getClearColor(keep);
    scene.background = null; plane.visible = false;
    scene.overrideMaterial = depth; renderer.setClearColor(0x000000, 0);
    renderer.setRenderTarget(rt); renderer.clear(); renderer.render(scene, cam);
    scene.overrideMaterial = null;
    blur(2.2); blur(0.9);
    renderer.setRenderTarget(null); renderer.setClearColor(keep, ca);
    scene.background = bg; plane.visible = true;
  }
  return { material, update };
}
