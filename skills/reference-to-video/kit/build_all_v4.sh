#!/bin/bash
# build_all_v4.sh — Zyqor Motion Kit v4: render + comp + mix one of the reference recipes.
#   ./build_all_v4.sh ref2 [--voice his_vo.wav]     (tilted 3D device SaaS promo, Blender scene -> EffectCraft -> mix)
#   ./build_all_v4.sh ref1 [--voice his_vo.wav]     (soft-3D explainer: Blender sprites -> build_ref1.py -> EffectCraft -> mix)
#   ref3 / ref4: templates/talking_head_v4/run_ref3.sh <clip>  ·  templates/before_after_v4/run_ref4.sh <raw> <edited>
# Every command: nice -n 10 + timeout -k. Blender: 2 processes x 8 threads max (CPU box). Deletes frame sequences after the encode.
set -euo pipefail
K="$(cd "$(dirname "$0")" && pwd)"; WHICH="$1"; shift; VOICE=""
while [ $# -gt 0 ]; do case "$1" in --voice) VOICE="$(realpath "$2")"; shift 2;; *) echo "unknown $1"; exit 1;; esac; done
EC="${EFFECTCRAFT_CLI:-effectcraft-cli}"; BL="${BLENDER:-blender}"; RUN="nice -n 10 timeout -k 10"
OUTD="${OUT_DIR:-$K/out}"; mkdir -p "$OUTD"
freecheck() { local f; f=$(df --output=avail -m "$K" | tail -1); [ "$f" -gt 1500 ] || { echo "disk: only ${f} MB free (<1.5 GB) - clean up first"; exit 1; }; }
mixmux() {  # $1 dir $2 silent.mp4 $3 sfx.json $4 dur $5 out.mp4 $6.. master_mix music args
  local D="$1" S="$2" J="$3" T="$4" O="$5"; shift 5
  $RUN 300 python3 "$K/sfx_mix.py" "$J" "$D/sfx.wav" "$T"
  if [ -n "$VOICE" ]; then $RUN 600 "$K/clean_voice.sh" "$VOICE" "$D/vo_clean.wav"; $RUN 600 "$K/master_mix.sh" "$D/mix.wav" "$T" --voice "$D/vo_clean.wav" --sfx "$D/sfx.wav" "$@"
  else $RUN 600 "$K/master_mix.sh" "$D/mix.wav" "$T" --sfx "$D/sfx.wav" --duck-sfx "$@"; fi
  $RUN 900 ffmpeg -v error -y -i "$S" -i "$D/mix.wav" -map 0:v -map 1:a -c:v libx264 -crf 18 -preset slow -maxrate 9M -bufsize 18M -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart -shortest "$O"
  local SZ; SZ=$(stat -c %s "$O"); if [ "$SZ" -gt 15000000 ]; then $RUN 900 ffmpeg -v error -y -i "$O" -c:v libx264 -crf 23 -preset slow -maxrate 6M -bufsize 12M -pix_fmt yuv420p -c:a copy -movflags +faststart "${O%.mp4}_wa.mp4"; fi
  ffmpeg -hide_banner -nostats -i "$O" -af ebur128=peak=true -f null - 2>&1 | tail -12 || true
}
case "$WHICH" in
ref2)
  T="$K/templates/saas_blender_hero_v4"; freecheck
  if [ "$(ls "$T/renders/f" 2>/dev/null | wc -l)" -lt 510 ]; then
    $RUN 7200 $BL -b --factory-startup -t 8 -P "$T/hero_v4.py" -- --out "$T/renders/f" --start 1 --end 255 --samples 12 > "$T/renders/b0.log" 2>&1 &
    $RUN 7200 $BL -b --factory-startup -t 8 -P "$T/hero_v4.py" -- --out "$T/renders/f" --start 256 --end 510 --samples 12 > "$T/renders/b1.log" 2>&1 &
    wait; fi
  sed -i.bak "s#^var HERE = \".*\";#var HERE = \"$T\";#" "$T/comp_v4.jsx"; (cd "$T" && $RUN 300 $EC script comp_v4.jsx)
  $RUN 5400 $EC render --project "$T/hero_v4.ecproj" --comp Hero --out "$T/renders/silent.mp4" --format h264 --bitrate 26000
  mixmux "$T/renders" "$T/renders/silent.mp4" "$T/audio_sfx_events_v4.json" 17 "$OUTD/V4_ref2_saas_promo.mp4" --music "$K/music/uplifting_bass_726.mp3" --music-start 12.27 --music-db -7 ;;
