import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CollaboratorData {
  name: string;
  email: string;
  password: string;
  unitCode: string;
  position: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const collaboratorData: CollaboratorData = await req.json();
    console.log('Creating collaborator:', { email: collaboratorData.email, unitCode: collaboratorData.unitCode });

    let userId: string;

    // 1. First check if user already exists in auth.users
    console.log('Checking if user already exists:', collaboratorData.email);
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers.users?.find(u => 
      u.email?.toLowerCase() === collaboratorData.email.toLowerCase()
    );

    if (existingUser) {
      console.log('User already exists in auth, reusing ID:', existingUser.id);
      userId = existingUser.id;
    } else {
      // 2. Create new user in auth.users
      console.log('Creating new user in auth');
      const { data: newUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: collaboratorData.email,
        password: collaboratorData.password,
        user_metadata: {
          full_name: collaboratorData.name,
          user_type: 'Aluno',
          role: 'Colaborador',
          unit_code: collaboratorData.unitCode
        },
        email_confirm: true
      });

      if (authError) {
        console.error('Error creating auth user:', authError);
        throw authError;
      }

      if (!newUser.user?.id) {
        throw new Error('Failed to create user - no ID returned');
      }

      userId = newUser.user.id;
      console.log('Created new auth user:', userId);
    }

    // 3. Upsert user record in public.users with 'pendente' status
    const { error: userError } = await supabaseAdmin
      .from('users')
      .upsert({
        id: userId,
        name: collaboratorData.name,
        email: collaboratorData.email,
        user_type: 'Aluno',
        role: 'Colaborador',
        unit_code: collaboratorData.unitCode,
        position: collaboratorData.position,
        approval_status: 'pendente',
        visible_password: collaboratorData.password, // ⚠️ RISCO DE SEGURANÇA: Senha em texto plano
        active: true,
      }, {
        onConflict: 'id'
      });

    if (userError) {
      console.error('Error upserting user record:', userError);
      throw userError;
    }

    console.log('User record upserted successfully');

    // 4. Call notify-franchisee function
    const { error: notificationError } = await supabaseAdmin.functions.invoke('notify-franchisee', {
      body: {
        collaboratorId: userId,
        collaboratorName: collaboratorData.name,
        unitCode: collaboratorData.unitCode
      }
    });

    if (notificationError) {
      console.warn('Warning: Failed to send notification to franchisee:', notificationError);
      // Don't fail the entire operation, just log the warning
    } else {
      console.log('Notification sent to franchisee successfully');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        userId,
        message: 'Colaborador criado com sucesso. Aguarde aprovação do franqueado.' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in register-collaborator function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erro interno do servidor' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});