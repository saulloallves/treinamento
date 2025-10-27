-- Habilita a extensão pgcrypto, que fornece funções de criptografia,
-- incluindo a função gen_salt() necessária para criptografar senhas.
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
