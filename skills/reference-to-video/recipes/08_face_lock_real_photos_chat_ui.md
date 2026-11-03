# Recipe 08 — How-to reel with REAL photo faces + live chat UI (face-lock v4, Nov 3 2026)

Topic: "AI photo ban gayi, lekin chehra tumhara lag hi nahi raha?" — Hindi VO (Bunty), 24 s, 7 shots. QC F1-F13 PASS, 15.4 MB.

## Refs (60 fps breakdowns)
- ref8 (kit example) for caption system, pacing, push transitions.
- Pinterest face-consistency edit reel https://www.pinterest.com/pin/1019924646871992916/ (original
  https://www.instagram.com/reel/DOnxR-uCYZ2/): reference portrait -> "Prompt N" paper card -> same-face result, hard cuts
  every ~0.5 s, warm palette. TAKE the logic + real faces; SKIP static stills, tiny prompt walls, pink/blue + lilac frames.

## Shot plan (VO word times drive everything)
1. 0-3.0 Hook: reference polaroid ON screen at frame 0, "AI result" polaroid of a different person pops on "lekin",
   red "ye main nahi" chip on "tumhara" (+ low hit). Warm crumpled-paper plate (Pinterest bg frame, toned).
2. 3.0-9.0 Chat card (no phone frame): greeting -> photo attached on "reference photo" -> cursor tap send on "do." ->
   slow 104 % zoom -> prompt typed in the input bar word by word on the VO -> send. Typing sfx per state.
3. 9.0-10.55 Results fan on sand paper: reference small top-left, 3 same-face results pop on "kapde / background",
   "same face" chip + ding.
4. 10.55-15.2 Custom Instructions card: empty -> filled -> cursor taps Save on "save" -> "NOT A FACE-LOCK" stamp on
   "face-lock" (impact).
5. 15.2-19.4 Same chat: wrong-face result -> red badge on "face" -> correction typed -> "Creating image…" -> fixed
   same-face result with green badge on "correction".
6. 19.4-21.45 Pinterest b-roll (hand + phone), captions only.
7. 21.45-24 SAVE (per-letter cascade) + "kar lo!" italic + bookmark icon, riser into it, handle in the safe area.

## Build notes
- VO: reused the approved take, pauses > 0.2 s cut to 0.16 s (0.30 s kept before the CTA) -> 2.2 s tighter; old word
  times remapped through the cut list (checked against speech-to-text anchors).
- Cards: HTML at 2x through headless Chrome (`--screenshot`, `--default-background-color=00000000`), trimmed to alpha.
- extra_jsx helpers: `zqState` (state layers at word times, motion blur off), `zqRig` (zoom/float null), `zqPlate`
  (startTime fix, blur/scale), `zqCardIn` (present-at-cut card), `zqPush` (additive position expression push),
  `zqDust` (Pinterest dust overlay, Screen 26 %).
- Export: ec_reel master (CRF 19) was 18.6 MB -> 2-pass 4.9 Mb/s H.264 = 15.4 MB, QC re-run on the final file.
