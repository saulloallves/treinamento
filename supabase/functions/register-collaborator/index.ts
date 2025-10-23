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
    // 1. Receber todos os dados do frontend, incluindo o CPF
    const { email, password, name, whatsapp, unitCode, position, cpf } = await req.json();

    // 2. Validar todos os campos necessários
    if (!email || !password || !name || !whatsapp || !unitCode || !position || !cpf) {
      console.error("Validação falhou. Dados recebidos:", { email, password, name, whatsapp, unitCode, position, cpf });
      throw new Error("Todos os campos são obrigatórios para o registro, incluindo o CPF.");
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Cliente para o schema 'public' para buscar o nome da unidade
    const supabasePublic = createClient(supabaseUrl, supabaseServiceKey, {
        db: { schema: 'public' }
    });

    // 3. Buscar o nome da unidade usando o unitCode
    const { data: unidadeData, error: unidadeError } = await supabasePublic
      .from('unidades')
      .select('group_name')
      .eq('group_code', unitCode)
      .single();

    if (unidadeError || !unidadeData) {
      console.error(`Erro ao buscar unidade com código ${unitCode}:`, unidadeError);
      throw new Error(`Unidade com código ${unitCode} não foi encontrada.`);
    }
    const unitName = unidadeData.group_name;

    // 4. Criar o usuário no Supabase Auth com metadados completos
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: name,
        phone: whatsapp,
        unit_code: unitCode,
        position: position,
        user_type: 'Aluno',
        role: 'Colaborador',
        cpf: cpf
      }
    });

    if (authError) {
      console.error("Erro ao criar usuário no Auth:", authError);
      throw new Error(`Não foi possível registrar o usuário: ${authError.message}`);
    }

    if (!authData.user) {
        throw new Error("Criação do usuário não retornou um usuário.");
    }

    const supabaseTreinamento = createClient(supabaseUrl, supabaseServiceKey, {
        db: { schema: 'treinamento' }
    });

    // 5. Inserir o registro completo na tabela 'users' do schema 'treinamento'
    const { error: insertError } = await supabaseTreinamento
      .from('users')
      .insert({
        id: authData.user.id,
        email: email,
        name: name,
        phone: whatsapp,
        cpf: cpf, // Salva o CPF
        user_type: 'Aluno',
        role: 'Colaborador',
        position: position,
        unit_code: unitCode,
        unit_codes: [unitCode], // Salva o código da unidade como um array
        nomes_unidades: [unitName], // Salva o nome da unidade como um array
        approval_status: 'pendente',
        active: false
      });

    if (insertError) {
      console.error("Erro ao inserir na tabela de usuários:", insertError);
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw new Error(`Erro ao salvar dados do colaborador: ${insertError.message}`);
    }

    console.log(`Registro completo do colaborador ${email} realizado com sucesso.`);

    return new Response(JSON.stringify({
      success: true,
      message: "Registro de colaborador realizado com sucesso. Aguardando aprovação do franqueado."
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Erro na função register-collaborator:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});