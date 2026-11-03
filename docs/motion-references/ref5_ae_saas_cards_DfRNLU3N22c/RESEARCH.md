# Ref 5 research — After Effects SaaS card promo
Reference: https://www.instagram.com/reel/DfRNLU3N22c/ — Jekay Valiente (@jekyiesz). Caption: "Sharing a recent project I worked on in After Effects… P.S. this is a recreation project --- tutorial made by @madebyveduboi". Pastel gradient, glossy 3D UI cards, card-grid scroll, light streaks, rainbow rays + toggle ending.
Links checked on Nov 3, 2026: YouTube links confirmed through YouTube's own oEmbed answer (title + channel); web pages fetched (HTTP 200). Anything not confirmed is marked unverified.

## 1. The credited tutorial creator (@madebyveduboi)
- **Vedant | Motion Designer** — portfolio site madebyveduboi (lists "SaaS Explainers" as a service)
  https://madebyveduboi.framer.website/
- **SaaS Motion Graphics in After Effects | Beginner Friendly Masterclass | PART 1** — VeduBoi
  https://www.youtube.com/watch?v=07rjdeP0Nzg
  Teaches: SaaS motion graphics in After Effects, beginner masterclass part 1 (VeduBoi).
  In our kit: Most likely the tutorial family ref 5 recreates (same creator name: madebyveduboi / VeduBoi). Our port: templates/saas_cards_v4/build_ref5.py + comp_ref5.jsx.

- **SaaS Motion Graphics in After Effects | Beginner Friendly Masterclass | PART 2** — VeduBoi
  https://www.youtube.com/watch?v=BLUFOYXjKLA
  Teaches: continuation of the same masterclass (only the title was confirmed; contents not opened).
  In our kit: watch alongside part 1 when porting moves into comp_ref5.jsx.

- Note: the YouTube channel is "VeduBoi" and the site is "madebyveduboi" — same name, so very likely the same person, but which exact video Jekay recreated is not stated (unverified).

## 2. More SaaS-promo tutorials
- **How To Make $1000 SaaS Explainers | After Effects | Beginner Friendly** — Snipzyae
  https://www.youtube.com/watch?v=LYY5hXNiDC0
  Teaches: '$1000 SaaS explainers' in After Effects, beginner friendly (Snipzyae).
  In our kit: Overall structure: hook line → UI cards → feature beats → logo/CTA.

- **Master SaaS Motion Graphics in 30 Minutes (After Effects)** — TomsProject
  https://www.youtube.com/watch?v=Jccbzpicst8
  Teaches: SaaS motion graphics in 30 minutes (TomsProject).
  In our kit: Quick card/UI workflow; keyframe easing values to copy into EffectCraft.

- **How to Create a Full SaaS Animation in After Effects | Step by Step** — Mojtaba Sorbi
  https://www.youtube.com/watch?v=GmWuQYFmEt0
  Teaches: Full SaaS animation step by step (Mojtaba Sorbi).
  In our kit: Longer full build — good for the card-grid scroll section.

- **SaaS Motion Graphics in After Effects: Product UI Workflow** — Demotion blog
  https://trydemotion.com/blog/saas-motion-graphics-masterclass
  Teaches: prepping UI screens as layers, card animation, pacing.
  In our kit: how to cut a website screenshot (zyqor-portfolio concept sites) into card layers before build_ref5.py.

## 3. Glossy 3D cards
- **3D UI Card Animation in After Effects (Glassmorphism Style)** — Emmanuel Motions
  https://www.youtube.com/watch?v=XIO_Dv6_Ujk
  Teaches: 3D UI card animation, glassmorphism style.
  In our kit: Frosted card layer in EffectCraft (blur behind + white 20 % fill + 1 px light border), or Blender glass (transmission 0.9).

- **Glossy Card Animation in After Effects | Motion Animation Tutorial** — Designer Family 21
  https://www.youtube.com/watch?v=Usf3vPZ1WO8
  Teaches: Glossy card animation in After Effects.
  In our kit: Card gloss = gradient overlay + moving highlight; maps to light-sweep layer in comp_ref5.jsx.


## 4. Light streaks, sweeps, rainbow rays
- **CC Light Sweep | Effects of After Effects** — Jake In Motion
  https://www.youtube.com/watch?v=0n0pZp_BA2w
  Teaches: CC Light Sweep explained (Jake In Motion).
  In our kit: The sheen crossing each card; EffectCraft equivalent: a soft white gradient bar, add blend, 0.6-1 s diagonal pass.

- **CC Light Rays | Effects of After Effects** — Jake In Motion
  https://www.youtube.com/watch?v=lUyIpM4aRwU
  Teaches: CC Light Rays explained (Jake In Motion).
  In our kit: Ending rays behind the toggle.

- **Rainbow Rays in After Effects with Colorama** — neon motions
  https://www.youtube.com/watch?v=T1onjPO7UoI
  Teaches: Rainbow rays with Colorama in After Effects.
  In our kit: Ref 5's rainbow ray ending: rays + a hue-cycling gradient map.

- **After effects Tutorial | Light Streak Line** — Just After Effects 
  https://www.youtube.com/watch?v=kahILmYOXIU
  Teaches: Light streak line in After Effects.
  In our kit: The thin light streaks flying across the pastel gradient between card beats.

- **Light Streaks 2** — Video Copilot
  https://www.videocopilot.net/tutorials/light_streaks_2
  Teaches: classic streak building (stroke + glow + motion blur).
  In our kit: same layer stack in EffectCraft (stroke, glow, motion blur on).

## 5. Grid + toggle
- **Repeater Grids - Adobe After Effects tutorial** — ECAbrams
  https://www.youtube.com/watch?v=0oJ1Ipa_cdM
  Teaches: Repeater grids in After Effects.
  In our kit: The card-grid wall that scrolls in ref 5 (EffectCraft: duplicate card layers in a grid via script in build_ref5.py).

- **How to Create a Viral Toggle Switch Animation in After Effects Tutorial** — MaTch CuT StudiO
  https://www.youtube.com/watch?v=2SdIG3RZ93E
  Teaches: Toggle switch animation in After Effects.
  In our kit: The final toggle: knob slides 0.3 s ease-out, track colour grey→brand, click + 'ding' sfx.


## 6. Pinterest (new topic, signed in)
- references/3d_glossy_ui_cards_motion/STYLE.md — glass over solid cards, dark metal cards on black, move fast (0.4 s) hold long (1 s) with a travelling sheen, cursor-driven tilt 8-10°, 5-7 s seamless loops.
- references/saas_promo_video_after_effects/STYLE.md — lilac cards on near-black (#09160c + #ddcdf3) as an alternative palette.

## 7. Free tools
- EffectCraft (free, open source, AE-style): https://getartcraft.com/apps/effectcraft
- Natron (free, open-source node compositor): https://natrongithub.github.io/ — source https://github.com/NatronGitHub/Natron
- Blender for true 3D cards: https://www.blender.org/download/

## How to use this research
1. Cut the concept-site screenshot into cards; build_ref5.py lays out the grid on a pastel gradient.
2. Each card: 0.4 s move, 1 s hold, sheen pass; streaks between beats.
3. Ending: rainbow rays + toggle on; whoosh per card, click + ding on the toggle.
