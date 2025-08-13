import { useState } from "react";
import { Plus, FileText } from "lucide-react";
import BaseLayout from "@/components/BaseLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import QuizList from "@/components/quiz/QuizList";
import CreateQuizDialog from "@/components/quiz/CreateQuizDialog";
import CreateMultipleQuestionsDialog from "@/components/quiz/CreateMultipleQuestionsDialog";

const QuizPage = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreateMultipleDialogOpen, setIsCreateMultipleDialogOpen] = useState(false);

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
            <CardTitle>Perguntas do Quiz</CardTitle>
          </CardHeader>
          <CardContent>
            <QuizList />
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