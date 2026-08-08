import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Shield, ArrowRight, UserCheck, ShieldAlert } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/GlassCard';

export default function WelcomeScreen() {
  const router = useRouter();
  const { colors } = useApp();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.centerContent}>
        {/* Glowing Brand Badge */}
        <View style={[styles.iconGlowRing, { backgroundColor: `${colors.primary}18`, borderColor: `${colors.primary}35` }]}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
            <Shield size={48} color="#0D0C0A" strokeWidth={2.2} />
          </View>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>TrustLens Banking</Text>

        <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
          Playful, AI-powered digital onboarding and real-time risk intelligence.
        </Text>

        {/* Feature Cards Grid */}
        <View style={styles.cardGrid}>
          <GlassCard style={styles.featureCard}>
            <UserCheck size={24} color={colors.primary} />
            <View style={styles.featureTextWrapper}>
              <Text style={[styles.featureTitle, { color: colors.text }]}>Smart Onboarding</Text>
              <Text style={[styles.featureSub, { color: colors.secondaryText }]}>Instant AI verification</Text>
            </View>
          </GlassCard>

          <GlassCard style={styles.featureCard}>
            <ShieldAlert size={24} color={colors.warningOrange} />
            <View style={styles.featureTextWrapper}>
              <Text style={[styles.featureTitle, { color: colors.text }]}>EDD Intelligence</Text>
              <Text style={[styles.featureSub, { color: colors.secondaryText }]}>Officer risk reviews</Text>
            </View>
          </GlassCard>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/applicant-form')}
            activeOpacity={0.85}>
            <Text style={styles.primaryButtonText}>Open An Account (Applicant)</Text>
            <ArrowRight size={18} color="#0D0C0A" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
            onPress={() => router.push('/officer-dashboard')}
            activeOpacity={0.85}>
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
  iconGlowRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 36,
    paddingHorizontal: 12,
  },
  cardGrid: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 36,
  },
  featureCard: {
    flex: 1,
    flexDirection: 'column',
    gap: 8,
    padding: 16,
  },
  featureTextWrapper: {
    marginTop: 4,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  featureSub: {
    fontSize: 11,
    marginTop: 2,
  },
  buttonContainer: {
    width: '100%',
    gap: 14,
  },
  primaryButton: {
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#0D0C0A',
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
