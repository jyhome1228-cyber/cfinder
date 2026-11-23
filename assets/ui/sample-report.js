import { escapeHtml as e } from './html.js';

// Source: user-provided "진단검사_만쏘_251206.pdf" (three-page high-school report).
// Demonstration data only; no scoring algorithm, no user-linked results.
export const SAMPLE_REPORT = Object.freeze({
  level: '고등학생용 샘플',
  type: 'ES',
  typeName: '설득하는 조력가',
  typeDescription: '다른 사람을 설득하고 이끌어 함께 목표를 달성하고 돕는 사람',
  recommended: ['캐스팅디렉터','프로바둑기사','연예인 매니저','여행상품 개발원','여행기획자','카지노 딜러','상품중개인','농수산물중개인','바텐더','캐디'],
  interest: [
    ['사무·회계',5],['공연 기획·무대 연출',5],['복지·사회서비스',5],['디자인·미술',5],['철학·사회학',5],
    ['경영·기획·마케팅',4],['교육·지도·상담',4],['콘텐츠·영상미디어·언론',4],['여행·문화체험',4],['여가·레저 기획',4],['언어·문학·글쓰기',4],
    ['AI·컴퓨터·정보보안',3],['자연과학·탐구',3],['건축',3],['환경공학',3],['음악',3],['스포츠 활동',3],
    ['전기·전자·로봇',2],['기계·자동차',2],['에너지',2],['금융·경제',2],['법률',2],['행정·정책',2],['공공안전·치안',2],['보건·의료·간호',2],['연기·무용',2],['화학·소재기술',1]
  ],
  aptitude: [
    ['언어이해력',5],['수리논리력',5],['공간지각력',5],['디지털·정보활용능력',5],['손기술·조작능력',5],['과학적 사고력',5],
    ['감성공감능력',4],['트렌드 수용력',4],['자연친화력',4],['자기성찰능력',4],['창의·상상력',3],['예술능력',2],['신체조절·운동능력',1]
  ],
  values: [
    ['사회적 인정',12],['변화지향',12],['자기계발과 도전',11],['일과 여가의 균형',11],['즐거움과 흥미',11],['사회적 기여',10],['안정과 보장',9],['경제적 보상',8],['자율성과 자유',7]
  ],
  aptitudeSubjects: ['역사','사회','국어'],
  riasec: [['R',78,'현실형'],['I',125,'탐구형'],['A',118,'예술형'],['S',127,'사회형'],['E',138,'진취형'],['C',101,'관습형']],
  descriptions: {
    interest: [
      ['사무·회계','조직의 운영에 필요한 자료를 체계적으로 정리하고, 돈의 흐름을 정확하게 계산하고 관리하는 실무적인 활동에 대한 흥미'],
      ['공연 기획·무대 연출','하나의 공연을 성공적으로 무대에 올리기 위해 전체를 기획하고 무대·조명·음향 등을 조화롭게 연출하는 활동에 대한 흥미'],
      ['복지·사회서비스','어려움을 겪는 사람을 직접 돕거나 모두가 더 나은 삶을 살 수 있도록 사회의 규칙이나 제도를 만드는 활동에 대한 흥미'],
      ['디자인·미술','자신의 생각이나 감정을 그림·조형물 등으로 표현하거나 사물·정보를 보기 좋고 편리하게 만드는 활동에 대한 흥미'],
      ['철학·사회학','인간의 삶과 사회 현상에 질문하고 생각과 분석을 통해 자신만의 관점을 만드는 활동에 대한 흥미']
    ],
    aptitude: [
      ['언어이해력','글을 잘 읽고 요점을 파악하며 말로 잘 설명할 수 있는 능력'],
      ['수리논리력','숫자나 도형의 규칙을 빠르게 파악하고 계산이나 추리를 잘하는 능력'],
      ['공간지각력','사물의 위치나 구조를 조립하고 입체적으로 상상하는 능력'],
      ['디지털·정보활용능력','디지털 기기를 능숙하게 다루고 정보를 찾아 필요한 형태로 활용할 수 있는 능력'],
      ['손기술·조작능력','손으로 도구나 재료를 잘 다루어 정교한 작업을 해내는 능력'],
      ['과학적 사고력','자연 현상을 이해하고 문제 해결을 위해 과학적 방법을 적용하는 능력']
    ],
    values: [
      ['사회적 인정','다른 사람에게 인정받고 칭찬을 받는 것이 중요함'],
      ['변화지향','변화를 두려워하지 않으며, 변화 속에서 성장할 기회를 찾는 것이 중요함']
    ]
  },
  tendencies: {
    interest: '아이디어를 시각·언어적 결과물로 기획·구성하고, 사람의 성장과 안정을 돕고 돌보며, 프로젝트와 행사를 주도적으로 기획하고 실행하는 활동에 대한 선호도가 높게 나타납니다.',
    aptitude: '데이터와 정보를 구조화하고 인과관계를 파악하는 논리·분석적 사고, 정서와 감수성을 바탕으로 아이디어를 표현하는 역량, 대상의 위치와 형태를 입체적으로 시각화하고 세밀하게 관찰하는 역량이 높게 나타납니다.',
    values: '스스로 목표를 세우고 도전하며 변화와 성장을 추구하고, 일의 즐거움과 흥미, 안정적인 삶과 일·여가의 조화를 중요하게 여기는 경향이 나타납니다.'
  }
});

