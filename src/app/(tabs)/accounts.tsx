import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useState } from 'react';

import { Body, Button, Card, Chips, Empty, Label, Loading, Row, Screen } from '@/components/ui';
import { ACCOUNT_TYPE_LABEL, money } from '@/lib/format';
import { useAccounts, useHousehold, useUpdateAccount } from '@/lib/queries';
import { useColors } from '@/lib/theme';
import type { Account } from '@/lib/types';

export default function Accounts() {
  const c = useColors();
  const [view, setView] = useState<'active' | 'archived'>('active');
  const { data, isLoading } = useAccounts('me', true);
  const currency = useHousehold().data?.currency ?? 'INR';
  const update = useUpdateAccount();

  const active = data?.filter((a) => !a.archived) ?? [];
  const shown = data?.filter((a) => a.archived === (view === 'archived')) ?? [];
  const netWorth = active.reduce((sum, a) => sum + Number(a.balance), 0);

  return (
    <Screen>
      <Card>
        <Label>Net balance</Label>
        <Body bold size={24} color={netWorth < 0 ? c.expense : c.text}>
          {money(netWorth, currency)}
        </Body>
        <Body muted size={13}>
          Bank, cash and wallet balances minus what you owe on credit cards.
        </Body>
      </Card>
      <Chips
        options={[
          { value: 'active', label: 'Active' },
          { value: 'archived', label: 'Archived' },
        ]}
        value={view}
        onChange={setView}
      />
      {isLoading && <Loading />}
      {shown.length === 0 && !isLoading && (
        <Empty>{view === 'active' ? 'No accounts yet.' : 'No archived accounts.'}</Empty>
      )}
      {shown.map((a) => (
        <AccountCard
          key={a.id}
          account={a}
          currency={currency}
          onToggleArchive={() => update.mutate({ id: a.id, archived: !a.archived })}
        />
      ))}
      {view === 'active' && <Button title="Add account" onPress={() => router.push('/account')} />}
    </Screen>
  );
}

function AccountCard({
  account: a,
  currency,
  onToggleArchive,
}: {
  account: Account;
  currency: string;
  onToggleArchive: () => void;
}) {
  const c = useColors();
  const balance = Number(a.balance);
  const isCard = a.type === 'credit_card';
  return (
    <Card>
      <Row style={{ justifyContent: 'space-between' }}>
        <View style={{ gap: 2 }}>
          <Body bold>{a.name}</Body>
          <Body muted size={13}>
            {ACCOUNT_TYPE_LABEL[a.type]}
          </Body>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 2 }}>
          <Body bold color={balance < 0 ? c.expense : c.text}>
            {isCard && balance < 0 ? `${money(-balance, currency)} owed` : money(balance, currency)}
          </Body>
          {isCard && a.credit_limit && (
            <Body muted size={13}>
              {money(Number(a.credit_limit) + Math.min(balance, 0), currency)} available
            </Body>
          )}
        </View>
      </Row>
      <Pressable onPress={onToggleArchive} hitSlop={8}>
        <Body muted size={13}>
          {a.archived ? 'Restore' : 'Archive'}
        </Body>
      </Pressable>
    </Card>
  );
}
