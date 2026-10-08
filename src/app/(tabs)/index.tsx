import { router } from 'expo-router';
import { useState } from 'react';

import { SummaryReport, TrendReport } from '@/components/Reports';
import { TransactionRow } from '@/components/TransactionRow';
import { Body, Button, Card, Empty, Fab, Label, MonthPicker, Screen, Title } from '@/components/ui';
import { useUser } from '@/lib/auth';
import { currentMonth, monthLabel, monthRange, shiftMonth } from '@/lib/format';
import { useAccounts, useTransactions } from '@/lib/queries';

export default function Home() {
  const user = useUser();
  const [month, setMonth] = useState(currentMonth());
  const { start, end } = monthRange(month);
  const accounts = useAccounts('me');
  const recent = useTransactions({ scope: 'me', start, end, limit: 5 });
  const noAccounts = accounts.data?.length === 0;

  return (
    <Screen footer={!noAccounts && <Fab label="Add transaction" onPress={() => router.push('/transaction')} />}>
      <Title>Hi, {user.name.split(' ')[0]}</Title>
      {noAccounts ? (
        <Card>
          <Body>Add a bank account, card or cash wallet to start logging income and expenses.</Body>
          <Button title="Add your first account" onPress={() => router.push('/account')} />
        </Card>
      ) : (
        <>
          <MonthPicker
            label={monthLabel(month)}
            onPrev={() => setMonth(shiftMonth(month, -1))}
            onNext={() => setMonth(shiftMonth(month, 1))}
          />
          <SummaryReport scope="me" start={start} end={end} categoryChart="donut" />
          <Card>
            <Label>Recent</Label>
            {recent.data?.length === 0 && <Empty>Nothing logged this month.</Empty>}
            {recent.data?.map((t) => <TransactionRow key={t.id} txn={t} />)}
            <Button title="All transactions" variant="secondary" onPress={() => router.push('/transactions')} />
          </Card>
          <TrendReport scope="me" />
        </>
      )}
    </Screen>
  );
}
