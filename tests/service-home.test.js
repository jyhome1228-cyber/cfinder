import test from 'node:test';
import assert from 'node:assert/strict';
import { renderHome } from '../assets/ui/home.js';
const context = { tenant:{isPreview:false}, storageAvailable:true };
test('service home has centered diagnosis entry and a report preview lower on page',()=>{
 const html=renderHome(context);
 assert.match(html,/id="page-heading"/);
 assert.match(html,/href="#start"/);
 assert.match(html,/href="#report"/);
 assert.match(html,/lab-result-card/);
 assert.match(html,/RIASEC 6유형/);
 assert.equal((html.match(/class="lab-type cf-type-trigger"/g)||[]).length,6);
});
test('home never implies invented personal scores',()=>{
 const html=renderHome(context);
 assert.ok(html.includes('현재 자기탐색 응답으로는 공식 진로 유형이 산출되지 않습니다'));
 assert.ok(!html.includes('88%'));
 assert.ok(!html.includes('76%'));
 assert.ok(!html.includes('83%'));
});

test('expanded homepage sections preserve a common CTA and FAQ structure',()=>{
 const html=renderHome(context);
 assert.match(html,/class="lab-cta-heading"/);
 assert.match(html,/class="lab-audience-grid"/);
 assert.match(html,/class="lab-faq-list"/);
 assert.equal((html.match(/<details>/g)||[]).length,8);
 assert.ok(html.includes('정식 대학생 검사는 아직 제공하지 않습니다'));
 assert.ok(html.includes('학교 도입 문의하기'));
});

test('FAQ covers assessment, results, privacy and school onboarding without inventing service status',()=>{const html=renderHome(context);for(const item of ['27개','13개','9개','학교 도입 문의하기','공식 점수나 진로 유형을 자동으로 산출하지 않습니다','자동 접수가 아닌 메일 작성 방식'])assert.ok(html.includes(item));});
