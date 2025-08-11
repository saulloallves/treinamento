
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

// Utility function to verify JWT
async function verifyAuth(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) {
    throw new Error('No authorization header')
  }

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error } = await supabase.auth.getUser(token)
  
  if (error || !user) {
    throw new Error('Invalid token')
  }

  return user
}

// Auth endpoints
async function handleAuth(request: Request, path: string[]) {
  if (path[1] === 'login' && request.method === 'POST') {
    const { email, password } = await request.json()
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check if user is admin
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', data.user.id)
      .single()

    if (!adminUser) {
      return new Response(JSON.stringify({ error: 'Access denied' }), { 
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({
      user: data.user,
      session: data.session,
      admin: adminUser
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  if (path[1] === 'me' && request.method === 'GET') {
    const user = await verifyAuth(request)
    
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id)
      .single()

    return new Response(JSON.stringify({
      user,
      admin: adminUser
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({ error: 'Not found' }), { 
    status: 404,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

// Units endpoints
async function handleUnidades(request: Request, path: string[]) {
  const codigo = path[1]
  
  if (request.method === 'GET' && codigo && path[2] === 'colaboradores') {
    // GET /unidades/{codigo}/colaboradores
    const { data: unit } = await supabase
      .from('units')
      .select('id')
      .eq('code', codigo)
      .single()

    if (!unit) {
      return new Response(JSON.stringify({ error: 'Unit not found' }), { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { data: users } = await supabase
      .from('users')
      .select('*')
      .eq('unit_id', unit.id)
      .eq('active', true)

    return new Response(JSON.stringify(users), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  if (request.method === 'GET' && codigo) {
    // GET /unidades/{codigo}
    const { data: unit } = await supabase
      .from('units')
      .select('*')
      .eq('code', codigo)
      .single()

    if (!unit) {
      return new Response(JSON.stringify({ error: 'Unit not found' }), { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify(unit), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  if (request.method === 'POST') {
    // POST /unidades
    await verifyAuth(request)
    const unitData = await request.json()

    const { data, error } = await supabase
      .from('units')
      .insert([unitData])
      .select()
      .single()

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({ error: 'Not found' }), { 
    status: 404,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

// Users endpoints
async function handleUsuarios(request: Request, path: string[]) {
  const userId = path[1]
  
  if (request.method === 'GET' && userId && path[2] === 'historico') {
    // GET /usuarios/{id}/historico
    // Find user's primary key to map to enrollments (which store student_email)
    const { data: userRecord } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', userId)
      .single()

    const emailKey = userRecord?.email || userId

    const { data: enrollments } = await supabase
      .from('enrollments')
      .select(`
        *,
        courses (name, theme),
        certificates (*)
      `)
      .eq('student_email', emailKey)

    const { data: progress } = await supabase
      .from('student_progress')
      .select('*')
      .in('enrollment_id', enrollments?.map(e => e.id) || [])

    return new Response(JSON.stringify({
      enrollments,
      progress
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  if (request.method === 'GET' && userId) {
    // GET /usuarios/{id}
    const { data: user } = await supabase
      .from('users')
      .select(`
        *,
        units (name, code)
      `)
      .eq('id', userId)
      .single()

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify(user), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  if (request.method === 'GET' && request.url.includes('search')) {
    // GET /usuarios/search?cpf=...
    const url = new URL(request.url)
    const cpf = url.searchParams.get('cpf')

    if (!cpf) {
      return new Response(JSON.stringify({ error: 'CPF required' }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('cpf', cpf)
      .single()

    return new Response(JSON.stringify(user), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  if (request.method === 'POST') {
    // POST /usuarios
    await verifyAuth(request)
    const userData = await request.json()

    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single()

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  if (request.method === 'PUT' && userId) {
    // PUT /usuarios/{id}
    await verifyAuth(request)
    const userData = await request.json()

    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({ error: 'Not found' }), { 
    status: 404,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

// Courses endpoints
async function handleCursos(request: Request, path: string[]) {
  const courseId = path[1]
  
  if (request.method === 'GET' && !courseId) {
    // GET /cursos with filters
    const url = new URL(request.url)
    const tipo_usuario = url.searchParams.get('tipo_usuario')
    const cargo = url.searchParams.get('cargo')
    const categoria = url.searchParams.get('categoria')

    let query = supabase.from('courses').select('*')

    if (tipo_usuario) {
      query = query.eq('public_target', tipo_usuario)
    }
    if (categoria) {
      query = query.eq('theme', categoria)
    }

    const { data: courses } = await query

    return new Response(JSON.stringify(courses), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  if (request.method === 'GET' && courseId && path[2] === 'aulas') {
    // GET /cursos/{curso_id}/aulas
    const { data: lessons } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index')

    return new Response(JSON.stringify(lessons), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  if (request.method === 'GET' && courseId) {
    // GET /cursos/{id}
    const { data: course } = await supabase
      .from('courses')
      .select(`
        *,
        lessons (*)
      `)
      .eq('id', courseId)
      .single()

    if (!course) {
      return new Response(JSON.stringify({ error: 'Course not found' }), { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify(course), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  if (request.method === 'POST') {
    // POST /cursos
    await verifyAuth(request)
    const courseData = await request.json()

    const { data, error } = await supabase
      .from('courses')
      .insert([courseData])
      .select()
      .single()

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  if (request.method === 'PUT' && courseId) {
    // PUT /cursos/{id}
    await verifyAuth(request)
    const courseData = await request.json()

    const { data, error } = await supabase
      .from('courses')
      .update(courseData)
      .eq('id', courseId)
      .select()
      .single()

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  if (request.method === 'DELETE' && courseId) {
    // DELETE /cursos/{id} - soft delete
    await verifyAuth(request)

    const { data, error } = await supabase
      .from('courses')
      .update({ status: 'Inativo' })
      .eq('id', courseId)
      .select()
      .single()

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({ error: 'Not found' }), { 
    status: 404,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

// Lessons endpoints
async function handleAulas(request: Request, path: string[]) {
  const lessonId = path[1]
  
  if (request.method === 'POST') {
    // POST /aulas
    await verifyAuth(request)
    const lessonData = await request.json()

    const { data, error } = await supabase
      .from('lessons')
      .insert([lessonData])
      .select()
      .single()

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  if (request.method === 'PUT' && lessonId) {
    // PUT /aulas/{id}
    await verifyAuth(request)
    const lessonData = await request.json()

    const { data, error } = await supabase
      .from('lessons')
      .update(lessonData)
      .eq('id', lessonId)
      .select()
      .single()

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  if (request.method === 'DELETE' && lessonId) {
    // DELETE /aulas/{id}
    await verifyAuth(request)

    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', lessonId)

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({ error: 'Not found' }), { 
    status: 404,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

// Enrollments endpoints
async function handleInscricoes(request: Request, path: string[]) {
  if (request.method === 'POST') {
    // POST /inscricoes
    const { usuario_id, curso_id } = await request.json()

    // Check if already enrolled
    const { data: existing } = await supabase
      .from('enrollments')
      .select('id')
      .eq('student_email', usuario_id) // Assuming usuario_id maps to email
      .eq('course_id', curso_id)
      .single()

    if (existing) {
      return new Response(JSON.stringify({ error: 'Already enrolled' }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get user data
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', usuario_id)
      .single()

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { data, error } = await supabase
      .from('enrollments')
      .insert([{
        course_id: curso_id,
        student_name: user.name,
        student_email: user.email || user.id,
        student_phone: user.phone
      }])
      .select()
      .single()

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  if (request.method === 'GET' && request.url.includes('validar')) {
    // GET /inscricoes/validar?usuario_id=&curso_id=
    const url = new URL(request.url)
    const usuario_id = url.searchParams.get('usuario_id')
    const curso_id = url.searchParams.get('curso_id')

    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('student_email', usuario_id)
      .eq('course_id', curso_id)
      .single()

    return new Response(JSON.stringify({ 
      enrolled: !!enrollment,
      enrollment_id: enrollment?.id 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  if (request.method === 'GET' && path[1] === 'curso') {
    // GET /inscricoes/curso/{curso_id}
    const courseId = path[2]

    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('*')
      .eq('course_id', courseId)

    return new Response(JSON.stringify(enrollments), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({ error: 'Not found' }), { 
    status: 404,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

// Attendance endpoints
async function handlePresencas(request: Request, path: string[]) {
  if (request.method === 'POST') {
    // POST /presencas
    const attendanceData = await request.json()

    const { data, error } = await supabase
      .from('attendance')
      .insert([attendanceData])
      .select()
      .single()

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  if (request.method === 'GET' && path[1] === 'aula') {
    // GET /presencas/aula/{aula_id}
    const lessonId = path[2]

    const { data: attendance } = await supabase
      .from('attendance')
      .select(`
        *,
        users (name, email)
      `)
      .eq('lesson_id', lessonId)

    return new Response(JSON.stringify(attendance), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({ error: 'Not found' }), { 
    status: 404,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

// Progress endpoints
async function handleProgresso(request: Request, path: string[]) {
  if (request.method === 'GET') {
    // GET /progresso?usuario_id=&curso_id=
    const url = new URL(request.url)
    const usuario_id = url.searchParams.get('usuario_id')
    const curso_id = url.searchParams.get('curso_id')

    if (!usuario_id || !curso_id) {
      return new Response(JSON.stringify({ error: 'Missing parameters' }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('progress_percentage, completed_lessons')
      .eq('student_email', usuario_id)
      .eq('course_id', curso_id)
      .single()

    return new Response(JSON.stringify(enrollment || { progress_percentage: 0 }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  if (request.method === 'PUT') {
    // PUT /progresso
    const { usuario_id, curso_id, lesson_id, progress_percentage } = await request.json()

    // Update enrollment progress
    const { data, error } = await supabase
      .from('enrollments')
      .update({ 
        progress_percentage,
        completed_lessons: lesson_id ? [lesson_id] : []
      })
      .eq('student_email', usuario_id)
      .eq('course_id', curso_id)
      .select()

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({ error: 'Not found' }), { 
    status: 404,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

// Quiz endpoints
async function handleQuiz(request: Request, path: string[]) {
  const courseId = path[1]
  
  if (request.method === 'GET' && courseId) {
    // GET /quiz/{curso_id}
    const { data: questions } = await supabase
      .from('quiz')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index')

    return new Response(JSON.stringify(questions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  if (request.method === 'POST' && courseId && path[2] === 'responder') {
    // POST /quiz/{curso_id}/responder
    const { usuario_id, respostas } = await request.json()

    let correctCount = 0
    const responses = []

    // Process each answer
    for (const resposta of respostas) {
      const { data: question } = await supabase
        .from('quiz')
        .select('correct_answer')
        .eq('id', resposta.pergunta_id)
        .single()

      const isCorrect = question?.correct_answer === resposta.resposta

      if (isCorrect) correctCount++

      // Save response
      const { data: response } = await supabase
        .from('quiz_responses')
        .insert([{
          user_id: usuario_id,
          course_id: courseId,
          quiz_id: resposta.pergunta_id,
          selected_answer: resposta.resposta,
          is_correct: isCorrect
        }])
        .select()
        .single()

      responses.push(response)
    }

    const total = respostas.length
    const percentage = Math.round((correctCount / total) * 100)
    const passed = percentage >= 70 // 70% to pass

    return new Response(JSON.stringify({
      acertos: correctCount,
      total,
      percentage,
      status: passed ? 'aprovado' : 'reprovado',
      responses
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({ error: 'Not found' }), { 
    status: 404,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

// Certificates endpoints
async function handleCertificados(request: Request, path: string[]) {
  if (request.method === 'POST' && path[1] === 'gerar') {
    // POST /certificados/gerar
    const { usuario_id, curso_id, enrollment_id } = await request.json()

    // Check if course is completed
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('progress_percentage')
      .eq('id', enrollment_id)
      .single()

    if (!enrollment || enrollment.progress_percentage < 100) {
      return new Response(JSON.stringify({ error: 'Course not completed' }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Generate certificate
    const { data, error } = await supabase
      .from('certificates')
      .insert([{
        user_id: usuario_id,
        course_id: curso_id,
        enrollment_id: enrollment_id,
        certificate_url: `https://certificates.example.com/${usuario_id}-${curso_id}.pdf`
      }])
      .select()
      .single()

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  if (request.method === 'GET' && path[1] && path[2]) {
    // GET /certificados/{usuario_id}/{curso_id}
    const usuario_id = path[1]
    const curso_id = path[2]

    const { data: certificate } = await supabase
      .from('certificates')
      .select('*')
      .eq('user_id', usuario_id)
      .eq('course_id', curso_id)
      .single()

    if (!certificate) {
      return new Response(JSON.stringify({ error: 'Certificate not found' }), { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify(certificate), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  if (request.method === 'GET' && path[1] === 'emitidos') {
    // GET /certificados/emitidos
    await verifyAuth(request)

    const { data: certificates } = await supabase
      .from('certificates')
      .select(`
        *,
        users (name, email),
        courses (name)
      `)
      .order('generated_at', { ascending: false })

    return new Response(JSON.stringify(certificates), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({ error: 'Not found' }), { 
    status: 404,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

// WhatsApp endpoints (placeholder integration with Z-API)
async function handleWhatsApp(request: Request, path: string[]) {
  if (request.method === 'POST' && path[1] === 'disparo') {
    const user = await verifyAuth(request)
    const body = await request.json()
    const { type, item_id, item_name, recipients = [], message } = body
    const recipients_count = Array.isArray(recipients) ? recipients.length : (body.recipients_count || 0)

    const { data, error } = await supabase
      .from('whatsapp_dispatches')
      .insert([{ type, item_id, item_name, recipients_count, message, created_by: user.id, status: 'enviado' }])
      .select()
      .single()

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({
      dispatch: data,
      note: 'Envio via Z-API não habilitado neste endpoint ainda.'
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
  return new Response(JSON.stringify({ error: 'Not found' }), {
    status: 404,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

// Zoom endpoints (future integration)
async function handleZoom(request: Request, path: string[]) {
  if (request.method === 'POST' && path[1] === 'aula') {
    await verifyAuth(request)
    return new Response(JSON.stringify({
      error: 'Integração com Zoom não configurada. Adicione ZOOM_API_KEY/ZOOM_API_SECRET como secrets para habilitar.'
    }), { status: 501, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
  return new Response(JSON.stringify({ error: 'Not found' }), {
    status: 404,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

// OpenAPI spec and Swagger UI
function generateOpenApiSpec() {
  const serverUrl = 'https://tctkacgbhqvkqovctrzf.supabase.co/functions/v1/api'
  return {
    openapi: '3.0.3',
    info: {
      title: 'Treinamentos API',
      version: '1.0.0',
      description: 'API REST para gestão de treinamentos da franquia.'
    },
    servers: [{ url: serverUrl }],
    paths: {
      '/auth/login': { post: { summary: 'Login admin', requestBody: { required: true }, responses: { '200': { description: 'Sessão' } } } },
      '/auth/me': { get: { summary: 'Dados do admin logado', responses: { '200': { description: 'Usuário' } } } },
      '/unidades/{codigo}': { get: { summary: 'Buscar unidade por código', parameters: [{ name: 'codigo', in: 'path', required: true }], responses: { '200': { description: 'Unidade' } } } },
      '/unidades/{codigo}/colaboradores': { get: { summary: 'Listar colaboradores da unidade', parameters: [{ name: 'codigo', in: 'path', required: true }], responses: { '200': { description: 'Lista de usuários' } } } },
      '/unidades': { post: { summary: 'Criar unidade', responses: { '200': { description: 'Unidade criada' } } } },
      '/usuarios/{id}': { get: { summary: 'Detalhes do usuário', parameters: [{ name: 'id', in: 'path', required: true }], responses: { '200': { description: 'Usuário' } } } },
      '/usuarios/{id}/historico': { get: { summary: 'Histórico do usuário', parameters: [{ name: 'id', in: 'path', required: true }], responses: { '200': { description: 'Histórico' } } } },
      '/usuarios': { post: { summary: 'Cadastrar usuário', responses: { '200': { description: 'Usuário criado' } } } },
      '/usuarios/{id}#put': { put: { summary: 'Atualizar usuário', parameters: [{ name: 'id', in: 'path', required: true }], responses: { '200': { description: 'Usuário atualizado' } } } },
      '/usuarios/search': { get: { summary: 'Buscar por CPF', parameters: [{ name: 'cpf', in: 'query', required: true }], responses: { '200': { description: 'Usuário' } } } },
      '/cursos': { get: { summary: 'Listar cursos' }, post: { summary: 'Criar curso' } },
      '/cursos/{id}': { get: { summary: 'Detalhe do curso' }, put: { summary: 'Atualizar curso' }, delete: { summary: 'Desativar curso' } },
      '/cursos/{curso_id}/aulas': { get: { summary: 'Aulas do curso' } },
      '/aulas': { post: { summary: 'Criar aula' } },
      '/aulas/{id}': { put: { summary: 'Editar aula' }, delete: { summary: 'Remover aula' } },
      '/inscricoes': { post: { summary: 'Inscrever usuário' } },
      '/inscricoes/validar': { get: { summary: 'Validar inscrição', parameters: [{ name: 'usuario_id', in: 'query' }, { name: 'curso_id', in: 'query' }] } },
      '/inscricoes/curso/{curso_id}': { get: { summary: 'Inscritos do curso' } },
      '/presencas': { post: { summary: 'Registrar presença' } },
      '/presencas/aula/{aula_id}': { get: { summary: 'Presenças por aula' } },
      '/progresso': { get: { summary: 'Obter progresso' }, put: { summary: 'Atualizar progresso' } },
      '/quiz/{curso_id}': { get: { summary: 'Perguntas do quiz' } },
      '/quiz/{curso_id}/responder': { post: { summary: 'Enviar respostas do quiz' } },
      '/certificados/gerar': { post: { summary: 'Gerar certificado' } },
      '/certificados/{usuario_id}/{curso_id}': { get: { summary: 'Obter certificado' } },
      '/certificados/emitidos': { get: { summary: 'Listar certificados emitidos' } },
      '/whatsapp/disparo': { post: { summary: 'Registrar e disparar mensagem (placeholder)' } },
      '/zoom/aula': { post: { summary: 'Criar reunião no Zoom (placeholder)' } }
    }
  }
}

async function handleDocs(request: Request, path: string[]) {
  if (path[0] === 'openapi.json') {
    return new Response(JSON.stringify(generateOpenApiSpec()), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
  if (path[0] === 'docs') {
    const html = `<!doctype html><html><head><meta charset="utf-8"/><title>Treinamentos API Docs</title><link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui.css"/></head><body><div id="swagger-ui"></div><script src="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-bundle.js"></script><script>window.ui=SwaggerUIBundle({url:'./openapi.json',dom_id:'#swagger-ui'});</script></body></html>`
    return new Response(html, { headers: { ...corsHeaders, 'Content-Type': 'text/html' } })
  }
  return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
}

// Main request handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const path = url.pathname.split('/').filter(Boolean)

    console.log(`${req.method} /${path.join('/')}`)

    // Route requests
    switch (path[0]) {
      case 'openapi.json':
      case 'docs':
        return await handleDocs(req, path)
      case 'auth':
        return await handleAuth(req, path)
      case 'unidades':
        return await handleUnidades(req, path)
      case 'usuarios':
        return await handleUsuarios(req, path)
      case 'cursos':
        return await handleCursos(req, path)
      case 'aulas':
        return await handleAulas(req, path)
      case 'inscricoes':
        return await handleInscricoes(req, path)
      case 'presencas':
        return await handlePresencas(req, path)
      case 'progresso':
        return await handleProgresso(req, path)
      case 'quiz':
        return await handleQuiz(req, path)
      case 'certificados':
        return await handleCertificados(req, path)
      case 'whatsapp':
        return await handleWhatsApp(req, path)
      case 'zoom':
        return await handleZoom(req, path)
      default:
        return new Response(JSON.stringify({ 
          error: 'Not found',
          available_endpoints: [
            'GET /openapi.json',
            'GET /docs',
            'POST /auth/login',
            'GET /auth/me',
            'GET /unidades/{codigo}',
            'GET /unidades/{codigo}/colaboradores',
            'POST /unidades',
            'GET /usuarios/{id}',
            'GET /usuarios/{id}/historico',
            'POST /usuarios',
            'PUT /usuarios/{id}',
            'GET /usuarios/search?cpf=',
            'GET /cursos',
            'GET /cursos/{id}',
            'POST /cursos',
            'PUT /cursos/{id}',
            'DELETE /cursos/{id}',
            'GET /cursos/{curso_id}/aulas',
            'POST /aulas',
            'PUT /aulas/{id}',
            'DELETE /aulas/{id}',
            'POST /inscricoes',
            'GET /inscricoes/validar?usuario_id=&curso_id=',
            'GET /inscricoes/curso/{curso_id}',
            'POST /presencas',
            'GET /presencas/aula/{aula_id}',
            'GET /progresso?usuario_id=&curso_id=',
            'PUT /progresso',
            'GET /quiz/{curso_id}',
            'POST /quiz/{curso_id}/responder',
            'POST /certificados/gerar',
            'GET /certificados/{usuario_id}/{curso_id}',
            'GET /certificados/emitidos',
            'POST /whatsapp/disparo',
            'POST /zoom/aula'
          ]
        }), { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
