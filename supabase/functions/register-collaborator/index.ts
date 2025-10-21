import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
  birth_date?: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Credenciais do Supabase não configuradas.');
    }

    // Cliente para o schema 'treinamento' (principal)
    const supabaseTreinamento = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
      db: { schema: 'treinamento' }
    });

    // Cliente para o schema 'public', que agora contém a lógica da Matriz
    const supabasePublic = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
      db: { schema: 'public' }
    });

    const collaboratorData: CollaboratorData = await req.json();
    console.log('Received payload for collaborator registration:', collaboratorData);
    
    let userId;
    // 1. Verifica se já existe um usuário de autenticação com o mesmo e-mail
    const { data: { users } } = await supabaseTreinamento.auth.admin.listUsers();
    const existingUser = users.find((u) => u.email?.toLowerCase() === collaboratorData.email.toLowerCase());

    if (existingUser) {
      userId = existingUser.id;
      // 2. Se o usuário de autenticação existe, verifica se ele já tem um perfil na tabela 'users' do schema 'treinamento'
      const { data: existingProfile, error: profileError } = await supabaseTreinamento.from('users').select('id').eq('id', userId).maybeSingle();
      if (profileError) throw profileError;

      // 3. Se o perfil já existe, retorna um erro para evitar sobrescrever os dados.
      if (existingProfile) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Um usuário com este e-mail já possui um perfil cadastrado.'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 409 // HTTP 409 Conflict
        });
      }
    } else {
      // 4. Se não existe usuário de autenticação, cria um novo.
      const { data: newUser, error: authError } = await supabaseTreinamento.auth.admin.createUser({
        email: collaboratorData.email,
        password: collaboratorData.password,
        user_metadata: {
          full_name: collaboratorData.name,
          user_type: 'Aluno',
          role: 'Colaborador',
          unit_code: collaboratorData.unitCode,
          birth_date: collaboratorData.birth_date,
          address: {
            cep: collaboratorData.cep,
            endereco: collaboratorData.endereco,
            numero: collaboratorData.numero,
            complemento: collaboratorData.complemento,
            bairro: collaboratorData.bairro,
            cidade: collaboratorData.cidade,
            estado: collaboratorData.estado
          }
        },
        email_confirm: true
      });
      if (authError) throw authError;
      if (!newUser.user?.id) throw new Error('Falha ao criar usuário - ID não retornado');
      userId = newUser.user.id;
    }

    // 5. Insere o novo perfil na tabela 'users' do schema 'treinamento'.
    const cleanPhone = collaboratorData.whatsapp?.replace(/\D/g, '') || '';
    const { error: userError } = await supabaseTreinamento.from('users').insert({
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
      active: true
    });
    if (userError) throw userError;

    // Sincronização com a Matriz (usando o schema 'public' do mesmo projeto)
    try {
      let positionId;

      const { data: existingCargo, error: cargoSelectError } = await supabasePublic.from('cargos_loja').select('id').eq('role', collaboratorData.position).maybeSingle();
      if (cargoSelectError) throw new Error(`Erro ao buscar cargo no schema public: ${cargoSelectError.message}`);
      
      if (existingCargo) {
        positionId = existingCargo.id;
      } else {
        const { data: newCargo, error: cargoInsertError } = await supabasePublic.from('cargos_loja').insert({ role: collaboratorData.position }).select('id').single();
        if (cargoInsertError) throw new Error(`Erro ao criar cargo no schema public: ${cargoInsertError.message}`);
        positionId = newCargo.id;
      }

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
        birth_date: collaboratorData.birth_date || null,
        salary: null,
        address: collaboratorData.endereco,
        number_address: collaboratorData.numero,
        address_complement: collaboratorData.complemento,
        neighborhood: collaboratorData.bairro,
        city: collaboratorData.cidade,
        state: collaboratorData.estado,
        uf: collaboratorData.estado,
        postal_code: collaboratorData.cep,
      };

      const { error: insertMatrizError } = await supabasePublic.from('colaboradores_loja').insert(colaboradorLojaRecord);
      if (insertMatrizError) {
        if (insertMatrizError.code === '23505') {
          console.warn('Colaborador já existe no schema public (CPF ou Email). Pulando inserção.');
        } else {
          throw insertMatrizError;
        }
      } else {
        console.log('✅ Colaborador sincronizado com o schema public com sucesso.');
      }
    } catch (publicSchemaError) {
      console.error('--- FALHA NA SINCRONIZAÇÃO COM O SCHEMA PUBLIC (NÃO BLOQUEANTE) ---');
      console.error(publicSchemaError);
    }

    // Lógica de grupos e notificações (usando o cliente 'treinamento')
    const unitCodeNumber = parseInt(collaboratorData.unitCode, 10);
    const { data: unidade } = await supabaseTreinamento.from('unidades').select('grupo_colaborador, grupo, codigo_grupo').eq('codigo_grupo', unitCodeNumber).maybeSingle();
    
    if (unidade) {
      let grupoColaborador = unidade.grupo_colaborador;
      if (!grupoColaborador) {
        const { data: groupData, error: groupError } = await supabaseTreinamento.functions.invoke('create-collaborator-group', {
          body: { unit_code: collaboratorData.unitCode, grupo: unidade.grupo || `UNIDADE ${collaboratorData.unitCode}` }
        });
        if (groupError) console.error('❌ ERRO ao criar grupo de colaboradores:', groupError);
        else grupoColaborador = groupData?.groupId;
      }
      
      if (grupoColaborador && cleanPhone) {
        const { error: addToGroupError } = await supabaseTreinamento.functions.invoke('add-collaborator-to-group', {
          body: { groupId: grupoColaborador, phone: cleanPhone, name: collaboratorData.name }
        });
        if (addToGroupError) console.error('❌ ERRO ao adicionar colaborador ao grupo:', addToGroupError);
        else console.log('✅ Colaborador adicionado ao grupo com sucesso.');
      }
    } else {
      console.warn('⚠️ AVISO: Unidade não encontrada para o código:', collaboratorData.unitCode);
    }
    
    const { error: notificationError } = await supabaseTreinamento.functions.invoke('notify-franchisee', {
      body: {
        collaboratorId: userId,
        collaboratorName: collaboratorData.name,
        collaboratorEmail: collaboratorData.email,
        collaboratorPosition: collaboratorData.position,
        unitCode: collaboratorData.unitCode
      }
    });
    if (notificationError) console.warn('Aviso: Falha ao enviar notificação para o franqueado:', notificationError);

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