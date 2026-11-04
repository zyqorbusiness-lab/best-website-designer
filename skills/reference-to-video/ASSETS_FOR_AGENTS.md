# ASSETS_FOR_AGENTS - where the media is and how to use it

## PERMISSION (owner's standing word, Sujon Hoque, Nov 4 2026)
The owner (Sujon Hoque) has given this agent permission to take media from Pinterest directly for his edits (read-only: no saving, no boards, no likes, no follows), to log the pin URL and creator, and not to worry about licence. Beast music (phonk, cinematic trailer, trap, high-energy) is welcome. Never put third-party media into a PUBLIC repo, page or release: the ready-made asset library is in the PRIVATE repo `zyqorbusiness-lab/zyqor-assets` (see `ASSETS_FOR_AGENTS.md`).

## Where the assets are
Private repo **zyqorbusiness-lab/zyqor-assets** (visibility: PRIVATE; never make it public, never copy its files into this public repo). Needs access to the zyqorbusiness-lab account (git credential or `gh auth login`).

```
git clone https://github.com/zyqorbusiness-lab/zyqor-assets.git
cd zyqor-assets
python3 tools/join_parts.py assets          # files over 2.4 MB are stored as NAME.partNNN; this glues them back
python3 tools/join_parts.py --verify assets # every file in assets/MANIFEST.csv exists with the listed size
python3 tools/pick_asset.py music --beast   # rank by measured numbers
```
Single file without cloning: `https://raw.githubusercontent.com/zyqorbusiness-lab/zyqor-assets/main/assets/<path>` (needs auth because the repo is private; parts must be fetched and joined).

## Layout (174 assets, ~193 MB)
- `assets/pinterest/music/<pin id>.m4a` (28: 20 older TAKE beds + 8 beast tracks from a read-only search: 3 'MrBeast + phonk', NEXT!, a Montagem phonk remix, 2 cinematic trailer, 1 epic-trap beat)
- `assets/pinterest/broll/<pin id>.mp4` (26), `assets/pinterest/subject/<pin id>.mp4` (15), `assets/pinterest/sfx/<pin id>.mp4` (24: light leaks, overlays, glitch, zoom, sticker pops, sound-fx). Video: <= 720p h264 crf 28, trimmed to the first 20 s.
- `assets/pinterest/transitions/<pin id>.mp4` (24: transition clips from Pinterest, added Nov 4 2026, each <= 8 s, <= 720p; 5 from the kit pin lists + 19 from a read-only search: green-screen transitions (key them out), dark overlays (blend screen/add), shake/zoom/whip, ink/paint wipes, flash/blast; colour-measured, not judged by eye).
- `assets/sfx_sujon/<folder>/<name>.wav`: Sujon's own pack (57 wav, 48 kHz 16-bit): whoosh, Whoosh hits, Epic Braams, Buttons, Impact, violin, Transitions, Foley, Glitch, Zap, vocal, Count.
- `assets/MANIFEST.csv` columns: pin_id, url, category, kind, duration_s, resolution, size_mb, verdict, banned_hue_mean_pct, banned_hue_peak_pct, local_filename (relative to assets/), status, creator, title, source_list, note, parts.
- `assets/MUSIC_SPECTRUM.csv` (per music track: dur, mean RMS dB, low<150 Hz share, sub<80 share, centroid Hz, bpm guess, loudness range) and `assets/sfx_sujon/INDEX.csv` (per sample: dur, peak, rms, time to -20/-30 dB, centroid, low<200 / sub<100 / 2-5 kHz shares, kit_gain_db).
- Only pins judged TAKE are inside; the 83 SKIP pins are not. Pin id is the number in `pinterest.com/pin/<id>/`; the URL is in the manifest.

## Pick by MEASURED numbers (agents cannot listen; the owner's ears decide)
- `pick_asset.py music --beast`: low<150 Hz share >= 0.6, mean RMS above -12 dB, tempo >= 120, wide dynamic range. `--bed`: RMS near -14 dB, centroid ~350 Hz, small swings (sits under a voice).
- `pick_asset.py sfx --hit`: <= 15 s with a short useful head, big sub-100 Hz, almost nothing at 2-5 kHz (that band is the 'cheap click'). The 5 Impact files run 11-14 s with ~10 s tails: cut to ~2 s + 0.5 s fade. `--riser`: >= 2 s, peak late. `--whoosh`: 0.4-3 s. `--accent`: Glitch/Zap/Button/Foley, 1-2 per reel at most.
- Reference sound pattern (measured on 12 reels): ~0.46 low-heavy hits/s plus ~10 risers/min, sfx 6-10 dB under the voice peak, true peak about -1 dBTP. Gate: `audio_gap.py` / QC F15.

## Rules that still apply to every edit
- No purple, violet, blue or cyan anywhere (hue 175-320 deg, saturation >= 0.45, value >= 0.35 over 6 % of a frame fails). Warm glow on big words is allowed and wanted.
- Voice exactly once in the mix (QC F14); final -14 LUFS integrated, true peak about -1 dBTP, 1080x1920 30 fps, WhatsApp copy <= 16 MB.
- Honest claims: concepts labelled as concepts; no fake clients/reviews/results; tag every statement [measured] or [eyeballed]. Say plainly when a clip is a stranger's footage.
- Copy what you use into your own project folder and log the pin (`assets_log.json`); do not edit the library in place.

## Honest limits of this library
Nobody listened to any track or sfx: all audio claims are numbers. Some 'beast' pins are edit videos, so the audio can carry voice lines or baked-in sfx: check the first seconds. 'No copyright' is only the uploader's claim and unverified (the owner said not to worry about licence). Video colour was measured at 3 frames/s on the trimmed clip: a 1-frame flash could slip through. BPM is an autocorrelation guess (can be 2x off).
