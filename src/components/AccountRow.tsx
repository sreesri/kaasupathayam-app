import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Body, ProgressBar } from './ui';
import { ACCOUNT_TYPE_LABEL, moneyShort } from '@/lib/format';
import { useColors } from '@/lib/theme';
import type { Account, AccountType } from '@/lib/types';

const ICON: Record<AccountType, React.ComponentProps<typeof Ionicons>['name']> = {
  bank: 'business-outline',
  credit_card: 'card-outline',
  cash: 'cash-outline',
  wallet: 'wallet-outline',
};

/** An account inside a Group. Cards show what's owed and how much of the limit is used.
 *  `owner` adds whose account it is (Household tab); `editable` makes the row open the
 *  account screen, which only the owner can use. */
export function AccountRow({
  account: a,
  currency,
  owner,
  editable = true,
}: {
  account: Account;
  currency: string;
  owner?: string;
  editable?: boolean;
}) {
  const c = useColors();
  const balance = Number(a.balance);
  const isCard = a.type === 'credit_card';
  const owed = isCard ? Math.max(-balance, 0) : 0;
  const limit = a.credit_limit ? Number(a.credit_limit) : null;
  const detail =
    isCard && limit ? `${moneyShort(limit - owed, currency)} available` : ACCOUNT_TYPE_LABEL[a.type];
  const amount = isCard ? `${moneyShort(owed, currency)} owed` : moneyShort(balance, currency);

  return (
    <Pressable
      disabled={!editable}
      onPress={() => router.push({ pathname: '/account', params: { id: a.id } })}
      accessibilityRole={editable ? 'button' : undefined}
      accessibilityLabel={`${a.name}${owner ? `, ${owner}` : ''}, ${ACCOUNT_TYPE_LABEL[a.type]}, ${amount}${editable ? '. Edit' : ''}`}
      style={({ pressed }) => [{ padding: 14, gap: 10 }, pressed && { opacity: 0.6 }]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: c.track,
          }}
        >
          <Ionicons name={ICON[a.type]} size={20} color={isCard ? c.expense : c.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Body bold>{a.name}</Body>
          <Body muted size={13}>
            {owner ? `${owner} · ${detail}` : detail}
          </Body>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Body bold color={(isCard && owed > 0) || balance < 0 ? c.expense : c.text}>
            {isCard ? moneyShort(owed, currency) : moneyShort(balance, currency)}
          </Body>
          {isCard && (
            <Body muted size={12}>
              owed
            </Body>
          )}
        </View>
        {editable && <Ionicons name="chevron-forward" size={18} color={c.muted} />}
      </View>
      {isCard && limit ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <ProgressBar ratio={owed / limit} color={c.expense} />
          </View>
          <Body muted size={12}>
            {`${Math.round((owed / limit) * 100)}% of ${moneyShort(limit, currency)} limit`}
          </Body>
        </View>
      ) : null}
    </Pressable>
  );
}
