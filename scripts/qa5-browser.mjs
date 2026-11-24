import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const base='http://127.0.0.1:8000/';
await mkdir('qa-artifacts',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
const errors=[];
async function openPage(width,height=900){
 const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
 const page=await context.newPage();
 page.on('pageerror',error=>errors.push(error.message));
 return {context,page};
}
try {
 const {context,page}=await openPage(1440);
 await page.goto(base+'#start',{waitUntil:'domcontentloaded'});
 await page.locator('[data-action="show-grade-choices"]').click();
 await page.locator('[data-action="select-grade"][data-grade="middle"]').click();
 await page.waitForURL(/#intro/);
 await page.locator('[data-action="begin"]').click();
 await page.waitForURL(/#test\/0/);
 // First page: incomplete answers cannot advance.
 await page.locator('[data-action="next"]').click();
 assert.equal(await page.locator('.cf-batch-question.is-missing').count(),5);
 let pages=0;
 while (new URL(page.url()).hash.startsWith('#test/')) {
  pages++;
  assert.ok(pages<=11,'Unexpected extra assessment page');
  const rows=page.locator('[data-question-row]');
  const count=await rows.count();
  assert.ok(count>=2&&count<=5);
  for(let i=0;i<count;i++) await rows.nth(i).locator('input[type="radio"][value="4"]').check({force:true});
  if(pages===1){
    await page.reload({waitUntil:'domcontentloaded'});
    assert.equal(await page.locator('input[type="radio"][value="4"]:checked').count(),count,'Responses not restored');
  }
  await page.locator('[data-action="next"]').click();
  await page.waitForTimeout(30);
 }
 assert.equal(pages,11,'Middle-school questionnaire should have 11 pages');
 assert.match(page.url(),/#review/);
 await page.locator('.cf-review-domain summary').first().click();
 const edit=page.locator('[data-action="edit"]').first();
 await edit.click();
 assert.match(page.url(),/#test\/0/);
 await page.locator('[data-question-row]').first().locator('input[type="radio"][value="5"]').check({force:true});
 await page.locator('[data-action="next"]').click();
 assert.match(page.url(),/#review/);
 await page.locator('[data-action="complete"]').click();
 assert.match(page.url(),/#result/);
 await page.screenshot({path:'qa-artifacts/complete-desktop.png',fullPage:true});
 await context.close();

 for(const width of [375,768,1440]){
  const {context:ctx,page:p}=await openPage(width,900);
  await p.goto(base+'#report',{waitUntil:'domcontentloaded'});
  await p.locator('.sr-page').waitFor();
  const info=await p.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,contentWidth:document.documentElement.scrollWidth}));
  console.log('VIEWPORT',width,JSON.stringify(info));
  await p.screenshot({path:`qa-artifacts/report-${width}.png`,fullPage:true});
  if(width===1440){
    const pdf=await p.pdf({format:'A4',printBackground:true});
    assert.ok(pdf.length>5000,'PDF generation returned too little content');
    await writeFile('qa-artifacts/cfinder-report.pdf',pdf);
    console.log('PDF_BYTES',pdf.length);
  }
  await ctx.close();
 }
 const {context:aboutCtx,page:about}=await openPage(375);
 await about.goto(base+'about/',{waitUntil:'domcontentloaded'});
 await about.locator('.menu-toggle').click();
 assert.equal(await about.locator('.menu-toggle').getAttribute('aria-expanded'),'true');
 await about.locator('a[href="#contact"]').first().click();
 await about.locator('#inquiry-form').waitFor();
 await about.locator('#inquiry-role').selectOption({label:'교사'});
 await about.locator('#inquiry-name').fill('테스트 사용자');
 await about.locator('#inquiry-phone').fill('01012345678');
 await about.locator('#inquiry-email').fill('example@example.com');
 await about.locator('#inquiry-consent').check();
 await about.locator('#inquiry-form button[type="submit"]').click();
 assert.equal(await about.locator('#inquiry-draft').isVisible(),true,'Inquiry mail draft not shown');
 assert.match(await about.locator('#draft-mailto').getAttribute('href'),/^mailto:/);
 await about.screenshot({path:'qa-artifacts/inquiry-mobile.png'});
 await aboutCtx.close();
 assert.deepEqual(errors,[],'Browser script errors');
 console.log('QA5_BROWSER_SMOKE_PASS');
}finally{
 await browser.close();
}
