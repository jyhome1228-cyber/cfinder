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
  return `<img class="${className}" src="./assets/brand/cfinder-official-mark.svg" alt="" width="30" height="30" aria-hidden="true">`;
}

function header(route, tenant) {
  return `<header class="site-header"><div class="header-inner">
    <a class="brand" href="#home" aria-label="${e(tenant.logoText)} 처음으로">
      ${tenant.isPreview
        ? `${finderMark()}<span>${e(tenant.logoText)}</span><span class="co-brand">with C-Finder</span>`
        : '<img class="brand-wordmark" src="./assets/brand/cfinder-official-logo.svg" alt="C-Finder" width="152" height="38">'}
      
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
  return `<section class="assessment-start cf-welcome-flow" aria-label="진로검사 시작">
    <div class="cf-welcome-stage" data-start-stage="welcome">
      <div class="cf-start-content">
        <p class="cf-welcome-greeting">안녕하세요.</p>
        <h1 id="page-heading" tabindex="-1">C-Finder 진로검사에<br><span>오신 것을 환영합니다.</span></h1>
        <p class="cf-welcome-description">나에게 맞는 진로를 알아보는 첫 단계입니다.</p>
        <button class="btn btn-primary cf-welcome-next" type="button" data-action="show-grade-choices">시작하기 <span aria-hidden="true">→</span></button>
        <p class="cf-welcome-scope">현재 제공되는 검사는 3문항 화면 체험입니다.</p>
      </div>
    </div>
    <div class="cf-welcome-stage cf-grade-stage" data-start-stage="grade" hidden>
      <div class="cf-start-content">
        <p class="cf-welcome-greeting">반가워요.</p>
        <h2 id="grade-heading" tabindex="-1">지금 어떤 학교급에<br><span>해당하나요?</span></h2>
        <p class="cf-welcome-description">해당하는 대상을 선택해 주세요.</p>
        <div class="cf-grade-grid" role="group" aria-labelledby="grade-heading">${Object.values(ASSESSMENTS).map(assessment => {
          const attempt = attempts[assessment.grade];
          const count = attempt ? countAnswered(attempt, assessment) : 0;
          const completed = attempt?.status === 'completed';
          const action = completed ? '체험 완료 보기' : count ? '이어서 하기' : '검사 시작';
          const detail = assessment.grade === 'middle' ? '중학교에 다니고 있어요' : assessment.grade === 'high' ? '고등학교에 다니고 있어요' : '대학교에 다니고 있어요';
          const state = completed ? '응답 완료' : count ? `${count}/${assessment.questions.length}문항 응답` : assessment.grade === 'university' ? '대학생용 화면 체험' : '3문항 화면 체험';
          return `<button class="cf-grade-option" type="button" data-action="select-grade" data-grade="${assessment.grade}" aria-label="${e(assessment.label)} ${action}"><span class="cf-grade-title">${e(assessment.label)}</span><span class="cf-grade-description">${detail}</span><span class="cf-grade-bottom"><span>${state}</span><strong>${action} <span aria-hidden="true">→</span></strong></span></button>`;
        }).join('')}</div>
        <p class="cf-grade-notice">체험에서는 개인 점수와 진로 유형이 산출되지 않습니다.</p>
        ${!storageAvailable ? storageNotice(false) : ''}
        <button class="cf-back-step" type="button" data-action="back-to-welcome">이전으로</button>
      </div>
    </div>
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
  return `<div class="flow-container cf-intro-layout">${stepper('intro')}
    <section class="cf-intro" aria-labelledby="page-heading">
      <div class="cf-intro-lead">
        <span class="cf-intro-grade">${e(assessment.label)}</span>
        <h1 id="page-heading" tabindex="-1">검사를 시작하기 전에</h1>
        <p class="cf-intro-description">현재 자신에게 가장 가까운 답을 선택해 주세요.</p>
        <div class="cf-intro-cta">
          <button type="button" class="btn btn-primary" data-action="begin">${count ? '이어서 응답하기' : '응답 시작하기'} <span aria-hidden="true">→</span></button>
          <a class="cf-intro-back" href="#start">학교급 다시 선택</a>
        </div>
      </div>
      <div class="cf-intro-details">
        <h2>검사 진행 안내</h2>
        <dl>
          <div><dt>검사 영역</dt><dd>흥미 · 적성 · 가치관</dd></div>
          <div><dt>응답 방법</dt><dd>정답은 없습니다. 자신의 생각대로 답해 주세요.</dd></div>
          <div><dt>응답 확인</dt><dd>마지막에 선택한 답을 검토하고 수정할 수 있습니다.</dd></div>
        </dl>
        <p class="cf-intro-notice">현재는 3문항 화면 체험입니다. 개인 점수나 진로 유형은 산출되지 않습니다.</p>
        ${!storageAvailable ? storageNotice(false) : ''}
      </div>
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
