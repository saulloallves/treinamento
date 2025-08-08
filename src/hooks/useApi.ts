
import { useToast } from "@/hooks/use-toast";

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

export const useApi = () => {
  const { toast } = useToast();

  const call = async (endpoint: string, options: ApiOptions = {}) => {
    const baseUrl = 'https://tctkacgbhqvkqovctrzf.supabase.co/functions/v1/api';
    
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return data;
    } catch (error: any) {
      console.error('API Error:', error);
      toast({
        title: "Erro na API",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Auth methods
  const auth = {
    login: (email: string, password: string) =>
      call('/auth/login', { method: 'POST', body: { email, password } }),
    
    me: (token: string) =>
      call('/auth/me', { headers: { authorization: `Bearer ${token}` } }),
  };

  // Units methods
  const units = {
    getByCode: (code: string) => call(`/unidades/${code}`),
    getCollaborators: (code: string) => call(`/unidades/${code}/colaboradores`),
    create: (unitData: any, token: string) =>
      call('/unidades', { 
        method: 'POST', 
        body: unitData,
        headers: { authorization: `Bearer ${token}` }
      }),
  };

  // Users methods
  const users = {
    getById: (id: string) => call(`/usuarios/${id}`),
    getHistory: (id: string) => call(`/usuarios/${id}/historico`),
    searchByCpf: (cpf: string) => call(`/usuarios/search?cpf=${cpf}`),
    create: (userData: any, token: string) =>
      call('/usuarios', { 
        method: 'POST', 
        body: userData,
        headers: { authorization: `Bearer ${token}` }
      }),
    update: (id: string, userData: any, token: string) =>
      call(`/usuarios/${id}`, { 
        method: 'PUT', 
        body: userData,
        headers: { authorization: `Bearer ${token}` }
      }),
  };

  // Courses methods
  const courses = {
    list: (filters?: { tipo_usuario?: string; cargo?: string; categoria?: string }) => {
      const params = new URLSearchParams();
      if (filters?.tipo_usuario) params.append('tipo_usuario', filters.tipo_usuario);
      if (filters?.cargo) params.append('cargo', filters.cargo);
      if (filters?.categoria) params.append('categoria', filters.categoria);
      
      const queryString = params.toString();
      return call(`/cursos${queryString ? `?${queryString}` : ''}`);
    },
    getById: (id: string) => call(`/cursos/${id}`),
    getLessons: (id: string) => call(`/cursos/${id}/aulas`),
    create: (courseData: any, token: string) =>
      call('/cursos', { 
        method: 'POST', 
        body: courseData,
        headers: { authorization: `Bearer ${token}` }
      }),
    update: (id: string, courseData: any, token: string) =>
      call(`/cursos/${id}`, { 
        method: 'PUT', 
        body: courseData,
        headers: { authorization: `Bearer ${token}` }
      }),
    delete: (id: string, token: string) =>
      call(`/cursos/${id}`, { 
        method: 'DELETE',
        headers: { authorization: `Bearer ${token}` }
      }),
  };

  // Lessons methods
  const lessons = {
    create: (lessonData: any, token: string) =>
      call('/aulas', { 
        method: 'POST', 
        body: lessonData,
        headers: { authorization: `Bearer ${token}` }
      }),
    update: (id: string, lessonData: any, token: string) =>
      call(`/aulas/${id}`, { 
        method: 'PUT', 
        body: lessonData,
        headers: { authorization: `Bearer ${token}` }
      }),
    delete: (id: string, token: string) =>
      call(`/aulas/${id}`, { 
        method: 'DELETE',
        headers: { authorization: `Bearer ${token}` }
      }),
  };

  // Enrollments methods
  const enrollments = {
    create: (usuario_id: string, curso_id: string) =>
      call('/inscricoes', { method: 'POST', body: { usuario_id, curso_id } }),
    validate: (usuario_id: string, curso_id: string) =>
      call(`/inscricoes/validar?usuario_id=${usuario_id}&curso_id=${curso_id}`),
    getByCourse: (curso_id: string) => call(`/inscricoes/curso/${curso_id}`),
  };

  // Attendance methods
  const attendance = {
    create: (attendanceData: any) =>
      call('/presencas', { method: 'POST', body: attendanceData }),
    getByLesson: (aula_id: string) => call(`/presencas/aula/${aula_id}`),
  };

  // Progress methods
  const progress = {
    get: (usuario_id: string, curso_id: string) =>
      call(`/progresso?usuario_id=${usuario_id}&curso_id=${curso_id}`),
    update: (progressData: any) =>
      call('/progresso', { method: 'PUT', body: progressData }),
  };

  // Quiz methods
  const quiz = {
    getQuestions: (curso_id: string) => call(`/quiz/${curso_id}`),
    submitAnswers: (curso_id: string, usuario_id: string, respostas: any[]) =>
      call(`/quiz/${curso_id}/responder`, { 
        method: 'POST', 
        body: { usuario_id, respostas }
      }),
  };

  // Certificates methods
  const certificates = {
    generate: (certificateData: any) =>
      call('/certificados/gerar', { method: 'POST', body: certificateData }),
    get: (usuario_id: string, curso_id: string) =>
      call(`/certificados/${usuario_id}/${curso_id}`),
    getAll: (token: string) =>
      call('/certificados/emitidos', { headers: { authorization: `Bearer ${token}` } }),
  };

  return {
    call,
    auth,
    units,
    users,
    courses,
    lessons,
    enrollments,
    attendance,
    progress,
    quiz,
    certificates,
  };
};
