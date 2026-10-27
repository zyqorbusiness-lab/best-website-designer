/* Zyqor v2 premium layer - DESKTOP. Needs gsap + ScrollTrigger + Lenis (local files). */
(function(){
  'use strict';
  var d=document, w=window, html=d.documentElement;
  var RM=w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE=w.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var G=w.gsap, ST=w.ScrollTrigger;
  if(!G){ return; }
  if(ST) G.registerPlugin(ST);
  html.classList.add('fx-on');
  var $=function(s,c){return (c||d).querySelector(s)}, $$=function(s,c){return [].slice.call((c||d).querySelectorAll(s))};
  var SVG=function(p,vb){return '<svg viewBox="'+(vb||'0 0 24 24')+'" aria-hidden="true" focusable="false">'+p+'</svg>'};
  var IC={ arrowR:'<path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    arrowL:'<path d="M19 12H5M11 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    up:'<path d="M12 19V5M6 11l6-6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    ext:'<path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
    copy:'<rect x="8" y="8" width="12" height="12" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" fill="none" stroke="currentColor" stroke-width="2"/>',
    check:'<path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
    drag:'<path d="M8 7l-5 5 5 5M16 7l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
    play:'<path d="M8 5.6v12.8a1 1 0 0 0 1.53.85l10.2-6.4a1 1 0 0 0 0-1.7L9.53 4.75A1 1 0 0 0 8 5.6z" fill="currentColor"/>',
    spark:'<path d="M12 2c.6 4.6 2.4 6.9 7 7.6-4.6.8-6.4 3-7 7.6-.6-4.6-2.4-6.8-7-7.6 4.6-.7 6.4-3 7-7.6z" fill="currentColor"/>' };
  w.__zsIC=IC;

  /* ---------- smooth scroll (Lenis) synced to ScrollTrigger ---------- */
  var lenis=null;
  if(!RM && w.Lenis){
    lenis=new w.Lenis({ duration:1.15, easing:function(t){return Math.min(1,1.001-Math.pow(2,-10*t))}, smoothWheel:true, wheelMultiplier:1, anchors:{ offset:-70, duration:1.4 }, autoRaf:false });
    w.__lenis=lenis;
    if(ST) lenis.on('scroll', ST.update);
    G.ticker.add(function(t){ lenis.raf(t*1000); });
    G.ticker.lagSmoothing(0);
  }
  function scrollToY(y,dur){ if(lenis) lenis.scrollTo(y,{duration:dur||1.6}); else w.scrollTo({top:y,behavior:RM?'auto':'smooth'}); }

  /* ---------- grain ---------- */
  var gr=d.createElement('div'); gr.className='grain'; gr.setAttribute('aria-hidden','true'); d.body.appendChild(gr);

  /* ---------- loader: counter + curtain handoff (app.js calls __zsLoaderOut) ---------- */
  var ld=$('#ld');
  if(ld){
    var cnt=d.createElement('div'); cnt.className='ld-count'; cnt.innerHTML='<span>0</span><small>%</small>'; ld.appendChild(cnt);
    var tag=d.createElement('div'); tag.className='ld-tag'; tag.textContent='Zyqor Studio / Portfolio 2026'; ld.appendChild(tag);
    var line=d.createElement('div'); line.className='ld-line'; ld.appendChild(line);
    var num=cnt.firstChild, shown=0, target=12;
    var bump=function(v){ target=Math.max(target,v); };
    if(d.readyState!=='loading') bump(30); else d.addEventListener('DOMContentLoaded',function(){bump(30)});
    if(d.fonts&&d.fonts.ready) d.fonts.ready.then(function(){bump(48)});
    var hi=new Image(); hi.onload=function(){bump(72)}; hi.src='assets/hero/d-studio.webp';
    if(w.__swPre&&w.__swPre.p) w.__swPre.p.then(function(){bump(92)},function(){});
    w.addEventListener('sw:firstready',function(){bump(100)});
    var tick=function(){ if(!ld.isConnected) { G.ticker.remove(tick); return; } shown+= (target-shown)*0.09; if(target-shown<0.4) shown=target; num.textContent=String(Math.round(shown)); line.style.setProperty('--p',(shown/100).toFixed(3)); };
    G.ticker.add(tick);
    w.__zsLoaderOut=function(el,done){
      target=100;
      var finish=function(){ num.textContent='100'; line.style.setProperty('--p','1');
        setTimeout(function(){ el.classList.add('is-out'); html.classList.add('hero-in'); revealHeroCopy(); setTimeout(done,1000); }, RM?0:260); };
      if(RM) return finish();
      var t0=Date.now(); (function wait(){ if(shown>96||Date.now()-t0>700) finish(); else setTimeout(wait,40); })();
    };
  }
  function revealHeroCopy(){ if(ST) setTimeout(function(){ ST.refresh(); },1100); }

  /* ---------- split-text headings ---------- */
  function split(el){
    if(el.__st) return; el.__st=1;
    var label=el.textContent.replace(/\s+/g,' ').trim(); el.setAttribute('aria-label',label);
    var i=0;
    (function walk(node){
      [].slice.call(node.childNodes).forEach(function(n){
        if(n.nodeType===3){
          var parts=n.textContent.split(/(\s+)/), frag=d.createDocumentFragment();
          parts.forEach(function(p){ if(!p) return; if(/^\s+$/.test(p)){ frag.appendChild(d.createTextNode(' ')); return; }
            var o=d.createElement('span'); o.className='st-w'; o.setAttribute('aria-hidden','true'); var inn=d.createElement('span'); inn.className='st-i'; inn.style.setProperty('--i',i++); inn.textContent=p; o.appendChild(inn); frag.appendChild(o); });
          node.replaceChild(frag,n);
        } else if(n.nodeType===1 && n.tagName!=='BR' && n.tagName!=='svg'){ walk(n); }
      });
    })(el);
    el.classList.add('st');
  }
  var heads=$$('.page h2, .info h3, .case h3, .price h2');
  heads.forEach(split);
  if('IntersectionObserver' in w){
    var sio=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('st-done'); sio.unobserve(e.target);} }); },{rootMargin:'0px 0px -8% 0px',threshold:0.15});
    heads.forEach(function(h){ sio.observe(h); });
  } else heads.forEach(function(h){h.classList.add('st-done')});

  /* ---------- kicker scramble ---------- */
  var CH='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/+*-';
  function scramble(el){ var fin=el.textContent, len=fin.length, f=0, tot=RM?0:22; if(!tot) return;
    var run=function(){ f++; var out=''; for(var k=0;k<len;k++){ var c=fin[k]; out+= (c===' '||k< (f/tot)*len) ? c : CH[(Math.random()*CH.length)|0]; } el.textContent=out; if(f<tot) requestAnimationFrame(run); else el.textContent=fin; }; run(); }
  if('IntersectionObserver' in w){
    var kio=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ scramble(e.target); kio.unobserve(e.target);} }); },{threshold:0.6});
    $$('.page .kicker').forEach(function(k){ k.setAttribute('aria-label',k.textContent); kio.observe(k); });
  }

  /* ---------- nav roll + magnetic ---------- */
  $$('.nav a, .ft a').forEach(function(a){
    if(a.querySelector('svg')&&!a.classList.contains('btn')){ }
    var tn=[].slice.call(a.childNodes).filter(function(n){return n.nodeType===3&&n.textContent.trim()});
    tn.forEach(function(n){ var t=n.textContent.trim(); var r=d.createElement('span'); r.className='roll'; r.innerHTML='<span data-t="'+t.replace(/"/g,'&quot;')+'">'+t.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</span>'; a.replaceChild(r,n); });
  });
  function magnet(el,str){
    if(!FINE||RM) return; str=str||0.35;
    var xTo=G.quickTo(el,'x',{duration:0.6,ease:'power3'}), yTo=G.quickTo(el,'y',{duration:0.6,ease:'power3'});
    el.addEventListener('pointermove',function(e){ var r=el.getBoundingClientRect(); xTo((e.clientX-(r.left+r.width/2))*str); yTo((e.clientY-(r.top+r.height/2))*str); });
    el.addEventListener('pointerleave',function(){ xTo(0); yTo(0); });
  }

  /* ---------- custom cursor ---------- */
  var cur=null, ring=null, rl=null;
  if(FINE){
    cur=d.createElement('div'); cur.className='cur'; ring=d.createElement('div'); ring.className='cur-r'; ring.innerHTML='<i></i><b></b>';
    rl=ring.querySelector('b'); d.body.appendChild(ring); d.body.appendChild(cur);
    var mx=-100,my=-100,started=false;
    var cx=G.quickSetter(cur,'x','px'), cy=G.quickSetter(cur,'y','px');
    var rx=G.quickTo(ring,'x',{duration:RM?0.01:0.45,ease:'power3'}), ry=G.quickTo(ring,'y',{duration:RM?0.01:0.45,ease:'power3'});
    w.addEventListener('pointermove',function(e){ if(e.pointerType!=='mouse') return; mx=e.clientX; my=e.clientY; cx(mx); cy(my); rx(mx); ry(my); if(!started){ started=true; html.classList.add('cur-on'); G.set(ring,{x:mx,y:my}); } },{passive:true});
    d.addEventListener('pointerleave',function(){ cur.classList.add('is-hide'); ring.classList.add('is-hide'); });
    d.addEventListener('pointerenter',function(){ cur.classList.remove('is-hide'); ring.classList.remove('is-hide'); });
    w.addEventListener('pointerdown',function(){ ring.classList.add('is-down'); });
    w.addEventListener('pointerup',function(){ ring.classList.remove('is-down'); });
    var curState='';
    function setCur(lbl,icon,gold){ var key=(lbl||'')+(icon||''); if(key===curState) return; curState=key;
      ring.classList.toggle('is-label',!!lbl); cur.classList.toggle('is-label',!!lbl); ring.classList.toggle('lbl-ivory',!!gold);
      if(lbl) rl.innerHTML=(icon?SVG(IC[icon]):'')+'<span>'+lbl+'</span>'; }
    d.addEventListener('pointerover',function(e){
      var dk=!!(e.target.closest&&e.target.closest('.dk'));
      cur.classList.toggle('on-dk',dk); ring.classList.toggle('on-dk',dk);
      var t=e.target.closest&&e.target.closest('[data-cursor], a, button, .tilt');
      ring.classList.remove('is-link');
      if(!t){ setCur(''); return; }
      var c=t.getAttribute('data-cursor');
      if(c){ var p=c.split('|'); setCur(p[0],p[1],p[2]==='gold'); return; }
      setCur(''); ring.classList.add('is-link');
    });
  }

  /* ---------- particles on click ---------- */
  var cv=d.createElement('canvas'); cv.className='fx-canvas'; cv.setAttribute('aria-hidden','true'); d.body.appendChild(cv);
  var cx2=cv.getContext('2d'), DPR=Math.min(w.devicePixelRatio||1,1.5), P=[], RINGS=[], running=false;
  function size(){ cv.width=innerWidth*DPR; cv.height=innerHeight*DPR; }
  size(); w.addEventListener('resize',size);
  var COLS=['#B5832F','#D9B56A','#17423C','#E9CF95','#B5832F'];
  function burst(x,y,n){
    if(RM){ RINGS.push({x:x,y:y,r:4,a:.6}); } else {
      RINGS.push({x:x,y:y,r:4,a:.9});
      for(var i=0;i<n;i++){ var a=Math.random()*Math.PI*2, s=2.2+Math.random()*4.2;
        P.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1.2,life:1,dec:.016+Math.random()*.018,sz:2+Math.random()*3.2,c:COLS[(Math.random()*COLS.length)|0],sh:(Math.random()*3)|0,rot:Math.random()*6,vr:(Math.random()-.5)*.3}); } }
    if(!running){ running=true; G.ticker.add(draw); }
  }
  function draw(){
    cx2.setTransform(DPR,0,0,DPR,0,0); cx2.clearRect(0,0,innerWidth,innerHeight);
    for(var j=RINGS.length-1;j>=0;j--){ var r=RINGS[j]; r.r+= (60-r.r)*.14; r.a-=.035; if(r.a<=0){RINGS.splice(j,1);continue;}
      cx2.beginPath(); cx2.arc(r.x,r.y,r.r,0,Math.PI*2); cx2.strokeStyle='rgba(181,131,47,'+r.a.toFixed(3)+')'; cx2.lineWidth=1.6; cx2.stroke(); }
    for(var i=P.length-1;i>=0;i--){ var p=P[i]; p.vy+=.12; p.vx*=.97; p.vy*=.97; p.x+=p.vx; p.y+=p.vy; p.rot+=p.vr; p.life-=p.dec; if(p.life<=0){P.splice(i,1);continue;}
      cx2.globalAlpha=Math.max(0,p.life); cx2.fillStyle=p.c; cx2.save(); cx2.translate(p.x,p.y); cx2.rotate(p.rot);
      if(p.sh===0){ cx2.beginPath(); cx2.arc(0,0,p.sz*.6,0,Math.PI*2); cx2.fill(); }
      else if(p.sh===1){ cx2.fillRect(-p.sz/2,-p.sz/2,p.sz,p.sz); }
      else { cx2.fillRect(-p.sz,-.7,p.sz*2,1.4); }
      cx2.restore(); }
    cx2.globalAlpha=1;
    if(!P.length&&!RINGS.length){ running=false; G.ticker.remove(draw); cx2.clearRect(0,0,innerWidth,innerHeight); }
  }
  w.addEventListener('pointerdown',function(e){ if(e.button!==0) return; var hit=e.target.closest&&e.target.closest('a,button,[data-cursor]'); burst(e.clientX,e.clientY,hit?18:10); },{passive:true});
  /* in-button ripple */
  d.addEventListener('pointerdown',function(e){ var b=e.target.closest&&e.target.closest('.btn,.sw-tour__btn,.way'); if(!b) return;
    var r=b.getBoundingClientRect(), s=Math.max(r.width,r.height)*2.2, sp=d.createElement('span'); sp.className='rip';
    sp.style.cssText='width:'+s+'px;height:'+s+'px;left:'+(e.clientX-r.left)+'px;top:'+(e.clientY-r.top)+'px';
    if(getComputedStyle(b).position==='static') b.style.position='relative'; b.style.overflow='hidden'; b.appendChild(sp); setTimeout(function(){sp.remove()},800); });

  /* ---------- magnetic targets ---------- */
  $$('.nav a, .btn, .way .ico, .logo, .sw-tour__btn').forEach(function(el){ magnet(el, el.classList.contains('ico')?0.5:0.3); });
  d.addEventListener('sw:none',function(){});

  /* ---------- marquee driven by scroll velocity ---------- */
  var mq=$('.mq');
  if(mq){
    var rows=$$('.mq-row',mq), vis=false, vel=0, xs=rows.map(function(){return 0}), skewTo=G.quickTo(rows,'skewX',{duration:.5,ease:'power3'});
    var mio=new IntersectionObserver(function(es){ vis=es[0].isIntersecting; }); mio.observe(mq);
    if(lenis) lenis.on('scroll',function(e){ vel=e.velocity||0; });
    G.ticker.add(function(){ if(!vis) return; var boost=RM?0:Math.min(8,Math.abs(vel)*0.25);
      rows.forEach(function(r,i){ var half=r.scrollWidth/2; var dir=i%2?1:-1; var sp=RM?0:(0.6+boost)*(vel<0?-1:1);
        xs[i]+=dir*sp; if(xs[i]<=-half) xs[i]+=half; if(xs[i]>0) xs[i]-=half; r.style.transform='translate3d('+xs[i].toFixed(1)+'px,0,0) skewX('+(RM?0:Math.max(-10,Math.min(10,-vel*0.35))).toFixed(2)+'deg)'; });
      vel*=0.92; });
  }

  /* ---------- gallery images: own lazy loader (native lazy loading fires early inside the pinned, clipped track) ---------- */
  var limgs=$$('img[data-lsrc]');
  function lsrc(im){ var s=im.getAttribute('data-lsrc'); if(s){ im.removeAttribute('data-lsrc'); im.src=s; } }
  /* ---------- horizontal pinned gallery for projects ---------- */
  var hs=$('.hs'), track=$('.hs-track');
  if(hs&&track&&ST&&!RM&&innerWidth>1000){
    hs.classList.add('is-h');
    var bar=$('.hs-p i',hs), nEl=$('.hs-n',hs), cards=$$('.proj',track), pinEl=$('.hs-pin',hs);
    var dist=function(){ return Math.max(0, track.scrollWidth - innerWidth); };
    var tw=G.to(track,{ x:function(){return -dist()}, ease:'none',
      scrollTrigger:{ trigger:pinEl, start:'top top', end:function(){return '+='+dist()}, pin:true, scrub:0.8, invalidateOnRefresh:true, anticipatePin:1,
        onUpdate:function(self){ if(bar) bar.style.transform='scaleX('+self.progress.toFixed(4)+')'; var k=Math.min(cards.length, 1+Math.floor(self.progress*cards.length*0.999)); if(nEl) nEl.textContent=('0'+k).slice(-2)+' / '+('0'+cards.length).slice(-2); } } });
    w.__zsHS=tw;
    /* each card's media parallax inside the moving track */
    cards.forEach(function(c){ var img=$('.shot',c); if(!img) return;
      G.fromTo(img,{xPercent:6},{xPercent:-4,ease:'none',scrollTrigger:{trigger:c,containerAnimation:tw,start:'left right',end:'right left',scrub:true}});
    });
    /* drag to scroll */
    var dragging=false, sx=0, sy0=0, moved=0;
    track.addEventListener('pointerdown',function(e){ if(e.pointerType!=='mouse'||e.button!==0) return; if(e.target.closest('.vctl')) return; dragging=true; moved=0; sx=e.clientX; sy0=w.scrollY; });
    w.addEventListener('pointermove',function(e){ if(!dragging) return; var dx=e.clientX-sx; moved=Math.max(moved,Math.abs(dx)); if(moved>6){ html.classList.add('is-dragging'); var y=sy0-dx*1.4; if(lenis) lenis.scrollTo(y,{immediate:true}); else w.scrollTo(0,y); } });
    w.addEventListener('pointerup',function(){ if(!dragging) return; dragging=false; setTimeout(function(){html.classList.remove('is-dragging')},0); });
    track.addEventListener('click',function(e){ if(moved>6){ e.preventDefault(); e.stopPropagation(); moved=0; } },true);
    track.addEventListener('dragstart',function(e){e.preventDefault()});
    $$('.hs-bar button',hs).forEach(function(b){ b.addEventListener('click',function(){ var st=tw.scrollTrigger, step=dist()/(cards.length-1); var dir=b.getAttribute('data-dir')==='1'?1:-1; var cur=w.scrollY-st.start; var k=Math.round(cur/step)+dir; k=Math.max(0,Math.min(cards.length-1,k)); scrollToY(st.start+k*step,1.2); }); });
  }

  if(hs&&hs.classList.contains('is-h')&&'IntersectionObserver' in w){
    var lio=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ lsrc(e.target); lio.unobserve(e.target); } }); },{rootMargin:'300px 700px 300px 700px'});
    limgs.forEach(function(im){ lio.observe(im); });
  } else limgs.forEach(lsrc);

  /* ---------- tilt + glare on project screens ---------- */
  if(FINE&&!RM){
    $$('.proj .shot').forEach(function(s){
      s.classList.add('tilt'); var g=d.createElement('span'); g.className='glare'; var br=$('.browser',s); (br||s).appendChild(g);
      var rX=G.quickTo(s,'rotationX',{duration:.8,ease:'power3'}), rY=G.quickTo(s,'rotationY',{duration:.8,ease:'power3'});
      G.set(s,{transformPerspective:1100});
      s.addEventListener('pointermove',function(e){ var r=s.getBoundingClientRect(), px=(e.clientX-r.left)/r.width, py=(e.clientY-r.top)/r.height; rY((px-.5)*9); rX((.5-py)*7); g.style.setProperty('--gx',(px*100)+'%'); g.style.setProperty('--gy',(py*100)+'%'); });
      s.addEventListener('pointerleave',function(){ rX(0); rY(0); });
      /* make sure the clip plays while hovering, even if the visitor paused auto play */
      s.addEventListener('pointerenter',function(){ $$('video[data-src]',s).forEach(function(v){ if(!v.getAttribute('src')) v.setAttribute('src',v.getAttribute('data-src')); if(v.paused){ var p=v.play(); if(p&&p.catch)p.catch(function(){}); v.__hov=1; } }); });
      s.addEventListener('pointerleave',function(){ var g2=s; if(g2._on===false) $$('video',s).forEach(function(v){ if(v.__hov){ v.pause(); v.__hov=0; } }); });
    });
  }

  /* ---------- scroll-driven parallax + section transitions ---------- */
  if(ST&&!RM){
    $$('.case-img img').forEach(function(im){ G.fromTo(im,{yPercent:-7,scale:1.16},{yPercent:7,scale:1.16,ease:'none',scrollTrigger:{trigger:im.parentNode,start:'top bottom',end:'bottom top',scrub:true}}); });
    var pt=$('.portrait img'); if(pt) G.fromTo(pt,{yPercent:-6,scale:1.12},{yPercent:6,scale:1.12,ease:'none',scrollTrigger:{trigger:pt.parentNode,start:'top bottom',end:'bottom top',scrub:true}});
    $$('.xpand').forEach(function(sec){ G.fromTo(sec,{clipPath:'inset(0% 4% 0% 4% round 56px)'},{clipPath:'inset(0% 0% 0% 0% round 0px)',ease:'none',scrollTrigger:{trigger:sec,start:'top 95%',end:'top 25%',scrub:true}}); });
    $$('.case').forEach(function(c,i){ G.fromTo(c,{y:80+i*40},{y:0,ease:'none',scrollTrigger:{trigger:c,start:'top bottom',end:'top 45%',scrub:true}}); });
    var bm=$$('.bigmark-in span'); if(bm.length) G.fromTo(bm,{yPercent:100},{yPercent:0,ease:'power2.out',stagger:.06,scrollTrigger:{trigger:'.bigmark',start:'top bottom',end:'bottom bottom',scrub:true}});
    $$('.steps .step').forEach(function(s,i){ G.fromTo(s,{y:60},{y:0,ease:'none',scrollTrigger:{trigger:s,start:'top bottom',end:'top 60%',scrub:true}}); });
  }
  /* curtain reveal on case images */
  /* (a clip-path at 100% hides the box from IntersectionObserver, so the parent is observed) */
  if('IntersectionObserver' in w){ var cio=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.__rv.classList.add('is-in'); cio.unobserve(e.target);} }); },{threshold:.15});
    $$('.case-img, .portrait').forEach(function(x){ x.classList.add('cur-reveal'); var p=x.parentElement; p.__rv=x; cio.observe(p); }); }

  /* ---------- price spotlight ---------- */
  var pr=$('.price'); if(pr&&FINE){ pr.addEventListener('pointermove',function(e){ var r=pr.getBoundingClientRect(); pr.style.setProperty('--mx',(e.clientX-r.left)+'px'); pr.style.setProperty('--my',(e.clientY-r.top)+'px'); pr.style.setProperty('--so','1'); }); pr.addEventListener('pointerleave',function(){ pr.style.setProperty('--so','.6'); }); }

  /* ---------- toast + copy email ---------- */
  var toast=d.createElement('div'); toast.className='toast'; toast.setAttribute('role','status'); toast.setAttribute('aria-live','polite'); d.body.appendChild(toast); var tT=0;
  function showToast(msg,linkHref,linkTxt){ toast.innerHTML='<span class="tk">'+SVG(IC.check)+'</span><span>'+msg+'</span>'+(linkHref?'<a href="'+linkHref.replace(/&/g,'&amp;')+'"'+(/^https?:/.test(linkHref)?' target="_blank" rel="noopener"':'')+'>'+linkTxt+'</a>':''); toast.classList.remove('is-on'); void toast.offsetWidth; toast.classList.add('is-on'); clearTimeout(tT); tT=setTimeout(function(){toast.classList.remove('is-on')},3400); }
  w.__zsToast=showToast;
  function copyText(t){ var ok=false; try{ var ta=d.createElement('textarea'); ta.value=t; ta.setAttribute('readonly',''); ta.style.cssText='position:fixed;top:0;left:0;opacity:0'; d.body.appendChild(ta); ta.select(); ta.setSelectionRange(0,t.length); ok=d.execCommand('copy'); ta.remove(); }catch(e){}
    if(ok) return Promise.resolve(); if(navigator.clipboard&&w.isSecureContext) return navigator.clipboard.writeText(t); return Promise.reject(new Error('no clipboard')); }
  $$('[data-copy]').forEach(function(el){ el.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); el.click(); } }); el.addEventListener('click',function(e){ e.preventDefault(); e.stopPropagation(); var t=el.getAttribute('data-copy'); copyText(t).then(function(){ showToast('Email copied: '+t,'https://mail.google.com/mail/?view=cm&fs=1&to='+encodeURIComponent(t)+'&su=Website%20project','Open Gmail'); },function(){ location.href='mailto:'+t; }); }); });

  /* ---------- WebGL aurora in the contact finale ---------- */
  var fin=$('.contact.fin');
  if(fin){
    var c=d.createElement('canvas'); c.className='aur'; c.setAttribute('aria-hidden','true');
    var gl=null; try{ gl=c.getContext('webgl',{antialias:false,alpha:false,powerPreference:'low-power',preserveDrawingBuffer:false}); }catch(e){}
    if(!gl){ var cs=d.createElement('div'); cs.className='aur-css'; fin.insertBefore(cs,fin.firstChild); }
    else {
      fin.insertBefore(c,fin.firstChild);
      var vs='attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
      var fs='precision mediump float;uniform vec2 R;uniform float T;uniform vec2 M;'+
        'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}'+
        'float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}'+
        'float fb(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n(p);p*=2.03;a*=.5;}return v;}'+
        'void main(){vec2 uv=gl_FragCoord.xy/R;vec2 p=uv*vec2(R.x/R.y,1.)*1.6;float t=T*.06;'+
        'vec2 q=vec2(fb(p+vec2(0.,t)),fb(p+vec2(5.2,1.3)-t));vec2 r=vec2(fb(p+3.*q+vec2(1.7,9.2)+t*1.3),fb(p+3.*q+vec2(8.3,2.8)-t));'+
        'float f=fb(p+2.5*r+(M-.5)*.6);'+
        'vec3 ink=vec3(.090,.259,.235);vec3 teal=vec3(.16,.40,.36);vec3 aqua=vec3(.85,.71,.42);vec3 gold=vec3(.71,.51,.18);'+
        'vec3 col=mix(ink,teal,smoothstep(.35,.85,f));col=mix(col,aqua,smoothstep(.62,.95,f*q.x)*.55);col=mix(col,gold,smoothstep(.55,.9,r.y)*.32);'+
        'col=mix(ink,col,.7);float v=smoothstep(1.2,.2,length(uv-vec2(.5,.45)));col=mix(ink*.9,col,.35+.65*v);'+
        'gl_FragColor=vec4(col,1.);}';
      var sh=function(t,s){ var o=gl.createShader(t); gl.shaderSource(o,s); gl.compileShader(o); return o; };
      var pg=gl.createProgram(); gl.attachShader(pg,sh(gl.VERTEX_SHADER,vs)); gl.attachShader(pg,sh(gl.FRAGMENT_SHADER,fs)); gl.linkProgram(pg);
      if(!gl.getProgramParameter(pg,gl.LINK_STATUS)){ c.remove(); var cs2=d.createElement('div'); cs2.className='aur-css'; fin.insertBefore(cs2,fin.firstChild); }
      else {
        gl.useProgram(pg); var buf=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buf); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
        var loc=gl.getAttribLocation(pg,'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
        var uR=gl.getUniformLocation(pg,'R'), uT=gl.getUniformLocation(pg,'T'), uM=gl.getUniformLocation(pg,'M');
        var SC=0.5, gm=[.5,.5], gmT=[.5,.5], on=false, t0=performance.now();
        var rs=function(){ var r=fin.getBoundingClientRect(); c.width=Math.max(2,Math.round(r.width*SC)); c.height=Math.max(2,Math.round(r.height*SC)); gl.viewport(0,0,c.width,c.height); gl.uniform2f(uR,c.width,c.height); };
        rs(); w.addEventListener('resize',rs);
        fin.addEventListener('pointermove',function(e){ var r=fin.getBoundingClientRect(); gmT=[(e.clientX-r.left)/r.width,1-(e.clientY-r.top)/r.height]; });
        var frame=function(){ gm[0]+=(gmT[0]-gm[0])*.04; gm[1]+=(gmT[1]-gm[1])*.04; gl.uniform1f(uT,RM?12.0:(performance.now()-t0)/1000); gl.uniform2f(uM,gm[0],gm[1]); gl.drawArrays(gl.TRIANGLES,0,3); };
        frame();
        if(!RM){ new IntersectionObserver(function(es){ var v=es[0].isIntersecting; if(v&&!on){ on=true; G.ticker.add(frame); } else if(!v&&on){ on=false; G.ticker.remove(frame); } }).observe(fin); }
      }
    }
  }

  /* ---------- back to top ---------- */
  var btt=d.createElement('button'); btt.type='button'; btt.className='btt'; btt.setAttribute('aria-label','Back to top'); btt.setAttribute('data-cursor','Top|up');
  btt.innerHTML='<svg class="ring" viewBox="0 0 60 60" aria-hidden="true" focusable="false"><circle cx="30" cy="30" r="27" stroke="rgba(243,237,225,.15)"/><circle class="rp" cx="30" cy="30" r="27" stroke="#D9B56A" stroke-dasharray="169.6" stroke-dashoffset="169.6" stroke-linecap="round"/></svg><span class="ar">'+SVG(IC.up)+SVG(IC.up)+'</span>';
  d.body.appendChild(btt); var rp=btt.querySelector('.rp'), bOn=false;
  magnet(btt,0.4);
  function onS(){ var y=w.scrollY||0, max=(d.documentElement.scrollHeight-innerHeight)||1, p=Math.min(1,y/max); rp.setAttribute('stroke-dashoffset',(169.6*(1-p)).toFixed(1)); var s=y>innerHeight*2.2; if(s!==bOn){ bOn=s; btt.classList.toggle('is-on',s);} }
  if(lenis) lenis.on('scroll',onS); else w.addEventListener('scroll',onS,{passive:true}); onS();
  function toTop(e){ if(e) e.preventDefault(); btt.classList.add('is-fly'); setTimeout(function(){btt.classList.remove('is-fly')},1500); scrollToY(0,2.2); }
  btt.addEventListener('click',toTop);
  $$('.ft a[href="#top"]').forEach(function(a){ a.addEventListener('click',toTop); });

  /* ---------- refresh once the hero engine has laid out ---------- */
  if(ST){ w.addEventListener('load',function(){ setTimeout(function(){ ST.refresh(); },300); }); w.addEventListener('sw:firstready',function(){ setTimeout(function(){ ST.refresh(); },300); }); }
})();

