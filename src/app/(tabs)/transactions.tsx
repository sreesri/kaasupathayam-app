import { router } from 'expo-router';
import { useState } from 'react';

import { MonthButton } from '@/components/MonthButton';
import { TransactionRow } from '@/components/TransactionRow';
import { Empty, Fab, Group, Loading, Screen } from '@/components/ui';
import { currentMonth, monthRange } from '@/lib/format';
import { useTransactions } from '@/lib/queries';

export default function Transactions() {
  const [month, setMonth] = useState(currentMonth());
  const { data, isLoading } = useTransactions({ scope: 'me', ...monthRange(month), limit: 500 });

  return (
    <Screen footer={<Fab label="Add transaction" onPress={() => router.push('/transaction')} />}>
      <MonthButton month={month} onChange={setMonth} />
      {isLoading && <Loading />}
      {data?.length === 0 && <Empty>No transactions this month.</Empty>}
      {!!data?.length && <Group>{data.map((t) => <TransactionRow key={t.id} txn={t} />)}</Group>}
    </Screen>
  );
}
