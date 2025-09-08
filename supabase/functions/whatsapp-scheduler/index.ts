import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Use service role key to bypass RLS for internal processing
    const supabase = createClient(supabaseUrl, supabaseServiceRole)

    const now = new Date()
    console.log(`WhatsApp Scheduler running at: ${now.toISOString()}`)

    // Find scheduled dispatches that are ready to be sent
    const { data: pendingDispatches, error: fetchError } = await supabase
      .from('whatsapp_dispatches')
      .select('*')
      .eq('is_scheduled', true)
      .eq('processed', false)
      .lte('scheduled_at', now.toISOString())
      .order('scheduled_at', { ascending: true })

    if (fetchError) {
      console.error('Error fetching pending dispatches:', fetchError)
      return new Response(JSON.stringify({ error: fetchError.message }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    if (!pendingDispatches || pendingDispatches.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'No pending dispatches', 
        processed: 0 
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    console.log(`Found ${pendingDispatches.length} pending dispatches`)

    let processed = 0
    let errors = 0

    // Process each dispatch
    for (const dispatch of pendingDispatches) {
      try {
        console.log(`Processing dispatch ${dispatch.id} scheduled for ${dispatch.scheduled_at}`)

        // Call the main whatsapp-disparo function with the dispatch data
        const response = await supabase.functions.invoke('whatsapp-disparo', {
          body: {
            type: dispatch.type,
            item_id: dispatch.item_id,
            item_name: dispatch.item_name,
            message: dispatch.message,
            recipient_mode: 'all', // For scheduled dispatches, assume all recipients
            is_scheduled: false,   // Mark as immediate for processing
            _scheduler_dispatch_id: dispatch.id  // Internal flag for scheduler processing
          }
        })

        if (response.error) {
          console.error(`Error processing dispatch ${dispatch.id}:`, response.error)
          
          // Mark as error
          await supabase
            .from('whatsapp_dispatches')
            .update({ 
              processed: true, 
              status: 'erro',
              updated_at: new Date().toISOString()
            })
            .eq('id', dispatch.id)
          
          errors++
        } else {
          console.log(`Successfully processed dispatch ${dispatch.id}`)
          
          // Update the original scheduled dispatch with results
          const result = response.data
          await supabase
            .from('whatsapp_dispatches')
            .update({ 
              processed: true,
              status: result.failed === 0 ? 'enviado' : (result.delivered > 0 ? 'parcial' : 'erro'),
              delivered_count: result.delivered || 0,
              failed_count: result.failed || 0,
              sent_date: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', dispatch.id)
          
          processed++
        }
      } catch (error) {
        console.error(`Exception processing dispatch ${dispatch.id}:`, error)
        
        // Mark as error
        await supabase
          .from('whatsapp_dispatches')
          .update({ 
            processed: true, 
            status: 'erro',
            updated_at: new Date().toISOString()
          })
          .eq('id', dispatch.id)
        
        errors++
      }
    }

    return new Response(JSON.stringify({ 
      message: `Processed ${processed} dispatches, ${errors} errors`,
      processed,
      errors,
      timestamp: now.toISOString()
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })

  } catch (error) {
    console.error('WhatsApp Scheduler error:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal scheduler error', 
      details: String((error as any)?.message || error) 
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})