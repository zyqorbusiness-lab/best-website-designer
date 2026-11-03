---
name: sound-design
description: Sound design for reels and promos — which sound on which visual event, how early, how loud, how many per second — plus a scripted mix (sfx events → track, music with drop sync and ducking, voice cleanup, exact −14 LUFS). Numbers measured from Pinterest sound-design references and Sujon's reference reels.
when_to_use: "add sound effects", "sfx on every beat", "whoosh/pop/click timing", "music ducking", "loudness for Instagram", "noise removal on my voice", any edit that feels flat or silent
license: MIT (code and text). Sound files are NOT included: download them yourself under their licence (list below).
version: 1.0.0
---

# Sound design (scripted)

## 1. The rules (measured)
| visual event | sound | timing | level vs a −14 LUFS voice |
|---|---|---|---|
| cut / whip / zoom-through | whoosh 0.3–0.6 s (+ sub hit) | starts **3–5 frames before** the cut, peaks on it (`lead` 0.12–0.3 s) | −7 … −9 dB |
| text slam / object lands | low hit (impact/bass) + click | on the contact frame, tail ≤ 0.5 s | −2 … −5 dB |
| pop-in (caption, sticker, card) | pop / bubble | frame 1 of the scale-in | −8 … −11 dB |
| UI click / checkbox | click, then ding/check | on the press frame | −5 / −7 dB |
| typing | key clicks, cut to the typing length | while text appears, ≤ 4 hits/s | −8 dB |
| reveal / title | riser 1–2 s → hit | riser ends exactly on the reveal frame | −10 dB riser |
| new section | tech slide / sweep | with the move | −10 dB |
- Measured on Pinterest: sfx land 0.05–0.30 s after the visual cut in narrative edits; in music edits cuts sit within −0.17…+0.11 s of a beat.
- **Density:** narrative 1.0–1.7 hits/s · product promo **2.4–2.9** · AE-style edit promos 2.7–3.9 · Sujon's ref 3 ≈ 20 hits in 11 s.
- **Loudness:** every reference masters at −13.3…−15.4 LUFS. Target **−14 LUFS integrated, true peak ≤ −1 dBTP** (several references clip at +0.3…+4.3 dBTP — don't copy that). LRA ≤ 3 LU for music-led reels.
- Music under voice: ~10 dB of ducking while he talks (sidechain, attack 20 ms, release 300–450 ms). No voice? Duck the music 3–4 dB under the hits so each one punches through.
- Music sync: find the drop (RMS scan in 50 ms windows) and start the track so the **drop lands on the biggest visual change**.

## 2. Scripts (`scripts/`)
- `sfx_mix.py events.json sfx.wav DURATION` — events `[{"t":4.65,"sfx":"click","db":-5}, {"t":5.8,"sfx":"whoosh_fast","db":-7,"lead":0.15}, {"t":4.8,"sfx":"typing","db":-8,"dur":0.75}]`. Each sample is trimmed to its attack and levelled to the same loudness before `db` is applied, so the numbers above mean the same thing for every file.
- `master_mix.sh mix.wav DURATION --music track.mp3 --music-start 12.27 --music-db -7 --sfx sfx.wav [--voice clean.wav] [--duck-sfx]` — music trimmed from `--music-start`, faded, ducked under the voice (or under the sfx with `--duck-sfx`), 2-pass loudnorm → exact −14 LUFS, limiter at −2 dBTP (AAC encoding adds ~0.7 dB).
- `clean_voice.sh in.mp4 out.mp4` — voice cleanup: high-pass 80 Hz → noise removal (afftdn light + anlmdn) → EQ (−2.5 dB @250 Hz, +2.5 dB @3.5 kHz, +2 dB air) → de-ess → compressor 4:1 → −14 LUFS. Measured: background noise 11–20 dB lower with almost no speech damage. Optional `--nr rnn` mode needs the RNNoise model `bd.rnnn` from https://github.com/GregorR/rnnoise-models (BSD) in `audio/models/`.
- Mux: `ffmpeg -i silent.mp4 -i mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest final.mp4`

## 3. Where the sounds come from (licensed, download them)
Mixkit (free licence, commercial use OK, no attribution, don't redistribute the files): Fast whoosh transition #1490, Air woosh #1489, Cinematic whoosh fast transition #1492, Fast small sweep transition #166, Technology transition slide #3120, Air zoom vacuum #2608, Hard pop click #2364, Explainer video pops whoosh light pop #3005, Cool interface click tone #2568, Smartphone typing #1393, Short space stutter intro riser #1144, Cinematic whoosh deep impact #1143, Short bass hit #2299, Message pop alert #2354, Correct answer tone #2870, Intro text glitch #2950, Digital glitch break #2951.
Music: Mixkit "Uplifting Bass" (#726, drop at 14.37 s), "Better Times are Coming" (#173), "Digital Clouds" (#175). Save them as `sfx/<name>.mp3` with the short names used in the events (whoosh, whoosh2, whoosh_fast, sweep_small, tech_slide, zoom_vacuum, pop, pop2, click, typing, riser, impact, bass, notif, ding, glitch_text, glitch_break).
Never use unlicensed music or ripped sound packs; for brand campaigns use only the official audio they allow.

## 4. Example: the 16 s SaaS hero (46 events = 2.9 hits/s)
impact + bass at 0.00 (hook) · whoosh into line 2 · 3 pops for the sticky notes · riser + zoom_vacuum into the zoom-through, impact + bass on the music drop at 2.10 · bass when the device lands · whoosh before every camera zoom · click + pop on each click, typing for 0.75 s · whoosh_fast on the whip · tech_slide when the board fills · click + ding on "done" · whoosh_fast + bass + pop on each feature slam · impact + bass on the CTA type · pops on the CTA pills. Final: −14.2 LUFS, −2.2 dBTP, LRA 1.9.
