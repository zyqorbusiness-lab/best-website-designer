
"""hero_v4.py — Zyqor Motion Kit v4 hero (v3 + fixes): SaaS promo in the style of Sujon's ref 2 (@raieum.edit), built as ONE Blender scene.
Real 3D: glossy chrome extruded type, a thick floating device slab with the product's screen recording as a movie texture,
camera that glides and zooms to every click (focus points computed from UI pixel coords), DOF, motion blur.
Film is transparent: EffectCraft (comp.jsx) puts the gradient world, glow, light sweeps, RGB split, zoom blur and 2D captions on top.
Run: blender -b --factory-startup -P hero.py -- --out renders/f [--start 1 --end 480] | --still x.png --frame 150
"""
import bpy, os, sys, math, json
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "blender"))
V3 = os.path.join(HERE, "..", "saas_blender_hero")
from mk3d import *
from mathutils import Vector

a = args(dict(out="", still="", frame=1, start=0, end=0, samples=16, w=1080, h=1920, save_blend="", seconds=17.0, fmt="WEBP"))
FPS = 30; T = a["seconds"]
s = reset_scene(a["w"], a["h"], FPS, T, a["samples"], motion_blur=True, transparent=True)
if a["fmt"].upper() == "WEBP":     # RGBA WebP q92 ≈ 0.3–0.6 MB/frame vs ~3.5 MB PNG — matters on a tight disk; EffectCraft reads WebP sequences
    s.render.image_settings.file_format = "WEBP"; s.render.image_settings.color_mode = "RGBA"; s.render.image_settings.quality = 92
world_studio()
studio_lights(key=650, rim=900, fill=160)
shadow_catcher(dist=-3.2)   # farther = softer, lighter shadow (v1 at -2.2 left a muddy blob under the raised device)

BLUE = "#2453ff"
chrome = candy_chrome("Chrome", BLUE)
white = glossy_plastic("WhiteFace", "#f7f7ff", rough=0.15)

def fc_eval(obj, path, idx, t):
    ad = obj.animation_data
    if ad and ad.action:
        fc = ad.action.fcurves.find(path, index=idx)
        if fc: return fc.evaluate(1 + t * FPS)
    return getattr(obj, path)[idx]

def move(obj, path, ta, tb, vb, ease="expo"):
    """Animate obj.path from its value at ta to vb at tb with `ease` (AE-style keyframe pair)."""
    va = [fc_eval(obj, path, i, ta) for i in range(3)]
    key(obj, path, ta, va, ease); key(obj, path, tb, vb, "ease")

def make_text(body, size, mats, z=0.0, y=0.0, maxw=4.2, extrude=0.3, bevel=0.05):
    o = text_obj(body, "ArchivoBlack-400.ttf", size=size, extrude=extrude, bevel=bevel)
    o.location = (0, y, z); o = to_mesh_split(o, mats[0], mats[1])
    bpy.context.view_layer.update()
    if o.dimensions.x > maxw: o.scale = [maxw / o.dimensions.x] * 3
    return o

def pop_in(o, t0, from_y=5.0, spin=-25):
    base = o.location.copy(); sc = o.scale.copy(); rot = o.rotation_euler.copy()
    key(o, "scale", 0, sc * 0.001, "linear"); key(o, "scale", t0, sc * 0.55, "back_out"); key(o, "scale", t0 + 0.4, sc, "ease")
    key(o, "location", 0, (base.x, base.y + from_y, base.z), "linear"); key(o, "location", t0, (base.x, base.y + from_y, base.z), "expo_out")
    key(o, "location", t0 + 0.36, base, "ease")
    key(o, "rotation_euler", 0, (rot.x + math.radians(spin), rot.y, rot.z + math.radians(10)), "linear")
    key(o, "rotation_euler", t0, (rot.x + math.radians(spin), rot.y, rot.z + math.radians(10)), "back_out")
    key(o, "rotation_euler", t0 + 0.5, rot, "ease")
    return base, sc, rot

def hide_at(o, t, dur=0.0):
    sc = [fc_eval(o, "scale", i, t) for i in range(3)]
    key(o, "scale", t, sc, "expo"); key(o, "scale", t + max(dur, 1 / FPS), [0.001] * 3, "linear")


