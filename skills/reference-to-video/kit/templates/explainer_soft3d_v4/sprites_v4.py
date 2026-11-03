"""sprites_v4.py — Zyqor Motion Kit v4 (ref 1 soft-3D explainer): real 3D OBJECTS rendered in Blender as transparent,
seamless 2-second float loops (or one-shot clips), to be laid out 2.5D in EffectCraft — the way soft-3D explainers are actually built
(3D-rendered elements + AE camera/layout). Each sprite: gentle sine wobble (rot ±5°, bob) that loops perfectly at --frames.
Run: blender -b --factory-startup -P sprites_v4.py -- --sprite phone_search --out renders/sp_phone_search [--frames 60 --size 900x1500]
Sprites: tile (--color --glyph: any glossy icon tile, e.g. ref 3 hook icon), phone_search, phone_site (movie texture), avatar (image on a glossy tile), star, pin, tile_call, tile_check, coin
"""
import bpy, os, sys, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "blender"))
from mk3d import *
from mathutils import Vector
a = args(dict(color="#2f6bff", glyph="3", sprite="star", out="", frames=60, size="600x600", samples=16, still="", frame=1, media="", tex="", amp=5.0, start=0, end=0, loop=1))
W, H = [int(v) for v in a["size"].split("x")]; N = int(a["frames"]); FPS = 30
s = reset_scene(W, H, FPS, N / FPS, a["samples"], motion_blur=False, transparent=True)
s.render.image_settings.file_format = "PNG"; s.render.image_settings.color_mode = "RGBA"; s.render.image_settings.compression = 40
world_studio(bottom="#d9d4cc", horizon="#fff4ea", top="#ffffff", strength=1.0)     # bright, airy reflections (ref 1 is soft, not chrome-dark)
studio_lights(key=520, rim=420, fill=240)
DJ = os.path.join(HERE, "..", "..", "blender", "fonts", "DejaVuSans-Bold.ttf")
root = bpy.data.objects.new("Root", None); bpy.context.collection.objects.link(root)
R = math.radians

def glyph(ch, size, extrude, bevel, m, font=DJ):
    cu = bpy.data.curves.new("G", "FONT"); cu.body = ch; cu.font = bpy.data.fonts.load(font, check_existing=True)
    cu.size = size; cu.extrude = extrude; cu.bevel_depth = bevel; cu.bevel_resolution = 6; cu.align_x = "CENTER"; cu.align_y = "CENTER"
    o = bpy.data.objects.new("G", cu); bpy.context.collection.objects.link(o); o.rotation_euler = (R(90), 0, R(180))
    o.data.materials.append(m); return o

def image_plane(path, w, h, y, movie=False, frames=1, corner=0.06):
    m, img = screen_material("Img", path, is_movie=movie, frames=frames, corner=corner, aspect=w / h, glare=0.25)
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, y, 0), rotation=(R(90), 0, R(180))); p = bpy.context.object
    p.scale = (w, h, 1); bpy.ops.object.transform_apply(scale=True); p.data.materials.append(m); return p

sp = a["sprite"]; fit = 2.2          # scene units visible across the frame width
if sp in ("phone_search", "phone_site"):
    tex = a["tex"] or os.path.join(HERE, "assets", "screen_search.png" if sp == "phone_search" else "site_scroll.mp4")
    movie = tex.endswith(".mp4")
    body = rounded_box("Phone", 1.0, 2.12, 0.11, radius=0.13, segments=14); body.data.materials.append(glossy_plastic("PhoneBody", "#16161c", rough=0.22))
    rim = rounded_box("Rim", 1.03, 2.15, 0.085, radius=0.14, segments=14); rim.data.materials.append(candy_chrome("Rim", "#c9ccd6"))
    scr = image_plane(tex, 0.92, 0.92 * 1688 / 780, 0.0565, movie=movie, frames=N + 2, corner=0.11)
    for o in (body, rim, scr): o.parent = root
    fit = 1.5
