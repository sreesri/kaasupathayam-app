import { useEffect, useRef } from 'react';
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { fonts, useColors } from '@/lib/theme';

export const ITEM = 44;
const VISIBLE = 5; // odd: the middle row is the selection
const PAD = ITEM * Math.floor(VISIBLE / 2);
const SETTLE_MS = 120;

/** One scroll wheel: scrolls and snaps to a row, or tap a row to pick it. Works the same on
 *  Android and web (web has no momentum events, so the snap happens once scrolling settles). */
export function WheelPicker({
  items,
  index,
  onChange,
  accessibilityLabel,
}: {
  items: string[];
  index: number;
  onChange: (index: number) => void;
  accessibilityLabel: string;
}) {
  const c = useColors();
  const ref = useRef<ScrollView>(null);
  const settle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastY = useRef(index * ITEM);
  const positioned = useRef(false);

  // Follow the selection when it changes from outside (e.g. a shorter month clamps the day).
  useEffect(() => {
    if (Math.round(lastY.current / ITEM) !== index) {
      lastY.current = index * ITEM;
      ref.current?.scrollTo({ y: index * ITEM, animated: false });
    }
  }, [index]);

  useEffect(() => () => {
    if (settle.current) clearTimeout(settle.current);
  }, []);

  const select = (i: number, animated = true) => {
    const clamped = Math.max(0, Math.min(items.length - 1, i));
    lastY.current = clamped * ITEM;
    ref.current?.scrollTo({ y: clamped * ITEM, animated });
    if (clamped !== index) onChange(clamped);
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    lastY.current = e.nativeEvent.contentOffset.y;
    if (settle.current) clearTimeout(settle.current);
    settle.current = setTimeout(() => select(Math.round(lastY.current / ITEM)), SETTLE_MS);
  };

  return (
    <View
      style={{ flex: 1, height: ITEM * VISIBLE }}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ text: items[index] }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => select(index + (e.nativeEvent.actionName === 'increment' ? 1 : -1))}
    >
      <ScrollView
        ref={ref}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM}
        decelerationRate="fast"
        scrollEventThrottle={16}
        onScroll={onScroll}
        // `contentOffset` is ignored on web, so put each wheel on its value once laid out.
        onLayout={() => {
          if (positioned.current) return;
          positioned.current = true;
          ref.current?.scrollTo({ y: index * ITEM, animated: false });
        }}
        contentContainerStyle={{ paddingVertical: PAD }}
        nestedScrollEnabled
      >
        {items.map((label, i) => {
          const distance = Math.abs(i - index);
          return (
            <Pressable
              key={`${label}-${i}`}
              onPress={() => select(i)}
              importantForAccessibility="no"
              style={styles.item}
            >
              <Text
                style={{
                  fontSize: distance === 0 ? 19 : 16,
                  fontFamily: distance === 0 ? fonts.display : undefined,
                  color: distance === 0 ? c.text : distance === 1 ? c.muted : c.border,
                }}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  item: { height: ITEM, alignItems: 'center', justifyContent: 'center' },
});
