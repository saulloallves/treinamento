-- Criar política para permitir acesso público aos enrollments por unit_code
-- Isso permite que a API pública acesse os dados das inscrições

CREATE POLICY "Public access to enrollments by unit_code" 
ON public.enrollments 
FOR SELECT 
USING (unit_code IS NOT NULL);

-- Alterar as configurações de RLS para permitir consultas anônimas na API
-- Criar função para uso do service role na edge function