import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { Select } from '@/components/Select';
import {
  Body,
  Button,
  ErrorText,
  Field,
  Group,
  GroupRow,
  Loading,
  SegmentedControl,
  Screen,
} from '@/components/ui';
import { currentMonth } from '@/lib/format';
import {
  useBudgetStatus,
  useCategories,
  useCreateBudget,
  useDeleteBudget,
  useUpdateBudget,
} from '@/lib/queries';
import type { BudgetStatus, Scope } from '@/lib/types';

const AMOUNT = /^\d+(\.\d{1,2})?$/;

/** New budget, or edit/delete one when opened with `?id=&scope=`. */
export default function BudgetScreen() {
  const params = useLocalSearchParams<{ id?: string; scope?: Scope; shared?: string }>();
  const scope: Scope = params.scope === 'household' ? 'household' : 'me';
  const status = useBudgetStatus(scope, currentMonth());
  if (!params.id) return <BudgetForm shared={params.shared === '1'} />;
  if (status.isLoading) return <Loading />;
  const existing = status.data?.find((b) => b.id === params.id);
  return existing ? <BudgetForm existing={existing} shared={scope === 'household'} /> : <Loading />;
}

function BudgetForm({ existing, shared: initiallyShared }: { existing?: BudgetStatus; shared: boolean }) {
  const categories = useCategories().data ?? [];
  const create = useCreateBudget();
  const update = useUpdateBudget();
  const remove = useDeleteBudget();
  const [shared, setShared] = useState<'me' | 'household'>(initiallyShared ? 'household' : 'me');
  const [categoryId, setCategoryId] = useState<string | null>(existing?.category_id ?? null);
  const [amount, setAmount] = useState(existing?.amount.replace(/\.00$/, '') ?? '');
  const [error, setError] = useState<unknown>(null);
  const done = { onSuccess: () => router.back(), onError: setError };

  const save = () => {
    if (!categoryId) return setError('Choose a category');
    if (!AMOUNT.test(amount) || Number(amount) <= 0) return setError('Enter a valid amount');
    if (existing) update.mutate({ id: existing.id, amount }, done);
    else create.mutate({ category_id: categoryId, amount, shared: shared === 'household' }, done);
  };

  return (
    <Screen maxWidth={520}>
      <Stack.Screen options={{ title: existing ? 'Edit budget' : 'New budget' }} />
      {!existing && (
        <SegmentedControl
          accessibilityLabel="Budget for"
          options={[
            { value: 'me', label: 'Just me' },
            { value: 'household', label: 'Whole household' },
          ]}
          value={shared}
          onChange={setShared}
        />
      )}
      {existing && (
        <Group>
          <GroupRow label="Category">
            <Body bold>{categories.find((c) => c.id === existing.category_id)?.name ?? 'Category'}</Body>
          </GroupRow>
        </Group>
      )}
      {!existing && (
        <Group>
          <Select
            label="Category"
            placeholder="Choose a category"
            options={categories
              .filter((c) => c.kind === 'expense')
              .map((c) => ({ value: c.id, label: c.name }))}
            value={categoryId}
            onChange={setCategoryId}
          />
        </Group>
      )}
      <Field
        label="Monthly limit"
        value={amount}
        onChangeText={(v) => setAmount(v.replace(',', '.'))}
        keyboardType="decimal-pad"
        placeholder="0.00"
      />
      <ErrorText error={error} />
      <Button
        title={existing ? 'Save changes' : 'Create budget'}
        onPress={save}
        loading={create.isPending || update.isPending}
      />
      {existing && (
        <Button
          title="Delete budget"
          variant="danger"
          loading={remove.isPending}
          onPress={() => remove.mutate(existing.id, done)}
        />
      )}
    </Screen>
  );
}
