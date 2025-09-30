import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { unit_code, grupo } = await req.json()
    
    console.log('Creating collaborator group:', { unit_code, grupo })

    // Get environment variables
    const zapiToken = Deno.env.get('ZAPI_TOKEN')
    const zapiInstanceId = Deno.env.get('ZAPI_INSTANCE_ID')
    
    if (!zapiToken || !zapiInstanceId) {
      throw new Error('ZAPI credentials not configured')
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verificar se já existe grupo_colaborador
    const { data: unidade, error: unidadeError } = await supabase
      .from('unidades')
      .select('grupo_colaborador, grupo')
      .eq('codigo_grupo', unit_code)
      .single()

    if (unidadeError) {
      console.error('Error fetching unidade:', unidadeError)
      throw unidadeError
    }

    // Se já existe grupo, não criar novamente
    if (unidade.grupo_colaborador && unidade.grupo_colaborador !== '') {
      console.log('Collaborator group already exists:', unidade.grupo_colaborador)
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Grupo de colaboradores já existe',
          groupId: unidade.grupo_colaborador 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

    // Nome do grupo: COLAB + valor da coluna grupo
    const groupName = `COLAB${grupo || unit_code}`
    
    console.log('Creating WhatsApp group:', groupName)

    // Criar grupo no WhatsApp via ZAPI
    const zapiResponse = await fetch(
      `https://api.z-api.io/instances/${zapiInstanceId}/token/${zapiToken}/create-group`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupName: groupName,
          participants: [] // Grupo começa vazio, participantes serão adicionados depois
        }),
      }
    )

    const zapiResult = await zapiResponse.json()
    console.log('ZAPI create group response:', zapiResult)

    if (!zapiResult.id) {
      throw new Error('Failed to create WhatsApp group: ' + JSON.stringify(zapiResult))
    }

    // Atualizar a coluna grupo_colaborador na tabela unidades
    const { error: updateError } = await supabase
      .from('unidades')
      .update({ grupo_colaborador: zapiResult.id })
      .eq('codigo_grupo', unit_code)

    if (updateError) {
      console.error('Error updating unidade:', updateError)
      throw updateError
    }

    console.log('Collaborator group created and saved:', zapiResult.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Grupo de colaboradores criado com sucesso',
        groupId: zapiResult.id,
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
