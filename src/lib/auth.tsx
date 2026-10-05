import { useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { api, setApiToken, setUnauthorizedHandler } from './api';
import { signOutOfGoogle } from '@/components/GoogleSignIn';
import { loadToken, saveToken } from './tokenStorage';
import type { User } from './types';

type AuthState =
  | { status: 'loading'; user: null }
  | { status: 'signedOut'; user: null }
  | { status: 'signedIn'; user: User };

interface AuthContextValue {
  state: AuthState;
  /** Exchange a Google ID token for an API session (creates the account on first sign-in). */
  signInWithGoogle: (idToken: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'loading', user: null });
  const queryClient = useQueryClient();

  const signOut = useCallback(async () => {
    setApiToken(null);
    await saveToken(null);
    await signOutOfGoogle();
    queryClient.clear();
    setState({ status: 'signedOut', user: null });
  }, [queryClient]);

  const refreshUser = useCallback(async () => {
    const user = await api<User>('/auth/me');
    setState({ status: 'signedIn', user });
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => void signOut());
    (async () => {
      const token = await loadToken();
      if (!token) return setState({ status: 'signedOut', user: null });
      setApiToken(token);
      try {
        await refreshUser();
      } catch {
        await signOut();
      }
    })();
    return () => setUnauthorizedHandler(null);
  }, [refreshUser, signOut]);

  const startSession = useCallback(async (res: { access_token: string; user: User }) => {
    setApiToken(res.access_token);
    await saveToken(res.access_token);
    setState({ status: 'signedIn', user: res.user });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      state,
      signOut,
      refreshUser,
      signInWithGoogle: async (idToken) =>
        startSession(await api('/auth/google', { method: 'POST', body: { id_token: idToken } })),
    }),
    [state, signOut, refreshUser, startSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

/** The signed-in user. Only call from screens behind the signed-in guard. */
export function useUser(): User {
  const { state } = useAuth();
  if (state.status !== 'signedIn') throw new Error('Not signed in');
  return state.user;
}