# ======================= v4 additions =======================
# Everything that must read "straight on" (hook title, feature list, end bubble) is parented to the CAMERA, so camera moves never
# show it from above (v3 lesson: "2." read as "2/" from above). Camera looks down local -Z; text front faces local +Z.
ICE = mat("IceChrome", "#3d9bff", rough=0.08, metal=0.6, coat=1.0, coat_rough=0.01)      # bright pale-blue chrome (ref 2 "2026")
ICE_FACE = mat("IceFace", "#bfe8ff", rough=0.07, metal=0.3, coat=1.0, coat_rough=0.01)
ROYAL = mat("Royal", "#2f6bff", rough=0.10, metal=0.55, coat=1.0, coat_rough=0.02)          # ref 2 list: bright royal blue glossy
ROYAL_FACE = mat("RoyalFace", "#5b9bff", rough=0.12, metal=0.2, coat=1.0, coat_rough=0.02)
BUBBLE = glossy_plastic("Bubble", "#2f7bff", rough=0.12)
WHITE_TXT = mat("WhiteTxt", "#ffffff", rough=0.3, emission="#ffffff", emit_strength=0.6)

def cam_text(body, height, x, y, d, mats, font="ArchivoBlack-400.ttf", extrude=0.16, bevel=0.03, italic=0.0, align="CENTER", maxw=None):
    """Text parented to the camera at local (x, y, -d); `height` = cap height in metres at that distance; italic = shear (tan)."""
    o = text_obj(body, font, size=1.0, extrude=extrude, bevel=bevel, align=align)
    o = to_mesh_split(o, mats[0], mats[1])
    if italic:
        for v in o.data.vertices: v.co.x += v.co.y * italic
    bpy.context.view_layer.update()
    sc = height / max(o.dimensions.z, 1e-6) if False else height
    o.parent = cam; o.matrix_parent_inverse.identity()
    o.rotation_euler = (0, 0, 0); o.location = (x, y, -d); o.scale = (sc, sc, sc)
    bpy.context.view_layer.update()
    if maxw and o.dimensions.x > maxw: s2 = sc * maxw / o.dimensions.x; o.scale = (s2, s2, s2)
    return o

def vis(o, t_on, t_off=None):
    """Hard visibility switch (render) — keeps hidden objects out of reflections/shadows."""
    o.hide_render = True; o.keyframe_insert("hide_render", frame=1)
    if t_on > 0: o.keyframe_insert("hide_render", frame=1)
    o.hide_render = False; o.keyframe_insert("hide_render", frame=max(1, int(round(1 + t_on * FPS))))
    if t_off is not None: o.hide_render = True; o.keyframe_insert("hide_render", frame=int(round(1 + t_off * FPS)))
    for fc in o.animation_data.action.fcurves:
        if fc.data_path == "hide_render":
            for kp in fc.keyframe_points: kp.interpolation = "CONSTANT"

def slam_local(o, t0, dur=0.32, z_from=-2.5, spin=18, sc_over=1.08):
    """Camera-space slam: flies in from behind (local -Z), small spin, overshoot, then a slow idle drift."""
    loc = o.location.copy(); sc = o.scale.copy(); rot = o.rotation_euler.copy()
    key(o, "location", 0, (loc.x, loc.y, loc.z + z_from), "linear"); key(o, "location", t0, (loc.x, loc.y, loc.z + z_from), "expo_out")
    key(o, "location", t0 + dur, loc, "ease")
    key(o, "rotation_euler", 0, (rot.x + R(spin), rot.y - R(spin * 0.6), rot.z), "linear")
    key(o, "rotation_euler", t0, (rot.x + R(spin), rot.y - R(spin * 0.6), rot.z), "back_out")
    key(o, "rotation_euler", t0 + dur + 0.15, rot, "ease")
    key(o, "scale", 0, sc * 0.4, "linear"); key(o, "scale", t0, sc * 0.4, "back_out"); key(o, "scale", t0 + dur, sc, "ease")
    return loc, sc, rot

# ---------------- DEVICE (screen recording as movie texture) ----------------
scr_path = os.path.join(HERE, "assets", "screen.mp4")
root, scr, ui, (DW, DH) = device_card(scr_path, is_movie=True, frames=int(T * FPS) + 2, width=3.2, depth=0.14, bezel=0.07, corner=0.06)
R = math.radians
def dev_key(t, loc, rot, sc=1.0, ease="ease"):
    key(root, "location", t, loc, ease); key(root, "rotation_euler", t, tuple(R(x) for x in rot), ease); key(root, "scale", t, (sc, sc, sc), ease)
dev_key(0, (0, 0, -9), (65, 0, 30), 0.8, "linear")
dev_key(2.05, (0, 0, -9), (65, 0, 30), 0.8, "expo_out")       # flies up from below, rotating (ref 2 @ 6.5 s)
dev_key(3.05, (0, 0, 0), (13, 3, -15), 1.0, "ease")
dev_key(4.0, (0, 0, 0), (8, 2, -10), 1.0, "ease")
dev_key(7.0, (0, 0, 0), (6, 1, -8), 1.0, "expo")
dev_key(7.9, (0, 0, 0), (10, -2, 14), 1.0, "ease")             # swing to the other side on the pull-back
dev_key(9.15, (0, 0, 0), (8, -1, 11), 1.0, "expo")
dev_key(9.85, (0, 0, 1.2), (16, 0, -9), 0.88, "ease")         # rises to make room for the feature list
dev_key(12.35, (0, 0, 1.27), (12, 0, -5), 0.88, "expo")
dev_key(12.95, (0, 0, -0.75), (9, 0, 7), 0.9, "ease")          # CTA position
dev_key(T, (0, 0, -0.75), (5, 0, -4), 0.9, "ease")

