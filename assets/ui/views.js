import { ASSESSMENTS, DOMAINS } from '../data/assessments.js';
import { renderHome, homeMotif } from './home.js';
import { countAnswered, isComplete } from '../core/assessment.js';
import { getResultSummary } from '../services/results.js';
import { escapeHtml as e, domainIcon } from './html.js';

const PAGE_TITLES = {
  home: '진로검사', start: '진단 시작하기', intro: '검사 안내', test: '문항 응답', review: '응답 검토',
  result: '체험 완료', report: '결과지 미리보기', institutions: '기관 도입'
};

export function pageTitle(page) { return PAGE_TITLES[page] || PAGE_TITLES.home; }

function finderMark(className = 'brand-mark') {
  return `<svg class="${className}" viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M12 4H5v7M20 4h7v7M27 21v7h-7M12 28H5v-7" stroke="currentColor" stroke-width="2"/><circle cx="16" cy="16" r="5" fill="currentColor"/></svg>`;
}

function header(route, tenant) {
  return `<header class="site-header"><div class="header-inner">
    <a class="brand" href="#home" aria-label="${e(tenant.logoText)} 처음으로">
      ${finderMark()}<span>${e(tenant.logoText)}</span>
      ${tenant.isPreview ? '<span class="co-brand">with C-Finder</span>' : ''}
    </a>
    <nav class="main-nav" aria-label="주 메뉴">
      <a href="#start" ${['start', 'intro', 'test', 'review', 'result'].includes(route.page) ? 'aria-current="page"' : ''}>진단 시작하기</a>
      <a href="./about/">검사 소개</a>
      <a href="#institutions" ${route.page === 'institutions' ? 'aria-current="page"' : ''}>기관 도입</a>
    </nav><span class="version-badge">${tenant.isPreview ? '기관 체험' : '체험판'}</span>
  </div></header>`;
}

function footer(tenant) {
  return `<footer class="site-footer"><div class="footer-inner">
    <div class="footer-top"><div class="footer-brand"><strong>C-Finder</strong><span>나를 이해하고, 나의 다음을 찾다.</span></div>
      <nav class="footer-nav" aria-label="하단 메뉴"><a href="#start">진단 시작하기</a><a href="./about/">검사 소개</a><a href="#report">결과지 미리보기</a><a href="#institutions">기관 도입</a></nav>
    </div>
    <div class="footer-bottom"><p>© 사자가온다(주)${tenant.isPreview ? ` · ${e(tenant.organizationName)} 화면 예시` : ''}</p><p>흥미 · 적성 · 가치관</p></div>
  </div></footer>`;
}

function storageNotice(available) {
  return `<p class="save-note" data-storage-notice>${available
    ? '답변은 이 브라우저 탭에 임시 저장돼요. 같은 탭에서 새로고침해도 이어서 할 수 있어요.'
    : '이 브라우저에서는 임시 저장을 사용할 수 없어요. 새로고침하면 답변이 사라질 수 있어요.'}</p>`;
}

function start({ attempts, storageAvailable }) {
  return `<section class="assessment-start" aria-labelledby="page-heading">
    <span class="section-kicker">진단 시작하기</span>
    <h1 id="page-heading" tabindex="-1">어떤 검사로 시작할까요?</h1>
    <p class="page-description">현재 학교급을 선택해 주세요.<br> 나에게 맞는 검사 안내로 이어집니다.</p>
    <div class="start-grade-options" role="group" aria-label="학교급 선택">${Object.values(ASSESSMENTS).map(assessment => {
      const attempt = attempts[assessment.grade];
      const count = attempt ? countAnswered(attempt, assessment) : 0;
      const completed = attempt?.status === 'completed';
      const action = completed ? '완료한 체험 보기' : count ? '이어서 하기' : '선택하기';
      const status = completed ? '응답 완료' : count ? `${assessment.questions.length}문항 중 ${count}문항 응답` : '흥미 · 적성 · 가치관';
      return `<button class="start-grade-choice" type="button" data-action="select-grade" data-grade="${assessment.grade}" aria-label="${e(assessment.label)} ${action}"><strong>${e(assessment.label)}</strong><span class="start-grade-status">${status}</span><span class="start-grade-action">${action}</span></button>`;
    }).join('')}</div>
    <p class="start-demo-note">현재는 학교급별 ${ASSESSMENTS.middle.questions.length}문항 체험판이에요. 개인 점수나 진로 유형은 산출하지 않아요.</p>
    ${storageNotice(storageAvailable)}
    <a class="text-link start-back" href="#home">처음 화면으로</a>
  </section>`;
}

