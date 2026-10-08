import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { CategoryIcon } from './CategoryIcon';
import { Sheet } from './Sheet';
import { GroupRow } from './ui';
import { fonts, useColors } from '@/lib/theme';

export interface SelectOption<T extends string> {
  value: T;
  label: string;
  /** Secondary text on the right of the option, e.g. a balance. */
  meta?: string;
  /** Small colour mark before the label. */
  color?: string;
  /** Category icon before the label. */
  icon?: string;
}

const SEARCH_FROM = 9; // long lists (categories) get a search box

/** A Group row showing the current choice; tapping opens a bottom sheet to pick another. */
export function Select<T extends string>({
  label,
  title,
  options,
  value,
  onChange,
  placeholder = 'Choose',
}: {
  label: string;
  /** Sheet title; defaults to the row label. */
  title?: string;
  options: SelectOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  placeholder?: string;
}) {
  const c = useColors();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selected = options.find((o) => o.value === value);
  const q = query.trim().toLowerCase();
  const shown = q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
  const close = () => {
    setOpen(false);
    setQuery('');
  };

  return (
    <>
      <GroupRow
        label={label}
        onPress={() => setOpen(true)}
        accessibilityLabel={`${label}: ${selected?.label ?? 'none selected'}`}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {selected?.icon ? <CategoryIcon name={selected.icon} size={28} /> : null}
          {selected?.color ? (
            <View style={[styles.swatch, { backgroundColor: selected.color }]} />
          ) : null}
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              fontSize: 16,
              color: selected ? c.text : c.muted,
              fontFamily: selected ? fonts.semibold : undefined,
            }}
          >
            {selected?.label ?? placeholder}
          </Text>
        </View>
      </GroupRow>

      <Sheet visible={open} onClose={close} title={title ?? label}>
        {options.length >= SEARCH_FROM && (
          <View style={[styles.search, { backgroundColor: c.track }]}>
            <Ionicons name="search" size={18} color={c.muted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={`Search ${(title ?? label).toLowerCase()}`}
              placeholderTextColor={c.muted}
              accessibilityLabel={`Search ${(title ?? label).toLowerCase()}`}
              style={{ flex: 1, fontSize: 16, color: c.text, paddingVertical: 10 }}
            />
          </View>
        )}
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 16 }}>
          {shown.map((o) => {
            const isSelected = o.value === value;
            return (
              <Pressable
                key={o.value}
                onPress={() => {
                  onChange(o.value);
                  close();
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                style={({ pressed }) => [
                  styles.option,
                  { borderBottomColor: c.border },
                  pressed && { opacity: 0.6 },
                ]}
              >
                {o.icon ? <CategoryIcon name={o.icon} size={30} /> : null}
                {o.color ? <View style={[styles.swatch, { backgroundColor: o.color }]} /> : null}
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
                {o.meta ? <Text style={{ fontSize: 13, color: c.muted }}>{o.meta}</Text> : null}
                <View style={{ width: 22, alignItems: 'flex-end' }}>
                  {isSelected && <Ionicons name="checkmark" size={20} color={c.primary} />}
                </View>
              </Pressable>
            );
          })}
          {shown.length === 0 && (
            <Text style={{ color: c.muted, paddingVertical: 20, textAlign: 'center' }}>No matches</Text>
          )}
        </ScrollView>
      </Sheet>
    </>
  );
}

const styles = StyleSheet.create({
  swatch: { width: 10, height: 10, borderRadius: 3 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 50,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
