import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';

import { MonthButton } from '@/components/MonthButton';
import { TrendReport } from '@/components/Reports';
import { SpendingDonut } from '@/components/SpendingDonut';
import { SpendingHero } from '@/components/SpendingHero';
import { TransactionRow } from '@/components/TransactionRow';
import {
  Body,
  Button,
  Card,
  Empty,
  Fab,
  Group,
  Loading,
  Row,
  SegmentedControl,
  Screen,
} from '@/components/ui';
import { currentMonth, fromISODate, monthRange } from '@/lib/format';
import { useAccounts, useLookups, useSummary, useTransactions } from '@/lib/queries';
import { fonts, useColors } from '@/lib/theme';

/** At this width the web app shows Home in two columns next to the sidebar. */
const WIDE = 1024;

export default function Home() {
  const c = useColors();
  const look = useLookups();
  const { width } = useWindowDimensions();
  const wide = width >= WIDE;
  const [month, setMonth] = useState(currentMonth());
  const [view, setView] = useState<'categories' | 'trend'>('categories');
  const { start, end } = monthRange(month);
  const accounts = useAccounts('me');
  const summary = useSummary('me', start, end);
  const recent = useTransactions({ scope: 'me', start, end, limit: wide ? 8 : 5 });

  if (accounts.data?.length === 0) {
    return (
      <Screen>
        <Card>
          <Body>Add a bank account, card or cash wallet to start logging income and expenses.</Body>
          <Button title="Add your first account" onPress={() => router.push('/account')} />
        </Card>
      </Screen>
    );
  }

  const s = summary.data;

  // Columns only flex side by side on wide screens; on phones `flex: 1` would let them shrink
  // below their content and overlap the next section.
  const column = wide ? { flex: 1, minWidth: 0 } : null;

  const overview = (
    <View style={[{ gap: 16 }, column]}>
      <SpendingHero label="Spent this month" summary={s} currency={look.currency} />

      <SegmentedControl
        accessibilityLabel="Breakdown"
        options={[
          { value: 'categories', label: 'Categories' },
          { value: 'trend', label: '6-month trend' },
        ]}
        value={view}
        onChange={setView}
      />
      {view === 'categories' ? (
        s ? (
          <SpendingDonut
            currency={look.currency}
            period={fromISODate(start).toLocaleDateString(undefined, { month: 'long' })}
            items={s.by_category
              .filter((x) => x.type === 'expense')
              .map((x) => ({
                key: x.category_id ?? 'none',
                name: look.category(x.category_id)?.name ?? 'Uncategorised',
                total: Number(x.total),
              }))}
          />
        ) : (
          <Loading />
        )
      ) : (
        <TrendReport scope="me" />
      )}
    </View>
  );

  const recentList = (
    <View style={[{ gap: 12 }, column]}>
      <Row style={{ justifyContent: 'space-between', paddingHorizontal: 4 }}>
        <Text style={{ color: c.text, fontFamily: fonts.display, fontSize: 18 }}>Recent</Text>
        <Pressable onPress={() => router.push('/transactions')} accessibilityRole="link" hitSlop={10}>
          <Body color={c.primary} size={14}>
            See all
          </Body>
        </Pressable>
      </Row>
      {recent.data?.length === 0 ? (
        <Empty>Nothing logged this month.</Empty>
      ) : (
        <Group>{recent.data?.map((t) => <TransactionRow key={t.id} txn={t} />)}</Group>
      )}
    </View>
  );

  return (
    <Screen
      maxWidth={wide ? 1000 : 720}
      footer={<Fab label="Add transaction" onPress={() => router.push('/transaction')} />}
    >
      <MonthButton month={month} onChange={setMonth} />
      {wide ? (
        <View style={{ flexDirection: 'row', gap: 24, alignItems: 'flex-start' }}>
          <Card style={{ flex: 1 }}>{overview}</Card>
          {recentList}
        </View>
      ) : (
        <>
          {overview}
          {recentList}
        </>
      )}
    </Screen>
  );
}