ref1)
  T="$K/templates/explainer_soft3d_v4"; freecheck
  SP="$T/sprites_v4.py"; R="$T/renders"
  spr() { [ -d "$R/sp_$1" ] || $RUN 3600 $BL -b --factory-startup -t 8 -P "$SP" -- --sprite "$2" --out "$R/sp_$1/" "${@:3}" > "$R/sp_$1.log" 2>&1; }
  ( spr phone_search phone_search --size 900x1500 --frames 60; spr avatar avatar --size 900x900 --frames 60 --tex "$T/assets/avatar.png";
    spr avatar_wow avatar --size 900x900 --frames 60 --tex "$T/assets/avatar_wow.png"; spr star star --size 500x500 --frames 60; spr coin coin --size 420x420 --frames 60 ) &
  ( spr phone_site phone_site --size 900x1500 --frames 120 --loop 0; spr avatar_wink avatar --size 900x900 --frames 60 --tex "$T/assets/avatar_wink.png";
    spr pin pin --size 500x560 --frames 60; spr tile_call tile_call --size 500x500 --frames 60; spr tile_check tile_check --size 500x500 --frames 60; spr tile_globe tile_globe --size 500x500 --frames 60 ) &
  wait
  (cd "$T" && python3 build_ref1.py && $RUN 300 $EC script comp_ref1.jsx)
  $RUN 5400 $EC render --project "$T/ref1.ecproj" --comp Ref1 --out "$R/silent.mp4" --format h264 --bitrate 24000
  mixmux "$R" "$R/silent.mp4" "$T/sfx_ref1.json" 22.5 "$OUTD/V4_ref1_soft3d_explainer.mp4" --music "$K/music/digital_clouds_175.mp3" --music-db -9 ;;
ref5)
  T="$K/templates/saas_cards_v4"; R="$K/templates/explainer_soft3d_v4/renders"; SP="$K/templates/explainer_soft3d_v4/sprites_v4.py"; freecheck
  spr() { [ -d "$R/sp_$1" ] || $RUN 3600 $BL -b --factory-startup -t 8 -P "$SP" -- --sprite "$2" --out "$R/sp_$1/" "${@:3}" > "$R/sp_$1.log" 2>&1; }
  ( spr tile_code tile --color "#7c5cff" --glyph "</>" --size 500x500 --frames 60; spr tile_z tile --color "#3d6bff" --glyph "Z" --size 600x600 --frames 60; spr star star --size 500x500 --frames 60 ) &
  ( spr tile_play tile --color "#ff5a7a" --glyph "▶" --size 500x500 --frames 60; spr tile_globe tile_globe --size 500x500 --frames 60; spr tile_check tile_check --size 500x500 --frames 60; spr coin coin --size 420x420 --frames 60 ) &
  wait
  (cd "$T" && python3 build_ref5.py && $RUN 300 $EC script comp_ref5.jsx)
  $RUN 5400 $EC render --project "$T/ref5.ecproj" --comp Ref5 --out "$T/silent.mp4" --format h264 --bitrate 24000
  mixmux "$T" "$T/silent.mp4" "$T/sfx_ref5.json" 18 "$OUTD/V4_ref5_saas_cards.mp4" --music "$K/music/digital_clouds_175.mp3" --music-db -8 ;;
*) echo "use ref1 | ref2 | ref5 (ref3/ref4 have their own run_ref3.sh / run_ref4.sh)"; exit 1;;
esac
