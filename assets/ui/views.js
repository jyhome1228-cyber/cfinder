import { ASSESSMENTS, DOMAINS } from '../data/assessments.js';
import { countAnswered, isComplete } from '../core/assessment.js';
import { getResultSummary } from '../services/results.js';
import { escapeHtml as e, domainIcon } from './html.js';

const PAGE_TITLES = {
  home: '진로검사', intro: '검사 안내', test: '문항 응답', review: '응답 검토',
  result: '체험 완료', report: '결과지 미리보기', institutions: '기관 도입'
};

export function pageTitle(page) { return PAGE_TITLES[page] || PAGE_TITLES.home; }

function header(route, tenant) {
  return `<header class="site-header"><div class="header-inner">
    <a class="brand" href="#home" aria-label="${e(tenant.logoText)} 처음으로">
      <span class="brand-mark" aria-hidden="true">C</span><span>${e(tenant.logoText)}</span>
      ${tenant.isPreview ? '<span class="co-brand">with C-Finder</span>' : ''}
    </a>
    <nav class="main-nav" aria-label="주 메뉴">
      <a href="#home" ${['home', 'intro', 'test', 'review', 'result'].includes(route.page) ? 'aria-current="page"' : ''}>진로검사</a>
      <a href="#report" ${route.page === 'report' ? 'aria-current="page"' : ''}>결과지 미리보기</a>
      <a href="#institutions" ${route.page === 'institutions' ? 'aria-current="page"' : ''}>기관 도입</a>
    </nav><span class="version-badge">${tenant.isPreview ? '기관 체험' : '체험판'}</span>
  </div></header>`;
}

function footer(tenant) {
  return `<footer class="site-footer"><div class="footer-inner">
    <div><strong>C-Finder</strong><span>나의 가능성을 발견하는 진로검사</span></div>
    <p>© 사자가온다(주)${tenant.isPreview ? ` · ${e(tenant.organizationName)} 화면 예시` : ''}</p>
  </div></footer>`;
}

function storageNotice(available) {
  return `<p class="save-note" data-storage-notice>${available
    ? '답변은 이 브라우저 탭에 임시 저장돼요. 같은 탭에서 새로고침해도 이어서 할 수 있어요.'
    : '이 브라우저에서는 임시 저장을 사용할 수 없어요. 새로고침하면 답변이 사라질 수 있어요.'}</p>`;
}

function stepper(current) {
  const keys = ['intro', 'test', 'review', 'result'];
  const labels = ['검사 안내', '문항 응답', '응답 검토', '완료'];
  const index = keys.indexOf(current);
  return `<ol class="flow-steps" aria-label="검사 진행 단계">${keys.map((key, i) =>
    `<li class="${i < index ? 'is-done' : i === index ? 'is-current' : ''}" ${i === index ? 'aria-current="step"' : ''}><span class="step-number" aria-hidden="true">${i < index ? '✓' : i + 1}</span><span>${labels[i]}</span></li>`
  ).join('')}</ol>`;
}

function gradeCard(assessment, attempt) {
  const count = attempt ? countAnswered(attempt, assessment) : 0;
  const completed = attempt?.status === 'completed';
  const label = completed ? '완료한 체험 보기' : count ? '이어서 하기' : '검사 체험하기';
  return `<article class="grade-card">
    <div class="grade-top"><span class="grade-tag">${assessment.grade === 'middle' ? 'MIDDLE SCHOOL' : 'HIGH SCHOOL'}</span>
      ${completed ? '<span class="status-tag">응답 완료</span>' : count ? `<span class="status-tag">${count}문항 응답</span>` : ''}</div>
    <h3>${e(assessment.label)} 검사</h3><p>${e(assessment.description)}</p>
    <div class="grade-bottom"><span>체험 ${assessment.questions.length}문항</span>
      <button type="button" class="btn btn-primary" data-action="select-grade" data-grade="${assessment.grade}" aria-label="${e(assessment.label)} ${label}">${label}</button></div>
  </article>`;
}

