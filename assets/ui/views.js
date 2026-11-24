import { ASSESSMENTS, DOMAINS } from '../data/assessments.js';
import { renderHome } from './home.js';
import { letterArt } from './letter-art.js';
import { renderSampleReport } from './sample-report.js';
import { countAnswered, isComplete } from '../core/assessment.js';
import { pageForIndex, pageMissingQuestions } from '../core/pages.js';
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
      <a href="#home" ${route.page === 'home' ? 'aria-current="page"' : ''}>홈</a>
      <a href="#report" ${route.page === 'report' ? 'aria-current="page"' : ''}>결과 예시</a>
      <a href="./about/">검사 소개</a>
      <a href="#institutions" ${route.page === 'institutions' ? 'aria-current="page"' : ''}>기관 도입</a><a class="cf-nav-cta" href="#start" ${['start', 'intro', 'test', 'review', 'result'].includes(route.page) ? 'aria-current="page"' : ''}>진단 시작하기</a>
    </nav>
  </div></header>`;
}

function footer(tenant) {
  return `<footer class="site-footer"><div class="footer-inner">
    <div class="footer-top cf-footer-grid">
      <a class="footer-brand" href="#home" aria-label="C-Finder 메인으로"><img src="./assets/brand/cfinder-official-logo.svg" alt="C-Finder" width="130" height="33" loading="lazy"></a><p class="cf-footer-tagline">나를 이해하는 첫걸음, C-Finder.<br>흥미와 강점, 나만의 가치를 발견하세요.</p>
      <nav class="footer-nav" aria-label="하단 메뉴"><div><strong>서비스</strong><a href="#start">진단 시작하기</a><a href="#report">샘플 결과지</a><a href="./about/">검사 소개</a></div><div><strong>학교 및 기관</strong><a href="#institutions">기관 도입</a><a href="./about/#contact">도입 문의</a><a href="mailto:sajagaonda@gmail.com">이메일 문의</a></div><div><strong>이용 안내</strong><a href="#home">서비스 홈</a><a href="./about/">검사 안내</a><a href="https://sjgod.kr" target="_blank" rel="noopener noreferrer">운영사 홈페이지</a></div></nav>
    </div>
    <div class="footer-bottom"><div>
      <div class="footer-information"><span>운영 사자가온다(주)</span><span>사업자등록번호 720-88-01853</span><a href="mailto:sajagaonda@gmail.com">sajagaonda@gmail.com</a><a href="https://sjgod.kr" target="_blank" rel="noopener noreferrer">사자가온다 홈페이지</a></div>
      <p class="footer-notice">현재 중·고등 설문은 49개 요인을 활용한 비공식 자기탐색입니다. 정식 진로검사 점수와 유형을 산출하지 않으며, 응답은 사용 중인 브라우저 탭에 임시 저장됩니다.</p>
      <p class="footer-notice">© 사자가온다(주)${tenant.isPreview ? ` · ${e(tenant.organizationName)} 화면 예시` : ''}</p>
    </div></div>
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
      <div class="cf-start-content cf-welcome-content">
        <div class="cf-welcome-figure" aria-hidden="true">${letterArt('C', 'welcome', true)}</div>
        <p class="cf-welcome-greeting">안녕하세요.</p>
        <h1 id="page-heading" tabindex="-1">C-Finder 진로검사에<br><span>오신 것을 환영합니다.</span></h1>
        <p class="cf-welcome-description">흥미·적성·가치관을 함께 살펴보는 진로검사</p>
        <button class="btn btn-primary cf-welcome-next" type="button" data-action="show-grade-choices">시작하기 <span aria-hidden="true">→</span></button>
        <div class="cf-welcome-domains" aria-label="검사 영역"><span>흥미</span><span>적성</span><span>가치관</span></div>
        <p class="cf-welcome-scope">중·고등 49개 요인 자기탐색 · 대학생용 3문항 체험 · 정식 진단 아님</p>
      </div>
    </div>
    <div class="cf-welcome-stage cf-grade-stage" data-start-stage="grade" hidden>
      <div class="cf-start-content">
        <p class="cf-welcome-greeting">반가워요.</p>
        <h2 id="grade-heading" tabindex="-1">지금 어떤 학교에<br><span>다니고 있나요?</span></h2>
        <p class="cf-welcome-description">해당하는 대상을 선택해 주세요.</p>
        <div class="cf-grade-grid" role="group" aria-labelledby="grade-heading">${Object.values(ASSESSMENTS).map(assessment => {
          const attempt = attempts[assessment.grade];
          const count = attempt ? countAnswered(attempt, assessment) : 0;
          const completed = attempt?.status === 'completed';
          const action = completed ? '완료 기록 보기' : count ? '이어서 하기' : '시작하기';
          const detail = assessment.grade === 'middle' ? '중학교' : assessment.grade === 'high' ? '고등학교' : '대학교';
          const state = completed ? '응답 완료' : count ? `${count}/${assessment.questions.length}항목 응답` : assessment.kind === 'factor_exploration' ? '49항목 자기탐색 · 비공식' : '대학생용 3문항 체험';
          return `<button class="cf-grade-option" type="button" data-action="select-grade" data-grade="${assessment.grade}" aria-label="${e(assessment.label)} ${action}"><span class="cf-grade-title">${e(detail)}</span><span class="cf-grade-description">${assessment.grade === 'middle' ? '관심 분야와 나의 강점 탐색' : assessment.grade === 'high' ? '진로 선택을 위한 자기탐색' : '전공과 직무 탐색 화면 체험'}</span><span class="cf-grade-bottom"><span>${state}</span><strong>${action} <span aria-hidden="true">→</span></strong></span></button>`;
        }).join('')}</div>
        <p class="cf-grade-notice">중·고등학생용은 결과지의 49개 요인을 활용한 비공식 자기탐색입니다. 정식 C-Finder 문항·채점은 연결되지 않았습니다.</p>
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
    <section class="cf-intro cf-intro-simple" aria-labelledby="page-heading">
      <div class="cf-intro-inner">
        <span class="cf-intro-grade">${e(assessment.label)}</span>
        <h1 id="page-heading" tabindex="-1">검사를 시작할게요.</h1>
        <p class="cf-intro-description">정답은 없습니다. 지금의 생각에 가장 가까운 답을 선택해 주세요.</p>
        <div class="cf-intro-facts" aria-label="검사 안내">
          <div><strong>탐색 영역</strong><span>흥미 · 적성 · 가치관</span></div>
          <div><strong>응답 방식</strong><span>${assessment.questions.length}항목 · 5단계 선택</span></div>
          <div><strong>마지막 확인</strong><span>응답 검토 및 수정</span></div>
        </div>
        <button type="button" class="btn btn-primary cf-intro-main-cta" data-action="begin">${count ? '이어서 응답하기' : '응답 시작하기'} <span aria-hidden="true">→</span></button>
        <p class="cf-intro-notice">${assessment.kind === "factor_exploration" ? "제공된 결과지의 49개 하위 요인을 활용한 비공식 자기탐색 설문입니다. 적성은 스스로 느끼는 강점을 묻습니다." : "대학생용 3문항 화면 체험입니다."} 연구팀의 정식 문항·채점 규칙과 연결되지 않으며, 진로 유형을 판정하지 않습니다.</p>
        ${!storageAvailable ? storageNotice(false) : ''}
        <a class="cf-intro-back" href="#start">다른 학교 선택</a>
      </div>
    </section>
  </div>`;
}

function question(route, { assessment, attempt, storageAvailable }) {
  const page = pageForIndex(assessment, route.index);
  if (!page) return '';
  const total = assessment.questions.length;
  const answered = countAnswered(attempt, assessment);
  const grouped = assessment.kind === 'factor_exploration';
  const completePage = pageMissingQuestions(assessment, attempt.answers, page).length === 0;
  const label = grouped ? '자기탐색' : '체험';
  const nextLabel = route.fromReview ? '검토로 돌아가기' : page.next === null ? '응답 검토하기' : '다음 문항';
  const domains = ['interest', 'aptitude', 'values'];
  const domainProgress = grouped ? domains.map(id => {
    const items = assessment.questions.filter(q => q.domain === id);
    const count = items.filter(q => Object.hasOwn(attempt.answers, q.id)).length;
    const isCurrent = id === page.domain;
    return `<li class="${isCurrent ? 'is-active' : ''}"><span>${e(DOMAINS[id].label)}</span><strong>${count}/${items.length}</strong></li>`;
  }).join('') : '';
  return `<div class="flow-container">${stepper('test')}
    <section class="panel question-panel cf-batch-panel" aria-labelledby="page-heading" data-page-start="${page.start}" data-page-end="${page.end}" data-next-start="${page.next ?? ''}" data-page-number="${page.number}">
      <div class="panel-heading"><span class="section-kicker">${label} ${page.start + 1}–${page.end}번 <span class="quiet">/ ${total}</span></span><span class="pill">${e(assessment.label)}</span></div>
      <div class="cf-batch-top"><div><h1 id="page-heading" tabindex="-1">${e(DOMAINS[page.domain].label)} 탐색</h1><p>${grouped ? '각 항목을 읽고 나에게 가장 가까운 답을 선택하세요.' : '지금의 생각에 가까운 답을 선택하세요.'}</p></div><span class="cf-page-number">${page.number} / ${page.totalPages}페이지</span></div>
      ${grouped ? `<ol class="cf-domain-progress" aria-label="영역별 진행 상황">${domainProgress}</ol>` : ''}
      <div class="progress-caption"><span data-progress-text>${answered}개 응답 · ${Math.round(answered / total * 100)}%</span><span data-page-status aria-live="polite">${page.questions.length - pageMissingQuestions(assessment, attempt.answers, page).length}/${page.questions.length}개 선택</span></div>
      <div class="progress-track" role="progressbar" aria-label="전체 응답 진행률" aria-valuenow="${answered}" aria-valuemin="0" aria-valuemax="${total}" aria-valuetext="${total}개 중 ${answered}개 응답"><span style="width:${answered / total * 100}%"></span></div>
      <div class="cf-scale-head" aria-hidden="true">${assessment.options.map(option => `<span>${e(option.label)}</span>`).join('')}</div>
      <div class="cf-batch-questions">${page.questions.map((q,offset) => {
        const index = page.start + offset;
        const answer = attempt.answers[q.id];
        return `<div class="cf-batch-question" role="group" aria-labelledby="question-title-${index}" data-question-row="${e(q.id)}">
          <h2 class="cf-question-heading" id="question-title-${index}"><span class="cf-batch-index">${index + 1}</span><span class="cf-batch-statement">${e(q.text)}</span></h2>
          ${q.description ? `<p class="cf-factor-help">${e(q.description)}</p>` : ''}
          <div class="choice-list" role="group" aria-label="${index + 1}번 응답 선택">${assessment.options.map(option => `<label class="choice ${answer === option.value ? 'is-selected' : ''}"><input type="radio" name="response-${index}" data-question="${e(q.id)}" value="${option.value}" ${answer === option.value ? 'checked' : ''} aria-label="${e(option.label)}"><span>${e(option.label)}</span></label>`).join('')}</div>
        </div>`;
      }).join('')}</div>
      <div class="actions"><button class="btn btn-outline" type="button" data-action="previous" data-index="${page.start}">${route.fromReview ? '검토로 돌아가기' : page.previous === null ? '검사 안내' : '이전 문항'}</button><button class="btn btn-primary" type="button" data-action="next" data-index="${page.start}" ${!completePage ? 'disabled' : ''}>${nextLabel}</button></div>
      <div class="question-utility"><a class="text-link" href="#start">나가기</a></div>
      <p class="cf-batch-disclaimer">${grouped ? '비공식 자기탐색 · 연구팀의 정식 검사 점수와 진로 유형은 산출되지 않습니다.' : '3문항 화면 체험 · 개인 진단 결과는 제공되지 않습니다.'}</p>
      ${!storageAvailable ? storageNotice(false) : ''}<span class="sr-only" id="response-status" role="status" aria-live="polite"></span>
    </section>
  </div>`;
}

function review({ assessment, attempt, storageAvailable }) {
  const count = countAnswered(attempt, assessment);
  const total = assessment.questions.length;
  const complete = isComplete(attempt, assessment);
  const domains = assessment.kind === 'factor_exploration' ? ['interest','aptitude','values'] : [...new Set(assessment.questions.map(q => q.domain))];
  return `<div class="flow-container">${stepper('review')}
    <section class="panel review-panel"><div class="panel-heading"><span class="pill">${e(assessment.label)}</span></div>
      <h1 id="page-heading" tabindex="-1">응답 검토</h1>
      <p class="page-description">${total}항목 중 ${count}항목에 응답했어요. 영역을 펼쳐 답변을 확인하고 수정할 수 있어요.</p>
      ${!complete ? `<p class="notice" role="status">아직 답하지 않은 ${total - count}항목이 있어요. 모든 응답을 마치면 완료할 수 있어요.</p>` : ''}
      <div class="cf-review-groups">${domains.map(domain => {
        const items = assessment.questions.map((q,i) => ({q,i})).filter(x=>x.q.domain===domain);
        const done = items.filter(x=>Object.hasOwn(attempt.answers,x.q.id)).length;
        return `<details class="cf-review-domain" ${done < items.length ? 'open' : ''}>
          <summary><strong>${e(DOMAINS[domain].label)}</strong><span>${done}/${items.length}개 응답</span></summary>
          <ol class="review-list">${items.map(({q,i})=>{
            const answer = assessment.options.find(option => option.value === attempt.answers[q.id]);
            return `<li class="review-item ${!answer ? 'is-unanswered' : ''}"><div class="review-meta"><span>${i + 1}번</span></div><div class="review-copy"><h2>${e(q.text)}</h2><p>${answer ? e(answer.label) : '<span class="unanswered">아직 응답하지 않았어요</span>'}</p></div><button class="text-button" type="button" data-action="edit" data-index="${i}" aria-label="${i + 1}번 항목 ${answer ? '수정하기' : '응답하기'}">${answer ? '수정하기' : '응답하기'}</button></li>`;
          }).join('')}</ol>
        </details>`;
      }).join('')}</div>
      <div class="actions"><button class="btn btn-outline" type="button" data-action="last-question">마지막 문항으로</button><button class="btn btn-primary" type="button" data-action="complete" ${!complete ? 'disabled' : ''}>${assessment.kind === 'factor_exploration' ? '자기탐색 완료하기' : '체험 완료하기'}</button></div>
      ${!storageAvailable ? storageNotice(false) : ''}
    </section>
  </div>`;
}

function result({ assessment, attempt }) {
  const result = getResultSummary(attempt, assessment);
  const factorMode = assessment.kind === 'factor_exploration';
  const groups = Object.entries(DOMAINS).map(([id,d]) => {
    const items = assessment.questions.filter(q => q.domain === id)
      .map(q => ({ name: q.factor, value: attempt.answers[q.id] }))
      .filter(x => Number.isInteger(x.value));
    const chosen = items.filter(x => x.value >= 4).sort((a,b) => b.value - a.value).slice(0,4);
    return { id, label: d.label, total: items.length, chosen };
  });
  return `<div class="flow-container">${stepper('result')}
    <section class="panel completion-panel"><div class="completion-check" aria-hidden="true">✓</div><span class="pill">${e(assessment.label)}</span>
      <h1 id="page-heading" tabindex="-1">${factorMode ? '자기탐색 완료' : '체험 완료'}</h1>
      <p class="page-description">${result.answeredCount}개 항목의 응답을 완료했습니다.</p>
      ${factorMode ? `<div class="cf-self-reflection"><h2>내가 높게 응답한 항목</h2><p>선택한 응답 중 ‘그런 편이다’ 이상인 항목을 영역별로 표시합니다. 개인의 자기평가이며, 점수 분석이나 진로 적합도 판정이 아닙니다.</p><div class="cf-self-groups">${groups.map(g => `<section><h3>${g.label}</h3><p>${g.total}개 항목 응답</p><ul>${g.chosen.length ? g.chosen.map(x => `<li>${e(x.name)} <span>${x.value}/5</span></li>`).join('') : '<li>높게 선택한 항목이 없습니다.</li>'}</ul></section>`).join('')}</div></div>` : `<div class="completed-summary">${Object.entries(DOMAINS).map(([id,d]) => `<div><span class="domain-icon">${domainIcon(id)}</span><strong>${d.label}</strong></div>`).join('')}</div>`}
      <p class="notice">이 응답은 연구팀의 정식 검사 점수나 RIASEC 진로 유형으로 산출되지 않습니다. 아래 결과지는 별도의 샘플입니다.</p>
      <div class="actions"><a class="btn btn-outline" href="#home">처음 화면으로</a><a class="btn btn-primary" href="#report">샘플 결과지 보기</a></div>
      <details class="answer-receipt"><summary>내가 응답한 내용 보기</summary><ul>${assessment.questions.map(q => `<li><strong>${e(q.text)}</strong><span>${e(assessment.options.find(o => o.value === attempt.answers[q.id]).label)}</span></li>`).join('')}</ul></details>
      <button type="button" class="text-button restart-button" data-action="request-restart">새로 탐색하기</button>
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
    <div class="institution-grid"><section class="institution-card"><h2>공통 검사 흐름</h2><p>기관별 설정에도 검사 진행 방식은 같습니다.</p><ul class="feature-list"><li>다니는 학교에 맞는 검사 선택</li><li>흥미 · 적성 · 가치관 문항 응답</li><li>응답 검토와 결과 확인</li><li>모바일과 PC에서 같은 흐름</li></ul></section><section class="institution-card"><h2>기관별 설정</h2><p>기관명·색상·안내 문구를 변경할 수 있습니다.</p><ul class="feature-list"><li>기관 이름과 브랜드 색상</li><li>학생에게 전하는 안내 문구</li><li>기관별 검사 시작 주소</li></ul></section></div>
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
