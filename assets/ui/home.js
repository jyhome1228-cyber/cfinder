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
   <div class="lab-faq-intro"><h2 id="lab-faq-title" class="lab-section-heading">자주 묻는 질문</h2><p>검사 이용과 결과에 대한 안내</p><a href="./about/#contact">학교 도입 문의하기</a></div>
   <div class="lab-faq-list">
     <details><summary>누가 검사할 수 있나요?</summary><p>중학생용·고등학생용·대학생용을 선택할 수 있습니다. 현재 세 가지 모두 3문항 화면 체험이며 대학생용 정식 검사는 준비 전입니다.</p></details>
     <details><summary>검사는 얼마나 걸리나요?</summary><p>정식 C-Finder는 약 10분을 기준으로 설계됐습니다. 현재 공개된 화면 체험은 학교급별 예시 문항 3개입니다.</p></details>
     <details><summary>검사 결과는 어떻게 확인하나요?</summary><p>현재 체험에서는 점수와 진로 유형을 계산하지 않습니다. <a href="#report">결과 예시</a>에서 흥미·적성·가치관 분석과 추천 직업이 포함된 고등학생용 샘플 보고서를 확인할 수 있습니다.</p></details>
     <details><summary>응답을 중간에 저장할 수 있나요?</summary><p>같은 브라우저 탭에서 응답을 임시 저장하고 이어서 할 수 있습니다. 탭을 닫거나 기기를 변경하면 응답이 유지되지 않을 수 있습니다.</p></details>
     <details><summary>학교·기관에서 도입하려면?</summary><p>대상 학년, 예상 참여 인원, 희망 일정 등을 <a href="./about/#contact">도입 문의</a>에 남겨 주세요. 비용과 운영 방식은 별도 확인이 필요합니다.</p></details>
   </div>
 </section>
 </div>`;
}
export function selectHomeDomain(){/* Legacy tab hook retained for app compatibility. */}
export function handleHomeTabKey(){/* Homepage no longer uses domain tabs. */}
