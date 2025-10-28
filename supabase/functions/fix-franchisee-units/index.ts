import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FixResult {
  cpf: string;
  status: 'success' | 'skipped' | 'error';
  message: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // --- Setup dos Clientes Supabase ---
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    const supabasePublic = createClient(supabaseUrl, supabaseServiceKey, { db: { schema: 'public' } });
    const supabaseTreinamento = createClient(supabaseUrl, supabaseServiceKey, { db: { schema: 'treinamento' } });

    // --- Etapa 2: Receber a lista de usuários do corpo da requisição ---
    const usersToFix = await req.json();
    if (!Array.isArray(usersToFix)) {
      throw new Error("O corpo da requisição deve ser um array de usuários.");
    }

    const results: FixResult[] = [];

    // --- Etapa 3: Iterar sobre a lista fornecida, Re-buscar Vínculos e Atualizar ---
    for (const user of usersToFix) {
      if (!user.cpf) {
        results.push({ cpf: 'N/A', status: 'skipped', message: `Usuário com ID ${user.id} não possui CPF.` });
        continue;
      }

      try {
        // 1. Buscar o ID original do franqueado no schema public usando o CPF
        const { data: originalFranchisee, error: franchiseeError } = await supabasePublic
          .from('franqueados')
          .select('id')
          .eq('cpf_rnm', user.cpf)
          .single();

        if (franchiseeError || !originalFranchisee) {
          results.push({ cpf: user.cpf, status: 'skipped', message: 'Registro original do franqueado não encontrado no schema public.' });
          continue;
        }

        // 2. Re-buscar todos os vínculos de unidade
        const { data: vinculos, error: vinculosError } = await supabasePublic
          .from('franqueados_unidades')
          .select('unidade:unidades!franqueados_unidades_unidade_id_fkey(group_code, group_name)')
          .eq('franqueado_id', originalFranchisee.id);

        if (vinculosError) throw new Error(`Erro ao re-buscar vínculos: ${vinculosError.message}`);
        if (!vinculos || vinculos.length === 0) {
          results.push({ cpf: user.cpf, status: 'skipped', message: 'Nenhuma unidade vinculada encontrada.' });
          continue;
        }

        // 3. Processar os dados corrigidos
        const unitCodes = vinculos.map(v => v.unidade.group_code.toString());
        const unitNames = vinculos.map(v => v.unidade.group_name).join(', ');

        // 4. Executar o UPDATE na tabela treinamento.users
        const { error: updateError } = await supabaseTreinamento
          .from('users')
          .update({
            unit_codes: unitCodes,
            nomes_unidades: unitNames,
          })
          .eq('id', user.id);

        if (updateError) throw updateError;

        results.push({ cpf: user.cpf, status: 'success', message: `Corrigido com ${unitCodes.length} unidade(s).` });

      } catch (error) {
        results.push({ cpf: user.cpf, status: 'error', message: error.message });
      }
    }

    // --- Etapa 4: Retornar Relatório Final ---
    return new Response(
      JSON.stringify({
        message: `Correção concluída. ${results.filter(r => r.status === 'success').length} sucesso(s), ${results.filter(r => r.status === 'error').length} erro(s), ${results.filter(r => r.status === 'skipped').length} ignorado(s).`,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
