// zq_v5_helpers.jsx - Zyqor Motion Kit v5.4 helpers (EffectCraft 0.19, AE-style ES5). Code only, no media.
// Append AFTER kit/templates/ec_kinetic_v5/zq_lib.jsx (needs its textLayer/captionLine/img/fx/setv/tr/span/adj/cue/background/softShadow).
// Needs a global `comp`. Used for the face-lock v5 reel (Nov 4 2026): scenes are rigs (null layers) that push / spin / zoom into each other.
// Pattern per scene:  var n0=comp.numLayers;  ...build the scene...;  var rg=adopt(n0,"S2",a,b,padIn,padOut);  then keyframe rg Position/Scale/Rotate Z.
// Banned on purpose: Glow, VR Chromatic Aberrations (cyan fringe), purple/cyan anything. Leaks and glitches are warm only.

// ===== v5 helpers =====
var INK="#141414", CREAM="#FFF6EA";
function fam(n){ return n; }
// sticker / card pop with overshoot, wobble and idle float
function pop(file,x,y,a,b,sc,rot,o){ o=o||{}; var L=img(comp,file,a,b,o.name||"stk"); if(o.parent) L.parent=o.parent; tr(L,"ADBE Position").setValue([x,y]);
  var S=tr(L,"ADBE Scale"); S.setValueAtTime(a,[0,0]); S.setValueAtTime(a+0.14,[sc*1.18,sc*1.18]); S.setValueAtTime(a+0.28,[sc*0.96,sc*0.96]); S.setValueAtTime(a+0.38,[sc,sc]); ease(S,"out");
  setv(tr(L,"ADBE Rotate Z"),[[a,(rot||0)-18],[a+0.3,(rot||0)+3],[a+0.42,rot||0]],"out");
  if(o.fly){ var P=tr(L,"ADBE Position"); P.setValueAtTime(a,[o.fly[0],o.fly[1]]); P.setValueAtTime(a+0.34,[x,y]); ease(P,"out"); }
  else { tr(L,"ADBE Position").expression="var d="+(o.float||6)+"; value + [Math.sin((time-"+a+")*2.1)*"+((o.float||6)*0.5)+", Math.sin((time-"+a+")*1.7)*d]"; }
  if(o.shadow!==false) softShadow(L,{opacity:o.shadow||30,soft:30,dist:14});
  if(o.out!==false){ setv(tr(L,"ADBE Opacity"),[[b-0.16,100],[b,0]],"in"); }
  cue(a,o.sfx||"pop",o.db===undefined?-10:o.db); return L; }
// card sliding up from below with overshoot (ref8 cold open)
function slideCard(file,x,y,a,b,sc,rot,o){ o=o||{}; var L=img(comp,file,a,b,o.name||"slide"); tr(L,"ADBE Scale").setValue([sc,sc]);
  var P=tr(L,"ADBE Position"); P.setValueAtTime(a,[x,y+1500]); P.setValueAtTime(a+0.34,[x,y-46]); P.setValueAtTime(a+0.52,[x,y+8]); P.setValueAtTime(a+0.64,[x,y]); ease(P,"out");
  setv(tr(L,"ADBE Rotate Z"),[[a,rot+(o.spin||14)],[a+0.5,rot]],"out");
  P.expression="value + [Math.sin((time-"+a+")*1.3)*"+(o.dx||5)+", Math.sin((time-"+a+")*1.7)*"+(o.dy||8)+"]";
  softShadow(L,{opacity:o.shadow||30,soft:46,dist:22}); cue(a+0.05,o.sfx||"whoosh_fast",-10,0.15); return L; }
// flying card (spin in from an offscreen corner, then float)
function flyCard(file,x,y,a,b,sc,rot,from,o){ o=o||{}; var L=img(comp,file,a,b,o.name||"fly"); var P=tr(L,"ADBE Position");
  P.setValueAtTime(a,from); P.setValueAtTime(a+0.38,[x,y]); ease(P,"out");
  var S=tr(L,"ADBE Scale"); S.setValueAtTime(a,[sc*0.5,sc*0.5]); S.setValueAtTime(a+0.3,[sc*1.08,sc*1.08]); S.setValueAtTime(a+0.46,[sc,sc]); ease(S,"out");
  setv(tr(L,"ADBE Rotate Z"),[[a,rot-(o.spin||40)],[a+0.46,rot]],"out");
  P.expression="value + [Math.sin((time-"+a+")*1.5)*5, Math.sin((time-"+a+")*1.9)*9]";
  softShadow(L,{opacity:o.shadow||32,soft:40,dist:20}); if(o.out!==false) setv(tr(L,"ADBE Opacity"),[[b-0.12,100],[b,0]],"in");
  cue(a+0.05,o.sfx||"pop",-9); return L; }
