import test from 'node:test';
import assert from 'node:assert/strict';
import { ASSESSMENTS } from '../assets/data/assessments.js';
import { createAttempt, answerQuestion, countAnswered, getResumeRoute, completeAttempt, storageKey, restoreAttempt } from '../assets/core/assessment.js';
import { parseRoute, withGrade } from '../assets/core/router.js';
import { createSessionStore } from '../assets/core/storage.js';

test('university preview uses distinct questions and only demo content', () => {
  const college = ASSESSMENTS.university;
  assert.equal(college.grade, 'university');
  assert.equal(college.mode, 'demo');
  assert.equal(college.questions.length, 3);
  assert.ok(college.questions.every(q => q.id.startsWith('U-DEMO-')));
  assert.notEqual(college.id, ASSESSMENTS.high.id);
  assert.notEqual(college.id, ASSESSMENTS.middle.id);
});
test('college answers remain separate and do not generate a score', () => {
  const college=ASSESSMENTS.university;
  const start=createAttempt('cfinder',college,'2026-11-23T00:00:00.000Z');
  const filled=college.questions.reduce((acc,q)=>answerQuestion(acc,college,q.id,3),start);
  const done=completeAttempt(filled,college,'2026-11-23T00:01:00.000Z');
  assert.equal(countAnswered(done,college),3);
  assert.equal(getResumeRoute(done,college),'#result');
  assert.equal(Object.hasOwn(done,'score'),false);
  assert.equal(Object.hasOwn(done,'result'),false);
  assert.notEqual(storageKey('cfinder',college),storageKey('cfinder',ASSESSMENTS.high));
  assert.equal(restoreAttempt(done,'cfinder',ASSESSMENTS.high),null);
});
test('college route and previous browser session keep its assessment identity',()=>{
  assert.deepEqual(parseRoute('#test/1?grade=university'),{page:'test',index:1,fromReview:false,grade:'university'});
  assert.equal(withGrade('#intro','university'),'#intro?grade=university');
  const entries=new Map();
  const store=createSessionStore(()=>({getItem:key=>entries.get(key)??null,setItem:(key,value)=>entries.set(key,value)}));
  store.saveGrade('cfinder','university');
  assert.equal(store.loadGrade('cfinder'),'university');
  const attempt=createAttempt('cfinder',ASSESSMENTS.university);
  store.saveAttempt(attempt,ASSESSMENTS.university);
  assert.equal(store.loadAttempt('cfinder',ASSESSMENTS.university).grade,'university');
  assert.equal(store.loadAttempt('cfinder',ASSESSMENTS.middle),null);
});
