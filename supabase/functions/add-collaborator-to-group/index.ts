import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0'

declare const Deno: {
  env: {
    get: (key: string) => string | undefined;
  };
  serve: (handler: (req: Request) => Promise<Response> | Response) => void;
};

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
    const supabaseTreinamento = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        db: { schema: 'treinamento' }
      }
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
    
    const zapiPayload = {
      groupId: groupId,
      autoInvite: true,
      phones: [fullPhone]
    };
    
    console.log('ZAPI payload:', JSON.stringify(zapiPayload, null, 2));
    
    const zapiResponse = await fetch(zapiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Token': Deno.env.get('ZAPI_CLIENT_TOKEN') ?? ''
      },
      body: JSON.stringify(zapiPayload)
    })

    const zapiData = await zapiResponse.json()
    console.log('ZAPI add participant response:', zapiData)

    // Verificar se houve erro específico da Z-API
    if (zapiData.error || zapiData.value === false) {
      console.warn(`⚠️ Aviso ao adicionar ${name} (${fullPhone}): ${zapiData.error || 'Erro desconhecido'}`)
      
      // Retornar sucesso parcial com warning ao invés de erro fatal
      return new Response(
        JSON.stringify({ 
          success: true,
          warning: true,
          message: `Não foi possível adicionar ${name}: ${zapiData.error || 'Usuário não pode ser adicionado ao grupo'}`,
          phone: fullPhone,
          zapiResponse: zapiData
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!zapiResponse.ok) {
      console.warn(`⚠️ Resposta não OK ao adicionar ${name}: ${zapiResponse.status}`)
      return new Response(
        JSON.stringify({ 
          success: true,
          warning: true,
          message: `Aviso ao adicionar ${name}: status ${zapiResponse.status}`,
          phone: fullPhone,
          zapiResponse: zapiData
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`✅ ${name} adicionado com sucesso!`)
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Colaborador ${name} adicionado ao grupo com sucesso!`,
        phone: fullPhone,
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
