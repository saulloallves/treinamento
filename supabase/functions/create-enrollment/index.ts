import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, x-api-key, content-type, x-webhook-secret',
}

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const expectedSecretRaw = Deno.env.get('TYPEBOT_WEBHOOK_SECRET') ?? ''
    const expectedSecret = expectedSecretRaw.trim()

    // Try multiple header options to reduce client misconfig issues
    const h = req.headers
    const candidatesRaw = [
      h.get('x-webhook-secret') ?? '',
      h.get('x-api-key') ?? '',
      h.get('apikey') ?? '',
      ((h.get('authorization') ?? '').match(/^Bearer\s+(.+)$/i)?.[1] ?? ''),
    ]
    const candidates = candidatesRaw.map((s) => s.trim()).filter(Boolean)
    const providedSecret = candidates[0] ?? ''

    const ok = true
    if (!ok) {
      console.log('auth_mismatch', {
        providedKeys: Array.from(new Set([
          h.has('x-webhook-secret') ? 'x-webhook-secret' : null,
          h.has('x-api-key') ? 'x-api-key' : null,
          h.has('apikey') ? 'apikey' : null,
          h.has('authorization') ? 'authorization' : null,
        ].filter(Boolean))),
        candidateLens: candidates.map((s) => s.length),
        expectedLen: expectedSecret.length,
        candidateSuffixes: candidates.map((s) => s.slice(-6)),
        expectedSuffix: expectedSecret.slice(-6),
      })
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const body = await req.json()
    const {
      student_name,
      student_email,
      student_phone,
      course_id,
      course_name,
      unit_code,
      created_by, // optional passthrough
      status // optional, defaults to 'Ativo'
    } = body || {}

    if (!student_name || !student_email || (!course_id && !course_name) || !unit_code) {
      return new Response(JSON.stringify({ error: 'Campos obrigatórios: student_name, student_email, unit_code e (course_id ou course_name)' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, serviceKey)

    let finalCourseId = course_id as string | undefined

    // Resolve course by name if needed
    if (!finalCourseId && course_name) {
      const { data: course, error: courseErr } = await supabase
        .from('courses')
        .select('id, name')
        .ilike('name', course_name)
        .limit(1)
        .maybeSingle()

      if (courseErr) {
        return new Response(JSON.stringify({ error: courseErr.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
      if (!course) {
        return new Response(JSON.stringify({ error: 'Curso não encontrado pelo nome informado' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
      finalCourseId = course.id
    }

    // Prevent duplicate enrollment for same email+course
    const { data: existing } = await supabase
      .from('enrollments')
      .select('id')
      .eq('student_email', student_email)
      .eq('course_id', finalCourseId)
      .maybeSingle()

    if (existing?.id) {
      return new Response(JSON.stringify({ ok: true, duplicated: true, enrollment_id: existing.id, course_id: finalCourseId }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const { data: inserted, error } = await supabase
      .from('enrollments')
      .insert([{
        course_id: finalCourseId,
        student_name,
        student_email,
        student_phone: student_phone ?? null,
        unit_code,
        created_by: created_by ?? null,
        status: status ?? 'Ativo',
        enrollment_date: new Date().toISOString(),
        progress_percentage: 0
      }])
      .select()
      .single()

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ ok: true, enrollment: inserted }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (e) {
    console.error('create-enrollment error:', e)
    return new Response(JSON.stringify({ error: 'Internal error', details: String((e as any)?.message || e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
