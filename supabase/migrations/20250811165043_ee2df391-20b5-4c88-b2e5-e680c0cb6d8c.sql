-- Tighten RLS on public.users to prevent public exposure of PII

-- 1) Helper function to check admin role based on admin_users table
create or replace function public.is_admin(_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users au
    where au.user_id = _user and au.active = true
  );
$$;

-- 2) Replace overly-permissive policies on public.users
alter table public.users enable row level security;

-- Drop existing permissive policies if present
drop policy if exists "Anyone can view users" on public.users;
drop policy if exists "Admins can manage users" on public.users;

-- 3) Create safer policies
-- Allow only authenticated users to read users (removes public access)
create policy "Authenticated users can view users"
  on public.users
  for select
  to authenticated
  using (auth.uid() is not null);

-- Only admins (as per admin_users) can insert/update/delete
create policy "Admins can manage users strictly"
  on public.users
  for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));