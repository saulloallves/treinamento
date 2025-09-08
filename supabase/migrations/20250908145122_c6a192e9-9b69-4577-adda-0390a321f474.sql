-- Add scheduled dispatch fields to whatsapp_dispatches table
ALTER TABLE public.whatsapp_dispatches 
ADD COLUMN scheduled_at TIMESTAMP WITH TIME ZONE NULL,
ADD COLUMN is_scheduled BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN processed BOOLEAN NOT NULL DEFAULT false;

-- Update existing dispatches to set processed = true since they were already sent
UPDATE public.whatsapp_dispatches 
SET processed = true 
WHERE status IN ('enviado', 'parcial', 'erro');

-- Create index for scheduled dispatches for better performance
CREATE INDEX idx_whatsapp_dispatches_scheduled 
ON public.whatsapp_dispatches (scheduled_at, is_scheduled, processed) 
WHERE is_scheduled = true AND processed = false;