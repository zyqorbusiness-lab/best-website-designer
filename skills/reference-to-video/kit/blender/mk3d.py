
"""mk3d.py — shared helpers for Zyqor Motion Kit v3 Blender templates (Blender 4.2, headless, Cycles CPU).
Import from a template:  sys.path.insert(0, os.path.dirname(__file__)); from mk3d import *
Everything is built from code: no .blend files needed.
"""
import bpy, bmesh, math, os, sys, json
from mathutils import Vector, Euler

KIT = os.path.dirname(os.path.abspath(__file__))
FONTS = os.path.join(KIT, "fonts")

def args(defaults):
    """Parse `-- --key value` style args after Blender's own '--'. Returns dict with defaults filled."""
    a = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    defaults = dict(defaults); defaults.setdefault("stills", ""); defaults.setdefault("still_dir", "")
    out = dict(defaults); i = 0
    while i < len(a):
        k = a[i].lstrip("-").replace("-", "_")
        if i + 1 < len(a) and not a[i + 1].startswith("--"):
            v = a[i + 1]; i += 2
        else:
            v = "1"; i += 1
        d = defaults.get(k)
        if isinstance(d, bool): v = v.lower() in ("1", "true", "yes")
        elif isinstance(d, int): v = int(float(v))
        elif isinstance(d, float): v = float(v)
        out[k] = v
    return out

def hex2rgb(h, a=1.0):
    """'#2b5cff' -> linear RGBA (Blender colour inputs are linear)."""
    h = h.lstrip("#"); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return (*lin, a)

def reset_scene(w=1080, h=1920, fps=30, seconds=4.0, samples=24, motion_blur=True, transparent=False, view="Standard", look="None"):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    s = bpy.context.scene
    s.render.engine = "CYCLES"
    s.cycles.device = "CPU"
    s.cycles.samples = samples
    s.cycles.use_adaptive_sampling = True
    s.cycles.adaptive_threshold = 0.04
    s.cycles.use_denoising = True
    try: s.cycles.denoiser = "OPENIMAGEDENOISE"
    except Exception: pass
    s.cycles.max_bounces = 6; s.cycles.diffuse_bounces = 2; s.cycles.glossy_bounces = 3
    s.cycles.transmission_bounces = 4; s.cycles.transparent_max_bounces = 6
    s.cycles.caustics_reflective = False; s.cycles.caustics_refractive = False
    s.cycles.blur_glossy = 1.0
    s.render.resolution_x = w; s.render.resolution_y = h; s.render.resolution_percentage = 100
    s.render.fps = fps
    s.frame_start = 1; s.frame_end = max(1, int(round(seconds * fps)))
    s.render.use_motion_blur = motion_blur
    s.render.motion_blur_shutter = 0.5
    s.render.film_transparent = transparent
    s.view_settings.view_transform = view
    s.view_settings.look = look if view == "AgX" or look == "None" else look
    s.render.image_settings.file_format = "PNG"
    s.render.image_settings.color_mode = "RGBA" if transparent else "RGB"
    s.render.image_settings.compression = 15
    s.render.use_persistent_data = True
    if s.world is None:
        s.world = bpy.data.worlds.new("World")
    return s

def world_color(top="#ffffff", strength=0.6):
    w = bpy.context.scene.world; w.use_nodes = True
    bg = w.node_tree.nodes.get("Background")
    bg.inputs[0].default_value = hex2rgb(top); bg.inputs[1].default_value = strength
    return w

def world_studio(bottom="#1b2033", horizon="#ffd6c4", top="#ffffff", strength=1.0):
    """Reflection environment (not visible when film is transparent): dark floor, warm horizon, white sky.
    This contrast is what makes chrome/glossy type read as 3D — a flat world gives flat-looking metal."""
    w = bpy.context.scene.world; w.use_nodes = True; nt = w.node_tree; N = nt.nodes; L = nt.links
    bg = N.get("Background")
    tc = N.new("ShaderNodeTexCoord"); sep = N.new("ShaderNodeSeparateXYZ"); ramp = N.new("ShaderNodeValToRGB")
    mp = N.new("ShaderNodeMapRange"); mp.inputs[1].default_value = -1; mp.inputs[2].default_value = 1
    L.new(tc.outputs["Generated"], sep.inputs[0])
    # Generated on world = view direction; use Z (up)
    L.new(sep.outputs["Z"], mp.inputs[0]); L.new(mp.outputs[0], ramp.inputs[0])
    cr = ramp.color_ramp; cr.elements[0].position = 0.42; cr.elements[0].color = hex2rgb(bottom)
    cr.elements[1].position = 0.75; cr.elements[1].color = hex2rgb(top)
    e = cr.elements.new(0.5); e.color = hex2rgb(horizon)
    L.new(ramp.outputs[0], bg.inputs[0]); bg.inputs[1].default_value = strength
    return w

