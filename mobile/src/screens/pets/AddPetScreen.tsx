import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { colors } from '../../constants/colors';
import { fontSize, spacing, borderRadius } from '../../constants/typography';
import * as petService from '../../services/pets';
import type { RootStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'AddPet'>;

export default function AddPetScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [species, setSpecies] = useState<'cat' | 'dog'>('cat');
  const [breed, setBreed] = useState('');
  const [ageYears, setAgeYears] = useState('');
  const [sex, setSex] = useState<'male' | 'female' | 'unknown'>('unknown');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter your pet\'s name');
      return;
    }
    setLoading(true);
    try {
      await petService.createPet({
        name: name.trim(),
        species,
        breed: breed.trim() || undefined,
        age_years: ageYears ? parseInt(ageYears, 10) : undefined,
        sex,
      });
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Name *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Luna"
        value={name}
        onChangeText={setName}
        placeholderTextColor={colors.neutral[400]}
      />

      <Text style={styles.label}>Species *</Text>
      <View style={styles.chipRow}>
        {(['cat', 'dog'] as const).map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.chip, species === s && styles.chipActive]}
            onPress={() => setSpecies(s)}
          >
            <Text style={[styles.chipText, species === s && styles.chipTextActive]}>
              {s === 'cat' ? '\uD83D\uDC31 Cat' : '\uD83D\uDC36 Dog'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Breed</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Maine Coon"
        value={breed}
        onChangeText={setBreed}
        placeholderTextColor={colors.neutral[400]}
      />

      <Text style={styles.label}>Age (years)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 3"
        value={ageYears}
        onChangeText={setAgeYears}
        keyboardType="numeric"
        placeholderTextColor={colors.neutral[400]}
      />

      <Text style={styles.label}>Sex</Text>
      <View style={styles.chipRow}>
        {(['male', 'female', 'unknown'] as const).map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.chip, sex === s && styles.chipActive]}
            onPress={() => setSex(s)}
          >
            <Text style={[styles.chipText, sex === s && styles.chipTextActive]}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.saveBtnText}>
          {loading ? 'Saving...' : 'Add Pet'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing['2xl'] },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.neutral[700],
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.base,
  },
  chipRow: { flexDirection: 'row', gap: spacing.sm },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  chipText: { fontSize: fontSize.sm, color: colors.neutral[600] },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  saveBtn: {
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing['3xl'],
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontSize: fontSize.lg, fontWeight: '600' },
});
