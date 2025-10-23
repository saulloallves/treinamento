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

    // --- ETAPA 1: Atualizar e Aprovar Colaborador ---
    // (Assumindo que a lógica de atualização na Matriz e Treinamento já está ocorrendo
    // e o objetivo principal agora é corrigir a invocação da criação de grupo)
    
    const { error: treinamentoUpdateError } = await supabaseTreinamento
      .from('users')
      .update({ approval_status: 'aprovado', active: true })
      .eq('email', collaboratorDetails.email);

    if (treinamentoUpdateError) {
      console.error('Erro ao aprovar colaborador no Treinamento:', treinamentoUpdateError);
      throw new Error(`Falha ao aprovar colaborador: ${treinamentoUpdateError.message}`);
    }
    console.log(`✅ Colaborador ${collaboratorDetails.email} aprovado com sucesso no sistema.`);

    // --- ETAPA 2: Coletar Dados Para o Grupo de WhatsApp ---
    console.log("Iniciando coleta de dados para criação do grupo...");

    // 2.1 Buscar telefone do Franqueado
    const { data: franqueadoData, error: franqueadoError } = await supabaseTreinamento
      .from('users')
      .select('phone')
      .eq('id', franchiseeUser.id)
      .single();
    if (franqueadoError || !franqueadoData) throw new Error(`Não foi possível encontrar o telefone do franqueado: ${franqueadoError?.message}`);
    const franchiseePhone = franqueadoData.phone;
    console.log(`- Telefone do Franqueado: ${franchiseePhone}`);

    // 2.2 Buscar dados do Colaborador
    const { data: colaboradorData, error: colaboradorError } = await supabaseTreinamento
      .from('users')
      .select('name, phone, unit_code')
      .eq('email', collaboratorDetails.email)
      .single();
    if (colaboradorError || !colaboradorData) throw new Error(`Não foi possível encontrar os dados do colaborador aprovado: ${colaboradorError?.message}`);
    const { name: collaboratorName, phone: collaboratorPhone, unit_code: unitCode } = colaboradorData;
    console.log(`- Dados do Colaborador: ${collaboratorName}, ${collaboratorPhone}, Unidade ${unitCode}`);

    // 2.3 Buscar nome da Unidade
    const { data: unidadeData, error: unidadeError } = await supabasePublic
      .from('unidades')
      .select('group_name')
      .eq('group_code', unitCode)
      .single();
    if (unidadeError || !unidadeData) throw new Error(`Não foi possível encontrar o nome da unidade ${unitCode}: ${unidadeError?.message}`);
    const unitName = unidadeData.group_name;
    console.log(`- Nome da Unidade: ${unitName}`);

    // --- ETAPA 3: Montar Payload e Invocar a Função ---
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