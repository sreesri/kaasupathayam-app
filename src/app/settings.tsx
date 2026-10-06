import * as Clipboard from 'expo-clipboard';
import { useEffect, useState } from 'react';
import { Pressable, Text } from 'react-native';

import { Body, Button, Card, ErrorText, Label, Loading, Row, Screen } from '@/components/ui';
import { useAuth, useUser } from '@/lib/auth';
import { useHousehold, useRegenerateInvite } from '@/lib/queries';
import { fonts, useColors } from '@/lib/theme';

export default function Settings() {
  const c = useColors();
  const me = useUser();
  const { signOut } = useAuth();
  const household = useHousehold().data;
  const regenerate = useRegenerateInvite();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  if (!household) return <Loading />;

  const copy = async () => {
    await Clipboard.setStringAsync(household.invite_code);
    setCopied(true);
  };

  return (
    <Screen>
      <Card>
        <Label>Invite a member</Label>
        <Body muted size={14}>
          Share this code with family or friends. They enter it after signing in to join{' '}
          {household.name}.
        </Body>
        <Pressable
          onPress={copy}
          accessibilityRole="button"
          accessibilityLabel={`Invite code ${household.invite_code}, tap to copy`}
          style={({ pressed }) => [
            {
              borderWidth: 1,
              borderStyle: 'dashed',
              borderColor: c.primary,
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: 'center',
              gap: 4,
            },
            pressed && { opacity: 0.6 },
          ]}
        >
          <Text style={{ color: c.text, fontFamily: fonts.display, fontSize: 28, letterSpacing: 3 }}>
            {household.invite_code}
          </Text>
          <Body muted size={13}>
            {copied ? 'Copied' : 'Tap to copy'}
          </Body>
        </Pressable>
        {me.role === 'owner' && (
          <>
            <Button
              title="Generate a new code"
              variant="secondary"
              loading={regenerate.isPending}
              onPress={() => regenerate.mutate()}
            />
            <Body muted size={13}>
              The old code stops working. Members who already joined stay in the household.
            </Body>
            <ErrorText error={regenerate.error} />
          </>
        )}
      </Card>

      <Card>
        <Label>Signed in as</Label>
        <Row style={{ justifyContent: 'space-between' }}>
          <Body bold>{me.name}</Body>
          <Body muted size={13}>
            {me.role}
          </Body>
        </Row>
        <Body muted size={14}>
          {me.email}
        </Body>
      </Card>
      <Button title="Sign out" variant="secondary" onPress={signOut} />
    </Screen>
  );
}
