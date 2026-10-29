/* P017 Tapehead Hi-Fi - shared app for index.html (desktop) and m.html (phone).
   Signature: one real portable cassette deck (Poly Haven "Cassette Player" by Oday Abuzaeed, CC0; the tape is its own
   part in the scan) lit by a real concert-hall HDRI (Poly Haven "Music Hall 01" by Sergej Majboroda, CC0). Press Play
   and the page synthesises a short chord loop with tape hiss; the glass deck's VU meter reads that sound through an
   analyser with real VU ballistics (about 300 ms rise and fall). Eject slides the cassette out of the deck. Scroll into
   "Side B" and the cassette leaves the deck, turns over in the air and goes back in. Hand-made details: (1) the needle
   is driven by the RMS level of the actual audio, not an animation, (2) the "Inside" numbers (deck size, cassette width,
   triangle count) are read from the scan at load, (3) the deck model leans a few degrees towards the pointer on desktop
   and towards the device tilt-free centre on phone, so it feels picked up. Same model, HDRI, effects and flight on phone
   and desktop. */
import { createStage, THREE, isM, reduced, smoothstep, damp, smooth, clamp } from '../../_kit/stage.js';
import { reveals, press } from '../../_kit/fx/index.js';
import { landing } from '../../_kit/landing.js';
landing(); reveals(); press('[data-press]');
const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
await new Promise((r) => (document.readyState === 'complete' ? r() : addEventListener('load', r, { once: true })));
smooth();

/* ---- VU meter ticks ---- */
const ticks = $('.vu-ticks');
for (let i = 0; i <= 10; i++) { const a = (-50 + i * 10) * Math.PI / 180, r1 = i % 5 ? 78 : 72, r2 = 86; const l = document.createElementNS('http://www.w3.org/2000/svg', 'line'); l.setAttribute('x1', 100 + Math.sin(a) * r1); l.setAttribute('y1', 104 - Math.cos(a) * r1); l.setAttribute('x2', 100 + Math.sin(a) * r2); l.setAttribute('y2', 104 - Math.cos(a) * r2); ticks.append(l); }
const needle = $('.vu-needle'), status = $('#deck-s');

/* ---- sound: a four-chord loop + tape hiss, made in the browser ---- */
let ac = null, an = null, out = null, playing = false, loopT = 0, nodes = [];
const CH = [[220, 277.18, 329.63], [196, 246.94, 293.66], [174.61, 220, 261.63], [196, 246.94, 329.63]];
function ensure() { if (ac) return ac; try { ac = new (window.AudioContext || window.webkitAudioContext)(); an = ac.createAnalyser(); an.fftSize = 1024; out = ac.createGain(); out.gain.value = 0.0; out.connect(an); an.connect(ac.destination); } catch { ac = null; } return ac; }
function schedule() {
  if (!playing || !ac) return;
  const t0 = Math.max(ac.currentTime + 0.05, loopT);
  CH.forEach((ch, k) => ch.forEach((f) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = 'triangle'; o.frequency.value = f; const s = t0 + k * 1.2; g.gain.setValueAtTime(0, s); g.gain.linearRampToValueAtTime(0.09, s + 0.06); g.gain.exponentialRampToValueAtTime(0.004, s + 1.15); o.connect(g).connect(out); o.start(s); o.stop(s + 1.2); nodes.push(o); }));
  loopT = t0 + CH.length * 1.2;
  setTimeout(schedule, (loopT - ac.currentTime - 0.6) * 1000);
}
let hiss = null;
function play() {
  if (!ensure()) { status.textContent = 'No audio on this device · meter idle'; return; }
  ac.resume && ac.resume();
  if (playing) return; playing = true; loopT = 0;
  const n = ac.sampleRate * 2, b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * 0.02;
  hiss = ac.createBufferSource(); hiss.buffer = b; hiss.loop = true; hiss.connect(out); hiss.start();
  out.gain.cancelScheduledValues(ac.currentTime); out.gain.setTargetAtTime(1, ac.currentTime, 0.05);
  schedule(); setKeys(); kickMeter();
}
function stop() {
  playing = false; if (ac) { out.gain.setTargetAtTime(0, ac.currentTime, 0.04); nodes.forEach((o) => { try { o.stop(ac.currentTime + 0.1); } catch {} }); nodes = []; if (hiss) { try { hiss.stop(ac.currentTime + 0.15); } catch {} hiss = null; } }
  setKeys(); kickMeter();
}
let ejected = false;
function setKeys() { $('[data-key="play"]').setAttribute('aria-pressed', String(playing)); $('[data-key="eject"]').setAttribute('aria-pressed', String(ejected)); status.textContent = (playing ? 'Playing' : 'Stopped') + ' · ' + (ejected ? 'tape out' : 'tape in'); }
/* VU ballistics: ~300 ms integration on the RMS of the real signal */
let vu = 0, meterRaf = 0, lastM = 0; const buf = new Float32Array(1024);
function meter(now) {
  const dt = Math.min(0.05, (now - lastM) / 1000 || 0.016); lastM = now;
  let rms = 0; if (an && playing) { an.getFloatTimeDomainData(buf); for (let i = 0; i < buf.length; i++) rms += buf[i] * buf[i]; rms = Math.sqrt(rms / buf.length); }
  const db = rms > 0 ? 20 * Math.log10(rms) : -60, target = clamp((db + 32) / 30, 0, 1.05);
  vu += (target - vu) * (1 - Math.exp(-dt / 0.3 * 3));
  needle.style.transform = `rotate(${(-50 + vu * 100).toFixed(2)}deg)`;
  meterRaf = (playing || vu > 0.003) ? requestAnimationFrame(meter) : 0;
}
const kickMeter = () => { if (!meterRaf) { lastM = performance.now(); meterRaf = requestAnimationFrame(meter); } };
$('[data-key="play"]').addEventListener('click', play);
$('[data-key="stop"]').addEventListener('click', stop);

