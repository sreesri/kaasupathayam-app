// Web implementation. Native uses tokenStorage.native.ts (Metro picks it by platform).
const KEY = 'kaasu.token';

export async function loadToken(): Promise<string | null> {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export async function saveToken(token: string | null): Promise<void> {
  try {
    if (token) localStorage.setItem(KEY, token);
    else localStorage.removeItem(KEY);
  } catch {
    // Storage unavailable (private mode); the session just won't persist.
  }
}
