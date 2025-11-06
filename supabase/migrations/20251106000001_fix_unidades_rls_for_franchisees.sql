-- Migration: Fix RLS policies for public.unidades to allow franchisees to see their units
-- Date: 2025-11-06
-- Description: Update RLS policies to allow users to see units based on their unit_code/unit_codes

-- Drop existing policies
DROP POLICY IF EXISTS "Allow SELECT on unidades based on permissions" ON public.unidades;
DROP POLICY IF EXISTS "Allow INSERT on unidades based on permissions" ON public.unidades;
DROP POLICY IF EXISTS "Allow UPDATE on unidades based on permissions" ON public.unidades;
DROP POLICY IF EXISTS "Allow DELETE on unidades based on permissions" ON public.unidades;

-- Create new SELECT policy that allows:
-- 1. Users with explicit table permissions (via has_table_permission)
-- 2. Franqueados to see their own units (via unit_code or unit_codes)
CREATE POLICY "Allow SELECT on unidades for authorized users"
ON public.unidades
FOR SELECT
TO public
USING (
  -- Allow if user has explicit permission
  has_table_permission(auth.uid(), 'unidades'::text, 'read'::text)
  OR
  -- Allow if user is a Franqueado and the unit matches their unit_code
  (
    EXISTS (
      SELECT 1 FROM treinamento.users u
      WHERE u.id = auth.uid()
      AND u.role = 'Franqueado'
      AND (
        -- Match by single unit_code
        unidades.group_code::text = u.unit_code
        OR
        -- Match by unit_codes array
        unidades.group_code::text = ANY(u.unit_codes)
      )
    )
  )
);

-- Create INSERT policy (only for users with explicit permissions)
CREATE POLICY "Allow INSERT on unidades for authorized users"
ON public.unidades
FOR INSERT
TO public
WITH CHECK (
  has_table_permission(auth.uid(), 'unidades'::text, 'write'::text)
);

-- Create UPDATE policy (only for users with explicit permissions)
CREATE POLICY "Allow UPDATE on unidades for authorized users"
ON public.unidades
FOR UPDATE
TO public
USING (
  has_table_permission(auth.uid(), 'unidades'::text, 'write'::text)
)
WITH CHECK (
  has_table_permission(auth.uid(), 'unidades'::text, 'write'::text)
);

-- Create DELETE policy (only for users with explicit permissions)
CREATE POLICY "Allow DELETE on unidades for authorized users"
ON public.unidades
FOR DELETE
TO public
USING (
  has_table_permission(auth.uid(), 'unidades'::text, 'delete'::text)
);

-- Add comment explaining the policy
COMMENT ON POLICY "Allow SELECT on unidades for authorized users" ON public.unidades IS 
'Allows users to SELECT from unidades if they have explicit table permissions OR if they are a Franqueado and the unit matches their unit_code or is in their unit_codes array';
