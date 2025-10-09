-- Relax NOT NULL constraints to allow generic dispatches
ALTER TABLE public.whatsapp_dispatches
  ALTER COLUMN item_id DROP NOT NULL,
  ALTER COLUMN item_name DROP NOT NULL;