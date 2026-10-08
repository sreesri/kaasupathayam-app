import { Platform, Text, TextInput, View } from 'react-native';

import { DateField } from './DateField';
import { applyKey, Keypad } from './Keypad';
import { Select } from './Select';
import { Group, GroupRow, SegmentedControl } from './ui';
import { useUser } from '@/lib/auth';
import { moneyShort, moneySymbol } from '@/lib/format';
import { useAccounts, useCategories, useHousehold } from '@/lib/queries';
import { fonts, useColors } from '@/lib/theme';
import type { Account, TxnType } from '@/lib/types';

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

/** Amount with Indian digit grouping, keeping the decimals as typed ("285000.5" → "2,85,000.5"). */
function groupAmount(amount: string): string {
  if (!amount) return '0';
  const [whole, frac] = amount.split('.');
  const grouped = Number(whole || '0').toLocaleString('en-IN');
  return frac === undefined ? grouped : `${grouped}.${frac}`;
}

const TYPE_LABEL = { expense: 'Expense', income: 'Income', transfer: 'Transfer' } as const;

/** Amount-first entry: type switch, a big amount typed on the keypad, then account, category
 *  (or destination), date and note as rows that open bottom sheets. `lockType` hides the
 *  type switch when editing. */
export function EntryFields({
  draft,
  onChange,
  date,
  onDateChange,
  lockType,
}: {
  draft: EntryDraft;
  onChange: (d: EntryDraft) => void;
  date: string;
  onDateChange: (date: string) => void;
  lockType?: boolean;
}) {
  const c = useColors();
  const me = useUser();
  const household = useHousehold();
  const currency = household.data?.currency ?? 'INR';
  const myAccounts = useAccounts('me').data ?? [];
  const allAccounts = useAccounts('household').data ?? [];
  const categories = useCategories().data ?? [];
  const set = (patch: Partial<EntryDraft>) => onChange({ ...draft, ...patch });
  const typeColor = { expense: c.expense, income: c.income, transfer: c.transfer }[draft.type];

  const ownerName = (id: string) =>
    id === me.id ? '' : ` (${household.data?.members.find((m) => m.id === id)?.name ?? '?'})`;
  const accountOption = (a: Account) => ({
    value: a.id,
    label: a.name + ownerName(a.owner_id),
    meta:
      Number(a.balance) < 0
        ? `${moneyShort(-Number(a.balance), currency)} owed`
        : moneyShort(a.balance, currency),
  });

  return (
    <View style={{ gap: 14 }}>
      {!lockType && (
        <SegmentedControl
          accessibilityLabel="Type"
          options={(['expense', 'income', 'transfer'] as const).map((t) => ({
            value: t,
            label: TYPE_LABEL[t],
            color: { expense: c.expense, income: c.income, transfer: c.transfer }[t],
          }))}
          value={draft.type}
          onChange={(type) => set({ type, category_id: null, to_account_id: null })}
        />
      )}

      <View style={{ alignItems: 'center', paddingVertical: 4 }} accessibilityLiveRegion="polite">
        {Platform.OS === 'web' ? (
          // On the web the amount is also typeable on a physical keyboard.
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: fonts.display, fontSize: 34, color: c.muted }}>{moneySymbol(currency)}</Text>
          <TextInput
            value={draft.amount}
            onChangeText={(v) => {
              const clean = v.replace(',', '.');
              if (clean === '' || /^\d{0,12}(\.\d{0,2})?$/.test(clean)) set({ amount: clean });
            }}
            placeholder="0"
            placeholderTextColor={c.muted}
            inputMode="decimal"
            accessibilityLabel={`Amount in ${currency}`}
            // Inputs don't auto-size on the web; ~30px per character keeps "₹" next to the number.
            style={{
              fontFamily: fonts.display,
              fontSize: 52,
              color: typeColor,
              width: Math.max(1, (draft.amount || '0').length) * 30 + 24,
            }}
          />
          </View>
        ) : (
          <Text
            accessibilityLabel={`Amount: ${draft.amount || '0'} ${currency}`}
            style={{ fontFamily: fonts.display, fontSize: 52, color: draft.amount ? typeColor : c.muted }}
            adjustsFontSizeToFit
            numberOfLines={1}
          >
            {moneySymbol(currency)}
            {groupAmount(draft.amount)}
          </Text>
        )}
      </View>

      <Group>
        <Select
          label={draft.type === 'income' ? 'Into' : 'From'}
          title={draft.type === 'income' ? 'Paid into' : 'Paid from'}
          placeholder="Choose an account"
          options={myAccounts.map(accountOption)}
          value={draft.account_id}
          onChange={(account_id) => set({ account_id })}
        />
        {draft.type === 'transfer' ? (
          <Select
            label="To"
            title="Transfer to"
            placeholder="Choose an account"
            options={allAccounts.filter((a) => a.id !== draft.account_id).map(accountOption)}
            value={draft.to_account_id}
            onChange={(to_account_id) => set({ to_account_id })}
          />
        ) : (
          <Select
            label="Category"
            placeholder="Choose a category"
            options={categories
              .filter((cat) => cat.kind === draft.type)
              .map((cat) => ({ value: cat.id, label: cat.name, icon: cat.icon }))}
            value={draft.category_id}
            onChange={(category_id) => set({ category_id })}
          />
        )}
        <DateField label="Date" value={date} onChange={onDateChange} />
        <GroupRow label="Note">
          <TextInput
            value={draft.note}
            onChangeText={(note) => set({ note })}
            placeholder="Add a note"
            placeholderTextColor={c.muted}
            maxLength={500}
            accessibilityLabel="Note"
            style={{ fontSize: 16, color: c.text, paddingVertical: 6 }}
          />
        </GroupRow>
      </Group>

      {Platform.OS !== 'web' && <Keypad onKey={(k) => set({ amount: applyKey(draft.amount, k) })} />}
    </View>
  );
}
