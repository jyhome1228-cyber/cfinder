import { ASSESSMENTS } from '../data/assessments.js';
import { escapeHtml as e } from './html.js';

const PERSPECTIVES = [
  { id: 'interest', label: '흥미', heading: '어떤 일에 마음이 가나요?',
    description: '시간 가는 줄 모르고 몰입하는 활동, 자꾸 더 알아보고 싶은 분야. 나의 관심이 어디를 향하는지 살펴봐요.',
    prompts: ['자주 찾아보는 주제', '즐겁게 참여하는 활동', '새롭게 배워보고 싶은 일'],
    keyword: '좋아하는 일', caption: '관심이 향하는 곳' },
  { id: 'aptitude', label: '적성', heading: '어떤 일을 잘할 수 있나요?',
    description: '문제를 풀어가는 방식, 새로운 일을 배울 때의 모습. 내가 강점을 발휘할 수 있는 일을 돌아봐요.',
    prompts: ['자신 있게 해내는 일', '문제를 해결하는 방식', '더 키워보고 싶은 강점'],
    keyword: '잘할 수 있는 일', caption: '가능성이 자라는 곳' },
  { id: 'values', label: '가치관', heading: '무엇을 중요하게 여기나요?',
    description: '어떤 일을 하며 보람을 느끼는지, 어떤 환경에서 일하고 싶은지. 진로를 선택할 때 나에게 중요한 기준을 찾아봐요.',
    prompts: ['보람을 느끼는 순간', '일하고 싶은 환경', '선택할 때 지키고 싶은 기준'],
    keyword: '중요하게 여기는 것', caption: '내가 지키고 싶은 기준' }
];

// Editorial motifs describe the domains; they never represent diagnostic scores.
export function homeMotif(id, className = '') {
  const shapes = {
    interest: `${Array.from({ length: 10 }, (_, i) => `<ellipse cx="100" cy="62" rx="19" ry="53" transform="rotate(${i * 36} 100 100)" />`).join('')}<circle cx="100" cy="100" r="24" class="motif-cutout" />`,
    aptitude: '<path d="M22 105h44V61h44V17h68v68h-44v44H90v44H22Z"/><path d="M22 105h44V61h44V17M66 105h44V61h68M110 105v24H90v44M134 85h44" class="motif-seam"/>',
    values: '<path d="M100 14 186 100 100 186 14 100Z"/><path d="m100 46 54 54-54 54-54-54Z" class="motif-cutout"/><path d="m100 75 25 25-25 25-25-25Z"/>'
  };
  return `<svg class="home-motif ${className}" viewBox="0 0 200 200" aria-hidden="true" focusable="false">${shapes[id] || shapes.interest}</svg>`;
}

function discoveryVisual() {
  return `<div class="home-discovery" role="img" aria-label="흥미는 펼쳐지는 꽃, 적성은 쌓아가는 블록, 가치관은 중심을 가진 마름모로 표현한 C-Finder의 세 가지 관점">
    <div class="home-discovery-stage" aria-hidden="true">
      <div class="home-art-card home-art-interest"><span class="home-art-label">흥미</span><div class="home-art-caption"><strong>좋아하는 일</strong></div>${homeMotif('interest')}</div>
      <div class="home-art-card home-art-aptitude"><span class="home-art-label">적성</span><div class="home-art-caption"><strong>잘할 수 있는 일</strong></div>${homeMotif('aptitude')}</div>
      <div class="home-art-card home-art-values"><div><span class="home-art-label">가치관</span><div class="home-art-caption"><strong>중요하게 여기는 것</strong></div></div>${homeMotif('values')}</div>
    </div>
  </div>`;
}

function reportVisual() {
  return `<div class="home-report-visual"><div class="home-report-paper" aria-label="개인 점수가 없는 진로 리포트 구성 예시">
    <div class="home-report-paper-header"><strong>C-Finder</strong></div>
    <div class="home-report-title"><div><h3>나의 진로 리포트</h3></div>${homeMotif('interest')}</div>
    <div class="home-report-rows">${PERSPECTIVES.map(item => `<div><span class="home-report-symbol symbol-${item.id}">${homeMotif(item.id)}</span><div><span>${item.label}</span><strong>${item.keyword}</strong></div><span class="home-report-row-dot" aria-hidden="true"></span></div>`).join('')}</div>
    <div class="home-report-next"><strong>진로 유형 · 추천 직업</strong></div>
    </div></div>`;
}

