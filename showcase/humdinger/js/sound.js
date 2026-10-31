// Humdinger H-1 sound engine: every sound is synthesised live with the Web Audio API (no audio files).
const NOTES_BASS = [55, 65.41, 73.42, 82.41];          // A1 C2 D2 E2
const NOTES_LEAD = [440, 523.25, 659.25, 783.99];      // A4 C5 E5 G5
export class Sound {
  constructor() { this.ctx = null; this.on = false; this.shift = false; this.fx = false; this.listeners = []; }
  enable() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
      this.ctx = new AC(); const c = this.ctx;
      this.master = c.createGain(); this.master.gain.value = 0.8;
      const comp = c.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
      this.master.connect(comp); comp.connect(c.destination);
      this.delay = c.createDelay(1); this.delay.delayTime.value = 0.27; this.fb = c.createGain(); this.fb.gain.value = 0.35; this.wet = c.createGain(); this.wet.gain.value = 0;
      this.delay.connect(this.fb); this.fb.connect(this.delay); this.delay.connect(this.wet); this.wet.connect(this.master);
      const n = c.sampleRate; this.noise = c.createBuffer(1, n, n); const d = this.noise.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    this.on = true; try { sessionStorage.setItem('hd-sound', '1'); } catch {} this.emit(); return true;
  }
  disable() { this.on = false; try { sessionStorage.setItem('hd-sound', '0'); } catch {} if (this.ctx) this.ctx.suspend(); this.emit(); }
  onChange(f) { this.listeners.push(f); } emit() { this.listeners.forEach((f) => f(this.on)); }
  setFx(v) { this.fx = v; if (this.wet) this.wet.gain.setTargetAtTime(v ? 0.35 : 0, this.ctx.currentTime, 0.05); }
  now() { return this.ctx ? this.ctx.currentTime : performance.now() / 1000; }
  out(node) { node.connect(this.master); node.connect(this.delay); }
  env(g, t, a, peak, dec) { g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec); }
  noiseSrc(t, dur) { const s = this.ctx.createBufferSource(); s.buffer = this.noise; s.start(t, Math.random() * 0.5, dur + 0.05); return s; }
  play(i, t) {
    if (!this.on || !this.ctx) return; const c = this.ctx; t = t ?? c.currentTime + 0.005;
    if (i === 0) { const o = c.createOscillator(), g = c.createGain(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(44, t + 0.16); this.env(g, t, 0.003, 1.0, 0.36); o.connect(g); g.connect(this.master); o.start(t); o.stop(t + 0.45); }
    else if (i === 1) { const s = this.noiseSrc(t, 0.2), f = c.createBiquadFilter(), g = c.createGain(); f.type = 'bandpass'; f.frequency.value = 1900; f.Q.value = 0.8; this.env(g, t, 0.002, 0.7, 0.16); s.connect(f); f.connect(g); this.out(g);
      const o = c.createOscillator(), g2 = c.createGain(); o.type = 'triangle'; o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(160, t + 0.1); this.env(g2, t, 0.002, 0.45, 0.1); o.connect(g2); g2.connect(this.master); o.start(t); o.stop(t + 0.2); }
    else if (i === 2) { const s = this.noiseSrc(t, 0.06), f = c.createBiquadFilter(), g = c.createGain(); f.type = 'highpass'; f.frequency.value = 7200; this.env(g, t, 0.001, 0.35, 0.05); s.connect(f); f.connect(g); this.out(g); }
    else if (i === 3) { const f = c.createBiquadFilter(), g = c.createGain(); f.type = 'bandpass'; f.frequency.value = 1200; f.Q.value = 1.2; f.connect(g); this.out(g);
      g.gain.setValueAtTime(0.0001, t); [0, 0.011, 0.022].forEach((o) => { g.gain.setValueAtTime(0.8, t + o); g.gain.exponentialRampToValueAtTime(0.1, t + o + 0.009); }); g.gain.setValueAtTime(0.7, t + 0.033); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22); this.noiseSrc(t, 0.25).connect(f); }
    else if (i >= 4 && i <= 7) { const fr = NOTES_BASS[i - 4] * (this.shift ? 2 : 1); const o = c.createOscillator(), o2 = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain(); o.type = 'sawtooth'; o2.type = 'square'; o.frequency.value = fr; o2.frequency.value = fr / 2;
      f.type = 'lowpass'; f.Q.value = 6; f.frequency.setValueAtTime(1400, t); f.frequency.exponentialRampToValueAtTime(140, t + 0.25); this.env(g, t, 0.004, 0.42, 0.32); o.connect(f); o2.connect(f); f.connect(g); g.connect(this.master); o.start(t); o2.start(t); o.stop(t + 0.4); o2.stop(t + 0.4); }
    else if (i >= 8 && i <= 11) { const fr = NOTES_LEAD[i - 8] * (this.shift ? 2 : 1); const o = c.createOscillator(), o2 = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter(); o.type = 'square'; o2.type = 'triangle'; o.frequency.value = fr; o2.frequency.value = fr * 1.005; f.type = 'lowpass'; f.frequency.value = 3200;
      this.env(g, t, 0.006, 0.16, 0.3); o.connect(f); o2.connect(f); f.connect(g); this.out(g); o.start(t); o2.start(t); o.stop(t + 0.4); o2.stop(t + 0.4); }
    else { const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.value = i === 12 ? 1320 : i === 13 ? 990 : i === 14 ? 660 : 1760; this.env(g, t, 0.002, 0.12, 0.05); o.connect(g); g.connect(this.master); o.start(t); o.stop(t + 0.08); }
  }
  click() { if (!this.on || !this.ctx) return; const c = this.ctx, t = c.currentTime + 0.005, s = this.noiseSrc(t, 0.03), f = c.createBiquadFilter(), g = c.createGain(); f.type = 'bandpass'; f.frequency.value = 3400; f.Q.value = 3; this.env(g, t, 0.001, 0.5, 0.025); s.connect(f); f.connect(g); g.connect(this.master); }
}

