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

    let totalProcessed = 0
    let totalErrors = 0

    // 1. PROCESS EXISTING SCHEDULED DISPATCHES
    console.log('Processing existing scheduled dispatches...')
    
    const { data: pendingDispatches, error: fetchError } = await supabase
      .from('whatsapp_dispatches')
      .select('*')
      .eq('is_scheduled', true)
      .eq('processed', false)
      .lte('scheduled_at', now.toISOString())
      .order('scheduled_at', { ascending: true })

    if (fetchError) {
      console.error('Error fetching pending dispatches:', fetchError)
    } else {
      console.log(`Found ${pendingDispatches?.length || 0} pending dispatches`)

      for (const dispatch of pendingDispatches || []) {
        try {
          console.log(`Processing dispatch ${dispatch.id} scheduled for ${dispatch.scheduled_at}`)

          const response = await supabase.functions.invoke('whatsapp-disparo', {
            body: {
              type: dispatch.type,
              item_id: dispatch.item_id,
              item_name: dispatch.item_name,
              message: dispatch.message,
              recipient_mode: 'all',
              is_scheduled: false,
              _scheduler_dispatch_id: dispatch.id
            }
          })

          if (response.error) {
            console.error(`Error processing dispatch ${dispatch.id}:`, response.error)
            
            await supabase
              .from('whatsapp_dispatches')
              .update({ 
                processed: true, 
                status: 'erro',
                updated_at: new Date().toISOString()
              })
              .eq('id', dispatch.id)
            
            totalErrors++
          } else {
            console.log(`Successfully processed dispatch ${dispatch.id}`)
            
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
            
            totalProcessed++
          }
        } catch (error) {
          console.error(`Exception processing dispatch ${dispatch.id}:`, error)
          
          await supabase
            .from('whatsapp_dispatches')
            .update({ 
              processed: true, 
              status: 'erro',
              updated_at: new Date().toISOString()
            })
            .eq('id', dispatch.id)
          
          totalErrors++
        }
      }
    }

    // 2. CREATE AUTOMATED DISPATCHES FOR UPCOMING LESSONS
    console.log('Checking for upcoming lessons needing automated dispatches...')
    
    // Buscar aulas nas próximas 2.5 horas para pegar ambos os tipos de disparo
    const searchWindowEnd = new Date(now.getTime() + 2.5 * 60 * 60 * 1000)

    // Get lessons with zoom_start_time in the search window
    const { data: upcomingLessons, error: lessonsError } = await supabase
      .from('lessons')
      .select(`
        id,
        title,
        course_id,
        zoom_start_time,
        zoom_join_url,
        courses!inner(name)
      `)
      .not('zoom_start_time', 'is', null)
      .eq('status', 'Ativo')
      .gte('zoom_start_time', now.toISOString())
      .lte('zoom_start_time', searchWindowEnd.toISOString())

    if (lessonsError) {
      console.error('Error fetching upcoming lessons:', lessonsError)
    } else {
      console.log(`Found ${upcomingLessons?.length || 0} upcoming lessons`)

      for (const lesson of upcomingLessons || []) {
        const lessonTime = new Date(lesson.zoom_start_time)
        const timeUntilLesson = lessonTime.getTime() - now.getTime()
        const minutesUntil = Math.floor(timeUntilLesson / (1000 * 60))

        console.log(`Lesson "${lesson.title}" starts in ${minutesUntil} minutes (${lessonTime.toISOString()})`)

        // Determine which dispatch types to check
        // Janelas mais amplas e flexíveis para garantir que funcionem mesmo se ativadas tarde
        // 2 horas = 120 minutos (janela: 100-140 minutos para pegar ativações atrasadas)
        // 30 minutos (janela: 15-50 minutos para pegar ativações atrasadas)
        let dispatchTypes: Array<'2_hours_before' | '30_minutes_before'> = []
        
        // Disparo de 2 horas antes - janela ampla
        if (minutesUntil <= 140 && minutesUntil >= 100) {
          console.log(`  -> Will create 2_hours_before dispatch`)
          dispatchTypes.push('2_hours_before')
        }
        
        // Disparo de 30 minutos antes - janela ampla
        if (minutesUntil <= 50 && minutesUntil >= 15) {
          console.log(`  -> Will create 30_minutes_before dispatch`)
          dispatchTypes.push('30_minutes_before')
        }

        if (dispatchTypes.length === 0) {
          console.log(`  -> No dispatch needed at this time (${minutesUntil} minutes until lesson)`)
        }

        for (const dispatchType of dispatchTypes) {
          try {
            // Check if automated dispatch is configured and active
            const { data: automatedConfig } = await supabase
              .from('automated_lesson_dispatches')
              .select('*')
              .eq('lesson_id', lesson.id)
              .eq('dispatch_type', dispatchType)
              .eq('is_active', true)
              .single()

            if (!automatedConfig) {
              console.log(`No active config for lesson ${lesson.title}, type ${dispatchType}`)
              continue
            }

            // Check if dispatch was already created for this specific lesson and type
            // Busca disparos recentes (últimas 6 horas) para essa aula
            const { data: existingDispatches, error: existingError } = await supabase
              .from('whatsapp_dispatches')
              .select('id, created_at, status, message')
              .eq('type', 'aula')
              .eq('item_id', lesson.id)
              .gte('created_at', new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString())
              .order('created_at', { ascending: false })

            if (existingError) {
              console.error(`Error checking existing dispatches:`, existingError)
            }

            // Verifica se já existe disparo desse tipo específico
            // Identifica o tipo pela mensagem (2 horas ou 30 minutos)
            const alreadySent = existingDispatches?.some(d => {
              if (!d.message) return false
              
              const msg = d.message.toLowerCase()
              const is2HoursType = msg.includes('2 horas') || msg.includes('duas horas')
              const is30MinType = msg.includes('30 minutos') || msg.includes('meia hora')
              
              // Verifica se o tipo bate
              if (dispatchType === '2_hours_before' && is2HoursType) return true
              if (dispatchType === '30_minutes_before' && is30MinType) return true
              
              return false
            })

            if (alreadySent) {
              console.log(`✅ Dispatch already sent for lesson "${lesson.title}", type ${dispatchType}`)
              continue
            }

            // Create the automated dispatch
            const message = automatedConfig.message_template
              .replace(/{titulo}/g, lesson.title)
              .replace(/{link}/g, lesson.zoom_join_url || '')
              .replace(/{horario}/g, new Date(lesson.zoom_start_time).toLocaleString('pt-BR'))

            console.log(`📤 Creating ${dispatchType} dispatch for lesson: "${lesson.title}" at ${lessonTime.toLocaleString('pt-BR')}`)
            console.log(`   Message: ${message.substring(0, 100)}...`)

            // Insert dispatch and immediately process it
            const { data: newDispatch, error: createError } = await supabase
              .from('whatsapp_dispatches')
              .insert({
                type: 'aula',
                item_id: lesson.id,
                item_name: lesson.title,
                message: message,
                is_scheduled: false,
                processed: false,
                status: 'pendente',
                sent_date: now.toISOString(),
                recipients_count: 0
              })
              .select()
              .single()

            if (createError) {
              console.error(`Error creating dispatch for lesson ${lesson.title}:`, createError)
              totalErrors++
              continue
            }

            // Immediately process the dispatch
            try {
              const response = await supabase.functions.invoke('whatsapp-disparo', {
                body: {
                  type: 'aula',
                  item_id: lesson.id,
                  item_name: lesson.title,
                  message: message,
                  recipient_mode: 'all',
                  is_scheduled: false,
                  _automated: true,
                  _dispatch_id: newDispatch.id
                }
              })

              if (response.error) {
                console.error(`Error sending automated dispatch for ${lesson.title}:`, response.error)
                await supabase
                  .from('whatsapp_dispatches')
                  .update({ processed: true, status: 'erro' })
                  .eq('id', newDispatch.id)
                totalErrors++
              } else {
                const result = response.data
                await supabase
                  .from('whatsapp_dispatches')
                  .update({ 
                    processed: true,
                    status: result.failed === 0 ? 'enviado' : (result.delivered > 0 ? 'parcial' : 'erro'),
                    delivered_count: result.delivered || 0,
                    failed_count: result.failed || 0,
                    recipients_count: (result.delivered || 0) + (result.failed || 0)
                  })
                  .eq('id', newDispatch.id)
                
                console.log(`Automated ${dispatchType} dispatch sent for ${lesson.title}: ${result.delivered} delivered, ${result.failed} failed`)
                totalProcessed++
              }
            } catch (error) {
              console.error(`Exception sending automated dispatch for ${lesson.title}:`, error)
              await supabase
                .from('whatsapp_dispatches')
                .update({ processed: true, status: 'erro' })
                .eq('id', newDispatch.id)
              totalErrors++
            }

          } catch (error) {
            console.error(`Error processing automated dispatch for lesson ${lesson.title}, type ${dispatchType}:`, error)
            totalErrors++
          }
        }
      }
    }

    return new Response(JSON.stringify({ 
      message: `Processed ${totalProcessed} dispatches, ${totalErrors} errors`,
      processed: totalProcessed,
      errors: totalErrors,
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