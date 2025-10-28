// Supabase Edge Function: create-professor (autônoma)
import { createClient } from "npm:@supabase/supabase-js@2.45.1";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
Deno.serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    // --- Setup das Variáveis de Ambiente ---
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Variáveis de ambiente do Supabase não configuradas.");
    }
    // --- Etapa 1: Autenticação e Autorização ---
    const authHeader = req.headers.get("authorization");
    if (!authHeader) throw new Error("Cabeçalho de autorização ausente.");
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: authHeader
        }
      },
      db: {
        schema: "treinamento"
      }
    });
    const { data: { user }, error: authErr } = await userClient.auth.getUser();
    if (authErr || !user) throw new Error("Acesso não autorizado. Token inválido.");
    const { data: isAdmin, error: isAdminError } = await userClient.rpc("is_admin", {
      _user: user.id
    });
    if (isAdminError || !isAdmin) {
      throw new Error("Apenas administradores podem executar esta ação.");
    }
    // --- Etapa 2: Processamento do Payload ---
    const { name, email, password, phone, position } = await req.json();
    if (!name || !email || !password) {
      throw new Error("Nome, e-mail e senha são obrigatórios.");
    }
    // --- Etapa 3: Lógica de Criação Autônoma ---
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      db: {
        schema: "treinamento"
      }
    });
    // 3.1. Cria o usuário no auth.users
    const { data: created, error: createErr } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: name,
        phone,
        position
      }
    });
    if (createErr) {
      if (createErr.message.includes("already registered")) {
        throw new Error("Um usuário com este e-mail já está cadastrado.");
      }
      throw new Error(`Falha ao criar usuário no Auth: ${createErr.message}`);
    }
    const authUserId = created.user.id;
    // 3.2. Tenta inserir o perfil em treinamento.users
    try {
      const { error: userInsertError } = await adminClient.from('users').insert({
        id: authUserId,
        name: name,
        email: email,
        phone: phone,
        position: position,
        user_type: 'Professor',
        role: 'Professor',
        visible_password: password,
        approval_status: 'aprovado',
        active: true
      });
      if (userInsertError) throw userInsertError;
    } catch (dbError) {
      // Rollback: Se a inserção no banco falhar, deleta o usuário do Auth.
      console.error("Erro ao inserir dados do professor no banco, iniciando rollback...", dbError);
      await adminClient.auth.admin.deleteUser(authUserId);
      throw new Error(`Falha ao salvar perfil do professor: ${dbError.message}`);
    }
    // --- Etapa 4: Retorno de Sucesso ---
    return new Response(JSON.stringify({
      success: true,
      user_id: authUserId,
      message: "Professor criado com sucesso."
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 200
    });
  } catch (err) {
    console.error("[create-professor] Erro:", err);
    return new Response(JSON.stringify({
      success: false,
      error: err.message
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 400
    });
  }
});
