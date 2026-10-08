import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CATEGORY_ICON_CHOICES, CategoryIcon } from '@/components/CategoryIcon';
import { Sheet } from '@/components/Sheet';
import {
  Body,
  Button,
  ErrorText,
  Field,
  Group,
  Label,
  Loading,
  SegmentedControl,
  Screen,
} from '@/components/ui';
import { useCategories, useCreateCategory, useRemoveCategory } from '@/lib/queries';
import { fonts, useColors } from '@/lib/theme';
import type { Category, CategoryKind } from '@/lib/types';

/** Add and remove the household's categories. Removing only affects new transactions. */
export default function CategoriesScreen() {
  const [kind, setKind] = useState<CategoryKind>('expense');
  const [adding, setAdding] = useState(false);
  const { data, isLoading } = useCategories();
  const shown = (data ?? []).filter((c) => c.kind === kind);

  return (
    <Screen maxWidth={560}>
      <SegmentedControl
        accessibilityLabel="Category type"
        options={[
          { value: 'expense', label: 'Expense' },
          { value: 'income', label: 'Income' },
        ]}
        value={kind}
        onChange={setKind}
      />
      <Body muted size={14}>
        Removing a category hides it when you add new transactions. Transactions that already use it
        keep it.
      </Body>
      {isLoading ? (
        <Loading />
      ) : (
        <Group>
          {shown.map((c) => (
            <CategoryRow key={c.id} category={c} />
          ))}
        </Group>
      )}
      <Button
        title={kind === 'expense' ? 'Add expense category' : 'Add income category'}
        variant="secondary"
        onPress={() => setAdding(true)}
      />
      <AddCategorySheet kind={kind} visible={adding} onClose={() => setAdding(false)} />
    </Screen>
  );
}

/** Remove asks once more inline (Alert dialogs don't work on web). */
function CategoryRow({ category }: { category: Category }) {
  const c = useColors();
  const remove = useRemoveCategory();
  const [confirming, setConfirming] = useState(false);

  return (
    <View style={{ paddingHorizontal: 14, paddingVertical: 8, gap: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 40 }}>
        <CategoryIcon name={category.icon} />
        <Body bold>{category.name}</Body>
        <View style={{ flex: 1 }} />
        {!confirming && (
          <Pressable
            onPress={() => setConfirming(true)}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${category.name}`}
            hitSlop={8}
            style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="trash-outline" size={20} color={c.muted} />
          </Pressable>
        )}
      </View>
      {confirming && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Body size={14}>Remove {category.name}?</Body>
          <View style={{ flex: 1 }} />
          <Pressable onPress={() => setConfirming(false)} accessibilityRole="button" hitSlop={8} style={styles.textButton}>
            <Body size={14}>Cancel</Body>
          </Pressable>
          <Pressable
            onPress={() => remove.mutate(category.id)}
            accessibilityRole="button"
            hitSlop={8}
            style={styles.textButton}
          >
            <Text style={{ color: c.expense, fontFamily: fonts.semibold, fontSize: 14 }}>Remove</Text>
          </Pressable>
        </View>
      )}
      <ErrorText error={remove.error} />
    </View>
  );
}

function AddCategorySheet({
  kind,
  visible,
  onClose,
}: {
  kind: CategoryKind;
  visible: boolean;
  onClose: () => void;
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
    create.mutate({ name: name.trim(), kind, icon }, { onSuccess: close, onError: setError });
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
  textButton: { minHeight: 36, justifyContent: 'center', paddingHorizontal: 6 },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  iconCell: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
