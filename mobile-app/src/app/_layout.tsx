import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AppProvider, useApp } from '../context/AppContext';
import { Header } from '../components/Header';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Sora_700Bold } from '@expo-google-fonts/sora';
import { HankenGrotesk_400Regular, HankenGrotesk_700Bold } from '@expo-google-fonts/hanken-grotesk';

function RootLayoutNav() {
  const { colors, isDarkMode } = useApp();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
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
