import { ASSESSMENTS } from './data/assessments.js';
import { resolveTenant, applyTenantTheme } from './config/tenants.js';
import { createAttempt, answerQuestion, visitQuestion, completeAttempt, countAnswered, getResumeRoute } from './core/assessment.js';
import { createSessionStore } from './core/storage.js';
import { parseRoute, navigate, withGrade } from './core/router.js';
import { renderView, pageTitle } from './ui/views.js';
import { selectHomeDomain, handleHomeTabKey } from './ui/home.js';

const app = document.querySelector('#app');
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

function selectGrade(grade) {
  if (!Object.hasOwn(ASSESSMENTS, grade)) return;
  activeGrade = grade;
  storage.saveGrade(tenant.id, grade);
  if (!currentAttempt()) {
    save(createAttempt(tenant.id, assessment()));
    go('#intro');
  } else {
    go(countAnswered(currentAttempt(), assessment()) || currentAttempt().status === 'completed'
      ? getResumeRoute(currentAttempt(), assessment()) : '#intro');
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

function refreshAnswerUI(value) {
  const count = countAnswered(currentAttempt(), assessment());
  const total = assessment().questions.length;
  app.querySelectorAll('.choice').forEach(label => {
    label.classList.toggle('is-selected', label.querySelector('input').checked);
  });
  app.querySelector('[data-action="next"]').disabled = false;
  app.querySelector('[data-progress-text]').textContent = `${count}개 응답 · ${Math.round(count / total * 100)}%`;
  const progress = app.querySelector('[role="progressbar"]');
  progress.setAttribute('aria-valuenow', count);
  progress.setAttribute('aria-valuetext', `${total}개 중 ${count}개 응답`);
  progress.firstElementChild.style.width = `${count / total * 100}%`;
  app.querySelector('#response-status').textContent = `${assessment().options.find(o => o.value === value).label}, 응답했어요.`;
  if (!storage.available) {
    app.querySelector('[data-storage-notice]').textContent = '이 브라우저에서는 임시 저장을 사용할 수 없어요. 새로고침하면 답변이 사라질 수 있어요.';
  }
}

app.addEventListener('change', event => {
  const input = event.target;
  if (!(input instanceof HTMLInputElement) || input.name !== 'response') return;
  const route = parseRoute(location.hash);
  if (route.page !== 'test' || currentAttempt()?.status !== 'in_progress') return;
  const question = assessment().questions[route.index];
  const value = Number(input.value);
  if (input.dataset.question !== question.id || !assessment().options.some(o => o.value === value)) return;
  save(answerQuestion(currentAttempt(), assessment(), question.id, value));
  // Update only the response controls so native radio keyboard focus is preserved.
  refreshAnswerUI(value);
});

app.addEventListener('click', event => {
  const button = event.target.closest('button[data-action]');
  if (!button || button.disabled) return;
  const action = button.dataset.action;
  if (action === 'home-domain') return selectHomeDomain(app, button.dataset.domain);
  if (action === 'select-grade') return selectGrade(button.dataset.grade);
  if (!assessment() || !currentAttempt()) return;
  const route = parseRoute(location.hash);
  const index = Number(button.dataset.index);
  if (action === 'begin') go(getResumeRoute(currentAttempt(), assessment()));
  else if (action === 'previous') {
    go(route.fromReview ? '#review' : index === 0 ? '#intro' : `#test/${index - 1}`);
  } else if (action === 'next') {
    const q = assessment().questions[route.index];
    if (!q || !Object.hasOwn(currentAttempt().answers, q.id)) return;
    go(route.fromReview || index === assessment().questions.length - 1 ? '#review' : `#test/${index + 1}`);
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

app.addEventListener('keydown', event => handleHomeTabKey(event, app));

document.querySelector('.skip-link').addEventListener('click', event => {
  event.preventDefault();
  const main = document.querySelector('#main');
  main?.focus();
  main?.scrollIntoView({ block: 'start' });
});

window.addEventListener('hashchange', render);
render();
