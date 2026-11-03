#!/bin/bash
# clean_voice.sh — Tab motion-kit v2 voice cleanup chain (Nov 3 2026)
# Usage: clean_voice.sh IN OUT [--nr fft+anlm|rnn|fft|anlm|off] [--music FILE] [--music-db -16] [--lufs -14] [--tp -1.5]
#   IN  : any video or audio file (voice track).  OUT: .mp4/.mov (video copied, new audio) or .wav/.m4a/.mp3 (audio only)
# Chain: 48k mono -> highpass 80 Hz -> NOISE REMOVAL -> EQ (mud cut 250 Hz, presence +3.5 kHz, air shelf 10 kHz)
#        -> de-ess -> compressor 3.5:1 -> [optional music bed, auto-ducked under the voice with sidechaincompress]
#        -> two-pass loudnorm to -14 LUFS / -1.5 dBTP -> limiter.
# Noise removal options (measured Nov 3 on clip.mp4 + added noise, see TAB_NOTES_v2 §Audio):
#   fft+anlm (default) afftdn light + anlmdn  -> best speech preservation, deepest floor on hiss/hum/fan noise
#   rnn               RNNoise neural model (audio/models/bd.rnnn) -> for traffic/crowd/keyboard; slightly more "processed"
#   fft / anlm / off
set -euo pipefail
IN="$1"; OUT="$2"; shift 2
NR="fft+anlm"; MUSIC=""; MDB="-16"; LUFS="-14"; TP="-1.5"
while [ $# -gt 0 ]; do case "$1" in
  --nr) NR="$2"; shift 2;; --music) MUSIC="$2"; shift 2;; --music-db) MDB="$2"; shift 2;;
  --lufs) LUFS="$2"; shift 2;; --tp) TP="$2"; shift 2;; *) echo "unknown arg $1"; exit 1;; esac; done
KIT="$(cd "$(dirname "$0")" && pwd)"
MODEL="$KIT/audio/models/bd.rnnn"
case "$NR" in
  fft+anlm) NRF="afftdn=nr=12:nf=-40:tn=1,anlmdn=s=5";;
  rnn)      NRF="afftdn=nr=8:nf=-45:tn=1,arnndn=m=$MODEL:mix=0.85";;
  fft)      NRF="afftdn=nr=20:nf=-40:tn=1";;
  anlm)     NRF="anlmdn=s=5";;
  off)      NRF="anull";;
  *) echo "bad --nr $NR"; exit 1;;
esac
VOICE="aresample=48000,pan=mono|c0=0.5*c0+0.5*c1,highpass=f=80,lowpass=f=16000,$NRF,equalizer=f=250:t=q:w=1.2:g=-2.5,equalizer=f=3500:t=q:w=1.4:g=2.5,highshelf=f=10000:g=2,deesser=i=0.4:m=0.5:f=0.5,acompressor=threshold=-24dB:ratio=4:attack=4:release=90:knee=4:makeup=4"
TMP="$(mktemp -d /tmp/cleanvoice.XXXX)"; trap 'rm -rf "$TMP"' EXIT
RUN="nice -n 10 timeout -k 10 600"
if [ -n "$MUSIC" ]; then
  # music bed: loop to length, set bed level, duck it under the voice (sidechain = processed voice)
  FC="[0:a]$VOICE,asplit=2[v][sc];[1:a]aresample=48000,aformat=channel_layouts=stereo,volume=${MDB}dB[m];[m][sc]sidechaincompress=threshold=0.02:ratio=8:attack=15:release=400:makeup=1[md];[v]aformat=channel_layouts=stereo[vs];[vs][md]amix=inputs=2:duration=first:normalize=0[mix]"
  $RUN ffmpeg -v error -y -i "$IN" -stream_loop -1 -i "$MUSIC" -filter_complex "$FC" -map "[mix]" -c:a pcm_s24le "$TMP/pre.wav"
else
  $RUN ffmpeg -v error -y -i "$IN" -af "$VOICE" -c:a pcm_s24le "$TMP/pre.wav"
fi
# loudnorm pass 1 (measure)
J=$($RUN ffmpeg -hide_banner -i "$TMP/pre.wav" -af "loudnorm=I=$LUFS:TP=$TP:LRA=7:print_format=json" -f null - 2>&1 | sed -n '/^{/,/^}/p')
g(){ echo "$J" | grep "\"$1\"" | sed 's/.*: "\(.*\)".*/\1/'; }
LN="loudnorm=I=$LUFS:TP=$TP:LRA=7:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true"
$RUN ffmpeg -v error -y -i "$TMP/pre.wav" -af "$LN,aresample=48000,aformat=sample_fmts=s32:channel_layouts=stereo" -c:a pcm_s24le "$TMP/ln.wav"
# pass 3: trim to the exact target with a true-peak limiter (loudnorm alone lands ~0.5 LU low on peaky voice)
CUR=$($RUN ffmpeg -hide_banner -i "$TMP/ln.wav" -af ebur128 -f null - 2>&1 | grep -A3 "Integrated loudness" | grep " I:" | awk '{print $2}')
GAIN=$(python3 -c "print(round($LUFS - ($CUR), 2))")
LIM=$(python3 -c "print(round(10**(($TP-0.3)/20), 3))")
FINAL="volume=${GAIN}dB,alimiter=limit=$LIM:attack=2:release=60:level=false,aresample=48000,aformat=sample_fmts=s32:channel_layouts=stereo"
$RUN ffmpeg -v error -y -i "$TMP/ln.wav" -af "$FINAL" -c:a pcm_s24le "$TMP/final.wav"
FINAL="anull"
case "${OUT,,}" in
  *.mp4|*.mov|*.mkv)
    $RUN ffmpeg -v error -y -i "$IN" -i "$TMP/final.wav" -map 0:v:0 -map 1:a:0 -af "$FINAL" -c:v copy -c:a aac -b:a 192k -ac 2 -shortest -movflags +faststart "$OUT";;
  *.wav) $RUN ffmpeg -v error -y -i "$TMP/final.wav" -af "$FINAL" -ac 2 -c:a pcm_s16le "$OUT";;
  *) $RUN ffmpeg -v error -y -i "$TMP/final.wav" -af "$FINAL" -ac 2 -b:a 192k "$OUT";;
esac
echo "clean_voice: $IN -> $OUT (nr=$NR music=${MUSIC:-none} target ${LUFS} LUFS)"