// SCRAMBLE title (ref8 overlay title): characters cycle through random glyphs, locking in left to right
var SCR_CH="ABCDEFGHJKLMNPRSTUVWXYZ#%&@!?";
function scramble(s,x,y,a,b,st,o){ o=o||{}; var N=o.steps||7, dt=o.dt||0.05, seed=o.seed||7; var len=s.length, layers=[];
  function rnd(){ seed=(seed*9301+49297)%233280; return seed/233280; }
  for(var k=0;k<=N;k++){ var str=""; var lock=Math.floor(len*k/N);
    for(var i=0;i<len;i++){ var ch=s.charAt(i); str+= (i<lock||ch==" "||ch=="-") ? ch : SCR_CH.charAt(Math.floor(rnd()*SCR_CH.length)); }
    var a0=a+k*dt, b0=(k<N)?a+(k+1)*dt:b; var t=textLayer(comp,str,st,a0,b0); var r=measure(t,a0+0.001);
    tr(t,"ADBE Position").setValue([x-r.left-r.width/2, y]); if(o.shadow!==false) softShadow(t,{opacity:o.shadowOpacity||22,soft:36,dist:12});
    if(k==N){ if(st.grad) gradFill(t,st.grad,b-0.01); var S=tr(t,"ADBE Scale"); S.setValueAtTime(a0,[112,112]); S.setValueAtTime(a0+0.16,[100,100]); ease(S,"out"); if(o.out!==false) setv(tr(t,"ADBE Opacity"),[[b-0.14,100],[b,0]],"in"); }
    layers.push(t); }
  cue(a,o.sfx||"glitch_text",-14); return layers; }
// background tone segment (premium textured paper in a warm palette); wipe-in from a side
function bgSeg(a,b,col,light,o){ o=o||{}; var Ls=background(comp,"paper",a,b,{color:col,light:light,fibre:o.fibre||18});
  if(o.wipe){ var w=Ls[0]; var e=fx(w,"Linear Wipe",{"Transition Completion":[[a,100],[a+(o.wd||0.34),0]],"Wipe Angle":o.wipe,"Feather":6}); 
    for(var i=1;i<Ls.length;i++){ setv(tr(Ls[i],"ADBE Opacity"),[[a,0],[a+(o.wd||0.34),Ls[i].property("ADBE Transform Group").property("ADBE Opacity").value]],"out"); } }
  return Ls; }
// adopt every layer created since n0 into a rig null (so a scene can move/transition as one)
function adopt(n0,name,a,b,padA,padB){ var k=comp.numLayers-n0; var kids=[];
  for(var i=1;i<=k;i++){ var L=comp.layer(i); if(L.adjustmentLayer) continue; if(L.parent) continue; kids.push(L);
    if(Math.abs(L.outPoint-b)<0.05) L.outPoint=b+padB; if(Math.abs(L.inPoint-a)<0.05) L.inPoint=a-padA; }
  var rg=comp.layers.addNull(); rg.name="rig "+name; span(rg,a-padA,b+padB); tr(rg,"ADBE Position").setValue([540,960]);
  for(var j=0;j<kids.length;j++) kids[j].parent=rg; return rg; }
// transitions (adjustment layers over everything)
function dirBlur(t0,t1,dir,len){ var L=adj(comp,"tr dirblur",t0,t1); var m=(t0+t1)/2; fx(L,"Directional Blur",{"Direction":dir,"Blur Length":[[t0,0],[m,len],[t1,0]]}); return L; }
function spinBlur(t0,t1,amt){ var L=adj(comp,"tr spin",t0,t1); var m=(t0+t1)/2; fx(L,"Radial Blur",{"Amount":[[t0,0],[m,amt],[t1,0]],"Type":1}); fx(L,"CC Radial Fast Blur",{"Amount":[[t0,0],[m,Math.round(amt*0.7)],[t1,0]]}); return L; }
function zoomThrough(t0,t1,amt){ var L=adj(comp,"tr zoomthru",t0,t1); var m=(t0+t1)/2; fx(L,"CC Radial Fast Blur",{"Amount":[[t0,0],[m,amt],[t1,0]]}); return L; }
function warmGlitch(t,dur,o){ o=o||{}; var a=t-0.06,b=t+(dur||0.22); var L=adj(comp,"tr glitch",a,b);
  var e=fx(L,"VR Digital Glitch",{"Master Amplitude":[[a,0],[t-0.02,o.amp||60],[t+0.06,o.amp||60],[b,0]],"Random Seed":[[a,0],[b,13]]});
  
  // warm hit: red-amber tint pulse (no cyan, no blue)
  var F=span(comp.layers.addSolid(rgb("#FF4A1C"),"tr glitch tint",ZQ.W,ZQ.H,1),a,b); F.blendingMode=BlendingMode.COLOR; setv(tr(F,"ADBE Opacity"),[[a,0],[t,38],[t+0.07,0],[t+0.1,28],[b,0]],"linear");
  var F2=span(comp.layers.addSolid(rgb("#FFC24A"),"tr glitch slab",ZQ.W,ZQ.H,1),a,b); F2.blendingMode=BlendingMode.SCREEN; setv(tr(F2,"ADBE Opacity"),[[a,0],[t-0.01,0],[t,34],[t+0.04,0]],"linear");
  cue(t,"glitch_text",-12); return L; }
