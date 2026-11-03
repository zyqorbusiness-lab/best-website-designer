# Ref 1 research — soft-3D faceless explainer
Reference: https://www.instagram.com/reel/DfJvupgpmeq/ — Deepak Kumar (@d2epak_). Google-review NFC tag explainer: one continuous off-white 3D world, cute mascot, floating 3D objects, depth blur, word-by-word captions with coloured keywords, count-up numbers, typed "Comment X" box.
Links checked on Nov 3, 2026: YouTube links confirmed through YouTube's own oEmbed answer (title + channel); web pages fetched (HTTP 200). Anything not confirmed is marked unverified.

## 1. Cute soft-3D objects and icons (Blender)
- **Easy 3D Icon in Blender! (Tutorial)** — Daniel Marqusee
  https://www.youtube.com/watch?v=c8tZwsxQ1IQ
  Teaches: SVG logo/icon -> Blender curve -> extrude + bevel -> soft 3D app icon.
  In our kit: Make the app-icon/NFC-tag objects for blender/softworld.py: import the SVG, extrude 0.1, bevel 0.03 with 4+ segments, then the clay material below.

- **Easy Claymorphism Asset Pack with Geometry Nodes - Blender Tutorial** — Alexandre Albisser
  https://www.youtube.com/watch?v=xfwDB5eYS2U
  Teaches: Geometry-nodes 'inflate any 2D shape' setup for claymorphism compositions.
  In our kit: Fast way to puff up flat UI shapes (cards, pills, bubbles) into the rounded clay look of ref 1; export the node group into the soft-world .blend.

- **Make Claymation Style Renders In Blender With Shader Nodes** — PlanetaryLuke
  https://www.youtube.com/watch?v=nqy-dxAadIY
  Teaches: Clay/claymation shader with shader nodes (noise bump, soft roughness, subsurface).
  In our kit: Our clay material: roughness 0.55-0.7, subtle bump, slight SSS — use it for the mascot and pills; keep phones/icons glossy (roughness 0.2).

- **Create a 3D art illustration that looks like Clay (Blender Tutorial)** — Jean-Marc Denis
  https://www.youtube.com/watch?v=3ry_sSzmAfo
  Teaches: Full clay-look illustration: material, lighting and composition.
  In our kit: Matches ref 1's pastel off-white world: one big soft area light top-left, AO, low-contrast grade.

- **Clay-ish Creatures in Blender** — Motion Design School
  https://www.youtube.com/watch?v=uWUy4ytP0XY
  Teaches: Cute 'clay-ish' creatures: modeling, shading, lighting, animation, compositing.
  In our kit: Mascot pipeline for the ref 1 character (3 expressions in templates/explainer_soft3d_v4/sprites_v4.py).


## 2. Floating objects + depth blur
- **How to Animate Floating Objects ⛵ (Blender Tutorial)** — Ryan King Art
  https://www.youtube.com/watch?v=bC3guogt9n0
  Teaches: Animating floating/bobbing objects.
  In our kit: The sine bob (±3 % height, 2-3 s period, phase offset per object) in softworld.py.

- **How to Use Depth of Field in Blender (Tutorial)** — Ryan King Art
  https://www.youtube.com/watch?v=ahT3P274EMw
  Teaches: Depth of field in Blender (focus object, f-stop).
  In our kit: Ref 1's background blur: camera DOF on, focus on the hero, f/1.8-2.8, background objects 2-3x farther.


## 3. Captions, count-ups, typed comment box
- **How to create animated captions for work videos (word-by-word highlighting)** — Microsoft Clipchamp
  https://www.youtube.com/watch?v=IuEwCbpDmA8
  Teaches: Word-by-word highlighted auto captions (Clipchamp).
  In our kit: Same idea as our word-timed captions (transcribe_words.py -> EffectCraft text layers, keyword colour #2c40a6, emphasis coral italic serif).

- **Word Highlight Auto Captions in Capcut** — The Poser Animates
  https://www.youtube.com/watch?v=2LSoEH4s6BI
  Teaches: CapCut word-highlight auto captions.
  In our kit: Phone/PC route for Sujon if he edits in CapCut instead of the kit.

- **Animating Numbers Counting Up In After Effects | Beginner Tutorial** — Learnin5
  https://www.youtube.com/watch?v=RQPwWZuyzZk
  Teaches: Numbers counting up in After Effects (Slider Control + expression).
  In our kit: EffectCraft has JavaScript expressions too: drive a text layer with Math.round(linear(time,t0,t1,0,N)) for ref 1's green count-ups.

- **How to Create A Typing Effect in After Effects** — Motion Array Tutorials
  https://www.youtube.com/watch?v=IMtMYu_jyNU
  Teaches: Typing/typewriter text effect in After Effects.
  In our kit: The typed 'Comment SITE' box: reveal characters at ~12-15 chars/s + a keyboard-typing sfx (sfx_v2/typing.mp3).


## 4. Pinterest (new topic, signed in)
- references/soft_3d_explainer_animation/STYLE.md — one continuous world (0-1 cuts per 30 s), pop-in 0→110→100 % in 9 frames + float, clay vs glossy materials, 1-2 sfx onsets per second.
- Older related topic: references/blender_3d_motion_graphics/STYLE.md.

## 5. Free tools + assets for this style
- Blender (GPL, free for any use incl. commercial): https://www.blender.org/download/ — licence page https://www.blender.org/about/license/
- Poly Haven HDRIs/textures, CC0: https://polyhaven.com/license (soft studio HDRI for glossy icons)
- ambientCG textures, CC0: https://docs.ambientcg.com/license/
- Kenney 3D/UI assets, CC0: https://kenney.nl/support
- Fonts (SIL OFL, free commercial): Instrument Serif for the coral italic emphasis — https://raw.githubusercontent.com/google/fonts/main/ofl/instrumentserif/OFL.txt

## How to use this research
1. Model objects with the SVG→extrude→bevel route, clay material from PlanetaryLuke's setup.
2. Lay them out in softworld.py, DOF on, sine float on.
3. Captions + count-ups + typed box in EffectCraft (expressions), pops on every appearance.
