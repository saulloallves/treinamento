
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Initialize Supabase client with service role for admin operations
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Client for public operations
const supabase = createClient(supabaseUrl, supabaseKey)

// Client for admin operations (bypasses RLS)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

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

    const { data: courses } = await query.order('created_at', { ascending: true })

    return new Response(JSON.stringify(courses), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  if (request.method === 'GET' && courseId === 'minhas-inscricoes') {
    // GET /cursos/minhas-inscricoes - user's enrollments
    const user = await verifyAuth(request)
    
    const { data: enrollments, error } = await supabase
      .from('enrollments')
      .select(`
        id,
        course_id,
        progress_percentage,
        status,
        created_at,
        student_name,
        student_email,
        student_phone,
        courses (
          id,
          name,
          lessons_count,
          generates_certificate
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Calculate real progress from attendance
    const enrollmentIds = enrollments?.map(e => e.id) || []
    let countsByEnrollment = new Map<string, number>()
    
    if (enrollmentIds.length > 0) {
      const { data: attRows } = await supabase
        .from('attendance')
        .select('enrollment_id')
        .in('enrollment_id', enrollmentIds)
      
      for (const row of (attRows || [])) {
        const k = row.enrollment_id as string
        countsByEnrollment.set(k, (countsByEnrollment.get(k) || 0) + 1)
      }
    }

    const result = enrollments?.map((e, index) => {
      const courseInfo = e.courses
      const totalLessons = Math.max(0, Number(courseInfo?.[0]?.lessons_count || 0))
      const attended = countsByEnrollment.get(e.id) || 0
      const calculatedProgress = totalLessons > 0
        ? Math.max(0, Math.min(100, Math.floor((attended * 100) / totalLessons)))
        : (e.progress_percentage || 0)
      
      return {
        ...e,
        progress_percentage: calculatedProgress,
        course: courseInfo
      }
    }) || []

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  if (request.method === 'GET' && courseId === 'por-email') {
    // GET /cursos/por-email?email=xxx - enrollments by email
    const url = new URL(request.url)
    const email = url.searchParams.get('email')
    
    console.log('Buscando cursos por email:', email)
    console.log('URL completa:', request.url)
    
    if (!email) {
      console.log('Erro: Email não fornecido')
      return new Response(JSON.stringify({ error: 'Email é obrigatório' }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Busca mais ampla - todos os emails similares
    const { data: allEnrollments } = await supabase
      .from('enrollments')
      .select('student_email')
    
    console.log('Todos os emails cadastrados:', allEnrollments?.map(e => e.student_email))

    const { data: enrollments, error } = await supabase
      .from('enrollments')
      .select(`
        id,
        course_id,
        progress_percentage,
        status,
        created_at,
        student_name,
        student_email,
        student_phone,
        courses (
          id,
          name,
          lessons_count,
          generates_certificate
        )
      `)
      .eq('student_email', email)
      .order('created_at', { ascending: false })

    console.log('Resultado da busca:', { encontrados: enrollments?.length || 0, erro: error?.message })

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Calculate real progress from attendance
    const enrollmentIds = enrollments?.map(e => e.id) || []
    let countsByEnrollment = new Map<string, number>()
    
    if (enrollmentIds.length > 0) {
      const { data: attRows } = await supabase
        .from('attendance')
        .select('enrollment_id')
        .in('enrollment_id', enrollmentIds)
      
      for (const row of (attRows || [])) {
        const k = row.enrollment_id as string
        countsByEnrollment.set(k, (countsByEnrollment.get(k) || 0) + 1)
      }
    }

    const result = enrollments?.map((e, index) => {
      const courseInfo = e.courses
      const totalLessons = Math.max(0, Number(courseInfo?.[0]?.lessons_count || 0))
      const attended = countsByEnrollment.get(e.id) || 0
      const calculatedProgress = totalLessons > 0
        ? Math.max(0, Math.min(100, Math.floor((attended * 100) / totalLessons)))
        : (e.progress_percentage || 0)
      
      const courseNum = index + 1;
      const dynamicDisplayName = `display_name_curso${courseNum}`;
      
      return {
        ...e,
        enrollment_number: `Inscrição ${index + 1}`,
        course_number: `Curso ${courseNum}`,
        progress_percentage: calculatedProgress,
        course: courseInfo,
        [dynamicDisplayName]: courseInfo?.[0]?.name || 'Sem nome' // Propriedade dinâmica
      }
    }) || []

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
  
  // Debug - log all requests
  console.log('API Request:', {
    method: request.method,
    url: request.url,
    courseId: courseId,
    path: path
  })
  // Endpoint de teste simples
  if (request.method === 'GET' && courseId === 'teste') {
    console.log('Endpoint teste executado!')
    return new Response(JSON.stringify({ 
      message: 'API funcionando!',
      timestamp: new Date().toISOString(),
      courseId: courseId,
      path: path
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  if (request.method === 'GET' && courseId === 'por-unidade') {
    // GET /cursos/por-unidade?codigo=xxx - enrollments by unit code (PUBLIC)
    const url = new URL(request.url)
    const unitCode = url.searchParams.get('codigo')
    
    console.log('Buscando cursos por código da unidade:', unitCode)
    
    if (!unitCode) {
      return new Response(JSON.stringify({ error: 'Código da unidade é obrigatório' }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Buscar inscrições diretamente por unit_code (query simples)
    console.log('=== DEBUG: Fazendo consulta simplificada ===')
    console.log('Buscando por unit_code:', unitCode)
    
    // Primeira consulta: buscar enrollments
    const { data: rawEnrollments, error: enrollmentsError } = await supabaseAdmin
      .from('enrollments')
      .select('*')
      .eq('unit_code', unitCode)
      .order('created_at', { ascending: false })

    console.log('Enrollments encontrados:', rawEnrollments?.length || 0)
    console.log('Erro na consulta:', enrollmentsError)

    if (enrollmentsError) {
      console.log('Erro ao buscar inscrições:', enrollmentsError.message)
      return new Response(JSON.stringify({ error: enrollmentsError.message }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (!rawEnrollments || rawEnrollments.length === 0) {
      console.log('Nenhuma inscrição encontrada para a unidade:', unitCode)
      return new Response(JSON.stringify([]), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Segunda consulta: buscar dados dos cursos
    const courseIds = [...new Set(rawEnrollments.map(e => e.course_id))]
    const { data: coursesData } = await supabaseAdmin
      .from('courses')
      .select('id, name, lessons_count, generates_certificate, theme')
      .in('id', courseIds)

    console.log('Cursos encontrados:', coursesData?.length || 0)

    // Mapear cursos por ID para facilitar lookup
    const coursesById = new Map()
    coursesData?.forEach(course => {
      coursesById.set(course.id, course)
    })

    // Calculate real progress from attendance
    const enrollmentIds = rawEnrollments.map(e => e.id)
    let countsByEnrollment = new Map<string, number>()
    
    if (enrollmentIds.length > 0) {
      const { data: attRows } = await supabaseAdmin
        .from('attendance')
        .select('enrollment_id')
        .in('enrollment_id', enrollmentIds)
      
      console.log('Registros de presença encontrados:', attRows?.length || 0)
      
      for (const row of (attRows || [])) {
        const k = row.enrollment_id as string
        countsByEnrollment.set(k, (countsByEnrollment.get(k) || 0) + 1)
      }
    }

    // Processar dados únicos (sem duplicatas)
    const result = rawEnrollments.map((e, index) => {
      const courseInfo = coursesById.get(e.course_id)
      const totalLessons = Math.max(0, Number(courseInfo?.lessons_count || 0))
      const attended = countsByEnrollment.get(e.id) || 0
      const calculatedProgress = totalLessons > 0
        ? Math.max(0, Math.min(100, Math.floor((attended * 100) / totalLessons)))
        : (e.progress_percentage || 0)
      
      return {
        ...e,
        progress_percentage: calculatedProgress,
        courses: courseInfo, // Para compatibilidade
        course: courseInfo
      }
    })

    console.log('Resultado final:', result.length, 'inscrições processadas')

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  if (request.method === 'GET' && courseId && path[2] === 'aulas') {
    // GET /cursos/{curso_id}/aulas - filtrar apenas aulas futuras com data definida
    const nowIso = new Date().toISOString();
    const { data: lessons } = await supabase
      .from('lessons')
      .select('id, title, description, zoom_start_time, zoom_join_url, status, course_id')
      .eq('course_id', courseId)
      .not('zoom_start_time', 'is', null)
      .gt('zoom_start_time', nowIso)
      .order('zoom_start_time', { ascending: true })

    // Format for Typebot flatMap compatibility
    const formattedLessons = lessons?.map(lesson => ({
      id: lesson.id,
      name: lesson.title,
      description: lesson.description || '',
      theme: lesson.status,
      public_target: new Date(lesson.zoom_start_time).toLocaleString('pt-BR'),
      zoom_join_url: lesson.zoom_join_url || '',
      zoom_start_time: lesson.zoom_start_time
    })) || []

    return new Response(JSON.stringify(formattedLessons), {
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
    console.log('=== INÍCIO handlePresencas ===')
    try {
      const attendanceData = await request.json()
      console.log('=== Dados recebidos:', JSON.stringify(attendanceData))

    // Se foi fornecido email ao invés de user_id, buscar o user_id
    if (attendanceData.email && !attendanceData.user_id) {
      console.log('=== DEBUG: Buscando usuário pelo email:', attendanceData.email)
      
      // Primeira tentativa: buscar na tabela users
      console.log('=== DEBUG: Fazendo consulta na tabela users')
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('id, email, name')
        .eq('email', attendanceData.email)
        .maybeSingle()

      console.log('=== DEBUG: Resultado da consulta users:', { user, userError })
      let foundUser = user;

      // Se não encontrou na tabela users, buscar na tabela enrollments
      if (!foundUser) {
        console.log('=== DEBUG: Usuário não encontrado na tabela users, buscando em enrollments...')
        const { data: enrollments, error: enrollmentError } = await supabaseAdmin
          .from('enrollments')
          .select('user_id, student_email, student_name')
          .eq('student_email', attendanceData.email)
          .limit(1)
        
        const enrollment = enrollments?.[0]
        
        console.log('=== DEBUG: Resultado da consulta enrollments:', { enrollment, enrollmentError })
        
        if (enrollment) {
          if (enrollment.user_id) {
            // Se enrollment tem user_id, buscar o usuário
            console.log('=== DEBUG: Enrollment tem user_id, buscando usuário:', enrollment.user_id)
            const { data: linkedUser, error: linkedError } = await supabaseAdmin
              .from('users')
              .select('id, email, name')
              .eq('id', enrollment.user_id)
              .maybeSingle()
            
            console.log('=== DEBUG: Resultado da busca do usuário linkado:', { linkedUser, linkedError })
            
            if (linkedUser) {
              foundUser = { id: linkedUser.id, email: linkedUser.email || '', name: linkedUser.name || '' }
              console.log('=== DEBUG: Usuário encontrado via enrollment linkado:', foundUser?.id)
            }
          } else {
            // Se enrollment não tem user_id, criar usuário automaticamente
            console.log('=== DEBUG: Criando usuário automaticamente para:', enrollment.student_email)
            const { data: newUser, error: createError } = await supabaseAdmin
              .from('users')
              .insert({
                name: enrollment.student_name || enrollment.student_email,
                email: enrollment.student_email,
                user_type: 'Aluno',
                active: true
              })
              .select('id, email, name')
              .single()
            
            console.log('=== DEBUG: Resultado da criação do usuário:', { newUser, createError })
            
            if (newUser && !createError) {
              // Linkar o enrollment ao novo usuário
              await supabaseAdmin
                .from('enrollments')
                .update({ user_id: newUser.id })
                .eq('student_email', enrollment.student_email)
              
              foundUser = { id: newUser.id, email: newUser.email || '', name: newUser.name || '' }
              console.log('=== DEBUG: Usuário criado e linkado:', newUser.id)
            } else {
              console.error('=== DEBUG: Erro ao criar usuário:', createError)
            }
          }
        } else {
          console.log('=== DEBUG: Nenhum enrollment encontrado para o email')
        }
      }

      if (!foundUser) {
        console.log('=== DEBUG: Usuário não encontrado em nenhuma tabela')
        return new Response(JSON.stringify({ 
          error: 'Usuário não encontrado com este email',
          debug: {
            email: attendanceData.email,
            searched_in: ['users table', 'enrollments table']
          }
        }), { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      console.log('=== DEBUG: Usuário final encontrado:', foundUser.id)
      attendanceData.user_id = foundUser.id
      delete attendanceData.email
    }

    // Se não forneceu enrollment_id, buscar automaticamente usando lesson_id
    if (!attendanceData.enrollment_id && attendanceData.lesson_id) {
      // Primeiro buscar o course_id da lesson
      const { data: lesson } = await supabase
        .from('lessons')
        .select('course_id')
        .eq('id', attendanceData.lesson_id)
        .single()

      if (lesson) {
        // Agora buscar o enrollment usando user_id + course_id
        const { data: enrollment } = await supabase
          .from('enrollments')
          .select('id')
          .eq('user_id', attendanceData.user_id)
          .eq('course_id', lesson.course_id)
          .maybeSingle()

        if (enrollment) {
          attendanceData.enrollment_id = enrollment.id
        } else {
          return new Response(JSON.stringify({ error: 'Usuário não está inscrito neste curso' }), { 
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
      }
    }

    const { data, error } = await supabaseAdmin
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
    } catch (error) {
      console.error('=== ERROR em handlePresencas:', error)
      return new Response(JSON.stringify({ error: 'Erro interno do servidor' }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
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

// Zoom endpoints (Zoom integration)
async function handleZoom(request: Request, path: string[]) {
  // Helpers scoped to this handler to minimize file changes
  const getUserClient = (request: Request) => {
    const authHeader = request.headers.get('authorization') || ''
    // Use the caller's JWT so RLS policies apply as if the user performed the action
    return createClient(supabaseUrl, supabaseKey, {
      global: { headers: { authorization: authHeader } }
    })
  }

  const getZoomAccessToken = async (): Promise<string> => {
    const accountId = Deno.env.get('ZOOM_ACCOUNT_ID')
    const clientId = Deno.env.get('ZOOM_CLIENT_ID')
    const clientSecret = Deno.env.get('ZOOM_CLIENT_SECRET')
    if (!accountId || !clientId || !clientSecret) {
      throw new Error('Missing Zoom secrets. Configure ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET')
    }
    const basic = btoa(`${clientId}:${clientSecret}`)
    const res = await fetch(`https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}` , {
      method: 'POST',
      headers: { Authorization: `Basic ${basic}` }
    })
    const json = await res.json()
    if (!res.ok) {
      throw new Error(json.error_description || json.reason || 'Failed to get Zoom access token')
    }
    return json.access_token
  }

  // POST /zoom/aulas/criar
  if (request.method === 'POST' && path[1] === 'aulas' && path[2] === 'criar') {
    const user = await verifyAuth(request)
    const body = await request.json()
    const { curso_id, titulo, data, hora, duracao, agenda, timezone, host_email } = body

    if (!curso_id || !titulo || !data || !hora || !duracao) {
      return new Response(JSON.stringify({ error: 'Campos obrigatórios: curso_id, titulo, data, hora, duracao' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const tz = timezone || 'America/Sao_Paulo'
    const start_time = `${data}T${hora}:00`

    try {
      const accessToken = await getZoomAccessToken()
      const userId = host_email ? host_email : 'me'

      const zoomPayload = {
        topic: titulo,
        type: 2,
        start_time,
        duration: duracao,
        timezone: tz,
        agenda: agenda || titulo,
        settings: {
          join_before_host: false,
          mute_upon_entry: true,
          waiting_room: true
        }
      }

      const zRes = await fetch(`https://api.zoom.us/v2/users/${encodeURIComponent(userId)}/meetings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(zoomPayload)
      })
      const zJson = await zRes.json()
      if (!zRes.ok) {
        return new Response(JSON.stringify({ error: 'Zoom create meeting failed', details: zJson }), { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }

      const db = getUserClient(request)
      // Determine next order index (use provided ordem if present)
      const { data: orderRows } = await db
        .from('lessons')
        .select('order_index')
        .eq('course_id', curso_id)
        .order('order_index', { ascending: false })
        .limit(1)
      const nextOrder = (typeof body?.ordem === 'number' && body.ordem > 0)
        ? body.ordem
        : (((orderRows && orderRows[0]?.order_index) || 0) + 1)

      const { data: lesson, error } = await db
        .from('lessons')
        .insert([{
          course_id: curso_id,
          title: titulo,
          description: (agenda ?? body?.descricao ?? ''),
          duration_minutes: duracao,
          order_index: nextOrder,
          status: 'Ativo',
          video_url: zJson.join_url,
          zoom_meeting_id: String(zJson.id),
          zoom_start_url: zJson.start_url,
          zoom_join_url: zJson.join_url,
          zoom_start_time: zJson.start_time || start_time,
          created_by: user.id
        }])
        .select()
        .single()

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }

      return new Response(JSON.stringify({
        aula_id: lesson.id,
        zoom_meeting_id: zJson.id,
        join_url: zJson.join_url,
        start_url: zJson.start_url,
        dados_aula: lesson
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message || 'Erro ao criar aula no Zoom' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
  }

  // POST /zoom/aulas/sincronizar-presenca
  if (request.method === 'POST' && path[1] === 'aulas' && path[2] === 'sincronizar-presenca') {
    await verifyAuth(request)
    const { lesson_id } = await request.json()
    if (!lesson_id) {
      return new Response(JSON.stringify({ error: 'lesson_id é obrigatório' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    const admin = getUserClient(request)

    const { data: lesson, error: lerr } = await admin
      .from('lessons')
      .select('id, course_id, zoom_meeting_id')
      .eq('id', lesson_id)
      .single()
    if (lerr || !lesson?.zoom_meeting_id) {
      return new Response(JSON.stringify({ error: 'Aula não encontrada ou sem zoom_meeting_id' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    try {
      const accessToken = await getZoomAccessToken()
      // Try Reports API first
      let pRes = await fetch(`https://api.zoom.us/v2/report/meetings/${encodeURIComponent(lesson.zoom_meeting_id)}/participants?page_size=300`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      let pJson = await pRes.json()
      if (!pRes.ok) {
        // Fallback to past_meetings API
        pRes = await fetch(`https://api.zoom.us/v2/past_meetings/${encodeURIComponent(lesson.zoom_meeting_id)}/participants?page_size=300`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        })
        pJson = await pRes.json()
        if (!pRes.ok) {
          return new Response(JSON.stringify({ error: 'Falha ao obter participantes do Zoom', details: pJson }), { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }
      }
      const participants = pJson.participants || []

      let saved = 0
      for (const part of participants) {
        const email = part.user_email || ''
        if (!email) continue
        // Find enrollment by email and course
        const { data: enrollment } = await admin
          .from('enrollments')
          .select('id, student_email')
          .eq('course_id', lesson.course_id)
          .eq('student_email', email)
          .single()
        if (!enrollment) continue
        // Find user by email to get user_id
        const { data: user } = await admin
          .from('users')
          .select('id')
          .eq('email', email)
          .single()
        if (!user) continue
        // Insert attendance
        const { error: aerr } = await admin
          .from('attendance')
          .insert([{ user_id: user.id, lesson_id: lesson.id, enrollment_id: enrollment.id, attendance_type: 'automatica_zoom', confirmed_at: new Date().toISOString() }])
        if (!aerr) saved++
        // Upsert student progress
        const { data: sp } = await admin
          .from('student_progress')
          .select('id')
          .eq('enrollment_id', enrollment.id)
          .eq('lesson_id', lesson.id)
          .single()
        if (sp) {
          await admin
            .from('student_progress')
            .update({ status: 'completed', completed_at: new Date().toISOString() })
            .eq('id', sp.id)
        } else {
          await admin
            .from('student_progress')
            .insert([{ enrollment_id: enrollment.id, lesson_id: lesson.id, status: 'completed', completed_at: new Date().toISOString() }])
        }
        // Recalculate enrollment progress
        const { count: totalLessons } = await admin
          .from('lessons')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', lesson.course_id)
        const { count: completedCount } = await admin
          .from('student_progress')
          .select('*', { count: 'exact', head: true })
          .eq('enrollment_id', enrollment.id)
          .eq('status', 'completed')
        const percentage = totalLessons && totalLessons > 0 ? Math.round((completedCount || 0) * 100 / totalLessons) : 0
        // Update enrollment progress and completed_lessons (append current lesson id)
        const { data: enr } = await admin
          .from('enrollments')
          .select('completed_lessons')
          .eq('id', enrollment.id)
          .single()
        const setCompleted = Array.from(new Set([...(enr?.completed_lessons || []), lesson.id]))
        await admin
          .from('enrollments')
          .update({ progress_percentage: percentage, completed_lessons: setCompleted })
          .eq('id', enrollment.id)
      }

      return new Response(JSON.stringify({ participantes: participants.length, presencas_registradas: saved }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message || 'Erro ao sincronizar presenças' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
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
      '/zoom/aulas/criar': { post: { summary: 'Criar reunião no Zoom e salvar aula' } },
      '/zoom/aulas/sincronizar-presenca': { post: { summary: 'Sincronizar presenças com Zoom' } }
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
    // Normalize path for Supabase routing (production and local):
    // - Strip "/functions/v1" if present
    // - Strip the function name segment "/api" if present
    let path = url.pathname.split('/').filter(Boolean)
    if (path[0] === 'functions' && path[1] === 'v1') path = path.slice(2)
    if (path[0] === 'api') path = path.slice(1)

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
            'POST /zoom/aulas/criar',
            'POST /zoom/aulas/sincronizar-presenca'
          ]
        }), { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ 
      error: (error as Error).message || 'Internal server error' 
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
