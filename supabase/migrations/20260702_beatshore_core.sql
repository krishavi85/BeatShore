create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'BeatShore listener',
  avatar_url text,
  role text not null default 'listener' check (role in ('listener','artist','admin')),
  verified boolean not null default false,
  country_code text,
  created_at timestamptz not null default now()
);

create table if not exists public.tracks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  artist_name text not null,
  genre text,
  cover_url text,
  audio_path text,
  duration_seconds integer not null default 0,
  status text not null default 'draft' check (status in ('draft','review','published','blocked')),
  is_ai_generated boolean not null default false,
  authenticity_score numeric(5,2),
  like_count bigint not null default 0,
  play_count bigint not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.plays (
  id bigint generated always as identity primary key,
  track_id uuid not null references public.tracks(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  source text not null default 'web',
  listened_seconds integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.likes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  track_id uuid not null references public.tracks(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, track_id)
);

create table if not exists public.playlists (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  visibility text not null default 'private' check (visibility in ('private','shared','public')),
  collaborative boolean not null default false,
  ai_prompt text,
  created_at timestamptz not null default now()
);

create table if not exists public.playlist_items (
  playlist_id uuid not null references public.playlists(id) on delete cascade,
  track_id uuid not null references public.tracks(id) on delete cascade,
  added_by uuid references public.profiles(id) on delete set null,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (playlist_id, track_id)
);

create table if not exists public.collaboration_rooms (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  invite_code text not null unique default encode(gen_random_bytes(6), 'hex'),
  active_track_id uuid references public.tracks(id) on delete set null,
  playback_position integer not null default 0,
  is_playing boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.room_members (
  room_id uuid not null references public.collaboration_rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  permission text not null default 'listener' check (permission in ('listener','dj','owner')),
  joined_at timestamptz not null default now(),
  primary key (room_id, user_id)
);

create table if not exists public.authenticity_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  track_id uuid references public.tracks(id) on delete set null,
  file_name text not null,
  requested_detectors text[] not null default '{}',
  status text not null default 'queued' check (status in ('queued','processing','complete','failed')),
  result jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.royalty_ledger (
  id bigint generated always as identity primary key,
  artist_id uuid not null references public.profiles(id) on delete cascade,
  track_id uuid references public.tracks(id) on delete set null,
  event_type text not null check (event_type in ('stream','download','tip','subscription','adjustment','payout')),
  gross_amount numeric(12,4) not null default 0,
  artist_amount numeric(12,4) not null default 0,
  platform_amount numeric(12,4) not null default 0,
  currency text not null default 'USD',
  status text not null default 'pending' check (status in ('pending','available','paid','reversed')),
  created_at timestamptz not null default now()
);

create index if not exists tracks_status_created_idx on public.tracks(status, created_at desc);
create index if not exists plays_track_created_idx on public.plays(track_id, created_at desc);
create index if not exists royalty_artist_created_idx on public.royalty_ledger(artist_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.tracks enable row level security;
alter table public.plays enable row level security;
alter table public.likes enable row level security;
alter table public.playlists enable row level security;
alter table public.playlist_items enable row level security;
alter table public.collaboration_rooms enable row level security;
alter table public.room_members enable row level security;
alter table public.authenticity_jobs enable row level security;
alter table public.royalty_ledger enable row level security;

create policy "Public profiles are readable" on public.profiles for select using (true);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);

create policy "Published tracks are readable" on public.tracks for select using (status = 'published' or owner_id = auth.uid());
create policy "Artists create tracks" on public.tracks for insert with check (owner_id = auth.uid());
create policy "Artists update tracks" on public.tracks for update using (owner_id = auth.uid());
create policy "Artists delete drafts" on public.tracks for delete using (owner_id = auth.uid() and status = 'draft');

create policy "Authenticated users record plays" on public.plays for insert to authenticated with check (user_id = auth.uid());
create policy "Artists read track plays" on public.plays for select using (exists (select 1 from public.tracks t where t.id = track_id and t.owner_id = auth.uid()));

create policy "Users read own likes" on public.likes for select using (user_id = auth.uid());
create policy "Users create own likes" on public.likes for insert with check (user_id = auth.uid());
create policy "Users delete own likes" on public.likes for delete using (user_id = auth.uid());

create policy "Visible playlists are readable" on public.playlists for select using (visibility = 'public' or owner_id = auth.uid());
create policy "Users manage own playlists" on public.playlists for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "Playlist items follow playlist access" on public.playlist_items for select using (exists (select 1 from public.playlists p where p.id = playlist_id and (p.visibility = 'public' or p.owner_id = auth.uid())));
create policy "Owners add playlist items" on public.playlist_items for insert with check (exists (select 1 from public.playlists p where p.id = playlist_id and (p.owner_id = auth.uid() or p.collaborative)));
create policy "Owners remove playlist items" on public.playlist_items for delete using (exists (select 1 from public.playlists p where p.id = playlist_id and p.owner_id = auth.uid()));

create policy "Room members read rooms" on public.collaboration_rooms for select using (owner_id = auth.uid() or exists (select 1 from public.room_members m where m.room_id = id and m.user_id = auth.uid()));
create policy "Users create rooms" on public.collaboration_rooms for insert with check (owner_id = auth.uid());
create policy "Owners update rooms" on public.collaboration_rooms for update using (owner_id = auth.uid());
create policy "Members read membership" on public.room_members for select using (user_id = auth.uid() or exists (select 1 from public.collaboration_rooms r where r.id = room_id and r.owner_id = auth.uid()));

create policy "Users create authenticity jobs" on public.authenticity_jobs for insert with check (user_id = auth.uid());
create policy "Users read authenticity jobs" on public.authenticity_jobs for select using (user_id = auth.uid());

create policy "Artists read own royalties" on public.royalty_ledger for select using (artist_id = auth.uid());

alter publication supabase_realtime add table public.tracks;
alter publication supabase_realtime add table public.collaboration_rooms;
