import { restoreAttempt, storageKey } from './assessment.js';

// Same-tab persistence. A memory fallback keeps the current screen usable if
// the browser refuses sessionStorage; the UI must disclose the reload limit.
export function createSessionStore(storageProvider = () => globalThis.sessionStorage) {
  const memory = new Map();
  let available = true;

  function read(key) {
    if (memory.has(key)) return memory.get(key);
    try {
      const value = storageProvider().getItem(key);
      if (value !== null) memory.set(key, value);
      return value;
    } catch {
      available = false;
      return null;
    }
  }

  function write(key, value) {
    memory.set(key, value);
    try {
      storageProvider().setItem(key, value);
      return true;
    } catch {
      available = false;
      return false;
    }
  }

  return {
    get available() { return available; },
    loadAttempt(tenantId, assessment) {
      try {
        return restoreAttempt(JSON.parse(read(storageKey(tenantId, assessment))), tenantId, assessment);
      } catch {
        return null;
      }
    },
    saveAttempt(attempt, assessment) {
      return write(storageKey(attempt.tenantId, assessment), JSON.stringify(attempt));
    },
    loadGrade(tenantId) {
      const grade = read(`cfinder:active-grade:v2:${tenantId}`);
      return grade === 'middle' || grade === 'high' ? grade : null;
    },
    saveGrade(tenantId, grade) {
      return write(`cfinder:active-grade:v2:${tenantId}`, grade);
    }
  };
}
