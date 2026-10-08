// Android: over-the-air updates via EAS Update. The web version (AppUpdates.web.tsx) is a no-op,
// since the website is simply redeployed.
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { Body, Button, Card, Label, Row } from './ui';

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

/** If an update finishes downloading this soon after the app opens or comes back to the
 *  foreground, apply it straight away: the user hasn't started doing anything yet. */
const FRESH_MS = 10_000;

/** Applies downloaded updates without asking, at moments that can't interrupt an entry:
 *  right after the app opens or resumes, or else the next time it returns from the background.
 *  Renders nothing. */
export function AutoUpdater() {
  const { isUpdatePending } = Updates.useUpdates();
  const activeSince = useRef(0);
  const leftApp = useRef(false);
  useForegroundUpdateCheck();

  useEffect(() => {
    activeSince.current = Date.now();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') activeSince.current = Date.now();
      else leftApp.current = true;
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!isUpdatePending) return;
    if (Date.now() - activeSince.current < FRESH_MS) {
      Updates.reloadAsync().catch(() => {});
      return;
    }
    // In use right now: wait until the user leaves the app and comes back.
    leftApp.current = false;
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') leftApp.current = true;
      else if (leftApp.current) Updates.reloadAsync().catch(() => {});
    });
    return () => sub.remove();
  }, [isUpdatePending]);

  return null;
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
      if (!isAvailable) return setMessage("You're on the latest version.");
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync(); // asked for it, so install right away
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
        <Button title="Install update now" onPress={() => Updates.reloadAsync()} />
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
