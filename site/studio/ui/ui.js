(function(){"use strict";
var RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
var M=document.body.dataset.build==="m";
var MAC=/Mac|iPhone|iPad/.test(navigator.platform||navigator.userAgent);
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
if(MAC)$$("[data-mod]").forEach(function(k){k.textContent="\u2318"});

/* tiny spring: x -> target, calls onFrame(x,v) */
function spring(opt){var x=opt.from,v=0,k=opt.k||520,c=opt.c||26,raf=0,target=opt.from;
 function step(){var dt=1/60;for(var i=0;i<2;i++){var a=-k*(x-target)-c*v;v+=a*dt/2;x+=v*dt/2}opt.frame(x,v);if(Math.abs(v)<.01&&Math.abs(x-target)<.01){x=target;v=0;opt.frame(x,0);raf=0;return}raf=requestAnimationFrame(step)}
 return{to:function(t){target=t;if(RM){x=t;v=0;opt.frame(x,0);return}if(!raf)raf=requestAnimationFrame(step)},set:function(t){target=x=t;v=0;opt.frame(x,0)}}}

/* reveal on scroll */
if(!RM&&"IntersectionObserver"in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}})},{rootMargin:"0px 0px -6% 0px"});
 $$(".card,.a11y-g>div,.h2").forEach(function(el,i){el.classList.add("rv");el.style.transitionDelay=(i%3)*70+"ms";io.observe(el)})}

/* filters */
var cards=$$(".card"),fbtn=$$(".f"),gcount=$(".gcount");
fbtn.forEach(function(b){b.addEventListener("click",function(){var f=b.dataset.f;
 var first=new Map();cards.forEach(function(c){if(!c.classList.contains("hide"))first.set(c,c.getBoundingClientRect())});
 fbtn.forEach(function(x){var on=x===b;x.classList.toggle("on",on);x.setAttribute("aria-pressed",on)});
 var n=0;cards.forEach(function(c){var show=f==="all"||c.dataset.cat===f;c.classList.toggle("hide",!show);if(show)n++});
 gcount.textContent=f==="all"?"Showing all 16":"Showing "+n+" of 16 \u00b7 "+b.firstChild.textContent.trim();
 if(RM)return;
 cards.forEach(function(c){if(c.classList.contains("hide"))return;var l=c.getBoundingClientRect(),p=first.get(c);
  if(p){var dx=p.left-l.left,dy=p.top-l.top;if(!dx&&!dy)return;c.animate([{transform:"translate("+dx+"px,"+dy+"px)"},{transform:"none"}],{duration:600,easing:"cubic-bezier(.16,1,.3,1)"})}
  else c.animate([{opacity:0,transform:"scale(.96)"},{opacity:1,transform:"none"}],{duration:450,easing:"cubic-bezier(.16,1,.3,1)"})});
})});

/* 01 magnetic */
$$("[data-mag]").forEach(function(b){var lab=$(".mag-label",b),ic=$(".mag-ic",b);
 function origin(e){var r=b.getBoundingClientRect();b.style.setProperty("--mx",(e.clientX-r.left)+"px");b.style.setProperty("--my",(e.clientY-r.top)+"px")}
 b.addEventListener("pointerenter",origin);b.addEventListener("pointerleave",function(e){origin(e);b.style.transform="";lab.style.transform="";ic.style.transform=""});
 if(!M&&!RM)b.addEventListener("pointermove",function(e){if(e.pointerType!=="mouse")return;var r=b.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);
  b.style.transform="translate("+dx*.22+"px,"+dy*.3+"px)";lab.style.transform="translate("+dx*.08+"px,"+dy*.1+"px)";ic.style.transform="translate("+dx*.14+"px,"+dy*.16+"px) rotate(-45deg)"});
 b.addEventListener("pointerdown",function(e){origin(e);b.classList.add("press")});
 ["pointerup","pointercancel"].forEach(function(t){b.addEventListener(t,function(){setTimeout(function(){b.classList.remove("press")},M?500:0)})});
 b.addEventListener("focus",function(){b.style.setProperty("--mx","0px");b.style.setProperty("--my","50%")});
 b.addEventListener("click",function(){toast("Concept button. In a live build this opens the project brief.","Pressed")});
});

