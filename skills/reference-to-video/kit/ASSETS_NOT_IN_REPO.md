# Binary assets not in the repo

The repo keeps code, JSON and docs only (no images, video, audio or font files here, so every asset in the repo stays credit-checked). The full Zyqor Motion Kit v4 zip has these files; to rebuild them yourself:

- `blender/fonts/*.ttf` — free fonts: Archivo Black, Bricolage Grotesque 800, Instrument Serif Italic, Inter 700, Space Grotesk 700, Pixelify Sans, Silkscreen (all SIL OFL 1.1, Google Fonts) + DejaVu Sans Bold (DejaVu licence). Download from fonts.google.com / dejavu-fonts.github.io into `blender/fonts/`.
- `templates/talking_head_v4/assets/haarcascade_frontalface_default.xml` — copy it from opencv-python: `python -c "import cv2;print(cv2.data.haarcascades)"`.
- `sfx_v2/*.mp3`, `music/*.mp3` — run `get_audio.sh` (Mixkit free licence; not re-shareable as files).
- Screens and stills of your own concept sites (`templates/*/assets/*.jpg|png|mp4`) — re-capture with `capture_dark.js`, `cap_sites.js`, `cap_scroll.js` (headless Chrome).
- Mascot (`explainer_soft3d_v4/assets/avatar*.png`) — your own character, 3 expressions, square PNG.

Files skipped here:

- `blender/fonts/ArchivoBlack-400.ttf`
- `blender/fonts/BricolageGrotesque-800.ttf`
- `blender/fonts/DejaVuSans-Bold.ttf`
- `blender/fonts/InstrumentSerif-400-italic.ttf`
- `blender/fonts/Inter-700.ttf`
- `blender/fonts/PixelifySans-VF.ttf`
- `blender/fonts/Silkscreen-Bold.ttf`
- `blender/fonts/Silkscreen-Regular.ttf`
- `blender/fonts/SpaceGrotesk-700.ttf`
- `templates/explainer_soft3d_v4/assets/avatar.png`
- `templates/explainer_soft3d_v4/assets/avatar_wink.png`
- `templates/explainer_soft3d_v4/assets/avatar_wow.png`
- `templates/explainer_soft3d_v4/assets/m_anvaya.jpg`
- `templates/explainer_soft3d_v4/assets/m_anvaya_2.jpg`
- `templates/explainer_soft3d_v4/assets/m_fizzly.jpg`
- `templates/explainer_soft3d_v4/assets/m_fizzly_2.jpg`
- `templates/explainer_soft3d_v4/assets/m_stillroom.jpg`
- `templates/explainer_soft3d_v4/assets/m_stillroom_2.jpg`
- `templates/explainer_soft3d_v4/assets/screen_search.png`
- `templates/explainer_soft3d_v4/assets/stillroom_tall.jpg`
- `templates/saas_blender_hero/assets/ov/cap_add.png`
- `templates/saas_blender_hero/assets/ov/cap_done.png`
- `templates/saas_blender_hero/assets/ov/cap_type.png`
- `templates/saas_blender_hero/assets/ov/concept.png`
- `templates/saas_blender_hero/assets/ov/dm.png`
- `templates/saas_blender_hero/assets/ov/label.png`
- `templates/saas_blender_hero/assets/ov/leak.png`
- `templates/saas_blender_hero/assets/ov/offer.png`
- `templates/saas_blender_hero/assets/s2_board_empty.jpg`
- `templates/saas_blender_hero/assets/s3_blank.jpg`
- `templates/saas_blender_hero/assets/s3_typed.jpg`
- `templates/saas_blender_hero/assets/s4_one_task.jpg`
- `templates/saas_blender_hero/assets/s5_full_board.jpg`
- `templates/saas_blender_hero/assets/s6_done.jpg`
- `templates/saas_blender_hero/assets/screen.mp4`
- `templates/saas_blender_hero_v4/assets/hook_anime_v4.jpg`
- `templates/saas_blender_hero_v4/assets/ov/cap_add.png`
- `templates/saas_blender_hero_v4/assets/ov/cap_done.png`
- `templates/saas_blender_hero_v4/assets/ov/cap_type.png`
- `templates/saas_blender_hero_v4/assets/ov/end_line.png`
- `templates/saas_blender_hero_v4/assets/ov/end_offer.png`
- `templates/saas_blender_hero_v4/assets/ov/hook_sub.png`
- `templates/saas_blender_hero_v4/assets/ov/label.png`
- `templates/saas_blender_hero_v4/assets/ov/leak.png`
- `templates/saas_blender_hero_v4/assets/screen.mp4`
- `templates/saas_blender_hero_v4/assets/shots/s1_hero.jpg`
- `templates/saas_blender_hero_v4/assets/shots/s2_board_empty.jpg`
- `templates/saas_blender_hero_v4/assets/shots/s3_blank.jpg`
- `templates/saas_blender_hero_v4/assets/shots/s3_typed.jpg`
- `templates/saas_blender_hero_v4/assets/shots/s4_one_task.jpg`
- `templates/saas_blender_hero_v4/assets/shots/s5_full_board.jpg`
- `templates/saas_blender_hero_v4/assets/shots/s6_done.jpg`
- `templates/saas_blender_hero_v4/assets/shots_sheet.jpg`
- `templates/talking_head_v4/assets/haarcascade_frontalface_default.xml`


## v5 (Nov 3 2026)
- `templates/ec_kinetic_v5/assets/*.png` (code-drawn cards, phone mockups, cursor, ripple, bookmark, floor shadow — our own work) ship in the Zyqor Motion Kit v5 zip, not in the repo (the credit gate needs a credit file per image).
- Premium sfx: put licensed files in `sfx_premium/` with a line each in its LICENSES.txt (qc_v5.py F7).
