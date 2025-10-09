-- 1) Add unit_code to public.users to store the registration code
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS unit_code text;

-- 2) Backfill unit_code from auth metadata (unit_code)
CREATE OR REPLACE FUNCTION public.backfill_users_unit_code()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.users u
  SET unit_code = (
    SELECT au.raw_user_meta_data ->> 'unit_code'
    FROM auth.users au
    WHERE au.id = u.id
  )
  WHERE u.unit_code IS NULL;
END;
$$;

SELECT public.backfill_users_unit_code();

-- 3) Helpful index
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i'
      AND c.relname = 'idx_users_unit_code'
      AND n.nspname = 'public'
  ) THEN
    CREATE INDEX idx_users_unit_code ON public.users (unit_code);
  END IF;
END $$;