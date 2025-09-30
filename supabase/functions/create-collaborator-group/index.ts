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

    if (!franchisee?.phone) {
      throw new Error('Franchisee phone not found. Cannot create group without initial participant.')
    }

    // Limpar e formatar telefone
    const cleanPhone = franchisee.phone.replace(/\D/g, '')
    const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`

    const groupName = `COLAB ${grupo}`
    
    console.log('Creating WhatsApp group:', groupName, 'with participant:', fullPhone)

    const zapiResponse = await fetch(`https://api.z-api.io/instances/${zapiInstanceId}/token/${zapiToken}/create-group`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Token': zapiClientToken
      },
      body: JSON.stringify({
        groupName: groupName,
        phone: [fullPhone]
      }),
    })

    if (!zapiResponse.ok) {
      const errorText = await zapiResponse.text()
      console.error('ZAPI error response:', errorText)
      throw new Error(`Failed to create WhatsApp group: ${errorText}`)
    }

    const zapiResult = await zapiResponse.json()
    console.log('ZAPI group creation response:', zapiResult)

    const groupId = zapiResult.phone || zapiResult.groupId || zapiResult.id
    
    if (!groupId) {
      console.error('No group ID in ZAPI response:', zapiResult)
      throw new Error('Failed to get group ID from ZAPI response')
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
