/**
 * Shared WhatsApp messaging utilities for edge functions
 */

declare const Deno: {
  env: {
    get: (key: string) => string | undefined;
  };
};

/**
 * Mensagem padrão de boas-vindas para grupos de colaboradores
 */
export const WELCOME_MESSAGE = `📢 Bem-vindo ao canal oficial do Girabot! 🤖💛

Oi, eu sou o Girabot, e esse é o canal direto da franquia Cresci e Perdi com você, colaborador.  
Aqui você vai receber todas as atualizações oficiais da franquia, incluindo:  
- Central de treinamento 🎓  
- Cursos e materiais 📚  
- Acessos e comunicados importantes 🔐  
- Novidades, campanhas e ferramentas novas 🚀  

Este grupo é o nosso portal principal para apresentar informações, instruções e novidades que vão te ajudar a desempenhar melhor suas funções dentro da unidade.  

👉 Fique atento: todas as comunicações oficiais da franquia passam por aqui`;

/**
 * Envia uma mensagem de texto para um grupo WhatsApp via Z-API
 * 
 * @param groupId - ID do grupo WhatsApp (formato: xxxxx-group)
 * @param message - Texto da mensagem a ser enviada
 * @returns Promise com resultado do envio
 */
export async function sendMessageToGroup(
  groupId: string,
  message: string
): Promise<{ success: boolean; error?: string; data?: unknown }> {
  try {
    const zapiInstanceId = Deno.env.get('ZAPI_INSTANCE_ID_TREINAMENTO');
    const zapiToken = Deno.env.get('ZAPI_INSTANCE_TOKEN_TREINAMENTO');
    const zapiClientToken = Deno.env.get('ZAPI_CLIENT_TOKEN_TREINAMENTO');

    if (!zapiInstanceId || !zapiToken || !zapiClientToken) {
      console.error('❌ ZAPI credentials not configured for sending message');
      return {
        success: false,
        error: 'ZAPI credentials not configured',
      };
    }

    console.log(`📤 Enviando mensagem para grupo ${groupId}...`);

    const zapiUrl = `https://api.z-api.io/instances/${zapiInstanceId}/token/${zapiToken}/send-text`;

    const payload = {
      phone: groupId,
      message: message,
    };

    const response = await fetch(zapiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Token': zapiClientToken,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      console.error('❌ Erro ao enviar mensagem:', data);
      return {
        success: false,
        error: data.error || `HTTP ${response.status}`,
        data,
      };
    }

    console.log('✅ Mensagem enviada com sucesso!', data);
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('❌ Exceção ao enviar mensagem:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Envia mensagem de boas-vindas padrão para um grupo de colaboradores
 * 
 * @param groupId - ID do grupo WhatsApp
 * @returns Promise com resultado do envio
 */
export async function sendWelcomeMessage(groupId: string) {
  console.log(`🎉 Enviando mensagem de boas-vindas para grupo ${groupId}`);
  return await sendMessageToGroup(groupId, WELCOME_MESSAGE);
}
