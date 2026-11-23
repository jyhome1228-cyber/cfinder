import test from 'node:test';
import assert from 'node:assert/strict';
import { createAttempt, answerQuestion, completeAttempt, getResumeRoute, storageKey } from '../assets/core/assessment.js';
import { createSessionStore } from '../assets/core/storage.js';
import { parseRoute, withGrade } from '../assets/core/router.js';
import { getResultSummary } from '../assets/services/results.js';
import { ASSESSMENTS } from '../assets/data/assessments.js';
import { resolveTenant } from '../assets/config/tenants.js';

const START = '2026-11-23T00:00:00.000Z';
const END = '2026-11-23T00:01:00.000Z';
const { middle, high } = ASSESSMENTS;

function fakeStorage() {
  const values = new Map();
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
  };
}

function partial(tenant = 'public', assessment = middle, value = 4) {
  return answerQuestion(createAttempt(tenant, assessment, START), assessment, assessment.questions[0].id, value);
}

function completed(assessment = middle) {
  const attempt = assessment.questions.reduce(
    (state, question) => answerQuestion(state, assessment, question.id, 3),
    createAttempt('public', assessment, START),
  );
  return completeAttempt(attempt, assessment, END);
}

test('a new store restores the last school choice and answers after a same-tab reload', () => {
  const backend = fakeStorage();
  const first = createSessionStore(() => backend);
  const attempt = partial();
  assert.equal(first.saveAttempt(attempt, middle), true);
  assert.equal(first.saveGrade('public', 'middle'), true);

  const reloaded = createSessionStore(() => backend);
  assert.equal(reloaded.loadGrade('public'), 'middle');
  assert.deepEqual(reloaded.loadAttempt('public', middle), attempt);
  assert.equal(getResumeRoute(reloaded.loadAttempt('public', middle), middle), '#test/1');
  assert.equal(reloaded.available, true);
});

test('denied storage retains the current attempt in memory and exposes the reload limitation', () => {
  const denied = () => { throw new Error('Storage access denied'); };
  const store = createSessionStore(denied);
  const attempt = partial();
  assert.equal(store.loadAttempt('public', middle), null);
  assert.equal(store.available, false);
  assert.equal(store.saveAttempt(attempt, middle), false);
  assert.equal(store.saveGrade('public', 'middle'), false);
  assert.deepEqual(store.loadAttempt('public', middle), attempt);
  assert.equal(store.loadGrade('public'), 'middle');
  assert.equal(createSessionStore(denied).loadAttempt('public', middle), null);
});

test('a failed write after successful reads still preserves the newest answer in memory', () => {
  const backend = fakeStorage();
  backend.setItem(storageKey('public', middle), JSON.stringify(partial('public', middle, 1)));
  const store = createSessionStore(() => ({
    getItem: backend.getItem,
    setItem() { throw new Error('Quota exceeded'); },
  }));
  const saved = store.loadAttempt('public', middle);
  const updated = answerQuestion(saved, middle, middle.questions[0].id, 5);
  assert.equal(store.saveAttempt(updated, middle), false);
  assert.equal(store.available, false);
  assert.equal(store.loadAttempt('public', middle).answers[middle.questions[0].id], 5);
});

test('corrupt JSON and unknown school preferences recover without crashing', () => {
  const backend = fakeStorage();
  backend.setItem(storageKey('public', middle), '{broken json');
  backend.setItem('cfinder:active-grade:v2:public', 'unrecognized');
  const store = createSessionStore(() => backend);
  assert.equal(store.loadAttempt('public', middle), null);
  assert.equal(store.loadGrade('public'), null);
  assert.equal(store.available, true);
  const replacement = partial();
  assert.equal(store.saveAttempt(replacement, middle), true);
  assert.deepEqual(createSessionStore(() => backend).loadAttempt('public', middle), replacement);
});

test('switching schools or organization previews preserves each separate attempt', () => {
  const backend = fakeStorage();
  const store = createSessionStore(() => backend);
  const records = [partial('public', middle, 1), partial('public', high, 2), partial('sample', middle, 5)];
  store.saveAttempt(records[0], middle);
  store.saveAttempt(records[1], high);
  store.saveAttempt(records[2], middle);
  store.saveGrade('public', 'high');
  store.saveGrade('sample', 'middle');
  const reloaded = createSessionStore(() => backend);
  assert.deepEqual(reloaded.loadAttempt('public', middle), records[0]);
  assert.deepEqual(reloaded.loadAttempt('public', high), records[1]);
  assert.deepEqual(reloaded.loadAttempt('sample', middle), records[2]);
  assert.equal(reloaded.loadAttempt('sample', high), null);
  assert.equal(reloaded.loadGrade('public'), 'high');
  assert.equal(reloaded.loadGrade('sample'), 'middle');
});