/* ===== audit pass (Oct 27): progress bar, header over dark, active nav, external links ===== */
(function(){ var d=document, w=window; if(w.__zsAudit) return; w.__zsAudit=1;
  var RM=w.matchMedia&&w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* external links always open in a new tab */
  d.addEventListener('click',function(e){ var a=e.target.closest&&e.target.closest('a[href^="http"]'); if(!a||a.target) return; try{ if(new URL(a.href).host!==location.host){ a.target='_blank'; a.rel='noopener'; } }catch(x){} },true);
  var hd=d.querySelector('.hd'), bar=null;
  if(!RM){ bar=d.createElement('div'); bar.className='sprog'; bar.setAttribute('aria-hidden','true'); d.body.appendChild(bar); }
  var navs=[].slice.call(d.querySelectorAll('.nav a[href^="#"]:not(.btn)'));
  var secs=navs.map(function(a){ return d.querySelector(a.getAttribute('href')); });
  var dks=[].slice.call(d.querySelectorAll('.dk'));
  var tick=false, lastAct=null, lastDk=null;
  function upd(){ tick=false; var y=w.scrollY||0, H=d.documentElement.scrollHeight-w.innerHeight;
    if(bar) bar.style.transform='scaleX('+(H>0?Math.min(1,y/H):0).toFixed(4)+')';
    var ft=d.querySelector('.bigmark')||d.querySelector('.ft'); if(ft){ var atEnd=ft.getBoundingClientRect().top<w.innerHeight*0.85; if(atEnd!==w.__zsEnd){ d.documentElement.classList.toggle('at-end',atEnd); w.__zsEnd=atEnd; } }
    if(hd){ var hy=hd.getBoundingClientRect().height/2, dk=false; for(var i=0;i<dks.length;i++){ var r=dks[i].getBoundingClientRect(); if(r.top<=hy&&r.bottom>=hy){ dk=true; break; } } if(dk!==lastDk){ hd.classList.toggle('on-dk',dk); lastDk=dk; } }
    var act=null, mid=w.innerHeight*0.4; for(var k=0;k<secs.length;k++){ var s=secs[k]; if(!s) continue; var rr=s.getBoundingClientRect(); if(rr.top<=mid&&rr.bottom>mid) act=navs[k]; }
    if(act!==lastAct){ if(lastAct) lastAct.classList.remove('is-act'); if(act){ act.classList.add('is-act'); act.setAttribute('aria-current','true'); } if(lastAct&&lastAct!==act) lastAct.removeAttribute('aria-current'); lastAct=act; }
  }
  function req(){ if(!tick){ tick=true; requestAnimationFrame(upd); } }
  w.addEventListener('scroll',req,{passive:true}); w.addEventListener('resize',req,{passive:true}); req(); setTimeout(req,1200);
})();
