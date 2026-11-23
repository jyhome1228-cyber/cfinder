export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}

export function domainIcon(domain) {
  const paths = {
    interest: '<circle cx="12" cy="12" r="8"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z"/>',
    aptitude: '<path d="m4 17 5-5 4 3 7-10M14 5h6v6"/><path d="M4 5v15h16"/>',
    values: '<path d="M12 20s-8-4.7-8-10a4.5 4.5 0 0 1 8-2.7A4.5 4.5 0 0 1 20 10c0 5.3-8 10-8 10Z"/>'
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[domain] || paths.interest}</svg>`;
}
