import { useState } from 'react';

import { Body, Brand, Button, Card, ErrorText, Field, Label, Screen } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { useCreateHousehold, useJoinHousehold } from '@/lib/queries';

export default function Onboarding() {
  const { refreshUser, signOut } = useAuth();
  const create = useCreateHousehold();
  const join = useJoinHousehold();
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [code, setCode] = useState('');

  return (
    <Screen>
      <Brand />
      <Body muted>
        A household groups the people who share finances. Everyone keeps their own accounts and
        transactions, and the Household tab shows the combined picture.
      </Body>
      <Card>
        <Label>Start a new household</Label>
        <Field label="Name" value={name} onChangeText={setName} placeholder="e.g. Our home" />
        <Field
          label="Currency"
          value={currency}
          onChangeText={(v) => setCurrency(v.toUpperCase())}
          autoCapitalize="characters"
          maxLength={3}
        />
        <ErrorText error={create.error} />
        <Button
          title="Create household"
          loading={create.isPending}
          onPress={() =>
            create.mutate({ name: name.trim(), currency }, { onSuccess: () => refreshUser() })
          }
        />
      </Card>
      <Card>
        <Label>Join with an invite code</Label>
        <Field
          label="Invite code"
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
          placeholder="Ask a member for it"
        />
        <ErrorText error={join.error} />
        <Button
          title="Join household"
          variant="secondary"
          loading={join.isPending}
          onPress={() => join.mutate(code.trim(), { onSuccess: () => refreshUser() })}
        />
      </Card>
      <Button title="Sign out" variant="secondary" onPress={signOut} />
    </Screen>
  );
}