def shadow_catcher(dist=-1.2, size=60, vertical=True):
    """Invisible plane that only keeps the shadows (transparent film) so EffectCraft/ffmpeg can put any background behind with real soft shadows."""
    if vertical:
        bpy.ops.mesh.primitive_plane_add(size=size, location=(0, dist, 0), rotation=(math.radians(90), 0, 0))
    else:
        bpy.ops.mesh.primitive_plane_add(size=size, location=(0, 0, dist))
    o = bpy.context.object; o.name = "ShadowCatcher"; o.is_shadow_catcher = True
    o.visible_glossy = False
    return o

def mat(name, base="#2b5cff", rough=0.2, metal=0.0, coat=0.0, coat_rough=0.03, emission=None, emit_strength=0.0, sss=0.0, alpha=1.0, spec=0.5):
    m = bpy.data.materials.new(name); m.use_nodes = True
    p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = hex2rgb(base)
    p.inputs["Roughness"].default_value = rough
    p.inputs["Metallic"].default_value = metal
    p.inputs["Coat Weight"].default_value = coat
    p.inputs["Coat Roughness"].default_value = coat_rough
    p.inputs["Specular IOR Level"].default_value = spec
    if sss: p.inputs["Subsurface Weight"].default_value = sss
    if emission:
        p.inputs["Emission Color"].default_value = hex2rgb(emission); p.inputs["Emission Strength"].default_value = emit_strength
    if alpha < 1: p.inputs["Alpha"].default_value = alpha
    return m

# Material presets matched to Pinterest/ref looks (see PINTEREST_STYLE_BIBLE.md "materials")
def glossy_plastic(name, base, rough=0.25):   return mat(name, base, rough=rough, coat=1.0, coat_rough=0.04)
def candy_chrome(name, base):                 return mat(name, base, rough=0.12, metal=0.75, coat=1.0, coat_rough=0.02)
def clay(name, base):                         return mat(name, base, rough=0.55, coat=0.15, coat_rough=0.3, sss=0.05)
def frosted_glass(name, tint="#ffffff"):
    m = bpy.data.materials.new(name); m.use_nodes = True
    p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = hex2rgb(tint); p.inputs["Roughness"].default_value = 0.25
    p.inputs["Transmission Weight"].default_value = 1.0; p.inputs["IOR"].default_value = 1.45
    return m

def gradient_backdrop(c_top="#ffd9c7", c_bottom="#ff8a72", size=60, dist=-6.0, emit=0.55, mid=None):
    """Big vertical card behind everything: diffuse+emission screen-space gradient (keeps hexes) that still catches soft shadows."""
    bpy.ops.mesh.primitive_plane_add(size=size, location=(0, dist, 0), rotation=(math.radians(90), 0, 0))
    o = bpy.context.object; o.name = "Backdrop"
    m = bpy.data.materials.new("BackdropMat"); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; L = nt.links
    for n in list(N): N.remove(n)
    out = N.new("ShaderNodeOutputMaterial")
    tc = N.new("ShaderNodeTexCoord"); sep = N.new("ShaderNodeSeparateXYZ"); ramp = N.new("ShaderNodeValToRGB")
    L.new(tc.outputs["Window"], sep.inputs[0]); L.new(sep.outputs["Y"], ramp.inputs[0])
    ramp.color_ramp.elements[0].color = hex2rgb(c_bottom); ramp.color_ramp.elements[1].color = hex2rgb(c_top)
    ramp.color_ramp.interpolation = "EASE"
    if mid:
        e = ramp.color_ramp.elements.new(0.5); e.color = hex2rgb(mid)
    dif = N.new("ShaderNodeBsdfDiffuse"); L.new(ramp.outputs[0], dif.inputs[0])
    em = N.new("ShaderNodeEmission"); L.new(ramp.outputs[0], em.inputs[0]); em.inputs[1].default_value = emit
    add = N.new("ShaderNodeAddShader"); L.new(dif.outputs[0], add.inputs[0]); L.new(em.outputs[0], add.inputs[1])
    L.new(add.outputs[0], out.inputs[0])
    o.data.materials.append(m)
    o.visible_glossy = False   # don't tint reflections with the backdrop
    return o

