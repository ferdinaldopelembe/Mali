import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { font, useTheme } from '../../src/theme';

export default function TabsLayout() {
  const t = useTheme();
  const ins = useSafeAreaInsets();
  const extra = Math.max(ins.bottom, 12) + 8;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.ac,
        tabBarInactiveTintColor: t.mut,
        tabBarStyle: {
          backgroundColor: t.bg,
          borderTopColor: t.ln,
          height: 56 + extra,
          paddingTop: 8,
          paddingBottom: extra,
        },
        tabBarLabelStyle: { fontFamily: font.medium, fontSize: 12 },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Compras', tabBarIcon: ({ color, size }) => <Feather name="shopping-bag" size={size} color={color} /> }} />
      <Tabs.Screen name="historico" options={{ title: 'Histórico', tabBarIcon: ({ color, size }) => <Feather name="clock" size={size} color={color} /> }} />
    </Tabs>
  );
}