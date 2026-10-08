import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import {
  Body,
  Button,
  Empty,
  Group,
  GroupLabel,
  Loading,
  ProgressBar,
  SegmentedControl,
  Screen,
} from '@/components/ui';
import { ACCOUNT_TYPE_LABEL, moneyShort } from '@/lib/format';
import { useAccounts, useHousehold } from '@/lib/queries';
import { fonts, useColors } from '@/lib/theme';
import type { Account, AccountType } from '@/lib/types';

const ICON: Record<AccountType, React.ComponentProps<typeof Ionicons>['name']> = {
  bank: 'business-outline',
  credit_card: 'card-outline',
  cash: 'cash-outline',
  wallet: 'wallet-outline',
};

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

/** Tap to edit, archive or delete. Cards show what's owed and how much of the limit is used. */
function AccountRow({ account: a, currency }: { account: Account; currency: string }) {
  const c = useColors();
  const balance = Number(a.balance);
  const isCard = a.type === 'credit_card';
  const owed = isCard ? Math.max(-balance, 0) : 0;
  const limit = a.credit_limit ? Number(a.credit_limit) : null;
  const tint = isCard ? c.expense : c.primary;

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/account', params: { id: a.id } })}
      accessibilityRole="button"
      accessibilityLabel={`${a.name}, ${ACCOUNT_TYPE_LABEL[a.type]}, ${
        isCard ? `${moneyShort(owed, currency)} owed` : moneyShort(balance, currency)
      }. Edit`}
      style={({ pressed }) => [{ padding: 14, gap: 10 }, pressed && { opacity: 0.6 }]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: c.track,
          }}
        >
          <Ionicons name={ICON[a.type]} size={20} color={tint} />
        </View>
        <View style={{ flex: 1 }}>
          <Body bold>{a.name}</Body>
          <Body muted size={13}>
            {isCard && limit
              ? `${moneyShort(limit - owed, currency)} available`
              : ACCOUNT_TYPE_LABEL[a.type]}
          </Body>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Body bold color={isCard && owed > 0 ? c.expense : balance < 0 ? c.expense : c.text}>
            {isCard ? moneyShort(owed, currency) : moneyShort(balance, currency)}
          </Body>
          {isCard && (
            <Body muted size={12}>
              owed
            </Body>
          )}
        </View>
        <Ionicons name="chevron-forward" size={18} color={c.muted} />
      </View>
      {isCard && limit ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <ProgressBar ratio={owed / limit} color={c.expense} />
          </View>
          <Body muted size={12}>
            {`${Math.round((owed / limit) * 100)}% of ${moneyShort(limit, currency)} limit`}
          </Body>
        </View>
      ) : null}
    </Pressable>
  );
}
