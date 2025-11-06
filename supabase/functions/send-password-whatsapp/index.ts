import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseTreinamento = createClient(supabaseUrl, supabaseKey, {
      db: { schema: 'treinamento' }
    });

    const { phone } = await req.json();

    if (!phone) {
      return new Response(
        JSON.stringify({ success: false, error: 'Número de telefone não fornecido' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Normalizar telefone (remover caracteres especiais)
    const cleanPhone = phone.replace(/\D/g, '');
    
    console.log('Buscando usuário com telefone:', cleanPhone);

    // Buscar usuário pelo telefone
    const { data: userData, error: userError } = await supabaseTreinamento
      .from('users')
      .select('id, name, email, visible_password, phone')
      .eq('phone', cleanPhone)
      .eq('active', true)
      .maybeSingle();

    if (userError || !userData) {
      console.error('Erro ao buscar usuário:', userError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Usuário não encontrado com este número de telefone' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    if (!userData.visible_password) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Senha não disponível. Entre em contato com o administrador.' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Enviar senha via WhatsApp usando Z-API
    const zapiInstanceId = Deno.env.get('ZAPI_INSTANCE_ID_TREINAMENTO');
    const zapiToken = Deno.env.get('ZAPI_INSTANCE_TOKEN_TREINAMENTO');
    const zapiClientToken = Deno.env.get('ZAPI_CLIENT_TOKEN_TREINAMENTO') || '';

    if (!zapiInstanceId || !zapiToken) {
      console.error('Credenciais Z-API não configuradas');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Serviço de WhatsApp não configurado' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Formatar telefone para formato internacional (55XXXXXXXXXXX)
    const internationalPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

    const message = `*Sistema de Treinamentos Cresci e Perdi!* 🎯

Aqui estão os seus dados de acesso:

🔑 *Senha:* ${userData.visible_password}
📱 *Login:* Utilize o *seu número* de telefone cadastrado.

Agora é só acessar a plataforma, fazer login e aproveitar todo o conteúdo que preparamos para você.`;

    console.log('Enviando WhatsApp para:', internationalPhone);

    const whatsappResponse = await fetch(
      `https://api.z-api.io/instances/${zapiInstanceId}/token/${zapiToken}/send-button-otp`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Client-Token': zapiClientToken
        },
        body: JSON.stringify({
          phone: internationalPhone,
          message: message,
          code: userData.visible_password,
          buttonText: "Copiar Senha"
        }),
      }
    );

    const whatsappResult = await whatsappResponse.json();
    console.log('Resultado do envio WhatsApp:', whatsappResult);

    if (!whatsappResponse.ok) {
      console.error('Erro ao enviar WhatsApp:', whatsappResult);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Erro ao enviar mensagem no WhatsApp' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Senha enviada com sucesso para o WhatsApp' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Erro no servidor:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erro interno do servidor' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
