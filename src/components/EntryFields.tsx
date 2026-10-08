import { View } from 'react-native';

import { Select } from './Select';
import { Chips, Field } from './ui';
import { useUser } from '@/lib/auth';
import { useAccounts, useCategories, useHousehold } from '@/lib/queries';
import type { TxnType } from '@/lib/types';

export interface EntryDraft {
  type: TxnType;
  amount: string;
  account_id: string | null;
  to_account_id: string | null;
  category_id: string | null;
  note: string;
}

export const emptyDraft = (type: TxnType = 'expense'): EntryDraft => ({
  type,
  amount: '',
  account_id: null,
  to_account_id: null,
  category_id: null,
  note: '',
});

/** Returns an error message, or null when the draft can be submitted. */
export function draftError(d: EntryDraft): string | null {
  if (!/^\d+(\.\d{1,2})?$/.test(d.amount) || Number(d.amount) <= 0) return 'Enter a valid amount';
  if (!d.account_id) return 'Choose an account';
  if (d.type === 'transfer' && !d.to_account_id) return 'Choose where the money goes';
  if (d.type !== 'transfer' && !d.category_id) return 'Choose a category';
  return null;
}

/** The draft as the API's transaction body (minus the date). */
export function draftBody(d: EntryDraft) {
  const transfer = d.type === 'transfer';
  return {
    type: d.type,
    amount: d.amount,
    account_id: d.account_id!,
    to_account_id: transfer ? d.to_account_id : null,
    category_id: transfer ? null : d.category_id,
    note: d.note.trim() || null,
  };
}

/** Type, amount, account and category/destination inputs of the transaction form.
 *  `lockType` hides the type switch when editing. */
export function EntryFields({
  draft,
  onChange,
  lockType,
}: {
  draft: EntryDraft;
  onChange: (d: EntryDraft) => void;
  lockType?: boolean;
}) {
  const me = useUser();
  const household = useHousehold();
  const myAccounts = useAccounts('me').data ?? [];
  const allAccounts = useAccounts('household').data ?? [];
  const categories = useCategories().data ?? [];
  const set = (patch: Partial<EntryDraft>) => onChange({ ...draft, ...patch });

  const ownerName = (id: string) =>
    id === me.id ? '' : ` (${household.data?.members.find((m) => m.id === id)?.name ?? '?'})`;

  return (
    <View style={{ gap: 16 }}>
      {!lockType && (
        <Chips
          options={[
            { value: 'expense', label: 'Expense' },
            { value: 'income', label: 'Income' },
            { value: 'transfer', label: 'Transfer / card payment' },
          ]}
          value={draft.type}
          onChange={(type) => set({ type, category_id: null, to_account_id: null })}
        />
      )}
      <Field
        label="Amount"
        value={draft.amount}
        onChangeText={(amount) => set({ amount: amount.replace(',', '.') })}
        keyboardType="decimal-pad"
        placeholder="0.00"
        autoFocus={!lockType}
      />
      <Chips
        label={draft.type === 'transfer' ? 'From account' : 'Account'}
        options={myAccounts.map((a) => ({ value: a.id, label: a.name }))}
        value={draft.account_id}
        onChange={(account_id) => set({ account_id })}
      />
      {draft.type === 'transfer' ? (
        <Chips
          label="To account"
          options={allAccounts
            .filter((a) => a.id !== draft.account_id)
            .map((a) => ({ value: a.id, label: a.name + ownerName(a.owner_id) }))}
          value={draft.to_account_id}
          onChange={(to_account_id) => set({ to_account_id })}
        />
      ) : (
        <Select
          label="Category"
          placeholder={draft.type === 'income' ? 'Choose an income category' : 'Choose a category'}
          options={categories
            .filter((c) => c.kind === draft.type)
            .map((c) => ({ value: c.id, label: c.name }))}
          value={draft.category_id}
          onChange={(category_id) => set({ category_id })}
        />
      )}
      <Field
        label="Note"
        value={draft.note}
        onChangeText={(note) => set({ note })}
        placeholder="Optional"
        maxLength={500}
      />
    </View>
  );
}
