import { router } from 'expo-router';
import { useState } from 'react';

import { Body, Button, Card, Chips, ErrorText, Field, Screen } from '@/components/ui';
import { ACCOUNT_TYPE_LABEL } from '@/lib/format';
import { useCreateAccount } from '@/lib/queries';
import type { AccountType } from '@/lib/types';

const AMOUNT = /^\d+(\.\d{1,2})?$/;

export default function NewAccount() {
  const create = useCreateAccount();
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [opening, setOpening] = useState('0');
  const [limit, setLimit] = useState('');
  const [error, setError] = useState<unknown>(null);
  const isCard = type === 'credit_card';

  const save = () => {
    if (!name.trim()) return setError('Give the account a name');
    if (!AMOUNT.test(opening)) return setError('Enter a valid amount');
    if (isCard && limit && !AMOUNT.test(limit)) return setError('Enter a valid credit limit');
    create.mutate(
      {
        name: name.trim(),
        type,
        // A card's existing bill is money owed, stored as a negative balance.
        opening_balance: isCard && Number(opening) > 0 ? `-${opening}` : opening,
        credit_limit: isCard && limit ? limit : null,
      },
      { onSuccess: () => router.back(), onError: setError },
    );
  };

  return (
    <Screen>
      <Card>
        <Chips
          label="Type"
          options={(Object.keys(ACCOUNT_TYPE_LABEL) as AccountType[]).map((t) => ({
            value: t,
            label: ACCOUNT_TYPE_LABEL[t],
          }))}
          value={type}
          onChange={setType}
        />
        <Field
          label="Name"
          value={name}
          onChangeText={setName}
          placeholder={isCard ? 'e.g. HDFC Millennia' : 'e.g. SBI Savings'}
        />
        <Field
          label={isCard ? 'Amount currently owed' : 'Current balance'}
          value={opening}
          onChangeText={setOpening}
          keyboardType="decimal-pad"
        />
        {isCard && (
          <Field
            label="Credit limit"
            value={limit}
            onChangeText={setLimit}
            keyboardType="decimal-pad"
            placeholder="Optional"
          />
        )}
        <Body muted size={13}>
          {isCard
            ? 'Card spends are logged as expenses on this card. Paying the bill is a transfer from your bank account.'
            : 'Other household members can see this account in the Household tab.'}
        </Body>
        <ErrorText error={error} />
        <Button title="Create account" onPress={save} loading={create.isPending} />
      </Card>
    </Screen>
  );
}
