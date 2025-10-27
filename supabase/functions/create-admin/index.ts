// create-admin (requer usuário autenticado e aprovado)
import { createClient } from "npm:@supabase/supabase-js@2.45.1";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
console.info("create-admin started");
Deno.serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({
      success: false,
      error: "Missing Supabase environment variables"
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
  // 1) Extrai o JWT do usuário chamador
  const authHeader = req.headers.get("authorization") ?? req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({
      success: false,
      error: "Unauthorized"
    }), {
      status: 401,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
  // 2) Client com contexto do usuário (para getUser e permissões baseadas no chamador)
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
  const { data: authData, error: authErr } = await userClient.auth.getUser();
  if (authErr || !authData?.user) {
    return new Response(JSON.stringify({
      success: false,
      error: "Unauthorized"
    }), {
      status: 401,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
  // 3) Verifica se o chamador é admin aprovado
  const { data: isAdmin, error: isAdminError } = await userClient.rpc("is_admin");
  if (isAdminError) {
    console.error("[create-admin] is_admin RPC error:", isAdminError);
    return new Response(JSON.stringify({
      success: false,
      error: "Permission check failed"
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
  if (!isAdmin) {
    return new Response(JSON.stringify({
      success: false,
      error: "Forbidden"
    }), {
      status: 403,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
  // 4) Client admin (service role) para operações privilegiadas
  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    db: {
      schema: "treinamento"
    }
  });
  // 5) Processa payload
  let body;
  try {
    body = await req.json();
  } catch  {
    return new Response(JSON.stringify({
      success: false,
      error: "Invalid JSON body"
    }), {
      status: 400,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
  const name = body?.name?.trim();
  const email = body?.email?.trim()?.toLowerCase();
  const password = body?.password;
  if (!name || !email || !password) {
    return new Response(JSON.stringify({
      success: false,
      error: "Missing required fields"
    }), {
      status: 400,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
  try {
    // Etapa 1: Verificar se o usuário já existe no Supabase Auth pelo e-mail
    const { data: { users: existingAuthUsers }, error: listUsersError } = await adminClient.auth.admin.listUsers({
      per_page: 1,
      email: email
    });
    if (listUsersError) {
      console.error("[create-admin] Erro ao listar usuários:", listUsersError);
      return new Response(JSON.stringify({
        success: false,
        error: "Falha ao verificar usuário existente."
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    let authUserId = null;
    const authUserExists = existingAuthUsers && existingAuthUsers.length > 0;
    // Etapa 2: Criar ou atualizar o usuário no Supabase Auth
    if (authUserExists) {
      authUserId = existingAuthUsers[0].id;
      // Se o usuário já existe, atualiza a senha e os metadados para garantir que seja um admin
      const { error: updateErr } = await adminClient.auth.admin.updateUserById(authUserId, {
        password,
        user_metadata: {
          full_name: name,
          user_type: "Admin"
        }
      });
      if (updateErr) {
        console.error("[create-admin] Erro ao atualizar usuário existente:", updateErr);
        return new Response(JSON.stringify({
          success: false,
          error: updateErr.message || "Falha ao atualizar usuário existente."
        }), {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        });
      }
    } else {
      // Se o usuário não existe, cria um novo no Auth
      const { data: created, error: createUserError } = await adminClient.auth.admin.createUser({
        email,
        password,
        user_metadata: {
          full_name: name,
          user_type: "Admin"
        },
        email_confirm: true
      });
      if (createUserError) {
        console.error("[create-admin] Erro ao criar novo usuário no Auth:", createUserError);
        return new Response(JSON.stringify({
          success: false,
          error: createUserError.message || "Falha ao criar usuário."
        }), {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        });
      }
      authUserId = created.user.id;
    }
    if (!authUserId) {
      return new Response(JSON.stringify({
        success: false,
        error: "Não foi possível obter o ID do usuário."
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    
    // O gatilho 'on_auth_user_created' agora cuida da inserção/atualização
    // nas tabelas 'users' e 'admin_users'. O código de upsert foi removido.

    // Se tudo correu bem
    return new Response(JSON.stringify({
      success: true,
      user_id: authUserId
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (err) {
    console.error("[create-admin] Erro inesperado:", err);
    return new Response(JSON.stringify({
      success: false,
      error: "Ocorreu um erro inesperado."
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
