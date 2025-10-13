-- Script para criar usuário administrador inicial
-- Carlos Eduardo Turina
-- Email: carloseduardoturina@gmail.com
-- Telefone: 11939621151

-- IMPORTANTE: Execute este script no SQL Editor do Supabase do PROJETO DESTINO
-- Este script cria um admin com senha temporária: "Admin@2025"
-- O usuário deve alterar a senha no primeiro login

DO $$
DECLARE
  v_user_id uuid;
  v_encrypted_password text;
BEGIN
  -- Gerar hash da senha temporária "Admin@2025"
  v_encrypted_password := crypt('Admin@2025', gen_salt('bf'));
  
  -- 1. Criar usuário no auth.users
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    phone,
    phone_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  ) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'carloseduardoturina@gmail.com',
    v_encrypted_password,
    now(),
    '11939621151',
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"name": "Carlos Eduardo Turina", "phone": "11939621151"}'::jsonb,
    false,
    'authenticated',
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO v_user_id;

  -- 2. Inserir na tabela treinamento.users
  INSERT INTO treinamento.users (
    id,
    name,
    email,
    phone,
    user_type,
    role,
    active,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    'Carlos Eduardo Turina',
    'carloseduardoturina@gmail.com',
    '11939621151',
    'Admin',
    NULL,
    true,
    now(),
    now()
  );

  -- 3. Inserir na tabela treinamento.admin_users com status aprovado
  INSERT INTO treinamento.admin_users (
    user_id,
    name,
    email,
    role,
    status,
    active,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    'Carlos Eduardo Turina',
    'carloseduardoturina@gmail.com',
    'admin',
    'approved',
    true,
    now(),
    now()
  );

  RAISE NOTICE 'Usuário administrador criado com sucesso!';
  RAISE NOTICE 'Email: carloseduardoturina@gmail.com';
  RAISE NOTICE 'Senha temporária: Admin@2025';
  RAISE NOTICE 'User ID: %', v_user_id;
  RAISE NOTICE 'IMPORTANTE: Altere a senha no primeiro login!';

END $$;
