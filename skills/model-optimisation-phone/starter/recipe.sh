#!/usr/bin/env bash
# recipe.sh: the same safe recipe as optimise.mjs, as plain glTF Transform CLI commands.
# Use it when you want to see every step. optimise.mjs adds the guards, the report and the budget.
#   bash recipe.sh in.glb out.glb
# Needs: npm i -g @gltf-transform/cli   (or run through npx)
set -euo pipefail
IN="$1"; OUT="$2"; T="$(mktemp -d)"; trap 'rm -rf "$T"' EXIT
GT="${GT:-npx --yes @gltf-transform/cli}"

# 1. structure only, lossless: no simplify, no join/flatten/palette (they merge materials and can change looks)
$GT optimize "$IN" "$T/1.glb" --compress false --texture-compress false \
  --simplify false --join false --flatten false --palette false --instance true --resample true --prune true --weld true
# 2. textures: never upscale, cap at 2048 px (only if the source is bigger)
$GT resize "$T/1.glb" "$T/2.glb" --width 2048 --height 2048
# 3. colour and data maps: WebP q92. Normal maps: WebP near-lossless (lossy WebP bends normals, see SKILL.md)
$GT webp "$T/2.glb" "$T/3.glb" --slots "{baseColor,emissive,occlusion,metallicRoughness}*" --quality 92 --effort 80
$GT webp "$T/3.glb" "$T/4.glb" --slots "normal*" --near-lossless true --quality 40
# 4. geometry: meshopt with 16-bit positions, 12-bit normals, 14-bit UVs
$GT meshopt "$T/4.glb" "$OUT" --level medium --quantize-position 16 --quantize-normal 12 --quantize-texcoord 14
$GT inspect "$OUT" | head -40
