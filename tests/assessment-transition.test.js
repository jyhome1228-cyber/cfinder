import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
test('assessment entry displays a short preparation state before entering unfinished test',()=>{
 const app=read('../assets/app.js');
 assert.ok(app.includes("function prepareAssessment(next)"));
 assert.ok(app.includes("검사를 준비하고 있습니다."));
 assert.ok(app.includes("850"));
 assert.ok(app.includes("parseRoute(location.hash).page === 'start'"));
 assert.ok(app.includes("if (prepareTimer !== null) finishPreparing()"));
 assert.ok(app.includes("currentAttempt().status === 'completed'"));
});
test('test content and progress share the 1440px header/footer outer grid',()=>{
 const css=read('../assets/assessment-transition.css');
 const base=read('../assets/styles.css');
 const html=read('../index.html');
 assert.match(base,/\.header-inner\s*\{\s*max-width:\s*1440px;\s*padding:\s*0 48px/);
 assert.match(base,/\.footer-inner\s*\{\s*max-width:\s*1440px;\s*padding:\s*32px 48px/);
 assert.match(css,/\.shell-flow\s*\{width:100%;max-width:1440px;margin-inline:auto;padding-left:48px;padding-right:48px;/);
 assert.match(css,/\.shell-flow \.flow-container\s*\{width:100%;max-width:none;/);
 assert.match(css,/\.shell-flow \.flow-steps\s*\{width:100%;/);
 assert.ok(html.includes('assets/assessment-transition.css'));
});
test('preparation motion has reduced-motion fallback and compact mobile layout',()=>{
 const css=read('../assets/assessment-transition.css');
 assert.match(css,/cf-prepare-overlay/);
 assert.match(css,/prefers-reduced-motion:no-preference/);
 for(const screen of [760,620,360])assert.ok(css.includes('max-width:'+screen+'px'));
 assert.match(css,/grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
});

test('intro focuses on one action and a readable non-card assessment guide',async()=>{
 const {renderView}=await import('../assets/ui/views.js');
 const {resolveTenant}=await import('../assets/config/tenants.js');
 const {ASSESSMENTS}=await import('../assets/data/assessments.js');
 const {createAttempt}=await import('../assets/core/assessment.js');
 const assessment=ASSESSMENTS.middle;
 const html=renderView({page:'intro'},{tenant:resolveTenant(''),assessment,attempt:createAttempt('public',assessment),attempts:{},storageAvailable:true});
 assert.ok(html.includes('cf-intro-lead'));
 assert.ok(html.includes('cf-intro-details'));
 assert.ok(html.includes('검사를 시작하기 전에'));
 assert.ok(html.includes('data-action="begin"'));
 assert.ok(html.includes('학교급 다시 선택'));
 assert.ok(html.includes('3문항 화면 체험입니다'));
 assert.ok(!html.includes('class="intro-points"'));
 assert.ok(!html.includes('class="experience-note"'));
 const css=read('../assets/assessment-transition.css');
 assert.match(css,/\.cf-intro\{display:grid;grid-template-columns:/);
 assert.match(css,/@media\(max-width:720px\)/);
});
