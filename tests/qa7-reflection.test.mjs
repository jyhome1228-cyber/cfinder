import test from 'node:test';
import assert from 'node:assert/strict';
import { ASSESSMENTS } from '../assets/data/assessments.js';
import { createAttempt, answerQuestion, completeAttempt } from '../assets/core/assessment.js';
import { getReflectionSummary } from '../assets/services/reflection.js';
import { renderView } from '../assets/ui/views.js';
import { resolveTenant } from '../assets/config/tenants.js';

function completed(grade, response) {
 const assessment=ASSESSMENTS[grade];
 let attempt=createAttempt('public', assessment);
 assessment.questions.forEach((q,i)=>{attempt=answerQuestion(attempt,assessment,q.id,response(q,i));});
 return {assessment,attempt:completeAttempt(attempt,assessment)};
}

test('49 direct choices are grouped by area without inferring diagnosis',()=>{
 const {assessment,attempt}=completed('middle', (q,i)=>i%5+1);
 const summaries=getReflectionSummary(attempt,assessment);
 assert.deepEqual(summaries.map(x=>x.count),[27,13,9]);
 for(const group of summaries){
   assert.equal(group.distribution.low+group.distribution.middle+group.distribution.high,group.count);
   assert.ok(group.highlighted.length<=4);
   assert.ok(group.highlighted.every(x=>x.value>=4));
 }
 assert.equal('careerType' in summaries[0],false);
 assert.equal('scores' in summaries[0],false);
});

test('all-low responses have no invented highlights or recommendations',()=>{
 const {assessment,attempt}=completed('high',()=>1);
 const summary=getReflectionSummary(attempt,assessment);
 assert.ok(summary.every(g=>g.distribution.high===0&&g.highlighted.length===0));
 const html=renderView({page:'result',grade:'high'},{tenant:resolveTenant(''),assessment,attempt,attempts:{},storageAvailable:true});
 assert.ok(html.includes('다른 응답도 나를 알아가는 단서'));
 assert.ok(html.includes('공식 점수나 진로 유형은 산출되지'));
 assert.ok(!html.includes('직업 적합도 90'));
});

test('high selections reflect only actual responses and stable ordering',()=>{
 const {assessment,attempt}=completed('middle',(q,i)=>i===0?5:4);
 const groups=getReflectionSummary(attempt,assessment);
 assert.equal(groups[0].highlighted[0].name,assessment.questions[0].factor);
 assert.equal(groups[0].highlighted[0].value,5);
 assert.deepEqual(groups.map(g=>g.distribution.high),[27,13,9]);
});

test('university remains a three-question demonstration without reflection profile',()=>{
 const assessment=ASSESSMENTS.university;
 assert.equal(getReflectionSummary({status:'completed'},assessment),null);
});

test('incomplete results cannot be summarized',()=>{
 const assessment=ASSESSMENTS.middle;
 assert.throws(()=>getReflectionSummary(createAttempt('public',assessment),assessment),/Completed/);
});
