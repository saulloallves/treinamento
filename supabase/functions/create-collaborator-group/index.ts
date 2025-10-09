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
    
    console.log('Creating collaborator group:', { unit_code, grupo })

    if (!grupo) {
      throw new Error('Grupo is required')
    }

    const zapiToken = Deno.env.get('ZAPI_TOKEN')
    const zapiInstanceId = Deno.env.get('ZAPI_INSTANCE_ID')
    const zapiClientToken = Deno.env.get('ZAPI_CLIENT_TOKEN')
    
    if (!zapiToken || !zapiInstanceId || !zapiClientToken) {
      throw new Error('ZAPI credentials not configured')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

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
    
    // Adiciona o franqueado se tiver telefone
    if (franchisee?.phone) {
      const cleanPhone = franchisee.phone.replace(/\D/g, '')
      const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`
      if (fullPhone !== defaultPhone) {
        participants.push(fullPhone)
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

    // Promover número padrão a administrador do grupo
    try {
      const promoteResponse = await fetch(`https://api.z-api.io/instances/${zapiInstanceId}/token/${zapiToken}/promote-participant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Client-Token': zapiClientToken
        },
        body: JSON.stringify({
          groupId: groupId,
          phone: defaultPhone
        }),
      })
      
      if (!promoteResponse.ok) {
        console.error('Failed to promote admin, but group was created:', await promoteResponse.text())
      } else {
        console.log('Successfully promoted default phone to admin')
      }
    } catch (promoteError) {
      console.error('Error promoting to admin:', promoteError)
      // Não lançar erro aqui - grupo já foi criado com sucesso
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
      .eq('codigo_grupo', unit_code)

    if (updateError) {
      console.error('Error updating unidades:', updateError)
      throw new Error(`Failed to update unidades: ${updateError.message}`)
    }

    console.log(`Group created successfully. ID: ${groupId}, Name: ${groupName}`)

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
