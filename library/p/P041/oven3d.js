/* oven3d.js - Hotcoal's clay-brick dome oven, built brick by brick in three.js (our geometry), with a live fire:
   oak logs, shader flames, flickering light and embers. Lives 7 m behind the peel; the scroll camera flies through its mouth. */
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
export const OVEN_Z = -7;
export function buildOven(ctx) {
  const { THREE, scene, U, phone, NOISE } = ctx;
  const g = new THREE.Group(); g.position.set(0, -0.07, OVEN_Z); scene.add(g);
  const R = 2.5, SQ = 0.78, MW = 1.75, MH = 1.05;
  /* deck + plinth */
  const deck = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.25, R + 0.3, 0.28, 64), new THREE.MeshStandardMaterial({ color: 0xcdb497, roughness: 0.92 }));
  deck.position.y = -0.14; deck.receiveShadow = true; g.add(deck);
  const plinth = new THREE.Mesh(new RoundedBoxGeometry(R * 2.5, 1.7, R * 2.4, 3, 0.08), new THREE.MeshStandardMaterial({ color: 0xc99a74, roughness: 0.95 }));
  plinth.position.y = -1.13; g.add(plinth);
  const hearth = new THREE.Mesh(new THREE.CircleGeometry(R - 0.12, 64), new THREE.MeshStandardMaterial({ color: 0x9c7a5c, roughness: 0.95 }));
  hearth.rotation.x = -Math.PI / 2; hearth.position.y = 0.002; hearth.receiveShadow = true; g.add(hearth);
  /* bricks: rows up a flattened dome, staggered, mouth left open at the front (+z) */
  const brick = new RoundedBoxGeometry(0.46, 0.2, 0.26, 2, 0.025);
  const mats = []; const list = [];
  const dummy = new THREE.Object3D();
  const rows = phone ? 13 : 16;
  for (let i = 0; i < rows; i++) {
    const phi = (i / rows) * (Math.PI / 2) * 0.96; const rr = R * Math.cos(phi); const y = R * SQ * Math.sin(phi) + 0.1;
    const n = Math.max(6, Math.floor((Math.PI * 2 * rr) / 0.48)); const off = (i % 2) * 0.5;
    for (let j = 0; j < n; j++) {
      const th = ((j + off) / n) * Math.PI * 2; const x = Math.cos(th) * rr, z = Math.sin(th) * rr;
      if (z > 0 && Math.abs(x) < MW / 2 + 0.12 && y < MH + 0.12) continue;
      dummy.position.set(x, y, z); dummy.rotation.set(0, 0, 0); dummy.lookAt(0, y - Math.tan(phi) * rr * SQ, 0);
      dummy.scale.set(((Math.PI * 2 * rr) / n) / 0.47, 1.05, 1); dummy.updateMatrix(); list.push(dummy.matrix.clone());
    }
  }
  const bm = new THREE.MeshStandardMaterial({ roughness: 0.88, color: 0xffffff });
  const bricks = new THREE.InstancedMesh(brick, bm, list.length); const c = new THREE.Color();
  list.forEach((m, i) => { bricks.setMatrixAt(i, m); const t = Math.random(); c.setHSL(0.03 + t * 0.025, 0.55 + t * 0.15, 0.13 + Math.random() * 0.09); bricks.setColorAt(i, c); });
  bricks.castShadow = true; bricks.receiveShadow = true; g.add(bricks);
  /* mortar shell just inside the bricks (fills the gaps) and the hot inner dome */
  const innerMat = new THREE.MeshStandardMaterial({ color: 0x3a1a10, roughness: 1, side: THREE.BackSide, emissive: 0xff5a14, emissiveIntensity: 0.1 });
  const inner = new THREE.Mesh(new THREE.SphereGeometry(R - 0.16, 64, 24, 0, Math.PI * 2, 0, Math.PI / 2), innerMat); inner.scale.y = SQ; inner.position.y = 0.06; g.add(inner);
  /* cut the mouth out of the shells with a stencil-free trick: an arch face that hides the shells behind it */
  const arch = new THREE.Shape(); const ow = MW / 2 + 0.34, iw = MW / 2;
  arch.moveTo(-ow, 0); arch.lineTo(-ow, MH - 0.2); arch.absarc(0, MH - 0.2, ow, Math.PI, 0, true); arch.lineTo(ow, 0); arch.lineTo(iw, 0); arch.lineTo(iw, MH - 0.2); arch.absarc(0, MH - 0.2, iw, 0, Math.PI, false); arch.lineTo(-iw, 0);
  const archGeo = new THREE.ExtrudeGeometry(arch, { depth: 0.55, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2, curveSegments: 32 });
  /* arch face (Oct 31 polish): fired-brick voussoirs + mortar in the shader so the mouth reads as brick, not a plastic ring */
  const archMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
  archMat.onBeforeCompile = (s) => {
    s.vertexShader = s.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vAP;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvAP = position;');
    s.fragmentShader = s.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vAP; float ah(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }')
      .replace('#include <color_fragment>', `#include <color_fragment>
        vec2 q = vAP.xy - vec2(0.0, ${(MH - 0.2).toFixed(3)}); float ang = atan(q.y, q.x); float rr = length(q);
        vec2 cell; float m;
        if (q.y > 0.0) { float a = ang / 0.15; cell = vec2(floor(a), 7.0); m = min(fract(a), 1.0 - fract(a)) * 0.15 * rr; m = min(m, abs(rr - ${(MW / 2 + 0.17).toFixed(3)}) ); }
        else { float row = vAP.y / 0.2; float off = mod(floor(row), 2.0) * 0.5; float col = (vAP.x / 0.17) + off; cell = vec2(floor(col) + 20.0 * sign(vAP.x), floor(row));
          m = min(min(fract(row), 1.0 - fract(row)) * 0.2, min(fract(col), 1.0 - fract(col)) * 0.17); }
        float h = ah(cell); vec3 brick = mix(vec3(0.3, 0.085, 0.04), vec3(0.48, 0.19, 0.08), h) * (0.85 + 0.3 * ah(cell + 3.1));
        float mortar = 1.0 - smoothstep(0.006, 0.013, m);
        diffuseColor.rgb = mix(brick, vec3(0.5, 0.41, 0.32), mortar);`);
  };
  const archM = new THREE.Mesh(archGeo, archMat); archM.position.set(0, 0, R - 0.42); archM.castShadow = true; g.add(archM);
  /* tunnel walls from the arch into the dome so the shells never show through the mouth */
  const tun = new THREE.Mesh(new THREE.CylinderGeometry(iw, iw, 0.9, 32, 1, true, -Math.PI / 2, Math.PI), new THREE.MeshStandardMaterial({ color: 0x6b3322, roughness: 1, side: THREE.BackSide }));
  tun.rotation.x = Math.PI / 2; tun.rotation.z = Math.PI; tun.position.set(0, MH - 0.2, R - 0.55); tun.scale.set(1, 1, 1); g.add(tun);
  /* logs */
  const logMat = new THREE.MeshStandardMaterial({ color: 0x2e1d14, roughness: 0.95, emissive: 0xff5a10, emissiveIntensity: 0.0 });
  logMat.onBeforeCompile = (s) => { s.uniforms.uTime = U.uTime; s.uniforms.uHeat = U.uHeat;
    s.fragmentShader = s.fragmentShader.replace('#include <common>', '#include <common>\n' + NOISE + 'uniform float uTime, uHeat;')
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n float cr = smoothstep(0.62, 0.8, fbm(vViewPosition.xy * 6.0 + uTime * 0.2)); totalEmissiveRadiance = vec3(1.0, 0.36, 0.06) * cr * (0.8 + 0.6 * uHeat);'); };
  const logs = new THREE.Group(); logs.position.set(-0.35, 0, -R + 0.95); g.add(logs);
  [[0, 0.11, 0, 0.3], [0.25, 0.11, 0.2, -0.5], [-0.15, 0.3, 0.1, 0.9]].forEach(([x, y, z, r]) => {
    const l = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 1.1, 10), logMat); l.rotation.set(Math.PI / 2, 0, r); l.position.set(x, y, z); l.castShadow = true; logs.add(l); });
  /* flames: camera-facing planes with a scrolling-noise fire shader */
  const fireMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { uTime: U.uTime, uAmt: { value: 1 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: NOISE + `uniform float uTime, uAmt; varying vec2 vUv;
      void main(){ vec2 p = vUv; float n = fbm(vec2(p.x * 3.0, p.y * 2.0 - uTime * 1.6)) ;
        float w = 0.42 * (1.0 - p.y) + 0.06; float shape = smoothstep(w, w - 0.22, abs(p.x - 0.5 + (n - 0.5) * 0.25 * p.y));
        float f = shape * smoothstep(1.0, 0.25, p.y + (n - 0.5) * 0.5) * smoothstep(0.0, 0.08, p.y);
        vec3 col = mix(vec3(1.0, 0.25, 0.04), vec3(1.0, 0.82, 0.35), smoothstep(0.35, 0.9, f));
        gl_FragColor = vec4(col * f * 1.4 * uAmt, f * uAmt); }` });
  const flames = []; const fg = new THREE.PlaneGeometry(1, 1.5);
  for (let i = 0; i < (phone ? 4 : 6); i++) { const f = new THREE.Mesh(fg, fireMat); f.position.set(-0.6 + i * 0.25 + (Math.random() - 0.5) * 0.1, 0.72, -R + 1.0 + (Math.random() - 0.5) * 0.3); f.scale.setScalar(0.8 + Math.random() * 0.6); f.renderOrder = 5; logs.parent.add(f); flames.push(f); }
  const fireLight = new THREE.PointLight(0xff7a2a, 0, 7, 1.4); fireLight.position.set(-0.3, 0.8, -R + 1.3); fireLight.castShadow = !phone; g.add(fireLight);
  const mouthLight = new THREE.PointLight(0xff8a3a, 0, 6, 1.6); mouthLight.position.set(0, 0.6, R + 0.6); g.add(mouthLight);
  let heatT = 0;
  const api = { group: g, R, MW, MH, flames, fireMat, fireLight, mouthLight, innerMat,
    set(amount) { heatT = amount; },
    tick(dt, t, camera) {
      const fl = 0.85 + 0.15 * Math.sin(t * 13.0) * Math.sin(t * 7.3 + 1.0);
      fireLight.intensity = 26 * heatT * fl; mouthLight.intensity = 6 * heatT * fl; innerMat.emissiveIntensity = (0.1 + 0.35 * heatT) * fl;
      fireMat.uniforms.uAmt.value = heatT; for (const f of flames) f.quaternion.copy(camera.quaternion);
      return heatT > 0.01; } };
  return api;
}
