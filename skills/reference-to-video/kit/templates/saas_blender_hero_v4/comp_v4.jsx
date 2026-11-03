// comp.jsx — EffectCraft (free After Effects alternative, ArtCraft) composite for the Zyqor v4 SaaS hero (v3 + fixes: anime key-visual hook, cyan glow chrome title, dark UI, full-res render, single-bubble end).
// Run headless:  effectcraft-cli script comp.jsx   (writes hero.ecproj), then
//                effectcraft-cli render --project hero.ecproj --comp Hero --out renders/hero_silent.mp4 --format h264 --bitrate 24000
// Same object model as After Effects ExtendScript: app.project, items.addComp, layers.addSolid, property("Effects").addProperty("Glow")...
// Layer stack (bottom -> top): 4-colour gradient world, light leak (Add), Blender 3D render (Glow + CC Light Sweep + impact shake),
// FX adjustment layers (zoom blur, whip blur, RGB split, flash, grain, vignette), 2D overlays (PIL-made PNG pills).
var HERE = "/home/user/tools/motion-kit/templates/saas_blender_hero_v4";   // build_all_v4.sh rewrites this line to the real folder   // folder of this template (edit when you copy it)
try { if ($.fileName && File($.fileName).parent && File($.fileName).parent.fsName.length > 1) HERE = File($.fileName).parent.fsName; } catch (e) {}
var W = 1080, H = 1920, FPS = 30, DUR = 17;
var RENDER_SEQ = HERE + "/renders/f/f_0001.webp";   // Blender output (RGBA WebP)
var RENDER_SCALE = 100;                             // v4: rendered at 100% (v3 rendered 75% and upscaled = soft)
var SLAMS  = [0.46, 10.03, 10.45, 10.87, 13.16];   // 3D type impacts (sfx: impact/bass)
var CLICKS = [4.65, 6.1, 8.85];                              // cursor clicks (sfx: click + pop)

function hex(h){ h=h.replace("#",""); return [parseInt(h.substr(0,2),16)/255, parseInt(h.substr(2,2),16)/255, parseInt(h.substr(4,2),16)/255, 1]; }
function keys(prop, pairs, infl){             // pairs: [[t, value], ...]; infl: ease influence % (AE "easy ease" = 33, expo-like = 80+)
  var last=-1; for (var i=0;i<pairs.length;i++){ var f=Math.round(pairs[i][0]*FPS); if(f<=last) f=last+1; last=f; prop.setValueAtTime(f/FPS, pairs[i][1]); }  // keys snap to frames in EffectCraft
  if (infl) { for (var k=1;k<=prop.numKeys;k++){ try { var d = prop.value instanceof Array ? prop.value.length : 1;
      var e=[]; for (var j=0;j<(prop.isSpatial?1:d);j++) e.push(new KeyframeEase(0, infl)); prop.setTemporalEaseAtKey(k, e, e); } catch(err) {} } }
}
function fx(layer, name){ return layer.property("Effects").addProperty(name); }
function P(effect, name){ return effect.property(name); }
function adj(comp, name){ var a = comp.layers.addSolid([1,1,1], name, W, H, 1); a.adjustmentLayer = true; return a; }
function imp(path, seq){ var io = new ImportOptions(File(path)); if (seq) io.sequence = true; return app.project.importFile(io); }
function overlay(comp, file, x, y, tin, tout){
  var L = comp.layers.add(imp(HERE + "/assets/ov/" + file));
  L.property("Position").setValue([x, y]);
  var s = L.property("Scale");
  keys(s, [[0,[0,0]],[tin,[0,0]],[tin+0.16,[112,112]],[tin+0.28,[100,100]],[tout-0.12,[100,100]],[tout,[0,0]]], 70);
  var r = L.property("Rotation"); keys(r, [[tin,-8],[tin+0.3,0]], 60);
  return L;
}

var comp = app.project.items.addComp("Hero", W, H, 1, DUR, FPS);

// 1) World: 4-colour gradient (ref 2 pastel peach/coral/pink), slowly drifting
var bg = comp.layers.addSolid([1,1,1], "World", W, H, 1);
var g = fx(bg, "4-Color Gradient"); var pc = g.property(1);
pc.property("Color 1").setValue(hex("#ffe2cf")); pc.property("Color 2").setValue(hex("#ffc6da"));
pc.property("Color 3").setValue(hex("#ff9877")); pc.property("Color 4").setValue(hex("#ffb48f"));
keys(pc.property("Point 1"), [[0,[80,120]],[DUR,[320,260]]], 33);
keys(pc.property("Point 2"), [[0,[1000,300]],[DUR,[820,140]]], 33);
keys(pc.property("Point 3"), [[0,[140,1800]],[DUR,[380,1650]]], 33);
keys(pc.property("Point 4"), [[0,[1000,1700]],[DUR,[760,1880]]], 33);
P(g, "Blend").setValue(180);

// 1b) HOOK key visual (generated anime illustration, ref 2 opens on an anime close-up): push-in + the ref's tilt at ~0.8 s, gone at the cut
var hk = comp.layers.add(imp(HERE + "/assets/hook_anime_v4.jpg"));
hk.property("Position").setValue([W/2, H/2]);
keys(hk.property("Scale"), [[0,[76,76]],[2.05,[86,86]]], 20);
keys(hk.property("Rotation"), [[0,0],[0.8,0],[2.05,-3.5]], 60);
keys(hk.property("Opacity"), [[0,100],[2.04,100],[2.07,0]]);
var hv = fx(hk, "CC Vignette"); P(hv,"Amount").setValue(35);

