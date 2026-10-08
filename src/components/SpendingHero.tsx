import { Text, View } from 'react-native';

import { Body, Loading, ProgressBar, Row } from './ui';
import { moneyShort } from '@/lib/format';
import { fonts, useColors } from '@/lib/theme';
import type { Summary } from '@/lib/types';

function Figure({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={{ flex: 1, gap: 2 }}>
      <Body muted size={14}>
        {label}
      </Body>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        style={{ color, fontFamily: fonts.display, fontSize: 32, letterSpacing: -0.5 }}
      >
        {value}
      </Text>
    </View>
  );
}

/** The month's headline: what was spent, a bar against income, and what's left (or over).
 *  With `balance` (Home), the spend sits next to the net balance across your accounts. */
export function SpendingHero({
  label,
  summary,
  currency,
  balance,
}: {
  label: string;
  summary: Summary | undefined;
  currency: string;
  balance?: number;
}) {
  const c = useColors();
  const income = Number(summary?.income ?? 0);
  const spent = Number(summary?.expense ?? 0);
  const net = income - spent;

  return (
    <View style={{ paddingHorizontal: 4, gap: 2 }}>
      {!summary ? (
        <Loading />
      ) : balance !== undefined ? (
        <Row style={{ alignItems: 'flex-start', gap: 16 }}>
          <Figure label="Balance today" value={moneyShort(balance, currency)} color={balance < 0 ? c.expense : c.text} />
          <Figure label={label} value={moneyShort(spent, currency)} color={c.expense} />
        </Row>
      ) : (
        <>
          <Body muted size={14}>
            {label}
          </Body>
          <Text style={{ color: c.text, fontFamily: fonts.display, fontSize: 44, letterSpacing: -0.5 }}>
            {moneyShort(spent, currency)}
          </Text>
        </>
      )}
      {income > 0 && (
        <View style={{ marginTop: 8 }}>
          <ProgressBar ratio={spent / income} color={net < 0 ? c.expense : c.primary} />
        </View>
      )}
      <Row style={{ justifyContent: 'space-between', marginTop: 6 }}>
        <Body muted size={14}>
          {`${balance !== undefined ? 'Spent ' : ''}of ${moneyShort(income, currency)} income`}
        </Body>
        <Body bold size={14} color={net < 0 ? c.expense : c.income}>
          {net < 0 ? `${moneyShort(-net, currency)} over` : `${moneyShort(net, currency)} left`}
        </Body>
      </Row>
    </View>
  );
}
