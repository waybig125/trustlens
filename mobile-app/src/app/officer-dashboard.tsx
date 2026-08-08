import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search, Flame, Sprout } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { Applicant, RiskLevel } from '../types';

export default function OfficerDashboardScreen() {
  const router = useRouter();
  const { colors, applicants } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  const filters = ['All', 'Low Risk (Thriving)', 'Medium Risk', 'High Risk (EDD Queue)'];

  const filteredApplicants = applicants.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.id.includes(searchQuery) ||
      app.riskLevel.toLowerCase().includes(searchQuery.toLowerCase());
    let matchesFilter = true;
    if (selectedFilter === 'Low Risk (Thriving)') {
      matchesFilter = app.riskLevel === RiskLevel.LOW;
    } else if (selectedFilter === 'Medium Risk') {
      matchesFilter = app.riskLevel === RiskLevel.MEDIUM;
    } else if (selectedFilter === 'High Risk (EDD Queue)') {
      matchesFilter = app.riskLevel === RiskLevel.HIGH;
    }
    return matchesSearch && matchesFilter;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Stats Banner */}
      <View style={styles.statsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsScroll}>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statTitle, { color: colors.bodyText, fontFamily: colors.bodyFont }]}>
              Total Onboarded
            </Text>
            <Text style={[styles.statValue, { color: colors.text, fontFamily: colors.headlineFont }]}>
              1,245
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statTitle, { color: colors.bodyText, fontFamily: colors.bodyFont }]}>
              Flagged for EDD
            </Text>
            <View style={styles.statValueRow}>
              <Text style={[styles.statValue, { color: colors.softCoral, fontFamily: colors.headlineFont }]}>
                12
              </Text>
              <Text style={[styles.alertBadge, { color: colors.softCoral, fontFamily: colors.bodyFontBold }]}>
                High Risk
              </Text>
            </View>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statTitle, { color: colors.bodyText, fontFamily: colors.bodyFont }]}>
              AI Approval Rate
            </Text>
            <Text style={[styles.statValue, { color: colors.text, fontFamily: colors.headlineFont }]}>
              98.4%
            </Text>
          </View>
        </ScrollView>
      </View>

      {/* Search Bar */}
      <View style={styles.searchPadding}>
        <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Search size={18} color={colors.neutral} />
          <TextInput
            style={[styles.searchInput, { color: colors.text, fontFamily: colors.bodyFont }]}
            placeholder="Search applicant name, ID, or risk flag..."
            placeholderTextColor={colors.neutral}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter Pills */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {filters.map((filter) => {
            const isSelected = selectedFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedFilter(filter)}
                activeOpacity={0.75}>
                <Text
                  style={[
                    styles.filterChipText,
                    {
                      color: isSelected ? '#121212' : colors.text,
                      fontFamily: isSelected ? colors.bodyFontBold : colors.bodyFont,
                    },
                  ]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Crypto-Wallet Token List Style Cards */}
      <FlatList
        data={filteredApplicants}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isHighRisk = item.riskLevel === RiskLevel.HIGH;
          return (
            <TouchableOpacity
              style={[styles.applicantCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => router.push(`/edd-review/${item.id}`)}
              activeOpacity={0.85}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: isHighRisk ? `${colors.softCoral}20` : `${colors.leafGreen}20` },
                ]}>
                {isHighRisk ? (
                  <Flame size={26} color={colors.softCoral} />
                ) : (
                  <Sprout size={26} color={colors.leafGreen} />
                )}
              </View>

              <View style={styles.cardInfo}>
                <View style={styles.cardHeaderRow}>
                  <Text style={[styles.applicantName, { color: colors.text, fontFamily: colors.headlineFont }]} numberOfLines={1}>
                    {item.name}
                  </Text>

                  <View
                    style={[
                      styles.riskBadge,
                      { backgroundColor: isHighRisk ? `${colors.softCoral}25` : `${colors.leafGreen}25` },
                    ]}>
                    <Text
                      style={[
                        styles.riskBadgeText,
                        { color: isHighRisk ? colors.softCoral : colors.leafGreen, fontFamily: colors.bodyFontBold },
                      ]}>
                      {isHighRisk ? 'HIGH RISK' : item.status === 'Auto-Approved' ? 'AUTO-APPROVED' : 'LOW RISK'}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.cardSubtitle, { color: colors.bodyText, fontFamily: colors.bodyFont }]}>
                  {isHighRisk
                    ? 'Income vs Transaction Intent Mismatch'
                    : `${item.aiConfidence}% AI Confidence`}
                </Text>
              </View>

              <View style={styles.cardMeta}>
                <Text style={[styles.idText, { color: colors.neutral, fontFamily: colors.bodyFont }]}>
                  ID: {item.id}
                </Text>
                <Text style={[styles.reviewLink, { color: colors.text, fontFamily: colors.bodyFontBold }]}>
                  Review
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsContainer: {
    paddingVertical: 12,
  },
  statsScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    width: 140,
    borderRadius: 24,
    borderWidth: 1,
    padding: 14,
  },
  statTitle: {
    fontSize: 11,
    marginBottom: 4,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  statValue: {
    fontSize: 22,
  },
  alertBadge: {
    fontSize: 10,
  },
  searchPadding: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchBox: {
    height: 50,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  filterContainer: {
    marginBottom: 12,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
  },
  applicantCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardInfo: {
    flex: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: 8,
  },
  applicantName: {
    fontSize: 16,
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  riskBadgeText: {
    fontSize: 9,
    letterSpacing: 0.5,
  },
  cardSubtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  cardMeta: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 40,
  },
  idText: {
    fontSize: 10,
  },
  reviewLink: {
    fontSize: 12,
  },
});
