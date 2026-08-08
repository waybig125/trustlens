import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AppProvider, useApp } from '../context/AppContext';
import { Header } from '../components/Header';
import { StatusBar } from 'expo-status-bar';

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
  return (
    <SafeAreaProvider>
      <AppProvider>
        <RootLayoutNav />
      </AppProvider>
    </SafeAreaProvider>
  );
}
