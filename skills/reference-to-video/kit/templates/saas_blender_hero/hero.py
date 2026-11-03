
"""hero.py — Zyqor Motion Kit v3 hero: SaaS promo in the style of Sujon's ref 2 (@raieum.edit), built as ONE Blender scene.
Real 3D: glossy chrome extruded type, a thick floating device slab with the product's screen recording as a movie texture,
camera that glides and zooms to every click (focus points computed from UI pixel coords), DOF, motion blur.
Film is transparent: EffectCraft (comp.jsx) puts the gradient world, glow, light sweeps, RGB split, zoom blur and 2D captions on top.
Run: blender -b --factory-startup -P hero.py -- --out renders/f [--start 1 --end 480] | --still x.png --frame 150
"""
import bpy, os, sys, math, json
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "blender"))
from mk3d import *
from mathutils import Vector

a = args(dict(out="", still="", frame=1, start=0, end=0, samples=16, w=1080, h=1920, save_blend="", seconds=16.0, fmt="WEBP"))
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

# ---------------- HOOK 0.0–2.1: "YOUR WEEK / IS A MESS." + tumbling sticky notes ----------------
h1 = make_text("YOUR WEEK", 1.0, (chrome, chrome), z=0.6, maxw=3.5); h2 = make_text("IS A MESS.", 1.0, (white, chrome), z=-0.6, maxw=3.5)
for o, t0 in ((h1, 0.0), (h2, 0.2)):
    base, sc, rot = pop_in(o, t0)
    key(o, "rotation_euler", t0 + 0.5, rot, "ease")
    key(o, "rotation_euler", 1.7, (rot.x + math.radians(4), rot.y, rot.z + math.radians(-5)), "expo")
    # zoom-through exit: text flies at (and past) the camera 1.70 -> 2.05
    key(o, "location", 1.7, base, "expo"); 
    key(o, "location", 2.05, (base.x * 1.0, base.y + 9.5, base.z * 2.2), "linear")
    hide_at(o, 2.07)

NOTE_COLS = ["#ffd23f", "#8fb4ff", "#ff8fb1", "#8fe3b0", "#ffa75c", "#ffd23f", "#8fb4ff"]
import random; random.seed(7)
notes = []
for i, c in enumerate(NOTE_COLS):
    n = rounded_box(f"Note{i}", 0.95, 0.95, 0.08, radius=0.06, segments=6)
    n.data.materials.append(glossy_plastic(f"NoteM{i}", c, rough=0.35))
    ang = i / len(NOTE_COLS) * 2 * math.pi
    p = Vector((1.75 * math.cos(ang), -0.6 + random.random() * 1.6, 2.4 * math.sin(ang)))
    r0 = Euler((random.uniform(-0.8, 0.8), random.uniform(-0.8, 0.8), random.uniform(-1, 1)))
    key(n, "location", 0, (p.x * 1.8, p.y + 3, p.z * 1.8), "expo_out"); key(n, "location", 0.55 + i * 0.03, p, "ease")
    key(n, "location", 1.7, p + Vector((random.uniform(-.3, .3), 0.4, random.uniform(-.3, .3))), "expo")
    key(n, "location", 2.05, (p.x * 3.5, p.y + 7, p.z * 3.5), "linear")
    key(n, "rotation_euler", 0, r0, "linear"); key(n, "rotation_euler", 2.05, (r0.x + 2.2, r0.y - 1.6, r0.z + 1.4), "linear")
    hide_at(n, 2.07)
    notes.append(n)

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

# ---------------- FEATURE LIST 9.2–12.4 (ref 2's "1. SHAKE 2. HIT 3. FLASH") ----------------
feats = ["1 PLAN", "2 ADD", "3 DONE"]   # no periods: from a camera above the type, an extruded "." reads as "/"
for i, ftxt in enumerate(feats):
    o = make_text(ftxt, 0.6, (chrome, chrome), z=-0.75 - i * 0.8, maxw=2.3, extrude=0.24, bevel=0.042)
    o.location.x = 1.15 - (o.dimensions.x / 2)        # left-aligned column (camera-left = world +X because the text is turned 180°)
    base, sc, rot = pop_in(o, 9.75 + i * 0.45, from_y=4.0, spin=-30)
    key(o, "rotation_euler", 9.75 + i * 0.45 + 0.5, rot, "ease")
    key(o, "rotation_euler", 12.3, (rot.x, rot.y, rot.z + R(-6)), "expo")
    key(o, "location", 12.3, base, "expo"); key(o, "location", 12.6, (base.x - 6, base.y + 1, base.z), "linear")
    hide_at(o, 12.62)

# ---------------- CTA 12.9–16 ----------------
c1 = make_text("WANT A SITE", 0.78, (white, chrome), z=2.5, maxw=2.95, extrude=0.26)
c2o = make_text("LIKE THIS?", 0.78, (chrome, chrome), z=1.55, maxw=2.75, extrude=0.26)
for o, t0 in ((c1, 12.95), (c2o, 13.12)):
    base, sc, rot = pop_in(o, t0, from_y=5.0, spin=-20)
    key(o, "rotation_euler", t0 + 0.5, rot, "ease"); key(o, "rotation_euler", T, (rot.x + R(2), rot.y, rot.z + R(4)), "ease")

# soft background spheres for depth (out of focus, pastel) — template C ingredients
for i, (pos, col, r) in enumerate([((-3.2, -5.5, 3.4), "#ffc2d9", 1.0), ((3.4, -6.0, -2.6), "#c9d8ff", 1.2), ((2.8, -5.0, 4.2), "#ffe08a", 0.7), ((-3.0, -5.0, -3.9), "#b8f0d0", 0.8)]):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=pos, segments=48, ring_count=24); sp = bpy.context.object; bpy.ops.object.shade_smooth()
    sp.data.materials.append(clay(f"Sph{i}", col))
    key(sp, "location", 0, pos, "ease"); key(sp, "location", T, (pos[0] * 1.05, pos[1], pos[2] + (0.6 if i % 2 else -0.6)), "ease")

run_output(a)
