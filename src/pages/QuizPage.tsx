import { useState } from "react";
import { Plus, FileText, List, Grid3X3 } from "lucide-react";
import BaseLayout from "@/components/BaseLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import QuizGroupedList from "@/components/quiz/QuizGroupedList";
import QuizList from "@/components/quiz/QuizList";
import CreateQuizDialog from "@/components/quiz/CreateQuizDialog";
import CreateMultipleQuestionsDialog from "@/components/quiz/CreateMultipleQuestionsDialog";

const QuizPage = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreateMultipleDialogOpen, setIsCreateMultipleDialogOpen] = useState(false);
  const [showGroupedView, setShowGroupedView] = useState(true);

  return (
    <BaseLayout title="Quiz">
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Quiz</h1>
            <p className="text-muted-foreground">Gerencie perguntas e respostas dos cursos</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nova Pergunta
            </Button>
            <Button 
              onClick={() => setIsCreateMultipleDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Criar Quiz Completo
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Perguntas do Quiz</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowGroupedView(!showGroupedView)}
                className="flex items-center gap-2"
              >
                {showGroupedView ? (
                  <>
                    <List className="w-4 h-4" />
                    Visualização Individual
                  </>
                ) : (
                  <>
                    <Grid3X3 className="w-4 h-4" />
                    Visualização Agrupada
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showGroupedView ? <QuizGroupedList /> : <QuizList />}
          </CardContent>
        </Card>

        <CreateQuizDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
        />

        <CreateMultipleQuestionsDialog
          open={isCreateMultipleDialogOpen}
          onOpenChange={setIsCreateMultipleDialogOpen}
        />
      </div>
    </BaseLayout>
  );
};

export default QuizPage;