function home({ tenant, attempts }) {
  return `<section class="hero" aria-labelledby="page-heading">
    <div class="hero-copy"><p class="eyebrow">${e(tenant.welcome)}</p>
      <h1 id="page-heading" tabindex="-1">나를 이해하면,<br><span class="marker">다음이 보이니까.</span></h1>
      <p class="hero-description">좋아하는 일, 잘할 수 있는 일,<br class="desktop-break"> 그리고 나에게 중요한 것.<br>나의 진로를 찾는 첫걸음을 C-Finder와 함께해요.</p>
      <ul class="hero-domains" aria-label="검사 영역"><li>흥미</li><li>적성</li><li>가치관</li></ul>
      <a class="text-link" href="#report">어떤 결과를 알 수 있나요?</a>
    </div>
    <section class="selection-panel" aria-labelledby="select-heading"><div class="selection-heading"><span class="section-kicker">시작하기</span><h2 id="select-heading">지금의 나에게 맞는 검사</h2><p>현재 학교급을 선택해 주세요.</p></div>
      ${Object.values(ASSESSMENTS).map(a => gradeCard(a, attempts[a.grade])).join('')}
      <p class="demo-note">검사 흐름을 살펴보는 체험판이에요.<br>예시 문항으로 진행하며 개인 진단 결과는 제공하지 않아요.</p>
    </section>
  </section>
  <section class="domain-section" aria-labelledby="domain-heading">
    <div class="section-heading"><div><span class="section-kicker">나를 알아보는 세 가지 관점</span><h2 id="domain-heading">진로의 단서는 내 안에 있어요.</h2></div><p>하나의 검사에서 나의 여러 모습을 함께 살펴봐요.</p></div>
    <div class="domain-grid">${Object.entries(DOMAINS).map(([id, d]) => `<article class="domain-card"><span class="domain-icon">${domainIcon(id)}</span><div class="domain-name">${d.label}</div><h3>${d.question}</h3><p>${d.description}</p></article>`).join('')}</div>
  </section>
  <section class="institution-strip"><div><span class="section-kicker">학교 · 교육기관</span><h2>우리 기관의 진로검사로 만나보세요.</h2><p>학생에게 익숙한 검사 경험에 기관의 이름과 운영 방식을 담아요.</p></div><a class="btn btn-outline" href="#institutions">기관 도입 살펴보기</a></section>`;
}

function intro({ assessment, attempt, storageAvailable }) {
  const count = countAnswered(attempt, assessment);
  return `<div class="flow-container">${stepper('intro')}
    <section class="panel intro-panel"><div class="panel-heading"><span class="section-kicker">검사 전 안내</span><span class="pill">${e(assessment.label)}</span></div>
      <h1 id="page-heading" tabindex="-1">지금의 나를 떠올려 주세요.</h1><p class="page-description">잘하려고 애쓰지 않아도 괜찮아요.<br>평소의 내 모습에 가까운 답을 골라주세요.</p>
      <div class="intro-points">
        <article><span class="point-icon">${domainIcon('interest')}</span><div><h2>나를 알아보는 시간이에요.</h2><p>나의 흥미, 적성, 가치관을 돌아보며 진로 탐색의 단서를 찾아요.</p></div></article>
        <article><span class="point-icon">${domainIcon('values')}</span><div><h2>정답이 있는 시험이 아니에요.</h2><p>다른 사람의 기대보다 지금 내 생각과 느낌에 맞게 응답해 주세요.</p></div></article>
        <article><span class="point-icon">${domainIcon('aptitude')}</span><div><h2>나의 관심과 강점은 변화할 수 있어요.</h2><p>검사 결과는 현재의 나를 이해하는 자료예요. 새로운 경험과 함께 달라질 수 있어요.</p></div></article>
      </div>
      <div class="experience-note"><strong>이번 체험은 ${assessment.questions.length}문항이에요.</strong><span>문항과 응답 척도는 화면 확인용 예시예요. 정식 진단은 진행하지 않아요.</span></div>
      <div class="actions"><a class="btn btn-outline" href="#home">검사 선택으로</a><button type="button" class="btn btn-primary" data-action="begin">${count ? '이어서 응답하기' : '체험 시작하기'}</button></div>
      ${storageNotice(storageAvailable)}
    </section>
  </div>`;
}

