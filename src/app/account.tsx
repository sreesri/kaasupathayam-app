import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import {
  Body,
  Button,
  Card,
  ErrorText,
  Field,
  Label,
  Loading,
  SegmentedControl,
  Screen,
} from '@/components/ui';
import { ApiError } from '@/lib/api';
import { ACCOUNT_TYPE_LABEL } from '@/lib/format';
import {
  useAccounts,
  useCreateAccount,
  useDeleteAccount,
  useUpdateAccount,
} from '@/lib/queries';
import type { Account, AccountType } from '@/lib/types';

const AMOUNT = /^-?\d+(\.\d{1,2})?$/;

/** Short labels that fit four across in the segmented control. */
const SHORT_TYPE: Record<AccountType, string> = {
  bank: 'Bank',
  credit_card: 'Card',
  cash: 'Cash',
  wallet: 'Wallet',
};

/** Cards are entered as "amount owed" but stored as a negative balance, and vice versa. */
const negate = (s: string) => (s.startsWith('-') ? s.slice(1) : Number(s) === 0 ? s : `-${s}`);

/** Add an account, or edit one when opened with `?id=`. */
export default function AccountScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const accounts = useAccounts('me', true);
  if (!id) return <AccountForm />;
  if (accounts.isLoading) return <Loading />;
  const existing = accounts.data?.find((a) => a.id === id);
  if (!existing) {
    return (
      <Screen>
        <Body muted>This account no longer exists.</Body>
      </Screen>
    );
  }
  return <AccountForm existing={existing} />;
}

function AccountForm({ existing }: { existing?: Account }) {
  const create = useCreateAccount();
  const update = useUpdateAccount();
  const [type, setType] = useState<AccountType>(existing?.type ?? 'bank');
  const isCard = type === 'credit_card';
  const [name, setName] = useState(existing?.name ?? '');
  const [opening, setOpening] = useState(
    existing ? (isCard ? negate(existing.opening_balance) : existing.opening_balance) : '0',
  );
  const [limit, setLimit] = useState(existing?.credit_limit ?? '');
  const [error, setError] = useState<unknown>(null);

  const save = () => {
    if (!name.trim()) return setError('Give the account a name');
    if (!AMOUNT.test(opening)) return setError('Enter a valid amount');
    if (isCard && limit && !/^\d+(\.\d{1,2})?$/.test(limit))
      return setError('Enter a valid credit limit');
    const body = {
      name: name.trim(),
      opening_balance: isCard ? negate(opening) : opening,
      credit_limit: isCard && limit ? limit : null,
    };
    const done = { onSuccess: () => router.back(), onError: setError };
    if (existing) update.mutate({ id: existing.id, ...body }, done);
    else create.mutate({ ...body, type }, done);
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: existing ? 'Edit account' : 'New account' }} />
      <Card>
        {existing ? (
          <Body muted size={14}>
            {ACCOUNT_TYPE_LABEL[existing.type]}
          </Body>
        ) : (
          <SegmentedControl
            accessibilityLabel="Account type"
            options={(Object.keys(SHORT_TYPE) as AccountType[]).map((t) => ({
              value: t,
              label: SHORT_TYPE[t],
            }))}
            value={type}
            onChange={setType}
          />
        )}
        <Field
          label="Name"
          value={name}
          onChangeText={setName}
          placeholder={isCard ? 'e.g. HDFC Millennia' : 'e.g. SBI Savings'}
        />
        <Field
          label={
            existing
              ? isCard
                ? 'Amount owed before tracking started'
                : 'Balance before tracking started'
              : isCard
                ? 'Amount currently owed'
                : 'Current balance'
          }
          value={opening}
          onChangeText={setOpening}
          keyboardType="numbers-and-punctuation"
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
          {existing
            ? 'The current balance is this starting amount plus every transaction on the account.'
            : isCard
              ? 'Card spends are logged as expenses on this card. Paying the bill is a transfer from your bank account.'
              : 'Other household members can see this account in the Household tab.'}
        </Body>
        <ErrorText error={error} />
        <Button
          title={existing ? 'Save changes' : 'Create account'}
          onPress={save}
          loading={create.isPending || update.isPending}
        />
      </Card>
      {existing && <ArchiveCard account={existing} />}
      {existing && <DangerZone account={existing} />}
    </Screen>
  );
}

/** Archived accounts drop out of lists and pickers but keep their history. */
function ArchiveCard({ account }: { account: Account }) {
  const update = useUpdateAccount();
  return (
    <Card>
      <Label>{account.archived ? 'Archived' : 'Archive'}</Label>
      <Body muted size={14}>
        {account.archived
          ? 'This account is hidden from lists and pickers. Restore it to use it again.'
          : 'Hide this account from lists and pickers. Its transactions and balance history stay.'}
      </Body>
      <Button
        title={account.archived ? 'Restore account' : 'Archive account'}
        variant="secondary"
        loading={update.isPending}
        onPress={() =>
          update.mutate({ id: account.id, archived: !account.archived }, { onSuccess: () => router.back() })
        }
      />
      <ErrorText error={update.error} />
    </Card>
  );
}

/** Delete needs a second tap (Alert dialogs don't work on web). Accounts with history can only
 *  be archived: deleting them would rewrite past reports and other members' transfers. */
function DangerZone({ account }: { account: Account }) {
  const remove = useDeleteAccount();
  const update = useUpdateAccount();
  const [confirming, setConfirming] = useState(false);
  const hasHistory = remove.error instanceof ApiError && remove.error.status === 409;

  if (hasHistory) {
    return (
      <Card>
        <Label>Can&apos;t delete</Label>
        <Body size={14}>
          {account.name} has transactions, so deleting it would change your past balances and
          reports. Archive it instead: it disappears from lists and pickers, but its history stays.
          You can restore it any time from Accounts → Archived.
        </Body>
        {account.archived ? (
          <Body muted size={14}>
            It&apos;s already archived.
          </Body>
        ) : (
          <Button
            title="Archive instead"
            loading={update.isPending}
            onPress={() =>
              update.mutate({ id: account.id, archived: true }, { onSuccess: () => router.back() })
            }
          />
        )}
        <ErrorText error={update.error} />
      </Card>
    );
  }

  return (
    <Card>
      <Label>Delete account</Label>
      {confirming ? (
        <>
          <Body size={14}>Delete {account.name}? This can&apos;t be undone.</Body>
          <Button
            title="Yes, delete it"
            variant="danger"
            loading={remove.isPending}
            onPress={() => remove.mutate(account.id, { onSuccess: () => router.back() })}
          />
          <Button title="Cancel" variant="secondary" onPress={() => setConfirming(false)} />
        </>
      ) : (
        <>
          <Body muted size={14}>
            Only accounts with no transactions can be deleted. Others can be archived.
          </Body>
          <Button title="Delete account" variant="danger" onPress={() => setConfirming(true)} />
        </>
      )}
      <ErrorText error={remove.error} />
    </Card>
  );
}
