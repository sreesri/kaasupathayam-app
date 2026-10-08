import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fonts, useColors } from '@/lib/theme';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'] as const;
export type Key = (typeof KEYS)[number];

/** Apply a keypad key to an amount string: at most 2 decimals, no leading zeros, ≤ 12 digits. */
export function applyKey(amount: string, key: Key): string {
  if (key === 'del') return amount.slice(0, -1);
  if (key === '.') return amount.includes('.') ? amount : (amount || '0') + '.';
  const [whole, frac] = amount.split('.');
  if (frac !== undefined && frac.length >= 2) return amount;
  if (frac === undefined && whole.replace(/^0+/, '').length >= 12) return amount;
  return amount === '0' ? key : amount + key;
}

export function Keypad({ onKey }: { onKey: (key: Key) => void }) {
  const c = useColors();
  return (
    <View style={styles.grid}>
      {KEYS.map((k) => (
        <Pressable
          key={k}
          onPress={() => onKey(k)}
          accessibilityRole="button"
          accessibilityLabel={k === 'del' ? 'Delete digit' : k === '.' ? 'Decimal point' : k}
          style={({ pressed }) => [styles.key, { backgroundColor: c.track }, pressed && { opacity: 0.6 }]}
        >
          {k === 'del' ? (
            <Ionicons name="backspace-outline" size={24} color={c.text} />
          ) : (
            <Text style={{ color: c.text, fontFamily: fonts.semibold, fontSize: 22 }}>{k}</Text>
          )}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  key: { width: '31.8%', flexGrow: 1, height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
