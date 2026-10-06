import { useState } from 'react';
import { View } from 'react-native';

import { SummaryReport, TrendReport } from '@/components/Reports';
import { TransactionRow } from '@/components/TransactionRow';
import {
  Body,
  Card,
  Chips,
  Empty,
  Label,
  MonthPicker,
  Row,
  Screen,
  Title,
} from '@/components/ui';
import { useUser } from '@/lib/auth';
import { ACCOUNT_TYPE_LABEL, currentMonth, monthLabel, monthRange, money, shiftMonth } from '@/lib/format';
import { useAccounts, useHousehold, useTransactions } from '@/lib/queries';
import { useColors } from '@/lib/theme';

const ALL = 'all';

/** The combined view: every member's transactions, accounts and totals. */
export default function HouseholdTab() {
  const c = useColors();
  const me = useUser();
  const household = useHousehold().data;
  const accounts = useAccounts('household').data ?? [];
  const [month, setMonth] = useState(currentMonth());
  const [member, setMember] = useState<string>(ALL);
  const { start, end } = monthRange(month);
  const txns = useTransactions({
    scope: 'household',
    start,
    end,
    member_id: member === ALL ? undefined : member,
    limit: 500,
  });

  if (!household) return null;
  const currency = household.currency;

  return (
    <Screen>
      <Title>{household.name}</Title>
      <MonthPicker
        label={monthLabel(month)}
        onPrev={() => setMonth(shiftMonth(month, -1))}
        onNext={() => setMonth(shiftMonth(month, 1))}
      />
      <SummaryReport scope="household" start={start} end={end} />
      <TrendReport scope="household" />

      <Card>
        <Label>Accounts</Label>
        {household.members.map((m) => {
          const owned = accounts.filter((a) => a.owner_id === m.id);
          if (owned.length === 0) return null;
          return (
            <View key={m.id} style={{ gap: 6 }}>
              <Body bold>{m.name}</Body>
              {owned.map((a) => (
                <Row key={a.id} style={{ justifyContent: 'space-between' }}>
                  <Body muted>
                    {a.name} · {ACCOUNT_TYPE_LABEL[a.type]}
                  </Body>
                  <Body color={Number(a.balance) < 0 ? c.expense : c.text}>
                    {money(a.balance, currency)}
                  </Body>
                </Row>
              ))}
            </View>
          );
        })}
        {accounts.length === 0 && <Body muted>No accounts yet.</Body>}
      </Card>

      <Card>
        <Label>Transactions</Label>
        <Chips
          options={[
            { value: ALL, label: 'Everyone' },
            ...household.members.map((m) => ({ value: m.id, label: m.name })),
          ]}
          value={member}
          onChange={setMember}
        />
        {txns.data?.length === 0 && <Empty>No transactions this month.</Empty>}
        {txns.data?.map((t) => <TransactionRow key={t.id} txn={t} showMember />)}
      </Card>

      <Card>
        <Label>Members</Label>
        {household.members.map((m) => (
          <Row key={m.id} style={{ justifyContent: 'space-between' }}>
            <Body>
              {m.name}
              {m.id === me.id ? ' (you)' : ''}
            </Body>
            <Body muted size={13}>
              {m.role}
            </Body>
          </Row>
        ))}
        <Body muted size={13}>
          Invite more people from Settings (the gear at the top).
        </Body>
      </Card>
    </Screen>
  );
}
