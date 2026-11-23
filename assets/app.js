/*
  C-Finder 진단검사 프런트엔드 뼈대
  이 파일의 DEMO_BANKS는 실제 검사 도구가 아닙니다.
  정식 문항과 연구팀 승인 채점 모듈은 별도 검증 후 연결해야 합니다.
*/
(() => {
  'use strict';
  const STORAGE_KEY = 'cfinder_assessment_demo_v1';
  const OPTIONS = [
    '전혀 그렇지 않다',
    '그렇지 않은 편이다',
    '보통이다',
    '그런 편이다',
    '매우 그렇다'
  ];
  const DEMO_BANKS = Object.freeze({
    middle: [
      { id: 'M-DEMO-01', domain: '흥미', text: '내가 좋아하는 활동에 대해서 더 알아보고 싶다.' },
      { id: 'M-DEMO-02', domain: '적성', text: '새로운 활동에 도전할 때 내가 잘할 수 있는 방법을 찾아본다.' },
      { id: 'M-DEMO-03', domain: '가치관', text: '내가 앞으로 하는 일이 나에게 왜 중요한지 생각해 본다.' }
    ],
    high: [
      { id: 'H-DEMO-01', domain: '흥미', text: '관심 있는 분야에 대해 스스로 자료를 찾아 탐색하는 편이다.' },
      { id: 'H-DEMO-02', domain: '적성', text: '새로운 과제를 해결할 때 자신의 강점을 활용하려고 한다.' },
      { id: 'H-DEMO-03', domain: '가치관', text: '진로를 선택할 때 내가 중요하게 생각하는 기준이 무엇인지 고민한다.' }
    ]
  });
  const GRADES = { middle: '중학생용', high: '고등학생용' };
  const app = document.getElementById('app');

  function blankState() { return { grade: null, answers: {} }; }
  function loadState() {
    try {
      const parsed = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null');
      if (!parsed || !GRADES[parsed.grade] || typeof parsed.answers !== 'object' || !parsed.answers) return blankState();
      const bank = DEMO_BANKS[parsed.grade];
      const answers = {};
      for (const q of bank) if (Number.isInteger(parsed.answers[q.id]) && parsed.answers[q.id] >= 1 && parsed.answers[q.id] <= OPTIONS.length) answers[q.id] = parsed.answers[q.id];
      return { grade: parsed.grade, answers };
    } catch (_) { return blankState(); }
  }
  let state = loadState();
  let warning = '';
  function saveState() {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) { /* 저장 불가 브라우저도 지원 */ }
  }
  function clean(text) {
    return String(text).replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s]));
  }
  function go(page, index) {
    warning = '';
    const next = '#' + page + (Number.isInteger(index) ? '/' + index : '');
    if (location.hash !== next) location.hash = next;
    render();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  function route() {
    const [page = 'home', arg] = (location.hash.replace(/^#/, '') || 'home').split('/');
    return { page, index: /^\d+$/.test(arg || '') ? Number(arg) : 0 };
  }
  function getQuestions() { return DEMO_BANKS[state.grade] || []; }
  function answeredCount() { return getQuestions().filter(q => state.answers[q.id] != null).length; }
  function labelForResponse(value) { return value ? OPTIONS[value - 1] : '미응답'; }
  function header() {
    return `<header class="site-header"><div class="header-inner">
      <a class="brand" href="#home" aria-label="C-Finder 메인으로">C-Finder</a>
      <nav class="header-right" aria-label="서비스 메뉴">
        <a class="muted-link" href="#home">검사 안내</a>
        <span class="header-pill">진단검사 프로그램</span>
      </nav></div></header>`;
  }
  function footer() {
    return `<footer class="site-footer"><div class="footer-inner">
      <span>© 사자가온다(주) · C-Finder</span>
      <span>현재 화면은 개발용 시연 버전입니다.</span>
    </div></footer>`;
  }
  function layout(content) { app.innerHTML = header() + `<main id="main" class="shell">${content}</main>` + footer(); }

  function home() {
    layout(`<div class="hero-grid">
      <section class="hero-copy" aria-labelledby="home-heading">
        <span class="eyebrow">C-Finder 진로심리검사</span>
        <h1 class="title-xl" id="home-heading">나를 알아가는 시간,<br/><span class="inline-marker">진로를 발견하는 시작.</span></h1>
        <p class="lead">진로 흥미, 적성, 가치관을 하나의 검사로 알아볼 수 있어요. 지금의 나를 이해하는 것부터 시작해 보세요.</p>
        <div class="hero-meta"><span class="chip">흥미</span><span class="chip">적성</span><span class="chip">가치관</span></div>
        <p class="status-banner"><strong>프로토타입 안내</strong><br/>검사 화면과 이동 흐름을 먼저 확인하는 시연 버전입니다. 실제 검사 문항과 진단 결과는 아직 연결되지 않았습니다.</p>
      </section>
      <section class="stage-card" aria-labelledby="choose-grade">
        <div class="stage-head"><strong id="choose-grade">어떤 검사를 시작할까요?</strong><p>현재 학년에 맞는 검사를 선택해 주세요.</p></div>
        <button class="grade-card" data-action="select" data-grade="middle" type="button">
          <span><strong>중학생용 검사</strong><span>중학생의 진로 탐색을 위한 검사</span></span><span class="arrow" aria-hidden="true">→</span>
        </button>
        <button class="grade-card" data-action="select" data-grade="high" type="button">
          <span><strong>고등학생용 검사</strong><span>고등학생의 진로 탐색을 위한 검사</span></span><span class="arrow" aria-hidden="true">→</span>
        </button>
        <p class="note">검사에는 정답이 없어요. 자신의 모습에 가장 가까운 응답을 선택해 주세요.</p>
        ${state.grade ? `<button type="button" class="btn btn-quiet" data-action="continue">진행 중인 ${GRADES[state.grade]} 시연 이어서 하기</button>` : ''}
      </section>
    </div>
    <section class="info-section" aria-labelledby="intro-description"><h2 id="intro-description">C-Finder는 어떤 검사인가요?</h2>
      <p>C-Finder는 나의 진로를 찾아가기 위해 어떤 분야에 흥미가 있는지, 어떤 적성을 가지고 있는지, 그리고 어떤 가치를 중요하게 생각하는지 알아보는 검사예요. 검사 결과는 지금의 특성을 이해하기 위한 자료이며, 시간이 지나면서 달라질 수 있어요.</p>
    </section>`);
  }

  function topCrumb() { return `<div class="breadcrumb"><button type="button" data-action="home">검사 선택</button><span aria-hidden="true">/</span><strong>${GRADES[state.grade] || '검사'}</strong></div>`; }
  function intro() {
    if (!state.grade) return go('home');
    layout(`<div class="flow-shell">${topCrumb()}
      <section class="panel" aria-labelledby="intro-heading">
        <div class="panel-top"><span class="small-label">검사 전 안내</span><span class="grade-badge">${GRADES[state.grade]}</span></div>
        <h1 class="title-lg" id="intro-heading">C-Finder 검사를 시작할까요?</h1>
        <p class="desc">아래 내용을 읽고 편안한 마음으로 응답해 주세요.</p>
        <div class="intro-points">
          <div class="intro-point"><span class="point-icon" aria-hidden="true">1</span><div><strong>여러분의 진로 흥미, 적성, 가치관을 알아보는 검사예요.</strong><p>나의 진로를 찾아가기 위해 어떤 분야에 흥미가 있는지, 어떤 적성을 가지고 있는지, 그리고 어떤 가치를 중요하게 생각하는지 알아보는 검사예요.</p></div></div>
          <div class="intro-point"><span class="point-icon" aria-hidden="true">2</span><div><strong>본 검사는 시험이 아니에요.</strong><p>정답이 정해진 시험이 아니에요. 지금 나의 모습에 가장 가까운 답을 골라주세요.</p></div></div>
          <div class="intro-point"><span class="point-icon" aria-hidden="true">3</span><div><strong>나의 진로 특성은 변화할 수 있어요.</strong><p>검사 결과는 현재 상태를 살펴보는 내용이에요. 나의 관심사나 중요하게 생각하는 가치에 따라 결과도 자연스럽게 변할 수 있어요.</p></div></div>
        </div>
        <p class="status-banner">지금은 실제 검사 대신, 각 영역의 시연 문항으로 화면과 응답 방식을 확인합니다. 응답 척도도 확정 전 예시입니다.</p>
        <div class="actions"><button class="btn btn-outline" type="button" data-action="home">이전으로</button>
          <div class="action-right"><button class="btn btn-primary" type="button" data-action="begin">문항 응답 시작하기</button></div>
        </div>
        <p class="privacy">시연 답변은 서버에 전송되지 않고 현재 브라우저 탭에서만 임시 보관됩니다.</p>
      </section></div>`);
  }

  function sidebar(stage) {
    const steps = [{key:'intro', label:'검사 안내'}, {key:'test',label:'문항 응답'}, {key:'review',label:'응답 검토'}, {key:'complete',label:'완료'}];
    const curr = steps.findIndex(s => s.key === stage);
    return `<aside class="sidebar" aria-label="검사 진행 단계">
      <div class="section-title">${GRADES[state.grade]}</div><p>진행 상황</p>
      <ol class="step-list">${steps.map((s, i) => `<li class="${i===curr?'current':i<curr?'done':''}" ${i===curr?'aria-current="step"':''}>${s.label}</li>`).join('')}</ol>
      <p class="privacy">정식 문항 연결 전<br/>개발용 시연 단계</p>
    </aside>`;
  }
  function question(index) {
    if (!state.grade) return go('home');
    const questions = getQuestions();
    const i = Math.max(0, Math.min(index, questions.length-1));
    const q = questions[i];
    const answer = state.answers[q.id];
    const progress = ((i+1)/questions.length)*100;
    layout(`<div class="question-layout">
      ${sidebar('test')}
      <section class="panel question-panel" aria-labelledby="question-heading">
        <div class="panel-top"><span class="small-label">문항 응답</span><span class="grade-badge">${GRADES[state.grade]}</span></div>
        <div class="progress-head"><span><strong>${i+1}</strong> / ${questions.length} 문항</span><span>응답 완료 ${answeredCount()}문항</span></div>
        <div class="progress-track" role="progressbar" aria-label="검사 진행률" aria-valuenow="${i+1}" aria-valuemin="0" aria-valuemax="${questions.length}"><div class="progress-fill" style="width:${progress}%"></div></div>
        <div class="small-label">${clean(q.domain)} 영역 · 시연용 가상 문항</div>
        <h1 id="question-heading" class="question-title">${clean(q.text)}</h1>
        <p class="question-sub">현재 자신에게 가장 가까운 응답을 하나 선택해 주세요.</p>
        <div class="choice-list" role="radiogroup" aria-label="문항 응답 선택">
          ${OPTIONS.map((opt,j)=>`<label class="choice ${answer===j+1?'selected':''}">
            <input type="radio" name="response" data-action="answer" data-question="${q.id}" value="${j+1}" ${answer===j+1?'checked':''} />
            <span>${clean(opt)}</span></label>`).join('')}
        </div>
        ${warning ? `<p class="alert" role="alert">${clean(warning)}</p>` : ''}
        <div class="actions">
          <button class="btn btn-outline" type="button" data-action="prev" data-index="${i}">${i===0?'안내로':'이전 문항'}</button>
          <div class="action-right"><button class="btn btn-primary" type="button" data-action="next" data-index="${i}" ${answer==null?'disabled':''}>${i===questions.length-1?'응답 검토하기':'다음 문항'}</button></div>
        </div>
        <p class="privacy">답변은 탭이 열려 있는 동안만 임시 저장됩니다. 시연 문항으로는 진로 유형을 산출하지 않습니다.</p>
      </section></div>`);
  }
  function review() {
    if (!state.grade) return go('home');
    const questions = getQuestions();
    const complete = answeredCount() === questions.length;
    layout(`<div class="flow-shell">${topCrumb()}
      <section class="panel" aria-labelledby="review-title">
        <div class="panel-top"><span class="small-label">응답 검토</span><span class="grade-badge">${GRADES[state.grade]}</span></div>
        <h1 class="title-lg" id="review-title">응답을 모두 확인해 주세요.</h1>
        <p class="desc">${questions.length}개 시연 문항 중 ${answeredCount()}개에 응답했습니다. 답을 바꾸고 싶으면 수정하기를 선택해 주세요.</p>
        <div class="review-list">${questions.map((q,i)=>`<div class="review-row">
          <span class="domain">${clean(q.domain)}</span>
          <div><strong>${clean(q.text)}</strong><small>${clean(labelForResponse(state.answers[q.id]))}</small></div>
          <button type="button" data-action="edit" data-index="${i}" aria-label="${i+1}번째 응답 수정하기">수정하기</button>
        </div>`).join('')}</div>
        <div class="actions"><button class="btn btn-outline" type="button" data-action="prev-review">마지막 문항</button>
          <div class="action-right"><button class="btn btn-primary" type="button" data-action="finish" ${complete?'':'disabled'}>시연 검사 완료</button></div>
        </div>
        <p class="privacy">이는 개발 단계의 화면 테스트입니다. 완료 시 외부 서버로 데이터가 제출되지 않습니다.</p>
      </section></div>`);
  }
  function complete() {
    if (!state.grade) return go('home');
    if (answeredCount() !== getQuestions().length) return go('review');
    layout(`<div class="flow-shell">${topCrumb()}
      <section class="panel" aria-labelledby="complete-title">
        <div class="check-icon" aria-hidden="true">✓</div>
        <div class="small-label">검사 화면 시연 완료</div>
        <h1 id="complete-title" class="title-lg">모든 시연 문항에 응답했어요.</h1>
        <p class="desc">검사 시작부터 문항 응답, 답변 수정, 완료까지의 흐름을 확인했습니다. 아직 정식 문항과 채점 엔진이 연결되지 않아 개인 진로 유형은 산출되지 않습니다.</p>
        <div class="result-grid">
          <div class="result-box"><strong>흥미 분석</strong><p>정식 문항·채점식 연결 후 결과를 표시합니다.</p></div>
          <div class="result-box"><strong>적성·가치관</strong><p>영역별 점수 및 해석 기준 연결 예정입니다.</p></div>
          <div class="result-box"><strong>진로 유형·직업</strong><p>연구팀 검증된 결과 코드와 직업 매핑을 연결합니다.</p></div>
        </div>
        <div class="actions"><button class="btn btn-outline" data-action="home" type="button">처음 화면으로</button>
          <div class="action-right"><button class="btn btn-primary" data-action="restart" type="button">다시 시연하기</button></div></div>
        <p class="privacy">문항은 가상 예시이며, 실제 진로검사 결과로 사용하거나 상담에 활용하면 안 됩니다.</p>
      </section></div>`);
  }
  function render() {
    const {page,index} = route();
    document.title = `C-Finder | ${({home:'진로검사',intro:'검사 안내',test:'문항 응답',review:'응답 검토',complete:'완료'})[page] || '진로검사'}`;
    if (page === 'home') home();
    else if (page === 'intro') intro();
    else if (page === 'test') question(index);
    else if (page === 'review') review();
    else if (page === 'complete') complete();
    else home();
  }
  app.addEventListener('change', (event) => {
    const el = event.target;
    if (el.matches('input[data-action="answer"]')) {
      const questions = getQuestions();
      if (!questions.some(q=>q.id === el.dataset.question)) return;
      state.answers[el.dataset.question] = Number(el.value);
      saveState();
      warning = '';
      render();
      const focus = document.querySelector(`input[name="response"][value="${el.value}"]`);
      if (focus) focus.focus({ preventScroll: true });
    }
  });
  app.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-action]');
    if (!btn || btn.disabled) return;
    const action = btn.dataset.action;
    const i = Number(btn.dataset.index) || 0;
    if (action === 'select') {
      const grade = btn.dataset.grade;
      if (!GRADES[grade]) return;
      state = { grade, answers: {} };
      saveState();
      go('intro');
    } else if (action === 'continue') go('test', 0);
    else if (action === 'home') go('home');
    else if (action === 'begin') go('test', 0);
    else if (action === 'prev') i===0 ? go('intro') : go('test',i-1);
    else if (action === 'next') {
      const q = getQuestions()[i];
      if (!q || !state.answers[q.id]) { warning='응답을 선택한 다음 이동해 주세요.'; render(); return; }
      if (i===getQuestions().length-1) go('review'); else go('test',i+1);
    } else if (action === 'prev-review') go('test', getQuestions().length-1);
    else if (action === 'edit') go('test', i);
    else if (action === 'finish' && answeredCount()===getQuestions().length) go('complete');
    else if (action === 'restart') { state.answers={}; saveState(); go('intro'); }
  });
  window.addEventListener('hashchange', render);
  render();
})();