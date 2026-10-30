// Zyqor Components: shared demo helpers (copy buttons). Not needed to use a component.
document.querySelectorAll('.cx-code').forEach((box)=>{
  const pre=box.querySelector('pre'); if(!pre) return;
  const b=document.createElement('button'); b.type='button'; b.className='cx-copy'; b.textContent='Copy';
  b.addEventListener('click',async()=>{
    try{ await navigator.clipboard.writeText(pre.innerText); b.textContent='Copied'; }
    catch(e){ const r=document.createRange(); r.selectNodeContents(pre); const s=getSelection(); s.removeAllRanges(); s.addRange(r); b.textContent='Selected'; }
    setTimeout(()=>{b.textContent='Copy';},1400);
  });
  box.appendChild(b);
});
