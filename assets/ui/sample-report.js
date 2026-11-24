import { escapeHtml as e } from './html.js';
import { letterArt } from './letter-art.js';

// Only intentionally published, summarized demonstration data is shipped to browsers.
export const SAMPLE_REPORT = Object.freeze({
  level: '고등학생용 구성 예시',
  type: 'ES',
  typeName: '설득하는 조력가',
  typeDescription: '사람들과 소통하며 아이디어를 제안하고 함께 활동하는 유형의 예시',
  recommended: ['캐스팅디렉터','연예인 매니저','여행기획자','여행상품 개발원','상품중개인'],
  interest: [['사무·회계',5],['공연 기획·무대 연출',5],['복지·사회서비스',5],['디자인·미술',5]],
  aptitude: [['언어이해력',5],['수리논리력',5],['공간지각력',5],['디지털·정보활용능력',5]],
  values: [['사회적 인정',12],['변화지향',12],['자기계발과 도전',11],['일과 여가의 균형',11]],
  riasec: [['R',78,'현실형'],['I',125,'탐구형'],['A',118,'예술형'],['S',127,'사회형'],['E',138,'진취형'],['C',101,'관습형']],
  tendencies: {
    interest: '기획과 표현, 사람을 돕는 활동 등 여러 관심 영역을 탐색하는 예시입니다.',
    aptitude: '정보를 이해하고 정리하며, 생각을 전달하는 강점을 살펴보는 예시입니다.',
    values: '성장과 변화, 일과 생활의 균형을 생각해 보는 예시입니다.'
  }
});

