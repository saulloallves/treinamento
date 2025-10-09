-- Update is_admin to also check by email
CREATE OR REPLACE FUNCTION public.is_admin(_user uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  with me as (
    select u.id, u.email
    from auth.users u
    where u.id = _user
    limit 1
  )
  select exists (
    select 1
    from public.admin_users au
    cross join me
    where au.active = true
      and (
        au.user_id = _user
        or (
          au.email is not null
          and me.email is not null
          and lower(au.email) = lower(me.email)
        )
      )
  );
$$;

-- Optional but helpful: index for faster email lookups
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i'
      AND c.relname = 'idx_admin_users_email_active'
      AND n.nspname = 'public'
  ) THEN
    CREATE INDEX idx_admin_users_email_active ON public.admin_users (lower(email), active);
  END IF;
END $$;