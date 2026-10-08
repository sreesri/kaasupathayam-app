import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { MonthButton } from '@/components/MonthButton';
import { Body, Button, Empty, Group, Loading, SegmentedControl, Screen } from '@/components/ui';
import { currentMonth, moneyShort } from '@/lib/format';
import { useBudgetStatus, useLookups } from '@/lib/queries';
import { useColors } from '@/lib/theme';
import type { BudgetStatus, Scope } from '@/lib/types';

export default function Budgets() {
  const [scope, setScope] = useState<Scope>('me');
  const [month, setMonth] = useState(currentMonth());
  const { data, isLoading } = useBudgetStatus(scope, month);

  return (
    <Screen>
      <MonthButton month={month} onChange={setMonth} />
      <SegmentedControl
        accessibilityLabel="Whose budgets"
        options={[
          { value: 'me', label: 'Mine' },
          { value: 'household', label: 'Household' },
        ]}
        value={scope}
        onChange={setScope}
      />
      <Body muted size={14}>
        {scope === 'me'
          ? 'Monthly limits on your own spending.'
          : "Everyone's spending counts toward these. Any member can change them."}
      </Body>
      {isLoading && <Loading />}
      {data?.length === 0 && <Empty>No budgets yet.</Empty>}
      {!!data?.length && (
        <Group>
          {data.map((b) => (
            <BudgetRow key={b.id} budget={b} scope={scope} />
          ))}
        </Group>
      )}
      <Button
        title={scope === 'me' ? 'Add budget' : 'Add household budget'}
        variant="secondary"
        onPress={() =>
          router.push({ pathname: '/budget', params: { shared: scope === 'household' ? '1' : '0' } })
        }
      />
    </Screen>
  );
}

const RING = 18;
const CIRC = 2 * Math.PI * RING;

/** Ring + status in words, so "near" and "over" never rely on colour alone. */
function BudgetRow({ budget: b, scope }: { budget: BudgetStatus; scope: Scope }) {
  const c = useColors();
  const look = useLookups();
  const ratio = Number(b.spent) / Number(b.amount);
  const remaining = Number(b.remaining);
  const tone = ratio > 1 ? c.expense : ratio > 0.8 ? c.warn : c.income;
  const ring = ratio > 1 ? c.expense : ratio > 0.8 ? c.chart[1] : c.primary;
  const status =
    ratio > 1
      ? `● Over by ${moneyShort(-remaining, look.currency)}`
      : ratio > 0.8
        ? `▲ Near the limit · ${moneyShort(remaining, look.currency)} left`
        : `On track · ${moneyShort(remaining, look.currency)} left`;
  const name = look.category(b.category_id)?.name ?? 'Category';

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/budget', params: { id: b.id, scope } })}
      accessibilityRole="button"
      accessibilityLabel={`${name}: ${moneyShort(b.spent, look.currency)} of ${moneyShort(b.amount, look.currency)}. ${status}. Edit`}
      style={({ pressed }) => [
        { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 76, paddingHorizontal: 14 },
        pressed && { opacity: 0.6 },
      ]}
    >
      <Svg width={44} height={44} viewBox="0 0 44 44">
        <Circle cx={22} cy={22} r={RING} stroke={c.track} strokeWidth={6} fill="none" />
        <Circle
          cx={22}
          cy={22}
          r={RING}
          stroke={ring}
          strokeWidth={6}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${Math.min(ratio, 1) * CIRC} ${CIRC}`}
          transform="rotate(-90 22 22)"
        />
      </Svg>
      <View style={{ flex: 1 }}>
        <Body bold>{name}</Body>
        <Body size={13} color={tone}>
          {status}
        </Body>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Body bold>{moneyShort(b.spent, look.currency)}</Body>
        <Body muted size={12}>
          of {moneyShort(b.amount, look.currency)}
        </Body>
      </View>
    </Pressable>
  );
}
