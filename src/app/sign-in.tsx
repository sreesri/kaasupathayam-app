import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { GoogleSignInButton } from '@/components/GoogleSignIn';
import { Body, Brand, Card, ErrorText, Screen } from '@/components/ui';
import { useAuth } from '@/lib/auth';

export default function SignIn() {
  const { signInWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onIdToken = async (idToken: string) => {
    setBusy(true);
    setError(null);
    try {
      await signInWithGoogle(idToken);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign-in failed');
      setBusy(false);
    }
  };

  return (
    <Screen>
      <View style={{ alignItems: 'center', gap: 12, paddingTop: 48, paddingBottom: 8 }}>
        <Brand large />
        <Body muted>Track your household&apos;s money together.</Body>
      </View>
      <Card style={{ alignItems: 'center' }}>
        {busy ? <ActivityIndicator /> : <GoogleSignInButton onIdToken={onIdToken} onError={setError} />}
        <ErrorText error={error} />
      </Card>
    </Screen>
  );
}