function question(route, { assessment, attempt, storageAvailable }) {
  const q = assessment.questions[route.index];
  const count = countAnswered(attempt, assessment);
  const total = assessment.questions.length;
  const answer = attempt.answers[q.id];
  const nextLabel = route.fromReview ? '수정 완료' : route.index === total - 1 ? '응답 검토하기' : '다음 문항';
  return `<div class="flow-container">${stepper('test')}
    <section class="panel question-panel" aria-labelledby="page-heading">
      <div class="panel-heading"><span class="section-kicker">${route.index + 1}번 문항 <span class="quiet">· 전체 ${total}문항</span></span><span class="pill">${e(assessment.label)}</span></div>
      <div class="progress-caption"><span>응답 진행률</span><span data-progress-text>${count}개 응답 · ${Math.round(count / total * 100)}%</span></div>
      <div class="progress-track" role="progressbar" aria-label="응답한 문항 수" aria-valuenow="${count}" aria-valuemin="0" aria-valuemax="${total}" aria-valuetext="${total}개 중 ${count}개 응답"><span style="width:${count / total * 100}%"></span></div>
      <div class="question-heading"><span class="domain-label">${e(DOMAINS[q.domain].label)}</span><h1 id="page-heading" tabindex="-1">${e(q.text)}</h1><p id="question-help">현재 자신에게 가장 가까운 응답을 하나 선택해 주세요.</p></div>
      <fieldset class="choice-list" aria-describedby="question-help"><legend class="sr-only">${e(q.text)}에 대한 응답</legend>
        ${assessment.options.map(option => `<label class="choice ${answer === option.value ? 'is-selected' : ''}"><input type="radio" name="response" data-question="${e(q.id)}" value="${option.value}" ${answer === option.value ? 'checked' : ''}><span>${e(option.label)}</span></label>`).join('')}
      </fieldset>
      <div class="actions"><button class="btn btn-outline" type="button" data-action="previous" data-index="${route.index}">${route.fromReview ? '검토로 돌아가기' : route.index === 0 ? '검사 안내' : '이전 문항'}</button><button class="btn btn-primary" type="button" data-action="next" data-index="${route.index}" ${answer === undefined ? 'disabled' : ''}>${nextLabel}</button></div>
      <div class="question-utility"><a class="text-link" href="#home">나중에 이어서 하기</a><span class="quiet">예시 문항</span></div>
      ${storageNotice(storageAvailable)}<span class="sr-only" id="response-status" role="status" aria-live="polite"></span>
    </section>
  </div>`;
}

function review({ assessment, attempt, storageAvailable }) {
  const count = countAnswered(attempt, assessment);
  const total = assessment.questions.length;
  const complete = isComplete(attempt, assessment);
  return `<div class="flow-container">${stepper('review')}
    <section class="panel"><div class="panel-heading"><span class="section-kicker">마지막 확인</span><span class="pill">${e(assessment.label)}</span></div>
      <h1 id="page-heading" tabindex="-1">나의 응답을 확인해 주세요.</h1><p class="page-description">${total}문항 중 ${count}문항에 응답했어요.<br>바꾸고 싶은 답이 있다면 지금 수정할 수 있어요.</p>
      ${!complete ? `<p class="notice" role="status">아직 답하지 않은 ${total - count}문항이 있어요. 모든 응답을 마치면 완료할 수 있어요.</p>` : ''}
      <ol class="review-list">${assessment.questions.map((q, i) => {
        const answer = assessment.options.find(option => option.value === attempt.answers[q.id]);
        return `<li class="review-item ${!answer ? 'is-unanswered' : ''}"><div class="review-meta"><span>${i + 1}번</span><span>${e(DOMAINS[q.domain].label)}</span></div><div class="review-copy"><h2>${e(q.text)}</h2><p>${answer ? e(answer.label) : '<span class="unanswered">아직 응답하지 않았어요</span>'}</p></div><button class="text-button" type="button" data-action="edit" data-index="${i}" aria-label="${i + 1}번 문항 ${answer ? '수정하기' : '응답하기'}">${answer ? '수정하기' : '응답하기'}</button></li>`;
      }).join('')}</ol>
      <div class="actions"><button class="btn btn-outline" type="button" data-action="last-question">마지막 문항으로</button><button class="btn btn-primary" type="button" data-action="complete" ${!complete ? 'disabled' : ''}>체험 완료하기</button></div>
      <p class="save-note">완료 후에는 응답을 바꿀 수 없어요. 다시 체험하려면 새로 시작해 주세요.</p>${storageNotice(storageAvailable)}
    </section>
  </div>`;
}

