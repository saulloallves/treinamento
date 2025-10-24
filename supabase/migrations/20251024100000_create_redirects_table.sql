CREATE TABLE IF NOT EXISTS public.redirects (
  slug TEXT PRIMARY KEY,
  long_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adiciona um índice para buscas rápidas
CREATE INDEX IF NOT EXISTS idx_redirects_slug ON public.redirects(slug);
