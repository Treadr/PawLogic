import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { colors } from '../../constants/colors';
import { fontSize, spacing, borderRadius } from '../../constants/typography';
import * as abcLogService from '../../services/abcLogs';
import type { ABCLog } from '../../types/abc-log';
import type { RootStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'ABCLogList'>;

const SEVERITY_COLORS = ['', '#22C55E', '#84CC16', '#F59E0B', '#F97316', '#EF4444'];

export default function ABCLogListScreen({ route }: Props) {
  const { petId, petName } = route.params;
  const [logs, setLogs] = useState<ABCLog[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadLogs = useCallback(async () => {
    try {
      const data = await abcLogService.listABCLogs(petId);
      setLogs(data);
    } catch (err) {
      console.error('Failed to load logs:', err);
    }
  }, [petId]);

  useFocusEffect(
    useCallback(() => {
      loadLogs();
    }, [loadLogs]),
  );

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
    <View style={styles.card}>
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
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={logs}
        keyExtractor={(l) => l.id}
        renderItem={renderLog}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              No behavior logs yet for {petName}.
            </Text>
          </View>
        }
        contentContainerStyle={logs.length === 0 ? styles.emptyContainer : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
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
