import { router } from 'expo-router';
import { useState } from 'react';

import { draftBody, draftError, emptyDraft, EntryFields } from '@/components/EntryFields';
import { Body, Button, Card, Chips, ErrorText, Field, Screen } from '@/components/ui';
import { isValidISODate, today } from '@/lib/format';
import { useCreateRecurring } from '@/lib/queries';
import type { Frequency } from '@/lib/types';

export default function NewRecurring() {
  const create = useCreateRecurring();
  const [draft, setDraft] = useState(emptyDraft());
  const [frequency, setFrequency] = useState<Frequency>('monthly');
  const [interval, setInterval] = useState('1');
  const [start, setStart] = useState(today());
  const [end, setEnd] = useState('');
  const [error, setError] = useState<unknown>(null);

  const save = () => {
    const n = Number(interval);
    const problem =
      draftError(draft) ??
      (!Number.isInteger(n) || n < 1 ? 'Repeat interval must be a whole number' : null) ??
      (isValidISODate(start) ? null : 'Start date must be YYYY-MM-DD') ??
      (end && !isValidISODate(end) ? 'End date must be YYYY-MM-DD' : null);
    if (problem) return setError(problem);
    create.mutate(
      {
        ...draftBody(draft),
        frequency,
        interval: n,
        start_date: start,
        end_date: end || null,
      },
      { onSuccess: () => router.back(), onError: setError },
    );
  };

  return (
    <Screen>
      <Card>
        <EntryFields draft={draft} onChange={setDraft} />
        <Chips
          label="Repeats"
          options={[
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'monthly', label: 'Monthly' },
            { value: 'yearly', label: 'Yearly' },
          ]}
          value={frequency}
          onChange={setFrequency}
        />
        <Field label="Every N periods" value={interval} onChangeText={setInterval} keyboardType="number-pad" />
        <Field label="First date" value={start} onChangeText={setStart} placeholder="YYYY-MM-DD" />
        <Field label="End date" value={end} onChangeText={setEnd} placeholder="Optional, YYYY-MM-DD" />
        <Body muted size={13}>
          Past dates are filled in immediately. Later occurrences are added when they come due.
        </Body>
        <ErrorText error={error} />
        <Button title="Create" onPress={save} loading={create.isPending} />
      </Card>
    </Screen>
  );
}
