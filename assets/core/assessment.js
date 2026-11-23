/**
 * Assessment attempts only. This module does not score or interpret answers.
 * All updates return new objects; completed attempts are read-only.
 */
const SCHEMA_VERSION = 2;
const GRADES = new Set(['middle', 'high']);
const STATES = new Set(['in_progress', 'completed']);

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isIdentifier(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isTimestamp(value) {
  return typeof value === 'string'
    && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value)
    && Number.isFinite(Date.parse(value));
}

function assertAssessment(assessment) {
  if (!isRecord(assessment) || !isIdentifier(assessment.id)
      || !isIdentifier(assessment.version) || !GRADES.has(assessment.grade)
      || !Array.isArray(assessment.questions) || assessment.questions.length === 0
      || !Array.isArray(assessment.options) || assessment.options.length === 0) {
    throw new Error('A valid, versioned assessment is required.');
  }
  const ids = assessment.questions.map(question => question?.id);
  const values = assessment.options.map(option => option?.value);
  if (ids.some(id => !isIdentifier(id)) || new Set(ids).size !== ids.length
      || values.some(value => !Number.isInteger(value))
      || new Set(values).size !== values.length) {
    throw new Error('Question IDs and integer option values must be unique.');
  }
}

function assertTenant(tenantId) {
  if (!isIdentifier(tenantId)) throw new Error('A tenant ID is required.');
}

function assertIdentity(attempt, assessment) {
  assertAssessment(assessment);
  if (!isRecord(attempt) || attempt.schemaVersion !== SCHEMA_VERSION
      || attempt.assessmentId !== assessment.id
      || attempt.assessmentVersion !== assessment.version
      || attempt.grade !== assessment.grade || !isIdentifier(attempt.tenantId)
      || !STATES.has(attempt.status) || !isRecord(attempt.answers)
      || !isTimestamp(attempt.startedAt)) {
    throw new Error('The attempt does not match this assessment.');
  }
}

function assertInProgress(attempt) {
  if (attempt.status !== 'in_progress') {
    throw new Error('A completed attempt is read-only. Start a new attempt to answer again.');
  }
}

function validAnswer(value, assessment) {
  return Number.isInteger(value) && assessment.options.some(option => option.value === value);
}

function hasAnswer(attempt, assessment, question) {
  return Object.hasOwn(attempt.answers, question.id)
    && validAnswer(attempt.answers[question.id], assessment);
}

function clampIndex(index, assessment) {
  return Math.max(0, Math.min(index, assessment.questions.length - 1));
}

export function storageKey(tenantId, assessment) {
  assertTenant(tenantId);
  assertAssessment(assessment);
  const scope = [tenantId, assessment.id, assessment.version, assessment.grade]
    .map(value => encodeURIComponent(value)).join(':');
  return `cfinder:attempt:v${SCHEMA_VERSION}:${scope}`;
}

export function createAttempt(tenantId, assessment, now = new Date().toISOString()) {
  assertTenant(tenantId);
  assertAssessment(assessment);
  if (!isTimestamp(now)) throw new Error('The start time must be a valid UTC timestamp.');
  return {
    schemaVersion: SCHEMA_VERSION,
    tenantId,
    assessmentId: assessment.id,
    assessmentVersion: assessment.version,
    grade: assessment.grade,
    status: 'in_progress',
    answers: {},
    currentIndex: 0,
    startedAt: now,
    completedAt: null,
  };
}

/** Restore parsed storage data. Unknown fields and invalid responses are discarded. */
export function restoreAttempt(raw, tenantId, assessment) {
  assertTenant(tenantId);
  assertAssessment(assessment);
  if (!isRecord(raw) || raw.schemaVersion !== SCHEMA_VERSION || raw.tenantId !== tenantId
      || raw.assessmentId !== assessment.id || raw.assessmentVersion !== assessment.version
      || raw.grade !== assessment.grade || !STATES.has(raw.status) || !isTimestamp(raw.startedAt)) {
    return null;
  }
  const source = isRecord(raw.answers) ? raw.answers : {};
  const answers = Object.fromEntries(assessment.questions
    .filter(question => Object.hasOwn(source, question.id) && validAnswer(source[question.id], assessment))
    .map(question => [question.id, source[question.id]]));
  const completed = raw.status === 'completed'
    && Object.keys(answers).length === assessment.questions.length
    && isTimestamp(raw.completedAt)
    && Date.parse(raw.completedAt) >= Date.parse(raw.startedAt);
  return {
    ...createAttempt(tenantId, assessment, raw.startedAt),
    answers,
    currentIndex: Number.isInteger(raw.currentIndex) ? clampIndex(raw.currentIndex, assessment) : 0,
    status: completed ? 'completed' : 'in_progress',
    completedAt: completed ? raw.completedAt : null,
  };
}

export function answerQuestion(attempt, assessment, questionId, value) {
  assertIdentity(attempt, assessment);
  assertInProgress(attempt);
  const index = assessment.questions.findIndex(question => question.id === questionId);
  if (index === -1) throw new Error('The question does not belong to this assessment.');
  if (!validAnswer(value, assessment)) throw new Error('Select an allowed response value.');
  return { ...attempt, answers: { ...attempt.answers, [questionId]: value }, currentIndex: index };
}

export function visitQuestion(attempt, assessment, index) {
  assertIdentity(attempt, assessment);
  assertInProgress(attempt);
  if (!Number.isInteger(index)) throw new Error('The question index must be an integer.');
  return { ...attempt, answers: { ...attempt.answers }, currentIndex: clampIndex(index, assessment) };
}

export function countAnswered(attempt, assessment) {
  assertIdentity(attempt, assessment);
  return assessment.questions.filter(question => hasAnswer(attempt, assessment, question)).length;
}

export function isComplete(attempt, assessment) {
  return countAnswered(attempt, assessment) === assessment.questions.length;
}

export function completeAttempt(attempt, assessment, now = new Date().toISOString()) {
  assertIdentity(attempt, assessment);
  assertInProgress(attempt);
  if (!isComplete(attempt, assessment)) throw new Error('Answer every question before completing the attempt.');
  if (!isTimestamp(now) || Date.parse(now) < Date.parse(attempt.startedAt)) {
    throw new Error('The completion time must be a valid UTC timestamp at or after the start time.');
  }
  return { ...attempt, answers: { ...attempt.answers }, status: 'completed', completedAt: now };
}

export function getResumeRoute(attempt, assessment) {
  assertIdentity(attempt, assessment);
  const complete = isComplete(attempt, assessment);
  if (attempt.status === 'completed' && complete && isTimestamp(attempt.completedAt)) return '#result';
  if (complete) return '#review';
  const index = assessment.questions.findIndex(question => !hasAnswer(attempt, assessment, question));
  return `#test/${index}`;
}
