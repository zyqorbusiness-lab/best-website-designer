#!/usr/bin/env python3
"""sfx_mix.py — build a sound-design track from an event list (motion-kit v2, Nov 3 2026).
Usage: python3 sfx_mix.py events.json out.wav DURATION_S
events.json: [{"t": 0.30, "sfx": "pop", "db": 0}, {"t": 1.2, "sfx": "whoosh", "db": -3, "lead": 0.25}, ...]
  sfx  = a name in sfx_v2/ (whoosh, whoosh2, whoosh_fast, sweep_small, tech_slide, zoom_vacuum, pop, pop2, click,
         typing, riser, impact, bass, notif, ding, glitch_text, glitch_break, cash, shutter) or the starter kit's
         sfx/ (chime, counter, fill, snap, star, success, switch, tick), or a path.
  db   = gain relative to the house level (every sample is first levelled to -20 dBFS RMS of its loud part).
  lead = seconds to start BEFORE t (whooshes/risers peak on the cut: whoosh lead ~0.2, riser lead = its length).
  dur  = optional max seconds to play (typing loops are long).
House levels (relative to a -14 LUFS voice): pops/clicks -6..-10 dB under voice, whooshes -8, impacts/bass -4, risers -10.
"""
import sys, json, os, subprocess, numpy as np, wave
KIT = os.path.dirname(os.path.abspath(__file__))
SR = 48000
def find(name):
    if os.path.exists(name): return name
    for d in ("sfx_v2", "Motion-Graphics-starter-kit/sfx"):
        for ext in (".mp3", ".wav"):
            p = os.path.join(KIT, d, name + ext)
            if os.path.exists(p): return p
    raise FileNotFoundError(name)
_cache = {}
def load(name):
    if name in _cache: return _cache[name]
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", find(name), "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, timeout=60).stdout
    a = np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
    m = np.abs(a).max(1); idx = np.where(m > 0.01)[0]
    if len(idx): a = a[idx[0]:]                        # trim leading silence so t is the attack
    env = np.sqrt((a ** 2).mean(1)); loud = env[env > env.max() * 0.1] if env.max() > 0 else env
    rms = np.sqrt((loud ** 2).mean()) + 1e-9
    a *= (10 ** (-20 / 20)) / rms
    _cache[name] = a; return a
def main():
    ev = json.load(open(sys.argv[1])); out = sys.argv[2]; dur = float(sys.argv[3])
    buf = np.zeros((int(dur * SR) + SR, 2), np.float32)
    for e in ev:
        a = load(e["sfx"])
        if "dur" in e:
            n = int(e["dur"] * SR); a = a[:n].copy(); fade = min(n, int(0.05 * SR)); a[-fade:] *= np.linspace(1, 0, fade)[:, None]
        g = 10 ** (e.get("db", 0) / 20)
        s = int(max(0, (e["t"] - e.get("lead", 0))) * SR)
        n = min(len(a), len(buf) - s)
        if n > 0: buf[s:s + n] += a[:n] * g
    buf = buf[:int(dur * SR)]
    pk = np.abs(buf).max()
    if pk > 0.98: buf *= 0.98 / pk
    with wave.open(out, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(buf, -1, 1) * 32767).astype(np.int16).tobytes())
    print(f"sfx_mix: {len(ev)} events -> {out} ({dur:.2f}s, peak {20*np.log10(pk+1e-9):.1f} dBFS)")
if __name__ == "__main__": main()
