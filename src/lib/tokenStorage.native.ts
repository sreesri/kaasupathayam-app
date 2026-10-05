import * as SecureStore from 'expo-secure-store';

const KEY = 'kaasu.token';

export function loadToken(): Promise<string | null> {
  return SecureStore.getItemAsync(KEY);
}

export async function saveToken(token: string | null): Promise<void> {
  if (token) await SecureStore.setItemAsync(KEY, token);
  else await SecureStore.deleteItemAsync(KEY);
}
