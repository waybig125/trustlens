import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Animated as RNAnimated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Bot, CheckCircle2, ShieldAlert, XCircle, ArrowLeft, Send } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { Application } from '../../types';
import { FadeInView } from '../../components/AnimatedContainers';

export default function EddReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, getApplicationDetail, officerAction, routeToEdd, isDarkMode } = useApp();

  const [detail, setDetail] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [clarifyMode, setClarifyMode] = useState(false);
  const [clarifyNote, setClarifyNote] = useState('');
  const snackbarY = useRef(new RNAnimated.Value(100)).current;
  const snackbarOpacity = useRef(new RNAnimated.Value(0)).current;

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const d = await getApplicationDetail(id);
    setDetail(d);
    setLoading(false);
  }, [id, getApplicationDetail]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

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
        ]).start(() => setSnackbar(null));
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [snackbar]);

  const showSnackbar = (msg: string) => {
    snackbarY.setValue(100);
    snackbarOpacity.setValue(0);
    setSnackbar(msg);
  };

  const runAction = async (
    action: 'approve' | 'request_clarification' | 'escalate' | 'reject',
    note?: string,
  ) => {
    if (!detail?.case_id) return;
    setActing(true);
    const res = await officerAction(detail.case_id, action, note);
    setActing(false);
    if (res.error) {
      Alert.alert('Action failed', res.error);
      return;
    }
    const label = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : action === 'escalate' ? 'escalated' : 'clarification requested';
    showSnackbar(`${detail.profile.name}: ${label}`);
    await fetchDetail();
    setTimeout(() => router.back(), 1600);
  };

  const handleApprove = () => runAction('approve');
  const handleEscalate = () => runAction('escalate');
  const handleReject = () => {
    Alert.alert(
      'Reject Application',
      `Reject the application for ${detail?.profile.name}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reject', style: 'destructive', onPress: () => runAction('reject') },
      ],
    );
  };
  const handleClarifyRequest = () => {
    setClarifyMode((prev) => !prev);
    setClarifyNote('');
  };

  const handleSendClarify = async () => {
    if (!clarifyNote.trim()) {
      Alert.alert('Note required', 'Please describe what information the applicant needs to provide.');
      return;
    }
    setClarifyMode(false);
    await runAction('request_clarification', clarifyNote.trim());
  };

  const handleRouteToEdd = async () => {
    if (!id) return;
    setActing(true);
    const res = await routeToEdd(id);
    setActing(false);
    if (res.error) {
      Alert.alert('Could not route', res.error);
      return;
    }
    showSnackbar('Routed to EDD queue');
    await fetchDetail();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerBox, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!detail) {
    return (
      <View style={[styles.container, styles.centerBox, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text, fontFamily: colors.bodyFont }}>Applicant record not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.emptyBackBtn}>
          <Text style={{ color: colors.primary, fontFamily: colors.bodyFontBold }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const riskColor = detail.risk.level === 'high' ? colors.riskHigh : detail.risk.level === 'medium' ? colors.riskMedium : colors.riskLow;
  const verdictColor = (v: string) =>
    v === 'inconsistent' ? colors.riskHigh : v === 'attention' ? colors.riskMedium : colors.riskLow;
  const riskLabel = detail.risk.level.toUpperCase() + ' RISK';

  const hasCase = Boolean(detail.case_id);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <FadeInView delay={50} style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.sectionLabel, { color: colors.bodyText, fontFamily: colors.bodyFontBold }]}>
            Compliance Case Profile
          </Text>
          <View style={{ width: 44 }} />
        </FadeInView>

        <FadeInView delay={100}>
          <Text style={[styles.nameHeader, { color: colors.text, fontFamily: colors.headlineFont }]}>
            {detail.profile.name}
          </Text>
          <Text style={[styles.nameSub, { color: colors.bodyText, fontFamily: colors.bodyFont }]}>
            {detail.profile.employment_type || 'Applicant'} · {detail.profile.city || 'N/A'}
          </Text>

          <View style={[styles.riskPill, { backgroundColor: `${riskColor}20` }]}>
            <View style={[styles.riskDot, { backgroundColor: riskColor }]} />
            <Text style={[styles.riskPillText, { color: riskColor, fontFamily: colors.bodyFontBold }]}>
              {riskLabel} · {detail.risk.confidence}% AI Confidence
            </Text>
          </View>
          {!hasCase && (
            <View style={[styles.noCaseBanner, { backgroundColor: colors.primarySurface, borderColor: `${colors.primary}40` }]}>
              <Text style={[styles.noCaseText, { color: colors.primaryDark, fontFamily: colors.bodyFontBold }]}>
                Not yet in EDD — route to the review queue to take action.
              </Text>
            </View>
          )}
        </FadeInView>

        {/* Signal Grid */}
        <FadeInView delay={200}>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardHeader, { color: colors.bodyText, fontFamily: colors.bodyFontBold }]}>
              Onboarding Signal Grid
            </Text>
            <View style={styles.signalsList}>
              {detail.risk.signals.map((s) => (
                <View key={s.label} style={styles.signalRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.signalKey, { color: colors.bodyText, fontFamily: colors.bodyFontBold }]}>
                      {s.label}
                    </Text>
                    <Text style={[styles.signalValue, { color: colors.text, fontFamily: colors.bodyFont }]}>
                      {s.value}
                    </Text>
                    <Text style={[styles.signalNote, { color: colors.bodyText, fontFamily: colors.bodyFont }]}>
                      {s.note}
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
          </View>
        </FadeInView>

        {/* AI Reasoning */}
        <FadeInView delay={300}>
          <View
            style={[
              styles.aiCard,
              { backgroundColor: isDarkMode ? colors.riskHighSurface : '#FFF3E0', borderColor: isDarkMode ? `${colors.riskHigh}60` : '#FFCC80' },
            ]}
          >
            <View style={styles.aiHeader}>
              <Bot size={24} color={isDarkMode ? colors.riskHigh : '#E65C00'} />
              <Text style={[styles.aiTitle, { color: isDarkMode ? colors.riskHigh : '#E65C00', fontFamily: colors.headlineFont }]}>
                AI Risk Assessment · {detail.risk.engine}
              </Text>
            </View>
            <Text style={[styles.aiText, { color: colors.text, fontFamily: colors.bodyFont }]}>
              {detail.risk.conclusion}
            </Text>
          </View>
        </FadeInView>

        {/* Case History */}
        {hasCase && detail.case && detail.case.history && detail.case.history.length > 0 && (
          <FadeInView delay={350}>
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.cardHeader, { color: colors.bodyText, fontFamily: colors.bodyFontBold }]}>
                Case Trail
              </Text>
              {detail.case.history.map((h, i) => (
                <View key={i} style={styles.historyRow}>
                  <Text style={[styles.historyStatus, { color: colors.text, fontFamily: colors.bodyFontBold }]}>
                    {h.status.replace(/_/g, ' ')}
                  </Text>
                  <Text style={[styles.historyNote, { color: colors.bodyText, fontFamily: colors.bodyFont }]}>
                    {h.note}
                  </Text>
                  <Text style={[styles.historyMeta, { color: colors.neutral, fontFamily: colors.bodyFont }]}>
                    {h.by} · {new Date(h.at).toLocaleString()}
                  </Text>
                </View>
              ))}
            </View>
          </FadeInView>
        )}
      </ScrollView>

      {/* Sticky Bottom Actions */}
      <View style={[styles.stickyBottom, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        {acting ? (
          <ActivityIndicator color={colors.primary} />
        ) : hasCase ? (
          <>
            {clarifyMode && (
              <View>
                <TextInput
                  style={[
                    styles.clarifyInput,
                    {
                      backgroundColor: colors.surfaceElevated,
                      color: colors.text,
                      borderColor: colors.border,
                      fontFamily: colors.bodyFont,
                    },
                  ]}
                  placeholder="What information does the applicant need to provide?"
                  placeholderTextColor={colors.neutral}
                  value={clarifyNote}
                  onChangeText={setClarifyNote}
                  multiline
                  autoFocus
                  accessibilityLabel="Clarification request note"
                />
                <View style={styles.clarifyActions}>
                  <TouchableOpacity
                    style={[styles.clarifyBtnSecondary, { borderColor: colors.border }]}
                    onPress={() => setClarifyMode(false)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.secondaryBtnText, { color: colors.text, fontFamily: colors.bodyFontBold }]}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.clarifyBtnPrimary, { backgroundColor: colors.primary }]}
                    onPress={handleSendClarify}
                    activeOpacity={0.85}
                  >
                    <Send size={16} color="#121212" />
                    <Text style={[styles.routeBtnText, { fontFamily: colors.bodyFontBold }]}>Send</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <TouchableOpacity style={[styles.approveButton, { backgroundColor: colors.riskLow }]} onPress={handleApprove}>
              <CheckCircle2 size={20} color="#FFFFFF" />
              <Text style={[styles.actionBtnText, { fontFamily: colors.bodyFontBold }]}>Approve</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.secondaryBtn, { backgroundColor: colors.primary }]} onPress={handleClarifyRequest}>
              <Send size={18} color="#FFFFFF" />
              <Text style={[styles.actionBtnText, { fontFamily: colors.bodyFontBold }]}>
                {clarifyMode ? 'Hide Request' : 'Request Info'}
              </Text>
            </TouchableOpacity>

            <View style={styles.secondaryRow}>
              <TouchableOpacity style={[styles.secondaryBtn, { backgroundColor: colors.warningOrange }]} onPress={handleEscalate}>
                <ShieldAlert size={18} color="#FFFFFF" />
                <Text style={[styles.secondaryBtnText, { fontFamily: colors.bodyFontBold }]}>Escalate</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.secondaryBtn, { backgroundColor: colors.errorRed }]} onPress={handleReject}>
                <XCircle size={18} color="#FFFFFF" />
                <Text style={[styles.secondaryBtnText, { fontFamily: colors.bodyFontBold }]}>Reject</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <TouchableOpacity style={[styles.approveButton, { backgroundColor: colors.primary }]} onPress={handleRouteToEdd}>
            <ShieldAlert size={20} color="#121212" />
            <Text style={[styles.routeBtnText, { fontFamily: colors.bodyFontBold }]}>Route to EDD Review</Text>
          </TouchableOpacity>
        )}
      </View>

      {snackbar && (
        <RNAnimated.View
          style={[styles.snackbar, { backgroundColor: colors.text, transform: [{ translateY: snackbarY }], opacity: snackbarOpacity }]}
          pointerEvents="none"
        >
          <Text style={[styles.snackbarText, { color: colors.background, fontFamily: colors.bodyFontBold }]}>{snackbar}</Text>
        </RNAnimated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerBox: { justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20, paddingBottom: 240 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  emptyBackBtn: { marginTop: 20, height: 44, alignItems: 'center', justifyContent: 'center' },
  sectionLabel: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  nameHeader: { fontSize: 22, marginBottom: 2 },
  nameSub: { fontSize: 13, marginBottom: 12 },
  riskPill: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, gap: 8, marginBottom: 12 },
  riskDot: { width: 8, height: 8, borderRadius: 4 },
  riskPillText: { fontSize: 12, letterSpacing: 0.3 },
  noCaseBanner: { borderRadius: 16, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 16 },
  noCaseText: { fontSize: 12 },
  card: { borderRadius: 24, borderWidth: 1, padding: 18, marginBottom: 20 },
  cardHeader: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 },
  signalsList: { gap: 14 },
  signalRow: { flexDirection: 'row', gap: 12 },
  signalKey: { fontSize: 13, marginBottom: 2 },
  signalValue: { fontSize: 14, marginBottom: 2 },
  signalNote: { fontSize: 12, lineHeight: 18 },
  verdictBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, height: 24 },
  verdictText: { fontSize: 10, textTransform: 'capitalize' },
  aiCard: { borderRadius: 24, borderWidth: 1, padding: 20 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  aiTitle: { fontSize: 14, flex: 1 },
  aiText: { fontSize: 14, lineHeight: 22 },
  historyRow: { marginBottom: 12 },
  historyStatus: { fontSize: 13, textTransform: 'capitalize', marginBottom: 2 },
  historyNote: { fontSize: 13, lineHeight: 18, marginBottom: 2 },
  historyMeta: { fontSize: 11 },
  stickyBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    gap: 10,
  },
  clarifyInput: {
    height: 72,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  clarifyActions: { flexDirection: 'row', gap: 10, marginBottom: 2 },
  clarifyBtnSecondary: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clarifyBtnPrimary: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
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
  routeBtnText: { color: '#121212', fontSize: 15 },
  secondaryRow: { flexDirection: 'row', gap: 10 },
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
    bottom: 150,
    left: 20,
    right: 20,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignItems: 'center',
  },
  snackbarText: { fontSize: 14, textAlign: 'center' },
});