#!/usr/bin/env python3
"""typing_states.py - build ui_screen_v5 states (one per video frame) so the typing lands on the voice's word times.
Used for the face-lock v5 reel (Nov 4 2026). Edit PROMPT (word, voice_start_seconds) and the timeline in state(t); run:
  python3 typing_states.py states.json 2.9 10.8       # t0 t1 (seconds), 30 fps
  CHROME_PATH=... node frames_pw.js states.json seq/ rects.json
Then in EffectCraft: import seq/s_0001.png as a sequence, layer.startTime = t0. Tap rings: parent a ring layer to the phone layer and
set its Position to the rect centre * 3 (rects.json is in CSS px; the frames are 3x) - it stays locked through every phone move.
"""
import sys, json, math
FPS = 30
def clamp(x): return max(0.0, min(1.0, x))
def ease(x): x = clamp(x); return x * x * (3 - 2 * x)
def typed_text(words, t, tail=0.4, speed=0.85):
    """words = [(word, start_s)]. Each word's letters appear between its start and the next word's start (x speed)."""
    out, last, cur = "", None, ""
    for i, (w, s) in enumerate(words):
        e = words[i + 1][1] if i + 1 < len(words) else s + tail
        if t < s: break
        n = len(w); frac = clamp((t - s) / max((e - s) * speed, 0.05))
        k = min(n, int(math.ceil(frac * n)) if frac < 1 else n); out += w[:k]
        if k > 0: last, cur = w[k - 1], w[:k]
        if k == n and t >= s + (e - s) * speed and i + 1 < len(words): out += " "
    return out, last, cur
PROMPT = [("Mera", 6.04), ("chehra,", 6.32), ("skin", 6.70), ("tone", 6.98), ("same", 8.13), ("rakho.", 8.34)]   # example
def state(t):
    s = {"kb": round(ease((t - 5.15) / 0.28), 3), "caret": True}
    txt, last, cur = typed_text(PROMPT, t)
    if txt: s["typed"] = txt
    if last and last.isalpha(): s["press"] = {"k": last.lower(), "sug": cur}      # key pop-up while a letter lands
    return s
if __name__ == "__main__":
    out, t0, t1 = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
    json.dump([{"f": i, "s": state(t0 + i / FPS)} for i in range(int((t1 - t0) * FPS) + 1)], open(out, "w"))
