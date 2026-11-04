#!/bin/bash
# master_mix.sh — final reel mix (motion-kit v2, Nov 3 2026)
# True-peak target -2.0 dBTP leaves room for AAC encoding overshoot (measured: -1.5 in WAV became -0.64 in AAC).
# Usage: master_mix.sh OUT.wav DURATION [--voice V.wav] [--music M.mp3 --music-db -18 --music-start 0] [--sfx S.wav --sfx-db 0] [--lufs -14] [--tp -1.0 (v5.5: refs sit at -0.7 dBTP; default stays -2.0)]
# voice = already cleaned (clean_voice.sh). Music is looped/trimmed to DURATION, faded in 0.3 s / out 1.2 s, and
# auto-ducked under the voice with sidechaincompress (~10 dB of ducking while he talks). Sum -> 2-pass loudnorm -> limiter.
# --duck-sfx       (v3) no voice? duck the music ~3-4 dB under the sfx hits instead (sidechain from the sfx track) so every hit punches through.
# --music-tail T:DB  raises the bed by DB dB from T seconds (0.3 s ramp), e.g. for an end card after the voice stops.
# Then mux: ffmpeg -i video.mp4 -i OUT.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest final.mp4
set -euo pipefail
case "${1:-}" in -h|--help|"") sed -n '2,9p' "$0"; exit 0;; esac
OUT="$1"; D="$2"; shift 2
V=""; M=""; MDB="-18"; MSS="0"; MT=""; S=""; SDB="0"; LUFS="-14"; TP="-2.0"; DS=""
while [ $# -gt 0 ]; do case "$1" in --voice) V="$2"; shift 2;; --music) M="$2"; shift 2;; --music-db) MDB="$2"; shift 2;;
 --music-start) MSS="$2"; shift 2;; --music-tail) MT="$2"; shift 2;; --sfx) S="$2"; shift 2;; --sfx-db) SDB="$2"; shift 2;; --lufs) LUFS="$2"; shift 2;; --tp) TP="$2"; shift 2;; --duck-sfx) DS=1; shift 1;; *) echo "bad $1"; exit 1;; esac; done
RUN="nice -n 10 timeout -k 10 600"; TMP="$(mktemp -d /tmp/master.XXXX)"; trap 'rm -rf "$TMP"' EXIT
IN=(); FC=""; MIX=""; n=0
FO=$(python3 -c "print(max(0,$D-0.8))")
if [ -n "$V" ]; then IN+=(-i "$V"); FC+="[$n:a]aresample=48000,aformat=channel_layouts=stereo,apad=whole_dur=$D,atrim=0:$D,asplit=2[v][vsc];"; MIX+="[v]"; VI=1; n=$((n+1)); fi
TAILF=""; if [ -n "$MT" ]; then TT="${MT%%:*}"; TG=$(python3 -c "print(10**(${MT##*:}/20))"); TAILF=",volume='1+($TG-1)*clip((t-$TT)/0.3\,0\,1)':eval=frame"; fi
if [ -n "$M" ]; then IN+=(-stream_loop -1 -ss "$MSS" -i "$M"); FC+="[$n:a]aresample=48000,aformat=channel_layouts=stereo,atrim=0:$D,asetpts=N/SR/TB,volume=${MDB}dB,afade=t=in:d=0.3,afade=t=out:st=$FO:d=0.8[m0];"
  if [ -n "$V" ]; then FC+="[m0][vsc]sidechaincompress=threshold=0.015:ratio=10:attack=20:release=450:makeup=1${TAILF}[m];"; elif [ -n "$DS" ] && [ -n "$S" ]; then MDUCK=1; FC+="[m0]anull[mpre];"; else FC+="[m0]anull[m];"; fi; [ -z "${MDUCK:-}" ] && MIX+="[m]"; n=$((n+1));
elif [ -n "$V" ]; then FC+="[vsc]anullsink;"; fi
if [ -n "$S" ]; then IN+=(-i "$S"); FC+="[$n:a]aresample=48000,aformat=channel_layouts=stereo,apad=whole_dur=$D,atrim=0:$D,volume=${SDB}dB[s0];"
  if [ -n "${MDUCK:-}" ]; then FC+="[s0]asplit=2[s][ssc];[mpre][ssc]sidechaincompress=threshold=0.06:ratio=4:attack=5:release=250:makeup=1[m];"; MIX+="[m][s]"; else FC+="[s0]anull[s];"; MIX+="[s]"; fi; n=$((n+1)); fi
FC+="${MIX}amix=inputs=$n:normalize=0:duration=longest,atrim=0:$D[out]"
$RUN ffmpeg -v error -y "${IN[@]}" -filter_complex "$FC" -map "[out]" -c:a pcm_s24le "$TMP/sum.wav"
J=$($RUN ffmpeg -hide_banner -i "$TMP/sum.wav" -af "loudnorm=I=$LUFS:TP=$TP:LRA=7:print_format=json" -f null - 2>&1 | sed -n '/^{/,/^}/p')
g(){ echo "$J" | grep "\"$1\"" | sed 's/.*: "\(.*\)".*/\1/'; }
$RUN ffmpeg -v error -y -i "$TMP/sum.wav" -af "loudnorm=I=$LUFS:TP=$TP:LRA=7:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,aresample=48000,aformat=sample_fmts=s32:channel_layouts=stereo" -c:a pcm_s24le "$TMP/ln.wav"
CUR=$($RUN ffmpeg -hide_banner -i "$TMP/ln.wav" -af ebur128 -f null - 2>&1 | grep -A3 "Integrated loudness" | grep " I:" | awk '{print $2}')
GAIN=$(python3 -c "print(round($LUFS - ($CUR), 2))"); LIM=$(python3 -c "print(round(10**(($TP-0.3)/20), 3))")
$RUN ffmpeg -v error -y -i "$TMP/ln.wav" -af "volume=${GAIN}dB,alimiter=limit=$LIM:attack=2:release=60:level=false,aresample=48000" -ac 2 -c:a pcm_s16le "$OUT"
echo "master_mix: $OUT ($D s, target $LUFS LUFS)"
