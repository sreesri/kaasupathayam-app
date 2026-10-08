import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Sheet } from './Sheet';
import { currentMonth, monthLabel, shiftMonth } from '@/lib/format';
import { fonts, useColors } from '@/lib/theme';

const MONTHS_BACK = 24;

/** "October 2026 ⌄": opens a sheet of recent months (replaces the ‹ › month switcher). */
export function MonthButton({ month, onChange }: { month: string; onChange: (m: string) => void }) {
  const c = useColors();
  const [open, setOpen] = useState(false);
  const now = currentMonth();
  const months = Array.from({ length: MONTHS_BACK }, (_, i) => shiftMonth(now, -i));

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`Month: ${monthLabel(month)}. Change month`}
        style={({ pressed }) => [styles.button, pressed && { opacity: 0.6 }]}
      >
        <Text style={{ color: c.text, fontFamily: fonts.display, fontSize: 18 }}>{monthLabel(month)}</Text>
        <Ionicons name="chevron-down" size={18} color={c.text} />
      </Pressable>
      <Sheet visible={open} onClose={() => setOpen(false)} title="Month">
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16 }}>
          {months.map((m) => {
            const selected = m === month;
            return (
              <Pressable
                key={m}
                onPress={() => {
                  onChange(m);
                  setOpen(false);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={({ pressed }) => [
                  styles.option,
                  { borderBottomColor: c.border },
                  pressed && { opacity: 0.6 },
                ]}
              >
                <Text style={{ flex: 1, fontSize: 16, color: c.text, fontFamily: selected ? fonts.semibold : undefined }}>
                  {monthLabel(m)}
                </Text>
                {m === now && <Text style={{ fontSize: 13, color: c.muted }}>This month</Text>}
                <View style={{ width: 22, alignItems: 'flex-end' }}>
                  {selected && <Ionicons name="checkmark" size={20} color={c.primary} />}
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </Sheet>
    </>
  );
}

const styles = StyleSheet.create({
  button: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, alignSelf: 'flex-start' },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 50, borderBottomWidth: StyleSheet.hairlineWidth },
});
