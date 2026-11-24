const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#promo-nav');

function setMenu(open) {
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
  navigation.classList.toggle('is-open', open);
}
menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
navigation.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    menuButton.focus();
  }
});
window.matchMedia('(min-width: 951px)').addEventListener('change', event => { if (event.matches) setMenu(false); });

// Integration hook only. No analytics provider is loaded without an approved configuration.
// Event detail intentionally excludes form values, the URL, and query parameters.
function track(name, detail = {}) {
  document.dispatchEvent(new CustomEvent('cfinder:promotion', { detail: { event: name, page: 'about', ...detail } }));
}
document.querySelectorAll('[data-event]').forEach(link => {
  link.addEventListener('click', () => track(link.dataset.event));
});

const inquiryForm = document.querySelector('#inquiry-form');
const consent = document.querySelector('#inquiry-consent');
const prepareButton = inquiryForm.querySelector('[type="submit"]');
const draftPanel = document.querySelector('#inquiry-draft');
const draftBody = document.querySelector('#draft-body');
const copyStatus = document.querySelector('#copy-status');
const subject = '[C-Finder] 검사 도입 문의';
const recipient = 'sajagaonda@gmail.com';
let draftText = '';

function updateConsent() { prepareButton.disabled = !consent.checked; }
consent.addEventListener('change', updateConsent);
window.addEventListener('pageshow', updateConsent);
updateConsent();

// Trim required text before native validation. Spaces alone are not a name or contact number.
['name', 'phone', 'email'].forEach(name => {
  const field = inquiryForm.elements.namedItem(name);
  field.addEventListener('input', () => field.setCustomValidity(''));
  field.addEventListener('change', () => { field.value = field.value.trim(); });
});

inquiryForm.addEventListener('submit', event => {
  event.preventDefault();
  for (const name of ['name', 'phone', 'email']) {
    const field = inquiryForm.elements.namedItem(name);
    field.value = field.value.trim();
  }
  const phoneField = inquiryForm.elements.namedItem('phone');
  const validPhone = /^[+\d\s()-]+$/.test(phoneField.value) && phoneField.value.replace(/\D/g, '').length >= 7;
  phoneField.setCustomValidity(validPhone ? '' : '연락 가능한 전화번호를 숫자 7자리 이상으로 입력해 주세요.');
  if (!inquiryForm.reportValidity() || !consent.checked) return;
  const data = new FormData(inquiryForm);
  const value = name => String(data.get(name) || '').trim();
  draftText = [
    'C-Finder 검사 도입에 관해 문의드립니다.', '',
    `구분: ${value('role')}`, `이름: ${value('name')}`,
    `소속 학교·기관: ${value('school') || '미입력'}`,
    `연락처: ${value('phone')}`, `이메일: ${value('email')}`,
    `대상 학교급: ${value('grade') || '미정'}`,
    `예상 인원: ${value('count') ? `${value('count')}명` : '미정'}`,
    '', '문의 내용', value('message') || '신청 및 이용 방법을 안내해 주세요.'
  ].join('\n');
  draftBody.textContent = draftText;
  document.querySelector('#draft-mailto').href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(draftText)}`;
  copyStatus.textContent = '';
  inquiryForm.hidden = true;
  draftPanel.hidden = false;
  draftPanel.focus({ preventScroll: true });
  draftPanel.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  track('inquiry_draft_prepared');
});

document.querySelector('#edit-inquiry').addEventListener('click', () => {
  draftPanel.hidden = true;
  inquiryForm.hidden = false;
  inquiryForm.elements.namedItem('role').focus();
});
document.querySelector('#copy-draft').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(`받는 사람: ${recipient}\n제목: ${subject}\n\n${draftText}`);
    copyStatus.textContent = '문의 내용을 복사했습니다. 사용하시는 메일에 붙여넣어 주세요.';
  } catch {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(draftBody);
    selection.removeAllRanges();
    selection.addRange(range);
    copyStatus.textContent = '자동 복사를 사용할 수 없어 내용을 선택했습니다. 복사한 뒤 메일에 붙여넣어 주세요.';
  }
});
document.querySelector('#draft-mailto').addEventListener('click', () => track('inquiry_mail_app_opened'));

const reachedDepths = new Set();
let scheduled = false;
function measureScroll() {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  if (total > 0) {
    const depth = Math.min(100, ((window.scrollY + 2) / total) * 100);
    for (const milestone of [25, 50, 75, 100]) {
      if (depth >= milestone && !reachedDepths.has(milestone)) {
        reachedDepths.add(milestone);
        track('scroll_depth', { percent: milestone });
      }
    }
  }
  scheduled = false;
}
window.addEventListener('scroll', () => {
  if (!scheduled) { scheduled = true; requestAnimationFrame(measureScroll); }
}, { passive: true });
