import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface EvaluationReport {
  turmaId: string;
  turmaName: string;
  courseId: string;
  courseName: string;
  totalStudents: number;
  quizResponses: number;
  testSubmissions: number;
  avgQuizAccuracy: number;
  avgTestScore: number;
  participationRate: number;
}

export interface StudentEvaluationData {
  studentId: string;
  studentName: string;
  quizResponses: any[];
  testSubmissions: any[];
  quizAccuracy: number;
  testAverage: number;
  totalAttempts: number;
}

export const useEvaluationReports = (filters?: {
  turmaId?: string;
  courseId?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: ["evaluation-reports", filters],
    queryFn: async () => {
      // Buscar dados de quiz por turma
      let quizQuery = supabase
        .from("quiz_responses")
        .select(`
          *,
          user_id,
          quiz:quiz(
            id,
            question,
            quiz_name,
            course_id,
            turma_id,
            course:courses(name),
            turma:turmas(name, code)
          )
        `);

      // Aplicar filtros
      if (filters?.turmaId) {
        quizQuery = quizQuery.eq('quiz.turma_id', filters.turmaId);
      }
      if (filters?.courseId) {
        quizQuery = quizQuery.eq('quiz.course_id', filters.courseId);
      }
      if (filters?.startDate) {
        quizQuery = quizQuery.gte('answered_at', filters.startDate);
      }
      if (filters?.endDate) {
        quizQuery = quizQuery.lte('answered_at', filters.endDate);
      }

      const { data: quizData, error: quizError } = await quizQuery;
      if (quizError) throw quizError;

      // Buscar dados de testes por turma
      let testQuery = supabase
        .from("test_submissions")
        .select(`
          *,
          user_id,
          test:tests(
            id,
            name,
            course_id,
            turma_id,
            course:courses(name),
            turma:turmas(name, code)
          )
        `);

      // Aplicar filtros
      if (filters?.turmaId) {
        testQuery = testQuery.eq('test.turma_id', filters.turmaId);
      }
      if (filters?.courseId) {
        testQuery = testQuery.eq('test.course_id', filters.courseId);
      }
      if (filters?.startDate) {
        testQuery = testQuery.gte('submitted_at', filters.startDate);
      }
      if (filters?.endDate) {
        testQuery = testQuery.lte('submitted_at', filters.endDate);
      }

      const { data: testData, error: testError } = await testQuery;
      if (testError) throw testError;

      // Buscar dados dos usuários
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("id, name, email");
      if (usersError) throw usersError;

      // Processar dados para criar relatórios por turma
      const turmaReports: Record<string, EvaluationReport> = {};

      // Processar dados de quiz
      (quizData || []).forEach((response: any) => {
        const turmaId = response.quiz?.turma_id;
        if (!turmaId) return;

        if (!turmaReports[turmaId]) {
          turmaReports[turmaId] = {
            turmaId,
            turmaName: response.quiz.turma?.name || response.quiz.turma?.code || 'Turma sem nome',
            courseId: response.quiz.course_id,
            courseName: response.quiz.course?.name || 'Curso sem nome',
            totalStudents: 0,
            quizResponses: 0,
            testSubmissions: 0,
            avgQuizAccuracy: 0,
            avgTestScore: 0,
            participationRate: 0,
          };
        }

        turmaReports[turmaId].quizResponses++;
      });

      // Processar dados de testes
      (testData || []).forEach((submission: any) => {
        const turmaId = submission.test?.turma_id;
        if (!turmaId) return;

        if (!turmaReports[turmaId]) {
          turmaReports[turmaId] = {
            turmaId,
            turmaName: submission.test.turma?.name || submission.test.turma?.code || 'Turma sem nome',
            courseId: submission.test.course_id,
            courseName: submission.test.course?.name || 'Curso sem nome',
            totalStudents: 0,
            quizResponses: 0,
            testSubmissions: 0,
            avgQuizAccuracy: 0,
            avgTestScore: 0,
            participationRate: 0,
          };
        }

        turmaReports[turmaId].testSubmissions++;
      });

      // Calcular médias e estatísticas por turma
      Object.keys(turmaReports).forEach(turmaId => {
        const report = turmaReports[turmaId];
        
        // Calcular precisão média dos quizzes
        const turmaQuizResponses = (quizData || []).filter((r: any) => 
          r.quiz?.turma_id === turmaId
        );
        if (turmaQuizResponses.length > 0) {
          const correctAnswers = turmaQuizResponses.filter((r: any) => r.is_correct).length;
          report.avgQuizAccuracy = Math.round((correctAnswers / turmaQuizResponses.length) * 100);
        }

        // Calcular média dos testes
        const turmaTestSubmissions = (testData || []).filter((s: any) => 
          s.test?.turma_id === turmaId && s.status === 'completed'
        );
        if (turmaTestSubmissions.length > 0) {
          const totalScore = turmaTestSubmissions.reduce((sum: number, s: any) => sum + s.percentage, 0);
          report.avgTestScore = Math.round(totalScore / turmaTestSubmissions.length);
        }

        // Calcular total de estudantes únicos
        const uniqueStudents = new Set([
          ...turmaQuizResponses.map((r: any) => r.user_id),
          ...turmaTestSubmissions.map((s: any) => s.user_id)
        ]);
        report.totalStudents = uniqueStudents.size;
      });

      return Object.values(turmaReports).sort((a, b) => 
        a.turmaName.localeCompare(b.turmaName)
      );
    },
  });
};

export const useStudentEvaluationData = (studentId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["student-evaluation-data", studentId],
    queryFn: async () => {
      if (!studentId) throw new Error("Student ID is required");

      // Buscar dados de quiz do estudante
      const { data: quizData, error: quizError } = await supabase
        .from("quiz_responses")
        .select(`
          *,
          quiz:quiz(
            id,
            question,
            quiz_name,
            course:courses(name),
            turma:turmas(name, code)
          )
        `)
        .eq("user_id", studentId)
        .order("answered_at", { ascending: false });

      if (quizError) throw quizError;

      // Buscar dados de testes do estudante
      const { data: testData, error: testError } = await supabase
        .from("test_submissions")
        .select(`
          *,
          test:tests(
            id,
            name,
            course:courses(name),
            turma:turmas(name, code)
          )
        `)
        .eq("user_id", studentId)
        .order("submitted_at", { ascending: false });

      if (testError) throw testError;

      // Calcular estatísticas
      const quizAccuracy = quizData && quizData.length > 0 
        ? Math.round((quizData.filter(q => q.is_correct).length / quizData.length) * 100)
        : 0;

      const completedTests = (testData || []).filter(t => t.status === 'completed');
      const testAverage = completedTests.length > 0
        ? Math.round(completedTests.reduce((sum, t) => sum + t.percentage, 0) / completedTests.length)
        : 0;

      return {
        studentId,
        quizResponses: quizData || [],
        testSubmissions: testData || [],
        quizAccuracy,
        testAverage,
        totalAttempts: (quizData?.length || 0) + (testData?.length || 0)
      };
    },
    enabled: enabled && !!studentId,
  });
};