function scoreBars(entries, max, cssClass = '') {
  return `<div class="sr-bars ${cssClass}">${entries.map(([label,score]) => `<div class="sr-bar-row"><span class="sr-bar-label">${e(label)}</span><div class="sr-bar-track" aria-hidden="true"><span style="width:${Math.round(score/max*100)}%"></span></div><strong class="sr-bar-score">${score}</strong></div>`).join('')}</div>`;
}
function radar(items) {
  // Polar geometry uses illustrative sample values, not viewer answers.
  const center=145, radius=101, max=150;
  const angle=i=>-Math.PI/2 + i*Math.PI/3;
  const xy=(i,v)=>[center+Math.cos(angle(i))*radius*v/max,center+Math.sin(angle(i))*radius*v/max];
  const poly=values=>values.map((v,i)=>xy(i,v).map(n=>n.toFixed(1)).join(',')).join(' ');
  const spokes=items.map((_,i)=>{const [x,y]=xy(i,max);return `<line x1="${center}" y1="${center}" x2="${x}" y2="${y}" />`}).join('');
  const rings=[50,100,150].map(v=>`<polygon points="${poly(items.map(()=>v))}"/>`).join('');
  const labels=items.map(([code,score],i)=>{const [x,y]=xy(i,180);return `<text x="${x}" y="${y+4}" text-anchor="middle">${e(code)}</text>`}).join('');
  return `<svg viewBox="0 0 290 290" class="sr-radar" role="img" aria-label="RIASEC 예시 점수: ${items.map(([code,v])=>`${code} ${v}`).join(', ')}"><g class="sr-radar-grid">${spokes}${rings}</g><polygon class="sr-radar-area" points="${poly(items.map(item=>item[1]))}"/><g class="sr-radar-labels">${labels}</g></svg>`;
}
function section(id,title,entries,max,tendency,options={}) {
  const topCount=options.topCount||5;
  return `<section id="sample-${id}" class="sr-section" aria-labelledby="sr-${id}-heading">
    <div class="sr-section-head"><div><h2 id="sr-${id}-heading">${e(title)}</h2><p>공개용 구성 예시 · 실제 개인 분석 결과가 아닙니다.</p></div><span class="sr-factor-count">대표 ${topCount}개 항목</span></div>
    <div class="sr-analysis-grid"><div class="sr-analysis-bars">
      ${scoreBars(entries.slice(0,topCount),max)}

    </div><aside class="sr-analysis-aside">
      <h3>예시 항목</h3>
      <div class="sr-top-factors">${entries.slice(0,Math.min(3,topCount)).map(([name,value]) => `<div><span>${e(name)}</span><strong>${value}</strong></div>`).join('')}</div>
      <h3 class="sr-tendency-heading">탐색 안내</h3><p>${e(tendency)}</p>
    </aside></div>

  </section>`;
}
export function renderSampleReport() {
 const d=SAMPLE_REPORT;
 return `<div class="sr-page">
   <div class="sr-top"><div><p class="sr-document-kicker">C-FINDER SUMMARY REPORT</p><h1 id="page-heading" tabindex="-1">진로탐색 결과지 미리보기</h1><p class="sr-top-subtitle">나를 이해하는 세 가지 단서와 진로 유형 구성 예시</p></div><div class="sr-report-tools"><span class="sr-demo-marker">가상 샘플 · 실제 검사 결과 아님</span><button type="button" class="sr-print-top" data-action="print-sample-report" aria-label="인쇄 창에서 C-Finder 요약 결과지를 PDF로 저장">인쇄 · PDF 저장</button></div></div>
   <div class="sr-hero">
     <div class="sr-profile-type"><span class="sr-hero-code">${d.type}</span><div class="cf-report-pair">${letterArt('E', 'report')}${letterArt('S', 'report')}</div><div><span class="sr-profile-eyebrow">유형 표현 디자인 예시</span><h2>${e(d.typeName)}</h2><p>${e(d.typeDescription)}</p></div></div>
     <div class="sr-hero-meta"><strong>${e(d.level)}</strong><span>예시 데이터 · 개인 결과 아님</span></div>
   </div>
   <div class="sr-report-notice" role="note"><strong>결과지 안내</strong><p>현재 공개된 자기탐색 49항목의 응답으로 공식 점수·RIASEC 유형·추천 직업을 판정하지 않습니다. 아래 숫자와 유형은 결과지 디자인을 설명하기 위한 별도의 샘플이며 개인 응답과 무관합니다.</p></div>
   <div class="sr-overview" aria-label="결과지 주요 영역"><div><span>INTEREST</span><strong>흥미</strong><p>좋아하는 활동과 관심 분야</p></div><div><span>APTITUDE</span><strong>적성</strong><p>스스로 생각하는 능력과 강점</p></div><div><span>VALUES</span><strong>가치관</strong><p>진로 선택에서 중요한 기준</p></div></div>
   <nav class="sr-anchor-nav" aria-label="결과 예시 항목 보기"><button type="button" data-sr-scroll="sample-interest" aria-current="true">흥미</button><button type="button" data-sr-scroll="sample-aptitude">적성</button><button type="button" data-sr-scroll="sample-values">가치관</button><button type="button" data-sr-scroll="sample-type">유형 예시</button></nav>
   ${section('interest','흥미 분석',d.interest,5,d.tendencies.interest,{topCount:4})}
   ${section('aptitude','적성 분석',d.aptitude,5,d.tendencies.aptitude,{topCount:4})}
   ${section('values','가치관 분석',d.values,12,d.tendencies.values,{topCount:4})}
   <section id="sample-type" class="sr-section" aria-labelledby="sr-type-heading">
     <div class="sr-section-head"><div><h2 id="sr-type-heading">진로 유형 구성 예시</h2><p>RIASEC 구성 예시 · 공식 유형 아님</p></div></div>
     <div class="sr-type-layout"><div class="sr-radar-card">${radar(d.riasec)}<div class="sr-radar-values">${d.riasec.map(([code,value,label])=>`<div><span>${code} · ${e(label)}</span><strong>${value}</strong></div>`).join('')}</div></div>
       <div class="sr-type-copy"><span class="sr-type-eyebrow">가상 유형 사례</span><h3>${d.type} — ${e(d.typeName)}</h3><p>${e(d.typeDescription)}</p><h4>탐색해 볼 직업 예시</h4><div class="sr-jobs">${d.recommended.slice(0,5).map(job=>`<span>${e(job)}</span>`).join('')}</div></div>
     </div>
   </section>
   <div class="sr-foot-actions"><button type="button" class="btn btn-primary" data-action="print-sample-report">인쇄 · PDF 저장</button><a class="btn btn-outline" href="#start">자기탐색 시작하기</a></div>
   <p class="sr-final-note">이 결과지는 C-Finder에서 재구성한 핵심 요약 예시입니다. 샘플 점수이며, 체험 응답과 무관하고 실제 진단 결과가 아닙니다.</p>
   <p class="sr-print-footnote">C-Finder · 공개용 요약 결과지 예시 · 개인 결과 아님 · 표시된 수치는 샘플 데이터입니다.</p>
 </div>`;
}
