import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { colors } from '../../constants/colors';
import { fontSize, spacing, borderRadius } from '../../constants/typography';
import * as abcLogService from '../../services/abcLogs';
import type { ABCLog } from '../../types/abc-log';
import type { RootStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'ABCLogDetail'>;

const SEVERITY_COLORS = ['', '#22C55E', '#84CC16', '#F59E0B', '#F97316', '#EF4444'];
const SEVERITY_LABELS = ['', 'Mild', 'Low', 'Moderate', 'High', 'Severe'];

const humanize = (s: string) =>
  s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function ABCLogDetailScreen({ route, navigation }: Props) {
  const { logId } = route.params;
  const [log, setLog] = useState<ABCLog | null>(null);
  const [loading, setLoading] = useState(true);

  const loadLog = useCallback(async () => {
    try {
      const data = await abcLogService.getABCLog(logId);
      setLog(data);
    } catch (err) {
      Alert.alert('Error', String(err));
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [logId, navigation]);

  useEffect(() => {
    loadLog();
  }, [loadLog]);

  const handleDelete = () => {
    Alert.alert(
      'Delete Log',
      'Are you sure you want to delete this behavior log?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await abcLogService.deleteABCLog(logId);
              navigation.goBack();
            } catch (err) {
              Alert.alert('Error', String(err));
            }
          },
        },
      ],
    );
  };

  if (loading || !log) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.date}>{formatDate(log.occurred_at)}</Text>
        <View
          style={[
            styles.severityBadge,
            { backgroundColor: SEVERITY_COLORS[log.behavior_severity] },
          ]}
        >
          <Text style={styles.severityText}>
            {SEVERITY_LABELS[log.behavior_severity]}
          </Text>
        </View>
      </View>

      {log.location && (
        <Text style={styles.location}>Location: {log.location}</Text>
      )}
      {log.duration_seconds != null && log.duration_seconds > 0 && (
        <Text style={styles.location}>
          Duration: {log.duration_seconds < 60
            ? `${log.duration_seconds}s`
            : `${Math.round(log.duration_seconds / 60)}m`}
        </Text>
      )}

      {/* Antecedent */}
      <View style={[styles.section, styles.sectionA]}>
        <Text style={styles.sectionLabel}>A - Antecedent</Text>
        <Text style={styles.sectionSubtitle}>What happened before?</Text>
        <Text style={styles.categoryValue}>{humanize(log.antecedent_category)}</Text>
        {log.antecedent_tags.length > 0 && (
          <View style={styles.tagRow}>
            {log.antecedent_tags.map((tag) => (
              <View key={tag} style={[styles.tag, styles.tagA]}>
                <Text style={styles.tagText}>{humanize(tag)}</Text>
              </View>
            ))}
          </View>
        )}
        {log.antecedent_notes && (
          <Text style={styles.notes}>{log.antecedent_notes}</Text>
        )}
      </View>

      {/* Behavior */}
      <View style={[styles.section, styles.sectionB]}>
        <Text style={styles.sectionLabel}>B - Behavior</Text>
        <Text style={styles.sectionSubtitle}>What did the pet do?</Text>
        <Text style={styles.categoryValue}>{humanize(log.behavior_category)}</Text>
        {log.behavior_tags.length > 0 && (
          <View style={styles.tagRow}>
            {log.behavior_tags.map((tag) => (
              <View key={tag} style={[styles.tag, styles.tagB]}>
                <Text style={styles.tagText}>{humanize(tag)}</Text>
              </View>
            ))}
          </View>
        )}
        {log.behavior_notes && (
          <Text style={styles.notes}>{log.behavior_notes}</Text>
        )}
      </View>

      {/* Consequence */}
      <View style={[styles.section, styles.sectionC]}>
        <Text style={styles.sectionLabel}>C - Consequence</Text>
        <Text style={styles.sectionSubtitle}>What happened after?</Text>
        <Text style={styles.categoryValue}>{humanize(log.consequence_category)}</Text>
        {log.consequence_tags.length > 0 && (
          <View style={styles.tagRow}>
            {log.consequence_tags.map((tag) => (
              <View key={tag} style={[styles.tag, styles.tagC]}>
                <Text style={styles.tagText}>{humanize(tag)}</Text>
              </View>
            ))}
          </View>
        )}
        {log.consequence_notes && (
          <Text style={styles.notes}>{log.consequence_notes}</Text>
        )}
      </View>

      {/* Other pets */}
      {log.other_pets_present.length > 0 && (
        <View style={styles.metaSection}>
          <Text style={styles.metaLabel}>Other Pets Present</Text>
          <Text style={styles.metaValue}>{log.other_pets_present.join(', ')}</Text>
        </View>
      )}

      {/* Delete */}
      <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
        <Text style={styles.deleteBtnText}>Delete Log</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing['5xl'] },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  date: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.neutral[700],
  },
  severityBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
  },
  severityText: {
    color: '#fff',
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  location: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
    marginBottom: spacing.xs,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
    borderLeftWidth: 4,
  },
  sectionA: { borderLeftColor: colors.primary[400] },
  sectionB: { borderLeftColor: colors.accent[400] },
  sectionC: { borderLeftColor: colors.info },
  sectionLabel: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.neutral[800],
  },
  sectionSubtitle: {
    fontSize: fontSize.xs,
    color: colors.neutral[400],
    marginBottom: spacing.sm,
  },
  categoryValue: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.neutral[700],
    marginBottom: spacing.sm,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tag: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  tagA: { backgroundColor: colors.primary[50] },
  tagB: { backgroundColor: colors.accent[50] },
  tagC: { backgroundColor: colors.primary[50] },
  tagText: {
    fontSize: fontSize.xs,
    color: colors.neutral[600],
  },
  notes: {
    fontSize: fontSize.sm,
    color: colors.neutral[600],
    marginTop: spacing.sm,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  metaSection: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
  },
  metaLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.neutral[500],
    marginBottom: spacing.xs,
  },
  metaValue: {
    fontSize: fontSize.sm,
    color: colors.neutral[700],
  },
  deleteBtn: {
    marginTop: spacing['2xl'],
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.error,
    alignItems: 'center',
  },
  deleteBtnText: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.error,
  },
});