function result({ assessment, attempt }) {
  const result = getResultSummary(attempt, assessment);
  return `<div class="flow-container">${stepper('result')}
    <section class="panel completion-panel"><div class="completion-check" aria-hidden="true">✓</div><span class="section-kicker">${e(assessment.label)} 체험 완료</span>
      <h1 id="page-heading" tabindex="-1">나를 알아보는 첫걸음을 마쳤어요.</h1><p class="page-description">${result.answeredCount}개의 예시 문항에 모두 응답했어요.<br>흥미, 적성, 가치관을 살펴보는 과정은 어땠나요?</p>
      <div class="completed-summary">${Object.entries(DOMAINS).map(([id, d]) => `<div><span class="domain-icon">${domainIcon(id)}</span><strong>${d.label}</strong><span>응답 완료</span></div>`).join('')}</div>
      <p class="notice">지금은 검사 흐름을 확인하는 체험판이에요.<br>응답에 따른 점수나 진로 유형은 산출하지 않아요.</p>
      <div class="actions"><a class="btn btn-outline" href="#home">처음 화면으로</a><a class="btn btn-primary" href="#report">결과지 구성 살펴보기</a></div>
      <details class="answer-receipt"><summary>내가 응답한 내용 보기</summary><ul>${assessment.questions.map(q => `<li><strong>${e(q.text)}</strong><span>${e(assessment.options.find(o => o.value === attempt.answers[q.id]).label)}</span></li>`).join('')}</ul></details>
      <button type="button" class="text-button restart-button" data-action="request-restart">새로 체험하기</button>
    </section>
  </div>`;
}

function report() {
  return `<section class="page-intro"><span class="section-kicker">결과지 구성 미리보기</span><h1 id="page-heading" tabindex="-1">나의 여러 모습을,<br>하나의 진로 리포트로.</h1><p class="page-description">정식 검사에서 만나게 될 결과지의 구성을 살펴보세요.<br>아래는 개인 점수와 유형이 없는 화면 구성 예시예요.</p></section>
    <div class="report-layout">
      <aside class="report-guide"><span class="report-wordmark">C-Finder<br>Career report</span><p>나를 이해하는 단서가<br>다음 탐색으로 이어지도록.</p><ol><li>나의 진로 프로필</li><li>흥미 · 적성 · 가치관</li><li>진로 탐색의 다음 단계</li></ol><a class="btn btn-primary" href="#home">검사 체험하기</a></aside>
      <div class="report-sections">
        <section class="report-card"><div class="panel-heading"><span class="section-kicker">나의 진로 프로필</span><span class="pill">구성 예시</span></div><h2>나를 설명하는 핵심 특성</h2><p>진로 유형과 핵심 키워드, 일상에서 드러나는 특징을 함께 살펴봐요.</p><div class="profile-placeholder"><span class="profile-symbol" aria-hidden="true">C</span><div><strong>나의 진로 유형</strong><span>정식 검사 후 확인할 수 있어요.</span></div></div><div class="placeholder-tags" aria-label="유형 정보 구성"><span>핵심 키워드</span><span>나의 특징</span><span>탐색 방향</span></div></section>
        <section class="report-card"><span class="section-kicker">영역별 이해</span><h2>좋아하는 것부터 중요한 것까지</h2><div class="report-domains">${Object.entries(DOMAINS).map(([id, d]) => `<article><span class="domain-icon">${domainIcon(id)}</span><div><h3>${d.label}</h3><p>${d.description}</p></div><span class="report-placeholder" aria-label="결과 표시 영역"></span></article>`).join('')}</div><p class="report-caption">각 영역의 결과와 해석을 나란히 확인할 수 있는 구성이에요.</p></section>
        <section class="report-card"><span class="section-kicker">다음 탐색</span><h2>알아본 나를, 새로운 경험으로</h2><p>나의 특성을 출발점으로 관심 분야와 직업을 탐색하고, 직접 해볼 활동을 찾아봐요.</p><div class="exploration-grid"><div><span>직업 탐색</span><strong>관심 분야 더 알아보기</strong><p>하는 일과 필요한 역량을 살펴봐요.</p></div><div><span>활동 탐색</span><strong>작은 경험 시작하기</strong><p>수업, 프로젝트, 체험으로 연결해요.</p></div></div></section>
      </div>
    </div>`;
}

