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
  whatsapp?: string;
  cpf?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // --- Get Credentials ---
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const MATRIZ_URL = Deno.env.get('MATRIZ_URL');
    const MATRIZ_SERVICE_KEY = Deno.env.get('MATRIZ_SERVICE_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !MATRIZ_URL || !MATRIZ_SERVICE_KEY) {
      throw new Error('Credenciais do Supabase (local e matriz) não configuradas.');
    }

    // --- Create Clients ---
    const supabaseLocal = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    const supabaseMatriz = createClient(MATRIZ_URL, MATRIZ_SERVICE_KEY);

    const collaboratorData: CollaboratorData = await req.json();
    console.log('Creating collaborator:', { email: collaboratorData.email, unitCode: collaboratorData.unitCode });

    let userId: string;

    // 1. Check if user already exists in auth.users
    const { data: existingUsers } = await supabaseLocal.auth.admin.listUsers();
    const existingUser = existingUsers.users?.find(u => u.email?.toLowerCase() === collaboratorData.email.toLowerCase());

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // 2. Create new user in auth.users
      const { data: newUser, error: authError } = await supabaseLocal.auth.admin.createUser({
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
      if (authError) throw authError;
      if (!newUser.user?.id) throw new Error('Failed to create user - no ID returned');
      userId = newUser.user.id;
    }

    // 3. Upsert user record in public.users with 'pendente' status
    const cleanPhone = collaboratorData.whatsapp?.replace(/\D/g, '') || '';
    const { error: userError } = await supabaseLocal.from('users').upsert({
      id: userId,
      name: collaboratorData.name,
      email: collaboratorData.email,
      user_type: 'Aluno',
      role: 'Colaborador',
      unit_code: collaboratorData.unitCode,
      position: collaboratorData.position,
      phone: cleanPhone || null,
      cpf: collaboratorData.cpf || null,
      approval_status: 'pendente',
      visible_password: collaboratorData.password,
      active: true,
    }, { onConflict: 'id' });
    if (userError) throw userError;

    // --- SYNC WITH MATRIZ DATABASE ---
    try {
      console.log('Syncing with Matriz...');
      let positionId: string;

      // a. "Get or Create" logic for position_id in Matriz
      const { data: existingCargo, error: cargoSelectError } = await supabaseMatriz
        .from('cargos_loja')
        .select('id')
        .eq('role', collaboratorData.position)
        .maybeSingle();

      if (cargoSelectError) {
        throw new Error(`Error checking for position in Matriz: ${cargoSelectError.message}`);
      }

      if (existingCargo) {
        positionId = existingCargo.id;
        console.log(`Found existing position in Matriz: ${collaboratorData.position} (ID: ${positionId})`);
      } else {
        console.log(`Position '${collaboratorData.position}' not found in Matriz. Creating it...`);
        const { data: newCargo, error: cargoInsertError } = await supabaseMatriz
          .from('cargos_loja')
          .insert({ role: collaboratorData.position })
          .select('id')
          .single();

        if (cargoInsertError) {
          throw new Error(`Error creating position in Matriz: ${cargoInsertError.message}`);
        }
        positionId = newCargo.id;
        console.log(`Created new position in Matriz: ${collaboratorData.position} (ID: ${positionId})`);
      }

      // b. Prepare record for 'colaboradores_loja'
      const colaboradorLojaRecord = {
        employee_name: collaboratorData.name,
        position_id: positionId, // Use the obtained/created UUID
        email: collaboratorData.email,
        cpf: collaboratorData.cpf || '00000000000', // CPF is NOT NULL, provide a default if empty
        phone: cleanPhone || '00000000000', // Phone is NOT NULL, provide a default if empty
        admission_date: new Date().toISOString(),
        web_password: collaboratorData.password,
        // Defaulting required boolean fields
        lgpd_term: true,
        confidentiality_term: true,
        system_term: true,
        // Nullable fields that were made optional
        birth_date: null,
        salary: null,
      };

      // c. Insert into 'colaboradores_loja'
      const { error: insertMatrizError } = await supabaseMatriz
        .from('colaboradores_loja')
        .insert(colaboradorLojaRecord);

      if (insertMatrizError) {
        // If it's a duplicate key error, we can ignore it as a "soft" success
        if (insertMatrizError.code === '23505') { // unique_violation
          console.warn('Collaborator already exists in Matriz (CPF or Email). Skipping insertion.');
        } else {
          throw insertMatrizError;
        }
      } else {
        console.log('Successfully synced collaborator to Matriz.');
      }
    } catch (matrizError) {
      // Log the error but do not fail the main operation
      console.error('Failed to sync collaborator to Matriz (non-blocking error):', matrizError.message);
    }
    // --- END OF SYNC WITH MATRIZ ---

    // 4. Call notify-franchisee function
    const { error: notificationError } = await supabaseLocal.functions.invoke('notify-franchisee', {
      body: {
        collaboratorId: userId,
        collaboratorName: collaboratorData.name,
        collaboratorEmail: collaboratorData.email,
        collaboratorPosition: collaboratorData.position,
        unitCode: collaboratorData.unitCode
      }
    });
    if (notificationError) {
      console.warn('Warning: Failed to send notification to franchisee:', notificationError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        userId,
        message: 'Colaborador criado com sucesso. Aguarde aprovação do franqueado.' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error in register-collaborator function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: (error as Error).message || 'Erro interno do servidor' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});