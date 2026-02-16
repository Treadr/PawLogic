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
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { colors } from '../../constants/colors';
import { fontSize, spacing, borderRadius } from '../../constants/typography';
import * as petService from '../../services/pets';
import * as progressService from '../../services/progress';
import type { Pet } from '../../types';
import type { DashboardData } from '../../services/progress';

type Props = NativeStackScreenProps<RootStackParamList, 'PetDetail'>;

export default function PetDetailScreen({ route, navigation }: Props) {
  const { petId } = route.params;
  const [pet, setPet] = useState<Pet | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [petData, dashData] = await Promise.all([
        petService.getPet(petId),
        progressService.getDashboard(petId),
      ]);
      setPet(petData);
      setDashboard(dashData);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      console.error('Failed to load pet details:', err);
    } finally {
      setLoading(false);
    }
  }, [petId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (pet) {
      navigation.setOptions({ title: pet.name });
    }
  }, [pet, navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadData);
    return unsubscribe;
  }, [navigation, loadData]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  if (error || !pet) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Failed to load pet</Text>
        <Text style={styles.errorMessage}>{error || 'Pet not found'}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            loadData();
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const trendLabel =
    dashboard && dashboard.trend_pct !== 0
      ? dashboard.trend_pct > 0
        ? `+${dashboard.trend_pct}%`
        : `${dashboard.trend_pct}%`
      : 'Stable';

  const trendColor =
    dashboard && dashboard.trend_pct > 0
      ? colors.error
      : dashboard && dashboard.trend_pct < 0
        ? colors.success
        : colors.neutral[500];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Pet Info Card */}
      <View style={styles.card}>
        <View style={styles.petHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {pet.species === 'cat' ? '🐱' : '🐶'}
            </Text>
          </View>
          <View style={styles.petInfo}>
            <Text style={styles.petName}>{pet.name}</Text>
            <Text style={styles.petMeta}>
              {pet.breed || pet.species.charAt(0).toUpperCase() + pet.species.slice(1)}
              {pet.age_years ? ` \u00B7 ${pet.age_years}y` : ''}
              {pet.sex !== 'unknown' ? ` \u00B7 ${pet.sex}` : ''}
            </Text>
            {pet.is_neutered && (
              <Text style={styles.badge}>Neutered/Spayed</Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate('EditPet', { petId: pet.id })}
          >
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Grid */}
      {dashboard && (
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{dashboard.total_logs}</Text>
            <Text style={styles.statLabel}>Total Logs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{dashboard.recent_7d}</Text>
            <Text style={styles.statLabel}>Last 7 Days</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: trendColor }]}>
              {trendLabel}
            </Text>
            <Text style={styles.statLabel}>Trend</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {dashboard.avg_severity?.toFixed(1) || '--'}
            </Text>
            <Text style={styles.statLabel}>Avg Severity</Text>
          </View>
        </View>
      )}

      {/* Pattern Detection Status */}
      {dashboard && (
        <View style={[styles.card, styles.patternCard]}>
          <Text style={styles.sectionTitle}>Pattern Detection</Text>
          {dashboard.pattern_detection_ready ? (
            <Text style={styles.patternReady}>
              Ready! Tap "View Insights" to see patterns.
            </Text>
          ) : (
            <Text style={styles.patternNotReady}>
              Need {10 - dashboard.total_logs} more logs to unlock AI pattern
              detection.
            </Text>
          )}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryAction]}
          onPress={() =>
            navigation.navigate('ABCLog', {
              petId: pet.id,
              petName: pet.name,
              species: pet.species,
            })
          }
        >
          <Text style={styles.primaryActionText}>Log Behavior</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            navigation.navigate('ABCLogList', {
              petId: pet.id,
              petName: pet.name,
            })
          }
        >
          <Text style={styles.actionText}>View Log History</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            navigation.navigate('Insights', {
              petId: pet.id,
              petName: pet.name,
            })
          }
        >
          <Text style={styles.actionText}>View Insights</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            navigation.navigate('Progress', {
              petId: pet.id,
              petName: pet.name,
            })
          }
        >
          <Text style={styles.actionText}>Progress Charts</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.coachAction]}
          onPress={() =>
            navigation.navigate('Coaching', {
              petId: pet.id,
              petName: pet.name,
            })
          }
        >
          <Text style={styles.coachActionText}>Ask Behavior Coach</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteAction]}
          onPress={() =>
            Alert.alert(
              'Delete Pet',
              `Are you sure you want to delete ${pet.name}? This will also remove all behavior logs and insights.`,
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await petService.deletePet(pet.id);
                      navigation.goBack();
                    } catch (err) {
                      Alert.alert('Error', String(err));
                    }
                  },
                },
              ],
            )
          }
        >
          <Text style={styles.deleteActionText}>Delete Pet</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing['2xl'] },
  errorTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.neutral[700],
    marginBottom: spacing.sm,
  },
  errorMessage: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  retryButton: {
    backgroundColor: colors.primary[500],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing['3xl'],
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: fontSize.base,
    fontWeight: '600',
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
  petHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  avatarText: { fontSize: 32 },
  petInfo: { flex: 1, marginRight: spacing.sm },
  petName: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: colors.neutral[900],
  },
  petMeta: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
    marginTop: spacing.xs,
  },
  badge: {
    fontSize: fontSize.xs,
    color: colors.primary[600],
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    overflow: 'hidden',
  },
  editBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.primary[300],
  },
  editBtnText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.primary[500],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.primary[600],
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
    marginTop: spacing.xs,
  },
  patternCard: {},
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.neutral[800],
    marginBottom: spacing.sm,
  },
  patternReady: { fontSize: fontSize.sm, color: colors.success },
  patternNotReady: { fontSize: fontSize.sm, color: colors.neutral[500] },
  actions: { gap: spacing.sm },
  actionButton: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  primaryAction: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  primaryActionText: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: '#fff',
  },
  actionText: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.primary[600],
  },
  coachAction: {
    backgroundColor: colors.accent[50],
    borderColor: colors.accent[300],
  },
  coachActionText: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.accent[600],
  },
  deleteAction: {
    backgroundColor: colors.surface,
    borderColor: colors.error,
    marginTop: spacing.xl,
  },
  deleteActionText: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.error,
  },
});
