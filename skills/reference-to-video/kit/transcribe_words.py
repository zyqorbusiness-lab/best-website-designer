"""Word-level timestamps with faster-whisper (tiny.en, ~75 MB, already cached).
Run with a Python that has faster-whisper:  python3 transcribe_words.py clip.mp4 out.json [model]
Writes [{"text","start","end"}...]. Use base.en / small.en if tiny mishears (bigger download; check disk)."""
import sys, json
from faster_whisper import WhisperModel
src, out = sys.argv[1], sys.argv[2]
model = sys.argv[3] if len(sys.argv) > 3 else "tiny.en"
lang = sys.argv[4] if len(sys.argv) > 4 else "en"   # v5: "hi" for Hindi (use a multilingual model like "small", not *.en)
m = WhisperModel(model, device="cpu", compute_type="int8", cpu_threads=4)
segs, _ = m.transcribe(src, word_timestamps=True, language=lang, beam_size=5, vad_filter=True)
words = [{"text": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3)} for s in segs for w in s.words]
json.dump(words, open(out, "w"), indent=1)
print(len(words), "words ->", out)
