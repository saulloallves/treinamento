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

    // Pre-check: existing profile with same email
    const { data: existingProfile, error: profileLookupError } = await supabaseAdmin
      .from("users")
      .select("id,user_type")
      .eq("email", email)
      .maybeSingle();

    if (profileLookupError) {
      console.error("[create-professor] profile lookup error:", profileLookupError);
      // continue – not fatal, but log
    }

    if (existingProfile) {
      const msg = existingProfile.user_type === "Professor"
        ? "Este e-mail já está cadastrado como Professor."
        : `Este e-mail já está cadastrado como ${existingProfile.user_type}.`;
      return new Response(
        JSON.stringify({ success: false, error: msg }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[create-professor] Creating auth user:", { email, position });

    const { data: createdUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: name,
        user_type: "Professor",
        phone,
        position,
      },
    });

    if (createUserError) {
      const anyErr: any = createUserError as any;
      const isEmailExists = anyErr?.status === 422 || anyErr?.code === "email_exists";
      console.error("[create-professor] createUserError:", createUserError);

      // Return friendly message for UI without triggering supabase-js error branch
      if (isEmailExists) {
        return new Response(
          JSON.stringify({ success: false, error: "E-mail já cadastrado." }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: false, error: createUserError.message || "Falha ao criar usuário" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = createdUser.user.id;

    // Insert profile in public.users
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("users")
      .insert({
        id: userId,
        name,
        email,
        phone,
        position,
        user_type: "Professor",
        active: true,
        approval_status: "aprovado",
      })
      .select()
      .single();

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