// zq_lib.jsx — Zyqor Motion Kit v5: EffectCraft text + effects library (ES5, After Effects-style object model).
// Text, captions, cards, transitions, backgrounds and grade are all built HERE in EffectCraft. Blender is not used for text/effects.
var ZQ = { W:1080, H:1920, FPS:30, cues:[], ASSETS:"" };  // ASSETS is set by ec_reel.py
function hex(h,a){ h=h.replace("#",""); return [parseInt(h.substr(0,2),16)/255, parseInt(h.substr(2,2),16)/255, parseInt(h.substr(4,2),16)/255, (a===undefined?1:a)]; }
function rgb(h){ var c=hex(h); return [c[0],c[1],c[2]]; }
function findProp(g,name){ if(!g||!g.numProperties) return null;
  for(var i=1;i<=g.numProperties;i++){ var p=g.property(i); if(!p) continue; if(p.name==name||p.matchName==name) return p; }
  for(var j=1;j<=g.numProperties;j++){ var q=g.property(j); if(q&&q.numProperties){ var r=findProp(q,name); if(r) return r; } } return null; }
function isKeys(v){ return (v instanceof Array) && v.length>0 && (v[0] instanceof Array) && v[0].length==2 && typeof v[0][0]=="number" && (typeof v[0][1]!="number" || v.length>1 && v[1] instanceof Array && v[1].length==2 && v[0][0]<v[1][0]); }
// premium ease: fast start, long settle (expo-out feel). kind: "out" (default), "inout", "in", "linear"
function ease(p,kind){ kind=kind||"out"; if(kind=="linear") return; var n=p.numKeys; if(!n) return;
  for(var k=1;k<=n;k++){ var dims=1; try{ var v=p.keyValue(k); if((v instanceof Array) && !p.isSpatial) dims=v.length; }catch(e){}
    var inI=(kind=="in")?30:(kind=="inout"?75:92), outI=(kind=="in")?80:(kind=="inout"?75:18);
    var ie=[],oe=[]; for(var d=0;d<dims;d++){ ie.push(new KeyframeEase(0,inI)); oe.push(new KeyframeEase(0,outI)); }
    try{ p.setTemporalEaseAtKey(k,ie,oe); }catch(e1){ try{ p.setTemporalEaseAtKey(k,[new KeyframeEase(0,inI)],[new KeyframeEase(0,outI)]); }catch(e2){} } } }
function setv(p,v,kind){ if(!p) return; if(isKeys(v)){ for(var i=0;i<v.length;i++) p.setValueAtTime(v[i][0],v[i][1]); ease(p,kind); } else p.setValue(v); }
function fx(layer,eff,vals){ var e=layer.property("ADBE Effect Parade").addProperty(eff); if(!e){ writeLn("!! no effect "+eff); return null; }
  for(var k in vals){ var p=findProp(e,k); if(!p){ writeLn("!! "+eff+": no param "+k); continue; } try{ setv(p,vals[k],"inout"); }catch(err){ writeLn("!! "+eff+"."+k+": "+err); } } return e; }
function tr(layer,name){ return layer.property("ADBE Transform Group").property(name); }
function span(layer,a,b){ layer.inPoint=a; layer.outPoint=b; return layer; }
function cue(t,sfx,db,lead){ ZQ.cues.push({t:Math.round(t*1000)/1000, sfx:sfx, db:(db===undefined?-8:db), lead:(lead||0)}); }

