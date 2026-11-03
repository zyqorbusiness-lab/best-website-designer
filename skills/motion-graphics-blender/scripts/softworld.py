
"""softworld.py — Template C: soft-3D floating-objects world (ref 1 / Pinterest 'blender 3d motion graphics'):
rounded pastel shapes (spheres, pills, rounded cubes, torus) floating with slow bob + spin, strong depth of field,
soft key light, clay/glossy-plastic materials, a slow camera dolly. Use as a background plate or a hero shot.
Run:  blender -b --factory-startup -P softworld.py -- --palette "#ffc2d9,#c9d8ff,#ffe08a,#b8f0d0,#ffb48f" \
        --count 14 --seconds 6 --seed 3 --out renders/f [--transparent 0 --bg1 "#fff4ec" --bg2 "#ffd9c7"] [--hero_text "SOFT"]
"""
import bpy, os, sys, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mk3d import *
from mathutils import Vector

a = args(dict(palette="#ff8fb1,#7fa8ff,#ffd23f,#5fd39a,#ff9a5c", count=14, seconds=6.0, fps=30, samples=12, w=810, h=1440,
              seed=3, transparent=False, bg1="#fff4ec", bg2="#ffd9c7", hero_text="", out="", still="", stills="", still_dir="",
              frame=1, start=0, end=0, save_blend="", fmt="WEBP", fstop=1.8, style="clay"))
random.seed(a["seed"]); T = a["seconds"]
s = reset_scene(a["w"], a["h"], a["fps"], T, a["samples"], motion_blur=False, transparent=a["transparent"])
if a["fmt"].upper() == "WEBP":
    s.render.image_settings.file_format = "WEBP"; s.render.image_settings.color_mode = "RGBA" if a["transparent"] else "RGB"; s.render.image_settings.quality = 92
world_studio(bottom="#b9a9a3", horizon="#fff1e8", top="#ffffff", strength=0.55)
if a["transparent"]: shadow_catcher(dist=-3.5)
else: gradient_backdrop(a["bg1"], a["bg2"], dist=-4.0, emit=0.3)
area_light("Key", (3, 5, 6), energy=520, size=9, color="#fff4ea"); area_light("Fill", (-5, 4, 0), energy=120, size=8)
softbox("SoftTop", (0, 3, 6), w=8, h=2, strength=3)
cols = a["palette"].split(",")
def shape(kind, r):
    if kind == "sphere": bpy.ops.mesh.primitive_uv_sphere_add(radius=r, segments=48, ring_count=24)
    elif kind == "torus": bpy.ops.mesh.primitive_torus_add(major_radius=r, minor_radius=r * 0.38, major_segments=64, minor_segments=24)
    elif kind == "pill":
        bpy.ops.mesh.primitive_cylinder_add(radius=r * 0.5, depth=r * 2.2, vertices=48); o = bpy.context.object
        b = o.modifiers.new("B", "BEVEL"); b.width = r * 0.49; b.segments = 10; b.limit_method = "NONE"
    else: return rounded_box("RB", r * 1.4, r * 1.4, r * 1.4, radius=r * 0.3, segments=8)
    o = bpy.context.object; bpy.ops.object.shade_smooth(); return o
kinds = ["sphere", "torus", "pill", "cube"]
for i in range(a["count"]):
    r = random.uniform(0.25, 0.75); o = shape(random.choice(kinds), r)
    c = cols[i % len(cols)]
    o.data.materials.append(clay(f"M{i}", c) if a["style"] == "clay" else glossy_plastic(f"M{i}", c, rough=0.3))
    p = Vector((random.uniform(-2.6, 2.6), random.uniform(-3.0, 2.0), random.uniform(-4.2, 4.2)))
    if a["hero_text"] and abs(p.z) < 1.3 and p.y > -1.5:      # keep a clear lane for the hero word
        p.z = math.copysign(random.uniform(1.4, 4.2), p.z if p.z else 1)
    rot = Vector((random.uniform(0, 6.28), random.uniform(0, 6.28), random.uniform(0, 6.28)))
    bob = random.uniform(0.15, 0.4); ph = random.uniform(0, 6.28); spin = random.uniform(-0.6, 0.6)
    for k in range(5):                                   # slow bob + spin, keyed every T/4 (sine ease)
        t = T * k / 4
        key(o, "location", t, (p.x, p.y, p.z + bob * math.sin(ph + k * 1.57)), "ease")
        key(o, "rotation_euler", t, (rot.x + spin * k, rot.y + spin * 0.6 * k, rot.z), "ease")
if a["hero_text"]:
    o = text_obj(a["hero_text"], "ArchivoBlack-400.ttf", size=1.1, extrude=0.3, bevel=0.06)
    o = to_mesh_split(o, glossy_plastic("TF", "#ffffff", 0.15), glossy_plastic("TS", cols[0], 0.25))
    bpy.context.view_layer.update()
    if o.dimensions.x > 3.6: o.scale = [3.6 / o.dimensions.x] * 3
cam, aim = camera(loc=(0.3, 7.5, 0.2), lens=40, aim=(0, 0, 0), fstop=a["fstop"])
key(cam, "location", 0, (0.6, 7.8, 0.4), "ease"); key(cam, "location", T, (-0.4, 6.6, -0.1), "ease")
run_output(a)
