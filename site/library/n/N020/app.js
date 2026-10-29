/* N020 Chordline Music School - shared app for index.html (desktop) and m.html (phone).
   Signature: the four strings are the page's own menu. Pluck one (tap, click, Enter) and you hear its real pitch
   (G4 392 Hz, C4 261.63 Hz, E4 329.63 Hz, A4 440 Hz, re-entrant tuning) synthesised live with a Karplus-Strong string,
   the SVG string vibrates with a decay matched to the sound, the real ukulele (Poly Haven "Ukulele 01", CC0) shivers,
   and the level card under it changes. Hand-made details: (1) each string's drawn thickness follows the real gauge order
   (C thickest, A thinnest), (2) the chord diagrams strum the exact fingerings they show, string by string, low to high,
   (3) the string you plucked last stays green until you pluck another one. Same model, textures and HDRI on phone. */
import { createStage, THREE, isM, reduced, damp } from '../../_kit/stage.js';
import { reveals, press } from '../../_kit/fx/index.js';
import { landing } from '../../_kit/landing.js';
landing(); reveals(); press('[data-press]');
const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];

/* ---- sound: Karplus-Strong plucked string, made on the first tap (no autoplay) ---- */
const OPEN = [392.0, 261.63, 329.63, 440.0];
let ac = null;
function audio() { if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch { ac = null; } } if (ac && ac.state === 'suspended') ac.resume().catch(() => {}); return ac; }
function pluck(freq, when = 0, gain = 0.32) {
  const a = audio(); if (!a) return;
  const sr = a.sampleRate, dur = 1.6, n = Math.floor(sr * dur), buf = a.createBuffer(1, n, sr), d = buf.getChannelData(0);
  const p = Math.max(2, Math.round(sr / freq)); let seed = Math.round(freq * 97);
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
  for (let i = 0; i < p; i++) d[i] = rnd() * 0.5;
  for (let i = p; i < n; i++) d[i] = 0.497 * (d[i - p] + d[i - p + 1]);
  const src = a.createBufferSource(); src.buffer = buf;
  const g = a.createGain(); g.gain.value = gain; const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3200;
  src.connect(lp).connect(g).connect(a.destination); src.start(a.currentTime + when);
}

/* ---- the SVG strings vibrate (decaying standing wave) ---- */
const vib = OPEN.map(() => ({ amp: 0, ph: 0 }));
const paths = $$('.string .s-line path');
function drawStrings(dt) {
  let busy = false;
  vib.forEach((v, i) => {
    if (v.amp < 0.05) { if (v.amp) { v.amp = 0; paths[i].setAttribute('d', 'M0 12 Q500 12 1000 12'); } return; }
    busy = true; v.ph += dt * (18 + i * 3); v.amp *= Math.exp(-dt * 2.6);
    const y = 12 + Math.sin(v.ph) * v.amp * 9; paths[i].setAttribute('d', `M0 12 Q500 ${y.toFixed(2)} 1000 12`);
  });
  return busy;
}
let lastT = performance.now(), loop = 0;
const tickStrings = (now) => { const dt = Math.min(0.05, (now - lastT) / 1000); lastT = now; loop = drawStrings(dt) ? requestAnimationFrame(tickStrings) : 0; };
const kickStrings = () => { if (!loop) { lastT = performance.now(); loop = requestAnimationFrame(tickStrings); } };

const LEVELS = [
  ['Level 1 · G string · 4 weeks', 'First strum', 'Hold it, tune it, play four chords and one whole song by week four.'],
  ['Level 2 · C string · 6 weeks', 'Chord shapes', 'Twelve shapes and clean changes between them, at the speed of a real song.'],
  ['Level 3 · E string · 8 weeks', 'Fingerpicking', 'Thumb and three fingers: arpeggios, a melody line and your first instrumental.'],
  ['Level 4 · A string · 10 weeks', 'Small ensemble', 'Four players, four parts. You learn to listen while you play.']];
const card = $('.level-card');
let shiver = 0;
function play(i) {
  pluck(OPEN[i]);
  if (!reduced) { vib[i].amp = 1; kickStrings(); shiver = 1; stage && stage.invalidate && stage.invalidate(); }
  $$('.string').forEach((b, k) => b.classList.toggle('is-on', k === i));
  const [k, h, b] = LEVELS[i];
  $('#lc-k').textContent = k; $('#lc-h').textContent = h; $('#lc-b').textContent = b;
  card.classList.remove('flash'); void card.offsetWidth; card.classList.add('flash');
}
$$('.string').forEach((b) => b.addEventListener('click', () => play(+b.dataset.string)));

/* chord diagrams strum their real frets */
$$('.chord').forEach((b) => b.addEventListener('click', () => {
  const frets = b.dataset.chord.split('').map(Number);
  [0, 1, 2, 3].forEach((s, k) => pluck(OPEN[s] * Math.pow(2, frets[s] / 12), reduced ? 0 : k * 0.045, 0.22));
  $$('.chord').forEach((c) => c.classList.toggle('is-on', c === b));
}));

/* ---- the real ukulele ---- */
const stageEl = $('[data-stage]');
const stage = await createStage({
  el: stageEl, exposure: 1.05, envIntensity: 0.95,
  camera: { fov: 26, position: isM ? [0, 0.3, 6.1] : [0.15, 0.2, 5.2], target: isM ? [0, 0.22, 0] : [0, 0, 0] },
  label: 'Chordline: a wooden concert ukulele. Drag sideways or use the arrow keys to turn it.', fitFov: true
});
if (!stage.failed) {
  const g = await stage.load(stage.asset('models/ukulele_01.glb'));
  const uke = g.scene;
  uke.traverse((o) => { if (o.isMesh) { o.material.envMapIntensity = 1.1; } });
  stage.fit(uke, 2.7, false);
  const box = new THREE.Box3().setFromObject(uke), c = box.getCenter(new THREE.Vector3()); uke.position.sub(c);
  const pivot = new THREE.Group(), tilt = new THREE.Group();
  tilt.add(uke); pivot.add(tilt); stage.add(pivot);
  const size = box.getSize(new THREE.Vector3());
  /* lay the neck diagonally (long axis -> screen diagonal) whatever axis the scan uses */
  if (size.y >= size.x && size.y >= size.z) tilt.rotation.z = -0.62; else if (size.x >= size.z) tilt.rotation.z = 0.62; else { tilt.rotation.x = Math.PI / 2; tilt.rotation.z = -0.62; }
  /* warm key + cool rim so the spruce top and the binding read */
  const key = new THREE.DirectionalLight(0xfff1dc, 1.4); key.position.set(-3, 4, 4); stage.scene.add(key);
  const rim = new THREE.DirectionalLight(0xdfe9ff, 0.9); rim.position.set(3, 1, -4); stage.scene.add(rim);
  const turn = stage.spin(pivot, { auto: 0.12, onStart: () => stageEl.classList.add('has-turned') });
  stage.onFrame((dt, t) => {
    if (shiver > 0.002) { shiver *= Math.exp(-dt * 4); tilt.position.x = Math.sin(t * 70) * 0.012 * shiver; tilt.rotation.y = Math.sin(t * 55) * 0.02 * shiver; return true; }
    if (shiver) { shiver = 0; tilt.position.x = 0; tilt.rotation.y = 0; }
    return false;
  });
  stage.loaded();
}
