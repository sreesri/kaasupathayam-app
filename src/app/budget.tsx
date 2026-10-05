import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { Button, Card, Chips, ErrorText, Field, Screen } from '@/components/ui';
import { useCategories, useCreateBudget } from '@/lib/queries';

export default function NewBudget() {
  const params = useLocalSearchParams<{ shared?: string }>();
  const categories = useCategories().data ?? [];
  const create = useCreateBudget();
  const [shared, setShared] = useState(params.shared === '1' ? 'yes' : 'no');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<unknown>(null);

  const save = () => {
    if (!categoryId) return setError('Choose a category');
    if (!/^\d+(\.\d{1,2})?$/.test(amount) || Number(amount) <= 0)
      return setError('Enter a valid amount');
    create.mutate(
      { category_id: categoryId, amount, shared: shared === 'yes' },
      { onSuccess: () => router.back(), onError: setError },
    );
  };

  return (
    <Screen>
      <Card>
        <Chips
          label="Budget for"
          options={[
            { value: 'no', label: 'Just me' },
            { value: 'yes', label: 'Whole household' },
          ]}
          value={shared}
          onChange={setShared}
        />
        <Chips
          label="Category"
          options={categories
            .filter((c) => c.kind === 'expense')
            .map((c) => ({ value: c.id, label: c.name }))}
          value={categoryId}
          onChange={setCategoryId}
        />
        <Field
          label="Monthly limit"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="0.00"
        />
        <ErrorText error={error} />
        <Button title="Create budget" onPress={save} loading={create.isPending} />
      </Card>
    </Screen>
  );
}
