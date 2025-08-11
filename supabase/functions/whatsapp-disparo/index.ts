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

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnon = Deno.env.get('SUPABASE_ANON_KEY')!

    // Forward caller's auth so RLS applies as if user made the request
    const authHeader = req.headers.get('authorization') || ''
    const supabase = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { authorization: authHeader } }
    })

    const { data: userResp } = await supabase.auth.getUser()
    const user = userResp?.user
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const {
      type,                // 'curso' | 'aula'
      item_id,             // course id or lesson id
      item_name,           // optional, for logging
      message,
      recipient_mode,      // 'all' | 'selected'
      recipient_ids = [],  // enrollment ids when mode === 'selected'
    } = await req.json()

    if (!type || !item_id || !message) {
      return new Response(JSON.stringify({ error: 'Campos obrigatórios: type, item_id, message' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Resolve course id
    let courseId: string | null = null
    let resolvedItemName: string | null = item_name || null

    if (type === 'curso') {
      courseId = item_id
      if (!resolvedItemName) {
        const { data: course } = await supabase.from('courses').select('name').eq('id', courseId).maybeSingle()
        resolvedItemName = course?.name || null
      }
    } else if (type === 'aula') {
      const { data: lesson } = await supabase.from('lessons').select('course_id, title').eq('id', item_id).maybeSingle()
      courseId = lesson?.course_id || null
      if (!resolvedItemName) resolvedItemName = lesson?.title || null
    }

    if (!courseId) {
      return new Response(JSON.stringify({ error: 'Curso não encontrado para o item informado.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Fetch enrollments for the course
    const { data: enrollments, error: enrollErr } = await supabase
      .from('enrollments')
      .select('id, student_name, student_email, student_phone')
      .eq('course_id', courseId)

    if (enrollErr) {
      return new Response(JSON.stringify({ error: enrollErr.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Filter recipients by mode
    const targetEnrollments = (recipient_mode === 'selected' && Array.isArray(recipient_ids) && recipient_ids.length > 0)
      ? enrollments.filter(e => recipient_ids.includes(e.id))
      : enrollments

    // Normalize phone numbers
    const normalizePhone = (p?: string | null) => {
      const digits = (p || '').replace(/\D/g, '')
      if (!digits) return null
      if (digits.startsWith('55')) return digits
      return `55${digits}`
    }

    const recipients = targetEnrollments
      .map(e => ({ id: e.id, phone: normalizePhone(e.student_phone), name: e.student_name, email: e.student_email }))
      .filter(r => !!r.phone) as { id: string; phone: string; name?: string; email?: string }[]

    const instanceId = Deno.env.get('ZAPI_INSTANCE_ID')
    const token = Deno.env.get('ZAPI_TOKEN')
    if (!instanceId || !token) {
      return new Response(JSON.stringify({ error: 'WhatsApp não configurado. Defina ZAPI_INSTANCE_ID e ZAPI_TOKEN.' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Send via Z-API
    const baseUrl = `https://api.z-api.io/instances/${instanceId}/token/${token}`

    let delivered = 0
    let failed = 0
    const results: Array<{ enrollment_id: string; phone?: string; ok: boolean; error?: any }> = []

    await Promise.allSettled(recipients.map(async (r) => {
      try {
        const res = await fetch(`${baseUrl}/send-text`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: r.phone, message })
        })
        if (res.ok) {
          delivered++
          results.push({ enrollment_id: r.id, phone: r.phone, ok: true })
        } else {
          failed++
          const err = await res.text()
          results.push({ enrollment_id: r.id, phone: r.phone, ok: false, error: err })
        }
      } catch (e) {
        failed++
        results.push({ enrollment_id: r.id, phone: r.phone, ok: false, error: String((e as any)?.message || e) })
      }
    }))

    // Persist dispatch summary
    const recipients_count = recipients.length
    const status = failed === 0 ? 'enviado' : (delivered > 0 ? 'parcial' : 'erro')

    const { data: inserted, error: insErr } = await supabase
      .from('whatsapp_dispatches')
      .insert([{ type, item_id, item_name: resolvedItemName || '', recipients_count, message, delivered_count: delivered, failed_count: failed, created_by: user.id, status }])
      .select()
      .maybeSingle()

    if (insErr) {
      return new Response(JSON.stringify({ error: insErr.message, delivered, failed, recipients_count, results }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ ok: true, dispatch: inserted, delivered, failed, recipients_count, results }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (e) {
    console.error('whatsapp-disparo error:', e)
    return new Response(JSON.stringify({ error: 'Internal error', details: String((e as any)?.message || e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
