/* example page behaviour · Zyqor Studio · MIT */
(function(){
 var d=document, rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
 // reveals: opacity + 20px rise as content enters
 var io='IntersectionObserver' in window?new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px'}):null;
 d.querySelectorAll('.rv').forEach(function(n,i){ if(io&&!rm){ n.style.transitionDelay=Math.min(i%5,4)*60+'ms'; io.observe(n);} else n.classList.add('in'); });
 // outputs for sliders
 function bind(id,out,fmt){var i=d.getElementById(id),o=d.getElementById(out); if(!i||!o)return; var f=function(){o.textContent=fmt(+i.value)}; i.addEventListener('input',f); f();}
 bind('sw','swv',function(v){return v.toFixed(1)+' m'});
 // nav: segmented control scrolls to sections, and follows the scroll
 var navs=d.querySelectorAll('[data-go]');
 navs.forEach(function(b){b.addEventListener('click',function(){var t=d.getElementById(b.dataset.go); if(t) t.scrollIntoView({behavior:rm?'auto':'smooth'});})});
 if(io&&navs.length){var secs=[].map.call(navs,function(b){return d.getElementById(b.dataset.go)}).filter(Boolean);
  var so=new IntersectionObserver(function(es){es.forEach(function(e){ if(!e.isIntersecting)return; navs.forEach(function(b){var on=b.dataset.go===e.target.id; var a=b.closest('[role=tablist]')?'aria-selected':'aria-pressed'; if((b.getAttribute(a)==='true')!==on){b.setAttribute(a,on?'true':'false');}});
    var g=navs[0].parentNode; g.dispatchEvent(new Event('lg:place'));})},{rootMargin:'-45% 0px -50% 0px'});
  secs.forEach(function(s){so.observe(s)});}
 // the draggable specimen
 var spec=d.getElementById('spec'), stage=d.getElementById('stage');
 if(spec&&stage){
  var drag=null;
  function clamp(x,y){var sb=stage.getBoundingClientRect(),w=spec.offsetWidth,h=spec.offsetHeight; return [Math.max(8,Math.min(sb.width-w-8,x)),Math.max(8,Math.min(sb.height-h-8,y))];}
  function move(x,y){var p=clamp(x,y); spec.style.left=p[0]+'px'; spec.style.top=p[1]+'px';}
  spec.addEventListener('pointerdown',function(e){var b=spec.getBoundingClientRect(); drag={dx:e.clientX-b.left,dy:e.clientY-b.top}; spec.setPointerCapture(e.pointerId); spec.style.setProperty('--lg-glow','1');});
  spec.addEventListener('pointermove',function(e){if(!drag)return; var sb=stage.getBoundingClientRect(); move(e.clientX-sb.left-drag.dx,e.clientY-sb.top-drag.dy);});
  var end=function(){drag=null; spec.style.removeProperty('--lg-glow');};
  spec.addEventListener('pointerup',end); spec.addEventListener('pointercancel',end);
  spec.addEventListener('keydown',function(e){var s=e.shiftKey?40:12,k=e.key,x=spec.offsetLeft,y=spec.offsetTop;
   if(k==='ArrowLeft')x-=s; else if(k==='ArrowRight')x+=s; else if(k==='ArrowUp')y-=s; else if(k==='ArrowDown')y+=s; else return; e.preventDefault(); move(x,y);});
  // gentle self-demo once, so the refraction is visible before anyone touches it (off for reduced motion)
  if(!rm&&'IntersectionObserver' in window){var once=new IntersectionObserver(function(es){if(!es[0].isIntersecting)return; once.disconnect();
    var x0=spec.offsetLeft,y0=spec.offsetTop,t0=performance.now(),dur=2600;
    (function step(t){if(drag)return; var k=Math.min(1,(t-t0)/dur), e=1-Math.pow(1-k,4); move(x0+Math.sin(e*Math.PI)*120,y0-Math.sin(e*Math.PI)*40); if(k<1)requestAnimationFrame(step);})(t0);},{threshold:.6}); once.observe(spec);}
 }
 // layer switches
 var LG=window.LiquidGlass, strength=1, chroma=true, refract=true;
 function reglaze(){ if(!spec||!LG)return; spec.dataset.lgStrength=String(Math.max(strength,0.001)); spec.dataset.lgChroma=chroma?'on':'off'; spec.dataset.lgRefract=refract&&strength>0?'on':'off';
  if(!(refract&&strength>0)) spec.style.removeProperty('backdrop-filter'); LG.refresh(); }
 d.querySelectorAll('[data-layer]').forEach(function(s){s.addEventListener('lg:change',function(e){var on=e.detail.checked,l=s.dataset.layer;
  if(l==='refract'){refract=on;reglaze();} else if(l==='chroma'){chroma=on;reglaze();} else spec.classList.toggle('no-'+l,!on);
  if(l==='frost') reglaze();});});
 var st=d.getElementById('st'), stv=d.getElementById('stv');
 if(st){st.addEventListener('input',function(){strength=+st.value; stv.textContent=strength.toFixed(1)+'×'; reglaze();});}
 var sup=d.getElementById('support');
 if(sup&&LG) sup.textContent=LG.supportsRefraction?'Your browser renders the refraction layer.':'This browser shows the frosted fallback: rim, glints, blur and depth. Refraction needs a Chromium browser on desktop or Android.';
})();
