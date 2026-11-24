import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderView } from '../assets/ui/views.js';
import { resolveTenant } from '../assets/config/tenants.js';
import { ASSESSMENTS } from '../assets/data/assessments.js';
import { createAttempt } from '../assets/core/assessment.js';
import { LETTER_IMAGES } from '../assets/ui/letter-art.js';

const tenant = resolveTenant('');
const attempts = Object.fromEntries(Object.keys(ASSESSMENTS).map(key => [key, null]));
const start = renderView({ page: 'start' }, { tenant, assessment: null, attempt: null, attempts, storageAvailable: true });
const assessment = ASSESSMENTS.middle;
const intro = renderView({ page: 'intro' }, { tenant, assessment, attempt: createAttempt(tenant.id, assessment), attempts, storageAvailable: true });
const css = readFileSync(new URL('../assets/entry-refinement.css', import.meta.url), 'utf8');

test('welcome shows a C visual with essential guidance and one start button', () => {
  const stage = start.slice(start.indexOf('data-start-stage="welcome"'), start.indexOf('data-start-stage="grade"'));
  assert.ok(stage.includes('cf-welcome-figure'));
  assert.ok(stage.includes(LETTER_IMAGES.C));
  assert.ok(stage.includes('안녕하세요.'));
  assert.ok(stage.includes('흥미'));
  assert.ok(stage.includes('적성'));
  assert.ok(stage.includes('가치관'));
  assert.equal((stage.match(/data-action="show-grade-choices"/g) || []).length, 1);
  assert.ok(stage.includes('3문항 화면 체험'));
});
test('intro is a focused single CTA with compact information instead of empty columns', () => {
  assert.ok(intro.includes('cf-intro-simple'));
  assert.ok(intro.includes('cf-intro-facts'));
  assert.ok(intro.includes('검사를 시작할게요.'));
  assert.ok(intro.includes('5단계 중 하나 선택'));
  assert.ok(intro.includes('응답 검토 및 수정'));
  assert.ok(intro.includes('3문항 화면 체험'));
  assert.equal((intro.match(/data-action="begin"/g) || []).length, 1);
  assert.ok(!intro.includes('cf-intro-lead'));
  assert.ok(!intro.includes('cf-intro-details'));
  assert.ok(!intro.includes('class="experience-note"'));
});
test('intro and welcome responsive styles include reduced motion and balanced spacing', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.ok(html.includes('./assets/entry-refinement.css'));
  assert.match(css, /\.cf-welcome-content/);
  assert.match(css, /\.cf-welcome-figure/);
  assert.match(css, /\.cf-intro-facts/);
  assert.match(css, /@media\(max-width:620px\)/);
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);
});
