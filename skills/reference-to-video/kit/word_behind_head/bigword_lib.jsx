// bigWord(): EffectCraft big word with gradient face, 80->100 % pop with overshoot, rotation kick, depth blur, exit.
// Build one glow copy (blur arg), 12 extrusion copies (dx,dy offsets, solid warm-dark colours), then the face on top. Anton is condensed; Archivo SemiBold (ExtraBold) matches 'chunky extruded' refs.
// Needs zq_lib.jsx (fx, tr, span, setv, measure, hex, ZQ) from the kit.

function bigWord(comp,txt,cx,crownY,overlap,maxW,a,b,g,dx,dy,nm,rot,glowBlur,glowOp,sd){ dx=dx||0; dy=dy||0; rot=rot||0; sd=sd||1;
  var t=comp.layers.addText(txt); span(t,a-0.06,b+0.06); t.name=(nm||"big")+" "+txt;
  var sp=t.property("ADBE Text Properties").property("ADBE Text Document"); var d=sp.value;
  d.font="Archivo SemiBold"; d.fontSize=200; d.fillColor=[1,1,1]; d.applyFill=true; d.tracking=-6;
  d.justification=ParagraphJustification.LEFT_JUSTIFY; sp.setValue(d);
  var r=measure(t,a+0.3);
  var k=Math.min(280/r.height, maxW/r.width); d.fontSize=200*k; sp.setValue(d); r=measure(t,a+0.3);
  var cxo=r.left+r.width/2, cyo=r.top+r.height/2;
  var capTop=crownY-(1-overlap)*r.height, cy=capTop+r.height/2; cx=cx+dx; cy=cy+dy;
  fx(t,"Gradient Ramp",{"Start of Ramp":[ZQ.W/2+cxo, ZQ.H/2+r.top],"Start Color":hex(g[0]),"End of Ramp":[ZQ.W/2+cxo, ZQ.H/2+r.top+r.height],"End Color":hex(g[1]),"Ramp Shape":0});
  var P=tr(t,"ADBE Position"), S=tr(t,"ADBE Scale"), O=tr(t,"ADBE Opacity"), R=tr(t,"ADBE Rotate Z");
  var fr=1/30;
  function place(tt,sc,th){ var c=Math.cos(th*Math.PI/180), s=Math.sin(th*Math.PI/180), s_=sc/100;
    P.setValueAtTime(tt,[cx-s_*(cxo*c-cyo*s), cy-s_*(cxo*s+cyo*c)]); S.setValueAtTime(tt,[sc,sc]); R.setValueAtTime(tt,th); }
  // imperfect human pop: per-word overshoot, rotation kick that settles with a wobble
  var over=103+((sd*7)%6), kick=(sd%2?1:-1)*(2.6+((sd*3)%3)*0.7);
  var sk=[80,92,100,over,over-2,101,100], rk=[1,0.8,-0.5,0.3,-0.15,0.05,0];
  for(var i=0;i<sk.length;i++) place(a+i*fr, sk[i], rot+kick*rk[i]);
  var hold=b-0.17; place(hold-0.001+0.001, 103.4, rot-kick*0.12);
  place(b, 94, rot+kick*0.6);
  setv(O,[[a,0],[a+2*fr,100*(glowOp?glowOp:1)],[hold,100*(glowOp?glowOp:1)],[b,0]],"linear");
  fx(t,"Gaussian Blur",{"Blurriness":[[a,14],[a+0.17,0],[hold,0],[b,10]]});
  if(glowBlur) fx(t,"Gaussian Blur",{"Blurriness":glowBlur});
  ZQ.cues.push({t:Math.round(a*1000)/1000,w:txt});
  return t; }
