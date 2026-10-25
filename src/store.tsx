import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { fmt, norm } from './format';

export type Item = { id: string; nome: string; preco: number; qtd: number };
export type Compra = { d: number; saldo: number; itens: Item[] };
export type Hist = Record<string, { n: string; p: number; ps: number[]; t: number }>;
type Estado = { ativo: boolean; saldo: number; itens: Item[]; compras: Compra[]; hist: Hist };
type Api = Estado & {
  pronto: boolean;
  gasto: number;
  resta: number;
  iniciar: (v: number) => void;
  adicionar: (nome: string, preco: number, qtd: number) => string | null;
  remover: (id: string) => void;
  finalizar: () => void;
  descartar: () => void;
  apagarCompra: (i: number) => void;
};

const KEY = 'mali:v2';
const vazio: Estado = { ativo: false, saldo: 0, itens: [], compras: [], hist: {} };
const Ctx = createContext<Api>(null as unknown as Api);
export const useMali = () => useContext(Ctx);

export function MaliProvider({ children }: { children: ReactNode }) {
  const [e, setE] = useState<Estado>(vazio);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then(v => { if (v) setE({ ...vazio, ...JSON.parse(v) }); })
      .catch(() => {})
      .finally(() => setPronto(true));
  }, []);
  useEffect(() => {
    if (pronto) AsyncStorage.setItem(KEY, JSON.stringify(e)).catch(() => {});
  }, [e, pronto]);

  const gasto = e.itens.reduce((a, i) => a + i.preco * i.qtd, 0);
  const resta = e.saldo - gasto;

  const api: Api = {
    ...e, pronto, gasto, resta,
    iniciar: v => setE(s => ({ ...s, ativo: true, saldo: v, itens: [] })),
    adicionar: (nome, preco, qtd) => {
      const falta = preco * qtd - resta;
      if (falta > 0.005) return `Sem saldo suficiente: faltam ${fmt(falta)}.`;
      setE(s => {
        const k = norm(nome);
        const ps = [preco, ...(s.hist[k]?.ps ?? []).filter(x => x !== preco)].slice(0, 3);
        return {
          ...s,
          itens: [...s.itens, { id: `${Date.now()}${Math.random()}`, nome, preco, qtd }],
          hist: { ...s.hist, [k]: { n: nome, p: preco, ps, t: Date.now() } },
        };
      });
      return null;
    },
    remover: id => setE(s => ({ ...s, itens: s.itens.filter(i => i.id !== id) })),
    finalizar: () => setE(s => ({
      ...s,
      compras: [{ d: Date.now(), saldo: s.saldo, itens: s.itens }, ...s.compras],
      ativo: false, saldo: 0, itens: [],
    })),
    descartar: () => setE(s => ({ ...s, ativo: false, saldo: 0, itens: [] })),
    apagarCompra: i => setE(s => ({ ...s, compras: s.compras.filter((_, j) => j !== i) })),
  };
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
