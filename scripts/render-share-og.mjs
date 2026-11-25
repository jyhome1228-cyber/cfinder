import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
const browser=await chromium.launch({headless:true,channel:'chrome',args:['--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1,reducedMotion:'reduce'});
 page.on('pageerror',e=>{throw e;});
 await page.goto('http://127.0.0.1:8000/share-card/',{waitUntil:'networkidle'});
 await page.evaluate(async()=>{
  await document.fonts.ready;
  await Promise.all([...document.images].map(img=>img.decode()));
 });
 const body=page.locator('main.card');
 const rect=await body.boundingBox();
 if(!rect||Math.round(rect.width)!==1200||Math.round(rect.height)!==630)throw new Error('Social preview canvas must be 1200x630');
 await mkdir('assets/share',{recursive:true});
 await body.screenshot({path:'assets/share/cfinder-social-20261125.png',animations:'disabled'});
 console.log('SOCIAL_PREVIEW_RENDERED_1200x630');
}finally{await browser.close();}
