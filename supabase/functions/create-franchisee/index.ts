import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FranchiseeData {
  email: string;
  name: string;
  phone?: string;
  password: string;
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

    const { email, name, phone, password, unitCode, unitName }: FranchiseeData = await req.json()

    // Verificar se já existe usuário com este email
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id, email, role')
      .eq('email', email)
      .maybeSingle()

    if (existingUser) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Já existe um usuário cadastrado com este email' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validar senha
    if (!password || password.length < 6) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Senha deve ter no mínimo 6 caracteres' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    let authUser;
      
    // Criar novo usuário no auth
    const { data: newAuth, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: password,
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
        visible_password: password,
        approved_at: new Date().toISOString()
      })

    if (createUserError) {
      throw createUserError
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Franqueado criado com sucesso!',
        user: { id: authUser.id, email: authUser.email }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
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