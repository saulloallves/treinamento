// Supabase Edge Function: create-admin
// Creates an auth user (Admin) and inserts the corresponding records in treinamento.users and treinamento.admin_users
// Only approved admins can call this function

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateAdminPayload {
  name: string;
  email: string;
  password: string;
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

  // Client with caller's JWT to check permissions via RLS/RPC
  const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });

  // Admin client for privileged operations
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const { data: authData } = await supabaseUser.auth.getUser();
    if (!authData?.user) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Ensure caller is an approved admin
    const { data: isAdmin, error: isAdminError } = await supabaseUser.rpc("treinamento.is_admin", {
      _user: authData.user.id,
    });

    if (isAdminError) {
      console.error("[create-admin] is_admin RPC error:", isAdminError);
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

    const body = (await req.json()) as CreateAdminPayload;
    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!name || !email || !password) {
      return new Response(JSON.stringify({ success: false, error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if already exists in users table
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("id, user_type")
      .eq("email", email)
      .maybeSingle();

    let authUserId: string | null = existingUser?.id ?? null;

    // Create or update auth user
    if (!authUserId) {
      const { data: created, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        user_metadata: { full_name: name, user_type: "Admin" },
        email_confirm: true,
      });
      if (createUserError) {
        console.error("[create-admin] createUserError:", createUserError);
        return new Response(
          JSON.stringify({ success: false, error: createUserError.message || "Falha ao criar usuário" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      authUserId = created.user.id;
    } else {
      // Ensure password is set for existing auth user
      const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(authUserId, { password });
      if (updateErr) console.warn("[create-admin] updateUserById warning:", updateErr);
    }

    // Insert or update in treinamento.users
    const { data: existingUserRecord, error: existingUserErr } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("id", authUserId!)
      .maybeSingle();

    if (existingUserRecord?.id) {
      const { error: updateUserErr } = await supabaseAdmin
        .from("users")
        .update({
          name,
          email,
          user_type: "Admin",
          active: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", authUserId!);
      if (updateUserErr) {
        console.error("[create-admin] update users error:", updateUserErr);
        return new Response(
          JSON.stringify({ success: false, error: updateUserErr.message || "Falha ao atualizar perfil" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      const { error: insertUserErr } = await supabaseAdmin
        .from("users")
        .insert({
          id: authUserId!,
          name,
          email,
          user_type: "Admin",
          active: true,
        });
      if (insertUserErr) {
        console.error("[create-admin] insert users error:", insertUserErr);
        return new Response(
          JSON.stringify({ success: false, error: insertUserErr.message || "Falha ao criar perfil" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Insert or update admin_users manually
    const { data: existingAdmin, error: existingAdminErr } = await supabaseAdmin
      .from("admin_users")
      .select("id")
      .eq("user_id", authUserId!)
      .maybeSingle();

    if (existingAdmin?.id) {
      const { error: updateAdminErr } = await supabaseAdmin
        .from("admin_users")
        .update({
          name,
          email,
          role: "admin",
          status: "approved",
          active: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingAdmin.id);
      if (updateAdminErr) {
        console.error("[create-admin] update admin_users error:", updateAdminErr);
        return new Response(
          JSON.stringify({ success: false, error: updateAdminErr.message || "Falha ao atualizar admin" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      const { error: insertAdminErr } = await supabaseAdmin
        .from("admin_users")
        .insert({
          user_id: authUserId!,
          name,
          email,
          role: "admin",
          status: "approved",
          active: true,
        });
      if (insertAdminErr) {
        console.error("[create-admin] insert admin_users error:", insertAdminErr);
        return new Response(
          JSON.stringify({ success: false, error: insertAdminErr.message || "Falha ao gravar permissões" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    console.log("[create-admin] Success:", { userId: authUserId });

    return new Response(
      JSON.stringify({ success: true, user_id: authUserId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[create-admin] unexpected error:", err);
    return new Response(
      JSON.stringify({ success: false, error: "Unexpected error" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});