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
  assert.match(page,/샘플 결과 · 실제 검사 결과 아님/);
  assert.match(page,/정식 결과 산출에는 별도의 승인된 문항/);
  assert.ok(page.includes('data-sr-scroll="sample-interest"'));
  assert.ok(page.includes('data-sr-scroll="sample-type"'));
  assert.ok(!page.includes('만쏘'));
  assert.ok(!page.includes('서울특별시'));
});
