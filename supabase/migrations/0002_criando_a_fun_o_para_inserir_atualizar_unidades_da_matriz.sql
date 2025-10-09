-- Function to UPSERT unit data from the Matriz webhook
CREATE OR REPLACE FUNCTION public.upsert_unidade_from_matriz(
  p_id_matriz UUID,
  p_codigo_grupo BIGINT,
  p_grupo TEXT,
  p_email TEXT,
  p_telefone TEXT,
  p_fase_loja TEXT,
  p_etapa_loja TEXT,
  p_modelo_loja TEXT,
  p_endereco TEXT,
  p_cidade TEXT,
  p_estado TEXT,
  p_uf TEXT,
  p_cep TEXT,
  p_created_at_matriz TEXT,
  p_updated_at_matriz TEXT,
  p_raw_payload JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_telefone_bigint BIGINT;
BEGIN
  -- Clean and convert phone number from text to bigint
  BEGIN
    v_telefone_bigint := CAST(regexp_replace(p_telefone, '\D', '', 'g') AS BIGINT);
  EXCEPTION WHEN OTHERS THEN
    v_telefone_bigint := NULL;
  END;

  INSERT INTO public.unidades (
    id,
    id_matriz,
    codigo_grupo,
    grupo,
    email,
    telefone,
    fase_loja,
    etapa_loja,
    modelo_loja,
    endereco,
    cidade,
    estado,
    uf,
    cep,
    raw_payload_matriz,
    sincronizado_em,
    created_at,
    updated_at
  )
  VALUES (
    p_codigo_grupo::TEXT,
    p_id_matriz,
    p_codigo_grupo,
    p_grupo,
    p_email,
    v_telefone_bigint,
    p_fase_loja,
    p_etapa_loja,
    p_modelo_loja,
    p_endereco,
    p_cidade,
    p_estado,
    p_uf,
    p_cep,
    p_raw_payload,
    NOW(),
    p_created_at_matriz,
    p_updated_at_matriz
  )
  ON CONFLICT (codigo_grupo)
  DO UPDATE SET
    id = EXCLUDED.id,
    id_matriz = EXCLUDED.id_matriz,
    grupo = EXCLUDED.grupo,
    email = EXCLUDED.email,
    telefone = EXCLUDED.telefone,
    fase_loja = EXCLUDED.fase_loja,
    etapa_loja = EXCLUDED.etapa_loja,
    modelo_loja = EXCLUDED.modelo_loja,
    endereco = EXCLUDED.endereco,
    cidade = EXCLUDED.cidade,
    estado = EXCLUDED.estado,
    uf = EXCLUDED.uf,
    cep = EXCLUDED.cep,
    raw_payload_matriz = EXCLUDED.raw_payload_matriz,
    sincronizado_em = NOW(),
    created_at = EXCLUDED.created_at,
    updated_at = EXCLUDED.updated_at;

  -- Log the operation for auditing purposes
  INSERT INTO public.sync_audit_log (
    entity_type,
    entity_id,
    operation,
    raw_data
  )
  VALUES (
    'unidade',
    p_id_matriz,
    'UPSERT_FROM_MATRIZ',
    p_raw_payload
  );
END;
$$;