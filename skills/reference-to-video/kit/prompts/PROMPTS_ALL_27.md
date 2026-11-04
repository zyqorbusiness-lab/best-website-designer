# Zyqor Motion Kit v5.3 — ALL 27 PROMPTS (restored)

Numbers 01-14 = the starter-kit style prompts (colour examples recoloured: no purple/cyan). 15-24 = the v4 pipeline (code in `legacy_v4/`, assets in the v5.1 zip; see PROMPT 15 for paths). 25-27 = v5 rules. **v5 rules win**: paste PROMPT 25 above any older prompt. PROMPT 22 = edit raw footage (clean voice, word timings, cut pauses, captions, sfx, music, -14 LUFS, 1080x1920).
Prompts 01-14 are from the "Motion Graphics with Claude Code" starter kit (HyperFrames); 17-24 mention Blender sprites only for a real 3D object plate - text is always EffectCraft-style.


Every prompt from the PDF, same numbers. Copy from here, not from the PDF: PDFs break quotes and line breaks.

Before a project: copy the kit's fonts folder into it (and sfx for PROMPT 11). Every prompt here was run and its output checked before it went in the guide.

## PROMPT 01 · Setup

Paste once, in any folder. Restart Claude Code when it's done.

```
Set up this computer so I can make videos with HyperFrames. First work out if I'm on a Mac or on Windows, then:

1. Check I have Node.js 22 or newer. If not, install it (Homebrew on Mac, winget on Windows).
2. Check I have FFmpeg. If not, install it the same way.
3. Check I have whisper-cpp, which turns speech into timed text. If not, install it (Homebrew on Mac; on Windows use the latest release from github.com/ggml-org/whisper.cpp and add it to PATH).
4. Install the HyperFrames skills for Claude Code with npx hyperframes skills.
5. Run npx hyperframes doctor and read the result.

Ignore anything doctor calls optional (Docker, Kokoro, MusicGen). If something needs my password or admin rights, stop and give me the exact command to run myself.

When you're done, tell me in plain words: what was already there, what you installed, and anything I still need to do.
```

## PROMPT 02 · Your first render

New empty folder, start Claude Code there, paste.

```
Make me a 6-second video with HyperFrames in this folder, 1920x1080 at 30 fps.

One white frosted-glass card in the middle of a soft warm peach-to-sand gradient background. On the card: a small grey label that says MY FIRST RENDER, a big number that counts up from 0 to 100, and a green pill that says Made with Claude Code.

The card rises in at the start. The number counts up over 2 seconds. The green pill pops in at 4 seconds.

Use the Inter font. Render it to renders/first.mp4 and tell me where the file is.
```

## PROMPT 03 · The 10 moves demo

New empty folder. Gives you a 14-second video of every move on page 7.

```
Make a 14-second demo video with HyperFrames in this folder, 1080x1920 at 30 fps, that shows 10 animation moves one after another, about 1.3 seconds each. Each move animates a simple white card on a dark background, with the name of the move written small above it. In this order:

1. Rise: the card fades in while moving up 40px.
2. Pop: the card scales from 0.6 to 1 with a little overshoot.
3. Count-up: a number rolls from 0 to 500.
4. Checklist tick: three lines get a green tick, one after the other.
5. Typewriter: a sentence types itself letter by letter.
6. Slide-in: the card slides in from the right.
7. Blur-in: the card goes from blurry to sharp.
8. Punch-in: the whole frame zooms in 15% fast, then holds.
9. Reframe: a full-screen panel shrinks into a rounded card in the bottom half while a new card appears on top.
10. Bar fill: a progress bar fills from 0 to 100%.

Render to renders/moves.mp4.
```

## PROMPT 04 · Style · Kinetic Type

Paste under PROMPT 08, 09, 10 or 11. Copy the kit's fonts folder into your project first.

```
STYLE: Kinetic Type
- The text is the whole video. No cards, no boxes.
- Font: Archivo Black (fonts/ArchivoBlack-400.woff2), all caps, huge. The main word fills most of the width.
- Colours: black background, white text, one accent colour #c6ff3d for the most important word on each screen.
- Motion: words slam in one by one, fast and snappy (power4.out, 0.25 to 0.4 seconds). Mix the moves: slide in from the side, stretch from squashed to full height, split the letters apart and back together. Each screen exits fast before the next one hits.
- Cut the screens on the rhythm of the words, like a beat.
```

