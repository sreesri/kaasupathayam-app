import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { draftBody, draftError, emptyDraft, EntryFields, type EntryDraft } from '@/components/EntryFields';
import { Button, Card, Chips, ErrorText, Field, Loading, Screen } from '@/components/ui';
import { isValidISODate, today, toISODate } from '@/lib/format';
import {
  useCreateTransaction,
  useDeleteTransaction,
  useTransaction,
  useUpdateTransaction,
} from '@/lib/queries';
import type { Transaction } from '@/lib/types';

const yesterday = () => toISODate(new Date(Date.now() - 86_400_000));

/** Add a transaction, or edit one when opened with `?id=`. */
export default function TransactionScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existing = useTransaction(id);
  if (id && !existing.data) return <Loading />;
  return <TransactionForm existing={existing.data} />;
}

function TransactionForm({ existing }: { existing?: Transaction }) {
  const id = existing?.id;
  const create = useCreateTransaction();
  const update = useUpdateTransaction();
  const remove = useDeleteTransaction();

  const [draft, setDraft] = useState<EntryDraft>(
    existing
      ? {
          type: existing.type,
          amount: existing.amount,
          account_id: existing.account_id,
          to_account_id: existing.to_account_id,
          category_id: existing.category_id,
          note: existing.note ?? '',
        }
      : emptyDraft(),
  );
  const [date, setDate] = useState(existing?.occurred_on ?? today());
  const [error, setError] = useState<unknown>(null);
  const save = () => {
    const problem = draftError(draft) ?? (isValidISODate(date) ? null : 'Date must be YYYY-MM-DD');
    if (problem) return setError(problem);
    const body = { ...draftBody(draft), occurred_on: date };
    const done = { onSuccess: () => router.back(), onError: setError };
    if (id) update.mutate({ id, ...body }, done);
    else create.mutate(body, done);
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: id ? 'Edit transaction' : 'Add transaction' }} />
      <Card>
        <EntryFields draft={draft} onChange={setDraft} lockType={!!id} />
        <Chips
          label="Date"
          options={[
            { value: today(), label: 'Today' },
            { value: yesterday(), label: 'Yesterday' },
          ]}
          value={date}
          onChange={setDate}
        />
        <Field label="Or enter a date" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
        <ErrorText error={error} />
        <Button title="Save" onPress={save} loading={create.isPending || update.isPending} />
        {id && (
          <Button
            title="Delete"
            variant="danger"
            loading={remove.isPending}
            onPress={() => remove.mutate(id, { onSuccess: () => router.back(), onError: setError })}
          />
        )}
      </Card>
    </Screen>
  );
}
