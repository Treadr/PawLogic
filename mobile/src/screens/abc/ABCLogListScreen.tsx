import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { colors } from '../../constants/colors';
import { fontSize, spacing, borderRadius } from '../../constants/typography';
import * as abcLogService from '../../services/abcLogs';
import type { ABCLog } from '../../types/abc-log';
import type { ABCLogSummary } from '../../services/abcLogs';
import type { RootStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'ABCLogList'>;

const SEVERITY_COLORS = ['', '#22C55E', '#84CC16', '#F59E0B', '#F97316', '#EF4444'];
const SEVERITY_LABELS = ['', '1', '2', '3', '4', '5'];

export default function ABCLogListScreen({ route, navigation }: Props) {
  const { petId, petName } = route.params;
  const [logs, setLogs] = useState<ABCLog[]>([]);
  const [summary, setSummary] = useState<ABCLogSummary | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<number | null>(null);

  const loadLogs = useCallback(async () => {
    try {
      const [data, summaryData] = await Promise.all([
        abcLogService.listABCLogs(petId),
        abcLogService.getABCLogSummary(petId),
      ]);
      setLogs(data);
      setSummary(summaryData);
    } catch (err) {
      console.error('Failed to load logs:', err);
    }
  }, [petId]);

  useEffect(() => {
    navigation.setOptions({ title: `${petName}'s History` });
  }, [petName, navigation]);

  useFocusEffect(
    useCallback(() => {
      loadLogs();
    }, [loadLogs]),
  );

  const filteredLogs = useMemo(() => {
    if (severityFilter === null) return logs;
    return logs.filter((l) => l.behavior_severity === severityFilter);
  }, [logs, severityFilter]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLogs();
    setRefreshing(false);
  };

  const humanize = (s: string) => s.replace(/_/g, ' ');

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderLog = ({ item }: { item: ABCLog }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ABCLogDetail', { logId: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.date}>{formatDate(item.occurred_at)}</Text>
        <View
          style={[
            styles.severityBadge,
            { backgroundColor: SEVERITY_COLORS[item.behavior_severity] },
          ]}
        >
          <Text style={styles.severityText}>{item.behavior_severity}</Text>
        </View>
      </View>

      <View style={styles.abcRow}>
        <View style={styles.abcItem}>
          <Text style={styles.abcLabel}>A</Text>
          <Text style={styles.abcValue}>{humanize(item.antecedent_category)}</Text>
          <Text style={styles.abcTags}>
            {item.antecedent_tags.map(humanize).join(', ')}
          </Text>
        </View>
        <View style={styles.arrow}>
          <Text style={styles.arrowText}>&rarr;</Text>
        </View>
        <View style={styles.abcItem}>
          <Text style={styles.abcLabel}>B</Text>
          <Text style={styles.abcValue}>{humanize(item.behavior_category)}</Text>
          <Text style={styles.abcTags}>
            {item.behavior_tags.map(humanize).join(', ')}
          </Text>
        </View>
        <View style={styles.arrow}>
          <Text style={styles.arrowText}>&rarr;</Text>
        </View>
        <View style={styles.abcItem}>
          <Text style={styles.abcLabel}>C</Text>
          <Text style={styles.abcValue}>{humanize(item.consequence_category)}</Text>
          <Text style={styles.abcTags}>
            {item.consequence_tags.map(humanize).join(', ')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Severity Filter */}
      {logs.length > 0 && (
        <View style={styles.filterBar}>
          <TouchableOpacity
            style={[styles.filterChip, severityFilter === null && styles.filterChipActive]}
            onPress={() => setSeverityFilter(null)}
          >
            <Text
              style={[
                styles.filterChipText,
                severityFilter === null && styles.filterChipTextActive,
              ]}
            >
              All ({logs.length})
            </Text>
          </TouchableOpacity>
          {[1, 2, 3, 4, 5].map((sev) => {
            const count = logs.filter((l) => l.behavior_severity === sev).length;
            if (count === 0) return null;
            return (
              <TouchableOpacity
                key={sev}
                style={[
                  styles.filterChip,
                  severityFilter === sev && {
                    backgroundColor: SEVERITY_COLORS[sev],
                    borderColor: SEVERITY_COLORS[sev],
                  },
                ]}
                onPress={() =>
                  setSeverityFilter(severityFilter === sev ? null : sev)
                }
              >
                <Text
                  style={[
                    styles.filterChipText,
                    severityFilter === sev && styles.filterChipTextActive,
                  ]}
                >
                  {SEVERITY_LABELS[sev]} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <FlatList
        data={filteredLogs}
        keyExtractor={(l) => l.id}
        renderItem={renderLog}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          summary && summary.total_logs > 0 ? (
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryStat}>
                  <Text style={styles.summaryValue}>{summary.total_logs}</Text>
                  <Text style={styles.summaryLabel}>Total</Text>
                </View>
                <View style={styles.summaryStat}>
                  <Text style={styles.summaryValue}>
                    {summary.severity_avg?.toFixed(1) || '--'}
                  </Text>
                  <Text style={styles.summaryLabel}>Avg Severity</Text>
                </View>
                {summary.top_behaviors.length > 0 && (
                  <View style={styles.summaryStat}>
                    <Text style={styles.summaryValue} numberOfLines={1}>
                      {summary.top_behaviors[0].category.replace(/_/g, ' ')}
                    </Text>
                    <Text style={styles.summaryLabel}>Top Behavior</Text>
                  </View>
                )}
              </View>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {severityFilter !== null
                ? `No logs with severity ${severityFilter}.`
                : `No behavior logs yet for ${petName}.`}
            </Text>
          </View>
        }
        contentContainerStyle={
          filteredLogs.length === 0 ? styles.emptyContainer : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    backgroundColor: colors.surface,
  },
  filterChipActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  filterChipText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.neutral[600],
  },
  filterChipTextActive: {
    color: '#fff',
  },
  summaryCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryStat: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.primary[600],
  },
  summaryLabel: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
    marginTop: 2,
  },
  card: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  date: { fontSize: fontSize.sm, color: colors.neutral[500] },
  severityBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  severityText: { color: '#fff', fontSize: fontSize.xs, fontWeight: '700' },
  abcRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  abcItem: { flex: 1 },
  abcLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primary[500],
    marginBottom: 2,
  },
  abcValue: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.neutral[800],
  },
  abcTags: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
    marginTop: 2,
  },
  arrow: { paddingHorizontal: spacing.xs, paddingTop: spacing.lg },
  arrowText: { color: colors.neutral[400], fontSize: fontSize.base },
  empty: { alignItems: 'center', padding: spacing['3xl'] },
  emptyContainer: { flex: 1, justifyContent: 'center' },
  emptyText: { fontSize: fontSize.base, color: colors.neutral[400] },
});
