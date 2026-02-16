import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { colors } from '../../constants/colors';
import { fontSize, spacing, borderRadius } from '../../constants/typography';
import * as insightService from '../../services/insights';
import * as analysisService from '../../services/analysis';
import type { Insight } from '../../types/insight';
import type { RootStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Insights'>;

const TYPE_COLORS: Record<string, string> = {
  pattern: colors.primary[500],
  function: colors.accent[500],
  correlation: colors.info,
  recommendation: colors.success,
};

const TYPE_LABELS: Record<string, string> = {
  pattern: 'Pattern',
  function: 'Function',
  correlation: 'Correlation',
  recommendation: 'Tip',
};

export default function InsightsScreen({ route }: Props) {
  const { petId, petName } = route.params;
  const [insights, setInsights] = useState<Insight[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [detecting, setDetecting] = useState(false);

  const loadInsights = useCallback(async () => {
    try {
      const data = await insightService.listInsights(petId);
      setInsights(data);
    } catch (err) {
      console.error('Failed to load insights:', err);
    }
  }, [petId]);

  useFocusEffect(
    useCallback(() => {
      loadInsights();
    }, [loadInsights]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInsights();
    setRefreshing(false);
  };

  const runDetection = async () => {
    setDetecting(true);
    try {
      const result = await analysisService.detectPatterns(petId);
      Alert.alert(
        'Analysis Complete',
        `Found ${result.patterns_found} pattern(s).`,
      );
      await loadInsights();
    } catch (err) {
      Alert.alert('Analysis', String(err));
    } finally {
      setDetecting(false);
    }
  };

  const markRead = async (insightId: string) => {
    try {
      await insightService.markInsightRead(insightId);
      setInsights((prev) =>
        prev.map((i) => (i.id === insightId ? { ...i, is_read: true } : i)),
      );
    } catch {
      // silent fail
    }
  };

  const renderInsight = ({ item }: { item: Insight }) => (
    <TouchableOpacity
      style={[styles.card, !item.is_read && styles.cardUnread]}
      onPress={() => markRead(item.id)}
    >
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.typeBadge,
            { backgroundColor: TYPE_COLORS[item.insight_type] || colors.neutral[400] },
          ]}
        >
          <Text style={styles.typeBadgeText}>
            {TYPE_LABELS[item.insight_type] || item.insight_type}
          </Text>
        </View>
        {item.confidence != null && (
          <Text style={styles.confidence}>
            {Math.round(Number(item.confidence) * 100)}% confidence
          </Text>
        )}
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.body}>{item.body}</Text>
      {item.behavior_function && (
        <View style={styles.functionTag}>
          <Text style={styles.functionText}>
            Function: {item.behavior_function}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.detectBtn, detecting && styles.detectBtnDisabled]}
        onPress={runDetection}
        disabled={detecting}
      >
        <Text style={styles.detectBtnText}>
          {detecting ? 'Analyzing...' : 'Run Pattern Detection'}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={insights}
        keyExtractor={(i) => i.id}
        renderItem={renderInsight}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No insights yet</Text>
            <Text style={styles.emptyText}>
              Log at least 10 behaviors for {petName} to unlock pattern detection.
            </Text>
          </View>
        }
        contentContainerStyle={
          insights.length === 0 ? styles.emptyContainer : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  detectBtn: {
    backgroundColor: colors.accent[500],
    margin: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  detectBtnDisabled: { opacity: 0.6 },
  detectBtnText: { color: '#fff', fontSize: fontSize.base, fontWeight: '600' },
  card: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.neutral[200],
  },
  cardUnread: {
    borderLeftColor: colors.primary[500],
    backgroundColor: colors.surfaceAlt,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  typeBadge: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  typeBadgeText: { color: '#fff', fontSize: fontSize.xs, fontWeight: '600' },
  confidence: { fontSize: fontSize.xs, color: colors.neutral[400] },
  title: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.neutral[800],
    marginBottom: spacing.xs,
  },
  body: { fontSize: fontSize.sm, color: colors.neutral[600], lineHeight: 20 },
  functionTag: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.accent[50],
    borderWidth: 1,
    borderColor: colors.accent[200],
  },
  functionText: { fontSize: fontSize.xs, color: colors.accent[700] },
  empty: { alignItems: 'center', padding: spacing['3xl'] },
  emptyContainer: { flex: 1, justifyContent: 'center' },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.neutral[700],
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.base,
    color: colors.neutral[400],
    textAlign: 'center',
  },
});
