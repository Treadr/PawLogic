import { setAuthToken } from './api';
import { supabase } from './supabase';

export async function signUp(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) throw new Error(error.message);
}

export async function signIn(email: string, password: string): Promise<void> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw new Error(error.message);
  setAuthToken(data.session?.access_token ?? null);
}

export async function restoreSession(): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  if (data.session) {
    setAuthToken(data.session.access_token);
    return true;
  }
  return false;
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut();
  setAuthToken(null);
}
