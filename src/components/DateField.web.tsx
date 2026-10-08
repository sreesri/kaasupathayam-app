// Web: the browser's native date input (calendar popup) inside a Group row.
import { createElement } from 'react';
import { useColorScheme } from 'react-native';

import type { DateFieldProps } from './DateField';
import { GroupRow } from './ui';
import { useColors } from '@/lib/theme';

export function DateField({ label, value, onChange }: DateFieldProps) {
  const c = useColors();
  const dark = useColorScheme() === 'dark';
  return (
    <GroupRow label={label}>
      {createElement('input', {
        type: 'date',
        value,
        required: true,
        'aria-label': label,
        // Ignore the browser's clear button: a transaction always has a date.
        onChange: (e: { target: { value: string } }) => e.target.value && onChange(e.target.value),
        style: {
          border: 'none',
          background: 'transparent',
          padding: '6px 0',
          fontSize: 16,
          fontWeight: 600,
          // Same stack react-native-web gives <Text>; 'inherit' would fall back to the browser serif.
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          color: c.text,
          colorScheme: dark ? 'dark' : 'light',
          accentColor: c.primary,
        },
      })}
    </GroupRow>
  );
}
