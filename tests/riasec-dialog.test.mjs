import test from 'node:test';
import assert from 'node:assert/strict';
import { TYPES, renderHome } from '../assets/ui/home.js';
const page=renderHome({storageAvailable:true});

test('RIASEC cards are buttons opening a shared accessible modal',()=>{
 assert.equal(TYPES.length,6);
 assert.deepEqual(TYPES.map(x=>x.code),['R','I','A','S','E','C']);
 assert.equal((page.match(/data-action="open-riasec"/g)||[]).length,6);
 assert.ok(page.includes('id="cf-riasec-dialog"'));
 assert.ok(page.includes('aria-labelledby="cf-riasec-title"'));
 assert.ok(page.includes('aria-describedby="cf-riasec-description"'));
 assert.ok(!page.includes('유형 설명은 일반적인 탐색 정보입니다.'));
});
test('only source-verified RIASEC labels are published; unsupported activities removed',()=>{
 assert.deepEqual(TYPES.map(type=>type.name),['현실형','탐구형','예술형','사회형','진취형','관습형']);
 for(const type of TYPES) {
  assert.deepEqual(Object.keys(type).sort(),['code','name']);
 }
 assert.equal((page.match(/data-action="switch-riasec"/g)||[]).length,6);
 assert.ok(page.includes('원본 기획서에서 확인된 유형명'));
 for(const forbidden of ['간단한 조립 키트','직접 해볼 수 있는 탐색','생각해 볼 질문','평소 궁금했던 현상','아이디어 제안하기'])
   assert.ok(!page.includes(forbidden),forbidden);
});
