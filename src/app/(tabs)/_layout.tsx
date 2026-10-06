import { Ionicons } from '@expo/vector-icons';
import { router, Tabs } from 'expo-router';
import { Pressable } from 'react-native';

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

export default function TabsLayout() {
  const c = useColors();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.muted,
        tabBarStyle: { backgroundColor: c.card, borderTopColor: c.border },
        tabBarLabelStyle: { fontFamily: fonts.medium },
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
            tabBarIcon: ({ color, size }) => <Ionicons name={t.icon} size={size} color={color} />,
          }}
        />
      ))}
    </Tabs>
  );
}
