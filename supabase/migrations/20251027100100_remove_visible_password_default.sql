-- Remove o valor padrão 'Trocar01' da coluna visible_password.
ALTER TABLE treinamento.users ALTER COLUMN visible_password DROP DEFAULT;
