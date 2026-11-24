import { factorQuestions } from './factor-content.js';
// UI demonstration items only. These are not the official C-Finder question bank.
export const DOMAINS = Object.freeze({
  interest: { label: '흥미', question: '어떤 일에 마음이 가나요?', description: '내가 좋아하고 더 알아보고 싶은 활동을 살펴봐요.' },
  aptitude: { label: '적성', question: '어떤 일을 잘할 수 있나요?', description: '일을 해내는 나의 방식과 강점을 돌아봐요.' },
  values: { label: '가치관', question: '무엇을 중요하게 여기나요?', description: '진로를 선택할 때 나에게 중요한 기준을 찾아봐요.' }
});

export const RESPONSE_OPTIONS = Object.freeze([
  { value: 1, label: '전혀 그렇지 않다' },
  { value: 2, label: '그렇지 않은 편이다' },
  { value: 3, label: '보통이다' },
  { value: 4, label: '그런 편이다' },
  { value: 5, label: '매우 그렇다' }
].map(Object.freeze));

function demoAssessment(grade, label, description, questions) {
  return Object.freeze({
    id: `cfinder-${grade}-demo`,
    version: 'demo-2026-11-24-v2',
    mode: 'demo',
    grade,
    label,
    description,
    options: RESPONSE_OPTIONS,
    questions: Object.freeze(questions.map(Object.freeze))
  });
}

export const ASSESSMENTS = Object.freeze({
  middle: Object.freeze({
    ...demoAssessment('middle', '중학생용', '흥미·적성·가치관 49개 요인을 살펴보는 비공식 자기탐색 설문입니다.', factorQuestions('middle')),
    id: 'cfinder-middle-factor-exploration',
    version: 'factor-content-2026-11-24-v1',
    kind: 'factor_exploration',
    source: 'C-finder_결과지 데이터.xlsx',
    formal: false
  }),
  high: Object.freeze({
    ...demoAssessment('high', '고등학생용', '흥미·적성·가치관 49개 요인을 살펴보는 비공식 자기탐색 설문입니다.', factorQuestions('high')),
    id: 'cfinder-high-factor-exploration',
    version: 'factor-content-2026-11-24-v1',
    kind: 'factor_exploration',
    source: 'C-finder_결과지 데이터.xlsx',
    formal: false
  }),
  university: demoAssessment('university', '대학생용', '관심 직무와 강점, 직업 선택 기준을 살펴봅니다.', [
    { id: 'U-DEMO-01', domain: 'interest', text: '관심 있는 직무에 관한 정보를 찾아보는 편이다.' },
    { id: 'U-DEMO-02', domain: 'aptitude', text: '팀 프로젝트에서 복잡한 정보를 이해하기 쉽게 정리할 수 있다.' },
    { id: 'U-DEMO-03', domain: 'values', text: '직업을 선택할 때 일과 생활의 균형을 중요하게 생각한다.' }
  ])
});
