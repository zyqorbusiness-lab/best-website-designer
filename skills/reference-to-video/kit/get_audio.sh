#!/bin/bash
# get_audio.sh — download the licensed Mixkit sound effects + music the kit uses (Mixkit's licence lets you use them in videos,
# but not re-share the files themselves, so the kit ships this list instead of the files). Run: bash tools/get_audio.sh (from anywhere; it writes tools/sfx_v2 and tools/music).
# Licences: https://mixkit.co/license/#sfxFree (sfx) · https://mixkit.co/license/#musicFree (music). Checked byte-for-byte on Nov 3 2026.
case "${1:-}" in -h|--help) sed -n '2,4p' "$0"; exit 0;; esac
set -e; cd "$(dirname "$0")"; mkdir -p sfx_v2 music
get() { [ -s "$1" ] || curl -fsSL -o "$1" "$2"; echo "ok $1"; }
get sfx_v2/whoosh.mp3         https://assets.mixkit.co/active_storage/sfx/1490/1490-preview.mp3   # #1490 Fast whoosh transition
get sfx_v2/whoosh2.mp3        https://assets.mixkit.co/active_storage/sfx/1489/1489-preview.mp3   # #1489 Air woosh
get sfx_v2/whoosh_fast.mp3    https://assets.mixkit.co/active_storage/sfx/1492/1492-preview.mp3   # #1492 Cinematic whoosh fast transition
get sfx_v2/sweep_small.mp3    https://assets.mixkit.co/active_storage/sfx/166/166-preview.mp3   # #166 Fast small sweep transition
get sfx_v2/tech_slide.mp3     https://assets.mixkit.co/active_storage/sfx/3120/3120-preview.mp3   # #3120 Technology transition slide
get sfx_v2/zoom_vacuum.mp3    https://assets.mixkit.co/active_storage/sfx/2608/2608-preview.mp3   # #2608 Air zoom vacuum
get sfx_v2/pop.mp3            https://assets.mixkit.co/active_storage/sfx/2364/2364-preview.mp3   # #2364 Hard pop click
get sfx_v2/pop2.mp3           https://assets.mixkit.co/active_storage/sfx/3005/3005-preview.mp3   # #3005 Explainer video pops whoosh light pop
get sfx_v2/click.mp3          https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3   # #2568 Cool interface click tone
get sfx_v2/typing.mp3         https://assets.mixkit.co/active_storage/sfx/1393/1393-preview.mp3   # #1393 Smartphone typing
get sfx_v2/riser.mp3          https://assets.mixkit.co/active_storage/sfx/1144/1144-preview.mp3   # #1144 Short space stutter intro riser
get sfx_v2/impact.mp3         https://assets.mixkit.co/active_storage/sfx/1143/1143-preview.mp3   # #1143 Cinematic whoosh deep impact
get sfx_v2/bass.mp3           https://assets.mixkit.co/active_storage/sfx/2299/2299-preview.mp3   # #2299 Short bass hit
get sfx_v2/notif.mp3          https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3   # #2354 Message pop alert
get sfx_v2/ding.mp3           https://assets.mixkit.co/active_storage/sfx/2870/2870-preview.mp3   # #2870 Correct answer tone
get sfx_v2/glitch_text.mp3    https://assets.mixkit.co/active_storage/sfx/2950/2950-preview.mp3   # #2950 Intro text glitch
get sfx_v2/glitch_break.mp3   https://assets.mixkit.co/active_storage/sfx/2951/2951-preview.mp3   # #2951 Digital glitch break
get music/uplifting_bass_726.mp3   https://assets.mixkit.co/music/726/726.mp3
get music/digital_clouds_175.mp3   https://assets.mixkit.co/music/175/175.mp3
get music/better_times_173.mp3     https://assets.mixkit.co/music/173/173.mp3
# cash.mp3 and shutter.mp3 (also Mixkit) have no recorded id: download any Mixkit 'cash register' and 'camera shutter' sfx
# from mixkit.co/free-sound-effects/ and save them as sfx_v2/cash.mp3 and sfx_v2/shutter.mp3.
# Your starter kit's own sfx/ folder (chime, counter, pop, snap, tick...) works too — those are free to use anywhere.
