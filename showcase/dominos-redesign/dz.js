(()=>{'use strict';
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const toastEl=$('#toast'); let tt;
function toast(msg){toastEl.textContent=msg;toastEl.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>toastEl.classList.remove('show'),2600);}
// reveal on scroll
const rvs=$$('.sec-head,.builder,.tracker,.card,.boxes'); rvs.forEach(e=>e.classList.add('rv'));
if('IntersectionObserver' in window && !RM){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{rootMargin:'0px 0px -8% 0px'});rvs.forEach(e=>io.observe(e));}
else rvs.forEach(e=>e.classList.add('in'));
// builder
const stage=$('#stage'), stageImg=$('#stageImg'), ring=$('#ring'), drops=$('#drops');
let size='Large', name='Pepperoni', busy=false;
function label(){ $('#stageSize').textContent=size; $('#stageName').textContent=name; }
$$('.seg button').forEach(b=>b.addEventListener('click',()=>{ $$('.seg button').forEach(x=>x.setAttribute('aria-checked',String(x===b))); size=b.dataset.size; label();
  if(!RM){stage.classList.remove('bump');void stage.offsetWidth;stage.classList.add('bump');} }));
function swapTo(btn){
  const src='img/'+btn.dataset.k+'.webp'; const cur=$('img:last-child',stageImg);
  if(cur.getAttribute('src')===src) return;
  const done=()=>{ const n=document.createElement('img'); n.src=src; n.alt=btn.dataset.alt; n.width=1200; n.height=1200;
    if(RM){ stageImg.replaceChildren(n); return; }
    n.className='incoming'; stageImg.appendChild(n);
    const go=()=>{ requestAnimationFrame(()=>{ n.classList.add('go'); ring.classList.remove('hit'); void ring.offsetWidth; ring.classList.add('hit'); stage.classList.remove('bump'); void stage.offsetWidth; stage.classList.add('bump'); });
      let fin=false; const end=()=>{ if(fin) return; fin=true; n.classList.remove('incoming','go'); [...stageImg.children].forEach(c=>{ if(c!==n) c.remove(); }); busy=false; };
      n.addEventListener('transitionend',end,{once:true}); setTimeout(end,4000); };
    if(n.complete) go(); else { n.onload=go; n.onerror=go; } };
  if(RM){ done(); return; }
  // fly the thumbnail into the pizza stage, then reveal from the centre
  busy=true; const th=$('img',btn), a=th.getBoundingClientRect(), s=stage.getBoundingClientRect();
  const f=document.createElement('div'); f.className='flyer'; f.innerHTML='<img alt="" src="'+src+'">'; document.body.appendChild(f);
  const S0=a.width, S1=s.width*.34; Object.assign(f.style,{left:a.left+'px',top:a.top+'px',width:S0+'px',height:S0+'px'});
  const dx=s.left+s.width/2-S1/2-a.left, dy=s.top+s.height/2-S1/2-a.top;
  const anim=f.animate([{transform:'translate(0,0) scale(1)'},{transform:`translate(${dx*.55}px,${dy*.55-120}px) scale(${(S1/S0)*.9})`,offset:.55},{transform:`translate(${dx}px,${dy}px) scale(${S1/S0})`}],{duration:620,easing:'cubic-bezier(.45,0,.2,1)'});
  anim.onfinish=()=>{ f.remove(); done(); };
}
$$('.sty').forEach(b=>b.addEventListener('click',()=>{ if(busy) return; $$('.sty').forEach(x=>x.setAttribute('aria-checked',String(x===b))); name=b.dataset.name; label(); $('#stageCredit').textContent=b.dataset.credit; swapTo(b); }));
// extras: labelled chips drop onto the pizza and stack
const SPOTS=[[22,24],[66,20],[16,62],[70,64],[44,80]];
function layoutDrops(){ $$('.drop',drops).forEach((d,i)=>{ const p=SPOTS[i%SPOTS.length]; d.style.left=p[0]+'%'; d.style.top=p[1]+'%'; }); }
$$('.top-btn').forEach(b=>b.addEventListener('click',()=>{ const on=b.getAttribute('aria-pressed')!=='true'; b.setAttribute('aria-pressed',String(on)); const t=b.dataset.t;
  if(on){ const d=document.createElement('span'); d.className='drop'; d.dataset.t=t; d.textContent=t; drops.appendChild(d); layoutDrops();
    if(!RM){ d.animate([{transform:'translate(-50%,-260%) rotate(-8deg)',opacity:0},{transform:'translate(-50%,-50%) rotate(3deg)',opacity:1,offset:.62},{transform:'translate(-50%,-62%) rotate(-1deg)',offset:.8},{transform:'translate(-50%,-50%) rotate(0deg)',opacity:1}],{duration:620,easing:'cubic-bezier(.3,.7,.3,1)'}); d.getAnimations()[0]?.finished.then(()=>{ring.classList.remove('hit');void ring.offsetWidth;ring.classList.add('hit');}); }
    else d.style.transform='translate(-50%,-50%)';
  } else { const d=$$('.drop',drops).find(x=>x.dataset.t===t); if(d){ if(RM) d.remove(); else d.animate([{opacity:1},{opacity:0,transform:'translate(-50%,-90%)'}],{duration:240}).onfinish=()=>{d.remove();layoutDrops();}; if(RM) layoutDrops(); } }
}));
$$('.drop',drops).forEach(d=>d.style.transform='translate(-50%,-50%)');
$('#addBtn').addEventListener('click',()=>{ const ex=$$('.drop',drops).map(d=>d.dataset.t); toast(`${size} ${name}${ex.length?' + '+ex.join(', '):''} — concept demo, nothing is ordered.`); });
// tracker
const steps=$$('#steps li'), fill=$('#barFill'), timg=$('#trackImg'), tcred=$('#trackCredit');
const IMG=[['img/prep.webp','A pizza chef pressing out fresh dough on a floured counter','Photo: Enricomariacosta.75 (CC BY-SA 4.0)'],['img/bake.webp','A cook sliding a pizza into a glowing wood-fired oven','Photo: Dale Cruse (CC BY 2.0)'],['img/box.webp','A sliced pepperoni pizza in an open corrugated box','Photo: Dale Cruse (CC BY 2.0)'],['img/ontheway.webp','A pepperoni and basil pizza in an open delivery box, ready to go','Photo: Dale Cruse (CC BY 2.0)']];
let tStep=0, timer;
function setStep(i){ tStep=i; steps.forEach((li,k)=>{ li.classList.toggle('on',k===i); li.classList.toggle('done',k<i); }); fill.style.width=(12+i*29.3)+'%';
  const im=IMG[i]; if(timg.getAttribute('src')!==im[0]){ if(RM){timg.src=im[0];} else { timg.style.opacity=0; setTimeout(()=>{timg.src=im[0];timg.onload=()=>timg.style.opacity=1;},300);} } timg.alt=im[1]; tcred.textContent=im[2]; }
function play(){ clearInterval(timer); setStep(0); if(RM){ setStep(3); return; } let i=0; timer=setInterval(()=>{ i++; setStep(i); if(i>=3) clearInterval(timer); },1300); }
$('#playTrack').addEventListener('click',play);
steps.forEach((li,k)=>{ li.addEventListener('click',()=>{clearInterval(timer);setStep(k);}); });
if('IntersectionObserver' in window){ const io2=new IntersectionObserver(es=>{ if(es[0].isIntersecting){ play(); io2.disconnect(); } },{threshold:.45}); io2.observe($('.tracker')); }
// phone dock: show after the hero, hide while the builder is on screen
const dock=$('#dock');
if(dock && 'IntersectionObserver' in window){ let pastHero=false, inBuild=false; const upd=()=>dock.classList.toggle('show',pastHero&&!inBuild);
  new IntersectionObserver(es=>{const e=es[0];pastHero=!e.isIntersecting&&e.boundingClientRect.top<0;upd();}).observe($('.hero-copy .cta-row'));
  new IntersectionObserver(es=>{inBuild=es[0].isIntersecting;upd();},{threshold:.15}).observe($('#build'));
}
})();
