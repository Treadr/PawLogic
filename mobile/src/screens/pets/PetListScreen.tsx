import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { colors } from '../../constants/colors';
import { fontSize, spacing, borderRadius } from '../../constants/typography';
import * as petService from '../../services/pets';
import type { Pet } from '../../types/pet';
import type { RootStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'PetList'>;

export default function PetListScreen({ navigation }: Props) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadPets = useCallback(async () => {
    try {
      const data = await petService.listPets();
      setPets(data);
    } catch (err) {
      console.error('Failed to load pets:', err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPets();
    }, [loadPets]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPets();
    setRefreshing(false);
  };

  const renderPet = ({ item }: { item: Pet }) => (
    <TouchableOpacity
      style={styles.petCard}
      onPress={() =>
        navigation.navigate('PetDetail', {
          petId: item.id,
        })
      }
    >
      <View style={styles.petAvatar}>
        <Text style={styles.petEmoji}>
          {item.species === 'cat' ? '\uD83D\uDC31' : '\uD83D\uDC36'}
        </Text>
      </View>
      <View style={styles.petInfo}>
        <Text style={styles.petName}>{item.name}</Text>
        <Text style={styles.petMeta}>
          {item.species} {item.breed ? `- ${item.breed}` : ''}
          {item.age_years != null ? ` - ${item.age_years}y` : ''}
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() =>
            navigation.navigate('ABCLogList', {
              petId: item.id,
              petName: item.name,
            })
          }
        >
          <Text style={styles.actionText}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.insightBtn]}
          onPress={() =>
            navigation.navigate('Insights', {
              petId: item.id,
              petName: item.name,
            })
          }
        >
          <Text style={[styles.actionText, styles.insightText]}>Insights</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={pets}
        keyExtractor={(p) => p.id}
        renderItem={renderPet}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No pets yet. Add your first pet!</Text>
          </View>
        }
        contentContainerStyle={pets.length === 0 ? styles.emptyContainer : undefined}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddPet')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  petCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  petAvatar: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  petEmoji: { fontSize: 24 },
  petInfo: { flex: 1, marginLeft: spacing.md },
  petName: { fontSize: fontSize.lg, fontWeight: '600', color: colors.neutral[800] },
  petMeta: { fontSize: fontSize.sm, color: colors.neutral[500], marginTop: 2 },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    width: '100%',
    paddingLeft: 60,
  },
  actionBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.primary[300],
  },
  insightBtn: {
    borderColor: colors.accent[300],
    backgroundColor: colors.accent[50],
  },
  actionText: { fontSize: fontSize.xs, color: colors.primary[500] },
  insightText: { color: colors.accent[600] },
  empty: { alignItems: 'center', padding: spacing['3xl'] },
  emptyContainer: { flex: 1, justifyContent: 'center' },
  emptyText: { fontSize: fontSize.base, color: colors.neutral[400] },
  fab: {
    position: 'absolute',
    bottom: spacing['2xl'],
    right: spacing['2xl'],
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: { fontSize: 28, color: '#fff', lineHeight: 30 },
});
