-- Limpar valores placeholder indevidos da tabela turmas
UPDATE turmas 
SET responsavel_name = NULL 
WHERE responsavel_name IN ('Professor Não Definido', 'Professor não definido', 'Professor Definido', 'Professor definido');