// ---------- BACKGROUNDS (premium, never flat dark / never purple-blue AI gradient) ----------
// paper: warm off-white + paper fibre (Fractal Noise, multiply) + soft light falloff. studio: grey sweep like a photo cyc.
function background(comp,kind,a,b,o){ o=o||{}; var L=[];
  if(kind=="paper"){
    var base=span(comp.layers.addSolid(rgb(o.color||"#F1ECE3"),"bg paper",ZQ.W,ZQ.H,1),a,b);
    fx(base,"Gradient Ramp",{"Start of Ramp":[540,300],"Start Color":hex(o.light||"#F8F5EF"),"End of Ramp":[540,2300],"End Color":hex(o.color||"#E9E2D6"),"Ramp Shape":1});
    var fib=span(comp.layers.addSolid([0.5,0.5,0.5],"paper fibre",ZQ.W,ZQ.H,1),a,b);
    fx(fib,"Fractal Noise",{"Fractal Type":0,"Contrast":160,"Scale":38,"Complexity":5});
    fib.blendingMode=BlendingMode.SOFT_LIGHT; tr(fib,"ADBE Opacity").setValue(o.fibre||16);
    var blot=span(comp.layers.addSolid([0.5,0.5,0.5],"paper tone",ZQ.W,ZQ.H,1),a,b);
    fx(blot,"Fractal Noise",{"Contrast":60,"Scale":900,"Complexity":2,"Evolution":[[a,0],[b,40]]});
    blot.blendingMode=BlendingMode.MULTIPLY; tr(blot,"ADBE Opacity").setValue(9); L=[base,fib,blot];
  } else if(kind=="studio"){
    var s=span(comp.layers.addSolid(rgb("#E6E2DB"),"bg studio",ZQ.W,ZQ.H,1),a,b);
    fx(s,"Gradient Ramp",{"Start of Ramp":[540,760],"Start Color":hex(o.light||"#F7F5F1"),"End of Ramp":[540,2050],"End Color":hex(o.color||"#C9C2B7"),"Ramp Shape":1});
    var n=span(comp.layers.addSolid([0.5,0.5,0.5],"studio texture",ZQ.W,ZQ.H,1),a,b);
    fx(n,"Fractal Noise",{"Contrast":70,"Scale":600,"Complexity":3}); n.blendingMode=BlendingMode.SOFT_LIGHT; tr(n,"ADBE Opacity").setValue(14);
    // floor shadow under the subject
    var fl=img(comp,ZQ.ASSETS+"/floor_shadow.png",a,b,"floor shadow"); tr(fl,"ADBE Position").setValue([540,o.floorY||1560]);
    tr(fl,"ADBE Opacity").setValue(o.floorOpacity||55); fl.blendingMode=BlendingMode.MULTIPLY; L=[s,n,fl];
  } else if(kind=="plate"){ // a photo / video plate: blurred, darkened slightly, slow parallax
    var ft=app.project.importFile(new ImportOptions(new File(o.file))); var p=span(comp.layers.add(ft),a,b);
    var sc=o.scale||110; setv(tr(p,"ADBE Scale"),[[a,[sc,sc]],[b,[sc+5,sc+5]]],"linear");
    fx(p,"Gaussian Blur",{"Blurriness":o.blur||24}); fx(p,"Lumetri Color",{"Exposure":-0.3,"Saturation":80}); L=[p];
  }
  return L; }

// ---------- KINETIC TEXT ----------
// style: {font, size, fill (hex) | grad:[hexA,hexB], tracking, stroke}
function textLayer(comp,s,st,a,b){ var t=comp.layers.addText(s); span(t,a,b); t.name="txt "+s;
  var sp=t.property("ADBE Text Properties").property("ADBE Text Document"); var d=sp.value;
  d.font=st.font||"Inter-Bold"; d.fontSize=st.size||96; d.fillColor=rgb(st.fill||"#FFFFFF"); d.applyFill=true;
  d.justification=ParagraphJustification.LEFT_JUSTIFY; d.tracking=(st.tracking===undefined?-10:st.tracking);
  if(st.stroke){ d.applyStroke=true; d.strokeColor=rgb(st.stroke[0]); d.strokeWidth=st.stroke[1]; d.strokeOverFill=false; }
  sp.setValue(d); t.motionBlur=true; return t; }
function measure(t,at){ var r=t.sourceRectAtTime(at,false); return r; }
// Gradient fill on a text layer (keyword highlight). Curated presets only — see GRADIENTS in zq_config.json.
function gradFill(t,g,at){ var r=measure(t,at); var p=tr(t,"ADBE Position").value; gradSpan(t,g,p[0]+r.left,p[1]+r.top,p[0]+r.left+r.width,p[1]+r.top+r.height); }
// gradient between two COMP points (so several layers can share one continuous gradient). Text effect space: [W/2,H/2] = the layer origin.
function gradSpan(t,g,x0,y0,x1,y1){ var p=tr(t,"ADBE Position").value;
  fx(t,"Gradient Ramp",{"Start of Ramp":[ZQ.W/2+x0-p[0], ZQ.H/2+y0-p[1]],"Start Color":hex(g[0]),"End of Ramp":[ZQ.W/2+x1-p[0], ZQ.H/2+y1-p[1]],"End Color":hex(g[1]),"Ramp Shape":0}); }
