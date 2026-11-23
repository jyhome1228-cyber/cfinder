import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const css=readFileSync(new URL('../assets/service.css',import.meta.url),'utf8');
test('all five assessment choices use a blue-only palette',()=>{
 for(let index=1;index<=5;index++){
  assert.ok(css.includes(`.question-panel .choice:nth-child(${index}){--option-blue:var(--choice-blue-${index})}`));
 }
 for(const color of ['#a9c9ff','#78a9ff','#548af3','#306ce9','#1957ef'])
  assert.ok(css.includes(color));
});
test('selected and focus-visible response circles have strong visual treatment',()=>{
 assert.match(css,/\.question-panel \.choice input:checked\{/);
 assert.match(css,/background:radial-gradient\(/);
 assert.match(css,/\.question-panel \.choice input:focus-visible\{/);
});
test('response choices remain accessible on small screens and reduced motion',()=>{
 assert.match(css,/@media\(max-width:390px\)/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});
