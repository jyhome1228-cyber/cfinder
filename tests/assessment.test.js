import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createAttempt, restoreAttempt, answerQuestion, visitQuestion,
  countAnswered, isComplete, completeAttempt, getResumeRoute, storageKey,
} from '../assets/core/assessment.js';

const START = '2026-11-23T00:00:00.000Z';
const END = '2026-11-23T00:01:00.000Z';
const assessment = {
  id: 'middle-demo', version: 'demo-1', mode: 'demo', grade: 'middle', label: '중학생용',
  options: [1, 2, 3, 4, 5].map(value => ({ value, label: String(value) })),
  questions: [
    { id: 'M-1', domain: 'interest', text: '시연 문항 1' },
    { id: 'M-2', domain: 'aptitude', text: '시연 문항 2' },
    { id: 'M-3', domain: 'values', text: '시연 문항 3' },
  ],
};
const fresh = () => createAttempt('cfinder', assessment, START);
const answered = () => assessment.questions.reduce(
  (attempt, question) => answerQuestion(attempt, assessment, question.id, 4), fresh(),
);

test('a new attempt identifies its tenant and version and contains no inferred results', () => {
  const attempt = fresh();
  assert.equal(attempt.schemaVersion, 2);
  assert.equal(attempt.tenantId, 'cfinder');
  assert.equal(attempt.assessmentVersion, 'demo-1');
  assert.equal(attempt.status, 'in_progress');
  assert.equal(attempt.startedAt, START);
  assert.equal(attempt.completedAt, null);
  assert.deepEqual(attempt.answers, {});
  assert.equal(countAnswered(attempt, assessment), 0);
  assert.equal(getResumeRoute(attempt, assessment), '#test/0');
  assert.equal(Object.hasOwn(attempt, 'score'), false);
  assert.equal(Object.hasOwn(attempt, 'result'), false);
});

test('answering and editing are immutable and preserve the other responses', () => {
  const original = fresh();
  const first = answerQuestion(original, assessment, 'M-1', 1);
  const second = answerQuestion(first, assessment, 'M-2', 4);
  const edited = answerQuestion(second, assessment, 'M-1', 5);
  assert.deepEqual(original.answers, {});
  assert.deepEqual(first.answers, { 'M-1': 1 });
  assert.deepEqual(second.answers, { 'M-1': 1, 'M-2': 4 });
  assert.deepEqual(edited.answers, { 'M-1': 5, 'M-2': 4 });
  assert.equal(edited.currentIndex, 0);
  assert.equal(countAnswered(edited, assessment), 2);
});

test('invalid questions and response values are rejected', () => {
  assert.throws(() => answerQuestion(fresh(), assessment, 'foreign', 3), /question/);
  for (const value of [0, 6, 2.5, '3', null, undefined, NaN]) {
    assert.throws(() => answerQuestion(fresh(), assessment, 'M-1', value), /response/);
  }
});

test('resume finds the first unanswered question even after visiting a later question', () => {
  const partial = answerQuestion(fresh(), assessment, 'M-3', 4);
  const visited = visitQuestion(partial, assessment, 2);
  assert.equal(getResumeRoute(visited, assessment), '#test/0');
  const next = answerQuestion(visited, assessment, 'M-1', 2);
  assert.equal(getResumeRoute(next, assessment), '#test/1');
  const ready = answerQuestion(next, assessment, 'M-2', 3);
  assert.equal(getResumeRoute(ready, assessment), '#review');
  assert.equal(isComplete(ready, assessment), true);
});

test('question navigation clamps integer positions and rejects invalid positions', () => {
  const original = fresh();
  assert.equal(visitQuestion(original, assessment, -10).currentIndex, 0);
  assert.equal(visitQuestion(original, assessment, 999).currentIndex, 2);
  assert.equal(visitQuestion(original, assessment, 1).currentIndex, 1);
  assert.equal(original.currentIndex, 0);
  for (const index of [1.5, '1', NaN, Infinity]) {
    assert.throws(() => visitQuestion(original, assessment, index), /integer/);
  }
});