elif sp == "avatar":
    tile = rounded_box("Tile", 1.0, 1.0, 0.22, radius=0.24, segments=14); tile.data.materials.append(glossy_plastic("TileW", "#fbfbfd", rough=0.18))
    img = image_plane(a["tex"] or os.path.join(HERE, "assets", "avatar.png"), 0.86, 0.86, 0.1115, corner=0.2)
    for o in (tile, img): o.parent = root
    fit = 1.45
elif sp == "star":
    g = glyph("\u2605", 1.25, 0.16, 0.05, mat("Gold", "#ffc21a", rough=0.18, metal=0.6, coat=1.0, coat_rough=0.03)); g.parent = root; fit = 1.3
elif sp == "coin":
    bpy.ops.mesh.primitive_cylinder_add(vertices=96, radius=0.5, depth=0.12, rotation=(R(90), 0, 0)); c = bpy.context.object
    b = c.modifiers.new("B", "BEVEL"); b.width = 0.03; b.segments = 5; bpy.ops.object.shade_smooth()
    c.data.materials.append(mat("CoinGold", "#ffcc33", rough=0.2, metal=0.9, coat=0.6)); c.parent = root
    gl = glyph("$", 0.62, 0.03, 0.01, mat("CoinMark", "#e0a100", rough=0.25, metal=0.9)); gl.location = (0, 0.075, -0.02); gl.parent = root; fit = 1.3
elif sp == "pin":
    red = glossy_plastic("PinRed", "#ff4b4b", rough=0.16)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.42, location=(0, 0, 0.25), segments=64, ring_count=32); b1 = bpy.context.object; bpy.ops.object.shade_smooth()
    bpy.ops.mesh.primitive_cone_add(vertices=64, radius1=0.36, radius2=0.0, depth=0.75, location=(0, 0, -0.27), rotation=(R(180), 0, 0)); b2 = bpy.context.object; bpy.ops.object.shade_smooth()
    for o in (b1, b2): o.data.materials.append(red); o.parent = root
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.16, location=(0, 0.32, 0.3), segments=48, ring_count=24); h = bpy.context.object; bpy.ops.object.shade_smooth()
    h.scale = (1, 0.45, 1); h.data.materials.append(glossy_plastic("PinW", "#ffffff", rough=0.2)); h.parent = root; fit = 1.5
elif sp.startswith("tile"):
    col, ch = {"tile": (a["color"], a["glyph"]),"tile_call": ("#22c55e", "\u260e"), "tile_check": ("#2f6fd6", "\u2713"), "tile_globe": ("#ff7a59", "www")}[sp]
    t = rounded_box("Tile", 1.0, 1.0, 0.24, radius=0.25, segments=14); t.data.materials.append(glossy_plastic("TileC", col, rough=0.16)); t.parent = root
    g = glyph(ch, 0.62 if len(ch) == 1 else 0.36, 0.08, 0.025, glossy_plastic("Icon", "#ffffff", rough=0.2), font=DJ)
    g.location = (0, 0.15, 0.0); g.parent = root; fit = 1.45
# camera: straight on, slight high angle like ref 1's objects
cam, aim = camera(loc=(0, 6.0, 0.35), lens=50, aim=(0, 0, 0), fstop=8.0)
cam.data.sensor_fit = "HORIZONTAL"; cam.data.lens = 36 * 6.0 / fit / (1 if W >= H else 1)
if H > W: cam.data.lens = 36 * 6.0 / fit       # width-fit for tall sprites
# seamless wobble loop
A = a["amp"]
for i in range(5):
    t = i * (N / FPS) / 4; ph = i * math.pi / 2
    key(root, "rotation_euler", t, (R(A * 0.6 * math.sin(ph)), R(A * math.cos(ph) * 0.4), R(A * math.sin(ph + 0.8))), "ease")
    key(root, "location", t, (0, 0, 0.04 * math.sin(ph)), "ease")
run_output(dict(out=a["out"], still=a["still"], frame=a["frame"], start=a["start"], end=a["end"]))
