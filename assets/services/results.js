import { countAnswered, restoreAttempt } from '../core/assessment.js';

// Replace this boundary with a server API after approved scoring rules exist.
// Never infer a career type or fabricate a score from demonstration answers.
export function getResultSummary(attempt, assessment) {
  const validated = attempt && restoreAttempt(attempt, attempt.tenantId, assessment);
  if (!validated || validated.status !== 'completed') {
    throw new Error('A completed, matching assessment is required.');
  }
  if (assessment.mode !== 'demo') {
    throw new Error('An approved server scoring provider is required for formal assessments.');
  }
  return Object.freeze({
    status: 'demo-completed',
    assessmentId: assessment.id,
    assessmentVersion: assessment.version,
    answeredCount: countAnswered(validated, assessment),
    completedAt: validated.completedAt,
    scores: null,
    careerType: null,
    recommendations: []
  });
}
