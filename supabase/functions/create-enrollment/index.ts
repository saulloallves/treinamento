import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret',
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

    const secretHeaderRaw = req.headers.get('x-webhook-secret') ?? ''
    const secretHeader = secretHeaderRaw.trim()
    const expectedSecretRaw = Deno.env.get('TYPEBOT_WEBHOOK_SECRET') ?? ''
    const expectedSecret = expectedSecretRaw.trim()
    if (!expectedSecret || secretHeader !== expectedSecret) {
      console.log('auth_mismatch', {
        headerLen: secretHeader.length,
        expectedLen: expectedSecret.length,
        headerSuffix: secretHeader.slice(-6),
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
      created_by, // optional passthrough
      status // optional, defaults to 'Ativo'
    } = body || {}

    if (!student_name || !student_email || (!course_id && !course_name)) {
      return new Response(JSON.stringify({ error: 'Campos obrigatórios: student_name, student_email e (course_id ou course_name)' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
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
    return new Response(JSON.stringify({ error: 'Internal error', details: String(e?.message || e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
