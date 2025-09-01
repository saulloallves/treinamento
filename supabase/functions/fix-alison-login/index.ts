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

    const email = 'alison.martins@crescieperdi.com.br'
    const password = 'Trocar01'

    console.log(`Corrigindo login para: ${email}`)

    // Primeiro, tentar encontrar o usuário no auth usando getUserByEmail
    const { data: authUser, error: getUserError } = await supabaseAdmin.auth.admin.getUserByEmail(email)
    
    if (getUserError) {
      console.error('Erro ao buscar usuário:', getUserError)
      throw getUserError
    }

    let existingUser = authUser?.user
    console.log('Usuário encontrado no auth:', existingUser ? existingUser.id : 'NÃO ENCONTRADO')

    if (existingUser) {
      // Se existe, atualizar senha
      console.log('Atualizando senha do usuário existente...')
      const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        existingUser.id,
        { 
          password: password,
          email_confirm: true
        }
      )

      if (updateError) {
        console.error('Erro ao atualizar senha:', updateError)
        throw updateError
      }

      console.log('Senha atualizada com sucesso')

      // Atualizar a tabela users com o ID correto do auth se necessário
      const { error: updateUsersError } = await supabaseAdmin
        .from('users')
        .update({ id: existingUser.id })
        .eq('email', email)

      if (updateUsersError) {
        console.error('Erro ao atualizar tabela users:', updateUsersError)
      } else {
        console.log('Tabela users sincronizada com auth')
      }
    } else {
      // Se não existe, criar usuário no auth
      console.log('Criando usuário no auth...')
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: {
          name: 'Alison Martins',
          unit_code: '9999',
          userType: 'Aluno',
          role: 'Franqueado'
        }
      })

      if (createError) {
        console.error('Erro ao criar usuário:', createError)
        throw createError
      }

      console.log('Usuário criado no auth:', newUser.user?.id)

      // Atualizar a tabela users com o ID correto do auth
      const { error: updateUsersError } = await supabaseAdmin
        .from('users')
        .update({ id: newUser.user?.id })
        .eq('email', email)

      if (updateUsersError) {
        console.error('Erro ao atualizar tabela users:', updateUsersError)
      } else {
        console.log('Tabela users atualizada com novo ID')
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Login corrigido com sucesso para ${email}`,
        password: password
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