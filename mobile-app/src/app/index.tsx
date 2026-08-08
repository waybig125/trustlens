import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight, UserCheck, ShieldAlert, TrendingUp, Clock } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/GlassCard';
import { AnimatedTrustPlant } from '../components/AnimatedTrustPlant';
import { FadeInView, PulseView } from '../components/AnimatedContainers';

export default function HomeScreen() {
  const router = useRouter();
  const { colors, user, isOfficerMode } = useApp();

  // Redirect admin to their dashboard immediately
  useEffect(() => {
    if (user?.role === 'admin') {
      router.replace('/officer-dashboard');
    }
  }, [user]);

  // If redirecting admin, render nothing
  if (user?.role === 'admin') return null;

  const greeting = user?.name ? `Welcome, ${user.name.split(' ')[0]}!` : 'Welcome to TrustLens';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <FadeInView delay={100} fromY={30} style={styles.heroSection}>
        <PulseView style={[styles.plantContainer, { backgroundColor: `${colors.primary}12`, borderColor: colors.border }]}>
          <AnimatedTrustPlant stage={0} size={150} />
        </PulseView>

        <Text style={[styles.greeting, { color: colors.bodyText, fontFamily: colors.bodyFont }]}>
          {greeting}
        </Text>
        <Text style={[styles.title, { color: colors.text, fontFamily: colors.headlineFont }]}>
          Your Trust{'\n'}Journey Starts Here
        </Text>
        <Text style={[styles.subtitle, { color: colors.bodyText, fontFamily: colors.bodyFont }]}>
          Complete your KYC verification to unlock full banking capabilities and watch your Trust Plant bloom.
        </Text>
      </FadeInView>

      {/* Feature Cards */}
      <View style={styles.cardGrid}>
        <FadeInView delay={250} fromY={20} style={{ flex: 1 }}>
          <GlassCard style={styles.featureCard}>
            <View style={[styles.featureIconBg, { backgroundColor: colors.primarySurface }]}>
              <UserCheck size={22} color={colors.primaryDark} strokeWidth={2.2} />
            </View>
            <Text style={[styles.featureTitle, { color: colors.text, fontFamily: colors.headlineFont }]}>
              Smart KYC
            </Text>
            <Text style={[styles.featureSub, { color: colors.bodyText, fontFamily: colors.bodyFont }]}>
              AI-powered identity verification
            </Text>
          </GlassCard>
        </FadeInView>

        <FadeInView delay={350} fromY={20} style={{ flex: 1 }}>
          <GlassCard style={styles.featureCard}>
            <View style={[styles.featureIconBg, { backgroundColor: colors.riskHighSurface }]}>
              <ShieldAlert size={22} color={colors.riskHigh} strokeWidth={2.2} />
            </View>
            <Text style={[styles.featureTitle, { color: colors.text, fontFamily: colors.headlineFont }]}>
              Risk Shield
            </Text>
            <Text style={[styles.featureSub, { color: colors.bodyText, fontFamily: colors.bodyFont }]}>
              Real-time compliance checks
            </Text>
          </GlassCard>
        </FadeInView>
      </View>

      {/* Stats Row */}
      <FadeInView delay={450} fromY={15} style={styles.statsRow}>
        <View style={[styles.statPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TrendingUp size={14} color={colors.riskLow} />
          <Text style={[styles.statPillText, { color: colors.bodyText, fontFamily: colors.bodyFont }]}>
            <Text style={[styles.statPillNum, { color: colors.riskLow, fontFamily: colors.bodyFontBold }]}>98.4%</Text> AI Accuracy
          </Text>
        </View>
        <View style={[styles.statPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Clock size={14} color={colors.primary} />
          <Text style={[styles.statPillText, { color: colors.bodyText, fontFamily: colors.bodyFont }]}>
            <Text style={[styles.statPillNum, { color: colors.primary, fontFamily: colors.bodyFontBold }]}>&lt;2 min</Text> Avg. Review
          </Text>
        </View>
      </FadeInView>

      {/* CTA Buttons */}
      <FadeInView delay={550} fromY={10} style={styles.buttonStack}>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/applicant-form')}
          activeOpacity={0.85}
        >
          <Text style={[styles.primaryButtonText, { fontFamily: colors.bodyFontBold }]}>
            Begin KYC Verification
          </Text>
          <ArrowRight size={18} color="#121212" strokeWidth={2.5} />
        </TouchableOpacity>

        {isOfficerMode && (
          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
            onPress={() => router.push('/officer-dashboard')}
            activeOpacity={0.85}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.text, fontFamily: colors.bodyFontBold }]}>
              Open Compliance Dashboard
            </Text>
          </TouchableOpacity>
        )}
      </FadeInView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 36,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  plantContainer: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 34,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.8,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  cardGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  featureCard: {
    gap: 10,
    padding: 18,
  },
  featureIconBg: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  featureSub: {
    fontSize: 11,
    lineHeight: 15,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  statPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  statPillText: {
    fontSize: 12,
    lineHeight: 16,
  },
  statPillNum: {
    fontSize: 13,
  },
  buttonStack: {
    gap: 12,
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
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 15,
  },
});
