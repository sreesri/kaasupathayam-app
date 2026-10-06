// Android: over-the-air updates via EAS Update. The web version (AppUpdates.web.tsx) is a no-op,
// since the website is simply redeployed.
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import { useEffect, useRef, useState } from 'react';
import { AppState, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Body, Button, Card, Label, Row } from './ui';
import { fonts, useColors } from '@/lib/theme';

const RECHECK_AFTER_MS = 5 * 60 * 1000;

/** expo-updates already checks on cold start. This also checks when the app comes back to the
 *  foreground, since Android often keeps it alive in the background for days. */
function useForegroundUpdateCheck() {
  const lastCheck = useRef(0);
  useEffect(() => {
    if (!Updates.isEnabled) return;
    lastCheck.current = Date.now(); // the launch check just ran
    const sub = AppState.addEventListener('change', async (state) => {
      if (state !== 'active' || Date.now() - lastCheck.current < RECHECK_AFTER_MS) return;
      lastCheck.current = Date.now();
      try {
        const { isAvailable } = await Updates.checkForUpdateAsync();
        if (isAvailable) await Updates.fetchUpdateAsync();
      } catch {
        // Offline or a check already running; the next foreground retries.
      }
    });
    return () => sub.remove();
  }, []);
}

/** Floating notice once an update has downloaded, so nobody has to restart the app twice. */
export function UpdateBanner() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { isUpdatePending } = Updates.useUpdates();
  const [dismissed, setDismissed] = useState(false);
  useForegroundUpdateCheck();

  if (!isUpdatePending || dismissed) return null;
  return (
    <View
      accessibilityLiveRegion="polite"
      style={{
        position: 'absolute',
        top: insets.top + 8,
        left: 12,
        right: 12,
        borderRadius: 14,
        padding: 14,
        backgroundColor: c.primary,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        elevation: 6,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
      }}
    >
      <Text style={{ flex: 1, color: c.primaryText, fontFamily: fonts.semibold, fontSize: 15 }}>
        A new version of Kaasupathayam is ready.
      </Text>
      <Pressable onPress={() => setDismissed(true)} hitSlop={8} accessibilityRole="button">
        <Text style={{ color: c.primaryText, opacity: 0.8, fontSize: 14 }}>Later</Text>
      </Pressable>
      <Pressable
        onPress={() => Updates.reloadAsync()}
        accessibilityRole="button"
        style={{ backgroundColor: c.accent, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 }}
      >
        <Text style={{ color: c.accentText, fontFamily: fonts.semibold, fontSize: 14 }}>Restart</Text>
      </Pressable>
    </View>
  );
}

/** Settings section: what's running, plus a manual "Check for updates". */
export function UpdateSettings() {
  const { currentlyRunning, isUpdatePending, isChecking, isDownloading, checkError, downloadError } =
    Updates.useUpdates();
  const [message, setMessage] = useState<string | null>(null);

  const check = async () => {
    setMessage(null);
    try {
      const { isAvailable } = await Updates.checkForUpdateAsync();
      if (isAvailable) await Updates.fetchUpdateAsync();
      else setMessage("You're on the latest version.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Could not check for updates');
    }
  };

  const running = currentlyRunning.isEmbeddedLaunch
    ? 'Built into this APK'
    : `Update from ${currentlyRunning.createdAt?.toLocaleString() ?? 'unknown date'}`;
  const error = checkError ?? downloadError;

  return (
    <Card>
      <Label>App version</Label>
      <Row style={{ justifyContent: 'space-between' }}>
        <Body>Version {Constants.expoConfig?.version ?? '?'}</Body>
        <Body muted size={13}>
          {running}
        </Body>
      </Row>
      {/* The runtime identifies the APK's native code; updates only reach APKs with the same one. */}
      <Body muted size={12}>
        Runtime {currentlyRunning.runtimeVersion?.slice(0, 10) ?? '?'} · channel{' '}
        {currentlyRunning.channel ?? 'none'}
      </Body>
      {!Updates.isEnabled ? (
        <Body muted size={13}>
          Updates are off in development builds.
        </Body>
      ) : isUpdatePending ? (
        <Button title="Restart to update" onPress={() => Updates.reloadAsync()} />
      ) : (
        <Button
          title={isDownloading ? 'Downloading update…' : 'Check for updates'}
          variant="secondary"
          loading={isChecking || isDownloading}
          onPress={check}
        />
      )}
      {message && (
        <Body muted size={13}>
          {message}
        </Body>
      )}
      {error && !message && (
        <Body muted size={13}>
          {error.message}
        </Body>
      )}
    </Card>
  );
}