export function renderHome({ tenant, storageAvailable, pathname = globalThis.location?.pathname || '/' }) {
  const organizationUrl = `${pathname}?org=sample#home`;
  const publicUrl = `${pathname}#home`;
  return `<section class="home-hero" aria-labelledby="page-heading"><div class="home-hero-copy">
    
    <h1 id="page-heading" tabindex="-1">나의 진로,<br><span>C-Finder로 알아보기</span></h1>
    <p class="home-lead">흥미·적성·가치관을 함께 살펴보는 진로검사.</p>
    <div class="home-start"><a class="btn btn-primary home-start-button" href="#start">진단 시작하기</a>
    </div>
    ${storageAvailable === false ? '<p class="home-storage-note" role="status">현재 브라우저에서는 임시 저장이 제한돼요. 새로고침하면 응답이 사라질 수 있어요.</p>' : ''}
    </div>${discoveryVisual()}</section>

    <div class="home-service-strip" aria-label="C-Finder 이용 안내"><p><strong>검사 대상</strong></p><ul><li>중학생</li><li>고등학생</li><li>대학생</li></ul></div>

    <section class="home-perspectives" aria-labelledby="home-perspectives-heading"><div class="home-section-heading"><div><h2 id="home-perspectives-heading">흥미 · 적성 · 가치관</h2></div></div>
    <div class="home-domain-tabs" role="tablist" aria-label="검사 영역">${PERSPECTIVES.map((item, i) => `<button id="home-tab-${item.id}" type="button" role="tab" aria-label="${item.label}" aria-selected="${i === 0}" aria-controls="home-panel-${item.id}" tabindex="${i === 0 ? '0' : '-1'}" data-action="home-domain" data-domain="${item.id}"><span>${item.label}</span></button>`).join('')}</div>
    <div class="home-domain-content">${PERSPECTIVES.map((item, i) => `<div class="home-domain-panel" id="home-panel-${item.id}" role="tabpanel" aria-labelledby="home-tab-${item.id}" tabindex="0" ${i ? 'hidden' : ''}><div class="home-domain-art domain-${item.id}">${homeMotif(item.id)}</div><div class="home-domain-copy"><h3>${item.heading}</h3><p>${item.description}</p></div></div>`).join('')}</div></section>

    <section class="home-report" aria-labelledby="home-report-heading"><div class="home-report-copy"><h2 id="home-report-heading">진로검사 결과지</h2><p class="home-report-description">흥미·적성·가치관 분석과 추천 직업을 확인합니다.</p>
    <dl class="home-report-features"><div><dt>통합 진로 유형</dt></div><div><dt>영역별 이해</dt></div><div><dt>추천 직업</dt></div></dl><a class="btn btn-primary home-button" href="#report">결과지 미리보기</a></div>${reportVisual()}</section>

    <section class="home-faq" aria-labelledby="home-faq-heading"><div class="home-faq-intro"><h2 id="home-faq-heading">자주 묻는 질문</h2></div><div class="home-faq-list">
    <details name="home-faq"><summary>누가 이용할 수 있나요?<span class="home-disclosure" aria-hidden="true"></span></summary><p>중학생용·고등학생용·대학생용 화면 체험이 가능합니다. 정식 검사는 중·고등학생용으로 기획됐습니다.</p></details>
    <details name="home-faq"><summary>검사에는 정답이 있나요?<span class="home-disclosure" aria-hidden="true"></span></summary><p>정답은 없습니다. 현재 자신에게 가까운 답을 선택하세요.</p></details>
    <details name="home-faq"><summary>체험을 마치면 어떤 내용을 볼 수 있나요?<span class="home-disclosure" aria-hidden="true"></span></summary><p>3문항 체험으로 응답·수정·완료 과정을 확인할 수 있습니다. 개인 점수는 산출되지 않습니다.</p></details>
    <details name="home-faq"><summary>중간에 멈췄다가 이어서 할 수 있나요?<span class="home-disclosure" aria-hidden="true"></span></summary><p>같은 탭에서는 이어서 할 수 있습니다. 탭을 닫거나 다른 기기에서는 복원되지 않을 수 있습니다.</p></details></div></section>

    <section class="home-institutions" aria-labelledby="home-institutions-heading"><div class="home-institution-copy"><h2 id="home-institutions-heading">기관용 C-Finder</h2><p>기관 이름·색상·안내 문구를 적용할 수 있습니다.</p><div class="home-institution-actions"><a class="btn home-button-white" href="#institutions">기관 도입 살펴보기</a><a class="home-institution-link" href="${e(tenant.isPreview ? publicUrl : organizationUrl)}">${tenant.isPreview ? 'C-Finder 기본 화면 보기' : '기관용 화면 체험하기'}</a></div></div>
    <div class="home-organization-preview" aria-label="기관 이름과 색상을 적용한 시작 화면 구성 예시"><div class="home-org-header"><span>우리학교 진로센터</span></div><div class="home-org-content"><div><strong>기관별 검사 화면</strong></div>${homeMotif('interest')}</div></div></section>`;
}

export function selectHomeDomain(root, domain, { focus = false } = {}) {
  if (!PERSPECTIVES.some(item => item.id === domain)) return;
  for (const button of root.querySelectorAll('[data-action="home-domain"]')) {
    const selected = button.dataset.domain === domain;
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
    if (selected && focus) button.focus();
  }
  for (const panel of root.querySelectorAll('.home-domain-panel')) panel.hidden = panel.id !== `home-panel-${domain}`;
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
