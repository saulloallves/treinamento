import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0'

const DESTINATION_PROJECT_REF = 'wpuwsocezhlqlqxifpyk'
const DESTINATION_SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwdXdzb2NlemhscWxxeGlmcHlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc4MDQ1OCwiZXhwIjoyMDc1MzU2NDU4fQ.Wgzn0DZ9laANPSEP4N75LdjTEjK-f69TOmOCQQvksQE'
const TEST_EMAIL = 'carloseduardoturina@gmail.com'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  try {
    // Buscar todos os usuários ativos
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('email, name, user_type, role, unit_code, phone, position')
      .eq('active', true)
      .order('email')

    if (fetchError) throw fetchError

    console.log(`📊 Found ${users.length} active users to migrate`)

    // Preparar dados para importação
    const usersToMigrate = users.map(user => ({
      email: user.email,
      email_confirm: true,
      user_metadata: {
        full_name: user.name,
        user_type: user.user_type,
        role: user.role,
        unit_code: user.unit_code,
        phone: user.phone,
        position: user.position
      }
    }))

    // Importar usuários em batches de 50
    const batchSize = 50
    const importResults = {
      success: [],
      failed: [],
      skipped: []
    }

    for (let i = 0; i < usersToMigrate.length; i += batchSize) {
      const batch = usersToMigrate.slice(i, i + batchSize)
      
      console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(usersToMigrate.length / batchSize)}`)

      const response = await fetch(
        `https://${DESTINATION_PROJECT_REF}.supabase.co/functions/v1/admin-import-users`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${DESTINATION_SERVICE_ROLE}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ users: batch })
        }
      )

      const result = await response.json()
      
      if (result.results) {
        importResults.success.push(...(result.results.success || []))
        importResults.failed.push(...(result.results.failed || []))
        importResults.skipped.push(...(result.results.skipped || []))
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    console.log(`✅ Import completed:
      - Success: ${importResults.success.length}
      - Failed: ${importResults.failed.length}
      - Skipped: ${importResults.skipped.length}`)

    // Enviar email de teste APENAS para o usuário teste
    console.log(`📧 Sending recovery email to test user: ${TEST_EMAIL}`)

    const recoveryResponse = await fetch(
      `https://${DESTINATION_PROJECT_REF}.supabase.co/functions/v1/admin-send-recovery-emails`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DESTINATION_SERVICE_ROLE}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ emails: [TEST_EMAIL] })
      }
    )

    const recoveryResult = await recoveryResponse.json()
    console.log('📧 Recovery email result:', recoveryResult)

    return new Response(JSON.stringify({
      success: true,
      import: {
        total: users.length,
        ...importResults
      },
      test_email: recoveryResult
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Migration error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: (error as Error).message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
