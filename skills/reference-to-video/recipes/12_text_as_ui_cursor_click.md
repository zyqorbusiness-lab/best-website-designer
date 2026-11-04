# Recipe 12 - text-as-UI: a word becomes a button, a cursor clicks it (refs 3, 8, 1, 2, 11, 12)

Seen (Nov 4 2026 breakdown, eyeballed from 3 fps sheets + native-fps bursts): ref 3 (Higgsfield promo, 16:9) 1.0-3.0 s: the word "Button" in a sentence turns into a real blue pill, a cursor-hand arrow clicks it; 3.3-7.7 s the pill morphs every ~0.33 s into brand-style buttons on flat coloured backgrounds; 8.3-9.7 s giant black word with a blinking text-cursor bar. Ref 8 (4:3 UI concept, "made by a human"): cursor ripple on a bookmark icon (9.3-9.7 s) -> toggle slides on -> button press -> 3D bookmark; notification cards fly in with 3D tilt (12.7-14.7 s). Ref 1/2 (bookmark click on "save this"), ref 11 (macOS folder "Trips" clicked, photos burst out 17-18.7 s), ref 12 (pink-white pill notifications + cursor, 1-2 s).

## Measured / eyeballed numbers
- word -> pill cross-fade: 3 frames (ref 3 burst 1.70-1.77 s) [eyeballed]
- button morph cadence in the run: one new button every 10 frames at 30 fps = 0.33 s [measured: 18 hard cuts in 29 s, 15 of them in the first 10 s]
- cursor: slow glide with ONE overshoot, click = scale 0.9 -> 1.05 -> 1 + ring ripple (kit already has `cursor()` + ring.png) [eyeballed]

## Build (EffectCraft, kit zq_lib.jsx)
1. Background: flat brand-coloured plate per button (use warm palette from zq_config; the references' blue pills are NOT used - pick amber/cream/black/red).
2. Sentence: `captionLine()` with the click-word as its own token; at the click frame replace that token with `card()` (rounded pill, soft shadow, label in Inter-Bold, a warm gradient preset).
3. Cursor: `cursor(comp, 'assets/cursor.png', 'assets/ring.png', path, taps, end)`; path = 3-5 points, taps = click times; push the pill scale 0.9 -> 1.05 -> 1 on each tap.
4. Run of buttons: 6-10 pills, each 8-12 frames, hard cut, background colour changes per pill, whoosh_soft on every 2nd pill, ding on the last.
5. Notification stack (ref 8): 3 cards enter from the top with 3D tilt (`card(..., {tilt:true})`), 3-frame stagger, settle with overshoot 103 %.
6. Typing bar: a 6x70 px rect blinking every 15 frames next to the last character; letters blur-in 8 -> 0 px over 4 frames each.

## Python/ffmpeg alternative
`ui_screen_v5/` (crisp UI built in code) for a full app/chat screen; fx_extrude_text.py is NOT used here (flat UI text only).

## Gotchas
Clicks need a sound that is audible (see SOUND_DESIGN_v5.5.md: ours were 45 dB under the voice). Keep the cursor path imperfect (jitter 2-3 px, 1 overshoot). No third-party logos: invent neutral brand-like buttons.

## Status
Recipe only: the pieces (card, cursor, captionLine) exist in zq_lib.jsx and were used in v5.x demos; the 'word turns into pill' cross-fade and the button run were NOT rendered end to end in v5.5.
