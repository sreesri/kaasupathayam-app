import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fonts, useColors } from '@/lib/theme';

/** A bottom sheet: slides up over a scrim; tapping the scrim or Back closes it. Width-capped
 *  and centred on desktop web so it doesn't stretch across the window. */
export function Sheet({
  visible,
  onClose,
  title,
  action,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  /** Optional control at the right of the title row. */
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: c.scrim }]}
          onPress={onClose}
          accessibilityLabel="Close"
        />
        <View
          accessibilityViewIsModal
          style={[styles.sheet, { backgroundColor: c.card, paddingBottom: insets.bottom + 12 }]}
        >
          <View style={styles.grabberRow}>
            <View style={[styles.grabber, { backgroundColor: c.border }]} />
          </View>
          <View style={styles.titleRow}>
            <Text style={{ flex: 1, color: c.text, fontFamily: fonts.display, fontSize: 20 }}>
              {title}
            </Text>
            {action}
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  sheet: {
    width: '100%',
    maxWidth: 560,
    maxHeight: '80%',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: 'hidden',
  },
  grabberRow: { alignItems: 'center', paddingTop: 10, paddingBottom: 4 },
  grabber: { width: 40, height: 5, borderRadius: 3 },
  titleRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 },
});
