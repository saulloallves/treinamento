-- Adiciona a coluna para armazenar o ID da Matriz, se ainda não existir
ALTER TABLE public.unidades ADD COLUMN IF NOT EXISTS id_matriz UUID;

-- Adiciona a coluna para armazenar o payload JSON original da Matriz, se ainda não existir
ALTER TABLE public.unidades ADD COLUMN IF NOT EXISTS raw_payload_matriz JSONB;

-- Adiciona a coluna para registrar o timestamp da última sincronização, se ainda não existir
ALTER TABLE public.unidades ADD COLUMN IF NOT EXISTS sincronizado_em TIMESTAMP WITH TIME ZONE;