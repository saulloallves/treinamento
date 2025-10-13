-- Verificar ENUMs criados no schema treinamento
SELECT typname, enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'treinamento') ORDER BY typname, enumsortorder;