def area_light(name, loc, target=(0, 0, 0), energy=800, size=4, color="#ffffff", shape="RECTANGLE", size_y=None):
    d = bpy.data.lights.new(name, "AREA"); d.energy = energy; d.size = size; d.color = hex2rgb(color)[:3]
    if size_y: d.shape = shape; d.size_y = size_y
    o = bpy.data.objects.new(name, d); bpy.context.collection.objects.link(o); o.location = loc
    look_at(o, target); return o

def softbox(name, loc, target=(0, 0, 0), w=6, h=1.2, strength=6.0, camera_visible=False):
    """Emissive card that shows up as a long bright streak in glossy reflections (the 'studio' look)."""
    bpy.ops.mesh.primitive_plane_add(size=1, location=loc); o = bpy.context.object; o.name = name
    o.scale = (w, h, 1); look_at(o, target, track="Z")
    m = bpy.data.materials.new(name + "M"); m.use_nodes = True; N = m.node_tree.nodes
    p = N["Principled BSDF"]; p.inputs["Base Color"].default_value = (0, 0, 0, 1)
    p.inputs["Emission Color"].default_value = (1, 1, 1, 1); p.inputs["Emission Strength"].default_value = strength
    o.data.materials.append(m); o.visible_camera = camera_visible; o.visible_shadow = False
    return o

def studio_lights(key=1200, rim=900, fill=250, warm="#fff1e6", cool="#dfe8ff"):
    """3-point studio rig + two softboxes for reflections. Units: metres, subject ~2 m wide at origin."""
    area_light("Key", (3.5, 4.5, 5.0), energy=key, size=8, color=warm)
    area_light("Rim", (-4.5, -2.0, 4.0), energy=rim, size=3, color=cool)
    area_light("Fill", (-4.0, 6.0, -1.0), energy=fill, size=6, color="#ffffff")
    softbox("SoftTop", (0, 3.5, 5.5), w=9, h=1.6, strength=5)
    softbox("SoftSide", (-6, 3, 1.5), w=1.2, h=7, strength=4)

def look_at(obj, target, track="-Z", up="Y", invert=False):
    d = Vector(target) - obj.location
    if invert: d = -d
    obj.rotation_euler = d.to_track_quat(track, up).to_euler()

def camera(loc=(0, 9, 0.4), lens=50, aim=(0, 0, 0), dof=True, fstop=2.8, sensor=36):
    c = bpy.data.cameras.new("Cam"); c.lens = lens; c.sensor_width = sensor; c.sensor_fit = "HORIZONTAL"
    o = bpy.data.objects.new("Cam", c); bpy.context.collection.objects.link(o); o.location = loc
    e = bpy.data.objects.new("Aim", None); bpy.context.collection.objects.link(e); e.location = aim
    t = o.constraints.new("TRACK_TO"); t.target = e; t.track_axis = "TRACK_NEGATIVE_Z"; t.up_axis = "UP_Y"
    c.dof.use_dof = dof; c.dof.focus_object = e; c.dof.aperture_fstop = fstop; c.dof.aperture_blades = 7
    bpy.context.scene.camera = o
    return o, e

# ---------- keyframing with AE-style easing ----------
EASES = {"linear": ("LINEAR", "AUTO"), "ease": ("SINE", "EASE_IN_OUT"), "ease_out": ("CUBIC", "EASE_OUT"),
         "ease_in": ("CUBIC", "EASE_IN"), "expo": ("EXPO", "EASE_IN_OUT"), "expo_out": ("EXPO", "EASE_OUT"),
         "quart": ("QUART", "EASE_IN_OUT"), "quart_out": ("QUART", "EASE_OUT"), "back_out": ("BACK", "EASE_OUT"),
         "elastic_out": ("ELASTIC", "EASE_OUT"), "bounce_out": ("BOUNCE", "EASE_OUT")}

