import { ASSESSMENTS } from '../data/assessments.js';
import { countAnswered } from '../core/assessment.js';
import { escapeHtml as e } from './html.js';

const PERSPECTIVES = [
  {
    id: 'interest', label: '흥미', heading: '어떤 일에 마음이 가나요?',
    description: '시간 가는 줄 모르고 몰입하는 활동, 자꾸 더 알아보고 싶은 분야. 나의 관심이 어디를 향하는지 살펴봐요.',
    prompts: ['자주 찾아보는 주제', '즐겁게 참여하는 활동', '새롭게 배워보고 싶은 일'],
    keyword: '좋아하는 것'
  },
  {
    id: 'aptitude', label: '적성', heading: '어떤 일을 잘할 수 있나요?',
    description: '문제를 풀어가는 방식, 새로운 일을 배울 때의 모습. 내가 강점을 발휘할 수 있는 일을 돌아봐요.',
    prompts: ['자신 있게 해내는 일', '문제를 해결하는 방식', '더 키워보고 싶은 강점'],
    keyword: '잘할 수 있는 것'
  },
  {
    id: 'values', label: '가치관', heading: '무엇을 중요하게 여기나요?',
    description: '어떤 일을 하며 보람을 느끼는지, 어떤 환경에서 일하고 싶은지. 진로를 선택할 때 나에게 중요한 기준을 찾아봐요.',
    prompts: ['보람을 느끼는 순간', '일하고 싶은 환경', '선택할 때 지키고 싶은 기준'],
    keyword: '중요한 것'
  }
];

function gradeChoice(assessment, attempt) {
  const count = attempt ? countAnswered(attempt, assessment) : 0;
  const completed = attempt?.status === 'completed';
  const action = completed ? '완료한 체험 보기' : count ? '이어서 하기' : '체험 시작하기';
  const status = completed ? '응답 완료' : count ? `${count}문항 응답 중` : '';
  return `<button class="home-grade-choice" type="button" data-action="select-grade" data-grade="${assessment.grade}" aria-label="${e(assessment.label)} ${action}">
    <span class="home-grade-name">${e(assessment.label)}</span><span class="home-grade-action">${action}</span>
    ${status ? `<span class="home-grade-status">${status}</span>` : ''}
  </button>`;
}

function profileVisual() {
  return `<div class="home-profile-visual">
    <div class="home-visual-heading"><span>C-Finder</span><span>세 가지 관점</span></div>
    <svg class="home-profile-diagram" viewBox="0 0 560 400" role="img" aria-labelledby="profile-visual-title profile-visual-desc">
      <title id="profile-visual-title">흥미, 적성, 가치관으로 이해하는 나</title>
      <desc id="profile-visual-desc">좋아하는 것, 잘할 수 있는 것, 중요하게 여기는 것의 세 원이 겹치는 가운데 내가 있습니다. 검사 점수를 나타내는 그림은 아닙니다.</desc>
      <circle class="home-orbit orbit-interest" cx="213" cy="154" r="112" />
      <circle class="home-orbit orbit-aptitude" cx="347" cy="154" r="112" />
      <circle class="home-orbit orbit-values" cx="280" cy="267" r="112" />
      <text class="orbit-title" x="182" y="147" text-anchor="middle">흥미</text>
      <text class="orbit-title" x="378" y="147" text-anchor="middle">적성</text>
      <text class="orbit-title" x="280" y="322" text-anchor="middle">가치관</text>
      <circle class="home-self-circle" cx="280" cy="205" r="36" />
      <text class="home-self-label" x="280" y="214" text-anchor="middle">나</text>
    </svg>
    <p class="home-visual-caption">여러 관점에서 살펴볼수록, 나의 모습이 선명해져요.</p>
  </div>`;
}

