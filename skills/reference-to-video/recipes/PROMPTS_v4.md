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
5. Set the environment variables BLENDER, EFFECTCRAFT_CLI and PYTHON to the real programs if they are not on PATH. Search the .jsx files in zyqor-kit for "/home/user/" and change those `var HERE` lines to the real template folder on this computer. Show me the list of changes.
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
Hook: huge bright chrome text with a cyan glow. Feature words small, italic, seen straight on. End card: ONE element (a chat bubble with "Comment <KEYWORD>"). Label it a concept if the product isn't real.
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
Build a 3-panel 1080x1920 comp, starting from zyqor-kit/templates/before_after_v4/build_ref4.py: blurred background; top banner "EDITING / TIMELINE" (chunky game font, yellow + cyan, black stroke, green chalkboard strip); middle = the edit in a rounded card; a "DM FOR PAID EDIT" strip with my avatar; bottom = the timeline recording in sync.
Captions: 1-2 words at a time from the word timings, lime/yellow fill with a thick black stroke. Big 3D bubble words with Blender text3d.py --anim slam on 3-4 hype words, with motion blur. Whoosh on each big word, pop on captions. Master -14 LUFS / -1 dBTP. Show me a 1-fps contact sheet.
```
