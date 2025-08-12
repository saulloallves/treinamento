-- Enable RLS and allow reads from unidades so we can resolve unit names by code
ALTER TABLE public.unidades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view unidades"
ON public.unidades
FOR SELECT
USING (true);