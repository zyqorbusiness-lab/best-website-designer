# Recipe 11 - word behind the head (cut-out + depth layers + waveform timing)

Source: "How I edited my captions reel with AI" (Shaan Johari, Notion page Sujon sent, Nov 4 2026). Built and measured on a 16-core CPU box with no GPU (hiring reel, Zyqor Studio, 16.5 s). Worked example: skills/reference-to-video/kit/word_behind_head/.

## What it is
Layer stack, back to front: original frame -> big word -> cut-out person (the same frame with a per-frame alpha) -> small captions in front. The word looks like it is behind the head. Only the frames from the first big-word moment to the end need a cut-out.

## Pick the clip
One person, head and shoulders, space above the head, plain wall, warm/neutral (kit subject pins marked TAKE; Pinterest is read only, log the pin and creator, say it is a stranger's clip). A continuous 16 s segment of a 27 s clip beats a loop.

## Steps with the commands that worked
1. Cut-out masks. Use the ONNX model directly, not the rembg wrapper:
   - model: BiRefNet-general-lite (224 MB, from the rembg release `BiRefNet-general-bb_swin_v1_tiny-epoch_232.onnx`); the portrait model is ~1 GB, skip it when the disk is tight.
   - the ONNX has a FIXED 1024x1024 input (a 576x1024 tensor fails with "invalid dimensions"), so reducing the frame size does not make it faster.
   - `kit/word_behind_head/mask_birefnet_lite.py`: sigmoid, min-max, resize back with Lanczos, write 8-bit PNG masks. Set `enable_cpu_mem_arena=False`, `enable_mem_pattern=False`.
   - process even frames first, then odd ones, so a first composite can use interpolated odd masks while the rest finish.
2. Timing measured (CPU only): 3.9-4.6 s per frame alone, 6.5 s per frame while other jobs ran; 395 frames about 36 min wall. Threads 4 vs 16 made little difference.
3. Memory: the rembg wrapper held 12 GB RSS; the direct ONNX session holds 1.5-1.7 GB steady (first-frame peak ~6.8 GB); a second parallel worker was OOM-killed at start, so run ONE worker. Do not start an EffectCraft render while a second heavy process is loading.
4. Disk-tight tips: keep the model cache inside the task folder (`U2NET_HOME`) and delete it and the frame dumps afterwards; read the plate through an ffmpeg pipe instead of dumping PNGs; masks as 8-bit PNG (~20 KB each); PNG sequences from EffectCraft are small because most of each frame is transparent; delete other candidate clips.
5. Timings: take the word onsets from the cleaned voice, then move each word start to where the audio gets loud (energy-onset search in -0.10..+0.14 s around the ASR time; shifts were up to 0.13 s). Add the voice lead (0.35 s) plus the cleaner's filter delay (0.037 s) to every on-screen time.
6. EffectCraft: big words (`bigword_lib.jsx`) and captions (kit zq_lib captionLine) as two comps, each rendered `effectcraft-cli render --comp NAME --format png --channels rgba --end 16.5 --out dir/x.png`. Fonts: unknown font names silently fall back (check with sourceRectAtTime widths); "Archivo SemiBold" is the installed heavy wide face, Anton is condensed.
   - gradient on text = Gradient Ramp in layer space ([W/2,H/2] = layer origin); position keys must be computed from the measured rect centre when scaling or rotating a left-baseline text layer: position = centre - R(theta) * S * centreOffset.
   - extrusion = 12 copies offset (2.0,2.6) px steps, solid colours from warm red-brown to near-black; glow = one blurred copy (Gaussian Blur) in amber behind it; both are plain layers, no Glow effect needed.
   - the caption glow copy needs `G.moveAfter(L)` so it sits under the word.
7. Placement: measure the crown row from the masks (top row of mask>0.5 in the head columns), then position each word so about 60-90 % of the letter height lies below the crown, in SCREEN space after the camera transform (inverse-transform back to comp space, see the worked example). Verify with the cut-out coverage of the letter alpha (>= 15 % required, measured 22-33 %).
8. Composite (`composite.py`): plate through ffmpeg at the clip's real colour matrix (untagged HD clips need in_color_matrix=bt709, in_range=tv, and bt709 tags on the output); per frame: grade -> sunburst rays (fade in with each word) -> word layer (own push scale) -> cut-out person restored on top -> caption scrim -> captions (own push scale) -> handheld wobble, gate weave, dust, grain -> encode crf 18.
9. Audio: reuse the clean voice once (+0.35 s), master_mix.sh with bed and quiet sfx; then run qc F14 / `voice_once.py`-style cross-correlation (ONE dominant peak) and an ASR pass. Measured: peak at +0.387 s, second peak 0.038 of it.

## Human, not AI (Sujon, Nov 4 2026 12:11 PM: "Glow hoga, human beast edit jaisa, AI feel nahi", fonts like the reference)
Warm glow ON for big words and gradient keywords (warm red/amber only - this lifts the kit's glow-off rule for this reel, so qc F2 reports it); per-word imperfect overshoot (103-108 %), rotation kick that settles, +-1 frame timing jitter, tiny rotation offsets (-1.3..+1.5 deg), irregular handheld wobble, gate weave, dust specks, grain. Fonts: heavy wide display face for the big word, clean bold sans for captions.

## Gotchas
- Captions over a pale shirt lose contrast: add a soft dark band under the caption zone and a second wide soft shadow.
- Keep big words within 90 % title-safe AFTER the push and punch-in scales (compute maxW = 942 / (push * punch * overshoot)).
- A 25 fps plate duplicated to 30 fps: keep mask and plate locked to the same source frame.
- qc F5 passed (0.0 %) even with a pale blue-grey shirt.

## Honest last line
Rendered and checked: contact sheet every 0.5 s, burst frames at the first big-word pops, 2x hair-edge crops, mask overlap 0.991 mean (worst 0.949), voice-once correlation and ASR. Not done: listening to the audio, a 3D bevel-lit extrusion (this one is stacked 2.5D), a second clip, 60 fps, the 1 GB portrait model.
