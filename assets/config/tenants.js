// Presentation settings only. URL parameters do NOT establish authorization.
// The same assessment and scoring contract must be shared across organizations.
const TENANTS = Object.freeze({
  public: Object.freeze({
    id: 'public',
    organizationName: '',
    productName: 'C-Finder',
    logoText: 'C-Finder',
    welcome: '지금의 나를 이해하는 진로검사',
    primaryColor: '#202020',
    accentColor: '#1957ef',
    softColor: '#eff5ff',
    isPreview: false
  }),
  sample: Object.freeze({
    id: 'sample',
    organizationName: '샘플 진로교육센터',
    productName: 'C-Finder',
    logoText: '진로교육센터',
    welcome: '우리의 다음 걸음을 함께 찾아요',
    primaryColor: '#202020',
    accentColor: '#237567',
    softColor: '#edf6f2',
    isPreview: true
  })
});

export function resolveTenant(search = '') {
  const id = new URLSearchParams(search).get('org') || 'public';
  return Object.hasOwn(TENANTS, id) ? TENANTS[id] : TENANTS.public;
}

export function applyTenantTheme(tenant, root = document.documentElement) {
  root.style.setProperty('--primary', tenant.primaryColor);
  root.style.setProperty('--accent', tenant.accentColor);
  root.style.setProperty('--soft', tenant.softColor);
}

export { TENANTS };
