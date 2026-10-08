import {
  BricolageGrotesque_500Medium,
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_700Bold,
} from '@expo-google-fonts/bricolage-grotesque';
import { Catamaran_700Bold } from '@expo-google-fonts/catamaran';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';

import { AutoUpdater } from '@/components/AppUpdates';
import { AuthProvider, useAuth } from '@/lib/auth';
import { fonts, useColors } from '@/lib/theme';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    BricolageGrotesque_500Medium,
    BricolageGrotesque_600SemiBold,
    BricolageGrotesque_700Bold,
    Catamaran_700Bold,
  });
  // On a font load failure, carry on with system fonts rather than a blank screen.
  if (!fontsLoaded && !fontError) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RootNavigator />
        <AutoUpdater />
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
        headerTitleStyle: { fontFamily: fonts.display },
        headerShadowVisible: false,
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
        <Stack.Screen name="account" options={{ presentation: 'modal', title: 'Account' }} />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      </Stack.Protected>
    </Stack>
  );
}
