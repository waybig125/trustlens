import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Bot } from 'lucide-react-native';
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
        <Text style={{ color: colors.text }}>Applicant not found.</Text>
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
    showToast('Escalated to Senior Officer');
  };

  const handleReject = () => {
    updateApplicantStatus(applicant.id, 'Rejected');
    showToast('Rejected Application');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionLabel, { color: colors.secondaryText }]}>Applicant Profile</Text>
        <Text style={[styles.nameHeader, { color: colors.text }]}>
          {applicant.name} - {applicant.occupation}
        </Text>

        {/* Signals Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardHeader, { color: colors.secondaryText }]}>Onboarding Signals</Text>
          <View style={styles.signalsList}>
            {Object.entries(applicant.signals).map(([key, val]) => (
              <View key={key} style={styles.signalRow}>
                <Text style={[styles.signalKey, { color: colors.secondaryText }]}>{key}</Text>
                <Text style={[styles.signalValue, { color: colors.text }]}>{val}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* AI Judgment Box */}
        <View
          style={[
            styles.aiCard,
            {
              backgroundColor: isDarkMode ? `${colors.warningOrange}15` : '#FFF3E0',
              borderColor: isDarkMode ? `${colors.warningOrange}50` : '#FFCC80',
            },
          ]}>
          <View style={styles.aiHeader}>
            <Bot size={22} color={colors.warningOrange} />
            <Text style={[styles.aiTitle, { color: colors.warningOrange }]}>
              AI Risk Profiling Judgment
            </Text>
          </View>
          <Text style={[styles.aiText, { color: colors.text }]}>{applicant.aiReasoning}</Text>
        </View>
      </ScrollView>

      {/* Sticky Bottom Actions */}
      <View style={[styles.stickyBottom, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.leafGreen }]}
          onPress={handleApprove}
          activeOpacity={0.8}>
          <Text style={styles.actionButtonText}>Approve (Prune & Clear)</Text>
        </TouchableOpacity>

        <View style={styles.secondaryActions}>
          <TouchableOpacity
            style={[styles.secondaryBtn, { backgroundColor: colors.secondaryText }]}
            onPress={handleEscalate}
            activeOpacity={0.8}>
            <Text style={styles.secondaryBtnText}>Escalate</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryBtn, { backgroundColor: colors.errorRed }]}
            onPress={handleReject}
            activeOpacity={0.8}>
            <Text style={styles.secondaryBtnText}>Reject</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Toast Notification */}
      {toastMessage && (
        <View style={styles.toastOverlay}>
          <View style={styles.toastCard}>
            <Text style={styles.toastText}>{toastMessage}</Text>
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
    paddingBottom: 160,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  nameHeader: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 4,
    marginBottom: 20,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  cardHeader: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  signalsList: {
    gap: 8,
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
    fontWeight: '600',
  },
  aiCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  aiText: {
    fontSize: 14,
    lineHeight: 20,
  },
  stickyBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    gap: 8,
  },
  actionButton: {
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
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
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  toastCard: {
    backgroundColor: '#000000',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
