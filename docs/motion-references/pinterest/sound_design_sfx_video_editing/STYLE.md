# STYLE — "sound design sfx video editing" (Pinterest, signed in, 2026-11-03)

16 video pins; ~half are on-topic: timeline breakdowns (01 yeyofilmss "The magic of sound effects", 02 mhdi00o "Timeline Sound Effects"), foley-stack edit (03 dsousaedits), SFX-pack previews (04/06/10 viamasivideos "Comment SFX1"), kinetic-text-to-music (13). The rest are audio-visualiser / TouchDesigner art (07, 08, 09, 11, 12, 15, 16) — look only, no sound-design lesson.
Measured on 7 clips with audio: `audio-proof.mjs inspect` (LUFS, true peak, LRA, silences) + spectral-flux onset scan (hits/s, median gap) + onset vs scene-cut offset. measure.json has the numbers.

## Measured
| pin | what it is | LUFS | true peak | LRA | hits/s | median gap |
|---|---|---|---|---|---|---|
| 01 | Premiere timeline, 12 audio tracks of stacked SFX under a short film | −13.7 | +0.5 dBTP | 7.6 | 1.0 | 0.48 s |
| 02 | timeline, 5–6 SFX layers with constant-power crossfades | −13.3 | +1.8 dBTP | 11.7 | 1.7 | 0.35 s |
| 03 | foley stack per on-screen action (phone typing, mechanical clicks) | −17.7 | +3.1 dBTP | 5.7 | 4.1 | 0.19 s |
| 04 | SFX pack preview (meme sfx, one per card) | −13.9 | +0.9 | 7.1 | 2.0 | 0.42 s |
| 06 | SFX pack preview, gaps of 0.7–1.0 s silence between sfx | −14.5 | +0.3 | 2.8 | 0.7 | 1.42 s |
| 10 | SFX pack preview | −14.0 | −1.9 | 0.8 | 2.0 | 0.21 s |
| 13 | kinetic text cut to a beat | −14.3 | −1.3 | 1.3 | 3.0 | 0.28 s |

- Everything is mastered around **−14 LUFS** (−13.3…−14.5); several pins clip (true peak > 0 dBTP) — we do better with a −1 dBTP limiter.
- Onset vs cut: SFX hits land **0.05–0.30 s after** the visual cut on the timeline pins (01: +0.08/+0.30; 02: +0.12/+0.29/+0.20) — i.e. the hit is on the cut and its tail/reverb carries 3–9 frames past; whooshes start before.
- Density: narrative SFX design ≈ 1–1.7 hits/s with room (LRA 7–12 LU = real dynamics, quiet beds and loud hits). Foley-stack / meme edits run 2–4 hits/s.
- Names the pack previews show on screen (04/06/10): "A Few Moments Later", "Boxing Bell", "Crickets", "Downer Noise", "Popping Bubble", "Whistle Slide", "Notification", "Audience Cheering", "Blade Swoosh", "Cartoon Running", "Check Mark", "Ding", "Huh?". Each demo is a 0.5–1.5 s one-shot.

## Event → sound (what these pins teach; placements inferred from the timeline layouts + onset/cut offsets)
| visual event | sound | placement |
|---|---|---|
| cut / whip | whoosh (0.3–0.6 s) | starts 3–5 frames before the cut, peak on the cut |
| object lands / text slams | low hit / boom + short click on top | on the frame of contact; tail ≤0.5 s |
| UI click / checkmark | click, "ding", check-mark | on the frame the cursor presses |
| pop-in of a card/emoji | bubble pop | on frame 1 of the scale-in |
| reveal / build-up | riser 1–2 s | ends exactly on the reveal frame, then hit |
| joke / pause beat | crickets, "huh?", downer, record scratch | over the held frame after the line |
| scene start | ambience/room tone bed, −30…−24 dB under voice | crossfade 6–12 frames (constant power) |

## Do this (rules)
1. Layer, don't single-shot: 3–6 SFX tracks (whoosh / hit / foley / ambience / UI / riser), each event built from 2–3 layers. — 01 https://www.pinterest.com/pin/1027454102536837052/ , 02 https://www.pinterest.com/pin/714383559673250251/
2. Whoosh leads the cut by 3–5 frames; the hit sits on the cut frame; reverb tail may run 3–9 frames over. — 01, 02
3. Constant-power crossfades (6–12 frames) between ambience beds at every scene change. — 02
4. Foley every on-screen action in a tutorial/UI reel: typing, clicks, mechanical ticks, ~4 hits/s max, each ≤0.2 s. — 03 https://www.pinterest.com/pin/1133147956255443620/
5. Meme/punctuation SFX only on a held beat (0.5–1.0 s of space around it). — 04 https://www.pinterest.com/pin/936959897489127391/ , 06 https://www.pinterest.com/pin/936959897490431063/ , 10 https://www.pinterest.com/pin/936959897490930138/
6. Keep dynamics: LRA 7–12 LU for story edits (quiet bed, loud hits); flatten to LRA ≤3 only for music-led text reels (13 https://www.pinterest.com/pin/774478467210938065/).
7. Master to −14 LUFS integrated, limiter at −1 dBTP (the refs clip at +0.3…+3.1 dBTP — don't copy that).
8. Density budget: 1–1.7 hits/s narrative, 2–3 hits/s promo, ≤4 hits/s foley montage.
