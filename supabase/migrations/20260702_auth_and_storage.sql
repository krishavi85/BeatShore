create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1), 'BeatShore user'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('covers', 'covers', true, 10485760, array['image/jpeg','image/png','image/webp']),
  ('audio', 'audio', false, 4294967296, array['audio/mpeg','audio/wav','audio/flac','audio/x-flac'])
on conflict (id) do nothing;

create policy "Public cover art is readable"
on storage.objects for select
using (bucket_id = 'covers');

create policy "Artists upload own cover art"
on storage.objects for insert to authenticated
with check (bucket_id = 'covers' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Artists manage own audio"
on storage.objects for all to authenticated
using (bucket_id = 'audio' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'audio' and (storage.foldername(name))[1] = auth.uid()::text);