function reportVisual() {
  return `<div class="home-report-visual" aria-label="개인 점수 없는 결과지 구성 예시">
    <div class="home-report-paper"><div class="home-report-paper-header"><span>C-Finder</span><span>구성 미리보기</span></div>
      <h3>나의 진로 프로필</h3><p class="home-report-intro">나를 이해하는 세 가지 단서</p>
      <div class="home-report-rows">
        <div><span>흥미</span><strong>나의 관심 분야</strong></div>
        <div><span>적성</span><strong>내가 발휘할 수 있는 강점</strong></div>
        <div><span>가치관</span><strong>나에게 중요한 선택의 기준</strong></div>
      </div>
      <div class="home-report-next"><strong>다음으로 탐색할 것</strong><p>관심 분야와 직업, 직접 해볼 활동</p></div>
      <p class="home-report-paper-footer">점수와 유형이 없는 화면 구성 예시입니다.</p>
    </div>
  </div>`;
}

export function renderHome({ tenant, attempts, storageAvailable, pathname = globalThis.location?.pathname || '/' }) {
  const organizationUrl = `${pathname}?org=sample#home`;
  const publicUrl = `${pathname}#home`;
  return `<section class="home-hero" aria-labelledby="page-heading">
    <div class="home-hero-copy"><p class="home-eyebrow">${e(tenant.welcome)}</p>
      <h1 id="page-heading" tabindex="-1">나를 알아가는 시간,<br>진로를 찾는 시작.</h1>
      <p class="home-lead">흥미, 적성, 가치관을 함께 살펴보는<br>중·고등학생용 진로검사, C-Finder.</p>
      <div class="home-start" role="group" aria-labelledby="home-start-heading"><h2 id="home-start-heading">나에게 맞는 검사를 선택해 주세요.</h2>
        <div class="home-grade-options">${Object.values(ASSESSMENTS).map(assessment => gradeChoice(assessment, attempts[assessment.grade])).join('')}</div>
      </div>
      <p class="home-demo-note">각 ${ASSESSMENTS.middle.questions.length}문항의 체험판이에요.<br>개인 점수나 진로 유형은 제공하지 않아요.</p>
      ${storageAvailable === false ? '<p class="home-storage-note" role="status">현재 브라우저에서는 임시 저장이 제한돼요. 새로고침하면 응답이 사라질 수 있어요.</p>' : ''}
      <a class="home-text-link" href="#report">결과지 먼저 살펴보기</a>
    </div>
    ${profileVisual()}
  </section>

  <section class="home-perspectives" aria-labelledby="home-perspectives-heading">
    <div class="home-section-intro"><p class="home-eyebrow">C-Finder가 살펴보는 것</p><h2 id="home-perspectives-heading">나의 진로를 생각하는<br> 세 가지 관점.</h2><p>좋아하는 일과 나의 강점,<br>그리고 선택의 기준을 함께 알아봐요.</p>
      <div class="home-domain-tabs" role="tablist" aria-label="검사 영역">${PERSPECTIVES.map((item, i) => `<button id="home-tab-${item.id}" type="button" role="tab" aria-selected="${i === 0}" aria-controls="home-panel-${item.id}" tabindex="${i === 0 ? '0' : '-1'}" data-action="home-domain" data-domain="${item.id}">${item.label}</button>`).join('')}</div>
    </div>
    <div class="home-domain-content">${PERSPECTIVES.map((item, i) => `<div class="home-domain-panel" id="home-panel-${item.id}" role="tabpanel" aria-labelledby="home-tab-${item.id}" tabindex="0" ${i ? 'hidden' : ''}>
      <span class="home-domain-keyword">${item.keyword}</span><h3>${item.heading}</h3><p>${item.description}</p>
      <div class="home-reflection"><strong>이런 나를 떠올려 보세요.</strong><ul>${item.prompts.map(prompt => `<li>${prompt}</li>`).join('')}</ul></div>
    </div>`).join('')}</div>
  </section>

  <section class="home-report" aria-labelledby="home-report-heading">
    ${reportVisual()}
    <div class="home-report-copy"><p class="home-eyebrow">검사 이후의 이야기</p><h2 id="home-report-heading">나의 여러 모습을 읽고,<br>다음 경험을 생각해요.</h2><p class="home-report-description">진로 프로필부터 영역별 해석, 다음 탐색까지.<br> 결과지에 어떤 내용이 담기는지 먼저 살펴보세요.</p>
      <dl class="home-report-features"><div><dt>나의 진로 프로필</dt><dd>나를 설명하는 특성과 핵심 키워드</dd></div><div><dt>영역별 이해</dt><dd>흥미, 적성, 가치관을 함께 읽는 해석</dd></div><div><dt>다음 탐색</dt><dd>관심 분야와 직업, 활동으로 이어지는 단서</dd></div></dl>
      <a class="btn btn-outline home-button" href="#report">결과지 구성 보기</a>
    </div>
  </section>

  <section class="home-faq" aria-labelledby="home-faq-heading"><div class="home-section-intro"><p class="home-eyebrow">시작하기 전에</p><h2 id="home-faq-heading">궁금한 점이 있나요?</h2><p>검사를 앞두고 알아두면 좋은 내용이에요.</p></div>
    <div class="home-faq-list">
      <details><summary>누가 이용할 수 있나요?<span class="home-disclosure" aria-hidden="true"></span></summary><p>중·고등학생을 위한 진로검사예요. 현재 학교급에 맞는 검사를 선택해 주세요.</p></details>
      <details><summary>검사에는 정답이 있나요?<span class="home-disclosure" aria-hidden="true"></span></summary><p>정답이 있는 시험이 아니에요. 평소의 내 모습과 가장 가까운 답을 선택해 주세요.</p></details>
      <details><summary>체험을 마치면 진로 유형이 나오나요?<span class="home-disclosure" aria-hidden="true"></span></summary><p>현재 체험에서는 문항 응답과 검토 과정을 확인할 수 있어요. 개인 점수나 진로 유형은 제공하지 않으며, 결과지 구성은 별도로 미리볼 수 있어요.</p></details>
      <details><summary>중간에 멈췄다가 이어서 할 수 있나요?<span class="home-disclosure" aria-hidden="true"></span></summary><p>브라우저가 임시 저장을 허용하면 같은 탭에서 새로고침하거나 처음 화면으로 돌아와도 이어서 할 수 있어요. 탭을 닫으면 기록이 사라질 수 있고, 다른 기기로 응답이 공유되지는 않아요.</p></details>
    </div>
  </section>

  <section class="home-institutions" aria-labelledby="home-institutions-heading"><div><p class="home-eyebrow">학교와 교육기관을 위한 C-Finder</p><h2 id="home-institutions-heading">우리 기관의 이름으로,<br>학생의 진로 탐색을 함께.</h2><p>같은 검사 경험에 기관의 이름과 색상,<br> 학생에게 전하는 안내 문구를 담을 수 있어요.</p></div><div class="home-institution-actions"><a class="btn home-button home-button-white" href="#institutions">기관 도입 살펴보기</a><a class="home-institution-link" href="${e(tenant.isPreview ? publicUrl : organizationUrl)}">${tenant.isPreview ? 'C-Finder 기본 화면 보기' : '기관용 화면 예시 보기'}</a></div></section>`;
}

export function selectHomeDomain(root, domain, { focus = false } = {}) {
  if (!PERSPECTIVES.some(item => item.id === domain)) return;
  for (const button of root.querySelectorAll('[data-action="home-domain"]')) {
    const selected = button.dataset.domain === domain;
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
    if (selected && focus) button.focus();
  }
  for (const panel of root.querySelectorAll('.home-domain-panel')) {
    panel.hidden = panel.id !== `home-panel-${domain}`;
  }
}

export function handleHomeTabKey(event, root) {
  const tab = event.target.closest('[data-action="home-domain"]');
  if (!tab) return;
  const index = PERSPECTIVES.findIndex(item => item.id === tab.dataset.domain);
  let next;
  if (event.key === 'ArrowRight') next = (index + 1) % PERSPECTIVES.length;
  else if (event.key === 'ArrowLeft') next = (index + PERSPECTIVES.length - 1) % PERSPECTIVES.length;
  else if (event.key === 'Home') next = 0;
  else if (event.key === 'End') next = PERSPECTIVES.length - 1;
  else return;
  event.preventDefault();
  selectHomeDomain(root, PERSPECTIVES[next].id, { focus: true });
}