/* 02 morph menu */
(function(){var mm=$(".mm");if(!mm)return;var b=$(".mm-btn",mm),p=$(".mm-panel",mm);
 function set(o){b.setAttribute("aria-expanded",o);b.setAttribute("aria-label",o?"Close menu":"Open menu");
  if(o){p.hidden=false;requestAnimationFrame(function(){mm.classList.add("open")});setTimeout(function(){var a=$("a",p);a&&a.focus({preventScroll:true})},RM?0:260)}
  else{mm.classList.remove("open");setTimeout(function(){if(!mm.classList.contains("open"))p.hidden=true},RM?0:600)}}
 b.addEventListener("click",function(){set(b.getAttribute("aria-expanded")!=="true")});
 mm.addEventListener("keydown",function(e){if(e.key==="Escape"&&mm.classList.contains("open")){set(false);b.focus()}});
 $$("a",p).forEach(function(a){a.addEventListener("click",function(){set(false)})});
})();

/* 03 segmented */
$$(".seg").forEach(function(g){var bs=$$("button",g),ind=$(".seg-ind",g),out=g.parentNode.querySelector(".seg-out");
 var msg={Weekly:"Billed every Monday. Pause any week.",Monthly:"Billed monthly. Cancel any time.",Yearly:"Billed once a year. Two months free."};
 var cur=bs.findIndex(function(b){return b.getAttribute("aria-checked")==="true"}),x={l:0,w:0};
 function place(b,anim){var gl=g.getBoundingClientRect(),r=b.getBoundingClientRect(),L=r.left-gl.left,W=r.width;
  if(!anim||RM){ind.style.transform="translateX("+L+"px)";ind.style.width=W+"px";x={l:L,w:W};return}
  var from=x;x={l:L,w:W};var minL=Math.min(from.l,L),maxR=Math.max(from.l+from.w,L+W);
  ind.animate([{transform:"translateX("+from.l+"px)",width:from.w+"px"},{transform:"translateX("+minL+"px)",width:(maxR-minL)+"px",offset:.45},{transform:"translateX("+L+"px)",width:W+"px"}],{duration:480,easing:"cubic-bezier(.65,0,.35,1)"});
  ind.style.transform="translateX("+L+"px)";ind.style.width=W+"px"}
 function sel(i,focus){cur=i;bs.forEach(function(b,j){b.setAttribute("aria-checked",j===i);b.tabIndex=j===i?0:-1});place(bs[i],true);if(focus)bs[i].focus();out.textContent=msg[bs[i].textContent]}
 bs.forEach(function(b,i){b.addEventListener("click",function(){sel(i)})});
 g.addEventListener("keydown",function(e){var d=e.key==="ArrowRight"||e.key==="ArrowDown"?1:e.key==="ArrowLeft"||e.key==="ArrowUp"?-1:0;if(!d)return;e.preventDefault();sel((cur+d+bs.length)%bs.length,true)});
 function init(){place(bs[cur],false)}init();if(document.fonts)document.fonts.ready.then(init);addEventListener("resize",init);
});

/* 04 spring toggle */
$$(".tg").forEach(function(t){var k=$(".tg-k",t),out=t.closest(".stage").querySelector(".tg-out");
 var sp=spring({from:0,k:520,c:26,frame:function(x,v){k.style.setProperty("--x",(x*34)+"px");k.style.setProperty("--sx",(1+Math.min(Math.abs(v)*.012,.18)).toFixed(3))}});
 t.addEventListener("click",function(){var on=t.getAttribute("aria-checked")!=="true";t.setAttribute("aria-checked",on);sp.to(on?1:0);out.textContent=on?"Quiet until 7:00 tomorrow":"Notifications on"});
});

/* 05 add to bag */
$$(".cart").forEach(function(b){var cnt=b.parentNode.querySelector(".bag-count"),n=$(".bc-n",cnt),c=0,busy=false;
 function w(state){var s=$(".s-"+state,b);var m=document.createElement("span");m.style.cssText="position:absolute;visibility:hidden;white-space:nowrap;font:inherit;font-weight:700;display:inline-flex;gap:9px";m.innerHTML=s.innerHTML;b.appendChild(m);var W=m.getBoundingClientRect().width+56;m.remove();b.style.setProperty("--w",Math.ceil(W)+"px")}
 w("idle");if(document.fonts)document.fonts.ready.then(function(){if(b.dataset.state==="idle")w("idle")});
 b.addEventListener("click",function(){if(busy)return;busy=true;b.dataset.state="busy";w("busy");b.setAttribute("aria-busy","true");
  setTimeout(function(){b.dataset.state="done";w("done");b.removeAttribute("aria-busy");c++;n.textContent=c;cnt.classList.remove("bump");void cnt.offsetWidth;cnt.classList.add("bump");
   setTimeout(function(){b.dataset.state="idle";w("idle");busy=false},1800)},RM?200:900)});
});