// 16-step sequencer: rows = KICK, SNARE+HAT, BASS, LEAD (the 4 guided steps). Scheduled on the audio clock when sound is on,
// otherwise on performance.now() so the screen still animates.
export const LAYERS = [
  { name: 'Kick', hits: [[0, [0, 4, 8, 12]]] },
  { name: 'Snare + hat', hits: [[1, [4, 12]], [2, [2, 6, 10, 14]]] },
  { name: 'Bass', hits: [[4, [0, 3]], [6, [6]], [5, [8, 11]], [7, [14]]] },
  { name: 'Lead', hits: [[8, [0]], [10, [3]], [9, [6]], [11, [10]], [10, [12]]] }
];
export class Sequencer {
  constructor(sound, onStep) { this.s = sound; this.onStep = onStep; this.bpm = 112; this.playing = false; this.layers = 0; this.extra = new Map(); this.step = 0; this.next = 0; this.queue = []; this.timer = null; }
  grid() { const g = [[], [], [], []]; for (let r = 0; r < 4; r++) for (let c = 0; c < 16; c++) g[r][c] = 0;
    for (let l = 0; l < this.layers; l++) for (const [, steps] of LAYERS[l].hits) for (const s of steps) g[l][s] = 1;
    for (const [k] of this.extra) { const [, s] = k.split(':').map(Number); const pad = +k.split(':')[0]; const row = pad < 1 ? 0 : pad < 4 ? 1 : pad < 8 ? 2 : 3; g[row][s] = 1; }
    return g; }
  hitsAt(step) { const out = []; for (let l = 0; l < this.layers; l++) for (const [pad, steps] of LAYERS[l].hits) if (steps.includes(step)) out.push(pad); for (const [k] of this.extra) { const [pad, s] = k.split(':').map(Number); if (s === step) out.push(pad); } return out; }
  record(pad) { if (pad >= 12) return; this.extra.set(pad + ':' + this.step, 1); }
  start() { if (this.playing) return; this.playing = true; this.step = 0; this.next = this.s.now() + 0.06; this.timer = setInterval(() => this.tick(), 25); }
  stop() { this.playing = false; clearInterval(this.timer); this.timer = null; this.queue.length = 0; }
  toggle() { this.playing ? this.stop() : this.start(); }
  tick() { const now = this.s.now(), dur = 60 / this.bpm / 4;
    while (this.next < now + 0.1) { const st = this.step; for (const p of this.hitsAt(st)) this.s.play(p, this.s.ctx && this.s.on ? this.next : undefined); this.queue.push([this.next, st]); this.next += dur; this.step = (this.step + 1) % 16; } }
  // called each frame: fire visual steps whose time has come
  frame() { const now = this.s.now(); while (this.queue.length && this.queue[0][0] <= now) { const [, st] = this.queue.shift(); this.onStep(st, this.hitsAt(st)); } }
}
