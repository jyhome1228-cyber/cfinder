import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ASSESSMENTS, RESPONSE_OPTIONS } from '../assets/data/assessments.js';
import { createAttempt } from '../assets/core/assessment.js';
import { resolveTenant } from '../assets/config/tenants.js';
import { renderView } from '../assets/ui/views.js';

const css = readFileSync(new URL('../assets/response-scale.css', import.meta.url), 'utf8');

test('five options use a symmetric large-to-small-to-large scale', () => {
  const sizes = [64, 52, 40, 52, 64];
  for (let i = 0; i < 5; i++) {
    const rule = new RegExp('\\.question-panel \\.choice:nth-child\\(' + (i+1) + '\\)\\{--circle-diameter:' + sizes[i] + 'px;');
    assert.match(css, rule);
  }
  assert.ok(css.includes('grid-template-columns:repeat(5,minmax(0,1fr))'));
  assert.ok(css.includes('margin:calc((var(--max-circle) - var(--circle-diameter))/2) 0 !important'));
});
test('radio selection is a solid blue circle without a white central dot', () => {
  assert.ok(css.includes('.question-panel .choice input[type="radio"]:checked'));
  assert.ok(css.includes('background:var(--choice-tone)!important'));
  assert.ok(css.includes('background-image:none!important'));
  assert.ok(!css.includes('radial-gradient('));
  assert.ok(css.includes('input[type="radio"]:focus-visible'));
});
test('mobile circles also shrink toward the center and labels remain visible', () => {
  for(const size of [50, 41, 32, 43, 37, 29])
    assert.ok(css.includes('--circle-diameter:' + size + 'px'));
  assert.ok(css.includes('@media(max-width:760px)'));
  assert.ok(css.includes('@media(max-width:420px)'));
  assert.ok(css.includes('prefers-reduced-motion:reduce'));
  const index=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  assert.ok(index.includes('./assets/response-scale.css'));
});
test('all school levels have exactly three demonstration questions and five response choices', () => {
  assert.equal(RESPONSE_OPTIONS.length,5);
  const tenant=resolveTenant('');
  for (const [grade,assessment] of Object.entries(ASSESSMENTS)){
    assert.equal(assessment.mode,'demo',grade);
    assert.equal(assessment.questions.length,grade==='university'?3:49,grade);
    assert.deepEqual(grade==='university' ? assessment.questions.map(q=>q.domain) : [...new Set(assessment.questions.map(q=>q.domain))],['interest','aptitude','values']);
    const attempt=createAttempt(tenant.id,assessment);
    const html=renderView({page:'test',index:2,grade,fromReview:false},
      {tenant,assessment,attempt,attempts:{},storageAvailable:true});
    assert.ok(html.includes(grade==='university' ? '1–3 / 3' : '1–5 / 49'),grade);
    assert.ok(html.includes('/ '+assessment.questions.length),grade);
    assert.equal((html.match(/type="radio"/g)||[]).length,(grade==='university'?3:5)*5,grade);
    assert.ok(html.includes('aria-valuemax="'+assessment.questions.length+'"'),grade);
  }
});
