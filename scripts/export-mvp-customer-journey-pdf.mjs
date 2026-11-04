import {chromium} from '@playwright/test';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1100}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto((process.env.MVP_CAPTURE_URL||'http://localhost:3000')+'/mvp-customer-journey.html');
 await page.evaluate(async()=>{document.querySelectorAll('details').forEach(el=>el.open=true);document.querySelectorAll('img').forEach(img=>img.loading='eager');await document.fonts.ready;await Promise.all([...document.images].filter(img=>img.getAttribute('src')).map(img=>img.decode()));});
 // Keep web navigation on the current preview, but make exported PDF links
 // portable instead of retaining the localhost used to generate this file.
 await page.evaluate(published=>{
  for(const anchor of document.querySelectorAll('a[href]')){
   const href=anchor.getAttribute('href');
   if(href.startsWith('#'))continue;
   const url=new URL(href,location.href);
   if(url.origin===location.origin)anchor.href=new URL(url.pathname+url.search+url.hash,published).href;
  }
 },process.env.MVP_PUBLISHED_URL||'https://zero-trust-git-mvp-t-dotnets-projects.vercel.app');
 await page.pdf({path:path.join(root,'public/mvp-customer-journey.pdf'),format:'A4',tagged:true,outline:true,printBackground:true,displayHeaderFooter:true,headerTemplate:'<div></div>',footerTemplate:'<div style="font-family:Arial,sans-serif;font-size:8px;width:100%;padding:0 12mm;color:#667085;display:flex;justify-content:space-between"><span>Zero Trust MVP · Customer journey · Synthetic-data prototype</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>',margin:{top:'12mm',right:'12mm',bottom:'12mm',left:'12mm'}});
 if(errors.length)throw Error(errors.join(';'));
 console.log('Exported public/mvp-customer-journey.pdf with all eight stages, supporting screenshots and journey context.');
}finally{await browser.close();}
