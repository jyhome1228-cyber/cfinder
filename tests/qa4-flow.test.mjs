import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { ASSESSMENTS } from '../assets/data/assessments.js';
import { assessmentPages, pageForIndex, pageMissingQuestions } from '../assets/core/pages.js';
import { createAttempt, answerQuestion, completeAttempt, countAnswered, getResumeRoute, restoreAttempt } from '../assets/core/assessment.js';
import { createSessionStore } from '../assets/core/storage.js';
import { parseRoute, withGrade } from '../assets/core/router.js';
import { getResultSummary } from '../assets/services/results.js';

test('each school has the intended number of questions and pages', () => {
  for (const grade of ['middle', 'high']) {
    const assessment = ASSESSMENTS[grade];
    const pages = assessmentPages(assessment);
    assert.equal(assessment.questions.length, 49);
    assert.equal(pages.length, 11);
    assert.deepEqual(pages.map(page => page.questions.length), [5,5,5,5,5,2,5,5,3,5,4]);
    assert.equal(pages.flatMap(page => page.questions).length, 49);
    assert.equal(pageForIndex(assessment, 48)?.next, null);
  }
  assert.equal(ASSESSMENTS.university.questions.length, 3);
  assert.equal(assessmentPages(ASSESSMENTS.university).length, 1);
});

test('five-item flow preserves prior responses and highlights missing answers', () => {
  const assessment = ASSESSMENTS.middle;
  let attempt = createAttempt('public', assessment);
  const page = pageForIndex(assessment, 0);
  assert.equal(getResumeRoute(attempt, assessment), '#test/0');
  attempt = answerQuestion(attempt, assessment, page.questions[0].id, 5);
  assert.equal(pageMissingQuestions(assessment, attempt.answers, page).length, 4);
  attempt = answerQuestion(attempt, assessment, page.questions[0].id, 2);
  assert.equal(attempt.answers[page.questions[0].id], 2);
  assert.equal(countAnswered(attempt, assessment), 1);
  assert.equal(getResumeRoute(attempt, assessment), '#test/1');
});

test('a completed attempt restores, remains read-only and does not generate official scores', () => {
  const assessment = ASSESSMENTS.high;
  let attempt = createAttempt('public', assessment);
  for (const question of assessment.questions) attempt = answerQuestion(attempt, assessment, question.id, 4);
  assert.equal(getResumeRoute(attempt, assessment), '#review');
  attempt = completeAttempt(attempt, assessment);
  assert.equal(getResumeRoute(attempt, assessment), '#result');
  const restored = restoreAttempt(JSON.parse(JSON.stringify(attempt)), 'public', assessment);
  assert.equal(restored.status, 'completed');
  assert.throws(() => answerQuestion(restored, assessment, assessment.questions[0].id, 2));
  const summary = getResultSummary(restored, assessment);
  assert.equal(summary.scores, null);
  assert.equal(summary.careerType, null);
  assert.deepEqual(summary.recommendations, []);
});

test('same-tab storage restores grades and answers without relying on a server', () => {
  const map = new Map();
  const backing = () => ({
    getItem: key => map.has(key) ? map.get(key) : null,
    setItem: (key, value) => { map.set(key, value); }
  });
  const store1 = createSessionStore(backing);
  store1.saveGrade('public', 'middle');
  const assessment = ASSESSMENTS.middle;
  let attempt = createAttempt('public', assessment);
  attempt = answerQuestion(attempt, assessment, assessment.questions[0].id, 5);
  store1.saveAttempt(attempt, assessment);
  const store2 = createSessionStore(backing);
  assert.equal(store2.loadGrade('public'), 'middle');
  assert.equal(store2.loadAttempt('public', assessment).answers[assessment.questions[0].id], 5);
});

test('browser back and review links retain the school grade', () => {
  assert.deepEqual(parseRoute(withGrade('#test/10?from=review', 'high')), {
    page: 'test', index: 10, fromReview: true, grade: 'high'
  });
  assert.deepEqual(parseRoute(withGrade('#review', 'middle')), { page: 'review', grade: 'middle' });
  assert.equal(withGrade('#home', 'middle'), '#home');
});

test('public report has no original PDF link and is clearly marked as a sample', async () => {
  const html = await readFile(new URL('../about/index.html', import.meta.url), 'utf8');
  const report = await readFile(new URL('../assets/ui/sample-report.js', import.meta.url), 'utf8');
  assert.doesNotMatch(html, /report-result-detail_v1_261123\\.webp|cfinder_sample_v1_261123\\.pdf/);
  assert.doesNotMatch(report, /원본 PDF 다운로드|cfinder_sample_v1_261123\\.pdf/);
  assert.match(report, /실제 검사 결과 아님/);
});
