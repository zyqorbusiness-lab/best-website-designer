/* Zyqor Studio portfolio - page behaviour: loader, header, lazy project clips. */
(function(){
  var d=document, w=window, root=d.documentElement;
  var reduce=w.matchMedia&&w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var saveData=!!(navigator.connection&&navigator.connection.saveData);
  /* loader: leaves as soon as the hero is ready (min 0.9 s so it never flashes), 4.5 s cap */
  var ld=d.getElementById('ld'), t0=Date.now(), gone=false;
  function hide(){ if(gone||!ld) return; gone=true; var wait=Math.max(0,(reduce?200:900)-(Date.now()-t0));
    setTimeout(function(){ var rm=function(){ if(ld&&ld.parentNode) ld.parentNode.removeChild(ld); };
      if(w.__zsLoaderOut){ w.__zsLoaderOut(ld,rm); return; }
      ld.classList.add('is-out'); setTimeout(rm,700); },wait); }
  if(ld){
    if(w.__swFirstReady) hide();
    w.addEventListener('sw:firstready',hide);
    w.addEventListener('load',function(){ setTimeout(hide, reduce?0:1600); });
    setTimeout(hide,4500);
    ld.addEventListener('click',hide);
  }
  /* header turns solid once the visitor leaves the first screen */
  var hd=d.querySelector('.hd'), last=null;
  var wld=d.getElementById('world'), intro=null;
  function onScroll(){ var y=w.scrollY||0, s=y>40; if(s!==last){ hd&&hd.classList.toggle('is-solid',s); last=s; }
    var ii=!!(wld&&y<wld.offsetHeight-w.innerHeight*0.5); if(ii!==intro){ root.classList.toggle('in-intro',ii); intro=ii; } }
  w.addEventListener('scroll',onScroll,{passive:true}); onScroll();
  /* project clips: nothing loads until a card is near the viewport; play only while visible */
  var vids=[].slice.call(d.querySelectorAll('video[data-src]'));
  var ICON={play:'<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 5.6v12.8a1 1 0 0 0 1.53.85l10.2-6.4a1 1 0 0 0 0-1.7L9.53 4.75A1 1 0 0 0 8 5.6z" fill="currentColor"/></svg>',
    pause:'<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="6.5" y="5" width="4" height="14" rx="1.3" fill="currentColor"/><rect x="13.5" y="5" width="4" height="14" rx="1.3" fill="currentColor"/></svg>'};
  var auto=!(reduce||saveData);
  function load(v){ if(!v.getAttribute('src')){ v.setAttribute('src',v.getAttribute('data-src')); } }
  function play(v){ load(v); var p=v.play(); if(p&&p.catch) p.catch(function(){}); }
  vids.forEach(function(v){
    v.muted=true; v.setAttribute('muted',''); v.playsInline=true;
    v.addEventListener('playing',function(){ v.classList.add('is-on'); });
  });
  var groups=[].slice.call(d.querySelectorAll('[data-clips]'));
  function setBtn(g){ var b=g.querySelector('.vctl'); if(!b) return; var on=g._on;
    b.innerHTML=(on?ICON.pause:ICON.play)+'<span>'+(on?'Pause':'Auto play')+'</span>';
    b.setAttribute('aria-label',(on?'Pause':'Play')+' the preview clip of '+g.getAttribute('data-name')); b.setAttribute('aria-pressed',on?'true':'false'); }
  function gv(g){ return [].slice.call(g.querySelectorAll('video[data-src]')); }
  groups.forEach(function(g){
    g._on=auto; g._vis=false; g._user=false; setBtn(g);
    var b=g.querySelector('.vctl');
    if(b) b.addEventListener('click',function(e){ e.preventDefault(); e.stopPropagation(); g._user=true; g._on=!g._on; setBtn(g);
      gv(g).forEach(function(v){ if(g._on) play(v); else v.pause(); }); });
  });
  if('IntersectionObserver' in w){
    var io=new IntersectionObserver(function(es){ es.forEach(function(en){ var g=en.target; g._vis=en.isIntersecting;
      gv(g).forEach(function(v){ if(g._vis&&g._on) play(v); else if(!g._vis) v.pause(); }); }); },{rootMargin:'120px 0px',threshold:0.25});
    groups.forEach(function(g){ io.observe(g); });
  }
  /* lazy-load reveal effects */
  var els=[].slice.call(d.querySelectorAll('[data-reveal]'));
  root.classList.add('zs-js');
  if(!('IntersectionObserver' in w)){ els.forEach(function(e){ e.classList.add('is-in'); }); }
  else { var ro=new IntersectionObserver(function(es){ es.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('is-in'); ro.unobserve(en.target); } }); },{rootMargin:'0px 0px -6% 0px',threshold:0.06});
    els.forEach(function(e){ ro.observe(e); }); }
  [].slice.call(d.querySelectorAll('img[loading="lazy"]')).forEach(function(img){
    function done(){ img.classList.add('is-loaded'); }
    if(img.complete&&img.naturalWidth) done(); else { img.addEventListener('load',done,{once:true}); img.addEventListener('error',done,{once:true}); }
  });
  if(!w.gsap){ [].slice.call(d.querySelectorAll('img[data-lsrc]')).forEach(function(im){ im.src=im.getAttribute('data-lsrc'); im.removeAttribute('data-lsrc'); }); }
  var yr=d.getElementById('yr'); if(yr) yr.textContent=String(new Date().getFullYear());
})();
