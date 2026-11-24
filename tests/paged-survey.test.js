import test from 'node:test';
import assert from 'node:assert/strict';
import { assessmentPages, pageForIndex, pageMissingQuestions } from '../assets/core/pages.js';
import { ASSESSMENTS } from '../assets/data/assessments.js';
import { renderView } from '../assets/ui/views.js';
import { createAttempt, answerQuestion, getResumeRoute } from '../assets/core/assessment.js';
import { resolveTenant } from '../assets/config/tenants.js';
import { readFileSync } from 'node:fs';

const assessment=ASSESSMENTS.middle;
const tenant=resolveTenant('');
const pages=assessmentPages(assessment);
const attempt=()=>createAttempt(tenant.id,assessment);
function htmlFor(index, a=attempt()) {
 return renderView({page:'test',index,fromReview:false,grade:'middle'},{
  tenant,assessment,attempt:a,attempts:{},storageAvailable:true
 });
}
test('49 factor items are organized into 11 domain-boundary pages with up to 5 each',()=>{
 assert.equal(pages.length,11);
 assert.deepEqual(pages.map(p=>p.questions.length),[5,5,5,5,5,2,5,5,3,5,4]);
 assert.deepEqual(pages.map(p=>p.domain),['interest','interest','interest','interest','interest','interest','aptitude','aptitude','aptitude','values','values']);
 assert.equal(pages[0].start,0);
 assert.equal(pages[5].start,25);
 assert.equal(pages[6].start,27);
 assert.equal(pages[9].start,40);
 assert.equal(pages[10].end,49);
 for(const p of pages) assert.ok(p.questions.every(q=>q.domain===p.domain));
});
test('page for any question index maps to its group, with boundary-aware navigation',()=>{
 const p=pageForIndex(assessment,26);
 assert.equal(p.start,25);
 assert.equal(p.end,27);
 assert.equal(p.previous,20);
 assert.equal(p.next,27);
 assert.equal(pageForIndex(assessment,27).start,27);
 assert.equal(pageForIndex(assessment,48).next,null);
 assert.equal(pageForIndex(assessment,-1),null);
 assert.equal(pageForIndex(assessment,49),null);
});
test('a five-item page is gated until all five valid answers are stored',()=>{
 let a=attempt();
 const first=pageForIndex(assessment,0);
 assert.equal(pageMissingQuestions(assessment,a.answers,first).length,5);
 let html=htmlFor(0,a);
 assert.ok(html.includes('data-page-start="0"'));
 assert.ok(html.includes('data-page-end="5"'));
 assert.ok(html.includes('data-next-start="5"'));
 assert.ok(html.includes('1 <span>/ 11</span>'));
 assert.equal((html.match(/type="radio"/g)||[]).length,25);
 assert.ok(html.includes('data-action="next" data-index="0"'));
 const app=readFileSync(new URL('../assets/app.js',import.meta.url),'utf8');
 assert.ok(app.includes('pageMissingQuestions(assessment(), currentAttempt().answers, page)'));
 for(const q of first.questions) a=answerQuestion(a,assessment,q.id,4);
 assert.equal(pageMissingQuestions(assessment,a.answers,first).length,0);
 html=htmlFor(0,a);
 assert.ok(html.includes('5/5개 선택'));
 assert.ok(html.includes('data-action="next" data-index="0"'));
 assert.equal(getResumeRoute(a,assessment),'#test/5');
});
test('last page reflects remaining four items, while university demo is one three-item page',()=>{
 const last=htmlFor(45);
 assert.ok(last.includes('46–49 / 49'));
 assert.ok(last.includes('11 <span>/ 11</span>'));
 assert.equal((last.match(/type="radio"/g)||[]).length,20);
 const u=ASSESSMENTS.university;
 const upages=assessmentPages(u);
 assert.equal(upages.length,1);
 assert.equal(upages[0].questions.length,3);
});
test('header/footer and responsive layout are consistent and include operator contact',()=>{
 const html=htmlFor(0);
 const css=readFileSync(new URL('../assets/paged-survey.css',import.meta.url),'utf8');
 const index=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 assert.ok(html.includes('사자가온다(주)'));
 assert.ok(html.includes('sajagaonda@gmail.com'));
 assert.ok(html.includes('비공식 자기탐색'));
 assert.ok(index.includes('assets/paged-survey.css'));
 assert.ok(css.includes('@media(max-width:620px)'));
 assert.ok(css.includes('cf-domain-progress'));
 assert.ok(css.includes('cf-scale-head'));
});

test('review is split into three expandable domain summaries with individual edit controls',()=>{
 const a=attempt();
 const html=renderView({page:'review',grade:'middle'},{
  tenant,assessment,attempt:a,attempts:{},storageAvailable:true
 });
 assert.equal((html.match(/class="cf-review-domain"/g)||[]).length,3);
 assert.equal((html.match(/class="review-item/g)||[]).length,49);
 assert.equal((html.match(/data-action="edit"/g)||[]).length,49);
 assert.ok(html.includes('미응답 49개가 남아 있어요.'));
 assert.ok(html.includes('data-action="complete" disabled'));
});
