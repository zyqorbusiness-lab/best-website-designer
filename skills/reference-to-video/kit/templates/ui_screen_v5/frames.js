// frames.js — Zyqor Motion Kit v5 "real UI screen recording" engine (face-lock v3, Nov 3 2026)
// Renders chat.html's render(state) once per video frame in headless Chromium at 3x (1242x2604 RGBA WebP: phone frame + screen),
// for EffectCraft to import as ONE image sequence (ImportOptions.sequence=true; layer.startTime = time of frame 1).
// Usage: CHROME_PATH=/path/to/chrome node frames.js states.json outDir rects.json
//   states.json = [{"f":0,"s":{...state...}}, ...]  (build it in Python: one state per frame from your VO word times)
//   rects.json  = element rects per frame (data-k attributes: plus, send, cin, chip, th_ref, aimg_*) -> aim cursor taps + overlays.
// Needs: npm i puppeteer-core. Photos the UI shows (p_*.png) sit next to chat.html.
const puppeteer=require('puppeteer-core'); const fs=require('fs'); const path=require('path');
(async()=>{ const [,,statesF,outDir,rectF]=process.argv; const states=JSON.parse(fs.readFileSync(statesF));
fs.mkdirSync(outDir,{recursive:true});
const b=await puppeteer.launch({executablePath:process.env.CHROME_PATH,args:['--no-sandbox','--font-render-hinting=none']});
const p=await b.newPage(); await p.setViewport({width:414,height:868,deviceScaleFactor:3});
await p.goto('file://'+path.join(__dirname,'chat.html'),{waitUntil:'networkidle0'}); await p.evaluate(()=>document.fonts.ready);
const rects={}; let last=null, lastFile=null;
for(const st of states){ const key=JSON.stringify(st.s); const fn=path.join(outDir,'s_'+String(st.f+1).padStart(4,'0')+'.webp');
  if(key===last){ fs.copyFileSync(lastFile,fn); rects[st.f]=rects[st.f-1]; continue; }   // identical state: copy, don't re-render
  rects[st.f]=await p.evaluate(s=>render(s),st.s);
  await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  await p.screenshot({path:fn,type:'webp',quality:92,omitBackground:true}); last=key; lastFile=fn; }
if(rectF) fs.writeFileSync(rectF,JSON.stringify(rects)); await b.close(); })().catch(e=>{console.error(e);process.exit(1)});
