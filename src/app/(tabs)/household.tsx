import { useState } from 'react';
import { Text, View } from 'react-native';

import { AccountRow } from '@/components/AccountRow';
import { MonthButton } from '@/components/MonthButton';
import { TrendReport } from '@/components/Reports';
import { Select } from '@/components/Select';
import { SpendingDonut } from '@/components/SpendingDonut';
import { SpendingHero } from '@/components/SpendingHero';
import { TransactionRow } from '@/components/TransactionRow';
import {
  Body,
  Empty,
  Group,
  GroupLabel,
  Loading,
  ProgressBar,
  SegmentedControl,
  Screen,
} from '@/components/ui';
import { useUser } from '@/lib/auth';
import { currentMonth, fromISODate, monthRange, moneyShort } from '@/lib/format';
import { useAccounts, useHousehold, useLookups, useSummary, useTransactions } from '@/lib/queries';
import { fonts, useColors } from '@/lib/theme';
import type { Member, Summary } from '@/lib/types';

const ALL = 'all';

/** The combined view: everyone's spending, accounts and transactions for the month. */
export default function HouseholdTab() {
  const c = useColors();
  const me = useUser();
  const look = useLookups();
  const household = useHousehold().data;
  const accounts = useAccounts('household').data ?? [];
  const [month, setMonth] = useState(currentMonth());
  const [view, setView] = useState<'categories' | 'members' | 'trend'>('categories');
  const [member, setMember] = useState<string>(ALL);
  const { start, end } = monthRange(month);
  const summary = useSummary('household', start, end);
  const txns = useTransactions({
    scope: 'household',
    start,
    end,
    member_id: member === ALL ? undefined : member,
    limit: 500,
  });

  if (!household) return <Loading />;
  const currency = household.currency;
  const s = summary.data;
  const nameOf = (id: string) => {
    const m = household.members.find((x) => x.id === id);
    return m ? (m.id === me.id ? 'You' : m.name.split(' ')[0]) : 'Former member';
  };

  return (
    <Screen>
      <View style={{ paddingHorizontal: 4 }}>
        <Text style={{ color: c.text, fontFamily: fonts.display, fontSize: 26 }}>{household.name}</Text>
        <Body muted size={14}>
          {household.members.length} {household.members.length === 1 ? 'member' : 'members'}
        </Body>
      </View>
      <MonthButton month={month} onChange={setMonth} />
      <SpendingHero label="Household spent this month" summary={s} currency={currency} />

      <SegmentedControl
        accessibilityLabel="Breakdown"
        options={[
          { value: 'categories', label: 'Categories' },
          { value: 'members', label: 'Members' },
          { value: 'trend', label: 'Trend' },
        ]}
        value={view}
        onChange={setView}
      />
      {!s ? (
        <Loading />
      ) : view === 'categories' ? (
        <SpendingDonut
          currency={currency}
          period={fromISODate(start).toLocaleDateString(undefined, { month: 'long' })}
          items={s.by_category
            .filter((x) => x.type === 'expense')
            .map((x) => ({
              key: x.category_id ?? 'none',
              name: look.category(x.category_id)?.name ?? 'Uncategorised',
              total: Number(x.total),
            }))}
        />
      ) : view === 'members' ? (
        <MemberBreakdown members={household.members} summary={s} currency={currency} meId={me.id} />
      ) : (
        <TrendReport scope="household" />
      )}

      <GroupLabel>Everyone&apos;s accounts</GroupLabel>
      {accounts.length === 0 ? (
        <Empty>No accounts yet.</Empty>
      ) : (
        <Group>
          {accounts.map((a) => (
            <AccountRow
              key={a.id}
              account={a}
              currency={currency}
              owner={nameOf(a.owner_id)}
              editable={a.owner_id === me.id}
            />
          ))}
        </Group>
      )}

      <GroupLabel>Transactions</GroupLabel>
      <Group>
        <Select
          label="Showing"
          title="Show transactions of"
          options={[
            { value: ALL, label: 'Everyone' },
            ...household.members.map((m) => ({ value: m.id, label: m.name })),
          ]}
          value={member}
          onChange={setMember}
        />
        {txns.data?.map((t) => <TransactionRow key={t.id} txn={t} showMember />)}
      </Group>
      {txns.data?.length === 0 && <Empty>No transactions this month.</Empty>}
    </Screen>
  );
}

/** Each member's spending and share of the household total, plus their income and role. */
function MemberBreakdown({
  members,
  summary,
  currency,
  meId,
}: {
  members: Member[];
  summary: Summary;
  currency: string;
  meId: string;
}) {
  const c = useColors();
  const totals = new Map(summary.by_member.map((m) => [m.user_id, m]));
  const spentAll = Number(summary.expense) || 1;
  const rows = members
    .map((m) => ({
      m,
      spent: Number(totals.get(m.id)?.expense ?? 0),
      income: Number(totals.get(m.id)?.income ?? 0),
    }))
    .sort((a, b) => b.spent - a.spent);

  return (
    <View style={{ gap: 12 }}>
      <Group>
        {rows.map(({ m, spent, income }) => (
          <View key={m.id} style={{ padding: 14, gap: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: c.track,
                }}
              >
                <Text style={{ color: c.primary, fontFamily: fonts.display, fontSize: 14 }}>
                  {m.name
                    .split(' ')
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Body bold>
                  {m.name}
                  {m.id === meId ? ' (you)' : ''}
                </Body>
                <Body muted size={13}>
                  {m.role === 'owner' ? 'Owner' : 'Member'} · +{moneyShort(income, currency)} income
                </Body>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Body bold>{moneyShort(spent, currency)}</Body>
                <Body muted size={12}>
                  {Math.round((spent / spentAll) * 100)}% of spending
                </Body>
              </View>
            </View>
            <ProgressBar ratio={spent / spentAll} color={c.primary} />
          </View>
        ))}
      </Group>
      <Body muted size={13}>
        Invite more people from Settings (the gear at the top).
      </Body>
    </View>
  );
}
