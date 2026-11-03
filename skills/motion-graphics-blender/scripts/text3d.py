
"""text3d.py — glossy extruded 3D text with bevel, studio lighting and a camera move (Zyqor Motion Kit v3, template A).
Run:  blender -b --factory-startup -P text3d.py -- --text "SHIP\nFASTER" --style chrome --side "#2453ff" \
         --bg1 "#ffe3d3" --bg2 "#ff8f73" --seconds 2.5 --anim slam --out /tmp/t3d   (or --still /tmp/t.png --frame 30)
Args: --text (\n = new line, each line animates separately)  --font ArchivoBlack-400.ttf|BricolageGrotesque-800.ttf
      --style chrome|plastic|split|clay   --face/--side hex   --bg1/--bg2 backdrop gradient (top/bottom)  --transparent 1
      --anim slam|rise|flip|none  --stagger 0.12  --cam push|orbit|static  --extrude 0.22 --bevel 0.035
      --seconds --fps --samples --w --h  --save_blend F.blend
"""
import bpy, os, sys, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mk3d import *

a = args(dict(text="SHIP\nFASTER", font="ArchivoBlack-400.ttf", style="chrome", face="#ffffff", side="#2453ff",
              bg1="#ffe3d3", bg2="#ff8f73", transparent=True, anim="slam", stagger=0.12, cam="push",
              extrude=0.32, bevel=0.055, size=1.25, seconds=2.5, fps=30, samples=24, w=1080, h=1920,
              still="", out="", frame=1, start=0, end=0, save_blend="", line_gap=1.12, tilt=8.0))
s = reset_scene(a["w"], a["h"], a["fps"], a["seconds"], a["samples"], transparent=a["transparent"])
world_studio()
if a["transparent"]:
    shadow_catcher(dist=-1.6)
else:
    gradient_backdrop(a["bg1"], a["bg2"], dist=-3.0, emit=0.75)
studio_lights(key=700, rim=900, fill=150)

if a["style"] == "chrome":   side = candy_chrome("Side", a["side"]); face = candy_chrome("Face", a["side"])
elif a["style"] == "plastic": side = glossy_plastic("Side", a["side"]); face = glossy_plastic("Face", a["side"])
elif a["style"] == "clay":   side = clay("Side", a["side"]); face = clay("Face", a["side"])
else:                         side = candy_chrome("Side", a["side"]); face = glossy_plastic("Face", a["face"], rough=0.18)

lines = a["text"].replace("\\n", "\n").split("\n")
n = len(lines); objs = []
for i, ln in enumerate(lines):
    o = text_obj(ln, a["font"], size=a["size"], extrude=a["extrude"], bevel=a["bevel"])
    o.location = (0, 0, ((n - 1) / 2 - i) * a["size"] * a["line_gap"])
    o = to_mesh_split(o, face, side)
    # fit width: scale long lines down so the block stays inside ~80% of a 9:16 frame
    bpy.context.view_layer.update()
    wdt = o.dimensions.x
    if wdt > 4.2: o.scale = [4.2 / wdt] * 3
    objs.append(o)

fps = a["fps"]; T = a["seconds"]
for i, o in enumerate(objs):
    t0 = i * a["stagger"]; base = o.location.copy(); sc = o.scale.copy(); rot = o.rotation_euler.copy()
    if a["anim"] == "slam":     # flies in from behind the camera's depth, overshoots, settles (Pinterest 'kinetic typography 3d')
        key(o, "location", 0, (base.x, base.y + 6, base.z), "linear")
        key(o, "location", t0, (base.x, base.y + 6, base.z), "expo_out")
        key(o, "location", t0 + 0.38, base, "ease")
        key(o, "rotation_euler", t0, (rot.x + math.radians(-25), rot.y, rot.z + math.radians(12)), "back_out")
        key(o, "rotation_euler", t0 + 0.5, rot, "ease")
        key(o, "scale", 0, sc * 0.001, "linear"); key(o, "scale", t0, sc * 0.6, "back_out"); key(o, "scale", t0 + 0.42, sc, "ease")
    elif a["anim"] == "rise":
        key(o, "location", 0, (base.x, base.y, base.z - 1.2), "linear"); key(o, "location", t0, (base.x, base.y, base.z - 1.2), "quart_out")
        key(o, "location", t0 + 0.6, base, "ease")
        key(o, "scale", 0, sc * 0.001, "linear"); key(o, "scale", t0, sc * 0.9, "quart_out"); key(o, "scale", t0 + 0.4, sc, "ease")
    elif a["anim"] == "flip":
        key(o, "rotation_euler", 0, (rot.x - math.radians(90), rot.y, rot.z), "linear")
        key(o, "rotation_euler", t0, (rot.x - math.radians(90), rot.y, rot.z), "back_out")
        key(o, "rotation_euler", t0 + 0.55, rot, "ease")
    # idle float so it's never static
    key(o, "rotation_euler", t0 + 0.6, rot, "ease")
    key(o, "rotation_euler", T, (rot.x + math.radians(3), rot.y, rot.z + math.radians(a["tilt"] * (1 if i % 2 == 0 else -1) * 0.5)), "ease")

cam, aim = camera(loc=(1.6, 8.0, -0.8), lens=35, aim=(0, 0, 0), fstop=5.6)
if a["cam"] == "push":
    key(cam, "location", 0, (1.8, 6.7, -1.0), "ease"); key(cam, "location", T, (-0.7, 5.5, -0.25), "ease")
elif a["cam"] == "orbit":
    for k in range(5):
        ang = math.radians(-20 + 40 * k / 4); key(cam, "location", T * k / 4, (10 * math.sin(ang), 10 * math.cos(ang), 0.6), "linear")
run_output(a)
