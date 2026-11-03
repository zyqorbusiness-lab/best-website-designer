const puppeteer = require('puppeteer-core')   // npm i puppeteer-core ; set CHROME_PATH to your Chrome;
(async()=>{
 const b = await puppeteer.launch({executablePath:process.env.CHROME_PATH, args:['--no-sandbox','--hide-scrollbars']});
 const p = await b.newPage(); await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});
 await p.goto('https://zyqor-stillroom.vercel.app/',{waitUntil:'networkidle2',timeout:60000}); await new Promise(r=>setTimeout(r,2500));
 for (let y=0;y<2600;y+=400){ await p.evaluate(v=>window.scrollTo(0,v),y); await new Promise(r=>setTimeout(r,500)); }
 await p.evaluate(()=>window.scrollTo(0,0)); await new Promise(r=>setTimeout(r,800));
 await p.screenshot({path:'assets/stillroom_tall.jpg',quality:90,type:'jpeg',clip:{x:0,y:0,width:390,height:2600},captureBeyondViewport:true});
 await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