# ---------------- CAMERA ----------------
cam, aim = camera(loc=(0.7, 4.7, -0.7), lens=35, aim=(0, 0, 0), fstop=4.0)
cd = cam.data
def cam_key(t, loc, at, ease="ease", fstop=None):
    key(cam, "location", t, loc, ease); key(aim, "location", t, at, ease)
    if fstop: cd.dof.aperture_fstop = fstop; cd.dof.keyframe_insert("aperture_fstop", frame=1 + t * FPS)
def focus_world(px, py, t, dist, side=(0.18, 0.12)):
    s.frame_set(int(1 + t * FPS)); bpy.context.view_layer.update()
    m = root.matrix_world
    p = m @ ui(px, py)
    n = (m.to_3x3() @ Vector((side[0], 1.0, side[1]))).normalized()
    return p + n * dist, p
cam_key(0, (0.75, 4.8, -0.7), (0, 0, 0), "ease", 4.0)
cam_key(1.7, (0.3, 4.15, -0.25), (0, 0, 0), "linear", 4.0)
cam_key(2.06, (0.5, 4.0, 0.55), (0, 0, 0), "ease", 5.6)
cam_key(3.9, (-0.3, 3.6, 0.25), (0, 0, 0), "expo", 5.6)
c, p = focus_world(450, 330, 4.6, 1.85); cam_key(4.6, c, p, "ease", 2.4)
c2 = c + (p - c).normalized() * 0.15; cam_key(5.6, c2, p, "quart", 2.4)          # slow creep while typing
c, p = focus_world(1864, 330, 6.05, 1.9, side=(-0.15, 0.12)); cam_key(6.05, c, p, "ease", 2.4)   # whip to "Add task"
cam_key(6.25, c, p, "expo", 2.4)
c, p = focus_world(330, 680, 6.9, 1.75, side=(0.2, 0.05)); cam_key(6.9, c, p, "ease", 2.2)
cam_key(7.0, c, p, "expo", 2.2)
cam_key(7.9, (0.55, 3.65, 0.45), (0, 0, 0), "ease", 5.6)
cam_key(8.1, (0.45, 3.55, 0.4), (0, 0, 0), "expo", 5.6)
c, p = focus_world(263, 623, 8.75, 1.6, side=(-0.2, 0.15)); cam_key(8.75, c, p, "ease", 2.0)
cam_key(9.15, c, p, "expo", 2.0)
cam_key(9.9, (0.35, 3.45, -0.45), (0, 0, -0.4), "ease", 5.6)
cam_key(12.35, (-0.2, 3.25, -0.35), (0, 0, -0.4), "expo", 5.6)
cam_key(12.95, (-0.35, 4.0, 0.9), (0, 0, 0.65), "ease", 5.6)
cam_key(T, (0.25, 3.6, 0.8), (0, 0, 0.65), "ease", 5.6)


for n in scr.data.materials[0].node_tree.nodes:      # v4: less coat glare so the DARK UI stays dark (v3's 0.35 greyed it)
    if n.type == "BSDF_PRINCIPLED": n.inputs["Coat Weight"].default_value = 0.12
# ---------------- HOOK 0.0–2.05: huge bright chrome "2027" (+ cyan glow in EffectCraft) over the anime key visual ----------------
# (the image itself is a 2D layer in comp_v4.jsx under this transparent render)
D_HOOK = 4.9
yr = cam_text("2027", 2.0, 0.0, 1.55, D_HOOK, (ICE_FACE, ICE), extrude=0.34, bevel=0.06, maxw=3.8)
loc, sc, rot = slam_local(yr, 0.12, dur=0.34, z_from=-6.0, spin=24, sc_over=1.1)
key(yr, "rotation_euler", 0.12 + 0.5, rot, "ease")
key(yr, "rotation_euler", 1.0, (rot.x + R(3), rot.y + R(-5), rot.z + R(-2.5)), "ease")      # ref: the frame starts to tilt ~0.8-1 s
key(yr, "rotation_euler", 1.72, (rot.x + R(5), rot.y + R(-9), rot.z + R(-6)), "expo")
key(yr, "location", 1.72, (loc.x, loc.y, loc.z), "expo")
key(yr, "location", 2.04, (loc.x, loc.y + 0.1, -0.35), "linear")                        # zoom-through: flies into the lens
vis(yr, 0.0, 2.05)

