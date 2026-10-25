import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MaliProvider, useMali } from '../src/store';
import { useTheme } from '../src/theme';

SplashScreen.preventAutoHideAsync();

function Gate() {
  const { pronto } = useMali();
  const t = useTheme();
  const [fontes] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  useEffect(() => { if (fontes && pronto) SplashScreen.hideAsync(); }, [fontes, pronto]);
  if (!fontes || !pronto) return null;
  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.bg } }} />
    </>
  );
}

export default function Root() {
  return (
    <SafeAreaProvider>
      <MaliProvider>
        <Gate />
      </MaliProvider>
    </SafeAreaProvider>
  );
}