def key(obj, path, t, value, ease="expo", fps=None, index=-1):
    """Set obj.<path> = value at time t (seconds) and give the keyframe the interpolation of `ease` (applies to the segment AFTER this key)."""
    fps = fps or bpy.context.scene.render.fps
    f = 1 + t * fps
    target = obj
    if "." in path:
        parts = path.split("."); 
        for p in parts[:-1]: target = getattr(target, p)
        attr = parts[-1]
    else: attr = path
    setattr(target, attr, value)
    target.keyframe_insert(data_path=attr, frame=f, index=index)
    ad = (obj.animation_data if target is obj else getattr(target, "id_data", obj).animation_data)
    ip, ez = EASES[ease]
    if ad and ad.action:
        for fc in ad.action.fcurves:
            for kp in fc.keyframe_points:
                if abs(kp.co[0] - f) < 0.01:
                    kp.interpolation = ip; kp.easing = ez
                    if ip == "BACK": kp.back = 1.6

def text_obj(body, font="ArchivoBlack-400.ttf", size=1.0, extrude=0.18, bevel=0.03, bevel_res=5, align="CENTER", spacing=1.0, line=0.85):
    cu = bpy.data.curves.new("T_" + body[:8], "FONT"); cu.body = body
    cu.font = bpy.data.fonts.load(os.path.join(FONTS, font), check_existing=True)
    cu.size = size; cu.extrude = extrude; cu.bevel_depth = bevel; cu.bevel_resolution = bevel_res
    cu.align_x = align; cu.align_y = "CENTER"; cu.space_character = spacing; cu.space_line = line
    cu.offset = 0.0
    o = bpy.data.objects.new("T_" + body[:8], cu); bpy.context.collection.objects.link(o)
    o.rotation_euler = (math.radians(90), 0, 0)   # stand the text up facing -Y... camera looks from +Y, so flip
    o.rotation_euler = (math.radians(90), 0, math.radians(180))
    return o

def text_material_split(o, face, side):
    """Face (front cap) one material, extrusion/bevel another — the classic glossy 3D type (e.g. white face + blue sides)."""
    o.data.materials.append(face); o.data.materials.append(side)
    # Blender text: material slot 0 for front/back, slot 1 can be assigned to bevel/extrude via curve's materials per spline-not trivial;
    # convert to mesh and assign by face normal instead.
    return o

def to_mesh_split(o, face, side, face_dir=Vector((0, 1, 0))):
    """Convert text to mesh and assign `face` to polygons facing the camera (+Y world) and `side` to the rest."""
    bpy.context.view_layer.objects.active = o; o.select_set(True)
    bpy.ops.object.convert(target="MESH")
    o = bpy.context.object
    o.data.materials.clear(); o.data.materials.append(side); o.data.materials.append(face)
    mw = o.matrix_world.to_3x3()
    for p in o.data.polygons:
        n = (mw @ p.normal).normalized()
        p.material_index = 1 if n.dot(face_dir) > 0.97 else 0
    for p in o.data.polygons: p.use_smooth = True
    try:
        o.data.set_sharp_from_angle(angle=math.radians(35))
    except Exception:
        pass
    return o

def rounded_box(name, w, h, d, radius, segments=10, location=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location); o = bpy.context.object; o.name = name
    o.scale = (w, d, h); bpy.ops.object.transform_apply(scale=True)
    b = o.modifiers.new("Bevel", "BEVEL"); b.width = radius; b.segments = segments; b.limit_method = "NONE"
    bpy.ops.object.shade_smooth()
    return o

