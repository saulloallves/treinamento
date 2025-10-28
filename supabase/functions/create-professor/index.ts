// Supabase Edge Function: create-professor
// Creates or promotes a user to the 'Professor' role.
// Relies on the 'handle_new_user_sync' trigger to create the user profile.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // --- Setup dos Clientes Supabase ---
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? '';
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? '';
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? '';

    // Cliente com a autenticação do usuário que chamou a função
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
      db: { schema: 'treinamento' }
    });

    // Cliente com Service Role para operações de administrador
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // --- Etapa 1: Segurança - Verificar se o chamador é um admin ---
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) throw new Error("Acesso não autorizado.");

    const { data: isAdmin, error: isAdminError } = await userClient.rpc('is_admin', { _user: user.id });
    if (isAdminError || !isAdmin) {
      throw new Error("Apenas administradores podem executar esta ação.");
    }

    // --- Etapa 2: Processar Payload ---
    const { name, email, password, phone, position } = await req.json();
    if (!name || !email || !password) {
      throw new Error("Nome, e-mail e senha são obrigatórios.");
    }

    // --- Etapa 3: Lógica de Criação/Atualização no Auth ---
    let authUserId: string;

    // Verifica se um usuário já existe com este e-mail
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers({ email });
    if (listError) throw new Error(`Erro ao verificar usuário existente: ${listError.message}`);
    
    const existingUser = users && users.length > 0 ? users[0] : null;

    const userMetadata = {
      full_name: name,
      phone: phone,
      position: position,
      password: password, // Passa a senha para o gatilho
      user_type: 'Professor',
      role: 'Professor',
    };

    if (existingUser) {
      // Se o usuário já existe, promove a Professor atualizando seus metadados e senha
      authUserId = existingUser.id;
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(authUserId, {
        password: password,
        user_metadata: userMetadata,
      });
      if (updateError) throw new Error(`Falha ao promover usuário a professor: ${updateError.message}`);
    
    } else {
      // Se o usuário não existe, cria um novo já com os metadados de Professor
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        user_metadata: userMetadata,
        email_confirm: true,
      });
      if (createError) throw new Error(`Falha ao criar novo professor: ${createError.message}`);
      authUserId = newUser.user.id;
    }

    // O gatilho 'on_auth_user_created' (ou um futuro gatilho de update) cuidará de
    // inserir/atualizar o registro na tabela 'treinamento.users'.

    // --- Etapa 4: Retornar Resposta ---
    return new Response(
      JSON.stringify({ success: true, userId: authUserId, message: "Operação de professor concluída com sucesso." }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error("[create-professor] Erro inesperado:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});