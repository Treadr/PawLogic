import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { colors } from '../../constants/colors';
import { fontSize, spacing, borderRadius } from '../../constants/typography';
import { logout } from '../../services/auth';
import type { RootStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export default function SettingsScreen({ navigation }: Props) {
  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* App Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>App</Text>
            <Text style={styles.rowValue}>PawLogic</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Version</Text>
            <Text style={styles.rowValue}>0.1.0 (MVP)</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Methodology</Text>
            <Text style={styles.rowValue}>Applied Behavior Analysis</Text>
          </View>
        </View>
      </View>

      {/* Features */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Features</Text>
        <View style={styles.card}>
          <View style={styles.featureRow}>
            <Text style={styles.featureLabel}>ABC Behavior Logging</Text>
            <View style={styles.featureBadge}>
              <Text style={styles.featureBadgeText}>Active</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.featureRow}>
            <Text style={styles.featureLabel}>AI Pattern Detection</Text>
            <View style={styles.featureBadge}>
              <Text style={styles.featureBadgeText}>Active</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.featureRow}>
            <Text style={styles.featureLabel}>Behavior Coach (AI)</Text>
            <View style={styles.featureBadge}>
              <Text style={styles.featureBadgeText}>Active</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.featureRow}>
            <Text style={styles.featureLabel}>Behavior Intervention Plans</Text>
            <View style={[styles.featureBadge, styles.comingSoonBadge]}>
              <Text style={styles.comingSoonText}>Coming Soon</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.featureRow}>
            <Text style={styles.featureLabel}>Vet Reports</Text>
            <View style={[styles.featureBadge, styles.comingSoonBadge]}>
              <Text style={styles.comingSoonText}>Coming Soon</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Account */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.logoutCard} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>
        Built with ABA science for cats and dogs.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing['5xl'] },
  section: { marginBottom: spacing.xl },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.neutral[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
  },
  rowLabel: {
    fontSize: fontSize.base,
    color: colors.neutral[700],
  },
  rowValue: {
    fontSize: fontSize.base,
    color: colors.neutral[500],
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.neutral[200],
    marginHorizontal: spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
  },
  featureLabel: {
    fontSize: fontSize.base,
    color: colors.neutral[700],
    flex: 1,
  },
  featureBadge: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary[50],
  },
  featureBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.primary[600],
  },
  comingSoonBadge: {
    backgroundColor: colors.neutral[100],
  },
  comingSoonText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.neutral[400],
  },
  logoutCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.error,
  },
  footer: {
    textAlign: 'center',
    fontSize: fontSize.xs,
    color: colors.neutral[400],
    marginTop: spacing.lg,
  },
});