function stepper(current) {
  const keys = ['intro', 'test', 'review', 'result'];
  const labels = ['검사 안내', '문항 응답', '응답 검토', '완료'];
  const index = keys.indexOf(current);
  return `<ol class="flow-steps" aria-label="검사 진행 단계">${keys.map((key, i) =>
    `<li class="${i < index ? 'is-done' : i === index ? 'is-current' : ''}" ${i === index ? 'aria-current="step"' : ''}><span class="step-number" aria-hidden="true">${i < index ? '✓' : i + 1}</span><span>${labels[i]}</span></li>`
  ).join('')}</ol>`;
}

function intro({ assessment, attempt, storageAvailable }) {
  const count = countAnswered(attempt, assessment);
  return `<div class="flow-container">${stepper('intro')}
    <section class="panel intro-panel"><div class="panel-heading"><span class="section-kicker">검사 전 안내</span><span class="pill">${e(assessment.label)}</span></div>
      <h1 id="page-heading" tabindex="-1">지금의 나를 떠올려 주세요.</h1><p class="page-description">잘하려고 애쓰지 않아도 괜찮아요.<br> 평소의 내 모습에 가까운 답을 골라주세요.</p>
      <div class="intro-points">
        <article><span class="point-icon">${domainIcon('interest')}</span><div><h2>나를 알아보는 시간이에요.</h2><p>나의 흥미, 적성, 가치관을 돌아보며 진로 탐색의 단서를 찾아요.</p></div></article>
        <article><span class="point-icon">${domainIcon('values')}</span><div><h2>정답이 있는 시험이 아니에요.</h2><p>다른 사람의 기대보다 지금 내 생각과 느낌에 맞게 응답해 주세요.</p></div></article>
        <article><span class="point-icon">${domainIcon('aptitude')}</span><div><h2>나의 관심과 강점은 변화할 수 있어요.</h2><p>검사 결과는 현재의 나를 이해하는 자료예요. 새로운 경험과 함께 달라질 수 있어요.</p></div></article>
      </div>
      <div class="experience-note"><span class="experience-label">체험 안내</span><div><strong>${assessment.questions.length}개의 예시 문항으로 검사 과정을 만나보세요.</strong><span>문항과 응답 척도는 화면 확인용 예시이며, 개인 점수나 진로 유형은 산출하지 않아요.</span></div></div>
      <div class="actions"><a class="btn btn-outline" href="#start">학교급 다시 선택</a><button type="button" class="btn btn-primary" data-action="begin">${count ? '이어서 응답하기' : '응답 시작하기'}</button></div>
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
      <div class="question-utility"><a class="text-link" href="#start">나중에 이어서 하기</a><span class="quiet">예시 문항</span></div>
      ${storageNotice(storageAvailable)}<span class="sr-only" id="response-status" role="status" aria-live="polite"></span>
    </section>
  </div>`;
}

function review({ assessment, attempt, storageAvailable }) {
  const count = countAnswered(attempt, assessment);
  const total = assessment.questions.length;
  const complete = isComplete(attempt, assessment);
  return `<div class="flow-container">${stepper('review')}
    <section class="panel review-panel"><div class="panel-heading"><span class="section-kicker">마지막 확인</span><span class="pill">${e(assessment.label)}</span></div>
      <h1 id="page-heading" tabindex="-1">나의 응답을 확인해 주세요.</h1><p class="page-description">${total}문항 중 ${count}문항에 응답했어요.<br> 바꾸고 싶은 답이 있다면 지금 수정할 수 있어요.</p>
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
      <h1 id="page-heading" tabindex="-1">나를 알아보는 첫걸음을 마쳤어요.</h1><p class="page-description">${result.answeredCount}개의 예시 문항에 모두 응답했어요.<br> 흥미, 적성, 가치관을 살펴보는 과정은 어땠나요?</p>
      <div class="completed-summary">${Object.entries(DOMAINS).map(([id, d]) => `<div><span class="domain-icon">${domainIcon(id)}</span><strong>${d.label}</strong><span>응답 완료</span></div>`).join('')}</div>
      <p class="notice">지금은 검사 흐름을 확인하는 체험판이에요.<br> 응답에 따른 점수나 진로 유형은 산출하지 않아요.</p>
      <div class="actions"><a class="btn btn-outline" href="#home">처음 화면으로</a><a class="btn btn-primary" href="#report">결과지 구성 살펴보기</a></div>
      <details class="answer-receipt"><summary>내가 응답한 내용 보기</summary><ul>${assessment.questions.map(q => `<li><strong>${e(q.text)}</strong><span>${e(assessment.options.find(o => o.value === attempt.answers[q.id]).label)}</span></li>`).join('')}</ul></details>
      <button type="button" class="text-button restart-button" data-action="request-restart">새로 체험하기</button>
    </section>
  </div>`;
}

