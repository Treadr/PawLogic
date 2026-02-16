import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import { fontSize, spacing, borderRadius } from '../constants/typography';

interface Props {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  multiSelect?: boolean;
}

export default function ChipSelector({
  options,
  selected,
  onToggle,
  multiSelect = true,
}: Props) {
  const handlePress = (value: string) => {
    onToggle(value);
  };

  const humanize = (s: string) => s.replace(/_/g, ' ');

  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isActive = selected.includes(option);
        return (
          <TouchableOpacity
            key={option}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => handlePress(option)}
          >
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {humanize(option)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  chipText: {
    fontSize: fontSize.xs,
    color: colors.neutral[600],
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
});
