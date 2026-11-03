#!/bin/bash
# run_ref3.sh — Zyqor Motion Kit v4: Sujon's REF 3 talking-head edit in ONE command.
#   ./run_ref3.sh his_clip.mp4 [OUT.mp4] [--keyword SITE] [--hook "3 THINGS"] [--icon 3] [--face X,Y] [--music FILE]
# Steps: clean voice -> cut pauses (punch-ins + glitch cuts) -> word timings (faster-whisper base.en) -> Blender 3D hook icon
#        -> build_ref3.py (plans every effect from the transcript, writes the EffectCraft comp + sfx list) -> EffectCraft render
#        -> sfx + music (ducked under the voice) -> -14 LUFS master -> mux -> QA contact sheet. Work files in work_<name>/.
# Input: a vertical (or any) phone video of him talking, 10-40 s, face roughly centred. Output 1080x1920 30 fps.
set -euo pipefail
IN="$(realpath "$1")"; shift
OUTF=""; if [ $# -gt 0 ] && [[ "$1" != --* ]]; then OUTF="$(realpath -m "$1")"; shift; fi
KW="SITE"; HOOK=""; ICON=""; FACE=""; MUSIC=""; EXTRA=()
while [ $# -gt 0 ]; do case "$1" in --keyword) KW="$2"; shift 2;; --hook) HOOK="$2"; shift 2;; --icon) ICON="$2"; shift 2;;
  --face) FACE="$2"; shift 2;; --music) MUSIC="$2"; shift 2;; *) echo "unknown $1"; exit 1;; esac; done
T="$(cd "$(dirname "$0")" && pwd)"; KIT="$(cd "$T/../.." && pwd)"
NAME="$(basename "${IN%.*}")"; W="$T/work_$NAME"; mkdir -p "$W"
OUTF="${OUTF:-$W/${NAME}_ref3.mp4}"; MUSIC="${MUSIC:-$KIT/music/better_times_173.mp3}"
RUN="nice -n 10 timeout -k 10"
EC="${EFFECTCRAFT_CLI:-effectcraft-cli}"
BL="${BLENDER:-blender}"; PY="${PYTHON:-python3}"
echo "[1/8] normalise + clean voice"
$RUN 600 ffmpeg -v error -y -i "$IN" -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30" -c:v libx264 -crf 14 -preset fast -c:a aac -b:a 256k "$W/src.mp4"
$RUN 600 "$KIT/clean_voice.sh" "$W/src.mp4" "$W/clean.wav"
echo "[2/8] word timings on the source (for the pause cut)"
$RUN 900 $PY "$KIT/transcribe_words.py" "$W/clean.wav" "$W/src.words.json" base.en
echo "[3/8] cut pauses (punch-ins + RGB/flash on every cut)"
FA=(); [ -n "$FACE" ] && FA=(--face "$FACE")
$RUN 900 python3 "$KIT/cut_pauses.py" "$W/src.mp4" "$W/cut.mp4" --audio "$W/clean.wav" --words "$W/src.words.json" "${FA[@]}"
echo "[4/8] word timings on the cut (base.en)"
$RUN 900 $PY "$KIT/transcribe_words.py" "$W/cut.mp4" "$W/cut.words.json" base.en
echo "[5/8] Blender: real 3D hook icon"
GL="$ICON"; [ -z "$GL" ] && GL=$(python3 -c "
import json,re; w=json.load(open('$W/cut.words.json')); n={'one':'1','two':'2','three':'3','four':'4','five':'5','ten':'10'}
s=[n.get(re.sub(r'[^\w]','',x['text']).lower(),re.sub(r'[^\w]','',x['text'])) for x in w[:8]]; print(next((x for x in s if x.isdigit()),'★'))")
if [ ! -d "$W/sp_icon" ] || [ -n "$ICON" ]; then rm -rf "$W/sp_icon"
  $RUN 1200 $BL -b --factory-startup -t 8 -P "$KIT/templates/explainer_soft3d_v4/sprites_v4.py" -- --sprite tile --color "#2f6bff" --glyph "$GL" --size 600x600 --frames 60 --samples 16 --out "$W/sp_icon/" > "$W/blender_icon.log" 2>&1; fi
echo "[6/8] plan + EffectCraft comp"
HA=(); [ -n "$HOOK" ] && HA=(--hook "$HOOK"); IA=(); [ -n "$ICON" ] && IA=(--icon "$ICON")
python3 "$T/build_ref3.py" --cut "$W/cut.mp4" --words "$W/cut.words.json" --map "$W/cut.map.json" --out "$W" --keyword "$KW" "${HA[@]}" "${IA[@]}" "${FA[@]}"
(cd "$W" && $RUN 300 "$EC" script comp_ref3.jsx)
DUR=$(python3 -c "import json;print(json.load(open('$W/plan_ref3.json'))['DUR'])")
$RUN 3600 "$EC" render --project "$W/ref3.ecproj" --comp Ref3 --out "$W/silent.mp4" --format h264 --bitrate 22000
echo "[7/8] sound: sfx + music ducked under the voice + master -14 LUFS"
$RUN 300 ffmpeg -v error -y -i "$W/cut.mp4" -vn -ac 1 -ar 48000 "$W/voice_cut.wav"
$RUN 300 python3 "$KIT/sfx_mix.py" "$W/sfx_ref3.json" "$W/sfx.wav" "$DUR"
VD=$(python3 -c "import json;print(json.load(open('$W/plan_ref3.json'))['vdur'])")
$RUN 600 "$KIT/master_mix.sh" "$W/mix.wav" "$DUR" --voice "$W/voice_cut.wav" --music "$MUSIC" --music-db -15 --music-tail "$VD:11" --sfx "$W/sfx.wav" --sfx-db -2
echo "[8/8] mux + QA"
$RUN 600 ffmpeg -v error -y -i "$W/silent.mp4" -i "$W/mix.wav" -map 0:v -map 1:a -c:v libx264 -crf 20 -preset slow -maxrate 9M -bufsize 18M -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart -shortest "$OUTF"
$RUN 300 ffmpeg -v error -y -i "$OUTF" -vf "fps=2,scale=216:384,tile=8x$(python3 -c "import math;print(math.ceil($DUR*2/8))")" -frames:v 1 "${OUTF%.mp4}_contact.jpg"
ffmpeg -hide_banner -nostats -i "$OUTF" -af ebur128=peak=true -f null - 2>&1 | tail -12 || true
ls -la "$OUTF"
