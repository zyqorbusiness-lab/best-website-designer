# Ref 3 research — framed talking head, effect + sfx every ~0.5 s
Reference: https://www.instagram.com/reel/DfNHu7UzIc2/ — Sanidhya (@sanidhyadecodes), caption "Grab my Most Used SFX in your DMs". Talking head shrunk into a framed card over a blurred copy, permanent "Comment X" line, an effect + sfx every ~0.5 s (glow scribbles, stickers, colour flashes, RGB glitch, stacked kinetic words).
Links checked on Nov 3, 2026: YouTube links confirmed through YouTube's own oEmbed answer (title + channel); web pages fetched (HTTP 200). Anything not confirmed is marked unverified.

## 1. Talking-head retention editing
- **How to Edit Your Talking Head Videos (Fast, Clean, Professional)** — Denz Creates
  https://www.youtube.com/watch?v=6JcrJzLOe-g
  Teaches: Editing talking-head videos fast and clean (cuts, zooms, captions, b-roll).
  In our kit: Base pass before effects: clean_voice.sh → cut_pauses.py → transcribe_words.py.

- **How to Edit Viral Talking Head Videos Like Devin Jatho (2026 Guide)** — Joseph | Video Editing
  https://www.youtube.com/watch?v=FvhgJSWQ4ps
  Teaches: Viral talking-head style like Devin Jatho (punch-ins, captions, sfx).
  In our kit: Ref 3's punch-in rhythm: 100→112 % scale on each new sentence, alternate every ~1 s.

- **How to Edit Viral Alex Hormozi Reels in Premiere Pro! (2025 Step-by-Step Guide)** — Joseph | Video Editing
  https://www.youtube.com/watch?v=pelJlYOkn7s
  Teaches: Hormozi-style reels in Premiere (bold captions, emojis, sfx per cut).
  In our kit: Our stacked kinetic words + pop/whoosh per event in templates/talking_head_v4/run_ref3.sh.

- **How To Create Captions Like Alex Hormozi & Grant Cardone - Part 2 | Creator Master Class | CapCut** — CapCut
  https://www.youtube.com/watch?v=KSdk7FbaO3Q
  Teaches: Hormozi/Cardone-style captions in CapCut.
  In our kit: CapCut route for Sujon on his phone/PC.

- **How to Make Hormozi Style Videos (captions, editing, structure)** — Riverside blog
  https://riverside.com/blog/hormozi-style-videos
  Teaches: caption styling, pacing and structure of the 'every second something changes' style.
  In our kit: the event-density rule (≈2 events/s for ref 3) in sfx_mix.py event lists.

## 2. Framed card over blurred copy
- **How To Blur A Video Background In CapCut** — Ben Claremont
  https://www.youtube.com/watch?v=284Ogep5hao
  Teaches: Blurring a video background in CapCut.
  In our kit: Our version is ffmpeg/EffectCraft: copy the clip, gblur sigma 40 + darken, put the sharp clip on top as a rounded card (run_ref3.sh does this).

- **How to Make Talking Head Videos with Background Clips Using CapCut (Step-by-Step Tutorial on PC)** — Jerad Larkin, Chicago Title
  https://www.youtube.com/watch?v=qnSlg_-vOB4
  Teaches: Talking-head videos with background clips.
  In our kit: B-roll behind/inside the card — the calmer Pinterest variant (see Pinterest topic below).


## 3. The effects themselves
- **Easy 1 Minute Animated Scribble Effect in Premiere Pro | Tutorial** — DuckTUT
  https://www.youtube.com/watch?v=Of1i4nRfWYg
  Teaches: Animated scribble effect in Premiere in 1 minute.
  In our kit: Glow scribbles: draw a stroke path, animate trim 0→100 % over 6-8 frames, add glow; place on keywords.

- **Glowing Scribble Animation in After Effects - After Effects Tutorial - Easy Method** — Avnish Parker
  https://www.youtube.com/watch?v=Y2ZZHaRgJSA
  Teaches: Glowing scribble animation in After Effects.
  In our kit: Same in EffectCraft (shape layer stroke + trim paths style + glow effect).

- **Create the RGB Split Effect in After Effects | Glitch Splitting Effect** — DuckTUT
  https://www.youtube.com/watch?v=xwgKr-CYFP4
  Teaches: RGB split / glitch in After Effects.
  In our kit: Ref 3's RGB glitch hits: offset R and B channels ±8-12 px for 2-3 frames on a hit sfx (EffectCraft channel effects; ffmpeg rgbashift as a fallback).

- **How I SOUND DESIGN For Animation (walkthrough)** — Simon Haglund Sounds
  https://www.youtube.com/watch?v=r3dmywRy3ns
  Teaches: How a sound designer builds sfx for animation (walkthrough).
  In our kit: Layering logic for sfx_mix.py: whoosh before the cut, hit on the frame, small tail; never two loud sfx on the same frame.


## 4. Pinterest (new topic, signed in)
- references/talking_head_reel_editing/STYLE.md — on Pinterest these are sold as Before/After cards; inside the edit: continuous take, B&W b-roll inserts every 2-3 s, small word-by-word captions with 1 italic-serif accent word, white text cards with one red word.
- Older related: references/instagram_reel_editing_effects/, instagram_reel_edit_captions_transitions/, sound_design_sfx_video_editing/.

## 5. Free tools + assets
- DaVinci Resolve (free version available): https://www.blackmagicdesign.com/products/davinciresolve
- CapCut desktop (free tier): https://www.capcut.com/tools/desktop-video-editor
- Mixkit free sound effects (Mixkit Free License): https://mixkit.co/free-sound-effects/
- Freesound (each sound has its own licence: CC0, CC BY or CC BY-NC — only CC0 needs no credit; skip NC for client work): https://freesound.org/help/faq/
- Sonniss GameAudioGDC archive (royalty-free, commercial use, no attribution): https://sonniss.com/gameaudiogdc

## How to use this research
1. Clean the take (clean_voice.sh, cut_pauses.py), get word timings (transcribe_words.py).
2. run_ref3.sh his_clip.mp4 → framed card over blurred copy + permanent 'Comment X' line.
3. Event list every ~0.5 s: scribble, sticker, flash, RGB hit, stacked words; one sfx per event via sfx_mix.py; master_mix.sh to −14 LUFS.
