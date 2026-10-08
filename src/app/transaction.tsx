import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { draftBody, draftError, emptyDraft, EntryFields, type EntryDraft } from '@/components/EntryFields';
import { Button, ErrorText, Loading, Screen } from '@/components/ui';
import { moneyShort, today } from '@/lib/format';
import {
  useCreateTransaction,
  useDeleteTransaction,
  useHousehold,
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

/** "Save ₹2,850 expense": the button confirms what will be recorded. */
function saveLabel(d: EntryDraft, currency: string, editing: boolean): string {
  if (editing) return 'Save changes';
  const amount = Number(d.amount) > 0 ? `${moneyShort(Number(d.amount), currency)} ` : '';
  return `Save ${amount}${d.type}`;
}

function TransactionForm({ existing }: { existing?: Transaction }) {
  const id = existing?.id;
  const create = useCreateTransaction();
  const update = useUpdateTransaction();
  const remove = useDeleteTransaction();
  const currency = useHousehold().data?.currency ?? 'INR';

  const [draft, setDraft] = useState<EntryDraft>(
    existing
      ? {
          type: existing.type,
          amount: existing.amount.replace(/\.00$/, ''),
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
    <Screen maxWidth={520}>
      <Stack.Screen options={{ title: id ? 'Edit transaction' : 'Add transaction' }} />
      <EntryFields
        draft={draft}
        onChange={setDraft}
        date={date}
        onDateChange={setDate}
        lockType={!!id}
      />
      <ErrorText error={error} />
      <Button
        title={saveLabel(draft, currency, !!id)}
        onPress={save}
        loading={create.isPending || update.isPending}
      />
      {id && (
        <Button
          title="Delete"
          variant="danger"
          loading={remove.isPending}
          onPress={() => remove.mutate(id, { onSuccess: () => router.back(), onError: setError })}
        />
      )}
    </Screen>
  );
}
