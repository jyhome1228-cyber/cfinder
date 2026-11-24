/**
 * Non-diagnostic reflection helpers.
 * Only summarizes the answers the student selected. It does not score ability,
 * compare areas, rank careers, or infer official C-Finder/RIASEC types.
 */
export const REFLECTION_DOMAINS = Object.freeze([
  {id:'interest', label:'흥미', prompt:'내가 궁금한 활동은 무엇인가요?',
   activity:'관심이 가는 활동 하나를 골라 관련 영상이나 체험 사례를 찾아보세요.',
   question:'실제로 해 본다면 어떤 점이 가장 재미있을까요?'},
  {id:'aptitude', label:'적성', prompt:'내가 잘할 수 있다고 느끼는 일은 무엇인가요?',
   activity:'스스로 강점이라고 생각한 활동을 작은 과제로 직접 시도해 보세요.',
   question:'어떤 경험 때문에 그 활동에 자신이 있다고 느꼈나요?'},
  {id:'values', label:'가치관', prompt:'진로 선택에서 무엇을 중요하게 생각하나요?',
   activity:'중요하게 고른 기준을 가족이나 친구와 이야기해 보세요.',
   question:'선택해야 할 때 이 기준을 어떻게 지키고 싶나요?'}
]);

export function getReflectionSummary(attempt, assessment) {
  if (assessment.kind !== 'factor_exploration') return null;
  if (attempt?.status !== 'completed') throw new Error('Completed responses are required.');
  return REFLECTION_DOMAINS.map(domain => {
    const questions = assessment.questions.filter(question => question.domain === domain.id);
    const items = questions.map((question,index) => {
      const value = attempt.answers?.[question.id];
      if (!Number.isInteger(value) || value < 1 || value > 5) {
        throw new Error('Every question needs a valid response.');
      }
      return {id:question.id, name:question.factor || question.text, value, index};
    });
    const distribution = {
      low: items.filter(item => item.value <= 2).length,
      middle: items.filter(item => item.value === 3).length,
      high: items.filter(item => item.value >= 4).length
    };
    const highlighted = items.filter(item => item.value >= 4).sort((a,b)=>b.value-a.value||a.index-b.index).slice(0,4);
    return { ...domain, count:items.length, distribution, highlighted };
  });
}
