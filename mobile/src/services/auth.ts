import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setAuthToken } from './api';

const TOKEN_KEY = 'pawlogic_auth_token';
const USER_ID_KEY = 'pawlogic_user_id';

export async function getStoredToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function getStoredUserId(): Promise<string | null> {
  return AsyncStorage.getItem(USER_ID_KEY);
}

export async function loginWithDevToken(userId: string): Promise<string> {
  const data = await api.post<{ token: string; user_id: string }>(
    '/auth/dev-token',
    { user_id: userId },
  );
  await AsyncStorage.setItem(TOKEN_KEY, data.token);
  await AsyncStorage.setItem(USER_ID_KEY, data.user_id);
  setAuthToken(data.token);
  return data.token;
}

export async function restoreSession(): Promise<boolean> {
  const token = await getStoredToken();
  if (!token) return false;
  setAuthToken(token);
  try {
    await api.post<{ user_id: string }>('/auth/verify', {});
    return true;
  } catch {
    await logout();
    return false;
  }
}

export async function logout(): Promise<void> {
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_ID_KEY]);
  setAuthToken(null);
}
