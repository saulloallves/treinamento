-- Este script automatiza a padronização das políticas de RLS para o schema 'public'.
-- Ele remove todas as políticas existentes e cria uma política padrão "permissiva para autenticados".

DO $$
DECLARE
    -- Variável para iterar sobre cada tabela encontrada.
    table_record RECORD;
    -- Variável para iterar sobre cada política encontrada em uma tabela.
    policy_record RECORD;
BEGIN
    -- 1. Itera sobre todas as tabelas no schema 'public'.
    FOR table_record IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
        RAISE NOTICE 'Processando tabela: %', table_record.tablename;

        -- 2. Garante que a Segurança a Nível de Linha (RLS) esteja habilitada na tabela.
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', table_record.tablename);

        -- 3. Remove todas as políticas existentes na tabela para evitar conflitos.
        FOR policy_record IN 
            SELECT policyname 
            FROM pg_policies 
            WHERE schemaname = 'public' AND tablename = table_record.tablename
        LOOP
            RAISE NOTICE '  -> Removendo política antiga: %', policy_record.policyname;
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', policy_record.policyname, table_record.tablename);
        END LOOP;

        -- 4. Cria a nova política padrão para usuários autenticados.
        RAISE NOTICE '  -> Criando política padrão para usuários autenticados.';
        EXECUTE format('
            CREATE POLICY "Acesso total para usuários autenticados"
            ON public.%I
            FOR ALL
            TO authenticated
            USING (true)
            WITH CHECK (true);
        ', table_record.tablename);

    END LOOP;
END $$;
