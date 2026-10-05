// Web implementation using Google Identity Services. Native uses GoogleSignIn.native.tsx.
import { useEffect, useRef } from 'react';
import { View, useColorScheme } from 'react-native';

const CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const GSI_SRC = 'https://accounts.google.com/gsi/client';

interface GoogleIdApi {
  initialize(config: { client_id: string; callback: (r: { credential: string }) => void }): void;
  renderButton(parent: HTMLElement, options: Record<string, unknown>): void;
  disableAutoSelect(): void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleIdApi } };
  }
}

let scriptLoad: Promise<GoogleIdApi> | null = null;

function loadGoogleIdentity(): Promise<GoogleIdApi> {
  scriptLoad ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = GSI_SRC;
    script.async = true;
    script.onload = () =>
      window.google ? resolve(window.google.accounts.id) : reject(new Error('Google failed to load'));
    script.onerror = () => {
      scriptLoad = null;
      reject(new Error('Could not load Google sign-in. Check your connection.'));
    };
    document.head.appendChild(script);
  });
  return scriptLoad;
}

export function GoogleSignInButton({
  onIdToken,
  onError,
}: {
  onIdToken: (idToken: string) => Promise<void>;
  onError: (message: string) => void;
}) {
  const container = useRef<View>(null);
  const dark = useColorScheme() === 'dark';
  // GIS keeps the callback from initialize(); route through a ref so it always sees fresh props.
  const handlers = useRef({ onIdToken, onError });
  useEffect(() => {
    handlers.current = { onIdToken, onError };
  });

  useEffect(() => {
    if (!CLIENT_ID) {
      handlers.current.onError('Google sign-in is not configured (EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID)');
      return;
    }
    let cancelled = false;
    loadGoogleIdentity()
      .then((gis) => {
        if (cancelled || !container.current) return;
        gis.initialize({
          client_id: CLIENT_ID,
          callback: ({ credential }) =>
            handlers.current.onIdToken(credential).catch((e: unknown) =>
              handlers.current.onError(e instanceof Error ? e.message : 'Sign-in failed'),
            ),
        });
        // On web, react-native-web Views are DOM elements.
        gis.renderButton(container.current as unknown as HTMLElement, {
          theme: dark ? 'filled_black' : 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
        });
      })
      .catch((e: Error) => handlers.current.onError(e.message));
    return () => {
      cancelled = true;
    };
  }, [dark]);

  return <View ref={container} style={{ minHeight: 44, alignItems: 'center' }} />;
}

/** Stop Google from silently re-selecting the same account after sign-out. */
export async function signOutOfGoogle(): Promise<void> {
  window.google?.accounts.id.disableAutoSelect();
}
