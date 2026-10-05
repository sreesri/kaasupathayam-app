import { Ionicons } from '@expo/vector-icons';
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
export function Screen({ children, footer }: { children: React.ReactNode; footer?: React.ReactNode }) {
  const c = useColors();
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
        <View style={styles.column}>{children}</View>
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

/** Single-select chip group; wraps onto multiple lines. */
export function Chips<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label?: string;
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (value: T) => void;
}) {
  const c = useColors();
  return (
    <View style={{ gap: 6 }}>
      {label ? <Label>{label}</Label> : null}
      <View style={styles.chips}>
        {options.map((o) => {
          const selected = o.value === value;
          return (
            <Pressable
              key={o.value}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => onChange(o.value)}
              style={[
                styles.chip,
                {
                  borderColor: selected ? c.primary : c.border,
                  backgroundColor: selected ? c.primary : c.card,
                },
              ]}
            >
              <Text
                style={{
                  color: selected ? c.primaryText : c.text,
                  fontSize: 14,
                  fontFamily: selected ? fonts.semibold : undefined,
                }}
              >
                {o.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function MonthPicker({ label, onPrev, onNext }: { label: string; onPrev: () => void; onNext: () => void }) {
  const c = useColors();
  return (
    <Row style={{ justifyContent: 'space-between' }}>
      <Pressable accessibilityLabel="Previous month" onPress={onPrev} hitSlop={12}>
        <Ionicons name="chevron-back" size={22} color={c.text} />
      </Pressable>
      <Text style={{ color: c.text, fontFamily: fonts.display, fontSize: 18 }}>{label}</Text>
      <Pressable accessibilityLabel="Next month" onPress={onNext} hitSlop={12}>
        <Ionicons name="chevron-forward" size={22} color={c.text} />
      </Pressable>
    </Row>
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
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
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
