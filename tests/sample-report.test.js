import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SAMPLE_REPORT, renderSampleReport } from '../assets/ui/sample-report.js';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');

test('public sample exposes only approved summarized factors', () => {
  assert.equal(SAMPLE_REPORT.interest.length, 4);
  assert.equal(SAMPLE_REPORT.aptitude.length, 4);
  assert.equal(SAMPLE_REPORT.values.length, 4);
  assert.equal(SAMPLE_REPORT.recommended.length, 5);
  assert.equal(SAMPLE_REPORT.type, 'ES');
  assert.deepEqual(SAMPLE_REPORT.riasec.map(x=>x[1]), [78,125,118,127,138,101]);
  assert.equal(Object.hasOwn(SAMPLE_REPORT,'descriptions'), false);
});

test('sample report is explicitly separate from personal assessment results', () => {
  const html=renderSampleReport();
  assert.match(html, /가상 샘플 · 실제 검사 결과 아님/);
  assert.match(html, /개인 응답과 무관/);
  assert.match(html, /공식 점수·RIASEC 유형·추천 직업을 판정하지 않습니다/);
  assert.doesNotMatch(html, /만쏘|서울특별시/);
});

test('report uses aligned branded layout, character and focusable navigation', () => {
  const html=renderSampleReport();
  for (const id of ['interest','aptitude','values','type']) {
    assert.ok(html.includes(`data-sr-scroll="sample-${id}"`));
    assert.ok(html.includes(`id="sample-${id}"`));
  }
  assert.ok(html.includes('cf-report-pair'));
  assert.ok(html.includes('sr-report-notice'));
  assert.ok(html.includes('sr-overview'));
  assert.ok(html.includes('sr-profile-type'));
  assert.ok(html.includes('sr-tendency-heading'));
  assert.ok(html.includes('대표 4개 항목'));
  assert.doesNotMatch(html, /나머지 22개 항목 보기|나머지 7개 항목 보기/);
});

test('report and global header share responsive gutters', () => {
  const style=read('../assets/styles.css');
  const report=read('../assets/report.css');
  const views=read('../assets/ui/views.js');
  assert.match(style, /\.header-inner\s*\{\s*max-width:\s*1440px;/);
  assert.match(style, /\.shell\s*\{\s*max-width:\s*1440px;/);
  assert.match(report, /\.shell-report \.sr-page\s*\{[\s\S]*?max-width:\s*none;/);
  assert.match(views, /shell-\$\{route\.page\}/);
});

test('printed A4 report contains no source PDF and uses browser print', () => {
  const report=renderSampleReport();
  const printCSS=read('../assets/report-print.css');
  const app=read('../assets/app.js');
  const index=read('../index.html');
  assert.equal((report.match(/data-action="print-sample-report"/g)||[]).length,2);
  assert.doesNotMatch(report, /cfinder_sample_v1_261123|원본 PDF 다운로드/);
  assert.match(report, /sr-print-footnote/);
  assert.match(printCSS, /@page\s*\{\s*size:A4 portrait;/);
  assert.match(printCSS, /@media print\s*\{/);
  assert.match(printCSS, /transform:none!important/);
  assert.match(index, /assets\/report-print\.css/);
  assert.match(app, /window\.print\(\)/);
});

test('report motion respects reduced motion and intersection fallback', () => {
  const css=read('../assets/report-print.css');
  const app=read('../assets/app.js');
  assert.match(css, /prefers-reduced-motion:no-preference/);
  assert.match(app, /IntersectionObserver/);
  assert.match(app, /reportMotionObserver\?\.disconnect\(\)/);
  assert.match(app, /prefers-reduced-motion: reduce/);
});
