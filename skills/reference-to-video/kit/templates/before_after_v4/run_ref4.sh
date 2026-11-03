#!/bin/bash
# run_ref4.sh — Zyqor Motion Kit v4: REF 4 "Original vs Edited" showcase in one command.
#   ./run_ref4.sh RAW.mp4 EDITED.mp4 [OUT.mp4] [--raw-in 0 --raw-len 8 --name ZYQOR --handle @zyqor.studio]
# RAW = the untouched clip, EDITED = your edit of the same clip (e.g. run_ref3.sh output). Work files in work_<name>/.
set -euo pipefail
RAW="$(realpath "$1")"; ED="$(realpath "$2")"; shift 2
OUTF=""; if [ $# -gt 0 ] && [[ "$1" != --* ]]; then OUTF="$(realpath -m "$1")"; shift; fi
T="$(cd "$(dirname "$0")" && pwd)"; KIT="$(cd "$T/../.." && pwd)"; NAME="$(basename "${ED%.*}")"; W="$T/work_$NAME"; mkdir -p "$W"
OUTF="${OUTF:-$W/${NAME}_ref4.mp4}"; RUN="nice -n 10 timeout -k 10"
EC="${EFFECTCRAFT_CLI:-effectcraft-cli}"
python3 "$T/build_ref4.py" --raw "$RAW" --edited "$ED" --out "$W" "$@"
(cd "$W" && $RUN 300 "$EC" script comp_ref4.jsx)
P() { python3 -c "import json;print(json.load(open('$W/audio_plan.json'))['$1'])"; }
DUR=$(P DUR); TR=$(P T_RAW); TE=$(P T_ED); TEND=$(P T_END); RI=$(P raw_in); RL=$(P raw_len)
$RUN 3600 "$EC" render --project "$W/ref4.ecproj" --comp Ref4 --out "$W/silent.mp4" --format h264 --bitrate 20000
# audio: raw clip's own sound (untouched, levelled to -20 LUFS so the edit feels bigger) -> the edit's finished mix -> end-card sting
$RUN 300 ffmpeg -v error -y -ss "$RI" -t "$RL" -i "$RAW" -vn -af "loudnorm=I=-20:TP=-3,aresample=48000" -ac 2 "$W/a_raw.wav"
$RUN 300 ffmpeg -v error -y -i "$ED" -vn -af "aresample=48000" -ac 2 "$W/a_ed.wav"
DR=$(python3 -c "print(int($TR*1000))"); DE=$(python3 -c "print(int($TE*1000))")
$RUN 300 ffmpeg -v error -y -i "$W/a_raw.wav" -i "$W/a_ed.wav" -filter_complex "[0]adelay=$DR|$DR[a];[1]adelay=$DE|$DE[b];[a][b]amix=inputs=2:normalize=0:duration=longest,apad=whole_dur=$DUR,atrim=0:$DUR" "$W/voice_track.wav"
$RUN 300 python3 "$KIT/sfx_mix.py" "$W/sfx_ref4.json" "$W/sfx.wav" "$DUR"
$RUN 600 "$KIT/master_mix.sh" "$W/mix.wav" "$DUR" --voice "$W/voice_track.wav" --music "$KIT/music/uplifting_bass_726.mp3" --music-start 13.9 --music-db -40 --music-tail "$TEND:30" --sfx "$W/sfx.wav" --sfx-db -2
$RUN 600 ffmpeg -v error -y -i "$W/silent.mp4" -i "$W/mix.wav" -map 0:v -map 1:a -c:v libx264 -crf 21 -preset slow -maxrate 8M -bufsize 16M -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart -shortest "$OUTF"
$RUN 300 ffmpeg -v error -y -i "$OUTF" -vf "fps=1,scale=216:384,tile=8x$(python3 -c "import math;print(math.ceil($DUR/8))")" -frames:v 1 "${OUTF%.mp4}_contact.jpg"
ffmpeg -hide_banner -nostats -i "$OUTF" -af ebur128=peak=true -f null - 2>&1 | tail -12 || true; ls -la "$OUTF"