/* 06 range */
$$(".rg").forEach(function(r){var i=$("input",r),o=$("output",r),prev=r.parentNode.querySelector(".rg-prev");
 function u(){var f=(i.value-i.min)/(i.max-i.min);r.style.setProperty("--f",f);i.style.setProperty("--v",(f*100)+"%");o.textContent=i.value;if(prev)prev.style.setProperty("--g",(i.value/100*.9).toFixed(2));i.setAttribute("aria-valuetext",i.value+" per cent grain")}
 i.addEventListener("input",u);u()});

/* 07 copy chip */
$$("[data-copy]").forEach(function(b){var live=b.parentNode.querySelector("[data-copy-live]"),t=0;
 b.addEventListener("click",function(){var v=b.dataset.copy;
  function ok(){b.classList.add("done");live.textContent="Copied "+v;clearTimeout(t);t=setTimeout(function(){b.classList.remove("done");live.textContent=""},2000)}
  function fallback(){try{var ta=document.createElement("textarea");ta.value=v;ta.setAttribute("readonly","");ta.style.cssText="position:fixed;opacity:0";document.body.appendChild(ta);ta.select();document.execCommand("copy");ta.remove()}catch(e){}ok()}
  if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(v).then(ok,fallback)}else fallback()})});

/* 08 otp */
$$(".otp").forEach(function(fs){var ins=$$(".otp-i",fs),out=fs.parentNode.querySelector(".otp-out");
 function code(){return ins.map(function(i){return i.value}).join("")}
 function check(){var c=code();fs.classList.remove("ok","bad");if(c.length<6){out.textContent=c.length?(6-c.length)+" to go.":"Six digits. You can paste the whole code.";return}
  if(c==="482913"){fs.classList.add("ok");out.textContent="Verified. Welcome back."}else{void fs.offsetWidth;fs.classList.add("bad");out.textContent="That code does not match. Try 482913."}}
 function fill(i,ch){ins[i].value=ch;ins[i].classList.remove("fill");if(ch){void ins[i].offsetWidth;ins[i].classList.add("fill")}}
 ins.forEach(function(inp,i){
  inp.addEventListener("input",function(){var d=inp.value.replace(/\D/g,"");if(d.length>1){paste(d,i);return}fill(i,d);if(d&&i<5)ins[i+1].focus();check()});
  inp.addEventListener("keydown",function(e){if(e.key==="Backspace"&&!inp.value&&i>0){e.preventDefault();fill(i-1,"");ins[i-1].focus();check()}else if(e.key==="ArrowLeft"&&i>0){e.preventDefault();ins[i-1].focus()}else if(e.key==="ArrowRight"&&i<5){e.preventDefault();ins[i+1].focus()}});
  inp.addEventListener("paste",function(e){var d=((e.clipboardData||window.clipboardData).getData("text")||"").replace(/\D/g,"");if(!d)return;e.preventDefault();paste(d,i)});
  inp.addEventListener("focus",function(){inp.select()})});
 function paste(d,start){for(var k=0;k<d.length&&start+k<6;k++)fill(start+k,d[k]);ins[Math.min(start+d.length,5)].focus();check()}
});

