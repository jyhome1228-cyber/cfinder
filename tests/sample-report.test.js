import test from 'node:test';
import assert from 'node:assert/strict';
import { SAMPLE_REPORT, renderSampleReport } from '../assets/ui/sample-report.js';

test('the high-school sample faithfully carries the supplied PDF factor counts',()=>{
  assert.equal(SAMPLE_REPORT.interest.length,27);
  assert.equal(SAMPLE_REPORT.aptitude.length,13);
  assert.equal(SAMPLE_REPORT.values.length,9);
  assert.deepEqual(SAMPLE_REPORT.interest.slice(0,5).map(x=>x[1]),[5,5,5,5,5]);
  assert.deepEqual(SAMPLE_REPORT.aptitude.slice(0,6).map(x=>x[1]),[5,5,5,5,5,5]);
  assert.deepEqual(SAMPLE_REPORT.values.slice(0,2),[['사회적 인정',12],['변화지향',12]]);
});
test('RIASEC numbers and recommendation list match sample PDF',()=>{
  assert.deepEqual(SAMPLE_REPORT.riasec.map(x=>x[1]),[78,125,118,127,138,101]);
  assert.equal(SAMPLE_REPORT.type,'ES');
  assert.equal(SAMPLE_REPORT.recommended.length,10);
  assert.ok(SAMPLE_REPORT.recommended.includes('여행기획자'));
});
test('sample report remains distinct from a scored personal result',()=>{
  const page=renderSampleReport();
  assert.match(page,/샘플 · 실제 검사 결과 아님/);
  assert.match(page,/실제 진단 결과가 아닙니다/);
  assert.ok(page.includes('data-sr-scroll="sample-interest"'));
  assert.ok(page.includes('data-sr-scroll="sample-type"'));
  assert.ok(!page.includes('만쏘'));
  assert.ok(!page.includes('서울특별시'));
});

test('report jump controls are real buttons with existing targets', () => {
  const html = renderSampleReport();
  for (const id of ['interest','aptitude','values','type']) {
    assert.ok(html.includes(`<button type="button" data-sr-scroll="sample-${id}"`));
    assert.ok(html.includes(`id="sample-${id}"`));
  }
  assert.ok(!html.includes('<a type="button"'));
});
test('the expanded factor lists show only remaining items', () => {
  const html = renderSampleReport();
  assert.ok(html.includes('나머지 22개 항목 보기'));
  assert.ok(html.includes('나머지 7개 항목 보기'));
});

test('sample report uses compact aligned analysis and explicit section state',()=>{
 const page=renderSampleReport();
 assert.ok(page.includes('class="sr-profile-type"'));
 assert.ok(page.includes('class="sr-top-factors"'));
 assert.ok(page.includes('class="sr-tendency-heading"'));
 assert.ok(page.includes('data-sr-scroll="sample-interest" aria-current="true"'));
 assert.ok(page.includes('하위 요인 27개'));
 assert.ok(page.includes('하위 요인 13개'));
 assert.ok(page.includes('하위 요인 9개'));
});

test('report shares header and footer gutters at desktop and mobile widths', async () => {
  const { readFileSync } = await import('node:fs');
  const styles = readFileSync(new URL('../assets/styles.css', import.meta.url), 'utf8');
  const report = readFileSync(new URL('../assets/report.css', import.meta.url), 'utf8');
  const views = readFileSync(new URL('../assets/ui/views.js', import.meta.url), 'utf8');
  assert.match(styles, /\.header-inner\s*\{\s*max-width:\s*1440px;\s*padding:\s*0 48px/);
  assert.match(styles, /\.shell\s*\{\s*max-width:\s*1440px;\s*padding:\s*56px 48px/);
  assert.match(styles, /\.footer-inner\s*\{\s*max-width:\s*1440px;\s*padding:\s*32px 48px/);
  assert.match(report, /\.shell-report \.sr-page\s*\{[\s\S]*?max-width:\s*none;/);
  assert.match(report, /\.shell-report \.sr-page\s*\{[\s\S]*?margin-inline:\s*0;/);
  assert.match(views, /shell-\$\{route\.page\}/);
  assert.match(styles, /@media \(max-width:620px\)/);
});

test('neutral report theme overrides dark navy hero and keeps sample warning visible', async()=>{
 const {readFileSync}=await import('node:fs');
 const css=readFileSync(new URL('../assets/neutral-theme.css',import.meta.url),'utf8');
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 const promo=readFileSync(new URL('../about/index.html',import.meta.url),'utf8');
 assert.match(css,/\.sr-hero\s*\{[\s\S]*?background:\s*#FFFFFF\s*!important/);
 assert.match(css,/\.sr-hero h2/);
 assert.match(css,/#1957EF/);
 assert.ok(html.includes('assets/neutral-theme.css'));
 assert.ok(promo.includes('promo/neutral-theme.css'));
 assert.ok(renderSampleReport().includes('샘플 · 실제 검사 결과 아님'));
});

test('report provides native A4 save and original downloadable PDF without scoring', async () => {
  const { readFileSync } = await import('node:fs');
  const report = renderSampleReport();
  const stylesheet = readFileSync(new URL('../assets/report-print.css', import.meta.url), 'utf8');
  const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const app = readFileSync(new URL('../assets/app.js', import.meta.url), 'utf8');
  const buttons = report.match(/data-action="print-sample-report"/g) || [];
  assert.equal(buttons.length, 2);
  assert.ok(report.includes('C-Finder_샘플결과지_v1_261123.pdf'));
  assert.ok(report.includes('assets/promo/cfinder_sample_v1_261123.pdf'));
  assert.ok(report.includes('sr-print-footnote'));
  assert.match(stylesheet, /@page\s*\{\s*size:A4 portrait;/);
  assert.match(stylesheet, /@media print\s*\{/);
  assert.match(stylesheet, /#sample-aptitude,#sample-values,#sample-type\s*\{\s*break-before:page/);
  assert.match(stylesheet, /transform:none!important/);
  assert.match(index, /assets\/report-print\.css/);
  assert.match(app, /window\.print\(\)/);
  assert.match(app, /window\.addEventListener\('beforeprint', expandPrintableReport\)/);
  assert.match(app, /window\.addEventListener\('afterprint', restorePrintableReport\)/);
});
test('report animation has reduced-motion and intersection fallback', async () => {
  const { readFileSync } = await import('node:fs');
  const css = readFileSync(new URL('../assets/report-print.css', import.meta.url), 'utf8');
  const app = readFileSync(new URL('../assets/app.js', import.meta.url), 'utf8');
  assert.match(css, /prefers-reduced-motion:no-preference/);
  assert.match(css, /sr-motion-ready/);
  assert.match(css, /sr-in-view/);
  assert.match(app, /IntersectionObserver/);
  assert.match(app, /reportMotionObserver\?\.disconnect\(\)/);
  assert.match(app, /prefers-reduced-motion: reduce/);
});
