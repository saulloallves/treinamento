// Supabase Edge Function: create-professor
// Creates an auth user (Professor) and inserts the corresponding profile in public.users
// Only admins can call this function

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateProfessorPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  position?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(
      JSON.stringify({ success: false, error: "Missing Supabase environment variables" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Client in user context (to check admin permissions via JWT)
  const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });

  // Admin client (service role) for privileged operations
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const { data: authData } = await supabaseUser.auth.getUser();
    if (!authData?.user) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Ensure caller is admin
    const { data: isAdmin, error: isAdminError } = await supabaseUser.rpc("is_admin", {
      _user: authData.user.id,
    });

    if (isAdminError) {
      console.error("is_admin RPC error:", isAdminError);
      return new Response(JSON.stringify({ success: false, error: "Permission check failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!isAdmin) {
      return new Response(JSON.stringify({ success: false, error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rawPayload = (await req.json()) as CreateProfessorPayload;
    const name = rawPayload.name?.trim();
    const email = rawPayload.email?.trim().toLowerCase();
    const password = rawPayload.password;
    const phone = rawPayload.phone?.trim();
    const position = rawPayload.position?.trim();

    if (!name || !email || !password) {
      return new Response(JSON.stringify({ success: false, error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Tentar localizar usuário pelo e-mail na tabela public.users
    const { data: existingUserByEmail, error: userLookupError } = await supabaseAdmin
      .from("users")
      .select("id, user_type")
      .eq("email", email)
      .maybeSingle();

    if (userLookupError) {
      console.error("[create-professor] users lookup error:", userLookupError);
    }

    let authUserId: string | null = null;
    let profile: any = null;

    if (existingUserByEmail) {
      // Usuário já existe no sistema: promover para Professor
      authUserId = existingUserByEmail.id;

      // Atualiza a senha no Auth (best-effort)
      const { error: passwordUpdateError } = await supabaseAdmin.auth.admin.updateUserById(authUserId!, { 
        password: password || 'TrocarSenha123'
      });
      if (passwordUpdateError) {
        console.warn("[create-professor] Password update warning:", passwordUpdateError);
      }

      // Se já é Professor, apenas confirma e retorna
      if (existingUserByEmail.user_type === "Professor") {
        const { data: existingProfile } = await supabaseAdmin
          .from("users")
          .select("id, name, email, user_type, phone, position")
          .eq("id", authUserId)
          .single();
        profile = existingProfile;
      } else {
        // Atualiza o perfil existente para Professor
        const { data: updatedProfile, error: updateErr } = await supabaseAdmin
          .from("users")
          .update({
            name,
            phone,
            position,
            user_type: "Professor",
            visible_password: password, // ⚠️ RISCO DE SEGURANÇA: Senha em texto plano
            active: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", authUserId)
          .select()
          .single();

        if (updateErr) {
          console.error("[create-professor] update profile error:", updateErr);
          return new Response(
            JSON.stringify({ success: false, error: updateErr.message || "Falha ao atualizar perfil" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        profile = updatedProfile;
      }
    } else {
      // Usuário não existe na tabela users: criar no Auth e depois inserir perfil
      console.log("[create-professor] Creating new auth user:", { email, position });
      const { data: createUserData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        user_metadata: { name, position, phone },
        email_confirm: true,
      });

      if (createUserError) {
        const anyErr: any = createUserError as any;
        const isEmailExists = anyErr?.status === 422 || anyErr?.code === "email_exists" ||
          (typeof anyErr?.message === "string" && anyErr.message.toLowerCase().includes("already"));
        console.error("[create-professor] createUserError:", createUserError);

        if (isEmailExists) {
          // Fallback: tentar localizar no Auth pela listagem e criar perfil
          const { data: usersList, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
          if (listErr) {
            console.error("[create-professor] listUsers error:", listErr);
            return new Response(
              JSON.stringify({ success: false, error: "E-mail já cadastrado. Não foi possível localizar o usuário para promoção." }),
              { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          const existing = usersList?.users?.find((u: any) => u.email?.toLowerCase() === email);
          if (!existing) {
            return new Response(
              JSON.stringify({ success: false, error: "E-mail já cadastrado. Faça login uma vez para sincronizar o perfil e tente novamente." }),
              { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          authUserId = existing.id;
        } else {
          return new Response(
            JSON.stringify({ success: false, error: createUserError.message || "Falha ao criar usuário" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } else {
        authUserId = createUserData.user.id;
      }

      // Inserir perfil em public.users
      const { data: insertedProfile, error: profileError } = await supabaseAdmin
        .from("users")
        .insert({
          id: authUserId,
          name,
          email,
          phone,
          position,
          user_type: "Professor",
          visible_password: password, // ⚠️ RISCO DE SEGURANÇA: Senha em texto plano
          active: true,
        })
        .select()
        .single();

      if (profileError) {
        console.error("[create-professor] profile insert error:", profileError);
        // Se já existir, tenta atualizar (idempotência)
        const { data: updatedProfile, error: updateErr2 } = await supabaseAdmin
          .from("users")
          .update({ 
            name, 
            phone, 
            position, 
            user_type: "Professor", 
            visible_password: password, // ⚠️ RISCO DE SEGURANÇA: Senha em texto plano
            active: true, 
            updated_at: new Date().toISOString() 
          })
          .eq("id", authUserId)
          .select()
          .maybeSingle();
        if (updateErr2) {
          return new Response(
            JSON.stringify({ success: false, error: profileError.message }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        profile = updatedProfile;
      } else {
        profile = insertedProfile;
      }
    }

    console.log("[create-professor] Success:", { userId: authUserId });

    return new Response(
      JSON.stringify({ success: true, userId: authUserId, profile }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("[create-professor] Unexpected error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err?.message ?? "Unexpected error" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});