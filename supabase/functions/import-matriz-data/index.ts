import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to map Matriz store phase
function mapearStatus(storePhase: string | null | undefined): string {
  const phase = storePhase?.toLowerCase() || '';
  if (['operacao', 'operação', 'ativo'].includes(phase)) return 'OPERAÇÃO';
  if (['implantacao', 'implantação'].includes(phase)) return 'IMPLANTAÇÃO';
  if (['suspenso', 'pausado'].includes(phase)) return 'SUSPENSO';
  if (['cancelado', 'encerrado'].includes(phase)) return 'CANCELADO';
  return 'IMPLANTAÇÃO'; // Default value
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // --- Get Matriz Credentials ---
    const MATRIZ_URL = Deno.env.get('MATRIZ_URL');
    const MATRIZ_SERVICE_KEY = Deno.env.get('MATRIZ_SERVICE_KEY');
    if (!MATRIZ_URL || !MATRIZ_SERVICE_KEY) {
      throw new Error('Credenciais da Matriz (MATRIZ_URL, MATRIZ_SERVICE_KEY) não configuradas.');
    }

    // --- Create Clients ---
    const supabaseMatriz = createClient(MATRIZ_URL, MATRIZ_SERVICE_KEY);
    const supabaseLocal = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // --- Fetch all units from Matriz ---
    const { data: unidadesMatriz, error: fetchError } = await supabaseMatriz
      .from('unidades')
      .select('*');

    if (fetchError) throw fetchError;

    let successCount = 0;
    const errors = [];

    // --- Process each unit ---
    for (const record of unidadesMatriz) {
      try {
        const params = {
          p_id_matriz: record.id,
          p_codigo_grupo: record.group_code,
          p_grupo: record.group_name,
          p_email: record.email,
          p_telefone: record.phone,
          p_fase_loja: mapearStatus(record.store_phase),
          p_etapa_loja: record.store_imp_phase,
          p_modelo_loja: record.store_model,
          p_endereco: record.address,
          p_cidade: record.city,
          p_estado: record.state,
          p_uf: record.uf,
          p_cep: record.postal_code,
          p_created_at_matriz: record.created_at,
          p_updated_at_matriz: record.updated_at,
          p_raw_payload: record,
        };

        const { error: rpcError } = await supabaseLocal.rpc('upsert_unidade_from_matriz', params);
        if (rpcError) throw rpcError;
        
        successCount++;
      } catch (error) {
        errors.push({ unit_code: record.group_code, error: error.message });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Importação concluída. ${successCount} unidades processadas. ${errors.length} erros.`,
        summary: {
          total: unidadesMatriz.length,
          success: successCount,
          failures: errors.length,
        },
        errors: errors,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('[import-matriz-data] Erro:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});