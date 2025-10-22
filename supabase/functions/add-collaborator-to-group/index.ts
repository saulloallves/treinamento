import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AddCollaboratorData {
  groupId: string;
  phone: string;
  name: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { groupId, phone, name }: AddCollaboratorData = await req.json()

    console.log('Adding collaborator to group:', { groupId, phone, name })

    // Limpar o telefone (remover caracteres não numéricos)
    const cleanPhone = phone.replace(/\D/g, '')
    
    // Adicionar +55 se não tiver
    const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`

    // Chamar API ZAPI para adicionar participante ao grupo
    const zapiInstanceId = Deno.env.get('ZAPI_INSTANCE_ID')
    const zapiToken = Deno.env.get('ZAPI_TOKEN')

    if (!zapiInstanceId || !zapiToken) {
      throw new Error('ZAPI credentials not configured')
    }

    const zapiUrl = `https://api.z-api.io/instances/${zapiInstanceId}/token/${zapiToken}/add-participant`
    
    const zapiResponse = await fetch(zapiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Token': Deno.env.get('ZAPI_CLIENT_TOKEN') ?? ''
      },
      body: JSON.stringify({
        groupId: groupId,
        phone: fullPhone
      })
    })

    const zapiData = await zapiResponse.json()
    console.log('ZAPI add participant response:', zapiData)

    if (!zapiResponse.ok) {
      throw new Error(`Failed to add collaborator to group: ${JSON.stringify(zapiData)}`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Colaborador ${name} adicionado ao grupo com sucesso!`,
        zapiResponse: zapiData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: (error as Error).message || 'Erro interno do servidor' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
