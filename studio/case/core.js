/* Kilnfold case study - shared behaviour for both builds (no dependencies).
   Exposes window.CS for the desktop layer (app.js). */
(function(){
  'use strict';
  var d=document, root=d.documentElement;
  var reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CS=window.CS={reduced:reduced, frames:[], onFrame:null};

  /* reveals: IntersectionObserver, staggered by sibling order */
  var rv=[].slice.call(d.querySelectorAll('[data-rv]'));
  if(reduced||!('IntersectionObserver' in window)){rv.forEach(function(el){el.classList.add('in')});}
  else{
    var io=new IntersectionObserver(function(es){es.forEach(function(e){
      if(!e.isIntersecting)return; var el=e.target, sib=0, p=el.previousElementSibling;
      while(p&&sib<5){if(p.hasAttribute&&p.hasAttribute('data-rv'))sib++;p=p.previousElementSibling;}
      el.style.transitionDelay=(sib*0.07)+'s'; el.classList.add('in'); io.unobserve(el);
    })},{rootMargin:'0px 0px -8% 0px',threshold:0.08});
    rv.forEach(function(el){io.observe(el)});
  }

  /* top bar turns solid after the hero starts moving */
  var top=d.getElementById('top');
  function onScroll(){ if(top) top.classList.toggle('is-solid', (window.scrollY||0)>40); }
  addEventListener('scroll',onScroll,{passive:true}); onScroll();

  /* frames: scale the real-HTML mockups to their frame width */
  function fit(){
    CS.frames.length=0;
    d.querySelectorAll('.browser-view').forEach(function(v){
      var p=v.querySelector('.browser-page'); if(!p)return;
      var s=v.clientWidth/1280; p.style.setProperty('--s',s); p.dataset.s=s;
      CS.frames.push({view:v,page:p,s:s});
    });
    d.querySelectorAll('.phone-screen').forEach(function(sc){
      var k=sc.querySelector('.kf'); if(!k)return;
      var s=sc.clientWidth/375; k.style.setProperty('--s',s); k.style.minHeight=(sc.clientHeight/s)+'px';
    });
    if(CS.onFrame)CS.onFrame();
  }
  CS.fit=fit;
  if('ResizeObserver' in window){ var ro=new ResizeObserver(function(){fit()}); d.querySelectorAll('.browser-view,.phone-screen').forEach(function(el){ro.observe(el)}); }
  addEventListener('resize',fit); fit();

  /* copy hex chips */
  d.querySelectorAll('.copy').forEach(function(b){
    b.addEventListener('click',function(){
      var v=b.getAttribute('data-copy'); var done=function(){b.classList.add('is-done');setTimeout(function(){b.classList.remove('is-done')},1400)};
      try{ if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(v).then(done,done);} else {done();} }catch(e){done();}
    });
  });

  /* stock counter demo */
  var buy=d.querySelector('[data-buy]'), cn=d.querySelector('.cnt-n'), cbar=d.querySelector('.b-count .bar i');
  if(buy&&cn){
    var left=12;
    buy.addEventListener('click',function(){
      left=left<=0?12:left-1;
      cn.textContent=left===0?'0':String(left);
      if(cbar)cbar.style.setProperty('--p',(left/40*2.33).toFixed(3));
      buy.textContent=left===0?'Sold out. Reset':'Simulate a sale';
      if(!reduced&&cn.animate)cn.animate([{transform:'translateY(-10px)',opacity:.2},{transform:'none',opacity:1}],{duration:420,easing:'cubic-bezier(.22,1,.36,1)'});
    });
  }

  /* waitlist field */
  d.querySelectorAll('.wl').forEach(function(f){
    var inp=f.querySelector('input'), msg=f.querySelector('.wl-msg');
    f.addEventListener('submit',function(e){
      e.preventDefault();
      var ok=/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(inp.value);
      msg.textContent=ok?'Held. You are on the list for Firing 08 (demo, nothing is sent).':'That email looks incomplete.';
    });
  });

  /* firing scrubber: the signature interaction */
  d.querySelectorAll('.fire').forEach(function(box){
    var r=box.querySelector('.fire-range'), t=box.querySelector('.fire-t'), nm=box.querySelector('.fire-stage-name'),
        f1=box.querySelector('.f1'), f2=box.querySelector('.f2'), gl=box.querySelector('.fire-glow'), play=box.querySelector('.fire-play');
    function clamp(x){return x<0?0:x>1?1:x}
    function set(v){
      v=+v; var p1=clamp((v-420)/(950-420)), p2=clamp((v-1010)/(1280-1010));
      f1.style.clipPath='inset(0 0 0 '+((1-p1)*100).toFixed(2)+'%)';
      f2.style.clipPath='inset(0 0 0 '+((1-p2)*100).toFixed(2)+'%)';
      gl.style.opacity=(Math.sin(clamp(v/1280)*Math.PI)*0.85).toFixed(3);
      t.textContent=Math.round(v);
      var name=v<950?(v<300?'Greenware':'Drying out'):(v<1250?'Bisque':'Glaze, cone 10');
      nm.textContent=name;
      r.style.setProperty('--v',((v-20)/(1260)*100).toFixed(2)+'%');
      r.setAttribute('aria-valuetext',Math.round(v)+' degrees, '+name);
    }
    r.addEventListener('input',function(){set(r.value)});
    set(r.value);
    var raf=0;
    function fire(){
      cancelAnimationFrame(raf);
      if(reduced){r.value=1280;set(1280);return;}
      var from=+r.value>=1270?20:+r.value, t0=performance.now(), dur=4200*(1280-from)/1260+600;
      (function step(now){
        var k=clamp((now-t0)/dur), e=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2, v=from+(1280-from)*e;
        r.value=v; set(v); if(k<1)raf=requestAnimationFrame(step);
      })(t0);
    }
    if(play)play.addEventListener('click',fire);
    box._fire=fire;
  });
})();
