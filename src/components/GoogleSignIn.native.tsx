import {
  GoogleSignin,
  GoogleSigninButton,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { useState } from 'react';

// Android returns an ID token only when given the *web* client ID, which becomes its audience.
// (The Android OAuth client just has to exist, matching the package name and signing SHA-1.)
GoogleSignin.configure({ webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID });

export function GoogleSignInButton({
  onIdToken,
  onError,
}: {
  onIdToken: (idToken: string) => Promise<void>;
  onError: (message: string) => void;
}) {
  const [busy, setBusy] = useState(false);

  const signIn = async () => {
    setBusy(true);
    try {
      await GoogleSignin.hasPlayServices();
      const res = await GoogleSignin.signIn();
      if (!isSuccessResponse(res)) return; // user cancelled
      if (!res.data.idToken) return onError('Google did not return an ID token');
      await onIdToken(res.data.idToken);
    } catch (e) {
      if (isErrorWithCode(e) && e.code === statusCodes.IN_PROGRESS) return;
      if (isErrorWithCode(e) && e.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        return onError('Google Play Services is not available or needs an update');
      }
      onError(e instanceof Error ? e.message : 'Google sign-in failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <GoogleSigninButton
      size={GoogleSigninButton.Size.Wide}
      color={GoogleSigninButton.Color.Dark}
      onPress={signIn}
      disabled={busy}
    />
  );
}

/** Forget the chosen Google account so the next sign-in shows the account picker. */
export async function signOutOfGoogle(): Promise<void> {
  try {
    await GoogleSignin.signOut();
  } catch {
    // Not signed in to Google on this device; nothing to clear.
  }
}
