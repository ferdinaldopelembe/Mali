import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { fmt } from './format';
import { font, useTheme } from './theme';
import { T, tab } from './ui';

function useCountUp(to: number, ms = 380) {
  const [v, setV] = useState(to);
  const from = useRef(to);
  useEffect(() => {
    const a = from.current, t0 = Date.now();
    let raf = 0;
    const step = () => {
      const k = Math.min(1, (Date.now() - t0) / ms);
      const cur = a + (to - a) * (1 - Math.pow(1 - k, 3));
      from.current = cur;
      setV(cur);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to, ms]);
  return v;
}

function Stat({ label, value, right }: { label: string; value: string; right?: boolean }) {
  return (
    <View style={{ alignItems: right ? 'flex-end' : 'flex-start' }}>
      <T style={{ color: 'rgba(255,255,255,.7)', fontSize: 12, marginBottom: 2 }}>{label}</T>
      <T style={[{ color: '#fff', fontFamily: font.semi, fontSize: 14 }, tab]}>{value}</T>
    </View>
  );
}

export function Hero({ saldo, resta, gasto }: { saldo: number; resta: number; gasto: number }) {
  const t = useTheme();
  const v = useCountUp(resta);
  const pct = saldo > 0 ? Math.min(100, (gasto / saldo) * 100) : 0;
  const w = useSharedValue(0);
  useEffect(() => { w.value = withTiming(pct, { duration: 450, easing: Easing.out(Easing.cubic) }); }, [pct, w]);
  const bar = useAnimatedStyle(() => ({ width: `${w.value}%` }));

  const zero = resta <= 0.005;
  const low = !zero && resta <= saldo * 0.2;
  const num = zero ? '#ffc2bb' : low ? '#f6d9a0' : '#fff';
  const fill = zero ? '#ff9d92' : low ? '#f1c36d' : '#fff';

  return (
    <View style={{ backgroundColor: t.hero, borderRadius: 20, padding: 20, paddingTop: 22, marginBottom: 14 }}>
      <T style={{ color: 'rgba(255,255,255,.75)', fontSize: 13 }}>Saldo disponível</T>
      <T numberOfLines={1} adjustsFontSizeToFit style={[{ color: num, fontSize: 44, fontFamily: font.semi, letterSpacing: -1.3, marginTop: 6, marginBottom: 16 }, tab]}>
        {fmt(v)}
      </T>
      <View style={{ height: 6, borderRadius: 99, backgroundColor: 'rgba(255,255,255,.2)', overflow: 'hidden' }}>
        <Animated.View style={[{ height: 6, borderRadius: 99, backgroundColor: fill }, bar]} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
        <Stat label="Saldo inicial" value={fmt(saldo)} />
        <Stat label="Já gasto" value={fmt(gasto)} right />
      </View>
    </View>
  );
}
