-- Create table to log synchronization operations
CREATE TABLE IF NOT EXISTS public.sync_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID, -- Can be null if entity doesn't have a UUID from matriz
  operation TEXT NOT NULL,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for security
ALTER TABLE public.sync_audit_log ENABLE ROW LEVEL SECURITY;

-- Create policies: only admins can view logs
CREATE POLICY "Admins can view sync logs"
ON public.sync_audit_log
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Allow inserts from authenticated users (or service roles)
CREATE POLICY "Allow inserts for sync operations"
ON public.sync_audit_log
FOR INSERT
TO authenticated
WITH CHECK (true);