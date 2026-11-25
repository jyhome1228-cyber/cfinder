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
test('each type has specific explanation, activities, and a reflection question',()=>{
 for(const type of TYPES) {
  assert.ok(type.intro.length>=35,type.code);
  assert.equal(type.traits.length,3,type.code);
  assert.ok(type.example.length>=20,type.code);
  assert.ok(type.question.endsWith('?'),type.code);
 }
});
