# Ref 4 research — "Original vs Edited" editor showcase
Reference: https://www.instagram.com/reel/DfRKIG-B6FV/ — Crafoo (@crafoo9), caption "ONE CLIP. TWO DIFFERENT EXPERIENCES. Same original footage, but a completely different feel after editing…". Red radial background, raw clip card on top, edited card below, pixel-font labels, "Hire me" end card.
Links checked on Nov 3, 2026: YouTube links confirmed through YouTube's own oEmbed answer (title + channel); web pages fetched (HTTP 200). Anything not confirmed is marked unverified.

## 1. The before/after format
- **The 9 Minute Before/After Template That Gets You Hired** — Patrik Key
  https://www.youtube.com/watch?v=cNPgXC9o8Gw
  Teaches: A before/after template built to get editing clients (Patrik Key).
  In our kit: Exactly ref 4's purpose: our one-command version is templates/before_after_v4/run_ref4.sh RAW.mp4 EDITED.mp4.

- **How to Create a Before and After Effect in CapCut** — Michael Brig
  https://www.youtube.com/watch?v=mkRjoEZRoiI
  Teaches: Before/after effect in CapCut.
  In our kit: Phone route: two layers, mask/split, labels — for Sujon when he isn't at the kit.

- **How to Make a SPLIT SCREEN Effect in Davinci Resolve** — Technically Trent
  https://www.youtube.com/watch?v=Qse_a_1EvKA
  Teaches: Split-screen effect in DaVinci Resolve.
  In our kit: Free desktop route for the stacked/side-by-side layout (Resolve Transform: zoom 0.5, position per card).


## 2. Using it to get hired
- **you're gonna build your video editing demo reel in 7 days** — Colleen Edits
  https://www.youtube.com/watch?v=j7JutjVqxww
  Teaches: Building a video-editing demo reel in 7 days (Colleen Edits).
  In our kit: How to order clips: best edit first, 1 idea per clip, end on contact — same as ref 4's 'Hire me' card.

- **Video Editor Portfolio Guide with Real Examples** — Vimeo blog
  https://vimeo.com/blog/post/video-editor-portfolio
  Teaches: what a strong editor portfolio shows (variety, short reels, credits).
  In our kit: what to put in the end card + caption ('Edited by ZYQOR — DM to hire').

## 3. The edited half (what makes 'Edited' look edited)
- The edited card is a ref 3 style edit — see ref3_RESEARCH.md (scribbles, RGB hits, punch-ins, sfx every beat) and run_ref3.sh.
- **How I SOUND DESIGN For Animation (walkthrough)** — Simon Haglund Sounds
  https://www.youtube.com/watch?v=r3dmywRy3ns
  Teaches: Sound design walkthrough for animation.
  In our kit: Ref 4's whole pitch is 'pacing, sound design, transitions': the edited card needs its own sfx track; the raw card stays dry.


## 4. Pixel-font labels
- **Press Start 2P** (SIL Open Font License — free, commercial OK, can't sell the font itself)
  https://raw.githubusercontent.com/google/fonts/main/ofl/pressstart2p/OFL.txt
  In our kit: the 'Original' / 'Edited' labels (white on red, 28-36 px at 1080 width).
- OFL explained: https://openfontlicense.org/

## 5. Pinterest (new topic, signed in)
- references/before_after_video_editing_showcase/STYLE.md — the most common layout is side-by-side and overlapping: Before 28 % width at left, After 52 % width overlapping it (pixel rects measured), white + 2 orange blobs or blurred dark copy, optional timeline screenshot for proof, 'Hire me' ending.

## 6. Free tools
- DaVinci Resolve free: https://www.blackmagicdesign.com/products/davinciresolve
- CapCut desktop: https://www.capcut.com/tools/desktop-video-editor
- Blender's Video Sequencer (free, can do the two-card layout too): - **Blender Video Sequencer 101** — Blackout Creatively
  https://www.youtube.com/watch?v=gSFAxb60ENk
  Teaches: Blender Video Sequencer 101.
  In our kit: Optional: two strips with Transform, a colour strip background; our kit uses EffectCraft + ffmpeg instead.

## How to use this research
1. Edit the clip with run_ref3.sh (edited version).
2. run_ref4.sh raw.mp4 edited.mp4 → stacked red layout like ref 4 (or change the card rects in build_ref4.py to the Pinterest side-by-side numbers).
3. Labels in Press Start 2P; end on 'Edited by ZYQOR / DM to hire me'.
