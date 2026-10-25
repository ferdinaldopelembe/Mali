import { useColorScheme } from 'react-native';

const light = { bg: '#f4f5f3', sf: '#ffffff', sf2: '#eef1ee', tx: '#111a15', mut: '#66736b', ln: '#e3e7e4', ac: '#1b5e3a', acx: '#ffffff', hero: '#1b5e3a', bad: '#b3382c' };
const dark = { bg: '#0e1310', sf: '#171e19', sf2: '#1f2822', tx: '#e8efe9', mut: '#8b9a90', ln: '#263029', ac: '#52bd88', acx: '#06170d', hero: '#1c3b2b', bad: '#f08577' };

export type Theme = typeof light;
export const useTheme = (): Theme => (useColorScheme() === 'dark' ? dark : light);

export const font = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semi: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};
