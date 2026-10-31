// Humdinger H-1: the whole device is built here in code (no downloaded model).
// Shared by the desktop build (index.html) and the phone build (m.html); only quality knobs differ.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export const PAL = { lime: '#C6F03C', ink: '#1B2340', cream: '#FFF4E2' };
export const PADS = ['KICK','SNARE','HAT','CLAP','BASS 1','BASS 2','BASS 3','BASS 4','LEAD 1','LEAD 2','LEAD 3','LEAD 4','PLAY','REC','SHIFT','FX'];
const W = 1.0, H = 1.55, D = 0.16, R = 0.09;
const PAD = 0.165, GAP = 0.035, PAD_Y = -0.13;   // pad grid centre
const LAYER_GAP = 0.27;

function cvs(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function fontStack(kind) { return kind === 'mono' ? '"JetBrains Mono", ui-monospace, monospace' : '"Bricolage Grotesque", "DM Sans", system-ui, sans-serif'; }
function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }

export function padCenter(i) { const c = i % 4, r = Math.floor(i / 4); return new THREE.Vector2((c - 1.5) * (PAD + GAP), PAD_Y - (r - 1.5) * (PAD + GAP)); }

export class Device {
  constructor(opts) {
    this.q = opts.quality || 'desktop';
    try { const cs = getComputedStyle(document.documentElement); for (const [k, v] of [['lime', '--pop'], ['ink', '--ink'], ['cream', '--cream']]) { const c = cs.getPropertyValue(v).trim(); if (/^#[0-9a-f]{6}$/i.test(c)) PAL[k] = c; } } catch {}
    const tex = this.q === 'phone' ? 512 : 1024;
    this.group = new THREE.Group();          // pose (position/scale/rotation)
    this.body = new THREE.Group(); this.group.add(this.body);
    this.layers = {};
    const ink = new THREE.Color(PAL.ink), cream = new THREE.Color(PAL.cream), lime = new THREE.Color(PAL.lime);
    this.mat = {
      shell: new THREE.MeshPhysicalMaterial({ color: ink, roughness: 0.38, clearcoat: 0.6, clearcoatRoughness: 0.25, metalness: 0 }),
      cream: new THREE.MeshStandardMaterial({ color: cream, roughness: 0.85 }),
      lime: new THREE.MeshStandardMaterial({ color: lime, roughness: 0.55 }),
      ink: new THREE.MeshStandardMaterial({ color: ink, roughness: 0.5 })
    };
    // ---- back shell (the main body)
    const shell = new THREE.Group(); this.layers.shell = shell; this.body.add(shell);
    const shellMesh = new THREE.Mesh(new RoundedBoxGeometry(W, H, D * 0.62, 5, R), this.mat.shell); shellMesh.position.z = -D * 0.19; shell.add(shellMesh);
    // back decal: battery door outline + engraving
    const bc = cvs(tex / 2, Math.round(tex / 2 * H / W)), bg = bc.getContext('2d'); this.drawBack(bg, bc.width, bc.height);
    const backTex = new THREE.CanvasTexture(bc); backTex.colorSpace = THREE.SRGBColorSpace; backTex.anisotropy = 4;
    const back = new THREE.Mesh(new THREE.PlaneGeometry(W * 0.86, H * 0.9), new THREE.MeshStandardMaterial({ map: backTex, transparent: true, roughness: 0.6 }));
    back.position.z = -D * 0.5 - 0.0015; back.rotation.y = Math.PI; shell.add(back);
    // screws (4) + feet (4) on the back
    const screwG = new THREE.CylinderGeometry(0.022, 0.022, 0.012, 16); screwG.rotateX(Math.PI / 2);
    const screws = new THREE.InstancedMesh(screwG, this.mat.cream, 4); const m4 = new THREE.Matrix4();
    [[-0.26, 0.05], [0.26, 0.05], [-0.26, -0.48], [0.26, -0.48]].forEach(([x, y], i) => { m4.makeTranslation(-x, y, -D * 0.5 - 0.006); screws.setMatrixAt(i, m4); });
    shell.add(screws);
    const footG = new THREE.CylinderGeometry(0.05, 0.055, 0.02, 24); footG.rotateX(Math.PI / 2);
    const feet = new THREE.InstancedMesh(footG, this.mat.cream, 4);
    [[-0.36, 0.62], [0.36, 0.62], [-0.36, -0.62], [0.36, -0.62]].forEach(([x, y], i) => { m4.makeTranslation(x, y, -D * 0.5 - 0.01); feet.setMatrixAt(i, m4); });
    shell.add(feet);
    // lanyard loop (top-left) in lime
    const lc = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.36, 0.74, 0), new THREE.Vector3(-0.42, 0.9, 0), new THREE.Vector3(-0.36, 1.06, 0), new THREE.Vector3(-0.22, 1.08, 0), new THREE.Vector3(-0.17, 0.92, 0), new THREE.Vector3(-0.24, 0.74, 0)], false);
    this.lanyard = new THREE.Mesh(new THREE.TubeGeometry(lc, 48, 0.018, 10, false), this.mat.lime); shell.add(this.lanyard);
    const lug = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.016, 10, 24), this.mat.cream); lug.position.set(-0.3, 0.76, 0); lug.rotation.y = Math.PI / 2; shell.add(lug);
    // ---- battery
    const bat = new THREE.Group(); this.layers.battery = bat; this.body.add(bat);
    const batM = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.86, 0.05, 3, 0.02), this.mat.cream); bat.add(batM);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.12, 0.052), this.mat.lime); stripe.position.y = 0.3; bat.add(stripe);
    bat.position.set(0, -0.12, -0.02);
    // ---- board (lime PCB with ink traces + chips)
    const board = new THREE.Group(); this.layers.board = board; this.body.add(board);
    const pc = cvs(tex / 2, Math.round(tex / 2 * 1.45 / 0.92)); this.drawBoard(pc.getContext('2d'), pc.width, pc.height);
    const pTex = new THREE.CanvasTexture(pc); pTex.colorSpace = THREE.SRGBColorSpace;
    const boardM = new THREE.Mesh(new RoundedBoxGeometry(0.92, 1.45, 0.02, 2, 0.01), [this.mat.lime, this.mat.lime, this.mat.lime, this.mat.lime, new THREE.MeshStandardMaterial({ map: pTex, roughness: 0.6 }), this.mat.lime]);
    board.add(boardM);
    const chipG = new THREE.BoxGeometry(1, 1, 1); const chips = new THREE.InstancedMesh(chipG, this.mat.ink, 5);
    [[-0.16, 0.42, 0.3, 0.16], [0.24, 0.42, 0.14, 0.14], [0.22, -0.2, 0.22, 0.22], [-0.2, -0.32, 0.12, 0.2], [0.0, 0.1, 0.18, 0.1]].forEach(([x, y, w, h], i) => { m4.compose(new THREE.Vector3(x, y, 0.025), new THREE.Quaternion(), new THREE.Vector3(w, h, 0.03)); chips.setMatrixAt(i, m4); });
    board.add(chips); board.position.z = 0.02;
    // ---- pad sheet (16 instanced pads with printed legends)
    const pads = new THREE.Group(); this.layers.pads = pads; this.body.add(pads);
    this.padGeo = new RoundedBoxGeometry(PAD, PAD, 0.05, 3, 0.028);
    const atlas = this.makeAtlas(tex);
    const padMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85 });
    padMat.onBeforeCompile = (sh) => {
      sh.uniforms.uAtlas = { value: atlas }; sh.uniforms.uInk = { value: new THREE.Color(PAL.ink) };
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec2 aCell;\nvarying vec2 vPadUv;\nvarying vec2 vCell;\nvarying float vFront;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvPadUv = position.xy / ' + PAD.toFixed(4) + ' + 0.5; vCell = aCell; vFront = step(0.6, normal.z);');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform sampler2D uAtlas;\nuniform vec3 uInk;\nvarying vec2 vPadUv;\nvarying vec2 vCell;\nvarying float vFront;')
        .replace('#include <color_fragment>', '#include <color_fragment>\n{ vec2 uv = (clamp(vPadUv, 0.0, 1.0) + vCell) * 0.25; float a = texture2D(uAtlas, uv).r * vFront; diffuseColor.rgb = mix(diffuseColor.rgb, uInk, a); }');
    };
    this.padMesh = new THREE.InstancedMesh(this.padGeo, padMat, 16);
    const cells = new Float32Array(32);
    for (let i = 0; i < 16; i++) { cells[i * 2] = i % 4; cells[i * 2 + 1] = 3 - Math.floor(i / 4); }
    this.padGeo.setAttribute('aCell', new THREE.InstancedBufferAttribute(cells, 2));
    this.padPress = new Float32Array(16); this.padFlash = new Float32Array(16);
    for (let i = 0; i < 16; i++) this.padMesh.setColorAt(i, cream);
    pads.add(this.padMesh); pads.position.z = 0.072; this.updatePads();
    // ---- faceplate (thin ink plate with printed grille, logotype, wells) + screen + knobs
    const face = new THREE.Group(); this.layers.face = face; this.body.add(face);
    const fc = cvs(tex * 0.75, Math.round(tex * 0.75 * 1.47 / 0.95)); this.drawFace(fc.getContext('2d'), fc.width, fc.height);
    const fTex = new THREE.CanvasTexture(fc); fTex.colorSpace = THREE.SRGBColorSpace; fTex.anisotropy = 4;
    const plate = new THREE.Mesh(new RoundedBoxGeometry(W * 0.96, H * 0.96, 0.025, 3, 0.06), this.mat.shell); face.add(plate);
    const decal = new THREE.Mesh(new THREE.PlaneGeometry(W * 0.95, H * 0.95), new THREE.MeshStandardMaterial({ map: fTex, transparent: true, roughness: 0.4 })); decal.position.z = 0.0135; face.add(decal);
    face.position.z = 0.055;
    // screen
    this.scr = cvs(tex, tex / 2); this.sg = this.scr.getContext('2d');
    this.scrTex = new THREE.CanvasTexture(this.scr); this.scrTex.colorSpace = THREE.SRGBColorSpace;
    const scrMat = new THREE.MeshPhysicalMaterial({ color: 0x0b0f1c, emissive: 0xffffff, emissiveMap: this.scrTex, emissiveIntensity: 1.0, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05 });
    this.screen = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.31), scrMat); this.screen.position.set(-0.1, 0.5, 0.0145); face.add(this.screen);
    // knobs (lathe, cream, with an ink pointer)
    const prof = []; for (let i = 0; i <= 10; i++) { const t = i / 10; prof.push(new THREE.Vector2(0.068 - 0.012 * t * t + (i % 2 ? 0.002 : 0), t * 0.07)); } prof.push(new THREE.Vector2(0, 0.07));
    const kg = new THREE.LatheGeometry(prof, 40); kg.rotateX(Math.PI / 2);
    this.knobs = [];
    [[0.33, 0.58], [0.33, 0.4]].forEach(([x, y]) => {
      const k = new THREE.Group(); const km = new THREE.Mesh(kg, this.mat.cream); k.add(km);
      const ptr = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.045, 0.01), this.mat.ink); ptr.position.set(0, 0.03, 0.072); k.add(ptr);
      k.position.set(x, y, 0.012); face.add(k); this.knobs.push(k);
    });
    // contact shadow (ink, soft) drawn once into a tiny canvas
    const sc = cvs(128, 128), sgc = sc.getContext('2d'); const gr = sgc.createRadialGradient(64, 64, 4, 64, 64, 62); gr.addColorStop(0, 'rgba(27,35,64,0.18)'); gr.addColorStop(1, 'rgba(27,35,64,0)'); sgc.fillStyle = gr; sgc.fillRect(0, 0, 128, 128);
    const sTex = new THREE.CanvasTexture(sc);
    this.shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: sTex, transparent: true, depthWrite: false }));
    this.shadow.renderOrder = -1;
    this.state = 'BOOT'; this.bpm = 112; this.step = -1; this.pattern = null; this.dot = 0;
    this.drawScreen();
    this.explode = 0; this.setExplode(0);
  }
  makeAtlas(tex) {
    const s = tex, c = cvs(s, s), g = c.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, s, s);
    const cell = s / 4; g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle';
    PADS.forEach((name, i) => { const cx = (i % 4) * cell + cell / 2, cy = Math.floor(i / 4) * cell + cell / 2; g.font = `600 ${Math.round(cell * 0.15)}px ${fontStack('mono')}`; g.fillText(name, cx, cy + cell * 0.22);
      g.beginPath(); g.arc(cx, cy - cell * 0.08, cell * 0.06, 0, Math.PI * 2); g.lineWidth = cell * 0.025; g.strokeStyle = '#fff'; if (i >= 12) g.fill(); else g.stroke(); });
    const t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t;
  }
  drawFace(g, w, h) {
    const sx = w / (W * 0.95), sy = h / (H * 0.95); const X = (x) => (x + W * 0.475) * sx, Y = (y) => (H * 0.475 - y) * sy;
    g.clearRect(0, 0, w, h);
    // screen bezel
    g.fillStyle = 'rgba(255,244,226,0.10)'; rr(g, X(-0.44), Y(0.68), 0.68 * sx, 0.37 * sy, 0.03 * sx); g.fill();
    // pad wells
    g.fillStyle = 'rgba(8,12,26,0.55)';
    for (let i = 0; i < 16; i++) { const p = padCenter(i); rr(g, X(p.x - PAD / 2 - 0.012), Y(p.y + PAD / 2 + 0.012), (PAD + 0.024) * sx, (PAD + 0.024) * sy, 0.035 * sx); g.fill(); }
    // speaker grille: 37 holes in a hex pattern, bottom-left
    g.fillStyle = 'rgba(6,9,20,0.9)'; let n = 0;
    for (let r = 0; r < 4 && n < 37; r++) for (let c = 0; c < 10 && n < 37; c++) { const x = -0.4 + c * 0.034 + (r % 2) * 0.017, y = -0.6 - r * 0.03; g.beginPath(); g.arc(X(x), Y(y), 0.0105 * sx, 0, Math.PI * 2); g.fill(); n++; }
    // logotype + model
    g.fillStyle = PAL.lime; g.textBaseline = 'alphabetic'; g.textAlign = 'right';
    g.font = `800 ${Math.round(0.06 * sx)}px ${fontStack()}`; g.fillText('humdinger', X(0.43), Y(-0.6));
    g.font = `500 ${Math.round(0.03 * sx)}px ${fontStack('mono')}`; g.fillStyle = 'rgba(255,244,226,0.75)'; g.fillText('H-1  POCKET GROOVEBOX', X(0.43), Y(-0.66));
    g.textAlign = 'center'; g.font = `500 ${Math.round(0.022 * sx)}px ${fontStack('mono')}`; g.fillText('TEMPO', X(0.33), Y(0.49)); g.fillText('TONE', X(0.33), Y(0.31));
  }
  drawBack(g, w, h) {
    const sx = w / (W * 0.86), sy = h / (H * 0.9); const X = (x) => (x + W * 0.43) * sx, Y = (y) => (H * 0.45 - y) * sy;
    g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(255,244,226,0.55)'; g.lineWidth = 0.006 * sx;
    rr(g, X(-0.3), Y(0.09), 0.6 * sx, 0.61 * sy, 0.04 * sx); g.stroke();
    g.fillStyle = 'rgba(255,244,226,0.8)'; g.textAlign = 'center'; g.font = `800 ${Math.round(0.07 * sx)}px ${fontStack()}`; g.fillText('H-1', X(0), Y(0.36));
    g.font = `500 ${Math.round(0.026 * sx)}px ${fontStack('mono')}`; g.fillText('DESIGNED IN A POCKET', X(0), Y(0.29));
    g.fillText('BATTERY', X(0), Y(-0.22)); g.fillText('CONCEPT DEVICE \u00b7 NOT FOR SALE', X(0), Y(-0.6));
  }
  drawBoard(g, w, h) {
    g.fillStyle = PAL.lime; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(27,35,64,0.75)'; g.lineWidth = Math.max(1.5, w / 260); g.lineCap = 'round';
    let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 46; i++) { let x = rnd() * w, y = rnd() * h; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 4; k++) { if (k % 2) x += (rnd() - 0.5) * w * 0.5; else y += (rnd() - 0.5) * h * 0.4; g.lineTo(x, y); } g.stroke(); g.beginPath(); g.arc(x, y, w / 110, 0, Math.PI * 2); g.fillStyle = 'rgba(27,35,64,0.9)'; g.fill(); }
    g.fillStyle = 'rgba(27,35,64,0.85)'; g.font = `500 ${Math.round(w / 24)}px ${fontStack('mono')}`; g.fillText('HUMDINGER H-1 MAIN BOARD', w * 0.06, h * 0.96);
  }
  setScreen(state, extra) { if (state === this.state && !extra) return; this.state = state; this.drawScreen(); }
  setStep(step, pattern) { this.step = step; this.pattern = pattern; if (this.state === 'PATTERN') this.drawScreen(); }
  setBpm(b) { this.bpm = b; if (this.state === 'PATTERN' || this.state === 'TEMPO') this.drawScreen(); }
  setDot(t) { this.dot = t; if (this.state === 'TRAVEL') this.drawScreen(); }
  drawScreen() {
    const g = this.sg, w = this.scr.width, h = this.scr.height, L = PAL.lime;
    g.fillStyle = '#121a33'; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(198,240,60,0.05)'; for (let y = 0; y < h; y += 4) g.fillRect(0, y, w, 1);
    g.fillStyle = L; g.strokeStyle = L; g.textAlign = 'center'; g.textBaseline = 'middle';
    const big = (t, y = h * 0.5, s = 0.2) => { g.font = `800 ${Math.round(h * s)}px ${fontStack()}`; g.fillText(t, w / 2, y); };
    const small = (t, y, a = 0.8) => { g.globalAlpha = a; g.font = `500 ${Math.round(h * 0.075)}px ${fontStack('mono')}`; g.fillText(t, w / 2, y); g.globalAlpha = 1; };
    const st = this.state;
    if (st === 'BOOT') { big('H-1'); small('BOOTING', h * 0.75); }
    else if (st === 'PRESS') { big('PRESS ANY PAD', h * 0.46, 0.15); small('\u25bc  \u25bc  \u25bc', h * 0.76); }
    else if (st === 'FLIP') { g.lineWidth = h * 0.03; g.beginPath(); g.arc(w / 2, h * 0.45, h * 0.18, 0.3, Math.PI * 1.7); g.stroke(); g.beginPath(); g.moveTo(w / 2 + h * 0.17, h * 0.27); g.lineTo(w / 2 + h * 0.25, h * 0.36); g.lineTo(w / 2 + h * 0.1, h * 0.38); g.fill(); small('TURN IT OVER', h * 0.82); }
    else if (st === 'INSIDE') { for (let i = 0; i < 5; i++) { g.globalAlpha = 1 - i * 0.16; g.strokeRect(w * 0.3 + i * h * 0.05, h * 0.18 + i * h * 0.05, w * 0.3, h * 0.42); } g.globalAlpha = 1; small('INSIDE', h * 0.86); }
    else if (st === 'PATTERN' || st === 'TEMPO') {
      g.textAlign = 'left'; g.font = `500 ${Math.round(h * 0.085)}px ${fontStack('mono')}`; g.fillText('PATTERN A', w * 0.05, h * 0.13); g.textAlign = 'right'; g.fillText(Math.round(this.bpm) + ' BPM', w * 0.95, h * 0.13);
      const rows = 4, cols = 16, x0 = w * 0.05, y0 = h * 0.27, cw = (w * 0.9) / cols, chh = (h * 0.62) / rows;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const on = this.pattern && this.pattern[r] && this.pattern[r][c]; const cur = c === this.step;
        g.globalAlpha = on ? 1 : cur ? 0.45 : 0.16; g.fillRect(x0 + c * cw + cw * 0.12, y0 + r * chh + chh * 0.14, cw * 0.76, chh * 0.72);
      }
      g.globalAlpha = 1; if (this.step >= 0) { g.fillRect(x0 + this.step * cw, h * 0.92, cw, h * 0.03); }
    }
    else if (st === 'TRAVEL') { g.lineWidth = h * 0.012; g.setLineDash([h * 0.04, h * 0.03]); g.beginPath(); g.moveTo(w * 0.1, h * 0.55); g.bezierCurveTo(w * 0.35, h * 0.2, w * 0.6, h * 0.85, w * 0.9, h * 0.45); g.stroke(); g.setLineDash([]);
      const t = this.dot, x = (1 - t) ** 3 * w * 0.1 + 3 * (1 - t) ** 2 * t * w * 0.35 + 3 * (1 - t) * t * t * w * 0.6 + t ** 3 * w * 0.9, y = (1 - t) ** 3 * h * 0.55 + 3 * (1 - t) ** 2 * t * h * 0.2 + 3 * (1 - t) * t * t * h * 0.85 + t ** 3 * h * 0.45;
      g.beginPath(); g.arc(x, y, h * 0.06, 0, Math.PI * 2); g.fill(); small('TRAVEL MODE', h * 0.86); }
    else if (st === 'SPECS') { big('H-1', h * 0.42, 0.24); small('16 PADS \u00b7 2 KNOBS \u00b7 1 SPEAKER', h * 0.74); }
    else if (st === 'POCKET') { big('SEE YOU', h * 0.48, 0.22); small('POCKET MODE', h * 0.78); }
    else if (st === 'PLAY') { big('PLAY', h * 0.46, 0.22); small('MAKE A BEAT', h * 0.78); }
    this.scrTex.needsUpdate = true;
  }
  press(i) { this.padPress[i] = 1; this.padFlash[i] = 1; }
  updatePads(dt = 0) {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
    const cream = new THREE.Color(PAL.cream), lime = new THREE.Color(PAL.lime), c = new THREE.Color();
    for (let i = 0; i < 16; i++) {
      this.padPress[i] = Math.max(0, this.padPress[i] - dt * 9); this.padFlash[i] = Math.max(0, this.padFlash[i] - dt * 3.2);
      const k = this.padPress[i], sq = 1 - 0.08 * Math.sin(Math.min(1, k) * Math.PI);
      const pc = padCenter(i); p.set(pc.x, pc.y, -0.012 * Math.sin(k * Math.PI)); s.set(sq, sq, 1 - 0.3 * Math.sin(k * Math.PI));
      m.compose(p, q, s); this.padMesh.setMatrixAt(i, m);
      c.copy(cream).lerp(lime, this.padFlash[i]); this.padMesh.setColorAt(i, c);
    }
    this.padMesh.instanceMatrix.needsUpdate = true; if (this.padMesh.instanceColor) this.padMesh.instanceColor.needsUpdate = true;
  }
  setExplode(e) {
    this.explode = e; const g = LAYER_GAP * e;
    this.layers.face.position.z = 0.055 + 2 * g; this.layers.pads.position.z = 0.072 + 1 * g; this.layers.board.position.z = 0.02;
    this.layers.battery.position.z = -0.02 - 1 * g; this.layers.shell.position.z = -2 * g;
  }
  setKnob(i, a) { this.knobs[i].rotation.z = a; }
  // anchor points (local) of each layer, for leader lines
  anchors() { return { face: new THREE.Vector3(0.42, 0.66, this.layers.face.position.z + 0.02), pads: new THREE.Vector3(-0.36, PAD_Y + 0.2, this.layers.pads.position.z + 0.03), board: new THREE.Vector3(0.36, 0.25, this.layers.board.position.z + 0.02), battery: new THREE.Vector3(-0.26, -0.4, this.layers.battery.position.z + 0.03), shell: new THREE.Vector3(0.44, -0.6, this.layers.shell.position.z - 0.02) }; }
}

