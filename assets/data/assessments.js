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
  middle: demoAssessment('middle', '중학생용', '좋아하는 활동과 진로에 대한 생각을 살펴봅니다.', [
    { id: 'M-DEMO-01', domain: 'interest', text: '관심이 생긴 활동을 더 알아보는 편이다.' },
    { id: 'M-DEMO-02', domain: 'aptitude', text: '새로운 활동을 배울 때 방법을 빠르게 익히는 편이다.' },
    { id: 'M-DEMO-03', domain: 'values', text: '앞으로 할 일을 고를 때 즐겁게 할 수 있는지를 중요하게 생각한다.' }
  ]),
  high: demoAssessment('high', '고등학생용', '관심 분야와 강점, 진로 선택 기준을 살펴봅니다.', [
    { id: 'H-DEMO-01', domain: 'interest', text: '관심 있는 직업이나 전공에 관한 정보를 스스로 찾아본다.' },
    { id: 'H-DEMO-02', domain: 'aptitude', text: '복잡한 과제를 해결할 때 필요한 정보를 체계적으로 정리할 수 있다.' },
    { id: 'H-DEMO-03', domain: 'values', text: '진로를 선택할 때 일의 안정성을 중요하게 생각한다.' }
  ]),
  university: demoAssessment('university', '대학생용', '관심 직무와 강점, 직업 선택 기준을 살펴봅니다.', [
    { id: 'U-DEMO-01', domain: 'interest', text: '관심 있는 직무에 관한 정보를 찾아보는 편이다.' },
    { id: 'U-DEMO-02', domain: 'aptitude', text: '팀 프로젝트에서 복잡한 정보를 이해하기 쉽게 정리할 수 있다.' },
    { id: 'U-DEMO-03', domain: 'values', text: '직업을 선택할 때 일과 생활의 균형을 중요하게 생각한다.' }
  ])
});