## PROMPT 05 · Style · Liquid Glass

Paste under PROMPT 08, 09, 10 or 11. Copy the kit's fonts folder into your project first.

```
STYLE: Liquid Glass
- Frosted glass cards: white at about 80% opacity, 30px background blur, thin white border, big rounded corners (32px), soft shadow.
- Background: soft light gradient with two or three blurred colour blobs (pale sand, peach, soft coral) drifting slowly.
- Font: Inter (fonts/Inter-700.woff2 for headings, fonts/Inter-400.woff2 for small text). Dark grey text #1d1d1f, small uppercase grey labels above headings.
- Accent: green #34c759, only for ticks and checks.
- Motion: calm and smooth. Cards rise 30px and fade in with power3.out over 0.6 seconds, scaling up slightly from 0.96. Text arrives piece by piece. Nothing bounces.
```

## PROMPT 06 · Style · Editorial Grain

Paste under PROMPT 08, 09, 10 or 11. Copy the kit's fonts folder into your project first.

```
STYLE: Editorial Grain
- It should look like a printed magazine page, not a screen.
- Background: warm paper colour #efe8dc with visible film grain over everything (an animated SVG noise layer at about 12% opacity).
- Font: Instrument Serif (fonts/InstrumentSerif-400.woff2 and fonts/InstrumentSerif-400-italic.woff2) for headlines, large, mixing upright and italic words. Small labels in Inter (fonts/Inter-400.woff2), uppercase, letter-spaced.
- Colours: ink black #1a1a1a and one deep red accent #c2412d.
- Shapes: cut-out paper rectangles behind key words, slightly rotated (1 to 3 degrees), thin rules, and small page numbers in the corners.
- Motion: unhurried and a bit imperfect. Staggered timings that are not perfectly even, gentle slides and wipes, no bounces.
```

## PROMPT 07 · Style · Pop Bold

Paste under PROMPT 08, 09, 10 or 11. Copy the kit's fonts folder into your project first.

```
STYLE: Pop Bold
- Loud, playful, flat colour. No gradients, no glass.
- Font: Bricolage Grotesque ExtraBold (fonts/BricolageGrotesque-800.woff2), big and chunky.
- Colours: flat blocks of #c6ff3d (lime), #ff7a1a (orange), #ff4f6d (coral) and #111111, with 4px black outlines and hard 8px offset shadows with no blur.
- Extras: rotating star and circle stickers, little arrows, a few simple shapes drawn in CSS.
- Motion: bouncy and springy. Things pop in with back.out(2.5), overshoot, wobble a little, squash and stretch. Stickers spin slowly the whole time.
```

## PROMPT 08 · Text-only video

Swap the script for yours. Add a style block underneath, or don't. Copy the kit's fonts folder into your project first.

```
Make a 15-second vertical video (1080x1920, 30 fps) with HyperFrames in this folder, made only of animated text. No footage.

Script:
Most product videos lose people in 2 seconds. Here's how to keep them. Show the result first. Cut every pause. One idea on screen at a time. Then tell them what to do next.

Use my exact words. Don't rewrite or shorten the script. Show one sentence per screen, big enough to read on a phone. If a sentence is long, wrap it over two or three lines on the same screen. Each screen stays up long enough to read. Keep all text inside the middle 80% of the width so phones don't crop it. If there is a STYLE section below, follow it. If not, use clean white frosted cards on a soft light gradient, with the Inter font.

Render to renders/text.mp4.
```

## PROMPT 09 · Product video

Swap Tally and the three features for your product, and give it your real numbers. Drop a product.png in the folder if you have one.

