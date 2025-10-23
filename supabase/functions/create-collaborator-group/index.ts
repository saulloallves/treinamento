import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

// Função auxiliar para chamadas à API ZAPI
async function callZapi(endpoint: string, body: object) {
  const instanceId = Deno.env.get('ZAPI_INSTANCE_ID');
  const token = Deno.env.get('ZAPI_TOKEN');
  const clientToken = Deno.env.get('ZAPI_CLIENT_TOKEN');

  if (!instanceId || !token || !clientToken) {
    throw new Error("Credenciais da ZAPI não configuradas nas variáveis de ambiente.");
  }

  const url = `https://api.z-api.io/instances/${instanceId}/token/${token}/${endpoint}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Client-Token': clientToken
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Erro na API ZAPI (${endpoint}): ${response.status} ${response.statusText} - ${errorBody}`);
  }

  return await response.json();
}


serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { collaboratorName, collaboratorPhone, franchiseePhone, unitName } = await req.json();

    if (!collaboratorName || !collaboratorPhone || !franchiseePhone || !unitName) {
      throw new Error("Dados insuficientes para criar o grupo. Faltam informações do colaborador, franqueado ou unidade.");
    }

    // --- 1. Definir Participantes e Admins ---
    const defaultPhone = '5511940477721';
    const girabotPhone = '5519993808900';
    const trainingPhone = '5519993808685';
    const profilePictureUrl = 'https://wpuwsocezhlqlqxifpyk.supabase.co/storage/v1/object/public/group-assets/grupo-colaborador-avatar.png.png';

    const participants = [
      defaultPhone,
      girabotPhone,
      trainingPhone,
      franchiseePhone,
      collaboratorPhone
    ].map(phone => phone.replace(/\D/g, '')); // Normaliza os números

    const admins = [
      defaultPhone,
      girabotPhone,
      trainingPhone,
      franchiseePhone
    ].map(phone => phone.replace(/\D/g, ''));

    const groupName = `Colaborador - ${collaboratorName} - ${unitName}`;

    // --- 2. Criar o Grupo ---
    console.log(`Criando grupo "${groupName}" com ${participants.length} participantes.`);
    const createGroupResponse = await callZapi('create-group', {
      groupName: groupName,
      phones: participants
    });
    const groupId = createGroupResponse?.value?.id;
    if (!groupId) {
      throw new Error("Falha ao criar o grupo. A resposta da API não continha um ID de grupo.");
    }
    console.log(`✅ Grupo criado com sucesso. ID: ${groupId}`);

    // --- 3. Promover Admins ---
    console.log(`Promovendo ${admins.length} participantes a administradores.`);
    for (const adminPhone of admins) {
      await callZapi('promote-participant', {
        groupId: groupId,
        phone: adminPhone
      });
      console.log(`- ${adminPhone} promovido a admin.`);
    }
    console.log("✅ Todos os administradores foram promovidos.");

    // --- 4. Restringir Mensagens ---
    console.log("Configurando grupo para 'somente administradores podem enviar mensagens'.");
    await callZapi('modify-group-settings', {
      groupId: groupId,
      sendMessages: 'admins'
    });
    console.log("✅ Configurações do grupo atualizadas.");

    // --- 5. Definir Foto de Perfil ---
    console.log("Definindo a foto de perfil do grupo.");
    await callZapi('set-group-profile-picture', {
      groupId: groupId,
      image: profilePictureUrl
    });
    console.log("✅ Foto de perfil definida com sucesso.");

    return new Response(JSON.stringify({
      success: true,
      message: `Grupo "${groupName}" criado e configurado com sucesso.`,
      groupId: groupId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Erro na função create-collaborator-group:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});