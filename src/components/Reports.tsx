import { Text, View } from 'react-native';

import { Body, Card, Label, Loading, ProgressBar, Row } from './ui';
import { monthLabel, money } from '@/lib/format';
import { useLookups, useSummary, useTrend } from '@/lib/queries';
import { fonts, useColors } from '@/lib/theme';
import type { Scope } from '@/lib/types';

function Tile({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={{ flex: 1, gap: 4 }}>
      <Label>{label}</Label>
      <Text style={{ color, fontFamily: fonts.display, fontSize: 19, fontVariant: ['tabular-nums'] }}>
        {value}
      </Text>
    </View>
  );
}

/** Income / expense / net for a range, spending by category, and (household) by member. */
export function SummaryReport({ scope, start, end }: { scope: Scope; start: string; end: string }) {
  const c = useColors();
  const look = useLookups();
  const { data, isLoading } = useSummary(scope, start, end);
  if (isLoading || !data) return <Loading />;

  const expenses = data.by_category.filter((x) => x.type === 'expense');
  const maxExpense = Math.max(...expenses.map((x) => Number(x.total)), 1);
  const net = Number(data.net);

  return (
    <>
      <Card>
        <Row>
          <Tile label="Income" value={money(data.income, look.currency)} color={c.income} />
          <Tile label="Spent" value={money(data.expense, look.currency)} color={c.expense} />
          <Tile label="Net" value={money(data.net, look.currency)} color={net < 0 ? c.expense : c.text} />
        </Row>
      </Card>

      {scope === 'household' && data.by_member.length > 0 && (
        <Card>
          <Label>By member</Label>
          {data.by_member.map((m) => (
            <Row key={m.user_id} style={{ justifyContent: 'space-between' }}>
              <Body>{look.member(m.user_id)?.name ?? 'Former member'}</Body>
              <Body muted>
                <Body color={c.income}>+{money(m.income, look.currency)}</Body>
                {'   '}
                <Body color={c.expense}>−{money(m.expense, look.currency)}</Body>
              </Body>
            </Row>
          ))}
        </Card>
      )}

      <Card>
        <Label>Spending by category</Label>
        {expenses.length === 0 ? (
          <Body muted>No spending yet.</Body>
        ) : (
          expenses.map((x) => (
            <View key={x.category_id ?? 'none'} style={{ gap: 6 }}>
              <Row style={{ justifyContent: 'space-between' }}>
                <Body>{look.category(x.category_id)?.name ?? 'Uncategorised'}</Body>
                <Body>{money(x.total, look.currency)}</Body>
              </Row>
              <ProgressBar ratio={Number(x.total) / maxExpense} color={c.primary} />
            </View>
          ))
        )}
      </Card>
    </>
  );
}

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
