import { backendConfigured, supabase } from '../lib/supabase';

export async function getCurrentUserEmail(): Promise<string | null> {
  if (!backendConfigured || !supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.email ?? null;
}

export async function sendMagicLink(email: string): Promise<void> {
  if (!backendConfigured || !supabase) throw new Error('Backend is not configured.');
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin },
  });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function listenForAuthChanges(onChange: (email: string | null) => void): () => void {
  if (!supabase) return () => undefined;
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    onChange(session?.user.email ?? null);
  });
  return () => data.subscription.unsubscribe();
}
