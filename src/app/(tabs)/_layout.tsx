import { Ionicons } from '@expo/vector-icons';
import { router, Tabs } from 'expo-router';
import { Platform, Pressable, useWindowDimensions, View } from 'react-native';

import { Brand } from '@/components/ui';
import { fonts, useColors } from '@/lib/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const TABS: { name: string; title: string; icon: IconName }[] = [
  { name: 'index', title: 'Home', icon: 'home-outline' },
  { name: 'transactions', title: 'Transactions', icon: 'list-outline' },
  { name: 'accounts', title: 'Accounts', icon: 'card-outline' },
  { name: 'budgets', title: 'Budgets', icon: 'pie-chart-outline' },
  { name: 'household', title: 'Household', icon: 'people-outline' },
];

/** Wide web windows get a left sidebar instead of the phone tab bar. */
const SIDEBAR_FROM = 1024;

export default function TabsLayout() {
  const c = useColors();
  const { width } = useWindowDimensions();
  const sidebar = Platform.OS === 'web' && width >= SIDEBAR_FROM;

  return (
    <Tabs
      screenOptions={{
        tabBarPosition: sidebar ? 'left' : 'bottom',
        tabBarVariant: sidebar ? 'material' : 'uikit',
        tabBarLabelPosition: sidebar ? 'beside-icon' : 'below-icon',
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.muted,
        tabBarStyle: sidebar
          ? { backgroundColor: c.card, borderRightColor: c.border, minWidth: 220 }
          : { backgroundColor: c.card, borderTopColor: c.border, height: 72, paddingTop: 6 },
        tabBarLabelStyle: { fontFamily: fonts.semibold, fontSize: sidebar ? 15 : 12 },
        headerStyle: { backgroundColor: c.card },
        headerTintColor: c.text,
        headerTitleStyle: { fontFamily: fonts.display },
        headerShadowVisible: false,
        headerRight: () => (
          <Pressable
            onPress={() => router.push('/settings')}
            accessibilityRole="button"
            accessibilityLabel="Settings"
            hitSlop={12}
            style={{ paddingHorizontal: 16 }}
          >
            <Ionicons name="settings-outline" size={22} color={c.text} />
          </Pressable>
        ),
      }}
    >
      {TABS.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.title,
            // Home carries the brand; the other tabs keep plain titles.
            ...(t.name === 'index' && { headerTitle: () => <Brand /> }),
            tabBarIcon: ({ color, focused }) => (
              // The active tab's icon sits on a tinted pill (Material 3 style).
              <View
                style={{
                  width: 56,
                  height: 30,
                  borderRadius: 15,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: focused && !sidebar ? c.activePill : 'transparent',
                }}
              >
                <Ionicons name={t.icon} size={22} color={color} />
              </View>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
