# Example: 16 s 3D SaaS promo (daymark concept)

1. `python3 ../../scripts/screen_video.py screen_timeline.json assets/screen.mp4` — screen recording from the screenshots (cursor, clicks, typing).
2. `blender -b --factory-startup -t 8 -P hero.py -- --out renders/f --w 810 --h 1440 --samples 12` — 480 RGBA WebP frames (~4 s/frame on a 16-thread CPU; split with `--start/--end`). Preview first: `--stills 25,100,160,330,460 --still_dir prev --fmt PNG --w 540 --h 960`.
3. Edit `HERE` at the top of `comp.jsx`, then `effectcraft-cli script comp.jsx` and `effectcraft-cli render --project hero.ecproj --comp Hero --out renders/silent.mp4 --format h264 --bitrate 24000` (~70 s).
4. Sound: `python3 ../../../sound-design/scripts/sfx_mix.py audio_sfx_events.json sfx.wav 16` then `master_mix.sh mix.wav 16 --music uplifting_bass.mp3 --music-start 12.27 --music-db -7 --sfx sfx.wav --duck-sfx` (Mixkit "Uplifting Bass", drop at 14.37 s lands on 2.10 s).
5. `ffmpeg -i renders/silent.mp4 -i mix.wav -map 0:v -map 1:a -c:v libx264 -crf 19 -maxrate 6800k -bufsize 13600k -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart final.mp4`

daymark is a fictional concept product by Zyqor Studio; the video says so on screen.
