import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0'

const RATE_LIMIT_DELAY = 200 // 5 req/s

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  try {
    const { emails, redirectTo } = await req.json() as { emails: string[], redirectTo?: string }
    
    // Use o redirectTo fornecido ou um padrão
    const recoveryRedirectUrl = redirectTo || Deno.env.get('RECOVERY_REDIRECT_URL') || 'https://cursos.girabot.com.br/auth/callback/recovery'
    
    console.log(`📧 Sending recovery emails with redirect URL: ${recoveryRedirectUrl}`)
    
  const results: {
    success: string[];
    failed: Array<{ email: string; error: string }>;
  } = {
    success: [],
    failed: []
  }

    for (const email of emails) {
      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY))
      
      try {
        // Disparar email de recovery com redirectTo customizado
        const { data, error: recoveryError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'recovery',
          email: email,
          options: {
            redirectTo: recoveryRedirectUrl
          }
        })

        if (recoveryError) {
          throw recoveryError
        }

        results.success.push(email)
        console.log(`✓ Recovery email sent to ${email} with redirect to ${recoveryRedirectUrl}`)

      } catch (error) {
        results.failed.push({ 
          email: email, 
          error: (error as Error).message 
        })
        console.error(`✗ Failed to send recovery email to ${email}:`, error)
      }
    }

    return new Response(JSON.stringify({
      success: true,
      summary: {
        total: emails.length,
        success: results.success.length,
        failed: results.failed.length
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