/* 09 like burst */
$$(".like").forEach(function(b){var burst=$(".burst",b),n=b.parentNode.querySelector(".like-n"),base=128;
 b.addEventListener("click",function(){var on=b.getAttribute("aria-pressed")!=="true";b.setAttribute("aria-pressed",on);b.setAttribute("aria-label",on?"Saved. Press to remove":"Save this concept");n.textContent=base+(on?1:0);
  if(!on||RM)return;burst.innerHTML="";for(var i=0;i<8;i++){var s=document.createElement("i"),a=i/8*360+(i%2?12:0),d=46+(i%3)*8;burst.appendChild(s);
   s.animate([{transform:"rotate("+a+"deg) translateY(-18px) scaleY(.2)",opacity:1},{transform:"rotate("+a+"deg) translateY(-"+d+"px) scaleY(1)",opacity:1,offset:.5},{transform:"rotate("+a+"deg) translateY(-"+(d+10)+"px) scaleY(.1)",opacity:0}],{duration:620,delay:i%2*40,easing:"cubic-bezier(.16,1,.3,1)",fill:"forwards"})}
  b.animate([{transform:"scale(.82)"},{transform:"scale(1.06)"},{transform:"scale(1)"}],{duration:420,easing:"cubic-bezier(.34,1.56,.64,1)"})});
});

/* 10 compare */
$$(".cmp").forEach(function(c){var h=$(".cmp-h",c),p=52,drag=false;
 function set(v){p=Math.max(0,Math.min(100,v));c.style.setProperty("--p",p+"%");h.setAttribute("aria-valuenow",Math.round(p));h.setAttribute("aria-valuetext",Math.round(p)+" percent graded")}
 function fromE(e){var r=c.getBoundingClientRect();set((e.clientX-r.left)/r.width*100)}
 c.addEventListener("pointerdown",function(e){drag=true;c.classList.add("drag");try{c.setPointerCapture(e.pointerId)}catch(_){}fromE(e)});
 c.addEventListener("pointermove",function(e){if(drag)fromE(e)});
 ["pointerup","pointercancel","lostpointercapture"].forEach(function(t){c.addEventListener(t,function(){drag=false;c.classList.remove("drag")})});
 h.addEventListener("keydown",function(e){var m={ArrowLeft:-5,ArrowDown:-5,ArrowRight:5,ArrowUp:5,PageDown:-20,PageUp:20};if(e.key in m){e.preventDefault();set(Math.round((p+m[e.key])/5)*5)}else if(e.key==="Home"){e.preventDefault();set(0)}else if(e.key==="End"){e.preventDefault();set(100)}});
 if(!RM&&"IntersectionObserver"in window){var o=new IntersectionObserver(function(es){if(es[0].isIntersecting){o.disconnect();var t0=performance.now();(function f(t){var k=Math.min((t-t0)/1400,1),e=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;if(!drag)set(52+Math.sin(e*Math.PI*2)*-18);if(k<1)requestAnimationFrame(f)})(t0)}},{threshold:.6});o.observe(c)}
});

