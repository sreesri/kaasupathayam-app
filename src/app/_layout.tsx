import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';

import { AuthProvider, useAuth } from '@/lib/auth';
import { useColors } from '@/lib/theme';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RootNavigator />
        <StatusBar style="auto" />
      </AuthProvider>
    </QueryClientProvider>
  );
}

/** Three stages: signed out → sign-in; signed in without a household → onboarding;
 *  household member → the app. Guards redirect automatically when the stage changes. */
function RootNavigator() {
  const { state } = useAuth();
  const c = useColors();

  if (state.status === 'loading') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: c.bg }}>
        <ActivityIndicator />
      </View>
    );
  }

  const signedIn = state.status === 'signedIn';
  const inHousehold = signedIn && state.user.household_id !== null;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: c.card },
        headerTintColor: c.text,
        contentStyle: { backgroundColor: c.bg },
      }}
    >
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="sign-in" options={{ title: 'Sign in', headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={signedIn && !inHousehold}>
        <Stack.Screen name="onboarding" options={{ title: 'Your household' }} />
      </Stack.Protected>
      <Stack.Protected guard={inHousehold}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="transaction" options={{ presentation: 'modal', title: 'Transaction' }} />
        <Stack.Screen name="account" options={{ presentation: 'modal', title: 'New account' }} />
        <Stack.Screen name="budget" options={{ presentation: 'modal', title: 'New budget' }} />
        <Stack.Screen name="recurring/index" options={{ title: 'Recurring' }} />
        <Stack.Screen name="recurring/new" options={{ presentation: 'modal', title: 'New recurring' }} />
      </Stack.Protected>
    </Stack>
  );
}
