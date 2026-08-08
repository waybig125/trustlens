import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Bot, CheckCircle2, ShieldAlert, XCircle } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { RiskLevel } from '../../types';

export default function EddReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, applicants, updateApplicantStatus, isDarkMode } = useApp();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const applicant = applicants.find((app) => app.id === id);

  if (!applicant) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.text, fontFamily: colors.bodyFont }}>Applicant record not found.</Text>
      </View>
    );
  }

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
      router.back();
    }, 1800);
  };

  const handleApprove = () => {
    updateApplicantStatus(applicant.id, 'Approved', RiskLevel.LOW);
    showToast(`Action simulated: Applicant ${applicant.name} moved to Approved Queue`);
  };

  const handleEscalate = () => {
    updateApplicantStatus(applicant.id, 'Escalated');
    showToast(`Escalated ${applicant.name} to Senior Officer`);
  };

  const handleReject = () => {
    updateApplicantStatus(applicant.id, 'Rejected');
    showToast(`Rejected Application for ${applicant.name}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionLabel, { color: colors.bodyText, fontFamily: colors.bodyFontBold }]}>
          Compliance Case Profile
        </Text>
        
        <Text style={[styles.nameHeader, { color: colors.text, fontFamily: colors.headlineFont }]}>
          {applicant.name} — {applicant.occupation}
        </Text>

        {/* Onboarding Signal Grid Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardHeader, { color: colors.bodyText, fontFamily: colors.bodyFontBold }]}>
            Onboarding Signal Grid
          </Text>
          <View style={styles.signalsList}>
            {Object.entries(applicant.signals).map(([key, val]) => (
              <View key={key} style={styles.signalRow}>
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

        {/* AI Reasoning Box */}
        <View
          style={[
            styles.aiCard,
            {
              backgroundColor: isDarkMode ? `${colors.softCoral}18` : '#FFF3E0',
              borderColor: isDarkMode ? `${colors.softCoral}50` : '#FFCC80',
            },
          ]}>
          <View style={styles.aiHeader}>
            <Bot size={24} color={isDarkMode ? colors.softCoral : '#F57C00'} />
            <Text
              style={[
                styles.aiTitle,
                { color: isDarkMode ? colors.softCoral : '#F57C00', fontFamily: colors.headlineFont },
              ]}>
              AI Risk Profiling Judgment
            </Text>
          </View>
          <Text style={[styles.aiText, { color: colors.text, fontFamily: colors.bodyFont }]}>
            {applicant.aiReasoning}
          </Text>
        </View>
      </ScrollView>

      {/* Sticky Bottom Decision Bar */}
      <View style={[styles.stickyBottom, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.approveButton, { backgroundColor: colors.leafGreen }]}
          onPress={handleApprove}
          activeOpacity={0.85}>
          <CheckCircle2 size={20} color="#FFFFFF" />
          <Text style={[styles.actionButtonText, { fontFamily: colors.bodyFontBold }]}>
            Approve (Prune & Clear)
          </Text>
        </TouchableOpacity>

        <View style={styles.secondaryActions}>
          <TouchableOpacity
            style={[styles.secondaryBtn, { backgroundColor: colors.warningOrange }]}
            onPress={handleEscalate}
            activeOpacity={0.85}>
            <ShieldAlert size={18} color="#FFFFFF" />
            <Text style={[styles.secondaryBtnText, { fontFamily: colors.bodyFontBold }]}>
              Escalate to Senior
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryBtn, { backgroundColor: colors.errorRed }]}
            onPress={handleReject}
            activeOpacity={0.85}>
            <XCircle size={18} color="#FFFFFF" />
            <Text style={[styles.secondaryBtnText, { fontFamily: colors.bodyFontBold }]}>
              Reject Application
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Action Toast Notification */}
      {toastMessage && (
        <View style={styles.toastOverlay}>
          <View style={[styles.toastCard, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.toastText, { color: '#FFD700', fontFamily: colors.bodyFontBold }]}>
              {toastMessage}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 170,
  },
  sectionLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  nameHeader: {
    fontSize: 24,
    marginTop: 4,
    marginBottom: 20,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    marginBottom: 20,
  },
  cardHeader: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 14,
  },
  signalsList: {
    gap: 10,
  },
  signalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  signalKey: {
    fontSize: 14,
  },
  signalValue: {
    fontSize: 14,
  },
  aiCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  aiTitle: {
    fontSize: 16,
  },
  aiText: {
    fontSize: 14,
    lineHeight: 22,
  },
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
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  secondaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
  },
  toastOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  toastCard: {
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  toastText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
