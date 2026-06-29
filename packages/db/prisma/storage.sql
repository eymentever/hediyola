-- ============================================================================
-- Hediyola — Supabase Storage buckets & access policies
-- Run in the Supabase SQL editor (after policies.sql).
--
-- Buckets are PUBLIC-READ (images shown to guests) but WRITE is restricted to
-- authenticated users, and each user may only write within their own folder
-- (path prefix = auth.uid()). This prevents one couple from overwriting
-- another couple's images. See SECURITY.md.
-- ============================================================================

-- Create buckets (id = name). Public read; we still gate writes via policies.
insert into storage.buckets (id, name, public)
values
  ('registry-covers',  'registry-covers',  true),
  ('registry-avatars', 'registry-avatars', true),
  ('custom-items',     'custom-items',      true),
  ('products',         'products',          true)
on conflict (id) do nothing;

-- ---------- Public read for all four buckets ----------
drop policy if exists "public_read_images" on storage.objects;
create policy "public_read_images" on storage.objects
  for select using (
    bucket_id in ('registry-covers', 'registry-avatars', 'custom-items', 'products')
  );

-- ---------- Couples may write only inside their own uid folder ----------
-- Convention: object path is "<auth.uid()>/<filename>", so the first path
-- segment must equal the caller's user id.
drop policy if exists "couples_write_own_folder" on storage.objects;
create policy "couples_write_own_folder" on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('registry-covers', 'registry-avatars', 'custom-items')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "couples_update_own_folder" on storage.objects;
create policy "couples_update_own_folder" on storage.objects
  for update to authenticated
  using (
    bucket_id in ('registry-covers', 'registry-avatars', 'custom-items')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "couples_delete_own_folder" on storage.objects;
create policy "couples_delete_own_folder" on storage.objects
  for delete to authenticated
  using (
    bucket_id in ('registry-covers', 'registry-avatars', 'custom-items')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------- Product images: admin-only write ----------
drop policy if exists "admin_write_products" on storage.objects;
create policy "admin_write_products" on storage.objects
  for all to authenticated
  using (bucket_id = 'products' and public.is_admin())
  with check (bucket_id = 'products' and public.is_admin());
