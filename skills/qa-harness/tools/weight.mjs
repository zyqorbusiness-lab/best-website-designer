
import fs from 'node:fs'; import path from 'node:path';
// weight.mjs: what a page really downloads (first view and after a full scroll), by file type,
// plus LCP and CLS with the elements that shifted. Usage:
//   node tools/weight.mjs '{"runs":[{"key":"desk","url":"https://example.com/","w":1440,"h":900,"scroll":true},
//                                  {"key":"phone","url":"https://example.com/m/","w":390,"h":844,"mobile":true,"dpr":2,"scroll":true}]}'
// Options per run: idle (ms after load, default 7000), scroll (walk the page 700 px at a time), shot (jpeg path),
// reduced (prefers-reduced-motion), top (how many biggest files to list). Set CHROME=/path to use a given browser.
import { chromium } from 'playwright-core';
const EXE = process.env.CHROME || undefined;
const args=JSON.parse(process.argv[2]); const out=[];
const browser=await chromium.launch({...(EXE?{executablePath:EXE}:{}),args:['--enable-webgl','--ignore-gpu-blocklist','--use-angle=swiftshader']});
try{ for(const run of args.runs){
  const ctx=await browser.newContext({viewport:{width:run.w,height:run.h},deviceScaleFactor:run.dpr||1,isMobile:!!run.mobile,hasTouch:!!run.mobile,reducedMotion:run.reduced?'reduce':'no-preference',userAgent:run.mobile?'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1':undefined});
  const page=await ctx.newPage(); const cdp=await ctx.newCDPSession(page); await cdp.send('Network.enable'); await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
  const reqs=new Map(); let bytes=0; const errs=[]; const bad=[];
  cdp.on('Network.responseReceived',e=>{reqs.set(e.requestId,{url:e.response.url,type:e.type,status:e.response.status});});
  cdp.on('Network.loadingFinished',e=>{const r=reqs.get(e.requestId); if(r){r.bytes=e.encodedDataLength; bytes+=e.encodedDataLength;}});
  page.on('console',m=>{ if(m.type()==='error') errs.push(m.text().slice(0,200)); }); page.on('pageerror',e=>errs.push('pageerror: '+e.message.slice(0,200)));
  page.on('response',r=>{ if(r.status()>=400) bad.push(r.status()+' '+r.url()); });
  await page.addInitScript(()=>{ window.__cls=0; window.__lcp=0; window.__sh=[]; new PerformanceObserver(l=>{for(const e of l.getEntries()) if(!e.hadRecentInput){ window.__cls+=e.value; if(e.value>0.01) window.__sh.push({v:+e.value.toFixed(3),y:Math.round(scrollY),src:(e.sources||[]).slice(0,3).map(s=>s.node?(s.node.nodeName+'.'+String(s.node.className||'')).slice(0,50)+' '+Math.round(s.previousRect.y)+'->'+Math.round(s.currentRect.y)+' h'+Math.round(s.previousRect.height)+'->'+Math.round(s.currentRect.height):'?')}); }}).observe({type:'layout-shift',buffered:true}); new PerformanceObserver(l=>{const es=l.getEntries(); const e=es[es.length-1]; window.__lcp=e.startTime; window.__lcpEl=(e.element&&(e.element.tagName+'.'+e.element.className).slice(0,80))||e.url;}).observe({type:'largest-contentful-paint',buffered:true}); });
  const t0=Date.now(); await page.goto(run.url,{waitUntil:'load',timeout:90000}); const loadMs=Date.now()-t0;
  await page.waitForTimeout(run.idle||7000);
  const rec={key:run.key,url:page.url(),loadMs,initialBytes:bytes};
  if(run.shot) await page.screenshot({path:run.shot,type:'jpeg',quality:88});
  if(run.scroll){ const H=await page.evaluate(()=>document.body.scrollHeight); for(let y=0;y<H;y+=700){ await page.evaluate(v=>scrollTo(0,v),y); await page.waitForTimeout(250);} await page.waitForTimeout(2500); rec.scrolledBytes=bytes; }
  Object.assign(rec, await page.evaluate(()=>({lcp:Math.round(window.__lcp),lcpEl:window.__lcpEl,cls:+window.__cls.toFixed(4),sh:window.__sh.slice(0,25)})));
  const list=[...reqs.values()].filter(r=>r.bytes).sort((a,b)=>b.bytes-a.bytes);
  rec.top=list.slice(0,run.top||15).map(r=>[Math.round(r.bytes/1024),r.url.replace(/^https?:\/\/[^/]+/,'')]);
  const byExt={}; for(const r of list){ const m=(r.url.split('?')[0].match(/\.([a-z0-9]+)$/i)||[,'other'])[1]; byExt[m]=(byExt[m]||0)+r.bytes; } rec.byExt=Object.fromEntries(Object.entries(byExt).map(([k,v])=>[k,Math.round(v/1024)]).sort((a,b)=>b[1]-a[1]));
  rec.errs=errs; rec.bad=bad; out.push(rec); await ctx.close(); }
} finally { await browser.close(); }
console.log(JSON.stringify(out,null,1));
