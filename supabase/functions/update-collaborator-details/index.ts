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
    // --- Inicialização e Autenticação ---
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    // Autentica o franqueado que está executando a ação
    const supabaseUserClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: req.headers.get('Authorization') } },
    });
    const { data: { user: franchiseeUser } } = await supabaseUserClient.auth.getUser();
    if (!franchiseeUser) throw new Error("Franqueado não autenticado.");

    // Cliente Admin para o schema 'treinamento'
    const supabaseTreinamento = createClient(supabaseUrl, supabaseServiceKey, {
      db: { schema: 'treinamento' }
    });
    
    // Cliente Admin para o schema 'public' (Matriz)
    const supabasePublic = createClient(supabaseUrl, supabaseServiceKey);

    const collaboratorDetails = await req.json();
    if (!collaboratorDetails.email) {
        throw new Error("O email do colaborador é necessário para a aprovação.");
    }
    console.log(`Iniciando aprovação para o colaborador: ${collaboratorDetails.email}`);
    console.log(`Dados recebidos do formulário:`, JSON.stringify(collaboratorDetails, null, 2));

    // Buscar unit_code do colaborador ANTES de atualizar a matriz
    console.log("Buscando unit_code do colaborador no sistema de Treinamento...");
    const { data: collaboratorData, error: collaboratorError } = await supabaseTreinamento
      .from('users')
      .select('unit_code')
      .eq('email', collaboratorDetails.email)
      .single();

    if (collaboratorError || !collaboratorData) {
      throw new Error(`Não foi possível encontrar o colaborador: ${collaboratorError?.message}`);
    }

    const collaboratorUnitCode = collaboratorData.unit_code;
    console.log(`✅ Unit code do colaborador: ${collaboratorUnitCode}`);

    // Função helper para limpar valores monetários (remover "R$", ".", e manter apenas números e vírgula)
    const cleanCurrencyValue = (value: string | undefined | null): string | null => {
      if (!value) return null;
      // Remove "R$", espaços, pontos (separadores de milhar) e mantém apenas números e vírgula
      const cleaned = value
        .replace(/R\$/g, '')
        .replace(/\s/g, '')
        .replace(/\./g, '')
        .trim();
      return cleaned || null;
    };

    // --- ETAPA 1: Atualizar Dados na Matriz (public.colaboradores_loja) ---
    console.log("Atualizando dados do colaborador na Matriz...");
    
    const matrizUpdateData: any = {
      updated_at: new Date().toISOString(),
      unit_code: collaboratorUnitCode, // Adicionar código da unidade
    };

    // Adicionar campos do formulário que foram preenchidos
    if (collaboratorDetails.admission_date) {
      matrizUpdateData.admission_date = collaboratorDetails.admission_date;
    }
    if (collaboratorDetails.instagram_profile) {
      matrizUpdateData.instagram_profile = collaboratorDetails.instagram_profile;
    }
    if (collaboratorDetails.salary) {
      // Limpar formatação monetária antes de salvar
      matrizUpdateData.salary = cleanCurrencyValue(collaboratorDetails.salary);
    }
    
    // Benefícios - sempre salvar boolean e valor condicional
    matrizUpdateData.meal_voucher_active = collaboratorDetails.meal_voucher_active || false;
    if (collaboratorDetails.meal_voucher_active && collaboratorDetails.meal_voucher_value) {
      matrizUpdateData.meal_voucher_value = cleanCurrencyValue(collaboratorDetails.meal_voucher_value);
    }
    
    matrizUpdateData.transport_voucher_active = collaboratorDetails.transport_voucher_active || false;
    if (collaboratorDetails.transport_voucher_active && collaboratorDetails.transport_voucher_value) {
      matrizUpdateData.transport_voucher_value = cleanCurrencyValue(collaboratorDetails.transport_voucher_value);
    }
    
    matrizUpdateData.health_plan = collaboratorDetails.health_plan || false;
    
    matrizUpdateData.basic_food_basket_active = collaboratorDetails.basic_food_basket_active || false;
    if (collaboratorDetails.basic_food_basket_active && collaboratorDetails.basic_food_basket_value) {
      matrizUpdateData.basic_food_basket_value = cleanCurrencyValue(collaboratorDetails.basic_food_basket_value);
    }
    
    matrizUpdateData.cost_assistance_active = collaboratorDetails.cost_assistance_active || false;
    if (collaboratorDetails.cost_assistance_active && collaboratorDetails.cost_assistance_value) {
      matrizUpdateData.cost_assistance_value = cleanCurrencyValue(collaboratorDetails.cost_assistance_value);
    }

    console.log("Dados a serem atualizados na Matriz:", JSON.stringify(matrizUpdateData, null, 2));

    const { error: matrizUpdateError } = await supabasePublic
      .from('colaboradores_loja')
      .update(matrizUpdateData)
      .eq('email', collaboratorDetails.email);

    if (matrizUpdateError) {
      console.error('Erro ao atualizar dados na Matriz:', matrizUpdateError);
      throw new Error(`Falha ao atualizar dados na Matriz: ${matrizUpdateError.message}`);
    }
    console.log(`✅ Dados do colaborador ${collaboratorDetails.email} atualizados na Matriz com sucesso.`);

    // --- ETAPA 2: Atualizar e Aprovar Colaborador no Treinamento ---
    const { error: treinamentoUpdateError } = await supabaseTreinamento
      .from('users')
      .update({ approval_status: 'aprovado', active: true })
      .eq('email', collaboratorDetails.email);

    if (treinamentoUpdateError) {
      console.error('Erro ao aprovar colaborador no Treinamento:', treinamentoUpdateError);
      throw new Error(`Falha ao aprovar colaborador: ${treinamentoUpdateError.message}`);
    }
    console.log(`✅ Colaborador ${collaboratorDetails.email} aprovado com sucesso no sistema.`);

    // --- ETAPA 3: Coletar Dados Para o Grupo de WhatsApp ---
    console.log("Iniciando coleta de dados para criação do grupo...");

    // 3.1 Buscar telefone do Franqueado
    const { data: franqueadoData, error: franqueadoError } = await supabaseTreinamento
      .from('users')
      .select('phone')
      .eq('id', franchiseeUser.id)
      .single();
    if (franqueadoError || !franqueadoData) throw new Error(`Não foi possível encontrar o telefone do franqueado: ${franqueadoError?.message}`);
    const franchiseePhone = franqueadoData.phone;
    console.log(`- Telefone do Franqueado: ${franchiseePhone}`);

    // 3.2 Buscar dados do Colaborador
    const { data: colaboradorData, error: colaboradorError } = await supabaseTreinamento
      .from('users')
      .select('name, phone, unit_code')
      .eq('email', collaboratorDetails.email)
      .single();
    if (colaboradorError || !colaboradorData) throw new Error(`Não foi possível encontrar os dados do colaborador aprovado: ${colaboradorError?.message}`);
    const { name: collaboratorName, phone: collaboratorPhone, unit_code: unitCode } = colaboradorData;
    console.log(`- Dados do Colaborador: ${collaboratorName}, ${collaboratorPhone}, Unidade ${unitCode}`);

    // 3.3 Buscar nome da Unidade
    const { data: unidadeData, error: unidadeError } = await supabasePublic
      .from('unidades')
      .select('group_name')
      .eq('group_code', unitCode)
      .single();
    if (unidadeError || !unidadeData) throw new Error(`Não foi possível encontrar o nome da unidade ${unitCode}: ${unidadeError?.message}`);
    const unitName = unidadeData.group_name;
    console.log(`- Nome da Unidade: ${unitName}`);

    // --- ETAPA 4: Montar Payload e Invocar a Função ---
    const groupPayload = {
      collaboratorName,
      collaboratorPhone,
      franchiseePhone,
      unitName
    };

    // Log crucial para depuração
    console.log("Payload final para 'create-collaborator-group':", JSON.stringify(groupPayload, null, 2));

    try {
      const { error: invokeError } = await supabaseTreinamento.functions.invoke('create-collaborator-group', {
        body: groupPayload
      });

      if (invokeError) {
        throw new Error(`Invocação da criação de grupo falhou: ${invokeError.message}`);
      }
      console.log("✅ Invocação para criar grupo de WhatsApp enviada com sucesso.");
    } catch (groupError) {
      // A aprovação já ocorreu, então apenas registramos o erro da criação do grupo
      console.error("⚠️ Falha na etapa de criação do grupo de WhatsApp, mas o colaborador foi aprovado. Erro:", groupError.message);
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Colaborador aprovado com sucesso.'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Erro fatal na função update-collaborator-details:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});