import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AppProvider, useApp } from '../context/AppContext';
import { Header } from '../components/Header';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Sora_700Bold } from '@expo-google-fonts/sora';
import { HankenGrotesk_400Regular, HankenGrotesk_700Bold } from '@expo-google-fonts/hanken-grotesk';

function NavigationGuard() {
  const { user } = useApp();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === 'login';

    if (!user && !inAuthGroup) {
      // If user is not logged in and trying to access protected routes, redirect to login
      router.replace('/login');
    } else if (user && inAuthGroup) {
      // If user is logged in and on login screen, redirect to home
      router.replace('/');
    }
  }, [user, segments]);

  return null;
}

function RootLayoutNav() {
  const { colors, isDarkMode } = useApp();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <NavigationGuard />
      <Header />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </SafeAreaView>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Sora_700Bold,
    HankenGrotesk_400Regular,
    HankenGrotesk_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AppProvider>
        <RootLayoutNav />
      </AppProvider>
    </SafeAreaProvider>
  );
}
