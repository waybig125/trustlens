import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Sprout, Shield, Coins, ArrowRight, UserCheck, ShieldAlert } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/GlassCard';

export default function WelcomeScreen() {
  const router = useRouter();
  const { colors } = useApp();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.centerContent}>
        {/* Hero Vector Graphic Cluster */}
        <View style={[styles.heroCluster, { backgroundColor: `${colors.primary}15`, borderColor: colors.border }]}>
          <View style={[styles.iconBadge, { backgroundColor: colors.primary }]}>
            <Sprout size={32} color="#121212" />
          </View>
          <View style={[styles.iconBadge, { backgroundColor: colors.primary }]}>
            <Shield size={36} color="#121212" />
          </View>
          <View style={[styles.iconBadge, { backgroundColor: colors.primary }]}>
            <Coins size={32} color="#121212" />
          </View>
        </View>

        <Text style={[styles.title, { color: colors.text, fontFamily: colors.headlineFont }]}>
          TrustLens Banking
        </Text>

        <Text style={[styles.subtitle, { color: colors.bodyText, fontFamily: colors.bodyFont }]}>
          Playful, AI-powered digital onboarding and real-time risk intelligence.
        </Text>

        {/* Feature Cards Grid */}
        <View style={styles.cardGrid}>
          <GlassCard style={styles.featureCard}>
            <UserCheck size={26} color={colors.primary} />
            <View style={styles.featureTextWrapper}>
              <Text style={[styles.featureTitle, { color: colors.text, fontFamily: colors.headlineFont }]}>
                Smart Onboarding
              </Text>
              <Text style={[styles.featureSub, { color: colors.bodyText, fontFamily: colors.bodyFont }]}>
                Instant AI verification
              </Text>
            </View>
          </GlassCard>

          <GlassCard style={styles.featureCard}>
            <ShieldAlert size={26} color={colors.softCoral} />
            <View style={styles.featureTextWrapper}>
              <Text style={[styles.featureTitle, { color: colors.text, fontFamily: colors.headlineFont }]}>
                EDD Intelligence
              </Text>
              <Text style={[styles.featureSub, { color: colors.bodyText, fontFamily: colors.bodyFont }]}>
                Officer risk reviews
              </Text>
            </View>
          </GlassCard>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/applicant-form')}
            activeOpacity={0.85}>
            <Text style={[styles.primaryButtonText, { fontFamily: colors.bodyFontBold }]}>
              Open An Account (Applicant)
            </Text>
            <ArrowRight size={18} color="#121212" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
            onPress={() => router.push('/officer-dashboard')}
            activeOpacity={0.85}>
            <Text style={[styles.secondaryButtonText, { color: colors.text, fontFamily: colors.bodyFontBold }]}>
              Officer EDD Dashboard (Compliance Admin)
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
  heroCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    borderWidth: 1,
    gap: 16,
    marginBottom: 24,
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 12,
  },
  cardGrid: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  featureCard: {
    flex: 1,
    gap: 8,
    padding: 16,
  },
  featureTextWrapper: {
    marginTop: 4,
  },
  featureTitle: {
    fontSize: 13,
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
    color: '#121212',
    fontSize: 16,
  },
  secondaryButton: {
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 15,
  },
});
