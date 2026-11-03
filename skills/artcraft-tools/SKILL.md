---
name: artcraft-tools
description: The ArtCraft suite — 15 free, open-source (Rust) desktop apps that replace the Adobe/Office stack — what each one does, which paid app it replaces, how mature it is (as of Nov 3 2026), and where it fits in a web-design + motion-graphics workflow. EffectCraft (the After Effects alternative) is the one with a headless CLI we script.
when_to_use: "free Adobe alternative", "free After Effects / Premiere / Photoshop", "ArtCraft", choosing tools for a no-subscription studio setup
license: MIT (text)
version: 1.0.0
---

# ArtCraft tools (free Adobe alternatives)

Sujon sent this list on Nov 3 2026 as his free replacement for the Adobe apps, with his own warning: **"maturity differs, don't treat them as fully ready Adobe replacements."**
Site: https://getartcraft.com/ · Source: https://github.com/storytold (each app is its own repo) · Free, open source, no subscription · macOS, Windows, Linux (most also have a web build).
Install all of them with the **ArtCraft Launcher** (v0.13.0 on Nov 3), or each app standalone from its page.

| app | what it does | replaces | maturity (its own page, Nov 3 2026) | where it fits for Zyqor |
|---|---|---|---|---|
| [PhotoCraft](https://getartcraft.com/apps/photocraft) | Image editor: layers, masks, adjustment layers, layer styles, type, vectors, brushes | Photoshop | Early alpha | thumbnails, cover frames, cut-outs for reels |
| [VectorCraft](https://getartcraft.com/apps/vectorcraft) | Vector illustration (pen, panels, shortcuts); MCP server so an AI agent can draw | Illustrator | In development | logos, icons, stickers, SVG shapes for motion graphics |
| [FilmCraft](https://getartcraft.com/apps/filmcraft) | Video editor: source/program monitors, real timeline, every trim mode, J/K/L, its own codecs | Premiere Pro | In development | assembling clips, cutting talking heads, final timeline |
| [LightCraft](https://getartcraft.com/apps/lightcraft) | Photo library + non-destructive raw developer (32-bit float pipeline) | Lightroom | In development | grading photos used in sites/reels |
| [PdfCraft](https://getartcraft.com/apps/pdfcraft) | PDF workbench: read, organise, combine, split, secure | Acrobat | Early alpha | client proposals, guides like this PDF |
| [EffectCraft](https://getartcraft.com/apps/effectcraft) | Motion graphics & VFX compositor: comps, layers, keyframes, graph editor, 259+ effects, expressions, 3D cameras/lights, render queue, headless CLI + JSX scripting + MCP | After Effects | In development ("young, already usable") | our compositor: glow, transitions, RGB split, light leaks, captions over Blender renders (scripted) |
| [DesignCraft](https://getartcraft.com/apps/designcraft) | Page layout & publishing: spreads, parent pages, threaded stories, styles | InDesign | In development | printed/PDF layouts, brochures |
| [FigCraft](https://getartcraft.com/apps/figcraft) | Interface design: frames, auto layout, components/variants, prototypes, live sessions | Figma / Adobe XD | Early alpha | website/app UI design before code |
| [WordCraft](https://getartcraft.com/apps/wordcraft) | Word processor (ribbon, styles, track changes, .docx) | Word (Microsoft) | In development | scripts, briefs, contracts |
| [SoundCraft](https://getartcraft.com/apps/soundcraft) | DAW: Edit + Mix windows, multitrack audio and MIDI, inserts/sends, AudioSuite | Audition / Pro Tools | In development | voice cleanup, sfx layering, music edits |
| [DeckCraft](https://getartcraft.com/apps/deckcraft) | Presentations: masters, themes, shapes, transitions, presenter view | PowerPoint / Keynote | In development | pitch decks for clients |
| [CADCraft](https://getartcraft.com/apps/cadcraft) | CAD & drafting: command line, snaps, layers, dimensions, hatches, blocks; built for people and AI agents | AutoCAD | In development | floor plans / technical drawings (rarely needed) |
| [GridCraft](https://getartcraft.com/apps/gridcraft) | Spreadsheets: 500+ functions, dynamic arrays, PivotTables, charts, .xlsx | Excel | In development | lead lists, budgets, content calendars |
| [TextureCraft](https://getartcraft.com/apps/texturecraft) | 3D texture painting: PBR layers, masks, baked maps, smart materials, export for any engine | Substance Painter | In development | custom materials for Blender/three.js models |
| [Craft Anything](https://getartcraft.com/apps/craft-anything) | Study websites/apps/games/files with evidence-backed tools, then build your own with a coding agent | (no Adobe equivalent) | Early alpha | teardowns of award sites before building |

Also from ArtCraft: **ArtCraft Studio** (https://app.getartcraft.com) — a generative image/video studio (scene composing, image-to-3D, posing, background removal) that uses AI models; separate from the 15 crafting apps.

## How we use them
- **EffectCraft** is in our pipeline today: Blender renders the 3D, an EffectCraft JSX script builds the comp and renders it headless (`effectcraft-cli script comp.jsx` → `effectcraft-cli render ...`). Open the same `.ecproj` in the EffectCraft GUI to tweak by hand. See [effectcraft-compositing](../effectcraft-compositing/).
- **FilmCraft / SoundCraft**: good for hands-on editing on a PC; our automated pipeline uses ffmpeg + scripts for the same jobs (cut, mix, loudness) because they are scriptable today.
- **TextureCraft**: paint custom PBR textures for Blender or three.js models; export maps into the materials described in [motion-graphics-blender](../motion-graphics-blender/) and [threejs-3d-premium](../threejs-3d-premium/).
- **FigCraft / PhotoCraft / VectorCraft**: design the UI and assets that later appear on the 3D screen in promos.
- Maturity: "early alpha" apps (PhotoCraft, PdfCraft, FigCraft, Craft Anything) can lose work — save often and keep exports; "in development" apps are usable for real projects but expect missing features compared with Adobe.