function institutions({ tenant }) {
  const previewUrl = `${location.pathname}?org=sample#home`;
  const publicUrl = `${location.pathname}#home`;
  return `<section class="page-intro institution-intro"><span class="section-kicker">C-Finder for organizations</span><h1 id="page-heading" tabindex="-1">우리 기관의 이름으로,<br>학생의 다음을 함께.</h1><p class="page-description">C-Finder의 진로검사 경험을 기관의 환경에 맞춰 제공해요.<br>학생용 검사부터 먼저 살펴보고, 필요한 운영 구성을 정할 수 있어요.</p><a class="btn btn-primary" href="${e(tenant.isPreview ? publicUrl : previewUrl)}">${tenant.isPreview ? 'C-Finder 기본 화면 보기' : '기관용 화면 체험하기'}</a></section>
    <div class="institution-grid"><section class="institution-card"><span class="section-kicker">공통으로 제공하는 경험</span><h2>하나의 C-Finder 검사</h2><ul class="feature-list"><li>학교급에 맞는 검사 선택</li><li>흥미 · 적성 · 가치관 문항 응답</li><li>응답 검토와 결과 확인</li><li>모바일과 PC에서 같은 흐름</li></ul></section><section class="institution-card institution-card-tint"><span class="section-kicker">기관에 맞게 설정하는 영역</span><h2>기관만의 시작 화면</h2><ul class="feature-list"><li>기관 이름과 브랜드 색상</li><li>학생에게 전하는 안내 문구</li><li>기관별 검사 시작 주소</li></ul><p class="save-note">현재 체험에서는 이름·색상·안내 문구를 바꾼 화면을 확인할 수 있어요.</p></section></div>
    <section class="institution-next"><h2>기관 운영 기능은 다음 단계에서 연결해요.</h2><p>학생 초대, 담당자 권한, 검사 현황과 집단 보고서는 정식 검사 연결 후 구축할 예정이에요. 지금은 학생이 검사하는 흐름과 기관별 화면 설정을 먼저 준비하고 있어요.</p></section>`;
}

export function renderView(route, context) {
  const views = { home, intro, review, result, report, institutions };
  const content = route.page === 'test' ? question(route, context) : (views[route.page] || home)(context);
  return header(route, context.tenant)
    + (context.tenant.isPreview ? '<div class="organization-banner">기관 설정 예시를 보고 있어요. 동일한 C-Finder 검사 흐름을 체험할 수 있어요.</div>' : '')
    + `<main id="main" class="shell ${route.page === 'test' ? 'shell-test' : ''}" tabindex="-1">${content}</main>`
    + footer(context.tenant)
    + `<dialog class="reset-dialog" id="reset-dialog" aria-labelledby="reset-heading" aria-describedby="reset-description"><form method="dialog"><span class="section-kicker">다시 시작하기</span><h2 id="reset-heading">새로 체험할까요?</h2><p id="reset-description">현재 선택한 검사의 응답 기록이 지워져요.<br>다른 학교급의 응답은 그대로 보관돼요.</p><div class="actions"><button class="btn btn-outline" value="cancel" autofocus>취소</button><button class="btn btn-primary" value="restart">새로 시작하기</button></div></form></dialog>`;
}
