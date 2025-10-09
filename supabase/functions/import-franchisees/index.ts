import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateResult {
  email: string;
  name: string;
  status: 'success' | 'ignored' | 'error';
  reason?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // --- Get Credentials ---
    const MATRIZ_URL = Deno.env.get('MATRIZ_URL');
    const MATRIZ_SERVICE_KEY = Deno.env.get('MATRIZ_SERVICE_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!MATRIZ_URL || !MATRIZ_SERVICE_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Credenciais do Supabase (local e matriz) não configuradas.');
    }

    // --- Create Clients ---
    const supabaseMatriz = createClient(MATRIZ_URL, MATRIZ_SERVICE_KEY);
    const supabaseLocal = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // --- Fetch Data from Matriz ---
    console.log("Fetching data from Matriz...");
    const { data: franqueadosMatriz, error: franqueadosError } = await supabaseMatriz.from('franqueados').select('*');
    if (franqueadosError) throw franqueadosError;

    const { data: vinculos, error: vinculosError } = await supabaseMatriz.from('franqueados_unidades').select('franqueado_id, unidade_id');
    if (vinculosError) throw vinculosError;

    const { data: unidadesMatriz, error: unidadesError } = await supabaseMatriz.from('unidades').select('id, group_code');
    if (unidadesError) throw unidadesError;

    // --- Create lookup maps for efficiency ---
    const unidadeIdToCodeMap = new Map(unidadesMatriz.map(u => [u.id, u.group_code]));
    const vinculosByFranqueadoId = vinculos.reduce((acc, v) => {
      if (!acc[v.franqueado_id]) {
        acc[v.franqueado_id] = [];
      }
      acc[v.franqueado_id].push(v.unidade_id);
      return acc;
    }, {} as Record<string, string[]>);

    const results: CreateResult[] = [];
    const defaultPassword = "Trocar01";

    console.log(`Found ${franqueadosMatriz.length} franchisees to process.`);

    // --- Process each franchisee ---
    for (const franqueado of franqueadosMatriz) {
      const result: CreateResult = { email: franqueado.email, name: franqueado.full_name, status: 'error' };

      try {
        if (!franqueado.email || !franqueado.full_name) {
          result.reason = 'Email ou nome não preenchido na Matriz.';
          results.push(result);
          continue;
        }

        // Check for existing user in local DB
        const { data: existingUser } = await supabaseLocal.from('users').select('id').eq('email', franqueado.email).maybeSingle();
        if (existingUser) {
          result.status = 'ignored';
          result.reason = 'Usuário já existe no sistema de treinamento.';
          results.push(result);
          continue;
        }

        // Find linked unit codes
        const linkedUnidadeIds = vinculosByFranqueadoId[franqueado.id] || [];
        const unitCodes = linkedUnidadeIds.map(unidadeId => unidadeIdToCodeMap.get(unidadeId)).filter(Boolean);

        // Create auth user
        const { data: authUser, error: authError } = await supabaseLocal.auth.admin.createUser({
          email: franqueado.email,
          password: franqueado.systems_password || defaultPassword,
          email_confirm: true,
          user_metadata: {
            full_name: franqueado.full_name,
            user_type: 'Aluno',
            role: 'Franqueado',
            unit_codes: unitCodes,
          }
        });
        if (authError) throw authError;
        if (!authUser.user) throw new Error('Falha ao criar usuário na autenticação.');

        // Create user profile in public.users
        const { error: userError } = await supabaseLocal.from('users').insert({
          id: authUser.user.id,
          name: franqueado.full_name,
          email: franqueado.email,
          phone: franqueado.contact,
          cpf: franqueado.cpf_rnm,
          user_type: 'Aluno',
          role: 'Franqueado',
          unit_code: unitCodes.length > 0 ? unitCodes[0] : null,
          unit_codes: unitCodes.length > 0 ? unitCodes : null,
          approval_status: 'aprovado',
          visible_password: franqueado.systems_password || defaultPassword,
        });
        if (userError) {
          // Rollback auth user creation if profile insert fails
          await supabaseLocal.auth.admin.deleteUser(authUser.user.id);
          throw userError;
        }

        result.status = 'success';
        results.push(result);

      } catch (error) {
        result.reason = error.message;
        results.push(result);
      }
    }

    const summary = results.reduce((acc, r) => {
      acc[r.status]++;
      return acc;
    }, { success: 0, ignored: 0, error: 0 });

    console.log("Import finished. Summary:", summary);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Importação concluída. ${summary.success} criados, ${summary.ignored} ignorados, ${summary.error} erros.`,
        summary,
        errors: results.filter(r => r.status === 'error'),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('[import-franchisees] Erro:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});