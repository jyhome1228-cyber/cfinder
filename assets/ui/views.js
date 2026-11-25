import { ASSESSMENTS, DOMAINS } from '../data/assessments.js';
import { renderHome } from './home.js';
import { letterArt } from './letter-art.js';
import { renderSampleReport } from './sample-report.js';
import { countAnswered, isComplete } from '../core/assessment.js';
import { pageForIndex, pageMissingQuestions } from '../core/pages.js';
import { getResultSummary } from '../services/results.js';
import { getReflectionSummary } from '../services/reflection.js';
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
        <div class="cf-tutorial" aria-label="5단계 응답 연습">
          <div class="cf-tutorial-top"><div><strong>먼저 선택 방법을 연습해 볼까요?</strong><p>연습 답변은 실제 검사에 저장되지 않아요.</p></div><span>연습</span></div>
          <p class="cf-tutorial-question">나는 새로운 것을 알아보는 활동이 즐겁다.</p>
          <div class="cf-tutorial-options" role="group" aria-label="응답 연습 선택">
            ${assessment.options.map((option,i) => `<button type="button" class="cf-tutorial-choice" data-action="tutorial-choice" data-value="${option.value}" aria-pressed="false" aria-label="${e(option.label)}"><span class="cf-tutorial-orb cf-tutorial-orb--${i+1}" aria-hidden="true"></span><span>${e(option.label)}</span></button>`).join('')}
          </div>
          <p class="cf-tutorial-feedback" data-tutorial-feedback role="status" aria-live="polite">정답은 없어요. 지금의 생각에 맞는 원을 하나 눌러보세요.</p>
        </div>
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
  const missingOnPage = pageMissingQuestions(assessment, attempt.answers, page);
  const completePage = missingOnPage.length === 0;
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
      ${grouped && (page.previous === null || pageForIndex(assessment,page.previous)?.domain !== page.domain) ? `<div class="cf-domain-enter" aria-label="${e(DOMAINS[page.domain].label)} 영역 시작"><span class="cf-domain-enter-visual">${letterArt('C','domain',true)}</span><div><span>새로운 탐색 영역</span><strong>${e(DOMAINS[page.domain].label)}</strong><p>${e(DOMAINS[page.domain].description)}</p></div></div>` : ''}
      <div class="cf-assessment-heading">
        <div class="cf-assessment-title">
          <span class="cf-assessment-eyebrow">${e(assessment.label)} · ${label}${grouped ? ' · 49항목' : ' · 3문항'}</span>
          <h1 id="page-heading" tabindex="-1">${grouped ? `${e(DOMAINS[page.domain].label)} 탐색` : '진로탐색 화면 체험'}</h1>
          <p>${grouped ? '각 문항을 읽고 나에게 가장 가까운 답을 선택해 주세요.' : '흥미·적성·가치관 예시 문항을 차례로 경험해 보세요.'}</p>
        </div>
        <div class="cf-assessment-counter"><strong>${page.number} <span>/ ${page.totalPages}</span></strong><span>페이지</span></div>
      </div>
      <div class="cf-assessment-progress">
        <div class="cf-assessment-progress-top">
          <strong>전체 진행률 <span data-progress-text>${answered}/${total} 응답 · ${Math.round(answered / total * 100)}%</span></strong>
          <span data-page-status aria-live="polite">이번 페이지 ${page.questions.length - pageMissingQuestions(assessment, attempt.answers, page).length}/${page.questions.length}개 선택</span>
        </div>
        <div class="progress-track" role="progressbar" aria-label="전체 응답 진행률" aria-valuenow="${answered}" aria-valuemin="0" aria-valuemax="${total}" aria-valuetext="${total}개 중 ${answered}개 응답"><span style="width:${answered / total * 100}%"></span></div>
        ${grouped ? `<ol class="cf-domain-progress" aria-label="영역별 진행 상황">${domainProgress}</ol>` : ''}
      </div>
      <div class="cf-response-guide"><span class="cf-response-guide-title">문항 <span>${page.start + 1}–${page.end} / ${total}</span></span><div class="cf-scale-head" aria-hidden="true">${assessment.options.map(option => `<span>${e(option.label)}</span>`).join('')}</div></div>
      <div class="cf-batch-questions">${page.questions.map((q,offset) => {
        const index = page.start + offset;
        const answer = attempt.answers[q.id];
        return `<div class="cf-batch-question" role="group" aria-labelledby="question-title-${index}" data-question-row="${e(q.id)}">
          <div class="cf-question-copy"><h2 class="cf-question-heading" id="question-title-${index}"><span class="cf-batch-index">${index + 1}</span><span class="cf-batch-statement">${e(q.text)}</span></h2>
          ${q.description ? `<p class="cf-factor-help">${e(q.description)}</p>` : ''}</div>
          <div class="choice-list" role="group" aria-label="${index + 1}번 응답 선택">${assessment.options.map(option => `<label class="choice ${answer === option.value ? 'is-selected' : ''}"><input type="radio" name="response-${index}" data-question="${e(q.id)}" value="${option.value}" ${answer === option.value ? 'checked' : ''} aria-label="${e(option.label)}"><span>${e(option.label)}</span></label>`).join('')}</div>
        </div>`;
      }).join('')}</div>
      <div class="cf-character-feedback ${completePage ? 'is-complete' : 'is-pending'}" data-page-feedback role="status" aria-live="polite">
        <div class="cf-character-feedback-avatar" aria-hidden="true">${letterArt('C','feedback',true)}</div>
        <div class="cf-character-feedback-bubble"><strong data-feedback-title>${completePage ? '좋아요! 다 답했어요.' : '조금만 더 해볼까요?'}</strong><span data-feedback-copy>${completePage ? '다음 페이지로 넘어가 볼까요?' : `아직 ${missingOnPage.length}개 문항이 남았어요.`}</span></div>
      </div>
      <div class="actions"><button class="btn btn-outline" type="button" data-action="previous" data-index="${page.start}">${route.fromReview ? '검토로 돌아가기' : page.previous === null ? '검사 안내' : '이전 페이지'}</button><button class="btn btn-primary" type="button" data-action="next" data-index="${page.start}">${nextLabel}</button></div>
      <div class="question-utility"><span class="cf-save-state ${storageAvailable ? '' : 'is-unavailable'}" data-save-state role="status">${storageAvailable ? '응답은 현재 브라우저 탭에 임시 저장됩니다.' : '이 브라우저에서는 응답 저장이 제한됩니다.'}</span><a class="text-link" href="#start">잠시 나가기</a></div>
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
    <section class="panel review-panel cf-review-refined" aria-labelledby="page-heading">
      <div class="cf-review-intro">
        <div class="cf-review-intro-copy"><span class="cf-review-kicker">${e(assessment.label)} · 마지막 확인</span>
          <h1 id="page-heading" tabindex="-1">응답 검토</h1>
          <p>${complete ? '여기까지 잘 왔어요! 선택한 답변을 한 번 더 확인해 볼까요?' : '거의 다 왔어요! 아직 답하지 않은 문항부터 확인해 볼까요?'}</p>
        </div>
        <div class="cf-review-guide" role="note">
          <span class="cf-review-guide-avatar" aria-hidden="true">${letterArt('C','review',true)}</span>
          <div><strong>${complete ? '모든 문항에 답했어요!' : '조금만 더 해볼까요?'}</strong><span>${complete ? '세 영역을 눌러 답변을 살펴보고 완료해 주세요.' : `미응답 ${total-count}개를 확인하면 완료할 수 있어요.`}</span></div>
        </div>
      </div>
      <div class="cf-review-status ${complete ? 'is-complete' : 'is-incomplete'}" role="status">
        <div class="cf-review-status-copy"><span>전체 응답 현황</span><strong>${count} <small>/ ${total}</small></strong><p>${complete ? '모든 응답이 준비됐어요.' : `남은 문항 ${total - count}개`}</p></div>
        <div class="cf-review-status-progress" aria-label="전체 응답 진행률 ${count}/${total}"><span style="width:${Math.round(count/total*100)}%"></span></div>
      </div>
      ${!complete ? `<div class="cf-review-missing-note"><p>아직 선택하지 않은 문항이 있어요. 먼저 답하고 돌아올 수 있어요.</p><button type="button" class="btn btn-outline cf-missing-cta" data-action="first-missing">미응답 문항으로 이동</button></div>` : ''}
      <div class="cf-review-section-heading"><div><h2>영역별 응답 확인</h2><p>영역을 누르면 내가 선택한 답변이 펼쳐져요.</p></div><span>${domains.length}개 영역</span></div>
      <div class="cf-review-groups">${domains.map((domain,groupIndex) => {
        const items = assessment.questions.map((q,i) => ({q,i})).filter(x=>x.q.domain===domain);
        const done = items.filter(x=>Object.hasOwn(attempt.answers,x.q.id)).length;
        const fullyDone = done === items.length;
        const ratio = Math.round(done/items.length*100);
        return `<details class="cf-review-domain" ${!fullyDone ? 'open' : ''}>
          <summary><span class="cf-review-domain-main"><span class="cf-review-domain-index">0${groupIndex+1}</span><span class="cf-review-domain-label"><strong>${e(DOMAINS[domain].label)}</strong><small>${e(DOMAINS[domain].description)}</small></span></span><span class="cf-review-domain-meta"><span class="cf-review-domain-status ${fullyDone ? 'is-done' : 'is-pending'}">${fullyDone ? '응답 완료' : `미응답 ${items.length-done}개`}</span><span class="cf-review-domain-count">${done} / ${items.length}</span><span class="cf-review-chevron" aria-hidden="true"></span></span></summary>
          <div class="cf-review-domain-progress" aria-hidden="true"><span style="width:${ratio}%"></span></div>
          <ol class="review-list">${items.map(({q,i})=>{
            const answer = assessment.options.find(option => option.value === attempt.answers[q.id]);
            return `<li class="review-item ${!answer ? 'is-unanswered' : ''}"><div class="review-meta"><span>${i + 1}번</span></div><div class="review-copy"><h3>${e(q.text)}</h3><p>${answer ? e(answer.label) : '<span class="unanswered">아직 응답하지 않았어요</span>'}</p></div><button class="text-button" type="button" data-action="edit" data-index="${i}" aria-label="${i + 1}번 항목 ${answer ? '수정하기' : '응답하기'}">${answer ? '수정' : '응답'}</button></li>`;
          }).join('')}</ol>
        </details>`;
      }).join('')}</div>
      <div class="cf-review-bottom"><p>응답은 이 브라우저 탭에 임시 저장돼요. 다른 기기와 자동으로 연동되지는 않아요.</p>
        <div class="actions"><button class="btn btn-outline" type="button" data-action="last-question">마지막 문항 수정</button><button class="btn btn-primary" type="button" data-action="complete" ${!complete ? 'disabled' : ''}>${assessment.kind === 'factor_exploration' ? '자기탐색 완료하기' : '체험 완료하기'}</button></div>
      </div>
      ${!storageAvailable ? storageNotice(false) : ''}
    </section>
  </div>`;
}

function reflectionPanel(groups) {
  return `<section class="cf-reflection" aria-labelledby="cf-reflection-heading">
    <div class="cf-reflection-head"><div><span>MY EXPLORATION</span><h2 id="cf-reflection-heading">나의 선택, 이렇게 정리했어요</h2><p>흥미·적성·가치관별로 내가 직접 선택한 답을 정리했어요. 높고 낮음으로 나를 평가하는 결과는 아니에요.</p></div><span class="cf-reflection-type">나의 응답 기록</span></div>
    <div class="cf-reflection-legend" aria-label="응답 범례"><span class="cf-legend-low">그렇지 않은 편 1·2</span><span class="cf-legend-mid">보통 3</span><span class="cf-legend-high">그런 편 4·5</span></div>
    <div class="cf-reflection-grid">${groups.map((group,groupIndex) => {
      const low = group.distribution.low, mid = group.distribution.middle, high = group.distribution.high;
      const percent = value => (value / group.count * 100).toFixed(2);
      return `<article class="cf-reflection-card cf-reflection-card--${group.id}" aria-labelledby="reflection-${group.id}">
        <div class="cf-reflection-card-heading"><div><span class="cf-reflection-domain-num">0${groupIndex+1}</span><h3 id="reflection-${group.id}">${e(group.label)}</h3><p class="cf-reflection-prompt">${e(group.prompt)}</p></div><span class="cf-reflection-total">${group.count}개 문항</span></div>
        <div class="cf-reflection-content">
          <div class="cf-reflection-primary">
            <div class="cf-reflection-subheading"><h4>나의 응답 분포</h4><span>선택한 응답 수</span></div>
            <div class="cf-reflection-distribution" role="img" aria-label="${e(group.label)} 영역: 그렇지 않은 편 ${low}개, 보통 ${mid}개, 그런 편 ${high}개">
              <span class="cf-response-low" style="width:${percent(low)}%"></span><span class="cf-response-mid" style="width:${percent(mid)}%"></span><span class="cf-response-high" style="width:${percent(high)}%"></span>
            </div>
            <div class="cf-reflection-counts"><span>${low}개</span><span>${mid}개</span><span>${high}개</span></div>
            <div class="cf-reflection-highlights"><h4>내가 '그런 편' 이상으로 선택한 항목</h4>
              ${group.highlighted.length ? `<ul>${group.highlighted.map(item=>`<li><span>${e(item.name)}</span><strong>${item.value} / 5</strong></li>`).join('')}</ul>` : '<p class="cf-reflection-empty">높게 선택한 항목이 없어도 괜찮아요. 다른 응답도 나를 알아가는 단서가 돼요.</p>'}
            </div>
          </div>
          <aside class="cf-reflection-next" aria-label="${e(group.label)} 다음 탐색 안내"><div class="cf-reflection-next-label"><span class="cf-reflection-next-mark" aria-hidden="true">✦</span> 다음에 해볼 일</div><p>${e(group.activity)}</p><div class="cf-reflection-next-question"><span>생각해 볼 질문</span><strong>${e(group.question)}</strong></div></aside>
        </div>
      </article>`;
    }).join('')}</div>
    <p class="cf-reflection-disclaimer">이 그래프는 응답 개수만 표시합니다. 영역 간 우열이나 재능, 직업 적합도, 공식 RIASEC 유형을 뜻하지 않습니다.</p>
  </section>`;
}

function result({ assessment, attempt }) {
  const result = getResultSummary(attempt, assessment);
  const factorMode = assessment.kind === 'factor_exploration';
  const reflection = factorMode ? getReflectionSummary(attempt, assessment) : null;
  return `<div class="flow-container">${stepper('result')}
    <section class="panel completion-panel"><div class="cf-completion-celebration" aria-hidden="true"><span class="cf-completion-spark cf-completion-spark-one"></span><span class="cf-completion-spark cf-completion-spark-two"></span><span class="cf-completion-spark cf-completion-spark-three"></span>${letterArt('C', 'complete', true)}</div><div class="completion-check" aria-hidden="true">✓</div><span class="pill">${e(assessment.label)}</span><span class="cf-completion-status">${factorMode ? '자기탐색 완료' : '체험 완료'}</span>
      <h1 id="page-heading" tabindex="-1">${factorMode ? '나를 알아가는 첫 탐색을 마쳤어요!' : '화면 체험을 마쳤어요!'}</h1>
      <p class="page-description">${result.answeredCount}개 항목의 응답을 모두 마쳤어요. 이제 나의 선택을 천천히 돌아볼까요?</p>
      ${factorMode ? `<div class="cf-completion-overview"><span><strong>49</strong>개 문항 응답</span><span>흥미 · 적성 · 가치관</span><span>나의 응답 기록</span></div>${reflectionPanel(reflection)}` : `<div class="completed-summary">${Object.entries(DOMAINS).map(([id,d]) => `<div><span class="domain-icon">${domainIcon(id)}</span><strong>${d.label}</strong></div>`).join('')}</div><p class="cf-reflection-intro">3문항 화면 체험을 마쳤어요. 이 체험에서는 개인 분석 결과를 제공하지 않아요.</p>`}
      <p class="notice cf-result-separation">위 내용은 내가 직접 선택한 답변의 기록이에요. 공식 점수나 진로 유형은 산출되지 않아요. 아래 결과지는 개인 응답과 무관한 별도 디자인 예시입니다.</p>
      <div class="actions"><a class="btn btn-outline" href="#home">처음 화면으로</a><a class="btn btn-primary" href="#report">결과지 구성 예시 보기</a></div>
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
