import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseTreinamento = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        db: { schema: 'treinamento' }
      }
    )

    const now = new Date().toISOString()
    
    console.log(`Running turmas window keeper at ${now}`)

    // 1) Open enrollments for scheduled turmas
    const { error: openError } = await supabaseTreinamento.rpc('advance_turmas_open', { 
      p_now: now 
    })
    
    if (openError) {
      console.error('Error opening turma enrollments:', openError)
    } else {
      console.log('Successfully checked for turmas to open')
    }

    // 2) Close enrollments for turmas past deadline
    const { error: closeError } = await supabaseTreinamento.rpc('advance_turmas_close', { 
      p_now: now 
    })
    
    if (closeError) {
      console.error('Error closing turma enrollments:', closeError)
    } else {
      console.log('Successfully checked for turmas to close')
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        timestamp: now,
        message: 'Turmas window keeper completed successfully'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Turmas window keeper error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: (error as Error).message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    )
  }
})