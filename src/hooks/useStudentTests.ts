import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export interface StudentTest {
  id: string;
  name: string;
  description?: string;
  course_id?: string;
  turma_id?: string;
  passing_percentage: number;
  max_attempts?: number;
  time_limit_minutes?: number;
  status: 'draft' | 'active' | 'archived';
  created_at: string;
  courses?: {
    id: string;
    name: string;
    cover_image_url?: string;
  };
  turmas?: {
    id: string;
    name?: string;
    code?: string;
  };
  test_submissions?: {
    id: string;
    attempt_number: number;
    status: 'in_progress' | 'completed' | 'expired';
    total_score: number;
    max_possible_score: number;
    percentage: number;
    passed: boolean;
    submitted_at?: string;
  }[];
  test_questions?: {
    id: string;
    question_text: string;
    question_type: string;
    question_order: number;
    image_urls?: string[];
    max_score?: number;
    test_question_options?: {
      id: string;
      option_text: string;
      option_order: number;
      score_value: number;
    }[];
  }[];
}

export const useStudentTests = () => {
  const { data: currentUser } = useCurrentUser();

  return useQuery({
    queryKey: ["student-tests", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];

      // Primeiro, buscar turmas do aluno
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("turma_id")
        .eq("user_id", currentUser.id)
        .not("turma_id", "is", null);

      if (!enrollments || enrollments.length === 0) return [];

      const turmaIds = enrollments.map(e => e.turma_id);

      // Buscar testes ativos dessas turmas
      const { data, error } = await supabase
        .from("tests")
        .select(`
          *,
          courses:course_id (
            id,
            name,
            cover_image_url
          ),
          turmas:turma_id (
            id,
            name,
            code
          )
        `)
        .eq("status", "active")
        .in("turma_id", turmaIds);

      if (error) throw error;

      // Buscar submissions do usuário para estes testes
      const testIds = data?.map(t => t.id) || [];
      let submissions: any[] = [];
      
      if (testIds.length > 0) {
        const { data: submissionsData } = await supabase
          .from("test_submissions")
          .select("*")
          .eq("user_id", currentUser.id)
          .in("test_id", testIds);
        
        submissions = submissionsData || [];
      }

      // Combinar testes com suas submissions
      const testsWithSubmissions = data?.map(test => ({
        ...test,
        test_submissions: submissions.filter(s => s.test_id === test.id) || []
      })) || [];

      return testsWithSubmissions as StudentTest[];
    },
    enabled: !!currentUser?.id,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const useStudentTurmaTests = (turmaId?: string) => {
  const { data: currentUser } = useCurrentUser();

  return useQuery({
    queryKey: ["student-turma-tests", turmaId, currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id || !turmaId) {
        console.log("❌ useStudentTurmaTests: Missing currentUser.id or turmaId", { currentUser: currentUser?.id, turmaId });
        return [];
      }

      console.log("🔍 useStudentTurmaTests: Starting query", { userId: currentUser.id, turmaId });

      // Verificar se o usuário está inscrito na turma
      const { data: enrollment, error: enrollmentError } = await supabase
        .from("enrollments")
        .select("id, turma_id")
        .eq("user_id", currentUser.id)
        .eq("turma_id", turmaId)
        .single();

      if (enrollmentError) {
        console.log("❌ useStudentTurmaTests: Enrollment error", enrollmentError);
        throw enrollmentError;
      }

      if (!enrollment) {
        console.log("❌ useStudentTurmaTests: User not enrolled in turma", { userId: currentUser.id, turmaId });
        return [];
      }

      console.log("✅ useStudentTurmaTests: User enrolled", enrollment);

      // Buscar testes ativos da turma
      const { data: tests, error: testsError } = await supabase
        .from("tests")
        .select(`
          *,
          courses:course_id (
            id,
            name,
            cover_image_url
          ),
          turmas:turma_id (
            id,
            name,
            code
          )
        `)
        .eq("status", "active")
        .eq("turma_id", turmaId);

      if (testsError) {
        console.log("❌ useStudentTurmaTests: Tests error", testsError);
        throw testsError;
      }

      console.log("🎯 useStudentTurmaTests: Found tests", { count: tests?.length, tests });

      if (!tests || tests.length === 0) {
        return [];
      }

      // Buscar submissions do usuário para estes testes
      const testIds = tests.map(t => t.id);
      const { data: submissions } = await supabase
        .from("test_submissions")
        .select("*")
        .eq("user_id", currentUser.id)
        .in("test_id", testIds);

      console.log("📝 useStudentTurmaTests: Found submissions", { count: submissions?.length, submissions });

      // Combinar testes com suas submissions
      const testsWithSubmissions = tests.map(test => ({
        ...test,
        test_submissions: submissions?.filter(s => s.test_id === test.id) || []
      }));

      console.log("✅ useStudentTurmaTests: Final result", testsWithSubmissions);

      return testsWithSubmissions as StudentTest[];
    },
    enabled: !!currentUser?.id && !!turmaId,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};
export const useStudentTest = (testId: string) => {
  const { data: currentUser } = useCurrentUser();

  return useQuery({
    queryKey: ["student-test", testId, currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id || !testId) return null;

      const { data, error } = await supabase
        .from("tests")
        .select(`
          *,
          courses:course_id (
            id,
            name
          ),
          turmas:turma_id (
            id,
            name,
            code
          ),
          test_questions (
            id,
            question_text,
            question_type,
            question_order,
            image_urls,
            max_score,
            test_question_options (
              id,
              option_text,
              option_order,
              score_value
            )
          )
        `)
        .eq("id", testId)
        .eq("status", "active")
        .single();

      if (error) throw error;

      // Verificar se o aluno está inscrito na turma do teste
      const { data: enrollment } = await supabase
        .from("enrollments")
        .select("id")
        .eq("user_id", currentUser.id)
        .eq("turma_id", data.turma_id)
        .single();

      if (!enrollment) {
        throw new Error("Você não tem permissão para acessar este teste");
      }

      return data as StudentTest;
    },
    enabled: !!currentUser?.id && !!testId,
  });
};