import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const { email } = await req.json()

    console.log(`Redefinindo senha para: ${email}`)

    // Buscar usuário no auth
    const { data: authUser, error: getUserError } = await supabaseAdmin.auth.admin.listUsers({
      filter: `email.eq.${email}`
    })
    
    if (getUserError || !authUser.users || authUser.users.length === 0) {
      console.error('Usuário não encontrado no auth:', getUserError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Usuário não encontrado no sistema de autenticação' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const user = authUser.users[0]
    console.log(`Usuário encontrado: ${user.id}`)

    // Redefinir senha para Trocar01
    const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { 
        password: 'Trocar01',
        email_confirm: true
      }
    )

    if (updateError) {
      console.error('Erro ao atualizar senha:', updateError)
      throw updateError
    }

    console.log(`Senha redefinida com sucesso para: ${email}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Senha redefinida com sucesso para ${email}`,
        user_id: updatedUser.user.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erro interno do servidor' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})