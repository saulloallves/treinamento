import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0'

interface UserToMigrate {
  email: string
  user_metadata?: Record<string, any>
  app_metadata?: Record<string, any>
  phone?: string
  email_confirmed_at?: string
}

const RATE_LIMIT_DELAY = 200 // 5 req/s

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Verificar auth
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  try {
    const { users } = await req.json() as { users: UserToMigrate[] }
    
    const results = {
      success: [],
      failed: [],
      skipped: []
    }

    for (const user of users) {
      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY))
      
      try {
        // Criar usuário com email confirmado, SEM disparar email
        const { data: createdUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: user.email,
          email_confirm: true, // CONFIRMA EMAIL MAS NÃO ENVIA
          user_metadata: user.user_metadata || {},
          app_metadata: user.app_metadata || {},
          phone: user.phone,
        })

        if (createError) {
          if (createError.message.includes('already registered')) {
            results.skipped.push({ email: user.email, reason: 'Already exists' })
            continue
          }
          throw createError
        }

        results.success.push({ 
          email: user.email, 
          user_id: createdUser.user.id 
        })

        console.log(`✓ User ${user.email} migrated (NO EMAIL SENT)`) 

      } catch (error) {
        results.failed.push({ 
          email: user.email, 
          error: (error as Error).message 
        })
        console.error(`✗ Failed to migrate ${user.email}:`, error)
      }
    }

    return new Response(JSON.stringify({
      success: true,
      summary: {
        total: users.length,
        success: results.success.length,
        failed: results.failed.length,
        skipped: results.skipped.length
      },
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: (error as Error).message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