export class Stage {
  constructor(canvas, opts = {}) {
    this.canvas = canvas; this.q = opts.quality || 'desktop';
    const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: !!opts.still });
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.q === 'phone' ? 1.75 : 2));
    r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = 1.0; r.outputColorSpace = THREE.SRGBColorSpace;
    r.setClearColor(0x000000, 0);
    this.renderer = r;
    this.scene = new THREE.Scene();
    const pm = new THREE.PMREMGenerator(r); this.scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; this.scene.environmentIntensity = 0.75; pm.dispose();
    const key = new THREE.DirectionalLight(0xfff1dc, 1.6); key.position.set(3, 4, 6); this.scene.add(key);
    const rim = new THREE.DirectionalLight(0xe8ffd0, 0.9); rim.position.set(-4, 2, -3); this.scene.add(rim);
    this.scene.add(new THREE.HemisphereLight(0xfff4e2, 0x1b2340, 0.35));
    this.camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50); this.camera.position.set(0, 0, 10);
    this.device = new Device({ quality: this.q });
    this.scene.add(this.device.shadow); this.scene.add(this.device.group);
    this.ray = new THREE.Raycaster(); this.v2 = new THREE.Vector2();
    this.resize();
    this.info = { tris: 0, calls: 0 }; this.V3 = THREE.Vector3;
  }
  facing3(a) { if (Math.abs(a[2]) < 0.05) return true; const n = new THREE.Vector3(0, 0, Math.sign(a[2])); this.device.group.updateMatrixWorld(); n.transformDirection(this.device.group.matrixWorld); return n.z > 0.2; }
  get visH() { return 2 * this.camera.position.z * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)); }
  resize() {
    const w = this.canvas.clientWidth || innerWidth, h = this.canvas.clientHeight || innerHeight;
    this.renderer.setSize(w, h, false); this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); this.w = w; this.h = h;
  }
  // pose: x,y = fraction of viewport from centre (+y up); s = device height as fraction of viewport height
  applyPose(p, t = 0) {
    const VH = this.visH, VW = VH * this.camera.aspect, d = this.device, g = d.group;
    const sc = (p.s * VH) / H;
    const fl = p.float || 0;
    g.position.set(p.x * VW, p.y * VH + fl * Math.sin(t * 1.3) * 0.016 * VH, 0);
    g.scale.setScalar(sc);
    g.rotation.set(p.rx + fl * Math.sin(t * 0.9) * 0.03, p.ry + fl * Math.sin(t * 0.7) * 0.05, p.rz + (p.swing || 0));
    if (Math.abs(d.explode - (p.ex || 0)) > 1e-4) d.setExplode(p.ex || 0);
    const sh = d.shadow; sh.position.set(g.position.x + 0.05 * sc, g.position.y - 0.82 * sc, -1.2);
    sh.scale.set(sc * 1.5, sc * 0.5, 1); sh.material.opacity = (p.shadow ?? 1);
  }
  project(v) { const w = v.clone(); this.device.group.updateMatrixWorld(); w.applyMatrix4(this.device.group.matrixWorld); w.project(this.camera); return { x: (w.x + 1) / 2 * this.w, y: (1 - w.y) / 2 * this.h }; }
  hit(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect(); this.v2.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    this.ray.setFromCamera(this.v2, this.camera);
    const d = this.device; const hits = this.ray.intersectObjects([d.padMesh, d.knobs[0], d.knobs[1], d.group], true);
    if (!hits.length) return null; const h = hits[0];
    if (h.object === d.padMesh) return { pad: h.instanceId };
    let o = h.object; while (o) { if (o === d.knobs[0]) return { knob: 0 }; if (o === d.knobs[1]) return { knob: 1 }; o = o.parent; }
    return { body: true };
  }
  render(dt) { this.device.updatePads(dt); this.renderer.render(this.scene, this.camera); this.info.calls = this.renderer.info.render.calls; this.info.tris = this.renderer.info.render.triangles; }
}