# ---------------- FEATURE LIST 9.4–12.4: small, italic, bright royal-blue glossy, seen straight on (camera space) ----------------
D_F = 3.4
feat_objs = []
for i, ftxt in enumerate(["1. PLAN", "2. ADD", "3. DONE"]):
    o = cam_text(ftxt, 0.42, 0.0, 0.0, D_F, (ROYAL_FACE, ROYAL), extrude=0.12, bevel=0.022, italic=0.22, align="LEFT")
    o.location = (-1.45, -0.45 - i * 0.55, -D_F)
    t0 = 9.75 + i * 0.42
    loc, sc, rot = slam_local(o, t0, dur=0.28, z_from=-1.8, spin=14)
    key(o, "location", 12.2, loc, "expo"); key(o, "location", 12.5, (loc.x - 3.2, loc.y, loc.z), "linear")
    vis(o, t0 - 0.05, 12.52); feat_objs.append(o)

# device exits down at 12.4 so the end card is ONE element (ref 2 ends on a single chat bubble)
key(root, "location", 12.4, (0, 0, 1.27), "expo"); key(root, "location", 12.85, (0, 0, -7.5), "linear")
vis(root, 2.0, 12.9)
for ch in root.children: vis(ch, 2.0, 12.9)

# ---------------- END CARD 12.75–17: one glossy blue 3D chat bubble ----------------
D_B = 4.0
bub = rounded_box("BubbleBody", 2.8, 1.2, 0.24, radius=0.32, segments=14)
bub.data.materials.append(BUBBLE)
tail = rounded_box("BubbleTail", 0.46, 0.46, 0.24, radius=0.12, segments=8)
tail.data.materials.append(BUBBLE); tail.parent = bub; tail.location = (1.08, 0, -0.52); tail.rotation_euler = (0, R(40), 0)
bub.parent = cam; bub.matrix_parent_inverse.identity(); bub.rotation_euler = (R(-90), 0, 0); bub.location = (0, 0.15, -D_B)
l1 = text_obj("Want a site like this?", "Inter-700.ttf", size=0.22, extrude=0.012, bevel=0.0); l1 = to_mesh_split(l1, WHITE_TXT, WHITE_TXT)
l2 = text_obj("Comment \u201cSITE\u201d", "ArchivoBlack-400.ttf", size=0.27, extrude=0.02, bevel=0.004); l2 = to_mesh_split(l2, WHITE_TXT, WHITE_TXT)
for o, zz in ((l1, 0.2), (l2, -0.2)):
    o.parent = bub; o.matrix_parent_inverse.identity(); o.rotation_euler = (0, 0, 0)
    # bubble local: X right, Y depth (towards -Y is away), Z up; face of the box at local +Y? box was built facing camera after rot x 90
    o.rotation_euler = (R(90), 0, 0); o.location = (0, -0.13, zz)   # box face toward the camera = bubble-local -Y
    bpy.context.view_layer.update()
    if o.dimensions.x > 2.35: k = 2.35 / o.dimensions.x; o.scale = (k, k, k)
loc, sc, rot = slam_local(bub, 12.8, dur=0.36, z_from=-5.0, spin=-16)
key(bub, "rotation_euler", 13.4, rot, "ease")
key(bub, "rotation_euler", 15.0, (rot.x + R(4), rot.y + R(3), rot.z + R(-3)), "ease")
key(bub, "rotation_euler", T, (rot.x + R(-2), rot.y + R(-3), rot.z + R(2)), "ease")
key(bub, "location", 13.4, loc, "ease"); key(bub, "location", T, (loc.x, loc.y + 0.06, loc.z + 0.35), "ease")
for o in (bub, tail, l1, l2): vis(o, 12.75, None)
# soft background spheres for depth (out of focus, pastel) — template C ingredients
for i, (pos, col, r) in enumerate([((-3.2, -5.5, 3.4), "#ffc2d9", 1.0), ((3.4, -6.0, -2.6), "#c9d8ff", 1.2), ((2.8, -5.0, 4.2), "#ffe08a", 0.7), ((-3.0, -5.0, -3.9), "#b8f0d0", 0.8)]):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=pos, segments=48, ring_count=24); sp = bpy.context.object; bpy.ops.object.shade_smooth()
    sp.data.materials.append(clay(f"Sph{i}", col))
    key(sp, "location", 0, pos, "ease"); key(sp, "location", T, (pos[0] * 1.05, pos[1], pos[2] + (0.6 if i % 2 else -0.6)), "ease")


for o in bpy.data.objects:                     # 3D backdrop bits stay out of the hook (the anime key visual is behind it)
    if o.name.startswith("Sphere") or o.name == "ShadowCatcher": vis(o, 2.06, None)
run_output(a)
