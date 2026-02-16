import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import { fontSize, spacing, borderRadius } from '../constants/typography';

const SEVERITY_LABELS = ['Mild', 'Low-moderate', 'Moderate', 'High-moderate', 'Severe'];
const SEVERITY_COLORS = [
  colors.success,
  '#84CC16',
  colors.warning,
  '#F97316',
  colors.error,
];

interface Props {
  value: number;
  onChange: (value: number) => void;
}

export default function SeveritySlider({ value, onChange }: Props) {
  return (
    <View>
      <View style={styles.row}>
        {[1, 2, 3, 4, 5].map((level) => (
          <TouchableOpacity
            key={level}
            style={[
              styles.dot,
              {
                backgroundColor:
                  level <= value ? SEVERITY_COLORS[level - 1] : colors.neutral[200],
              },
            ]}
            onPress={() => onChange(level)}
          >
            <Text
              style={[
                styles.dotText,
                level <= value && styles.dotTextActive,
              ]}
            >
              {level}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={[styles.label, { color: SEVERITY_COLORS[value - 1] }]}>
        {SEVERITY_LABELS[value - 1]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  dot: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.neutral[500],
  },
  dotTextActive: {
    color: '#fff',
  },
  label: {
    textAlign: 'center',
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
});
