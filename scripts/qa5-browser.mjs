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
 // The original dot-eating C intro should run only on a first home visit.
 {
  const introContext=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'no-preference'});
  const introPage=await introContext.newPage();
  introPage.on('pageerror',error=>errors.push(error.message));
  await introPage.goto(base+'#home',{waitUntil:'domcontentloaded'});
  await introPage.locator('#brand-loader').waitFor({state:'visible'});
  assert.equal(await introPage.locator('#brand-loader img[src*="cfinder-loader.svg"]').count(),1);
  await introPage.locator('.cfinder-intro-skip').click();
  await introPage.locator('#brand-loader').waitFor({state:'detached'});
  await introPage.reload({waitUntil:'domcontentloaded'});
  assert.equal(await introPage.locator('#brand-loader').count(),0,'Intro must not replay on reload');
  await introPage.goto(base+'?intro=replay#home',{waitUntil:'domcontentloaded'});
  await introPage.locator('#brand-loader').waitFor({state:'visible'});
  await introPage.locator('.cfinder-intro-skip').click();
  await introContext.close();
 }
 const {context,page}=await openPage(1440);
 await page.goto(base+'#start',{waitUntil:'domcontentloaded'});
 await page.locator('[data-action="show-grade-choices"]').click();
 await page.locator('[data-action="select-grade"][data-grade="middle"]').click();
 await page.waitForURL(/#intro/);
 // QA6: practice interactions must never count as actual survey answers.
 await page.locator('[data-action="tutorial-choice"][data-value="4"]').click();
 assert.equal(await page.locator('[data-action="tutorial-choice"][aria-pressed="true"]').count(),1);
 assert.match(await page.locator('[data-tutorial-feedback]').innerText(),/선택했어요/);
 await page.locator('[data-action="begin"]').click();
 await page.waitForURL(/#test\/0/);
 // First page: incomplete answers cannot advance.
 await page.locator('[data-action="next"]').click();
 assert.equal(await page.locator('.cf-batch-question.is-missing').count(),5);
 assert.equal(await page.locator('[data-page-feedback] .cf-letter--feedback').count(),1);
 assert.match(await page.locator('[data-feedback-title]').innerText(),/답하지 않은 문항/);
 let pages=0;
 while (new URL(page.url()).hash.startsWith('#test/')) {
  pages++;
  assert.ok(pages<=11,'Unexpected extra assessment page');
  const rows=page.locator('[data-question-row]');
  const count=await rows.count();
  assert.ok(count>=2&&count<=5);
  if ([1,7,10].includes(pages)) assert.equal(await page.locator('.cf-domain-enter').count(),1,'Domain transition cue is missing');
  else assert.equal(await page.locator('.cf-domain-enter').count(),0,'Domain transition cue repeats on every page');
  for(let i=0;i<count;i++) await rows.nth(i).locator('input[type="radio"][value="4"]').check({force:true});
  if(pages===1){
    await page.reload({waitUntil:'domcontentloaded'});
    assert.equal(await page.locator('input[type="radio"][value="4"]:checked').count(),count,'Responses not restored');
  }
  if(pages===1) assert.match(await page.locator('[data-feedback-title]').innerText(),/다 답했어요/);
  await page.locator('[data-action="next"]').click();
  await page.waitForTimeout(30);
 }
 assert.equal(pages,11,'Middle-school questionnaire should have 11 pages');
 assert.match(page.url(),/#review/);
 await page.locator('.cf-review-refined').waitFor();
 assert.equal(await page.locator('.cf-review-domain').count(),3);
 assert.match(await page.locator('.cf-review-clean-progress').innerText(),/49/);
 assert.match(await page.locator('.cf-review-finish-bubble').innerText(),/나의 탐색 결과를 보러 가요/);
 assert.equal(await page.locator('.cf-review-finish-character .cf-letter--review').count(),1);
 assert.equal(await page.locator('.cf-review-domain summary .cf-review-chevron').count(),3);
 assert.equal(await page.locator('button[data-action="complete"]').innerText(),'나의 탐색 결과 보기');
 const reviewStorage=await page.evaluate(()=>Object.fromEntries(Array.from({length:sessionStorage.length},(_,i)=>{
   const key=sessionStorage.key(i); return [key,sessionStorage.getItem(key)];
 })));
 await page.screenshot({path:'qa-artifacts/review-desktop.png',fullPage:true});
 await page.locator('.cf-review-domain summary').first().click();
 const edit=page.locator('[data-action="edit"]').first();
 await edit.click();
 assert.match(page.url(),/#test\/0/);
 await page.locator('[data-question-row]').first().locator('input[type="radio"][value="5"]').check({force:true});
 await page.locator('[data-action="next"]').click();
 assert.match(page.url(),/#review/);
 await page.locator('[data-action="complete"]').click();
 assert.match(page.url(),/#result/);
 await page.locator('.cf-completion-celebration').waitFor({state:'visible'});
 assert.equal(await page.locator('.cf-completion-celebration').count(),1);
 assert.equal(await page.locator('.cf-reflection-card').count(),3,'Three self-reflection domains are expected');
 assert.equal(await page.locator('.cf-reflection-distribution').count(),3);
 assert.equal(await page.locator('.cf-reflection-next').count(),3);
 assert.match(await page.locator('.cf-reflection-disclaimer').innerText(),/응답 개수/);
 await page.screenshot({path:'qa-artifacts/complete-desktop.png',fullPage:true});
 await context.close();

 {
  const {context:mobileCtx,page:mobile}=await openPage(375,800);
  await mobileCtx.addInitScript(state=>{
    for(const [key,value] of Object.entries(state)) sessionStorage.setItem(key,value);
  },reviewStorage);
  await mobile.goto(base+'#review?grade=middle',{waitUntil:'domcontentloaded'});
  await mobile.locator('.cf-review-refined').waitFor();
  assert.equal(await mobile.locator('.cf-review-domain').count(),3);
  assert.equal(await mobile.locator('.cf-review-finish-bubble').count(),1);
  assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth-innerWidth),0,'Review panel must not overflow on mobile');
  await mobile.screenshot({path:'qa-artifacts/review-mobile.png',fullPage:true});
  await mobileCtx.close();
 }

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
 // About is a separate HTML page: its font, header and navigation must match the main service.
 for (const width of [375,768,1440]) {
  const {context:ctx,page:p}=await openPage(width,900);
  await p.goto(base+'about/',{waitUntil:'domcontentloaded'});
  await p.evaluate(()=>document.fonts.ready);
  const info=await p.evaluate(()=>({
   bodyFont:getComputedStyle(document.body).fontFamily,
   headingFont:getComputedStyle(document.querySelector('.hero h1')).fontFamily,
   navLabels:[...document.querySelectorAll('.promo-nav a')].map(a=>a.textContent.trim()),
   overflow:document.documentElement.scrollWidth-innerWidth,
   headerHeight:Math.round(document.querySelector('.promo-header').getBoundingClientRect().height)
  }));
  assert.match(info.bodyFont,/Pretendard/,'About typography diverged from main brand');
  assert.match(info.headingFont,/Pretendard/,'About heading font must match main brand');
  assert.deepEqual(info.navLabels,['홈','결과 예시','검사 소개','진단 시작하기']);
  assert.equal(info.overflow,0,'About page overflows viewport');
  console.log('ABOUT_VIEWPORT',width,JSON.stringify(info));
  await p.screenshot({path:`qa-artifacts/about-${width}.png`,fullPage:true});
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
 // Navigation from the About page must not trigger the blocking blue splash.
 const {context:navCtx,page:navigation}=await openPage(1440);
 await navigation.goto(base+'about/',{waitUntil:'domcontentloaded'});
 await navigation.locator('.brand').first().click();
 await navigation.waitForURL(url=>new URL(url).pathname==='/' && new URL(url).hash==='#home');
 await navigation.locator('#app').waitFor();
 assert.equal(await navigation.locator('#brand-loader').count(),0,'Normal return to home should not show blue intro');
 await navCtx.close();
 assert.deepEqual(errors,[],'Browser script errors');
 console.log('QA5_BROWSER_SMOKE_PASS');
}finally{
 await browser.close();
}
