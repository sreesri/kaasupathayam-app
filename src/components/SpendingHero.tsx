import { Text, View } from 'react-native';

import { Body, Loading, ProgressBar, Row } from './ui';
import { moneyShort } from '@/lib/format';
import { fonts, useColors } from '@/lib/theme';
import type { Summary } from '@/lib/types';

/** The month's headline: what was spent, a bar against income, and what's left (or over). */
export function SpendingHero({
  label,
  summary,
  currency,
}: {
  label: string;
  summary: Summary | undefined;
  currency: string;
}) {
  const c = useColors();
  const income = Number(summary?.income ?? 0);
  const spent = Number(summary?.expense ?? 0);
  const net = income - spent;

  return (
    <View style={{ paddingHorizontal: 4, gap: 2 }}>
      <Body muted size={14}>
        {label}
      </Body>
      {summary ? (
        <Text style={{ color: c.text, fontFamily: fonts.display, fontSize: 44, letterSpacing: -0.5 }}>
          {moneyShort(spent, currency)}
        </Text>
      ) : (
        <Loading />
      )}
      {income > 0 && (
        <View style={{ marginTop: 8 }}>
          <ProgressBar ratio={spent / income} color={net < 0 ? c.expense : c.primary} />
        </View>
      )}
      <Row style={{ justifyContent: 'space-between', marginTop: 6 }}>
        <Body muted size={14}>
          of {moneyShort(income, currency)} income
        </Body>
        <Body bold size={14} color={net < 0 ? c.expense : c.income}>
          {net < 0 ? `${moneyShort(-net, currency)} over` : `${moneyShort(net, currency)} left`}
        </Body>
      </Row>
    </View>
  );
}
