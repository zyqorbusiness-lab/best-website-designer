/* Zyqor v2 premium layer - PHONE (no libraries, tap equivalents, lighter effects). */
(function(){
  'use strict';
  var d=document, w=window, html=d.documentElement;
  var RM=w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var IO='IntersectionObserver' in w;
  html.classList.add('fx-on');
  var $=function(s,c){return (c||d).querySelector(s)}, $$=function(s,c){return [].slice.call((c||d).querySelectorAll(s))};
  var SVG=function(p){return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">'+p+'</svg>'};
  var IC={ up:'<path d="M12 19V5M6 11l6-6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    check:'<path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>' };
  function once(els,cls,opt,cb){ if(!IO){ els.forEach(function(e){ e.classList.add(cls); cb&&cb(e); }); return; }
    var o=new IntersectionObserver(function(es){ es.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add(cls); cb&&cb(en.target); o.unobserve(en.target);} }); },opt||{threshold:.15}); els.forEach(function(e){o.observe(e)}); }

  /* grain (static on phones) */
  var gr=d.createElement('div'); gr.className='grain'; gr.setAttribute('aria-hidden','true'); d.body.appendChild(gr);

  /* loader counter + curtain handoff */
  var ld=$('#ld');
  if(ld){
    var cnt=d.createElement('div'); cnt.className='ld-count'; cnt.innerHTML='<span>0</span><small>%</small>'; ld.appendChild(cnt);
    var line=d.createElement('div'); line.className='ld-line'; ld.appendChild(line);
    var num=cnt.firstChild, shown=0, target=14;
    var bump=function(v){ target=Math.max(target,v); };
    if(d.readyState!=='loading') bump(32); else d.addEventListener('DOMContentLoaded',function(){bump(32)});
    if(d.fonts&&d.fonts.ready) d.fonts.ready.then(function(){bump(50)});
    var hi=new Image(); hi.onload=function(){bump(74)}; hi.src='../assets/hero/m-studio.webp';
    if(w.__swPre&&w.__swPre.p) w.__swPre.p.then(function(){bump(92)},function(){});
    w.addEventListener('sw:firstready',function(){bump(100)});
    (function tick(){ if(!ld.isConnected) return; shown+=(target-shown)*.1; if(target-shown<.4) shown=target; num.textContent=String(Math.round(shown)); line.style.setProperty('--p',(shown/100).toFixed(3)); requestAnimationFrame(tick); })();
    w.__zsLoaderOut=function(el,done){ target=100;
      var fin=function(){ num.textContent='100'; setTimeout(function(){ el.classList.add('is-out'); html.classList.add('hero-in'); setTimeout(done,1000); }, RM?0:220); };
      if(RM) return fin(); var t0=Date.now(); (function wt(){ if(shown>96||Date.now()-t0>600) fin(); else setTimeout(wt,40); })(); };
  }

  /* split-text headings */
  function split(el){ el.setAttribute('aria-label',el.textContent.replace(/\s+/g,' ').trim()); var i=0;
    (function walk(node){ [].slice.call(node.childNodes).forEach(function(n){
      if(n.nodeType===3){ var frag=d.createDocumentFragment(); n.textContent.split(/(\s+)/).forEach(function(p){ if(!p) return; if(/^\s+$/.test(p)){ frag.appendChild(d.createTextNode(' ')); return; }
          var o=d.createElement('span'); o.className='st-w'; o.setAttribute('aria-hidden','true'); var inn=d.createElement('span'); inn.className='st-i'; inn.style.setProperty('--i',i++); inn.textContent=p; o.appendChild(inn); frag.appendChild(o); }); node.replaceChild(frag,n); }
      else if(n.nodeType===1&&n.tagName!=='BR'&&n.tagName!=='svg') walk(n); }); })(el); el.classList.add('st'); }
  var heads=$$('.page h2, .info h3, .case h3'); heads.forEach(split);
  once(heads,'st-done',{rootMargin:'0px 0px -6% 0px',threshold:.2});

  /* kicker scramble */
  var CH='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/+-';
  function scramble(el){ if(RM) return; var fin=el.textContent, len=fin.length, f=0, tot=18; el.setAttribute('aria-label',fin);
    (function run(){ f++; var out=''; for(var k=0;k<len;k++){ var c=fin[k]; out+=(c===' '||k<(f/tot)*len)?c:CH[(Math.random()*CH.length)|0]; } el.textContent=out; if(f<tot) requestAnimationFrame(run); else el.textContent=fin; })(); }
  once($$('.page .kicker'),'k-in',{threshold:.6},scramble);

  /* tap ripple + small burst */
  var cv=d.createElement('canvas'); cv.className='fx-canvas'; cv.setAttribute('aria-hidden','true'); d.body.appendChild(cv);
  var cx=cv.getContext('2d'), DPR=Math.min(w.devicePixelRatio||1,2), P=[], RG=[], run=false;
  function size(){ cv.width=innerWidth*DPR; cv.height=innerHeight*DPR; } size(); w.addEventListener('resize',size);
  var COLS=['#B5832F','#D9B56A','#17423C','#E9CF95'];
  function burst(x,y,n){ RG.push({x:x,y:y,r:3,a:.85}); if(!RM) for(var i=0;i<n;i++){ var a=Math.random()*Math.PI*2, s=1.8+Math.random()*3.2; P.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1,l:1,dc:.022+Math.random()*.02,sz:2+Math.random()*2.6,c:COLS[(Math.random()*COLS.length)|0]}); }
    if(!run){ run=true; requestAnimationFrame(draw); } }
  function draw(){ cx.setTransform(DPR,0,0,DPR,0,0); cx.clearRect(0,0,innerWidth,innerHeight);
    for(var j=RG.length-1;j>=0;j--){ var r=RG[j]; r.r+=(46-r.r)*.15; r.a-=.04; if(r.a<=0){RG.splice(j,1);continue;} cx.beginPath(); cx.arc(r.x,r.y,r.r,0,6.283); cx.strokeStyle='rgba(181,131,47,'+r.a.toFixed(3)+')'; cx.lineWidth=1.6; cx.stroke(); }
    for(var i=P.length-1;i>=0;i--){ var p=P[i]; p.vy+=.12; p.x+=p.vx; p.y+=p.vy; p.l-=p.dc; if(p.l<=0){P.splice(i,1);continue;} cx.globalAlpha=p.l; cx.fillStyle=p.c; cx.beginPath(); cx.arc(p.x,p.y,p.sz*.6,0,6.283); cx.fill(); }
    cx.globalAlpha=1; if(P.length||RG.length) requestAnimationFrame(draw); else { run=false; cx.clearRect(0,0,innerWidth,innerHeight); } }
  d.addEventListener('pointerdown',function(e){ var hit=e.target.closest&&e.target.closest('a,button,[data-copy]'); if(hit) burst(e.clientX,e.clientY,10);
    var b=e.target.closest&&e.target.closest('.btn,.sw-tour__btn,.way'); if(!b) return; var r=b.getBoundingClientRect(), s=Math.max(r.width,r.height)*2.2, sp=d.createElement('span'); sp.className='rip';
    sp.style.cssText='width:'+s+'px;height:'+s+'px;left:'+(e.clientX-r.left)+'px;top:'+(e.clientY-r.top)+'px'; if(getComputedStyle(b).position==='static') b.style.position='relative'; b.style.overflow='hidden'; b.appendChild(sp); setTimeout(function(){sp.remove()},800); },{passive:true});

  /* swipe gallery for the six sites */
  var gal=$('.sw-gal');
  if(gal){
    var cards=$$('.mproj',gal), dots=$$('.gal-ui .dots i'), nEl=$('.gal-ui .gal-n');
    var cur=-1; function upd(){ var c=gal.scrollLeft+gal.clientWidth/2, best=0, bd=1e9; cards.forEach(function(k,i){ var m=k.offsetLeft+k.offsetWidth/2, dd=Math.abs(m-c); if(dd<bd){bd=dd;best=i;} });
      if(best!==cur){ cur=best; dots.forEach(function(x,i){ x.classList.toggle('on',i===best); }); if(nEl) nEl.textContent=('0'+(best+1)).slice(-2)+' / '+('0'+cards.length).slice(-2); } }
    var tk=0; gal.addEventListener('scroll',function(){ if(!tk){ tk=1; requestAnimationFrame(function(){tk=0;upd();}); } },{passive:true}); upd();
    $$('.gal-ui button').forEach(function(b){ b.addEventListener('click',function(){ var k=Math.max(0,Math.min(cards.length-1,cur+(+b.getAttribute('data-dir')))); gal.scrollTo({left:cards[k].offsetLeft-(gal.clientWidth-cards[k].offsetWidth)/2,behavior:RM?'auto':'smooth'}); }); });
  }

  /* marquee runs only while on screen */
  var mq=$('.mq'); if(mq&&IO){ new IntersectionObserver(function(es){ $$('.mq-row',mq).forEach(function(r){ r.style.animationPlayState=es[0].isIntersecting?'running':'paused'; }); }).observe(mq); }

  /* section expand + curtain reveals + wordmark */
  $$('.xpand').forEach(function(x){ x.classList.add('xp-m'); }); once($$('.xpand'),'is-in',{threshold:.05});
  /* a clip-path at 100% hides the box from IntersectionObserver, so the parent is observed */
  $$('.case-img, .portrait').forEach(function(x){ x.classList.add('cur-reveal'); var p=x.parentElement; p.__rv=x; once([p],'rv-seen',{threshold:.12},function(pp){ pp.__rv.classList.add('is-in'); }); });
  once($$('.bigmark'),'is-in',{threshold:.3});

  /* copy email + toast */
  var toast=d.createElement('div'); toast.className='toast'; toast.setAttribute('role','status'); toast.setAttribute('aria-live','polite'); d.body.appendChild(toast); var tT=0;
  function showToast(msg,href,txt){ toast.innerHTML='<span class="tk">'+SVG(IC.check)+'</span><span>'+msg+'</span>'+(href?'<a href="'+href+'">'+txt+'</a>':''); toast.classList.remove('is-on'); void toast.offsetWidth; toast.classList.add('is-on'); clearTimeout(tT); tT=setTimeout(function(){toast.classList.remove('is-on')},3400); }
  function copyText(t){ var ok=false; try{ var ta=d.createElement('textarea'); ta.value=t; ta.setAttribute('readonly',''); ta.style.cssText='position:fixed;top:0;left:0;opacity:0'; d.body.appendChild(ta); ta.select(); ta.setSelectionRange(0,t.length); ok=d.execCommand('copy'); ta.remove(); }catch(e){}
    if(ok) return Promise.resolve(); if(navigator.clipboard&&w.isSecureContext) return navigator.clipboard.writeText(t); return Promise.reject(new Error('no clipboard')); }
  $$('[data-copy]').forEach(function(el){ el.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); el.click(); } }); el.addEventListener('click',function(e){ e.preventDefault(); e.stopPropagation(); var t=el.getAttribute('data-copy'); if(navigator.vibrate) try{navigator.vibrate(12)}catch(x){}
    copyText(t).then(function(){ showToast('Email copied','mailto:'+t+'?subject=Website%20project','Open mail'); },function(){ location.href='mailto:'+t; }); }); });

  /* aurora (CSS, no WebGL on phones) */
  var fin=$('.contact.fin'); if(fin){ var a=d.createElement('div'); a.className='aur-css'; a.setAttribute('aria-hidden','true'); fin.insertBefore(a,fin.firstChild); }

  /* back to top */
  var btt=d.createElement('button'); btt.type='button'; btt.className='btt'; btt.setAttribute('aria-label','Back to top');
  btt.innerHTML='<svg class="ring" viewBox="0 0 60 60" aria-hidden="true" focusable="false"><circle cx="30" cy="30" r="27" stroke="rgba(243,237,225,.18)"/><circle class="rp" cx="30" cy="30" r="27" stroke="#D9B56A" stroke-dasharray="169.6" stroke-dashoffset="169.6" stroke-linecap="round"/></svg><span class="ar">'+SVG(IC.up)+SVG(IC.up)+'</span>';
  d.body.appendChild(btt); var rp=btt.querySelector('.rp'), on=false, tk2=0;
  function onS(){ tk2=0; var y=w.scrollY||0, max=(d.documentElement.scrollHeight-innerHeight)||1; rp.setAttribute('stroke-dashoffset',(169.6*(1-Math.min(1,y/max))).toFixed(1)); var s=y>innerHeight*2.2; if(s!==on){ on=s; btt.classList.toggle('is-on',s);} }
  w.addEventListener('scroll',function(){ if(!tk2){ tk2=1; requestAnimationFrame(onS); } },{passive:true}); onS();
  function toTop(e){ if(e) e.preventDefault(); btt.classList.add('is-fly'); setTimeout(function(){btt.classList.remove('is-fly')},1500); w.scrollTo({top:0,behavior:RM?'auto':'smooth'}); }
  btt.addEventListener('click',toTop); $$('.ft a[href="#top"]').forEach(function(a){ a.addEventListener('click',toTop); });
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
