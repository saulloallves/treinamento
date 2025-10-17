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
    const MATRIZ_URL = Deno.env.get('MATRIZ_URL');
    const MATRIZ_SERVICE_KEY = Deno.env.get('MATRIZ_SERVICE_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Credenciais do Supabase local não configuradas.');
    }

    const supabaseLocal = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const collaboratorData: CollaboratorData = await req.json();
    console.log('Received payload for collaborator registration:', collaboratorData);
    let userId: string;

    const { data: existingUsers } = await supabaseLocal.auth.admin.listUsers();
    const existingUser = existingUsers.users?.find(u => u.email?.toLowerCase() === collaboratorData.email.toLowerCase());

    if (existingUser) {
      userId = existingUser.id;
    } else {
      const { data: newUser, error: authError } = await supabaseLocal.auth.admin.createUser({
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
            estado: collaboratorData.estado,
          }
        },
        email_confirm: true
      });
      if (authError) throw authError;
      if (!newUser.user?.id) throw new Error('Falha ao criar usuário - ID não retornado');
      userId = newUser.user.id;
    }

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

    if (!MATRIZ_URL || !MATRIZ_SERVICE_KEY) {
      console.error('!!! ERRO CRÍTICO: Credenciais da Matriz não encontradas. Pulando sincronização. !!!');
    } else {
      try {
        const supabaseMatriz = createClient(MATRIZ_URL, MATRIZ_SERVICE_KEY);
        let positionId: string;

        const { data: existingCargo, error: cargoSelectError } = await supabaseMatriz
          .from('cargos_loja')
          .select('id')
          .eq('role', collaboratorData.position)
          .maybeSingle();

        if (cargoSelectError) throw new Error(`Erro ao buscar cargo na Matriz: ${cargoSelectError.message}`);

        if (existingCargo) {
          positionId = existingCargo.id;
        } else {
          const { data: newCargo, error: cargoInsertError } = await supabaseMatriz
            .from('cargos_loja')
            .insert({ role: collaboratorData.position })
            .select('id')
            .single();
          if (cargoInsertError) throw new Error(`Erro ao criar cargo na Matriz: ${cargoInsertError.message}`);
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

        const { error: insertMatrizError } = await supabaseMatriz
          .from('colaboradores_loja')
          .insert(colaboradorLojaRecord);

        if (insertMatrizError) {
          if (insertMatrizError.code === '23505') {
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

    // 4. Check if collaborator group exists for unit, if not create it
    console.log('Verificando grupo de colaboradores da unidade...');
    console.log('Unit code recebido:', collaboratorData.unitCode, 'tipo:', typeof collaboratorData.unitCode);
    
    // Buscar unidade por codigo_grupo (convertendo para número se necessário)
    const unitCodeNumber = parseInt(collaboratorData.unitCode, 10);
    console.log('Unit code convertido para número:', unitCodeNumber);
    
    const { data: unidade, error: unidadeError } = await supabaseLocal
      .from('unidades')
      .select('grupo_colaborador, grupo, codigo_grupo')
      .eq('codigo_grupo', unitCodeNumber)
      .maybeSingle();
    
    if (unidadeError) {
      console.error('Erro ao buscar unidade:', unidadeError);
    }
    
    if (!unidade) {
      console.warn('⚠️ AVISO: Unidade não encontrada para o código:', collaboratorData.unitCode);
      console.warn('Pulando criação de grupo de colaboradores.');
    } else {
      console.log('✅ Unidade encontrada:', {
        codigo_grupo: unidade.codigo_grupo,
        grupo: unidade.grupo,
        grupo_colaborador: unidade.grupo_colaborador
      });
      
      let grupoColaborador = unidade.grupo_colaborador;
      
      if (!grupoColaborador) {
        // Criar grupo se não existe
        console.log('🔄 Grupo não existe. Iniciando criação...');
        const { data: groupData, error: groupError } = await supabaseLocal.functions.invoke('create-collaborator-group', {
          body: {
            unit_code: collaboratorData.unitCode,
            grupo: unidade.grupo || `UNIDADE ${collaboratorData.unitCode}`
          }
        });
        
        if (groupError) {
          console.error('❌ ERRO ao criar grupo de colaboradores:', groupError);
          console.error('Detalhes do erro:', JSON.stringify(groupError, null, 2));
        } else {
          grupoColaborador = groupData?.groupId;
          console.log('✅ Grupo de colaboradores criado:', grupoColaborador);
        }
      } else {
        console.log('✅ Grupo já existe:', grupoColaborador);
      }
      
      // 5. Add collaborator to WhatsApp group (apenas se grupo existir)
      if (grupoColaborador && cleanPhone) {
        console.log('🔄 Adicionando colaborador ao grupo WhatsApp...');
        console.log('Dados para adicionar:', {
          groupId: grupoColaborador,
          phone: cleanPhone,
          name: collaboratorData.name
        });
        
        const { error: addToGroupError } = await supabaseLocal.functions.invoke('add-collaborator-to-group', {
          body: {
            groupId: grupoColaborador,
            phone: cleanPhone,
            name: collaboratorData.name
          }
        });
        
        if (addToGroupError) {
          console.error('❌ ERRO ao adicionar colaborador ao grupo:', addToGroupError);
          console.error('Detalhes do erro:', JSON.stringify(addToGroupError, null, 2));
        } else {
          console.log('✅ Colaborador adicionado ao grupo com sucesso.');
        }
      } else {
        if (!grupoColaborador) {
          console.warn('⚠️ Grupo não existe, não será possível adicionar colaborador ao WhatsApp.');
        }
        if (!cleanPhone) {
          console.warn('⚠️ Telefone não fornecido, não será possível adicionar colaborador ao WhatsApp.');
        }
      }
    }
    
    // 6. Call notify-franchisee function
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