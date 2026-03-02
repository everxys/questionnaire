function randomId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getOrCreateDeviceId(storageKey: string): string {
  try {
    const existing = localStorage.getItem(storageKey);
    if (existing) return existing;
    const next = randomId();
    localStorage.setItem(storageKey, next);
    return next;
  } catch {
    return randomId();
  }
}

