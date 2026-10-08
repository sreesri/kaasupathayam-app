import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { Body, Empty } from './ui';
import { money, moneyShort } from '@/lib/format';
import { fonts, useColors } from '@/lib/theme';

export interface Spend {
  key: string;
  name: string;
  total: number;
}

const SIZE = 200;
const C = SIZE / 2;
const R_OUTER = 98;
const R_INNER = 64;
/** Part-to-whole at a glance stays readable up to six slices; the tail folds into "Other". */
const MAX_SLICES = 6;

const point = (r: number, a: number) => [C + r * Math.sin(a), C - r * Math.cos(a)]; // 0 = 12 o'clock

function ringSegment(a0: number, a1: number): string {
  const large = a1 - a0 > Math.PI ? 1 : 0;
  const [x0, y0] = point(R_OUTER, a0);
  const [x1, y1] = point(R_OUTER, a1);
  const [x2, y2] = point(R_INNER, a1);
  const [x3, y3] = point(R_INNER, a0);
  return `M${x0} ${y0}A${R_OUTER} ${R_OUTER} 0 ${large} 1 ${x1} ${y1}L${x2} ${y2}A${R_INNER} ${R_INNER} 0 ${large} 0 ${x3} ${y3}Z`;
}

/** Top categories largest-first, the rest folded into "Other". */
export function foldSpending(items: Spend[]): Spend[] {
  const sorted = [...items].filter((i) => i.total > 0).sort((a, b) => b.total - a.total);
  if (sorted.length <= MAX_SLICES) return sorted;
  const rest = sorted.slice(MAX_SLICES - 1).reduce((sum, i) => sum + i.total, 0);
  return [...sorted.slice(0, MAX_SLICES - 1), { key: 'other', name: 'Other', total: rest }];
}

/** Donut of spending by category with the total in the hole. Tap a slice or row to see its
 *  amount and share in the centre. The rows double as the data table (name, amount, %), so
 *  identity never depends on colour alone. */
export function SpendingDonut({
  items,
  currency,
  period,
}: {
  items: Spend[];
  currency: string;
  /** e.g. "October", shown as "spent in October". */
  period: string;
}) {
  const c = useColors();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const slices = foldSpending(items);
  const total = slices.reduce((sum, s) => sum + s.total, 0);
  if (total === 0) return <Empty>No spending yet.</Empty>;

  // Colours go by position in this month's order: that's the order the palette was validated in.
  const colorOf = (i: number, s: Spend) => (s.key === 'other' ? c.chartOther : c.chart[i]);
  const selectedIndex = slices.findIndex((s) => s.key === selectedKey);
  const selected = selectedIndex >= 0 ? slices[selectedIndex] : null;
  const toggle = (key: string) => setSelectedKey((k) => (k === key ? null : key));
  const pct = (v: number) => {
    const share = (v / total) * 100;
    return share > 0 && share < 1 ? '<1%' : `${Math.round(share)}%`; // never "0%" for real spending
  };

  let cumulative = 0;
  const arcs = slices.map((s, i) => {
    const a0 = (cumulative / total) * 2 * Math.PI;
    cumulative += s.total;
    const a1 = (cumulative / total) * 2 * Math.PI;
    return { s, i, a0, a1 };
  });

  return (
    <View style={{ gap: 12 }}>
      <View style={{ width: SIZE, height: SIZE, alignSelf: 'center' }}>
        <Svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          accessibilityLabel={`Spending by category: ${slices.map((s) => `${s.name} ${pct(s.total)}`).join(', ')}`}
        >
          {slices.length === 1 ? (
            // A single category is a full ring; an arc can't start and end at the same point.
            <Circle
              cx={C}
              cy={C}
              r={(R_OUTER + R_INNER) / 2}
              stroke={colorOf(0, slices[0])}
              strokeWidth={R_OUTER - R_INNER}
              fill="none"
            />
          ) : (
            arcs.map(({ s, i, a0, a1 }) => (
              <Path
                key={s.key}
                d={ringSegment(a0, a1)}
                fill={colorOf(i, s)}
                // 2px surface-coloured gap between neighbouring slices.
                stroke={c.card}
                strokeWidth={2}
                strokeLinejoin="round"
                opacity={selected && selected.key !== s.key ? 0.3 : 1}
                onPress={() => toggle(s.key)}
              />
            ))
          )}
        </Svg>
        <View
          pointerEvents="none"
          accessibilityLiveRegion="polite"
          style={{
            position: 'absolute',
            inset: 0,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 40,
          }}
        >
          <Text style={{ color: c.text, fontFamily: fonts.display, fontSize: 22 }} numberOfLines={1} adjustsFontSizeToFit>
            {moneyShort(selected ? selected.total : total, currency)}
          </Text>
          <Text style={{ color: c.muted, fontSize: 12, textAlign: 'center' }} numberOfLines={2}>
            {selected ? `${selected.name} · ${pct(selected.total)}` : `spent in ${period}`}
          </Text>
        </View>
      </View>

      {/* Legend as a two-column grid: name, then amount and share. It is also the data
          table, so every slice is named without relying on colour. */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 6 }}>
        {slices.map((s, i) => {
          const isSelected = selected?.key === s.key;
          return (
            <Pressable
              key={s.key}
              onPress={() => toggle(s.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${s.name}, ${money(s.total, currency)}, ${pct(s.total)}`}
              style={({ pressed }) => ({
                width: '50%',
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 8,
                minHeight: 48,
                paddingHorizontal: 6,
                paddingVertical: 4,
                borderRadius: 8,
                backgroundColor: isSelected ? c.track : 'transparent',
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <View style={{ width: 10, height: 10, borderRadius: 3, marginTop: 5, backgroundColor: colorOf(i, s) }} />
              <View style={{ flex: 1 }}>
                <Body size={14}>{s.name}</Body>
                <Body bold size={14}>
                  {moneyShort(s.total, currency)}{' '}
                  <Body muted size={14}>
                    {pct(s.total)}
                  </Body>
                </Body>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
