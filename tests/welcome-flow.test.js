import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderView } from '../assets/ui/views.js';
import { resolveTenant } from '../assets/config/tenants.js';
import { ASSESSMENTS } from '../assets/data/assessments.js';
import { createAttempt, answerQuestion } from '../assets/core/assessment.js';

const page = attempts => renderView(
  {page:'start'},
  {tenant:resolveTenant(''),assessment:null,attempt:null,storageAvailable:true,attempts}
);
const empty = Object.fromEntries(Object.keys(ASSESSMENTS).map(k=>[k,null]));

test('conversational entry greets first and hides grade options until requested',()=>{
 const html=page(empty);
 assert.match(html,/안녕하세요\./);
 assert.match(html,/오신 것을 환영합니다/);
 assert.match(html,/data-action="show-grade-choices"/);
 assert.match(html,/data-start-stage="welcome"/);
 assert.match(html,/data-start-stage="grade" hidden/);
 assert.match(html,/지금 어떤 학교에/);
 assert.match(html,/다니고 있나요/);
 assert.ok(html.includes('중학교'));
 assert.ok(html.includes('고등학교'));
 assert.ok(html.includes('대학교'));
 assert.equal((html.match(/data-action="select-grade"/g)||[]).length,3);
 assert.ok(html.indexOf('data-start-stage="welcome"')<html.indexOf('data-start-stage="grade"'));
 assert.ok(!html.includes('생년월일'));
 assert.ok(!html.includes('나이를 입력'));
});
test('grade selector keeps resume status and separate university disclaimer',()=>{
 const assessment=ASSESSMENTS.high;
 let partial=createAttempt('public',assessment,'2026-11-24T02:00:00.000Z');
 partial=answerQuestion(partial,assessment,assessment.questions[0].id,4);
 const html=page({...empty,high:partial});
 assert.match(html,/1\/49항목 응답/);
 assert.match(html,/이어서 하기/);
 assert.match(html,/대학생용 3문항 체험/);
 assert.match(html,/정식 C-Finder 문항·채점은 연결되지 않았습니다/);
});
test('welcome transition is keyboard accessible with reduced-motion support',()=>{
 const html=page(empty);
 const script=readFileSync(new URL('../assets/app.js',import.meta.url),'utf8');
 const css=readFileSync(new URL('../assets/welcome-flow.css',import.meta.url),'utf8');
 const index=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 assert.ok(html.includes('data-action="back-to-welcome"'));
 assert.ok(script.includes("action === 'show-grade-choices' || action === 'back-to-welcome'"));
 assert.ok(script.includes("?.focus({ preventScroll: true })"));
 assert.match(css,/\.cf-welcome-stage\[hidden\]\{display:none!important\}/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.ok(index.includes('./assets/welcome-flow.css'));
});
test('header, selection body, and footer use the same outer container and gutters',()=>{
 const base=readFileSync(new URL('../assets/styles.css',import.meta.url),'utf8');
 const css=readFileSync(new URL('../assets/welcome-flow.css',import.meta.url),'utf8');
 assert.match(base,/\.header-inner\s*\{\s*max-width:\s*1440px;\s*padding:\s*0 48px/);
 assert.match(base,/\.footer-inner\s*\{\s*max-width:\s*1440px;\s*padding:\s*32px 48px/);
 assert.match(css,/\.shell-start\{width:100%;max-width:1440px;padding:0 48px/);
 assert.match(css,/@media\(max-width:620px\)/);
 assert.match(css,/@media\(max-width:360px\)/);
});
