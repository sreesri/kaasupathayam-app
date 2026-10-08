import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { useColors } from '@/lib/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export const FALLBACK_ICON = 'pricetag-outline';

/** Icons offered when creating a category (all Ionicons outline glyphs). */
export const CATEGORY_ICON_CHOICES: IconName[] = [
  'cart-outline', 'basket-outline', 'restaurant-outline', 'cafe-outline', 'pizza-outline',
  'beer-outline', 'home-outline', 'flash-outline', 'water-outline', 'wifi-outline',
  'phone-portrait-outline', 'bus-outline', 'car-outline', 'train-outline', 'bicycle-outline',
  'airplane-outline', 'bag-handle-outline', 'shirt-outline', 'medkit-outline', 'fitness-outline',
  'heart-outline', 'school-outline', 'book-outline', 'laptop-outline', 'film-outline',
  'tv-outline', 'game-controller-outline', 'musical-notes-outline', 'paw-outline', 'gift-outline',
  'people-outline', 'happy-outline', 'sparkles-outline', 'leaf-outline', 'umbrella-outline',
  'shield-checkmark-outline', 'construct-outline', 'hammer-outline', 'receipt-outline',
  'repeat-outline', 'briefcase-outline', 'storefront-outline', 'trending-up-outline',
  'cash-outline', 'card-outline', 'wallet-outline', 'arrow-undo-outline',
  'ellipsis-horizontal-circle-outline', 'pricetag-outline',
];

/** A category's icon on a soft round background. Unknown names fall back to a tag. */
export function CategoryIcon({ name, size = 32 }: { name?: string | null; size?: number }) {
  const c = useColors();
  const glyph = (name && name in Ionicons.glyphMap ? name : FALLBACK_ICON) as IconName;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: c.track,
      }}
    >
      <Ionicons name={glyph} size={Math.round(size * 0.55)} color={c.primary} />
    </View>
  );
}
