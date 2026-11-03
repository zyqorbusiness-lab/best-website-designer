const puppeteer = require('puppeteer-core')   // npm i puppeteer-core ; set CHROME_PATH to your Chrome;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b = await puppeteer.launch({executablePath:process.env.CHROME_PATH, args:['--no-sandbox','--hide-scrollbars']});
 for (const [n,u] of [['stillroom','https://zyqor-stillroom.vercel.app/'],['ferneau','https://ferneau-concept.vercel.app/'],['fizzly','https://fizzly-soda.vercel.app/'],['anvaya','https://anvaya-saree-concept.vercel.app/']]){
   const p = await b.newPage(); await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});
   try{ await p.goto(u,{waitUntil:'networkidle2',timeout:45000}); await sleep(2500);
     await p.screenshot({path:`assets/m_${n}.jpg`,quality:88,type:'jpeg'});
     await p.evaluate(()=>window.scrollTo(0,900)); await sleep(1200); await p.screenshot({path:`assets/m_${n}_2.jpg`,quality:88,type:'jpeg'});
   }catch(e){console.log(n,String(e))}
   await p.close();
 }
 await b.close();
})();
