// Group factor exploration into 5-item screens without breaking domain boundaries.
// 27 interest -> 6 pages, 13 aptitude -> 3 pages, 9 values -> 2 pages.
export const PAGE_SIZE = 5;

export function assessmentPages(assessment) {
  if (!assessment || !Array.isArray(assessment.questions)) throw new TypeError('Assessment questions required.');
  const questions = assessment.questions;
  if (assessment.kind !== 'factor_exploration') {
    return Array.from({ length: Math.ceil(questions.length / PAGE_SIZE) }, (_, i) => {
      const start = i * PAGE_SIZE;
      const end = Math.min(start + PAGE_SIZE, questions.length);
      return { start, end, questions: questions.slice(start, end), domain: questions[start].domain, number: i + 1 };
    });
  }
  const pages = [];
  let index = 0;
  while (index < questions.length) {
    const domain = questions[index].domain;
    let domainEnd = index;
    while (domainEnd < questions.length && questions[domainEnd].domain === domain) domainEnd++;
    for (let start = index; start < domainEnd; start += PAGE_SIZE) {
      const end = Math.min(start + PAGE_SIZE, domainEnd);
      pages.push({ start, end, domain, questions: questions.slice(start, end), number: pages.length + 1 });
    }
    index = domainEnd;
  }
  return pages;
}

export function pageForIndex(assessment, index) {
  const pages = assessmentPages(assessment);
  const pageIndex = pages.findIndex(page => Number.isInteger(index) && index >= page.start && index < page.end);
  if (pageIndex === -1) return null;
  return { ...pages[pageIndex], pageIndex, totalPages: pages.length,
    previous: pageIndex > 0 ? pages[pageIndex - 1].start : null,
    next: pageIndex < pages.length - 1 ? pages[pageIndex + 1].start : null };
}

export function pageMissingQuestions(assessment, answers, page) {
  return page.questions.filter(question => !Object.hasOwn(answers || {}, question.id)
    || !assessment.options.some(option => option.value === answers[question.id]));
}
