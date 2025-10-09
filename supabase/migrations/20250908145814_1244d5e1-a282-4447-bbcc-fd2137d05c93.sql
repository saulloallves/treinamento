-- Create a cron job to run the WhatsApp scheduler every minute
-- This will process scheduled WhatsApp dispatches automatically
SELECT
  cron.schedule(
    'whatsapp-scheduler',
    '* * * * *', -- Every minute
    $$
    SELECT
      net.http_post(
        url := 'https://tctkacgbhqvkqovctrzf.supabase.co/functions/v1/whatsapp-scheduler',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjdGthY2diaHF2a3FvdmN0cnpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0OTExNjMsImV4cCI6MjA3MDA2NzE2M30.Knud71onMpgQdAxjl_kyotWjZq2N0g-vsvqpT9lZqy4"}'::jsonb,
        body := concat('{"timestamp": "', now(), '"}')::jsonb
      ) as request_id;
    $$
  );

-- Also create a function to manually trigger the scheduler if needed
CREATE OR REPLACE FUNCTION public.trigger_whatsapp_scheduler()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only admins can manually trigger the scheduler
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied. Admin access required.';
  END IF;
  
  -- Trigger the scheduler via HTTP request
  PERFORM net.http_post(
    url := 'https://tctkacgbhqvkqovctrzf.supabase.co/functions/v1/whatsapp-scheduler',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjdGthY2diaHF2a3FvdmN0cnpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0OTExNjMsImV4cCI6MjA3MDA2NzE2M30.Knud71onMpgQdAxjl_kyotWjZq2N0g-vsvqpT9lZqy4"}'::jsonb,
    body := concat('{"timestamp": "', now(), '", "manual": true}')::jsonb
  );
END;
$$;