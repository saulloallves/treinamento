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
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    const approve = url.searchParams.get('approve') === 'true';

    if (!token) {
      // HTML de erro para token inválido
      return new Response(`<html>...</html>`, { status: 400, headers: { ...corsHeaders, 'Content-Type': 'text/html' } });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    const supabaseTreinamento = createClient(supabaseUrl, supabaseServiceKey, {
      db: { schema: 'treinamento' }
    });
    const supabasePublic = createClient(supabaseUrl, supabaseServiceKey);

    const { data: approval, error: approvalError } = await supabaseTreinamento
      .from('collaboration_approvals')
      .select(`id, collaborator_id, franchisee_id, status, users!collaboration_approvals_collaborator_id_fkey(name)`)
      .eq('approval_token', token)
      .single();

    if (approvalError || !approval) {
      // HTML de erro para solicitação não encontrada
      return new Response(`<html>...</html>`, { status: 404, headers: { ...corsHeaders, 'Content-Type': 'text/html' } });
    }

    if (approval.status !== 'pendente') {
      // HTML de aviso para solicitação já processada
      return new Response(`<html>...</html>`, { status: 409, headers: { ...corsHeaders, 'Content-Type': 'text/html' } });
    }

    // Aprova o colaborador no banco de dados
    const { error: processError } = await supabaseTreinamento.rpc('approve_collaborator', {
      _approval_id: approval.id,
      _approve: approve
    });

    if (processError) throw processError;

    // --- LÓGICA DE CRIAÇÃO DE GRUPO (CORRIGIDA) ---
    if (approve) {
      console.log('Colaborador aprovado. Orquestrando criação de grupo de WhatsApp...');
      
      try {
        // 1. Coletar dados do Colaborador
        const { data: collaboratorData, error: collaboratorError } = await supabaseTreinamento.from('users').select('name, phone, unit_code').eq('id', approval.collaborator_id).single();
        if (collaboratorError || !collaboratorData) throw new Error(`Dados do colaborador (ID: ${approval.collaborator_id}) não encontrados.`);

        // 2. Coletar dados do Franqueado (A PARTE QUE FALTAVA)
        const { data: franchiseeData, error: franchiseeError } = await supabaseTreinamento.from('users').select('phone').eq('id', approval.franchisee_id).single();
        if (franchiseeError || !franchiseeData) throw new Error(`Dados do franqueado (ID: ${approval.franchisee_id}) não encontrados.`);

        // 3. Coletar dados da Unidade
        const { data: unidadeData, error: unidadeError } = await supabasePublic.from('unidades').select('group_name').eq('group_code', collaboratorData.unit_code).single();
        if (unidadeError || !unidadeData) throw new Error(`Dados da unidade (Código: ${collaboratorData.unit_code}) não encontrados.`);

        // 4. Montar o Payload CORRETO
        const groupPayload = {
          collaboratorName: collaboratorData.name,
          collaboratorPhone: collaboratorData.phone,
          franchiseePhone: franchiseeData.phone,
          unitName: unidadeData.group_name
        };

        console.log('Payload final para create-collaborator-group:', JSON.stringify(groupPayload, null, 2));

        // 5. Invocar a função de criação de grupo UMA ÚNICA VEZ
        const { error: invokeError } = await supabaseTreinamento.functions.invoke('create-collaborator-group', {
          body: groupPayload
        });

        if (invokeError) {
          // Apenas loga o erro, não impede a resposta de sucesso da aprovação
          console.error('Erro ao invocar a criação de grupo, mas a aprovação foi bem-sucedida:', invokeError);
        } else {
          console.log('✅ Invocação para criar grupo de WhatsApp enviada com sucesso.');
        }

      } catch (groupOrchestrationError) {
        // Loga qualquer erro na coleta de dados, mas não impede a resposta de sucesso
        console.error('⚠️ Falha na orquestração da criação de grupo:', groupOrchestrationError.message);
      }
    }

    const action = approve ? 'aprovado' : 'rejeitado';
    const actionIcon = approve ? '✅' : '❌';
    const actionColor = approve ? '#27ae60' : '#e74c3c';
    const collaboratorName = approval.users?.name || 'Colaborador';

    // Retorna a página de sucesso para o franqueado
    return new Response(`<html>
        <head>
          <title>Resposta de Aprovação</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f8f9fa;">
          <div style="max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: ${actionColor}; margin-bottom: 20px;">
              ${actionIcon} Colaborador ${action}!
            </h2>
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              O colaborador <strong>${collaboratorName}</strong> foi ${action} com sucesso.
            </p>
            <p style="font-size: 14px; color: #666;">
              ${approve ? 'O colaborador já pode acessar o sistema de treinamentos.' : 'O colaborador não terá acesso ao sistema.'}
            </p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #999;">
              Sistema de Treinamentos Cresci e Perdi
            </p>
          </div>
        </body>
      </html>`, {
      headers: { ...corsHeaders, 'Content-Type': 'text/html' },
      status: 200
    });

  } catch (error) {
    console.error('Error in approve-collaborator function:', error);
    // Retorna a página de erro genérica
    return new Response(`<html>...</html>`, { status: 500, headers: { ...corsHeaders, 'Content-Type': 'text/html' } });
  }
});