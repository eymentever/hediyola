-- ============================================================================
-- Hediyola — Row Level Security policies & auth trigger
-- Run this in the Supabase SQL editor AFTER `prisma db push` / `migrate`.
-- Implements the access model from TECH_STACK.md §3 and SECURITY.md.
--
-- Model summary:
--   profiles        : a user reads/updates only their own row.
--   registries      : public SELECT when ACTIVE & public; owner full control.
--   products        : public read; only ADMIN writes.
--   registry_items  : readable when parent registry is readable; owner writes.
--   orders/items    : owner (couple) + admin read; guests insert via server.
--   payouts         : owner inserts/reads; admin reads & updates (approval).
--
-- NOTE: Privileged guest checkout & webhook writes use the service-role key,
-- which bypasses RLS by design and is only ever used server-side.
-- ============================================================================

-- ---------- Helper: is the current user an admin? ----------
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'ADMIN'
  );
$$;

-- ---------- Helper: does the current user own this registry? ----------
create or replace function public.owns_registry(rid uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.registries
    where id = rid and couple_id = auth.uid()
  );
$$;

-- ============================================================================
-- Enable RLS on every table (deny-by-default).
-- ============================================================================
alter table public.profiles        enable row level security;
alter table public.registries      enable row level security;
alter table public.products        enable row level security;
alter table public.registry_items  enable row level security;
alter table public.orders          enable row level security;
alter table public.order_items     enable row level security;
alter table public.payouts         enable row level security;

-- ============================================================================
-- profiles
-- ============================================================================
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid());
-- INSERT is handled by the auth trigger (security definer); no client INSERT.

-- ============================================================================
-- registries
-- ============================================================================
-- Public can read ACTIVE registries; passcode gating for private lists is
-- enforced server-side (the column itself is never selected for guests).
drop policy if exists "registries_select_public_or_owner" on public.registries;
create policy "registries_select_public_or_owner" on public.registries
  for select using (
    status = 'ACTIVE'
    or couple_id = auth.uid()
    or public.is_admin()
  );

drop policy if exists "registries_insert_owner" on public.registries;
create policy "registries_insert_owner" on public.registries
  for insert with check (couple_id = auth.uid());

drop policy if exists "registries_update_owner" on public.registries;
create policy "registries_update_owner" on public.registries
  for update using (couple_id = auth.uid() or public.is_admin())
  with check (couple_id = auth.uid() or public.is_admin());

drop policy if exists "registries_delete_owner" on public.registries;
create policy "registries_delete_owner" on public.registries
  for delete using (couple_id = auth.uid() or public.is_admin());

-- ============================================================================
-- products (global catalog)
-- ============================================================================
drop policy if exists "products_select_all" on public.products;
create policy "products_select_all" on public.products
  for select using (true);

drop policy if exists "products_write_admin" on public.products;
create policy "products_write_admin" on public.products
  for all using (public.is_admin())
  with check (public.is_admin());

-- ============================================================================
-- registry_items
-- ============================================================================
drop policy if exists "registry_items_select" on public.registry_items;
create policy "registry_items_select" on public.registry_items
  for select using (
    exists (
      select 1 from public.registries r
      where r.id = registry_items.registry_id
        and (r.status = 'ACTIVE' or r.couple_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists "registry_items_write_owner" on public.registry_items;
create policy "registry_items_write_owner" on public.registry_items
  for all using (public.owns_registry(registry_id) or public.is_admin())
  with check (public.owns_registry(registry_id) or public.is_admin());

-- ============================================================================
-- orders  (guests do NOT read; couples & admin do)
-- ============================================================================
drop policy if exists "orders_select_owner_admin" on public.orders;
create policy "orders_select_owner_admin" on public.orders
  for select using (public.owns_registry(registry_id) or public.is_admin());
-- INSERT/UPDATE happen server-side via service role (verified webhooks).

-- ============================================================================
-- order_items
-- ============================================================================
drop policy if exists "order_items_select_owner_admin" on public.order_items;
create policy "order_items_select_owner_admin" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (public.owns_registry(o.registry_id) or public.is_admin())
    )
  );

-- ============================================================================
-- payouts
-- ============================================================================
drop policy if exists "payouts_select_owner_admin" on public.payouts;
create policy "payouts_select_owner_admin" on public.payouts
  for select using (public.owns_registry(registry_id) or public.is_admin());

drop policy if exists "payouts_insert_owner" on public.payouts;
create policy "payouts_insert_owner" on public.payouts
  for insert with check (public.owns_registry(registry_id));

drop policy if exists "payouts_update_admin" on public.payouts;
create policy "payouts_update_admin" on public.payouts
  for update using (public.is_admin())
  with check (public.is_admin());

-- ============================================================================
-- Auth trigger: mirror auth.users -> public.profiles on signup
-- (keeps identity & role DB-enforced, never client-set). TECH_STACK §triggers.
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    'COUPLE'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
