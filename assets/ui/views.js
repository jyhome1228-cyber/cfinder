import { ASSESSMENTS, DOMAINS } from '../data/assessments.js';
import { renderHome } from './home.js';
import { renderSampleReport } from './sample-report.js';
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
      <a href="#report">결과 예시</a>
      <a href="./about/">검사 소개</a>
      <a href="#institutions" ${route.page === 'institutions' ? 'aria-current="page"' : ''}>기관 도입</a>
    </nav>
  </div></header>`;
}

function footer(tenant) {
  return `<footer class="site-footer"><div class="footer-inner">
    <div class="footer-top"><div class="footer-brand"><strong>C-Finder</strong></div>
      <nav class="footer-nav" aria-label="하단 메뉴"><a href="#start">진단 시작하기</a><a href="./about/">검사 소개</a><a href="#report">결과지 미리보기</a><a href="#institutions">기관 도입</a></nav>
    </div>
    <div class="footer-bottom"><p>© 사자가온다(주)${tenant.isPreview ? ` · ${e(tenant.organizationName)} 화면 예시` : ''}</p></div>
  </div></footer>`;
}

function storageNotice(available) {
  return `<p class="save-note" data-storage-notice>${available
    ? '답변은 이 브라우저 탭에 임시 저장돼요. 같은 탭에서 새로고침해도 이어서 할 수 있어요.'
    : '이 브라우저에서는 임시 저장을 사용할 수 없어요. 새로고침하면 답변이 사라질 수 있어요.'}</p>`;
}

function start({ attempts, storageAvailable }) {
  return `<section class="assessment-start" aria-labelledby="page-heading">
    <h1 id="page-heading" tabindex="-1">검사 선택</h1>
    
    <div class="start-grade-options" role="group" aria-label="학교급 선택">${Object.values(ASSESSMENTS).map(assessment => {
      const attempt = attempts[assessment.grade];
      const count = attempt ? countAnswered(attempt, assessment) : 0;
      const completed = attempt?.status === 'completed';
      const action = completed ? '완료 보기' : count ? '이어서 하기' : '시작하기';
      const status = completed ? '' : count ? `${count}/${assessment.questions.length}문항 응답` : assessment.grade === 'university' ? '전공 · 직무 탐색' : '흥미 · 적성 · 가치관';
      return `<button class="start-grade-choice" type="button" data-action="select-grade" data-grade="${assessment.grade}" aria-label="${e(assessment.label)} ${action}"><strong>${e(assessment.label)}</strong><span class="start-grade-status">${status}</span><span class="start-grade-action">${action}</span></button>`;
    }).join('')}</div>
    <p class="start-demo-note">모든 검사는 3문항 화면 체험이며 진단 결과는 제공하지 않습니다.</p>
    ${!storageAvailable ? storageNotice(false) : ''}
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
    <section class="panel intro-panel"><div class="panel-heading"><span class="pill">${e(assessment.label)}</span></div>
      <h1 id="page-heading" tabindex="-1">검사 안내</h1><p class="page-description">자신에게 가장 가까운 답을 선택하세요.</p>
      <div class="intro-points">
        <article><span class="point-icon">${domainIcon('interest')}</span><div><h2>검사 영역</h2><p>흥미 · 적성 · 가치관</p></div></article>
        <article><span class="point-icon">${domainIcon('values')}</span><div><h2>응답 방법</h2><p>정답은 없습니다. 자신의 생각대로 답하세요.</p></div></article>
        <article><span class="point-icon">${domainIcon('aptitude')}</span><div><h2>진행 방법</h2><p>문항별로 하나씩 선택하고 마지막에 응답을 검토합니다.</p></div></article>
      </div>
      <div class="experience-note"><div><strong>3문항 화면 체험</strong><span>정식 문항과 채점은 연결되지 않았습니다.</span></div></div>
      <div class="actions"><a class="btn btn-outline" href="#start">학교급 다시 선택</a><button type="button" class="btn btn-primary" data-action="begin">${count ? '이어서 응답하기' : '응답 시작하기'}</button></div>
      ${!storageAvailable ? storageNotice(false) : ''}
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
      <div class="panel-heading"><span class="section-kicker">${route.index + 1}번 문항 <span class="quiet">/ ${total}</span></span><span class="pill">${e(assessment.label)}</span></div>
      <div class="progress-caption"><span data-progress-text>${count}개 응답 · ${Math.round(count / total * 100)}%</span></div>
      <div class="progress-track" role="progressbar" aria-label="응답한 문항 수" aria-valuenow="${count}" aria-valuemin="0" aria-valuemax="${total}" aria-valuetext="${total}개 중 ${count}개 응답"><span style="width:${count / total * 100}%"></span></div>
      <div class="question-heading"><span class="domain-label">${e(DOMAINS[q.domain].label)}</span><h1 id="page-heading" tabindex="-1">${e(q.text)}</h1><p id="question-help" class="sr-only">가장 가까운 응답을 선택해 주세요.</p></div>
      <fieldset class="choice-list" aria-describedby="question-help"><legend class="sr-only">${e(q.text)}에 대한 응답</legend>
        ${assessment.options.map(option => `<label class="choice ${answer === option.value ? 'is-selected' : ''}"><input type="radio" name="response" data-question="${e(q.id)}" value="${option.value}" ${answer === option.value ? 'checked' : ''}><span>${e(option.label)}</span></label>`).join('')}
      </fieldset>
      <div class="actions"><button class="btn btn-outline" type="button" data-action="previous" data-index="${route.index}">${route.fromReview ? '검토로 돌아가기' : route.index === 0 ? '검사 안내' : '이전 문항'}</button><button class="btn btn-primary" type="button" data-action="next" data-index="${route.index}" ${answer === undefined ? 'disabled' : ''}>${nextLabel}</button></div>
      <div class="question-utility"><a class="text-link" href="#start">나가기</a></div>
      ${!storageAvailable ? storageNotice(false) : ''}<span class="sr-only" id="response-status" role="status" aria-live="polite"></span>
    </section>
  </div>`;
}

function review({ assessment, attempt, storageAvailable }) {
  const count = countAnswered(attempt, assessment);
  const total = assessment.questions.length;
  const complete = isComplete(attempt, assessment);
  return `<div class="flow-container">${stepper('review')}
    <section class="panel review-panel"><div class="panel-heading"><span class="pill">${e(assessment.label)}</span></div>
      <h1 id="page-heading" tabindex="-1">응답 검토</h1><p class="page-description">${total}문항 중 ${count}문항에 응답했어요.<br> 수정할 답을 선택하세요.</p>
      ${!complete ? `<p class="notice" role="status">아직 답하지 않은 ${total - count}문항이 있어요. 모든 응답을 마치면 완료할 수 있어요.</p>` : ''}
      <ol class="review-list">${assessment.questions.map((q, i) => {
        const answer = assessment.options.find(option => option.value === attempt.answers[q.id]);
        return `<li class="review-item ${!answer ? 'is-unanswered' : ''}"><div class="review-meta"><span>${i + 1}번</span><span>${e(DOMAINS[q.domain].label)}</span></div><div class="review-copy"><h2>${e(q.text)}</h2><p>${answer ? e(answer.label) : '<span class="unanswered">아직 응답하지 않았어요</span>'}</p></div><button class="text-button" type="button" data-action="edit" data-index="${i}" aria-label="${i + 1}번 문항 ${answer ? '수정하기' : '응답하기'}">${answer ? '수정하기' : '응답하기'}</button></li>`;
      }).join('')}</ol>
      <div class="actions"><button class="btn btn-outline" type="button" data-action="last-question">마지막 문항으로</button><button class="btn btn-primary" type="button" data-action="complete" ${!complete ? 'disabled' : ''}>체험 완료하기</button></div>
      ${!storageAvailable ? storageNotice(false) : ''}
    </section>
  </div>`;
}

function result({ assessment, attempt }) {
  const result = getResultSummary(attempt, assessment);
  return `<div class="flow-container">${stepper('result')}
    <section class="panel completion-panel"><div class="completion-check" aria-hidden="true">✓</div><span class="pill">${e(assessment.label)}</span>
      <h1 id="page-heading" tabindex="-1">체험 완료</h1><p class="page-description">${result.answeredCount}문항 응답을 완료했습니다.</p>
      <div class="completed-summary">${Object.entries(DOMAINS).map(([id, d]) => `<div><span class="domain-icon">${domainIcon(id)}</span><strong>${d.label}</strong></div>`).join('')}</div>
      <p class="notice">체험용 응답은 진단 점수나 진로 유형으로 산출되지 않습니다.</p>
      <div class="actions"><a class="btn btn-outline" href="#home">처음 화면으로</a><a class="btn btn-primary" href="#report">샘플 결과지 보기</a></div>
      <details class="answer-receipt"><summary>내가 응답한 내용 보기</summary><ul>${assessment.questions.map(q => `<li><strong>${e(q.text)}</strong><span>${e(assessment.options.find(o => o.value === attempt.answers[q.id]).label)}</span></li>`).join('')}</ul></details>
      <button type="button" class="text-button restart-button" data-action="request-restart">새로 체험하기</button>
    </section>
  </div>`;
}

function report() {
  return renderSampleReport();
}

function institutions({ tenant }) {
  const previewUrl = `${location.pathname}?org=sample#home`;
  const publicUrl = `${location.pathname}#home`;
  return `<div class="institution-hero"><section class="page-intro institution-intro"><h1 id="page-heading" tabindex="-1">기관용 검사 화면</h1><p class="page-description">기관명·색상·안내 문구를 적용하는 화면 예시입니다.</p><a class="btn btn-primary" href="${e(tenant.isPreview ? publicUrl : previewUrl)}">${tenant.isPreview ? 'C-Finder 기본 화면 보기' : '기관용 화면 체험하기'}</a></section>
      <div class="institution-brand-sheet" aria-label="기관별 브랜드 설정 예시"><div class="brand-sheet-label"><span>기관 화면 설정</span><span>적용 예시</span></div>
        <div class="brand-sheet-row"><span class="brand-sheet-swatch" aria-hidden="true"></span><div><strong>C-Finder</strong></div></div>
        <div class="brand-sheet-row is-organization"><span class="brand-sheet-swatch" aria-hidden="true"></span><div><strong>샘플 진로교육센터</strong></div></div>
        
      </div>
    </div>
    <div class="institution-grid"><section class="institution-card"><h2>공통 검사 흐름</h2><p>기관별 설정에도 검사 진행 방식은 같습니다.</p><ul class="feature-list"><li>학교급에 맞는 검사 선택</li><li>흥미 · 적성 · 가치관 문항 응답</li><li>응답 검토와 결과 확인</li><li>모바일과 PC에서 같은 흐름</li></ul></section><section class="institution-card"><h2>기관별 설정</h2><p>기관명·색상·안내 문구를 변경할 수 있습니다.</p><ul class="feature-list"><li>기관 이름과 브랜드 색상</li><li>학생에게 전하는 안내 문구</li><li>기관별 검사 시작 주소</li></ul></section></div>
    <section class="institution-next"><div><h2>기관 운영 항목</h2><a class="text-link" href="./about/#contact">기관 도입 문의하기</a></div><dl><div><dt>학생 참여 방식</dt><dd>기관에서 학생에게 검사를 안내하고 참여시키는 방법</dd></div><div><dt>결과 열람 범위</dt><dd>학생과 담당자가 각각 확인할 수 있는 정보</dd></div><div><dt>기관 운영 화면</dt><dd>검사 진행 현황과 기관 보고서의 구성</dd></div></dl></section>`;
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