```
Make a 12-second product launch video with HyperFrames in this folder, 1920x1080 at 30 fps.

The product is Tally, an app that shows what your online shop really earns after fees. If there is a product.png in this folder, use it as the hero image. If not, build the product in HTML and CSS (an app screen, a logo, or a phone with the app on it).

Structure:
1. 0 to 2 seconds: the logo or product name is revealed.
2. 2 to 9 seconds: three feature moments, one at a time. Each one shows the product doing the thing, not just a sentence. Features: connects to your store in one click / shows profit after fees, ads and refunds / sends you one number every morning.
3. 9 to 12 seconds: end card with the product name, one short line and a call to action: Join the waitlist.

If there is a STYLE section below, follow it. If not, use clean white frosted cards on a soft light gradient.

Render to renders/product.mp4.
```

## PROMPT 10 · SaaS promo

Put screenshots of your app in a folder called screenshots. Swap Tally and the one-line description for yours.

```
You're an amazing motion graphics designer. Make a 1-minute promo video for my SaaS with HyperFrames, in this folder, 1920x1080 at 30 fps.

The product is Tally, an app that shows online shops what they really earn after fees, ads and refunds. The screenshots folder has real screens from the app.

1. Look at every screenshot first and work out what each one shows.
2. Build the video around them. Open with a short hook, then show each screen and zoom into the part that matters (the number, the chart, the button) with a short line of text that says what it does for the customer.
3. Use the screenshots as they are. Don't redraw them.
4. Kinetic style: fast zooms and pans into the screenshots, big bold words between the screens, cuts on a steady beat.
5. End on the logo, one short line and a call to action: Start your free trial.

Render to renders/promo.mp4.
```

## PROMPT 11 · Motion graphics on your own video

Put your video in the folder as clip.mp4 (or use the practice clip from the kit). Copy the fonts folder in too.

```
You're a top motion graphics designer. Add motion graphics to my video clip.mp4 with HyperFrames, in this folder.

1. Really analyse the video first. Transcribe it with npx hyperframes transcribe, check the word timings against the audio, and work out what the video is about and which moments matter most. If whisper isn't installed, stop and tell me to run the setup prompt.
2. Keep my video exactly as it is: same size, frame rate, audio and cut. You only add graphics on top.
3. At each important moment, add an animation made for what I'm saying right then: a number becomes a counter, a list becomes a checklist, a before and after becomes a comparison. Each one starts on the exact word.
4. Keep one style across the whole video, so it looks designed, not random.
5. Nothing in the first 3 seconds. That's the hook.
6. Keep graphics off my face, out of the bottom third where captions go, and away from the left and right 10% of the frame.

If there is a STYLE section below, follow it. If not, use clean white frosted cards.

Render to renders/with-cards.mp4.
```

## PROMPT 12 · Fix one spot

Run after PROMPT 11. Put your screenshots in a folder called screenshots and change the sentence to the words you actually say.

```
Now one spot. When I say Sales went from 40 a week to over 90, show the 5 screenshots in the screenshots folder popping up one after another, in order. Cut them in a way that matches the video and keep them in sync with my voice. Keep everything else exactly the same and render again to renders/with-cards.mp4.
```

## PROMPT 13 · Sound effects

Copy the sfx folder from the kit into your project first. Run after PROMPT 11.

```
Add sound effects to this video using the files in the sfx folder. A tick when each list item or check appears, the counter sound while a number rolls, and the chime on the last card. No sound when a card slides in or leaves, and no whooshes. Keep the effects quiet under my voice. Render again to renders/with-cards.mp4.
```

## PROMPT 14 · Transparent export

Run in any finished project. For putting your animation over footage in Premiere or After Effects.

```
Remove the background so only the card is visible, with everything around it transparent. Then export a transparent version I can put over my own footage in Premiere or After Effects: renders/card.mov (ProRes 4444 with alpha) and a PNG sequence in renders/card-png.
```

## Change anything (page 6)

Say these in the same Claude Code session, after a render. Each one was tested on the PROMPT 02 video.

- Change the card from frosted glass to a solid amber-to-coral gradient card with white text. Keep everything else the same and render again to renders/first.mp4.
- Use my brand colours: background #111111, card #ff5a1f, text white. Keep everything else the same and render again to renders/first.mp4.
- Switch the number to a serif font (Instrument Serif from Google Fonts) and make it 30% bigger. Keep everything else the same and render again to renders/first.mp4.
- Make every animation bouncier, with a bit of overshoot. Keep everything else the same and render again to renders/first.mp4.
- Make the green pill appear at 2 seconds instead of 4. Keep everything else the same and render again to renders/first.mp4.
- Move the card to the top-left corner and make it 20% smaller. Keep everything else the same and render again to renders/first.mp4.