/* 11 reorder */
$$(".ro").forEach(function(list){var out=list.parentNode.querySelector(".ro-out"),lifted=null;
 function items(){return $$(".ro-i",list)}
 function flip(fn){var f=new Map();items().forEach(function(li){f.set(li,li.getBoundingClientRect().top)});fn();if(RM)return;items().forEach(function(li){var d=f.get(li)-li.getBoundingClientRect().top;if(d&&li!==dragEl)li.animate([{transform:"translateY("+d+"px)"},{transform:"none"}],{duration:320,easing:"cubic-bezier(.16,1,.3,1)"})})}
 var tl=list.parentNode.querySelector(".ro-tl");function tline(){if(!tl)return;if(!tl.children.length)items().forEach(function(){tl.appendChild(document.createElement("span"))});var sp=tl.children;items().forEach(function(li,i){sp[i].style.flexGrow=li.dataset.days})}tline();var _mo=new MutationObserver(tline);_mo.observe(list,{childList:true});
 function name(li){return $(".ro-n",li).textContent}
 function pos(li){return items().indexOf(li)+1}
 /* keyboard */
 list.addEventListener("keydown",function(e){var li=e.target.closest(".ro-i");if(!li)return;
  if(e.key===" "||e.key==="Enter"){e.preventDefault();if(lifted===li){li.classList.remove("lift");lifted=null;out.textContent=name(li)+" dropped at position "+pos(li)+" of 5."}else{if(lifted)lifted.classList.remove("lift");lifted=li;li.classList.add("lift");out.textContent=name(li)+" lifted. Position "+pos(li)+" of 5. Use arrow keys to move."}return}
  if(e.key==="Escape"&&lifted){lifted.classList.remove("lift");lifted=null;out.textContent="Move cancelled.";return}
  var d=e.key==="ArrowUp"?-1:e.key==="ArrowDown"?1:0;if(!d)return;e.preventDefault();var its=items(),i=its.indexOf(li);
  if(lifted===li){var j=i+d;if(j<0||j>=its.length)return;flip(function(){if(d<0)list.insertBefore(its[j],li.nextSibling);else list.insertBefore(its[j],li)});li.focus();out.textContent=name(li)+", position "+pos(li)+" of 5."}
  else{var n=its[i+d];n&&n.focus()}});
 list.addEventListener("focusout",function(e){if(!lifted||e.target!==lifted)return;setTimeout(function(){if(lifted&&document.activeElement!==lifted){lifted.classList.remove("lift");lifted=null}},0)});
 /* pointer */
 var dragEl=null,startY=0,offY=0,moved=false;
 list.addEventListener("pointerdown",function(e){var li=e.target.closest(".ro-i");if(!li||e.button>0)return;dragEl=li;startY=e.clientY;offY=0;moved=false;try{li.setPointerCapture(e.pointerId)}catch(_){}});
 list.addEventListener("pointermove",function(e){if(!dragEl)return;var dy=e.clientY-startY;if(!moved&&Math.abs(dy)<4)return;if(!moved){moved=true;dragEl.classList.add("lift")}
  offY=dy;dragEl.style.transform="translateY("+offY+"px) scale(1.02)";
  var its=items(),i=its.indexOf(dragEl),r=dragEl.getBoundingClientRect(),mid=r.top+r.height/2;
  var nx=its[i+1],pv=its[i-1];
  if(nx){var nr=nx.getBoundingClientRect();if(mid>nr.top+nr.height/2){var before=dragEl.getBoundingClientRect().top;flip(function(){list.insertBefore(nx,dragEl)});var after=dragEl.getBoundingClientRect().top-offY;startY+=after-(before-offY);offY=e.clientY-startY;dragEl.style.transform="translateY("+offY+"px) scale(1.02)"}}
  if(pv){var pr=pv.getBoundingClientRect();if(mid<pr.top+pr.height/2){var b2=dragEl.getBoundingClientRect().top;flip(function(){list.insertBefore(pv,dragEl.nextSibling)});var a2=dragEl.getBoundingClientRect().top-offY;startY+=a2-(b2-offY);offY=e.clientY-startY;dragEl.style.transform="translateY("+offY+"px) scale(1.02)"}}});
 function end(){if(!dragEl)return;var li=dragEl;dragEl=null;if(!moved)return;var from=offY;li.style.transform="";li.classList.remove("lift");if(!RM)li.animate([{transform:"translateY("+from+"px) scale(1.02)"},{transform:"none"}],{duration:380,easing:"cubic-bezier(.34,1.56,.64,1)"});out.textContent=name(li)+" moved to position "+pos(li)+" of 5."}
 list.addEventListener("pointerup",end);list.addEventListener("pointercancel",end);
});

/* 12 tilt */
$$(".tilt").forEach(function(t){var raf=0,tx=0,ty=0;
 function apply(rx,ry,gx,gy,go){t.style.setProperty("--rx",rx+"deg");t.style.setProperty("--ry",ry+"deg");t.style.setProperty("--gx",gx+"%");t.style.setProperty("--gy",gy+"%");t.style.setProperty("--go",go)}
 function mv(e){var r=t.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;x=Math.max(0,Math.min(1,x));y=Math.max(0,Math.min(1,y));
  if(RM){apply(0,0,(1-x)*100,(1-y)*100,.5);return}apply(((.5-y)*16).toFixed(2),((x-.5)*16).toFixed(2),((1-x)*100).toFixed(1),((1-y)*100).toFixed(1),.6)}
 t.addEventListener("pointerenter",function(){t.classList.add("live")});
 t.addEventListener("pointermove",mv);
 t.addEventListener("pointerleave",function(){t.classList.remove("live");apply(0,0,50,30,.35)});
 t.addEventListener("pointerup",function(e){if(e.pointerType!=="mouse"){t.classList.remove("live");apply(0,0,50,30,.35)}});
 t.addEventListener("keydown",function(e){var m={ArrowLeft:[0,-1],ArrowRight:[0,1],ArrowUp:[1,0],ArrowDown:[-1,0]}[e.key];if(!m)return;e.preventDefault();tx=Math.max(-8,Math.min(8,tx+m[0]*4));ty=Math.max(-8,Math.min(8,ty+m[1]*4));apply(tx,ty,50-ty*5,30+tx*5,.6)});
 t.addEventListener("blur",function(){tx=ty=0;apply(0,0,50,30,.35)});
});

