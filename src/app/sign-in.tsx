import { useState } from 'react';
import { ActivityIndicator } from 'react-native';

import { GoogleSignInButton } from '@/components/GoogleSignIn';
import { Body, Card, ErrorText, Screen, Title } from '@/components/ui';
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
      <Title>Kaasupathayam</Title>
      <Body muted>Track your household&apos;s money together.</Body>
      <Card style={{ alignItems: 'center' }}>
        {busy ? <ActivityIndicator /> : <GoogleSignInButton onIdToken={onIdToken} onError={setError} />}
        <ErrorText error={error} />
      </Card>
    </Screen>
  );
}
