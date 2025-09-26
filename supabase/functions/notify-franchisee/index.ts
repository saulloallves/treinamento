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
    const { collaboratorId, collaboratorName, unitCode } = await req.json()
    
    console.log('Received notification request:', { collaboratorId, collaboratorName, unitCode })

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

    // Find franchisee for this unit
    const { data: franchisee, error: franchiseeError } = await supabase
      .rpc('find_franchisee_by_unit_code', { _unit_code: unitCode })

    if (franchiseeError) {
      console.error('Error finding franchisee:', franchiseeError)
      throw franchiseeError
    }

    if (!franchisee) {
      console.log('No franchisee found for unit code:', unitCode)
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Nenhum franqueado encontrado para esta unidade' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404
        }
      )
    }

    // Get franchisee details
    const { data: franchiseeData, error: franchiseeDataError } = await supabase
      .from('users')
      .select('name, phone')
      .eq('id', franchisee)
      .single()

    if (franchiseeDataError) {
      console.error('Error fetching franchisee data:', franchiseeDataError)
      throw franchiseeDataError
    }

    // Create approval record
    const { data: approval, error: approvalError } = await supabase
      .from('collaboration_approvals')
      .insert({
        collaborator_id: collaboratorId,
        franchisee_id: franchisee,
        unit_code: unitCode,
        status: 'pendente'
      })
      .select('id, approval_token')
      .single()

    if (approvalError) {
      console.error('Error creating approval record:', approvalError)
      throw approvalError
    }

    // Send WhatsApp notification if franchisee has phone
    if (franchiseeData.phone) {
      const approveUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/approve-collaborator?token=${approval.approval_token}&approve=true`
      const rejectUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/approve-collaborator?token=${approval.approval_token}&approve=false`

      const message = `🔔 *Nova solicitação de cadastro*\n\n` +
        `*Colaborador:* ${collaboratorName}\n` +
        `*Unidade:* ${unitCode}\n\n` +
        `Para aprovar ou rejeitar:\n\n` +
        `✅ Aprovar: ${approveUrl}\n` +
        `❌ Rejeitar: ${rejectUrl}\n\n` +
        `_Esta mensagem foi enviada automaticamente pelo sistema de treinamentos._`

      const zapiResponse = await fetch(`https://api.z-api.io/instances/${zapiInstanceId}/token/${zapiToken}/send-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: franchiseeData.phone.replace(/[^\d]/g, ''),
          message: message
        }),
      })

      const zapiResult = await zapiResponse.json()
      console.log('ZAPI response:', zapiResult)

      // Update notification sent status
      await supabase
        .from('collaboration_approvals')
        .update({ notification_sent: true })
        .eq('id', approval.id)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notificação enviada com sucesso',
        approvalId: approval.id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error in notify-franchisee function:', error)
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