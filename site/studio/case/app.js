/* Kilnfold case study - desktop layer: Lenis, GSAP ScrollTrigger pin/parallax, rail, magnetic buttons. */
(function(){
  'use strict';
  var d=document, CS=window.CS||{}, reduced=CS.reduced, root=d.documentElement;
  var hasG=!!(window.gsap&&window.ScrollTrigger);

  /* rail: built from section data-title */
  var list=d.querySelector('.rail-list'), secs=[].slice.call(d.querySelectorAll('.cs[data-title]'));
  if(list){
    secs.forEach(function(s){var li=d.createElement('li'),a=d.createElement('a');a.href='#'+s.id;a.textContent=s.getAttribute('data-title');li.appendChild(a);list.appendChild(li);});
    var links=[].slice.call(list.querySelectorAll('a'));
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){links.forEach(function(a){a.classList.toggle('on',a.getAttribute('href')==='#'+e.target.id)});}})},{rootMargin:'-45% 0px -50% 0px'});
    secs.forEach(function(s){io.observe(s)});
  }
  var prog=d.querySelector('.rail-prog i'), mainEl=d.querySelector('.case-main');
  function progress(){ if(!prog||!mainEl)return; var r=mainEl.getBoundingClientRect(), h=r.height-innerHeight; var p=h>0?Math.min(1,Math.max(0,-r.top/h)):0; prog.style.transform='scaleX('+p.toFixed(4)+')'; }
  addEventListener('scroll',progress,{passive:true}); progress();

  if(reduced||!hasG){ root.classList.add('no-pin'); return; }

  var gsap=window.gsap, ST=window.ScrollTrigger; gsap.registerPlugin(ST);

  /* Lenis smooth scroll synced to ScrollTrigger */
  if(window.Lenis){
    var lenis=new window.Lenis({lerp:0.09,wheelMultiplier:1});
    lenis.on('scroll',ST.update);
    gsap.ticker.add(function(t){lenis.raf(t*1000)}); gsap.ticker.lagSmoothing(0);
    d.querySelectorAll('a[href^="#"]').forEach(function(a){a.addEventListener('click',function(e){var id=a.getAttribute('href');if(id.length<2)return;var el=d.querySelector(id);if(!el)return;e.preventDefault();lenis.scrollTo(el,{offset:-70,duration:1.4});});});
  }

  /* hero intro: letters rise, the bowl settles */
  var letters=d.querySelectorAll('.hero-logo .lg-type path'), bowl=d.querySelector('.hero-logo .lg-mark');
  gsap.from(letters,{yPercent:55,opacity:0,duration:1.3,ease:'expo.out',stagger:0.055,delay:0.1});
  if(bowl)gsap.from(bowl,{y:-120,rotation:-14,opacity:0,transformOrigin:'50% 100%',duration:1.5,ease:'bounce.out',delay:0.45});
  gsap.to('.hero-img img',{yPercent:-14,ease:'none',scrollTrigger:{trigger:'.hero-media',start:'top bottom',end:'bottom top',scrub:true}});

  /* identity logotype types itself in when reached */
  var idl=d.querySelectorAll('.id-light .lg-type path');
  if(idl.length)gsap.from(idl,{yPercent:40,opacity:0,stagger:0.05,duration:1,ease:'expo.out',scrollTrigger:{trigger:'.id-light',start:'top 75%'}});

  /* pinned horizontal moodboard */
  var mood=d.querySelector('.mood'), track=d.querySelector('.mood-track');
  if(mood&&track){
    var dist=function(){return Math.max(0,track.scrollWidth-mood.clientWidth)};
    gsap.to(track,{x:function(){return -dist()},ease:'none',scrollTrigger:{trigger:mood,start:'center 52%',end:function(){return '+='+dist()},pin:'.cs-mood',pinSpacing:true,scrub:0.6,invalidateOnRefresh:true,anticipatePin:1}});
    gsap.utils.toArray('.mood-img img').forEach(function(im){gsap.fromTo(im,{scale:1.12},{scale:1,ease:'none',scrollTrigger:{trigger:mood,start:'center 52%',end:function(){return '+='+dist()},scrub:true}})});
  }

  /* browser mockup: the designed page scrolls inside its frame */
  var fr=d.querySelector('.browser-view'), pg=d.querySelector('.browser-page');
  if(fr&&pg){
    var st=ST.create({trigger:fr,start:'top 70%',end:'bottom 20%',scrub:0.8,onUpdate:function(self){
      var s=+pg.dataset.s||0.5, max=Math.max(0,pg.scrollHeight*s-fr.clientHeight);
      pg.style.transform='translateY('+(-max*self.progress).toFixed(1)+'px) scale('+s+')';
    }});
    CS.onFrame=function(){st.refresh&&ST.refresh()};
  }
  gsap.utils.toArray('.phone').forEach(function(p,i){gsap.fromTo(p,{y:60+i*30},{y:i===1?64:0,ease:'none',scrollTrigger:{trigger:'.phones',start:'top bottom',end:'center center',scrub:true}})});

  /* firing scrubber autoplays once when it is mostly in view */
  var fire=d.querySelector('.fire');
  if(fire&&fire._fire)ST.create({trigger:fire,start:'top 55%',once:true,onEnter:function(){fire._fire()}});

  /* magnetic primary buttons */
  d.querySelectorAll('.mag').forEach(function(b){
    var qx=gsap.quickTo(b,'x',{duration:.5,ease:'power3.out'}), qy=gsap.quickTo(b,'y',{duration:.5,ease:'power3.out'});
    b.addEventListener('pointermove',function(e){var r=b.getBoundingClientRect();qx((e.clientX-r.left-r.width/2)*.25);qy((e.clientY-r.top-r.height/2)*.35);});
    b.addEventListener('pointerleave',function(){qx(0);qy(0)});
  });

  addEventListener('load',function(){ST.refresh()});
})();
