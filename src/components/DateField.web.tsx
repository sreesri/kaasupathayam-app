// Web: the browser's native date input (calendar popup), styled like the app's fields.
import { createElement } from 'react';
import { useColorScheme, View } from 'react-native';

import type { DateFieldProps } from './DateField';
import { Label } from './ui';
import { useColors } from '@/lib/theme';

export function DateField({ label, value, onChange }: DateFieldProps) {
  const c = useColors();
  const dark = useColorScheme() === 'dark';
  return (
    <View style={{ gap: 6 }}>
      <Label>{label}</Label>
      {createElement('input', {
        type: 'date',
        value,
        required: true,
        'aria-label': label,
        // Ignore the browser's clear button: a transaction always has a date.
        onChange: (e: { target: { value: string } }) => e.target.value && onChange(e.target.value),
        style: {
          border: `1px solid ${c.border}`,
          borderRadius: 12,
          padding: '11px 12px',
          fontSize: 16,
          // Same stack react-native-web gives <Text>; 'inherit' would fall back to the browser serif.
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          color: c.text,
          backgroundColor: c.card,
          colorScheme: dark ? 'dark' : 'light',
          accentColor: c.primary,
        },
      })}
    </View>
  );
}
