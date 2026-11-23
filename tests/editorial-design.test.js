import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderHome } from '../assets/ui/home.js';
import { SAMPLE_REPORT } from '../assets/ui/sample-report.js';

const home = renderHome({storageAvailable:true});
test('assessment-first homepage retains diagnosis and result navigation',()=>{
  assert.match(home,/id="page-heading"/);
  assert.match(home,/href="#start"/);
  assert.match(home,/href="#report"/);
  assert.match(home,/lab-hero-aside/);
  assert.match(home,/lab-result-card/);
});
test('RIASEC catalog contains all six basic categories, no avatar illustration',()=>{
  assert.equal((home.match(/<article class="lab-type">/g)||[]).length,6);
  for(const type of ['현실형','탐구형','예술형','사회형','진취형','관습형'])assert.ok(home.includes(type));
  assert.equal(home.includes('lab-avatar'),false);
  assert.equal(home.includes('lab-side-figure'),false);
  assert.equal(home.includes('lab-step-icon'),false);
});
test('sample result preview uses source RIASEC values rather than invented percentages',()=>{
  assert.ok(home.includes('ES'));
  assert.ok(home.includes('설득하는 조력가'));
  assert.ok(home.includes('사무·회계'));
  assert.ok(home.includes('언어이해력'));
  assert.ok(home.includes('사회적 인정'));
  assert.equal((home.match(/class="lab-riasec-row"/g)||[]).length,6);
  for(const [code,score] of SAMPLE_REPORT.riasec) {
    assert.ok(home.includes('<strong>'+score+'</strong>'),code);
  }
  assert.ok(home.includes('현재 화면 체험 3문항에서는 개인 결과가 산출되지 않습니다'));
});
test('copy and stylesheet preserve rich FAQ and readable responsive layout',()=>{
  assert.equal((home.match(/<details>/g)||[]).length,8);
  const mainCss=readFileSync(new URL('../assets/editorial.css',import.meta.url),'utf8');
  const promoCss=readFileSync(new URL('../assets/promo/editorial.css',import.meta.url),'utf8');
  const main=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const about=readFileSync(new URL('../about/index.html',import.meta.url),'utf8');
  assert.ok(main.includes('assets/editorial.css'));
  assert.ok(about.includes('promo/editorial.css'));
  assert.match(mainCss,/lab-type-grid/);
  assert.match(mainCss,/@media\(max-width:660px\)/);
  assert.match(promoCss,/@media\(max-width:760px\)/);
});
