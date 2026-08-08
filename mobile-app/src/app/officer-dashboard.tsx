import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Search, Flame, Sprout, Users, TrendingUp } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { RiskLevel, riskLabel } from '../types';

export default function OfficerDashboardScreen() {
  const router = useRouter();
  const { colors, applicants, error, loadApplications, loadDashboard, loadQueue } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [stats, setStats] = useState<{
    total: number;
    eddQueue: number;
    highRisk: number;
    resolved: number;
  } | null>(null);
  const [queue, setQueue] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await loadApplications();
    const [d, q] = await Promise.all([loadDashboard(), loadQueue()]);
    if (d) {
      setStats({
        total: d.total_applications,
        eddQueue: d.edd_queue_open,
        highRisk: d.risk_distribution?.high ?? 0,
        resolved: d.before_after_review?.resolved_after_review ?? 0,
      });
    }
    setQueue(q);
    setRefreshing(false);
  }, [loadApplications, loadDashboard, loadQueue]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

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
      <View style={styles.statsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsScroll}>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statTitle, { color: colors.bodyText, fontFamily: colors.bodyFont }]}>
              Total Onboarded
            </Text>
            <View style={styles.statValueRow}>
              <Text style={[styles.statValue, { color: colors.text, fontFamily: colors.headlineFont }]}>
                {stats ? stats.total : '—'}
              </Text>
              <Users size={14} color={colors.primary} />
            </View>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statTitle, { color: colors.bodyText, fontFamily: colors.bodyFont }]}>
              Flagged for EDD
            </Text>
            <View style={styles.statValueRow}>
              <Text style={[styles.statValue, { color: colors.riskHigh, fontFamily: colors.headlineFont }]}>
                {stats ? stats.eddQueue : '—'}
              </Text>
              <Text style={[styles.alertBadge, { color: colors.riskHigh, fontFamily: colors.bodyFontBold }]}>
                {stats ? `${stats.highRisk} High Risk` : 'High Risk'}
              </Text>
            </View>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statTitle, { color: colors.bodyText, fontFamily: colors.bodyFont }]}>
              Resolved by Review
            </Text>
            <View style={styles.statValueRow}>
              <Text style={[styles.statValue, { color: colors.text, fontFamily: colors.headlineFont }]}>
                {stats ? stats.resolved : '—'}
              </Text>
              <TrendingUp size={14} color={colors.riskLow} />
            </View>
          </View>
        </ScrollView>
      </View>

      {/* EDD Queue Preview */}
      {queue && queue.length > 0 && (
        <TouchableOpacity
          style={[styles.queueBanner, { backgroundColor: colors.riskHighSurface, borderColor: `${colors.riskHigh}40` }]}
          onPress={() => router.push(`/edd-review/${queue[0].application_id}`)}
          activeOpacity={0.85}
          accessibilityRole="button"
        >
          <Flame size={18} color={colors.riskHigh} />
          <Text style={[styles.queueBannerText, { color: colors.riskHigh, fontFamily: colors.bodyFontBold }]}>
            {queue.length} case{queue.length > 1 ? 's' : ''} pending review — tap to start
          </Text>
        </TouchableOpacity>
      )}

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

      {/* Errors */}
      {error && (
        <View style={styles.errorRow}>
          <Text style={[styles.errorText, { color: colors.errorRed, fontFamily: colors.bodyFont }]}>
            {error}
          </Text>
          <TouchableOpacity onPress={refresh} activeOpacity={0.7}>
            <Text style={{ color: colors.primary, fontSize: 18, fontFamily: colors.bodyFontBold }}>↻</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Loading / List */}
      {refreshing && applicants.length === 0 ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredApplicants}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: colors.bodyText, fontFamily: colors.bodyFont }]}>
              No applicants found.
            </Text>
          }
          renderItem={({ item }) => {
            const risk = getRiskColors(item.riskLevel);
            const label = riskLabel(item.riskLevel.toLowerCase() as 'low' | 'medium' | 'high');
            return (
              <TouchableOpacity
                style={[styles.applicantCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => router.push(`/edd-review/${item.id}`)}
                activeOpacity={0.85}>
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
                        {label}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.cardSubtitle, { color: colors.bodyText, fontFamily: colors.bodyFont }]}>
                    {item.riskLevel === RiskLevel.HIGH
                      ? 'Under enhanced due diligence'
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
  container: { flex: 1 },
  statsContainer: { paddingVertical: 12 },
  statsScroll: { paddingHorizontal: 20, gap: 12 },
  statCard: { width: 150, borderRadius: 24, borderWidth: 1, padding: 14 },
  statTitle: { fontSize: 11, marginBottom: 4 },
  statValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  statValue: { fontSize: 22 },
  alertBadge: { fontSize: 10 },
  queueBanner: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  queueBannerText: { fontSize: 13, flex: 1 },
  searchPadding: { paddingHorizontal: 20, marginBottom: 12 },
  searchBox: {
    height: 50,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 14 },
  filterContainer: { marginBottom: 12 },
  filterScroll: { paddingHorizontal: 20, gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  filterChipText: { fontSize: 12 },
  listContent: { paddingHorizontal: 20, paddingBottom: 24, gap: 12 },
  applicantCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  cardInfo: { flex: 1 },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginRight: 8 },
  applicantName: { fontSize: 16 },
  riskBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  riskBadgeText: { fontSize: 9, letterSpacing: 0.5 },
  cardSubtitle: { fontSize: 12, marginTop: 4 },
  cardMeta: { alignItems: 'flex-end', justifyContent: 'space-between', height: 40 },
  idText: { fontSize: 10 },
  reviewLink: { fontSize: 12 },
  errorRow: { paddingHorizontal: 20, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
  errorText: { flex: 1, fontSize: 12 },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { textAlign: 'center', marginTop: 32 },
});