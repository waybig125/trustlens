import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { AnimatedTrustPlant } from '../components/AnimatedTrustPlant';
import { FadeInView } from '../components/AnimatedContainers';

export default function ApplicantStatusScreen() {
  const router = useRouter();
  const { colors, isDarkMode, applicantStatus, currentApplicantForm } = useApp();

  // Map application state to plant growth
  const getGrowth = (): number => {
    if (!applicantStatus) return 0.7;
    const lower = applicantStatus.toLowerCase();
    if (lower.includes('approved')) return 1.0;
    if (lower.includes('rejected')) return 0.3;
    if (lower.includes('escalated')) return 0.5;
    return 0.7; // "Under AI Review" = sapling, not yet bloomed
  };

  const growth = getGrowth();
  const isApproved = applicantStatus?.toLowerCase().includes('approved');
  const isRejected = applicantStatus?.toLowerCase().includes('rejected');

  const statusMessage = isApproved
    ? 'Your Trust Plant is in full bloom! Account approved.'
    : isRejected
    ? 'Your application needs further review.'
    : 'Your Trust Plant is growing while our AI verifies your details.';

  const hasFormData = Object.keys(currentApplicantForm).length > 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <FadeInView delay={100} style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text
          style={[styles.title, { color: colors.text, fontFamily: colors.headlineFont }]}
          accessibilityRole="header"
        >
          Application Status
        </Text>
        <View style={{ width: 44 }} />
      </FadeInView>

      {/* Plant Card */}
      <FadeInView delay={200}>
        <View style={[styles.statusCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.plantWrapper}>
            <AnimatedTrustPlant growth={growth} size={160} dark={isDarkMode} focused={true} />
          </View>
          <Text style={[styles.statusTitle, { color: colors.text, fontFamily: colors.headlineFont }]}>
            {applicantStatus || 'Application Under AI Review'}
          </Text>
          <Text style={[styles.statusSubtitle, { color: colors.bodyText, fontFamily: colors.bodyFont }]}>
            {statusMessage}
          </Text>
          <View style={[styles.growthPill, { backgroundColor: colors.primarySurface }]}>
            <Text style={[styles.growthPillText, { color: colors.primaryDark, fontFamily: colors.bodyFontBold }]}>
              Trust Growth: {Math.round(growth * 100)}%
            </Text>
          </View>
        </View>
      </FadeInView>

      {/* Submitted Details */}
      {hasFormData && (
        <FadeInView delay={350}>
          <Text style={[styles.sectionHeader, { color: colors.bodyText, fontFamily: colors.bodyFontBold }]}>
            Submitted KYC Details
          </Text>
          <View style={[styles.detailsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {Object.entries(currentApplicantForm).map(([key, value]) => (
              <View key={key} style={styles.detailRow}>
                <Text style={[styles.detailKey, { color: colors.bodyText, fontFamily: colors.bodyFont }]}>
                  {key}
                </Text>
                <Text style={[styles.detailValue, { color: colors.text, fontFamily: colors.bodyFontBold }]}>
                  {value}
                </Text>
              </View>
            ))}
          </View>
        </FadeInView>
      )}

      {/* Buttons */}
      <FadeInView delay={450} style={styles.buttonStack}>
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.replace('/')}
          activeOpacity={0.85}
          accessibilityLabel="Return to home screen"
          accessibilityRole="button"
        >
          <Text style={[styles.primaryBtnText, { fontFamily: colors.bodyFontBold }]}>
            Return to Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
          onPress={() => router.push('/officer-dashboard')}
          activeOpacity={0.85}
          accessibilityLabel="View compliance officer dashboard"
          accessibilityRole="button"
        >
          <Text style={[styles.secondaryBtnText, { color: colors.text, fontFamily: colors.bodyFontBold }]}>
            View Officer Dashboard
          </Text>
        </TouchableOpacity>
      </FadeInView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 22, textAlign: 'center', flex: 1 },
  statusCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    marginBottom: 28,
  },
  plantWrapper: { marginBottom: 16 },
  statusTitle: { fontSize: 18, textAlign: 'center', marginBottom: 8 },
  statusSubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 12 },
  growthPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  growthPillText: { fontSize: 13 },
  sectionHeader: {
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  detailsCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 32,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  detailKey: { fontSize: 13, flex: 1 },
  detailValue: { fontSize: 13, flex: 1, textAlign: 'right' },
  buttonStack: { gap: 12 },
  primaryBtn: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { color: '#121212', fontSize: 16 },
  secondaryBtn: {
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: { fontSize: 15 },
});
