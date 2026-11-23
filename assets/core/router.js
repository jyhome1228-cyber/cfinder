const PAGES = new Set(['home', 'intro', 'review', 'result', 'report', 'institutions']);
const FLOW_PAGES = new Set(['intro', 'test', 'review', 'result']);

function gradeFrom(query) {
  const grade = new URLSearchParams(query).get('grade');
  return grade === 'middle' || grade === 'high' ? { grade } : {};
}

export function parseRoute(hash = '') {
  const [path, query = ''] = hash.replace(/^#/, '').split('?');
  if (!path) return { page: 'home' };
  if (PAGES.has(path)) return { page: path, ...(FLOW_PAGES.has(path) ? gradeFrom(query) : {}) };
  const match = /^test\/(\d+)$/.exec(path);
  if (match && Number.isSafeInteger(Number(match[1]))) {
    return { page: 'test', index: Number(match[1]), fromReview: new URLSearchParams(query).get('from') === 'review', ...gradeFrom(query) };
  }
  return { page: 'home' };
}

// Every assessment history entry identifies its school, so browser Back never
// opens an earlier school's question against the most recently selected school.
export function withGrade(hash, grade) {
  const route = parseRoute(hash);
  if (!FLOW_PAGES.has(route.page)) return hash;
  if (grade !== 'middle' && grade !== 'high') throw new Error('A school grade is required for assessment routes.');
  const [path, query = ''] = hash.split('?');
  const params = new URLSearchParams(query);
  params.set('grade', grade);
  return `${path}?${params}`;
}

export function navigate(hash, { replace = false } = {}) {
  if (location.hash === hash) return;
  if (replace) {
    history.replaceState(null, '', `${location.pathname}${location.search}${hash}`);
    window.dispatchEvent(new Event('hashchange'));
  } else {
    location.hash = hash;
  }
}
