import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FranchiseeData {
  email: string;
  name: string;
  phone?: string;
  unitCode: string;
  unitName: string;
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

    const { email, name, phone, unitCode, unitName }: FranchiseeData = await req.json()

    // Verificar se já existe usuário com este email
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id, email, role')
      .eq('email', email)
      .maybeSingle()

    if (existingUser?.role === 'Franqueado') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Já existe um franqueado cadastrado com este email' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let authUser;
    
    if (existingUser) {
      // Atualizar senha do usuário existente
      const { data: updatedAuth, error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(
        existingUser.id,
        { password: 'Trocar01' }
      )

      if (updateAuthError) {
        throw updateAuthError
      }
      
      authUser = updatedAuth.user

      // Atualizar dados na tabela users
      const { error: updateUserError } = await supabaseAdmin
        .from('users')
        .update({
          name,
          phone,
          unit_code: unitCode,
          role: 'Franqueado',
          user_type: 'Aluno',
          approval_status: 'aprovado',
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUser.id)

      if (updateUserError) {
        throw updateUserError
      }
    } else {
      // Criar novo usuário no auth
      const { data: newAuth, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: 'Trocar01',
        email_confirm: true,
        user_metadata: {
          name,
          phone,
          unit_code: unitCode,
          role: 'Franqueado',
          user_type: 'Aluno'
        }
      })

      if (createAuthError) {
        throw createAuthError
      }

      authUser = newAuth.user

      // Criar registro na tabela users
      const { error: createUserError } = await supabaseAdmin
        .from('users')
        .insert({
          id: authUser.id,
          email,
          name,
          phone,
          unit_code: unitCode,
          role: 'Franqueado',
          user_type: 'Aluno',
          approval_status: 'aprovado',
          approved_at: new Date().toISOString()
        })

      if (createUserError) {
        throw createUserError
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Franqueado ${existingUser ? 'atualizado' : 'criado'} com sucesso!`,
        user: { id: authUser.id, email: authUser.email }
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