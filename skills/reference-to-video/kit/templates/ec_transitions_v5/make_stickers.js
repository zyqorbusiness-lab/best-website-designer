// make_stickers.js - renders stickers_v5.json (HTML snippets) to transparent PNGs. node make_stickers.js stickers_v5.json outDir ; env CHROME_PATH=<chromium/headless shell>; npm i playwright-core

const {chromium}=require('playwright-core'); const fs=require('fs');
const items=JSON.parse(fs.readFileSync(process.argv[2])); const out=process.argv[3];
(async()=>{ const b=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--no-sandbox']});
 const p=await b.newPage({deviceScaleFactor:1}); 
 for(const it of items){ await p.setContent('<html><body style="margin:0;background:transparent"><div id="o" style="display:inline-block;padding:'+(it.pad||0)+'px">'+it.html+'</div></body></html>'); await p.evaluate(()=>document.fonts.ready);
  const el=await p.$('#o'); await el.screenshot({path:out+'/'+it.name+'.png',omitBackground:true}); }
 await b.close(); })();
