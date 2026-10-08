import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Label } from './ui';
import { fonts, useColors } from '@/lib/theme';

/** A dropdown: a field showing the current choice that opens a scrollable list. Built from
 *  plain views so it looks the same on Android and web, with no native picker module. */
export function Select<T extends string>({
  label,
  options,
  value,
  onChange,
  placeholder = 'Choose…',
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (value: T) => void;
  placeholder?: string;
}) {
  const c = useColors();
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={{ gap: 6 }}>
      <Label>{label}</Label>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selected?.label ?? 'none selected'}`}
        accessibilityHint="Opens a list to choose from"
        style={({ pressed }) => [
          styles.field,
          { borderColor: c.border, backgroundColor: c.card },
          pressed && { opacity: 0.7 },
        ]}
      >
        <Text style={{ flex: 1, fontSize: 16, color: selected ? c.text : c.muted }}>
          {selected?.label ?? placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color={c.muted} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          style={styles.backdrop}
          onPress={() => setOpen(false)}
          accessibilityLabel="Close list"
        >
          {/* Inner Pressable swallows taps so only the backdrop closes the sheet. */}
          <Pressable
            onPress={() => {}}
            style={[styles.sheet, { backgroundColor: c.card, borderColor: c.border }]}
          >
            <Text style={[styles.title, { color: c.text }]}>{label}</Text>
            <ScrollView>
              {options.map((o) => {
                const isSelected = o.value === value;
                return (
                  <Pressable
                    key={o.value}
                    onPress={() => {
                      onChange(o.value);
                      setOpen(false);
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    style={({ pressed }) => [
                      styles.option,
                      { borderColor: c.border },
                      isSelected && { backgroundColor: c.track },
                      pressed && { opacity: 0.6 },
                    ]}
                  >
                    <Text
                      style={{
                        flex: 1,
                        fontSize: 16,
                        color: c.text,
                        fontFamily: isSelected ? fonts.semibold : undefined,
                      }}
                    >
                      {o.label}
                    </Text>
                    {isSelected && <Ionicons name="checkmark" size={20} color={c.primary} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  sheet: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '75%',
    borderRadius: 16,
    borderWidth: 1,
    paddingTop: 16,
    paddingBottom: 8,
    overflow: 'hidden',
  },
  title: { fontFamily: fonts.display, fontSize: 18, paddingHorizontal: 16, paddingBottom: 8 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    minHeight: 48,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
