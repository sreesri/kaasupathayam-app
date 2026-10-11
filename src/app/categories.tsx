import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AddCategorySheet } from '@/components/AddCategorySheet';
import { CategoryIcon } from '@/components/CategoryIcon';
import {
  Body,
  Button,
  ErrorText,
  Group,
  Loading,
  SegmentedControl,
  Screen,
} from '@/components/ui';
import { useCategories, useRemoveCategory } from '@/lib/queries';
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

const styles = StyleSheet.create({
  textButton: { minHeight: 36, justifyContent: 'center', paddingHorizontal: 6 },
});
