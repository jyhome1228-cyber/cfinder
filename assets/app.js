import { ASSESSMENTS } from './data/assessments.js';
import { resolveTenant, applyTenantTheme } from './config/tenants.js';
import { createAttempt, answerQuestion, visitQuestion, completeAttempt, countAnswered, getResumeRoute } from './core/assessment.js';
import { createSessionStore } from './core/storage.js';
import { parseRoute, navigate, withGrade } from './core/router.js';
import { pageForIndex, pageMissingQuestions } from './core/pages.js';
import { renderView, pageTitle } from './ui/views.js';
import { selectHomeDomain, handleHomeTabKey, TYPES } from './ui/home.js';
import { letterArt } from './ui/letter-art.js';

const app = document.querySelector('#app');
// Preserve a usable type label if an externally hosted letter image is unavailable.
document.addEventListener('error', event => {
  if (event.target instanceof HTMLImageElement && event.target.hasAttribute('data-letter-asset')) {
    event.target.closest('.cf-letter')?.classList.add('is-fallback');
  }
}, true);
const introLoader = document.querySelector('#brand-loader');
function closeBrandIntro() {
  if (!introLoader || !introLoader.isConnected || introLoader.classList.contains('is-leaving')) return;
  introLoader.classList.add('is-leaving');
  window.setTimeout(() => introLoader.remove(), 240);
}
if (introLoader) {
  // A full brand intro is a first-home-visit experience, not a loading gate.
  // Don't interrupt a route change from About or a return from the assessment.
  let alreadyShown = true;
  try {
    alreadyShown = sessionStorage.getItem('cfinder:brand-intro:v2') === 'seen';
  } catch { /* storage restricted; skip optional brand animation */ }
  const isHomeEntry = location.hash === '' || location.hash === '#home';
  const fromAbout = document.referrer.startsWith(location.origin + location.pathname + 'about/');
  const forceReplay = new URLSearchParams(location.search).get('intro') === 'replay';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const shouldPlay = isHomeEntry && !reducedMotion && (forceReplay || (!alreadyShown && !fromAbout));
  if (!shouldPlay) {
    introLoader.remove();
  } else {
    introLoader.hidden = false;
    try { sessionStorage.setItem('cfinder:brand-intro:v2', 'seen'); } catch { /* optional visual state */ }
    const finishTimer = window.setTimeout(closeBrandIntro, 3580);
    introLoader.querySelector('.cfinder-intro-skip')?.addEventListener('click', () => {
      window.clearTimeout(finishTimer);
      closeBrandIntro();
    });
  }
}
let reportMotionObserver = null;
let prePrintOpenDetails = [];
function setupReportMotion() {
  reportMotionObserver?.disconnect();
  reportMotionObserver = null;
  if (parseRoute(location.hash).page !== 'report') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const sections = [...app.querySelectorAll('.sr-section')];
  reportMotionObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('sr-in-view');
      reportMotionObserver?.unobserve(entry.target);
    }
  }, { threshold: 0.1, rootMargin: '0px 0px 30px 0px' });
  sections.forEach(section => {
    section.classList.add('sr-motion-ready');
    reportMotionObserver.observe(section);
  });
}
function expandPrintableReport() {
  if (parseRoute(location.hash).page !== 'report') return;
  prePrintOpenDetails = [...app.querySelectorAll('.sr-page details:not([open])')];
  prePrintOpenDetails.forEach(details => { details.open = true; });
  app.querySelectorAll('.sr-section').forEach(section => section.classList.add('sr-in-view'));
}
function restorePrintableReport() {
  prePrintOpenDetails.forEach(details => { if (details.isConnected) details.open = false; });
  prePrintOpenDetails = [];
}
window.addEventListener('beforeprint', expandPrintableReport);
window.addEventListener('afterprint', restorePrintableReport);

const tenant = resolveTenant(location.search);
const storage = createSessionStore();
const attempts = Object.fromEntries(Object.entries(ASSESSMENTS).map(([grade, assessment]) => [grade, storage.loadAttempt(tenant.id, assessment)]));
let activeGrade = storage.loadGrade(tenant.id);

applyTenantTheme(tenant);
document.querySelector('meta[name="theme-color"]').content = tenant.primaryColor;

function assessment() { return ASSESSMENTS[activeGrade]; }
function currentAttempt() { return attempts[activeGrade]; }
function go(hash, options) { navigate(withGrade(hash, activeGrade), options); }

function save(attempt) {
  attempts[activeGrade] = attempt;
  storage.saveAttempt(attempt, assessment());
}

