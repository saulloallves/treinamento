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
    const url = new URL(req.url)
    const token = url.searchParams.get('token')
    const approve = url.searchParams.get('approve') === 'true'
    
    console.log('Received approval request:', { token, approve })

    if (!token) {
      return new Response(
        `<html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2 style="color: #e74c3c;">❌ Token inválido</h2>
            <p>Link de aprovação inválido ou expirado.</p>
          </body>
        </html>`,
        { 
          headers: { ...corsHeaders, 'Content-Type': 'text/html' },
          status: 400
        }
      )
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Find approval by token
    const { data: approval, error: approvalError } = await supabase
      .from('collaboration_approvals')
      .select(`
        id,
        collaborator_id,
        franchisee_id,
        status,
        users!collaboration_approvals_collaborator_id_fkey(name)
      `)
      .eq('approval_token', token)
      .single()

    if (approvalError || !approval) {
      console.error('Error finding approval:', approvalError)
      return new Response(
        `<html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2 style="color: #e74c3c;">❌ Solicitação não encontrada</h2>
            <p>Link de aprovação inválido ou já processado.</p>
          </body>
        </html>`,
        { 
          headers: { ...corsHeaders, 'Content-Type': 'text/html' },
          status: 404
        }
      )
    }

    if (approval.status !== 'pendente') {
      const statusText = approval.status === 'aprovado' ? 'aprovada' : 'rejeitada'
      return new Response(
        `<html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2 style="color: #f39c12;">⚠️ Solicitação já processada</h2>
            <p>Esta solicitação já foi ${statusText} anteriormente.</p>
          </body>
        </html>`,
        { 
          headers: { ...corsHeaders, 'Content-Type': 'text/html' },
          status: 409
        }
      )
    }

    // Call the approve_collaborator function
    const { error: processError } = await supabase
      .rpc('approve_collaborator', { 
        _approval_id: approval.id, 
        _approve: approve 
      })

    if (processError) {
      console.error('Error processing approval:', processError)
      throw processError
    }

    const action = approve ? 'aprovado' : 'rejeitado'
    const actionIcon = approve ? '✅' : '❌'
    const actionColor = approve ? '#27ae60' : '#e74c3c'
    
    const collaboratorName = (approval as any).users?.name || 'Colaborador'

    return new Response(
      `<html>
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
              ${approve ? 
                'O colaborador já pode acessar o sistema de treinamentos.' : 
                'O colaborador não terá acesso ao sistema.'}
            </p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #999;">
              Sistema de Treinamentos Cresci e Perdi
            </p>
          </div>
        </body>
      </html>`,
      { 
        headers: { ...corsHeaders, 'Content-Type': 'text/html' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error in approve-collaborator function:', error)
    return new Response(
      `<html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h2 style="color: #e74c3c;">❌ Erro interno</h2>
          <p>Ocorreu um erro ao processar a solicitação. Tente novamente.</p>
          <p style="font-size: 12px; color: #666;">${(error as Error).message}</p>
        </body>
      </html>`,
      { 
        headers: { ...corsHeaders, 'Content-Type': 'text/html' },
        status: 500
      }
    )
  }
})