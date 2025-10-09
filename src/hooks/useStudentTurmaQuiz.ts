import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export const useStudentTurmaQuiz = (turmaId?: string) => {
  const { data: currentUser } = useCurrentUser();

  return useQuery({
    queryKey: ["student-turma-quiz", turmaId, currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id || !turmaId) {
        return [];
      }

      // Verificar se o usuário está inscrito na turma
      const { data: enrollment, error: enrollmentError } = await supabase
        .from("enrollments")
        .select("id, turma_id")
        .eq("user_id", currentUser.id)
        .eq("turma_id", turmaId)
        .single();

      if (enrollmentError || !enrollment) {
        return [];
      }

      // Buscar quizzes da turma (apenas ativos)
      const { data: quizzes, error: quizzesError } = await supabase
        .from("quiz")
        .select(`
          *,
          courses (
            id,
            name
          ),
          lessons (
            id,
            title
          ),
          turmas (
            id,
            name,
            code
          )
        `)
        .eq("turma_id", turmaId)
        .eq("status", "ativo")
        .order("quiz_name", { ascending: true })
        .order("order_index", { ascending: true });

      if (quizzesError) {
        throw quizzesError;
      }

      return quizzes || [];
    },
    enabled: !!currentUser?.id && !!turmaId,
    staleTime: 30 * 1000, // 30 segundos
  });
};