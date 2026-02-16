import { api, setAuthToken } from './api';

export async function loginWithDevToken(userId: string): Promise<string> {
  const data = await api.post<{ token: string; user_id: string }>('/auth/dev-token', { user_id: userId });
  setAuthToken(data.token);
  localStorage.setItem('pawlogic_user_id', data.user_id);
  return data.token;
}

export async function verifyToken(): Promise<{ user_id: string; message: string }> {
  return api.post<{ user_id: string; message: string }>('/auth/verify', {});
}

export function getStoredUserId(): string | null {
  return localStorage.getItem('pawlogic_user_id');
}

export function logout() {
  setAuthToken(null);
  localStorage.removeItem('pawlogic_user_id');
}
