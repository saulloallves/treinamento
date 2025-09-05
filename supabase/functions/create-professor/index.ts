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

    // Check if user already exists in auth.users
    const { data: existingAuthUser, error: authLookupError } = await supabaseAdmin.auth.admin.getUserByEmail(email);
    
    let authUserId: string;
    
    if (existingAuthUser?.user) {
      // User already exists in auth, just use existing ID and update profile
      authUserId = existingAuthUser.user.id;
      console.log("[create-professor] User already exists in auth, updating profile:", authUserId);
      
      // Check if already has Professor profile
      const { data: existingProfile } = await supabaseAdmin
        .from("users")
        .select("user_type")
        .eq("id", authUserId)
        .eq("user_type", "Professor")
        .maybeSingle();
        
      if (existingProfile) {
        return new Response(
          JSON.stringify({ success: false, error: "Este usuário já é um Professor." }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Update password for existing user
      const { error: passwordUpdateError } = await supabaseAdmin.auth.admin.updateUserById(authUserId, {
        password
      });
      
      if (passwordUpdateError) {
        console.error("[create-professor] Password update error:", passwordUpdateError);
        return new Response(
          JSON.stringify({ success: false, error: "Erro ao atualizar senha do usuário." }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      // Create new auth user
      console.log("[create-professor] Creating new auth user:", { email, position });

      const { data: createUserData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        user_metadata: {
          name,
          position,
          phone,
        },
        email_confirm: true,
      });

      if (createUserError) {
        console.error("[create-professor] createUserError:", createUserError);
        return new Response(
          JSON.stringify({ success: false, error: createUserError.message || "Falha ao criar usuário" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      authUserId = createUserData.user.id;
    }

    console.log("[create-professor] Creating user profile:", authUserId);

    const { error: profileError } = await supabaseAdmin.from("users").insert({
      id: authUserId,
      name,
      email,
      phone,
      position,
      user_type: "Professor",
      active: true,
    });

    if (profileError) {
      console.error("[create-professor] profileError:", profileError);
      return new Response(
        JSON.stringify({ success: false, error: profileError.message }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[create-professor] Success:", { userId });

    return new Response(
      JSON.stringify({ success: true, userId, profile }),
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