import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { draftBody, draftError, emptyDraft, EntryFields, type EntryDraft } from '@/components/EntryFields';
import { DateField } from '@/components/DateField';
import { Button, Card, ErrorText, Loading, Screen } from '@/components/ui';
import { today } from '@/lib/format';
import {
  useCreateTransaction,
  useDeleteTransaction,
  useTransaction,
  useUpdateTransaction,
} from '@/lib/queries';
import type { Transaction } from '@/lib/types';

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
    const problem = draftError(draft);
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
        <DateField label="Date" value={date} onChange={setDate} />
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
