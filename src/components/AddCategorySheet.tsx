import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { CATEGORY_ICON_CHOICES, CategoryIcon } from './CategoryIcon';
import { Sheet } from './Sheet';
import { Button, ErrorText, Field, Label } from './ui';
import { useCreateCategory } from '@/lib/queries';
import { useColors } from '@/lib/theme';
import type { Category, CategoryKind } from '@/lib/types';

/** Name + icon for a new category. `onCreated` gets the saved category (e.g. to select it). */
export function AddCategorySheet({
  kind,
  visible,
  onClose,
  onCreated,
}: {
  kind: CategoryKind;
  visible: boolean;
  onClose: () => void;
  onCreated?: (category: Category) => void;
}) {
  const c = useColors();
  const create = useCreateCategory();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState<string>('pricetag-outline');
  const [error, setError] = useState<unknown>(null);

  const close = () => {
    setName('');
    setIcon('pricetag-outline');
    setError(null);
    onClose();
  };
  const save = () => {
    if (!name.trim()) return setError('Give the category a name');
    create.mutate(
      { name: name.trim(), kind, icon },
      {
        onSuccess: (category) => {
          onCreated?.(category);
          close();
        },
        onError: setError,
      },
    );
  };

  return (
    <Sheet visible={visible} onClose={close} title={kind === 'expense' ? 'New expense category' : 'New income category'}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, gap: 14 }} keyboardShouldPersistTaps="handled">
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12 }}>
          <CategoryIcon name={icon} size={48} />
          <View style={{ flex: 1 }}>
            <Field label="Name" value={name} onChangeText={setName} placeholder="e.g. Pets" maxLength={50} />
          </View>
        </View>
        <Label>Icon</Label>
        <View style={styles.iconGrid} accessibilityRole="radiogroup" accessibilityLabel="Icon">
          {CATEGORY_ICON_CHOICES.map((g) => {
            const selected = g === icon;
            return (
              <Pressable
                key={g}
                onPress={() => setIcon(g)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={g.replace(/-outline$/, '').replace(/-/g, ' ')}
                style={[
                  styles.iconCell,
                  { backgroundColor: selected ? c.primary : c.track },
                ]}
              >
                <Ionicons name={g} size={22} color={selected ? c.primaryText : c.text} />
              </Pressable>
            );
          })}
        </View>
        <ErrorText error={error} />
        <Button title="Add category" onPress={save} loading={create.isPending} />
      </ScrollView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  iconCell: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
