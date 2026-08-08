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
import { Search, Flame, Sprout, Inbox } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { RiskLevel } from '../types';
import { FadeInView } from '../components/AnimatedContainers';

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

  const getRiskColors = (riskLevel: RiskLevel) => {
    if (riskLevel === RiskLevel.HIGH) return { text: colors.riskHigh, surface: colors.riskHighSurface };
    if (riskLevel === RiskLevel.MEDIUM) return { text: colors.riskMedium, surface: colors.riskMediumSurface };
    return { text: colors.riskLow, surface: colors.riskLowSurface };
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Stats Banner */}
      <FadeInView delay={50} style={styles.statsContainer}>
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
              <Text style={[styles.statValue, { color: colors.riskHigh, fontFamily: colors.headlineFont }]}>
                12
              </Text>
              <Text style={[styles.alertBadge, { color: colors.riskHigh, fontFamily: colors.bodyFontBold }]}>
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
      </FadeInView>

      {/* Search Bar */}
      <FadeInView delay={100} style={styles.searchPadding}>
        <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Search size={18} color={colors.neutral} />
          <TextInput
            style={[styles.searchInput, { color: colors.text, fontFamily: colors.bodyFont }]}
            placeholder="Search applicant name, ID, or risk flag..."
            placeholderTextColor={colors.neutral}
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessibilityLabel="Search applicant name, ID, or risk flag"
          />
        </View>
      </FadeInView>

      {/* Filter Pills with 44px touch targets */}
      <FadeInView delay={150} style={styles.filterContainer}>
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
                activeOpacity={0.75}
                accessibilityLabel={`Filter by ${filter}`}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
              >
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
      </FadeInView>

      {/* Applicant List or Empty State */}
      {filteredApplicants.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Inbox size={48} color={colors.neutral} style={{ marginBottom: 12 }} />
          <Text style={[styles.emptyTitle, { color: colors.text, fontFamily: colors.headlineFont }]}>
            No Applicants Found
          </Text>
          <Text style={[styles.emptySub, { color: colors.bodyText, fontFamily: colors.bodyFont }]}>
            No applicants match your current search or risk filter criteria.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredApplicants}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const risk = getRiskColors(item.riskLevel);
            const riskLabel =
              item.riskLevel === RiskLevel.HIGH ? 'HIGH RISK' :
              item.riskLevel === RiskLevel.MEDIUM ? 'MEDIUM RISK' :
              item.status === 'Auto-Approved' ? 'AUTO-APPROVED' : 'LOW RISK';

            return (
              <TouchableOpacity
                style={[styles.applicantCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => router.push(`/edd-review/${item.id}`)}
                activeOpacity={0.85}
                accessibilityLabel={`Review applicant ${item.name}, ${riskLabel}`}
                accessibilityRole="button"
              >
                <View style={[styles.iconCircle, { backgroundColor: risk.surface }]}>
                  {item.riskLevel === RiskLevel.HIGH ? (
                    <Flame size={26} color={risk.text} />
                  ) : (
                    <Sprout size={26} color={risk.text} />
                  )}
                </View>

                <View style={styles.cardInfo}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={[styles.applicantName, { color: colors.text, fontFamily: colors.headlineFont }]} numberOfLines={1}>
                      {item.name}
                    </Text>

                    <View style={[styles.riskBadge, { backgroundColor: risk.surface }]}>
                      <Text style={[styles.riskBadgeText, { color: risk.text, fontFamily: colors.bodyFontBold }]}>
                        {riskLabel}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.cardSubtitle, { color: colors.bodyText, fontFamily: colors.bodyFont }]}>
                    {item.riskLevel === RiskLevel.HIGH
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
      )}
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
    paddingHorizontal: 18,
    minHeight: 44,
    justifyContent: 'center',
    borderRadius: 22,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 13,
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