def screen_material(name, path, is_movie=False, frames=1, corner=0.06, aspect=1.6, glare=0.35):
    """Emissive screen texture (image or movie) with rounded-corner mask (SDF in shader) + a glossy coat for moving reflections."""
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; L = nt.links
    for n in list(N): N.remove(n)
    out = N.new("ShaderNodeOutputMaterial")
    tex = N.new("ShaderNodeTexImage"); img = bpy.data.images.load(path); tex.image = img
    tex.interpolation = "Cubic"
    if is_movie:
        img.source = "MOVIE"; tex.image_user.frame_duration = frames; tex.image_user.frame_start = 1
        tex.image_user.use_auto_refresh = True; tex.image_user.use_cyclic = False
    uv = N.new("ShaderNodeTexCoord"); L.new(uv.outputs["UV"], tex.inputs[0])
    # rounded-rect SDF on UV: p = (uv-0.5)*[aspect,1]; d = length(max(|p|-b+r,0)) - r
    sep = N.new("ShaderNodeSeparateXYZ"); L.new(uv.outputs["UV"], sep.inputs[0])
    def math_node(op, a=None, b=None, va=None, vb=None):
        n = N.new("ShaderNodeMath"); n.operation = op
        if a is not None: L.new(a, n.inputs[0])
        else: n.inputs[0].default_value = va
        if b is not None: L.new(b, n.inputs[1])
        elif vb is not None: n.inputs[1].default_value = vb
        return n.outputs[0]
    px = math_node("MULTIPLY", math_node("SUBTRACT", sep.outputs[0], vb=0.5), vb=aspect)
    py = math_node("SUBTRACT", sep.outputs[1], vb=0.5)
    r = corner
    qx = math_node("MAXIMUM", math_node("SUBTRACT", math_node("ABSOLUTE", px), vb=aspect / 2 - r), vb=0.0)
    qy = math_node("MAXIMUM", math_node("SUBTRACT", math_node("ABSOLUTE", py), vb=0.5 - r), vb=0.0)
    ln = math_node("SQRT", math_node("ADD", math_node("MULTIPLY", qx, qx), math_node("MULTIPLY", qy, qy)))
    dist = math_node("SUBTRACT", ln, vb=r)
    mask = math_node("LESS_THAN", dist, vb=0.0)
    p = N.new("ShaderNodeBsdfPrincipled")
    p.inputs["Base Color"].default_value = (0, 0, 0, 1); p.inputs["Roughness"].default_value = 0.2
    L.new(tex.outputs["Color"], p.inputs["Emission Color"]); p.inputs["Emission Strength"].default_value = 1.0
    p.inputs["Coat Weight"].default_value = glare; p.inputs["Coat Roughness"].default_value = 0.02
    tr = N.new("ShaderNodeBsdfTransparent")
    mix = N.new("ShaderNodeMixShader"); L.new(mask, mix.inputs[0]); L.new(tr.outputs[0], mix.inputs[1]); L.new(p.outputs[0], mix.inputs[2])
    L.new(mix.outputs[0], out.inputs[0])
    return m, img

def device_card(image, is_movie=False, frames=1, img_w=2160, img_h=1350, width=3.2, depth=0.12, bezel=0.06, body="#0d0f14", corner=0.05):
    """Tilted 'floating screen' card from ref 2: thick rounded slab + emissive screen. Returns (root_empty, screen_obj, ui_to_world fn)."""
    aspect = img_w / img_h; h = width / aspect
    root = bpy.data.objects.new("Device", None); bpy.context.collection.objects.link(root)
    slab = rounded_box("Slab", width + 2 * bezel, h + 2 * bezel, depth, radius=corner + bezel * 0.8, segments=12)
    slab.data.materials.append(glossy_plastic("SlabMat", body, rough=0.3)); slab.parent = root
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, depth / 2 + 0.002, 0), rotation=(math.radians(90), 0, math.radians(180)))
    scr = bpy.context.object; scr.name = "Screen"; scr.scale = (width, h, 1); bpy.ops.object.transform_apply(scale=True)
    # plane UVs: default plane UV covers 0..1; after rot z=180 the image reads correctly from +Y
    m, img = screen_material("ScreenMat", image, is_movie, frames, corner=corner / h, aspect=aspect)
    scr.data.materials.append(m); scr.parent = root
    def ui(x, y):
        """UI pixel (in the source image) -> local point on the screen (device space)."""
        u = x / img_w - 0.5; v = 0.5 - y / img_h
        return Vector((-u * width, depth / 2 + 0.003, v * h))
    return root, scr, ui, (width, h)

def render_png(out_dir, start=None, end=None):
    s = bpy.context.scene; os.makedirs(out_dir, exist_ok=True)
    if start: s.frame_start = start
    if end: s.frame_end = end
    s.render.filepath = os.path.join(out_dir, "f_")
    bpy.ops.render.render(animation=True)

def render_still(path, frame=1):
    s = bpy.context.scene; s.frame_set(frame); s.render.filepath = path
    bpy.ops.render.render(write_still=True)

def run_output(a):
    """Common CLI tail for every template: --still F (render one frame to a png) or --out DIR [--start N --end N]."""
    if a.get("save_blend"): bpy.ops.wm.save_as_mainfile(filepath=a["save_blend"])
    if a.get("stills"):          # --stills 20,75,150 --still_dir DIR : several preview frames in one Blender session
        os.makedirs(a["still_dir"], exist_ok=True)
        for f in str(a["stills"]).split(","):
            render_still(os.path.join(a["still_dir"], f"still_{int(f):04d}.png"), int(f))
    elif a.get("still"):
        render_still(a["still"], int(a.get("frame", 1)))
    elif a.get("out"):
        render_png(a["out"], int(a.get("start", 0)) or None, int(a.get("end", 0)) or None)
