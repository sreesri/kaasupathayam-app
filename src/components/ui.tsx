import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { fonts, useColors } from '@/lib/theme';

const LOGO = require('../../assets/logo.png');

/** Scrollable page body, width-capped so it reads well on desktop web. */
export function Screen({
  children,
  footer,
  maxWidth = 720,
}: {
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: number;
}) {
  const c = useColors();
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
        <View style={[styles.column, { maxWidth }]}>{children}</View>
      </ScrollView>
      {footer}
    </View>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const c = useColors();
  return (
    <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }, style]}>
      {children}
    </View>
  );
}

export function Title({ children }: { children: React.ReactNode }) {
  const c = useColors();
  return <Text style={[styles.title, { color: c.text }]}>{children}</Text>;
}

export function Label({ children }: { children: React.ReactNode }) {
  const c = useColors();
  return <Text style={[styles.label, { color: c.muted }]}>{children}</Text>;
}

export function Body({
  children,
  muted,
  color,
  bold,
  size = 15,
}: {
  children: React.ReactNode;
  muted?: boolean;
  color?: string;
  bold?: boolean;
  size?: number;
}) {
  const c = useColors();
  return (
    <Text
      style={{
        color: color ?? (muted ? c.muted : c.text),
        fontFamily: bold ? fonts.semibold : undefined,
        fontSize: size,
        fontVariant: ['tabular-nums'],
      }}
    >
      {children}
    </Text>
  );
}

export function Row({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.row, style]}>{children}</View>;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading,
  disabled,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  disabled?: boolean;
}) {
  const c = useColors();
  const bg = variant === 'primary' ? c.primary : 'transparent';
  const fg = variant === 'primary' ? c.primaryText : variant === 'danger' ? c.expense : c.text;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, borderColor: variant === 'primary' ? bg : c.border },
        (pressed || disabled) && { opacity: 0.6 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <Text style={{ color: fg, fontFamily: fonts.semibold, fontSize: 16 }}>{title}</Text>
      )}
    </Pressable>
  );
}

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  const c = useColors();
  return (
    <View style={{ gap: 6 }}>
      <Label>{label}</Label>
      <TextInput
        placeholderTextColor={c.muted}
        {...props}
        style={[styles.input, { color: c.text, borderColor: c.border, backgroundColor: c.card }]}
      />
    </View>
  );
}

/** Two to four mutually exclusive options in one control (replaces chips). */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: {
  options: { value: T; label: string; color?: string }[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
}) {
  const c = useColors();
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      style={[styles.segments, { backgroundColor: c.track }]}
    >
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(o.value)}
            style={[
              styles.segment,
              selected && [styles.segmentSelected, { backgroundColor: c.card }],
            ]}
          >
            <Text
              numberOfLines={1}
              style={{
                color: selected ? (o.color ?? c.text) : c.muted,
                fontFamily: selected ? fonts.display : fonts.medium,
                fontSize: 15,
              }}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Section heading above a Group. */
export function GroupLabel({ children }: { children: React.ReactNode }) {
  const c = useColors();
  return <Text style={[styles.groupLabel, { color: c.muted }]}>{children}</Text>;
}

/** Rows in one rounded container, separated by hairlines (the grouped-list pattern). */
export function Group({ children }: { children: React.ReactNode }) {
  const c = useColors();
  const rows = React.Children.toArray(children).filter(Boolean);
  return (
    <View style={[styles.group, { backgroundColor: c.card, borderColor: c.border }]}>
      {rows.map((row, i) => (
        <View key={i} style={i > 0 && { borderTopWidth: 1, borderTopColor: c.border }}>
          {row}
        </View>
      ))}
    </View>
  );
}

/** A tappable label / value row for use inside a Group. */
export function GroupRow({
  label,
  children,
  onPress,
  accessibilityLabel,
  chevron = 'down',
}: {
  label?: string;
  children: React.ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  chevron?: 'down' | 'forward' | 'none';
}) {
  const c = useColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.groupRow, pressed && { opacity: 0.6 }]}
    >
      {label ? <Text style={[styles.groupRowLabel, { color: c.muted }]}>{label}</Text> : null}
      <View style={{ flex: 1 }}>{children}</View>
      {chevron !== 'none' && onPress ? (
        <Ionicons
          name={chevron === 'down' ? 'chevron-down' : 'chevron-forward'}
          size={18}
          color={c.muted}
        />
      ) : null}
    </Pressable>
  );
}

export function ProgressBar({ ratio, color }: { ratio: number; color: string }) {
  const c = useColors();
  return (
    <View style={[styles.track, { backgroundColor: c.track }]}>
      <View
        style={{
          width: `${Math.min(Math.max(ratio, 0), 1) * 100}%`,
          backgroundColor: color,
          height: '100%',
          borderRadius: 4,
        }}
      />
    </View>
  );
}

// Darker gold ring so the add button reads as a kaasu coin, like the one in the logo.
const GOLD_RIM = '#B98E22';

export function Fab({ onPress, label }: { onPress: () => void; label: string }) {
  const c = useColors();
  return (
    <Pressable
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.fab,
        { backgroundColor: c.accent, borderColor: GOLD_RIM },
        pressed && { transform: [{ scale: 0.96 }] },
      ]}
    >
      <Ionicons name="add" size={30} color={c.accentText} />
    </Pressable>
  );
}

/** Logo tile + wordmark, with the Tamil name underneath when `large`. */
export function Brand({ large }: { large?: boolean }) {
  const c = useColors();
  const size = large ? 96 : 28;
  return (
    <View
      style={{
        flexDirection: large ? 'column' : 'row',
        alignItems: 'center',
        gap: large ? 12 : 8,
      }}
      accessibilityRole="header"
      accessibilityLabel="Kaasupathayam"
    >
      <Image source={LOGO} style={{ width: size, height: size }} />
      <View style={{ alignItems: large ? 'center' : 'flex-start' }}>
        <Text style={{ color: c.text, fontFamily: fonts.display, fontSize: large ? 30 : 18 }}>
          Kaasupathayam
        </Text>
        {large && (
          <Text style={{ color: c.muted, fontFamily: fonts.tamil, fontSize: 17 }}>காசுபத்தாயம்</Text>
        )}
      </View>
    </View>
  );
}

export function Loading() {
  return <ActivityIndicator style={{ marginVertical: 24 }} />;
}

export function ErrorText({ error }: { error: unknown }) {
  const c = useColors();
  if (!error) return null;
  return (
    <Text style={{ color: c.expense }}>{error instanceof Error ? error.message : String(error)}</Text>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ paddingVertical: 24, alignItems: 'center' }}>
      <Body muted>{children}</Body>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 16, paddingBottom: 96, alignItems: 'center' },
  column: { width: '100%', maxWidth: 720, gap: 16 },
  card: { borderWidth: 1, borderRadius: 16, padding: 16, gap: 12 },
  title: { fontSize: 26, fontFamily: fonts.display, letterSpacing: -0.3 },
  label: { fontSize: 12, fontFamily: fonts.medium, textTransform: 'uppercase', letterSpacing: 0.8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  button: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 13,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 11, fontSize: 16 },
  segments: { flexDirection: 'row', padding: 4, borderRadius: 12 },
  segment: {
    flex: 1,
    minHeight: 40,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  segmentSelected: {
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  groupLabel: {
    fontSize: 12,
    fontFamily: fonts.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: -8,
    paddingHorizontal: 4,
  },
  group: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 52,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  groupRowLabel: { width: 84, fontSize: 14 },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
});
