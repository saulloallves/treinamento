-- Habilitar extensões necessárias para cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Configurar cron job para executar disparos automáticos a cada 5 minutos
SELECT cron.schedule(
  'whatsapp-automated-dispatches',
  '*/5 * * * *', -- A cada 5 minutos
  $$
  SELECT
    net.http_post(
      url:='https://tctkacgbhqvkqovctrzf.supabase.co/functions/v1/whatsapp-scheduler',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjdGthY2diaHF2a3FvdmN0cnpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0OTExNjMsImV4cCI6MjA3MDA2NzE2M30.Knud71onMpgQdAxjl_kyotWjZq2N0g-vsvqpT9lZqy4"}'::jsonb,
      body:=json_build_object('time', now())::jsonb
    ) as request_id;
  $$
);

-- Ver os cron jobs agendados
SELECT * FROM cron.job;