## Export cheat sheet (page 18)

You can just ask Claude (render it in 4K at 60 fps), or run these yourself in the project folder:

```
npx hyperframes render . --fps 60 -o renders/video-60fps.mp4
npx hyperframes render . --resolution 4k -o renders/video-4k.mp4
npx hyperframes render . --resolution 4k --fps 120 -o renders/video-4k-120.mp4
npx hyperframes render . --format mov -o renders/video.mov
npx hyperframes render . --format png-sequence -o renders/frames
npx hyperframes render . --fps 24 -o renders/video-24fps.mp4
npx hyperframes render . --crf 23 -o renders/smaller.mp4
```

MOV and PNG are only transparent if the background is transparent. Run PROMPT 14 first.

Made by Damiano · instagram.com/damianodesu

---------------------------------------------------------------
# Zyqor Motion Kit v4 · new prompts (added Nov 3 2026)

These continue the numbering. They drive the Zyqor kit (folder `zyqor-kit/`) with Claude Code or any AI coding agent: Blender for real 3D, code for captions/numbers/sound, EffectCraft (free After Effects alternative) for compositing. The 6 reference breakdowns are in `references/`, one recipe each in `recipes/`.

Note: the scripts find their own folder, fonts and tools by themselves (set `BLENDER`, `EFFECTCRAFT_CLI`, `PYTHON` if those aren't on your PATH). The only fixed paths left are the `var HERE = ...` lines in two .jsx files — PROMPT 15 fixes them.

## PROMPT 15 · Install the Zyqor kit

```
Set up this computer to run the Zyqor Motion Kit in the folder zyqor-kit. Work out if I'm on Windows or Mac, then:
1. Check/install Blender 4.2 LTS (blender.org), FFmpeg, Python 3.11 with numpy, Pillow and faster-whisper, Node.js 20+, and yt-dlp.
2. Check/install EffectCraft (getartcraft.com/apps/effectcraft) and find effectcraft-cli (Windows: %LOCALAPPDATA%\Programs\ArtCraft\EffectCraft\effectcraft-cli.exe).
3. Install the fonts in zyqor-kit/blender/fonts.
4. Run zyqor-kit/get_audio.sh (or do the same downloads in PowerShell) to fetch the licensed Mixkit sound effects and music into sfx_v2/ and music/.
5. Set the environment variables BLENDER, EFFECTCRAFT_CLI and PYTHON to the real programs if they are not on PATH. Search the .jsx files in zyqor-kit for "CHANGE_ME" and change those `var HERE` lines to the real template folder on this computer. Show me the list of changes.
6. Test: render ONE frame with  blender -b --factory-startup -P zyqor-kit/blender/text3d.py -- --still test.png  and one EffectCraft frame with  effectcraft-cli render-frame. Tell me how many seconds one Blender frame took.
If anything needs admin rights, stop and give me the exact command.
```

## PROMPT 16 · Read any reference

```
Here is a reference video: <paste an Instagram/TikTok/YouTube/Pinterest link or a file path>.
Download it with yt-dlp into zyqor-kit/projects_v4/<short-name>/, then run  python3 zyqor-kit/analyze_ref.py <video> <that folder>.
Open strip.jpg and LOOK at it. Then write me a breakdown in the same format as references/ref1_*/README.md: shot by shot with times, camera, transitions, effects, text and fonts, colour hexes, where every sound effect lands, pacing. End with which of the 6 recipes is closest and what is different.
Don't copy the creator's footage, music, characters or logos into anything we make.
```

## PROMPT 17 · Ref 1 style — soft-3D explainer

```
Make a 20-25 second soft-3D explainer in the style of references/ref1_soft3d_explainer_DfJvupgpmeq (read its README and recipes/01_soft3d_explainer.md first).
Topic: <your topic>. CTA: Comment <KEYWORD>.
1. Write the captions (2 lines max; *word* = blue keyword, _word_ = coral italic) and beats into the CAPTIONS/BEATS lists in zyqor-kit/templates/explainer_soft3d_v4/build_ref1.py. Every number must be true or clearly an example.
2. Use my mascot images (avatar.png, avatar_wow.png, avatar_wink.png) from <folder>.
3. Render the Blender sprites with sprites_v4.py (test one still first and tell me the seconds per frame), then run build_ref1.py, the EffectCraft comp, sfx_mix.py and master_mix.sh, exactly as build_all_v4.sh ref1 does.
4. Show me a 1-fps contact sheet and a side-by-side with the reference's contact sheet before you call it done. Loudness -14 LUFS, true peak -1 dBTP or lower.
```

## PROMPT 18 · Ref 2 style — SaaS promo, tilted 3D screen

```
Make a 15-20 second SaaS promo in the style of references/ref2_saas_plugin_promo_DfPSHbysI7k (read its README and recipes/02_saas_tilted_screen.md).
Product: <site URL or app>. Capture its screens in dark mode at 2160x1350 like templates/saas_blender_hero_v4/capture_dark.js, write the click points into screen_timeline.json, put my hook image in assets/hook.png.
Run hero_v4.py in Blender (one test still first; 2 processes, half the frames each), make_overlays.py, comp_v4.jsx in EffectCraft, then the sound from audio_sfx_events_v4.json with the music drop on the device fly-in.
Hook: huge ink/off-white heavy text, glow OFF, one warm gradient keyword. Feature words small, italic, seen straight on. End card: ONE element (a chat bubble with "Comment <KEYWORD>"). Label it a concept if the product isn't real.
```

## PROMPT 19 · Ref 3 style — talking head in a framed card

```
Here is my talking-head clip: <file>. Edit it in the style of references/ref3_talking_head_sfx_DfNHu7UzIc2 with
  zyqor-kit/templates/talking_head_v4/run_ref3.sh <file> out.mp4 --keyword <KEYWORD> --hook "<2-3 hook words>"
If my face isn't centred, measure where it is and pass --face X,Y. Then show me out_contact.jpg: every 0.5 s should look different (flash, sticker, punch-in, kinetic word or transition). Fix any caption that is wrong in the transcript and re-run.
```

## PROMPT 20 · Ref 4 style — Original vs Edited

```
Make an "Original vs Edited" showcase like references/ref4_original_vs_edited_DfRKIG-B6FV.
Raw clip: <raw.mp4>. My edit of the same clip: <edited.mp4> (if I don't have one, make it first with PROMPT 19).
Run  zyqor-kit/templates/before_after_v4/run_ref4.sh raw.mp4 edited.mp4 out.mp4 --raw-len 8 --name <MY NAME> --handle <@handle>
Check: the raw clip plays in the top card first, then the edit in the bottom card, then the "DM to / Edited by / Hire me" end card. Use only my own stickers and name.
```

## PROMPT 21 · Ref 5 style — After Effects SaaS card promo

```
Make an 18-second card promo like references/ref5_ae_saas_cards_DfRNLU3N22c.
Edit the SERVICES list in zyqor-kit/templates/saas_cards_v4/build_ref5.py with my real services: <list>. Render the 3D icon tiles with sprites_v4.py (--sprite tile --color --glyph), run build_ref5.py, the EffectCraft comp comp_ref5.jsx, then sfx + music like build_all_v4.sh ref5.
Must have: glossy cards as 3D layers on a tilted grid with a slow diagonal camera drift, a light-streak transition on black, a selection box around one headline word, radial rays + a 3D toggle at the end. No made-up numbers.
```

## PROMPT 22 · Edit my raw footage (any clip)

```
Edit this raw clip: <file>. Steps, in this order, using zyqor-kit:
1. clean_voice.sh (de-noise, EQ, compress)  2. transcribe_words.py (word timings)  3. cut_pauses.py (cut every pause over 0.4 s, punch-in on cuts)
4. captions word by word (2 lines max, keywords in colour)  5. one visual effect + one sound effect every 0.5-1 s from sfx_v2/ (whoosh on moves, pop on pop-ins, click on UI, hit on big words)
6. music from music/ ducked under the voice  7. master_mix.sh to -14 LUFS / -1 dBTP  8. export 1080x1920 30 fps H.264, under 15 MB for WhatsApp.
Show me the contact sheet and the loudness numbers.
```

## PROMPT 23 · Any topic, any reference

```
Topic: <topic>. Reference: <link or file> (no reference yet? I send the topic to Tab on WhatsApp and Tab sends back Pinterest pins + STYLE.md; I paste the pin link here).
Run  python3 zyqor-kit/make_video.py "<topic>" --ref <link-or-file>.
Read projects_v4/<topic>/style.json, strip.jpg and plan.md, tell me which recipe it picked and why, then write the captions/beats and build it with that recipe's prompt (17-21 or 24). Look at the strip yourself: the numbers miss style.
```

## PROMPT 24 · Ref 6 style — gaming "Editing Timeline" reveal

```
Make a gaming-style "Editing Timeline" reveal like references/ref6_gaming_timeline_reveal_DfRIa9ziZIy (read its README and recipes/06_gaming_timeline_reveal.md).
Inputs: my edited clip <edited.mp4>, a screen recording of my editor's timeline playing the same edit <timeline.mp4>, a background image <bg.jpg>, my avatar <avatar.png>.
Build a 3-panel 1080x1920 comp, starting from zyqor-kit/templates/before_after_v4/build_ref4.py: blurred background; top banner "EDITING / TIMELINE" (chunky game font, yellow + ink, black stroke, green chalkboard strip); middle = the edit in a rounded card; a "DM FOR PAID EDIT" strip with my avatar; bottom = the timeline recording in sync.
Captions: 1-2 words at a time from the word timings, lime/yellow fill with a thick black stroke. Big 3D bubble words with Blender text3d.py --anim slam on 3-4 hype words, with motion blur. Whoosh on each big word, pop on captions. Master -14 LUFS / -1 dBTP. Show me a 1-fps contact sheet.
```


---------------------------------------------------------------
# v5 prompts (Nov 3 2026) — paste ABOVE any older prompt; v5 rules win

## PROMPT 25 · house rules (always first) — v5.3
Follow Zyqor Motion Kit v5.3 hard rules: 0) Honest: concepts are labelled, no fake clients/reviews/results, real faces only with permission. 1) Pinterest first for EVERYTHING (references, music, sfx, b-roll, subject, effects, background); use the Pinterest files directly with pin_download.py and log every pin URL. 2) Study the reference at 60 fps, frame by frame (breakdowns/<ref> or tools/ref_breakdown.py) and fill effects, animation, text, colour, background, b-roll per second. 3) Make it unique: change at least 3 things from the reference and write them down. 4) All text and effects EffectCraft-style in code (tools/ec_reel.py + zq_lib.jsx), never Blender for text. 5) Glow OFF (max one subtle glow on one object). 6) Captions ref8 style: 1-3 big words (>= 90 px), voice-synced, ink or off-white with soft shadow, ONE gradient keyword + ONE italic serif accent word. 7) NO purple/violet/blue or cyan neon, no AI gradients, no glow-on-black. 8) Premium textured backgrounds (paper/studio/photo plate with grain), never flat black. 9) Premium licensed sfx at real moments only (1-3 per second). 10) 1080x1920 30 fps, captions inside the 90 % title-safe area, -14 LUFS / -1 dBTP, WhatsApp copy <= 16 MB. 11) Run tools/qc_v5.py and fix every FAIL before showing me. 12) No third-party media in any zip or repo: links + downloader only.

## PROMPT 26 · make a reel like ref 8
Use references/ref8_ig_DfR63QgTvNj/README.md and breakdowns/ref8_breakdown/breakdown.md as the model edit. Script: <paste>. Voice: <vo.mp3>. Run make_video.py "<topic>" --voice vo.mp3, then add pop-up cards (my screenshots) with cursor taps where the voice mentions them, a phone mockup with my screen recording, zoom-blur and glitch transitions, ember gradient on the key words. Show me 3 stills (--frames-only) before the full render.

## PROMPT 27 · fix a render that failed QC
Read build/qc_report.json and fix each FAIL at its source (spec or zq_config.json), not by editing qc_v5.py. Re-render and show me the new report.
