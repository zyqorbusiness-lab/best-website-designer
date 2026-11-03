# ui_screen_v5 — a real-looking app screen recording, built in code (Zyqor Motion Kit v5)

Made for the face-lock v3 reel (Nov 3, 2026) after the v5 demo's drawn phone mockup looked fake.
What it gives you: a crisp ChatGPT-style chat screen inside a phone frame that behaves like a screen recording:
attachment sheet, photo upload with a progress ring, iOS keyboard with key pop-ups, typing synced to the voice-over,
send, "Creating image" shimmer, image reveal from blur. "ChatGPT" is text only; no OpenAI logo or artwork.

How it works
1. chat.html has one function, render(state). A state is plain JSON:
   {kb: 0..1 keyboard, typed: "text so far", caret: true, press: {k: "a", sug: "word"}, chip: {img: "ref", p: 0..1},
    sheet: 0..1, pick: true, greet: "Kya banana hai aaj?", msgs: [{r: "u", img: "ref", t: "..."}, {r: "gen", p: 0..1},
    {r: "img", img: "fixed", k: "aimg_f", blur: 14}]}
2. Build one state per video frame in Python from your VO word times (typing: each word's letters appear between that
   word's start and end time). Write [{"f": 0, "s": {...}}, ...] to states.json.
3. CHROME_PATH=... node frames.js states.json seq/ rects.json  -> seq/s_0001.webp ... (1242x2604, RGBA, phone frame included)
   Identical states are copied, not re-rendered (about 1-2 min for 260 frames). rects.json = where each tappable element is.
4. In EffectCraft (ec_reel.py extra_jsx):
     var io=new ImportOptions(new File(".../seq/s_0001.webp")); io.sequence=true; var L=comp.layers.add(app.project.importFile(io));
     L.startTime = <time of frame 1>; L.inPoint=a; L.outPoint=b;  then keyframe Position/Scale/Rotate Z (zoom in for typing).
5. Aim the hand cursor with rects.json: comp = phonePos + (rect_css*3 - [621,1302]) * scale/100. Hold the phone still
   (equal keyframes) whenever a tap lands, so the maths is exact.
Photos (p_*.png): square 516x516 images the UI shows. Sample ones (Open Peeps faces, CC0, made with DiceBear) ship in the kit zip, not in this repo: make your own 516x516 PNGs.