let prepareTimer = null;
function finishPreparing() {
  if (prepareTimer !== null) window.clearTimeout(prepareTimer);
  prepareTimer = null;
  document.querySelector('.cf-prepare-overlay')?.remove();
}
function prepareAssessment(next) {
  finishPreparing();
  const overlay = document.createElement('div');
  overlay.className = 'cf-prepare-overlay';
  overlay.setAttribute('role', 'status');
  overlay.setAttribute('aria-live', 'polite');
  overlay.innerHTML = `<div class="cf-prepare-content">${letterArt('C', 'loading', true)}<p>검사를 준비하고 있습니다.</p><span class="cf-prepare-dots" aria-hidden="true"><i></i><i></i><i></i></span></div>`;
  document.body.append(overlay);
  prepareTimer = window.setTimeout(() => { finishPreparing(); next(); }, 850);
}

function selectGrade(grade) {
  if (!Object.hasOwn(ASSESSMENTS, grade) || prepareTimer !== null) return;
  activeGrade = grade;
  storage.saveGrade(tenant.id, grade);
  if (!currentAttempt()) save(createAttempt(tenant.id, assessment()));
  const destination = countAnswered(currentAttempt(), assessment()) || currentAttempt().status === 'completed'
    ? getResumeRoute(currentAttempt(), assessment()) : '#intro';
  if (currentAttempt().status === 'completed') {
    go(destination);
  } else {
    prepareAssessment(() => {
      if (parseRoute(location.hash).page === 'start') go(destination);
    });
  }
}

function render() {
  const route = parseRoute(location.hash);
  const isFlow = ['intro', 'test', 'review', 'result'].includes(route.page);
  if (isFlow && route.grade && route.grade !== activeGrade) {
    activeGrade = route.grade;
    storage.saveGrade(tenant.id, activeGrade);
  }
  if (isFlow && (!assessment() || !currentAttempt())) return go('#start', { replace: true });
  if (isFlow && !route.grade) return go(location.hash, { replace: true });
  if (isFlow && currentAttempt().status === 'completed' && route.page !== 'result') {
    return go('#result', { replace: true });
  }
  if (route.page === 'result' && currentAttempt().status !== 'completed') {
    return go(getResumeRoute(currentAttempt(), assessment()), { replace: true });
  }
  if (route.page === 'test') {
    const index = Math.min(route.index, assessment().questions.length - 1);
    if (index !== route.index) return go(`#test/${index}${route.fromReview ? '?from=review' : ''}`, { replace: true });
    save(visitQuestion(currentAttempt(), assessment(), index));
  }
  document.title = `${tenant.isPreview ? `${tenant.organizationName} · ` : ''}C-Finder | ${pageTitle(route.page)}`;
  app.innerHTML = renderView(route, {
    tenant, assessment: assessment(), attempt: currentAttempt(), attempts,
    storageAvailable: storage.available
  });
  setupReportMotion();
  app.querySelector('#cf-riasec-dialog')?.addEventListener('close', () => {
    if (lastRiasecTrigger?.isConnected) lastRiasecTrigger.focus({ preventScroll: true });
    lastRiasecTrigger = null;
  });
  const dialog = app.querySelector('#reset-dialog');
  dialog.addEventListener('close', () => {
    if (dialog.returnValue !== 'restart' || !assessment()) return;
    save(createAttempt(tenant.id, assessment()));
    if (parseRoute(location.hash).page === 'intro') render();
    else go('#intro');
  });
  window.scrollTo({ top: 0, behavior: 'instant' });
  app.querySelector('#page-heading')?.focus({ preventScroll: true });
}

function updatePageSpeechBubble(missingCount, needsAttention = false) {
  const feedback = app.querySelector('[data-page-feedback]');
  if (!feedback) return;
  const done = missingCount === 0;
  feedback.classList.toggle('is-complete', done);
  feedback.classList.toggle('is-pending', !done);
  feedback.classList.toggle('is-attention', needsAttention && !done);
  const title = feedback.querySelector('[data-feedback-title]');
  const copy = feedback.querySelector('[data-feedback-copy]');
  if (title) title.textContent = done ? '좋아요! 다 답했어요.' : needsAttention ? '앗, 아직 답하지 않은 문항이 있어요.' : '조금만 더 해볼까요?';
  if (copy) copy.textContent = done ? '다음 페이지로 넘어가 볼까요?' : needsAttention ? `표시된 ${missingCount}개 문항도 선택해 주세요.` : `아직 ${missingCount}개 문항이 남았어요.`;
}

