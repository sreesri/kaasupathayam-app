import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useState } from 'react';

import { Body, Button, Card, Chips, Empty, Loading, MonthPicker, ProgressBar, Row, Screen } from '@/components/ui';
import { currentMonth, monthLabel, money, shiftMonth } from '@/lib/format';
import { useBudgetStatus, useDeleteBudget, useLookups } from '@/lib/queries';
import { useColors } from '@/lib/theme';
import type { Scope } from '@/lib/types';

export default function Budgets() {
  const c = useColors();
  const look = useLookups();
  const [scope, setScope] = useState<Scope>('me');
  const [month, setMonth] = useState(currentMonth());
  const { data, isLoading } = useBudgetStatus(scope, month);
  const remove = useDeleteBudget();

  return (
    <Screen>
      <Chips
        options={[
          { value: 'me', label: 'My budgets' },
          { value: 'household', label: 'Household budgets' },
        ]}
        value={scope}
        onChange={setScope}
      />
      <Body muted size={13}>
        {scope === 'me'
          ? 'Monthly limits on your own spending.'
          : "Monthly limits on everyone's combined spending. Any member can edit these."}
      </Body>
      <MonthPicker
        label={monthLabel(month)}
        onPrev={() => setMonth(shiftMonth(month, -1))}
        onNext={() => setMonth(shiftMonth(month, 1))}
      />
      {isLoading && <Loading />}
      {data?.length === 0 && <Empty>No budgets yet.</Empty>}
      {data?.map((b) => {
        const ratio = Number(b.spent) / Number(b.amount);
        const color = ratio > 1 ? c.expense : ratio > 0.8 ? c.accent : c.primary;
        return (
          <Card key={b.id}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Body bold>{look.category(b.category_id)?.name ?? 'Category'}</Body>
              <Body>
                {money(b.spent, look.currency)} / {money(b.amount, look.currency)}
              </Body>
            </Row>
            <ProgressBar ratio={ratio} color={color} />
            <Row style={{ justifyContent: 'space-between' }}>
              <Body muted size={13} color={Number(b.remaining) < 0 ? c.expense : undefined}>
                {Number(b.remaining) < 0
                  ? `${money(-Number(b.remaining), look.currency)} over`
                  : `${money(b.remaining, look.currency)} left`}
              </Body>
              <Pressable onPress={() => remove.mutate(b.id)} hitSlop={8}>
                <Body muted size={13}>
                  Remove
                </Body>
              </Pressable>
            </Row>
          </Card>
        );
      })}
      <View>
        <Button
          title="Add budget"
          onPress={() =>
            router.push({ pathname: '/budget', params: { shared: scope === 'household' ? '1' : '0' } })
          }
        />
      </View>
    </Screen>
  );
}