/* ---- the deck ---- */
const stage = await createStage({
  el: '[data-stage]', exposure: 1.1, envIntensity: 1.0, lazy: false,
  hdri: new URL('../../_assets/hdri/music_hall_01_1k.hdr', import.meta.url).href,
  camera: { fov: 28, position: [0, 0.5, isM ? 6.8 : 5.0], target: [0, 0, 0] },
  label: 'Tapehead: a portable cassette player. Use the deck controls to play or eject the tape; scroll to turn the tape over.'
});
const steps = $$('.tp-steps span');
$('[data-key="eject"]').addEventListener('click', () => { ejected = !ejected; if (ejected) stop(); setKeys(); stage.invalidate && stage.invalidate(); });
if (!stage.failed) {
  const g = await stage.load(stage.asset('models/cassette_player.glb'));
  const deck = g.scene;
  let tape = null, tris = 0;
  deck.traverse((o) => { if (o.isMesh) { tris += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3; o.material.envMapIntensity = 1.15; } if (/tape/i.test(o.name) && !tape) tape = o; });
  const sz = new THREE.Box3().setFromObject(deck).getSize(new THREE.Vector3());
  const dims = [sz.x, sz.y, sz.z].sort((a, b) => b - a);
  $('#dm-w').textContent = (dims[0] * 100).toFixed(1); $('#dm-h').textContent = (dims[1] * 100).toFixed(1);
  if (tape) { const ts = new THREE.Box3().setFromObject(tape).getSize(new THREE.Vector3()); $('#dm-c').textContent = (Math.max(ts.x, ts.y, ts.z) * 100).toFixed(1); }
  $('#dm-t').textContent = Math.round(tris).toLocaleString('en-US');
  const holder = new THREE.Group(), lean = new THREE.Group(); lean.add(deck); holder.add(lean); stage.add(holder);
  stage.fit(deck, isM ? 1.25 : 1.6, false);
  const c = new THREE.Box3().setFromObject(deck).getCenter(new THREE.Vector3()); deck.position.sub(c);
  holder.rotation.set(0.12, -0.5, 0);
  if (isM) holder.position.set(0, 0.05, 0); else holder.position.set(0.32, 0.1, 0);
  const key = new THREE.DirectionalLight(0xfff0dd, 1.4); key.position.set(-2.5, 3, 3); stage.scene.add(key);
  const rim = new THREE.DirectionalLight(new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue('--c3').trim()), 1.1); rim.position.set(3, 1.5, -3); stage.scene.add(rim);
  /* tape flight: local axes of the tape part */
  const home = tape ? tape.position.clone() : null, homeQ = tape ? tape.quaternion.clone() : null;
  const tb = tape ? new THREE.Box3().setFromObject(tape) : null;
  holder.updateMatrixWorld(true);
  const inv = tape ? new THREE.Matrix4().copy(tape.parent.matrixWorld).invert() : null;
  const deckUp = new THREE.Vector3(0, 1, 0).applyQuaternion(holder.quaternion), deckFront = new THREE.Vector3(0, 0, 1).applyQuaternion(holder.quaternion);
  const upLocal = tape ? deckUp.clone().transformDirection(inv).normalize() : null;
  const frontLocal = tape ? deckFront.clone().transformDirection(inv).normalize() : null;
  const outDist = tape ? (tb.getSize(new THREE.Vector3()).y + 0.4) / tape.parent.getWorldScale(new THREE.Vector3()).y : 0;
  let flight = 0, flightWant = 0, ej = 0, mx = 0, my = 0;
  addEventListener('pointermove', (e) => { if (e.pointerType !== 'mouse') return; mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; stage.invalidate(); }, { passive: true });
  function poseTape() {
    if (!tape) return;
    const f = flight, up = Math.max(ej * 0.35, smoothstep(0, 0.33, f) * (1 - smoothstep(0.66, 1, f)));
    tape.position.copy(home).addScaledVector(frontLocal, up * outDist * 0.9).addScaledVector(upLocal, smoothstep(0.3, 1, up) * outDist * 0.35);
    const turn = smoothstep(0.33, 0.66, f) * Math.PI;
    tape.quaternion.copy(homeQ).premultiply(new THREE.Quaternion().setFromAxisAngle(upLocal, 0)).multiply(new THREE.Quaternion().setFromAxisAngle(upLocal, turn));
    const s = f < 0.33 ? 0 : f < 0.66 ? 1 : 2; steps.forEach((el, k) => el.classList.toggle('is-on', k === s && f > 0.02 && f < 0.98));
  }
  stage.scroll('#tape', (p) => { flightWant = p; stage.invalidate(); }, { native: isM });
  stage.onFrame((dt, t) => {
    let busy = false;
    const ejW = ejected ? 1 : 0; if (Math.abs(ej - ejW) > 0.001) { ej = reduced ? ejW : damp(ej, ejW, 6, dt); busy = true; }
    if (Math.abs(flight - flightWant) > 0.0005) { flight = reduced ? flightWant : damp(flight, flightWant, 7, dt); busy = true; }
    poseTape();
    lean.rotation.y = damp(lean.rotation.y, reduced ? 0 : mx * 0.25, 5, dt); lean.rotation.x = damp(lean.rotation.x, reduced ? 0 : my * 0.12, 5, dt);
    if (playing && !reduced) { lean.position.y = Math.sin(t * 40) * 0.0012; busy = true; }
    return busy || Math.abs(lean.rotation.y - mx * 0.25) > 0.001;
  });
  stage.loaded();
}
setKeys();
