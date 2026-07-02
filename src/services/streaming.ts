import { backendConfigured, supabase } from '../lib/supabase';

export async function getSecureStreamUrl(trackId: string): Promise<string | null> {
  if (!backendConfigured || !supabase || trackId.startsWith('demo-')) return null;
  const { data, error } = await supabase.functions.invoke('secure-stream', { body: { trackId } });
  if (error) throw error;
  return typeof data?.url === 'string' ? data.url : null;
}
