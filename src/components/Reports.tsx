import { View } from 'react-native';

import { Body, Card, Label, Row } from './ui';
import { monthLabel } from '@/lib/format';
import { useTrend } from '@/lib/queries';
import { useColors } from '@/lib/theme';
import type { Scope } from '@/lib/types';

/** Paired income/expense bars for the last few months. */
export function TrendReport({ scope }: { scope: Scope }) {
  const c = useColors();
  const { data } = useTrend(scope, 6);
  if (!data) return null;
  const max = Math.max(...data.flatMap((p) => [Number(p.income), Number(p.expense)]), 1);
  const HEIGHT = 120;

  return (
    <Card>
      <Row style={{ justifyContent: 'space-between' }}>
        <Label>Last 6 months</Label>
        <Row style={{ gap: 10 }}>
          <Body size={12} color={c.income}>■ Income</Body>
          <Body size={12} color={c.expense}>■ Spent</Body>
        </Row>
      </Row>
      <Row style={{ alignItems: 'flex-end', justifyContent: 'space-between', height: HEIGHT + 20 }}>
        {data.map((p) => (
          <View key={p.month} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
            <Row style={{ alignItems: 'flex-end', gap: 3, height: HEIGHT }}>
              {[
                [p.income, c.income],
                [p.expense, c.expense],
              ].map(([v, color]) => (
                <View
                  key={color}
                  style={{
                    width: 10,
                    height: Math.max((Number(v) / max) * HEIGHT, 2),
                    backgroundColor: color,
                    borderRadius: 3,
                  }}
                />
              ))}
            </Row>
            <Body muted size={12}>
              {monthLabel(p.month, 'short')}
            </Body>
          </View>
        ))}
      </Row>
    </Card>
  );
}
