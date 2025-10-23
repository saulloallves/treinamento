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
    const { email, password, full_name, phone, unit_code, position } = await req.json();

    if (!email || !password || !full_name || !phone || !unit_code || !position) {
      throw new Error("Todos os campos são obrigatórios para o registro.");
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    // Usar a chave de serviço para criar o usuário no backend
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // 1. Criar o usuário no Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirma o email
      user_metadata: {
        full_name: full_name,
        phone: phone,
        unit_code: unit_code,
        position: position,
        user_type: 'Aluno',
        role: 'Colaborador'
      }
    });

    if (authError) {
      console.error("Erro ao criar usuário no Auth:", authError);
      throw new Error(`Não foi possível registrar o usuário: ${authError.message}`);
    }

    if (!authData.user) {
        throw new Error("Criação do usuário não retornou um usuário.");
    }

    // 2. Inserir o registro na tabela 'users' do schema 'treinamento'
    const supabaseTreinamento = createClient(supabaseUrl, supabaseServiceKey, {
        db: { schema: 'treinamento' }
    });

    const { error: insertError } = await supabaseTreinamento
      .from('users')
      .insert({
        id: authData.user.id,
        email: email,
        name: full_name,
        phone: phone,
        user_type: 'Aluno',
        role: 'Colaborador',
        position: position,
        unit_code: unit_code,
        approval_status: 'pendente', // Status inicial é sempre pendente
        active: false // O usuário só se torna ativo após aprovação
      });

    if (insertError) {
      console.error("Erro ao inserir na tabela de usuários:", insertError);
      // Se a inserção falhar, devemos deletar o usuário do Auth para evitar inconsistência
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw new Error(`Erro ao salvar dados do colaborador: ${insertError.message}`);
    }

    // --- LÓGICA REMOVIDA ---
    // A chamada para a função 'create-collaborator-group' foi removida daqui.
    // A criação do grupo agora ocorrerá apenas após a aprovação pelo franqueado.
    console.log(`Lógica de criação de grupo desacoplada do registro para o usuário ${email}.`);

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