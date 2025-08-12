-- Ensure admin role infra and seed the known admin user

-- 1) Admin table (idempotent)
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text,
  name text,
  role text not null default 'admin',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Security-definer function for role check (idempotent)
create or replace function public.is_admin(_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users au
    where au.user_id = _user
      and au.active = true
  );
$$;

-- 3) Seed/ensure the specified admin user is active admin (idempotent)
insert into public.admin_users (user_id, email, name, role, active)
select 
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data->>'full_name', u.email),
  'admin',
  true
from auth.users u
where u.id = '5b0e75b2-aef0-4ae8-a761-577314d607b3'::uuid
on conflict (user_id) do nothing;

update public.admin_users
set active = true, role = 'admin'
where user_id = '5b0e75b2-aef0-4ae8-a761-577314d607b3'::uuid;