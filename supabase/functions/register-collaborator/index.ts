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

    console.log('--- START: register-collaborator ---');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Credenciais do Supabase local não configuradas.');
    }

    // --- Create Local Client ---
    const supabaseLocal = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const collaboratorData: CollaboratorData = await req.json();
    console.log('Payload recebido:', { email: collaboratorData.email, unitCode: collaboratorData.unitCode });

    let userId: string;

    // 1. Check if user already exists in auth.users
    console.log('Verificando se usuário já existe no auth...');
    const { data: existingUsers } = await supabaseLocal.auth.admin.listUsers();
    const existingUser = existingUsers.users?.find(u => u.email?.toLowerCase() === collaboratorData.email.toLowerCase());

    if (existingUser) {
      userId = existingUser.id;
      console.log('Usuário já existe no auth:', userId);
    } else {
      // 2. Create new user in auth.users
      console.log('Criando novo usuário no auth...');
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
      if (!newUser.user?.id) throw new Error('Falha ao criar usuário - ID não retornado');
      userId = newUser.user.id;
      console.log('Novo usuário criado no auth:', userId);
    }

    // 3. Upsert user record in public.users with 'pendente' status
    console.log('Inserindo/atualizando registro na tabela users...');
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
    console.log('Registro na tabela users salvo com sucesso.');

    // --- SYNC WITH MATRIZ DATABASE ---
    console.log('--- INICIANDO SINCRONIZAÇÃO COM A MATRIZ ---');
    if (!MATRIZ_URL || !MATRIZ_SERVICE_KEY) {
      console.error('!!! ERRO CRÍTICO: Credenciais da Matriz não encontradas. Pulando sincronização. !!!');
    } else {
      try {
        const supabaseMatriz = createClient(MATRIZ_URL, MATRIZ_SERVICE_KEY);
        console.log('Cliente da Matriz criado.');

        let positionId: string;

        // a. "Get or Create" logic for position_id in Matriz
        console.log(`Buscando cargo '${collaboratorData.position}' na Matriz...`);
        const { data: existingCargo, error: cargoSelectError } = await supabaseMatriz
          .from('cargos_loja')
          .select('id')
          .eq('role', collaboratorData.position)
          .maybeSingle();

        if (cargoSelectError) {
          throw new Error(`Erro ao buscar cargo na Matriz: ${cargoSelectError.message}`);
        }

        if (existingCargo) {
          positionId = existingCargo.id;
          console.log(`Cargo encontrado na Matriz: ${collaboratorData.position} (ID: ${positionId})`);
        } else {
          console.log(`Cargo '${collaboratorData.position}' não encontrado. Criando...`);
          const { data: newCargo, error: cargoInsertError } = await supabaseMatriz
            .from('cargos_loja')
            .insert({ role: collaboratorData.position })
            .select('id')
            .single();

          if (cargoInsertError) {
            throw new Error(`Erro ao criar cargo na Matriz: ${cargoInsertError.message}`);
          }
          positionId = newCargo.id;
          console.log(`Cargo criado na Matriz: ${collaboratorData.position} (ID: ${positionId})`);
        }

        // b. Prepare record for 'colaboradores_loja'
        const colaboradorLojaRecord = {
          employee_name: collaboratorData.name,
          position_id: positionId,
          email: collaboratorData.email,
          cpf: collaboratorData.cpf || '00000000000',
          phone: cleanPhone || '00000000000',
          admission_date: new Date().toISOString(),
          web_password: collaboratorData.password,
          lgpd_term: true,
          confidentiality_term: true,
          system_term: true,
          birth_date: null,
          salary: null,
        };
        console.log('Preparando para inserir colaborador na Matriz...');

        // c. Insert into 'colaboradores_loja'
        const { error: insertMatrizError } = await supabaseMatriz
          .from('colaboradores_loja')
          .insert(colaboradorLojaRecord);

        if (insertMatrizError) {
          if (insertMatrizError.code === '23505') { // unique_violation
            console.warn('Colaborador já existe na Matriz (CPF ou Email). Pulando inserção.');
          } else {
            throw insertMatrizError;
          }
        } else {
          console.log('✅ Colaborador sincronizado com a Matriz com sucesso.');
        }
      } catch (matrizError) {
        console.error('--- FALHA NA SINCRONIZAÇÃO COM A MATRIZ (NÃO BLOQUEANTE) ---');
        console.error(matrizError);
      }
    }
    console.log('--- FIM DA SINCRONIZAÇÃO COM A MATRIZ ---');

    // 4. Call notify-franchisee function
    console.log('Invocando notificação para o franqueado...');
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
      console.warn('Aviso: Falha ao enviar notificação para o franqueado:', notificationError);
    } else {
      console.log('Notificação para o franqueado enviada com sucesso.');
    }

    console.log('--- FIM: register-collaborator ---');
    return new Response(
      JSON.stringify({ 
        success: true, 
        userId,
        message: 'Colaborador criado com sucesso. Aguarde aprovação do franqueado.' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('--- ERRO GERAL na função register-collaborator ---');
    console.error(error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: (error as Error).message || 'Erro interno do servidor' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});