function softShadow(layer,o){ o=o||{}; fx(layer,"Drop Shadow",{"Shadow Color":hex(o.color||"#1B140F"),"Opacity":o.opacity||38,"Direction":180,"Distance":o.dist||10,"Softness":o.soft||28}); }
// per-character reveal on one text layer: rise + blur + fade, cascading (Range Selector, Ramp Up, eased offset)
function charReveal(t,a,dur,o){ o=o||{}; var an=t.property("ADBE Text Properties").property("ADBE Text Animators").addProperty("ADBE Text Animator");
  var pr=an.property("ADBE Text Animator Properties");
  pr.addProperty("ADBE Text Position 3D").setValue([0,o.rise||70,0]); pr.addProperty("ADBE Text Opacity").setValue(0);
  pr.addProperty("ADBE Text Blur").setValue([o.blur||14,o.blur||14]);
  if(o.track) pr.addProperty("ADBE Text Tracking Amount").setValue(o.track);
  var sel=an.property("ADBE Text Selectors").addProperty("ADBE Text Selector");
  try{ findProp(sel,"ADBE Text Range Shape").setValue(o.shape||1); }catch(e){}
  try{ findProp(sel,"ADBE Text Selector Smoothness").setValue(100); }catch(e){}
  var off=findProp(sel,"ADBE Text Percent Offset"); setv(off,[[a,o.shape==1?0:-100],[a+dur,100]],"out"); return an; }
// word-level pop (ref8 caption feel): scale overshoot + rise + blur, whole layer
function wordPop(t,a,o){ o=o||{}; var P=tr(t,"ADBE Position"), p=P.value, d=o.rise||36;
  setv(P,[[a,[p[0],p[1]+d]],[a+0.24,p]],"out"); setv(tr(t,"ADBE Opacity"),[[a,0],[a+0.12,100]],"out");
  var s=o.pop||1; if(s){ var S=tr(t,"ADBE Scale"); S.setValueAtTime(a,[86,86]); S.setValueAtTime(a+0.14,[104,104]); S.setValueAtTime(a+0.3,[100,100]); ease(S,"out"); }
  var bl=fx(t,"Gaussian Blur",{"Blurriness":[[a,16],[a+0.18,0]]}); }
function wordOut(t,b){ var P=tr(t,"ADBE Position"); var p=P.valueAtTime(b-0.2,false);
  P.setValueAtTime(b-0.18,p); P.setValueAtTime(b,[p[0],p[1]-24]); setv(tr(t,"ADBE Opacity"),[[b-0.18,100],[b,0]],"in"); }
// highlight marker bar behind a word (solid, left-anchored wipe)
function marker(comp,t,a,col,b){ var r=measure(t,a+0.3), p=tr(t,"ADBE Position").valueAtTime(a+0.3,false);
  var w=Math.round(r.width+36), h=Math.round(r.height*0.62); var m=span(comp.layers.addSolid(rgb(col),"marker",w,h,1),a,b);
  m.moveAfter(t); tr(m,"ADBE Anchor Point").setValue([0,h/2]); tr(m,"ADBE Position").setValue([p[0]+r.left-18, p[1]+r.top+r.height*0.62]);
  tr(m,"ADBE Rotate Z").setValue(-1.5); setv(tr(m,"ADBE Scale"),[[a+0.08,[0,100]],[a+0.38,[100,100]]],"out"); return m; }
// CAPTION LINE: tokens [{w:"tumhara", t:2.09, s:"b"|"r"|"i"|"g"|"m"}], laid out centred at y.  s: b bold, r regular, i serif italic accent, g gradient keyword, m marker keyword
function captionLine(comp,tokens,y,end,C){ var gap=C.gap||22, layers=[], widths=[], total=0, maxW=ZQ.W*0.78;
  for(var i=0;i<tokens.length;i++){ var k=tokens[i], st={font:C.font, size:C.size, fill:C.fill, tracking:C.tracking};
    if(k.s=="i"){ st.font=C.accentFont; st.size=Math.round(C.size*1.18); st.fill=C.accentFill||C.fill; st.tracking=0; }
    if(k.s=="r"){ st.font=C.lightFont||C.font; }
    if(k.s=="m"){ st.fill=C.markerInk||"#141414"; }
    var t=textLayer(comp,k.w,st,k.t,end); var r=measure(t,end-0.01); layers.push(t); widths.push(r.width); total+=r.width+(i?gap:0); }
  var sc=total>maxW? maxW/total:1, x=ZQ.W/2-total*sc/2;
  for(var j=0;j<layers.length;j++){ var L=layers[j], r2=measure(L,end-0.01);
    if(sc<1){ var tdp=L.property("ADBE Text Properties").property("ADBE Text Document"), dd=tdp.value; dd.fontSize=dd.fontSize*sc; tdp.setValue(dd); r2=measure(L,end-0.01); }
    tr(L,"ADBE Position").setValue([x-r2.left, y]); x+=r2.width+gap*sc;
    if(C.shadow!==false) softShadow(L,{opacity:C.shadowOpacity||34,soft:24,dist:6});
    if(tokens[j].s=="g") gradFill(L,C.grad,end-0.01);
    if(tokens[j].s=="m") marker(comp,L,tokens[j].t,C.marker||"#FFD25A",end);
    wordPop(L,tokens[j].t,{rise:C.rise||34}); wordOut(L,end);
    cue(tokens[j].t, tokens[j].s=="g"||tokens[j].s=="m"||tokens[j].s=="i" ? (C.sfxKey||"pop") : (C.sfxWord||null), -14); }
  return layers; }
