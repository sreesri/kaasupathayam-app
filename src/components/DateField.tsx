// Android: the system calendar dialog. Web uses DateField.web.tsx (the browser's date input).
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Text } from 'react-native';

import { GroupRow } from './ui';
import { fromISODate, longDateLabel, toISODate } from '@/lib/format';
import { fonts, useColors } from '@/lib/theme';

export interface DateFieldProps {
  label: string;
  /** YYYY-MM-DD */
  value: string;
  onChange: (value: string) => void;
}

/** A Group row showing the date; tapping opens the calendar. */
export function DateField({ label, value, onChange }: DateFieldProps) {
  const c = useColors();
  const open = () =>
    DateTimePickerAndroid.open({
      value: fromISODate(value),
      mode: 'date',
      onValueChange: (_event, date) => onChange(toISODate(date)),
    });

  return (
    <GroupRow label={label} onPress={open} accessibilityLabel={`${label}: ${longDateLabel(value)}. Change date`}>
      <Text style={{ fontSize: 16, color: c.text, fontFamily: fonts.semibold }}>{longDateLabel(value)}</Text>
    </GroupRow>
  );
}
