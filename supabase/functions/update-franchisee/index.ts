import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UpdateFranchiseeData {
  unitCode: string;
  email?: string;
  name?: string;
  phone?: string;
  password?: string;
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

    const { unitCode, email, name, phone, password }: UpdateFranchiseeData = await req.json()

    if (!unitCode) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Código da unidade é obrigatório' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validar senha se fornecida
    if (password && password.length < 6) {
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

    // Buscar o franqueado existente
    const { data: franchisee, error: findError } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('unit_code', unitCode)
      .eq('role', 'Franqueado')
      .maybeSingle()

    if (findError || !franchisee) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Franqueado não encontrado para esta unidade' 
        }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Preparar dados para atualização na tabela users
    const userUpdates: Record<string, any> = {}
    if (email) userUpdates.email = email
    if (name) userUpdates.name = name
    if (phone) userUpdates.phone = phone
    if (password) userUpdates.visible_password = password

    // Atualizar na tabela users se houver mudanças
    if (Object.keys(userUpdates).length > 0) {
      const { error: updateUserError } = await supabaseAdmin
        .from('users')
        .update(userUpdates)
        .eq('id', franchisee.id)

      if (updateUserError) {
        throw updateUserError
      }
    }

    // Preparar dados para atualização no auth.users
    const authUpdates: Record<string, any> = {}
    if (email) authUpdates.email = email
    if (password) authUpdates.password = password
    
    // Atualizar metadata se nome ou telefone mudaram
    if (name || phone) {
      const { data: currentAuthUser } = await supabaseAdmin.auth.admin.getUserById(franchisee.id)
      const currentMetadata = currentAuthUser.user?.user_metadata || {}
      
      authUpdates.user_metadata = {
        ...currentMetadata,
        ...(name && { name }),
        ...(phone && { phone }),
      }
    }

    // Atualizar no auth se houver mudanças
    if (Object.keys(authUpdates).length > 0) {
      const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(
        franchisee.id,
        authUpdates
      )

      if (updateAuthError) {
        throw updateAuthError
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Franqueado atualizado com sucesso!',
        user: { id: franchisee.id, email: email || franchisee.email }
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
