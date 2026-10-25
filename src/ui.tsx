import { Feather } from '@expo/vector-icons';
import { ComponentProps, ReactNode, useState } from 'react';
import { Pressable, StyleProp, Text, TextInput, TextStyle, View, ViewStyle } from 'react-native';
import { font, useTheme } from './theme';

type Icon = ComponentProps<typeof Feather>['name'];
export const tab: TextStyle = { fontVariant: ['tabular-nums'] };

export function T(props: ComponentProps<typeof Text>) {
  const t = useTheme();
  return <Text {...props} style={[{ fontFamily: font.regular, color: t.tx, fontSize: 16 }, props.style]} />;
}

export function Label({ children }: { children: ReactNode }) {
  const t = useTheme();
  return <T style={{ fontSize: 13, fontFamily: font.medium, color: t.mut, marginBottom: 8 }}>{children}</T>;
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  return (
    <View style={[{ backgroundColor: t.sf, borderColor: t.ln, borderWidth: 1, borderRadius: 16, padding: 18, marginBottom: 14 }, style]}>
      {children}
    </View>
  );
}

export function Input(props: ComponentProps<typeof TextInput>) {
  const t = useTheme();
  const [f, setF] = useState(false);
  return (
    <TextInput
      placeholderTextColor={t.mut}
      {...props}
      onFocus={e => { setF(true); props.onFocus?.(e); }}
      onBlur={e => { setF(false); props.onBlur?.(e); }}
      style={[{ height: 50, borderRadius: 12, borderWidth: 1, borderColor: f ? t.ac : t.ln, backgroundColor: f ? t.sf : t.sf2, paddingHorizontal: 14, fontSize: 16, fontFamily: font.regular, color: t.tx }, props.style]}
    />
  );
}

export function Btn({ label, icon, onPress, variant = 'primary', style }: {
  label: string; icon?: Icon; onPress: () => void; variant?: 'primary' | 'text'; style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  if (variant === 'text') {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [{ height: 46, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 }, style]}>
        <T style={{ color: t.mut, fontFamily: font.medium }}>{label}</T>
      </Pressable>
    );
  }
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ height: 52, borderRadius: 14, backgroundColor: t.ac, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, transform: [{ scale: pressed ? 0.98 : 1 }] }, style]}>
      {icon && <Feather name={icon} size={20} color={t.acx} />}
      <T style={{ color: t.acx, fontFamily: font.semi }}>{label}</T>
    </Pressable>
  );
}

export function Empty({ text }: { text: string }) {
  const t = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: 20, gap: 12 }}>
      <Feather name="shopping-bag" size={40} color={t.mut} style={{ opacity: 0.5 }} />
      <T style={{ color: t.mut, fontSize: 14, textAlign: 'center' }}>{text}</T>
    </View>
  );
}
