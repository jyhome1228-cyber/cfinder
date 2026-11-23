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
      <div class="home-art-card home-art-interest"><span class="home-art-label">흥미</span><div class="home-art-caption"><strong>좋아하는 일</strong><span>관심이 향하는 곳</span></div>${homeMotif('interest')}</div>
      <div class="home-art-card home-art-aptitude"><span class="home-art-label">적성</span><div class="home-art-caption"><strong>잘할 수 있는 일</strong><span>가능성이 자라는 곳</span></div>${homeMotif('aptitude')}</div>
      <div class="home-art-card home-art-values"><div><span class="home-art-label">가치관</span><div class="home-art-caption"><strong>중요하게 여기는 것</strong><span>나의 선택을 만드는 기준</span></div></div>${homeMotif('values')}</div>
    </div><p class="home-art-footer" aria-hidden="true">나를 구성하는 서로 다른 가능성</p>
  </div>`;
}

function reportVisual() {
  return `<div class="home-report-visual"><div class="home-report-paper" aria-label="개인 점수가 없는 진로 리포트 구성 예시">
    <div class="home-report-paper-header"><strong>C-Finder</strong><span>결과지 미리보기</span></div>
    <div class="home-report-title"><div><p>나를 이해하는 세 가지 단서</p><h3>나의 진로 리포트</h3></div>${homeMotif('interest')}</div>
    <div class="home-report-rows">${PERSPECTIVES.map(item => `<div><span class="home-report-symbol symbol-${item.id}">${homeMotif(item.id)}</span><div><span>${item.label}</span><strong>${item.keyword}</strong></div><span class="home-report-row-dot" aria-hidden="true"></span></div>`).join('')}</div>
    <div class="home-report-next"><strong>발견한 나를, 다음 경험으로.</strong><p>관심 분야 · 직업 탐색 · 직접 해볼 활동</p></div>
    </div><p class="home-report-caption">개인 결과가 아닌 결과지 구성 예시입니다.</p></div>`;
}

export function renderHome({ tenant, storageAvailable, pathname = globalThis.location?.pathname || '/' }) {
  const organizationUrl = `${pathname}?org=sample#home`;
  const publicUrl = `${pathname}#home`;
  return `<section class="home-hero" aria-labelledby="page-heading"><div class="home-hero-copy">
    <p class="home-eyebrow">${e(tenant.isPreview ? tenant.welcome : '중·고등학생을 위한 통합 진로검사')}</p>
    <h1 id="page-heading" tabindex="-1">나를 발견하는 시간,<br><span>나다운 미래의 시작.</span></h1>
    <p class="home-lead">좋아하는 일, 잘할 수 있는 일, 중요하게 여기는 것.<br> 세 가지 단서로 나의 진로를 살펴보세요.</p>
    <div class="home-start"><a class="btn btn-primary home-start-button" href="#start">진단 시작하기</a>
    <p class="home-demo-note">현재는 ${ASSESSMENTS.middle.questions.length}문항 체험판으로, 개인 진단 결과는 제공하지 않아요.</p></div>
    ${storageAvailable === false ? '<p class="home-storage-note" role="status">현재 브라우저에서는 임시 저장이 제한돼요. 새로고침하면 응답이 사라질 수 있어요.</p>' : ''}
    <a class="home-text-link" href="#report">어떤 결과를 만나게 되나요?</a></div>${discoveryVisual()}</section>

    <div class="home-service-strip" aria-label="C-Finder 이용 안내"><p><strong>나의 발견에서 진로 탐색까지.</strong><span>C-Finder와 함께 시작해요.</span></p><ul><li>중학생·고등학생용</li><li>흥미·적성·가치관</li><li>PC·모바일 이용</li></ul></div>

    <section class="home-perspectives" aria-labelledby="home-perspectives-heading"><div class="home-section-heading"><div><p class="home-eyebrow">C-Finder가 살펴보는 것</p><h2 id="home-perspectives-heading">한 가지로 설명할 수 없는 나.<br>세 가지 관점으로 함께 살펴봐요.</h2></div><p>어떤 일을 좋아하는지, 어디에 강점이 있는지,<br> 무엇을 중요하게 여기는지부터 알아가요.</p></div>
    <div class="home-domain-tabs" role="tablist" aria-label="검사 영역">${PERSPECTIVES.map((item, i) => `<button id="home-tab-${item.id}" type="button" role="tab" aria-label="${item.label}" aria-selected="${i === 0}" aria-controls="home-panel-${item.id}" tabindex="${i === 0 ? '0' : '-1'}" data-action="home-domain" data-domain="${item.id}"><span>${item.label}</span><span class="home-tab-caption">${item.keyword}</span></button>`).join('')}</div>
    <div class="home-domain-content">${PERSPECTIVES.map((item, i) => `<div class="home-domain-panel" id="home-panel-${item.id}" role="tabpanel" aria-labelledby="home-tab-${item.id}" tabindex="0" ${i ? 'hidden' : ''}><div class="home-domain-art domain-${item.id}">${homeMotif(item.id)}</div><div class="home-domain-copy"><p class="home-domain-keyword">${item.caption}</p><h3>${item.heading}</h3><p>${item.description}</p></div><div class="home-reflection"><strong>이런 나를 떠올려 보세요.</strong><ul>${item.prompts.map(prompt => `<li>${prompt}</li>`).join('')}</ul></div></div>`).join('')}</div></section>

    <section class="home-report" aria-labelledby="home-report-heading"><div class="home-report-copy"><p class="home-eyebrow">검사 이후의 이야기</p><h2 id="home-report-heading">나에 대한 이해가<br> 다음 경험으로 이어지도록.</h2><p class="home-report-description">나의 특성을 읽고, 관심 분야를 넓히고,<br> 직접 해보고 싶은 일을 찾는 진로 리포트.</p>
    <dl class="home-report-features"><div><dt>나의 진로 프로필</dt><dd>나를 설명하는 특성과 핵심 키워드</dd></div><div><dt>영역별 이해</dt><dd>흥미, 적성, 가치관을 함께 읽는 해석</dd></div><div><dt>다음 탐색</dt><dd>관심 분야와 직업, 활동으로 이어지는 단서</dd></div></dl><a class="btn btn-primary home-button" href="#report">결과지 미리보기</a></div>${reportVisual()}</section>

    <section class="home-faq" aria-labelledby="home-faq-heading"><div class="home-faq-intro"><p class="home-eyebrow">시작하기 전에</p><h2 id="home-faq-heading">궁금한 점을<br> 먼저 확인해 보세요.</h2><p>편안하게 나를 돌아볼 수 있도록.</p></div><div class="home-faq-list">
    <details name="home-faq"><summary>누가 이용할 수 있나요?<span class="home-disclosure" aria-hidden="true"></span></summary><p>중·고등학생을 위한 진로검사예요. 현재 학교급에 맞는 검사를 선택해 주세요.</p></details>
    <details name="home-faq"><summary>검사에는 정답이 있나요?<span class="home-disclosure" aria-hidden="true"></span></summary><p>정답이 있는 시험이 아니에요. 평소의 내 모습과 가장 가까운 답을 선택해 주세요. 지금의 생각과 느낌에 솔직하게 응답하면 돼요.</p></details>
    <details name="home-faq"><summary>체험을 마치면 어떤 내용을 볼 수 있나요?<span class="home-disclosure" aria-hidden="true"></span></summary><p>3개의 예시 문항에 응답하고, 선택한 내용을 검토하는 과정을 체험할 수 있어요. 개인 점수나 진로 유형은 산출하지 않으며, 결과지 구성은 별도로 살펴볼 수 있어요.</p></details>
    <details name="home-faq"><summary>중간에 멈췄다가 이어서 할 수 있나요?<span class="home-disclosure" aria-hidden="true"></span></summary><p>브라우저가 임시 저장을 허용하면 같은 탭에서 새로고침하거나 처음 화면으로 돌아와도 이어서 할 수 있어요. 탭을 닫으면 기록이 사라질 수 있고, 다른 기기로 응답이 공유되지는 않아요.</p></details></div></section>

    <section class="home-institutions" aria-labelledby="home-institutions-heading"><div class="home-institution-copy"><p class="home-eyebrow">학교와 교육기관을 위한 C-Finder</p><h2 id="home-institutions-heading">우리 기관의 이름으로,<br>학생의 가능성을 함께 발견해요.</h2><p>같은 검사 경험에 기관의 이름과 색상,<br>학생에게 전하는 안내를 담을 수 있어요.</p><div class="home-institution-actions"><a class="btn home-button-white" href="#institutions">기관 도입 살펴보기</a><a class="home-institution-link" href="${e(tenant.isPreview ? publicUrl : organizationUrl)}">${tenant.isPreview ? 'C-Finder 기본 화면 보기' : '기관용 화면 체험하기'}</a></div></div>
    <div class="home-organization-preview" aria-label="기관 이름과 색상을 적용한 시작 화면 구성 예시"><div class="home-org-header"><span>우리학교 진로센터</span><span>with C-Finder</span></div><div class="home-org-content"><div><span class="home-org-label">우리 학생을 위한 진로검사</span><strong>나의 가능성을<br>함께 찾아가요.</strong><span class="home-org-demo-label">기관 설정 예시</span></div>${homeMotif('interest')}</div><div class="home-org-foot"><span>기관 이름</span><span>브랜드 색상</span><span>안내 문구</span></div></div></section>`;
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
