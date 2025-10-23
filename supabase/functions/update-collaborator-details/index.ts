import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // --- Inicialização dos Clientes Supabase ---
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    // Cliente para autenticar o franqueado que está fazendo a requisição
    const supabaseUserClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: req.headers.get('Authorization') } },
    });
    const { data: { user } } = await supabaseUserClient.auth.getUser();
    if (!user) throw new Error("Usuário franqueado não autenticado.");

    // Cliente com Service Key para o schema 'treinamento'
    const supabaseTreinamento = createClient(supabaseUrl, supabaseServiceKey, {
      db: { schema: 'treinamento' }
    });

    // Cliente com Service Key para o schema 'public' (Matriz)
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
        salary: details.salary,
        // Importante: garantir que o colaborador seja ativado na matriz também
        is_active_system: true,
      })
      .eq('email', details.email);

    if (publicUpdateError) {
      console.error('Erro ao atualizar colaborador na Matriz (public):', publicUpdateError);
      throw new Error(`Falha ao sincronizar com a Matriz: ${publicUpdateError.message}`);
    }
    console.log(`✅ Colaborador ${details.email} atualizado na Matriz.`);

    // --- ETAPA 2: Aprovar colaborador no sistema de Treinamento (schema treinamento) ---
    const { error: treinamentoUpdateError } = await supabaseTreinamento
      .from('users')
      .update({ approval_status: 'aprovado', active: true })
      .eq('email', details.email);

    if (treinamentoUpdateError) {
      console.error('Erro ao aprovar colaborador no Treinamento:', treinamentoUpdateError);
      throw new Error(`Falha ao aprovar colaborador no sistema: ${treinamentoUpdateError.message}`);
    }
    console.log(`✅ Status do colaborador ${details.email} atualizado para 'aprovado' no Treinamento.`);

    // --- ETAPA 3: Coletar dados e invocar a criação do grupo de WhatsApp ---
    try {
      // Buscar dados do franqueado, colaborador e unidade
      const { data: franqueadoData, error: franqueadoError } = await supabaseTreinamento.from('users').select('phone').eq('id', user.id).single();
      const { data: colaboradorData, error: colaboradorError } = await supabaseTreinamento.from('users').select('name, phone, unit_code').eq('email', details.email).single();
      
      if (franqueadoError || colaboradorError) throw new Error(`Erro ao buscar dados para criar grupo: ${franqueadoError?.message || colaboradorError?.message}`);
      if (!franqueadoData || !colaboradorData) throw new Error("Dados do franqueado ou colaborador não encontrados.");

      const { data: unidadeData, error: unidadeError } = await supabasePublic.from('unidades').select('group_name').eq('group_code', colaboradorData.unit_code).single();
      if (unidadeError) throw new Error(`Erro ao buscar nome da unidade: ${unidadeError.message}`);
      if (!unidadeData) throw new Error("Unidade não encontrada.");

      const groupPayload = {
        collaboratorName: colaboradorData.name,
        collaboratorPhone: colaboradorData.phone,
        franchiseePhone: franqueadoData.phone,
        unitName: unidadeData.group_name
      };

      console.log("Invocando 'create-collaborator-group' com o payload:", groupPayload);

      // Invocar a função que cria o grupo
      const { error: invokeError } = await supabaseTreinamento.functions.invoke('create-collaborator-group', {
        body: groupPayload
      });

      if (invokeError) {
        throw new Error(`Invocação da criação de grupo falhou: ${invokeError.message}`);
      }

      console.log("✅ Invocação para criar grupo de WhatsApp enviada com sucesso.");

    } catch (groupError) {
      // Se a criação do grupo falhar, apenas registramos o erro.
      // A aprovação do colaborador já foi bem-sucedida e não será revertida.
      console.error("⚠️ Falha na etapa de criação do grupo de WhatsApp, mas o colaborador foi aprovado. Erro:", groupError.message);
    }

    // --- Resposta de Sucesso Final ---
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
      status: 500
    });
  }
});