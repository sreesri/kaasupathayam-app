// Android: the system calendar dialog. Web uses DateField.web.tsx (the browser's date input).
import { Ionicons } from '@expo/vector-icons';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Label } from './ui';
import { fromISODate, longDateLabel, toISODate } from '@/lib/format';
import { useColors } from '@/lib/theme';

export interface DateFieldProps {
  label: string;
  /** YYYY-MM-DD */
  value: string;
  onChange: (value: string) => void;
}

export function DateField({ label, value, onChange }: DateFieldProps) {
  const c = useColors();
  const open = () =>
    DateTimePickerAndroid.open({
      value: fromISODate(value),
      mode: 'date',
      onValueChange: (_event, date) => onChange(toISODate(date)),
    });

  return (
    <View style={{ gap: 6 }}>
      <Label>{label}</Label>
      <Pressable
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${longDateLabel(value)}`}
        accessibilityHint="Opens a calendar"
        style={[styles.field, { borderColor: c.border, backgroundColor: c.card }]}
      >
        <Ionicons name="calendar-outline" size={20} color={c.primary} />
        <Text style={{ flex: 1, fontSize: 16, color: c.text }}>{longDateLabel(value)}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
  },
});
