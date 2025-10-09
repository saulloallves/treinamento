
-- Create whatsapp_dispatches table
CREATE TABLE public.whatsapp_dispatches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('curso', 'aula')),
  item_id UUID NOT NULL,
  item_name TEXT NOT NULL,
  recipients_count INTEGER NOT NULL DEFAULT 0,
  message TEXT NOT NULL,
  sent_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'enviado',
  delivered_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users
);

-- Add RLS policy
ALTER TABLE public.whatsapp_dispatches ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view whatsapp dispatches" ON public.whatsapp_dispatches FOR SELECT USING (true);
CREATE POLICY "Admins can manage whatsapp dispatches" ON public.whatsapp_dispatches FOR ALL USING (auth.uid() IS NOT NULL);

-- Add trigger for updated_at column  
CREATE TRIGGER update_whatsapp_dispatches_updated_at 
  BEFORE UPDATE ON public.whatsapp_dispatches 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();
