export function safeLocalStorageGet(key: string): string | null {
  return typeof window !== 'undefined' ? safeLocalStorageGet(key) : null;
}

export function safeLocalStorageSet(key: string, value: string): void {
  if (typeof window !== 'undefined') {
    safeLocalStorageSet(key, value);
  }
}
