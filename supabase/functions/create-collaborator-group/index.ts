import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const { collaboratorName, collaboratorPhone, franchiseePhone, unitName } = payload;

    // Validação limpa e restaurada
    if (!collaboratorName || !collaboratorPhone || !franchiseePhone || !unitName) {
      throw new Error("Dados insuficientes para criar o grupo. Faltam informações do colaborador, franqueado ou unidade.");
    }

    const zapiInstance = Deno.env.get('ZAPI_INSTANCE_ID');
    const zapiToken = Deno.env.get('ZAPI_TOKEN');
    const zapiClientToken = Deno.env.get('ZAPI_CLIENT_TOKEN');

    if (!zapiInstance || !zapiToken || !zapiClientToken) {
      throw new Error("As variáveis de ambiente da ZAPI não estão configuradas.");
    }

    const groupName = `Colaboradores ${unitName}`;
    const participants = [franchiseePhone, collaboratorPhone];

    const createGroupResponse = await fetch(`https://api.z-api.io/instances/${zapiInstance}/token/${zapiToken}/create-group`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Token': zapiClientToken
      },
      body: JSON.stringify({
        groupName,
        participants
      })
    });

    if (!createGroupResponse.ok) {
      const errorBody = await createGroupResponse.text();
      console.error("Erro da API ZAPI:", errorBody);
      throw new Error(`Erro ao criar grupo na ZAPI.`);
    }

    const groupData = await createGroupResponse.json();
    const groupId = groupData.groupId;

    console.log(`Grupo '${groupName}' criado com sucesso. ID: ${groupId}`);

    return new Response(JSON.stringify({ success: true, groupId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error(`Erro na função create-collaborator-group: ${error.message}`);
    return new Response(JSON.stringify({
      success: false,
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});