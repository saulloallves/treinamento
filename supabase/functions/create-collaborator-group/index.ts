import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { unit_code, grupo } = await req.json()
    
    console.log('=== INÍCIO: create-collaborator-group ===');
    console.log('Dados recebidos:', { unit_code, grupo, unit_code_type: typeof unit_code });

    if (!grupo) {
      throw new Error('Grupo is required')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Converter unit_code para número se necessário
    const unitCodeNumber = typeof unit_code === 'string' ? parseInt(unit_code, 10) : unit_code;
    console.log('Unit code convertido para número:', unitCodeNumber);

    // Verificar se a unidade já tem um grupo de colaboradores
    console.log('Verificando se unidade já tem grupo...');
    const { data: existingUnit, error: existingUnitError } = await supabase
      .from('unidades')
      .select('grupo_colaborador, grupo, codigo_grupo')
      .eq('codigo_grupo', unitCodeNumber)
      .maybeSingle()

    if (existingUnitError) {
      console.error('Erro ao buscar unidade:', existingUnitError);
      throw new Error(`Erro ao buscar unidade: ${existingUnitError.message}`);
    }

    if (!existingUnit) {
      console.error('Unidade não encontrada para código:', unit_code);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Unidade com código ${unit_code} não encontrada no sistema.`
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404
        }
      )
    }

    console.log('Unidade encontrada:', {
      codigo_grupo: existingUnit.codigo_grupo,
      grupo: existingUnit.grupo,
      grupo_colaborador: existingUnit.grupo_colaborador
    });

    if (existingUnit?.grupo_colaborador) {
      console.log('⚠️ Unidade já tem grupo de colaboradores:', existingUnit.grupo_colaborador);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Esta unidade já possui um grupo de colaboradores ativo. Se deseja recriar o grupo, primeiro remova o grupo existente nas configurações da unidade.',
          groupId: existingUnit.grupo_colaborador
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    const zapiToken = Deno.env.get('ZAPI_TOKEN')
    const zapiInstanceId = Deno.env.get('ZAPI_INSTANCE_ID')
    const zapiClientToken = Deno.env.get('ZAPI_CLIENT_TOKEN')
    
    if (!zapiToken || !zapiInstanceId || !zapiClientToken) {
      throw new Error('ZAPI credentials not configured')
    }

    // Buscar telefone do franqueado para adicionar como participante inicial
    const { data: franchisee } = await supabase
      .from('users')
      .select('phone')
      .eq('unit_code', unit_code)
      .eq('role', 'Franqueado')
      .eq('active', true)
      .not('phone', 'is', null)
      .single()

    // Número padrão que sempre será adicionado aos grupos
    const defaultPhone = '5511940477721'
    
    // Lista de participantes: sempre inclui o número padrão
    const participants = [defaultPhone]
    
    // Lista de admins a serem promovidos
    const adminsToPromote = [defaultPhone]
    
    // Adiciona o franqueado se tiver telefone
    if (franchisee?.phone) {
      const cleanPhone = franchisee.phone.replace(/\D/g, '')
      const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`
      if (fullPhone !== defaultPhone) {
        participants.push(fullPhone)
        adminsToPromote.push(fullPhone) // Franqueado também é admin
      }
    }

    const groupName = `COLAB ${grupo}`
    
    console.log('Creating WhatsApp group:', groupName, 'with participants:', participants)

    const zapiResponse = await fetch(`https://api.z-api.io/instances/${zapiInstanceId}/token/${zapiToken}/create-group`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Token': zapiClientToken
      },
      body: JSON.stringify({
        autoInvite: true,
        groupName: groupName,
        phones: participants
      }),
    })

    const responseText = await zapiResponse.text()
    console.log('ZAPI response status:', zapiResponse.status)
    console.log('ZAPI response text:', responseText)

    if (!zapiResponse.ok) {
      console.error('ZAPI error response:', responseText)
      
      // Verificar se é erro de grupo duplicado
      if (responseText.includes('already exists') || responseText.includes('já existe')) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Um grupo com este nome já existe no WhatsApp. Por favor, use um nome diferente ou remova o grupo existente primeiro.',
            zapiError: responseText
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
          }
        )
      }
      
      throw new Error(`Failed to create WhatsApp group: ${responseText}`)
    }

    let zapiResult
    try {
      zapiResult = JSON.parse(responseText)
    } catch (e) {
      console.error('Failed to parse ZAPI response:', responseText)
      throw new Error(`Invalid JSON response from ZAPI: ${responseText}`)
    }
    
    console.log('ZAPI group creation response:', zapiResult)

    const groupId = zapiResult.phone || zapiResult.groupId || zapiResult.id
    
    if (!groupId) {
      console.error('No group ID in ZAPI response:', zapiResult)
      throw new Error('Failed to get group ID from ZAPI response')
    }

    // Promover todos os admins (número padrão e franqueado)
    for (const adminPhone of adminsToPromote) {
      try {
        const promoteResponse = await fetch(`https://api.z-api.io/instances/${zapiInstanceId}/token/${zapiToken}/promote-participant`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Client-Token': zapiClientToken
          },
          body: JSON.stringify({
            groupId: groupId,
            phone: adminPhone
          }),
        })
        
        if (!promoteResponse.ok) {
          console.error(`Failed to promote ${adminPhone} to admin:`, await promoteResponse.text())
        } else {
          console.log(`Successfully promoted ${adminPhone} to admin`)
        }
      } catch (promoteError) {
        console.error(`Error promoting ${adminPhone} to admin:`, promoteError)
        // Não lançar erro aqui - grupo já foi criado com sucesso
      }
    }

    // Definir foto do grupo
    try {
      const imageUrl = 'https://tctkacgbhqvkqovctrzf.supabase.co/storage/v1/object/public/course-covers/grupo-colaborador-avatar.png'
      
      const photoResponse = await fetch(`https://api.z-api.io/instances/${zapiInstanceId}/token/${zapiToken}/change-group-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Client-Token': zapiClientToken
        },
        body: JSON.stringify({
          groupId: groupId,
          image: imageUrl
        }),
      })
      
      if (!photoResponse.ok) {
        console.error('Failed to set group photo, but group was created:', await photoResponse.text())
      } else {
        console.log('Successfully set group photo')
      }
    } catch (photoError) {
      console.error('Error setting group photo:', photoError)
      // Não lançar erro aqui - grupo já foi criado com sucesso
    }

    const { error: updateError } = await supabase
      .from('unidades')
      .update({ grupo_colaborador: groupId })
      .eq('codigo_grupo', unitCodeNumber)

    if (updateError) {
      console.error('❌ Erro ao atualizar unidades:', updateError)
      throw new Error(`Failed to update unidades: ${updateError.message}`)
    }

    console.log(`✅ Grupo criado com sucesso!`);
    console.log(`   - ID: ${groupId}`);
    console.log(`   - Nome: ${groupName}`);
    console.log(`   - Unidade atualizada: ${unitCodeNumber}`);
    console.log('=== FIM: create-collaborator-group ===');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Grupo de colaboradores criado com sucesso',
        groupId: groupId,
        groupName: groupName
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error in create-collaborator-group function:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: (error as Error).message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
