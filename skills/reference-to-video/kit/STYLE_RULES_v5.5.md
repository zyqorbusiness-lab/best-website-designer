# STYLE RULES v5.5 (replaces the v5.3 style rules where they differ)

Source: Sujon Hoque, Nov 4 2026 (12 new reference reels: "beast edit", "human-made not AI"). Tags: [M] = measured by code on the 12 refs, [E] = eyeballed.

| # | Rule | v5.5 | Was in v5.3 |
|---|---|---|---|
| S1 | Glow | **ALLOWED and wanted** on big words / keywords / extruded words, **warm only** (orange, amber, yellow, red). Soft bloom, opacity 0.35-0.6, radius ~9 % of letter height. | "Glow OFF" |
| S2 | Glow, still banned | blanket glow on a full-frame / adjustment layer; glow on every caption word; **any purple, violet, blue or cyan glow** | (same, plus all glow) |
| S3 | Colours | no purple/violet/blue/cyan/magenta anywhere (hue 175-320 deg, sat >= 45 %, share <= 6 % per frame, checked by qc F5) - unchanged. [M] 5 of the 12 refs themselves contain such colours (2, 6, 8, 9, 10): copy their structure, never their colour. | same |
| S4 | Fonts | **heavy bold display fonts like the refs**: Archivo Black (in fonts/, OFL), Anton or Archivo ExtraBold for big words, Inter Bold/Black for captions, one small serif/script accent. Up to 3 families per reel; one accent colour family per reel (red OR gold/yellow) + white. | "two font families only" |
| S5 | Big words | caps, 2.5D extrusion + gloss + warm glow (recipe 16, `fx_extrude_text.py`), pop per letter 3-frame stagger, rotation 2-8 deg, sizes varied inside one sentence. [E] seen in 8 of 12 refs (count from eyeballing). | gradient keyword |
| S6 | Human-made imperfection | timing jitter +-1 frame, rotation +-3 deg, scale +-6 %, grain 0.03-0.06, dust/paper texture, vignette, hand-wobble cursor, torn (not straight) edges, never the same tear/sound twice. Nothing perfectly centred or on the same millisecond. | grain only |
| S7 | Pace | median 2.3 s per shot, 24.7 hard cuts/min over the 12 refs [M]; range 6.6-50.4 cuts/min. Something new at least every 1.5 s; flash/B&W/punch-in on about one cut in three. | "something moves every 0.4-0.8 s" |
| S8 | Sound | audible, sparse, low-end heavy: see SOUND_DESIGN_v5.5.md (measured SFX gap; ours was 27 dB under the voice). | "1-3 sfx/s" |
| S9 | Honest claims | every number is tagged [M] or [E]; nothing is called AI-detectable/undetectable; tool names (Blender etc.) only where visible in the ref (only ref 12 shows Blender; ref 8's end card says "MADE BY A HUMAN"). | - |
| S10 | Before/after refs | take ONLY the edited/after part (refs 5, 6). | - |
| S11 | Text tool | text/effects in EffectCraft or Python (Pillow/ffmpeg). Never Blender for text. | same |

## Unchanged from v5.3
Honesty rules (no fake clients/reviews/results), real faces only with permission, no third-party media in a zip/repo, 1080x1920 30 fps, -14 LUFS, true peak <= -1 dBTP, safe area x 108-972 / y 192-1690, Pinterest first for every category.

## How the checks changed
`qc_v5.py` F2 no longer fails glow on text; it fails a blanket glow on an adjustment layer. F4/F5 still fail banned colours. New F15 fails sfx more than 18 dB under the voice.