function report() {
  return `<section class="page-intro report-intro"><span class="section-kicker">결과지 미리보기</span><h1 id="page-heading" tabindex="-1">나의 여러 모습을,<br> 하나의 진로 리포트로.</h1><p class="page-description">나의 특성을 이해하고 다음 탐색을 생각할 수 있도록.<br> 결과지에 담길 내용을 먼저 살펴보세요.</p><p class="report-preview-note"><span>구성 예시</span>개인 점수와 진로 유형이 포함되지 않은 미리보기예요.</p></section>
    <div class="report-layout">
      <aside class="report-guide"><div class="report-guide-heading"><span class="report-wordmark">C-Finder</span><span class="report-guide-label">진로 리포트</span></div>
        <div class="report-cover-art" aria-hidden="true">${homeMotif('interest')}${homeMotif('aptitude')}${homeMotif('values')}</div>
        <p>나를 이해하는 단서가<br> 다음 탐색으로 이어지도록.</p><ul><li>나의 진로 프로필</li><li>흥미 · 적성 · 가치관</li><li>진로 탐색의 다음 단계</li></ul><a class="btn btn-outline" href="#start">진단 시작하기</a></aside>
      <div class="report-sections">
        <section class="report-card"><div class="panel-heading"><span class="section-kicker">나의 진로 프로필</span><span class="pill">구성 예시</span></div><h2>나를 설명하는 핵심 특성</h2><p>진로 유형과 핵심 키워드, 일상에서 드러나는 특징을 함께 살펴봐요.</p>
          <dl class="report-outline"><div><dt>핵심 키워드</dt><dd>나의 특성을 간결하게 이해하는 단서</dd></div><div><dt>나의 특징</dt><dd>일상과 학습에서 나타나는 나의 모습</dd></div><div><dt>탐색 방향</dt><dd>앞으로 더 알아보고 경험할 주제</dd></div></dl>
        </section>
        <section class="report-card"><span class="section-kicker">영역별 이해</span><h2>좋아하는 것부터 중요한 것까지</h2><div class="report-domains">${Object.entries(DOMAINS).map(([id, d]) => `<article><span class="domain-icon">${domainIcon(id)}</span><div><h3>${d.label}</h3><p>${d.description}</p></div></article>`).join('')}</div><p class="report-caption">각 영역의 결과와 해석을 나란히 확인할 수 있는 구성이에요.</p></section>
        <section class="report-card"><span class="section-kicker">다음 탐색</span><h2>알아본 나를, 새로운 경험으로</h2><p>나의 특성을 출발점으로 관심 분야와 직업을 탐색하고, 직접 해볼 활동을 찾아봐요.</p><div class="exploration-grid"><div><span>직업 탐색</span><strong>관심 분야 더 알아보기</strong><p>하는 일과 필요한 역량을 살펴봐요.</p></div><div><span>활동 탐색</span><strong>작은 경험 시작하기</strong><p>수업, 프로젝트, 체험으로 연결해요.</p></div></div></section>
      </div>
    </div>`;
}

