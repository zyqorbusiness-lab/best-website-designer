# Recipe 15 - photo-card stack around the subject (refs 7, 5, 3, 1, 11)

Seen: ref 7 7.0-9.3 s - a cut-out woman on a cream set with 6+ rounded photo cards flying in around/behind her, each its own rotation (-8..+9 deg), scale and drop shadow, 2-frame stagger, a white card flash at 9.33 s; 9.67-12 s a stack of B/W and warm party photos in rounded squares under a distressed red title "RECAP". Ref 5 17.7-20.0 s - photo cards slide along a wavy coral arc, each with an orange border and a label. Ref 3 20-22.6 s - tilted collage with parallax; ref 11 25-33 s - phone-ratio card holding the talking head, then zoom-out into a 3-card strip.

## Build
1. Subject cut-out: recipe 11 (BiRefNet-lite masks, `tools/word_behind_head/`), or a clean studio plate.
2. Cards: `card(comp, file, x, y, a, b, {tilt:true})` from zq_lib.jsx for each photo (own photos, Pinterest b-roll stills - logged, never shipped); rounded corners 48-64 px; shadow softGrey 38 % / 28 px.
3. Layout: 2 cards behind the subject's shoulders (same z as the big word in recipe 11), 3-4 cards in front-left/right at the edges; rotation random in [-9, 9] deg with seed; scale 0.85-1.15; entry = fly from off-frame with 103 % overshoot, 2-frame stagger, hold 1.2-2 s, exit by a whip.
4. Sound: one pop-whoosh for the whole stack (not one per card) + low hit on the last card (see SOUND_DESIGN).
## Human not AI
Uneven angles, different sizes, real photos with different colour casts, shadows that do not match perfectly.
## Status
Recipe only (no stack was rendered in v5.5); building blocks exist.
