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
import { Search, AlertTriangle, Sprout } from 'lucide-react-native';
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
      app.id.includes(searchQuery);
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
      {/* Top Stat Cards Horizontal Scroll */}
      <View style={styles.statsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsScroll}>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statTitle, { color: colors.secondaryText }]}>Total Onboarded</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>1,245</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statTitle, { color: colors.secondaryText }]}>High Risk (EDD)</Text>
            <View style={styles.statValueRow}>
              <Text style={[styles.statValue, { color: colors.errorRed }]}>12</Text>
              <Text style={[styles.alertBadge, { color: colors.errorRed }]}>Critical</Text>
            </View>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statTitle, { color: colors.secondaryText }]}>AI Accuracy</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>98.4%</Text>
          </View>
        </ScrollView>
      </View>

      {/* Search Input */}
      <View style={styles.searchPadding}>
        <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Search size={18} color={colors.secondaryText} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search applicant name, ID..."
            placeholderTextColor={colors.secondaryText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter Chips Horizontal Bar */}
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
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.filterChipText,
                    { color: isSelected ? '#121212' : colors.text },
                  ]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Applicants List */}
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
              activeOpacity={0.8}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: isHighRisk ? `${colors.errorRed}20` : `${colors.primary}20` },
                ]}>
                {isHighRisk ? (
                  <AlertTriangle size={24} color={colors.errorRed} />
                ) : (
                  <Sprout size={24} color={colors.primary} />
                )}
              </View>

              <View style={styles.cardInfo}>
                <View style={styles.cardHeaderRow}>
                  <Text style={[styles.applicantName, { color: colors.text }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <View
                    style={[
                      styles.riskBadge,
                      { backgroundColor: isHighRisk ? `${colors.errorRed}20` : `${colors.secondaryText}20` },
                    ]}>
                    <Text
                      style={[
                        styles.riskBadgeText,
                        { color: isHighRisk ? colors.errorRed : colors.secondaryText },
                      ]}>
                      {isHighRisk ? 'HIGH RISK' : 'CLEARED'}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.cardSubtitle, { color: colors.secondaryText }]}>
                  {isHighRisk ? 'Income Variance Detected' : `${item.aiConfidence}% AI Confidence`}
                </Text>
              </View>

              <View style={styles.cardMeta}>
                <Text style={[styles.idText, { color: colors.secondaryText }]}>ID: {item.id}</Text>
                <Text style={[styles.reviewLink, { color: colors.text }]}>Review</Text>
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
    width: 130,
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
  },
  statTitle: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 4,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  alertBadge: {
    fontSize: 10,
    fontWeight: '700',
  },
  searchPadding: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchBox: {
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 8,
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
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
  },
  applicantCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
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
    fontWeight: '700',
  },
  riskBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  riskBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  cardSubtitle: {
    fontSize: 12,
    marginTop: 2,
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
    fontWeight: '700',
  },
});