function scoreBars(entries, max, cssClass = '') {
  return `<div class="sr-bars ${cssClass}">${entries.map(([label,score]) => `<div class="sr-bar-row"><span class="sr-bar-label">${e(label)}</span><div class="sr-bar-track" aria-hidden="true"><span style="width:${Math.round(score/max*100)}%"></span></div><strong class="sr-bar-score">${score}</strong></div>`).join('')}</div>`;
}
function radar(items) {
  // Polar geometry is presentation only; values come directly from the supplied sample.
  const center=145, radius=101, max=150;
  const angle=i=>-Math.PI/2 + i*Math.PI/3;
  const xy=(i,v)=>[center+Math.cos(angle(i))*radius*v/max,center+Math.sin(angle(i))*radius*v/max];
  const poly=values=>values.map((v,i)=>xy(i,v).map(n=>n.toFixed(1)).join(',')).join(' ');
  const spokes=items.map((_,i)=>{const [x,y]=xy(i,max);return `<line x1="${center}" y1="${center}" x2="${x}" y2="${y}" />`}).join('');
  const rings=[50,100,150].map(v=>`<polygon points="${poly(items.map(()=>v))}"/>`).join('');
  const labels=items.map(([code,score],i)=>{const [x,y]=xy(i,180);return `<text x="${x}" y="${y+4}" text-anchor="middle">${e(code)}</text>`}).join('');
  return `<svg viewBox="0 0 290 290" class="sr-radar" role="img" aria-label="RIASEC 점수: ${items.map(([code,v])=>`${code} ${v}`).join(', ')}"><g class="sr-radar-grid">${spokes}${rings}</g><polygon class="sr-radar-area" points="${poly(items.map(item=>item[1]))}"/><g class="sr-radar-labels">${labels}</g></svg>`;
}
function topDescriptions(list) {
  return `<ul class="sr-descriptions">${list.map(([title,desc])=>`<li><strong>${e(title)}</strong><p>${e(desc)}</p></li>`).join('')}</ul>`;
}
function section(id,title,entries,max,tendency,descriptionList,options={}) {
  const topCount=options.topCount||5, full=entries.length;
  return `<section id="sample-${id}" class="sr-section" aria-labelledby="sr-${id}-heading">
    <div class="sr-section-head"><div><h2 id="sr-${id}-heading">${e(title)}</h2><p>${full}개 하위 요인 · 샘플 점수</p></div><span class="sr-scale">단위: ${id==='values'?'합산 점수':'점'}</span></div>
    <div class="sr-analysis-grid"><div class="sr-analysis-bars">
      ${scoreBars(entries.slice(0,topCount),max)}
      ${full>topCount ? `<details class="sr-expand"><summary>전체 ${full}개 요인 보기</summary>${scoreBars(entries,max,'sr-full-bars')}</details>` : ''}
    </div><aside class="sr-analysis-aside"><h3>주요 분석</h3><p>${e(tendency)}</p>
      ${options.subjects ? `<div class="sr-subjects"><strong>자신 있는 과목</strong><span>${options.subjects.map((x,i)=>`${i+1}순위 ${e(x)}`).join(' · ')}</span></div>` : ''}
    </aside></div>
    <details class="sr-expand sr-description-expand"><summary>상위 ${e(title)} 요인 설명</summary>${topDescriptions(descriptionList)}</details>
  </section>`;
}
export function renderSampleReport() {
 const d=SAMPLE_REPORT;
 return `<div class="sr-page">
   <div class="sr-top"><div><h1 id="page-heading" tabindex="-1">진로 분석 결과 미리보기</h1><p>제공된 고등학생용 보고서를 바탕으로 재구성한 샘플입니다.</p></div><span class="sr-demo-marker">샘플 결과 · 실제 검사 결과 아님</span></div>
   <div class="sr-hero">
     <div><span class="sr-hero-kicker">통합 진로 프로파일</span><h2><em>${d.type}</em> ${e(d.typeName)}</h2><p>${e(d.typeDescription)}</p></div>
     <div class="sr-hero-meta"><span>검사 구분</span><strong>${e(d.level)}</strong><span>분석 영역</span><strong>흥미 · 적성 · 가치관</strong></div>
   </div>
   <nav class="sr-anchor-nav" aria-label="결과 상세 보기"><a type="button" data-sr-scroll="sample-interest">흥미</a><a type="button" data-sr-scroll="sample-aptitude">적성</a><a type="button" data-sr-scroll="sample-values">가치관</a><a type="button" data-sr-scroll="sample-type">최종 유형</a></nav>
   ${section('interest','흥미 분석',d.interest,5,d.tendencies.interest,d.descriptions.interest,{topCount:5})}
   ${section('aptitude','적성 분석',d.aptitude,5,d.tendencies.aptitude,d.descriptions.aptitude,{topCount:6,subjects:d.aptitudeSubjects})}
   ${section('values','가치관 분석',d.values,12,d.tendencies.values,d.descriptions.values,{topCount:9})}
   <section id="sample-type" class="sr-section" aria-labelledby="sr-type-heading">
     <div class="sr-section-head"><div><h2 id="sr-type-heading">최종 진로 유형</h2><p>Holland RIASEC 6유형 · 샘플 데이터</p></div></div>
     <div class="sr-type-layout"><div class="sr-radar-card">${radar(d.riasec)}<div class="sr-radar-values">${d.riasec.map(([code,value,label])=>`<div><span>${code} · ${e(label)}</span><strong>${value}</strong></div>`).join('')}</div></div>
       <div class="sr-type-copy"><h3>${d.type} — ${e(d.typeName)}</h3><p>${e(d.typeDescription)}</p><h4>추천 직업</h4><div class="sr-jobs">${d.recommended.map(job=>`<span>${e(job)}</span>`).join('')}</div></div>
     </div>
   </section>
   <div class="sr-foot-actions"><a class="btn btn-primary" href="./assets/promo/cfinder_sample_v1_261123.pdf" download="C-Finder_샘플결과지_v1_261123.pdf">원본 샘플 PDF 다운로드</a><a class="btn btn-outline" href="#start">진단 체험하기</a></div>
   <p class="sr-final-note">위 점수와 설명은 제공된 샘플 결과지의 내용이며, 현재 3문항 체험의 응답을 계산한 값이 아닙니다. 정식 결과 산출에는 별도의 승인된 문항·채점 규칙이 필요합니다.</p>
 </div>`;
}
