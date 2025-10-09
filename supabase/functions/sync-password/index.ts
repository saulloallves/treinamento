import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SyncPasswordPayload {
  user_id: string;
  new_password: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const payload = await req.json() as SyncPasswordPayload
    const { user_id, new_password } = payload

    console.log(`[sync-password] Sincronizando senha para usuário: ${user_id}`)

    if (!user_id || !new_password) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'user_id e new_password são obrigatórios' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validar se a nova senha tem pelo menos 6 caracteres
    if (new_password.length < 6) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'A senha deve ter pelo menos 6 caracteres' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verificar se o usuário existe no auth
    const { data: userData, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(user_id)
    
    if (getUserError || !userData.user) {
      console.error(`[sync-password] Usuário não encontrado: ${user_id}`, getUserError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Usuário não encontrado no sistema de autenticação' 
        }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Atualizar senha no sistema de autenticação
    const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(user_id, {
      password: new_password
    })

    if (updateAuthError) {
      console.error(`[sync-password] Erro ao atualizar senha no auth:`, updateAuthError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Erro ao atualizar senha: ${updateAuthError.message}` 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`[sync-password] Senha sincronizada com sucesso para usuário: ${user_id}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Senha sincronizada com sucesso',
        user_id: user_id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[sync-password] Erro:', error)
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