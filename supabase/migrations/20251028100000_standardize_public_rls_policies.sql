-- Este script automatiza a padronização das políticas de RLS para o schema 'public'.
-- Ele remove todas as políticas existentes e cria uma política padrão que é
-- permissiva tanto para usuários autenticados quanto para a service_role.

DO $$
DECLARE
    table_record RECORD;
    policy_record RECORD;
BEGIN
    -- Itera sobre todas as tabelas no schema 'public'.
    FOR table_record IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
        RAISE NOTICE 'Processando tabela: %', table_record.tablename;

        -- Garante que a RLS esteja habilitada.
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', table_record.tablename);
        -- Garante que, por padrão, o acesso seja negado.
        EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY;', table_record.tablename);

        -- Remove todas as políticas existentes na tabela.
        FOR policy_record IN 
            SELECT policyname 
            FROM pg_policies 
            WHERE schemaname = 'public' AND tablename = table_record.tablename
        LOOP
            RAISE NOTICE '  -> Removendo política antiga: %', policy_record.policyname;
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', policy_record.policyname, table_record.tablename);
        END LOOP;

        -- Cria a nova política padrão "server-side aware".
        RAISE NOTICE '  -> Criando política padrão para authenticated e service_role.';
        EXECUTE format('
            CREATE POLICY "Acesso para autenticados e serviço"
            ON public.%I
            FOR ALL
            USING (
              auth.role() = ''authenticated'' OR auth.role() = ''service_role''
            )
            WITH CHECK (
              auth.role() = ''authenticated'' OR auth.role() = ''service_role''
            );
        ', table_record.tablename);

    END LOOP;
END $$;
