import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import BaseLayout from "@/components/BaseLayout";
import { Button } from "@/components/ui/button";
import { Turma } from "@/hooks/useTurmas";
import TurmaQuizList from "@/components/quiz/TurmaQuizList";
import LessonQuizManager from "@/components/quiz/LessonQuizManager";

const QuizPage = () => {
  const [selectedTurma, setSelectedTurma] = useState<Turma | null>(null);

  const handleSelectTurma = (turma: Turma) => {
    setSelectedTurma(turma);
  };

  const handleBack = () => {
    setSelectedTurma(null);
  };

  return (
    <BaseLayout title="Quiz">
      <div className="p-6 space-y-6">
        {!selectedTurma ? (
          <>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Quiz por Turma</h1>
              <p className="text-muted-foreground">Selecione uma turma para gerenciar seus quizzes</p>
            </div>
            <TurmaQuizList onSelectTurma={handleSelectTurma} />
          </>
        ) : (
          <LessonQuizManager 
            turma={selectedTurma} 
            onBack={handleBack}
          />
        )}
      </div>
    </BaseLayout>
  );
};

export default QuizPage;