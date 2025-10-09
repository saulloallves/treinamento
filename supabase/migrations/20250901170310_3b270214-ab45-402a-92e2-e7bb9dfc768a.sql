-- Criar políticas RLS para permitir operações de UPDATE e DELETE na tabela unidades
-- Apenas usuários autenticados podem fazer essas operações

-- Política para UPDATE
CREATE POLICY "Authenticated users can update unidades" 
ON public.unidades 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Política para DELETE  
CREATE POLICY "Authenticated users can delete unidades" 
ON public.unidades 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Política para INSERT (caso necessário no futuro)
CREATE POLICY "Authenticated users can insert unidades" 
ON public.unidades 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);