import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Body } from './ui';
import { useUser } from '@/lib/auth';
import { dateLabel, money } from '@/lib/format';
import { useLookups } from '@/lib/queries';
import { useColors } from '@/lib/theme';
import type { Transaction } from '@/lib/types';

export function TransactionRow({ txn, showMember }: { txn: Transaction; showMember?: boolean }) {
  const c = useColors();
  const me = useUser();
  const look = useLookups();
  const mine = txn.user_id === me.id;

  const account = look.account(txn.account_id)?.name ?? 'Archived account';
  const title =
    txn.type === 'transfer'
      ? `Transfer → ${look.account(txn.to_account_id)?.name ?? 'account'}`
      : (look.category(txn.category_id)?.name ?? 'Uncategorised');
  const details = [
    dateLabel(txn.occurred_on),
    account,
    showMember ? look.member(txn.user_id)?.name : null,
    txn.recurring_id ? 'Recurring' : null,
    txn.note,
  ].filter(Boolean);

  const color = { income: c.income, expense: c.expense, transfer: c.transfer }[txn.type];
  const sign = { income: '+', expense: '−', transfer: '' }[txn.type];

  return (
    <Pressable
      disabled={!mine}
      onPress={() => router.push({ pathname: '/transaction', params: { id: txn.id } })}
      style={({ pressed }) => [styles.row, { borderColor: c.border }, pressed && { opacity: 0.6 }]}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <Body bold>{title}</Body>
        <Body muted size={13}>
          {details.join(' · ')}
        </Body>
      </View>
      <Body bold color={color}>
        {sign}
        {money(txn.amount, look.currency)}
      </Body>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