test('completion requires every valid answer and produces a read-only attempt', () => {
  assert.throws(() => completeAttempt(fresh(), assessment, END), /every question/);
  const original = answered();
  const completed = completeAttempt(original, assessment, END);
  assert.equal(original.status, 'in_progress');
  assert.equal(completed.status, 'completed');
  assert.equal(completed.completedAt, END);
  assert.equal(getResumeRoute(completed, assessment), '#result');
  assert.deepEqual(completed.answers, original.answers);
  assert.notEqual(completed.answers, original.answers);
  assert.throws(() => answerQuestion(completed, assessment, 'M-1', 1), /read-only/);
  assert.throws(() => visitQuestion(completed, assessment, 0), /read-only/);
  assert.throws(() => completeAttempt(completed, assessment, END), /read-only/);
});

test('storage is scoped to the tenant, school assessment, and assessment version', () => {
  const key = storageKey('cfinder', assessment);
  assert.notEqual(key, storageKey('school', assessment));
  assert.notEqual(key, storageKey('cfinder', { ...assessment, grade: 'high' }));
  assert.notEqual(key, storageKey('cfinder', { ...assessment, version: 'demo-2' }));
  assert.notEqual(storageKey('school:west', assessment), storageKey('school', { ...assessment, id: 'west:middle-demo' }));
});

test('restore rejects records from another tenant, school, assessment, or version', () => {
  const saved = answered();
  const invalid = [
    null, [], 'not an object', {},
    { ...saved, schemaVersion: 1 },
    { ...saved, tenantId: 'another-school' },
    { ...saved, grade: 'high' },
    { ...saved, assessmentId: 'high-demo' },
    { ...saved, assessmentVersion: 'demo-2' },
    { ...saved, status: 'unknown' },
    { ...saved, startedAt: 'invalid' },
  ];
  for (const value of invalid) assert.equal(restoreAttempt(value, 'cfinder', assessment), null);
});

test('restore discards unknown and malformed responses without trusting inherited properties', () => {
  const answers = Object.assign(Object.create({ 'M-3': 5 }), { 'M-1': 4, 'M-2': '3', foreign: 5 });
  const saved = { ...fresh(), answers, currentIndex: 900, score: 100, result: 'invented' };
  const restored = restoreAttempt(saved, 'cfinder', assessment);
  assert.deepEqual(restored.answers, { 'M-1': 4 });
  assert.equal(restored.currentIndex, 2);
  assert.equal(Object.hasOwn(restored, 'score'), false);
  assert.equal(Object.hasOwn(restored, 'result'), false);
  assert.equal(getResumeRoute(restored, assessment), '#test/1');
  assert.deepEqual(restoreAttempt({ ...saved, answers: [], currentIndex: NaN }, 'cfinder', assessment).answers, {});
  assert.equal(restoreAttempt({ ...saved, currentIndex: '1' }, 'cfinder', assessment).currentIndex, 0);
});

test('restore preserves valid completion but downgrades a corrupt completed record', () => {
  const completed = completeAttempt(answered(), assessment, END);
  assert.deepEqual(restoreAttempt(JSON.parse(JSON.stringify(completed)), 'cfinder', assessment), completed);
  for (const changes of [
    { answers: { 'M-1': 5 } },
    { completedAt: null },
    { completedAt: 'invalid' },
    { completedAt: '2026-11-22T00:00:00.000Z' },
  ]) {
    const restored = restoreAttempt({ ...completed, ...changes }, 'cfinder', assessment);
    assert.equal(restored.status, 'in_progress');
    assert.equal(restored.completedAt, null);
  }
});

test('every state mutation rejects an attempt from a different assessment version', () => {
  const wrong = { ...fresh(), assessmentVersion: 'old' };
  assert.throws(() => answerQuestion(wrong, assessment, 'M-1', 3), /does not match/);
  assert.throws(() => visitQuestion(wrong, assessment, 1), /does not match/);
  assert.throws(() => completeAttempt(wrong, assessment, END), /does not match/);
});

test('invalid assessment definitions and timestamps cannot create usable attempts', () => {
  assert.throws(() => createAttempt('', assessment, START), /tenant/);
  assert.throws(() => createAttempt('cfinder', { ...assessment, questions: [] }, START), /assessment/);
  assert.throws(() => createAttempt('cfinder', { ...assessment, questions: [assessment.questions[0], assessment.questions[0]] }, START), /unique/);
  assert.throws(() => createAttempt('cfinder', assessment, 'yesterday'), /timestamp/);
  assert.throws(() => completeAttempt(answered(), assessment, '2026-11-22T00:00:00.000Z'), /completion time/);
});
