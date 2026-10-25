import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fmt } from '../../src/format';
import { Compra, useMali } from '../../src/store';
import { font, useTheme } from '../../src/theme';
import { Card, Empty, T, tab } from '../../src/ui';

const dataPt = (ms: number) =>
  new Date(ms).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' });

function CompraCard({ c, i }: { c: Compra; i: number }) {
  const t = useTheme();
  const { apagarCompra } = useMali();
  const [open, setOpen] = useState(false);
  const rot = useSharedValue(0);
  useEffect(() => { rot.value = withTiming(open ? 1 : 0, { duration: 200 }); }, [open, rot]);
  const chev = useAnimatedStyle(() => ({ transform: [{ rotate: `${rot.value * 180}deg` }] }));
  const tot = c.itens.reduce((a, x) => a + x.preco * x.qtd, 0);
  const n = c.itens.length;

  const apagar = () =>
    Alert.alert('Apagar compra', 'Apagar esta compra do histórico?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Apagar', style: 'destructive', onPress: () => apagarCompra(i) },
    ]);

  return (
    <Card style={{ padding: 0, overflow: 'hidden' }}>
      <Pressable onPress={() => setOpen(o => !o)} style={{ flexDirection: 'row', alignItems: 'center', padding: 18 }}>
        <View style={{ flex: 1 }}>
          <T style={{ fontFamily: font.semi }}>{dataPt(c.d)}</T>
          <T style={[{ color: t.mut, fontSize: 13 }, tab]}>{n} produto{n > 1 ? 's' : ''} · {fmt(tot)}</T>
        </View>
        <Animated.View style={chev}>
          <Feather name="chevron-down" size={20} color={t.mut} />
        </Animated.View>
      </Pressable>
      {open && (
        <Animated.View entering={FadeIn.duration(180)} style={{ paddingHorizontal: 18 }}>
          {c.itens.map(x => (
            <View key={x.id} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, paddingVertical: 10, borderTopWidth: 1, borderTopColor: t.ln }}>
              <T style={{ fontSize: 14, flex: 1 }}>{x.qtd} × {x.nome}</T>
              <T style={[{ fontSize: 14 }, tab]}>{fmt(x.preco * x.qtd)}</T>
            </View>
          ))}
          <T style={[{ color: t.mut, fontSize: 13, paddingTop: 10, paddingBottom: 14, borderTopWidth: 1, borderTopColor: t.ln }, tab]}>
            Saldo inicial: {fmt(c.saldo)} · Sobrou: {fmt(c.saldo - tot)}
          </T>
          <Pressable onPress={apagar} style={({ pressed }) => ({ height: 42, borderRadius: 12, borderWidth: 1, borderColor: t.ln, alignItems: 'center', justifyContent: 'center', marginBottom: 16, backgroundColor: pressed ? t.sf2 : 'transparent' })}>
            <T style={{ color: t.mut, fontFamily: font.medium }}>Apagar do histórico</T>
          </Pressable>
        </Animated.View>
      )}
    </Card>
  );
}

export default function Historico() {
  const t = useTheme();
  const ins = useSafeAreaInsets();
  const { compras } = useMali();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ padding: 16, paddingTop: ins.top + 20, paddingBottom: 32 }}>
      <T style={{ fontSize: 28, fontFamily: font.bold, letterSpacing: -0.7, marginBottom: 20 }}>Histórico</T>
      {compras.length === 0 ? (
        <Card><Empty text="Ainda não tens compras guardadas. Quando finalizares uma compra, ela aparece aqui." /></Card>
      ) : (
        compras.map((c, i) => (
          <Animated.View key={c.d} entering={FadeInDown.duration(250).delay(Math.min(i, 5) * 40)}>
            <CompraCard c={c} i={i} />
          </Animated.View>
        ))
      )}
    </ScrollView>
  );
}
