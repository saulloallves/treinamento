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

interface RemoveCollaboratorData {
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

    const { groupId, phone, name }: RemoveCollaboratorData = await req.json()

    console.log('Removing collaborator from group:', { groupId, phone, name })

    // Limpar o telefone (remover caracteres não numéricos)
    const cleanPhone = phone.replace(/\D/g, '')
    
    // Adicionar +55 se não tiver
    const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`

    // Chamar API ZAPI para remover participante do grupo
    const zapiInstanceId = Deno.env.get('ZAPI_INSTANCE_ID')
    const zapiToken = Deno.env.get('ZAPI_TOKEN')

    if (!zapiInstanceId || !zapiToken) {
      throw new Error('ZAPI credentials not configured')
    }

    const zapiUrl = `https://api.z-api.io/instances/${zapiInstanceId}/token/${zapiToken}/remove-participant`
    
    // Payload corrigido conforme documentação da Z-API
    const zapiPayload = {
      groupId: groupId,
      phones: [fullPhone] // Array de telefones conforme documentação
    }

    console.log('ZAPI remove participant payload:', JSON.stringify(zapiPayload, null, 2))
    
    const zapiResponse = await fetch(zapiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Token': Deno.env.get('ZAPI_CLIENT_TOKEN') ?? ''
      },
      body: JSON.stringify(zapiPayload)
    })

    const zapiData = await zapiResponse.json()
    console.log('ZAPI remove participant response:', zapiData)

    if (!zapiResponse.ok || !zapiData.success) {
      console.warn(`Failed to remove collaborator from group: ${JSON.stringify(zapiData)}`)
      // Não falha a operação se o colaborador já foi removido ou não está no grupo
      return new Response(
        JSON.stringify({ 
          success: true, 
          warning: `Colaborador ${name} foi removido do sistema, mas houve um problema ao remover do WhatsApp: ${zapiData.message || 'Erro desconhecido'}`,
          zapiResponse: zapiData
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Colaborador ${name} removido do grupo com sucesso!`,
        zapiResponse: zapiData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    // Retorna sucesso mesmo com erro, pois a remoção do grupo não deve bloquear a remoção do sistema
    return new Response(
      JSON.stringify({ 
        success: true, 
        warning: (error as Error).message || 'Erro ao remover do grupo WhatsApp, mas colaborador será removido do sistema' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