function institutions({ tenant }) {
  const previewUrl = `${location.pathname}?org=sample#home`;
  const publicUrl = `${location.pathname}#home`;
  return `<div class="institution-hero"><section class="page-intro institution-intro"><span class="section-kicker">학교와 교육기관을 위한 C-Finder</span><h1 id="page-heading" tabindex="-1">좋은 검사 경험을,<br> 우리 기관의 이름으로.</h1><p class="page-description">학생이 만나는 C-Finder의 경험은 그대로.<br> 기관의 이름과 색상, 안내 문구를 담은 전용 화면으로<br class="desktop-break"> 진로 탐색의 시작을 함께할 수 있어요.</p><a class="btn btn-primary" href="${e(tenant.isPreview ? publicUrl : previewUrl)}">${tenant.isPreview ? 'C-Finder 기본 화면 보기' : '기관용 화면 체험하기'}</a></section>
      <div class="institution-brand-sheet" aria-label="기관별 브랜드 설정 예시"><div class="brand-sheet-label"><span>기관 화면 설정</span><span>적용 예시</span></div>
        <div class="brand-sheet-row"><span class="brand-sheet-swatch" aria-hidden="true"></span><div><strong>C-Finder</strong><span>지금의 나를 이해하는 진로검사</span></div></div>
        <div class="brand-sheet-row is-organization"><span class="brand-sheet-swatch" aria-hidden="true"></span><div><strong>샘플 진로교육센터</strong><span>우리의 다음 걸음을 함께 찾아요</span></div></div>
        <div class="brand-sheet-settings"><span>기관 이름</span><span>브랜드 색상</span><span>안내 문구</span></div>
      </div>
    </div>
    <div class="institution-grid"><section class="institution-card"><span class="section-kicker">공통으로 제공하는 경험</span><h2>하나의 C-Finder 검사</h2><p>어떤 기관에서 시작하더라도<br> 학생은 같은 검사 흐름을 경험해요.</p><ul class="feature-list"><li>학교급에 맞는 검사 선택</li><li>흥미 · 적성 · 가치관 문항 응답</li><li>응답 검토와 결과 확인</li><li>모바일과 PC에서 같은 흐름</li></ul></section><section class="institution-card"><span class="section-kicker">기관에 맞게 설정하는 영역</span><h2>기관만의 시작 화면</h2><p>학생에게 익숙한 기관의 이름으로<br> 자연스럽게 검사를 안내해요.</p><ul class="feature-list"><li>기관 이름과 브랜드 색상</li><li>학생에게 전하는 안내 문구</li><li>기관별 검사 시작 주소</li></ul><p class="save-note">위 체험 버튼에서 실제로 설정을 바꾼 화면을 확인할 수 있어요.</p></section></div>
    <section class="institution-next"><div><span class="section-kicker">기관 도입 준비</span><h2>운영에 필요한 내용은<br> 함께 정해요.</h2><a class="text-link" href="./about/#contact">기관 도입 문의하기</a></div><dl><div><dt>학생 참여 방식</dt><dd>기관에서 학생에게 검사를 안내하고 참여시키는 방법</dd></div><div><dt>결과 열람 범위</dt><dd>학생과 담당자가 각각 확인할 수 있는 정보</dd></div><div><dt>기관 운영 화면</dt><dd>검사 진행 현황과 기관 보고서의 구성</dd></div></dl></section>`;
}

export function renderView(route, context) {
  const views = { home: renderHome, start, intro, review, result, report, institutions };
  const content = route.page === 'test' ? question(route, context) : (views[route.page] || renderHome)(context);
  return header(route, context.tenant)
    + (context.tenant.isPreview ? '<div class="organization-banner">기관 설정 예시를 보고 있어요. 동일한 C-Finder 검사 흐름을 체험할 수 있어요.</div>' : '')
    + `<main id="main" class="shell ${route.page === 'home' ? 'shell-home' : ['intro', 'test', 'review', 'result'].includes(route.page) ? `shell-flow${route.page === 'test' ? ' shell-test' : ''}` : `shell-${route.page}`}" tabindex="-1">${content}</main>`
    + footer(context.tenant)
    + `<dialog class="reset-dialog" id="reset-dialog" aria-labelledby="reset-heading" aria-describedby="reset-description"><form method="dialog"><span class="section-kicker">다시 시작하기</span><h2 id="reset-heading">새로 체험할까요?</h2><p id="reset-description">현재 선택한 검사의 응답 기록이 지워져요.<br> 다른 학교급의 응답은 그대로 보관돼요.</p><div class="actions"><button class="btn btn-outline" value="cancel" autofocus>취소</button><button class="btn btn-primary" value="restart">새로 시작하기</button></div></form></dialog>`;
}
