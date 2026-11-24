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
    <div class="sr-section-head"><div><h2 id="sr-${id}-heading">${e(title)}</h2><p>자기탐색의 주요 특징을 간추렸어요.</p></div><span class="sr-factor-count">주요 ${topCount}개 항목</span></div>
    <div class="sr-analysis-grid"><div class="sr-analysis-bars">
      ${scoreBars(entries.slice(0,topCount),max)}

    </div><aside class="sr-analysis-aside">
      <h3>상위 요인</h3>
      <div class="sr-top-factors">${entries.slice(0,Math.min(3,topCount)).map(([name,value]) => `<div><span>${e(name)}</span><strong>${value}</strong></div>`).join('')}</div>
      <h3 class="sr-tendency-heading">이렇게 이해해 보세요</h3><p>${e(tendency)}</p>
    </aside></div>

  </section>`;
}
export function renderSampleReport() {
 const d=SAMPLE_REPORT;
 return `<div class="sr-page">
   <div class="sr-top"><h1 id="page-heading" tabindex="-1">C-Finder 진로탐색 결과 예시</h1><div class="sr-report-tools"><span class="sr-demo-marker">서비스 예시 · 실제 검사 결과 아님</span><button type="button" class="sr-print-top" data-action="print-sample-report" aria-label="C-Finder 요약 결과지 PDF 저장">요약 PDF 저장</button></div></div>
   <div class="sr-hero">
     <div class="sr-profile-type"><span class="sr-hero-code">${d.type}</span><div class="cf-report-pair">${letterArt('E', 'report')}${letterArt('S', 'report')}</div><div><h2>${e(d.typeName)}</h2><p>${e(d.typeDescription)}</p></div></div>
     <div class="sr-hero-meta"><strong>${e(d.level)}</strong><span>흥미 · 적성 · 가치관</span></div>
   </div>
   <nav class="sr-anchor-nav" aria-label="결과 예시 항목 보기"><button type="button" data-sr-scroll="sample-interest" aria-current="true">흥미</button><button type="button" data-sr-scroll="sample-aptitude">적성</button><button type="button" data-sr-scroll="sample-values">가치관</button><button type="button" data-sr-scroll="sample-type">유형 예시</button></nav>
   ${section('interest','흥미 분석',d.interest,5,d.tendencies.interest,{topCount:4})}
   ${section('aptitude','적성 분석',d.aptitude,5,d.tendencies.aptitude,{topCount:4})}
   ${section('values','가치관 분석',d.values,12,d.tendencies.values,{topCount:4})}
   <section id="sample-type" class="sr-section" aria-labelledby="sr-type-heading">
     <div class="sr-section-head"><div><h2 id="sr-type-heading">진로 유형 구성 예시</h2><p>RIASEC 6유형</p></div></div>
     <div class="sr-type-layout"><div class="sr-radar-card">${radar(d.riasec)}<div class="sr-radar-values">${d.riasec.map(([code,value,label])=>`<div><span>${code} · ${e(label)}</span><strong>${value}</strong></div>`).join('')}</div></div>
       <div class="sr-type-copy"><h3>${d.type} — ${e(d.typeName)}</h3><p>${e(d.typeDescription)}</p><h4>탐색해 볼 직업 예시</h4><div class="sr-jobs">${d.recommended.slice(0,5).map(job=>`<span>${e(job)}</span>`).join('')}</div></div>
     </div>
   </section>
   <div class="sr-foot-actions"><button type="button" class="btn btn-primary" data-action="print-sample-report">C-Finder 요약 PDF 저장</button><a class="btn btn-outline" href="#start">진단 체험하기</a></div>
   <p class="sr-final-note">이 결과지는 C-Finder에서 재구성한 핵심 요약 예시입니다. 샘플 점수이며, 체험 응답과 무관하고 실제 진단 결과가 아닙니다.</p>
   <p class="sr-print-footnote">C-Finder 자체 양식의 요약 결과 예시 · 실제 개인 검사 결과 아님 · 예시 데이터는 정식 C-Finder 진단 점수가 아닙니다.</p>
 </div>`;
}
