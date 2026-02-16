import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { colors } from '../../constants/colors';
import { fontSize, spacing, borderRadius } from '../../constants/typography';
import * as progressService from '../../services/progress';
import type {
  FrequencyData,
  SeverityTrendData,
  CategoryBreakdown,
} from '../../services/progress';

type Props = NativeStackScreenProps<RootStackParamList, 'Progress'>;

type TimeRange = 7 | 14 | 30 | 90;

export default function ProgressScreen({ route }: Props) {
  const { petId } = route.params;
  const [days, setDays] = useState<TimeRange>(30);
  const [frequency, setFrequency] = useState<FrequencyData | null>(null);
  const [severity, setSeverity] = useState<SeverityTrendData | null>(null);
  const [categories, setCategories] = useState<CategoryBreakdown | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [freqData, sevData, catData] = await Promise.all([
        progressService.getBehaviorFrequency(petId, days),
        progressService.getSeverityTrend(petId, days),
        progressService.getCategoryBreakdown(petId, days),
      ]);
      setFrequency(freqData);
      setSeverity(sevData);
      setCategories(catData);
    } catch (err) {
      console.error('Failed to load progress data:', err);
    } finally {
      setLoading(false);
    }
  }, [petId, days]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  const timeRanges: { label: string; value: TimeRange }[] = [
    { label: '7d', value: 7 },
    { label: '14d', value: 14 },
    { label: '30d', value: 30 },
    { label: '90d', value: 90 },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Time Range Selector */}
      <View style={styles.timeSelector}>
        {timeRanges.map((tr) => (
          <TouchableOpacity
            key={tr.value}
            style={[
              styles.timeChip,
              days === tr.value && styles.timeChipActive,
            ]}
            onPress={() => setDays(tr.value)}
          >
            <Text
              style={[
                styles.timeChipText,
                days === tr.value && styles.timeChipTextActive,
              ]}
            >
              {tr.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Behavior Frequency */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Behavior Frequency</Text>
        {frequency && frequency.data.length > 0 ? (
          <View style={styles.barChart}>
            {frequency.data.map((d) => {
              const maxCount = Math.max(...frequency.data.map((x) => x.count));
              const barWidth = maxCount > 0 ? (d.count / maxCount) * 100 : 0;
              return (
                <View key={d.date} style={styles.barRow}>
                  <Text style={styles.barLabel}>
                    {new Date(d.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[styles.barFill, { width: `${barWidth}%` }]}
                    />
                  </View>
                  <Text style={styles.barValue}>{d.count}</Text>
                </View>
              );
            })}
          </View>
        ) : (
          <Text style={styles.emptyText}>No data for this period.</Text>
        )}
      </View>

      {/* Severity Trend */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Severity Trend</Text>
        {severity && severity.data.length > 0 ? (
          <View>
            {severity.data.map((d) => (
              <View key={d.date} style={styles.severityRow}>
                <Text style={styles.barLabel}>
                  {new Date(d.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
                <View style={styles.severityDots}>
                  {[1, 2, 3, 4, 5].map((level) => (
                    <View
                      key={level}
                      style={[
                        styles.severityDot,
                        level <= Math.round(d.avg_severity) &&
                          styles.severityDotFilled,
                        level <= Math.round(d.avg_severity) && {
                          backgroundColor: severityColor(d.avg_severity),
                        },
                      ]}
                    />
                  ))}
                </View>
                <Text style={styles.barValue}>{d.avg_severity}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No data for this period.</Text>
        )}
      </View>

      {/* Category Breakdown */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Top Behaviors</Text>
        {categories && categories.behaviors.length > 0 ? (
          categories.behaviors.slice(0, 5).map((b) => (
            <View key={b.category} style={styles.categoryRow}>
              <Text style={styles.categoryName}>
                {formatCategory(b.category)}
              </Text>
              <View style={styles.categoryBar}>
                <View
                  style={[
                    styles.categoryFill,
                    {
                      width: `${
                        (b.count /
                          Math.max(...categories.behaviors.map((x) => x.count))) *
                        100
                      }%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.categoryCount}>{b.count}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No data for this period.</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Top Triggers</Text>
        {categories && categories.antecedents.length > 0 ? (
          categories.antecedents.slice(0, 5).map((a) => (
            <View key={a.category} style={styles.categoryRow}>
              <Text style={styles.categoryName}>
                {formatCategory(a.category)}
              </Text>
              <View style={styles.categoryBar}>
                <View
                  style={[
                    styles.categoryFill,
                    {
                      width: `${
                        (a.count /
                          Math.max(
                            ...categories.antecedents.map((x) => x.count),
                          )) *
                        100
                      }%`,
                      backgroundColor: colors.accent[400],
                    },
                  ]}
                />
              </View>
              <Text style={styles.categoryCount}>{a.count}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No data for this period.</Text>
        )}
      </View>
    </ScrollView>
  );
}

function formatCategory(slug: string): string {
  return slug
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function severityColor(avg: number): string {
  if (avg <= 1.5) return colors.success;
  if (avg <= 2.5) return '#84CC16';
  if (avg <= 3.5) return colors.warning;
  if (avg <= 4.5) return '#F97316';
  return colors.error;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  timeSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    justifyContent: 'center',
  },
  timeChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[100],
  },
  timeChipActive: {
    backgroundColor: colors.primary[500],
  },
  timeChipText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.neutral[600],
  },
  timeChipTextActive: {
    color: '#fff',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.neutral[800],
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.neutral[400],
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  barChart: { gap: spacing.sm },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  barLabel: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
    width: 48,
  },
  barTrack: {
    flex: 1,
    height: 16,
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.primary[400],
    borderRadius: borderRadius.sm,
  },
  barValue: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.neutral[700],
    width: 24,
    textAlign: 'right',
  },
  severityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  severityDots: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
  },
  severityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.neutral[200],
  },
  severityDotFilled: {
    backgroundColor: colors.warning,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  categoryName: {
    fontSize: fontSize.xs,
    color: colors.neutral[600],
    width: 90,
  },
  categoryBar: {
    flex: 1,
    height: 12,
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  categoryFill: {
    height: '100%',
    backgroundColor: colors.primary[400],
    borderRadius: borderRadius.sm,
  },
  categoryCount: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.neutral[700],
    width: 24,
    textAlign: 'right',
  },
});