/* 14 toasts */
var TQ=[],tl=$(".toasts");
function layout(expanded){var vis=TQ.slice(-3);TQ.forEach(function(o){if(vis.indexOf(o)<0)o.el.style.opacity=0});
 vis.forEach(function(o,i){var d=vis.length-1-i;var y=expanded?-d*64:-d*12,s=expanded?1:1-d*.06;o.el.style.transform="translateY("+y+"px) scale("+s+")";o.el.style.opacity=d>2?0:1;o.el.style.zIndex=10-d})}
function kill(o){var i=TQ.indexOf(o);if(i<0)return;TQ.splice(i,1);clearTimeout(o.t);o.el.style.opacity=0;o.el.style.transform+=" translateY(16px)";setTimeout(function(){o.el.remove()},RM?0:400);layout(tl&&tl.matches(":hover,:focus-within"))}
function arm(o){var left=o.left;o.start=performance.now();o.t=setTimeout(function(){kill(o)},left);if(o.anim){o.anim.play()}}
function toast(msg,title){if(!tl)return;var li=document.createElement("li");li.className="toast";
 li.innerHTML='<span class="ti"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span><span class="tx"><b></b> <span></span></span><button class="tclose" type="button" aria-label="Dismiss notification"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17"/></svg></button><span class="tbar" aria-hidden="true"><i></i></span>';
 $("b",li).textContent=title;$(".tx span",li).textContent=msg;tl.appendChild(li);var o={el:li,left:5000};TQ.push(o);
 if(!RM){li.animate([{opacity:0,transform:"translateY(30px) scale(.96)"},{opacity:1,transform:"none"}],{duration:450,easing:"cubic-bezier(.16,1,.3,1)"});o.anim=$(".tbar i",li).animate([{transform:"scaleX(1)"},{transform:"scaleX(0)"}],{duration:5000,fill:"forwards"})}
 $(".tclose",li).addEventListener("click",function(){kill(o)});arm(o);
 if(TQ.length>4)kill(TQ[0]);layout(tl.matches(":hover,:focus-within"))}
if(tl){function pause(){TQ.forEach(function(o){clearTimeout(o.t);o.left=Math.max(800,o.left-(performance.now()-o.start));o.anim&&o.anim.pause()});layout(true)}
 function resume(){if(tl.matches(":hover,:focus-within"))return;TQ.forEach(arm);layout(false)}
 tl.addEventListener("pointerenter",pause);tl.addEventListener("pointerleave",resume);tl.addEventListener("focusin",pause);tl.addEventListener("focusout",function(){setTimeout(resume,0)});
 var TM={saved:["Draft saved","Kept on this device, version 3."],sent:["Proof sent","The link opens without a login."]};
 $$("[data-toast]").forEach(function(b){b.addEventListener("click",function(){var t=TM[b.dataset.toast];toast(t[1],t[0])})});
 if("IntersectionObserver"in window){var tio=new IntersectionObserver(function(es){if(es[0].isIntersecting){tio.disconnect();setTimeout(function(){toast("Kept on this device, version 2.","Draft saved")},400)}},{threshold:.7});tio.observe(tl)}}

/* 15 skeleton */
$$(".sk-btn").forEach(function(b){var sk=b.parentNode.querySelector(".sk");
 b.addEventListener("click",function(){if(sk.getAttribute("aria-busy")==="true")return;sk.setAttribute("aria-busy","true");b.disabled=true;setTimeout(function(){sk.setAttribute("aria-busy","false");b.disabled=false},RM?400:1600)})});

/* 16 theme */
$$(".th-sw").forEach(function(sw){var th=sw.closest(".th");
 sw.addEventListener("click",function(){var r=th.getBoundingClientRect(),s=sw.getBoundingClientRect();th.style.setProperty("--ox",(s.left-r.left+s.width/2)+"px");th.style.setProperty("--oy",(s.top-r.top+s.height/2)+"px");
  var ink=th.dataset.theme!=="ink";th.dataset.theme=ink?"ink":"paper";sw.setAttribute("aria-checked",ink)})});

