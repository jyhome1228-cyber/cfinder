import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ASSESSMENTS, DOMAINS, RESPONSE_OPTIONS } from '../assets/data/assessments.js';
import { createAttempt, answerQuestion, countAnswered, storageKey, isComplete } from '../assets/core/assessment.js';
import { renderHome } from '../assets/ui/home.js';

const grades=['middle','high','university'];
test('all nine draft questions have complete and separate grade/domain mapping',()=>{
 const ids=new Set();
 for(const grade of grades){
  const a=ASSESSMENTS[grade];
  assert.equal(a.grade,grade);
  assert.equal(a.mode,'demo');
  assert.equal(a.questions.length,3);
  assert.deepEqual(a.questions.map(q=>q.domain),['interest','aptitude','values']);
  for(const q of a.questions){
   assert.ok(DOMAINS[q.domain]);
   assert.ok(q.text.length >= 20 && q.text.length <= 85,q.id);
   assert.ok(!ids.has(q.id),q.id);
   assert.ok(!/[!?]{2,}/.test(q.text));
   ids.add(q.id);
  }
  assert.equal(a.options.length,5);
 }
 assert.equal(ids.size,9);
});
test('revised question bank version differs from earlier demo and prevents stale responses',()=>{
 const a=ASSESSMENTS.middle;
 assert.equal(a.version,'demo-2026-11-24-v2');
 const old={...a,version:'demo-1'};
 assert.notEqual(storageKey('public',a),storageKey('public',old));
});
test('all revised questions permit answer, review, and completion but no scores',()=>{
 for(const grade of grades){
  const a=ASSESSMENTS[grade];
  let attempt=createAttempt('public',a,'2026-11-24T00:00:00.000Z');
  for(const q of a.questions)attempt=answerQuestion(attempt,a,q.id,3);
  assert.equal(countAnswered(attempt,a),3);
  assert.ok(isComplete(attempt,a));
  assert.equal(Object.hasOwn(attempt,'scores'),false);
  assert.equal(Object.hasOwn(attempt,'careerType'),false);
 }
 assert.deepEqual(RESPONSE_OPTIONS.map(o=>o.value),[1,2,3,4,5]);
});
test('brand assets are reused in both service and promotion with an accessible home label',()=>{
 const home=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 const promo=readFileSync(new URL('../about/index.html',import.meta.url),'utf8');
 const views=readFileSync(new URL('../assets/ui/views.js',import.meta.url),'utf8');
 const brand=readFileSync(new URL('../assets/brand/cfinder-official-mark.svg',import.meta.url),'utf8');
 assert.ok(home.includes('./assets/brand/cfinder-official-mark.svg'));
 assert.ok(home.includes('./assets/brand/cfinder-loader.svg'));
 assert.ok(home.includes('brand-loader'));
 assert.ok(promo.includes('../assets/brand/cfinder-official-logo.svg'));
 assert.ok(views.includes('cfinder-official-logo.svg'));
 assert.match(brand,/viewBox="0 0 110 107\.05"/);
 assert.match(brand,/#214FF4/);
 assert.ok(renderHome({tenant:{isPreview:false},storageAvailable:true}).includes('lab-hero-main'));
 assert.ok(!renderHome({tenant:{isPreview:false},storageAvailable:true}).includes('lab-hero-aside'));
});
