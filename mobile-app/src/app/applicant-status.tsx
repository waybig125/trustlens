import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Hourglass } from 'lucide-react-native';
import { useApp } from '../context/AppContext';

export default function ApplicantStatusScreen() {
  const router = useRouter();
  const { colors, applicantStatus, currentApplicantForm } = useApp();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.text }]}>Application Status</Text>

      <View style={[styles.statusCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.iconWrapper}>
          <Hourglass size={56} color={colors.secondaryText} />
        </View>
        <Text style={[styles.statusTitle, { color: colors.text }]}>
          {applicantStatus || 'Application Under AI Review'}
        </Text>
        <Text style={[styles.statusSubtitle, { color: colors.secondaryText }]}>
          Your Trust Plant is growing while we review your details.
        </Text>
      </View>

      <Text style={[styles.sectionHeader, { color: colors.secondaryText }]}>Submitted Details</Text>
      <View style={styles.detailsList}>
        {Object.entries(currentApplicantForm).map(([key, value]) => (
          <View key={key} style={styles.detailRow}>
            <Text style={[styles.detailKey, { color: colors.secondaryText }]}>{key}</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{value}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.homeButton, { backgroundColor: colors.primary }]}
        onPress={() => router.replace('/')}
        activeOpacity={0.8}>
        <Text style={styles.homeButtonText}>Return to Home</Text>
      </TouchableOpacity>
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
    fontWeight: '800',
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
    fontSize: 18,
    fontWeight: '700',
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
    fontWeight: '700',
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
    fontWeight: '600',
  },
  homeButton: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeButtonText: {
    color: '#121212',
    fontSize: 16,
    fontWeight: '700',
  },
});
