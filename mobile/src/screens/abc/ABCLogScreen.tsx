import React, { useEffect, useState } from 'react';
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
import * as abcLogService from '../../services/abcLogs';
import type { Taxonomy } from '../../services/abcLogs';
import ChipSelector from '../../components/ChipSelector';
import SeveritySlider from '../../components/SeveritySlider';
import type { RootStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'ABCLog'>;

const STEPS = ['Antecedent', 'Behavior', 'Consequence', 'Review'];

export default function ABCLogScreen({ route, navigation }: Props) {
  const { petId, petName, species } = route.params;
  const [step, setStep] = useState(0);
  const [taxonomy, setTaxonomy] = useState<Taxonomy | null>(null);
  const [loading, setLoading] = useState(false);

  // Antecedent state
  const [antCategory, setAntCategory] = useState('');
  const [antTags, setAntTags] = useState<string[]>([]);
  const [antNotes, setAntNotes] = useState('');

  // Behavior state
  const [behCategory, setBehCategory] = useState('');
  const [behTags, setBehTags] = useState<string[]>([]);
  const [behSeverity, setBehSeverity] = useState(3);
  const [behNotes, setBehNotes] = useState('');

  // Consequence state
  const [conCategory, setConCategory] = useState('');
  const [conTags, setConTags] = useState<string[]>([]);
  const [conNotes, setConNotes] = useState('');

  useEffect(() => {
    abcLogService.getTaxonomy(species).then(setTaxonomy);
  }, [species]);

  const humanize = (s: string) => s.replace(/_/g, ' ');

  const canAdvance = () => {
    if (step === 0) return antCategory && antTags.length > 0;
    if (step === 1) return behCategory && behTags.length > 0;
    if (step === 2) return conCategory && conTags.length > 0;
    return true;
  };

  const handleCategorySelect = (
    category: string,
    current: string,
    setCat: (v: string) => void,
    setTags: (v: string[]) => void,
  ) => {
    if (current === category) return;
    setCat(category);
    setTags([]);
  };

  const handleTagToggle = (
    tag: string,
    tags: string[],
    setTags: (v: string[]) => void,
  ) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await abcLogService.createABCLog({
        pet_id: petId,
        antecedent_category: antCategory,
        antecedent_tags: antTags,
        antecedent_notes: antNotes || undefined,
        behavior_category: behCategory,
        behavior_tags: behTags,
        behavior_severity: behSeverity,
        behavior_notes: behNotes || undefined,
        consequence_category: conCategory,
        consequence_tags: conTags,
        consequence_notes: conNotes || undefined,
      });
      Alert.alert('Logged!', `Behavior logged for ${petName}.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Error', String(err));
    } finally {
      setLoading(false);
    }
  };

  if (!taxonomy) {
    return (
      <View style={styles.loading}>
        <Text>Loading taxonomy...</Text>
      </View>
    );
  }

  const renderStep = () => {
    if (step === 0) {
      const categories = Object.keys(taxonomy.antecedent_categories);
      return (
        <View>
          <Text style={styles.stepTitle}>What triggered it?</Text>
          <Text style={styles.stepSubtitle}>Select what was happening right before</Text>

          <Text style={styles.sectionLabel}>Category</Text>
          <View style={styles.categoryRow}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, antCategory === cat && styles.categoryChipActive]}
                onPress={() =>
                  handleCategorySelect(cat, antCategory, setAntCategory, setAntTags)
                }
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    antCategory === cat && styles.categoryChipTextActive,
                  ]}
                >
                  {humanize(cat)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {antCategory ? (
            <>
              <Text style={styles.sectionLabel}>Tags</Text>
              <ChipSelector
                options={taxonomy.antecedent_categories[antCategory]}
                selected={antTags}
                onToggle={(t) => handleTagToggle(t, antTags, setAntTags)}
              />
            </>
          ) : null}

          <Text style={styles.sectionLabel}>Notes (optional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Anything else about what happened before?"
            value={antNotes}
            onChangeText={setAntNotes}
            multiline
            placeholderTextColor={colors.neutral[400]}
          />
        </View>
      );
    }

    if (step === 1) {
      const categories = Object.keys(taxonomy.behavior_categories);
      return (
        <View>
          <Text style={styles.stepTitle}>What did {petName} do?</Text>
          <Text style={styles.stepSubtitle}>Describe the behavior you observed</Text>

          <Text style={styles.sectionLabel}>Category</Text>
          <View style={styles.categoryRow}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, behCategory === cat && styles.categoryChipActive]}
                onPress={() =>
                  handleCategorySelect(cat, behCategory, setBehCategory, setBehTags)
                }
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    behCategory === cat && styles.categoryChipTextActive,
                  ]}
                >
                  {humanize(cat)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {behCategory ? (
            <>
              <Text style={styles.sectionLabel}>Tags</Text>
              <ChipSelector
                options={taxonomy.behavior_categories[behCategory]}
                selected={behTags}
                onToggle={(t) => handleTagToggle(t, behTags, setBehTags)}
              />
            </>
          ) : null}

          <Text style={styles.sectionLabel}>Severity</Text>
          <SeveritySlider value={behSeverity} onChange={setBehSeverity} />

          <Text style={styles.sectionLabel}>Notes (optional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Any details about the behavior?"
            value={behNotes}
            onChangeText={setBehNotes}
            multiline
            placeholderTextColor={colors.neutral[400]}
          />
        </View>
      );
    }

    if (step === 2) {
      const categories = Object.keys(taxonomy.consequence_categories);
      return (
        <View>
          <Text style={styles.stepTitle}>What happened after?</Text>
          <Text style={styles.stepSubtitle}>What was the response or outcome?</Text>

          <Text style={styles.sectionLabel}>Category</Text>
          <View style={styles.categoryRow}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, conCategory === cat && styles.categoryChipActive]}
                onPress={() =>
                  handleCategorySelect(cat, conCategory, setConCategory, setConTags)
                }
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    conCategory === cat && styles.categoryChipTextActive,
                  ]}
                >
                  {humanize(cat)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {conCategory ? (
            <>
              <Text style={styles.sectionLabel}>Tags</Text>
              <ChipSelector
                options={taxonomy.consequence_categories[conCategory]}
                selected={conTags}
                onToggle={(t) => handleTagToggle(t, conTags, setConTags)}
              />
            </>
          ) : null}

          <Text style={styles.sectionLabel}>Notes (optional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Any details about what happened after?"
            value={conNotes}
            onChangeText={setConNotes}
            multiline
            placeholderTextColor={colors.neutral[400]}
          />
        </View>
      );
    }

    // Step 3: Review
    return (
      <View>
        <Text style={styles.stepTitle}>Review & Save</Text>
        <Text style={styles.stepSubtitle}>Confirm the details before saving</Text>

        <View style={styles.reviewCard}>
          <Text style={styles.reviewLabel}>A - Antecedent</Text>
          <Text style={styles.reviewValue}>
            {humanize(antCategory)}: {antTags.map(humanize).join(', ')}
          </Text>
          {antNotes ? <Text style={styles.reviewNotes}>{antNotes}</Text> : null}
        </View>

        <View style={styles.reviewCard}>
          <Text style={styles.reviewLabel}>B - Behavior</Text>
          <Text style={styles.reviewValue}>
            {humanize(behCategory)}: {behTags.map(humanize).join(', ')}
          </Text>
          <Text style={styles.reviewSeverity}>Severity: {behSeverity}/5</Text>
          {behNotes ? <Text style={styles.reviewNotes}>{behNotes}</Text> : null}
        </View>

        <View style={styles.reviewCard}>
          <Text style={styles.reviewLabel}>C - Consequence</Text>
          <Text style={styles.reviewValue}>
            {humanize(conCategory)}: {conTags.map(humanize).join(', ')}
          </Text>
          {conNotes ? <Text style={styles.reviewNotes}>{conNotes}</Text> : null}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Progress indicator */}
      <View style={styles.progress}>
        {STEPS.map((s, i) => (
          <View key={s} style={styles.progressItem}>
            <View
              style={[
                styles.progressDot,
                i <= step && styles.progressDotActive,
                i < step && styles.progressDotDone,
              ]}
            >
              <Text
                style={[
                  styles.progressDotText,
                  i <= step && styles.progressDotTextActive,
                ]}
              >
                {i < step ? '\u2713' : i + 1}
              </Text>
            </View>
            <Text
              style={[styles.progressLabel, i === step && styles.progressLabelActive]}
            >
              {s}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        {renderStep()}
      </ScrollView>

      {/* Navigation buttons */}
      <View style={styles.footer}>
        {step > 0 ? (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setStep(step - 1)}
          >
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
        ) : (
          <View />
        )}

        {step < 3 ? (
          <TouchableOpacity
            style={[styles.nextBtn, !canAdvance() && styles.nextBtnDisabled]}
            onPress={() => setStep(step + 1)}
            disabled={!canAdvance()}
          >
            <Text style={styles.nextBtnText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.nextBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.nextBtnText}>
              {loading ? 'Saving...' : 'Save Log'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  progress: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  progressItem: { alignItems: 'center' },
  progressDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressDotActive: { backgroundColor: colors.primary[500] },
  progressDotDone: { backgroundColor: colors.success },
  progressDotText: { fontSize: fontSize.sm, color: colors.neutral[500], fontWeight: '600' },
  progressDotTextActive: { color: '#fff' },
  progressLabel: { fontSize: fontSize.xs, color: colors.neutral[400], marginTop: 4 },
  progressLabelActive: { color: colors.primary[500], fontWeight: '600' },
  content: { flex: 1 },
  contentInner: { padding: spacing['2xl'] },
  stepTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: colors.neutral[800],
    marginBottom: spacing.xs,
  },
  stepSubtitle: {
    fontSize: fontSize.base,
    color: colors.neutral[500],
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.neutral[700],
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.neutral[300],
    backgroundColor: colors.surface,
  },
  categoryChipActive: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  categoryChipText: { fontSize: fontSize.sm, color: colors.neutral[600] },
  categoryChipTextActive: { color: colors.primary[700], fontWeight: '600' },
  notesInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.base,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  backBtn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral[300],
  },
  backBtnText: { fontSize: fontSize.base, color: colors.neutral[600] },
  nextBtn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing['2xl'],
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[500],
  },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: { fontSize: fontSize.base, color: '#fff', fontWeight: '600' },
  submitBtn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing['2xl'],
    borderRadius: borderRadius.md,
    backgroundColor: colors.accent[500],
  },
  reviewCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary[500],
  },
  reviewLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primary[500],
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  reviewValue: { fontSize: fontSize.base, color: colors.neutral[800] },
  reviewSeverity: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
    marginTop: spacing.xs,
  },
  reviewNotes: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
});