/* 13 command palette */
var pal=$("#pal"),q=$("#palQ"),pl=$("#palL"),pn=$(".pal-n"),lastFocus=null,sel=0,res=[];
var DATA=cards.map(function(c){return{id:c.id,n:$(".card-n",c).textContent,t:$("h3",c).textContent,c:$(".card-cat",c).textContent}});
function score(str,qq){if(!qq)return{s:1,m:[]};var s=0,j=0,run=0,m=[],L=str.toLowerCase();for(var i=0;i<L.length&&j<qq.length;i++){if(L[i]===qq[j]){m.push(i);run++;s+=1+run*2+(i===0||L[i-1]===" "?3:0);j++}else run=0}return j===qq.length?{s:s-L.length*.05,m:m}:null}
function hl(t,m){var o="";for(var i=0;i<t.length;i++){var ch=t[i].replace(/[&<>]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;"}[c]});o+=m.indexOf(i)>=0?"<b>"+ch+"</b>":ch}return o}
function render(){var qq=q.value.trim().toLowerCase().replace(/\s+/g," ");res=[];DATA.forEach(function(d){var r=score(d.t,qq);if(r)res.push({d:d,s:r.s,m:r.m})});if(qq)res.sort(function(a,b){return b.s-a.s});sel=0;
 pl.innerHTML=res.length?res.map(function(r,i){return '<li role="option" id="po-'+i+'" aria-selected="'+(i===0)+'" data-i="'+i+'"><span class="pn">'+r.d.n+'</span><span class="pt">'+hl(r.d.t,r.m)+'</span><span class="pc">'+r.d.c+'</span></li>'}).join(""):'<li class="empty" role="option" aria-disabled="true" aria-selected="false">Nothing matches. Try “tog” or “cmd”.</li>';
 q.setAttribute("aria-activedescendant",res.length?"po-0":"");pn.textContent=res.length+" of 16"}
function mark(i){if(!res.length)return;sel=(i+res.length)%res.length;$$("li",pl).forEach(function(li,k){li.setAttribute("aria-selected",k===sel)});q.setAttribute("aria-activedescendant","po-"+sel);var el=$("#po-"+sel);el&&el.scrollIntoView({block:"nearest"})}
function openP(){if(!pal.hidden)return;lastFocus=document.activeElement;pal.hidden=false;document.documentElement.style.overflow="hidden";q.value="";render();setTimeout(function(){q.focus()},10)}
function closeP(go){pal.hidden=true;document.documentElement.style.overflow="";if(go){var c=$("#"+go.id);
  var f=$$(".f")[0];if(c.classList.contains("hide")&&f)f.click();c.scrollIntoView({behavior:RM?"auto":"smooth",block:"center"});c.classList.remove("flash");void c.offsetWidth;c.classList.add("flash");
  var t=c.querySelector("button,input,[tabindex='0'],a");setTimeout(function(){(t||c).focus({preventScroll:true})},RM?0:500)}else if(lastFocus)lastFocus.focus({preventScroll:true})}
$$("[data-open-palette]").forEach(function(b){b.addEventListener("click",openP)});
document.addEventListener("keydown",function(e){if((e.metaKey||e.ctrlKey)&&(e.key==="k"||e.key==="K")){e.preventDefault();pal.hidden?openP():closeP()}});
if(pal){q.addEventListener("input",render);
 q.addEventListener("keydown",function(e){if(e.key==="ArrowDown"){e.preventDefault();mark(sel+1)}else if(e.key==="ArrowUp"){e.preventDefault();mark(sel-1)}else if(e.key==="Enter"){e.preventDefault();if(res[sel])closeP(res[sel].d)}else if(e.key==="Escape"){e.preventDefault();closeP()}else if(e.key==="Tab"){e.preventDefault()}});
 pl.addEventListener("click",function(e){var li=e.target.closest("li[data-i]");if(li)closeP(res[+li.dataset.i].d)});
 pl.addEventListener("pointermove",function(e){var li=e.target.closest("li[data-i]");if(li&&+li.dataset.i!==sel)mark(+li.dataset.i)});
 $("[data-close]",pal).addEventListener("click",function(){closeP()})}
})();
