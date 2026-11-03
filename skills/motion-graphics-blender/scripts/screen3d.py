
"""screen3d.py — Template B: tilted 3D device/screen card with a screenshot OR screen-recording texture; the camera glides
and zooms to points on the UI (ref 2 look). Zyqor Motion Kit v3.
Run:  blender -b --factory-startup -P screen3d.py -- --media shot.jpg|screen.mp4 --img_w 2160 --img_h 1350 \
        --shots shots.json --seconds 8 --out renders/f        (or --stills 30,90 --still_dir prev/)
shots.json = list of camera beats, each {"t": sec, "focus": [ui_x, ui_y] | null, "dist": 1.8, "ease": "expo",
             "side": [0.18, 0.12], "fstop": 2.4, "dev_rot": [rx, ry, rz] (optional, degrees), "dev_loc": [x,y,z] (optional)}
   focus = a pixel in the media (e.g. a button from a screenshot); null = wide shot of the whole device.
Defaults give an 8 s demo: fly-in, zoom to top-left, whip to top-right, pull back.
Film is transparent (shadow catcher) -> put a background behind it in EffectCraft / bgcomp.py.
Speed (16 CPU threads): ~4 s/frame at 810x1440 + 12 samples; render 75% and scale up in the comp.
"""
import bpy, os, sys, math, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mk3d import *
from mathutils import Vector

a = args(dict(media="", img_w=2160, img_h=1350, shots="", seconds=8.0, fps=30, samples=12, w=810, h=1440,
              body="#0d0f14", out="", still="", stills="", still_dir="", frame=1, start=0, end=0, save_blend="", fmt="WEBP", width=3.2))
FPS = a["fps"]; T = a["seconds"]
s = reset_scene(a["w"], a["h"], FPS, T, a["samples"], motion_blur=True, transparent=True)
if a["fmt"].upper() == "WEBP":
    s.render.image_settings.file_format = "WEBP"; s.render.image_settings.color_mode = "RGBA"; s.render.image_settings.quality = 92
world_studio(); studio_lights(key=650, rim=900, fill=160); shadow_catcher(dist=-2.2)
movie = a["media"].lower().endswith((".mp4", ".mov", ".webm", ".mkv"))
root, scr, ui, (DW, DH) = device_card(a["media"], is_movie=movie, frames=int(T * FPS) + 2, img_w=a["img_w"], img_h=a["img_h"],
                                      width=a["width"], depth=0.14, bezel=0.07, corner=0.06, body=a["body"])
R = math.radians
shots = json.load(open(a["shots"])) if a["shots"] else [
    {"t": 0.0, "focus": None, "dev_loc": [0, 0, -8], "dev_rot": [65, 0, 30], "ease": "expo_out"},
    {"t": 1.0, "focus": None, "dev_loc": [0, 0, 0], "dev_rot": [13, 3, -15]},
    {"t": 2.2, "focus": [a["img_w"] * 0.2, a["img_h"] * 0.25], "dist": 1.8, "fstop": 2.4},
    {"t": 3.6, "focus": [a["img_w"] * 0.8, a["img_h"] * 0.25], "dist": 1.9, "ease": "quart", "side": [-0.15, 0.12]},
    {"t": 5.0, "focus": [a["img_w"] * 0.5, a["img_h"] * 0.7], "dist": 1.7},
    {"t": 6.4, "focus": None, "dev_rot": [10, -2, 14]},
    {"t": T, "focus": None, "dev_rot": [6, 0, 8], "ease": "ease"}]
cam, aim = camera(loc=(0.4, 3.9, 0.4), lens=35, aim=(0, 0, 0), fstop=5.6)
cd = cam.data
for sh in shots:                         # device poses first (focus points depend on them)
    if "dev_loc" in sh or "dev_rot" in sh:
        t = sh["t"]; e = sh.get("ease", "expo")
        if "dev_loc" in sh: key(root, "location", t, sh["dev_loc"], e)
        if "dev_rot" in sh: key(root, "rotation_euler", t, [R(x) for x in sh["dev_rot"]], e)
for sh in shots:
    t = sh["t"]; e = sh.get("ease", "expo")
    if sh.get("focus"):
        s.frame_set(int(1 + t * FPS)); bpy.context.view_layer.update()
        m = root.matrix_world; p = m @ ui(*sh["focus"]); sd = sh.get("side", [0.18, 0.12])
        n = (m.to_3x3() @ Vector((sd[0], 1.0, sd[1]))).normalized(); c = p + n * sh.get("dist", 1.8)
        fs = sh.get("fstop", 2.4)
    else:
        c, p, fs = Vector((0.4 if int(t) % 2 else -0.4, 3.7, 0.35)), Vector((0, 0, 0)), sh.get("fstop", 5.6)
    key(cam, "location", t, c, e); key(aim, "location", t, p, e)
    cd.dof.aperture_fstop = fs; cd.dof.keyframe_insert("aperture_fstop", frame=1 + t * FPS)
run_output(a)
