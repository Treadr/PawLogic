import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  VictoryBar,
  VictoryChart,
  VictoryAxis,
  VictoryLine,
  VictoryScatter,
} from 'victory-native';
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
import { formatCategory, severityColor } from '../../utils/chartUtils';

type Props = NativeStackScreenProps<RootStackParamList, 'Progress'>;

type TimeRange = 7 | 14 | 30 | 90;

const SCREEN_WIDTH = Dimensions.get('window').width;
// account for ScrollView padding (lg*2) + card padding (lg*2)
const CHART_WIDTH = SCREEN_WIDTH - spacing.lg * 4;

const AXIS_STYLE = {
  tickLabels: { fontSize: 9, fill: colors.neutral[500] },
  axis: { stroke: colors.neutral[200] },
  grid: { stroke: colors.neutral[100] },
};

const X_AXIS_STYLE = {
  tickLabels: { fontSize: 9, angle: -40, textAnchor: 'end' as const, fill: colors.neutral[500] },
  axis: { stroke: colors.neutral[200] },
  grid: { stroke: 'transparent' },
};

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

  const freqChartData =
    frequency?.data.map((d) => ({
      x: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      y: d.count,
    })) ?? [];

  const sevAvgData =
    severity?.data.map((d) => ({
      x: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      y: d.avg_severity,
      color: severityColor(d.avg_severity),
    })) ?? [];

  const sevMaxData =
    severity?.data.map((d) => ({
      x: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      y: d.max_severity,
    })) ?? [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Time Range Selector */}
      <View style={styles.timeSelector}>
        {timeRanges.map((tr) => (
          <TouchableOpacity
            key={tr.value}
            style={[styles.timeChip, days === tr.value && styles.timeChipActive]}
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

      {/* Behavior Frequency — Victory Bar Chart */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Behavior Frequency</Text>
        {freqChartData.length > 0 ? (
          <VictoryChart
            width={CHART_WIDTH}
            height={220}
            domainPadding={{ x: 20 }}
            padding={{ top: 10, bottom: 55, left: 32, right: 10 }}
          >
            <VictoryAxis tickFormat={(t) => t} style={X_AXIS_STYLE} />
            <VictoryAxis
              dependentAxis
              tickFormat={(t: number) => Math.round(t)}
              style={AXIS_STYLE}
            />
            <VictoryBar
              data={freqChartData}
              style={{ data: { fill: colors.primary[400] } }}
            />
          </VictoryChart>
        ) : (
          <Text style={styles.emptyText}>No data for this period.</Text>
        )}
      </View>

      {/* Severity Trend — Victory Line + Scatter */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Severity Trend</Text>
        {sevAvgData.length > 0 ? (
          <>
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.primary[400] }]} />
                <Text style={styles.legendLabel}>Average</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.accent[500] }]} />
                <Text style={styles.legendLabel}>Maximum</Text>
              </View>
            </View>
            <VictoryChart
              width={CHART_WIDTH}
              height={220}
              domain={{ y: [0, 5] }}
              padding={{ top: 10, bottom: 55, left: 32, right: 10 }}
            >
              <VictoryAxis tickFormat={(t) => t} style={X_AXIS_STYLE} />
              <VictoryAxis
                dependentAxis
                tickValues={[1, 2, 3, 4, 5]}
                style={AXIS_STYLE}
              />
              <VictoryLine
                data={sevAvgData}
                style={{ data: { stroke: colors.primary[400], strokeWidth: 2 } }}
                interpolation="monotoneX"
              />
              <VictoryScatter
                data={sevAvgData}
                size={4}
                style={{ data: { fill: colors.primary[400] } }}
              />
              <VictoryLine
                data={sevMaxData}
                style={{
                  data: {
                    stroke: colors.accent[500],
                    strokeWidth: 2,
                    strokeDasharray: '6,4',
                  },
                }}
                interpolation="monotoneX"
              />
              <VictoryScatter
                data={sevMaxData}
                size={4}
                style={{ data: { fill: colors.accent[500] } }}
              />
            </VictoryChart>
          </>
        ) : (
          <Text style={styles.emptyText}>No data for this period.</Text>
        )}
      </View>

      {/* Top Behaviors — horizontal bars */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Top Behaviors</Text>
        {categories && categories.behaviors.length > 0 ? (
          categories.behaviors.slice(0, 5).map((b) => {
            const maxCount = Math.max(...categories.behaviors.map((x) => x.count));
            return (
              <View key={b.category} style={styles.categoryRow}>
                <Text style={styles.categoryName}>{formatCategory(b.category)}</Text>
                <View style={styles.categoryBar}>
                  <View
                    style={[
                      styles.categoryFill,
                      { width: `${(b.count / maxCount) * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.categoryCount}>{b.count}</Text>
              </View>
            );
          })
        ) : (
          <Text style={styles.emptyText}>No data for this period.</Text>
        )}
      </View>

      {/* Top Triggers — horizontal bars */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Top Triggers</Text>
        {categories && categories.antecedents.length > 0 ? (
          categories.antecedents.slice(0, 5).map((a) => {
            const maxCount = Math.max(...categories.antecedents.map((x) => x.count));
            return (
              <View key={a.category} style={styles.categoryRow}>
                <Text style={styles.categoryName}>{formatCategory(a.category)}</Text>
                <View style={styles.categoryBar}>
                  <View
                    style={[
                      styles.categoryFill,
                      {
                        width: `${(a.count / maxCount) * 100}%`,
                        backgroundColor: colors.accent[400],
                      },
                    ]}
                  />
                </View>
                <Text style={styles.categoryCount}>{a.count}</Text>
              </View>
            );
          })
        ) : (
          <Text style={styles.emptyText}>No data for this period.</Text>
        )}
      </View>
    </ScrollView>
  );
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
  timeChipActive: { backgroundColor: colors.primary[500] },
  timeChipText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.neutral[600],
  },
  timeChipTextActive: { color: '#fff' },
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
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.neutral[400],
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  legend: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
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