// BIG TITLE: per-character cascade with tracking settle (premium kinetic type)
function title(comp,s,x,y,a,b,st,o){ o=o||{}; var full=textLayer(comp,s,st,a,b); var R=measure(full,b-0.01); var left=x-R.width/2;
  var chars=[], ws=[], sum=0; for(var i=0;i<s.length;i++){ if(s.charAt(i)==" "){ chars.push(null); ws.push(R.width/s.length*0.6); sum+=ws[i]; continue; }
    var c=textLayer(comp,s.charAt(i),st,a+i*(o.stagger||0.045),b); var r=measure(c,b-0.01); chars.push(c); ws.push(r.width); sum+=r.width; }
  var gap=(R.width-sum)/Math.max(1,s.length-1), xx=left, stg=o.stagger||0.045;
  for(var j=0;j<chars.length;j++){ var L=chars[j]; if(L){ var r2=measure(L,b-0.01); tr(L,"ADBE Position").setValue([xx-r2.left, y]);
      if(st.grad) gradSpan(L,st.grad,left,y+R.top,left+R.width,y+R.top+R.height);
      if(o.shadow!==false) softShadow(L,{opacity:22,soft:40,dist:14});
      var t0=a+j*stg; wordPop(L,t0,{rise:o.rise||90}); var bl=findProp(L.property("ADBE Effect Parade"),"Gaussian Blur"); if(bl){ var bp=findProp(bl,"Blurriness"); if(bp){ while(bp.numKeys) bp.removeKey(1); setv(bp,[[t0,o.blur||26],[t0+0.3,0]],"out"); } }
      if(o.out!==false) wordOut(L,b); }
    xx+=ws[j]+gap; }
  full.remove(); cue(a,o.sfx||"whoosh_soft",-12,0.15); return chars; }

// ---------- CARDS / CURSOR / PHONE ----------
function img(comp,file,a,b,name){ var ft=app.project.importFile(new ImportOptions(new File(file))); var L=span(comp.layers.add(ft),a,b); L.name=name||file; L.motionBlur=true; return L; }
function card(comp,file,x,y,a,b,o){ o=o||{}; var L=img(comp,file,a,b,o.name); L.threeDLayer=!!o.tilt;
  tr(L,"ADBE Position").setValue(o.tilt?[x,y,0]:[x,y]); var s=o.scale||100;
  var S=tr(L,"ADBE Scale"); var z=o.tilt?[0,0,100]:[0,0], z1=o.tilt?[s*1.07,s*1.07,100]:[s*1.07,s*1.07], z2=o.tilt?[s,s,100]:[s,s];
  S.setValueAtTime(a,z); S.setValueAtTime(a+0.22,z1); S.setValueAtTime(a+0.42,z2); ease(S,"out");
  var R=tr(L,o.tilt?"ADBE Rotate Z":"ADBE Rotate Z"); setv(R,[[a,(o.rot||0)-14],[a+0.42,o.rot||0]],"out");
  if(o.tilt){ setv(tr(L,"ADBE Rotate Y"),[[a,o.tilt[0]],[b,o.tilt[0]*0.5]],"linear"); tr(L,"ADBE Rotate X").setValue(o.tilt[1]||0); }
  // idle float: slow drift so nothing is ever a dead still
  var P=tr(L,"ADBE Position"); P.expression="var d="+(o.float||7)+"; value + [0, Math.sin((time-"+a+")*1.7)*d"+(o.tilt?", 0":"")+"]";
  softShadow(L,{opacity:o.shadow||30,soft:46,dist:22}); if(o.out!==false) cardOut(L,b);
  cue(a,o.sfx||"pop",-9); return L; }
