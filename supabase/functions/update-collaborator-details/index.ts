import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // --- Inicialização dos Clientes Supabase ---
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    // Cliente para o schema 'treinamento' (operações internas)
    const supabaseTreinamento = createClient(supabaseUrl, supabaseServiceKey, {
      db: { schema: 'treinamento' }
    });

    // Cliente para o schema 'public' (operações da Matriz)
    const supabasePublic = createClient(supabaseUrl, supabaseServiceKey, {
      db: { schema: 'public' }
    });

    const details = await req.json();
    console.log('Dados recebidos para aprovação:', details);

    // --- ETAPA 1: Atualizar dados na Matriz (schema public) ---
    const { error: publicUpdateError } = await supabasePublic
      .from('colaboradores_loja')
      .update({
        admission_date: details.admission_date,
        instagram_profile: details.instagram_profile,
        meal_voucher_active: details.meal_voucher_active,
        meal_voucher_value: details.meal_voucher_value,
        transport_voucher_active: details.transport_voucher_active,
        transport_voucher_value: details.transport_voucher_value,
        health_plan: details.health_plan,
        basic_food_basket_active: details.basic_food_basket_active,
        basic_food_basket_value: details.basic_food_basket_value,
        cost_assistance_active: details.cost_assistance_active,
        cost_assistance_value: details.cost_assistance_value,
        salary: details.salary
      })
      .eq('email', details.email);

    if (publicUpdateError) {
      console.error('Erro ao atualizar colaborador na Matriz (public):', publicUpdateError);
      throw new Error(`Falha ao sincronizar com a Matriz: ${publicUpdateError.message}`);
    }
    console.log(`✅ Colaborador ${details.email} atualizado na Matriz.`);

    // --- ETAPA 2: Atualizar status no sistema de Treinamento (schema treinamento) ---
    const { error: treinamentoUpdateError } = await supabaseTreinamento
      .from('users') // Supondo que a tabela de status seja 'users' no treinamento
      .update({ approval_status: 'aprovado' })
      .eq('email', details.email);

    if (treinamentoUpdateError) {
      console.error('Erro ao aprovar colaborador no Treinamento:', treinamentoUpdateError);
      // Idealmente, aqui teríamos uma lógica para reverter a atualização na Matriz (transação)
      throw new Error(`Falha ao aprovar colaborador no sistema: ${treinamentoUpdateError.message}`);
    }
    console.log(`✅ Status do colaborador ${details.email} atualizado para 'aprovado' no Treinamento.`);

    // --- Resposta de Sucesso ---
    return new Response(JSON.stringify({
      success: true,
      message: 'Colaborador aprovado e dados sincronizados com a Matriz.'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Erro na função update-collaborator-details:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500 // Retornar 500 em caso de erro
    });
  }
});