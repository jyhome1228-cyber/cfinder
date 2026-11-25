import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderHome } from '../assets/ui/home.js';
import { SAMPLE_REPORT } from '../assets/ui/sample-report.js';

const home = renderHome({storageAvailable:true});
test('assessment-first homepage retains diagnosis and deeper report navigation',()=>{
  assert.match(home,/id="page-heading"/);
  assert.match(home,/href="#start"/);
  assert.match(home,/href="#report"/);
  assert.ok(!home.includes('lab-hero-aside'));
  assert.ok(!home.includes('lab-sub-cta'));
  assert.ok(!home.includes('lab-meta-line'));
  const hero=home.slice(home.indexOf('<section class="lab-hero"'),home.indexOf('</section>')+10);
  assert.equal((hero.match(/href="#start"/g)||[]).length,1);
  assert.ok(!hero.includes('href="#report"'));
  assert.ok(hero.includes('나에게 맞는 진로를 찾아보세요.'));

  assert.match(home,/lab-result-card/);
});
test('RIASEC catalog contains all six basic categories, no avatar illustration',()=>{
  assert.equal((home.match(/<article class="lab-type cf-type-trigger">/g)||[]).length,6);
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
  assert.ok(home.includes('현재 자기탐색 응답으로는 공식 진로 유형이 산출되지 않습니다'));
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

test('compact usage flow has three accessible ordered stages without redundant cards',()=>{
 const html=renderHome({storageAvailable:true});
 assert.match(html,/<ol class="lab-process-flow">/);
 assert.equal((html.match(/class="lab-process-index"/g)||[]).length,3);
 assert.ok(html.includes('49개 요인 자기탐색은 비공식 설문'));
 assert.ok(!html.includes('<div class="lab-step-grid">'));
 const css=readFileSync(new URL('../assets/editorial.css',import.meta.url),'utf8');
 assert.match(css,/lab-process-flow/);
 assert.match(css,/@media\(max-width:660px\)/);
});

test('main hero typography matches the diagnosis welcome typography scale',()=>{
 const mainCss=readFileSync(new URL('../assets/neutral-theme.css',import.meta.url),'utf8');
 const welcomeCss=readFileSync(new URL('../assets/welcome-flow.css',import.meta.url),'utf8');
 assert.match(welcomeCss,/font-size:clamp\(1\.8rem,2\.65vw,2\.35rem\)/);
 assert.match(mainCss,/\.shell-home \.cf-editorial \.lab-hero h1\s*\{\s*font-size:\s*clamp\(1\.8rem, 2\.65vw, 2\.35rem\)/);
 assert.match(mainCss,/font-weight:\s*720;/);
 assert.match(mainCss,/@media\(max-width:660px\)/);
 assert.match(mainCss,/font-size:\s*clamp\(1\.6rem, 6vw, 1\.96rem\)/);
});
