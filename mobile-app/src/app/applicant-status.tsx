import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Flower2 } from 'lucide-react-native';
import { useApp } from '../context/AppContext';

export default function ApplicantStatusScreen() {
  const router = useRouter();
  const { colors, applicantStatus, currentApplicantForm } = useApp();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.text, fontFamily: colors.headlineFont }]}>
        Application Status & Trust Garden
      </Text>

      {/* Garden Plant State Card */}
      <View style={[styles.statusCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.iconWrapper}>
          <Flower2 size={64} color={colors.primary} />
        </View>
        <Text style={[styles.statusTitle, { color: colors.text, fontFamily: colors.headlineFont }]}>
          {applicantStatus || 'Application Under AI Review'}
        </Text>
        <Text style={[styles.statusSubtitle, { color: colors.bodyText, fontFamily: colors.bodyFont }]}>
          Your personal Trust Plant is thriving while our AI verifies your details.
        </Text>
      </View>

      <Text style={[styles.sectionHeader, { color: colors.bodyText, fontFamily: colors.bodyFontBold }]}>
        Submitted KYC Details
      </Text>
      
      <View style={styles.detailsList}>
        {Object.entries(currentApplicantForm).map(([key, value]) => (
          <View key={key} style={styles.detailRow}>
            <Text style={[styles.detailKey, { color: colors.bodyText, fontFamily: colors.bodyFont }]}>{key}</Text>
            <Text style={[styles.detailValue, { color: colors.text, fontFamily: colors.bodyFontBold }]}>{value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.buttonStack}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => router.replace('/')}
          activeOpacity={0.85}>
          <Text style={[styles.primaryButtonText, { fontFamily: colors.bodyFontBold }]}>Return to Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
          onPress={() => router.push('/officer-dashboard')}
          activeOpacity={0.85}>
          <Text style={[styles.secondaryButtonText, { color: colors.text, fontFamily: colors.bodyFontBold }]}>
            View Compliance Officer View
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  statusCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    marginBottom: 28,
  },
  iconWrapper: {
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 8,
  },
  statusSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionHeader: {
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  detailsList: {
    gap: 8,
    marginBottom: 36,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  detailKey: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
  },
  buttonStack: {
    gap: 12,
  },
  actionButton: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
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
