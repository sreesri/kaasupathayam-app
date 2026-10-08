import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Sheet } from './Sheet';
import { Button, GroupRow } from './ui';
import { ITEM, WheelPicker } from './WheelPicker';
import { fromISODate, longDateLabel, toISODate } from '@/lib/format';
import { fonts, useColors } from '@/lib/theme';

const MONTHS = Array.from({ length: 12 }, (_, m) =>
  new Date(2000, m, 1).toLocaleDateString(undefined, { month: 'long' }),
);
const YEARS_BACK = 10;

const daysIn = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

export interface DateFieldProps {
  label: string;
  /** YYYY-MM-DD */
  value: string;
  onChange: (value: string) => void;
}

/** A Group row showing the date; tapping opens a sheet with Day / Month / Year scroll wheels.
 *  The same on Android and web. Done applies the date; closing the sheet keeps the old one. */
export function DateField({ label, value, onChange }: DateFieldProps) {
  const c = useColors();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(() => fromISODate(value));

  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: YEARS_BACK + 2 }, (_, i) => thisYear - YEARS_BACK + i);
  const y = draft.getFullYear();
  const m = draft.getMonth();
  const days = Array.from({ length: daysIn(y, m) }, (_, i) => String(i + 1));
  // Changing month or year keeps the day, clamped to the new month's length (31 Jan → 28 Feb).
  const setParts = (year: number, month: number, day: number) =>
    setDraft(new Date(year, month, Math.min(day, daysIn(year, month))));

  return (
    <>
      <GroupRow
        label={label}
        onPress={() => {
          setDraft(fromISODate(value));
          setOpen(true);
        }}
        accessibilityLabel={`${label}: ${longDateLabel(value)}. Change date`}
      >
        <Text style={{ fontSize: 16, color: c.text, fontFamily: fonts.semibold }}>{longDateLabel(value)}</Text>
      </GroupRow>

      <Sheet visible={open} onClose={() => setOpen(false)} title={label}>
        <View style={{ paddingHorizontal: 16, gap: 12 }}>
          <Text style={{ color: c.muted, fontSize: 14 }}>{longDateLabel(toISODate(draft))}</Text>
          <View style={styles.wheels}>
            {/* The band behind the middle row marks the selection. */}
            <View pointerEvents="none" style={[styles.band, { backgroundColor: c.track }]} />
            <WheelPicker
              accessibilityLabel="Day"
              items={days}
              index={draft.getDate() - 1}
              onChange={(i) => setParts(y, m, i + 1)}
            />
            <WheelPicker
              accessibilityLabel="Month"
              items={MONTHS}
              index={m}
              onChange={(i) => setParts(y, i, draft.getDate())}
            />
            <WheelPicker
              accessibilityLabel="Year"
              items={years.map(String)}
              index={Math.max(0, years.indexOf(y))}
              onChange={(i) => setParts(years[i], m, draft.getDate())}
            />
          </View>
          <Button
            title="Done"
            onPress={() => {
              onChange(toISODate(draft));
              setOpen(false);
            }}
          />
        </View>
      </Sheet>
    </>
  );
}

const styles = StyleSheet.create({
  wheels: { flexDirection: 'row', position: 'relative' },
  band: { position: 'absolute', left: 0, right: 0, top: ITEM * 2, height: ITEM, borderRadius: 10 },
});
