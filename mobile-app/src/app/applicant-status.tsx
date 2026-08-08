import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Send } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { Application, plantGrowth, humanStatus } from '../types';
import { AnimatedTrustPlant } from '../components/AnimatedTrustPlant';
import { FadeInView } from '../components/AnimatedContainers';

export default function ApplicantStatusScreen() {
  const router = useRouter();
  const { app_id } = useLocalSearchParams<{ app_id?: string }>();
  const { colors, isDarkMode, getApplicationDetail, submitClarification } = useApp();

  const [detail, setDetail] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [clarification, setClarification] = useState('');
  const [sending, setSending] = useState(false);

  const fetchDetail = async (id: string) => {
    setLoading(true);
    setLoadError(null);
    const d = await getApplicationDetail(id);
    if (d) setDetail(d);
    else setLoadError('Could not load your application. Try again in a moment.');
    setLoading(false);
  };

  useEffect(() => {
    if (app_id) fetchDetail(app_id);
    else {
      setLoading(false);
      setLoadError('No application found. Please submit the KYC form first.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app_id]);

  const handleClarify = async () => {
    if (!app_id || !detail?.case_id) return;
    const msg = clarification.trim();
    if (!msg) {
      Alert.alert('Message required', 'Please enter a clarification for the compliance officer.');
      return;
    }
    setSending(true);
    const res = await submitClarification(app_id, msg);
    setSending(false);
    if (res.error) {
      Alert.alert('Could not send', res.error);
      return;
    }
    Alert.alert('Sent', 'Your clarification has been sent to the compliance officer.');
    setClarification('');
    fetchDetail(app_id);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.msgText, { color: colors.bodyText, fontFamily: colors.bodyFont }]}>
          Loading your application…
        </Text>
      </View>
    );
  }

  if (loadError || !detail) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.errorRed, fontFamily: colors.bodyFont }]}>
          {loadError || 'Application not found.'}
        </Text>
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.replace('/')}
          activeOpacity={0.85}>
          <Text style={[styles.primaryBtnText, { fontFamily: colors.bodyFontBold }]}>Return to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const growth = plantGrowth(detail.plant_state);
  const statusTitle = humanStatus(detail.status);
  const isApproved = detail.status === 'approved' || detail.status === 'active';
  const isRejected = detail.status === 'rejected';
  const statusMessage = isApproved
    ? 'Your Trust Plant is in full bloom! Account approved.'
    : isRejected
    ? 'Your application was declined. Please contact support.'
    : 'Your Trust Plant is growing while our AI verifies your details.';

  const profileRows: { label: string; value: string }[] = [
    { label: 'Full Name', value: detail.profile.name },
    { label: 'CNIC', value: detail.profile.cnic || '—' },
    { label: 'City', value: detail.profile.city || '—' },
    { label: 'Employment', value: detail.profile.employment_type || '—' },
    { label: 'Monthly Income', value: detail.profile.monthly_income ? `Rs. ${detail.profile.monthly_income.toLocaleString()}` : '—' },
    { label: 'Account Purpose', value: detail.profile.account_purpose || '—' },
    { label: 'Expected Tx/mo', value: detail.profile.expected_monthly_transactions ? `Rs. ${detail.profile.expected_monthly_transactions.toLocaleString()}` : '—' },
  ];

  const riskColor = detail.risk.level === 'high' ? colors.riskHigh : detail.risk.level === 'medium' ? colors.riskMedium : colors.riskLow;
  const verdictColor = (v: string) =>
    v === 'inconsistent' ? colors.riskHigh : v === 'attention' ? colors.riskMedium : colors.riskLow;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      accessibilityLabel="Application status"
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
        <Text style={[styles.title, { color: colors.text, fontFamily: colors.headlineFont }]} accessibilityRole="header">
          Application Status
        </Text>
        <TouchableOpacity onPress={() => detail && fetchDetail(detail.id)} style={{ width: 44 }} accessibilityLabel="Refresh status">
          <Text style={[styles.refreshText, { color: colors.primary, fontFamily: colors.bodyFontBold }]}>↻</Text>
        </TouchableOpacity>
      </FadeInView>

      {/* Plant Card */}
      <FadeInView delay={200}>
        <View style={[styles.statusCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.plantWrapper}>
            <AnimatedTrustPlant growth={growth} size={160} dark={isDarkMode} focused={true} />
          </View>
          <Text style={[styles.statusTitle, { color: colors.text, fontFamily: colors.headlineFont }]}>
            {statusTitle}
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

      {/* Risk Assessment */}
      <FadeInView delay={300}>
        <Text style={[styles.sectionHeader, { color: colors.bodyText, fontFamily: colors.bodyFontBold }]}>
          AI Risk Assessment
        </Text>
        <View style={[styles.detailsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.riskRow}>
            <View style={[styles.riskPill, { backgroundColor: `${riskColor}20` }]}>
              <Text style={[styles.riskPillText, { color: riskColor, fontFamily: colors.bodyFontBold }]}>
                {detail.risk.level.toUpperCase()} RISK · {detail.risk.confidence}% confidence
              </Text>
            </View>
          </View>
          <Text style={[styles.conclusion, { color: colors.text, fontFamily: colors.bodyFont }]}>
            {detail.risk.conclusion}
          </Text>
          {detail.risk.signals.map((s) => (
            <View key={s.label} style={styles.signalRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.signalKey, { color: colors.bodyText, fontFamily: colors.bodyFontBold }]}>
                  {s.label}
                </Text>
                <Text style={[styles.signalValue, { color: colors.text, fontFamily: colors.bodyFont }]}>
                  {s.value}
                </Text>
              </View>
              <View style={[styles.verdictBadge, { backgroundColor: `${verdictColor(s.verdict)}20` }]}>
                <Text style={[styles.verdictText, { color: verdictColor(s.verdict), fontFamily: colors.bodyFontBold }]}>
                  {s.verdict}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </FadeInView>

      {/* Submitted Details */}
      <FadeInView delay={350}>
        <Text style={[styles.sectionHeader, { color: colors.bodyText, fontFamily: colors.bodyFontBold }]}>
          Submitted KYC Details
        </Text>
        <View style={[styles.detailsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {profileRows.map((row) => (
            <View key={row.label} style={styles.detailRow}>
              <Text style={[styles.detailKey, { color: colors.bodyText, fontFamily: colors.bodyFont }]}>
                {row.label}
              </Text>
              <Text style={[styles.detailValue, { color: colors.text, fontFamily: colors.bodyFontBold }]}>
                {row.value}
              </Text>
            </View>
          ))}
        </View>
      </FadeInView>

      {/* Clarification (only when a case is open) */}
      {detail.case_id && (
        <FadeInView delay={420}>
          <Text style={[styles.sectionHeader, { color: colors.bodyText, fontFamily: colors.bodyFontBold }]}>
            Send Clarification to Officer
          </Text>
          <View style={[styles.detailsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.clarifyHint, { color: colors.bodyText, fontFamily: colors.bodyFont }]}>
              Your application is under enhanced due diligence. Provide more details to speed up review.
            </Text>
            <TextInput
              style={[styles.clarifyInput, { backgroundColor: colors.surfaceElevated, color: colors.text, borderColor: colors.border, fontFamily: colors.bodyFont }]}
              placeholder="Explain your income source or transaction pattern…"
              placeholderTextColor={colors.neutral}
              value={clarification}
              onChangeText={setClarification}
              multiline
              accessibilityLabel="Clarification message"
            />
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
              onPress={handleClarify}
              disabled={sending}
              activeOpacity={0.85}>
              {sending ? (
                <ActivityIndicator color="#121212" />
              ) : (
                <>
                  <Send size={18} color="#121212" />
                  <Text style={[styles.clarifyBtnText, { fontFamily: colors.bodyFontBold }]}>Send Clarification</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </FadeInView>
      )}

      {/* Buttons */}
      <FadeInView delay={450} style={styles.buttonStack}>
        <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={() => router.replace('/')} activeOpacity={0.85}>
          <Text style={[styles.primaryBtnText, { fontFamily: colors.bodyFontBold }]}>Return to Home</Text>
        </TouchableOpacity>
      </FadeInView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, padding: 24 },
  msgText: { fontSize: 14, textAlign: 'center' },
  errorText: { fontSize: 14, textAlign: 'center', marginBottom: 4 },
  content: { padding: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, textAlign: 'center', flex: 1 },
  refreshText: { fontSize: 20 },
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
  growthPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
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
    marginBottom: 24,
  },
  riskRow: { flexDirection: 'row', marginBottom: 12 },
  riskPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  riskPillText: { fontSize: 12, letterSpacing: 0.3 },
  conclusion: { fontSize: 14, lineHeight: 21, marginBottom: 14 },
  signalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  signalKey: { fontSize: 13, marginBottom: 2 },
  signalValue: { fontSize: 13 },
  verdictBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  verdictText: { fontSize: 10, textTransform: 'capitalize' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  detailKey: { fontSize: 13, flex: 1 },
  detailValue: { fontSize: 13, flex: 1, textAlign: 'right' },
  clarifyHint: { fontSize: 13, lineHeight: 19, marginBottom: 12 },
  clarifyInput: {
    height: 88,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  clarifyBtnText: { color: '#121212', fontSize: 15 },
  buttonStack: { gap: 12 },
  primaryBtn: {
    minHeight: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  primaryBtnText: { color: '#121212', fontSize: 16 },
});