function refreshAnswerUI(questionId, value) {
  const current = assessment();
  const attempt = currentAttempt();
  const page = pageForIndex(current, parseRoute(location.hash).index);
  if (!page) return;
  const count = countAnswered(attempt, current);
  const total = current.questions.length;
  const row = [...app.querySelectorAll('[data-question-row]')].find(el => el.dataset.questionRow === questionId);
  row?.querySelectorAll('.choice').forEach(label => {
    label.classList.toggle('is-selected', label.querySelector('input').checked);
  });
  const missing = pageMissingQuestions(current, attempt.answers, page);
  updatePageSpeechBubble(missing.length);
  row?.classList.remove('is-missing');
  app.querySelector('[data-progress-text]').textContent = `${count}/${total} 응답 · ${Math.round(count / total * 100)}%`;
  const pageStatus = app.querySelector('[data-page-status]');
  if (pageStatus) pageStatus.textContent = `이번 페이지 ${page.questions.length - missing.length}/${page.questions.length}개 선택`;
  const progress = app.querySelector('[role="progressbar"]');
  progress.setAttribute('aria-valuenow', count);
  progress.setAttribute('aria-valuetext', `${total}개 중 ${count}개 응답`);
  progress.firstElementChild.style.width = `${count / total * 100}%`;
  // Domain progress counts update without re-rendering, preserving radio keyboard focus.
  const domainNodes = app.querySelectorAll('.cf-domain-progress li');
  if (domainNodes.length) {
    ['interest', 'aptitude', 'values'].forEach((id, i) => {
      const items = current.questions.filter(q => q.domain === id);
      const done = items.filter(q => Object.hasOwn(attempt.answers, q.id)).length;
      const element = domainNodes[i]?.querySelector('strong');
      if (element) element.textContent = `${done}/${items.length}`;
    });
  }
  app.querySelector('#response-status').textContent = `${current.options.find(o => o.value === value).label}, 응답했어요.`;
  const saveState = app.querySelector('[data-save-state]');
  if (saveState) {
    saveState.textContent = storage.available ? '응답이 현재 브라우저 탭에 임시 저장됐어요.' : '저장할 수 없어요. 새로고침하면 응답이 사라질 수 있습니다.';
    saveState.classList.toggle('is-unavailable', !storage.available);
  }
  if (!storage.available) {
    let notice = app.querySelector('[data-storage-notice]');
    if (!notice) {
      notice = document.createElement('p');
      notice.className = 'save-note';
      notice.dataset.storageNotice = '';
      app.querySelector('.question-panel')?.append(notice);
    }
    notice.textContent = '임시 저장이 제한되어 새로고침 시 답변이 사라질 수 있습니다.';
  }
}

app.addEventListener('change', event => {
  const input = event.target;
  if (!(input instanceof HTMLInputElement) || !input.matches('input[data-question]')) return;
  const route = parseRoute(location.hash);
  if (route.page !== 'test' || currentAttempt()?.status !== 'in_progress') return;
  const page = pageForIndex(assessment(), route.index);
  const question = page?.questions.find(q => q.id === input.dataset.question);
  if (!question) return;
  const value = Number(input.value);
  if (!assessment().options.some(o => o.value === value)) return;
  save(answerQuestion(currentAttempt(), assessment(), question.id, value));
  refreshAnswerUI(question.id, value);
});

let lastRiasecTrigger = null;
function openRiasecType(code, trigger) {
  const type = TYPES.find(item => item.code === code);
  const dialog = app.querySelector('#cf-riasec-dialog');
  if (!type || !dialog || typeof dialog.showModal !== 'function') return;
  lastRiasecTrigger = trigger;
  dialog.querySelector('[data-riasec-art]').innerHTML = letterArt(type.code, 'modal', true);
  dialog.querySelector('[data-riasec-focus]').textContent = type.focus;
  dialog.querySelector('#cf-riasec-title').textContent = type.name;
  dialog.querySelector('#cf-riasec-description').textContent = type.intro;
  dialog.querySelector('[data-riasec-traits]').replaceChildren(...type.traits.map(value => {
    const li = document.createElement('li');
    li.textContent = value;
    return li;
  }));
  dialog.querySelector('[data-riasec-example]').textContent = type.example;
  dialog.querySelector('[data-riasec-question]').textContent = type.question;
  dialog.showModal();
  dialog.querySelector('[data-action="close-riasec"]')?.focus();
}

