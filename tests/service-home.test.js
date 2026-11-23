import test from 'node:test';
import assert from 'node:assert/strict';
import { renderHome } from '../assets/ui/home.js';
const context = { tenant:{isPreview:false}, storageAvailable:true };
test('service home has a single dominant diagnosis entry and result preview',()=>{
 const html=renderHome(context);
 assert.match(html,/id="page-heading"/);
 assert.match(html,/href="#start"/);
 assert.match(html,/href="#report"/);
 assert.match(html,/lab-result-card/);
 assert.match(html,/RIASEC 6유형/);
 assert.equal((html.match(/class="lab-type"/g)||[]).length,6);
});
test('home never implies invented personal scores',()=>{
 const html=renderHome(context);
 assert.ok(html.includes('현재 화면 체험 3문항에서는 개인 결과가 산출되지 않습니다'));
 assert.ok(!html.includes('88%'));
 assert.ok(!html.includes('76%'));
 assert.ok(!html.includes('83%'));
});

test('expanded homepage sections preserve a common CTA and FAQ structure',()=>{
 const html=renderHome(context);
 assert.match(html,/class="lab-cta-heading"/);
 assert.match(html,/class="lab-audience-grid"/);
 assert.match(html,/class="lab-faq-list"/);
 assert.equal((html.match(/<details>/g)||[]).length,5);
 assert.ok(html.includes('대학생용 정식 검사는 준비 전'));
 assert.ok(html.includes('학교 도입 문의하기'));
});
