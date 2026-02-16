import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { colors } from '../../constants/colors';
import { fontSize, spacing, borderRadius } from '../../constants/typography';
import { loginWithDevToken } from '../../services/auth';
import type { RootStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const id = userId.trim() || crypto.randomUUID();
    setLoading(true);
    try {
      await loginWithDevToken(id);
      navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
    } catch (err) {
      Alert.alert('Login Failed', String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>PawLogic</Text>
        <Text style={styles.tagline}>The science behind the paws.</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Dev User ID (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Leave blank for random UUID"
          placeholderTextColor={colors.neutral[400]}
          value={userId}
          onChangeText={setUserId}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Signing in...' : 'Sign In (Dev Mode)'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>Development build - no real auth required</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    padding: spacing['2xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['5xl'],
  },
  logo: {
    fontSize: fontSize['4xl'],
    fontWeight: '700',
    color: colors.primary[500],
  },
  tagline: {
    fontSize: fontSize.base,
    color: colors.neutral[500],
    marginTop: spacing.sm,
  },
  form: {
    marginBottom: spacing['3xl'],
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.neutral[600],
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    fontSize: fontSize.base,
    marginBottom: spacing.lg,
  },
  button: {
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  footer: {
    textAlign: 'center',
    color: colors.neutral[400],
    fontSize: fontSize.xs,
  },
});
