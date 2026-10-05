import { router } from 'expo-router';
import { Pressable } from 'react-native';

import { Body, Button, Card, Empty, Loading, Row, Screen } from '@/components/ui';
import { dateLabel, money } from '@/lib/format';
import { useDeleteRecurring, useLookups, useRecurring, useUpdateRecurring } from '@/lib/queries';
import { useColors } from '@/lib/theme';
import type { Recurring } from '@/lib/types';

function cadence(r: Recurring): string {
  const unit = { daily: 'day', weekly: 'week', monthly: 'month', yearly: 'year' }[r.frequency];
  return r.interval === 1 ? `Every ${unit}` : `Every ${r.interval} ${unit}s`;
}

export default function RecurringList() {
  const c = useColors();
  const look = useLookups();
  const { data, isLoading } = useRecurring('me');
  const update = useUpdateRecurring();
  const remove = useDeleteRecurring();

  return (
    <Screen>
      <Body muted size={13}>
        Salary, rent, subscriptions and SIPs are logged automatically on their due dates.
      </Body>
      {isLoading && <Loading />}
      {data?.length === 0 && <Empty>No recurring entries yet.</Empty>}
      {data?.map((r) => (
        <Card key={r.id}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Body bold>
              {r.type === 'transfer'
                ? `Transfer → ${look.account(r.to_account_id)?.name ?? 'account'}`
                : (look.category(r.category_id)?.name ?? 'Entry')}
            </Body>
            <Body bold color={{ income: c.income, expense: c.expense, transfer: c.transfer }[r.type]}>
              {money(r.amount, look.currency)}
            </Body>
          </Row>
          <Body muted size={13}>
            {[
              cadence(r),
              look.account(r.account_id)?.name,
              !r.active ? 'Paused' : r.next_date ? `Next ${dateLabel(r.next_date)}` : 'Ended',
              r.note,
            ]
              .filter(Boolean)
              .join(' · ')}
          </Body>
          <Row>
            <Pressable onPress={() => update.mutate({ id: r.id, active: !r.active })} hitSlop={8}>
              <Body size={13}>{r.active ? 'Pause' : 'Resume'}</Body>
            </Pressable>
            <Pressable onPress={() => remove.mutate(r.id)} hitSlop={8}>
              <Body size={13} color={c.expense}>
                Delete
              </Body>
            </Pressable>
          </Row>
        </Card>
      ))}
      <Button title="Add recurring entry" onPress={() => router.push('/recurring/new')} />
    </Screen>
  );
}
