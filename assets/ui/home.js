import { SAMPLE_REPORT } from './sample-report.js';
import { letterArt } from './letter-art.js';
import { escapeHtml as e } from './html.js';
const TYPES = Object.freeze([
 ['R','현실형','실행과 현장','도구와 사물을 다루는 활동'],
 ['I','탐구형','탐색과 연구','분석하고 원리를 알아보는 활동'],
 ['A','예술형','표현과 창작','아이디어를 만들고 표현하는 활동'],
 ['S','사회형','소통과 지원','사람을 돕고 함께하는 활동'],
 ['E','진취형','설득과 기획','계획을 추진하고 이끄는 활동'],
 ['C','관습형','정리와 관리','자료를 체계적으로 다루는 활동']
]);
function typeCard([code,name,focus,description]) {
  return `<article class="lab-type"><div class="lab-type-art">${letterArt(code)}</div><div class="lab-type-info"><span>${e(focus)}</span><h3>${e(name)}</h3><p>${e(description)}</p></div></article>`;
}
function riasecRows() {
 return SAMPLE_REPORT.riasec.map(([code,score,name])=>`<div class="lab-riasec-row"><span>${code} <small>${e(name)}</small></span><strong>${score}</strong></div>`).join('');
}
export function renderHome({storageAvailable}) {
 return `<div class="lab-home cf-editorial">
 <section class="lab-hero" aria-labelledby="page-heading">
   <div class="lab-hero-main">
     <h1 id="page-heading" tabindex="-1">내가 좋아하는 일은 뭘까?<br><span>나에게 맞는 진로를 찾아보세요.</span></h1>
     <p class="lab-hero-description">흥미·적성·가치관을 함께 살펴보는 C-Finder 진로검사</p>
   </div>
   <div class="cf-hero-letter cf-hero-visual">
     <span class="cf-hero-glow" aria-hidden="true"></span><span class="cf-impact-orb cf-impact-one" aria-hidden="true"></span><span class="cf-impact-orb cf-impact-two" aria-hidden="true"></span><span class="cf-impact-orb cf-impact-three" aria-hidden="true"></span>
     <span class="cf-hero-spark cf-hero-spark-one" aria-hidden="true"></span>
     <span class="cf-hero-spark cf-hero-spark-two" aria-hidden="true"></span>
     <span class="cf-hero-spark cf-hero-spark-three" aria-hidden="true"></span>
     <button class="cf-hero-character" type="button" data-action="play-hero-character" aria-label="C-Finder 캐릭터와 인사하기">
       ${letterArt('C', 'hero', true)}
       <span class="cf-hero-reaction" role="status" aria-live="polite" aria-atomic="true"></span>
     </button>
   </div>
   <div class="lab-hero-actions"><a class="btn btn-primary lab-main-cta" href="#start">진단 시작하기 <span aria-hidden="true">→</span></a></div>
   ${!storageAvailable ? '<p class="lab-storage-warning" role="status">이 브라우저는 답변 임시 저장이 제한됩니다.</p>' : ''}
 </section>

 <section class="cf-discovery" aria-labelledby="cf-discovery-title"><h2 id="cf-discovery-title" class="lab-section-heading">나를 발견하는 세 가지 단서</h2><p>좋아하는 일, 잘할 수 있다고 느끼는 일, 중요하게 생각하는 가치를 함께 살펴보세요.</p><div class="cf-discovery-grid"><article><span>INTEREST</span><h3>흥미</h3><p>어떤 활동을 할 때 즐겁고 더 알아보고 싶은지 살펴봐요.</p></article><article><span>APTITUDE</span><h3>적성</h3><p>내가 자신감을 느끼는 활동과 스스로 생각하는 강점을 찾아봐요.</p></article><article><span>VALUES</span><h3>가치관</h3><p>미래의 일과 생활에서 무엇을 중요하게 생각하는지 알아봐요.</p></article></div></section>
 <section class="lab-types" aria-labelledby="lab-types-title">
   <div class="lab-section-headline"><div><h2 id="lab-types-title" class="lab-section-heading">진로 유형 살펴보기</h2><p>Holland RIASEC 6유형</p></div><a href="#report">유형 결과 예시 →</a></div>
   <div class="lab-type-grid">${TYPES.map(typeCard).join('')}</div>
   <p class="lab-type-note">유형 설명은 일반적인 탐색 정보입니다. 실제 C-Finder 진로 유형은 정식 검사 기준으로 산출해야 합니다.</p>
 </section>
 <section class="lab-process" aria-labelledby="lab-process-title">
   <div class="lab-section-headline lab-process-heading">
     <div><h2 id="lab-process-title" class="lab-section-heading">검사 이용 방법</h2><p>다니는 학교를 선택하고 관심·강점·가치를 차례로 살펴보세요.</p></div>
     <a href="#start">검사 시작하기 →</a>
   </div>
   <ol class="lab-process-flow">
     <li><span class="lab-process-index">01</span><div><strong>검사 선택</strong><p>중학생 · 고등학생 · 대학생 체험</p></div></li>
     <li><span class="lab-process-index">02</span><div><strong>문항 응답</strong><p>한 화면에 최대 5문항씩 응답</p></div></li>
     <li><span class="lab-process-index">03</span><div><strong>결과지 예시</strong><p>샘플 진로 유형과 분석 확인</p></div></li>
   </ol>
   <p class="lab-process-note">중·고등 49개 요인 자기탐색은 비공식 설문으로, 진로 유형을 판정하지 않습니다.</p>
 </section>
 <section class="lab-result-section" aria-labelledby="lab-result-title">
   <div class="lab-section-headline"><div><h2 id="lab-result-title" class="lab-section-heading">결과 화면 예시</h2><p>고등학생용 샘플 보고서</p></div><a href="#report">상세 결과 보기 →</a></div>
   <div class="lab-result-card">
     <div class="lab-result-profile"><div class="cf-result-letters">${letterArt('E', 'result')}${letterArt('S', 'result')}</div><span class="lab-type-badge">ES</span><h3>설득하는 조력가</h3><p>${e(SAMPLE_REPORT.typeDescription)}</p><div class="lab-result-description"><strong>추천 직업</strong><span>여행기획자 · 연예인 매니저 · 캐스팅디렉터 외</span></div></div>
     <div class="lab-result-bars"><h4>상위 요인</h4><div class="lab-score-row"><span>흥미</span><strong>사무·회계</strong><em>5</em></div><div class="lab-score-row"><span>적성</span><strong>언어이해력</strong><em>5</em></div><div class="lab-score-row"><span>가치관</span><strong>사회적 인정</strong><em>12</em></div><small>각 영역의 점수 척도는 서로 다릅니다.</small></div>
     <div class="lab-radar"><h4>RIASEC 점수</h4><div class="lab-riasec-list">${riasecRows()}</div></div>
   </div>
   <p class="lab-demo-note">현재 자기탐색 응답으로는 공식 진로 유형이 산출되지 않습니다.</p>
 </section>
 <section class="lab-bottom-cta" aria-labelledby="lab-cta-title">
   <div class="lab-cta-heading"><div><h2 id="lab-cta-title">진로검사 시작하기</h2><p>대상을 선택하고 검사 화면을 체험해 보세요.</p></div><a class="btn btn-primary" href="#start">진단 시작하기 <span aria-hidden="true">→</span></a></div>
   <div class="lab-audience-grid" aria-label="검사 대상"><div><strong>중학생용</strong><span>관심 분야와 적성 탐색</span></div><div><strong>고등학생용</strong><span>진로 유형과 직업 탐색</span></div><div><strong>대학생용</strong><span>전공·직무 관심 탐색 <em>체험</em></span></div></div>
 </section>
 <section class="lab-faq" aria-labelledby="lab-faq-title">
   <div class="lab-faq-intro"><h2 id="lab-faq-title" class="lab-section-heading">자주 묻는 질문</h2><p>검사 이용부터 결과 확인, 학교 도입까지 안내합니다.</p><a href="./about/#contact">학교 도입 문의하기</a></div>
   <div class="lab-faq-list">
     <details><summary>누가 검사할 수 있나요?</summary><div class="lab-faq-answer"><p>C-Finder는 중학생과 고등학생의 진로 탐색을 위해 개발된 검사입니다. 학교급에 맞게 문항을 별도로 구성했습니다.</p><p>현재 중학생용·고등학생용은 결과지의 49개 하위 요인에 기반한 자기탐색 설문을 제공합니다. 대학생용은 3문항 화면 체험이며, 정식 대학생 검사는 아직 제공하지 않습니다.</p></div></details>
     <details><summary>검사에는 얼마나 시간이 걸리나요?</summary><div class="lab-faq-answer"><p>정식 C-Finder는 흥미·적성·가치관을 한 번에 살펴보는 약 10분 단축형 검사로 기획됐습니다. 중학생용과 고등학생용이 별도로 구성됩니다.</p><p>현재 제공되는 중·고등 49항목 자기탐색은 정식 검사를 대체하지 않으며, 실제 C-Finder 문항 수와 응답 시간은 연구팀 원본을 확인해야 합니다.</p></div></details>
     <details><summary>어떤 내용을 검사하나요?</summary><div class="lab-faq-answer"><p>흥미는 좋아하고 관심을 느끼는 분야, 적성은 강점을 보이는 능력, 가치관은 일과 진로를 선택할 때 중요하게 생각하는 기준을 살펴봅니다.</p><p>제공된 고등학생용 샘플 보고서에는 흥미 27개, 적성 13개, 가치관 9개 하위 요인의 점수와 해석이 포함돼 있습니다. 이 수치는 문항 수가 아니라 분석 항목 수입니다.</p></div></details>
     <details><summary>검사를 마치면 어떤 결과를 볼 수 있나요?</summary><div class="lab-faq-answer"><p>정식 결과지 예시에는 학생의 통합 진로 프로파일, 흥미·적성·가치관 분석, Holland RIASEC 기반 최종 진로 유형, 유형의 특징 및 추천 직업이 담겨 있습니다.</p><p>현재 중·고등 자기탐색은 관심 분야·스스로 느끼는 강점·가치 우선순위의 직접 응답만 정리하며, 공식 점수나 진로 유형을 자동으로 산출하지 않습니다. <a href="#report">샘플 결과지</a>에서 보고서 구성과 그래프를 확인할 수 있습니다.</p></div></details>
     <details><summary>응답을 중간에 멈췄다가 다시 할 수 있나요?</summary><div class="lab-faq-answer"><p>현재 자기탐색 응답은 같은 브라우저 탭에 임시 저장됩니다. 화면을 이동하거나 같은 탭에서 새로고침한 후에도 이어서 진행할 수 있습니다.</p><p>탭을 닫거나 다른 기기로 이동하면 기록이 복원되지 않을 수 있습니다. 체험을 완료한 뒤 다시 응답하려면 새로 시작해야 합니다.</p></div></details>
     <details><summary>학교에서 한 학급이 함께 이용할 수 있나요?</summary><div class="lab-faq-answer"><p>학교 도입을 검토할 때 대상 학년과 학급 수, 예상 학생 수, PC·태블릿·모바일 이용 환경, 희망 일정을 함께 확인합니다.</p><p>학급별 검사 링크 발급, 담당교사 관리 화면, 결과 열람 방식 등 실제 운영 기능은 도입 조건에 따라 협의가 필요합니다. 현재 공개된 화면 체험에 해당 기능이 모두 구현된 것은 아닙니다.</p></div></details>
     <details><summary>학생 결과는 누가 확인할 수 있나요?</summary><div class="lab-faq-answer"><p>학생·교사·학부모가 각각 어떤 결과를 열람하고 공유할 수 있는지는 학교의 운영 방식과 개인정보 처리 기준에 따라 정해야 합니다.</p><p>현재 사이트의 화면 체험은 학생 이름이나 학교 정보를 입력받지 않으며, 정식 결과의 저장·공유 기능은 아직 연결되지 않았습니다.</p></div></details>
     <details><summary>학교 도입 비용과 신청 방법은 어떻게 되나요?</summary><div class="lab-faq-answer"><p>학교급, 참여 인원, 이용 목적, 희망 일정 등을 알려주시면 도입 방식과 비용을 확인할 수 있습니다. 현재 공개된 확정 가격표는 없습니다.</p><p><a href="./about/#contact">학교 도입 문의하기</a>에서 문의 내용을 작성하고 메일로 전송할 수 있습니다. 문의 폼은 아직 자동 접수가 아닌 메일 작성 방식입니다.</p></div></details>
   </div>
 </section>
 </div>`;
}
export function selectHomeDomain() {}
export function handleHomeTabKey() {}
