import { router } from 'expo-router';
import { useState } from 'react';

import { TransactionRow } from '@/components/TransactionRow';
import { Card, Empty, Fab, Loading, MonthPicker, Screen } from '@/components/ui';
import { currentMonth, monthLabel, monthRange, shiftMonth } from '@/lib/format';
import { useTransactions } from '@/lib/queries';

export default function Transactions() {
  const [month, setMonth] = useState(currentMonth());
  const { data, isLoading } = useTransactions({ scope: 'me', ...monthRange(month), limit: 500 });

  return (
    <Screen footer={<Fab label="Add transaction" onPress={() => router.push('/transaction')} />}>
      <MonthPicker
        label={monthLabel(month)}
        onPrev={() => setMonth(shiftMonth(month, -1))}
        onNext={() => setMonth(shiftMonth(month, 1))}
      />
      <Card>
        {isLoading && <Loading />}
        {data?.length === 0 && <Empty>No transactions this month.</Empty>}
        {data?.map((t) => <TransactionRow key={t.id} txn={t} />)}
      </Card>
    </Screen>
  );
}
