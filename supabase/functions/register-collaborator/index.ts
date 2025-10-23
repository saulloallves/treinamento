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
    // 1. Receber os dados com os nomes enviados pelo frontend
    const { email, password, name, whatsapp, unitCode, position } = await req.json();

    // 2. Validar usando os nomes recebidos
    if (!email || !password || !name || !whatsapp || !unitCode || !position) {
      console.error("Validação falhou. Dados recebidos:", { email, password, name, whatsapp, unitCode, position });
      throw new Error("Todos os campos são obrigatórios para o registro.");
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // 3. Mapear os nomes do frontend para os nomes esperados pelo Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: name,       // Mapeado de 'name'
        phone: whatsapp,     // Mapeado de 'whatsapp'
        unit_code: unitCode,   // Mapeado de 'unitCode'
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

    const supabaseTreinamento = createClient(supabaseUrl, supabaseServiceKey, {
        db: { schema: 'treinamento' }
    });

    // 4. Mapear os nomes para a inserção na tabela 'users' do schema 'treinamento'
    const { error: insertError } = await supabaseTreinamento
      .from('users')
      .insert({
        id: authData.user.id,
        email: email,
        name: name,          // A tabela 'users' espera 'name', então está correto
        phone: whatsapp,     // Mapeado de 'whatsapp'
        user_type: 'Aluno',
        role: 'Colaborador',
        position: position,
        unit_code: unitCode,   // Mapeado de 'unitCode'
        approval_status: 'pendente',
        active: false
      });

    if (insertError) {
      console.error("Erro ao inserir na tabela de usuários:", insertError);
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw new Error(`Erro ao salvar dados do colaborador: ${insertError.message}`);
    }

    console.log(`Registro do colaborador ${email} realizado com sucesso, aguardando aprovação.`);

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