app.addEventListener('click', event => {
  const typeTrigger = event.target.closest('button[data-action="open-riasec"]');
  if (typeTrigger && parseRoute(location.hash).page === 'home') {
    openRiasecType(typeTrigger.dataset.type, typeTrigger);
    return;
  }
  const typeDismiss = event.target.closest('button[data-action="close-riasec"]');
  if (typeDismiss) {
    typeDismiss.closest('dialog')?.close();
    return;
  }
  const backdrop = event.target;
  if (backdrop instanceof HTMLDialogElement && backdrop.id === 'cf-riasec-dialog') {
    const rect = backdrop.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) backdrop.close();
    return;
  }
  const character = event.target.closest('button[data-action="play-hero-character"]');
  if (character && parseRoute(location.hash).page === 'home') {
    const reaction = character.querySelector('.cf-hero-reaction');
    if (reaction) reaction.textContent = '반가워요!';
    character.classList.remove('is-reacting');
    // Restart a short reaction each time, including on touch and keyboard activation.
    void character.offsetWidth;
    character.classList.add('is-reacting');
    return;
  }
  const printButton = event.target.closest('button[data-action="print-sample-report"]');
  if (printButton && parseRoute(location.hash).page === 'report') {
    window.print();
    return;
  }
  const reportJump = event.target.closest('button[data-sr-scroll]');
  if (reportJump && parseRoute(location.hash).page === 'report') {
    const target = app.querySelector('#' + reportJump.dataset.srScroll);
    if (!target) return;
    app.querySelectorAll('button[data-sr-scroll]').forEach(button => {
      if (button === reportJump) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    });
    target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
    return;
  }
  const button = event.target.closest('button[data-action]');
  if (!button || button.disabled) return;
  const action = button.dataset.action;
  if (action === 'tutorial-choice') {
    if (parseRoute(location.hash).page !== 'intro') return;
    const tutorial = button.closest('.cf-tutorial');
    if (!tutorial) return;
    tutorial.querySelectorAll('[data-action="tutorial-choice"]').forEach(item => {
      const selected = item === button;
      item.setAttribute('aria-pressed', String(selected));
      item.classList.toggle('is-selected', selected);
    });
    const option = assessment()?.options.find(item => item.value === Number(button.dataset.value));
    const message = tutorial.querySelector('[data-tutorial-feedback]');
    if (message && option) message.textContent = `‘${option.label}’을 선택했어요. 실제 검사에서도 같은 방법으로 답하면 돼요.`;
    return;
  }
  if (action === 'show-grade-choices' || action === 'back-to-welcome') {
    if (parseRoute(location.hash).page !== 'start') return;
    const welcome = app.querySelector('[data-start-stage="welcome"]');
    const grades = app.querySelector('[data-start-stage="grade"]');
    if (!welcome || !grades) return;
    const showGrades = action === 'show-grade-choices';
    welcome.hidden = showGrades;
    grades.hidden = !showGrades;
    (showGrades ? grades.querySelector('#grade-heading') : welcome.querySelector('#page-heading'))?.focus({ preventScroll: true });
    return;
  }
  if (action === 'home-domain') return selectHomeDomain(app, button.dataset.domain);
  if (action === 'select-grade') return selectGrade(button.dataset.grade);
  if (!assessment() || !currentAttempt()) return;
  const route = parseRoute(location.hash);
  const index = Number(button.dataset.index);
  if (action === 'begin') go(getResumeRoute(currentAttempt(), assessment()));
  else if (action === 'previous') {
    const page = pageForIndex(assessment(), route.index);
    if (!page) return;
    go(route.fromReview ? '#review' : page.previous === null ? '#intro' : `#test/${page.previous}`);
  } else if (action === 'next') {
    const page = pageForIndex(assessment(), route.index);
    if (!page) return;
    const missing = pageMissingQuestions(assessment(), currentAttempt().answers, page);
    if (missing.length) {
      const rows = [...app.querySelectorAll('[data-question-row]')];
      rows.forEach(row => row.classList.toggle('is-missing', missing.some(q => q.id === row.dataset.questionRow)));
      updatePageSpeechBubble(missing.length, true);
      const first = rows.find(row => row.dataset.questionRow === missing[0].id);
      first?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      first?.querySelector('input[type="radio"]')?.focus({ preventScroll: true });
      return;
    }
    go(route.fromReview || page.next === null ? '#review' : `#test/${page.next}`);
  } else if (action === 'first-missing') {
    const firstIndex = assessment().questions.findIndex(q => !Object.hasOwn(currentAttempt().answers, q.id));
    if (firstIndex >= 0) go(`#test/${firstIndex}?from=review`);
  } else if (action === 'edit') go(`#test/${index}?from=review`);
  else if (action === 'last-question') go(`#test/${assessment().questions.length - 1}`);
  else if (action === 'complete') {
    save(completeAttempt(currentAttempt(), assessment()));
    go('#result');
  } else if (action === 'request-restart') {
    const dialog = app.querySelector('#reset-dialog');
    dialog.returnValue = '';
    dialog.showModal();
  }
});

app.addEventListener('animationend', event => {
  if (event.target instanceof HTMLButtonElement &&
      event.target.matches('[data-action="play-hero-character"]') &&
      event.animationName === 'cfHeroTap') {
    event.target.classList.remove('is-reacting');
  }
});

app.addEventListener('keydown', event => handleHomeTabKey(event, app));

document.querySelector('.skip-link').addEventListener('click', event => {
  event.preventDefault();
  const main = document.querySelector('#main');
  main?.focus();
  main?.scrollIntoView({ block: 'start' });
});

window.addEventListener('hashchange', () => { if (prepareTimer !== null) finishPreparing(); render(); });
render();