// 2) Light leak (Add) on the big transitions
var leak = comp.layers.add(imp(HERE + "/assets/ov/leak.png"));
leak.blendingMode = BlendingMode.ADD;
keys(leak.property("Opacity"), [[0,0],[1.75,0],[2.05,85],[2.6,0],[3.0,0],[3.15,35],[3.7,0],[12.3,0],[12.55,70],[13.05,0]], 50);
keys(leak.property("Position"), [[1.75,[400,960]],[2.6,[700,900]],[12.3,[700,960]],[13.05,[380,1000]]], 40);

// 3) Blender render
var r3d = comp.layers.add(imp(RENDER_SEQ, true));
r3d.property("Scale").setValue([RENDER_SCALE, RENDER_SCALE]);
r3d.property("Position").setValue([W/2, H/2]);
// cyan glow halo for the hook title: a blurred, cyan-filled copy of the render on Add (ref 2's glowing "2026")
var halo = comp.layers.add(imp(RENDER_SEQ, true)); halo.moveAfter(r3d);
halo.blendingMode = BlendingMode.ADD; halo.property("Position").setValue([W/2, H/2]);
var hf = fx(halo, "Fill"); try { P(hf,"Color").setValue(hex("#38c8ff")); } catch(e) {}
var hb = fx(halo, "Gaussian Blur"); try { P(hb,"Blurriness").setValue(38); } catch(e) {}
keys(halo.property("Opacity"), [[0,0],[0.3,0],[0.5,95],[1.7,80],[2.0,60],[2.05,0]]);
var glow = fx(r3d, "Glow"); P(glow,"Glow Threshold").setValue(96); P(glow,"Glow Radius").setValue(18); P(glow,"Glow Intensity").setValue(0.25);
var sweep = fx(r3d, "CC Light Sweep");                       // glossy light sweep across the screen when it lands / swings
P(sweep,"Direction").setValue(-28); P(sweep,"Width").setValue(45); P(sweep,"Sweep Intensity").setValue(28); P(sweep,"Edge Intensity").setValue(0);
keys(P(sweep,"Center"), [[0,[-600,700]],[0.5,[-600,700]],[1.15,[1700,600]],[2.95,[-600,960]],[3.75,[1700,900]],[7.75,[-600,900]],[8.45,[1700,900]],[13.2,[-600,900]],[13.95,[1700,900]]], 55);
// impact shake: decaying wiggle after every slam/click (expression, AE syntax)
r3d.property("Position").expression =
  "var t=[" + SLAMS.concat(CLICKS).join(",") + "]; var a=0; for (var i=0;i<t.length;i++){ var d=time-t[i]; if(d>=0.12&&d<0.42) a=Math.max(a,(1-(d-0.12)/0.3)*12); }" +
  " value + [a*Math.sin(time*95), a*Math.cos(time*83)];";

// 4) FX adjustment layers
var zb = adj(comp, "FX zoom-through");                       // radial zoom blur = the 'zoom transition' from AE packs
var rb = fx(zb, "CC Radial Fast Blur"); P(rb,"Center").setValue([540,960]);
keys(P(rb,"Amount"), [[0,0],[1.6,0],[1.92,90],[2.15,55],[2.4,0],[12.35,0],[12.6,45],[12.85,0]], 60);
var wb = adj(comp, "FX whip");                               // directional blur on fast camera pans
var db = fx(wb, "Directional Blur"); P(db,"Direction").setValue(75);
keys(P(db,"Blur Length"), [[0,0],[5.6,0],[5.82,55],[6.05,0],[6.95,0],[7.35,40],[7.85,0],[9.1,0],[9.45,35],[9.85,0]], 60);
var rgb = adj(comp, "FX RGB split");                         // chromatic aberration hits (glitch) on clicks & slams
var ca = fx(rgb, "VR Chromatic Aberrations");
var hits = SLAMS.concat(CLICKS).concat([0.02, 0.85, 1.95]); var kr=[[0,0]], kb=[[0,0]];
hits.sort(function(a,b){return a-b;});
for (var i=0;i<hits.length;i++){ var t=hits[i]; kr.push([Math.max(0,t-0.001),0],[t+0.02,28],[t+0.12,0]); kb.push([Math.max(0,t-0.001),0],[t+0.02,-28],[t+0.12,0]); }
keys(P(ca,"Aberration (Red)"), kr); keys(P(ca,"Aberration (Blue)"), kb);
var fl = adj(comp, "FX flash");                              // 2-frame exposure flash on the type slams
var ex = fx(fl, "Exposure"); var exm = ex.property(2).property("Exposure"); var ke=[[0,0]];
for (var i=0;i<SLAMS.length;i++){ var t=SLAMS[i]+0.12; ke.push([t,0],[t+0.03,0.55],[t+0.12,0]); }
keys(exm, ke);
var fin = adj(comp, "FX finish");
var vg = fx(fin, "CC Vignette"); P(vg,"Amount").setValue(22);
var gr = fx(fin, "Add Grain"); try { gr.property(1).setValue(3); gr.property(4).property("Intensity").setValue(0.35); } catch(e) {}

// 5) 2D overlays (honest labels + captions); the end card is ONE element (the 3D bubble) + a tiny honesty line
overlay(comp, "hook_sub.png", 540, 1640, 0.95, 2.0);
overlay(comp, "label.png",   540, 200, 2.55, 9.35);
overlay(comp, "cap_type.png",540, 1480, 4.75, 5.62);
overlay(comp, "cap_add.png", 540, 1480, 6.15, 6.98);
overlay(comp, "cap_done.png",540, 1480, 8.95, 9.7);
overlay(comp, "end_line.png",540, 1780, 13.7, 17.2);

app.project.save(File(HERE + "/hero_v4.ecproj"));
"hero_v4.ecproj saved";
