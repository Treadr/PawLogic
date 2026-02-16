import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { colors } from '../../constants/colors';
import { fontSize, spacing, borderRadius } from '../../constants/typography';
import * as petService from '../../services/pets';
import * as progressService from '../../services/progress';
import type { Pet } from '../../types/pet';
import type { DashboardData } from '../../services/progress';
import type { RootStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

export default function DashboardScreen({ navigation }: Props) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [dashboards, setDashboards] = useState<Record<string, DashboardData>>({});
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const petList = await petService.listPets();
      setPets(petList);

      const dashMap: Record<string, DashboardData> = {};
      for (const pet of petList) {
        try {
          const d = await progressService.getDashboard(pet.id);
          dashMap[pet.id] = d;
        } catch {
          // pet may not have logs yet
        }
      }
      setDashboards(dashMap);
    } catch (err) {
      console.error('Dashboard load error:', err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Quick actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('PetList')}
        >
          <Text style={styles.actionEmoji}>{'\uD83D\uDC3E'}</Text>
          <Text style={styles.actionLabel}>My Pets</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionCard, styles.logCard]}
          onPress={() => {
            if (pets.length === 0) {
              navigation.navigate('AddPet');
            } else if (pets.length === 1) {
              navigation.navigate('ABCLog', {
                petId: pets[0].id,
                petName: pets[0].name,
                species: pets[0].species,
              });
            } else {
              navigation.navigate('PetList');
            }
          }}
        >
          <Text style={styles.actionEmoji}>{'\uD83D\uDCDD'}</Text>
          <Text style={[styles.actionLabel, styles.logLabel]}>Log Behavior</Text>
        </TouchableOpacity>
      </View>

      {/* Pet summaries */}
      {pets.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Welcome to PawLogic!</Text>
          <Text style={styles.emptyText}>
            Add your first pet to start tracking behaviors with ABA science.
          </Text>
          <TouchableOpacity
            style={styles.addPetBtn}
            onPress={() => navigation.navigate('AddPet')}
          >
            <Text style={styles.addPetBtnText}>Add Your First Pet</Text>
          </TouchableOpacity>
        </View>
      ) : (
        pets.map((pet) => {
          const dash = dashboards[pet.id];
          return (
            <View key={pet.id} style={styles.petSummary}>
              <TouchableOpacity
                style={styles.petHeader}
                onPress={() => navigation.navigate('PetDetail', { petId: pet.id })}
              >
                <Text style={styles.petEmoji}>
                  {pet.species === 'cat' ? '\uD83D\uDC31' : '\uD83D\uDC36'}
                </Text>
                <Text style={styles.petName}>{pet.name}</Text>
              </TouchableOpacity>

              {dash ? (
                <View style={styles.statsRow}>
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>{dash.total_logs}</Text>
                    <Text style={styles.statLabel}>Total Logs</Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>{dash.recent_7d}</Text>
                    <Text style={styles.statLabel}>This Week</Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>
                      {dash.avg_severity?.toFixed(1) ?? '-'}
                    </Text>
                    <Text style={styles.statLabel}>Avg Severity</Text>
                  </View>
                  <View style={styles.stat}>
                    <Text
                      style={[
                        styles.statValue,
                        {
                          color:
                            dash.trend_pct < 0
                              ? colors.success
                              : dash.trend_pct > 0
                                ? colors.error
                                : colors.neutral[500],
                        },
                      ]}
                    >
                      {dash.trend_pct > 0 ? '+' : ''}
                      {dash.trend_pct}%
                    </Text>
                    <Text style={styles.statLabel}>Trend</Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.noData}>No data yet - start logging!</Text>
              )}

              <View style={styles.petActions}>
                <TouchableOpacity
                  style={styles.petActionBtn}
                  onPress={() =>
                    navigation.navigate('ABCLog', {
                      petId: pet.id,
                      petName: pet.name,
                      species: pet.species,
                    })
                  }
                >
                  <Text style={styles.petActionText}>Log</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.petActionBtn}
                  onPress={() =>
                    navigation.navigate('ABCLogList', {
                      petId: pet.id,
                      petName: pet.name,
                    })
                  }
                >
                  <Text style={styles.petActionText}>History</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.petActionBtn, styles.insightActionBtn]}
                  onPress={() =>
                    navigation.navigate('Insights', {
                      petId: pet.id,
                      petName: pet.name,
                    })
                  }
                >
                  <Text style={[styles.petActionText, styles.insightActionText]}>
                    Insights
                    {dash?.pattern_detection_ready ? ' *' : ''}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  actionsRow: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  logCard: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  actionEmoji: { fontSize: 28, marginBottom: spacing.sm },
  actionLabel: { fontSize: fontSize.base, fontWeight: '600', color: colors.neutral[700] },
  logLabel: { color: '#fff' },
  emptyState: {
    margin: spacing.lg,
    padding: spacing['2xl'],
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.neutral[800],
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.base,
    color: colors.neutral[500],
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  addPetBtn: {
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing['2xl'],
  },
  addPetBtnText: { color: '#fff', fontSize: fontSize.base, fontWeight: '600' },
  petSummary: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  petHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  petEmoji: { fontSize: 24, marginRight: spacing.sm },
  petName: { fontSize: fontSize.xl, fontWeight: '700', color: colors.neutral[800] },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: spacing.lg },
  stat: { alignItems: 'center' },
  statValue: { fontSize: fontSize.xl, fontWeight: '700', color: colors.neutral[800] },
  statLabel: { fontSize: fontSize.xs, color: colors.neutral[500], marginTop: 2 },
  noData: { color: colors.neutral[400], fontSize: fontSize.sm, marginBottom: spacing.md },
  petActions: { flexDirection: 'row', gap: spacing.sm },
  petActionBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary[300],
    alignItems: 'center',
  },
  insightActionBtn: { borderColor: colors.accent[300], backgroundColor: colors.accent[50] },
  petActionText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.primary[500] },
  insightActionText: { color: colors.accent[600] },
});
