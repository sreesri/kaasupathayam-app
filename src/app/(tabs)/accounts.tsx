import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { AccountRow } from '@/components/AccountRow';
import {
  Body,
  Button,
  Empty,
  Group,
  GroupLabel,
  Loading,
  SegmentedControl,
  Screen,
} from '@/components/ui';
import { moneyShort } from '@/lib/format';
import { useAccounts, useHousehold } from '@/lib/queries';
import { fonts, useColors } from '@/lib/theme';

export default function Accounts() {
  const c = useColors();
  const [view, setView] = useState<'active' | 'archived'>('active');
  const { data, isLoading } = useAccounts('me', true);
  const currency = useHousehold().data?.currency ?? 'INR';

  const active = data?.filter((a) => !a.archived) ?? [];
  const archived = data?.filter((a) => a.archived) ?? [];
  const shown = view === 'active' ? active : archived;
  const netWorth = active.reduce((sum, a) => sum + Number(a.balance), 0);
  const cards = shown.filter((a) => a.type === 'credit_card');
  const money = shown.filter((a) => a.type !== 'credit_card');

  return (
    <Screen>
      <View style={{ paddingHorizontal: 4 }}>
        <Body muted size={14}>
          Net balance
        </Body>
        <Text style={{ fontFamily: fonts.display, fontSize: 36, color: netWorth < 0 ? c.expense : c.text }}>
          {moneyShort(netWorth, currency)}
        </Text>
        <Body muted size={13}>
          Bank, cash and wallets minus what you owe on cards
        </Body>
      </View>

      <SegmentedControl
        accessibilityLabel="Show"
        options={[
          { value: 'active', label: `Active · ${active.length}` },
          { value: 'archived', label: `Archived · ${archived.length}` },
        ]}
        value={view}
        onChange={setView}
      />

      {isLoading && <Loading />}
      {!isLoading && shown.length === 0 && (
        <Empty>{view === 'active' ? 'No accounts yet.' : 'No archived accounts.'}</Empty>
      )}
      {money.length > 0 && (
        <>
          <GroupLabel>Bank, cash &amp; wallets</GroupLabel>
          <Group>
            {money.map((a) => (
              <AccountRow key={a.id} account={a} currency={currency} />
            ))}
          </Group>
        </>
      )}
      {cards.length > 0 && (
        <>
          <GroupLabel>Credit cards</GroupLabel>
          <Group>
            {cards.map((a) => (
              <AccountRow key={a.id} account={a} currency={currency} />
            ))}
          </Group>
        </>
      )}
      {view === 'active' && (
        <Button title="Add account" variant="secondary" onPress={() => router.push('/account')} />
      )}
    </Screen>
  );
}
