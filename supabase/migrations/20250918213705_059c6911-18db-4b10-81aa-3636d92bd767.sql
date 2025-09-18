-- Critical security fix: Remove policies that expose student data publicly

-- Remove the most dangerous policy that allows public access
DROP POLICY IF EXISTS "Public access to enrollments by unit_code" ON public.enrollments;

-- Remove policy that allows ALL authenticated users to view ALL enrollments  
DROP POLICY IF EXISTS "Authenticated users can view all enrollments" ON public.enrollments;

-- The remaining existing policies should be sufficient:
-- - "Admins can view all enrollments" (appropriate)
-- - "Students can view their own enrollments" (appropriate)  
-- - Plus any professor/franchisee-specific policies that may already exist

-- This removes the critical security vulnerabilities while preserving legitimate access