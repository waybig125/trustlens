import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Leaf } from 'lucide-react-native';
import { useApp } from '../context/AppContext';

export default function WelcomeScreen() {
  const router = useRouter();
  const { colors } = useApp();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.centerContent}>
        <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }]}>
          <Leaf size={64} color={colors.primary} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>TrustLens Banking</Text>
        
        <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
          Playful, AI-powered digital onboarding and real-time risk intelligence.
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/applicant-form')}
            activeOpacity={0.8}>
            <Text style={styles.primaryButtonText}>Open An Account (Applicant)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
            onPress={() => router.push('/officer-dashboard')}
            activeOpacity={0.8}>
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
              Officer EDD Dashboard (Admin)
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  centerContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 48,
    paddingHorizontal: 12,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  primaryButton: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#121212',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
