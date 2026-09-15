-- Signage: Fix RLS policies on storage.objects for bucket signage

-- 1. Ensure signage bucket exists and is public
insert into storage.buckets (id, name, public)
values ('signage', 'signage', true)
on conflict (id) do update set public = true;

-- 2. Drop restrictive policies
drop policy if exists "signage_bucket_admin_write" on storage.objects;
drop policy if exists "signage_bucket_auth_write"  on storage.objects;
drop policy if exists "signage_bucket_auth_read"   on storage.objects;
drop policy if exists "signage_bucket_anon_read"   on storage.objects;
drop policy if exists "signage_bucket_public_read" on storage.objects;

-- 3. Public read for all clients (physical Raspberry Pi, preview iframe, web)
create policy "signage_bucket_public_read" on storage.objects
  for select to public
  using (bucket_id = 'signage');

-- 4. Allow authenticated users to upload and manage objects
create policy "signage_bucket_auth_write" on storage.objects
  for all to authenticated
  using      (bucket_id = 'signage')
  with check (bucket_id = 'signage');
