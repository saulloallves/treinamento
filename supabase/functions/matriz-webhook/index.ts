import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret',
};

// Helper function to map Matriz store phase to our local status
function mapearStatus(storePhase: string | null | undefined): string {
  const phase = storePhase?.toLowerCase() || '';
  if (['operacao', 'operação', 'ativo'].includes(phase)) return 'OPERAÇÃO';
  if (['implantacao', 'implantação'].includes(phase)) return 'IMPLANTAÇÃO';
  if (['suspenso', 'pausado'].includes(phase)) return 'SUSPENSO';
  if (['cancelado', 'encerrado'].includes(phase)) return 'CANCELADO';
  return 'IMPLANTAÇÃO'; // Default value
}

// Specific processing function for 'unidades' table
async function processarUnidade(supabase: any, record: any) {
  const params = {
    p_id_matriz: record.id,
    p_codigo_grupo: record.group_code,
    p_grupo: record.group_name,
    p_email: record.email,
    p_telefone: record.phone,
    p_fase_loja: mapearStatus(record.store_phase),
    p_etapa_loja: record.store_imp_phase, // Corrected from store_step
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

  const { error } = await supabase.rpc('upsert_unidade_from_matriz', params);

  if (error) {
    console.error('Error calling RPC upsert_unidade_from_matriz:', error);
    throw error;
  }
}

// Placeholder for 'franqueados' processing
async function processarFranqueado(supabase: any, record: any) {
  console.log('Processing franqueado record (placeholder):', record.id);
  // Future implementation will call an RPC like 'upsert_franqueado_from_matriz'
  await Promise.resolve();
}

// Placeholder for 'franqueados_unidades' processing
async function processarVinculo(supabase: any, record: any) {
  console.log('Processing franqueado-unidade link (placeholder):', record.id);
  // Future implementation will call an RPC like 'upsert_franqueado_unidade_from_matriz'
  await Promise.resolve();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const bodyText = await req.text();
    const { table, record } = JSON.parse(bodyText);

    if (!table || !record) {
      throw new Error('Payload inválido: table e record são obrigatórios.');
    }

    // --- HMAC Signature Validation (Optional but Recommended) ---
    const secret = Deno.env.get('MATRIZ_WEBHOOK_SECRET');
    const signature = req.headers.get('X-Webhook-Signature');

    if (secret && signature) {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      const mac = await crypto.subtle.sign('HMAC', key, encoder.encode(bodyText));
      const hashHex = Array.from(new Uint8Array(mac)).map(b => b.toString(16).padStart(2, '0')).join('');
      
      if (hashHex !== signature) {
        console.error('Invalid HMAC signature');
        return new Response(JSON.stringify({ error: 'Assinatura inválida' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }
    // --- End of HMAC Validation ---

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`Processing webhook for table: ${table}`);

    // Process data based on the table name
    if (table === 'unidades') {
      await processarUnidade(supabaseAdmin, record);
    } else if (table === 'franqueados') {
      await processarFranqueado(supabaseAdmin, record);
    } else if (table === 'franqueados_unidades') {
      await processarVinculo(supabaseAdmin, record);
    } else {
      console.log(`No handler for table: ${table}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: `${table} processado com sucesso` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('[matriz-webhook] Erro:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});