// light leak (warm gradient sweeps, screen blended; no glow effect)
function leak(t,o){ o=o||{}; var d=o.dur||0.8, a=t-(o.pre||0.3), b=t+d;
  var A=span(comp.layers.addSolid([1,1,1],"tr leak A",ZQ.W*2,ZQ.H,1),a,b);
  fx(A,"Gradient Ramp",{"Start of Ramp":[0,420],"Start Color":hex("#FFB347"),"End of Ramp":[2160,1500],"End Color":hex("#FF3B0F"),"Ramp Shape":0});
  A.blendingMode=BlendingMode.SCREEN; setv(tr(A,"ADBE Position"),[[a,[-420,960]],[t,[420,960]],[b,[1200,960]]],"linear");
  setv(tr(A,"ADBE Opacity"),[[a,0],[t-0.05,78],[t+0.08,64],[b-0.1,0]],"out");
  var B=span(comp.layers.addSolid([1,1,1],"tr leak B",ZQ.W,ZQ.H*2,1),a+0.05,b-0.05);
  fx(B,"Gradient Ramp",{"Start of Ramp":[540,0],"Start Color":hex("#FF8A2A"),"End of Ramp":[540,3840],"End Color":hex("#C93A12"),"Ramp Shape":0});
  B.blendingMode=BlendingMode.SCREEN; setv(tr(B,"ADBE Position"),[[a,[540,2300]],[b,[540,-380]]],"linear"); setv(tr(B,"ADBE Opacity"),[[a,0],[t,70],[b-0.05,0]],"out");
  var X=adj(comp,"tr leak exp",t-0.08,t+0.24); fx(X,"Exposure",{"Exposure":[[t-0.08,0],[t-0.01,0.2],[t+0.02,0.55],[t+0.2,0]]});
  var G=span(comp.layers.addSolid([0.5,0.5,0.5],"tr leak grain",ZQ.W,ZQ.H,1),a,b); fx(G,"Fractal Noise",{"Contrast":140,"Scale":160,"Complexity":5,"Evolution":[[a,0],[b,300]]}); G.blendingMode=BlendingMode.OVERLAY; setv(tr(G,"ADBE Opacity"),[[a,0],[t,40],[b,0]],"out");
  cue(t,"riser",-12,0.9); cue(t,"impact",-12); return A; }
// phone (image sequence made from chat.html states)
function phoneSeq(first,t0,a,b,name,pos,sc){ var io=new ImportOptions(new File(first)); io.sequence=true; var ft=app.project.importFile(io); var L=comp.layers.add(ft); L.startTime=t0; L.inPoint=a; L.outPoint=b; L.name=name; L.motionBlur=true;
  setv(tr(L,"ADBE Position"),pos,"inout"); setv(tr(L,"ADBE Scale"),sc,"inout"); softShadow(L,{opacity:34,soft:80,dist:40}); return L; }
// finger tap ring parented to the phone layer; (x,y) = rect centre in phone pixels
function tapRing(ph,x,y,t,ring){ var rg=img(comp,ring,t,t+0.5,"tap"); rg.parent=ph; rg.motionBlur=false; tr(rg,"ADBE Position").setValue([x,y]);
  setv(tr(rg,"ADBE Scale"),[[t,[40,40]],[t+0.4,[210,210]]],"out"); setv(tr(rg,"ADBE Opacity"),[[t,95],[t+0.4,0]],"out"); cue(t,"click",-9); return rg; }
