import test from 'node:test';
import assert from 'node:assert/strict';
import { FACTORS, FACTOR_TOTAL, factorQuestions } from '../assets/data/factor-content.js';
import { ASSESSMENTS } from '../assets/data/assessments.js';
import { createAttempt, answerQuestion, completeAttempt, countAnswered, storageKey } from '../assets/core/assessment.js';
import { getResultSummary } from '../assets/services/results.js';
import { renderView } from '../assets/ui/views.js';
import { resolveTenant } from '../assets/config/tenants.js';

test('factor inventory matches the three user-provided report-data sheets', () => {
  assert.deepEqual(Object.keys(FACTORS),['interest','aptitude','values']);
  assert.equal(FACTORS.interest.length,27);
  assert.equal(FACTORS.aptitude.length,13);
  assert.equal(FACTORS.values.length,9);
  assert.equal(FACTOR_TOTAL,49);
  assert.equal(new Set(Object.values(FACTORS).flatMap(x => x.map(([name]) => name))).size,49);
  assert.ok(FACTORS.interest.some(([name])=>name==='AI·컴퓨터·정보보안'));
  assert.ok(FACTORS.interest.some(([name])=>name==='철학·사회학'));
  assert.ok(FACTORS.aptitude.some(([name])=>name==='언어이해력'));
  assert.ok(FACTORS.values.some(([name])=>name==='변화지향'));
});

test('middle and high have 49 distinct versioned self-reflection items, not formal assessment', () => {
  for (const grade of ['middle','high']){
    const a=ASSESSMENTS[grade];
    assert.equal(a.kind,'factor_exploration');
    assert.equal(a.mode,'demo');
    assert.equal(a.formal,false);
    assert.equal(a.questions.length,49);
    assert.deepEqual(a.questions.reduce((acc,q)=>(acc[q.domain]++,acc),{interest:0,aptitude:0,values:0}),{interest:27,aptitude:13,values:9});
    assert.ok(a.questions.every(q=>q.factor&&q.description&&q.text));
    assert.equal(new Set(a.questions.map(q=>q.id)).size,49);
    assert.notEqual(storageKey('public',a),storageKey('public',{...a,id:'cfinder-'+grade+'-demo',version:'demo-2026-11-24-v2'}));
  }
  assert.equal(ASSESSMENTS.university.questions.length,3);
  assert.equal(ASSESSMENTS.university.kind,undefined);
  assert.notDeepEqual(factorQuestions('middle').map(x=>x.id),factorQuestions('high').map(x=>x.id));
});

test('a complete 49-item exploration only reflects user ratings; it never diagnoses RIASEC',()=>{
  const a=ASSESSMENTS.middle;
  let attempt=createAttempt('public',a,'2026-11-24T01:00:00.000Z');
  for(const q of a.questions)attempt=answerQuestion(attempt,a,q.id,q===a.questions[0]?5:3);
  assert.equal(countAnswered(attempt,a),49);
  attempt=completeAttempt(attempt,a,'2026-11-24T01:20:00.000Z');
  const summary=getResultSummary(attempt,a);
  assert.equal(summary.answeredCount,49);
  assert.equal(summary.scores,null);
  assert.equal(summary.careerType,null);
  assert.deepEqual(summary.recommendations,[]);
  const html=renderView({page:'result'},{tenant:resolveTenant(''),assessment:a,attempt,attempts:{},storageAvailable:true});
  assert.ok(html.includes('자기탐색 완료'));
  assert.ok(html.includes('49개 항목의 응답'));
  assert.ok(html.includes('AI·컴퓨터·정보보안'));
  assert.ok(html.includes('자기평가이며'));
  assert.ok(html.includes('정식 검사 점수나 RIASEC 진로 유형으로 산출되지 않습니다'));
});

test('question UI shows source-backed factor context and accurate progress',()=>{
  const a=ASSESSMENTS.high;
  const attempt=createAttempt('public',a);
  const html=renderView({page:'test',index:27,grade:'high',fromReview:false},{tenant:resolveTenant(''),assessment:a,attempt,attempts:{},storageAvailable:true});
  assert.ok(html.includes('자기탐색 28번 문항'));
  assert.ok(html.includes('aria-valuemax="49"'));
  assert.ok(html.includes('cf-factor-context'));
  assert.ok(html.includes('언어이해력'));
  assert.equal((html.match(/type="radio"/g)||[]).length,5);
});
