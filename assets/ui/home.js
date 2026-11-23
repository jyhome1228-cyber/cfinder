import { SAMPLE_REPORT } from './sample-report.js';
import { escapeHtml as e } from './html.js';

// Original vector portraits illustrate RIASEC families; not official C-Finder outcomes.
const TYPES = [
  { code:'R',name:'현실형',color:'#d5ecff',hair:'#263f6f',shirt:'#3977e9',style:0 },
  { code:'I',name:'탐구형',color:'#e1e6ff',hair:'#35364d',shirt:'#7584dd',style:1 },
  { code:'A',name:'예술형',color:'#ffe5ed',hair:'#ba6786',shirt:'#e48aad',style:2 },
  { code:'S',name:'사회형',color:'#dcf3e7',hair:'#67463f',shirt:'#60ad91',style:3 },
  { code:'E',name:'진취형',color:'#fff0d4',hair:'#614c41',shirt:'#efaa53',style:4 },
  { code:'C',name:'관습형',color:'#e0edf8',hair:'#313c53',shirt:'#6b8fb7',style:5 }
];
function person(t,i){
 const face=['#f2c7ab','#e2ae94','#f1c4ab','#d9a487','#f0c9a8','#e0b090'][i];
 const hair=i===2?'<path d="M30 55Q24 16 62 19Q95 18 91 60Q80 39 72 34Q55 56 30 55Z"/>':i===3?'<path d="M27 51Q22 15 61 17Q96 21 90 54L83 37Q59 48 38 34Z"/>':i===5?'<path d="M30 48Q29 17 61 18Q87 18 89 48L81 37Q55 45 36 38Z"/>':'<path d="M29 52Q23 24 51 19Q71 7 88 31L91 54Q80 39 72 34Q55 54 29 52Z"/>';
 return `<svg viewBox="0 0 120 120" role="img" aria-label="${e(t.name)}을 상징하는 인물 일러스트"><circle cx="60" cy="60" r="58" fill="${t.color}"/><path d="M18 117q3-36 42-37 42 1 43 37" fill="${t.shirt}"/><path d="M46 78v12q14 13 28 0V77" fill="${face}"/><ellipse cx="60" cy="55" rx="31" ry="35" fill="${face}"/><g fill="${t.hair}">${hair}</g><ellipse cx="47" cy="57" rx="2.6" ry="3.2" fill="#233149"/><ellipse cx="73" cy="57" rx="2.6" ry="3.2" fill="#233149"/><path d="M52 71q8 7 16 0" fill="none" stroke="#a7665e" stroke-width="2.3" stroke-linecap="round"/>${[1,5].includes(i)?'<g fill="none" stroke="#38455e" stroke-width="2.2"><rect x="35" y="49" width="22" height="15" rx="6"/><rect x="63" y="49" width="22" height="15" rx="6"/><path d="M57 55h6"/></g>':''}<path d="M50 89L60 99 70 89" stroke="white" stroke-opacity=".66" stroke-width="2.5" fill="none"/></svg>`;
}
function icon(kind){
 const shapes={
  answer:'<rect x="11" y="8" width="30" height="40" rx="5"/><path d="M19 20l3 3 6-7M19 34l3 3 6-7M31 23h4M31 37h4"/>',
  report:'<rect x="8" y="9" width="44" height="36" rx="5"/><path d="M16 36V27M26 36V19M36 36V24M46 36V15"/>',
  career:'<rect x="10" y="21" width="44" height="30" rx="4"/><path d="M25 21v-6h14v6M10 33h44M28 33v7h8v-7"/>'
 };
 return `<svg viewBox="0 0 64 64" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round">${shapes[kind]}</svg>`;
}
function tinyRadar(){
 const scores=SAMPLE_REPORT.riasec.map(x=>x[1]), cx=80,cy=75,rad=56;
 const xy=(i,r)=>[cx+Math.cos(-Math.PI/2+i*Math.PI/3)*r,cy+Math.sin(-Math.PI/2+i*Math.PI/3)*r];
 const poly=values=>values.map((v,i)=>xy(i,rad*v/150).map(x=>x.toFixed(1)).join(',')).join(' ');
 return `<svg viewBox="0 0 160 150" role="img" aria-label="샘플 RIASEC 점수: R 78, I 125, A 118, S 127, E 138, C 101"><g fill="none" stroke="#d9e4f7"><polygon points="${poly(scores.map(()=>150))}"/><polygon points="${poly(scores.map(()=>100))}"/><polygon points="${poly(scores.map(()=>50))}"/></g><polygon points="${poly(scores)}" fill="#2a68ea33" stroke="#245df3" stroke-width="2.5"/></svg>`;
}
function previewBar(name,amount,max){
 return `<div class="lab-score-row"><span>${e(name)}</span><div class="lab-score-track"><i style="width:${Math.round(amount/max*100)}%"></i></div><strong>${amount}</strong></div>`;
}
export function renderHome({tenant,storageAvailable}){
 return `<div class="lab-home">
 <section class="lab-hero" aria-labelledby="page-heading">
   <div class="lab-side-figure lab-side-left" aria-hidden="true">${person(TYPES[0],0)}</div>
   <div class="lab-side-figure lab-side-right" aria-hidden="true">${person(TYPES[2],2)}</div>
   <div class="lab-hero-main">
     <h1 id="page-heading" tabindex="-1">흥미·적성·가치관으로<br><span>나의 진로를 찾다</span></h1>
     <p>흥미·적성·가치관을 함께 알아보는 진로검사</p>
     <div class="lab-hero-actions"><a class="btn btn-primary lab-main-cta" href="#start">진단 시작하기 <span aria-hidden="true">→</span></a><a class="btn lab-sub-cta" href="#report">결과 예시 보기</a></div>
     ${storageAvailable===false?'<p class="lab-storage-warning" role="status">이 브라우저에서는 답변 저장이 제한됩니다.</p>':''}
   </div>
 </section>
 <section class="lab-types" aria-labelledby="lab-types-title"><h2 id="lab-types-title" class="lab-section-heading">다양한 진로 유형</h2>
 <div class="lab-type-grid">${TYPES.map((t,i)=>`<div class="lab-type"><div class="lab-avatar">${person(t,i)}</div><strong>${t.code}</strong><span>${t.name}</span></div>`).join('')}</div>
 <p>Holland RIASEC 6유형 · 유형별 일러스트는 화면 예시</p>
 </section>
 <section class="lab-process" aria-labelledby="lab-process-title"><h2 id="lab-process-title" class="lab-section-heading">검사 진행 방식</h2>
 <div class="lab-step-grid">
 <article><div class="lab-step-icon">${icon('answer')}</div><div><h3>문항 응답</h3><p>질문에 나와 가까운 답을 선택합니다.</p></div></article>
 <article><div class="lab-step-icon">${icon('report')}</div><div><h3>결과 확인</h3><p>흥미·적성·가치관을 분석합니다.</p></div></article>
 <article><div class="lab-step-icon">${icon('career')}</div><div><h3>추천 직업</h3><p>진로 유형과 관련 직업을 살펴봅니다.</p></div></article>
 </div></section>
 <section class="lab-result-section" aria-labelledby="lab-result-title"><div class="lab-section-headline"><h2 id="lab-result-title" class="lab-section-heading">결과 화면 예시</h2><a href="#report">상세 결과 보기 →</a></div>
 <div class="lab-result-card"><div class="lab-result-profile"><div class="lab-result-avatar">${person(TYPES[4],4)}</div><div><span class="lab-type-badge">ES</span><h3>설득하는 조력가</h3><p>${e(SAMPLE_REPORT.typeDescription)}</p></div></div>
 <div class="lab-result-bars"><h4>상위 요인 점수</h4>${previewBar('흥미',5,5)}${previewBar('적성',5,5)}${previewBar('가치관',12,12)}<small>각 영역 최상위 샘플 점수 · 척도는 영역별로 다름</small></div>
 <div class="lab-radar"><h4>RIASEC 유형</h4>${tinyRadar()}</div></div>
 <p class="lab-demo-note">고등학생용 샘플 결과지 기반입니다. 현재 화면 체험 3문항에서는 개인 결과가 산출되지 않습니다.</p></section>
 <section class="lab-bottom-cta" aria-labelledby="lab-cta-title">
   <div class="lab-cta-heading"><div><h2 id="lab-cta-title">진로검사 시작하기</h2><p>대상을 선택하고 검사 화면을 체험해 보세요.</p></div><a class="btn btn-primary" href="#start">진단 시작하기 <span aria-hidden="true">→</span></a></div>
   <div class="lab-audience-grid" aria-label="검사 대상">
     <div><strong>중학생용</strong><span>관심 분야와 적성 탐색</span></div>
     <div><strong>고등학생용</strong><span>진로 유형과 직업 탐색</span></div>
     <div><strong>대학생용</strong><span>전공·직무 관심 탐색 <em>체험</em></span></div>
   </div>
 </section>
 <section class="lab-faq" aria-labelledby="lab-faq-title">
   <div class="lab-faq-intro"><h2 id="lab-faq-title" class="lab-section-heading">자주 묻는 질문</h2><p>검사 이용부터 결과 확인, 학교 도입까지 안내합니다.</p><a href="./about/#contact">학교 도입 문의하기</a></div>
   <div class="lab-faq-list">
     <details><summary>누가 검사할 수 있나요?</summary><div class="lab-faq-answer"><p>C-Finder는 중학생과 고등학생의 진로 탐색을 위해 개발된 검사입니다. 학교급에 맞게 문항을 별도로 구성했습니다.</p><p>현재 사이트에서는 중학생용·고등학생용·대학생용 화면을 체험할 수 있습니다. 대학생용은 별도 예시 문항으로 준비한 체험 화면이며 정식 대학생 검사는 아직 제공하지 않습니다.</p></div></details>
     <details><summary>검사에는 얼마나 시간이 걸리나요?</summary><div class="lab-faq-answer"><p>정식 C-Finder는 흥미·적성·가치관을 한 번에 살펴보는 약 10분 단축형 검사로 기획됐습니다. 중학생용과 고등학생용이 별도로 구성됩니다.</p><p>현재 웹사이트에서 실행하는 검사는 학교급별 3개의 예시 문항으로, 실제 전체 검사 분량과는 다릅니다.</p></div></details>
     <details><summary>어떤 내용을 검사하나요?</summary><div class="lab-faq-answer"><p>흥미는 좋아하고 관심을 느끼는 분야, 적성은 강점을 보이는 능력, 가치관은 일과 진로를 선택할 때 중요하게 생각하는 기준을 살펴봅니다.</p><p>제공된 고등학생용 샘플 보고서에는 흥미 27개, 적성 13개, 가치관 9개 하위 요인의 점수와 해석이 포함돼 있습니다. 이 수치는 문항 수가 아니라 분석 항목 수입니다.</p></div></details>
     <details><summary>검사를 마치면 어떤 결과를 볼 수 있나요?</summary><div class="lab-faq-answer"><p>정식 결과지 예시에는 학생의 통합 진로 프로파일, 흥미·적성·가치관 분석, Holland RIASEC 기반 최종 진로 유형, 유형의 특징 및 추천 직업이 담겨 있습니다.</p><p>현재 3문항 화면 체험은 응답 과정만 확인하는 기능이며 개인 점수나 진로 유형을 자동으로 산출하지 않습니다. <a href="#report">샘플 결과지</a>에서 보고서 구성과 그래프를 확인할 수 있습니다.</p></div></details>
     <details><summary>응답을 중간에 멈췄다가 다시 할 수 있나요?</summary><div class="lab-faq-answer"><p>현재 체험은 응답이 같은 브라우저 탭에 임시 저장됩니다. 화면을 이동하거나 같은 탭에서 새로고침한 후에도 이어서 진행할 수 있습니다.</p><p>탭을 닫거나 다른 기기로 이동하면 기록이 복원되지 않을 수 있습니다. 체험을 완료한 뒤 다시 응답하려면 새로 시작해야 합니다.</p></div></details>
     <details><summary>학교에서 한 학급이 함께 이용할 수 있나요?</summary><div class="lab-faq-answer"><p>학교 도입을 검토할 때 대상 학년과 학급 수, 예상 학생 수, PC·태블릿·모바일 이용 환경, 희망 일정을 함께 확인합니다.</p><p>학급별 검사 링크 발급, 담당교사 관리 화면, 결과 열람 방식 등 실제 운영 기능은 도입 조건에 따라 협의가 필요합니다. 현재 공개된 화면 체험에 해당 기능이 모두 구현된 것은 아닙니다.</p></div></details>
     <details><summary>학생 결과는 누가 확인할 수 있나요?</summary><div class="lab-faq-answer"><p>학생·교사·학부모가 각각 어떤 결과를 열람하고 공유할 수 있는지는 학교의 운영 방식과 개인정보 처리 기준에 따라 정해야 합니다.</p><p>현재 사이트의 화면 체험은 학생 이름이나 학교 정보를 입력받지 않으며, 정식 결과의 저장·공유 기능은 아직 연결되지 않았습니다.</p></div></details>
     <details><summary>학교 도입 비용과 신청 방법은 어떻게 되나요?</summary><div class="lab-faq-answer"><p>학교급, 참여 인원, 이용 목적, 희망 일정 등을 알려주시면 도입 방식과 비용을 확인할 수 있습니다. 현재 공개된 확정 가격표는 없습니다.</p><p><a href="./about/#contact">학교 도입 문의하기</a>에서 문의 내용을 작성하고 메일로 전송할 수 있습니다. 문의 폼은 아직 자동 접수가 아닌 메일 작성 방식입니다.</p></div></details>
   </div>
 </section>
 </div>`;
}
export function selectHomeDomain(){/* Legacy tab hook retained for app compatibility. */}
export function handleHomeTabKey(){/* Homepage no longer uses domain tabs. */}
