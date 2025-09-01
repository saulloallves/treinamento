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

    // Validação de segurança: só permite o email específico do Alison
    if (email !== 'alison.martins@crescieperdi.com.br') {
      console.error('Tentativa de uso não autorizada para email:', email)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Acesso negado para este email' 
        }),
        { 
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Buscar usuário no auth - listar todos e filtrar manualmente
    let targetUser = null;
    let page = 1;
    const perPage = 50;
    
    while (!targetUser) {
      const { data: usersList, error: listError } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage
      });
      
      if (listError) {
        console.error('Erro ao listar usuários:', listError);
        throw listError;
      }
      
      if (!usersList.users || usersList.users.length === 0) {
        break; // Não há mais usuários para verificar
      }
      
      // Procurar pelo email específico
      targetUser = usersList.users.find(u => u.email === email);
      
      if (!targetUser && usersList.users.length < perPage) {
        break; // Última página, usuário não encontrado
      }
      
      page++;
    }

    if (!targetUser) {
      // Usuário não existe, vamos criar
      console.log(`Usuário ${email} não encontrado, criando novo usuário...`);
      
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: 'Trocar01',
        email_confirm: true,
        user_metadata: {
          full_name: 'Alison Martins',
          user_type: 'Aluno',
          role: 'Franqueado'
        }
      });
      
      if (createError) {
        console.error('Erro ao criar usuário:', createError);
        throw createError;
      }
      
      targetUser = newUser.user;
      console.log(`Usuário criado com sucesso: ${targetUser.id}`);
    }
    console.log(`Usuário encontrado/criado: ${targetUser.id}`)

    // Redefinir senha para Trocar01
    const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      targetUser.id,
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