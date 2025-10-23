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

  let payload;
  try {
    // --- INÍCIO DO BLOCO DE DIAGNÓSTICO ---
    console.log("--- DIAGNÓSTICO: Função 'create-collaborator-group' foi invocada ---");
    
    // Log dos cabeçalhos para identificar o chamador
    const headersObject = Object.fromEntries(req.headers);
    console.log("CABEÇALHOS DA REQUISIÇÃO:", JSON.stringify(headersObject, null, 2));

    // Log do método
    console.log("MÉTODO DA REQUISIÇÃO:", req.method);

    // Tenta extrair o corpo da requisição
    payload = await req.json();
    console.log("PAYLOAD RECEBIDO:", JSON.stringify(payload, null, 2));
    // --- FIM DO BLOCO DE DIAGNÓSTICO ---

    const { collaboratorName, collaboratorPhone, franchiseePhone, unitName } = payload;

    // Validação com nova mensagem de erro para diagnóstico
    if (!collaboratorName || !collaboratorPhone || !franchiseePhone || !unitName) {
      throw new Error(`DIAGNÓSTICO: Dados insuficientes recebidos. O payload foi: ${JSON.stringify(payload)}`);
    }

    // A lógica original de criação de grupo permanece aqui...
    // (Se a validação passar, o código abaixo será executado)

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
      throw new Error(`Erro ao criar grupo na ZAPI: ${errorBody}`);
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
      // Retorna a mensagem de erro de diagnóstico
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});