function cardOut(L,b){ var S=tr(L,"ADBE Scale"), s=S.valueAtTime(b-0.22,false); S.setValueAtTime(b-0.2,s); var z=s.slice(0); z[0]=s[0]*0.86; z[1]=s[1]*0.86; S.setValueAtTime(b,z); ease(S,"in");
  setv(tr(L,"ADBE Opacity"),[[b-0.2,100],[b,0]],"in"); }
// cursor glides in, taps (squash + ripple), leaves. path: [[t,[x,y]],...], taps:[t,...]
function cursor(comp,file,ring,path,taps,b){ var a=path[0][0]; var c=img(comp,file,a,b,"cursor"); tr(c,"ADBE Anchor Point").setValue([12,10]);
  setv(tr(c,"ADBE Position"),path,"inout"); setv(tr(c,"ADBE Opacity"),[[a,0],[a+0.15,100]],"out"); softShadow(c,{opacity:35,soft:12,dist:6});
  var S=tr(c,"ADBE Scale"); for(var i=0;i<taps.length;i++){ var t=taps[i]; S.setValueAtTime(t-0.08,[100,100]); S.setValueAtTime(t,[80,80]); S.setValueAtTime(t+0.16,[100,100]);
    var p=tr(c,"ADBE Position").valueAtTime(t,false); var rg=img(comp,ring,t,t+0.5,"ripple"); rg.moveAfter(c); tr(rg,"ADBE Position").setValue([p[0]+4,p[1]+4]);
    setv(tr(rg,"ADBE Scale"),[[t,[10,10]],[t+0.45,[70,70]]],"out"); setv(tr(rg,"ADBE Opacity"),[[t,90],[t+0.45,0]],"out"); cue(t,"click",-8); }
  ease(S,"out"); return c; }

// ---------- TRANSITIONS (adjustment layers, never a stock "glow" wash) ----------
function adj(comp,name,a,b){ var L=span(comp.layers.addSolid([1,1,1],name,ZQ.W,ZQ.H,1),a,b); L.adjustmentLayer=true; return L; }
function zoomBlur(comp,t,o){ o=o||{}; var L=adj(comp,"tr zoom",t-0.25,t+0.25);
  fx(L,"CC Radial Fast Blur",{"Amount":[[t-0.25,0],[t,o.amount||70],[t+0.25,0]]}); cue(t,"whoosh",-10,0.22); cue(t,"bass",-14); return L; }
function whip(comp,t,dir,o){ o=o||{}; var L=adj(comp,"tr whip",t-0.18,t+0.18);
  fx(L,"Directional Blur",{"Direction":dir||90,"Blur Length":[[t-0.18,0],[t,o.len||70],[t+0.18,0]]}); cue(t,"whoosh_fast",-11,0.12); return L; }
function glitch(comp,t,o){ o=o||{}; var L=adj(comp,"tr glitch",t-0.07,t+0.1);
  fx(L,"VR Digital Glitch",{"Master Amplitude":[[t-0.07,0],[t,o.amp||70],[t+0.1,0]],"Random Seed":[[t-0.07,0],[t+0.1,9]]});
  fx(L,"VR Chromatic Aberrations",{}); cue(t,"glitch_text",-13); return L; }
function flash(comp,t){ var L=adj(comp,"tr flash",t-0.04,t+0.12); fx(L,"Exposure",{"Exposure":[[t-0.04,0],[t,0.9],[t+0.12,0]]}); return L; }
// push-in camera on a group of layers (parent to a null)
function push(comp,layers,a,b,amt){ var n=span(comp.layers.addNull(),a,b); n.name="cam push"; tr(n,"ADBE Position").setValue([540,960]);
  for(var i=0;i<layers.length;i++){ try{ layers[i].parent=n; }catch(e){} }
  setv(tr(n,"ADBE Scale"),[[a,[100,100]],[b,[100+(amt||5),100+(amt||5)]]],"linear"); return n; }

// ---------- GRADE (restrained film finish; one layer on top) ----------
function grade(comp,o){ o=o||{}; var g=adj(comp,"GRADE",0,comp.duration);
  fx(g,"Lumetri Color",{"Temperature":o.temp===undefined?6:o.temp,"Contrast":o.contrast||14,"Highlights":-8,"Shadows":6,"Blacks":-6,"Saturation":o.sat||94,"Faded Film":o.fade||4});
  fx(g,"CC Vignette",{"Amount":o.vignette||8});
  fx(g,"Add Grain",{"Viewing Mode":3,"Intensity":o.grain||0.28,"Size":1.1,"Softness":0.2,"Monochromatic":true,"Animation Speed":1});
  return g; }
