import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useStudentProfile = (studentId: string | undefined, enabled: boolean = true) => {
  // Query para buscar dados completos do aluno
  const studentDetailsQuery = useQuery({
    queryKey: ["student-details", studentId],
    queryFn: async () => {
      if (!studentId) throw new Error("Student ID is required");
      
      const { data: user, error: userError } = await supabase
        .from("users")
        .select(`*`)
        .eq("id", studentId)
        .single();

      if (userError && userError.code !== 'PGRST116') throw userError;

      if (user && user.unit_code) {
        const { data: unidade } = await supabase
          .from('unidades')
          .select('grupo')
          .eq('codigo_grupo', user.unit_code)
          .maybeSingle();
        
        if (unidade) {
          (user as any).unit = { name: unidade.grupo };
        }
      }

      return user;
    },
    enabled: enabled && !!studentId,
  });

  // Query para buscar inscrições e cursos
  const enrollmentsQuery = useQuery({
    queryKey: ["student-enrollments", studentId],
    queryFn: async () => {
      if (!studentId) throw new Error("Student ID is required");
      
      const { data, error } = await supabase
        .from("enrollments")
        .select(`
          *,
          course:courses(
            name,
            description,
            tipo,
            status
          ),
          turma:turmas(
            name,
            code,
            status
          )
        `)
        .eq("user_id", studentId)
        .order("enrollment_date", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: enabled && !!studentId,
  });

  // Query para buscar presenças
  const attendancesQuery = useQuery({
    queryKey: ["student-attendances", studentId],
    queryFn: async () => {
      if (!studentId) throw new Error("Student ID is required");
      
      const { data, error } = await supabase
        .from("attendance")
        .select(`
          *,
          lesson:lessons(title),
          enrollment:enrollments(
            course:courses(name)
          )
        `)
        .eq("user_id", studentId)
        .order("confirmed_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: enabled && !!studentId,
  });

  // Query para buscar certificados
  const certificatesQuery = useQuery({
    queryKey: ["student-certificates", studentId],
    queryFn: async () => {
      if (!studentId) throw new Error("Student ID is required");
      
      const { data, error } = await supabase
        .from("certificates")
        .select(`
          *,
          course:courses(name),
          turma:turmas(name, code)
        `)
        .eq("user_id", studentId)
        .order("generated_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: enabled && !!studentId,
  });

  // Query para buscar respostas de quiz
  const quizResponsesQuery = useQuery({
    queryKey: ["student-quiz-responses", studentId],
    queryFn: async () => {
      if (!studentId) throw new Error("Student ID is required");
      
      const { data, error } = await supabase
        .from("quiz_responses")
        .select(`
          *,
          quiz:quiz(
            question,
            quiz_name,
            course:courses(name)
          )
        `)
        .eq("user_id", studentId)
        .order("answered_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: enabled && !!studentId,
  });

  // Calculados
  const completedCourses = enrollmentsQuery.data?.filter(e => e.progress_percentage === 100) || [];
  const totalCourses = enrollmentsQuery.data?.length || 0;
  const totalAttendances = attendancesQuery.data?.length || 0;
  const totalCertificates = certificatesQuery.data?.length || 0;
  const quizAccuracy = quizResponsesQuery.data && quizResponsesQuery.data.length > 0 
    ? Math.round((quizResponsesQuery.data.filter(q => q.is_correct).length / quizResponsesQuery.data.length) * 100)
    : 0;

  return {
    studentDetails: studentDetailsQuery.data,
    enrollments: enrollmentsQuery.data,
    attendances: attendancesQuery.data,
    certificates: certificatesQuery.data,
    quizResponses: quizResponsesQuery.data,
    
    // Dados calculados
    completedCourses,
    totalCourses,
    totalAttendances,
    totalCertificates,
    quizAccuracy,

    // Status de loading
    isLoading: studentDetailsQuery.isLoading || 
               enrollmentsQuery.isLoading || 
               attendancesQuery.isLoading || 
               certificatesQuery.isLoading || 
               quizResponsesQuery.isLoading,
    
    // Status de error
    error: studentDetailsQuery.error || 
           enrollmentsQuery.error || 
           attendancesQuery.error || 
           certificatesQuery.error || 
           quizResponsesQuery.error,

    // Refetch functions
    refetch: () => {
      studentDetailsQuery.refetch();
      enrollmentsQuery.refetch();
      attendancesQuery.refetch();
      certificatesQuery.refetch();
      quizResponsesQuery.refetch();
    }
  };
};