test('changing a question-bank version never restores answers under the old version', () => {
  const backend = fakeStorage();
  const store = createSessionStore(() => backend);
  store.saveAttempt(partial(), middle);
  const nextVersion = { ...middle, version: 'demo-2' };
  assert.equal(store.loadAttempt('public', nextVersion), null);
  backend.setItem(storageKey('public', nextVersion), JSON.stringify(partial()));
  assert.equal(createSessionStore(() => backend).loadAttempt('public', nextVersion), null);
});

test('invalid direct hashes resolve safely while review edit links retain their context', () => {
  for (const hash of ['', '#', '#unknown', '#test/-1', '#test/1.5', '#test/NaN', '#test/9007199254740992', '#test/0/extra', '#<script>']) {
    assert.deepEqual(parseRoute(hash), { page: 'home' }, hash);
  }
  assert.deepEqual(parseRoute('#test/0'), { page: 'test', index: 0, fromReview: false });
  assert.deepEqual(parseRoute('#test/2?from=review'), { page: 'test', index: 2, fromReview: true });
  assert.deepEqual(parseRoute('#test/2?from=unknown'), { page: 'test', index: 2, fromReview: false });
  assert.deepEqual(parseRoute('#result'), { page: 'result' });
  assert.deepEqual(parseRoute('#institutions'), { page: 'institutions' });
});

test('assessment history links retain their school and review-edit context', () => {
  for (const grade of ['middle', 'high']) {
    for (const page of ['intro', 'review', 'result']) {
      assert.deepEqual(parseRoute(withGrade(`#${page}`, grade)), { page, grade });
    }
    const editLink = withGrade('#test/2?from=review&grade=unknown', grade);
    assert.deepEqual(parseRoute(editLink), { page: 'test', index: 2, fromReview: true, grade });
  }
  const middleHistory = withGrade('#test/0', 'middle');
  const highHistory = withGrade('#test/0', 'high');
  assert.notEqual(middleHistory, highHistory);
  assert.equal(parseRoute(middleHistory).grade, 'middle');
  assert.equal(parseRoute(highHistory).grade, 'high');
});

test('unknown school query values cannot select a school or affect non-assessment pages', () => {
  for (const value of ['', 'unknown', '__proto__', 'constructor', '%3Cscript%3E', 'middle%26grade%3Dhigh']) {
    assert.deepEqual(parseRoute(`#test/1?from=review&grade=${value}`), { page: 'test', index: 1, fromReview: true });
  }
  for (const page of ['home', 'report', 'institutions']) {
    const hash = `#${page}?grade=high`;
    assert.deepEqual(parseRoute(hash), { page });
    assert.equal(withGrade(hash, 'middle'), hash);
  }
  assert.throws(() => withGrade('#review', '__proto__'), /school grade/);
});

test('a restored completed demo exposes a response summary without diagnostic scores or recommendations', () => {
  const backend = fakeStorage();
  createSessionStore(() => backend).saveAttempt(completed(), middle);
  const attempt = createSessionStore(() => backend).loadAttempt('public', middle);
  const summary = getResultSummary(attempt, middle);
  assert.equal(getResumeRoute(attempt, middle), '#result');
  assert.equal(summary.status, 'demo-completed');
  assert.equal(summary.answeredCount, middle.questions.length);
  assert.equal(summary.completedAt, END);
  assert.equal(summary.scores, null);
  assert.equal(summary.careerType, null);
  assert.deepEqual(summary.recommendations, []);
  assert.equal(Object.isFrozen(summary), true);
});

test('the result boundary rejects incomplete, mismatched, and formal assessments', () => {
  assert.throws(() => getResultSummary(null, middle), /completed/);
  assert.throws(() => getResultSummary(partial(), middle), /completed/);
  assert.throws(() => getResultSummary({ ...partial(), status: 'completed', completedAt: END }, middle), /completed/);
  assert.throws(() => getResultSummary(completed(), high), /matching/);
  assert.throws(() => getResultSummary(completed(), { ...middle, version: 'demo-2' }), /matching/);
  assert.throws(() => getResultSummary(completed(), { ...middle, mode: 'formal' }), /approved server scoring provider/);
});

test('a completed flag cannot bypass missing, invalid, or out-of-order completion timestamps', () => {
  const attempt = completed();
  for (const completedAt of [null, undefined, 'invalid', '2026-11-22T23:59:59.000Z']) {
    assert.throws(() => getResultSummary({ ...attempt, completedAt }, middle), /completed/);
  }
});

test('only configured organization IDs can change branding and unknown query values fall back', () => {
  const publicTenant = resolveTenant('');
  assert.equal(publicTenant.id, 'public');
  assert.equal(resolveTenant('?org=sample').id, 'sample');
  assert.equal(resolveTenant('?org=sample').isPreview, true);
  for (const search of ['?org=', '?org=unknown', '?org=__proto__', '?org=constructor', '?org=%3Cscript%3E', '?org=sample%3Bcolor%3Ared']) {
    assert.equal(resolveTenant(search), publicTenant, search);
  }
  assert.equal(Object.isFrozen(publicTenant), true);
});
