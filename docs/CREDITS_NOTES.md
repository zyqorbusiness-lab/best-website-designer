# Credits: build notes (hand-written)

The authoritative, generated list of every asset with its exact licence is [CREDITS.md](../CREDITS.md). These notes keep the build history.


Everything on this site is hand-coded by Zyqor Studio unless listed here. No AI-generated images are used in the Lab demos; their visuals are code-made (three.js, canvas, SVG, CSS), open-licence 3D models and credited photos.

## Libraries (self-hosted in `site/vendor/`)

- [three.js](https://threejs.org) r170, MIT licence (incl. GLTFLoader, meshopt decoder and other addons from its examples folder).
- [GSAP](https://gsap.com) 3 and ScrollTrigger, GreenSock standard no-charge licence (free for commercial use since GSAP 3.13).
- [Lenis](https://github.com/darkroomengineering/lenis) smooth scroll, MIT licence.
- [Matter.js](https://brm.io/matter-js/) physics, MIT licence.

## Fonts (self-hosted WOFF2 in `site/assets/font/`: Google Fonts families under the SIL Open Font License 1.1; Fontshare families under the Fontshare Free Font Licence, as marked)

- Anton by Vernon Adams
- Archivo by Omnibus-Type
- Bricolage Grotesque by Mathieu Triay
- Cabinet Grotesk by Indian Type Foundry (Fontshare Free Font Licence)
- Fraunces by Undercase Type
- General Sans by Indian Type Foundry (Fontshare Free Font Licence)
- Instrument Serif by Instrument
- Inter Tight by Rasmus Andersson
- Satoshi by Indian Type Foundry (Fontshare Free Font Licence)
- Space Grotesk by Florian Karsten
- Unbounded by NaN
- Zodiak by Indian Type Foundry (Fontshare Free Font Licence)

## 3D models (in `site/assets/models/`, optimised with meshopt + WebP)

From the [Khronos glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets) collection; each model keeps its own licence, named in the demo that uses it (below).

## Per Lab concept

### 01 Stride Aero (Sneaker)
- Code and design: Zyqor Studio (MIT licence for the code).
- 3D model: "Materials Variants Shoe" by Shopify, CC-BY 4.0, via the [Khronos glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets), re-textured and recompressed by Zyqor Studio. Colourway names and the Stride Aero brand are fictional.
- Studio lighting: "Studio Small 09" HDRI by Sergej Majboroda, Poly Haven, CC0 (desktop build).
- Fonts: Archivo by Omnibus-Type and Inter Tight by Rasmus Andersson et al., SIL Open Font License 1.1.
- Product specs are part of the concept and describe no real shoe.

### 02 Meridian (Watch)
- Code and design: Zyqor Studio (MIT licence for the code).
- The watch, strap and case are procedural three.js geometry and textures made for this concept (lathe and extruded parts, generated leather grain and sunburst maps). There is no model download and no photography.
- Studio lighting: "Studio Small 09" HDRI by Sergej Majboroda, Poly Haven, CC0.
- Fonts: Anton by Vernon Adams and Inter Tight by Rasmus Andersson et al., SIL Open Font License 1.1.
- Meridian, the calibre name and every spec on this page are fictional.

### 03 Hush One (Headphones)
- Code and design: Zyqor Studio (MIT licence for the code).
- The headphones are procedural three.js geometry made for this concept (v2 rebuild: superellipse cups, swept leather band with stitching, brushed-aluminium yokes and sliders). Leather grain, cloth weave and brushed-metal maps are generated in code at load: no model or image download, no photography.
- Studio lighting: "Studio Small 09" HDRI by Sergej Majboroda, Poly Haven, CC0 (desktop build).
- Contact shadow technique after the three.js "contact shadows" example (MIT).
- Fonts: Unbounded by NORD ID and Inter Tight by Rasmus Andersson et al., SIL Open Font License 1.1.
- Hush One and every spec on this page are fictional.

### 04 Ember & Oak (Coffee roasters)
- Code, design and every 3D object (stoneware cup and saucer, steel teaspoon, crema and latte art, coffee beans, steam): Zyqor Studio, modelled in code with three.js (MIT licence for the code).
- Studio lighting: "Studio Small 09" HDRI by Sergej Majboroda, Poly Haven, CC0.
- Fonts: Anton by Vernon Adams and Inter Tight by Rasmus Andersson et al., SIL Open Font Licence, via Google Fonts (self-hosted).
- Inspiration: paper-tear and travelling-object patterns from Instagram design reels; no assets reused.

### 05 Verdant (Plant studio)
- Code and design: Zyqor Studio (MIT licence for the code).
- 3D model: [Potted Plant 02](https://polyhaven.com/a/potted_plant_02) by Rico Cilliers, Poly Haven (CC0), a photoscanned plant in a terracotta pot; textures recompressed to WebP. The phone page uses stills rendered from it.
- Studio lighting: "Studio Small 09" HDRI by Sergej Majboroda, Poly Haven, CC0.
- Photos via Wikimedia Commons: [Monstera deliciosa 30zz](https://commons.wikimedia.org/wiki/File:Monstera_deliciosa_30zz.jpg) and [Monstera deliciosa 16zz](https://commons.wikimedia.org/wiki/File:Monstera_deliciosa_16zz.jpg) by David J. Stang (CC BY-SA 4.0); [Calathea zebrina leaves](https://commons.wikimedia.org/wiki/File:Starr-070906-8751-Calathea_zebrina-leaves-Kula_Ace_Hardware_and_Nursery-Maui_(24798559861).jpg) and [Nephrolepis leaves](https://commons.wikimedia.org/wiki/File:Starr-070906-8737-Nephrolepis_sp-leaves-Kula_Ace_Hardware_and_Nursery-Maui_(24596444130).jpg) by Forest and Kim Starr (CC BY 3.0 US); [Sansevieria trifasciata](https://commons.wikimedia.org/wiki/File:Sansevieria_trifasciata_%E2%80%93_any%C3%B3snyelv.jpg) by Ujlak (CC BY-SA 3.0); [Ficus lyrata leaf](https://commons.wikimedia.org/wiki/File:Ficus_lyrata_leaf.jpg) by seeks2dream (CC BY-SA 2.0). Cropped and resized.
- Fonts: Fraunces by Undercase Type and Inter Tight by Rasmus Andersson et al., SIL Open Font Licence (self-hosted).

### 06 Dew Theory (Skincare)
- Code, design and every 3D object (glass dropper bottle with serum, cleanser, balm jar, plinths, clouds) and every texture (printed labels, shadows, caustics): Zyqor Studio, modelled in code with three.js (MIT licence for the code).
- Fonts: Instrument Serif by Rodrigo Fuenzalida and Jordan Egstad, and Inter Tight by Rasmus Andersson et al., SIL Open Font Licence (self-hosted).
- Studio lighting on desktop: "Studio Small 09" HDRI by Sergej Majboroda, Poly Haven, CC0.
- Ingredient percentages are part of the fictional product, not a real formula.

### 07 VOLT (Sparkling energy)
- Code, design and the 3D cans (procedural three.js lathe geometry, stamped tab, generated brushed-metal, print and condensation maps): Zyqor Studio (MIT licence for the code).
- Studio lighting: "Studio Small 09" HDRI by Sergej Majboroda, Poly Haven, CC0.
- Fonts: Anton by Vernon Adams and Inter Tight by Rasmus Andersson et al., both SIL Open Font Licence, via Google Fonts.
- Libraries: three.js (MIT), GSAP (Standard licence), Lenis (MIT).
- VOLT, its flavours and its formula are fictional. No real drink or company is shown.

### 08 Umami Ring (Ramen bar)
- Code, design and the 3D bowls (procedural three.js geometry: lathe-turned bowls with foot ring and rolled rim, wavy tube noodles, extruded toppings, generated colour, roughness and normal maps, shader steam): Zyqor Studio (MIT licence for the code).
- Studio lighting: "Studio Small 09" HDRI by Sergej Majboroda, Poly Haven, CC0 (desktop build).
- Fonts: Bricolage Grotesque by Mathieu Triay and Inter Tight by Rasmus Andersson et al., both SIL Open Font Licence, via Google Fonts.
- Libraries: three.js (MIT), GSAP (Standard licence), Lenis (MIT).
- Umami Ring, its dishes and its hours are fictional. No real restaurant is shown.

### 09 Signal Studio (Creative agency)
- Code and design: Zyqor Studio (MIT licence for the code). Cards, tiles and icons are drawn in CSS and SVG; no photos are used.
- 3D: the "One" speaker is modelled in code with three.js (MIT): lathe-turned aluminium, procedural woven fabric, rubber foot, LED ring. The card and phone stills are rendered from the same scene.
- Studio lighting: "Studio Small 09" HDRI by Sergej Majboroda, Poly Haven, CC0.
- Fonts: Unbounded by NORD ID and Inter Tight by Rasmus Andersson et al., both SIL Open Font Licence, via Google Fonts.
- Libraries: GSAP (Standard licence), Matter.js (MIT), Lenis (MIT).
- Signal Studio is a fictional agency: no real clients, work, reviews or results are shown.

### 10 Volta One (Electric car)
- Code and design: Zyqor Studio (MIT licence for the code).
- 3D model: "Car Concept" by Eric Chadwick, © 2024 Darmstadt Graphics Group GmbH, from the Khronos glTF Sample Assets (github.com/KhronosGroup/glTF-Sample-Assets), CC-BY 4.0; recoloured, licence plate removed, compressed by Zyqor Studio. A fictional concept car, no real brand.
- Studio lighting: "Studio Small 09" HDRI by Sergej Majboroda, Poly Haven, CC0.
- Fonts: Unbounded (Google Fonts, SIL Open Font License 1.1) and Space Grotesk (Florian Karsten, SIL Open Font License 1.1).
- Libraries: three.js (MIT), GSAP and ScrollTrigger (GreenSock standard licence), Lenis (MIT).

### 11 Nook (Furniture)
- Code and design: Zyqor Studio (MIT licence for the code). Swatches, books, artwork, window and curtains are made in code.
- 3D models: "Modern Arm Chair 01" by Vibrant Nordic (cushion texture converted to neutral grey and recoloured in code), "Side Table 01" and "Modern Ceiling Lamp 01", Poly Haven, CC0 (polyhaven.com).
- Textures: "Herringbone Parquet", "Hessian 230", "Plastered Wall" and "Rough Linen", Poly Haven, CC0.
- Studio lighting: "Studio Small 09" HDRI by Sergej Majboroda, Poly Haven, CC0.
- Fonts: Instrument Serif (Instrument, SIL Open Font License 1.1) and Inter Tight (Tobias Whetton, SIL Open Font License 1.1).
- Libraries: three.js (MIT), GSAP and ScrollTrigger (GreenSock standard licence), Lenis (MIT).

### 12 Carmine No.7 (Fountain pen ink)
- Code and design: Zyqor Studio (MIT licence for the code). Page generated with Zyqor Video Flow.
- Footage: [Texture of red ink in water on a white background (clip 41999)](https://mixkit.co/free-stock-video/texture-of-red-ink-in-water-on-a-white-background-41999/) by Mixkit, Mixkit Stock Video Free License (trimmed and cut into frames).
- Fonts: Anton and Space Grotesk, SIL Open Font License.

### 13 Longway (Overland road trips)
- Code and design: Zyqor Studio (MIT licence for the code). Page generated with Zyqor Video Flow.
- Footage: [Going down a curved highway through a mountain range (clip 41576)](https://mixkit.co/free-stock-video/going-down-a-curved-highway-through-a-mountain-range-41576/) by Mixkit, Mixkit Stock Video Free License (trimmed and cut into frames).
- Fonts: Bricolage Grotesque and Inter Tight, SIL Open Font License.

### 14 Rise No.3 (Sparkling strawberry water)
- Code and design: Zyqor Studio (MIT licence for the code). Page generated with Zyqor Video Flow.
- Footage: [Strawberries Splashing With Yellow Backdrop (clip 101341)](https://mixkit.co/free-stock-video/strawberries-splashing-with-yellow-backdrop-101341/) by Mixkit, Mixkit Stock Video Free License (cut into frames).
- Fonts: Archivo and Inter Tight, SIL Open Font License.

### 15 Fumée (Perfume house)
- Code, design, shaders and the flacon drawing: Zyqor Studio (MIT licence for the code). "Fumée" and its three scents are fictional.
- Photos (Unsplash License, free to use; cropped, resized and converted to WebP): [figs on dark wood](https://unsplash.com/photos/green-round-fruit-on-brown-wooden-table-vtP7PpYlzzQ), [incense cone by a window](https://unsplash.com/photos/black-incense-burning-in-room-9M4asMDP7vQ), [jasmine against a dark background](https://unsplash.com/photos/delicate-white-jasmine-flowers-bloom-against-dark-background-hp3SP0d5GTw), [halved figs](https://unsplash.com/photos/fresh-figs-halved-and-quartered-on-a-plate-sYTOxXNzLhs) and [incense stick with smoke](https://unsplash.com/photos/brown-wooden-stick-with-black-smoke-d_YI6RQdyoE), all via Unsplash.
- Fonts: Boska and General Sans by the Indian Type Foundry, via Fontshare (ITF Free Font License), self-hosted.
- Animation: GSAP 3.15 with ScrollTrigger and SplitText (GreenSock standard licence), Lenis smooth scroll (MIT), three.js r170 (MIT).

### 16 Plinth (Architecture quarterly)
- Code, layout and copy: Zyqor Studio (MIT licence for the code). Plinth is a fictional magazine; the features, page numbers and captions are invented for this concept.
- Typefaces: Zodiak (variable, roman and italic) and Switzer (variable) by Indian Type Foundry, from [Fontshare](https://www.fontshare.com), ITF Free Font License (FFL). Served unmodified, self-hosted.
- Photographs from Pexels, used under the [Pexels License](https://www.pexels.com/license/) (free to use, no attribution required; credited here with thanks to each photographer on Pexels), resized to WebP: [Minimalist architecture with curved archways](https://www.pexels.com/photo/minimalist-architecture-with-curved-archways-39107769/); [Minimalist concrete curved wall interior](https://www.pexels.com/photo/minimalist-concrete-curved-wall-interior-36248801/); [Brutalist architecture, covered concrete walk](https://www.pexels.com/photo/brutalist-architecture-in-san-diego-31044660/); [Minimalist concrete staircase with shadows](https://www.pexels.com/photo/minimalist-concrete-staircase-with-shadows-39031396/); [Abstract shadows on a concrete staircase](https://www.pexels.com/photo/abstract-shadows-on-concrete-staircase-39814976/); [Shadow on a concrete stairway, black and white](https://www.pexels.com/photo/shadow-on-concrete-stairway-in-black-and-white-39500420/); [Curved staircase in modern architecture](https://www.pexels.com/photo/elegant-curved-staircase-in-modern-architecture-34482407/); [Ancient stone archway corridor with shadows](https://www.pexels.com/photo/ancient-stone-archway-corridor-with-shadows-29403393/); [Spiral staircase, looking up](https://www.pexels.com/photo/elegant-spiral-staircase-architecture-in-hamburg-30368412/); [Spiral staircase in modern architecture](https://www.pexels.com/photo/elegant-spiral-staircase-in-modern-architecture-38064798/); [Brutalist architecture with a concrete staircase](https://www.pexels.com/photo/modern-brutalist-architecture-with-concrete-staircase-39486678/); [Architectural corridor with shadows](https://www.pexels.com/photo/elegant-architectural-corridor-with-shadows-30507862/).

### 17 HALDE R1 (Rangefinder camera)
- Camera: [Camera 01](https://polyhaven.com/a/Camera_01) by Rajil Jose Macatangay / Poly Haven, CC0 1.0. The scanned body, lens and textures were compressed and original markings reworked for fictional brand HALDE.
- Studio environment: [Studio Small 09](https://polyhaven.com/a/studio_small_09) by Sergej Majboroda / Poly Haven, CC0 1.0.
- Fonts: Cabinet Grotesk by Indian Type Foundry / Fontshare, ITF Free Font License; Instrument Serif by Rodrigo Fuenzalida, SIL Open Font License 1.1.
- Design, code and branding: Zyqor Studio. Fictional brand; not an actual camera or product listing.

### 18 TALUS Ridge C1 (Carbon trail bike)
- Code and design: Zyqor Studio (MIT licence for the code). TALUS and Ridge C1 are fictional; this is a concept, not a product for sale.
- 3D model: "Carbon Frame Bike" by Robert Schweier and [prefrontal cortex](https://prefrontalcortex.de) (realtime version and animation by Felix Herbst, with support from Needle), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), via the [USD-WG assets](https://github.com/usd-wg/assets/tree/main/full_assets/CarbonFrameBike) / [Khronos glTF sample](https://github.com/KhronosGroup/glTF-Sample-Models/pull/357). Modified by Zyqor Studio: original builder and studio logos replaced with the fictional TALUS mark, frame paint recoloured, compressed (meshopt, WebP). The modified model is shared under the same CC BY-SA 4.0 licence.
- Studio lighting: "Studio Small 09" HDRI by Sergej Majboroda, Poly Haven, CC0.
- Type: Bricolage Grotesque (SIL Open Font Licence) and Satoshi by Indian Type Foundry (Fontshare free licence).

## Code from other projects

- Scroll scrub engine (`site/scrub-engine.js`): adapted from
  [scroll-world](https://github.com/oso95/scroll-world) by cyw, MIT License,
  Copyright (c) 2026 cyw. Zyqor Studio's changes are MIT too. The full licence text is
  at the top of the file.

## Home page

- Intro scroll-world clips, case-study videos, photos and copy: made for Zyqor Studio, all rights reserved.
- The six projects in Work are Sujon Hoque's own live sites.


---


## Stride Aero (Concept 01)
- Sneaker mesh, diffuse/normal/occlusion-roughness-metalness texture sources: “Materials Variants Shoe,” Shopify © 2021, Creative Commons Attribution 4.0 International (CC-BY 4.0), via [Khronos glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/MaterialsVariantsShoe). Recompressed to WebP + meshopt and resized for desktop/phone. Colourway names and STRIDE branding are fictional; no real brand mark present.
- Studio lighting: “Studio Small 09” HDRI by Sergej Majboroda, [Poly Haven](https://polyhaven.com/a/studio_small_09), CC0 1.0. Shared 512px map on desktop; no HDR download on phones.
- Contact shadow: original code-made depth/blur capture; no external asset.
- Round 2 (Oct 27): the same Shopify “Materials Variants Shoe” (CC-BY 4.0, Khronos glTF Sample Assets) rebuilt from the original 2048 px textures (WebP q92 + meshopt) and loaded by both desktop and phone. Stitch rows, stitch AO and the knit/foam/pebble micro-detail atlas (stride-detail.webp) are procedural, made by Zyqor Studio; no third-party texture added. The studio HDRI (Poly Haven, CC0) now loads on phones too.

## Hush One (Concept 03)
- Headphones: procedural three.js geometry made for this concept (v2 rebuild, Oct 27 2026): superellipse ear cups built with an offset-lathe, a swept spring-steel band with a padded leather pad and two rows of stitching, brushed-aluminium yokes, pivots and sliders with click marks, anodised concentric-turned outer caps, sheen leather cushions with gathered pleats and a stitched seam, a woven driver cloth. No model download. Code: Zyqor Studio (MIT).
- Textures (leather pebble grain, cushion pleats, cloth weave, brushed-metal roughness, soft-touch micro grain): generated on a canvas in code at load. No image download, no photography, no AI renders.
- Studio lighting: "Studio Small 09" HDRI by Sergej Majboroda, [Poly Haven](https://polyhaven.com/a/studio_small_09), CC0 1.0. Shared 512px map, loaded by desktop and phone alike (round 2).
- Contact shadow: real-time depth capture + two-pass blur after the three.js "contact shadows" example (MIT); blur kernel from three/examples HorizontalBlurShader/VerticalBlurShader (MIT). Phones use a static code-drawn blob.
- Fonts (unchanged): Unbounded by NORD ID, Inter Tight by Rasmus Andersson et al., SIL OFL 1.1.
- "Hush" and "Hush One" are fictional; no real brand marks.
- Round 2 detail pass (Oct 27 2026, Zyqor Studio): surface maps are now pre-baked high-res webp files in assets/lab/hush/ (protein-leather grain with pores and creases, cushion pleats, soft-touch shell grain, brushed aluminium, knit driver cloth, printed L/R cloth, 2048 px anodised cap maps with turned grooves, diamond-cut chamfer, drilled mic holes and an etched wordmark, slider size scale, button icons, controller board, cone fibre), generated procedurally by our own script (original work, no photography, no AI renders). New geometry: three icon buttons, a slide switch, a USB-C port with LED, a cushion piping welt and a second stitch row, and a driver basket, copper voice coil, pole piece and controller board for the exploded view. Lettering inside the textures: Inter Tight (SIL Open Font License 1.1). The same model, maps and HDRI now load on phone and desktop.

## Nook (Concept 11)
- Armchair: "Modern Arm Chair 01" by Vibrant Nordic, [Poly Haven](https://polyhaven.com/a/modern_arm_chair_01), CC0 1.0. Cushion albedo converted to a neutral grey in Python so the collection colour tints the fabric in code; oak frame keeps its scanned maps (an ebonised variant is a code tint). Compressed with gltf-transform (meshopt + webp): 614 KB desktop (2k cushion maps, 1k frame), 144 KB phone (512px, 50% simplified).
- Side table: "Side Table 01", [Poly Haven](https://polyhaven.com/a/side_table_01), CC0 1.0 (190 KB desktop / 84 KB phone).
- Pendant lamp: "Modern Ceiling Lamp 01", [Poly Haven](https://polyhaven.com/a/modern_ceiling_lamp_01), CC0 1.0 (158 KB desktop / 82 KB phone).
- Floor: "Herringbone Parquet" texture, [Poly Haven](https://polyhaven.com/a/herringbone_parquet), CC0 1.0 (desaturated slightly, webp).
- Rug: "Hessian 230" texture, [Poly Haven](https://polyhaven.com/a/hessian_230), CC0 1.0 (greyscale, tinted in code).
- Walls: "Plastered Wall" normal map, [Poly Haven](https://polyhaven.com/a/plastered_wall), CC0 1.0.
- Fabric weave detail (desktop): "Rough Linen" texture, [Poly Haven](https://polyhaven.com/a/rough_linen), CC0 1.0, tiled over the scanned cushions in a shader.
- Studio lighting: "Studio Small 09" HDRI by Sergej Majboroda, [Poly Haven](https://polyhaven.com/a/studio_small_09), CC0 1.0. Desktop and phone (round 2: the phone loads the same HDRI).
- Books, framed artwork, window, curtains and contact shadows are made in code. Replaces the earlier Khronos SheenChair and Lantern sample models. "Nook" is fictional; no real brand marks.
- Round 2 detail (Oct 27 2026): armchair rebuilt from the 4K source of "Modern Arm Chair 01" ([Poly Haven](https://polyhaven.com/a/modern_arm_chair_01), CC0 1.0; upholstery diffuse greyscaled by Zyqor Studio so the fabric colour switch can tint it), with a fine linen weave height + roughness from "Rough Linen" ([Poly Haven](https://polyhaven.com/a/rough_linen), CC0 1.0).
- Room props, all [Poly Haven](https://polyhaven.com/models), CC0 1.0: "Side Table 01" (4K source, https://polyhaven.com/a/side_table_01), "Modern Ceiling Lamp 01" (https://polyhaven.com/a/modern_ceiling_lamp_01), "Ceramic Vase 02" by James Ray Cock (https://polyhaven.com/a/ceramic_vase_02), "Potted Plant 02" by Rico Cilliers (https://polyhaven.com/a/potted_plant_02), "Throw Pillows 01" by Serhii Khromov (https://polyhaven.com/a/throw_pillows_01, recoloured cream), and three books from "Book Encyclopedia Set 01" by John Malcolm (https://polyhaven.com/a/book_encyclopedia_set_01).
- Rug: "Poly Wool Herringbone" texture ([Poly Haven](https://polyhaven.com/a/poly_wool_herringbone), CC0 1.0), colour, normal and roughness maps.
- Phone and desktop now load the same models, textures and "Studio Small 09" HDRI (Poly Haven, CC0); models compressed with meshopt, textures as WebP (glTF Transform, MIT).

## VOLT (Concept 07)
- 3D cans: procedural three.js geometry by Zyqor Studio (MIT for the code). Lathe body with real 250 ml sleek-can proportions, necked shoulder, rolled seam, domed base; countersunk lid with bead, score line and rivet; extruded pull tab. Brushed-aluminium roughness, printed-wrap colour/ORM maps and condensation normal map are all generated in code at load time. No downloaded model, no AI renders.
- Studio lighting (desktop and phone): "Studio Small 09" HDRI by Sergej Majboroda, Poly Haven, CC0 1.0 (https://polyhaven.com/a/studio_small_09), shared file site/assets/hdri/studio_512.hdr.
- Fonts: Anton (Vernon Adams) and Inter Tight (Rasmus Andersson et al.), SIL Open Font Licence, via Google Fonts.
- VOLT, its flavours and formula are fictional.
- Round 2 detail (Oct 27 2026, procedural, no downloaded model): baked condensation normal map (beads, mist, trickles), lid normal + roughness maps (stiffening bead, score lines, rivet, finger well, embossed rim text, spun rings) made in code by Zyqor Studio (files site/assets/lab/volt/drops_n.webp, lid_n.webp, lid_r.webp; source work/assets_upgrade2/volt/bake_src.py). Instanced 3D water beads, 3072 px printed wrap with micro-print. Same files on desktop and phone.
- Studio lighting, round 2 (desktop AND phone): "Studio Small 09" HDRI by Sergej Majboroda, Poly Haven, CC0 1.0 (https://polyhaven.com/a/studio_small_09), shared 1k file site/assets/hdri/studio_1k.hdr.


## Lab index + Lab chrome (design pass, Oct 27 2026)
- Fonts, all self-hosted and subset to Latin (woff2): **Cabinet Grotesk**, **Satoshi** and **Zodiak** by Indian Type Foundry, and **General Sans** by Indian Type Foundry, via [Fontshare](https://www.fontshare.com/). ITF Free Font License (FFL) v2.0: free for personal and commercial use, including web embedding; not to be sold or redistributed as fonts on their own.
- Paper grain: an inline SVG fractal-noise filter written in code; no external asset.
- Lab index posters: each concept's own poster.webp, made from that concept's page (credits on each concept).


## Dew Theory (Concept 06)
- Dropper bottle, cleanser pump bottle and balm jar: modelled in code by Zyqor Studio with three.js (MIT). Glass is a closed lathe profile with real wall thickness and a heavy base (MeshPhysicalMaterial transmission, IOR 1.5, light dispersion, rose attenuation); the serum is a separate mesh with a meniscus and a depth gradient; knurled champagne-gold collar, matte rubber bulb with grip rings, glass pipette. The printed label, paper labels, contact shadows and the caustic on the plinth are canvas textures drawn in code at load time. No downloaded model, no photos, no AI renders.
- Studio lighting (desktop and phone): "Studio Small 09" HDRI by Sergej Majboroda, Poly Haven, CC0 1.0 (https://polyhaven.com/a/studio_small_09), shared file site/assets/hdri/studio_1k.hdr. Since round 2 the phone build loads the same file.
- Fonts: Instrument Serif (Rodrigo Fuenzalida, Jordan Egstad) and Inter Tight (Rasmus Andersson et al.), SIL Open Font Licence, self-hosted.
- Round 2 detail (Oct 27 2026): surface maps baked by Zyqor Studio with a Python script (numpy + Pillow), no third-party textures: glass normal + roughness (mould seams, stippled heel, embossed base ring text and a "30 ML" capacity mark, faint wall waviness, sandblasted base, very light handling smudges), matte rubber micro-texture with moulding seams for the bulb, brushed-gold collar maps, paper-fibre normal for the paper labels; files in site/assets/lab/dew/. Pipette graduations, label ink relief and micro-bubbles are drawn in code at load time.
- Studio lighting on phones (round 2): the phone build now loads the same "Studio Small 09" HDRI (Poly Haven, CC0 1.0) as desktop, so both builds share the same lighting and glass.
- Dew Theory, its serums and ingredient percentages are fictional.

## Meridian (Concept 02)
- Watch, strap and presentation box: modelled in code by Zyqor Studio with three.js (MIT). Lathe-turned steel case (polished back, circular-grained flank with anisotropic reflections, polished chamfer and stepped bezel), inner flange, lacquered sunburst dial (radial anisotropy map), applied gold batons with lume inserts, applied date frame, sword hands with lume channels, needle seconds with counterweight, coin-edge knurled crown, curved chamfered lugs, padded tapered leather strap with a generated pebble-grain normal map, painted edges and 3D stitches, a domed sapphire-style crystal with a soft reflection and an anti-reflective (thin-film) tint. Every texture (dial print, sunburst direction map, leather grain, case graining) is drawn in code at load time. No downloaded model, no photos, no AI renders.
- Studio lighting (desktop and phone): "Studio Small 09" HDRI by Sergej Majboroda, Poly Haven, CC0 1.0 (https://polyhaven.com/a/studio_small_09), shared file site/assets/hdri/studio_1k.hdr. Since round 2 the phone build loads the same file.
- Fonts: Anton (Vernon Adams) and Inter Tight (Rasmus Andersson et al.), SIL Open Font Licence, self-hosted.
- Meridian, its calibre and specs are fictional.
- Round 2 detail pass (Oct 27, still modelled in code, no downloads): railroad minute track with five-minute numerals and small print, Instrument Serif "Automatic" on the dial (font: Instrument Serif by Rodrigo Fuenzalida / Jordan Egstad, SIL Open Font License 1.1, self-hosted), sunburst roughness map, faceted applied batons, faceted hands, crown guards, engraved satin caseback with screw-down notches, polished-steel smudge map, floating keeper and punched strap holes. The studio HDRI ("Studio Small 09", Sergej Majboroda, Poly Haven, CC0) is now used on the phone build too.

## Signal Studio (Concept 09)
- "One" speaker (3D tile in Services, desktop live render): procedural three.js geometry made for this concept (Oct 27 2026): lathe-turned anodised aluminium cap with chamfers and a diamond-cut edge, a woven fabric body, a rubber foot, a smoked acrylic top with a 48-bar LED ring that pulses (Calm: slow breath; Loud: 118 BPM kick, spectrum bars and floor ripples), and a printed brand plate. No model download. Code: Zyqor Studio (MIT).
- Textures (plain-weave fabric normal + shade maps, concentric brushing, brand plate): generated on a canvas in code at load. No photography, no AI renders.
- Stills (site/assets/lab/signal/one-card-*.webp, one-tile-*.webp; 3D-loop card art and the phone tile): rendered from the same three.js scene by Zyqor Studio.
- Studio lighting: "Studio Small 09" HDRI by Sergej Majboroda, [Poly Haven](https://polyhaven.com/a/studio_small_09), CC0 1.0. Shared 512px map, desktop only; phones get the baked stills.
- Brand: "Signal Studio" / "Signal One" are fictional; the name lives in one constant (BRAND in site/lab/signal/speaker.js) for a later rename.
- Round 2 detail pass (Oct 27 2026), still procedural three.js code by Zyqor Studio (MIT), no new third-party assets: barrel body with rounded shoulder and baked AO, 1024px melange plain-weave fabric (yarn and fibre normal + shade maps, sheen), rear seam with lock-stitch, woven label tag, rear power grommet, floating rubber foot with moulding grooves, knurled aluminium cap wall, concentric-turned top ring (anisotropy map), two diamond-cut chamfers, perforated smoked-glass top with engraved backlit icons and fingerprint smudges, diffused LED ring, curved bevelled badge with engraved lettering. The phone build now runs the same live model and textures as desktop; the stills are only loading posters, re-rendered from this model.

## Verdant (Concept 05)
- Plant and pot: "Potted Plant 02" by Rico Cilliers, [Poly Haven](https://polyhaven.com/a/potted_plant_02), CC0 1.0. Photoscanned Syngonium in a terracotta pot (mesh, colour, normal and roughness maps). Resized to 1024 px, WebP q78 + meshopt with gltf-transform: `site/assets/lab/verdant/verdant-plant-d.glb` (1.05 MB). Replaces the shared Khronos DiffuseTransmissionPlant on this demo (that shared file is untouched).
- Materials (code): MeshPhysicalMaterial on the scanned maps; leaves get sheen plus a small thin-leaf translucency shader that follows the sun (backlit glow at Dusk); pot gets a thin clearcoat over the scanned terracotta roughness.
- Studio lighting: "Studio Small 09" HDRI by Sergej Majboroda, [Poly Haven](https://polyhaven.com/a/studio_small_09), CC0 1.0 (shared 512 px map, desktop only).
- Phone stills `plant-poster.webp` / `plant-dusk.webp`: rendered from the scene above in Chrome (no AI renders).
- Window light, sill, contact shadows: CSS and canvas gradients made in code; no external asset. The old orange CSS sun disc was removed.
- Round 2 (Oct 27): same "Potted Plant 02" scan, rebuilt from the 4K source files at 2048 px (colour with the scan's leaf alpha merged in, normal, AO/roughness/metal ARM used for both AO and roughness), WebP q90 + meshopt: `verdant-plant-d.glb` (3.86 MB). The phone build now loads this same file, textures and HDRI and runs the same live 3D (it showed baked stills before).
- Top dressing: bark chips textured with "Bark Brown 02" by Rob Tuytel, [Poly Haven](https://polyhaven.com/a/bark_brown_02), CC0 1.0 (colour, normal and ARM maps, 512 px WebP: `bark-diff.webp`, `bark-nor.webp`, `bark-arm.webp`); river pebbles are procedural three.js geometry (code by Zyqor Studio). Both are dropped onto the scanned soil by raycasting.
- Studio HDRI ("Studio Small 09", above) now used on phone as well as desktop.

## Umami Ring (Concept 08)

- 3D bowls, noodles and toppings: procedural three.js geometry by Zyqor Studio (MIT for the code). Lathe-turned donburi with a foot ring and rolled rim; generated glaze colour, roughness and normal maps (throwing rings, speckle, key-fret band, iron-brown rim, unglazed clay foot); wavy tube noodles; ajitama egg; extruded and bevelled chashu, chicken and naruto; fibrous nori; lacquered wooden chopsticks; walnut tray; shader steam. No third-party model and no AI image or video. A CC0 ramen model that can be downloaded without a login could not be found, so the bowls are code-made.
- Studio lighting (desktop and phone builds): "Studio Small 09" HDRI by Sergej Majboroda, Poly Haven, CC0 1.0, https://polyhaven.com/a/studio_small_09 (shared file site/assets/hdri/studio_512.hdr). Since round 2 the phone build loads the same HDRI.
- Fonts (unchanged): Bricolage Grotesque and Inter Tight, SIL Open Font Licence.
- Round 2 detail pass (Oct 27, 2026): wood on the tray and chopsticks is now "Fine Grained Wood" by Rob Tuytel, Poly Haven, CC0 1.0, https://polyhaven.com/a/fine_grained_wood (1k colour, normal and roughness maps converted to webp: site/assets/lab/umami/wood_col.webp, wood_nor.webp, wood_rough.webp). Everything else stays procedural code by Zyqor Studio: 66 thin crimped noodle strands per bowl with a striation normal map, a halved ajitama with a domed jammy yolk and its own roughness map, rolled chashu with blurred fat layers and a caramelised bark, fibrous nori, fermented-bamboo menma, walled scallion rings, hand-thrown bowl wobble, crazing in the inner glaze and glaze drips on the foot. No AI images.
- Round 2: the phone build now uses the same geometry, the same 1024 px generated textures, the same Poly Haven wood and the same "Studio Small 09" HDRI (studio_512.hdr) as desktop.


## Ember & Oak (Concept 04, coffee)
- Stoneware cappuccino cup and saucer, crema and latte art, coffee beans, steam: modelled in code by Zyqor Studio with three.js (lathe profiles, swept handle, procedural canvas textures and shaders). No downloaded models or images. Code: MIT.
- Studio lighting: "Studio Small 09" HDRI by Sergej Majboroda, Poly Haven, CC0 1.0 (https://polyhaven.com/a/studio_small_09); shared file site/assets/hdri/studio_512.hdr, desktop only.
- Round 2 detail pass (Oct 27): still fully procedural, no new downloaded assets. Added in code: glaze micro-roughness (handling haze, thumb prints, wipe streaks, pin-holes), iron-speck halos, glaze pooling and drips toward the foot, a wavy glaze-stop line over raw stoneware, an incised double groove and throwing ripples on the cup, throwing rings on the saucer, a coffee tide line inside the cup, bump-mapped crema micro-bubbles and tiger flecks, a layered latte heart, deeper bean wrinkles and silverskin in the cleft. The same HDRI, geometry and textures now load on phones too.


## HALDE R1 (Lab concept 17, site/lab/halde/)
- 3D model: "Camera 01" by Rajil Jose Macatangay, Poly Haven, CC0 1.0 (https://polyhaven.com/a/Camera_01). 2k glTF downloaded; original maker markings on the body plate and lens ring were removed (inpainted in the colour and normal maps) and replaced with the fictional HALDE engraving; textures resized and converted to WebP, geometry compressed with meshopt (gltf-transform). Files: site/assets/lab/halde/halde-d.glb (desktop), halde-m.glb (phone).
- Studio lighting: "Studio Small 09" HDRI by Sergej Majboroda, Poly Haven, CC0 1.0 (shared file site/assets/hdri/studio_512.hdr).
- Fonts (shared files in site/assets/font/): Cabinet Grotesk by Indian Type Foundry via Fontshare, ITF Free Font License; Instrument Serif by Rodrigo Fuenzalida, SIL Open Font License 1.1.
- Posters (poster.webp, poster-m.webp): real-time renders of the model above made by Zyqor Studio, no AI imagery.
- Brand, copy and code: Zyqor Studio. HALDE is fictional; not a real camera or product listing.


- Round 2 (Oct 27, 2026): same Poly Haven "Camera 01" (CC0 1.0) re-sourced at 4K textures (https://polyhaven.com/a/Camera_01), maker markings again replaced with the fictional HALDE engraving; phone and desktop now load the same halde-d.glb (meshopt + WebP). Lens internals (coated elements, 10-blade iris, baffle, engraved name ring) are procedural code, no external assets.
## Plinth (Concept 16)
- Fictional architecture quarterly. "Plinth", "Issue 07 · The Weight of Light", every headline, essay line and spec are invented for this concept; no real publication or brand mark appears.
- Photo A: “Minimalist architecture with curved archways”, [Pexels](https://www.pexels.com/photo/minimalist-architecture-with-curved-archways-39107769/), Pexels License (free to use, no attribution required; credited anyway). Photographer name not shown here because the photo page could not be read from this machine; the link credits it.
- Photo B: “Minimalist concrete curved wall interior”, [Pexels](https://www.pexels.com/photo/minimalist-concrete-curved-wall-interior-36248801/), Pexels License (free to use, no attribution required; credited anyway). Photographer name not shown here because the photo page could not be read from this machine; the link credits it.
- Photo C: “Brutalist architecture in san diego”, [Pexels](https://www.pexels.com/photo/brutalist-architecture-in-san-diego-31044660/), Pexels License (free to use, no attribution required; credited anyway). Photographer name not shown here because the photo page could not be read from this machine; the link credits it.
- Photo D: “Minimalist concrete staircase with shadows”, [Pexels](https://www.pexels.com/photo/minimalist-concrete-staircase-with-shadows-39031396/), Pexels License (free to use, no attribution required; credited anyway). Photographer name not shown here because the photo page could not be read from this machine; the link credits it.
- Photo E: “Abstract shadows on concrete staircase”, [Pexels](https://www.pexels.com/photo/abstract-shadows-on-concrete-staircase-39814976/), Pexels License (free to use, no attribution required; credited anyway). Photographer name not shown here because the photo page could not be read from this machine; the link credits it.
- Photo F: “Shadow on concrete stairway in black and white”, [Pexels](https://www.pexels.com/photo/shadow-on-concrete-stairway-in-black-and-white-39500420/), Pexels License (free to use, no attribution required; credited anyway). Photographer name not shown here because the photo page could not be read from this machine; the link credits it.
- Photo G: “Elegant curved staircase in modern architecture”, [Pexels](https://www.pexels.com/photo/elegant-curved-staircase-in-modern-architecture-34482407/), Pexels License (free to use, no attribution required; credited anyway). Photographer name not shown here because the photo page could not be read from this machine; the link credits it.
- Photo H: “Ancient stone archway corridor with shadows”, [Pexels](https://www.pexels.com/photo/ancient-stone-archway-corridor-with-shadows-29403393/), Pexels License (free to use, no attribution required; credited anyway). Photographer name not shown here because the photo page could not be read from this machine; the link credits it.
- Photo K: “Elegant spiral staircase architecture in hamburg”, [Pexels](https://www.pexels.com/photo/elegant-spiral-staircase-architecture-in-hamburg-30368412/), Pexels License (free to use, no attribution required; credited anyway). Photographer name not shown here because the photo page could not be read from this machine; the link credits it.
- Photo L: “Elegant spiral staircase in modern architecture”, [Pexels](https://www.pexels.com/photo/elegant-spiral-staircase-in-modern-architecture-38064798/), Pexels License (free to use, no attribution required; credited anyway). Photographer name not shown here because the photo page could not be read from this machine; the link credits it.
- Photo M: “Modern brutalist architecture with concrete staircase”, [Pexels](https://www.pexels.com/photo/modern-brutalist-architecture-with-concrete-staircase-39486678/), Pexels License (free to use, no attribution required; credited anyway). Photographer name not shown here because the photo page could not be read from this machine; the link credits it.
- Photo O: “Elegant architectural corridor with shadows”, [Pexels](https://www.pexels.com/photo/elegant-architectural-corridor-with-shadows-30507862/), Pexels License (free to use, no attribution required; credited anyway). Photographer name not shown here because the photo page could not be read from this machine; the link credits it.
- Photos were resized and re-encoded to WebP (1600px desktop, 820px phone). No logos, people or AI renders; one candidate that looked like a 3D render was dropped.
- Fonts: Zodiak Variable (roman and italic) and Switzer Variable by Indian Type Foundry, via [Fontshare](https://www.fontshare.com), ITF Free Font License (free for commercial use). Self-hosted as the unmodified woff2 files, since the licence does not allow subsetting or conversion; licence text ships beside them as FFL.txt.
- Motion: GSAP + ScrollTrigger and Lenis from the shared Lab vendor folder (desktop only). Hover distortion: original WebGL shader, Zyqor Studio. Phone build uses CSS and IntersectionObserver only.


## Colour page (site/color/, Oct 27 2026)
- Page: "Colour Theory, by Zyqor Studio" at /color/ (desktop index.html + light phone m.html). All visuals are code: SVG and canvas (colour wheel, palette ring, still-life scene, mock layout), no photos, no 3D models, no AI renders. Code and words: Zyqor Studio (MIT for the code).
- Fonts (reused from site/assets/font/, self-hosted woff2): **Cabinet Grotesk**, **Satoshi** and **Zodiak** by Indian Type Foundry via [Fontshare](https://www.fontshare.com/), ITF Free Font License (FFL): free for personal and commercial use, including web embedding.
- Film grain: site/assets/color/grain.webp, a 256px tileable noise texture generated in Python (NumPy + Pillow) by Zyqor Studio. No external asset.
- Colour maths: WCAG 2.2 relative-luminance contrast formula (W3C); OKLab / OKLCH conversion after Bjorn Ottosson's published Oklab matrices (public domain / MIT reference code).
- Motion (desktop only): GSAP 3 + ScrollTrigger (GreenSock standard "no charge" licence) and Lenis (MIT), the copies already in site/vendor/. The phone build loads neither.
- Lab palettes and posters are read live from site/lab/_kit/registry.js and each concept's own poster.webp (credits on each concept). The brands are fictional.
- Share image site/assets/color/og.jpg and posters site/color/poster.webp / poster-m.webp: screenshots of this page.


## Fumée (Lab concept 15, site/lab/fumee/)
- Photos, all Unsplash License (free to use, no attribution required; credited anyway). Photographer names were not readable from the Unsplash pages here, so each is credited by its page. Cropped, resized and converted to WebP. Files are in site/assets/lab/fumee/:
  - fig-d/-m.webp: figs on dark wood, https://unsplash.com/photos/green-round-fruit-on-brown-wooden-table-vtP7PpYlzzQ
  - incense-d/-m.webp: incense cone by a window, https://unsplash.com/photos/black-incense-burning-in-room-9M4asMDP7vQ
  - jasmine-d/-m.webp: jasmine against a dark background, https://unsplash.com/photos/delicate-white-jasmine-flowers-bloom-against-dark-background-hp3SP0d5GTw
  - figs-d/-m.webp: halved figs, https://unsplash.com/photos/fresh-figs-halved-and-quartered-on-a-plate-sYTOxXNzLhs
  - stick-d/-m.webp: incense stick with smoke, https://unsplash.com/photos/brown-wooden-stick-with-black-smoke-d_YI6RQdyoE
- Fonts (self-hosted in site/assets/lab/fumee/): Boska and General Sans by Indian Type Foundry, via Fontshare, under the ITF Free Font License.
- Libraries: GSAP 3 with ScrollTrigger and SplitText (GreenSock standard "no charge" licence; SplitText.min.js copied into site/assets/lab/fumee/), Lenis (MIT) and three.js (MIT), from the shared site/vendor files.
- Zyqor Studio made the following in code, with no AI imagery or video: the smoke shader (curl-noise ink simulation plus domain-warped fbm), the liquid image transition shader, the flacon technical drawing (SVG), and the posters (poster.webp and poster-m.webp, which are frames of the live page).
- Brand, copy and code: Zyqor Studio. Fumée, its three scents and the flacon specs are fictional; this is not a real product.

## Process + Services pages (site/process/, site/services/, site/assets/pages/, Oct 27 2026)
- Design, copy, code, wireframe SVGs, icons (inline SVG, hand-drawn) and the Gantt timeline: Zyqor Studio (Sujon Hoque), own work.
- Visuals are the studio's own: Lab concept posters (site/lab/*/poster.webp), screenshots of this portfolio (v2 and v3 desktop, v3 phone build) re-encoded as site/assets/pages/redesign-v2*.webp, redesign-v3*.webp, worlds*.webp, phone-hero.webp.
- Fonts: Cabinet Grotesk, Satoshi, Zodiak by Indian Type Foundry via Fontshare (ITF Free Font License), already credited above; self-hosted from /assets/font/.
- Libraries (desktop only): GSAP + ScrollTrigger (GreenSock standard "no charge" license), Lenis (MIT, darkroom.engineering), self-hosted from /vendor/. Phone pages use no libraries.
- No stock photos, client logos, testimonials or results are used. Lab brands are fictional concepts.

## Lab design pass, per-demo type + CTA apply (Dew, VOLT, Nook, Verdant, Umami, Volta, Ember, Signal; Oct 27 2026)
- Fonts swapped in each demo's own HTML/CSS (3D code untouched), all self-hosted from site/assets/font/: **Satoshi** (Dew, Nook, Ember, Signal body), **General Sans** (VOLT, Verdant, Umami, Volta body), **Cabinet Grotesk** 800 (VOLT and Signal headlines, Volta display), **Zodiak** 700 + italic (Ember headlines), all by Indian Type Foundry via [Fontshare](https://www.fontshare.com/), ITF Free Font License (FFL): free for personal and commercial use, including web embedding.
- **Instrument Serif** (Verdant display, replacing Fraunces) by Rodrigo Fuenzalida, SIL Open Font License 1.1; **Archivo** (Volta spec numbers, expanded width, desktop only) by Omnibus-Type, SIL Open Font License 1.1.
- Faces the 3D canvases still draw with stay declared (Anton on the VOLT can print and wordmark, Unbounded on the Signal badge, Inter Tight and Bricolage Grotesque on canvas labels); they were credited by the original sections above.
- Meridian (applied after its model pass): **General Sans** body (ITF FFL, as above) and **Archivo** condensed 800 display on desktop (Omnibus-Type, SIL OFL 1.1); Anton and Inter Tight stay declared because the watch-dial canvas draws with them.
- CTA shapes, tracking and layout tweaks: Zyqor Studio, own work.


## Typography page (site/studio/type/, Oct 27 2026)
Built by Tab for Zyqor Studio, Oct 27 2026. All copy written for this page. The five pairing brands (Brask and the others) are fictional concepts.

### Typefaces (all self-hosted woff2 under site/assets/font/, Latin subsets with axes and OpenType features kept)

- **Bricolage Grotesque** — Mathieu Triay, the Bricolage Grotesque Project. https://github.com/ateliertriay/bricolage. Licence: SIL Open Font License 1.1. Variable: opsz 12–96, wdth 75–100, wght 200–800. Downloaded from Google Fonts.
- **Fraunces** — Phaedra Charles and Flavia Zimbardi, Undercase Type. https://github.com/undercasetype/Fraunces. Licence: SIL Open Font License 1.1. Variable: opsz 9–144, wght 100–900, SOFT, WONK. Downloaded from Google Fonts.
- **Satoshi** — Deni Anggara, Indian Type Foundry. https://www.fontshare.com/fonts/satoshi. Licence: ITF Free Font License (free for personal and commercial use). Variable: wght 300–900. Downloaded from Fontshare.
- **Cabinet Grotesk** — Shiva Nallaperumal, Indian Type Foundry. https://www.fontshare.com/fonts/cabinet-grotesk. Licence: ITF Free Font License. Variable: wght 100–900. Downloaded from Fontshare.
- **Zodiak** — Jérémie Hornus, Gaëtan Baehr, Jean-Baptiste Morizot, Alisa Nowak, Théo Guillard, Indian Type Foundry. https://www.fontshare.com/fonts/zodiak. Licence: ITF Free Font License. Variable: wght 100–900. Downloaded from Fontshare.
- **General Sans** — Indian Type Foundry. https://www.fontshare.com/fonts/general-sans. Licence: ITF Free Font License. Variable: wght 200–700. Downloaded from Fontshare.
- **Instrument Serif** — Rodrigo Fuenzalida and Jordan Egstad, Instrument. https://github.com/Instrument/instrument-serif. Licence: SIL Open Font License 1.1. Regular and Italic. Downloaded from Google Fonts.

Font files added by this page: bricolage-axes.woff2, fraunces-axes.woff2, satoshi-var.woff2, cabinetgrotesk-var.woff2, zodiak-var.woff2. Reused from the site: generalsans-var.woff2, instrumentserif-400.woff2, instrumentserif-400-italic.woff2. Original downloads kept in work/additions/type/src/.

### Code

- Lenis smooth scroll (desktop only, off under prefers-reduced-motion) — darkroom.engineering, MIT licence, from the site's existing vendor/ folder.
- Everything else (axes hero, glyph inspector with real font metrics read by fontTools, tester, live rules) is hand-written for this page.

### Images

- No photographs or third-party images. poster.webp and poster-m.webp are screenshots of this page.


## Case study page: Kilnfold concept (site/studio/case/, Oct 27 2026)
Page: site/studio/case/ (index.html desktop, m.html phone). Assets: site/assets/studio/case/.

### Photography (all Unsplash, Unsplash License: free to use, commercial included, no permission needed; attribution given anyway)

| File | Subject | Photographer | Source | Licence |
|---|---|---|---|---|
| hero-d.webp / hero-m.webp | Hands shaping clay on a pottery wheel | Tuan Nguyen (@tuan0_12) | https://unsplash.com/photos/hands-shaping-clay-on-a-pottery-wheel-_fxvuMucGDs | Unsplash License https://unsplash.com/license |
| m_wheel-d.webp / m_wheel-m.webp | A person shaping clay on a spinning pottery wheel with tools in nearby bowls | Taylor Heery (@taylorheeryphoto) | https://unsplash.com/photos/pottery-wheel-with-clay-and-tools-ZSgWcW70cTs | Unsplash License https://unsplash.com/license |
| m_bisque-d.webp / m_bisque-m.webp | A pile of white dishes sitting on top of a table | Raymond Petrik (@raymondpetrik) | https://unsplash.com/photos/a-pile-of-white-dishes-sitting-on-top-of-a-table-525wpkeJSwg | Unsplash License https://unsplash.com/license |
| m_shelf-d.webp / m_shelf-m.webp | White ceramic teacup on brown wooden shelf | Manki Kim (@kimdonkey) | https://unsplash.com/photos/white-ceramic-teacup-on-brown-wooden-shelf-ZOeyUJB6t_Y | Unsplash License https://unsplash.com/license |
| m_glaze-d.webp / m_glaze-m.webp | Bowls of colorful glazes and pigments on a table | Tuan Nguyen (@tuan0_12) | https://unsplash.com/photos/bowls-of-colorful-glazes-and-pigments-on-a-table-tGK68eoSsbU | Unsplash License https://unsplash.com/license |
| m_bowls-d.webp / m_bowls-m.webp | Two white ceramic bowls | Tom Crew (@tomcrewceramics) | https://unsplash.com/photos/two-white-ceramic-bowls-bgIO-u4GEfI | Unsplash License https://unsplash.com/license |
| m_jugs-d.webp / m_jugs-m.webp | Filed stoneware jugs | Jessica Ruscello (@jruscello) | https://unsplash.com/photos/filed-stoneware-jugs-G8vPQ-XVxxY | Unsplash License https://unsplash.com/license |
| m_racks-d.webp / m_racks-m.webp | Several ceramic bowls displayed on wooden shelves | lei qian (@easonjojo) | https://unsplash.com/photos/several-ceramic-bowls-displayed-on-wooden-shelves-HxKtKdYZnNc | Unsplash License https://unsplash.com/license |
| m_shadow-d.webp / m_shadow-m.webp | Grayscale photography of mug with spoon on top of saucer and plate | Bernard Tuck (@jodrell) | https://unsplash.com/photos/grayscale-photography-of-mug-with-spoon-on-top-of-saucer-and-plate-yIMH3Hxlpfw | Unsplash License https://unsplash.com/license |
| p_group-d.webp / p_group-m.webp | A collection of various ceramic vases in neutral tones on a wooden surface | Chloe Bolton (@crystalmind_design) | https://unsplash.com/photos/ceramic-vases-on-wooden-surface-R0qthXq3jec | Unsplash License https://unsplash.com/license |
| p_bowl-d.webp / p_bowl-m.webp | White bowl | Tom Crew (@tomcrewceramics) | https://unsplash.com/photos/white-bowl-7HuTGlUfQSo | Unsplash License https://unsplash.com/license |
| p_terra-d.webp / p_terra-m.webp | Empty bowl | Viviane Okubo (@vivianeokubo) | https://unsplash.com/photos/empty-bowl-BgIOYG835og | Unsplash License https://unsplash.com/license |
| p_cups-d.webp / p_cups-m.webp | White and brown ceramic bowls | Vladimir Gladkov (@vovkapanda) | https://unsplash.com/photos/white-and-brown-ceramic-bowls-NPPIq1XFdck | Unsplash License https://unsplash.com/license |
| p_jars-d.webp / p_jars-m.webp | 3 white ceramic jars on white table | Yana Hurska (@yana_hurska) | https://unsplash.com/photos/3-white-ceramic-jars-on-white-table-rAVSjxz6mNo | Unsplash License https://unsplash.com/license |
| p_vases-d.webp / p_vases-m.webp | 3 brown clay vases on white concrete table | Yana Hurska (@yana_hurska) | https://unsplash.com/photos/3-brown-clay-vases-on-white-concrete-table-zeGT9j4ltRA | Unsplash License https://unsplash.com/license |

Downloaded at 2400 px (originals kept in work/additions/case/src/), exported to WebP with PIL: desktop hero 2000 px, moodboard 1100 px, product 900 px; phone 900/640/600 px.

### Type
- Zodiak (variable 100-900 + 400 italic) and General Sans (variable 200-700) by Indian Type Foundry, via Fontshare https://www.fontshare.com. ITF Free Font License (FFL): free for personal and commercial use including web embedding. Already self-hosted in site/assets/font/ (zodiak-var.woff2, zodiak-400i.woff2, generalsans-var.woff2); no new font files added.

### Logotype
- Kilnfold wordmark: Zodiak glyph outlines (instanced at wght 720 with fontTools) with a custom bowl glyph drawn in code replacing the o. Fictional brand; the name had zero web-search results on Oct 27 2026.

### Code
- Design and code: Zyqor Studio. GSAP 3 + ScrollTrigger and Lenis (desktop only), from site/vendor/ (already in the project). No CDN at runtime.
- Paper grain: inline SVG feTurbulence, no asset.

No AI-generated images or video. No emoji. Fictional brand, labelled Concept project; no clients, testimonials or results.


## UI micro-interactions gallery (site/studio/ui/, Oct 27 2026)
### Photography (all downloaded once, resized and self-hosted as WebP in site/assets/studio/ui/)
- lake-1600.webp / lake-820.webp — “Mountain Lake in Early Morning” by John Callery. https://www.pexels.com/photo/mountain-lake-in-early-morning-5645309/ — Pexels License (free to use, commercial use allowed, no attribution required; credited anyway). Used in the comparison slider: the SAME photo shown twice, one side with a live CSS grade. Not a client before/after.
- vessel-900.webp / vessel-560.webp — “Brown Plant on White Ceramic Vase” by Karolina Grabowska (Kaboompics, pexels.com/@karola-g). https://www.pexels.com/photo/brown-plant-on-white-ceramic-vase-4207892/ — Pexels License. Used in the tilt card (fictional label “Kiln & Co.”, marked Concept).
- pottery-720.webp / pottery-480.webp — “Handmade Pottery in White Studio Installation” by DS stories. https://www.pexels.com/photo/handmade-pottery-in-white-studio-installation-5040792/ — Pexels License. Used in the skeleton-to-content card.
Creator names were read from each photo's Pexels page on 2026-10-27.

### Type (already self-hosted in site/assets/font/, no new font files added)
- Satoshi (variable, satoshi-var.woff2) — Indian Type Foundry, https://www.fontshare.com/fonts/satoshi — ITF Free Font License (free for commercial use).
- Instrument Serif (instrumentserif-400.woff2, instrumentserif-400-italic.woff2) — Rodrigo Fuenzalida and Jordan Egstad, https://fonts.google.com/specimen/Instrument+Serif — SIL Open Font License 1.1.

### Code, icons, layout
- All 16 components, the SVG icons and the layout: original code by Zyqor Studio, plain HTML/CSS/JS, no libraries, no CDN.
- No AI-generated imagery, no emoji, no clients, reviews or results. Product names (Fieldnote tote, Kiln & Co.) are fictional and labelled Concept.


## TALUS Ridge C1 (Lab concept 18, site/lab/cadence/, Oct 27 2026)
### 3D model
- "Carbon Frame Bike" by Robert Schweier and prefrontal cortex; realtime version and animation ("Holobike_Loop") by Felix Herbst (Needle).
- Licence: CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/). Note: share-alike, not plain CC-BY.
- Source: KhronosGroup glTF-Sample-Models PR #357, files at KhronosGroupArchives commit 93c72b1, path 2.0/CarbonFrameBike/ (also in usd-wg/assets, full_assets/CarbonFrameBike).
- Changes made here (the modified model is shared under the same CC BY-SA 4.0 licence):
  - the tire sidewall text and the maker logo were replaced with the fictional TALUS marks;
  - the AR shadow planes and the tangents were removed;
  - the model was pruned, deduplicated, welded and simplified, with textures re-encoded to 1024px WebP and geometry compressed with meshopt;
  - at runtime the frame and accent materials are recoloured.
- Phone stills (still-*.webp) are renders of the same modified model, so the same licence applies.

### Lighting
- Shared HDRI "Studio Small 09" by Sergej Majboroda, Poly Haven, CC0 (site/assets/hdri, 256 px version).

### Type
- Bricolage Grotesque by Mathieu Triay, SIL Open Font License 1.1.
- Satoshi by Indian Type Foundry, Fontshare Free Font Licence (FFL).
- Cabinet Grotesk (Indian Type Foundry, Fontshare FFL) was used offline only, to draw the TALUS sidewall and logo textures baked into the model.

### Code
- three.js (MIT), GSAP and ScrollTrigger (GSAP standard licence, free), Lenis (MIT).

TALUS, Ridge C1 and all the numbers on the page are fictional. This is a Zyqor Studio design concept, not a product.
Round 2 detail (Oct 27 2026, 20:30Z):
- Model rebuilt from the original "Carbon Frame Bike" files at 2048 px textures with meshopt (CC BY-SA 4.0, same credit as above). Desktop and phone load the same file.
- Frame decals (TALUS / RIDGE C1 / CONCEPT + fine print), clear-coat orange-peel, grain and smudge maps: procedural, drawn in code by Zyqor Studio (fictional brand).
- DecalGeometry.js from three.js r170 (MIT).
- Shared HDRI "Studio Small 09" by Sergej Majboroda, Poly Haven, CC0, now the 512 px version on both builds.


## Volta, model detail round 2 (Oct 27 2026)
- Volta round 2 (model detail): 3D car "Car Concept" by Eric Chadwick / Khronos Group, glTF Sample Assets, CC-BY 4.0 (https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/CarConcept). Full-detail version (213k triangles, original-resolution textures), recompressed by Zyqor Studio (meshopt + webp); licence plate removed; tyre sidewall artwork replaced with fictional "VOLTA CONCEPT" lettering (the source's real logos removed). Same file on desktop and phone: site/assets/lab/volta/volta.glb.
- Studio lighting: "Studio Small 09" by Sergej Majboroda, Poly Haven, CC0 (https://polyhaven.com/a/studio_small_09) (shared HDRI, now also on phone).

## Home "Worlds" 3D, model detail round 2 (site/js/worlds.js, site/assets/models/*-hd.glb, Oct 27 2026)
All six models are Khronos glTF Sample Assets (https://github.com/KhronosGroup/glTF-Sample-Assets), re-encoded from the full-resolution originals (textures up to 2048 px as WebP q92, Meshopt geometry with 12-bit normals). Desktop and phone now load the same files. Licences verified against each model's metadata.json on Oct 27 2026:
- MaterialsVariantsShoe: (c) 2021 Shopify, CC-BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Models/MaterialsVariantsShoe.
- AntiqueCamera: Maximillan Kamps / UX3D, 2018, CC0 1.0 (the UX3D logo is a trademark and is not reused as branding). Models/AntiqueCamera.
- BoomBox: Microsoft, 2017, CC0 1.0. Models/BoomBox.
- WaterBottle: Microsoft, 2017, CC0 1.0. Models/WaterBottle.
- GlassVaseFlowers: glass vase by Eric Chadwick, flowers by Rico Cilliers, 2023, CC0 1.0. Models/GlassVaseFlowers.
- Lantern: sbtron / Microsoft, 2017 (Draco version Frank Galligan, 2018), CC0 1.0. Models/Lantern.
- Lighting: "Studio Small 09" HDRI by Sergej Majboroda, Poly Haven, CC0 (https://polyhaven.com/a/studio_small_09); the 1k map now lights the phone build too.


## Zyqor Library and skills

- Every library concept lists its own assets with exact licences in its folder (`site/library/<n|a|p>/<ID>/credits.json`, shown in the page's credits sheet). Shared optimised models and textures live in `site/library/_assets/`.
- N002 Kiln & Quiet: "Ceramic Vase 01" by James Ray Cock, [Poly Haven](https://polyhaven.com/a/ceramic_vase_01), CC0 1.0.
- A018 Tranquility Base: Poly Haven "Moon Rock 01/05/07" models and "Moon Dusted 02" / "Moon Footprints 01" textures, CC0 1.0; NASA Blue Marble Earth imagery (Reto Stöckli, NASA GSFC), public domain.
- Kit font: JetBrains Mono, SIL Open Font License 1.1 (licence text in `site/library/_kit/font/`).
- three.js addons added for the library (DRACOLoader, KTX2Loader, OrbitControls, WorkerPool and their helper modules): MIT, from three.js r170. Draco decoder: Apache 2.0 (Google). Basis Universal transcoder: Apache 2.0 (Binomial).
- Skills: code is MIT; each skill's README lists the third-party models, HDRIs, photos and fonts its example uses, with their licences.
