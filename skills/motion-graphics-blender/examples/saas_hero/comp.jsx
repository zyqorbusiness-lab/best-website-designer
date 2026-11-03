// comp.jsx — EffectCraft (free After Effects alternative, ArtCraft) composite for the Zyqor v3 SaaS hero.
// Run headless:  effectcraft-cli script comp.jsx   (writes hero.ecproj), then
//                effectcraft-cli render --project hero.ecproj --comp Hero --out renders/hero_silent.mp4 --format h264 --bitrate 24000
// Same object model as After Effects ExtendScript: app.project, items.addComp, layers.addSolid, property("Effects").addProperty("Glow")...
// Layer stack (bottom -> top): 4-colour gradient world, light leak (Add), Blender 3D render (Glow + CC Light Sweep + impact shake),
// FX adjustment layers (zoom blur, whip blur, RGB split, flash, grain, vignette), 2D overlays (PIL-made PNG pills).
var HERE = "C:/path/to/saas_hero";   // EDIT: absolute path of this folder (the CLI may not fill $.fileName)
try { if ($.fileName && File($.fileName).parent && File($.fileName).parent.fsName.length > 1) HERE = File($.fileName).parent.fsName; } catch (e) {}
var W = 1080, H = 1920, FPS = 30, DUR = 16;
var RENDER_SEQ = HERE + "/renders/f/f_0001.webp";   // Blender output (RGBA WebP)
var RENDER_SCALE = 100 * W / 810;                   // rendered at 75% res for speed -> scale up
var SLAMS  = [0.0, 0.2, 9.75, 10.2, 10.65, 12.95, 13.12];   // 3D type impacts (sfx: impact/bass)
var CLICKS = [4.65, 6.1, 8.85];                              // cursor clicks (sfx: click + pop)

function hex(h){ h=h.replace("#",""); return [parseInt(h.substr(0,2),16)/255, parseInt(h.substr(2,2),16)/255, parseInt(h.substr(4,2),16)/255, 1]; }
function keys(prop, pairs, infl){             // pairs: [[t, value], ...]; infl: ease influence % (AE "easy ease" = 33, expo-like = 80+)
  for (var i=0;i<pairs.length;i++) prop.setValueAtTime(pairs[i][0], pairs[i][1]);
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

// 2) Light leak (Add) on the big transitions
var leak = comp.layers.add(imp(HERE + "/assets/ov/leak.png"));
leak.blendingMode = BlendingMode.ADD;
keys(leak.property("Opacity"), [[0,0],[1.75,0],[2.05,85],[2.6,0],[3.0,0],[3.15,35],[3.7,0],[12.3,0],[12.55,70],[13.05,0]], 50);
keys(leak.property("Position"), [[1.75,[400,960]],[2.6,[700,900]],[12.3,[700,960]],[13.05,[380,1000]]], 40);

// 3) Blender render
var r3d = comp.layers.add(imp(RENDER_SEQ, true));
r3d.property("Scale").setValue([RENDER_SCALE, RENDER_SCALE]);
r3d.property("Position").setValue([W/2, H/2]);
var glow = fx(r3d, "Glow"); P(glow,"Glow Threshold").setValue(96); P(glow,"Glow Radius").setValue(18); P(glow,"Glow Intensity").setValue(0.25);
var sweep = fx(r3d, "CC Light Sweep");                       // glossy light sweep across the screen when it lands / swings
P(sweep,"Direction").setValue(-28); P(sweep,"Width").setValue(45); P(sweep,"Sweep Intensity").setValue(28); P(sweep,"Edge Intensity").setValue(0);
keys(P(sweep,"Center"), [[0,[-600,960]],[2.95,[-600,960]],[3.75,[1700,900]],[7.75,[-600,900]],[8.45,[1700,900]],[12.9,[-600,800]],[13.6,[1700,800]]], 55);
// impact shake: decaying wiggle after every slam/click (expression, AE syntax)
r3d.property("Position").expression =
  "var t=[" + SLAMS.concat(CLICKS).join(",") + "]; var a=0; for (var i=0;i<t.length;i++){ var d=time-t[i]; if(d>=0.12&&d<0.42) a=Math.max(a,(1-(d-0.12)/0.3)*12); }" +
  " value + [a*Math.sin(time*95), a*Math.cos(time*83)];";

// 4) FX adjustment layers
var zb = adj(comp, "FX zoom-through");                       // radial zoom blur = the 'zoom transition' from AE packs
var rb = fx(zb, "CC Radial Fast Blur"); P(rb,"Center").setValue([540,960]);
keys(P(rb,"Amount"), [[0,0],[1.6,0],[1.92,90],[2.15,55],[2.4,0],[12.3,0],[12.5,45],[12.75,0]], 60);
var wb = adj(comp, "FX whip");                               // directional blur on fast camera pans
var db = fx(wb, "Directional Blur"); P(db,"Direction").setValue(75);
keys(P(db,"Blur Length"), [[0,0],[5.6,0],[5.82,55],[6.05,0],[6.95,0],[7.35,40],[7.85,0],[9.1,0],[9.45,35],[9.85,0]], 60);
var rgb = adj(comp, "FX RGB split");                         // chromatic aberration hits (glitch) on clicks & slams
var ca = fx(rgb, "VR Chromatic Aberrations");
var hits = SLAMS.concat(CLICKS).concat([1.95]); var kr=[[0,0]], kb=[[0,0]];
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

// 5) 2D overlays (honest labels + captions + CTA)
overlay(comp, "label.png",   540, 200, 2.55, 9.35);
overlay(comp, "cap_type.png",540, 1480, 4.75, 5.62);
overlay(comp, "cap_add.png", 540, 1480, 6.15, 6.98);
overlay(comp, "cap_done.png",540, 1480, 8.95, 9.7);
overlay(comp, "dm.png",      540, 1455, 13.5, 16.3);
overlay(comp, "offer.png",   540, 1575, 13.75, 16.3);
overlay(comp, "concept.png", 540, 1660, 14.0, 16.3);

app.project.save(File(HERE + "/hero.ecproj"));
"hero.ecproj saved";
