// capture_dark.js — Zyqor kit v4: capture daymark states in a DARK theme (the site has no dark mode; we override its CSS variables
// + recolour pastel blocks' text) at 2160x1350 (1440x900 @1.5) so the UI pixel coords match the v3 timeline.
const puppeteer = require('puppeteer-core')   // npm i puppeteer-core ; set CHROME_PATH to your Chrome;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const DARK = `:root{--paper:#121019!important;--dm-paper:#121019!important;--ink:#f3efe6!important;--dm-ink:#f3efe6!important;--line:#f3efe6!important;--green:#f3efe6!important;
 --soft:#1d1a28!important;--sh:6px 6px 0 #6d8bff!important}
 html,body{background:#121019!important;color:#f3efe6!important} input,select,textarea{background:#1d1a28!important;color:#f3efe6!important;border-color:#f3efe6!important}`;
async function darken(p){
  await p.addStyleTag({content:DARK});
  await p.evaluate(()=>{
    const rgb=c=>{const m=c.match(/[\d.]+/g); if(!m) return null; const v=m.map(Number); if(v.length>3&&v[3]===0) return null; return v};
    for(const e of document.querySelectorAll('*')){            // document order: a child's rule overrides its parent's
      const v=rgb(getComputedStyle(e).backgroundColor); if(!v) continue;
      const lum=(v[0]+v[1]+v[2])/3;
      e.style.setProperty('color', lum>150?'#111':'#f3efe6','important');
      for(const k of e.querySelectorAll('*')) k.style.setProperty('color', lum>150?'#111':'#f3efe6','important');
    }
    for(const i of document.querySelectorAll('input,select')){ i.style.setProperty('color','#f3efe6','important'); i.style.setProperty('-webkit-text-fill-color','#f3efe6','important'); }
  });
  await p.addStyleTag({content:'input::placeholder{color:#8d88a3!important;-webkit-text-fill-color:#8d88a3!important}'});
}
(async()=>{
 const b = await puppeteer.launch({executablePath:process.env.CHROME_PATH, args:['--no-sandbox','--hide-scrollbars']});
 const p = await b.newPage();
 await p.setViewport({width:1440,height:900,deviceScaleFactor:1.5});
 await p.goto('https://zyqor-daymark.vercel.app/',{waitUntil:'networkidle2',timeout:60000}); await sleep(2000);
 const O='assets/shots/'; const shot=async n=>{await darken(p); await sleep(250); await p.screenshot({path:O+n+'.jpg',quality:90,type:'jpeg'})};
 await shot('s1_hero');
 await p.evaluate(()=>{const h=[...document.querySelectorAll('h2')].find(e=>/board/i.test(e.innerText)); window.scrollTo(0, h.getBoundingClientRect().top+scrollY-110)});
 await sleep(800); await shot('s2_board_empty');
 await p.evaluate(()=>document.querySelector('input').focus({preventScroll:true})); await sleep(200); await shot('s3_blank');
 const tasks=[['Ship the landing page','Monday'],['Call the print shop','Wednesday'],['Gym, 7 am','Tuesday'],['Plan Friday launch','Friday'],['Read 20 pages','Sunday']];
 let i=0;
 for(const [t,d] of tasks){
   await p.click('input',{clickCount:3}); await p.type('input',t,{delay:5}); await p.select('select',d);
   if(i===0) await shot('s3_typed');
   await p.evaluate(()=>[...document.querySelectorAll('button')].find(b=>/^add/i.test(b.innerText.trim())).click());
   await sleep(1600); i++;
   if(i===1) await shot('s4_one_task');
 }
 await sleep(500); await shot('s5_full_board');
 const cb = await p.$('input[type=checkbox]'); if(cb){ await cb.click(); await sleep(600); await shot('s6_done'); }
 await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
