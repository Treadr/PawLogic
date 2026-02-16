import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { colors } from '../../constants/colors';
import { fontSize, spacing, borderRadius } from '../../constants/typography';
import * as petService from '../../services/pets';
import type { Pet } from '../../types/pet';
import type { RootStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'EditPet'>;

export default function EditPetScreen({ route, navigation }: Props) {
  const { petId } = route.params;
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [ageYears, setAgeYears] = useState('');
  const [weightLbs, setWeightLbs] = useState('');
  const [sex, setSex] = useState<'male' | 'female' | 'unknown'>('unknown');
  const [isNeutered, setIsNeutered] = useState(false);
  const [medicalNotes, setMedicalNotes] = useState('');

  const loadPet = useCallback(async () => {
    try {
      const data = await petService.getPet(petId);
      setPet(data);
      setName(data.name);
      setBreed(data.breed || '');
      setAgeYears(data.age_years != null ? String(data.age_years) : '');
      setWeightLbs(data.weight_lbs != null ? String(data.weight_lbs) : '');
      setSex(data.sex);
      setIsNeutered(data.is_neutered);
      setMedicalNotes(data.medical_notes || '');
    } catch (err) {
      Alert.alert('Error', String(err));
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [petId, navigation]);

  useEffect(() => {
    loadPet();
  }, [loadPet]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required', "Please enter your pet's name");
      return;
    }
    setSaving(true);
    try {
      await petService.updatePet(petId, {
        name: name.trim(),
        breed: breed.trim() || undefined,
        age_years: ageYears ? parseInt(ageYears, 10) : undefined,
        weight_lbs: weightLbs ? parseFloat(weightLbs) : undefined,
        sex,
        is_neutered: isNeutered,
        medical_notes: medicalNotes.trim() || undefined,
      });
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', String(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading || !pet) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Name *</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholderTextColor={colors.neutral[400]}
      />

      <Text style={styles.label}>Breed</Text>
      <TextInput
        style={styles.input}
        placeholder={pet.species === 'cat' ? 'e.g. Maine Coon' : 'e.g. Labrador'}
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

      <Text style={styles.label}>Weight (lbs)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 10.5"
        value={weightLbs}
        onChangeText={setWeightLbs}
        keyboardType="decimal-pad"
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

      <View style={styles.switchRow}>
        <Text style={styles.label}>Neutered / Spayed</Text>
        <Switch
          value={isNeutered}
          onValueChange={setIsNeutered}
          trackColor={{ false: colors.neutral[300], true: colors.primary[300] }}
          thumbColor={isNeutered ? colors.primary[500] : colors.neutral[100]}
        />
      </View>

      <Text style={styles.label}>Medical Notes</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Allergies, medications, health conditions..."
        value={medicalNotes}
        onChangeText={setMedicalNotes}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        placeholderTextColor={colors.neutral[400]}
      />

      <TouchableOpacity
        style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveBtnText}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing['2xl'] },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
    color: colors.neutral[800],
  },
  textArea: {
    minHeight: 80,
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
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
