import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authorization = request.headers.get('Authorization');
    if (!authorization) return Response.json({ error: 'Authentication required' }, { status: 401, headers: corsHeaders });

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authorization } } },
    );
    const { data: userData } = await userClient.auth.getUser();
    if (!userData.user) return Response.json({ error: 'Invalid session' }, { status: 401, headers: corsHeaders });

    const { trackId } = await request.json();
    if (!trackId) return Response.json({ error: 'trackId is required' }, { status: 400, headers: corsHeaders });

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: track, error: trackError } = await admin
      .from('tracks')
      .select('audio_path,status')
      .eq('id', trackId)
      .single();

    if (trackError || !track || track.status !== 'published' || !track.audio_path) {
      return Response.json({ error: 'Track is unavailable' }, { status: 404, headers: corsHeaders });
    }

    const { data, error } = await admin.storage.from('audio').createSignedUrl(track.audio_path, 120);
    if (error) throw error;

    return Response.json({ url: data.signedUrl, expiresIn: 120 }, { headers: { ...corsHeaders, 'Cache-Control': 'no-store' } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500, headers: corsHeaders });
  }
});
