// frames_pw.js - playwright-core port of frames.js (puppeteer-core is not installed on the Tab box). node frames_pw.js states.json outDir rects.json ; env CHROME_PATH=<chromium/headless shell>. Writes PNG (RGBA) frames s_0001.png...

const {chromium}=require('playwright-core'); const fs=require('fs'); const path=require('path');
(async()=>{ const [,,statesF,outDir,rectF]=process.argv; const states=JSON.parse(fs.readFileSync(statesF)); fs.mkdirSync(outDir,{recursive:true});
const b=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--no-sandbox','--font-render-hinting=none']});
const p=await b.newPage({viewport:{width:414,height:868},deviceScaleFactor:3});
await p.goto('file://'+path.join(__dirname,'chat.html'),{waitUntil:'networkidle'}); await p.evaluate(()=>document.fonts.ready);
const rects={}; let last=null,lastFile=null;
for(const st of states){ const key=JSON.stringify(st.s); const fn=path.join(outDir,'s_'+String(st.f+1).padStart(4,'0')+'.png');
 if(key===last){ fs.copyFileSync(lastFile,fn); rects[st.f]=rects[st.f-1]; continue; }
 rects[st.f]=await p.evaluate(s=>render(s),st.s);
 await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 await p.screenshot({path:fn,type:'png',omitBackground:true}); last=key; lastFile=fn; }
fs.writeFileSync(rectF,JSON.stringify(rects)); await b.close(); })().catch(e=>{console.error(e);process.exit(1)});
