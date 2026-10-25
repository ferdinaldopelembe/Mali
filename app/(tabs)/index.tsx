import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import Animated, { FadeInDown, FadeOutLeft, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AddProduct } from '../../src/AddProduct';
import { fmt } from '../../src/format';
import { Hero } from '../../src/Hero';
import { useMali } from '../../src/store';
import { font, useTheme } from '../../src/theme';
import { Btn, Card, Empty, Input, Label, T, tab } from '../../src/ui';

function Header() {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 }}>
      <Image source={require('../../assets/images/logo.png')} style={{ width: 38, height: 38 }} />
      <View>
        <T style={{ fontFamily: font.bold, fontSize: 19, letterSpacing: -0.2 }}>Mali</T>
        <T style={{ color: t.mut, fontSize: 13 }}>Controlo de compras</T>
      </View>
    </View>
  );
}

function Inicio() {
  const t = useTheme();
  const { iniciar } = useMali();
  const [v, setV] = useState('');
  const go = () => {
    const n = parseFloat(v.replace(',', '.'));
    if (n > 0) iniciar(n);
    else Alert.alert('Saldo em falta', 'Indica quanto tens para gastar.');
  };
  return (
    <Animated.View entering={FadeInDown.duration(280)}>
      <T style={{ fontSize: 28, fontFamily: font.bold, letterSpacing: -0.7, lineHeight: 33, marginBottom: 8 }}>Quanto vais gastar hoje?</T>
      <T style={{ color: t.mut, fontSize: 15, marginBottom: 22 }}>Define o teu saldo. A cada produto, o Mali desconta e diz-te se ainda podes comprar.</T>
      <Card>
        <Label>Saldo disponível</Label>
        <View>
          <Input value={v} onChangeText={setV} keyboardType="decimal-pad" placeholder="0,00" style={[{ height: 64, fontSize: 28, fontFamily: font.semi, paddingRight: 58, letterSpacing: -0.5 }, tab]} />
          <T pointerEvents="none" style={{ position: 'absolute', right: 16, top: 20, color: t.mut, fontFamily: font.semi }}>MT</T>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          {[500, 1000, 2000, 5000].map(n => (
            <Pressable key={n} onPress={() => setV(String(n))} style={({ pressed }) => ({ flex: 1, height: 40, borderRadius: 10, borderWidth: 1, borderColor: t.ln, backgroundColor: pressed ? t.sf2 : t.sf, alignItems: 'center', justifyContent: 'center' })}>
              <T style={[{ fontFamily: font.semi, fontSize: 14 }, tab]}>{n}</T>
            </Pressable>
          ))}
        </View>
        <Btn label="Começar compras" icon="arrow-right" onPress={go} style={{ marginTop: 16 }} />
      </Card>
    </Animated.View>
  );
}

function Loja() {
  const t = useTheme();
  const m = useMali();
  const router = useRouter();

  const finalizar = () => {
    if (!m.itens.length) {
      Alert.alert('Carrinho vazio', 'Adiciona pelo menos um produto antes de finalizar.');
      return;
    }
    m.finalizar();
    router.navigate('/historico');
  };
  const descartar = () => {
    if (!m.itens.length) return m.descartar();
    Alert.alert('Descartar compra', 'Descartar esta compra sem guardar no histórico?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Descartar', style: 'destructive', onPress: m.descartar },
    ]);
  };

  return (
    <Animated.View entering={FadeInDown.duration(280)}>
      <Hero saldo={m.saldo} resta={m.resta} gasto={m.gasto} />
      <AddProduct />
      <Card>
        <T style={{ fontFamily: font.semi, fontSize: 15, marginBottom: 16 }}>Carrinho</T>
        {m.itens.length === 0 ? (
          <Empty text="Carrinho vazio. Adiciona o primeiro produto." />
        ) : (
          m.itens.map((it, i) => (
            <Animated.View
              key={it.id}
              entering={FadeInDown.duration(250)}
              exiting={FadeOutLeft.duration(200)}
              layout={LinearTransition}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: i ? 14 : 0, paddingBottom: 14, borderTopWidth: i ? 1 : 0, borderTopColor: t.ln, marginTop: i ? 14 : 0 }}>
              <View style={{ flex: 1 }}>
                <T numberOfLines={1} style={{ fontFamily: font.semi }}>{it.nome}</T>
                <T style={[{ color: t.mut, fontSize: 13 }, tab]}>{it.qtd} × {fmt(it.preco)}</T>
              </View>
              <T style={[{ fontFamily: font.semi }, tab]}>{fmt(it.preco * it.qtd)}</T>
              <Pressable onPress={() => m.remover(it.id)} hitSlop={8} accessibilityLabel={`Remover ${it.nome}`} style={({ pressed }) => ({ width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: pressed ? t.sf2 : 'transparent' })}>
                <Feather name="trash-2" size={19} color={t.mut} />
              </Pressable>
            </Animated.View>
          ))
        )}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 16, borderTopWidth: 1, borderTopColor: t.ln }}>
          <T style={{ fontFamily: font.semi }}>Total gasto</T>
          <T style={[{ fontFamily: font.semi, fontSize: 22, letterSpacing: -0.4 }, tab]}>{fmt(m.gasto)}</T>
        </View>
      </Card>
      <Btn label="Finalizar compra" icon="check" onPress={finalizar} />
      <Btn label="Descartar compra" variant="text" onPress={descartar} style={{ marginTop: 4 }} />
    </Animated.View>
  );
}

export default function Compras() {
  const t = useTheme();
  const ins = useSafeAreaInsets();
  const { ativo } = useMali();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.bg }}
      contentContainerStyle={{ padding: 16, paddingTop: ins.top + 20, paddingBottom: 32 }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      automaticallyAdjustKeyboardInsets>
      <Header />
      {ativo ? <Loja /> : <Inicio />}
    </ScrollView>
  );
}
