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
    version: 'demo-1',
    mode: 'demo',
    grade,
    label,
    description,
    options: RESPONSE_OPTIONS,
    questions: Object.freeze(questions.map(Object.freeze))
  });
}

export const ASSESSMENTS = Object.freeze({
  middle: demoAssessment('middle', '중학생용', '새로운 관심사와 나의 가능성을 발견해요.', [
    { id: 'M-DEMO-01', domain: 'interest', text: '내가 좋아하는 활동에 대해서 더 알아보고 싶다.' },
    { id: 'M-DEMO-02', domain: 'aptitude', text: '새로운 활동에 도전할 때 내가 잘할 수 있는 방법을 찾아본다.' },
    { id: 'M-DEMO-03', domain: 'values', text: '내가 앞으로 하는 일이 나에게 왜 중요한지 생각해 본다.' }
  ]),
  high: demoAssessment('high', '고등학생용', '나의 강점과 진로 선택의 기준을 알아봐요.', [
    { id: 'H-DEMO-01', domain: 'interest', text: '관심 있는 분야에 대해 스스로 자료를 찾아 탐색하는 편이다.' },
    { id: 'H-DEMO-02', domain: 'aptitude', text: '새로운 과제를 해결할 때 자신의 강점을 활용하려고 한다.' },
    { id: 'H-DEMO-03', domain: 'values', text: '진로를 선택할 때 내가 중요하게 생각하는 기준이 무엇인지 고민한다.' }
  ]),
  university: demoAssessment('university', '대학생용', '전공 경험과 관심 직무, 일에서 중요하게 생각하는 기준을 돌아봐요.', [
    { id: 'U-DEMO-01', domain: 'interest', text: '전공이나 수업 밖에서도 관심 있는 직무에 대해 찾아보는 편이다.' },
    { id: 'U-DEMO-02', domain: 'aptitude', text: '프로젝트를 수행하면서 내가 강점을 발휘하는 역할을 알아가고 있다.' },
    { id: 'U-DEMO-03', domain: 'values', text: '취업이나 진로를 고민할 때 나에게 중요한 일의 조건을 생각해 본다.' }
  ])
});
