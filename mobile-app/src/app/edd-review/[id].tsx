import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Animated as RNAnimated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Bot, CheckCircle2, ShieldAlert, XCircle, ArrowLeft } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { RiskLevel } from '../../types';
import { FadeInView } from '../../components/AnimatedContainers';

export default function EddReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, applicants, updateApplicantStatus, isDarkMode } = useApp();

  const [snackbar, setSnackbar] = useState<string | null>(null);
  const snackbarY = useRef(new RNAnimated.Value(100)).current;
  const snackbarOpacity = useRef(new RNAnimated.Value(0)).current;

  const applicant = applicants.find((app) => app.id === id);

  // Snackbar animation
  useEffect(() => {
    if (snackbar) {
      RNAnimated.parallel([
        RNAnimated.spring(snackbarY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
        RNAnimated.timing(snackbarOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();

      const timer = setTimeout(() => {
        RNAnimated.parallel([
          RNAnimated.timing(snackbarY, { toValue: 100, duration: 250, useNativeDriver: true }),
          RNAnimated.timing(snackbarOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
        ]).start(() => {
          setSnackbar(null);
        });
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [snackbar]);

  if (!applicant) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.text, fontFamily: colors.bodyFont }}>Applicant record not found.</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.emptyBackBtn}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Text style={{ color: colors.primary, fontFamily: colors.bodyFontBold }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const showSnackbar = (msg: string) => {
    snackbarY.setValue(100);
    snackbarOpacity.setValue(0);
    setSnackbar(msg);
  };

  const handleApprove = () => {
    updateApplicantStatus(applicant.id, 'Approved', RiskLevel.LOW);
    showSnackbar(`✓ ${applicant.name} approved`);
    setTimeout(() => router.back(), 2000);
  };

  const handleEscalate = () => {
    updateApplicantStatus(applicant.id, 'Escalated');
    showSnackbar(`↑ ${applicant.name} escalated to Senior Officer`);
    setTimeout(() => router.back(), 2000);
  };

  const handleReject = () => {
    Alert.alert(
      'Reject Application',
      `Reject the application for ${applicant.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => {
            updateApplicantStatus(applicant.id, 'Rejected');
            showSnackbar(`✕ ${applicant.name} application rejected`);
            setTimeout(() => router.back(), 2000);
          },
        },
      ],
    );
  };

  const riskColor = applicant.riskLevel === RiskLevel.HIGH
    ? colors.riskHigh
    : applicant.riskLevel === RiskLevel.MEDIUM
    ? colors.riskMedium
    : colors.riskLow;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Back + header */}
        <FadeInView delay={50} style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            accessibilityLabel="Go back to dashboard"
            accessibilityRole="button"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ArrowLeft size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.sectionLabel, { color: colors.bodyText, fontFamily: colors.bodyFontBold }]}>
            Compliance Case Profile
          </Text>
          <View style={{ width: 44 }} />
        </FadeInView>

        <FadeInView delay={100}>
          <Text style={[styles.nameHeader, { color: colors.text, fontFamily: colors.headlineFont }]}>
            {applicant.name} — {applicant.occupation}
          </Text>

          {/* Risk badge */}
          <View style={[styles.riskPill, { backgroundColor: `${riskColor}20` }]}>
            <View style={[styles.riskDot, { backgroundColor: riskColor }]} />
            <Text style={[styles.riskPillText, { color: riskColor, fontFamily: colors.bodyFontBold }]}>
              {applicant.riskLevel} RISK · {applicant.aiConfidence}% AI Confidence
            </Text>
          </View>
        </FadeInView>

        {/* Signal Grid */}
        <FadeInView delay={200}>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardHeader, { color: colors.bodyText, fontFamily: colors.bodyFontBold }]}>
              Onboarding Signal Grid
            </Text>
            <View style={styles.signalsList}>
              {Object.entries(applicant.signals).map(([key, val]) => (
                <View key={key} style={styles.signalRow} accessibilityLabel={`${key}: ${val}`}>
                  <Text style={[styles.signalKey, { color: colors.bodyText, fontFamily: colors.bodyFont }]}>
                    {key}
                  </Text>
                  <Text style={[styles.signalValue, { color: colors.text, fontFamily: colors.bodyFontBold }]}>
                    {val}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </FadeInView>

        {/* AI Reasoning */}
        <FadeInView delay={300}>
          <View
            style={[
              styles.aiCard,
              {
                backgroundColor: isDarkMode ? colors.riskHighSurface : '#FFF3E0',
                borderColor: isDarkMode ? `${colors.riskHigh}60` : '#FFCC80',
              },
            ]}
            accessibilityLabel={`AI Risk Assessment: ${applicant.aiReasoning}`}
          >
            <View style={styles.aiHeader}>
              <Bot size={24} color={isDarkMode ? colors.riskHigh : '#E65C00'} />
              <Text
                style={[
                  styles.aiTitle,
                  { color: isDarkMode ? colors.riskHigh : '#E65C00', fontFamily: colors.headlineFont },
                ]}>
                AI Risk Assessment
              </Text>
            </View>
            <Text style={[styles.aiText, { color: colors.text, fontFamily: colors.bodyFont }]}>
              {applicant.aiReasoning}
            </Text>
          </View>
        </FadeInView>
      </ScrollView>

      {/* Sticky Bottom Actions */}
      <View style={[styles.stickyBottom, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.approveButton, { backgroundColor: colors.riskLow }]}
          onPress={handleApprove}
          activeOpacity={0.85}
          accessibilityLabel={`Approve application for ${applicant.name}`}
          accessibilityRole="button"
        >
          <CheckCircle2 size={20} color="#FFFFFF" />
          <Text style={[styles.actionBtnText, { fontFamily: colors.bodyFontBold }]}>
            Approve
          </Text>
        </TouchableOpacity>

        <View style={styles.secondaryActions}>
          <TouchableOpacity
            style={[styles.secondaryBtn, { backgroundColor: colors.warningOrange }]}
            onPress={handleEscalate}
            activeOpacity={0.85}
            accessibilityLabel={`Escalate ${applicant.name} to senior officer`}
            accessibilityRole="button"
          >
            <ShieldAlert size={18} color="#FFFFFF" />
            <Text style={[styles.secondaryBtnText, { fontFamily: colors.bodyFontBold }]}>
              Escalate
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryBtn, { backgroundColor: colors.errorRed }]}
            onPress={handleReject}
            activeOpacity={0.85}
            accessibilityLabel={`Reject application for ${applicant.name}`}
            accessibilityRole="button"
          >
            <XCircle size={18} color="#FFFFFF" />
            <Text style={[styles.secondaryBtnText, { fontFamily: colors.bodyFontBold }]}>
              Reject
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Non-blocking bottom snackbar */}
      {snackbar && (
        <RNAnimated.View
          style={[
            styles.snackbar,
            {
              backgroundColor: colors.text,
              transform: [{ translateY: snackbarY }],
              opacity: snackbarOpacity,
            },
          ]}
          pointerEvents="none"
        >
          <Text style={[styles.snackbarText, { color: colors.background, fontFamily: colors.bodyFontBold }]}>
            {snackbar}
          </Text>
        </RNAnimated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 170 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBackBtn: {
    marginTop: 20,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLabel: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  nameHeader: { fontSize: 22, marginBottom: 10 },
  riskPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    marginBottom: 20,
  },
  riskDot: { width: 8, height: 8, borderRadius: 4 },
  riskPillText: { fontSize: 12, letterSpacing: 0.3 },
  card: { borderRadius: 24, borderWidth: 1, padding: 18, marginBottom: 20 },
  cardHeader: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 },
  signalsList: { gap: 10 },
  signalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  signalKey: { fontSize: 14 },
  signalValue: { fontSize: 14 },
  aiCard: { borderRadius: 24, borderWidth: 1, padding: 20 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  aiTitle: { fontSize: 16 },
  aiText: { fontSize: 14, lineHeight: 22 },
  stickyBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    gap: 10,
  },
  approveButton: {
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionBtnText: { color: '#FFFFFF', fontSize: 15 },
  secondaryActions: { flexDirection: 'row', gap: 10 },
  secondaryBtn: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  secondaryBtnText: { color: '#FFFFFF', fontSize: 13 },
  snackbar: {
    position: 'absolute',
    bottom: 140,
    left: 20,
    right: 20,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignItems: 'center',
  },
  snackbarText: { fontSize: 14, textAlign: 'center' },
});
