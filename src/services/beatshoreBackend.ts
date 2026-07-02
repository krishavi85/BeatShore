import { backendConfigured, supabase } from '../lib/supabase';

export type BackendTrack = {
  id: string;
  title: string;
  artist: string;
  genre: string;
  cover: string;
  duration: string;
  likes: number;
};

export type BackendState = 'connected' | 'demo' | 'error';

function secondsToDuration(value: number | null): string {
  const seconds = Math.max(0, value ?? 0);
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
}

export async function checkBackend(): Promise<BackendState> {
  if (!backendConfigured || !supabase) return 'demo';
  const { error } = await supabase.from('tracks').select('id', { count: 'exact', head: true });
  return error ? 'error' : 'connected';
}

export async function loadPublishedTracks(): Promise<BackendTrack[]> {
  if (!backendConfigured || !supabase) return [];

  const { data, error } = await supabase
    .from('tracks')
    .select('id,title,artist_name,genre,cover_url,duration_seconds,like_count')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: String(row.id),
    title: row.title,
    artist: row.artist_name,
    genre: row.genre ?? 'Unknown',
    cover: row.cover_url ?? '',
    duration: secondsToDuration(row.duration_seconds),
    likes: row.like_count ?? 0,
  }));
}

export async function recordPlay(trackId: string): Promise<void> {
  if (!backendConfigured || !supabase) return;
  const { data } = await supabase.auth.getUser();
  await supabase.from('plays').insert({
    track_id: trackId,
    user_id: data.user?.id ?? null,
    source: 'web',
  });
}

export async function submitAuthenticityScan(fileName: string, trackId?: string): Promise<string | null> {
  if (!backendConfigured || !supabase) return null;
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const { data, error } = await supabase
    .from('authenticity_jobs')
    .insert({
      user_id: auth.user.id,
      track_id: trackId ?? null,
      file_name: fileName,
      status: 'queued',
      requested_detectors: ['ai_music', 'deepfake_audio', 'cloned_singer', 'ai_lyrics'],
    })
    .select('id')
    .single();

  if (error) throw error;
  return String(data.id);
}

export function subscribeToTrackChanges(onChange: () => void): () => void {
  if (!backendConfigured || !supabase) return () => undefined;

  const channel = supabase
    .channel('beatshore-public-tracks')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'tracks', filter: 'status=eq.published' },
      onChange,
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
