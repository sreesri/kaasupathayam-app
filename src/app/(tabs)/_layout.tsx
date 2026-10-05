import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { useColors } from '@/lib/theme';

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
        headerStyle: { backgroundColor: c.card },
        headerTintColor: c.text,
      }}
    >
      {TABS.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.title,
            tabBarIcon: ({ color, size }) => <Ionicons name={t.icon} size={size} color={color} />,
          }}
        />
      ))}
    </Tabs>
  );
}
