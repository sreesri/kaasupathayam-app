import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { monthLabel, shiftMonth } from '@/lib/format';
import { fonts, useColors } from '@/lib/theme';

/** ‹ October 2026 › : step back and forward a month at a time. */
export function MonthSwitcher({ month, onChange }: { month: string; onChange: (m: string) => void }) {
  const c = useColors();
  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => onChange(shiftMonth(month, -1))}
        accessibilityRole="button"
        accessibilityLabel="Previous month"
        hitSlop={8}
        style={({ pressed }) => [styles.arrow, pressed && { opacity: 0.5 }]}
      >
        <Ionicons name="chevron-back" size={22} color={c.text} />
      </Pressable>
      <Text accessibilityLiveRegion="polite" style={{ color: c.text, fontFamily: fonts.display, fontSize: 18 }}>
        {monthLabel(month)}
      </Text>
      <Pressable
        onPress={() => onChange(shiftMonth(month, 1))}
        accessibilityRole="button"
        accessibilityLabel="Next month"
        hitSlop={8}
        style={({ pressed }) => [styles.arrow, pressed && { opacity: 0.5 }]}
      >
        <Ionicons name="chevron-forward" size={22} color={c.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  arrow: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
