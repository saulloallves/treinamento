import { useEffect } from "react";
import BaseLayout from "@/components/BaseLayout";
import StudentQuizList from "@/components/student/StudentQuizList";

const StudentQuiz = () => {
  useEffect(() => {
    document.title = "Quiz | Área do Aluno";
  }, []);

  return (
    <BaseLayout title="Quiz">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Quiz</h1>
        <p className="text-muted-foreground">Responda os quizzes das suas aulas</p>
      </header>

      <StudentQuizList />
    </BaseLayout>
  );
};

export default StudentQuiz;