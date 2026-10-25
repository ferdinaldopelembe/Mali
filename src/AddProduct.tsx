import { Feather } from '@expo/vector-icons';
import { useMemo, useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { PRC, PROD } from './data';
import { fmt, norm } from './format';
import { Hist, useMali } from './store';
import { font, useTheme } from './theme';
import { Btn, Card, Input, Label, T, tab } from './ui';

type Sug = { n: string; p?: number; s: number };

function busca(q: string, hist: Hist): Sug[] {
  const k = norm(q);
  if (!k) return [];
  const seen = new Set<string>();
  const out: Sug[] = [];
  const put = (n: string, p?: number) => {
    const nk = norm(n);
    if (seen.has(nk)) return;
    const i = nk.indexOf(k);
    if (i < 0 || (i > 0 && !' (/-'.includes(nk[i - 1]))) return;
    seen.add(nk);
    out.push({ n, p, s: i === 0 ? 0 : 1 });
  };
  Object.values(hist).sort((a, b) => b.t - a.t).forEach(x => put(x.n, x.p));
  PROD.forEach(n => put(n));
  return out.sort((a, b) => a.s - b.s).slice(0, 5);
}

function precos(nome: string, hist: Hist) {
  const k = norm(nome);
  if (!k) return [];
  let bk = '';
  Object.keys(PRC).forEach(b => { if ((k === b || k.startsWith(b + ' ')) && b.length > bk.length) bk = b; });
  const seen = new Set<number>();
  const out: { p: number; me: boolean }[] = [];
  (hist[k]?.ps ?? []).forEach(p => { if (!seen.has(p)) { seen.add(p); out.push({ p, me: true }); } });
  (bk ? PRC[bk] : []).forEach(p => { if (!seen.has(p)) { seen.add(p); out.push({ p, me: false }); } });
  return out.slice(0, 5);
}

export function AddProduct() {
  const t = useTheme();
  const { hist, adicionar } = useMali();
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [qtd, setQtd] = useState(1);
  const [aberto, setAberto] = useState(false);
  const [erro, setErro] = useState('');
  const nomeRef = useRef<TextInput>(null);

  const sugs = useMemo(() => (aberto ? busca(nome, hist) : []), [aberto, nome, hist]);
  const chips = useMemo(() => precos(nome, hist), [nome, hist]);

  const sx = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: sx.value }] }));
  const shake = () => {
    sx.value = withSequence(withTiming(-6, { duration: 50 }), withRepeat(withTiming(6, { duration: 100 }), 3, true), withTiming(0, { duration: 50 }));
  };

  const escolher = (s: Sug) => {
    setNome(s.n);
    if (s.p != null) setPreco(String(s.p));
    setAberto(false);
    setErro('');
  };

  const add = () => {
    const n = nome.trim();
    const p = parseFloat(preco.replace(',', '.'));
    let e = '';
    if (!n) e = 'Escreve o nome do produto.';
    else if (isNaN(p) || p < 0) e = 'Indica o preço.';
    else e = adicionar(n, p, qtd) ?? '';
    setErro(e);
    if (e) { shake(); return; }
    setNome(''); setPreco(''); setQtd(1); setAberto(false);
    nomeRef.current?.focus();
  };

  return (
    <Card>
      <T style={{ fontFamily: font.semi, fontSize: 15, marginBottom: 16 }}>Adicionar produto</T>
      <Label>Produto</Label>
      <Input
        ref={nomeRef}
        value={nome}
        onChangeText={v => { setNome(v); setAberto(true); }}
        placeholder="Ex.: Arroz"
        autoCapitalize="sentences"
        autoCorrect={false}
        returnKeyType="next"
        onSubmitEditing={() => setAberto(false)}
      />
      {sugs.length > 0 && (
        <Animated.View entering={FadeIn.duration(150)} style={{ marginTop: 6, padding: 6, borderRadius: 14, borderWidth: 1, borderColor: t.ln, backgroundColor: t.sf }}>
          {sugs.map(s => (
            <Pressable key={s.n} onPress={() => escolher(s)} style={({ pressed }) => ({ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: 12, borderRadius: 10, backgroundColor: pressed ? t.sf2 : 'transparent' })}>
              <T style={{ flex: 1 }}>{s.n}</T>
              {s.p != null && <T style={[{ color: t.mut, fontSize: 12 }, tab]}>último: {fmt(s.p)}</T>}
            </Pressable>
          ))}
        </Animated.View>
      )}

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 14 }}>
        <View style={{ flex: 1 }}>
          <Label>Preço (MT)</Label>
          <Input value={preco} onChangeText={setPreco} keyboardType="decimal-pad" placeholder="0,00" />
        </View>
        <View style={{ width: 140 }}>
          <Label>Quantidade</Label>
          <View style={{ height: 50, flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: t.ln, backgroundColor: t.sf2 }}>
            <Pressable onPress={() => setQtd(q => Math.max(1, q - 1))} hitSlop={6} style={({ pressed }) => ({ width: 42, height: '100%', alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: pressed ? t.ln : 'transparent' })}>
              <Feather name="minus" size={20} color={t.tx} />
            </Pressable>
            <TextInput
              value={String(qtd)}
              onChangeText={v => setQtd(Math.max(1, parseInt(v.replace(/\D/g, ''), 10) || 1))}
              keyboardType="number-pad"
              style={[{ flex: 1, textAlign: 'center', fontFamily: font.semi, fontSize: 16, color: t.tx, padding: 0 }, tab]}
            />
            <Pressable onPress={() => setQtd(q => q + 1)} hitSlop={6} style={({ pressed }) => ({ width: 42, height: '100%', alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: pressed ? t.ln : 'transparent' })}>
              <Feather name="plus" size={20} color={t.tx} />
            </Pressable>
          </View>
        </View>
      </View>

      {chips.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
          {chips.map(c => (
            <Pressable key={c.p} onPress={() => setPreco(String(c.p))} style={{ height: 36, paddingHorizontal: 14, borderRadius: 99, borderWidth: 1, alignItems: 'center', justifyContent: 'center', borderColor: c.me ? t.ac + '66' : t.ln, backgroundColor: c.me ? t.ac + '1f' : t.sf }}>
              <T style={[{ fontFamily: font.semi, fontSize: 14, color: c.me ? t.ac : t.tx }, tab]}>{c.p}</T>
            </Pressable>
          ))}
        </View>
      )}

      <Btn label="Adicionar ao carrinho" icon="plus" onPress={add} style={{ marginTop: 16 }} />
      {!!erro && (
        <Animated.View style={[{ marginTop: 12, padding: 10, borderRadius: 10, backgroundColor: t.bad + '1a' }, shakeStyle]}>
          <T style={{ color: t.bad, fontSize: 14 }}>{erro}</T>
        </Animated.View>
      )}
    </Card>
  );
}
