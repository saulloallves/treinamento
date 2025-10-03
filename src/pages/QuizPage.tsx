import { useState } from "react";
import { ArrowLeft, BookCheck, Users, Calendar } from "lucide-react";
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
      {!selectedTurma ? (
        <div className="space-y-6">
          {/* Header Section - Compacto */}
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center shrink-0">
                <BookCheck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">Gestão de Quizzes</h2>
                <p className="text-sm text-muted-foreground">Gerencie quizzes e avaliações organizadas por turma</p>
              </div>
            </div>
          </div>

          <TurmaQuizList onSelectTurma={handleSelectTurma} />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Breadcrumb */}
          <Button 
            variant="ghost" 
            onClick={handleBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground p-0 h-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para turmas
          </Button>
          
          {/* Selected Turma Header */}
          <div className="flex items-center gap-4 p-6 bg-muted/30 rounded-lg border-l-4 border-primary">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <BookCheck className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">
                {selectedTurma.name || `Turma ${selectedTurma.code}` || "Turma"}
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  {selectedTurma.enrollments_count || 0} inscritos
                </div>
                {selectedTurma.start_at && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {new Date(selectedTurma.start_at).toLocaleDateString('pt-BR')}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <LessonQuizManager 
            turma={selectedTurma} 
            onBack={handleBack}
          />
        </div>
      )}
    </BaseLayout>
  );
};

export default QuizPage;