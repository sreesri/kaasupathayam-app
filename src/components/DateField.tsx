// Android: the system calendar dialog. Web uses DateField.web.tsx (the browser's date input).
import { Ionicons } from '@expo/vector-icons';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Label } from './ui';
import { fromISODate, longDateLabel, toISODate } from '@/lib/format';
import { useColors } from '@/lib/theme';

export interface DateFieldProps {
  label: string;
  /** YYYY-MM-DD, or null when an optional date isn't set. */
  value: string | null;
  onChange: (value: string | null) => void;
  /** Allows clearing the date (e.g. a recurring entry's end date). */
  optional?: boolean;
  placeholder?: string;
}

export function DateField({ label, value, onChange, optional, placeholder }: DateFieldProps) {
  const c = useColors();
  const open = () =>
    DateTimePickerAndroid.open({
      value: value ? fromISODate(value) : new Date(),
      mode: 'date',
      onValueChange: (_event, date) => onChange(toISODate(date)),
    });

  return (
    <View style={{ gap: 6 }}>
      <Label>{label}</Label>
      <View style={[styles.field, { borderColor: c.border, backgroundColor: c.card }]}>
        <Pressable
          onPress={open}
          accessibilityRole="button"
          accessibilityLabel={`${label}: ${value ? longDateLabel(value) : (placeholder ?? 'not set')}`}
          accessibilityHint="Opens a calendar"
          style={styles.press}
        >
          <Ionicons name="calendar-outline" size={20} color={c.primary} />
          <Text style={{ flex: 1, fontSize: 16, color: value ? c.text : c.muted }}>
            {value ? longDateLabel(value) : (placeholder ?? 'Choose a date')}
          </Text>
        </Pressable>
        {optional && value && (
          <Pressable
            onPress={() => onChange(null)}
            accessibilityRole="button"
            accessibilityLabel={`Clear ${label}`}
            hitSlop={10}
            style={{ paddingHorizontal: 12 }}
          >
            <Ionicons name="close-circle" size={20} color={c.muted} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { borderWidth: 1, borderRadius: 12, flexDirection: 'row', alignItems: 'center' },
  press: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 },
});
