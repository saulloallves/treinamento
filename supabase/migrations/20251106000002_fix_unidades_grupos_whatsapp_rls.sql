-- Migration: Fix RLS policies for public.unidades_grupos_whatsapp
-- Date: 2025-11-06
-- Description: Allow franchisees to see WhatsApp groups for their units

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow SELECT on unidades_grupos_whatsapp based on permissions" ON public.unidades_grupos_whatsapp;
DROP POLICY IF EXISTS "Allow INSERT on unidades_grupos_whatsapp based on permissions" ON public.unidades_grupos_whatsapp;
DROP POLICY IF EXISTS "Allow UPDATE on unidades_grupos_whatsapp based on permissions" ON public.unidades_grupos_whatsapp;
DROP POLICY IF EXISTS "Allow DELETE on unidades_grupos_whatsapp based on permissions" ON public.unidades_grupos_whatsapp;

-- Create SELECT policy for unidades_grupos_whatsapp
-- Allows users to see groups if:
-- 1. They have explicit table permissions
-- 2. They are a Franqueado and the group belongs to one of their units
CREATE POLICY "Allow SELECT on unidades_grupos_whatsapp for authorized users"
ON public.unidades_grupos_whatsapp
FOR SELECT
TO public
USING (
  -- Allow if user has explicit permission
  has_table_permission(auth.uid(), 'unidades_grupos_whatsapp'::text, 'read'::text)
  OR
  -- Allow if user is a Franqueado and the group belongs to their unit
  (
    EXISTS (
      SELECT 1 
      FROM treinamento.users u
      JOIN public.unidades un ON (
        un.group_code::text = u.unit_code 
        OR un.group_code::text = ANY(u.unit_codes)
      )
      WHERE u.id = auth.uid()
      AND u.role = 'Franqueado'
      AND un.id = unidades_grupos_whatsapp.unit_id
    )
  )
);

-- Create INSERT policy (only for users with explicit permissions)
CREATE POLICY "Allow INSERT on unidades_grupos_whatsapp for authorized users"
ON public.unidades_grupos_whatsapp
FOR INSERT
TO public
WITH CHECK (
  has_table_permission(auth.uid(), 'unidades_grupos_whatsapp'::text, 'write'::text)
);

-- Create UPDATE policy (only for users with explicit permissions)
CREATE POLICY "Allow UPDATE on unidades_grupos_whatsapp for authorized users"
ON public.unidades_grupos_whatsapp
FOR UPDATE
TO public
USING (
  has_table_permission(auth.uid(), 'unidades_grupos_whatsapp'::text, 'write'::text)
)
WITH CHECK (
  has_table_permission(auth.uid(), 'unidades_grupos_whatsapp'::text, 'write'::text)
);

-- Create DELETE policy (only for users with explicit permissions)
CREATE POLICY "Allow DELETE on unidades_grupos_whatsapp for authorized users"
ON public.unidades_grupos_whatsapp
FOR DELETE
TO public
USING (
  has_table_permission(auth.uid(), 'unidades_grupos_whatsapp'::text, 'delete'::text)
);

-- Add comment explaining the policy
COMMENT ON POLICY "Allow SELECT on unidades_grupos_whatsapp for authorized users" ON public.unidades_grupos_whatsapp IS 
'Allows users to SELECT WhatsApp groups if they have explicit table permissions OR if they are a Franqueado and the group belongs to one of their units (via unit_code or unit_codes array)';
